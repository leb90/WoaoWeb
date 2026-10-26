// Mazmorras instanciadas (docs/MAZMORRAS.md): se entra solo por una piedra de invocación, solo o con la party
// (el líder invoca y los demás aceptan), y cada corrida tiene su propia copia de todos los mapas de la mazmorra.
// Adentro no hay PvP, salir de la party te expulsa y la dificultad escala con la cantidad de jugadores.
// Las mazmorras se definen en jsons/dungeons.json; las mecánicas de cada mapa (salas, puertas, cofres, pozos, lava,
// placas, bloques y losas) las arma scripts/buildDungeonMaps.ts en la clave "dungeon" de specials.json.
import fs from "node:fs";
import path from "node:path";
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

const DUNGEONS_PATH = path.resolve(__dirname, "../jsons/dungeons.json");
// Mismo esquema que mapInstanceManager: 30000 + mapa base × 50 + lugar; el cliente ya dibuja el mapa base.
const INSTANCE_MAP_START = 30_000;
const INSTANCE_MAP_STRIDE = 50;
const STONE_RANGE = 4;
const INVITE_MS = 30_000;
// Una corrida sin nadie conectado adentro se destruye a los 15 minutos (los que se desconectaron vuelven si
// entran antes).
const EMPTY_RUN_TTL_MS = 15 * 60_000;
const SWEEP_MS = 30_000;

// Mecánicas
const MAPAS_SOURCE = path.resolve(__dirname, "../mapas_source");
// Objetos de mazmorra (los crea scripts/buildDungeonMaps.ts en objs.json).
const OBJ = {
    cofre: 1832,
    cofreAbierto: 1833,
    puerta: 1834,
    puertaAbierta: 1835,
    bloque: 1836,
    placa: 1837,
    placaApretada: 1838,
    losa: 1839,
    barrera: 1840,
    cristal: 1841,
    pisoRajado: 1842,
    hueco: 1843,
    runaTiempo: 1844,
    runaTiempoEncendida: 1845,
    paredRajada: 1846,
    losaAplastador: 1847,
    aplastador: 1848,
    cofreJefe: 1849,
} as const;
// Patas de rana: con ellas se nada por el agua profunda de las mazmorras.
export const SWIM_ITEM = "patas_de_rana";
const HAZARD_TICK_MS = 250;
// La lava periódica erupciona 1 de cada 3 segundos.
const LAVA_CYCLE_MS = 3_000;
const LAVA_ACTIVE_MS = 1_000;
// Daño en porcentaje de la vida máxima.
const PIT_DAMAGE = 0.1;
const LAVA_DAMAGE = 0.08;
const LAVA_BURST_DAMAGE = 0.12;
const LAVA_BURN_MS = 1_000;
const LAVA_BURST_BURN_MS = 500;
const LAVA_FX = 153; // la quemadura del chamán
const LAVA_BURST_FX = 51; // hechizo cuyo efecto usa la erupción (Llamarada)
// Sonidos de mazmorra, al estilo Zelda (frontend/public/sounds; de dónde sale cada uno, en docs/CREDITOS_SONIDOS.md).
export const DUNGEON_SOUNDS = {
    objeto: 210, // llave, llave del jefe, mapa o brújula
    itemMazmorra: 211, // el ítem de la mazmorra
    secreto: 212, // aparece un cofre oculto o se resuelve un puzzle
    puertaAbre: 213,
    puertasCierran: 214,
    oro: 215,
    cristal: 216, // la Carrera rompe un bloque de cristal
    derrumbe: 217, // se cae un piso que se desmorona
    golpe: 218, // la Carrera se estrella contra una pared
    carrera: 219, // arranca la Carrera
    salto: 220, // salto con la pluma
    aplastador: 221, // bajan los aplastadores
} as const;
const CHEST_RANGE = 1;
// Paseo de las criaturas: 1 baldosa alrededor de donde nacen (3×3).
const WANDER_RADIUS = 1;
const WATCHERS_TTL_MS = 500;
const READ_RANGE = 2;
const DOOR_RANGE = 2;
const WATER_MESSAGE_MS = 2_000;
// Piso que se desmorona: se cae un instante después de pisarlo caminando (un paso tarda 200 ms; corriendo, 55) y
// vuelve a los 5 s.
const CRUMBLE_DELAY_MS = 150;
const CRUMBLE_RESTORE_MS = 5_000;
// Placa con tiempo: abre las puertas con tiempo del mapa por 3 s.
const TIMED_DOOR_MS = 3_000;
// Aplastadores: bajan 0,6 s de cada 2 s y sacan el 15 % de la vida al que agarran.
const CRUSHER_CYCLE_MS = 2_000;
const CRUSHER_DOWN_MS = 600;
const CRUSHER_DAMAGE = 0.15;
// Estatuas que despiertan: a esta distancia de un jugador.
const WAKE_RADIUS = 2;
// Jefe que flota (Ojo Viscoso): cae aturdido este tiempo cuando alguien se estrella contra una pared rajada.
const BOSS_STUN_MS = 6_000;

export type DungeonDef = {
    id: string;
    nombre: string;
    descripcion?: string;
    nivelMinimo?: number;
    maxJugadores?: number;
    soloDesarrollo?: boolean;
    mapas: number[];
    entrada: { map: number; x: number; y: number };
    salidas: Array<{ map: number; x: number; y: number }>;
    regreso: { map: number; x: number; y: number };
    escalado?: { vidaPorJugador?: number; danoPorJugador?: number };
    // Ítem de mazmorra del cofre principal (R): queda para siempre en el personaje.
    itemMazmorra?: { id: string; nombre: string };
    // Ítems de mazmorras anteriores que hacen falta para entrar (la Caverna pide la Pluma).
    requiere?: Array<{ id: string; nombre: string }>;
    // Cofre del jefe (Y): trofeo de la serie y oro, una vez por día por personaje.
    trofeo?: { id: string; nombre: string };
    oroJefe?: number;
};

// --- Mecánicas: datos fijos de cada mapa base ---
type Barrier = {
    x: number;
    y: number;
    tipo: "llave" | "jefe" | "sala" | "placa" | "tiempo" | "unica";
    horizontal: boolean;
    salas: number[];
    // Puertas de un solo sentido: hacia dónde se pasa.
    dir?: "norte" | "sur" | "este" | "oeste";
};
type Chest = { x: number; y: number; contenido: string; oculto: boolean; sala: number };
type MapMechanics = {
    rooms: Array<{ id: number; x1: number; y1: number; x2: number; y2: number; cierra: boolean }>;
    roomOf: Record<string, number>;
    barriers: Barrier[];
    pits: string[];
    lava: string[];
    lavaPeriodica: string[];
    plates: string[];
    blocks: string[];
    chests: Chest[];
    slabs: Array<{ x: number; y: number; texto: string }>;
    oro: number;
    oroGrande?: number;
    trampa: number[];
    // Mecánicas de la Caverna de las Llaves (pueden faltar en mapas viejos).
    crystals?: string[];
    fragile?: string[];
    timedPlates?: string[];
    crackedWalls?: string[];
    crushers?: string[];
};

type MapIndex = {
    mech: MapMechanics;
    rooms: Map<number, MapMechanics["rooms"][number]>;
    pits: Set<string>;
    lava: Set<string>;
    lavaPeriodica: Set<string>;
    plates: Set<string>;
    chests: Map<string, Chest>;
    slabs: Map<string, MapMechanics["slabs"][number]>;
    barriers: Map<string, Barrier>;
    crystals: Set<string>;
    fragile: Set<string>;
    timedPlates: Set<string>;
    crackedWalls: Set<string>;
    crushers: Set<string>;
    // Baldosas cuyo bloqueo cambia durante la corrida (puertas, cofres, bloques y cristales): van en la foto del área.
    dynamic: Set<string>;
};

type RoomState = { locked: boolean; cleared: boolean };
type MapState = {
    rooms: Map<number, RoomState>;
    visited: Set<number>;
    openedChests: Set<string>;
    revealedChests: Set<string>;
    openBarriers: Set<string>;
    blocks: Set<string>;
    // Por donde pasaron los bloques (su bloqueo puede haber quedado viejo en algún cliente).
    blockTrail: Set<string>;
    platesSolved: boolean;
    // Puertas que se tienen que cerrar pero tenían a alguien encima: se cierran apenas queden libres.
    pendingClose: Set<string>;
    brokenCrystals: Set<string>;
    // Piso que se desmorona: cuándo se cae cada baldosa pisada y cuándo vuelve cada una caída.
    crumbling: Map<string, number>;
    collapsed: Map<string, number>;
    // Hasta cuándo están abiertas las puertas con tiempo (0: cerradas).
    timedUntil: number;
};

type DungeonRun = {
    id: string;
    dungeonId: string;
    slot: number;
    // mapa base → mapa de la instancia
    maps: Record<number, number>;
    // Personajes de la corrida (id de la base, estable entre conexiones).
    members: Set<string>;
    // Los que están adentro (conectados o desconectados adentro).
    inside: Set<string>;
    group: boolean;
    playerCount: number;
    createdAt: number;
    emptySince: number | null;
    // Llaves chicas y llave del jefe: cada una la lleva el que abrió el cofre, se gasta al abrir la puerta y, si
    // el que la lleva se va, pasa a otro del grupo. Mapa y brújula valen para todo el grupo. Nada sale de la corrida.
    keys: Map<string, number>;
    bossKeyHolder: string | null;
    hasMap: boolean;
    hasCompass: boolean;
    // Nombre de cada personaje de la corrida (para los avisos de las llaves aunque esté desconectado).
    names: Map<string, string>;
    mapState: Record<number, MapState>;
    // Sala en la que está cada jugador y por dónde entró (para volver ahí al caer a un pozo).
    playerRoom: Map<string, { base: number; room: number; entry: { x: number; y: number } }>;
    // Próximo daño de lava de cada jugador (para no quemar en cada tic).
    nextBurnAt: Map<string, number>;
    hazardTimer: ReturnType<typeof setInterval> | null;
    lavaActive: boolean;
    crusherDown: boolean;
    // Criaturas en pareja: por grupo, las que siguen vivas (si muere una y la otra sigue viva, la revive).
    pairs: Map<string, Set<string>>;
    // Jefe que flota hasta que lo bajan con la Carrera.
    floatingBoss: { npcId: string; stunnedUntil: number; split: boolean } | null;
};

type Invite = { runId: string; from: string; expiresAt: number; timer: ReturnType<typeof setTimeout> };

const runs = new Map<string, DungeonRun>();
const runByInstanceMap = new Map<number, string>();
const runByCharacter = new Map<string, string>();
const invites = new Map<string, Invite>();
let panelSeq = 0;
let losaSeq = 0;
let sweepTimer: ReturnType<typeof setInterval> | null = null;
let definitions: DungeonDef[] | null = null;

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

function getMapInstanceManager() {
    return require("./mapInstanceManager");
}

function getProgressStore() {
    return require("./woaoProgress");
}

// --- Definiciones ---

export function loadDefinitions(): DungeonDef[] {
    if (!definitions) {
        definitions = fs.existsSync(DUNGEONS_PATH) ? (JSON.parse(fs.readFileSync(DUNGEONS_PATH, "utf8")) as DungeonDef[]) : [];
    }
    return definitions;
}

export function getDefinition(id: string): DungeonDef | undefined {
    return loadDefinitions().find((def) => def.id === id);
}

export function getDungeonBaseMaps(): number[] {
    return [...new Set(loadDefinitions().flatMap((def) => def.mapas))];
}

function isDevelopment() {
    return process.env.NODE_ENV !== "production";
}

// --- Cuentas puras (las prueba dungeons.test.ts) ---

export function instanceMapId(baseMap: number, slot: number): number {
    return INSTANCE_MAP_START + baseMap * INSTANCE_MAP_STRIDE + slot;
}

export function baseMapOf(mapId: number): number | null {
    if (mapId < INSTANCE_MAP_START) return null;
    return Math.floor((mapId - INSTANCE_MAP_START) / INSTANCE_MAP_STRIDE);
}

export function scaleFactors(def: Pick<DungeonDef, "escalado">, playerCount: number) {
    const extra = Math.max(0, Math.floor(playerCount) - 1);
    return {
        vida: 1 + extra * Number(def.escalado?.vidaPorJugador ?? 0.7),
        dano: 1 + extra * Number(def.escalado?.danoPorJugador ?? 0.15),
    };
}

// Primer lugar libre (0-49) en todos los mapas de la mazmorra.
export function findFreeSlot(baseMaps: number[], isTaken: (mapId: number) => boolean): number | null {
    for (let slot = 0; slot < INSTANCE_MAP_STRIDE; slot++) {
        if (baseMaps.every((base) => !isTaken(instanceMapId(base, slot)))) return slot;
    }
    return null;
}

// --- Consultas que usa el resto del server ---

export function isDungeonInstanceMap(mapId: number | undefined): boolean {
    return Boolean(mapId) && runByInstanceMap.has(Number(mapId));
}

export function isDungeonBaseMap(mapId: number | undefined): boolean {
    return Boolean(mapId) && getDungeonBaseMaps().includes(Number(mapId));
}

function characterKey(user: RuntimeCharacter | undefined): string | null {
    const key = (user as { _id?: unknown } | undefined)?._id;
    return key ? String(key) : null;
}

function runOfUser(user: RuntimeCharacter | undefined): DungeonRun | undefined {
    const key = characterKey(user);
    const runId = key ? runByCharacter.get(key) : undefined;
    return runId ? runs.get(runId) : undefined;
}

function runOfMap(mapId: number): DungeonRun | undefined {
    const runId = runByInstanceMap.get(mapId);
    return runId ? runs.get(runId) : undefined;
}

// Sin PvP adentro: ni con tu grupo ni con nadie.
export function getAttackDeniedReason(attacker: RuntimeCharacter | undefined, target: { isNpc?: boolean; map?: number } | undefined) {
    if (!attacker || !target || target.isNpc) return null;
    if (isDungeonInstanceMap(attacker.map) || isDungeonInstanceMap(target.map)) {
        return "En la mazmorra no se puede atacar a otros jugadores.";
    }
    return null;
}

// --- Estado para el cliente ---

function onlineSessionId(characterId: string): string | null {
    for (const [sessionId, user] of Object.entries(vars.personajes ?? {}) as Array<[string, RuntimeCharacter | undefined]>) {
        if (user && characterKey(user) === characterId && (user as { connected?: boolean }).connected !== false) return sessionId;
    }
    return null;
}

function playersInside(run: DungeonRun): RuntimeCharacter[] {
    const mapIds = new Set(Object.values(run.maps));
    return (Object.values(vars.personajes ?? {}) as Array<RuntimeCharacter | undefined>).filter(
        (user): user is RuntimeCharacter => Boolean(user && mapIds.has(Number(user.map)) && (user as { connected?: boolean }).connected !== false),
    );
}

function hasDungeonItem(characterId: string, itemId: string): boolean {
    const progress = getProgressStore().getProgress({ _id: characterId }) as { dungeonItems?: string[] };
    return Boolean(progress.dungeonItems?.includes(itemId));
}

// Minimapa de la mazmorra: las salas visitadas (con el mapa, todas) y, con la brújula, los cofres y la puerta del jefe.
function buildMinimap(run: DungeonRun, base: number) {
    const index = mechanicsOf(base);
    const state = run.mapState[base];
    if (!index || !state) return null;
    return {
        mapa: base,
        salas: index.mech.rooms
            .filter((room) => run.hasMap || state.visited.has(room.id))
            .map((room) => ({ x1: room.x1, y1: room.y1, x2: room.x2, y2: room.y2, visitada: state.visited.has(room.id) })),
        cofres: run.hasCompass
            ? index.mech.chests.map((chest) => ({ x: chest.x, y: chest.y, abierto: state.openedChests.has(`${chest.x},${chest.y}`) }))
            : [],
        jefe: run.hasCompass ? index.mech.barriers.filter((barrier) => barrier.tipo === "jefe").map(({ x, y }) => ({ x, y })) : [],
    };
}

function buildState(user: RuntimeCharacter, panel: Record<string, unknown> | null, losa: { texto: string } | null = null) {
    const key = characterKey(user);
    const invite = key ? invites.get(key) : undefined;
    const inviteRun = invite ? runs.get(invite.runId) : undefined;
    const run = runOfUser(user);
    const insideRun = run && isDungeonInstanceMap(user.map) ? run : undefined;
    const insideDef = insideRun ? getDefinition(insideRun.dungeonId) : undefined;
    return {
        panelSeq: panel ? ++panelSeq : 0,
        panel,
        invitacion:
            invite && inviteRun
                ? {
                      dungeonId: inviteRun.dungeonId,
                      nombre: getDefinition(inviteRun.dungeonId)?.nombre ?? inviteRun.dungeonId,
                      de: invite.from,
                      expiraEnMs: Math.max(0, invite.expiresAt - Date.now()),
                  }
                : null,
        enMazmorra:
            insideRun && insideDef && key
                ? {
                      dungeonId: insideDef.id,
                      nombre: insideDef.nombre,
                      jugadores: playersInside(insideRun).length,
                      grupo: insideRun.group,
                      llaves: insideRun.keys.get(key) ?? 0,
                      llaveJefe: insideRun.bossKeyHolder === key,
                      // Las que lleva otro del grupo.
                      llavesDeOtros: [...insideRun.keys]
                          .filter(([holder, count]) => holder !== key && count > 0)
                          .map(([holder, count]) => ({ nombre: insideRun.names.get(holder) ?? "otro del grupo", cantidad: count })),
                      llaveJefeDe:
                          insideRun.bossKeyHolder && insideRun.bossKeyHolder !== key
                              ? (insideRun.names.get(insideRun.bossKeyHolder) ?? "otro del grupo")
                              : null,
                      mapa: insideRun.hasMap,
                      brujula: insideRun.hasCompass,
                      patas: hasDungeonItem(key, SWIM_ITEM),
                      // Inventario de mazmorra: los ítems que tiene, y cuáles se usan (la Carrera y el salto).
                      items: ownedDungeonItems(key),
                      minimapa: buildMinimap(insideRun, baseMapOf(Number(user.map)) ?? 0),
                  }
                : null,
        losa: losa ? { seq: ++losaSeq, texto: losa.texto } : null,
    };
}

function sendState(sessionId: EntityId, panel: Record<string, unknown> | null = null, losa: { texto: string } | null = null) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !client) return;
    getHandleProtocol().dungeonState(buildState(user, panel, losa), client);
}

function refreshRun(run: DungeonRun) {
    for (const user of playersInside(run)) sendState(user.id);
}

function tellRun(run: DungeonRun, message: string, color = "#E69500") {
    for (const user of playersInside(run)) tell(user.id, message, color);
}

function tell(sessionId: EntityId, message: string, color = "#E69500") {
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (client) getHandleProtocol().console(message, color, 1, 0, client);
}

// --- Piedra de invocación ---

function stoneDungeonId(npc: { templateNpcIndex?: number } | undefined): string | null {
    const template = npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined;
    return template?.dungeonId ? String(template.dungeonId) : null;
}

function nearestStone(user: RuntimeCharacter): { npc: any; dungeonId: string } | null {
    for (const npc of Object.values(vars.npcs ?? {}) as any[]) {
        if (!npc || npc.map !== user.map) continue;
        const dungeonId = stoneDungeonId(npc);
        if (!dungeonId) continue;
        if (Math.abs(npc.pos.x - user.pos.x) <= STONE_RANGE && Math.abs(npc.pos.y - user.pos.y) <= STONE_RANGE) {
            return { npc, dungeonId };
        }
    }
    return null;
}

function partyOf(user: RuntimeCharacter): { id: string; leaderId: EntityId; memberIds: EntityId[] } | null {
    const partyId = (user as { partyId?: string | null }).partyId;
    return partyId ? (vars.parties?.[partyId] ?? null) : null;
}

// Una mazmorra "solo desarrollo" en producción: solo entra un GM, solo o llevando a su party (los demás entran
// aceptando su invocación). Así se prueba en el servidor real sin abrirla al público.
export function developmentLockReason(
    def: Pick<DungeonDef, "nombre" | "soloDesarrollo">,
    user: { privileges?: number },
    production = !isDevelopment(),
): string | null {
    if (!def.soloDesarrollo || !production || Number(user.privileges ?? 0) === 1) return null;
    return `${def.nombre} todavía está en desarrollo: por ahora solo entra un GM, solo o con su party.`;
}

function entryDeniedReason(user: RuntimeCharacter, def: DungeonDef): string | null {
    const devLock = developmentLockReason(def, user);
    if (devLock) return devLock;
    if ((user as { dead?: boolean }).dead) return "Los muertos no pueden entrar a una mazmorra.";
    if (Number(user.level ?? 0) < Number(def.nivelMinimo ?? 1)) return `Necesitás nivel ${def.nivelMinimo} para entrar a ${def.nombre}.`;
    if ((user as { huntersGame?: unknown }).huntersGame || Number(user.map) >= 1000) return "No podés entrar a una mazmorra desde acá.";
    if (runOfUser(user)) return "Ya estás en una mazmorra.";
    const key = characterKey(user);
    const missing = (def.requiere ?? []).find((item) => !key || !hasDungeonItem(key, item.id));
    if (missing) return `Para ${def.nombre} hace falta ${missing.nombre}.`;
    return null;
}

function buildPanel(user: RuntimeCharacter, def: DungeonDef) {
    const party = partyOf(user);
    const isLeader = Boolean(party && String(party.leaderId) === String(user.id));
    const denied = entryDeniedReason(user, def);
    const max = Number(def.maxJugadores ?? 5);
    const partySize = party ? party.memberIds.length : 0;
    return {
        dungeonId: def.id,
        nombre: def.nombre,
        descripcion: def.descripcion ?? "",
        nivelMinimo: Number(def.nivelMinimo ?? 1),
        maxJugadores: max,
        enParty: Boolean(party),
        esLider: isLeader,
        miembrosParty: partySize,
        puedeSolo: !denied,
        puedeGrupo: !denied && isLeader && partySize <= max,
        motivo: denied ?? (party && !isLeader ? "Solo el líder de la party puede llevar al grupo." : party && partySize > max ? `El grupo puede ser de ${max} como máximo.` : null),
    };
}

// Clic en una criatura: si es una piedra de invocación, abre su panel.
export function handleNpcInteraction(ws: RuntimeClient, npc: any): boolean {
    const dungeonId = stoneDungeonId(npc);
    if (!dungeonId) return false;
    const user = vars.personajes?.[ws.id!] as RuntimeCharacter | undefined;
    const def = getDefinition(dungeonId);
    if (!user || !def) return true;
    if (Math.abs(npc.pos.x - user.pos.x) > STONE_RANGE || Math.abs(npc.pos.y - user.pos.y) > STONE_RANGE) {
        tell(ws.id!, "Acercate a la piedra para usarla.", "white");
        return true;
    }
    sendState(ws.id!, buildPanel(user, def));
    return true;
}

// --- Corridas ---

function copyMapMeta(baseMap: number, targetMap: number) {
    const base = vars.mapData[baseMap];
    const target = vars.mapData[targetMap];
    for (const key of ["name", "musicNum", "magiaSinEfecto", "noEncriptarMp", "terreno", "zona", "restringir", "minLevel", "maxLevel", "backup", "pk"]) {
        target[key] = base[key];
    }
}

function scaleNpc(npc: any, factors: { vida: number; dano: number }) {
    npc.maxHp = Math.round(Number(npc.maxHp ?? 0) * factors.vida);
    npc.hp = npc.maxHp;
    npc.minHit = Math.round(Number(npc.minHit ?? 0) * factors.dano);
    npc.maxHit = Math.round(Number(npc.maxHit ?? 0) * factors.dano);
}

// Las criaturas de mazmorra pasean en 3×3 alrededor de donde nacen cuando no persiguen a nadie.
function makeDungeonWanderer(npc: any) {
    npc.wanderRadius = WANDER_RADIUS;
    npc.wanderHome = { x: npc.pos.x, y: npc.pos.y };
    npc.wanderHomeMap = npc.map;
}

function spawnRunNpcs(baseMap: number, instanceMap: number, factors: { vida: number; dano: number }) {
    const { loadMapNpcPlacements } = require("./mapNpcStorage");
    const LoadNpcs = require("./loadNpcs");
    const loader = new LoadNpcs();
    for (const entry of loadMapNpcPlacements(baseMap)) {
        loader.createNpcInMap({ ...entry, mapNum: instanceMap }, true, false, true);
    }
    for (const npc of Object.values(vars.npcs ?? {}) as any[]) {
        if (!npc || npc.map !== instanceMap || Number(npc.attackable ?? 1) === 0) continue;
        scaleNpc(npc, factors);
        makeDungeonWanderer(npc);
    }
}

// Jugadores conectados por mapa, recalculado como mucho cada medio segundo (lo consulta cada criatura).
let watchersCache: { at: number; byMap: Map<number, Array<{ x: number; y: number }>> } = { at: 0, byMap: new Map() };

// Una criatura de mazmorra sin nadie a quien perseguir pasea si algún jugador la tiene a la vista.
export function isWatchedDungeonNpc(npc: { map?: number; pos?: { x: number; y: number }; wanderRadius?: number }): boolean {
    if (!npc.pos || npc.wanderRadius === undefined || !isDungeonInstanceMap(npc.map)) return false;
    const now = Date.now();
    if (now - watchersCache.at > WATCHERS_TTL_MS) {
        const byMap = new Map<number, Array<{ x: number; y: number }>>();
        for (const user of Object.values(vars.personajes ?? {}) as Array<RuntimeCharacter & { connected?: boolean }>) {
            if (!user?.pos || user.connected === false || !isDungeonInstanceMap(user.map)) continue;
            const list = byMap.get(Number(user.map)) ?? [];
            list.push({ x: user.pos.x, y: user.pos.y });
            byMap.set(Number(user.map), list);
        }
        watchersCache = { at: now, byMap };
    }
    const rangeX = Number(vars.areaVisionRangeX ?? 13);
    const rangeY = Number(vars.areaVisionRangeY ?? 10);
    return (watchersCache.byMap.get(Number(npc.map)) ?? []).some(
        (pos) => Math.abs(pos.x - npc.pos!.x) <= rangeX && Math.abs(pos.y - npc.pos!.y) <= rangeY,
    );
}

function createRun(def: DungeonDef, group: boolean, playerCount: number): DungeonRun | null {
    const slot = findFreeSlot(def.mapas, (mapId) => Boolean(vars.mapa[mapId] || vars.mapData[mapId]));
    if (slot === null) return null;
    const mapInstanceManager = getMapInstanceManager();
    const factors = scaleFactors(def, playerCount);
    const run: DungeonRun = {
        id: `${def.id}-${Date.now().toString(36)}-${slot}`,
        dungeonId: def.id,
        slot,
        maps: {},
        members: new Set(),
        inside: new Set(),
        group,
        playerCount,
        createdAt: Date.now(),
        emptySince: null,
        keys: new Map(),
        bossKeyHolder: null,
        names: new Map(),
        hasMap: false,
        hasCompass: false,
        mapState: {},
        playerRoom: new Map(),
        nextBurnAt: new Map(),
        hazardTimer: null,
        lavaActive: false,
        crusherDown: false,
        pairs: new Map(),
        floatingBoss: null,
    };
    for (const baseMap of def.mapas) {
        if (!vars.mapa[baseMap] || !vars.mapData[baseMap]) {
            destroyRun(run);
            return null;
        }
        const mapId = instanceMapId(baseMap, slot);
        mapInstanceManager.cloneMap(baseMap, mapId);
        copyMapMeta(baseMap, mapId);
        run.maps[baseMap] = mapId;
        runByInstanceMap.set(mapId, run.id);
        spawnRunNpcs(baseMap, mapId, factors);
        for (const npc of Object.values(vars.npcs ?? {}) as any[]) {
            if (npc?.map === mapId) registerSpecialNpc(run, npc);
        }
        const index = mechanicsOf(baseMap);
        if (index) run.mapState[baseMap] = createMapState(index);
    }
    runs.set(run.id, run);
    run.hazardTimer = setInterval(() => tickRun(run), HAZARD_TICK_MS);
    run.hazardTimer.unref?.();
    ensureSweep();
    return run;
}

function destroyRun(run: DungeonRun) {
    if (run.hazardTimer) clearInterval(run.hazardTimer);
    run.hazardTimer = null;
    for (const mapId of Object.values(run.maps)) {
        for (const npcId of Object.keys(vars.npcs ?? {})) {
            if (vars.npcs[npcId]?.map === mapId) {
                delete vars.npcs[npcId];
                delete vars.areaNpc[npcId];
            }
        }
        delete vars.mapData[mapId];
        delete vars.mapa[mapId];
        runByInstanceMap.delete(mapId);
    }
    for (const member of run.members) {
        if (runByCharacter.get(member) === run.id) runByCharacter.delete(member);
    }
    for (const [characterId, invite] of invites) {
        if (invite.runId === run.id) {
            clearTimeout(invite.timer);
            invites.delete(characterId);
        }
    }
    runs.delete(run.id);
}

function teleportInto(sessionId: EntityId, run: DungeonRun, def: DungeonDef) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    const key = characterKey(user);
    if (!user || !client || !key) return false;
    const game = getGame();
    const mapId = run.maps[def.entrada.map];
    const landing = game.getFreeSpace(client, mapId, def.entrada.x, def.entrada.y, "dungeon.entrada") ?? def.entrada;
    run.members.add(key);
    run.inside.add(key);
    run.names.set(key, String(user.nameCharacter ?? "Alguien"));
    runByCharacter.set(key, run.id);
    game.forceDismount(sessionId);
    game.telep(client, mapId, landing.x, landing.y, "dungeon.entrada");
    tell(sessionId, `Entraste a ${def.nombre}.`);
    for (const user of playersInside(run)) sendState(user.id);
    return true;
}

// Saca al jugador de la corrida y lo deja junto a la piedra.
export function leaveRun(sessionId: EntityId, reason: string) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    const run = runOfUser(user);
    const key = characterKey(user);
    if (!user || !run || !key) return false;
    const def = getDefinition(run.dungeonId);
    run.members.delete(key);
    run.inside.delete(key);
    runByCharacter.delete(key);
    passKeysOf(run, key, "salió de la mazmorra");
    if (client && def && isDungeonInstanceMap(user.map)) {
        const game = getGame();
        const landing = game.getFreeSpace(client, def.regreso.map, def.regreso.x, def.regreso.y, "dungeon.salida") ?? def.regreso;
        game.telep(client, def.regreso.map, landing.x, landing.y, "dungeon.salida");
    }
    tell(sessionId, reason);
    sendState(sessionId);
    if (run.inside.size === 0) {
        destroyRun(run);
    } else {
        for (const other of playersInside(run)) sendState(other.id);
    }
    return true;
}

// Las llaves del que se va pasan al primero de los que siguen adentro. Devuelve qué pasó, o null si no llevaba
// ninguna. Sin nadie que las reciba, se pierden (la corrida se termina igual).
export function handOverKeys(
    holdings: { keys: Map<string, number>; bossKeyHolder: string | null },
    leaving: string,
    heirs: string[],
): { heir: string | null; keys: number; bossKey: boolean } | null {
    const keys = holdings.keys.get(leaving) ?? 0;
    const bossKey = holdings.bossKeyHolder === leaving;
    if (!keys && !bossKey) return null;
    const heir = heirs.find((id) => id !== leaving) ?? null;
    holdings.keys.delete(leaving);
    if (heir && keys) holdings.keys.set(heir, (holdings.keys.get(heir) ?? 0) + keys);
    if (bossKey) holdings.bossKeyHolder = heir;
    return { heir, keys, bossKey };
}

function passKeysOf(run: DungeonRun, characterId: string, reason: string, excludeSessionId?: EntityId) {
    // Primero a los conectados; si no hay, a uno que esté adentro desconectado.
    const online = playersInside(run)
        .filter((user) => String(user.id) !== String(excludeSessionId ?? ""))
        .map((user) => characterKey(user))
        .filter((id): id is string => Boolean(id) && run.inside.has(id!));
    const heirs = [...online, ...[...run.inside].filter((id) => !online.includes(id))];
    const result = handOverKeys(run, characterId, heirs);
    if (!result) return;
    const from = run.names.get(characterId) ?? "Alguien";
    const what = [result.keys ? (result.keys === 1 ? "la llave chica" : `${result.keys} llaves chicas`) : "", result.bossKey ? "la llave del jefe" : ""]
        .filter(Boolean)
        .join(" y ");
    const plural = result.keys + (result.bossKey ? 1 : 0) > 1;
    if (result.heir) {
        tellRun(run, `${from} ${reason}: ${what} ${plural ? "pasaron" : "pasó"} a ${run.names.get(result.heir) ?? "otro del grupo"}.`);
    }
    refreshRun(run);
}

// --- Comandos (/mazmorra) ---

export function enter(sessionId: EntityId, mode: "solo" | "grupo") {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    if (!user) return;
    const stone = nearestStone(user);
    if (!stone) return tell(sessionId, "Tenés que estar junto a una piedra de invocación.", "white");
    const def = getDefinition(stone.dungeonId);
    if (!def) return;
    const denied = entryDeniedReason(user, def);
    if (denied) return tell(sessionId, denied, "white");

    if (mode === "solo") {
        const run = createRun(def, false, 1);
        if (!run) return tell(sessionId, "No hay lugar para otra corrida de esta mazmorra ahora. Probá en un rato.", "white");
        teleportInto(sessionId, run, def);
        return;
    }

    const party = partyOf(user);
    if (!party) return tell(sessionId, "No estás en una party. Armala con /party o entrá solo.", "white");
    if (String(party.leaderId) !== String(user.id)) return tell(sessionId, "Solo el líder de la party puede llevar al grupo.", "white");
    const max = Number(def.maxJugadores ?? 5);
    if (party.memberIds.length > max) return tell(sessionId, `El grupo puede ser de ${max} como máximo.`, "white");
    const others = party.memberIds.filter((id) => String(id) !== String(user.id) && vars.personajes?.[id]);
    const run = createRun(def, true, 1 + others.length);
    if (!run) return tell(sessionId, "No hay lugar para otra corrida de esta mazmorra ahora. Probá en un rato.", "white");
    teleportInto(sessionId, run, def);
    for (const memberId of others) {
        const member = vars.personajes[memberId] as RuntimeCharacter;
        const key = characterKey(member);
        if (!key) continue;
        const previous = invites.get(key);
        if (previous) clearTimeout(previous.timer);
        const timer = setTimeout(() => {
            if (invites.get(key)?.runId === run.id) {
                invites.delete(key);
                const sessionNow = onlineSessionId(key);
                if (sessionNow) sendState(sessionNow);
            }
        }, INVITE_MS);
        invites.set(key, { runId: run.id, from: String(user.nameCharacter ?? "Tu líder"), expiresAt: Date.now() + INVITE_MS, timer });
        tell(memberId, `${user.nameCharacter} te invoca a ${def.nombre}. Aceptá con /mazmorra aceptar.`);
        sendState(memberId);
    }
}

export function acceptInvite(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const key = characterKey(user);
    const invite = key ? invites.get(key) : undefined;
    if (!user || !key || !invite) return tell(sessionId, "No tenés ninguna invocación pendiente.", "white");
    clearTimeout(invite.timer);
    invites.delete(key);
    const run = runs.get(invite.runId);
    const def = run ? getDefinition(run.dungeonId) : undefined;
    if (!run || !def) {
        sendState(sessionId);
        return tell(sessionId, "Esa mazmorra ya terminó.", "white");
    }
    const denied = entryDeniedReason(user, { ...def, soloDesarrollo: false });
    if (denied) {
        sendState(sessionId);
        return tell(sessionId, denied, "white");
    }
    // Tiene que seguir en la party de alguien de la corrida.
    const party = partyOf(user);
    const partyInRun = party?.memberIds.some((id) => {
        const member = vars.personajes?.[id] as RuntimeCharacter | undefined;
        const memberKey = characterKey(member);
        return memberKey && memberKey !== key && run.members.has(memberKey);
    });
    if (!partyInRun) {
        sendState(sessionId);
        return tell(sessionId, "Ya no estás en la party de esa corrida.", "white");
    }
    if (run.members.size >= Number(def.maxJugadores ?? 5)) {
        sendState(sessionId);
        return tell(sessionId, "Esa corrida ya está completa.", "white");
    }
    teleportInto(sessionId, run, def);
}

export function declineInvite(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const key = characterKey(user);
    const invite = key ? invites.get(key) : undefined;
    if (!key || !invite) return;
    clearTimeout(invite.timer);
    invites.delete(key);
    sendState(sessionId);
    tell(sessionId, "Rechazaste la invocación.", "white");
}

export function handleCommand(sessionId: EntityId, text: string) {
    const [action = "", arg = ""] = text.trim().toLowerCase().split(/\s+/);
    switch (action) {
        case "entrar":
            return enter(sessionId, arg === "grupo" ? "grupo" : "solo");
        case "aceptar":
            return acceptInvite(sessionId);
        case "rechazar":
            return declineInvite(sessionId);
        case "salir": {
            const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
            if (!runOfUser(user)) return tell(sessionId, "No estás en una mazmorra.", "white");
            return leaveRun(sessionId, "Saliste de la mazmorra.");
        }
        case "carrera":
            return require("./dungeonMotion").startDash(sessionId);
        case "salto":
            return require("./dungeonMotion").jump(sessionId);
        case "item": {
            const [, itemId = "", flag = ""] = text.trim().split(/\s+/);
            return grantItemCommand(sessionId, itemId.toLowerCase(), flag.toLowerCase() === "quitar");
        }
        default:
            return tell(sessionId, "Uso: /mazmorra entrar solo | entrar grupo | aceptar | rechazar | salir", "white");
    }
}

// --- Mecánicas (etapa 2) ---

const mechanicsCache = new Map<number, MapIndex | null>();

const coordKey = (x: number, y: number) => `${x},${y}`;

function parseCoord(key: string) {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
}

function mechanicsOf(baseMap: number): MapIndex | null {
    if (!mechanicsCache.has(baseMap)) {
        let index: MapIndex | null = null;
        try {
            const specials = JSON.parse(fs.readFileSync(path.join(MAPAS_SOURCE, `mapa_${baseMap}`, "specials.json"), "utf8"));
            const mech = specials.dungeon as MapMechanics | undefined;
            if (mech) {
                const chests = new Map(mech.chests.map((chest) => [coordKey(chest.x, chest.y), chest]));
                const barriers = new Map(mech.barriers.map((barrier) => [coordKey(barrier.x, barrier.y), barrier]));
                index = {
                    mech,
                    rooms: new Map(mech.rooms.map((room) => [room.id, room])),
                    pits: new Set(mech.pits),
                    lava: new Set(mech.lava),
                    lavaPeriodica: new Set(mech.lavaPeriodica),
                    plates: new Set(mech.plates),
                    chests,
                    slabs: new Map(mech.slabs.map((slab) => [coordKey(slab.x, slab.y), slab])),
                    barriers,
                    crystals: new Set(mech.crystals ?? []),
                    fragile: new Set(mech.fragile ?? []),
                    timedPlates: new Set(mech.timedPlates ?? []),
                    crackedWalls: new Set(mech.crackedWalls ?? []),
                    crushers: new Set(mech.crushers ?? []),
                    dynamic: new Set([...barriers.keys(), ...chests.keys(), ...mech.blocks, ...(mech.crystals ?? [])]),
                };
            }
        } catch {
            index = null;
        }
        mechanicsCache.set(baseMap, index);
    }
    return mechanicsCache.get(baseMap) ?? null;
}

function createMapState(index: MapIndex): MapState {
    return {
        rooms: new Map(index.mech.rooms.map((room) => [room.id, { locked: false, cleared: false }])),
        visited: new Set(),
        openedChests: new Set(),
        revealedChests: new Set(),
        // Las puertas de sala y las de un solo sentido arrancan abiertas; el resto, cerradas.
        openBarriers: new Set(
            index.mech.barriers.filter((barrier) => barrier.tipo === "sala" || barrier.tipo === "unica").map((barrier) => coordKey(barrier.x, barrier.y)),
        ),
        blocks: new Set(index.mech.blocks),
        blockTrail: new Set(),
        platesSolved: index.mech.plates.length === 0,
        pendingClose: new Set(),
        brokenCrystals: new Set(),
        crumbling: new Map(),
        collapsed: new Map(),
        timedUntil: 0,
    };
}

// Contexto de un mapa de una corrida.
type MapContext = { run: DungeonRun; base: number; mapId: number; index: MapIndex; state: MapState };

function contextOf(mapId: number): MapContext | null {
    const run = runOfMap(mapId);
    const base = baseMapOf(mapId);
    if (!run || base === null) return null;
    const index = mechanicsOf(base);
    const state = run.mapState[base];
    return index && state ? { run, base, mapId, index, state } : null;
}

function areaClients(mapId: number, pos: { x: number; y: number }, callback: (client: RuntimeClient) => void) {
    getGame().loopAreaPos(mapId, pos, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) callback(client);
    });
}

function setObject(mapId: number, x: number, y: number, objIndex: number) {
    const tile = vars.mapa[mapId]?.[y]?.[x];
    if (!tile) return;
    const pos = { x, y };
    const handleProtocol = getHandleProtocol();
    if (objIndex) {
        tile.objInfo = { objIndex, amount: 1 };
        areaClients(mapId, pos, (client) => handleProtocol.renderItem(objIndex, mapId, pos, client));
    } else {
        delete tile.objInfo;
        areaClients(mapId, pos, (client) => handleProtocol.deleteItem(mapId, pos, client));
    }
}

function setBlocked(mapId: number, x: number, y: number, blocked: boolean) {
    if (!vars.mapa[mapId]?.[y]?.[x]) return;
    getGame().blockMap(mapId, { x, y }, blocked ? 1 : 0);
}

// Un sonido de mazmorra (DUNGEON_SOUNDS) para los que ven ese lugar; lo usa dungeonMotion.ts.
export function playDungeonSound(mapId: number, pos: { x: number; y: number }, sound: keyof typeof DUNGEON_SOUNDS) {
    playSoundAt(mapId, pos, DUNGEON_SOUNDS[sound]);
}

// Un sonido para todos los que ven ese lugar.
function playSoundAt(mapId: number, pos: { x: number; y: number }, soundId: number) {
    const handleProtocol = getHandleProtocol();
    areaClients(mapId, pos, (client) => handleProtocol.playSound(0, soundId, client));
}

function roomCenter(ctx: MapContext, roomId: number) {
    const room = ctx.index.rooms.get(roomId);
    return room ? { x: Math.round((room.x1 + room.x2) / 2), y: Math.round((room.y1 + room.y2) / 2) } : null;
}

function isOccupied(mapId: number, x: number, y: number) {
    return Boolean(vars.mapData[mapId]?.[y]?.[x]?.id);
}

function playerAt(mapId: number, x: number, y: number): RuntimeCharacter | null {
    const id = vars.mapData[mapId]?.[y]?.[x]?.id;
    const user = id ? (vars.personajes?.[id] as RuntimeCharacter | undefined) : undefined;
    return user ?? null;
}

// Abre o cierra una puerta. Si alguien está parado en ella, se cierra apenas quede libre.
function setBarrier(ctx: MapContext, barrier: Barrier, open: boolean) {
    const key = coordKey(barrier.x, barrier.y);
    if (!open && isOccupied(ctx.mapId, barrier.x, barrier.y)) {
        ctx.state.pendingClose.add(key);
        return;
    }
    ctx.state.pendingClose.delete(key);
    if (open) ctx.state.openBarriers.add(key);
    else ctx.state.openBarriers.delete(key);
    const objIndex = barrier.horizontal ? (open ? OBJ.puertaAbierta : OBJ.puerta) : open ? 0 : OBJ.barrera;
    setObject(ctx.mapId, barrier.x, barrier.y, objIndex);
    setBlocked(ctx.mapId, barrier.x, barrier.y, !open);
}

// Criaturas vivas paradas en la sala (no cuentan las invocaciones de los jugadores).
function roomCreatures(ctx: MapContext, roomId: number, excludeNpcId?: EntityId): any[] {
    return (Object.values(vars.npcs ?? {}) as any[]).filter(
        (npc) =>
            npc &&
            npc.map === ctx.mapId &&
            String(npc.id) !== String(excludeNpcId ?? "") &&
            Number(npc.attackable ?? 1) !== 0 &&
            Number(npc.ephemeralSummon ?? 0) !== 1 &&
            !npc.owner &&
            ctx.index.mech.roomOf[coordKey(npc.pos.x, npc.pos.y)] === roomId,
    );
}

function lockRoom(ctx: MapContext, roomId: number) {
    const roomState = ctx.state.rooms.get(roomId);
    if (!roomState || roomState.locked) return;
    roomState.locked = true;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo === "sala" && barrier.salas.includes(roomId)) setBarrier(ctx, barrier, false);
    }
    const center = roomCenter(ctx, roomId);
    if (center) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.puertasCierran);
    tellRun(ctx.run, "¡Las puertas se cerraron! Derrotá a las criaturas de la sala para abrirlas.", "#FF6B3D");
}

// Sala vacía: se abren sus puertas y aparecen sus cofres ocultos.
function clearRoom(ctx: MapContext, roomId: number) {
    const roomState = ctx.state.rooms.get(roomId);
    if (!roomState || roomState.cleared) return;
    const wasLocked = roomState.locked;
    roomState.locked = false;
    roomState.cleared = true;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo !== "sala" || !barrier.salas.includes(roomId)) continue;
        if (barrier.salas.some((id) => ctx.state.rooms.get(id)?.locked)) continue;
        setBarrier(ctx, barrier, true);
    }
    let revealed = 0;
    for (const chest of ctx.index.mech.chests) {
        const key = coordKey(chest.x, chest.y);
        if (chest.sala !== roomId || !chest.oculto || ctx.state.revealedChests.has(key)) continue;
        ctx.state.revealedChests.add(key);
        setObject(ctx.mapId, chest.x, chest.y, OBJ.cofre);
        setBlocked(ctx.mapId, chest.x, chest.y, true);
        revealed++;
    }
    const center = roomCenter(ctx, roomId);
    if (center && wasLocked) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.puertaAbre);
    if (center && revealed) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.secreto);
    if (wasLocked) tellRun(ctx.run, "La sala quedó vacía: las puertas se abrieron.");
    if (revealed) tellRun(ctx.run, revealed === 1 ? "¡Apareció un cofre!" : `¡Aparecieron ${revealed} cofres!`);
    refreshRun(ctx.run);
}

function onRoomEnter(ctx: MapContext, roomId: number) {
    const room = ctx.index.rooms.get(roomId);
    const roomState = ctx.state.rooms.get(roomId);
    if (!room || !roomState || roomState.cleared || roomState.locked) return;
    if (roomCreatures(ctx, roomId).length > 0) {
        if (room.cierra) lockRoom(ctx, roomId);
        return;
    }
    if (room.cierra) clearRoom(ctx, roomId);
    else roomState.cleared = true;
}

// Daño del entorno (pozos y lava), en porcentaje de la vida máxima. Se puede morir.
function hurt(user: RuntimeCharacter, fraction: number, message: string, fx = 0) {
    const target = user as RuntimeCharacter & { hp?: number; maxHp?: number; dead?: boolean };
    if (target.dead) return;
    const game = getGame();
    const handleProtocol = getHandleProtocol();
    const damage = Math.max(1, Math.round(Number(target.maxHp ?? 0) * fraction));
    target.hp = Math.max(0, Number(target.hp ?? 0) - damage);
    areaClients(Number(user.map), user.pos, (client) => {
        handleProtocol.dialog(user.id, `-${damage}`, "", "#ff8a3d", 0, client);
        if (fx) handleProtocol.animFX(user.id, fx, client);
    });
    const client = vars.clients?.[user.id] as RuntimeClient | undefined;
    if (client) {
        handleProtocol.updateHP(target.hp, client);
        handleProtocol.console(`${message} -${damage}.`, "#ff8a3d", 1, 0, client);
    }
    if (target.hp <= 0) {
        game.putBodyAndHeadDead(user.id);
        void game.tirarItemsUser(user.id);
    }
}

// Placas: apretadas con un jugador o un bloque encima. Con todas apretadas se abren las puertas "=" del mapa.
function updatePlates(ctx: MapContext) {
    if (!ctx.index.plates.size) return;
    let allPressed = true;
    for (const key of ctx.index.plates) {
        const { x, y } = parseCoord(key);
        const hasBlock = ctx.state.blocks.has(key);
        const pressed = hasBlock || Boolean(playerAt(ctx.mapId, x, y));
        if (!pressed) allPressed = false;
        if (hasBlock) continue;
        const wanted = pressed || ctx.state.platesSolved ? OBJ.placaApretada : OBJ.placa;
        if (vars.mapa[ctx.mapId]?.[y]?.[x]?.objInfo?.objIndex !== wanted) setObject(ctx.mapId, x, y, wanted);
    }
    if (!allPressed || ctx.state.platesSolved) return;
    ctx.state.platesSolved = true;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo !== "placa") continue;
        setBarrier(ctx, barrier, true);
        playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
    }
    // El puzzle resuelto suena para los que están en la sala de las placas.
    const firstPlate = ctx.index.plates.values().next().value;
    if (firstPlate) playSoundAt(ctx.mapId, parseCoord(firstPlate), DUNGEON_SOUNDS.secreto);
    tellRun(ctx.run, "Se oye un mecanismo de piedra: una puerta se abrió.");
}

function isChestVisible(ctx: MapContext, chest: Chest) {
    return !chest.oculto || ctx.state.revealedChests.has(coordKey(chest.x, chest.y));
}

function spawnTrap(ctx: MapContext, chest: Chest) {
    const def = getDefinition(ctx.run.dungeonId);
    const LoadNpcs = require("./loadNpcs");
    const npcs = require("./npcs");
    const loader = new LoadNpcs();
    const factors = def ? scaleFactors(def, ctx.run.playerCount) : { vida: 1, dano: 1 };
    const spots = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [2, 0], [-2, 0], [0, -2]];
    let spawned = 0;
    for (const npcIndex of ctx.index.mech.trampa) {
        const spot = spots.find(([dx, dy]) => {
            const x = chest.x + dx;
            const y = chest.y + dy;
            return (
                ctx.index.mech.roomOf[coordKey(x, y)] === chest.sala &&
                !isOccupied(ctx.mapId, x, y) &&
                !vars.mapa[ctx.mapId]?.[y]?.[x]?.blocked &&
                !ctx.index.pits.has(coordKey(x, y))
            );
        });
        if (!spot) break;
        const x = chest.x + spot[0];
        const y = chest.y + spot[1];
        loader.createNpcInMap({ mapNum: ctx.mapId, x, y, npcIndex }, true, false, true);
        const npcId = vars.mapData[ctx.mapId]?.[y]?.[x]?.id;
        const npc = npcId ? vars.npcs?.[npcId] : undefined;
        if (!npc) continue;
        scaleNpc(npc, factors);
        makeDungeonWanderer(npc);
        registerSpecialNpc(ctx.run, npc);
        spawned++;
        npcs.loopArea(npc.id, (target: { id: EntityId; dead?: boolean }) => {
            if (!target.dead && !vars.areaNpc[npc.id].includes(target.id)) vars.areaNpc[npc.id].push(target.id);
            const client = vars.clients?.[target.id] as RuntimeClient | undefined;
            if (!client) return;
            getHandleProtocol().sendNpc(npc);
            require("./socket").send(client);
        });
    }
    return spawned;
}

function openChest(sessionId: EntityId, user: RuntimeCharacter, ctx: MapContext, chest: Chest) {
    const key = coordKey(chest.x, chest.y);
    ctx.state.openedChests.add(key);
    setObject(ctx.mapId, chest.x, chest.y, OBJ.cofreAbierto);
    const name = String(user.nameCharacter ?? "Alguien");
    const run = ctx.run;
    const chestSound: Record<string, number> = {
        llave: DUNGEON_SOUNDS.objeto,
        jefe: DUNGEON_SOUNDS.objeto,
        mapa: DUNGEON_SOUNDS.objeto,
        brujula: DUNGEON_SOUNDS.objeto,
        oro: DUNGEON_SOUNDS.oro,
        oroGrande: DUNGEON_SOUNDS.oro,
        premio: DUNGEON_SOUNDS.itemMazmorra,
        trofeo: DUNGEON_SOUNDS.itemMazmorra,
    };
    if (chestSound[chest.contenido]) playSoundAt(ctx.mapId, chest, chestSound[chest.contenido]);
    switch (chest.contenido) {
        case "llave": {
            const holder = characterKey(user);
            if (holder) run.keys.set(holder, (run.keys.get(holder) ?? 0) + 1);
            tellRun(run, `${name} encontró una llave chica.`);
            break;
        }
        case "jefe":
            run.bossKeyHolder = characterKey(user);
            tellRun(run, `${name} encontró la llave del jefe.`, "#FFD24A");
            break;
        case "mapa":
            run.hasMap = true;
            tellRun(run, `${name} encontró el mapa de la mazmorra.`);
            break;
        case "brujula":
            run.hasCompass = true;
            tellRun(run, `${name} encontró la brújula: marca los cofres y la puerta del jefe.`);
            break;
        case "oro":
        case "oroGrande": {
            const gold = Math.max(0, Math.round(chest.contenido === "oroGrande" ? Number(ctx.index.mech.oroGrande ?? 0) : ctx.index.mech.oro));
            const owner = user as RuntimeCharacter & { gold?: number };
            owner.gold = Number(owner.gold ?? 0) + gold;
            const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
            if (client) getHandleProtocol().actGold(owner.gold, client);
            tell(sessionId, `Encontraste ${gold} monedas de oro.`);
            break;
        }
        case "premio": {
            const item = getDefinition(run.dungeonId)?.itemMazmorra;
            if (!item) break;
            const progressStore = getProgressStore();
            for (const characterId of run.inside) {
                const progress = progressStore.getProgress({ _id: characterId }) as { dungeonItems?: string[] };
                progress.dungeonItems = [...new Set([...(progress.dungeonItems ?? []), item.id])];
                progressStore.saveProgress({ _id: characterId });
            }
            tellRun(run, `¡${name} encontró ${item.nombre}! Quedan para siempre en cada uno del grupo.`, "#FFD24A");
            break;
        }
        case "trofeo":
            claimBossReward(run);
            break;
        case "trampa": {
            const spawned = spawnTrap(ctx, chest);
            tellRun(run, spawned ? "¡Era una trampa!" : "El cofre estaba vacío.", spawned ? "#FF6B3D" : "white");
            if (spawned) {
                const roomState = ctx.state.rooms.get(chest.sala);
                if (roomState) roomState.cleared = false;
                lockRoom(ctx, chest.sala);
            }
            break;
        }
    }
    refreshRun(run);
}

function useBarrier(sessionId: EntityId, user: RuntimeCharacter, ctx: MapContext, barrier: Barrier) {
    if (ctx.state.openBarriers.has(coordKey(barrier.x, barrier.y))) return;
    const name = String(user.nameCharacter ?? "Alguien");
    const me = characterKey(user);
    const run = ctx.run;
    switch (barrier.tipo) {
        case "llave": {
            const own = me ? (run.keys.get(me) ?? 0) : 0;
            if (!me || own <= 0) {
                const holders = [...run.keys].filter(([, count]) => count > 0).map(([holder]) => run.names.get(holder) ?? "otro del grupo");
                return tell(
                    sessionId,
                    holders.length
                        ? `La puerta está cerrada con llave: la llave chica la tiene ${holders.join(" y ")}.`
                        : "La puerta está cerrada con llave: necesitás una llave chica.",
                    "white",
                );
            }
            if (own > 1) run.keys.set(me, own - 1);
            else run.keys.delete(me);
            setBarrier(ctx, barrier, true);
            playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
            tellRun(run, `${name} abrió una puerta con una llave chica.`);
            refreshRun(run);
            return;
        }
        case "jefe":
            if (!me || run.bossKeyHolder !== me) {
                const holder = run.bossKeyHolder ? (run.names.get(run.bossKeyHolder) ?? "otro del grupo") : null;
                return tell(
                    sessionId,
                    holder ? `Es la puerta del jefe: la llave la tiene ${holder}.` : "Es la puerta del jefe: necesitás la llave del jefe.",
                    "white",
                );
            }
            run.bossKeyHolder = null;
            setBarrier(ctx, barrier, true);
            playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
            tellRun(run, `${name} abrió la puerta del jefe.`, "#FFD24A");
            refreshRun(run);
            return;
        case "sala":
            return tell(sessionId, "La puerta está sellada mientras queden criaturas en la sala.", "white");
        case "placa":
            return tell(sessionId, "La puerta no tiene cerradura: algo en la sala tiene que abrirla.", "white");
        case "tiempo":
            return tell(sessionId, "La reja no tiene cerradura: una runa la abre por unos segundos.", "white");
        case "unica":
            return tell(sessionId, "Esta puerta solo se pasa desde el otro lado.", "white");
    }
}

// El bloque se corre una baldosa en la dirección del empujón, si del otro lado hay piso libre de la misma sala.
function pushBlock(sessionId: EntityId, user: RuntimeCharacter, ctx: MapContext, from: { x: number; y: number }) {
    const dx = from.x - user.pos.x;
    const dy = from.y - user.pos.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return tell(sessionId, "Ponete al lado del bloque para empujarlo.", "white");
    const to = { x: from.x + dx, y: from.y + dy };
    const toKey = coordKey(to.x, to.y);
    const tile = vars.mapa[ctx.mapId]?.[to.y]?.[to.x];
    const objIndex = Number(tile?.objInfo?.objIndex ?? 0);
    const free =
        tile &&
        ctx.index.mech.roomOf[toKey] !== undefined &&
        !tile.blocked &&
        !isOccupied(ctx.mapId, to.x, to.y) &&
        !ctx.index.pits.has(toKey) &&
        !ctx.index.lava.has(toKey) &&
        !ctx.index.lavaPeriodica.has(toKey) &&
        !getGame().hayAgua(ctx.mapId, to) &&
        (!objIndex || objIndex === OBJ.placa || objIndex === OBJ.placaApretada);
    if (!free) return tell(sessionId, "El bloque no se mueve para ese lado.", "white");
    const fromKey = coordKey(from.x, from.y);
    ctx.state.blocks.delete(fromKey);
    ctx.state.blocks.add(toKey);
    ctx.state.blockTrail.add(fromKey);
    ctx.state.blockTrail.add(toKey);
    setObject(ctx.mapId, from.x, from.y, 0);
    setBlocked(ctx.mapId, from.x, from.y, false);
    setObject(ctx.mapId, to.x, to.y, OBJ.bloque);
    setBlocked(ctx.mapId, to.x, to.y, true);
    updatePlates(ctx);
}

type ClickTarget =
    | { kind: "cofre"; chest: Chest }
    | { kind: "losa"; texto: string; x: number; y: number }
    | { kind: "puerta"; barrier: Barrier }
    | { kind: "bloque"; x: number; y: number };

// Lo que hay en una baldosa de mecánicas (los objetos altos se ven sobre las baldosas de arriba).
function clickTargetAt(ctx: MapContext, x: number, y: number): ClickTarget | null {
    const key = coordKey(x, y);
    const chest = ctx.index.chests.get(key);
    if (chest && isChestVisible(ctx, chest) && !ctx.state.openedChests.has(key)) return { kind: "cofre", chest };
    const slab = ctx.index.slabs.get(key);
    if (slab) return { kind: "losa", texto: slab.texto, x, y };
    const barrier = ctx.index.barriers.get(key);
    if (barrier && !ctx.state.openBarriers.has(key)) return { kind: "puerta", barrier };
    if (ctx.state.blocks.has(key)) return { kind: "bloque", x, y };
    return null;
}

const CLICK_OFFSETS = [[0, 0], [0, 1], [1, 0], [-1, 0], [1, 1], [-1, 1], [0, 2], [1, 2], [-1, 2]];

const chebyshev = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// Clic en el mapa adentro de una mazmorra: cofres, losas, puertas y bloques. Devuelve true si lo resolvió.
export function handleMapClick(ws: RuntimeClient, user: RuntimeCharacter, x: number, y: number): boolean {
    const ctx = contextOf(Number(user.map));
    if (!ctx) return false;
    let target: ClickTarget | null = null;
    for (const [dx, dy] of CLICK_OFFSETS) {
        target = clickTargetAt(ctx, x + dx, y + dy);
        if (target) break;
    }
    if (!target) return false;
    const sessionId = ws.id!;
    if ((user as { dead?: boolean }).dead) {
        tell(sessionId, "Los muertos no pueden hacer eso.", "white");
        return true;
    }
    switch (target.kind) {
        case "cofre":
            if (chebyshev(user.pos, target.chest) > CHEST_RANGE) tell(sessionId, "Acercate al cofre para abrirlo.", "white");
            else openChest(sessionId, user, ctx, target.chest);
            return true;
        case "losa":
            if (chebyshev(user.pos, target) > READ_RANGE) tell(sessionId, "Acercate a la losa para leerla.", "white");
            else sendState(sessionId, null, { texto: target.texto });
            return true;
        case "puerta":
            if (chebyshev(user.pos, target.barrier) > DOOR_RANGE) tell(sessionId, "Acercate a la puerta.", "white");
            else useBarrier(sessionId, user, ctx, target.barrier);
            return true;
        case "bloque":
            pushBlock(sessionId, user, ctx, target);
            return true;
    }
}

// Paso después de moverse: sala nueva, lava y placas.
export function afterStep(ws: RuntimeClient, user: RuntimeCharacter) {
    const ctx = contextOf(Number(user.map));
    const key = characterKey(user);
    if (!ctx || !key) return;
    const tileKey = coordKey(user.pos.x, user.pos.y);
    const roomId = ctx.index.mech.roomOf[tileKey];
    const previous = ctx.run.playerRoom.get(key);
    if (roomId !== undefined && (previous?.base !== ctx.base || previous.room !== roomId)) {
        ctx.run.playerRoom.set(key, { base: ctx.base, room: roomId, entry: { x: user.pos.x, y: user.pos.y } });
        const firstVisit = !ctx.state.visited.has(roomId);
        ctx.state.visited.add(roomId);
        onRoomEnter(ctx, roomId);
        if (firstVisit) refreshRun(ctx.run);
    }
    const now = Date.now();
    if (ctx.index.lava.has(tileKey)) {
        ctx.run.nextBurnAt.set(key, now + LAVA_BURN_MS);
        hurt(user, LAVA_DAMAGE, "La lava te quema:", LAVA_FX);
    } else if (ctx.run.lavaActive && ctx.index.lavaPeriodica.has(tileKey)) {
        ctx.run.nextBurnAt.set(key, now + LAVA_BURST_BURN_MS);
        hurt(user, LAVA_BURST_DAMAGE, "La erupción te quema:", LAVA_FX);
    }
    crumbleLater(ctx, tileKey);
    if (ctx.index.timedPlates.has(tileKey)) pressTimedPlate(ctx, tileKey);
    updatePlates(ctx);
}

// Caer a un pozo: daño y vuelta a la entrada de la sala. Devuelve true si el paso terminó ahí.
function stepIntoPit(ws: RuntimeClient, user: RuntimeCharacter, ctx: MapContext, x: number, y: number): boolean {
    const key = coordKey(x, y);
    if ((!ctx.index.pits.has(key) && !ctx.state.collapsed.has(key)) || (user as { dead?: boolean }).dead) return false;
    fallIntoPit(ws, user, ctx);
    return true;
}

// Agua profunda: solo se nada con las Patas de rana.
export function canSwim(user: RuntimeCharacter | undefined): boolean {
    const key = characterKey(user);
    return Boolean(key && user && isDungeonInstanceMap(user.map) && hasDungeonItem(key, SWIM_ITEM));
}

const lastWaterMessageAt = new Map<string, number>();

export function getWaterStepDeniedReason(user: RuntimeCharacter, destinationIsWater: boolean): string | null {
    if (!destinationIsWater || canSwim(user)) return null;
    const key = characterKey(user) ?? String(user.id);
    const now = Date.now();
    if (now - (lastWaterMessageAt.get(key) ?? 0) < WATER_MESSAGE_MS) return "";
    lastWaterMessageAt.set(key, now);
    return "El agua es muy profunda: necesitás las Patas de rana.";
}

// Nadando no se pelea.
export function getSwimBlockReason(user: RuntimeCharacter | undefined): string | null {
    if (!user || !isDungeonInstanceMap(user.map)) return null;
    return getGame().hayAgua(Number(user.map), user.pos) ? "Nadando no podés atacar ni lanzar hechizos." : null;
}

// Bloqueo actual de las baldosas que cambian en la corrida (para la foto del área), o null si la baldosa no cambia.
export function getDynamicBlocked(mapId: number, x: number, y: number): number | null {
    if (!runByInstanceMap.has(mapId)) return null;
    const ctx = contextOf(mapId);
    if (!ctx) return null;
    const key = coordKey(x, y);
    if (!ctx.index.dynamic.has(key) && !ctx.state.blockTrail.has(key)) return null;
    return vars.mapa[mapId]?.[y]?.[x]?.blocked ? 1 : 0;
}

function sendLavaBurst(ctx: MapContext) {
    if (!ctx.index.lavaPeriodica.size) return;
    const tiles = [...ctx.index.lavaPeriodica].map(parseCoord);
    const fxGrh = Number(vars.datSpell?.[LAVA_BURST_FX]?.fxGrh ?? 0);
    if (!fxGrh) return;
    const handleProtocol = getHandleProtocol();
    for (const user of playersInside(ctx.run)) {
        if (Number(user.map) !== ctx.mapId) continue;
        const client = vars.clients?.[user.id] as RuntimeClient | undefined;
        if (client) handleProtocol.areaSpellFx({ map: ctx.mapId, x: tiles[0].x, y: tiles[0].y, aoe: 0, fxGrh, soundId: 0, tiles }, client);
    }
}

function tickRun(run: DungeonRun) {
    if (!runs.has(run.id)) return;
    const now = Date.now();
    const active = (now - run.createdAt) % LAVA_CYCLE_MS < LAVA_ACTIVE_MS;
    const starting = active && !run.lavaActive;
    run.lavaActive = active;
    for (const mapId of Object.values(run.maps)) {
        const ctx = contextOf(mapId);
        if (!ctx) continue;
        if (starting) sendLavaBurst(ctx);
        // Puertas que tenían a alguien encima cuando se tenían que cerrar.
        for (const key of [...ctx.state.pendingClose]) {
            const barrier = ctx.index.barriers.get(key);
            const stillLocked = barrier?.salas.some((id) => ctx.state.rooms.get(id)?.locked);
            if (!barrier || !stillLocked) ctx.state.pendingClose.delete(key);
            else setBarrier(ctx, barrier, false);
        }
        if (ctx.state.timedUntil && now >= ctx.state.timedUntil) closeTimedDoors(ctx);
        for (const [key, restoreAt] of [...ctx.state.collapsed]) {
            if (now < restoreAt || isOccupied(ctx.mapId, parseCoord(key).x, parseCoord(key).y)) continue;
            ctx.state.collapsed.delete(key);
            const { x, y } = parseCoord(key);
            setObject(ctx.mapId, x, y, OBJ.pisoRajado);
        }
    }
    updateCrushers(run, now);
    updateFloatingBoss(run, now);
    for (const user of playersInside(run)) {
        const key = characterKey(user);
        const ctx = contextOf(Number(user.map));
        if (!key || !ctx || (user as { dead?: boolean }).dead) continue;
        const tileKey = coordKey(user.pos.x, user.pos.y);
        if (now < (run.nextBurnAt.get(key) ?? 0)) continue;
        if (ctx.index.lava.has(tileKey)) {
            run.nextBurnAt.set(key, now + LAVA_BURN_MS);
            hurt(user, LAVA_DAMAGE, "La lava te quema:", LAVA_FX);
        } else if (active && ctx.index.lavaPeriodica.has(tileKey)) {
            run.nextBurnAt.set(key, now + LAVA_BURST_BURN_MS);
            hurt(user, LAVA_BURST_DAMAGE, "La erupción te quema:", LAVA_FX);
        }
    }
}

// --- Caverna de las Llaves: el piso para la Carrera y el salto, cristales, piso que se desmorona, placas con
// tiempo, aplastadores, puertas de un solo sentido, estatuas que despiertan, criaturas en pareja y el jefe que flota ---

export function characterHasDungeonItem(user: RuntimeCharacter | undefined, itemId: string): boolean {
    const key = characterKey(user);
    return Boolean(key && hasDungeonItem(key, itemId));
}

const inBounds = (x: number, y: number) => x >= 1 && y >= 1 && x <= 100 && y <= 100;

// Pozos, lava, aplastadores y piso caído: lo que se salta con la pluma (y frena la Carrera).
export function isHazard(mapId: number, x: number, y: number): boolean {
    const ctx = contextOf(mapId);
    if (!ctx) return false;
    const key = coordKey(x, y);
    return (
        ctx.index.pits.has(key) ||
        ctx.index.lava.has(key) ||
        ctx.index.lavaPeriodica.has(key) ||
        ctx.index.crushers.has(key) ||
        ctx.state.collapsed.has(key)
    );
}

// Se pasa por encima saltando todo lo que no está bloqueado: pozos, lava, agua, criaturas o piso.
export function isJumpable(mapId: number, x: number, y: number): boolean {
    return inBounds(x, y) && Boolean(vars.mapa[mapId]?.[y]?.[x]) && !vars.mapa[mapId][y][x].blocked;
}

export function isSafeLanding(mapId: number, x: number, y: number, ignoreId?: EntityId): boolean {
    if (!isJumpable(mapId, x, y) || isHazard(mapId, x, y) || getGame().hayAgua(mapId, { x, y })) return false;
    const occupant = vars.mapData[mapId]?.[y]?.[x]?.id;
    return !occupant || String(occupant) === String(ignoreId ?? "");
}

// Lo que la Carrera no frena: los cristales se rompen al pasar. Las paredes rajadas tiemblan al chocarlas.
export function getDashObstacle(mapId: number, x: number, y: number): "cristal" | "pared" | null {
    const ctx = contextOf(mapId);
    if (!ctx) return null;
    const key = coordKey(x, y);
    if (ctx.index.crystals.has(key) && !ctx.state.brokenCrystals.has(key)) return "cristal";
    if (ctx.index.crackedWalls.has(key)) return "pared";
    return null;
}

export function breakCrystal(mapId: number, x: number, y: number) {
    const ctx = contextOf(mapId);
    const key = coordKey(x, y);
    if (!ctx || !ctx.index.crystals.has(key) || ctx.state.brokenCrystals.has(key)) return;
    ctx.state.brokenCrystals.add(key);
    setObject(mapId, x, y, 0);
    setBlocked(mapId, x, y, false);
    playSoundAt(mapId, { x, y }, DUNGEON_SOUNDS.cristal);
}

// La Carrera se estrella contra una pared rajada: tiembla, y si en el mapa flota un jefe, se cae aturdido.
export function onDashImpact(ws: RuntimeClient, user: RuntimeCharacter, x: number, y: number) {
    const ctx = contextOf(Number(user.map));
    if (!ctx) return;
    playSoundAt(ctx.mapId, { x, y }, DUNGEON_SOUNDS.golpe);
    const boss = ctx.run.floatingBoss;
    const npc = boss ? vars.npcs?.[boss.npcId] : undefined;
    if (!boss || !npc || npc.map !== ctx.mapId || boss.split) return;
    boss.stunnedUntil = Date.now() + BOSS_STUN_MS;
    npc.paralizado = true;
    tellRun(ctx.run, `¡${npc.nameCharacter} cayó con el temblor! Es el momento de pegarle.`, "#FFD24A");
    void ws;
}

// El jefe que flota no recibe daño hasta que lo bajan. Una estatua dormida se despierta al primer golpe.
export function getNpcInvulnerableReason(npc: { id?: EntityId; map?: number; dormant?: boolean; nameCharacter?: string } | undefined): string | null {
    if (!npc || !isDungeonInstanceMap(npc.map)) return null;
    if (npc.dormant) npc.dormant = false;
    const boss = runOfMap(Number(npc.map))?.floatingBoss;
    if (boss && boss.npcId === String(npc.id) && Date.now() >= boss.stunnedUntil) {
        return `${npc.nameCharacter ?? "El jefe"} flota fuera de tu alcance: hacelo caer.`;
    }
    return null;
}

// Puertas de un solo sentido: se entra y se sale de la baldosa de la puerta solo en su dirección.
const DIR_OFFSET = { norte: { x: 0, y: -1 }, sur: { x: 0, y: 1 }, este: { x: 1, y: 0 }, oeste: { x: -1, y: 0 } } as const;

export function canPassOneWay(mapId: number, from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    const ctx = contextOf(mapId);
    if (!ctx) return true;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    for (const tile of [to, from]) {
        const barrier = ctx.index.barriers.get(coordKey(tile.x, tile.y));
        if (barrier?.tipo !== "unica" || !barrier.dir) continue;
        const allowed = DIR_OFFSET[barrier.dir];
        if (allowed.x !== dx || allowed.y !== dy) return false;
    }
    return true;
}

export function getOneWayDeniedReason(user: RuntimeCharacter, x: number, y: number): string | null {
    if (!isDungeonInstanceMap(user.map)) return null;
    return canPassOneWay(Number(user.map), user.pos, { x, y }) ? null : "Esta puerta solo se pasa desde el otro lado.";
}

// Al caer a un pozo (o a un piso que se cayó): daño y vuelta a la entrada de la sala.
function fallIntoPit(ws: RuntimeClient, user: RuntimeCharacter, ctx: MapContext) {
    const key = characterKey(user);
    const room = key ? ctx.run.playerRoom.get(key) : undefined;
    const back = room && room.base === ctx.base ? room.entry : { x: user.pos.x, y: user.pos.y };
    const game = getGame();
    hurt(user, PIT_DAMAGE, "Caíste a un pozo:");
    if ((user as { dead?: boolean }).dead) {
        game.telep(ws, ctx.mapId, user.pos.x, user.pos.y, "dungeon.pozo");
        return;
    }
    const landing = game.getFreeSpace(ws, ctx.mapId, back.x, back.y, "dungeon.pozo") ?? back;
    game.telep(ws, ctx.mapId, landing.x, landing.y, "dungeon.pozo");
}

// Piso que se desmorona: se cae un instante después de pisarlo (corriendo o saltando se pasa antes).
function crumbleLater(ctx: MapContext, key: string) {
    if (!ctx.index.fragile.has(key) || ctx.state.collapsed.has(key) || ctx.state.crumbling.has(key)) return;
    ctx.state.crumbling.set(key, Date.now() + CRUMBLE_DELAY_MS);
    setTimeout(() => {
        if (!runs.has(ctx.run.id)) return;
        ctx.state.crumbling.delete(key);
        ctx.state.collapsed.set(key, Date.now() + CRUMBLE_RESTORE_MS);
        const { x, y } = parseCoord(key);
        setObject(ctx.mapId, x, y, OBJ.hueco);
        playSoundAt(ctx.mapId, { x, y }, DUNGEON_SOUNDS.derrumbe);
        const user = playerAt(ctx.mapId, x, y) as (RuntimeCharacter & { dungeonMotion?: { tipo: string; until: number } | null }) | null;
        const airborne = user?.dungeonMotion && user.dungeonMotion.until > Date.now();
        const client = user ? (vars.clients?.[user.id] as RuntimeClient | undefined) : undefined;
        if (user && client && !airborne && !(user as { dead?: boolean }).dead) fallIntoPit(client, user, ctx);
    }, CRUMBLE_DELAY_MS);
}

// Placa con tiempo: abre las puertas con tiempo del mapa por unos segundos.
function pressTimedPlate(ctx: MapContext, key: string) {
    const { x, y } = parseCoord(key);
    const wasClosed = ctx.state.timedUntil === 0;
    ctx.state.timedUntil = Date.now() + TIMED_DOOR_MS;
    setObject(ctx.mapId, x, y, OBJ.runaTiempoEncendida);
    if (!wasClosed) return;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo !== "tiempo") continue;
        setBarrier(ctx, barrier, true);
        playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
    }
    tellRun(ctx.run, "La runa se encendió: una reja se abrió por unos segundos.");
}

function closeTimedDoors(ctx: MapContext) {
    let pending = false;
    for (const barrier of ctx.index.mech.barriers) {
        const key = coordKey(barrier.x, barrier.y);
        if (barrier.tipo !== "tiempo" || !ctx.state.openBarriers.has(key)) continue;
        if (isOccupied(ctx.mapId, barrier.x, barrier.y)) {
            pending = true;
            continue;
        }
        setBarrier(ctx, barrier, false);
        playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertasCierran);
    }
    if (pending) return;
    ctx.state.timedUntil = 0;
    for (const key of ctx.index.timedPlates) {
        const { x, y } = parseCoord(key);
        setObject(ctx.mapId, x, y, OBJ.runaTiempo);
    }
}

// Aplastadores: bajan a la vez en toda la corrida.
function updateCrushers(run: DungeonRun, now: number) {
    const down = (now - run.createdAt) % CRUSHER_CYCLE_MS < CRUSHER_DOWN_MS;
    if (down === run.crusherDown) return;
    run.crusherDown = down;
    for (const mapId of Object.values(run.maps)) {
        const ctx = contextOf(mapId);
        if (!ctx || !ctx.index.crushers.size) continue;
        const watched = playersInside(run).some((user) => Number(user.map) === mapId);
        if (!watched) continue;
        for (const key of ctx.index.crushers) {
            const { x, y } = parseCoord(key);
            setObject(mapId, x, y, down ? OBJ.aplastador : OBJ.losaAplastador);
            if (!down) continue;
            const user = playerAt(mapId, x, y);
            if (user) hurt(user, CRUSHER_DAMAGE, "Te agarró un aplastador:");
        }
        if (down) {
            const first = parseCoord(ctx.index.crushers.values().next().value!);
            playSoundAt(mapId, first, DUNGEON_SOUNDS.aplastador);
        }
    }
}

// --- Criaturas especiales (las marca su plantilla en npcs.json) ---
// despierta: quieta hasta que alguien se acerca. pareja: grupo; si muere una y otra sigue viva, la revive a los
// revivirMs. flota: el jefe que flota hasta que lo bajan con la Carrera; al llegar a la mitad de la vida se divide
// en `divide.cantidad` criaturas `divide.npc`.
type SpecialTemplate = {
    despierta?: number;
    pareja?: string;
    revivirMs?: number;
    flota?: boolean;
    divide?: { npc: number; cantidad: number };
};

function templateOf(npc: { templateNpcIndex?: number } | undefined): SpecialTemplate {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

function registerSpecialNpc(run: DungeonRun, npc: any) {
    const template = templateOf(npc);
    if (template.despierta) npc.dormant = true;
    if (template.pareja) {
        const group = run.pairs.get(template.pareja) ?? new Set<string>();
        group.add(String(npc.id));
        run.pairs.set(template.pareja, group);
        npc.pairGroup = template.pareja;
    }
    if (template.flota) run.floatingBoss = { npcId: String(npc.id), stunnedUntil: 0, split: false };
}

// Una criatura nueva cerca de (x, y), en la misma sala, con el escalado del grupo; la ven los que están cerca.
function spawnDungeonNpc(ctx: MapContext, npcIndex: number, near: { x: number; y: number }, roomId: number | undefined): any | null {
    const def = getDefinition(ctx.run.dungeonId);
    const LoadNpcs = require("./loadNpcs");
    const npcs = require("./npcs");
    const factors = def ? scaleFactors(def, ctx.run.playerCount) : { vida: 1, dano: 1 };
    const spots = [[0, 0], [0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1], [0, 2], [2, 0], [-2, 0], [0, -2]];
    const spot = spots.find(([dx, dy]) => {
        const x = near.x + dx;
        const y = near.y + dy;
        return (
            (roomId === undefined || ctx.index.mech.roomOf[coordKey(x, y)] === roomId) &&
            !isOccupied(ctx.mapId, x, y) &&
            !vars.mapa[ctx.mapId]?.[y]?.[x]?.blocked &&
            !isHazard(ctx.mapId, x, y)
        );
    });
    if (!spot) return null;
    const x = near.x + spot[0];
    const y = near.y + spot[1];
    new LoadNpcs().createNpcInMap({ mapNum: ctx.mapId, x, y, npcIndex }, true, false, true);
    const npcId = vars.mapData[ctx.mapId]?.[y]?.[x]?.id;
    const npc = npcId ? vars.npcs?.[npcId] : undefined;
    if (!npc) return null;
    scaleNpc(npc, factors);
    makeDungeonWanderer(npc);
    registerSpecialNpc(ctx.run, npc);
    npcs.loopArea(npc.id, (target: { id: EntityId; dead?: boolean }) => {
        if (!target.dead && !vars.areaNpc[npc.id].includes(target.id)) vars.areaNpc[npc.id].push(target.id);
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (!client) return;
        getHandleProtocol().sendNpc(npc);
        require("./socket").send(client);
    });
    return npc;
}

// Saca una criatura sin que cuente como muerta (el jefe que se divide).
function despawnNpc(npc: any) {
    const handleProtocol = getHandleProtocol();
    require("./npcs").loopArea(npc.id, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) handleProtocol.deleteCharacter(npc.id, client);
    });
    if (String(vars.mapData[npc.map]?.[npc.pos.y]?.[npc.pos.x]?.id) === String(npc.id)) vars.mapData[npc.map][npc.pos.y][npc.pos.x].id = 0;
    delete vars.npcs[npc.id];
    delete vars.areaNpc[npc.id];
}

function updateFloatingBoss(run: DungeonRun, now: number) {
    const boss = run.floatingBoss;
    if (!boss || boss.split) return;
    const npc = vars.npcs?.[boss.npcId];
    if (!npc) {
        run.floatingBoss = null;
        return;
    }
    if (boss.stunnedUntil && now >= boss.stunnedUntil) {
        boss.stunnedUntil = 0;
        npc.paralizado = false;
        tellRun(run, `${npc.nameCharacter} vuelve a flotar.`);
    }
    const template = templateOf(npc);
    if (!template.divide || Number(npc.hp ?? 0) > Number(npc.maxHp ?? 0) / 2) return;
    const ctx = contextOf(Number(npc.map));
    if (!ctx) return;
    boss.split = true;
    despawnNpc(npc);
    splitFloatingBoss(ctx, npc, template.divide);
}

// Se parte donde estaba. También al morir: un golpe enorme lo puede bajar de más de la mitad a cero de una.
function splitFloatingBoss(ctx: MapContext, npc: any, divide: { npc: number; cantidad: number }) {
    const at = { x: npc.pos.x, y: npc.pos.y };
    const roomId = ctx.index.mech.roomOf[coordKey(at.x, at.y)];
    for (let i = 0; i < divide.cantidad; i++) spawnDungeonNpc(ctx, divide.npc, at, roomId);
    ctx.run.floatingBoss = null;
    playSoundAt(ctx.mapId, at, DUNGEON_SOUNDS.secreto);
    tellRun(ctx.run, `¡${npc.nameCharacter} se partió en ${divide.cantidad}! Bajalos juntos: el que queda revive al otro.`, "#FF6B3D");
}

// Muere una criatura en pareja: si queda otra viva, a los revivirMs la revive (salvo que caigan todas antes).
function onPairDied(ctx: MapContext, npc: any) {
    const group = npc.pairGroup ? ctx.run.pairs.get(npc.pairGroup) : undefined;
    if (!group) return;
    group.delete(String(npc.id));
    if (group.size === 0) return;
    const template = templateOf(npc);
    const delay = Number(template.revivirMs ?? 15_000);
    for (const id of group) {
        const partner = vars.npcs?.[id];
        if (partner) partner.enraged = true;
    }
    tellRun(ctx.run, `¡Cuidado! Si no cae su pareja, ${npc.nameCharacter} vuelve en ${Math.round(delay / 1000)} s.`, "#FF6B3D");
    const npcIndex = Number(npc.templateNpcIndex ?? 0);
    const spawnAt = { x: Number(npc.spawnOrigin?.x ?? npc.pos.x), y: Number(npc.spawnOrigin?.y ?? npc.pos.y) };
    const roomId = ctx.index.mech.roomOf[coordKey(npc.pos.x, npc.pos.y)];
    setTimeout(() => {
        if (!runs.has(ctx.run.id)) return;
        const alive = ctx.run.pairs.get(npc.pairGroup);
        if (!alive || alive.size === 0) return;
        const revived = spawnDungeonNpc(ctx, npcIndex, spawnAt, roomId);
        if (revived) tellRun(ctx.run, `¡${revived.nameCharacter} volvió!`, "#FF6B3D");
    }, delay);
}

// Despierta a una estatua si hay un jugador cerca. Devuelve true si está despierta.
export function wakeIfPlayerNear(npc: any): boolean {
    if (!npc?.dormant) return true;
    if (!isWatchedDungeonNpc(npc)) return false;
    const near = (watchersCache.byMap.get(Number(npc.map)) ?? []).some(
        (pos) => Math.max(Math.abs(pos.x - npc.pos.x), Math.abs(pos.y - npc.pos.y)) <= WAKE_RADIUS,
    );
    if (!near) return false;
    npc.dormant = false;
    playSoundAt(Number(npc.map), npc.pos, DUNGEON_SOUNDS.puertasCierran);
    return true;
}

// Cofre del jefe: el trofeo de la serie y el oro, una vez por día por personaje.
function claimBossReward(run: DungeonRun) {
    const def = getDefinition(run.dungeonId);
    const progressStore = getProgressStore();
    const today = new Date().toISOString().slice(0, 10);
    const gold = Math.max(0, Number(def?.oroJefe ?? 0));
    for (const user of playersInside(run)) {
        const key = characterKey(user);
        if (!key) continue;
        const progress = progressStore.getProgress({ _id: key }) as { dungeonRewards?: Record<string, string>; trofeos?: string[] };
        progress.dungeonRewards ??= {};
        if (progress.dungeonRewards[run.dungeonId] === today) {
            tell(user.id, "Ya cobraste la recompensa de esta mazmorra hoy: vuelve mañana.", "white");
            continue;
        }
        progress.dungeonRewards[run.dungeonId] = today;
        if (def?.trofeo) progress.trofeos = [...new Set([...(progress.trofeos ?? []), def.trofeo.id])];
        progressStore.saveProgress({ _id: key });
        if (gold) {
            const owner = user as RuntimeCharacter & { gold?: number };
            owner.gold = Number(owner.gold ?? 0) + gold;
            const client = vars.clients?.[user.id] as RuntimeClient | undefined;
            if (client) getHandleProtocol().actGold(owner.gold, client);
        }
        tell(user.id, `${def?.trofeo ? `Ganaste ${def.trofeo.nombre}` : "Ganaste la recompensa"}${gold ? ` y ${gold} monedas de oro` : ""}.`, "#FFD24A");
    }
}

// Ítems de mazmorra que conoce el juego, para la franja y el comando de GM.
const DUNGEON_ITEMS: Record<string, { nombre: string; accion: "carrera" | "salto" | null }> = {
    patas_de_rana: { nombre: "Patas de rana", accion: null },
    pluma: { nombre: "Pluma de Roc", accion: "salto" },
    botas_de_pegaso: { nombre: "Botas de Pegaso", accion: "carrera" },
};

function ownedDungeonItems(characterId: string) {
    const progress = getProgressStore().getProgress({ _id: characterId }) as { dungeonItems?: string[] };
    return (progress.dungeonItems ?? [])
        .filter((id) => DUNGEON_ITEMS[id])
        .map((id) => ({ id, nombre: DUNGEON_ITEMS[id].nombre, accion: DUNGEON_ITEMS[id].accion }));
}

// /mazmorra item <id> [quitar]: para que un GM pruebe con los ítems de mazmorra.
function grantItemCommand(sessionId: EntityId, itemId: string, remove: boolean) {
    const user = vars.personajes?.[sessionId] as (RuntimeCharacter & { privileges?: number }) | undefined;
    const key = characterKey(user);
    if (!user || !key || Number(user.privileges ?? 0) !== 1) return tell(sessionId, "Solo un GM puede darse ítems de mazmorra.", "white");
    if (!DUNGEON_ITEMS[itemId]) return tell(sessionId, `Ítems: ${Object.keys(DUNGEON_ITEMS).join(", ")}.`, "white");
    const progressStore = getProgressStore();
    const progress = progressStore.getProgress({ _id: key }) as { dungeonItems?: string[] };
    const items = new Set(progress.dungeonItems ?? []);
    if (remove) items.delete(itemId);
    else items.add(itemId);
    progress.dungeonItems = [...items];
    progressStore.saveProgress({ _id: key });
    tell(sessionId, `${remove ? "Sacaste" : "Te diste"} ${DUNGEON_ITEMS[itemId].nombre}.`, "white");
    sendState(sessionId);
}

// --- Enganches con el resto del server ---

// Cada paso adentro, antes de moverse: los pozos, el portal de salida (saca de la mazmorra) y las escaleras (llevan
// a la instancia del otro mapa). Devuelve true si el paso ya quedó resuelto.
export function handleStep(ws: RuntimeClient, user: RuntimeCharacter, x: number, y: number): boolean {
    const run = runOfMap(Number(user.map));
    if (!run) return false;
    const def = getDefinition(run.dungeonId);
    const baseMap = baseMapOf(Number(user.map));
    if (!def || baseMap === null) return false;
    const ctx = contextOf(Number(user.map));
    if (ctx && stepIntoPit(ws, user, ctx, x, y)) return true;
    if (def.salidas.some((exit) => exit.map === baseMap && exit.x === x && exit.y === y)) {
        leaveRun(ws.id!, "Saliste de la mazmorra.");
        return true;
    }
    const tileExit = vars.mapa[user.map]?.[y]?.[x]?.tileExit;
    const destination = tileExit && typeof tileExit === "object" ? (tileExit.destinations?.[0] ?? tileExit) : null;
    if (!destination) return false;
    const targetMap = run.maps[Number(destination.map)];
    if (!targetMap) return true;
    const game = getGame();
    const landing = game.getFreeSpace(ws, targetMap, Number(destination.x), Number(destination.y), "dungeon.escalera") ?? destination;
    game.telep(ws, targetMap, landing.x, landing.y, "dungeon.escalera");
    // El minimapa pasa al otro mapa.
    sendState(ws.id!);
    return true;
}

// Al desconectarse adentro sigue en la corrida, pero sus llaves pasan a otro para que el grupo pueda seguir.
export function onDisconnect(user: RuntimeCharacter | undefined) {
    const run = runOfUser(user);
    const key = characterKey(user);
    if (user && run && key && run.inside.has(key)) passKeysOf(run, key, "se desconectó", user.id);
}

// Al entrar al juego adentro de una corrida: el cartel, la franja de la mazmorra y el minimapa.
export function sendLoginState(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    if (user && isDungeonInstanceMap(user.map)) sendState(sessionId);
}

// Salir de la party (o que te echen) te expulsa. Al desconectarse el server también te saca de la party: eso no
// expulsa, así podés volver.
export function onLeftParty(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as (RuntimeCharacter & { connected?: boolean }) | undefined;
    if (!user || user.connected === false) return;
    const run = runOfUser(user);
    if (!run?.group) return;
    leaveRun(sessionId, "Saliste de la party: quedaste fuera de la mazmorra.");
}

// Al entrar al juego: si se había desconectado adentro, vuelve a su corrida; si ya no existe, aparece junto a la
// piedra. Devuelve la posición donde tiene que aparecer, o null si no cambia nada.
export function resolveLoginLocation(character: { _id?: unknown; map?: number; posX?: number; posY?: number }) {
    const mapId = Number(character.map ?? 0);
    const baseMap = isDungeonBaseMap(mapId) ? mapId : baseMapOf(mapId);
    if (!baseMap || !isDungeonBaseMap(baseMap)) return null;
    const key = character._id ? String(character._id) : null;
    const runId = key ? runByCharacter.get(key) : undefined;
    const run = runId ? runs.get(runId) : undefined;
    if (run && run.maps[baseMap] && key && run.inside.has(key)) {
        run.emptySince = null;
        return { map: run.maps[baseMap], x: Number(character.posX ?? 50), y: Number(character.posY ?? 50) };
    }
    const def = loadDefinitions().find((entry) => entry.mapas.includes(baseMap));
    if (key && runId) runByCharacter.delete(key);
    return def ? { map: def.regreso.map, x: def.regreso.x, y: def.regreso.y } : { map: 1, x: 50, y: 50 };
}

// Muere una criatura: en las mazmorras no reaparece, y si era la última de una sala cerrada, la sala se abre.
// Devuelve true si la criatura era de una mazmorra.
export function onNpcDied(npc: { id?: EntityId; map?: number; templateNpcIndex?: number }): boolean {
    if (!isDungeonInstanceMap(npc.map)) return false;
    const ctx = contextOf(Number(npc.map));
    if (!ctx) return true;
    onPairDied(ctx, npc);
    const boss = ctx.run.floatingBoss;
    if (boss?.npcId === String(npc.id)) {
        ctx.run.floatingBoss = null;
        const divide = templateOf(npc).divide;
        if (divide && !boss.split) splitFloatingBoss(ctx, npc, divide);
    }
    for (const [roomId, roomState] of ctx.state.rooms) {
        if (roomState.locked && roomCreatures(ctx, roomId, npc.id).length === 0) clearRoom(ctx, roomId);
    }
    return true;
}

function ensureSweep() {
    if (sweepTimer) return;
    sweepTimer = setInterval(() => {
        const now = Date.now();
        for (const run of [...runs.values()]) {
            if (playersInside(run).length > 0) {
                run.emptySince = null;
                continue;
            }
            if (run.inside.size === 0) {
                destroyRun(run);
                continue;
            }
            run.emptySince ??= now;
            if (now - run.emptySince >= EMPTY_RUN_TTL_MS) destroyRun(run);
        }
        if (runs.size === 0 && sweepTimer) {
            clearInterval(sweepTimer);
            sweepTimer = null;
        }
    }, SWEEP_MS);
    sweepTimer.unref?.();
}

// Para las pruebas.
export function _resetForTests() {
    for (const run of [...runs.values()]) destroyRun(run);
    definitions = null;
    mechanicsCache.clear();
}

module.exports = {
    loadDefinitions,
    getDefinition,
    getDungeonBaseMaps,
    instanceMapId,
    baseMapOf,
    scaleFactors,
    findFreeSlot,
    isDungeonInstanceMap,
    isDungeonBaseMap,
    getAttackDeniedReason,
    developmentLockReason,
    isWatchedDungeonNpc,
    playDungeonSound,
    characterHasDungeonItem,
    isHazard,
    isJumpable,
    isSafeLanding,
    getDashObstacle,
    breakCrystal,
    onDashImpact,
    getNpcInvulnerableReason,
    canPassOneWay,
    getOneWayDeniedReason,
    wakeIfPlayerNear,
    DUNGEON_SOUNDS,
    handleNpcInteraction,
    handleCommand,
    enter,
    acceptInvite,
    declineInvite,
    leaveRun,
    handleStep,
    afterStep,
    handleMapClick,
    canSwim,
    getWaterStepDeniedReason,
    getSwimBlockReason,
    getDynamicBlocked,
    onLeftParty,
    resolveLoginLocation,
    sendLoginState,
    onDisconnect,
    onNpcDied,
    handOverKeys,
    SWIM_ITEM,
    _resetForTests,
};
