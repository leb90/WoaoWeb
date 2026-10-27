// Los jefes de la Gruta de la Botella (docs/mazmorras/05-GRUTA_DE_LA_BOTELLA.md, secciones 5 y 6.1), sacados del
// código del original (zladx/LADX-Disassembly):
//
// El Cíclope, el minijefe (el Hinox, 06_hinox.asm):
// - camina unas baldosas en una dirección al azar (una de cada cuatro veces, hacia el jugador más cercano) y se para;
// - si tiene a alguien en su fila o columna, a veces embiste: corre hasta la pared o hasta alcanzarlo, y al que
//   alcanza lo levanta y lo tira contra el centro de la sala;
// - cada golpe que recibe lo frena y le tira una bomba al que tiene más cerca;
// - al tocarlo caminando, pega y empuja.
//
// El Genio de la Botella, el jefe (el Genie, 04_genie.asm):
// - fase 1: la botella salta, primero hacia el centro y después persiguiendo. A los 4 s el Genio sale en una nube de
//   humo, flota y tira 8 bolas de fuego (una cada 0,8 s, alternando las manos), y vuelve a meterse. Mientras tenga la
//   botella no se lo puede lastimar. Un golpe a la botella con el Genio adentro la aturde 3 s (tiembla al final): se la
//   levanta con el Brazalete y se la tira contra una pared; con 3 golpes contra la pared se rompe;
// - fase 2: sin botella, persigue. Cada golpe lo hace huir 2 s y a veces aparece del otro lado de la sala y tira una
//   bola de fuego.
//
// Los dos son criaturas de AO que mueve el server (customMotion). La botella, el humo y las bolas de fuego los dibuja el
// cliente (paquete dungeonBoss con `tipo`, engine/dungeonGrotto.ts); la bomba del Cíclope, el de las herramientas.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

// Cíclope
const WALK_STEP_MS = 380;
const CHARGE_STEP_MS = 110;
const CHARGE_WINDUP_MS = 350;
const CHARGE_CHANCE = 0.55;
const CHARGE_REACH = 8;
const PAUSE_MIN_MS = 500;
const PAUSE_MAX_MS = 1_100;
const DAZED_MS = 900;
const FLINCH_MS = 600;
const BOMB_FUSE_MS = 1_500;
const BOMB_COOLDOWN_MS = 1_200;
const BOMB_DAMAGE = 0.12;
const GRAB_DAMAGE = 0.15;
const TOUCH_DAMAGE = 0.08;
const TOUCH_COOLDOWN_MS = 1_000;
const THROW_TILES_MAX = 5;

// Genio
const HOP_MS = 520;
const HOP_REST_MS = 260;
const INSIDE_MS = 4_000;
const EMERGE_MS = 700;
const FIREBALLS = 8;
const FIRE_EVERY_MS = 800;
const FIRE_TILE_MS = 110;
const FIRE_DAMAGE = 0.1;
const FIRE_RADIUS = 0.75;
const STUN_MS = 3_000;
const SHAKE_MS = 1_000;
const IMPACTS_TO_BREAK = 3;
const THROW_RANGE = 4;
const THROW_STEP_MS = 70;
const CHASE_STEP_MS = 420;
const FLEE_STEP_MS = 260;
const FLEE_MS = 2_000;
const TELEPORT_CHANCE = 0.35;
const PHASE2_FIRE_MIN_MS = 5_000;
const PHASE2_FIRE_MAX_MS = 7_000;
const GENIE_TOUCH_DAMAGE = 0.1;
const SYNC_MS = 500;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean };

type Cyclops = {
    npcId: string;
    mapId: number;
    room: number;
    home: Pos;
    mode: "pausa" | "camina" | "embiste";
    dir: Pos;
    steps: number;
    nextAt: number;
    lastHp: number;
    nextBombAt: number;
    touchedAt: Map<string, number>;
};

type Genie = {
    npcId: string;
    mapId: number;
    room: number;
    home: Pos;
    phase: 1 | 2;
    mode: "salta" | "fuera" | "aturdida" | "cargada" | "vuela" | "persigue" | "huye";
    bottle: Pos;
    hops: number;
    modeUntil: number;
    nextAt: number;
    fireballs: number;
    hand: 1 | -1;
    shaking: boolean;
    impacts: number;
    carrierId: string | null;
    lastHp: number;
    nextFireAt: number;
    nextSyncAt: number;
    touchedAt: Map<string, number>;
};

const cyclopes = new Map<string, Cyclops>();
const genies = new Map<string, Genie>();

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

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const DIRS: Pos[] = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
];

function templateOf(npc: { templateNpcIndex?: number } | undefined): { ciclope?: boolean; genio?: boolean } {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

function playersInRoom(mapId: number, room: number): Player[] {
    const dungeons = getDungeons();
    return (Object.values(vars.personajes ?? {}) as Player[]).filter(
        (user) => user && !user.dead && Number(user.map) === mapId && dungeons.roomAt(mapId, user.pos.x, user.pos.y) === room,
    );
}

function nearest(players: Player[], from: Pos): Player | null {
    let best: Player | null = null;
    let bestDistance = Infinity;
    for (const user of players) {
        const distance = Math.abs(user.pos.x - from.x) + Math.abs(user.pos.y - from.y);
        if (distance < bestDistance) {
            best = user;
            bestDistance = distance;
        }
    }
    return best;
}

// La dirección (en un eje) que más acerca de `from` a `to`.
function axisToward(from: Pos, to: Pos): Pos {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) return { x: Math.sign(dx), y: 0 };
    return { x: 0, y: Math.sign(dy) || 1 };
}

// Una baldosa libre de la sala: piso, sin nadie encima, sin pozo ni lava.
function canStand(mapId: number, room: number, tile: Pos, ignoreId?: string): boolean {
    const dungeons = getDungeons();
    const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
    if (!cell || cell.blocked) return false;
    if (dungeons.roomAt(mapId, tile.x, tile.y) !== room || dungeons.isHazard(mapId, tile.x, tile.y)) return false;
    const occupant = vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id;
    return !occupant || String(occupant) === ignoreId;
}

// La baldosa libre más cercana a `near` (ella misma si está libre).
function freeTileNear(mapId: number, room: number, near: Pos, ignoreId?: string): Pos | null {
    for (let radius = 0; radius <= 4; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                const tile = { x: near.x + dx, y: near.y + dy };
                if (canStand(mapId, room, tile, ignoreId)) return tile;
            }
        }
    }
    return null;
}

// Mueve la criatura a una baldosa (un paso, o un salto si está lejos) y avisa a los que la ven.
function moveNpc(npc: any, mapId: number, to: Pos) {
    if (to.x === npc.pos.x && to.y === npc.pos.y) return;
    const cell = vars.mapData[mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    require("./targetAssist").recordTileLeft(npc, mapId, npc.pos.x, npc.pos.y);
    const dir = vars.direcciones;
    const dx = to.x - npc.pos.x;
    const dy = to.y - npc.pos.y;
    npc.heading = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? dir.right : dir.left) : dy > 0 ? dir.down : dir.up;
    npc.pos.x = to.x;
    npc.pos.y = to.y;
    vars.mapData[mapId][to.y][to.x].id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

function face(npc: any, toward: Pos) {
    const dir = axisToward(npc.pos, toward);
    const d = vars.direcciones;
    npc.heading = dir.x > 0 ? d.right : dir.x < 0 ? d.left : dir.y > 0 ? d.down : d.up;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

function eachClientNear(mapId: number, pos: Pos, send: (client: RuntimeClient) => void) {
    getGame().loopAreaPos(mapId, { x: Math.round(pos.x), y: Math.round(pos.y) }, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) send(client);
    });
}

function bossPacket(mapId: number, pos: Pos, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.dungeonBoss(payload, client));
}

function motionPacket(mapId: number, pos: Pos, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.dungeonMotion(payload, client));
}

function sound(mapId: number, pos: Pos, soundId: number) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.playSound(0, soundId, client));
}

function tellRoom(mapId: number, room: number, text: string, color = "#FFD24A") {
    const handleProtocol = getHandleProtocol();
    for (const user of playersInRoom(mapId, room)) {
        const client = vars.clients?.[user.id] as RuntimeClient | undefined;
        if (client) handleProtocol.console(text, color, 1, 0, client);
    }
}

function hurt(user: Player, fraction: number, message: string) {
    getDungeons().hurtPlayer(user, fraction, message);
}

// --- Registro ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    if (!template.ciclope && !template.genio) return false;
    const mapId = Number(npc.map);
    const room = getDungeons().roomAt(mapId, npc.pos.x, npc.pos.y);
    if (room === undefined) return false;
    const home = { x: npc.pos.x, y: npc.pos.y };
    const now = Date.now();
    if (template.ciclope) {
        cyclopes.set(String(npc.id), {
            npcId: String(npc.id),
            mapId,
            room,
            home,
            mode: "pausa",
            dir: { x: 0, y: 1 },
            steps: 0,
            nextAt: now + PAUSE_MAX_MS,
            lastHp: Number(npc.hp ?? 0),
            nextBombAt: 0,
            touchedAt: new Map(),
        });
    } else {
        genies.set(String(npc.id), {
            npcId: String(npc.id),
            mapId,
            room,
            home,
            phase: 1,
            mode: "salta",
            bottle: { ...home },
            hops: 0,
            modeUntil: 0,
            nextAt: 0,
            fireballs: 0,
            hand: 1,
            shaking: false,
            impacts: 0,
            carrierId: null,
            lastHp: Number(npc.hp ?? 0),
            nextFireAt: 0,
            nextSyncAt: 0,
            touchedAt: new Map(),
        });
    }
    npc.customMotion = true;
    return true;
}

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    const id = String(npc?.id ?? "");
    cyclopes.delete(id);
    const genie = genies.get(id);
    if (!genie) return;
    bossPacket(genie.mapId, genie.bottle, { id: Number(id), tipo: "botella", fin: true });
    genies.delete(id);
}

export function forgetMap(mapId: number) {
    for (const [id, boss] of cyclopes) if (boss.mapId === mapId) cyclopes.delete(id);
    for (const [id, boss] of genies) if (boss.mapId === mapId) genies.delete(id);
}

export function isBoss(npcId: EntityId | undefined): boolean {
    return cyclopes.has(String(npcId ?? "")) || genies.has(String(npcId ?? ""));
}

// --- El Cíclope ---

function throwBomb(boss: Cyclops, npc: any, at: Pos) {
    const tools = getTools();
    const to = { x: at.x, y: at.y };
    face(npc, to);
    motionPacket(boss.mapId, npc.pos, { id: Number(npc.id), tipo: "bomba", ms: BOMB_FUSE_MS, to, from: { x: npc.pos.x, y: npc.pos.y } });
    sound(boss.mapId, npc.pos, tools.TOOL_SOUNDS.bomba);
    setTimeout(() => {
        if (!cyclopes.has(boss.npcId) && !vars.npcs?.[boss.npcId]) return;
        sound(boss.mapId, to, tools.TOOL_SOUNDS.explosion);
        const motion = getMotion();
        for (const user of playersInRoom(boss.mapId, boss.room)) {
            if (Math.max(Math.abs(user.pos.x - to.x), Math.abs(user.pos.y - to.y)) > 1 || motion.isAirborne(user)) continue;
            hurt(user, BOMB_DAMAGE, "Te alcanzó una bomba del Cíclope:");
        }
    }, BOMB_FUSE_MS);
}

// La embestida lo alcanzó: lo levanta y lo tira contra el centro de la sala.
function grab(boss: Cyclops, npc: any, user: Player) {
    hurt(user, GRAB_DAMAGE, "El Cíclope te levantó y te tiró:");
    if (user.dead) return;
    const toCenter = { x: boss.home.x - user.pos.x, y: boss.home.y - user.pos.y };
    const far = Math.abs(toCenter.x) + Math.abs(toCenter.y) >= 2;
    const dir = far ? axisToward(user.pos, boss.home) : boss.dir;
    const tiles = far ? Math.min(THROW_TILES_MAX, Math.max(Math.abs(toCenter.x), Math.abs(toCenter.y))) : 3;
    sound(boss.mapId, user.pos, getTools().TOOL_SOUNDS.levantar);
    getMotion().push(user, dir, tiles);
}

function touch(boss: Cyclops, user: Player, now: number) {
    if (now < (boss.touchedAt.get(String(user.id)) ?? 0)) return;
    boss.touchedAt.set(String(user.id), now + TOUCH_COOLDOWN_MS);
    hurt(user, TOUCH_DAMAGE, "El Cíclope te pisó:");
    if (!user.dead) getMotion().push(user, boss.dir, 1);
}

// ¿Hay línea libre (sin paredes) entre la criatura y el jugador, en su fila o columna?
function clearLine(mapId: number, from: Pos, to: Pos): boolean {
    const dir = axisToward(from, to);
    for (let tile = { x: from.x + dir.x, y: from.y + dir.y }; tile.x !== to.x || tile.y !== to.y; tile = { x: tile.x + dir.x, y: tile.y + dir.y }) {
        if (vars.mapa[mapId]?.[tile.y]?.[tile.x]?.blocked) return false;
    }
    return true;
}

function chooseNext(boss: Cyclops, npc: any, players: Player[], now: number) {
    const target = nearest(players, npc.pos);
    const aligned =
        target &&
        (target.pos.x === npc.pos.x || target.pos.y === npc.pos.y) &&
        Math.abs(target.pos.x - npc.pos.x) + Math.abs(target.pos.y - npc.pos.y) <= CHARGE_REACH &&
        clearLine(boss.mapId, npc.pos, target.pos);
    if (target && aligned && Math.random() < CHARGE_CHANCE) {
        boss.mode = "embiste";
        boss.dir = axisToward(npc.pos, target.pos);
        boss.steps = CHARGE_REACH + 4;
        face(npc, target.pos);
        boss.nextAt = now + CHARGE_WINDUP_MS;
        return;
    }
    boss.mode = "camina";
    boss.dir = target && Math.random() < 0.25 ? axisToward(npc.pos, target.pos) : DIRS[Math.floor(Math.random() * DIRS.length)];
    boss.steps = 2 + Math.floor(Math.random() * 3);
    boss.nextAt = now + WALK_STEP_MS;
}

function tickCyclops(boss: Cyclops, npc: any, players: Player[], now: number) {
    const hp = Number(npc.hp ?? 0);
    if (hp < boss.lastHp) {
        boss.lastHp = hp;
        if (now >= boss.nextBombAt) {
            boss.nextBombAt = now + BOMB_COOLDOWN_MS;
            const target = nearest(players, npc.pos);
            if (target) throwBomb(boss, npc, target.pos);
            boss.mode = "pausa";
            boss.nextAt = now + FLINCH_MS;
            return;
        }
    }
    boss.lastHp = hp;
    if (now < boss.nextAt) return;
    if (boss.mode === "pausa") return chooseNext(boss, npc, players, now);
    const charging = boss.mode === "embiste";
    const to = { x: npc.pos.x + boss.dir.x, y: npc.pos.y + boss.dir.y };
    const victim = players.find((user) => user.pos.x === to.x && user.pos.y === to.y);
    if (victim) {
        if (charging) grab(boss, npc, victim);
        else touch(boss, victim, now);
        boss.mode = "pausa";
        boss.nextAt = now + (charging ? DAZED_MS : randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS));
        return;
    }
    if (!canStand(boss.mapId, boss.room, to, boss.npcId)) {
        // Contra la pared: la embestida lo deja un momento quieto.
        if (charging) sound(boss.mapId, npc.pos, getDungeons().DUNGEON_SOUNDS.golpe);
        boss.mode = "pausa";
        boss.nextAt = now + (charging ? DAZED_MS : randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS));
        return;
    }
    moveNpc(npc, boss.mapId, to);
    boss.steps--;
    if (boss.steps <= 0) {
        boss.mode = "pausa";
        boss.nextAt = now + randomBetween(PAUSE_MIN_MS, PAUSE_MAX_MS);
    } else {
        boss.nextAt = now + (charging ? CHARGE_STEP_MS : WALK_STEP_MS);
    }
}

// --- El Genio ---

function sendBottle(genie: Genie, extra: Record<string, unknown> = {}) {
    bossPacket(genie.mapId, genie.bottle, {
        id: Number(genie.npcId),
        tipo: "botella",
        x: genie.bottle.x,
        y: genie.bottle.y,
        dentro: genie.mode !== "fuera",
        estado: genie.mode,
        tiembla: genie.mode === "aturdida" && genie.shaking,
        ...extra,
    });
}

function smoke(genie: Genie, at: Pos) {
    bossPacket(genie.mapId, at, { id: Number(genie.npcId), tipo: "humo", x: at.x, y: at.y });
    sound(genie.mapId, at, getTools().TOOL_SOUNDS.polvo);
}

// Una bola de fuego hacia donde está el jugador ahora: si sigue ahí cuando llega, quema (salvo que el Escudo Espejo la
// frene de frente).
function fireball(genie: Genie, npc: any, target: Player) {
    const from = { x: npc.pos.x + 0.35 * genie.hand, y: npc.pos.y - 0.6 };
    genie.hand = genie.hand === 1 ? -1 : 1;
    const to = { x: target.pos.x, y: target.pos.y };
    const ms = Math.max(250, Math.round(Math.hypot(to.x - from.x, to.y - from.y) * FIRE_TILE_MS));
    bossPacket(genie.mapId, npc.pos, { id: Number(genie.npcId), tipo: "fuego", desde: from, hasta: to, ms });
    sound(genie.mapId, npc.pos, getTools().TOOL_SOUNDS.fuego);
    const travel = { x: Math.sign(Math.round(to.x - from.x)), y: Math.sign(Math.round(to.y - from.y)) };
    const dir = Math.abs(to.x - from.x) >= Math.abs(to.y - from.y) ? { x: travel.x, y: 0 } : { x: 0, y: travel.y };
    setTimeout(() => {
        if (!genies.has(genie.npcId)) return;
        const tools = getTools();
        for (const user of playersInRoom(genie.mapId, genie.room)) {
            if (Math.hypot(user.pos.x - to.x, user.pos.y - to.y) > FIRE_RADIUS) continue;
            if (getMotion().isAirborne(user)) continue;
            if (tools.mirrorBlocks(user, dir)) {
                sound(genie.mapId, user.pos, tools.TOOL_SOUNDS.bloqueo);
                const client = vars.clients?.[user.id] as RuntimeClient | undefined;
                if (client) getHandleProtocol().console("¡El Escudo Espejo frenó la bola de fuego!", "#FFD24A", 1, 0, client);
                continue;
            }
            hurt(user, FIRE_DAMAGE, "Te quemó una bola de fuego:");
        }
    }, ms);
}

function emerge(genie: Genie, npc: any, now: number) {
    const out = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }]
        .map((d) => ({ x: genie.bottle.x + d.x, y: genie.bottle.y + d.y }))
        .find((tile) => canStand(genie.mapId, genie.room, tile));
    if (!out) {
        genie.modeUntil = now + 1_000;
        return;
    }
    genie.mode = "fuera";
    genie.fireballs = FIREBALLS;
    genie.nextAt = now + EMERGE_MS;
    smoke(genie, genie.bottle);
    moveNpc(npc, genie.mapId, out);
    // La botella vacía queda ahí, sólida: nadie se le para encima mientras el Genio está afuera.
    getDungeons().setDungeonBlocked(genie.mapId, genie.bottle.x, genie.bottle.y, true);
    sendBottle(genie);
}

function returnToBottle(genie: Genie, npc: any, now: number) {
    getDungeons().setDungeonBlocked(genie.mapId, genie.bottle.x, genie.bottle.y, false);
    if (!canStand(genie.mapId, genie.room, genie.bottle, genie.npcId)) {
        getDungeons().setDungeonBlocked(genie.mapId, genie.bottle.x, genie.bottle.y, true);
        genie.nextAt = now + 400;
        return;
    }
    smoke(genie, npc.pos);
    moveNpc(npc, genie.mapId, genie.bottle);
    genie.mode = "salta";
    genie.modeUntil = now + INSIDE_MS;
    genie.nextAt = now + EMERGE_MS;
    sendBottle(genie);
}

// La botella salta una baldosa: primero hacia el centro y, una vez ahí, persiguiendo. Al lado de alguien se queda
// quieta (es cuando se le puede pegar).
function hop(genie: Genie, npc: any, players: Player[], now: number) {
    genie.nextAt = now + HOP_MS + HOP_REST_MS;
    if (genie.bottle.x === genie.home.x && genie.bottle.y === genie.home.y) genie.hops = Math.max(genie.hops, 2);
    const target = genie.hops < 2 ? genie.home : nearest(players, genie.bottle)?.pos;
    if (!target || (target.x === genie.bottle.x && target.y === genie.bottle.y)) return;
    const main = axisToward(genie.bottle, target);
    const other = main.x ? { x: 0, y: Math.sign(target.y - genie.bottle.y) } : { x: Math.sign(target.x - genie.bottle.x), y: 0 };
    for (const dir of [main, other]) {
        if (!dir.x && !dir.y) continue;
        const to = { x: genie.bottle.x + dir.x, y: genie.bottle.y + dir.y };
        if (players.some((user) => user.pos.x === to.x && user.pos.y === to.y)) return;
        if (!canStand(genie.mapId, genie.room, to, genie.npcId)) continue;
        const from = { ...genie.bottle };
        moveNpc(npc, genie.mapId, to);
        genie.bottle = to;
        genie.hops++;
        sendBottle(genie, { salto: { desde: from, hasta: to, ms: HOP_MS } });
        return;
    }
}

function stun(genie: Genie, now: number) {
    genie.mode = "aturdida";
    genie.shaking = false;
    genie.modeUntil = now + STUN_MS;
    sound(genie.mapId, genie.bottle, getDungeons().DUNGEON_SOUNDS.golpe);
    sendBottle(genie);
}

function tickGenie(genie: Genie, npc: any, players: Player[], now: number) {
    const hp = Number(npc.hp ?? 0);
    const hit = hp < genie.lastHp;
    genie.lastHp = hp;
    if (now >= genie.nextSyncAt && genie.mode !== "vuela") {
        genie.nextSyncAt = now + SYNC_MS;
        if (genie.phase === 1) sendBottle(genie);
    }
    if (genie.phase === 1) {
        if (genie.mode === "salta") {
            if (!genie.modeUntil) genie.modeUntil = now + INSIDE_MS;
            if (now >= genie.modeUntil) return emerge(genie, npc, now);
            if (now >= genie.nextAt) hop(genie, npc, players, now);
        } else if (genie.mode === "fuera") {
            if (now < genie.nextAt) return;
            if (genie.fireballs > 0) {
                const target = nearest(players, npc.pos);
                if (target) {
                    face(npc, target.pos);
                    fireball(genie, npc, target);
                }
                genie.fireballs--;
                genie.nextAt = now + FIRE_EVERY_MS;
            } else {
                returnToBottle(genie, npc, now);
            }
        } else if (genie.mode === "aturdida") {
            if (now >= genie.modeUntil) {
                genie.mode = "salta";
                genie.modeUntil = now + INSIDE_MS;
                genie.nextAt = now + HOP_REST_MS;
                sendBottle(genie);
            } else if (!genie.shaking && now >= genie.modeUntil - SHAKE_MS) {
                genie.shaking = true;
                sendBottle(genie);
            }
        } else if (genie.mode === "cargada") {
            const carrier = vars.personajes?.[genie.carrierId ?? ""] as Player | undefined;
            if (!carrier || carrier.dead || Number(carrier.map) !== genie.mapId) landBottle(genie, genie.bottle, false);
        }
        return;
    }
    // Fase 2: sin botella.
    if (hit) {
        genie.mode = "huye";
        genie.modeUntil = now + FLEE_MS;
        if (Math.random() < TELEPORT_CHANCE) {
            teleport(genie, npc);
            genie.nextFireAt = now + 400;
        }
    }
    if (genie.mode === "huye" && now >= genie.modeUntil) genie.mode = "persigue";
    if (now >= genie.nextFireAt) {
        genie.nextFireAt = now + randomBetween(PHASE2_FIRE_MIN_MS, PHASE2_FIRE_MAX_MS);
        const target = nearest(players, npc.pos);
        if (target) fireball(genie, npc, target);
    }
    if (now < genie.nextAt) return;
    const target = nearest(players, npc.pos);
    if (!target) return;
    if (genie.mode === "huye") {
        genie.nextAt = now + FLEE_STEP_MS;
        const options = DIRS.map((d) => ({ x: npc.pos.x + d.x, y: npc.pos.y + d.y })).filter((tile) => canStand(genie.mapId, genie.room, tile));
        options.sort((a, b) => Math.hypot(b.x - target.pos.x, b.y - target.pos.y) - Math.hypot(a.x - target.pos.x, a.y - target.pos.y));
        if (options[0]) moveNpc(npc, genie.mapId, options[0]);
        return;
    }
    genie.nextAt = now + CHASE_STEP_MS;
    if (Math.abs(target.pos.x - npc.pos.x) + Math.abs(target.pos.y - npc.pos.y) === 1) {
        face(npc, target.pos);
        if (now >= (genie.touchedAt.get(String(target.id)) ?? 0)) {
            genie.touchedAt.set(String(target.id), now + TOUCH_COOLDOWN_MS + 100);
            if (getTools().mirrorBlocksNpcHit(target, npc)) return;
            hurt(target, GENIE_TOUCH_DAMAGE, "El Genio te golpeó:");
        }
        return;
    }
    const main = axisToward(npc.pos, target.pos);
    const other = main.x ? { x: 0, y: Math.sign(target.pos.y - npc.pos.y) } : { x: Math.sign(target.pos.x - npc.pos.x), y: 0 };
    for (const dir of [main, other]) {
        if (!dir.x && !dir.y) continue;
        const to = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
        if (canStand(genie.mapId, genie.room, to)) return moveNpc(npc, genie.mapId, to);
    }
}

// Aparece del otro lado de la sala (el reflejo de donde está, respecto del centro).
function teleport(genie: Genie, npc: any) {
    const mirror = { x: 2 * genie.home.x - npc.pos.x, y: 2 * genie.home.y - npc.pos.y };
    const to = freeTileNear(genie.mapId, genie.room, mirror);
    if (!to) return;
    smoke(genie, npc.pos);
    moveNpc(npc, genie.mapId, to);
    smoke(genie, to);
}

// --- Lo que llega de afuera: golpes, el Brazalete ---

// Un golpe cuerpo a cuerpo al Genio metido en la botella: la aturde (no le hace daño). Devuelve true si lo resolvió.
export function onNpcStruck(npc: any): boolean {
    const genie = genies.get(String(npc?.id ?? ""));
    if (!genie || genie.phase !== 1) return false;
    if (genie.mode === "salta") {
        stun(genie, Date.now());
        tellRoom(genie.mapId, genie.room, "¡La botella quedó aturdida! Levantala con el Brazalete y estrellala contra la pared.");
        return true;
    }
    return genie.mode === "aturdida" || genie.mode === "cargada" || genie.mode === "vuela";
}

// El golpe al aire sobre la botella vacía (con el Genio afuera).
export function onAirSwing(mapId: number, tile: Pos): string | null {
    for (const genie of genies.values()) {
        if (genie.mapId !== mapId || genie.phase !== 1 || genie.mode !== "fuera") continue;
        if (genie.bottle.x === tile.x && genie.bottle.y === tile.y) return "La botella está vacía: esperá a que el Genio vuelva a meterse.";
    }
    return null;
}

export function invulnerableReason(npc: any): string | null {
    const genie = genies.get(String(npc?.id ?? ""));
    return genie && genie.phase === 1 ? "¡No me podés lastimar mientras tenga mi botella!" : null;
}

// El Brazalete sobre la baldosa de adelante: si ahí está la botella aturdida, la levanta.
export function liftBottle(user: Player, front: Pos): boolean {
    for (const genie of genies.values()) {
        if (genie.mapId !== Number(user.map) || genie.mode !== "aturdida") continue;
        if (genie.bottle.x !== front.x || genie.bottle.y !== front.y) continue;
        genie.mode = "cargada";
        genie.carrierId = String(user.id);
        // El Genio (invisible, adentro) deja libre la baldosa mientras la botella va en las manos.
        const npc = vars.npcs?.[genie.npcId];
        const cell = npc ? vars.mapData[genie.mapId]?.[npc.pos.y]?.[npc.pos.x] : null;
        if (cell && String(cell.id) === genie.npcId) cell.id = 0;
        sendBottle(genie, { cargada: true });
        return true;
    }
    return false;
}

// La tira hacia adonde mira: contra la pared es un golpe a la botella; si no, cae entera.
export function throwBottle(user: Player, heading: number, dir: Pos) {
    const genie = [...genies.values()].find((g) => g.carrierId === String(user.id) && g.mode === "cargada");
    if (!genie) return;
    const tools = getTools();
    const line = tools.traceLine(genie.mapId, user.pos, dir, THROW_RANGE, false);
    const wall = Boolean(line.blocked || line.target);
    const end = (line.npcId || line.target ? line.path.at(-1) : line.end) ?? { x: user.pos.x, y: user.pos.y };
    const distance = Math.max(1, Math.abs(end.x - user.pos.x) + Math.abs(end.y - user.pos.y) + (wall ? 1 : 0));
    genie.mode = "vuela";
    genie.carrierId = null;
    motionPacket(genie.mapId, user.pos, {
        id: Number(user.id),
        tipo: "tira",
        heading,
        ms: THROW_STEP_MS,
        to: end,
        golpe: wall ? "pared" : null,
        obj: getDungeons().DUNGEON_OBJ.botellaGenio,
        entera: !wall,
    });
    setTimeout(() => landBottle(genie, end, wall), distance * THROW_STEP_MS);
}

// Se le cayó (murió, salió del mapa o la soltó): cae entera a sus pies.
export function dropBottle(user: Player) {
    const genie = [...genies.values()].find((g) => g.carrierId === String(user.id) && g.mode === "cargada");
    if (genie) landBottle(genie, { x: user.pos.x, y: user.pos.y }, false);
}

function landBottle(genie: Genie, at: Pos, wall: boolean) {
    const npc = vars.npcs?.[genie.npcId];
    if (!genies.has(genie.npcId) || !npc) return;
    const now = Date.now();
    const tile = freeTileNear(genie.mapId, genie.room, at, genie.npcId) ?? genie.home;
    genie.carrierId = null;
    genie.bottle = tile;
    // Vuelve a ocupar su baldosa (al levantarla la había dejado).
    npc.pos.x = tile.x;
    npc.pos.y = tile.y;
    vars.mapData[genie.mapId][tile.y][tile.x].id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
    if (wall) {
        genie.impacts++;
        sound(genie.mapId, tile, getTools().TOOL_SOUNDS.romper);
        if (genie.impacts >= IMPACTS_TO_BREAK) return breakBottle(genie, npc, now);
        tellRoom(genie.mapId, genie.room, `¡La botella se estrelló contra la pared! (${genie.impacts} de ${IMPACTS_TO_BREAK})`);
    }
    genie.mode = "salta";
    genie.modeUntil = now + INSIDE_MS;
    genie.nextAt = now + HOP_REST_MS;
    sendBottle(genie);
}

function breakBottle(genie: Genie, npc: any, now: number) {
    genie.phase = 2;
    genie.mode = "persigue";
    genie.nextAt = now + EMERGE_MS;
    genie.nextFireAt = now + PHASE2_FIRE_MIN_MS;
    bossPacket(genie.mapId, genie.bottle, { id: Number(genie.npcId), tipo: "botella", x: genie.bottle.x, y: genie.bottle.y, rota: true });
    smoke(genie, genie.bottle);
    getDungeons().broadcastNpcVitals(npc);
    tellRoom(genie.mapId, genie.room, "¡La botella se rompió! El Genio sale furioso: ahora sí se lo puede lastimar.", "#FF6B3D");
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    for (const boss of cyclopes.values()) {
        if (boss.mapId !== mapId) continue;
        const npc = vars.npcs?.[boss.npcId];
        if (!npc) {
            cyclopes.delete(boss.npcId);
            continue;
        }
        const players = playersInRoom(mapId, boss.room);
        if (players.length) tickCyclops(boss, npc, players, now);
    }
    for (const genie of genies.values()) {
        if (genie.mapId !== mapId) continue;
        const npc = vars.npcs?.[genie.npcId];
        if (!npc) {
            genies.delete(genie.npcId);
            continue;
        }
        const players = playersInRoom(mapId, genie.room);
        if (players.length || genie.mode === "cargada") tickGenie(genie, npc, players, now);
    }
}

module.exports = {
    register,
    onNpcDied,
    forgetMap,
    isBoss,
    tick,
    onNpcStruck,
    onAirSwing,
    invulnerableReason,
    liftBottle,
    throwBottle,
    dropBottle,
};
