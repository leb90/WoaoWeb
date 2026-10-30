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
    rodillo: 1851,
    vasija: 1852,
    piedra: 1853,
    hielo: 1854,
    poste: 1855,
    antorchaApagada: 1856,
    antorchaEncendida: 1857,
    paredBombeable: 1858,
    rocas: 1859,
    piedraPesada: 1860,
    buho: 1861,
    bloqueAzul: 1862,
    bloqueAzulBajo: 1863,
    bloqueNaranja: 1864,
    bloqueNaranjaBajo: 1865,
    cristalAzul: 1866,
    cristalNaranja: 1867,
    remolino: 1868,
    estatuaPesada: 1870,
    cabezaParada: 1871,
    cabezaAcostada: 1872,
    pozoAbierto: 1874,
    // La botella del Genio de la Gruta de la Botella: no está en el mapa, es lo que se ve al levantarla y tirarla.
    botellaGenio: 1869,
    // La bola de hierro del Machacador (dungeonShrineBosses.ts): tampoco está en el mapa ni en objs.json; el cliente
    // la dibuja (engine/dungeonShrineBosses.ts) cuando se lleva y se tira.
    bolaDeHierro: 1881,
    // Fauces del Bagre (dungeonMaw.ts).
    ancla: 1882,
    pisoFlojo: 1883,
    cristalGolpe: 1884,
    cabezaDragon: 1885,
    puente: 1886,
    puenteHorizontal: 1890,
    // Torre del Águila (dungeonTower.ts): los pilares que tira el Orbe, el Orbe en el piso y el ojo de piedra roto.
    pilar: 1891,
    pilarRoto: 1892,
    orbe: 1893,
    ojoRoto: 1894,
} as const;
// Portal azul (escaleras que se ven como portal: el atajo de la Cueva de la Cola).
const PORTAL_OBJ = 378;
// Patas de rana: con ellas se nada por el agua profunda de las mazmorras.
export const SWIM_ITEM = "patas_de_rana";
const HAZARD_TICK_MS = 250;
// Las trampas con movimiento propio y el Ciempiés (dungeonHazards.ts y dungeonBoss.ts) se mueven más seguido.
const FAST_TICK_MS = 50;
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
    // Música (frontend/public/music/mazmorras): tres temas que suenan en bucle, uno detrás del otro, y el de la pelea
    // con el jefe o un minijefe.
    musica?: { pistas: string[]; combate?: string };
};

// --- Mecánicas: datos fijos de cada mapa base ---
type Barrier = {
    x: number;
    y: number;
    tipo: "llave" | "jefe" | "sala" | "placa" | "tiempo" | "unica" | "bomba" | "golpe";
    horizontal: boolean;
    salas: number[];
    // Puertas de un solo sentido: hacia dónde se pasa.
    dir?: "norte" | "sur" | "este" | "oeste";
    // Bloque con cerradura (&): una puerta con llave que se ve como un bloque.
    bloque?: boolean;
};
// Escaleras y portales que aparecen al vaciar una sala (la propia o la de la otra punta).
type HiddenExit = { x: number; y: number; revela: { map: number; sala: number } };
// golpe: el cofre trabado del Santuario del Rostro, que se abre tirándole algo.
// `texto`: lo que dice la nota de un cofre con nota (el del Maestro Stalfos de las Fauces del Bagre).
// `trasJefe`: no aparece al vaciar la sala sino cuando lo dice el módulo del jefe (el cofre del Gancho, al vencer al
// cuarto Maestro Stalfos de las Fauces del Bagre).
type Chest = { x: number; y: number; contenido: string; oculto: boolean; sala: number; golpe?: boolean; texto?: string; trasJefe?: boolean };
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
    // Cueva de la Cola: escaleras ocultas y adónde lleva caer a un pozo de este mapa (si no, a la entrada de la sala).
    hiddenExits?: HiddenExit[];
    caida?: { map: number; x: number; y: number } | null;
    // Roca de la Tortuga: antorchas, hielo, lo que se levanta con el Brazalete y las estatuas del Gancho.
    torches?: Torch[];
    ice?: string[];
    liftables?: Array<{ x: number; y: number; tipo: LiftableKind; placa: boolean }>;
    hookPosts?: string[];
    // Mecánicas compartidas de la Roca de la Tortuga y la Gruta de la Botella.
    owls?: Array<{ x: number; y: number; texto: string }>;
    colorBlocks?: { azul: string[]; naranja: string[] };
    switches?: string[];
    vortexes?: string[];
    // Placas que solo se aprietan si el que las pisa carga algo con el Brazalete (la plataforma de peso del original).
    weightPlates?: string[];
    // Santuario del Rostro: cabezas de caballo, baldosas voladoras, cintas, lanzallamas y ojos (dungeonShrine.ts).
    santuario?: {
        cabezas: Array<{ x: number; y: number; sala: number }>;
        baldosas: Array<{ x: number; y: number; pozo: boolean; sala: number }>;
        cintas: Array<{ x: number; y: number; dir: string }>;
        lanzallamas: Array<{ x: number; y: number; dir: string; sala: number }>;
        ojos: Array<{ x: number; y: number; sala: number }>;
    };
    // Fauces del Bagre: anclas del Gancho, piso que se hunde, cristales de golpe, salas de bloques que se juntan, peces
    // que saltan y el agua baja (dungeonMaw.ts).
    fauces?: {
        anclas: string[];
        pisoFlojo: string[];
        cristalesGolpe: string[];
        salasJuntar: number[];
        peces: Array<{ x: number; y: number; sala: number }>;
        aguaBaja: string[];
    };
    // Torre del Águila: los pilares que tira el Orbe, dónde arranca el Orbe y las salas cuyas puertas abren los ojos
    // de piedra rotos (dungeonTower.ts).
    torre?: {
        pilares: Array<{ x: number; y: number; sala: number }>;
        orbe: { x: number; y: number } | null;
        salasOjos: number[];
        salaTrofeo: number | null;
    };
    // La piel de la mazmorra (scripts/buildDungeonMaps.ts, legend.piel): el objeto que ve el cliente en lugar del de
    // siempre, en toda la mazmorra o en una baldosa (puertas, cofre del jefe, escaleras). Ver skinObject.
    piel?: { objetos: Record<string, number>; porBaldosa: Record<string, Record<string, number>> };
};
type Torch = { x: number; y: number; encendida: boolean; sala: number };
// La piedra pesada y la estatua pesada solo las levanta el Brazalete de Fuerza nivel 2. La cabeza de caballo del
// Santuario del Rostro se levanta y se tira sin romperse (dungeonShrine.ts).
type LiftableKind = "vasija" | "piedra" | "pesada" | "estatua" | "cabeza";

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
    // Placas de cada sala: cada sala se resuelve sola.
    platesByRoom: Map<number, string[]>;
    torches: Map<string, Torch>;
    // Antorchas que arrancan apagadas, por sala: encenderlas todas resuelve la sala.
    torchesByRoom: Map<number, string[]>;
    ice: Set<string>;
    liftables: Map<string, { tipo: LiftableKind; placa: boolean }>;
    hookPosts: Set<string>;
    owls: Map<string, { x: number; y: number; texto: string }>;
    // Bloques de color: los azules arrancan levantados y los naranjas bajados; un cristal los invierte en toda la corrida.
    blueBlocks: Set<string>;
    orangeBlocks: Set<string>;
    switches: Set<string>;
    vortexes: Set<string>;
    // Todas las antorchas de cada sala: la sala está a oscuras mientras quede alguna apagada.
    torchesInRoom: Map<number, string[]>;
    weightPlates: Set<string>;
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
    // Salas cuyas placas ya se apretaron todas juntas.
    solvedPlateRooms: Set<number>;
    // Puertas que se tienen que cerrar pero tenían a alguien encima: se cierran apenas queden libres.
    pendingClose: Set<string>;
    brokenCrystals: Set<string>;
    // Piso que se desmorona: cuándo se cae cada baldosa pisada y cuándo vuelve cada una caída.
    crumbling: Map<string, number>;
    collapsed: Map<string, number>;
    // Hasta cuándo están abiertas las puertas con tiempo (0: cerradas).
    timedUntil: number;
    litTorches: Set<string>;
    solvedTorchRooms: Set<number>;
    meltedIce: Set<string>;
    // Vasijas y piedras que ya se levantaron (no vuelven en la corrida).
    lifted: Set<string>;
    // Bloques de color que tienen que subir pero tienen a alguien encima: suben apenas quede libre.
    pendingColor: Set<string>;
    // Matar en orden: los ya vencidos de cada sala (para revivirlos si se mata a otro fuera de orden).
    orderDead: Map<number, Array<{ index: number; at: { x: number; y: number } }>>;
    // Cuándo se le avisó a cada jugador que a la placa de peso le falta peso.
    weightHintAt: Map<string, number>;
    // Pozos que se abrieron en la corrida (las baldosas voladoras del Santuario del Rostro).
    openedPits: Set<string>;
    // Pozos tapados por un puente del Gancho (las anclas de las Fauces del Bagre).
    bridged: Set<string>;
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
    // Escaleras ocultas de la corrida ("mapa:x,y"), con lo que se les sacó hasta que aparezcan.
    hiddenExits: Map<string, { mapId: number; x: number; y: number; exit: unknown; objIndex: number; revela: { map: number; sala: number } }>;
    fastTimer: ReturnType<typeof setInterval> | null;
    // Bloques de color invertidos (por un cristal) y el pico de piedra (los búhos hablan).
    colorFlipped: boolean;
    nextSwitchAt: number;
    hasBeak: boolean;
    nextVortexPullAt: number;
    // Dónde estaba cada jugador en su último paso (los imitadores copian el movimiento al revés).
    lastStep: Map<string, { map: number; x: number; y: number }>;
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

// El objeto que ve el cliente en una baldosa de mazmorra: el de la piel de esa mazmorra si tiene, si no el mismo. La
// lógica usa siempre los objetos de siempre (OBJ); esto se aplica al mandárselos al cliente (handleProtocol.renderItem).
export function skinObject(mapId: number, pos: { x: number; y: number }, objIndex: number): number {
    if (!objIndex || mapId < 500) return objIndex;
    const base = baseMapOf(mapId) ?? (isDungeonBaseMap(mapId) ? mapId : null);
    const piel = base === null ? undefined : mechanicsOf(base)?.mech.piel;
    if (!piel) return objIndex;
    return piel.porBaldosa[coordKey(pos.x, pos.y)]?.[objIndex] ?? piel.objetos[objIndex] ?? objIndex;
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
    if (DEFAULT_DUNGEON_ITEMS.includes(itemId)) return true;
    const progress = getProgressStore().getProgress({ _id: characterId }) as { dungeonItems?: string[] };
    const upgrade = ITEM_UPGRADES[itemId];
    return Boolean(progress.dungeonItems?.includes(itemId) || (upgrade && progress.dungeonItems?.includes(upgrade)));
}

// Minimapa de la mazmorra: las salas visitadas (con el mapa, todas) y, con la brújula, los cofres y la puerta del jefe.
function buildMinimap(run: DungeonRun, base: number) {
    const index = mechanicsOf(base);
    const state = run.mapState[base];
    if (!index || !state) return null;
    const rooms = index.mech.rooms;
    return {
        mapa: base,
        // Lo que ocupa el piso entero (para encuadrar el mapa grande; no dice qué hay adentro).
        limites: {
            x1: Math.min(...rooms.map((room) => room.x1)),
            y1: Math.min(...rooms.map((room) => room.y1)),
            x2: Math.max(...rooms.map((room) => room.x2)),
            y2: Math.max(...rooms.map((room) => room.y2)),
        },
        salas: index.mech.rooms
            .filter((room) => run.hasMap || state.visited.has(room.id))
            .map((room) => ({ x1: room.x1, y1: room.y1, x2: room.x2, y2: room.y2, visitada: state.visited.has(room.id) })),
        cofres: run.hasCompass
            ? index.mech.chests.map((chest) => ({ x: chest.x, y: chest.y, abierto: state.openedChests.has(`${chest.x},${chest.y}`) }))
            : [],
        jefe: run.hasCompass ? index.mech.barriers.filter((barrier) => barrier.tipo === "jefe").map(({ x, y }) => ({ x, y })) : [],
    };
}

function buildState(user: RuntimeCharacter, panel: Record<string, unknown> | null, losa: { texto: string; titulo?: string } | null = null) {
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
                      // Las dos teclas de objeto (la A y la B de Zelda): qué ítem usa cada una.
                      botones: dungeonButtons(key),
                      // La colección de la serie: caracolas secretas y trofeos de los jefes.
                      coleccion: dungeonCollection(key),
                      minimapa: buildMinimap(insideRun, baseMapOf(Number(user.map)) ?? 0),
                      // Todos los pisos, para el mapa grande (como el de Link's Awakening).
                      plano: Object.keys(insideRun.maps).map((base) => ({
                          ...buildMinimap(insideRun, Number(base)),
                          nombre: mapNameOf(Number(base)),
                          actual: Number(base) === baseMapOf(Number(user.map)),
                      })),
                      musica: insideDef.musica ?? null,
                      combate: inBossFight(user),
                      // El pico de piedra (los búhos hablan) y las salas a oscuras del piso donde está.
                      pico: insideRun.hasBeak,
                      oscuras: (() => {
                          const ctx = contextOf(Number(user.map));
                          return ctx ? darkRoomsOf(ctx) : [];
                      })(),
                  }
                : null,
        losa: losa ? { seq: ++losaSeq, texto: losa.texto, titulo: losa.titulo ?? null } : null,
    };
}

// Los dos botones de objeto. Se guardan en el personaje; sin elegir, van los ítems que se usan, en el orden de la serie.
function dungeonButtons(characterId: string): { uno: string | null; dos: string | null } {
    const progress = getProgressStore().getProgress({ _id: characterId }) as { dungeonButtons?: { uno?: string | null; dos?: string | null } };
    const usable = ownedDungeonItems(characterId).filter((item) => item.accion).map((item) => item.id);
    const chosen = progress.dungeonButtons ?? {};
    // La tecla que tenía el ítem de nivel 1 pasa al mejorado.
    const resolve = (value: string | null | undefined) => (value && ITEM_UPGRADES[value] && usable.includes(ITEM_UPGRADES[value]) ? ITEM_UPGRADES[value] : value);
    const pick = (raw: string | null | undefined) => {
        const value = resolve(raw);
        return value === null ? null : value && usable.includes(value) ? value : undefined;
    };
    const uno = pick(chosen.uno);
    const dos = pick(chosen.dos);
    const free = usable.filter((id) => id !== uno && id !== dos);
    return {
        uno: uno === undefined ? (free.shift() ?? null) : uno,
        dos: dos === undefined ? (free.shift() ?? null) : dos,
    };
}

function dungeonCollection(characterId: string) {
    const progress = getProgressStore().getProgress({ _id: characterId }) as { caracolas?: string[]; trofeos?: string[] };
    return { caracolas: progress.caracolas ?? [], trofeos: progress.trofeos ?? [] };
}

const mapNames = new Map<number, string>();
function mapNameOf(base: number): string {
    if (!mapNames.has(base)) {
        let name = `Mapa ${base}`;
        try {
            name = String(JSON.parse(fs.readFileSync(path.join(MAPAS_SOURCE, `mapa_${base}`, "meta.json"), "utf8")).name ?? name);
        } catch {
            // Sin meta: queda el número.
        }
        mapNames.set(base, name);
    }
    return mapNames.get(base)!;
}

// Pelea con un jefe o un minijefe: la sala del jugador está cerrada y adentro queda uno vivo.
function inBossFight(user: RuntimeCharacter): boolean {
    const ctx = contextOf(Number(user.map));
    const roomId = ctx?.index.mech.roomOf[coordKey(user.pos.x, user.pos.y)];
    if (!ctx || roomId === undefined || !ctx.state.rooms.get(roomId)?.locked) return false;
    return roomCreatures(ctx, roomId).some((npc) => templateOf(npc).jefe || templateOf(npc).minijefe);
}

// /mazmorra boton <1|2> <ítem|ninguno>: qué ítem usa cada tecla de objeto. Si el ítem estaba en la otra, se cambian.
function setButtonCommand(sessionId: EntityId, slot: string, itemId: string) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const key = characterKey(user);
    if (!user || !key) return;
    const own = slot === "1" ? "uno" : slot === "2" ? "dos" : null;
    if (!own) return tell(sessionId, "Uso: /mazmorra boton <1|2> <ítem|ninguno>.", "white");
    const other = own === "uno" ? "dos" : "uno";
    const current = dungeonButtons(key);
    const owned = ownedDungeonItems(key);
    const upgraded = ITEM_UPGRADES[itemId];
    const value = itemId === "ninguno" ? null : upgraded && owned.some((item) => item.id === upgraded) ? upgraded : itemId;
    if (value && !owned.some((item) => item.id === value && item.accion)) {
        return tell(sessionId, "Ese ítem no lo tenés o no se usa con una tecla.", "white");
    }
    const next = { ...current, [own]: value };
    if (value && current[other] === value) next[other] = current[own];
    const progressStore = getProgressStore();
    const progress = progressStore.getProgress({ _id: key }) as { dungeonButtons?: { uno?: string | null; dos?: string | null } };
    progress.dungeonButtons = next;
    progressStore.saveProgress({ _id: key });
    sendState(sessionId);
}

function sendState(sessionId: EntityId, panel: Record<string, unknown> | null = null, losa: { texto: string; titulo?: string } | null = null) {
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
        colorFlipped: false,
        nextSwitchAt: 0,
        hasBeak: false,
        nextVortexPullAt: 0,
        lastStep: new Map(),
        mapState: {},
        playerRoom: new Map(),
        nextBurnAt: new Map(),
        hazardTimer: null,
        lavaActive: false,
        crusherDown: false,
        pairs: new Map(),
        floatingBoss: null,
        hiddenExits: new Map(),
        fastTimer: null,
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
        const index = mechanicsOf(baseMap);
        if (index) run.mapState[baseMap] = createMapState(index);
        if (index) hideExits(run, mapId, index);
    }
    runs.set(run.id, run);
    // Las criaturas especiales se registran con la corrida armada: el rodillo y el Ciempiés buscan su sala.
    for (const mapId of Object.values(run.maps)) {
        for (const npc of Object.values(vars.npcs ?? {}) as any[]) {
            if (npc?.map === mapId) registerSpecialNpc(run, npc);
        }
    }
    run.hazardTimer = setInterval(() => tickRun(run), HAZARD_TICK_MS);
    run.hazardTimer.unref?.();
    run.fastTimer = setInterval(() => fastTickRun(run), FAST_TICK_MS);
    run.fastTimer.unref?.();
    ensureSweep();
    return run;
}

function destroyRun(run: DungeonRun) {
    if (run.hazardTimer) clearInterval(run.hazardTimer);
    run.hazardTimer = null;
    if (run.fastTimer) clearInterval(run.fastTimer);
    run.fastTimer = null;
    for (const mapId of Object.values(run.maps)) {
        require("./dungeonHazards").forgetMap(mapId);
        require("./dungeonBoss").forgetMap(mapId);
        require("./dungeonGrotto").forgetMap(mapId);
        require("./dungeonShrine").forgetMap(mapId);
        require("./dungeonShrineBosses").forgetMap(mapId);
        require("./dungeonMaw").forgetMap(mapId);
        require("./dungeonMawBosses").forgetMap(mapId);
        require("./dungeonTower").forgetMap(mapId);
        require("./dungeonTowerBosses").forgetMap(mapId);
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
    require("./dungeonTools").dropCarry(user);
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
        case "fuego":
            return require("./dungeonTools").fire(sessionId);
        case "gancho":
            return require("./dungeonTools").hookshot(sessionId);
        case "pulsera":
            return require("./dungeonTools").bracelet(sessionId);
        case "escudo":
            return require("./dungeonTools").mirror(sessionId);
        case "polvo":
            return require("./dungeonTools").powder(sessionId);
        case "bomba":
            return require("./dungeonTools").bomb(sessionId);
        case "flecha":
            return require("./dungeonTools").arrow(sessionId);
        case "item": {
            const [, itemId = "", flag = ""] = text.trim().split(/\s+/);
            return grantItemCommand(sessionId, itemId.toLowerCase(), flag.toLowerCase() === "quitar");
        }
        case "boton": {
            const [, slot = "", itemId = ""] = text.trim().split(/\s+/);
            return setButtonCommand(sessionId, slot, itemId.toLowerCase());
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
                const liftables = new Map((mech.liftables ?? []).map(({ x, y, tipo, placa }) => [coordKey(x, y), { tipo, placa }]));
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
                    platesByRoom: groupPlatesByRoom(mech),
                    torches: new Map((mech.torches ?? []).map((torch) => [coordKey(torch.x, torch.y), torch])),
                    torchesByRoom: groupTorchesByRoom(mech),
                    ice: new Set(mech.ice ?? []),
                    liftables,
                    hookPosts: new Set(mech.hookPosts ?? []),
                    owls: new Map((mech.owls ?? []).map((owl) => [coordKey(owl.x, owl.y), owl])),
                    blueBlocks: new Set(mech.colorBlocks?.azul ?? []),
                    orangeBlocks: new Set(mech.colorBlocks?.naranja ?? []),
                    switches: new Set(mech.switches ?? []),
                    vortexes: new Set(mech.vortexes ?? []),
                    torchesInRoom: groupAllTorchesByRoom(mech),
                    weightPlates: new Set(mech.weightPlates ?? []),
                    dynamic: new Set([
                        ...(mech.colorBlocks?.azul ?? []),
                        ...(mech.colorBlocks?.naranja ?? []),
                        ...barriers.keys(),
                        ...chests.keys(),
                        ...mech.blocks,
                        ...(mech.crystals ?? []),
                        ...(mech.ice ?? []),
                        ...liftables.keys(),
                        ...(mech.fauces?.cristalesGolpe ?? []),
                    ]),
                };
            }
        } catch {
            index = null;
        }
        mechanicsCache.set(baseMap, index);
    }
    return mechanicsCache.get(baseMap) ?? null;
}

function groupPlatesByRoom(mech: MapMechanics): Map<number, string[]> {
    const byRoom = new Map<number, string[]>();
    for (const key of mech.plates) {
        const room = mech.roomOf[key];
        if (room === undefined) continue;
        byRoom.set(room, [...(byRoom.get(room) ?? []), key]);
    }
    return byRoom;
}

function groupTorchesByRoom(mech: MapMechanics): Map<number, string[]> {
    const byRoom = new Map<number, string[]>();
    for (const torch of mech.torches ?? []) {
        if (torch.encendida) continue;
        byRoom.set(torch.sala, [...(byRoom.get(torch.sala) ?? []), coordKey(torch.x, torch.y)]);
    }
    return byRoom;
}

function groupAllTorchesByRoom(mech: MapMechanics): Map<number, string[]> {
    const byRoom = new Map<number, string[]>();
    for (const torch of mech.torches ?? []) byRoom.set(torch.sala, [...(byRoom.get(torch.sala) ?? []), coordKey(torch.x, torch.y)]);
    return byRoom;
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
        solvedPlateRooms: new Set(),
        pendingClose: new Set(),
        brokenCrystals: new Set(),
        crumbling: new Map(),
        collapsed: new Map(),
        timedUntil: 0,
        litTorches: new Set([...index.torches.values()].filter((torch) => torch.encendida).map((torch) => coordKey(torch.x, torch.y))),
        solvedTorchRooms: new Set(),
        meltedIce: new Set(),
        lifted: new Set(),
        pendingColor: new Set(),
        orderDead: new Map(),
        weightHintAt: new Map(),
        openedPits: new Set(),
        bridged: new Set(),
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
    // El bloque con cerradura se ve como la puerta de piedra y, abierto, desaparece. La pared que se vuela con una
    // bomba es un arco tapiado (en una pared horizontal) o un montón de rocas (en una vertical).
    const bombWall = barrier.tipo === "bomba";
    const closedObject = bombWall ? (barrier.horizontal ? OBJ.paredBombeable : OBJ.rocas) : barrier.bloque ? OBJ.puerta : OBJ.barrera;
    // Con piel, la puerta lateral de una pared gruesa se ve también abierta (la de siempre, abierta, desaparece).
    const openSide = ctx.index.mech.piel?.porBaldosa[key]?.[OBJ.puertaAbierta] ? OBJ.puertaAbierta : 0;
    const objIndex =
        barrier.horizontal && !barrier.bloque ? (open ? OBJ.puertaAbierta : bombWall ? OBJ.paredBombeable : OBJ.puerta) : open ? openSide : closedObject;
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
    refreshRun(ctx.run);
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
    const revealed = revealChests(ctx, roomId);
    const exits = revealExits(ctx.run, ctx.base, roomId);
    const center = roomCenter(ctx, roomId);
    if (center && wasLocked) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.puertaAbre);
    if (center && revealed) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.secreto);
    if (wasLocked) tellRun(ctx.run, "La sala quedó vacía: las puertas se abrieron.");
    if (revealed) tellRun(ctx.run, revealed === 1 ? "¡Apareció un cofre!" : `¡Aparecieron ${revealed} cofres!`);
    if (center && exits && !revealed) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.secreto);
    if (exits) tellRun(ctx.run, exits.portal ? "¡Se abrió un portal!" : "¡Apareció una escalera!");
    refreshRun(ctx.run);
}

// --- Escaleras y portales que aparecen al vaciar una sala ---

// Al crear la corrida se les saca la salida y el objeto; vuelven cuando se vacía la sala que las revela.
function hideExits(run: DungeonRun, mapId: number, index: MapIndex) {
    for (const hidden of index.mech.hiddenExits ?? []) {
        const tile = vars.mapa[mapId]?.[hidden.y]?.[hidden.x];
        if (!tile?.tileExit) continue;
        run.hiddenExits.set(`${mapId}:${coordKey(hidden.x, hidden.y)}`, {
            mapId,
            x: hidden.x,
            y: hidden.y,
            exit: tile.tileExit,
            objIndex: Number(tile.objInfo?.objIndex ?? 0),
            revela: hidden.revela,
        });
        delete tile.tileExit;
        delete tile.objInfo;
    }
}

function revealExits(run: DungeonRun, base: number, room: number): { portal: boolean } | null {
    let found: { portal: boolean } | null = null;
    for (const [key, hidden] of [...run.hiddenExits]) {
        if (hidden.revela.map !== base || hidden.revela.sala !== room) continue;
        run.hiddenExits.delete(key);
        const tile = vars.mapa[hidden.mapId]?.[hidden.y]?.[hidden.x];
        if (!tile) continue;
        tile.tileExit = hidden.exit;
        if (hidden.objIndex) setObject(hidden.mapId, hidden.x, hidden.y, hidden.objIndex);
        found = { portal: hidden.objIndex === PORTAL_OBJ };
    }
    return found;
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
// Placas: cada sala se resuelve sola, cuando todas sus placas están apretadas a la vez (por jugadores o bloques). Abre
// las rejas (=) de esa sala y hace aparecer sus cofres ocultos.
function updatePlates(ctx: MapContext) {
    for (const [room, plates] of ctx.index.platesByRoom) {
        const solved = ctx.state.solvedPlateRooms.has(room);
        let allPressed = true;
        for (const key of plates) {
            const { x, y } = parseCoord(key);
            // Un botón bajo una vasija no se puede pisar hasta levantarla.
            if (ctx.index.liftables.has(key) && !ctx.state.lifted.has(key)) {
                allPressed = false;
                continue;
            }
            const hasBlock = ctx.state.blocks.has(key);
            const standing = playerAt(ctx.mapId, x, y) as (RuntimeCharacter & { dungeonCarry?: unknown }) | null;
            // La placa de peso solo baja con alguien que carga algo (o con un bloque).
            const pressed = hasBlock || Boolean(standing && (!ctx.index.weightPlates.has(key) || standing.dungeonCarry));
            if (!pressed) allPressed = false;
            if (hasBlock) continue;
            const wanted = pressed || solved ? OBJ.placaApretada : OBJ.placa;
            if (vars.mapa[ctx.mapId]?.[y]?.[x]?.objInfo?.objIndex !== wanted) setObject(ctx.mapId, x, y, wanted);
        }
        if (allPressed && !solved) solvePlates(ctx, room, plates);
    }
}

function solvePlates(ctx: MapContext, room: number, plates: string[]) {
    ctx.state.solvedPlateRooms.add(room);
    ctx.state.platesSolved = ctx.state.solvedPlateRooms.size === ctx.index.platesByRoom.size;
    let opened = 0;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo !== "placa" || !barrier.salas.includes(room)) continue;
        setBarrier(ctx, barrier, true);
        playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
        opened++;
    }
    const revealed = revealChests(ctx, room);
    // Las escaleras ocultas de la sala (los bloques que abren la escalera A de la Gruta de la Botella).
    if (revealExits(ctx.run, ctx.base, room)) tellRun(ctx.run, "¡Apareció una escalera!");
    // El puzzle resuelto suena para los que están en la sala de las placas.
    playSoundAt(ctx.mapId, parseCoord(plates[0]), DUNGEON_SOUNDS.secreto);
    if (opened) tellRun(ctx.run, "Se oye un mecanismo de piedra: una puerta se abrió.");
    if (revealed) tellRun(ctx.run, revealed === 1 ? "¡Apareció un cofre!" : `¡Aparecieron ${revealed} cofres!`);
    if (revealed) refreshRun(ctx.run);
}

// Los cofres ocultos de una sala aparecen (al vaciarla o al resolver sus placas). Devuelve cuántos.
function revealChests(ctx: MapContext, room: number, bossChests = false): number {
    let revealed = 0;
    for (const chest of ctx.index.mech.chests) {
        const key = coordKey(chest.x, chest.y);
        if (chest.sala !== room || !chest.oculto || ctx.state.revealedChests.has(key)) continue;
        if (Boolean(chest.trasJefe) !== bossChests) continue;
        ctx.state.revealedChests.add(key);
        setObject(ctx.mapId, chest.x, chest.y, OBJ.cofre);
        setBlocked(ctx.mapId, chest.x, chest.y, true);
        revealed++;
    }
    return revealed;
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
        pico: DUNGEON_SOUNDS.objeto,
        oro: DUNGEON_SOUNDS.oro,
        oroGrande: DUNGEON_SOUNDS.oro,
        premio: DUNGEON_SOUNDS.itemMazmorra,
        trofeo: DUNGEON_SOUNDS.itemMazmorra,
        caracola: DUNGEON_SOUNDS.secreto,
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
        // Pico de piedra: como el mapa, vale para todo el grupo; con él hablan los búhos.
        case "pico":
            run.hasBeak = true;
            tellRun(run, `¡${name} encontró el Pico de piedra! Ahora los búhos hablan.`, "#FFD24A");
            refreshRun(run);
            break;
        // Caracola secreta: un coleccionable de la serie, una por mazmorra, para cada uno del grupo.
        case "caracola": {
            const progressStore = getProgressStore();
            for (const characterId of run.inside) {
                const progress = progressStore.getProgress({ _id: characterId }) as { caracolas?: string[] };
                progress.caracolas = [...new Set([...(progress.caracolas ?? []), run.dungeonId])];
                progressStore.saveProgress({ _id: characterId });
            }
            tellRun(run, `¡${name} encontró la Caracola secreta! Queda en cada uno del grupo.`, "#FFD24A");
            break;
        }
        // Un cofre vacío con una nota adentro: se lee como una losa (después de refrescar a todos, que si no la tapa).
        case "nota":
            refreshRun(run);
            sendState(sessionId, null, { titulo: "Una nota", texto: chest.texto ?? "La nota está borrosa." });
            return;
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
        case "bomba":
            return tell(sessionId, "La pared está rajada: con una bomba se rompe.", "white");
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
        case "golpe":
            return tell(sessionId, "La persiana no tiene cerradura: tirale algo pesado para abrirla.", "white");
    }
}

// Algo tirado con el Brazalete llegó a una puerta o a un cofre (dungeonTools.ts): la persiana se abre y el cofre trabado
// se abre para el que tiró.
export function onThrowHit(user: RuntimeCharacter, mapId: number, tile: { x: number; y: number }, target: string) {
    const ctx = contextOf(mapId);
    if (!ctx) return;
    const key = coordKey(tile.x, tile.y);
    if (target === "puerta") {
        const barrier = ctx.index.barriers.get(key);
        if (!barrier || barrier.tipo !== "golpe" || ctx.state.openBarriers.has(key)) return;
        setBarrier(ctx, barrier, true);
        playSoundAt(mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
        tellRun(ctx.run, "¡El golpe abrió la persiana!");
        refreshRun(ctx.run);
    } else if (target === "cofre") {
        const chest = ctx.index.chests.get(key);
        if (!chest?.golpe || ctx.state.openedChests.has(key) || !isChestVisible(ctx, chest)) return;
        openChest(user.id, user, ctx, chest);
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
    require("./dungeonMaw").onBlockMoved(ctx.mapId);
}

type ClickTarget =
    | { kind: "cofre"; chest: Chest }
    | { kind: "losa"; texto: string; x: number; y: number }
    | { kind: "buho"; texto: string; x: number; y: number }
    | { kind: "puerta"; barrier: Barrier }
    | { kind: "bloque"; x: number; y: number };

// Lo que hay en una baldosa de mecánicas (los objetos altos se ven sobre las baldosas de arriba).
function clickTargetAt(ctx: MapContext, x: number, y: number): ClickTarget | null {
    const key = coordKey(x, y);
    const chest = ctx.index.chests.get(key);
    if (chest && isChestVisible(ctx, chest) && !ctx.state.openedChests.has(key)) return { kind: "cofre", chest };
    const slab = ctx.index.slabs.get(key);
    if (slab) return { kind: "losa", texto: slab.texto, x, y };
    const owl = ctx.index.owls.get(key);
    if (owl) return { kind: "buho", texto: owl.texto, x, y };
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
            else if (target.chest.golpe) tell(sessionId, "El cofre está trabado: tirale algo para que se abra.", "white");
            else openChest(sessionId, user, ctx, target.chest);
            return true;
        case "losa":
            if (chebyshev(user.pos, target) > READ_RANGE) tell(sessionId, "Acercate a la losa para leerla.", "white");
            else sendState(sessionId, null, { texto: target.texto });
            return true;
        case "buho":
            if (chebyshev(user.pos, target) > READ_RANGE) tell(sessionId, "Acercate al búho.", "white");
            else if (!ctx.run.hasBeak) tell(sessionId, "El búho quiere decir algo, pero sin el Pico de piedra no se le entiende.", "white");
            else sendState(sessionId, null, { texto: target.texto, titulo: "Estatua búho" });
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
        compassChime(ws, ctx, roomId);
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
    // Los imitadores de la sala copian el paso, al revés.
    const last = ctx.run.lastStep.get(key);
    ctx.run.lastStep.set(key, { map: ctx.mapId, x: user.pos.x, y: user.pos.y });
    // Solo un paso de una baldosa (un salto o un teletransporte no se copian).
    if (last && last.map === ctx.mapId) {
        const dx = user.pos.x - last.x;
        const dy = user.pos.y - last.y;
        if (Math.abs(dx) + Math.abs(dy) === 1) require("./dungeonHazards").onPlayerStep(user, dx, dy);
    }
    if (ctx.index.vortexes.has(tileKey)) enterVortex(user, ctx);
    if (ctx.index.weightPlates.has(tileKey) && !(user as { dungeonCarry?: unknown }).dungeonCarry && !ctx.state.solvedPlateRooms.has(roomId ?? -1)) {
        if (now >= (ctx.state.weightHintAt.get(key) ?? 0)) {
            ctx.state.weightHintAt.set(key, now + 4_000);
            tell(user.id, "La placa no baja: le falta peso. Probá parándote encima con algo levantado.", "white");
        }
    }
}

// La brújula, como en Link's Awakening: al entrar a una sala con una llave sin agarrar, suena.
function compassChime(ws: RuntimeClient, ctx: MapContext, roomId: number) {
    if (!ctx.run.hasCompass) return;
    const hasKey = ctx.index.mech.chests.some(
        (chest) => chest.sala === roomId && (chest.contenido === "llave" || chest.contenido === "jefe") && !ctx.state.openedChests.has(coordKey(chest.x, chest.y)),
    );
    if (!hasKey) return;
    getHandleProtocol().playSound(0, DUNGEON_SOUNDS.secreto, ws);
    tell(ws.id!, "La brújula suena: en esta sala hay una llave.");
}

// Caer a un pozo: daño y vuelta a la entrada de la sala. Devuelve true si el paso terminó ahí.
function stepIntoPit(ws: RuntimeClient, user: RuntimeCharacter, ctx: MapContext, x: number, y: number): boolean {
    const key = coordKey(x, y);
    if ((!ctx.index.pits.has(key) && !ctx.state.collapsed.has(key) && !ctx.state.openedPits.has(key)) || (user as { dead?: boolean }).dead) return false;
    if (ctx.state.bridged.has(key)) return false;
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
// El cliente dibuja los objetos del mapa base: lo que la corrida sacó (escaleras ocultas, vasijas levantadas, bloques
// corridos) hay que borrarlo cuando entra a la vista caminando, o se seguiría viendo.
export function isObjectRemoved(mapId: number, x: number, y: number): boolean {
    if (!runByInstanceMap.has(mapId)) return false;
    const base = baseMapOf(mapId);
    return base !== null && Boolean(vars.mapa[base]?.[y]?.[x]?.objInfo) && !vars.mapa[mapId]?.[y]?.[x]?.objInfo;
}

export function getDynamicBlocked(mapId: number, x: number, y: number): number | null {
    if (!runByInstanceMap.has(mapId)) return null;
    const ctx = contextOf(mapId);
    if (!ctx) return null;
    const key = coordKey(x, y);
    if (!ctx.index.dynamic.has(key) && !ctx.state.blockTrail.has(key) && !require("./dungeonShrine").isTouchedTile(mapId, x, y)) return null;
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
        // Bloques de color que tenían a alguien encima cuando tenían que subir.
        for (const key of [...ctx.state.pendingColor]) {
            const { x, y } = parseCoord(key);
            if (isOccupied(ctx.mapId, x, y)) continue;
            const color = ctx.index.blueBlocks.has(key) ? "azul" : "naranja";
            setColorBlock(ctx, key, color, isColorRaised(run, color));
        }
        for (const [key, restoreAt] of [...ctx.state.collapsed]) {
            if (now < restoreAt || isOccupied(ctx.mapId, parseCoord(key).x, parseCoord(key).y)) continue;
            ctx.state.collapsed.delete(key);
            const { x, y } = parseCoord(key);
            setObject(ctx.mapId, x, y, OBJ.pisoRajado);
        }
    }
    updateCrushers(run, now);
    updateFloatingBoss(run, now);
    pullTowardVortexes(run, now);
    const tools = require("./dungeonTools");
    for (const user of playersInside(run)) {
        tools.checkCarry(user);
        const key = characterKey(user);
        const ctx = contextOf(Number(user.map));
        if (!key || !ctx || (user as { dead?: boolean }).dead) continue;
        if (require("./dungeonMotion").isAirborne(user)) continue;
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

// Cada 50 ms: las trampas con movimiento propio y el Ciempiés, en los mapas donde hay alguien.
function fastTickRun(run: DungeonRun) {
    if (!runs.has(run.id)) return;
    const now = Date.now();
    const watched = new Set(playersInside(run).map((user) => Number(user.map)));
    for (const mapId of Object.values(run.maps)) {
        if (!watched.has(mapId)) continue;
        require("./dungeonHazards").tick(mapId, now);
        require("./dungeonBoss").tick(mapId, now);
        require("./dungeonGrotto").tick(mapId, now);
        require("./dungeonShrine").tick(mapId, now);
        require("./dungeonShrineBosses").tick(mapId, now);
        require("./dungeonMaw").tick(mapId, now);
        require("./dungeonMawBosses").tick(mapId, now);
        require("./dungeonTower").tick(mapId, now);
        require("./dungeonTowerBosses").tick(mapId, now);
    }
}

// --- Ayudas para dungeonHazards.ts y dungeonBoss.ts ---

export function roomAt(mapId: number, x: number, y: number): number | undefined {
    const ctx = contextOf(mapId);
    return ctx ? ctx.index.mech.roomOf[coordKey(x, y)] : undefined;
}

export function roomBounds(mapId: number, roomId: number) {
    const room = contextOf(mapId)?.index.rooms.get(roomId);
    return room ? { x1: room.x1, y1: room.y1, x2: room.x2, y2: room.y2 } : null;
}

export function isRoomLocked(mapId: number, roomId: number): boolean {
    return Boolean(contextOf(mapId)?.state.rooms.get(roomId)?.locked);
}

export function hurtPlayer(user: RuntimeCharacter, fraction: number, message: string) {
    hurt(user, fraction, message);
}

// --- Ayudas para dungeonShrine.ts (Santuario del Rostro) ---

// Lo del Santuario de un mapa de corrida: los datos del plano y la sala de cada baldosa.
export function shrineDataOf(mapId: number): { santuario: NonNullable<MapMechanics["santuario"]>; roomOf: Record<string, number> } | null {
    const ctx = contextOf(mapId);
    if (!ctx?.index.mech.santuario) return null;
    return { santuario: ctx.index.mech.santuario, roomOf: ctx.index.mech.roomOf };
}

// Se resolvió el acertijo de una sala (las cabezas paradas, las baldosas rotas): se abren sus puertas "=" y aparecen sus
// cofres y escaleras ocultas.
export function solveRoomPuzzle(mapId: number, roomId: number, message: string) {
    const ctx = contextOf(mapId);
    if (!ctx) return;
    let opened = 0;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo !== "placa" || !barrier.salas.includes(roomId) || ctx.state.openBarriers.has(coordKey(barrier.x, barrier.y))) continue;
        setBarrier(ctx, barrier, true);
        playSoundAt(ctx.mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
        opened++;
    }
    const revealed = revealChests(ctx, roomId);
    const exits = revealExits(ctx.run, ctx.base, roomId);
    const center = roomCenter(ctx, roomId);
    if (center) playSoundAt(ctx.mapId, center, DUNGEON_SOUNDS.secreto);
    tellRun(ctx.run, message);
    if (opened) tellRun(ctx.run, "Se oye un mecanismo de piedra: una puerta se abrió.");
    if (revealed) tellRun(ctx.run, revealed === 1 ? "¡Apareció un cofre!" : `¡Aparecieron ${revealed} cofres!`);
    if (exits) tellRun(ctx.run, "¡Apareció una escalera!");
    refreshRun(ctx.run);
}

// Una baldosa voladora que se despegó dejó un pozo.
export function openPitAt(mapId: number, x: number, y: number) {
    const ctx = contextOf(mapId);
    if (!ctx) return;
    ctx.state.openedPits.add(coordKey(x, y));
    setObject(mapId, x, y, OBJ.pozoAbierto);
}

// Los pozos del Rostro de Piedra (dungeonShrineBosses.ts) se abren y se cierran solos; los dibuja el cliente.
export function setBossPit(mapId: number, x: number, y: number, open: boolean) {
    const ctx = contextOf(mapId);
    if (!ctx) return;
    if (open) ctx.state.openedPits.add(coordKey(x, y));
    else ctx.state.openedPits.delete(coordKey(x, y));
}

// Las vasijas que siguen en su lugar en una sala (las que tira el Rostro de Piedra).
export function vasesInRoom(mapId: number, roomId: number): Array<{ x: number; y: number }> {
    const ctx = contextOf(mapId);
    if (!ctx) return [];
    const vases: Array<{ x: number; y: number }> = [];
    for (const [key, liftable] of ctx.index.liftables) {
        if (liftable.tipo === "vasija" && !ctx.state.lifted.has(key) && ctx.index.mech.roomOf[key] === roomId) vases.push(parseCoord(key));
    }
    return vases;
}

// --- Ayudas para dungeonMaw.ts (Fauces del Bagre) ---

export function mawDataOf(mapId: number): { fauces: NonNullable<MapMechanics["fauces"]>; roomOf: Record<string, number> } | null {
    const ctx = contextOf(mapId);
    if (!ctx?.index.mech.fauces) return null;
    return { fauces: ctx.index.mech.fauces, roomOf: ctx.index.mech.roomOf };
}

// --- Ayudas para dungeonTower.ts (Torre del Águila) ---

export function towerDataOf(mapId: number): { torre: NonNullable<MapMechanics["torre"]>; roomOf: Record<string, number> } | null {
    const ctx = contextOf(mapId);
    if (!ctx?.index.mech.torre) return null;
    return { torre: ctx.index.mech.torre, roomOf: ctx.index.mech.roomOf };
}

// Aparecen las escaleras que esperaban a una sala (la -1 es la que revela el derrumbe de los pilares).
export function revealExitsOfRoom(mapId: number, roomId: number): boolean {
    const ctx = contextOf(mapId);
    if (!ctx) return false;
    const exits = revealExits(ctx.run, ctx.base, roomId);
    if (exits) refreshRun(ctx.run);
    return Boolean(exits);
}

// Un pozo del plano que todavía no tiene puente.
export function isPitAt(mapId: number, x: number, y: number): boolean {
    const ctx = contextOf(mapId);
    const key = coordKey(x, y);
    return Boolean(ctx && ctx.index.pits.has(key) && !ctx.state.bridged.has(key));
}

// El puente del Gancho tapa un pozo: se pisa y no se cae (queda toda la corrida). Los tablones van a lo largo.
export function bridgePit(mapId: number, x: number, y: number, horizontal = false) {
    const ctx = contextOf(mapId);
    if (!ctx) return;
    ctx.state.bridged.add(coordKey(x, y));
    setObject(mapId, x, y, horizontal ? OBJ.puenteHorizontal : OBJ.puente);
}

// --- Ayudas para dungeonMawBosses.ts (los jefes de las Fauces del Bagre) ---

// Saca una criatura de la corrida sin que cuente como muerta (el Maestro Stalfos que huye o que todavía no llegó).
export function despawnRunNpc(npc: any) {
    if (npc && vars.npcs?.[npc.id]) despawnNpc(npc);
}

// Pone una criatura en una sala de la corrida (el Maestro Stalfos que sigue). Si la sala ya se había vaciado, vuelve a
// estar sin resolver: se cierra al entrar (o enseguida, si ya hay alguien adentro).
export function spawnRunNpc(mapId: number, npcIndex: number, near: { x: number; y: number }, roomId: number) {
    const ctx = contextOf(mapId);
    if (!ctx) return null;
    const npc = spawnDungeonNpc(ctx, npcIndex, near, roomId);
    const roomState = ctx.state.rooms.get(roomId);
    if (npc && roomState) {
        roomState.cleared = false;
        const inside = playersInside(ctx.run).some((user) => Number(user.map) === mapId && ctx.index.mech.roomOf[coordKey(user.pos.x, user.pos.y)] === roomId);
        if (inside && ctx.index.rooms.get(roomId)?.cierra) lockRoom(ctx, roomId);
    }
    return npc;
}

// Si la sala quedó sin criaturas (el jefe huyó), se abre como si las hubieran vencido.
export function releaseRoomIfEmpty(mapId: number, roomId: number) {
    const ctx = contextOf(mapId);
    if (ctx && roomCreatures(ctx, roomId).length === 0) clearRoom(ctx, roomId);
}

// Aparecen los cofres de la sala que esperaban al jefe (el del Gancho).
export function revealBossChests(mapId: number, roomId: number) {
    const ctx = contextOf(mapId);
    if (!ctx || !revealChests(ctx, roomId, true)) return;
    const center = roomCenter(ctx, roomId);
    if (center) playSoundAt(mapId, center, DUNGEON_SOUNDS.secreto);
    tellRun(ctx.run, "¡Apareció un cofre!");
    refreshRun(ctx.run);
}

// Los bloques que se empujan de una sala, donde están ahora.
export function blocksInRoom(mapId: number, roomId: number): Array<{ x: number; y: number }> {
    const ctx = contextOf(mapId);
    if (!ctx) return [];
    return [...ctx.state.blocks].filter((key) => ctx.index.mech.roomOf[key] === roomId).map(parseCoord);
}

// Pone o saca un objeto de la corrida (las cabezas de caballo, las baldosas), con su bloqueo.
export function setShrineObject(mapId: number, x: number, y: number, objIndex: number, blocked: boolean) {
    if (!contextOf(mapId)) return;
    setObject(mapId, x, y, objIndex);
    setBlocked(mapId, x, y, blocked);
}

// Bloquea o libera una baldosa de una corrida (la botella vacía del Genio, dungeonGrotto.ts).
export function setDungeonBlocked(mapId: number, x: number, y: number, blocked: boolean) {
    if (!isDungeonInstanceMap(mapId)) return;
    setBlocked(mapId, x, y, blocked);
}

export function setDungeonObject(mapId: number, x: number, y: number, objIndex: number) {
    setObject(mapId, x, y, objIndex);
}

// La vida de una criatura para los que la ven (el Ciempiés se cura).
export function broadcastNpcVitals(npc: any) {
    const handleProtocol = getHandleProtocol();
    areaClients(Number(npc.map), npc.pos, (client) =>
        handleProtocol.entityVitalsDelta(npc.id, Number(npc.hp ?? 0), Number(npc.maxHp ?? 0), 0, 0, client),
    );
}

// Después de un empujón: si quedó sobre un pozo, cae.
export function fallIfHazard(ws: RuntimeClient, user: RuntimeCharacter) {
    const ctx = contextOf(Number(user.map));
    if (ctx) stepIntoPit(ws, user, ctx, user.pos.x, user.pos.y);
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
    if (ctx.state.bridged.has(key)) return false;
    return (
        ctx.index.pits.has(key) ||
        ctx.index.lava.has(key) ||
        ctx.index.lavaPeriodica.has(key) ||
        ctx.index.crushers.has(key) ||
        ctx.state.collapsed.has(key) ||
        ctx.state.openedPits.has(key)
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
// --- Lo que tocan el Polvo de Fuego, el Gancho y el Brazalete de Fuerza (dungeonTools.ts) ---

export type ToolTarget =
    | "antorcha"
    | "antorchaEncendida"
    | "hielo"
    | "vasija"
    | "piedra"
    | "pesada"
    | "estatua"
    | "cabeza"
    | "cofre"
    | "bloque"
    | "cristal"
    | "puerta"
    | "interruptor";

// Lo que hay en una baldosa para los ítems que se tiran: null si no hay nada de la mazmorra (piso, pared, criatura).
export function toolTargetAt(mapId: number, x: number, y: number): ToolTarget | null {
    const ctx = contextOf(mapId);
    if (!ctx) return null;
    const key = coordKey(x, y);
    if (ctx.index.torches.has(key)) return ctx.state.litTorches.has(key) ? "antorchaEncendida" : "antorcha";
    if (ctx.index.ice.has(key) && !ctx.state.meltedIce.has(key)) return "hielo";
    const liftable = ctx.index.liftables.get(key);
    if (liftable && !ctx.state.lifted.has(key)) return liftable.tipo;
    if (require("./dungeonShrine").headAt(mapId, x, y)) return "cabeza";
    if (ctx.index.hookPosts.has(key)) return "estatua";
    if (ctx.index.switches.has(key)) return "interruptor";
    const chest = ctx.index.chests.get(key);
    if (chest && isChestVisible(ctx, chest)) return "cofre";
    if (ctx.state.blocks.has(key)) return "bloque";
    if (ctx.index.crystals.has(key) && !ctx.state.brokenCrystals.has(key)) return "cristal";
    if (ctx.index.barriers.has(key) && !ctx.state.openBarriers.has(key)) return "puerta";
    return null;
}

// Enciende una antorcha. Si era la última apagada de su sala, la sala se resuelve: se abren sus puertas "=" y aparecen
// sus cofres. En una sala que se cierra, los cofres esperan a que se vacíe (los fantasmas que guardan el Brazalete).
export function lightTorch(mapId: number, x: number, y: number): boolean {
    const ctx = contextOf(mapId);
    const key = coordKey(x, y);
    const torch = ctx?.index.torches.get(key);
    if (!ctx || !torch || ctx.state.litTorches.has(key)) return false;
    ctx.state.litTorches.add(key);
    setObject(mapId, x, y, OBJ.antorchaEncendida);
    // La sala se aclara de a poco (el estado lleva la luz de cada sala oscura).
    refreshRun(ctx.run);
    const roomTorches = ctx.index.torchesByRoom.get(torch.sala) ?? [];
    if (!ctx.state.solvedTorchRooms.has(torch.sala) && roomTorches.every((torchKey) => ctx.state.litTorches.has(torchKey))) {
        ctx.state.solvedTorchRooms.add(torch.sala);
        playSoundAt(mapId, { x, y }, DUNGEON_SOUNDS.secreto);
        let opened = 0;
        for (const barrier of ctx.index.mech.barriers) {
            if (barrier.tipo !== "placa" || !barrier.salas.includes(torch.sala)) continue;
            setBarrier(ctx, barrier, true);
            playSoundAt(mapId, barrier, DUNGEON_SOUNDS.puertaAbre);
            opened++;
        }
        if (opened) tellRun(ctx.run, "Las antorchas se encendieron: se abrió una puerta.");
        const guarded = ctx.index.rooms.get(torch.sala)?.cierra && roomCreatures(ctx, torch.sala).length > 0;
        const revealed = guarded ? 0 : revealChests(ctx, torch.sala);
        if (revealed) {
            tellRun(ctx.run, revealed === 1 ? "¡Las antorchas se encendieron y apareció un cofre!" : `¡Aparecieron ${revealed} cofres!`);
            refreshRun(ctx.run);
        }
    }
    return true;
}

export function meltIce(mapId: number, x: number, y: number): boolean {
    const ctx = contextOf(mapId);
    const key = coordKey(x, y);
    if (!ctx || !ctx.index.ice.has(key) || ctx.state.meltedIce.has(key)) return false;
    ctx.state.meltedIce.add(key);
    setObject(mapId, x, y, 0);
    setBlocked(mapId, x, y, false);
    return true;
}

// Levanta una vasija o una piedra: libera la baldosa y deja a la vista lo que tapaba (un botón).
export function liftAt(mapId: number, x: number, y: number): { tipo: LiftableKind; objIndex: number } | null {
    if (require("./dungeonShrine").liftHead(mapId, x, y)) return { tipo: "cabeza", objIndex: OBJ.cabezaParada };
    const ctx = contextOf(mapId);
    const key = coordKey(x, y);
    const liftable = ctx?.index.liftables.get(key);
    if (!ctx || !liftable || ctx.state.lifted.has(key)) return null;
    ctx.state.lifted.add(key);
    setObject(mapId, x, y, liftable.placa ? OBJ.placa : 0);
    setBlocked(mapId, x, y, false);
    if (liftable.placa) updatePlates(ctx);
    return { tipo: liftable.tipo, objIndex: LIFTABLE_OBJECT[liftable.tipo] };
}

const LIFTABLE_OBJECT: Record<LiftableKind, number> = {
    vasija: OBJ.vasija,
    piedra: OBJ.piedra,
    pesada: OBJ.piedraPesada,
    estatua: OBJ.estatuaPesada,
    cabeza: OBJ.cabezaParada,
};

// Qué se puede levantar en una baldosa (sin levantarlo): el Brazalete se fija si es pesado antes de intentarlo.
export function liftableKindAt(mapId: number, x: number, y: number): LiftableKind | null {
    if (require("./dungeonShrine").headAt(mapId, x, y)) return "cabeza";
    const ctx = contextOf(mapId);
    const key = coordKey(x, y);
    const liftable = ctx?.index.liftables.get(key);
    return ctx && liftable && !ctx.state.lifted.has(key) ? liftable.tipo : null;
}

// --- Mecánicas compartidas: bloques de color, cristales, salas oscuras y remolinos ---

// Si los bloques de un color están levantados: los azules arrancan arriba y los naranjas abajo; un cristal los invierte.
function isColorRaised(run: DungeonRun, color: "azul" | "naranja") {
    return color === "azul" ? !run.colorFlipped : run.colorFlipped;
}

function setColorBlock(ctx: MapContext, key: string, color: "azul" | "naranja", raised: boolean) {
    const { x, y } = parseCoord(key);
    if (raised && isOccupied(ctx.mapId, x, y)) {
        // Con alguien encima no sube: sube apenas quede libre (como las puertas que se cierran).
        ctx.state.pendingColor.add(key);
        raised = false;
    } else {
        ctx.state.pendingColor.delete(key);
    }
    const objIndex = color === "azul" ? (raised ? OBJ.bloqueAzul : OBJ.bloqueAzulBajo) : raised ? OBJ.bloqueNaranja : OBJ.bloqueNaranjaBajo;
    setObject(ctx.mapId, x, y, objIndex);
    setBlocked(ctx.mapId, x, y, raised);
}

function applyColorBlocks(run: DungeonRun) {
    for (const mapId of Object.values(run.maps)) {
        const ctx = contextOf(mapId);
        if (!ctx) continue;
        for (const key of ctx.index.blueBlocks) setColorBlock(ctx, key, "azul", isColorRaised(run, "azul"));
        for (const key of ctx.index.orangeBlocks) setColorBlock(ctx, key, "naranja", isColorRaised(run, "naranja"));
        // El cristal muestra el color de los bloques que están levantados.
        for (const key of ctx.index.switches) {
            const { x, y } = parseCoord(key);
            setObject(mapId, x, y, run.colorFlipped ? OBJ.cristalNaranja : OBJ.cristalAzul);
        }
    }
}

// Golpe (de lo que sea) a un cristal: invierte los bloques de color de toda la corrida. Devuelve si había uno.
export function hitSwitch(mapId: number, x: number, y: number): boolean {
    const ctx = contextOf(mapId);
    if (!ctx || !ctx.index.switches.has(coordKey(x, y))) return false;
    const now = Date.now();
    // Un golpe que llega por dos lados a la vez (la explosión, la llamarada) cuenta una vez.
    if (now < ctx.run.nextSwitchAt) return true;
    ctx.run.nextSwitchAt = now + 500;
    ctx.run.colorFlipped = !ctx.run.colorFlipped;
    applyColorBlocks(ctx.run);
    playSoundAt(mapId, { x, y }, DUNGEON_SOUNDS.cristal);
    return true;
}

// Un golpe al aire (sin criatura adelante): si adelante hay un cristal, le pega.
export function onAirSwing(user: RuntimeCharacter, x: number, y: number) {
    if (!isDungeonInstanceMap(user.map)) return;
    hitSwitch(Number(user.map), x, y);
    require("./dungeonMaw").onAirSwing(Number(user.map), { x, y });
    const emptyBottle = require("./dungeonGrotto").onAirSwing(Number(user.map), { x, y });
    if (emptyBottle) tell(user.id, emptyBottle);
}

// Las salas a oscuras del mapa: las que tienen alguna antorcha apagada. "luz" va de 0 (todas apagadas) a casi 1.
function darkRoomsOf(ctx: MapContext) {
    const rooms: Array<{ x1: number; y1: number; x2: number; y2: number; luz: number; antorchas: Array<{ x: number; y: number }> }> = [];
    for (const [roomId, keys] of ctx.index.torchesInRoom) {
        const lit = keys.filter((key) => ctx.state.litTorches.has(key));
        const room = ctx.index.rooms.get(roomId);
        if (!room || lit.length === keys.length) continue;
        rooms.push({ x1: room.x1, y1: room.y1, x2: room.x2, y2: room.y2, luz: lit.length / keys.length, antorchas: lit.map(parseCoord) });
    }
    return rooms;
}

// El remolino arrastra de a ratos una baldosa hacia él a los que están en su sala (salvo en el aire).
const VORTEX_PULL_MS = 600;

function pullTowardVortexes(run: DungeonRun, now: number) {
    if (now < run.nextVortexPullAt) return;
    run.nextVortexPullAt = now + VORTEX_PULL_MS;
    const motion = require("./dungeonMotion");
    for (const user of playersInside(run)) {
        const ctx = contextOf(Number(user.map));
        if (!ctx || !ctx.index.vortexes.size || (user as { dead?: boolean }).dead || motion.isMoving(user)) continue;
        const room = ctx.index.mech.roomOf[coordKey(user.pos.x, user.pos.y)];
        for (const key of ctx.index.vortexes) {
            const vortex = parseCoord(key);
            if (room === undefined || ctx.index.mech.roomOf[key] !== room) continue;
            const dx = vortex.x - user.pos.x;
            const dy = vortex.y - user.pos.y;
            if (!dx && !dy) continue;
            const dir = Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
            motion.push(user, dir, 1);
            break;
        }
    }
}

// Caer en el remolino: de vuelta a la entrada de la mazmorra.
function enterVortex(user: RuntimeCharacter, ctx: MapContext) {
    const def = getDefinition(ctx.run.dungeonId);
    if (!def) return;
    tell(user.id, "El remolino te tragó: volviste a la entrada.", "white");
    teleportInto(user.id, ctx.run, def);
}

// Una bomba explota en (x, y): se abren las paredes rajadas de las 3 × 3 baldosas. Devuelve cuántas se abrieron.
export function bombBlast(mapId: number, x: number, y: number): number {
    const ctx = contextOf(mapId);
    if (!ctx) return 0;
    require("./dungeonMaw").onBlast(mapId, { x, y });
    let opened = 0;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const key = coordKey(x + dx, y + dy);
            const barrier = ctx.index.barriers.get(key);
            if (!barrier || barrier.tipo !== "bomba" || ctx.state.openBarriers.has(key)) continue;
            setBarrier(ctx, barrier, true);
            opened++;
        }
    }
    if (opened) {
        playSoundAt(mapId, { x, y }, DUNGEON_SOUNDS.secreto);
        tellRun(ctx.run, "¡La pared se vino abajo: hay un pasaje!");
    }
    return opened;
}

// Si los ítems que se tiran pueden lastimar a esta criatura (las trampas y lo invulnerable, no). `source`: con qué
// (fuego, gancho, tiro, bomba, flecha o polvo): a los orejudos solo les entra lo tirado, las bombas y las flechas.
export function canToolHitNpc(
    npc: { id?: EntityId; map?: number; hp?: number; attackable?: number | boolean; dormant?: boolean } | undefined,
    source?: string,
): boolean {
    if (!npc || Number(npc.hp ?? 0) <= 0 || !npc.attackable) return false;
    return !getNpcInvulnerableReason(npc, undefined, source);
}

// Una sala está a oscuras del todo si tiene antorchas y ninguna está encendida (los fantasmas no se dejan tocar).
function isRoomDarkAt(mapId: number, pos: { x: number; y: number }): boolean {
    const ctx = contextOf(mapId);
    const roomId = ctx?.index.mech.roomOf[coordKey(pos.x, pos.y)];
    const torches = roomId === undefined ? undefined : ctx?.index.torchesInRoom.get(roomId);
    return Boolean(ctx && torches?.length && !torches.some((key) => ctx.state.litTorches.has(key)));
}

// Un golpe cuerpo a cuerpo (o la Carrera) a una criatura que no recibe daño pero se corre (el escarabajo que
// retrocede): la empuja. Devuelve true si el golpe ya quedó resuelto así.
export function onNpcStruck(npc: any, attacker: RuntimeCharacter): boolean {
    if (!npc || !isDungeonInstanceMap(npc.map)) return false;
    // El Genio metido en la botella: el golpe aturde la botella.
    if (require("./dungeonGrotto").onNpcStruck(npc)) return true;
    // Los hechiceros del Santuario del Rostro: el golpe solo los empuja.
    if (require("./dungeonShrine").onNpcStruck(npc, attacker)) return true;
    // Los jefes de las Fauces del Bagre: el golpe desarma al Maestro Stalfos o le pega al corazón de la Anguila.
    if (require("./dungeonMawBosses").onNpcStruck(npc, attacker)) return true;
    // Los jefes de la Torre del Águila: al Flautista no le entra; al Águila, solo cuando vuela bajo.
    if (require("./dungeonTowerBosses").onNpcStruck(npc, attacker)) return true;
    if (!templateOf(npc).retrocede) return false;
    require("./dungeonHazards").strikeBeetle(npc, attacker);
    return true;
}

export function getNpcInvulnerableReason(
    npc: { id?: EntityId; map?: number; dormant?: boolean; nameCharacter?: string; pos?: { x: number; y: number } } | undefined,
    attacker?: RuntimeCharacter,
    source?: string,
): string | null {
    if (!npc || !isDungeonInstanceMap(npc.map)) return null;
    const template = templateOf(npc as { templateNpcIndex?: number });
    if (template.fantasma && npc.pos && isRoomDarkAt(Number(npc.map), npc.pos)) return "El fantasma se escurre en la oscuridad: encendé una antorcha.";
    if (template.orejudo && !(source && THROWN_SOURCES.has(source))) {
        return "Al orejudo no le entran golpes ni hechizos: tirale algo (una vasija, una bomba o una flecha).";
    }
    if (template.retrocede) return "No le hace nada: empujalo a un pozo.";
    const genie = require("./dungeonGrotto").invulnerableReason(npc);
    if (genie) return genie;
    const shrine = require("./dungeonShrine").invulnerableReason(npc);
    if (shrine) return shrine;
    // El Machacador, las Serpientes Glotonas y el Rostro de Piedra: a cada uno le entra una sola cosa.
    const shrineBoss = require("./dungeonShrineBosses").invulnerableReason(npc, source);
    if (shrineBoss) return shrineBoss;
    // Las Máscaras de Hierro de las Fauces del Bagre se cubren de frente.
    const masked = require("./dungeonMaw").invulnerableReason(npc, attacker, source);
    if (masked) return masked;
    // Los jefes de las Fauces: a cada uno le entra una sola cosa.
    const mawBoss = require("./dungeonMawBosses").invulnerableReason(npc, source);
    if (mawBoss) return mawBoss;
    // Los jefes de la Torre del Águila.
    const towerBoss = require("./dungeonTowerBosses").invulnerableReason(npc, source);
    if (towerBoss) return towerBoss;
    // Los imitadores se cubren de frente: hay que pegarles por la espalda o de costado.
    const frontal = attacker ? require("./dungeonHazards").frontalBlockReason(npc, attacker) : null;
    if (frontal) return frontal;
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
    // Los pozos de la Guarida llevan al piso de abajo (y si se caen todos, el jefe se cura).
    const caida = ctx.index.mech.caida;
    const target = caida ? ctx.run.maps[caida.map] : undefined;
    if (caida && target) {
        const roomId = ctx.index.mech.roomOf[coordKey(user.pos.x, user.pos.y)];
        const landing = game.getFreeSpace(ws, target, caida.x, caida.y, "dungeon.pozo") ?? caida;
        game.telep(ws, target, landing.x, landing.y, "dungeon.pozo");
        tell(user.id, "Caíste al piso de abajo.");
        sendState(user.id);
        require("./dungeonBoss").onPlayerFell(ctx.mapId);
        if (roomId !== undefined) releaseEmptyRoom(ctx, roomId);
        return;
    }
    const landing = game.getFreeSpace(ws, ctx.mapId, back.x, back.y, "dungeon.pozo") ?? back;
    game.telep(ws, ctx.mapId, landing.x, landing.y, "dungeon.pozo");
}

// Una sala cerrada que quedó sin jugadores (se cayeron todos) se abre, para poder volver; se cierra otra vez al entrar.
function releaseEmptyRoom(ctx: MapContext, roomId: number) {
    const roomState = ctx.state.rooms.get(roomId);
    if (!roomState?.locked) return;
    const someoneInside = playersInside(ctx.run).some(
        (user) => Number(user.map) === ctx.mapId && ctx.index.mech.roomOf[coordKey(user.pos.x, user.pos.y)] === roomId && !(user as { dead?: boolean }).dead,
    );
    if (someoneInside) return;
    roomState.locked = false;
    for (const barrier of ctx.index.mech.barriers) {
        if (barrier.tipo !== "sala" || !barrier.salas.includes(roomId)) continue;
        if (barrier.salas.some((id) => ctx.state.rooms.get(id)?.locked)) continue;
        setBarrier(ctx, barrier, true);
    }
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
// en `divide.cantidad` criaturas `divide.npc`. Una criatura con `divide` que no flota se parte al morir (el moco de la
// Gruta de la Botella, el Zol de Zelda).
type SpecialTemplate = {
    // Jefe o minijefe: con uno vivo en la sala cerrada suena la música de combate.
    jefe?: boolean;
    minijefe?: boolean;
    despierta?: number;
    pareja?: string;
    revivirMs?: number;
    flota?: boolean;
    divide?: { npc: number; cantidad: number };
    // Gruta de la Botella: los fantasmas (los Boo) no se dejan tocar a oscuras; a los orejudos (los Pols Voice) solo
    // les entra algo tirado; el escarabajo que retrocede no recibe daño, se empuja; y los de "orden" se matan en orden.
    fantasma?: boolean;
    orejudo?: boolean;
    retrocede?: boolean;
    orden?: number;
};

// Lo que le entra a un orejudo: algo tirado con el Brazalete, una bomba o una flecha.
const THROWN_SOURCES = new Set(["tiro", "bomba", "flecha"]);

function templateOf(npc: { templateNpcIndex?: number } | undefined): SpecialTemplate {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

function registerSpecialNpc(run: DungeonRun, npc: any) {
    if (require("./dungeonHazards").register(npc) || require("./dungeonBoss").register(npc) || require("./dungeonGrotto").register(npc) || require("./dungeonShrine").register(npc) || require("./dungeonShrineBosses").register(npc) || require("./dungeonMaw").register(npc) || require("./dungeonMawBosses").register(npc) || require("./dungeonTower").register(npc) || require("./dungeonTowerBosses").register(npc)) return;
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

// Una criatura común que se parte al morir: las chicas salen donde cayó (cuentan para la sala que se cierra).
function splitOnDeath(ctx: MapContext, npc: any, divide: { npc: number; cantidad: number }) {
    const at = { x: Number(npc.pos?.x), y: Number(npc.pos?.y) };
    const roomId = ctx.index.mech.roomOf[coordKey(at.x, at.y)];
    for (let i = 0; i < divide.cantidad; i++) spawnDungeonNpc(ctx, divide.npc, at, roomId);
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

// Matar en orden (la sala de la llave del jefe de la Gruta de la Botella): si queda viva una de número menor, vuelven
// todas las ya vencidas de la sala; si era la última, aparecen los cofres de la sala.
const ORDER_REVIVE_MS = 1_500;

function onOrderDied(ctx: MapContext, npc: any) {
    const order = Number(templateOf(npc).orden ?? 0);
    const roomId = ctx.index.mech.roomOf[coordKey(npc.pos.x, npc.pos.y)];
    if (!order || roomId === undefined) return;
    const others = roomCreatures(ctx, roomId, npc.id).filter((other) => Number(templateOf(other).orden ?? 0) > 0);
    const killed = ctx.state.orderDead.get(roomId) ?? [];
    const self = { index: Number(npc.templateNpcIndex ?? 0), at: { x: Number(npc.spawnOrigin?.x ?? npc.pos.x), y: Number(npc.spawnOrigin?.y ?? npc.pos.y) } };
    if (others.some((other) => Number(templateOf(other).orden) < order)) {
        ctx.state.orderDead.set(roomId, []);
        tellRun(ctx.run, "No era el orden: los vencidos vuelven a aparecer.", "#FF6B3D");
        setTimeout(() => {
            if (!runs.has(ctx.run.id)) return;
            for (const dead of [...killed, self]) spawnDungeonNpc(ctx, dead.index, dead.at, roomId);
        }, ORDER_REVIVE_MS);
        return;
    }
    ctx.state.orderDead.set(roomId, [...killed, self]);
    if (others.length) return;
    ctx.state.orderDead.delete(roomId);
    const revealed = revealChests(ctx, roomId);
    playSoundAt(ctx.mapId, npc.pos, DUNGEON_SOUNDS.secreto);
    if (revealed) {
        tellRun(ctx.run, revealed === 1 ? "¡En el orden justo! Apareció un cofre." : `¡En el orden justo! Aparecieron ${revealed} cofres.`, "#FFD24A");
        refreshRun(ctx.run);
    }
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
// Las bombas, el arco y el polvo mágico los tiene todo el mundo desde la primera mazmorra (en Zelda se consiguen
// afuera: no los da ninguna).
const DEFAULT_DUNGEON_ITEMS = ["bombas", "arco", "polvo_magico"];

const DUNGEON_ITEMS: Record<string, { nombre: string; accion: "carrera" | "salto" | "fuego" | "gancho" | "pulsera" | "bomba" | "flecha" | "escudo" | "polvo" | null }> = {
    bombas: { nombre: "Bombas", accion: "bomba" },
    arco: { nombre: "Arco", accion: "flecha" },
    polvo_magico: { nombre: "Polvo mágico", accion: "polvo" },
    patas_de_rana: { nombre: "Patas de rana", accion: null },
    pluma: { nombre: "Pluma de Roc", accion: "salto" },
    botas_de_pegaso: { nombre: "Botas de Pegaso", accion: "carrera" },
    // Los de la Roca de la Tortuga (dungeonTools.ts). El Gancho lo va a dar otra mazmorra.
    polvo_de_fuego: { nombre: "Polvo de Fuego", accion: "fuego" },
    gancho: { nombre: "Gancho", accion: "gancho" },
    // El Brazalete de Fuerza (la Pulsera de Zelda) lo da la Gruta de la Botella; el II y el Campo de Protección, otras.
    pulsera: { nombre: "Brazalete de Fuerza", accion: "pulsera" },
    pulsera_poderosa: { nombre: "Brazalete de Fuerza nivel 2", accion: "pulsera" },
    campo_de_proteccion: { nombre: "Campo de Protección", accion: "escudo" },
};

// Ítems que mejoran a otro, como en Zelda: el Brazalete de Fuerza nivel 2 reemplaza al nivel 1 (ocupa su lugar en la
// Mochila y en las teclas) y cumple lo que pedía el 1.
const ITEM_UPGRADES: Record<string, string> = { pulsera: "pulsera_poderosa" };

export function ownedDungeonItems(characterId: string) {
    const progress = getProgressStore().getProgress({ _id: characterId }) as { dungeonItems?: string[] };
    // Los básicos van al final: las teclas por defecto son las dos primeras, y a quien ya tiene la Pluma o las Botas
    // no le cambian. Un ítem mejorado reemplaza al de nivel 1 (no se listan los dos).
    const ids = new Set([...(progress.dungeonItems ?? []), ...DEFAULT_DUNGEON_ITEMS]);
    return [...ids]
        .filter((id) => DUNGEON_ITEMS[id] && !(ITEM_UPGRADES[id] && ids.has(ITEM_UPGRADES[id])))
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
    onOrderDied(ctx, npc);
    require("./dungeonHazards").onNpcDied(npc);
    require("./dungeonBoss").onNpcDied(npc);
    require("./dungeonGrotto").onNpcDied(npc);
    require("./dungeonShrine").onNpcDied(npc);
    require("./dungeonShrineBosses").onNpcDied(npc);
    require("./dungeonMaw").onNpcDied(npc);
    require("./dungeonMawBosses").onNpcDied(npc);
    require("./dungeonTower").onNpcDied(npc);
    require("./dungeonTowerBosses").onNpcDied(npc);
    const boss = ctx.run.floatingBoss;
    if (boss?.npcId === String(npc.id)) {
        ctx.run.floatingBoss = null;
        const divide = templateOf(npc).divide;
        if (divide && !boss.split) splitFloatingBoss(ctx, npc, divide);
    } else if (templateOf(npc).divide && !templateOf(npc).flota) {
        splitOnDeath(ctx, npc, templateOf(npc).divide!);
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
    skinObject,
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
    isObjectRemoved,
    onLeftParty,
    resolveLoginLocation,
    sendLoginState,
    onDisconnect,
    onNpcDied,
    handOverKeys,
    SWIM_ITEM,
    DUNGEON_OBJ: OBJ,
    roomAt,
    roomBounds,
    isRoomLocked,
    hurtPlayer,
    setDungeonObject,
    setDungeonBlocked,
    ownedDungeonItems,
    onThrowHit,
    shrineDataOf,
    solveRoomPuzzle,
    openPitAt,
    setBossPit,
    mawDataOf,
    towerDataOf,
    revealExitsOfRoom,
    despawnRunNpc,
    spawnRunNpc,
    releaseRoomIfEmpty,
    revealBossChests,
    isPitAt,
    bridgePit,
    blocksInRoom,
    vasesInRoom,
    setShrineObject,
    broadcastNpcVitals,
    fallIfHazard,
    toolTargetAt,
    lightTorch,
    meltIce,
    liftAt,
    liftableKindAt,
    canToolHitNpc,
    onNpcStruck,
    bombBlast,
    hitSwitch,
    onAirSwing,
    _resetForTests,
};
