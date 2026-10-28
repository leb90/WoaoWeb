// Torre del Águila (docs/mazmorras/08-TORRE_DEL_AGUILA.md): las mecánicas propias. Los jefes (el Flautista y el Águila
// Malvada) están en dungeonTowerBosses.ts.
// - Los pilares y el Orbe: el Orbe se levanta con el Brazalete (como la bola del Machacador) y se tira; si le pega a un
//   pilar, lo rompe. Con los cuatro rotos la torre tiembla: el piso de arriba se derrumba sobre este y aparecen las
//   escaleras que esperaban ("escalerasTrasPilares" de la leyenda). Si el Orbe cae a un pozo, o su portador se muere,
//   cambia de mapa o sale, vuelve a su lugar.
// - Los Tragones (los Like Like): se arrastran hacia el más cercano y, al lado, se lo tragan un momento (no puede
//   moverse ni atacar) y lo escupen; si tenía el Campo de Protección levantado, se lo comen: no se puede levantar por
//   un rato.
// - Los ojos de piedra que abren puertas: en las salas de "salasOjos", romperlos todos (el Campo rebota su rayo,
//   dungeonShrine.ts) abre las puertas = de la sala.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";
export {};
const vars = require("./vars");

const ORB_THROW_RANGE = 4;
const ORB_STEP_MS = 70;
const ORB_RETURN_MS = 1_800;
const ORB_HIT_DAMAGE = 0.25;
const PILLARS_TO_COLLAPSE = 4;
const COLLAPSE_MS = 1_600;
const SWALLOW_MS = 1_400;
const SWALLOW_DAMAGE = 0.06;
const SWALLOW_COOLDOWN_MS = 4_500;
const FIELD_EATEN_MS = 15_000;
const SWALLOWER_STEP_MS = 650;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean; heading?: number; dungeonCarry?: { tipo: string } | null; dungeonMotion?: { tipo: string; until: number } | null };
type Pillar = { x: number; y: number; sala: number; broken: boolean };
type Orb = { home: Pos; at: Pos | null; carrierId: string | null; flying: boolean; returnAt: number };
type TowerMap = {
    mapId: number;
    roomOf: Record<string, number>;
    pillars: Map<string, Pillar>;
    orb: Orb | null;
    eyeRooms: Set<number>;
    collapsed: boolean;
};
type Swallower = { npcId: string; mapId: number; room: number; nextAt: number; touchedAt: Map<string, number> };

const maps = new Map<number, TowerMap>();
const swallowers = new Map<string, Swallower>();

function getDungeons() {
    return require("./dungeons");
}

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

function getMotion() {
    return require("./dungeonMotion");
}

function getTools() {
    return require("./dungeonTools");
}

const coordKey = (x: number, y: number) => `${x},${y}`;
const chebyshev = (a: Pos, b: Pos) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

function templateOf(npc: { templateNpcIndex?: number } | undefined): { tragon?: boolean } {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

// El estado de la torre de un mapa de corrida: se arma la primera vez que hace falta.
function stateOf(mapId: number): TowerMap | null {
    if (maps.has(mapId)) return maps.get(mapId)!;
    const data = getDungeons().towerDataOf(mapId);
    if (!data) return null;
    const { torre, roomOf } = data;
    const state: TowerMap = {
        mapId,
        roomOf,
        pillars: new Map(torre.pilares.map((p: { x: number; y: number; sala: number }) => [coordKey(p.x, p.y), { ...p, broken: false }])),
        orb: torre.orbe ? { home: { ...torre.orbe }, at: { ...torre.orbe }, carrierId: null, flying: false, returnAt: 0 } : null,
        eyeRooms: new Set(torre.salasOjos),
        collapsed: false,
    };
    maps.set(mapId, state);
    return state;
}

function playersOf(mapId: number): Player[] {
    return (Object.values(vars.personajes ?? {}) as Player[]).filter((user) => user && !user.dead && Number(user.map) === mapId);
}

function eachClientNear(mapId: number, pos: Pos, send: (client: RuntimeClient) => void) {
    getGame().loopAreaPos(mapId, { x: Math.round(pos.x), y: Math.round(pos.y) }, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) send(client);
    });
}

function packet(mapId: number, pos: Pos, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.dungeonBoss({ tipo: "torre", ...payload }, client));
}

// A todos los del mapa (el derrumbe se siente en toda la torre).
function packetToMap(mapId: number, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    for (const user of playersOf(mapId)) {
        const client = vars.clients?.[user.id] as RuntimeClient | undefined;
        if (client) handleProtocol.dungeonBoss({ tipo: "torre", ...payload }, client);
    }
}

function motionPacket(mapId: number, pos: Pos, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.dungeonMotion(payload, client));
}

function sound(mapId: number, pos: Pos, soundId: number) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.playSound(0, soundId, client));
}

function tellMap(mapId: number, text: string, color = "#FFD24A") {
    const handleProtocol = getHandleProtocol();
    for (const user of playersOf(mapId)) {
        const client = vars.clients?.[user.id] as RuntimeClient | undefined;
        if (client) handleProtocol.console(text, color, 1, 0, client);
    }
}

function tell(user: RuntimeCharacter | null | undefined, text: string) {
    const client = user ? (vars.clients?.[user.id] as RuntimeClient | undefined) : undefined;
    if (client) getHandleProtocol().console(text, "white", 1, 0, client);
}

function objectAt(mapId: number, tile: Pos): number {
    return Number(vars.mapa[mapId]?.[tile.y]?.[tile.x]?.objInfo?.objIndex ?? 0);
}

function isFree(mapId: number, tile: Pos): boolean {
    const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
    if (!cell || cell.blocked || vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id) return false;
    return !getDungeons().isHazard(mapId, tile.x, tile.y) && !getGame().hayAgua(mapId, tile);
}

// --- Registro ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    if (!template.tragon) return false;
    const mapId = Number(npc.map);
    const room = getDungeons().roomAt(mapId, npc.pos.x, npc.pos.y);
    if (room === undefined) return false;
    swallowers.set(String(npc.id), { npcId: String(npc.id), mapId, room, nextAt: Date.now(), touchedAt: new Map() });
    npc.customMotion = true;
    return true;
}

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    swallowers.delete(String(npc?.id ?? ""));
}

export function forgetMap(mapId: number) {
    maps.delete(mapId);
    for (const [id, swallower] of swallowers) if (swallower.mapId === mapId) swallowers.delete(id);
}

// --- Los pilares y el Orbe ---

function placeOrb(state: TowerMap, at: Pos) {
    const orb = state.orb!;
    orb.at = { ...at };
    orb.carrierId = null;
    orb.flying = false;
    orb.returnAt = 0;
    getDungeons().setDungeonObject(state.mapId, at.x, at.y, getDungeons().DUNGEON_OBJ.orbe);
    getDungeons().setDungeonBlocked(state.mapId, at.x, at.y, true);
}

function orbHome(state: TowerMap, why: string) {
    const orb = state.orb!;
    if (orb.at) {
        getDungeons().setDungeonObject(state.mapId, orb.at.x, orb.at.y, 0);
        getDungeons().setDungeonBlocked(state.mapId, orb.at.x, orb.at.y, false);
    }
    orb.at = null;
    orb.carrierId = null;
    orb.flying = false;
    orb.returnAt = Date.now() + ORB_RETURN_MS;
    tellMap(state.mapId, why, "#E8E0C8");
}

// El Brazalete sobre la baldosa de adelante: si ahí está el Orbe, lo levanta.
export function liftOrb(user: Player, front: Pos): boolean {
    const state = stateOf(Number(user.map));
    const orb = state?.orb;
    if (!state || !orb || !orb.at || orb.flying || orb.at.x !== front.x || orb.at.y !== front.y) return false;
    getDungeons().setDungeonObject(state.mapId, orb.at.x, orb.at.y, 0);
    getDungeons().setDungeonBlocked(state.mapId, orb.at.x, orb.at.y, false);
    orb.at = null;
    orb.carrierId = String(user.id);
    return true;
}

// Lo tira hacia adonde mira: vuela hasta 4 baldosas, por encima de los pozos. Si del otro lado de donde frena hay un
// pilar, lo rompe; si le pega a una criatura, la lastima. Cae en la última baldosa libre (si es un pozo, se pierde y
// vuelve a su lugar).
export function throwOrb(user: Player, heading: number, dir: Pos) {
    const state = stateOf(Number(user.map));
    const orb = state?.orb;
    if (!state || !orb || orb.carrierId !== String(user.id)) return;
    const tools = getTools();
    const dungeons = getDungeons();
    const line = tools.traceLine(state.mapId, user.pos, dir, ORB_THROW_RANGE, false);
    const stopAt: Pos = line.npcId ? line.end! : (line.end ?? { x: user.pos.x, y: user.pos.y });
    const landing: Pos = line.npcId || line.target ? (line.path.at(-1) ?? { x: user.pos.x, y: user.pos.y }) : stopAt;
    const beyond = { x: landing.x + dir.x, y: landing.y + dir.y };
    const pillar = line.blocked || line.target ? state.pillars.get(coordKey(beyond.x, beyond.y)) : undefined;
    const hitsPillar = Boolean(pillar && !pillar.broken && objectAt(state.mapId, beyond) === dungeons.DUNGEON_OBJ.pilar);
    const distance = Math.max(1, Math.abs(stopAt.x - user.pos.x) + Math.abs(stopAt.y - user.pos.y));
    orb.carrierId = null;
    orb.flying = true;
    motionPacket(state.mapId, user.pos, {
        id: Number(user.id),
        tipo: "tira",
        heading,
        ms: ORB_STEP_MS,
        to: stopAt,
        golpe: line.npcId ? "criatura" : line.blocked || line.target ? "pared" : null,
        obj: dungeons.DUNGEON_OBJ.orbe,
        entera: true,
    });
    setTimeout(() => {
        if (maps.get(state.mapId) !== state || state.orb !== orb) return;
        orb.flying = false;
        if (line.npcId) {
            const npc = vars.npcs?.[line.npcId];
            if (npc && dungeons.canToolHitNpc(npc, "tiro")) tools.damageNpc(user, line.npcId, Math.max(1, Math.ceil(Number(npc.maxHp ?? npc.hp ?? 1) * ORB_HIT_DAMAGE)), "tiro");
        }
        if (hitsPillar && pillar) breakPillar(state, pillar, user);
        if (dungeons.isHazard(state.mapId, landing.x, landing.y) || getGame().hayAgua(state.mapId, landing)) {
            packet(state.mapId, landing, { estado: "cae", x: landing.x, y: landing.y });
            orbHome(state, "El Orbe cayó al vacío... vuelve a su lugar.");
            return;
        }
        // Si la baldosa quedó ocupada (alguien se paró ahí), cae al lado.
        const spot = isFree(state.mapId, landing) ? landing : [[0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dy]) => ({ x: landing.x + dx, y: landing.y + dy })).find((tile) => isFree(state.mapId, tile)) ?? landing;
        placeOrb(state, spot);
        sound(state.mapId, spot, tools.TOOL_SOUNDS.romper);
    }, distance * ORB_STEP_MS);
}

// Se le cayó (murió, salió del mapa o lo soltó): cae a sus pies, o vuelve a su lugar si ahí no hay piso.
export function dropOrb(user: Player) {
    for (const state of maps.values()) {
        const orb = state.orb;
        if (!orb || orb.carrierId !== String(user.id)) continue;
        const at = { x: user.pos.x, y: user.pos.y };
        if (Number(user.map) === state.mapId && !user.dead && isFree(state.mapId, at)) placeOrb(state, at);
        else orbHome(state, "El Orbe vuelve a su lugar.");
    }
}

function breakPillar(state: TowerMap, pillar: Pillar, user: Player) {
    const dungeons = getDungeons();
    pillar.broken = true;
    dungeons.setDungeonObject(state.mapId, pillar.x, pillar.y, dungeons.DUNGEON_OBJ.pilarRoto);
    sound(state.mapId, pillar, getTools().TOOL_SOUNDS.romper);
    packet(state.mapId, pillar, { estado: "pilar", x: pillar.x, y: pillar.y });
    const broken = [...state.pillars.values()].filter((p) => p.broken).length;
    const total = Math.min(state.pillars.size, PILLARS_TO_COLLAPSE);
    tellMap(state.mapId, `¡${String(user.nameCharacter ?? "Alguien")} tiró un pilar! (${broken} de ${total})`);
    if (broken >= total && !state.collapsed) collapse(state);
}

// Con los cuatro pilares rotos, el piso de arriba se derrumba sobre este: aparecen las escaleras que esperaban.
function collapse(state: TowerMap) {
    state.collapsed = true;
    const dungeons = getDungeons();
    const center = [...state.pillars.values()].reduce((acc, p) => ({ x: acc.x + p.x / state.pillars.size, y: acc.y + p.y / state.pillars.size }), { x: 0, y: 0 });
    packetToMap(state.mapId, { estado: "derrumbe", ms: COLLAPSE_MS, x: Math.round(center.x), y: Math.round(center.y) });
    for (const user of playersOf(state.mapId)) sound(state.mapId, user.pos, dungeons.DUNGEON_SOUNDS.derrumbe);
    tellMap(state.mapId, "¡La torre entera tiembla! Sin los pilares, el piso de arriba se vino abajo.", "#FF6B3D");
    setTimeout(() => {
        if (maps.get(state.mapId) !== state) return;
        if (dungeons.revealExitsOfRoom(state.mapId, -1)) tellMap(state.mapId, "Entre los escombros apareció una escalera: lleva a lo más alto de la torre.");
    }, COLLAPSE_MS);
}

export function isCollapsed(mapId: number): boolean {
    return Boolean(maps.get(mapId)?.collapsed);
}

function tickOrb(state: TowerMap, now: number) {
    const orb = state.orb;
    if (!orb) return;
    if (orb.carrierId) {
        const carrier = vars.personajes?.[orb.carrierId] as Player | undefined;
        const still = carrier && !carrier.dead && Number(carrier.map) === state.mapId && carrier.dungeonCarry?.tipo === "orbe";
        if (!still) {
            if (carrier?.dungeonCarry?.tipo === "orbe") getTools().dropCarry(carrier);
            else orbHome(state, "El Orbe vuelve a su lugar.");
        }
        return;
    }
    if (!orb.at && !orb.flying && orb.returnAt && now >= orb.returnAt) {
        const spot = isFree(state.mapId, orb.home) ? orb.home : [[0, 1], [1, 0], [-1, 0], [0, -1]].map(([dx, dy]) => ({ x: orb.home.x + dx, y: orb.home.y + dy })).find((tile) => isFree(state.mapId, tile)) ?? orb.home;
        placeOrb(state, spot);
        packet(state.mapId, spot, { estado: "aparece", x: spot.x, y: spot.y });
    }
}

// --- Los Tragones ---

function moveNpc(npc: any, mapId: number, to: Pos) {
    const cell = vars.mapData[mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    require("./targetAssist").recordTileLeft(npc, mapId, npc.pos.x, npc.pos.y);
    const d = vars.direcciones;
    const dx = to.x - npc.pos.x;
    const dy = to.y - npc.pos.y;
    npc.heading = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? d.right : d.left) : dy > 0 ? d.down : d.up;
    npc.pos.x = to.x;
    npc.pos.y = to.y;
    vars.mapData[mapId][to.y][to.x].id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

function swallow(swallower: Swallower, npc: any, user: Player, now: number) {
    swallower.touchedAt.set(String(user.id), now + SWALLOW_COOLDOWN_MS);
    const tools = getTools();
    const ate = tools.eatField(user, FIELD_EATEN_MS);
    (user as Player).dungeonMotion = { tipo: "tragado", until: now + SWALLOW_MS };
    packet(swallower.mapId, user.pos, { estado: "traga", id: Number(user.id), x: npc.pos.x, y: npc.pos.y, ms: SWALLOW_MS });
    sound(swallower.mapId, npc.pos, tools.TOOL_SOUNDS.levantar);
    getDungeons().hurtPlayer(user, SWALLOW_DAMAGE, "¡Te tragó un Tragón!");
    if (ate) tell(user, `¡El Tragón se comió tu Campo de Protección! Vuelve en ${Math.round(FIELD_EATEN_MS / 1000)} s.`);
    setTimeout(() => {
        const victim = vars.personajes?.[user.id] as Player | undefined;
        const alive = vars.npcs?.[swallower.npcId];
        if (!victim || victim.dungeonMotion?.tipo !== "tragado") return;
        victim.dungeonMotion = null;
        packet(swallower.mapId, victim.pos, { estado: "escupe", id: Number(victim.id), ms: 300 });
        if (victim.dead || !alive) return;
        const dx = Math.sign(victim.pos.x - alive.pos.x);
        const dy = Math.sign(victim.pos.y - alive.pos.y);
        const dir = Math.abs(victim.pos.x - alive.pos.x) >= Math.abs(victim.pos.y - alive.pos.y) ? { x: dx || 1, y: 0 } : { x: 0, y: dy || 1 };
        getMotion().push(victim, dir, 2);
    }, SWALLOW_MS);
}

function tickSwallower(swallower: Swallower, npc: any, now: number) {
    if (now < swallower.nextAt) return;
    swallower.nextAt = now + SWALLOWER_STEP_MS;
    const dungeons = getDungeons();
    const players = playersOf(swallower.mapId).filter((user) => dungeons.roomAt(swallower.mapId, user.pos.x, user.pos.y) === swallower.room);
    if (!players.length) return;
    let target: Player | null = null;
    let best = Infinity;
    for (const user of players) {
        const distance = Math.hypot(user.pos.x - npc.pos.x, user.pos.y - npc.pos.y);
        if (distance < best) {
            best = distance;
            target = user;
        }
    }
    if (!target) return;
    if (chebyshev(target.pos, npc.pos) <= 1) {
        if (now >= (swallower.touchedAt.get(String(target.id)) ?? 0) && !getMotion().isAirborne(target) && !getMotion().isMoving(target)) swallow(swallower, npc, target, now);
        return;
    }
    const dx = Math.sign(target.pos.x - npc.pos.x);
    const dy = Math.sign(target.pos.y - npc.pos.y);
    const main = Math.abs(target.pos.x - npc.pos.x) >= Math.abs(target.pos.y - npc.pos.y) ? { x: dx, y: 0 } : { x: 0, y: dy };
    const other = main.x ? { x: 0, y: dy } : { x: dx, y: 0 };
    for (const dir of [main, other]) {
        if (!dir.x && !dir.y) continue;
        const next = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
        if (dungeons.roomAt(swallower.mapId, next.x, next.y) !== swallower.room || !isFree(swallower.mapId, next)) continue;
        moveNpc(npc, swallower.mapId, next);
        return;
    }
}

// --- Los ojos de piedra ---

// Se rompió un ojo (dungeonShrine.ts): si era el último de una sala de "salasOjos", se abren sus puertas.
export function onEyeBroken(mapId: number, room: number, left: number) {
    const state = stateOf(mapId);
    if (!state || left > 0 || !state.eyeRooms.has(room)) return;
    getDungeons().solveRoomPuzzle(mapId, room, "¡Se rompieron todos los ojos de piedra de la sala!");
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    const state = stateOf(mapId);
    if (state) tickOrb(state, now);
    for (const swallower of swallowers.values()) {
        if (swallower.mapId !== mapId) continue;
        const npc = vars.npcs?.[swallower.npcId];
        if (!npc) {
            swallowers.delete(swallower.npcId);
            continue;
        }
        tickSwallower(swallower, npc, now);
    }
}

module.exports = { register, onNpcDied, forgetMap, tick, onEyeBroken, liftOrb, throwOrb, dropOrb, isCollapsed };
