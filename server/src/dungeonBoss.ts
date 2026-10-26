// El Ciempiés Colosal de la Cueva de la Cola, que se mueve como el Moldorm de Link's Awakening
// (docs/mazmorras/03-CUEVA_DE_LA_COLA.md, sección 6.1; código del original en zladx/LADX-Disassembly,
// 04_moldorm.asm y 04_minimoldorm.asm):
// - la cabeza va en una de 16 direcciones (de a 22,5°) a velocidad constante y gira una dirección por vez (en el
//   original cada 0,1 s; acá cada 0,15 s y un poco más rápido, porque la arena es más grande que la sala de Zelda y
//   así llega a los bordes: simulado en 30 s, recorre un 30 % de la plataforma en vez de un 10 %);
// - el sentido de giro se sortea cada 0,3 a 0,8 s, así zigzaguea y a veces da vueltas enteras;
// - al llegar al borde de la plataforma sale hacia el lado contrario (y a veces cambia el sentido de giro);
// - el cuerpo sigue el rastro de la cabeza: dos segmentos y la cola, a distancias fijas;
// - después de cada golpe, y con poca vida, avanza al doble.
// La criatura de AO (nombre, barra de vida, a la que se le pega) es la cola: sigue el rastro de baldosa en baldosa. La
// cabeza y los segmentos queman y empujan; en el aire (la Pluma) se pasa por encima.
// Los que lo ven reciben la posición de la cabeza unas 10 veces por segundo (paquete dungeonBoss) y lo dibujan.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

const STEP_MS = 50;
const SPEED = 3.5; // baldosas por segundo
const ANGLE_STEP_MS = 150;
const TURN_MIN_MS = 270;
const TURN_MAX_MS = 780;
const BOUNCE_TURN_MS = 270;
const ENRAGE_MS = 3_000;
const LOW_HP = 0.25;
// Distancia de cada parte detrás de la cabeza, en baldosas: dos segmentos y la cola.
const SEGMENTS = [0.9, 1.8, 2.7];
const TAIL = SEGMENTS[SEGMENTS.length - 1];
const CONTACT_RADIUS = 0.8;
const CONTACT_DAMAGE = 0.1;
const PUSH_TILES = 2;
const HIT_COOLDOWN_MS = 800;
const BROADCAST_MS = 100;
const HISTORY = 80;

type Pos = { x: number; y: number };
type Boss = {
    npcId: string;
    mapId: number;
    room: number;
    x: number;
    y: number;
    angle: number;
    turn: 1 | -1;
    angleClock: number;
    turnClock: number;
    history: Pos[];
    enragedUntil: number;
    lastHp: number;
    nextBroadcastAt: number;
    lastHitAt: Map<string, number>;
};

const bosses = new Map<string, Boss>();

function getDungeons() {
    return require("./dungeons");
}

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const randomTurn = (): 1 | -1 => (Math.random() < 0.5 ? 1 : -1);

function templateOf(npc: { templateNpcIndex?: number } | undefined): { ciempies?: boolean } {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

// La plataforma: piso de la sala del jefe, sin pozos (trigger 2) ni paredes.
function isPlatform(boss: Boss, x: number, y: number): boolean {
    const tx = Math.round(x);
    const ty = Math.round(y);
    const tile = vars.mapa[boss.mapId]?.[ty]?.[tx];
    if (!tile || tile.blocked || Number(tile.trigger ?? 0) === 2) return false;
    return getDungeons().roomAt(boss.mapId, tx, ty) === boss.room;
}

export function register(npc: any): boolean {
    if (!templateOf(npc).ciempies) return false;
    const room = getDungeons().roomAt(Number(npc.map), npc.pos.x, npc.pos.y);
    if (room === undefined) return false;
    const start = { x: npc.pos.x, y: npc.pos.y };
    bosses.set(String(npc.id), {
        npcId: String(npc.id),
        mapId: Number(npc.map),
        room,
        x: start.x,
        y: start.y,
        angle: Math.floor(Math.random() * 16),
        turn: randomTurn(),
        angleClock: 0,
        turnClock: randomBetween(TURN_MIN_MS, TURN_MAX_MS),
        // Arranca enrollado sobre la cola.
        history: [start],
        enragedUntil: 0,
        lastHp: Number(npc.hp ?? 0),
        nextBroadcastAt: 0,
        lastHitAt: new Map(),
    });
    npc.customMotion = true;
    return true;
}

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    const boss = bosses.get(String(npc?.id ?? ""));
    if (!boss) return;
    broadcast(boss, { id: Number(boss.npcId), fin: true });
    bosses.delete(boss.npcId);
}

export function forgetMap(mapId: number) {
    for (const [id, boss] of bosses) if (boss.mapId === mapId) bosses.delete(id);
}

export function isBoss(npcId: EntityId | undefined): boolean {
    return bosses.has(String(npcId ?? ""));
}

// Un paso de la cabeza, como sharedMoldormBehavior del original.
function advance(boss: Boss) {
    const radians = (boss.angle * Math.PI) / 8;
    const distance = (SPEED * STEP_MS) / 1_000;
    let nextX = boss.x + Math.cos(radians) * distance;
    let nextY = boss.y + Math.sin(radians) * distance;
    let bounced = false;
    if (!isPlatform(boss, nextX, boss.y)) {
        boss.angle = Math.cos(radians) > 0 ? 8 : 0;
        nextX = boss.x;
        bounced = true;
    }
    if (!isPlatform(boss, boss.x, nextY)) {
        boss.angle = Math.sin(radians) > 0 ? 12 : 4;
        nextY = boss.y;
        bounced = true;
    }
    if (!isPlatform(boss, nextX, nextY)) {
        nextX = boss.x;
        nextY = boss.y;
    }
    if (bounced) {
        if (Math.random() < 0.5) boss.turn = boss.turn === 1 ? -1 : 1;
        boss.turnClock = BOUNCE_TURN_MS;
    }
    boss.x = nextX;
    boss.y = nextY;
    boss.angleClock += STEP_MS;
    while (boss.angleClock >= ANGLE_STEP_MS) {
        boss.angleClock -= ANGLE_STEP_MS;
        boss.angle = (boss.angle + boss.turn + 16) % 16;
    }
    boss.turnClock -= STEP_MS;
    if (boss.turnClock <= 0) {
        boss.turnClock = randomBetween(TURN_MIN_MS, TURN_MAX_MS);
        boss.turn = randomTurn();
    }
    boss.history.push({ x: boss.x, y: boss.y });
    if (boss.history.length > HISTORY) boss.history.shift();
}

// El punto del rastro a `distance` baldosas detrás de la cabeza (si el rastro es corto, el más viejo).
export function pointBehind(history: Pos[], distance: number): Pos {
    let left = distance;
    for (let i = history.length - 1; i > 0; i--) {
        const a = history[i];
        const b = history[i - 1];
        const segment = Math.hypot(a.x - b.x, a.y - b.y);
        if (segment >= left && segment > 0) {
            const t = left / segment;
            return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        left -= segment;
    }
    return history[0] ?? { x: 0, y: 0 };
}

function playersOnPlatform(boss: Boss): RuntimeCharacter[] {
    const dungeons = getDungeons();
    return (Object.values(vars.personajes ?? {}) as Array<RuntimeCharacter & { dead?: boolean }>).filter(
        (user) => user && !user.dead && Number(user.map) === boss.mapId && dungeons.roomAt(boss.mapId, user.pos.x, user.pos.y) === boss.room,
    );
}

function broadcast(boss: Boss, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    const center = { x: Math.round(boss.x), y: Math.round(boss.y) };
    getGame().loopAreaPos(boss.mapId, center, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) handleProtocol.dungeonBoss(payload, client);
    });
}

// La cola (la criatura de AO) sigue el rastro de baldosa en baldosa.
function moveTail(boss: Boss, npc: any) {
    const point = pointBehind(boss.history, TAIL);
    const to = { x: Math.round(point.x), y: Math.round(point.y) };
    if (to.x === npc.pos.x && to.y === npc.pos.y) return;
    // De a una baldosa por eje, así los que miran lo reciben como un paso.
    const step = { x: npc.pos.x + Math.sign(to.x - npc.pos.x), y: npc.pos.y };
    if (step.x === npc.pos.x) step.y = npc.pos.y + Math.sign(to.y - npc.pos.y);
    if (vars.mapData[boss.mapId]?.[step.y]?.[step.x]?.id) return;
    const cell = vars.mapData[boss.mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    const dir = vars.direcciones;
    npc.heading = step.x > npc.pos.x ? dir.right : step.x < npc.pos.x ? dir.left : step.y > npc.pos.y ? dir.down : dir.up;
    npc.pos.x = step.x;
    npc.pos.y = step.y;
    vars.mapData[boss.mapId][step.y][step.x].id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

// La cabeza y los segmentos queman y empujan a los que tocan (menos a los que están en el aire).
function touchPlayers(boss: Boss, players: RuntimeCharacter[], now: number) {
    const motion = require("./dungeonMotion");
    const parts = [{ x: boss.x, y: boss.y }, ...SEGMENTS.slice(0, -1).map((distance) => pointBehind(boss.history, distance))];
    for (const user of players) {
        if (motion.isAirborne(user) || motion.isMoving(user)) continue;
        if (now < (boss.lastHitAt.get(String(user.id)) ?? 0)) continue;
        const part = parts.find((p) => Math.hypot(user.pos.x - p.x, user.pos.y - p.y) < CONTACT_RADIUS);
        if (!part) continue;
        boss.lastHitAt.set(String(user.id), now + HIT_COOLDOWN_MS);
        getDungeons().hurtPlayer(user, CONTACT_DAMAGE, "El ciempiés te embistió:");
        if ((user as { dead?: boolean }).dead) continue;
        const dx = user.pos.x - part.x;
        const dy = user.pos.y - part.y;
        const radians = (boss.angle * Math.PI) / 8;
        const dir =
            Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1
                ? Math.abs(Math.cos(radians)) >= Math.abs(Math.sin(radians))
                    ? { x: Math.sign(Math.cos(radians)), y: 0 }
                    : { x: 0, y: Math.sign(Math.sin(radians)) }
                : Math.abs(dx) >= Math.abs(dy)
                  ? { x: Math.sign(dx), y: 0 }
                  : { x: 0, y: Math.sign(dy) };
        motion.push(user, dir, PUSH_TILES);
    }
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    for (const boss of bosses.values()) {
        if (boss.mapId !== mapId) continue;
        const npc = vars.npcs?.[boss.npcId];
        if (!npc) {
            bosses.delete(boss.npcId);
            continue;
        }
        const players = playersOnPlatform(boss);
        if (!players.length) continue;
        const hp = Number(npc.hp ?? 0);
        if (hp < boss.lastHp) boss.enragedUntil = now + ENRAGE_MS;
        boss.lastHp = hp;
        const fast = now < boss.enragedUntil || hp <= Number(npc.maxHp ?? hp) * LOW_HP;
        for (let i = 0; i < (fast ? 2 : 1); i++) advance(boss);
        moveTail(boss, npc);
        touchPlayers(boss, players, now);
        if (now >= boss.nextBroadcastAt) {
            boss.nextBroadcastAt = now + BROADCAST_MS;
            broadcast(boss, {
                id: Number(boss.npcId),
                x: Math.round(boss.x * 100) / 100,
                y: Math.round(boss.y * 100) / 100,
                a: boss.angle,
                v: SPEED * (fast ? 2 : 1),
                s: SEGMENTS,
            });
        }
    }
}

// Se cayeron todos los que peleaban: el ciempiés se cura, como en el original.
export function onPlayerFell(mapId: number) {
    for (const boss of bosses.values()) {
        if (boss.mapId !== mapId || playersOnPlatform(boss).length) continue;
        const npc = vars.npcs?.[boss.npcId];
        if (!npc) continue;
        npc.hp = Number(npc.maxHp ?? npc.hp);
        boss.lastHp = npc.hp;
        boss.enragedUntil = 0;
        getDungeons().broadcastNpcVitals(npc);
    }
}

module.exports = { register, onNpcDied, forgetMap, isBoss, tick, onPlayerFell, pointBehind };
