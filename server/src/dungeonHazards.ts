// Trampas con movimiento propio de la Cueva de la Cola (docs/mazmorras/03-CUEVA_DE_LA_COLA.md, sección 7). Las marca la
// plantilla de la criatura en npcs.json y las mueve este módulo, no la IA (npc.customMotion):
// - chispa: no se mata; da vueltas alrededor del pilar o del cofre que tiene al lado (las 8 baldosas que lo rodean)
//   y quema al tocar. Si no tiene nada al lado, sigue la pared con la mano derecha;
// - cuchilla: quieta hasta que alguien queda en su fila o columna; ahí sale disparada hasta chocar y vuelve despacio.
//   Un bloque empujado en el medio le corta el recorrido;
// - rodillo: el minijefe (Ogro del Rodillo) empuja una columna de púas que cruza la sala de punta a punta; al llegar,
//   salta al otro lado y la empuja de vuelta. No lastima al que está en el aire (la Pluma);
// - empuja: el golpe de la criatura corre al jugador unas baldosas (y lo puede tirar a un pozo).
import type { EntityId, RuntimeCharacter } from "./types/runtime";

export {};

const vars = require("./vars");

const SPARK_STEP_MS = 260;
const SPARK_DAMAGE = 0.1;
const BLADE_RANGE = 7;
const BLADE_CHARGE_STEP_MS = 55;
const BLADE_RETURN_STEP_MS = 220;
const BLADE_REST_MS = 800;
const BLADE_DAMAGE = 0.1;
const ROLLER_STEP_MS = 170;
const ROLLER_PAUSE_MS = 1_500;
const ROLLER_DAMAGE = 0.15;
// Un mismo jugador no se quema dos veces seguidas con la misma trampa.
const HIT_COOLDOWN_MS = 700;

type Pos = { x: number; y: number };
// Arriba, derecha, abajo, izquierda: girar a la derecha es sumar 1.
const DIRS: Pos[] = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
];

type HazardTemplate = { chispa?: boolean; cuchilla?: boolean; rodillo?: boolean; empuja?: number };
type Spark = { npcId: string; mapId: number; dir: number; nextAt: number; loop: Pos[] | null; index: number };
// Las 8 baldosas alrededor de un centro, en el sentido de las agujas del reloj.
const RING: Pos[] = [
    { x: -1, y: -1 },
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
];
type Blade = { npcId: string; mapId: number; home: Pos; state: "quieta" | "carga" | "vuelta"; dir: Pos; nextAt: number };
type Roller = {
    npcId: string;
    mapId: number;
    room: number;
    bounds: { x1: number; y1: number; x2: number; y2: number };
    // Columna en la que está el rodillo (null: todavía no salió) y hacia dónde va.
    col: number | null;
    dir: 1 | -1;
    nextAt: number;
    tiles: Pos[];
};

const sparks = new Map<string, Spark>();
const blades = new Map<string, Blade>();
const rollers = new Map<string, Roller>();
const lastHitAt = new Map<string, number>();

function getDungeons() {
    return require("./dungeons");
}

function getGame() {
    return require("./game");
}

function getNpcs() {
    return require("./npcs");
}

function getMotion() {
    return require("./dungeonMotion");
}

function templateOf(npc: { templateNpcIndex?: number } | undefined): HazardTemplate {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

// Por donde puede pasar una trampa: piso sin bloquear, sin pozos ni puertas (trigger 2), sin escaleras ni agua.
function isOpenFloor(mapId: number, x: number, y: number): boolean {
    const tile = vars.mapa[mapId]?.[y]?.[x];
    if (!tile || tile.blocked || Number(tile.trigger ?? 0) === 2 || tile.tileExit !== undefined) return false;
    return !getGame().hayAgua(mapId, { x, y });
}

function playerAt(mapId: number, x: number, y: number): RuntimeCharacter | null {
    const id = vars.mapData[mapId]?.[y]?.[x]?.id;
    const user = id ? (vars.personajes?.[id] as (RuntimeCharacter & { dead?: boolean }) | undefined) : undefined;
    return user && !user.dead ? user : null;
}

// Quema y empuja una baldosa hacia `dir` (salvo en el aire, o si la misma trampa le pegó recién).
function hitPlayer(user: RuntimeCharacter, trapId: string, fraction: number, message: string, dir: Pos, tiles = 1) {
    const motion = getMotion();
    if (motion.isAirborne(user)) return;
    const key = `${trapId}:${user.id}`;
    const now = Date.now();
    if (now < (lastHitAt.get(key) ?? 0)) return;
    lastHitAt.set(key, now + HIT_COOLDOWN_MS);
    getDungeons().hurtPlayer(user, fraction, message);
    if (!(user as { dead?: boolean }).dead) motion.push(user, dir, tiles);
}

// Mueve una criatura sin las reglas de la IA (el rodillo salta de punta a punta).
function placeNpc(npc: any, to: Pos) {
    if (npc.pos.x === to.x && npc.pos.y === to.y) return;
    const cell = vars.mapData[npc.map]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    const dx = Math.sign(to.x - npc.pos.x);
    const dy = Math.sign(to.y - npc.pos.y);
    const dir = vars.direcciones;
    npc.heading = dx > 0 ? dir.right : dx < 0 ? dir.left : dy > 0 ? dir.down : dir.up;
    npc.pos.x = to.x;
    npc.pos.y = to.y;
    vars.mapData[npc.map][to.y][to.x].id = npc.id;
    getNpcs().npcToArea(npc.id, npc.heading);
}

// El anillo alrededor del pilar o cofre que la chispa tiene al lado, arrancando donde está ella.
function sparkLoop(mapId: number, from: Pos): Pos[] | null {
    for (const offset of [...DIRS, { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }]) {
        const center = { x: from.x + offset.x, y: from.y + offset.y };
        if (!vars.mapa[mapId]?.[center.y]?.[center.x]?.blocked) continue;
        const ring = RING.map((r) => ({ x: center.x + r.x, y: center.y + r.y }));
        const start = ring.findIndex((tile) => tile.x === from.x && tile.y === from.y);
        if (start < 0 || !ring.every((tile) => isOpenFloor(mapId, tile.x, tile.y))) continue;
        return [...ring.slice(start), ...ring.slice(0, start)];
    }
    return null;
}

// --- Registro (lo llama dungeons.ts al crear la corrida o al aparecer una criatura) ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    const id = String(npc.id);
    const mapId = Number(npc.map);
    if (template.chispa) {
        sparks.set(id, { npcId: id, mapId, dir: 0, nextAt: 0, loop: sparkLoop(mapId, npc.pos), index: 0 });
    } else if (template.cuchilla) {
        blades.set(id, { npcId: id, mapId, home: { x: npc.pos.x, y: npc.pos.y }, state: "quieta", dir: { x: 0, y: 0 }, nextAt: 0 });
    } else if (template.rodillo) {
        const dungeons = getDungeons();
        const room = dungeons.roomAt(mapId, npc.pos.x, npc.pos.y);
        const bounds = room === undefined ? null : dungeons.roomBounds(mapId, room);
        if (!bounds) return false;
        // Sale del lado del ogro hacia el otro.
        const dir = npc.pos.x - bounds.x1 <= bounds.x2 - npc.pos.x ? 1 : -1;
        rollers.set(id, { npcId: id, mapId, room, bounds, col: null, dir, nextAt: 0, tiles: [] });
    } else {
        return false;
    }
    npc.customMotion = true;
    return true;
}

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    const id = String(npc?.id ?? "");
    sparks.delete(id);
    blades.delete(id);
    const roller = rollers.get(id);
    if (roller) {
        clearRoller(roller);
        rollers.delete(id);
    }
}

export function forgetMap(mapId: number) {
    for (const [id, spark] of sparks) if (spark.mapId === mapId) sparks.delete(id);
    for (const [id, blade] of blades) if (blade.mapId === mapId) blades.delete(id);
    for (const [id, roller] of rollers) if (roller.mapId === mapId) rollers.delete(id);
}

// El golpe de una criatura que empuja (los escarabajos): corre al jugador lejos de ella.
export function onNpcMeleeHit(npc: any, user: RuntimeCharacter) {
    const tiles = Number(templateOf(npc).empuja ?? 0);
    if (!tiles || !getDungeons().isDungeonInstanceMap(user.map)) return;
    const dx = user.pos.x - npc.pos.x;
    const dy = user.pos.y - npc.pos.y;
    const dir = Math.abs(dx) >= Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) };
    getMotion().push(user, dir, tiles);
}

// --- Cada 50 ms, por mapa de la corrida ---

export function tick(mapId: number, now: number) {
    for (const spark of sparks.values()) if (spark.mapId === mapId && now >= spark.nextAt) stepSpark(spark, now);
    for (const blade of blades.values()) if (blade.mapId === mapId && now >= blade.nextAt) stepBlade(blade, now);
    for (const roller of rollers.values()) if (roller.mapId === mapId && now >= roller.nextAt) stepRoller(roller, now);
}

// Chispa: la vuelta alrededor de su pilar o, si no tiene, la mano derecha contra la pared (prueba a la derecha,
// derecho, a la izquierda y para atrás).
function stepSpark(spark: Spark, now: number) {
    spark.nextAt = now + SPARK_STEP_MS;
    const npc = vars.npcs?.[spark.npcId];
    if (!npc) {
        sparks.delete(spark.npcId);
        return;
    }
    if (spark.loop) {
        const next = spark.loop[(spark.index + 1) % spark.loop.length];
        const dir = { x: next.x - npc.pos.x, y: next.y - npc.pos.y };
        const user = playerAt(spark.mapId, next.x, next.y);
        if (user) {
            hitPlayer(user, spark.npcId, SPARK_DAMAGE, "Te quemó una chispa:", dir);
            return;
        }
        if (vars.mapData[spark.mapId]?.[next.y]?.[next.x]?.id) return;
        getNpcs().moveNpcByPos(spark.npcId, next);
        if (npc.pos.x === next.x && npc.pos.y === next.y) spark.index = (spark.index + 1) % spark.loop.length;
        return;
    }
    for (const turn of [1, 0, 3, 2]) {
        const dir = (spark.dir + turn) % 4;
        const to = { x: npc.pos.x + DIRS[dir].x, y: npc.pos.y + DIRS[dir].y };
        if (!isOpenFloor(spark.mapId, to.x, to.y)) continue;
        spark.dir = dir;
        const user = playerAt(spark.mapId, to.x, to.y);
        if (user) {
            hitPlayer(user, spark.npcId, SPARK_DAMAGE, "Te quemó una chispa:", DIRS[dir]);
            return;
        }
        if (vars.mapData[spark.mapId]?.[to.y]?.[to.x]?.id) return;
        getNpcs().moveNpcByPos(spark.npcId, to);
        return;
    }
}

// Alguien en la fila o la columna de la cuchilla, a la vista: sin paredes ni bloques en el medio.
function bladeTarget(blade: Blade, npc: any): Pos | null {
    for (const dir of DIRS) {
        for (let distance = 1; distance <= BLADE_RANGE; distance++) {
            const x = npc.pos.x + dir.x * distance;
            const y = npc.pos.y + dir.y * distance;
            if (!isOpenFloor(blade.mapId, x, y)) break;
            if (playerAt(blade.mapId, x, y)) return dir;
            if (vars.mapData[blade.mapId]?.[y]?.[x]?.id) break;
        }
    }
    return null;
}

function stepBlade(blade: Blade, now: number) {
    const npc = vars.npcs?.[blade.npcId];
    if (!npc) {
        blades.delete(blade.npcId);
        return;
    }
    if (blade.state === "quieta") {
        blade.nextAt = now + 100;
        const dir = bladeTarget(blade, npc);
        if (!dir) return;
        blade.state = "carga";
        blade.dir = dir;
        getDungeons().playDungeonSound(blade.mapId, npc.pos, "carrera");
    }
    if (blade.state === "carga") {
        blade.nextAt = now + BLADE_CHARGE_STEP_MS;
        const to = { x: npc.pos.x + blade.dir.x, y: npc.pos.y + blade.dir.y };
        const user = playerAt(blade.mapId, to.x, to.y);
        if (user) {
            hitPlayer(user, blade.npcId, BLADE_DAMAGE, "Te cortó una cuchilla:", blade.dir);
            blade.state = "vuelta";
            return;
        }
        if (!isOpenFloor(blade.mapId, to.x, to.y) || vars.mapData[blade.mapId]?.[to.y]?.[to.x]?.id) {
            getDungeons().playDungeonSound(blade.mapId, npc.pos, "golpe");
            blade.state = "vuelta";
            return;
        }
        getNpcs().moveNpcByPos(blade.npcId, to);
        return;
    }
    // Vuelta a su lugar, despacio.
    blade.nextAt = now + BLADE_RETURN_STEP_MS;
    if (npc.pos.x === blade.home.x && npc.pos.y === blade.home.y) {
        blade.state = "quieta";
        blade.nextAt = now + BLADE_REST_MS;
        return;
    }
    const to = { x: npc.pos.x + Math.sign(blade.home.x - npc.pos.x), y: npc.pos.y + Math.sign(blade.home.y - npc.pos.y) };
    if (!vars.mapData[blade.mapId]?.[to.y]?.[to.x]?.id) getNpcs().moveNpcByPos(blade.npcId, to);
}

// --- Rodillo de púas ---

function clearRoller(roller: Roller) {
    const dungeons = getDungeons();
    for (const tile of roller.tiles) dungeons.setDungeonObject(roller.mapId, tile.x, tile.y, 0);
    roller.tiles = [];
    roller.col = null;
}

// Las baldosas de piso de una columna de la sala, de punta a punta.
function rollerColumn(roller: Roller, col: number): Pos[] {
    const dungeons = getDungeons();
    const tiles: Pos[] = [];
    for (let y = roller.bounds.y1; y <= roller.bounds.y2; y++) {
        if (dungeons.roomAt(roller.mapId, col, y) === roller.room && isOpenFloor(roller.mapId, col, y)) tiles.push({ x: col, y });
    }
    return tiles;
}

function stepRoller(roller: Roller, now: number) {
    const npc = vars.npcs?.[roller.npcId];
    if (!npc) {
        clearRoller(roller);
        rollers.delete(roller.npcId);
        return;
    }
    const dungeons = getDungeons();
    // Rueda solo mientras dura la pelea (la sala cerrada).
    if (!dungeons.isRoomLocked(roller.mapId, roller.room)) {
        if (roller.col !== null) clearRoller(roller);
        roller.nextAt = now + 500;
        return;
    }
    const start = roller.dir === 1 ? roller.bounds.x1 + 1 : roller.bounds.x2 - 1;
    const end = roller.dir === 1 ? roller.bounds.x2 : roller.bounds.x1;
    if (roller.col === null) {
        // Sale al lado del ogro, después de una pausa.
        roller.col = start - roller.dir;
        roller.nextAt = now + ROLLER_PAUSE_MS;
        dungeons.playDungeonSound(roller.mapId, npc.pos, "aplastador");
        return;
    }
    const col = roller.col + roller.dir;
    if (roller.dir === 1 ? col > end : col < end) {
        // Llegó a la otra punta: el ogro salta detrás del rodillo y lo empuja de vuelta.
        clearRoller(roller);
        const landing = { x: end, y: npc.pos.y };
        if (!vars.mapData[roller.mapId]?.[landing.y]?.[landing.x]?.id && isOpenFloor(roller.mapId, landing.x, landing.y)) placeNpc(npc, landing);
        roller.dir = roller.dir === 1 ? -1 : 1;
        roller.nextAt = now + ROLLER_PAUSE_MS;
        return;
    }
    for (const tile of roller.tiles) dungeons.setDungeonObject(roller.mapId, tile.x, tile.y, 0);
    roller.col = col;
    roller.tiles = rollerColumn(roller, col).filter((tile) => !(tile.x === npc.pos.x && tile.y === npc.pos.y));
    for (const tile of roller.tiles) {
        dungeons.setDungeonObject(roller.mapId, tile.x, tile.y, dungeons.DUNGEON_OBJ.rodillo);
        const user = playerAt(roller.mapId, tile.x, tile.y);
        if (user) hitPlayer(user, roller.npcId, ROLLER_DAMAGE, "Te pasó por encima el rodillo:", { x: roller.dir, y: 0 });
    }
    roller.nextAt = now + ROLLER_STEP_MS;
}

module.exports = { register, onNpcDied, forgetMap, onNpcMeleeHit, tick };
