// Mazmorras instanciadas (docs/MAZMORRAS.md): se entra solo por una piedra de invocación, solo o con la party
// (el líder invoca y los demás aceptan), y cada corrida tiene su propia copia de todos los mapas de la mazmorra.
// Adentro no hay PvP, salir de la party te expulsa y la dificultad escala con la cantidad de jugadores.
// Las mazmorras se definen en jsons/dungeons.json.
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
};

type Invite = { runId: string; from: string; expiresAt: number; timer: ReturnType<typeof setTimeout> };

const runs = new Map<string, DungeonRun>();
const runByInstanceMap = new Map<number, string>();
const runByCharacter = new Map<string, string>();
const invites = new Map<string, Invite>();
let panelSeq = 0;
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

function buildState(user: RuntimeCharacter, panel: Record<string, unknown> | null) {
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
            insideRun && insideDef
                ? { dungeonId: insideDef.id, nombre: insideDef.nombre, jugadores: playersInside(insideRun).length, grupo: insideRun.group }
                : null,
    };
}

function sendState(sessionId: EntityId, panel: Record<string, unknown> | null = null) {
    const user = vars.personajes?.[sessionId] as RuntimeCharacter | undefined;
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !client) return;
    getHandleProtocol().dungeonState(buildState(user, panel), client);
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

function entryDeniedReason(user: RuntimeCharacter, def: DungeonDef): string | null {
    if (def.soloDesarrollo && !isDevelopment()) return `${def.nombre} todavía está en desarrollo.`;
    if ((user as { dead?: boolean }).dead) return "Los muertos no pueden entrar a una mazmorra.";
    if (Number(user.level ?? 0) < Number(def.nivelMinimo ?? 1)) return `Necesitás nivel ${def.nivelMinimo} para entrar a ${def.nombre}.`;
    if ((user as { huntersGame?: unknown }).huntersGame || Number(user.map) >= 1000) return "No podés entrar a una mazmorra desde acá.";
    if (runOfUser(user)) return "Ya estás en una mazmorra.";
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

function spawnRunNpcs(baseMap: number, instanceMap: number, factors: { vida: number; dano: number }) {
    const { loadMapNpcPlacements } = require("./mapNpcStorage");
    const LoadNpcs = require("./loadNpcs");
    const loader = new LoadNpcs();
    for (const entry of loadMapNpcPlacements(baseMap)) {
        loader.createNpcInMap({ ...entry, mapNum: instanceMap }, true, false, true);
    }
    for (const npc of Object.values(vars.npcs ?? {}) as any[]) {
        if (!npc || npc.map !== instanceMap || Number(npc.attackable ?? 1) === 0) continue;
        npc.maxHp = Math.round(Number(npc.maxHp ?? 0) * factors.vida);
        npc.hp = npc.maxHp;
        npc.minHit = Math.round(Number(npc.minHit ?? 0) * factors.dano);
        npc.maxHit = Math.round(Number(npc.maxHit ?? 0) * factors.dano);
    }
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
    }
    runs.set(run.id, run);
    ensureSweep();
    return run;
}

function destroyRun(run: DungeonRun) {
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
        default:
            return tell(sessionId, "Uso: /mazmorra entrar solo | entrar grupo | aceptar | rechazar | salir", "white");
    }
}

// --- Enganches con el resto del server ---

// Cada paso adentro: el portal de salida saca de la mazmorra y las escaleras llevan a la instancia del otro mapa.
// Devuelve true si el paso ya quedó resuelto.
export function handleStep(ws: RuntimeClient, user: RuntimeCharacter, x: number, y: number): boolean {
    const run = runOfMap(Number(user.map));
    if (!run) return false;
    const def = getDefinition(run.dungeonId);
    const baseMap = baseMapOf(Number(user.map));
    if (!def || baseMap === null) return false;
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
    return true;
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

// Las criaturas de una mazmorra no reaparecen.
export function shouldSkipRespawn(npc: { map?: number }): boolean {
    return isDungeonInstanceMap(npc.map);
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
    handleNpcInteraction,
    handleCommand,
    enter,
    acceptInvite,
    declineInvite,
    leaveRun,
    handleStep,
    onLeftParty,
    resolveLoginLocation,
    shouldSkipRespawn,
    _resetForTests,
};
