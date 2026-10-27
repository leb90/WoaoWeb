// Los jefes del Santuario del Rostro (docs/mazmorras/06-SANTUARIO_DEL_ROSTRO.md, sección 5), sacados del código del
// original (zladx/LADX-Disassembly):
//
// El Machacador, el minijefe (el Smasher, 06_smasher.asm):
// - va a buscar su bola de hierro, la levanta, se acerca al jugador más cercano y se la tira. La bola solo lastima en el
//   aire y después queda en el piso;
// - mientras alguien tiene la bola, deambula sin perseguir a nadie;
// - solo lo lastima su propia bola: se levanta con el Brazalete (alcanza el nivel 1) y se le tira. Son 4 bolazos.
//
// Las Serpientes Glotonas (las Dodongo Snakes, 05_dodongo_snake.asm):
// - andan en línea recta y siempre giran 90°; cada cuatro giros encaran al jugador más cercano. No caen a los pozos;
// - solo mueren comiendo bombas: se tragan la que les pongan al lado, quedan quietas digiriéndola y a la tercera
//   revientan. Los golpes y las explosiones de afuera no les hacen nada.
//
// El Rostro de Piedra, el jefe (Facade, 04_facade.asm):
// - una cara en el piso que no se mueve y no lastima al tocarla. Aparece de a poco cuando entran;
// - tira las baldosas del borde de la sala de a parejas opuestas, después las vasijas de las esquinas, y después abre
//   pozos alrededor, que chupan al que está cerca y se cierran solos;
// - solo lo lastiman las bombas: 5, y después de cada una se cierra y no recibe daño un rato.
//
// Los tres son criaturas de AO que mueve el server (customMotion). La bola, la cara, los pozos y la serpiente que se
// infla los dibuja el cliente (paquete dungeonBoss con `tipo`, engine/dungeonShrineBosses.ts); las baldosas y las vasijas
// que vuelan, el del Santuario (dungeonShrine.ts).
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

// Machacador
const SEEK_STEP_MS = 340;
const WANDER_STEP_MS = 520;
const LIFT_MS = 550;
const APPROACH_STEP_MS = 480;
const APPROACH_STEPS = 2;
const BOSS_THROW_RANGE = 5;
const BALL_TILE_MS = 110;
const BALL_DAMAGE = 0.15;
const AFTER_THROW_MS = 650;
const FLINCH_MS = 900;
const SMASHER_HITS = 4;
const PLAYER_THROW_RANGE = 5;
const PLAYER_THROW_STEP_MS = 70;

// Serpientes Glotonas
const SNAKE_STEP_MS = 450;
const SNAKE_RUN_MIN = 2;
const SNAKE_RUN_MAX = 4;
const BOMB_FRESH_MS = 1_700;
const BOMB_SIGHT = 3;
const SWELL_AT_MS = 900;
const BURP_AT_MS = 1_500;
const DIGEST_MS = 2_300;
const BOMBS_TO_KILL = 3;

// Rostro de Piedra
const WAKE_MS = 1_500;
const APPEAR_MS = 2_500;
const FIRST_LAUNCH_MS = 2_000;
const LAUNCH_EVERY_MS = 1_070;
const TILE_DAMAGE = 0.1;
const VASE_DAMAGE = 0.15;
const PITS_AFTER_MS = 2_000;
const PIT_EVERY_MIN_MS = 1_600;
const PIT_EVERY_MAX_MS = 2_600;
const PIT_WARN_MS = 650;
const PIT_OPENING_MS = 270;
const PIT_OPEN_MS = 800;
const PIT_CLOSING_MS = 400;
const MAX_PITS = 2;
const PULL_EVERY_MS = 400;
const PULL_RADIUS = 2;
const FACE_HITS = 5;
const FACE_IMMUNE_MS = 4_600;
const FACE_BLAST_REACH = 2;

const TOUCH_DAMAGE = 0.08;
const TOUCH_COOLDOWN_MS = 1_000;
const SYNC_MS = 1_000;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean };

type Ball = Pos & { estado: "piso" | "jefe" | "vuela" | "jugador"; carrierId: string | null };
type Smasher = {
    npcId: string;
    mapId: number;
    room: number;
    home: Pos;
    mode: "busca" | "levanta" | "acerca" | "pausa";
    ball: Ball | null;
    steps: number;
    nextAt: number;
    nextSyncAt: number;
    hits: number;
    touchedAt: Map<string, number>;
};

type Snake = {
    npcId: string;
    mapId: number;
    room: number;
    dir: Pos;
    steps: number;
    turns: number;
    mode: "anda" | "digiere";
    eaten: number;
    digestStartedAt: number;
    digestStep: number;
    feederId: string | null;
    nextAt: number;
    touchedAt: Map<string, number>;
};

type Pit = Pos & { key: string; openAt: number; closeAt: number; open: boolean };
type Facade = {
    npcId: string;
    mapId: number;
    room: number;
    center: Pos;
    mode: "espera" | "despierta" | "aparece" | "pelea";
    modeUntil: number;
    queue: Array<Pos & { vasija?: boolean }>;
    queued: boolean;
    nextLaunchAt: number;
    pitsFrom: number;
    nextPitAt: number;
    lastPit: string | null;
    pits: Map<string, Pit>;
    nextPullAt: number;
    immuneUntil: number;
    hits: number;
    nextSyncAt: number;
};

const smashers = new Map<string, Smasher>();
const snakes = new Map<string, Snake>();
const facades = new Map<string, Facade>();

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

function getShrine() {
    return require("./dungeonShrine");
}

const coordKey = (x: number, y: number) => `${x},${y}`;
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const manhattan = (a: Pos, b: Pos) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const chebyshev = (a: Pos, b: Pos) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

function templateOf(npc: { templateNpcIndex?: number } | undefined): { machacador?: boolean; glotona?: boolean; rostro?: boolean } {
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
        const distance = Math.hypot(user.pos.x - from.x, user.pos.y - from.y);
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
function freeTileNear(mapId: number, room: number, near: Pos): Pos | null {
    for (let radius = 0; radius <= 4; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                const tile = { x: near.x + dx, y: near.y + dy };
                if (canStand(mapId, room, tile)) return tile;
            }
        }
    }
    return null;
}

// Mueve la criatura una baldosa y avisa a los que la ven.
function moveNpc(npc: any, mapId: number, to: Pos) {
    if (to.x === npc.pos.x && to.y === npc.pos.y) return;
    const cell = vars.mapData[mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    require("./targetAssist").recordTileLeft(npc, mapId, npc.pos.x, npc.pos.y);
    npc.heading = headingFrom(npc.pos, to);
    npc.pos.x = to.x;
    npc.pos.y = to.y;
    vars.mapData[mapId][to.y][to.x].id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

function headingFrom(from: Pos, toward: Pos): number {
    const d = vars.direcciones;
    const dx = toward.x - from.x;
    const dy = toward.y - from.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? d.right : d.left) : dy > 0 ? d.down : d.up;
}

function face(npc: any, toward: Pos) {
    npc.heading = headingFrom(npc.pos, toward);
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

function tell(user: RuntimeCharacter | null | undefined, text: string) {
    const client = user ? (vars.clients?.[user.id] as RuntimeClient | undefined) : undefined;
    if (client) getHandleProtocol().console(text, "white", 1, 0, client);
}

function hurt(user: Player, fraction: number, message: string) {
    getDungeons().hurtPlayer(user, fraction, message);
}

// Al tocarlo caminando: pega y empuja (con el Escudo Espejo de frente, no).
function touch(npc: any, touchedAt: Map<string, number>, user: Player, dir: Pos, message: string, now: number) {
    if (now < (touchedAt.get(String(user.id)) ?? 0)) return;
    touchedAt.set(String(user.id), now + TOUCH_COOLDOWN_MS);
    if (getTools().mirrorBlocksNpcHit(user, npc)) return;
    hurt(user, TOUCH_DAMAGE, message);
    if (!user.dead) getMotion().push(user, dir, 1);
}

// Le saca vida sin pasar por la invulnerabilidad (la bola del Machacador, la bomba tragada, la bomba en la cara). Si
// muere, cuenta para el que lo hizo (o para cualquiera de la sala si ya no está).
function strike(npc: any, amount: number, killerId: string | null, room: number) {
    npc.hp = Math.max(0, Number(npc.hp ?? 0) - amount);
    const handleProtocol = getHandleProtocol();
    eachClientNear(Number(npc.map), npc.pos, (client) => handleProtocol.dialog(npc.id, `${amount}`, "", "red", 0, client));
    getDungeons().broadcastNpcVitals(npc);
    if (npc.hp > 0) return;
    const killer = (killerId ? vars.clients?.[killerId] : undefined) ?? playersInRoom(Number(npc.map), room).map((user) => vars.clients?.[user.id]).find(Boolean);
    if (killer) require("./respawn").muere(killer, npc.id);
}

const hitFor = (npc: any, hits: number) => Math.max(1, Math.ceil(Number(npc.maxHp ?? npc.hp ?? 1) / hits));

// --- Registro ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    if (!template.machacador && !template.glotona && !template.rostro) return false;
    const mapId = Number(npc.map);
    const room = getDungeons().roomAt(mapId, npc.pos.x, npc.pos.y);
    if (room === undefined) return false;
    const id = String(npc.id);
    const now = Date.now();
    if (template.machacador) {
        smashers.set(id, {
            npcId: id,
            mapId,
            room,
            home: { x: npc.pos.x, y: npc.pos.y },
            mode: "busca",
            ball: null,
            steps: 0,
            nextAt: now + 800,
            nextSyncAt: 0,
            hits: 0,
            touchedAt: new Map(),
        });
    } else if (template.glotona) {
        const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
        snakes.set(id, {
            npcId: id,
            mapId,
            room,
            dir: dirs[Math.floor(Math.random() * dirs.length)],
            steps: SNAKE_RUN_MIN,
            turns: 0,
            mode: "anda",
            eaten: 0,
            digestStartedAt: 0,
            digestStep: 0,
            feederId: null,
            nextAt: now + 800,
            touchedAt: new Map(),
        });
    } else {
        facades.set(id, {
            npcId: id,
            mapId,
            room,
            center: { x: npc.pos.x, y: npc.pos.y },
            mode: "espera",
            modeUntil: 0,
            queue: [],
            queued: false,
            nextLaunchAt: 0,
            pitsFrom: 0,
            nextPitAt: 0,
            lastPit: null,
            pits: new Map(),
            nextPullAt: 0,
            immuneUntil: 0,
            hits: 0,
            nextSyncAt: 0,
        });
    }
    npc.customMotion = true;
    return true;
}

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    const id = String(npc?.id ?? "");
    const smasher = smashers.get(id);
    if (smasher) {
        if (smasher.ball?.estado === "piso") getDungeons().setDungeonBlocked(smasher.mapId, smasher.ball.x, smasher.ball.y, false);
        bossPacket(smasher.mapId, smasher.ball ?? smasher.home, { id: Number(id), tipo: "bola", fin: true });
        smashers.delete(id);
    }
    snakes.delete(id);
    const facade = facades.get(id);
    if (facade) {
        facade.queue = [];
        for (const pit of facade.pits.values()) closePit(facade, pit);
        tellRoom(facade.mapId, facade.room, "Rostro de Piedra: «¡Está bien, está bien! Pero escuchá... nada de esto va a durar para siempre. ¡Nada!»", "#C9B99A");
        bossPacket(facade.mapId, facade.center, { id: Number(id), tipo: "rostro", x: facade.center.x, y: facade.center.y, estado: "muere" });
        facades.delete(id);
    }
}

export function forgetMap(mapId: number) {
    for (const [id, boss] of smashers) if (boss.mapId === mapId) smashers.delete(id);
    for (const [id, snake] of snakes) if (snake.mapId === mapId) snakes.delete(id);
    for (const [id, facade] of facades) if (facade.mapId === mapId) facades.delete(id);
}

// Las baldosas voladoras de la sala del Rostro de Piedra las tira él (dungeonShrine.ts no las larga solas).
export function claimsTiles(mapId: number, room: number): boolean {
    for (const facade of facades.values()) if (facade.mapId === mapId && facade.room === room) return true;
    return false;
}

export function invulnerableReason(npc: any, source?: string): string | null {
    const id = String(npc?.id ?? "");
    if (smashers.has(id)) return "Al Machacador no le entran golpes: levantá su bola de hierro con el Brazalete y tirásela.";
    if (snakes.has(id)) {
        return source === "bomba"
            ? "La explosión no le hace nada: la Serpiente Glotona se tiene que tragar la bomba."
            : "Los golpes no le hacen nada a la Serpiente Glotona: poné bombas donde las pueda comer.";
    }
    if (facades.has(id)) return source === "bomba" ? null : "Es de piedra: los golpes no le hacen nada.";
    return null;
}

// --- El Machacador ---

function sendBall(boss: Smasher, extra: Record<string, unknown> = {}) {
    const ball = boss.ball;
    if (!ball) return;
    bossPacket(boss.mapId, ball, { id: Number(boss.npcId), tipo: "bola", x: ball.x, y: ball.y, estado: ball.estado, ...extra });
}

// La bola queda en el piso (en la baldosa libre más cercana), sólida: el Machacador la va a buscar.
function landBall(boss: Smasher, at: Pos) {
    if (!smashers.has(boss.npcId) || !boss.ball) return;
    const tile = freeTileNear(boss.mapId, boss.room, at) ?? freeTileNear(boss.mapId, boss.room, boss.home) ?? at;
    boss.ball = { x: tile.x, y: tile.y, estado: "piso", carrierId: null };
    getDungeons().setDungeonBlocked(boss.mapId, tile.x, tile.y, true);
    sound(boss.mapId, tile, getDungeons().DUNGEON_SOUNDS.golpe);
    sendBall(boss);
}

// Un paso hacia `to`: por el eje más largo y, si está tapado, por el otro. Si en el camino hay alguien, lo pisa.
function stepToward(boss: Smasher, npc: any, players: Player[], to: Pos, now: number): boolean {
    const main = axisToward(npc.pos, to);
    const other = main.x ? { x: 0, y: Math.sign(to.y - npc.pos.y) } : { x: Math.sign(to.x - npc.pos.x), y: 0 };
    for (const dir of [main, other]) {
        if (!dir.x && !dir.y) continue;
        const next = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
        const victim = players.find((user) => user.pos.x === next.x && user.pos.y === next.y);
        if (victim) {
            touch(npc, boss.touchedAt, victim, dir, "El Machacador te llevó por delante:", now);
            return false;
        }
        if (!canStand(boss.mapId, boss.room, next, boss.npcId)) continue;
        moveNpc(npc, boss.mapId, next);
        return true;
    }
    return false;
}

function wander(boss: Smasher, npc: any, players: Player[], now: number) {
    boss.nextAt = now + WANDER_STEP_MS;
    const options = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]
        .map((dir) => ({ x: npc.pos.x + dir.x, y: npc.pos.y + dir.y }))
        .filter((tile) => canStand(boss.mapId, boss.room, tile, boss.npcId) && !players.some((user) => user.pos.x === tile.x && user.pos.y === tile.y));
    if (options.length) moveNpc(npc, boss.mapId, options[Math.floor(Math.random() * options.length)]);
}

// Las baldosas por las que pasa algo tirado de `from` hacia `to`, hasta `range` y sin pasar paredes ni salir de la sala.
function flightPath(mapId: number, room: number, from: Pos, to: Pos, range: number): Pos[] {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const span = Math.max(Math.abs(dx), Math.abs(dy));
    if (!span) return [];
    const steps = Math.min(range, Math.max(2, span));
    const path: Pos[] = [];
    for (let i = 1; i <= steps; i++) {
        const tile = { x: Math.round(from.x + (dx * i) / span), y: Math.round(from.y + (dy * i) / span) };
        const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
        if (!cell || cell.blocked || getDungeons().roomAt(mapId, tile.x, tile.y) !== room) break;
        path.push(tile);
    }
    return path;
}

// Le tira la bola al jugador más cercano: vuela hasta donde estaba y le pega al primero que encuentra en el camino.
function bossThrow(boss: Smasher, npc: any, players: Player[], now: number) {
    const target = nearest(players, npc.pos);
    const ball = boss.ball;
    if (!ball) return;
    let path = target ? flightPath(boss.mapId, boss.room, npc.pos, target.pos, BOSS_THROW_RANGE) : [];
    if (!path.length) path = [{ x: npc.pos.x, y: npc.pos.y + 1 }];
    const hitIndex = path.findIndex((tile) => players.some((user) => user.pos.x === tile.x && user.pos.y === tile.y));
    if (hitIndex >= 0) path = path.slice(0, hitIndex + 1);
    const end = path[path.length - 1];
    const ms = path.length * BALL_TILE_MS;
    if (target) face(npc, target.pos);
    ball.estado = "vuela";
    sendBall(boss, { desde: { x: npc.pos.x, y: npc.pos.y }, hasta: end, ms, alto: true });
    sound(boss.mapId, npc.pos, getTools().TOOL_SOUNDS.levantar);
    boss.mode = "pausa";
    boss.nextAt = now + ms + AFTER_THROW_MS;
    const travel = axisToward(npc.pos, end);
    setTimeout(() => {
        if (!smashers.has(boss.npcId)) return;
        if (hitIndex >= 0) {
            const tools = getTools();
            const victim = playersInRoom(boss.mapId, boss.room).find((user) => chebyshev(user.pos, end) === 0 && !getMotion().isAirborne(user));
            if (victim && tools.mirrorBlocks(victim, travel)) {
                sound(boss.mapId, victim.pos, tools.TOOL_SOUNDS.bloqueo);
                tell(victim, "¡El Escudo Espejo frenó la bola!");
            } else if (victim) {
                hurt(victim, BALL_DAMAGE, "Te pegó la bola de hierro del Machacador:");
                if (!victim.dead) getMotion().push(victim, travel, 1);
            }
        }
        landBall(boss, end);
    }, ms);
}

function tickSmasher(boss: Smasher, npc: any, players: Player[], now: number) {
    if (!boss.ball) {
        // La bola arranca a unas baldosas de él, como en el original.
        const spot = freeTileNear(boss.mapId, boss.room, { x: boss.home.x + 3, y: boss.home.y + 1 }) ?? freeTileNear(boss.mapId, boss.room, boss.home);
        if (!spot) return;
        boss.ball = { ...spot, estado: "piso", carrierId: null };
        getDungeons().setDungeonBlocked(boss.mapId, spot.x, spot.y, true);
        sendBall(boss);
    }
    const ball = boss.ball;
    if (now >= boss.nextSyncAt && ball.estado !== "vuela") {
        boss.nextSyncAt = now + SYNC_MS;
        sendBall(boss);
    }
    if (ball.estado === "jugador") {
        const carrier = vars.personajes?.[ball.carrierId ?? ""] as Player | undefined;
        if (!carrier || carrier.dead || Number(carrier.map) !== boss.mapId) landBall(boss, carrier?.pos ?? boss.home);
    }
    if (now < boss.nextAt) return;
    if (boss.mode === "pausa") boss.mode = "busca";
    if (boss.mode === "levanta") {
        boss.mode = "acerca";
        boss.steps = APPROACH_STEPS;
    }
    if (boss.mode === "acerca") {
        const target = nearest(players, npc.pos);
        if (boss.steps > 0 && target && chebyshev(target.pos, npc.pos) > 2) {
            boss.steps--;
            boss.nextAt = now + APPROACH_STEP_MS;
            stepToward(boss, npc, players, target.pos, now);
            sendBall(boss);
            return;
        }
        return bossThrow(boss, npc, players, now);
    }
    // Busca la bola; si la tiene alguien (o está en el aire), deambula.
    if (ball.estado !== "piso") return wander(boss, npc, players, now);
    boss.nextAt = now + SEEK_STEP_MS;
    if (manhattan(npc.pos, ball) === 1) {
        face(npc, ball);
        getDungeons().setDungeonBlocked(boss.mapId, ball.x, ball.y, false);
        ball.estado = "jefe";
        boss.mode = "levanta";
        boss.nextAt = now + LIFT_MS;
        sound(boss.mapId, npc.pos, getTools().TOOL_SOUNDS.levantar);
        sendBall(boss);
        return;
    }
    stepToward(boss, npc, players, ball, now);
}

// El Brazalete sobre la baldosa de adelante: si ahí está la bola, la levanta.
export function liftBall(user: Player, front: Pos): boolean {
    for (const boss of smashers.values()) {
        const ball = boss.ball;
        if (boss.mapId !== Number(user.map) || !ball || ball.estado !== "piso" || ball.x !== front.x || ball.y !== front.y) continue;
        getDungeons().setDungeonBlocked(boss.mapId, ball.x, ball.y, false);
        ball.estado = "jugador";
        ball.carrierId = String(user.id);
        sendBall(boss);
        return true;
    }
    return false;
}

// La tira hacia adonde mira: si le pega al Machacador, le saca un cuarto de la vida y rebota.
export function throwBall(user: Player, heading: number, dir: Pos) {
    const boss = [...smashers.values()].find((b) => b.ball?.estado === "jugador" && b.ball.carrierId === String(user.id));
    if (!boss?.ball) return;
    const tools = getTools();
    const line = tools.traceLine(boss.mapId, user.pos, dir, PLAYER_THROW_RANGE, false);
    const hit = line.npcId !== null && String(line.npcId) === boss.npcId;
    const to = line.npcId ? line.end : (line.end ?? { x: user.pos.x, y: user.pos.y });
    // Rebota en el Machacador (o en lo que lo frenó) y queda en la última baldosa libre del vuelo.
    const landing = line.npcId || line.target ? (line.path.at(-1) ?? { x: user.pos.x, y: user.pos.y }) : to;
    const distance = Math.max(1, manhattan(to, user.pos));
    boss.ball.estado = "vuela";
    boss.ball.carrierId = null;
    motionPacket(boss.mapId, user.pos, {
        id: Number(user.id),
        tipo: "tira",
        heading,
        ms: PLAYER_THROW_STEP_MS,
        to,
        golpe: line.npcId ? "criatura" : line.blocked || line.target ? "pared" : null,
        obj: getDungeons().DUNGEON_OBJ.bolaDeHierro,
        entera: true,
    });
    setTimeout(() => {
        const npc = vars.npcs?.[boss.npcId];
        if (!smashers.has(boss.npcId) || !npc) return;
        if (hit) {
            boss.hits++;
            sound(boss.mapId, npc.pos, tools.TOOL_SOUNDS.romper);
            strike(npc, hitFor(npc, SMASHER_HITS), String(user.id), boss.room);
            if (!smashers.has(boss.npcId)) return;
            tellRoom(boss.mapId, boss.room, `¡Bolazo! El Machacador se tambalea (${boss.hits} de ${SMASHER_HITS}).`);
            // Retrocede una baldosa y queda un momento atontado.
            const back = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
            if (canStand(boss.mapId, boss.room, back, boss.npcId)) moveNpc(npc, boss.mapId, back);
            boss.mode = "pausa";
            boss.nextAt = Date.now() + FLINCH_MS;
        }
        landBall(boss, landing);
    }, distance * PLAYER_THROW_STEP_MS);
}

// Se le cayó (murió, salió del mapa o la soltó): cae a sus pies.
export function dropBall(user: Player) {
    const boss = [...smashers.values()].find((b) => b.ball?.estado === "jugador" && b.ball.carrierId === String(user.id));
    if (boss) landBall(boss, { x: user.pos.x, y: user.pos.y });
}

// --- Las Serpientes Glotonas ---

function snakePacket(snake: Snake, npc: any, estado: string) {
    bossPacket(snake.mapId, npc.pos, { id: Number(snake.npcId), tipo: "glotona", x: npc.pos.x, y: npc.pos.y, estado });
}

// Una bomba recién puesta (todavía sin explotar) al lado de la cabeza, o en su línea a pocas baldosas.
function bombNear(snake: Snake, npc: any, now: number) {
    const bombs = getTools().bombsOn(snake.mapId).filter((bomb: any) => now - bomb.placedAt < BOMB_FRESH_MS && getDungeons().roomAt(snake.mapId, bomb.x, bomb.y) === snake.room);
    const adjacent = bombs.find((bomb: any) => manhattan(bomb, npc.pos) <= 1);
    if (adjacent) return { bomb: adjacent, adjacent: true };
    const ahead = bombs.find((bomb: any) => {
        const dx = bomb.x - npc.pos.x;
        const dy = bomb.y - npc.pos.y;
        if ((dx && dy) || manhattan(bomb, npc.pos) > BOMB_SIGHT) return false;
        const dir = { x: Math.sign(dx), y: Math.sign(dy) };
        for (let tile = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y }; tile.x !== bomb.x || tile.y !== bomb.y; tile = { x: tile.x + dir.x, y: tile.y + dir.y }) {
            if (!canStand(snake.mapId, snake.room, tile, snake.npcId)) return false;
        }
        return true;
    });
    return ahead ? { bomb: ahead, adjacent: false } : null;
}

function eat(snake: Snake, npc: any, bomb: any, now: number) {
    if (bomb.x !== npc.pos.x || bomb.y !== npc.pos.y) face(npc, bomb);
    getTools().eatBomb(bomb);
    snake.mode = "digiere";
    snake.eaten++;
    snake.digestStartedAt = now;
    snake.digestStep = 0;
    snake.feederId = bomb.ownerId;
    sound(snake.mapId, npc.pos, getTools().TOOL_SOUNDS.levantar);
    snakePacket(snake, npc, "come");
    tellRoom(snake.mapId, snake.room, `¡La Serpiente Glotona se tragó la bomba! (${snake.eaten} de ${BOMBS_TO_KILL})`);
}

function digest(snake: Snake, npc: any, now: number) {
    const elapsed = now - snake.digestStartedAt;
    if (snake.digestStep === 0 && elapsed >= SWELL_AT_MS) {
        snake.digestStep = 1;
        sound(snake.mapId, npc.pos, getTools().TOOL_SOUNDS.explosion);
        snakePacket(snake, npc, snake.eaten >= BOMBS_TO_KILL ? "revienta" : "infla");
    }
    if (snake.digestStep === 1 && elapsed >= BURP_AT_MS) {
        snake.digestStep = 2;
        if (snake.eaten >= BOMBS_TO_KILL) {
            strike(npc, Number(npc.hp ?? 0), snake.feederId, snake.room);
            return;
        }
        snakePacket(snake, npc, "eructa");
    }
    if (snake.digestStep === 2 && elapsed >= DIGEST_MS) {
        snake.mode = "anda";
        snake.nextAt = now + SNAKE_STEP_MS;
    }
}

// Siempre gira 90°: a un lado o al otro (cada cuatro giros, hacia el jugador más cercano), si se puede.
function turn(snake: Snake, npc: any, players: Player[]) {
    snake.turns++;
    const sides = [{ x: -snake.dir.y, y: snake.dir.x }, { x: snake.dir.y, y: -snake.dir.x }].filter((dir) =>
        canStand(snake.mapId, snake.room, { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y }, snake.npcId),
    );
    const target = nearest(players, npc.pos);
    let dir: Pos;
    if (!sides.length) dir = { x: -snake.dir.x, y: -snake.dir.y };
    else if (snake.turns % 4 === 0 && target) {
        sides.sort((a, b) => manhattan({ x: npc.pos.x + a.x, y: npc.pos.y + a.y }, target.pos) - manhattan({ x: npc.pos.x + b.x, y: npc.pos.y + b.y }, target.pos));
        dir = sides[0];
    } else dir = sides[Math.floor(Math.random() * sides.length)];
    snake.dir = dir;
    snake.steps = SNAKE_RUN_MIN + Math.floor(Math.random() * (SNAKE_RUN_MAX - SNAKE_RUN_MIN + 1));
}

function tickSnake(snake: Snake, npc: any, players: Player[], now: number) {
    if (snake.mode === "digiere") return digest(snake, npc, now);
    if (now < snake.nextAt) return;
    snake.nextAt = now + SNAKE_STEP_MS;
    const found = bombNear(snake, npc, now);
    if (found?.adjacent) return eat(snake, npc, found.bomb, now);
    if (found) {
        snake.dir = axisToward(npc.pos, found.bomb);
        snake.steps = manhattan(found.bomb, npc.pos);
    }
    if (snake.steps <= 0) turn(snake, npc, players);
    const next = { x: npc.pos.x + snake.dir.x, y: npc.pos.y + snake.dir.y };
    const victim = players.find((user) => user.pos.x === next.x && user.pos.y === next.y);
    if (victim) {
        touch(npc, snake.touchedAt, victim, snake.dir, "Te mordió una Serpiente Glotona:", now);
        return turn(snake, npc, players);
    }
    if (!canStand(snake.mapId, snake.room, next, snake.npcId)) return turn(snake, npc, players);
    moveNpc(npc, snake.mapId, next);
    snake.steps--;
}

// --- El Rostro de Piedra ---

function facePacket(facade: Facade, estado: string, extra: Record<string, unknown> = {}) {
    bossPacket(facade.mapId, facade.center, { id: Number(facade.npcId), tipo: "rostro", x: facade.center.x, y: facade.center.y, estado, ...extra });
}

// Lo que va a tirar, en orden: las baldosas de a parejas opuestas (girando alrededor de la cara) y después las vasijas,
// en cruz (arriba a la izquierda, abajo a la derecha, abajo a la izquierda, arriba a la derecha).
function buildQueue(facade: Facade) {
    facade.queued = true;
    const tiles = getShrine().takeRoomTiles(facade.mapId, facade.room) as Pos[];
    const angle = (tile: Pos) => Math.atan2(tile.y - facade.center.y, tile.x - facade.center.x);
    tiles.sort((a, b) => angle(a) - angle(b));
    const half = Math.ceil(tiles.length / 2);
    for (let i = 0; i < half; i++) {
        facade.queue.push(tiles[i]);
        if (tiles[i + half]) facade.queue.push(tiles[i + half]);
    }
    const vases = getDungeons().vasesInRoom(facade.mapId, facade.room) as Pos[];
    const corner = (vase: Pos) => (vase.y < facade.center.y ? 0 : 2) + (vase.x < facade.center.x ? 0 : 1);
    const order = [0, 3, 2, 1];
    vases.sort((a, b) => order.indexOf(corner(a)) - order.indexOf(corner(b)));
    for (const vase of vases) facade.queue.push({ ...vase, vasija: true });
}

function launchNext(facade: Facade) {
    const shrine = getShrine();
    while (facade.queue.length) {
        const next = facade.queue.shift()!;
        if (!next.vasija) {
            shrine.launchFloorTile(facade.mapId, next, facade.room, { damage: TILE_DAMAGE, message: "Te pegó una baldosa:" });
            return;
        }
        // Si alguien ya levantó la vasija, la saltea.
        const lifted = getDungeons().liftAt(facade.mapId, next.x, next.y);
        if (!lifted) continue;
        shrine.launchFloorTile(facade.mapId, next, facade.room, { damage: VASE_DAMAGE, message: "Te pegó una vasija:", obj: lifted.objIndex, lifted: true });
        return;
    }
}

// Los 16 lugares de los pozos: el anillo a dos baldosas de la cara.
function pitSpots(facade: Facade): Pos[] {
    const spots: Pos[] = [];
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== 2) continue;
            const tile = { x: facade.center.x + dx, y: facade.center.y + dy };
            const cell = vars.mapa[facade.mapId]?.[tile.y]?.[tile.x];
            if (cell && !cell.blocked && getDungeons().roomAt(facade.mapId, tile.x, tile.y) === facade.room) spots.push(tile);
        }
    }
    return spots;
}

// Un pozo: avisa (se raja), se abre, chupa al que está cerca y se cierra solo.
function openPit(facade: Facade, now: number) {
    const spots = pitSpots(facade).filter((tile) => {
        const key = coordKey(tile.x, tile.y);
        return key !== facade.lastPit && !facade.pits.has(key) && !getDungeons().isHazard(facade.mapId, tile.x, tile.y);
    });
    if (!spots.length) return;
    const tile = spots[Math.floor(Math.random() * spots.length)];
    const key = coordKey(tile.x, tile.y);
    facade.lastPit = key;
    const openAt = now + PIT_WARN_MS + PIT_OPENING_MS;
    facade.pits.set(key, { ...tile, key, openAt, closeAt: openAt + PIT_OPEN_MS, open: false });
    bossPacket(facade.mapId, tile, {
        id: Number(facade.npcId),
        tipo: "pozo",
        x: tile.x,
        y: tile.y,
        fases: { aviso: PIT_WARN_MS, abre: PIT_OPENING_MS, abierto: PIT_OPEN_MS, cierra: PIT_CLOSING_MS },
    });
    sound(facade.mapId, tile, getDungeons().DUNGEON_SOUNDS.derrumbe);
}

function closePit(facade: Facade, pit: Pit) {
    facade.pits.delete(pit.key);
    if (pit.open) getDungeons().setBossPit(facade.mapId, pit.x, pit.y, false);
}

function tickPits(facade: Facade, players: Player[], now: number) {
    const dungeons = getDungeons();
    for (const pit of [...facade.pits.values()]) {
        if (!pit.open && now >= pit.openAt) {
            pit.open = true;
            dungeons.setBossPit(facade.mapId, pit.x, pit.y, true);
        }
        if (pit.open && now >= pit.closeAt) closePit(facade, pit);
    }
    if (now < facade.nextPullAt) return;
    facade.nextPullAt = now + PULL_EVERY_MS;
    const motion = getMotion();
    for (const pit of facade.pits.values()) {
        if (!pit.open) continue;
        for (const user of players) {
            const distance = chebyshev(user.pos, pit);
            if (distance > PULL_RADIUS || motion.isAirborne(user) || motion.isMoving(user)) continue;
            const ws = vars.clients?.[user.id] as RuntimeClient | undefined;
            if (!distance) {
                if (ws) dungeons.fallIfHazard(ws, user);
                continue;
            }
            motion.push(user, axisToward(user.pos, pit), 1);
        }
    }
}

function tickFacade(facade: Facade, players: Player[], now: number) {
    if (now >= facade.nextSyncAt) {
        facade.nextSyncAt = now + SYNC_MS;
        const estado = facade.mode === "pelea" ? (now < facade.immuneUntil ? "cerrada" : "pelea") : facade.mode === "aparece" ? "aparece" : "oculta";
        facadePacketSync(facade, estado, now);
    }
    if (facade.mode === "espera") {
        if (!players.length) return;
        facade.mode = "despierta";
        facade.modeUntil = now + WAKE_MS;
        return;
    }
    if (facade.mode === "despierta") {
        if (now < facade.modeUntil) return;
        facade.mode = "aparece";
        facade.modeUntil = now + APPEAR_MS;
        facePacket(facade, "aparece", { ms: APPEAR_MS });
        return;
    }
    if (facade.mode === "aparece") {
        if (now < facade.modeUntil) return;
        facade.mode = "pelea";
        facade.nextLaunchAt = now + FIRST_LAUNCH_MS;
        facePacket(facade, "pelea");
        tellRoom(facade.mapId, facade.room, "Rostro de Piedra: «¡Eh, tonto! ¿Querés una pista? Mi punto débil es... ¡Uy! ¡Casi!»", "#C9B99A");
        return;
    }
    // Sin nadie en la sala (se cayeron o murieron todos) no tira nada.
    if (!players.length) return;
    if (!facade.queued) buildQueue(facade);
    if (facade.queue.length && now >= facade.nextLaunchAt) {
        facade.nextLaunchAt = now + LAUNCH_EVERY_MS;
        launchNext(facade);
        if (!facade.queue.length) facade.pitsFrom = now + PITS_AFTER_MS;
    }
    if (!facade.queue.length && facade.pitsFrom && now >= facade.pitsFrom && now >= facade.nextPitAt && facade.pits.size < MAX_PITS) {
        facade.nextPitAt = now + randomBetween(PIT_EVERY_MIN_MS, PIT_EVERY_MAX_MS);
        openPit(facade, now);
    }
    tickPits(facade, players, now);
}

// Los que entran a la vista después tienen que ver la cara en el estado en que está.
function facadePacketSync(facade: Facade, estado: string, now: number) {
    facePacket(facade, estado, { sync: true, ...(estado === "cerrada" ? { ms: facade.immuneUntil - now } : {}) });
}

// Una bomba explotó en (x, y): si alcanzó la cara del Rostro de Piedra, le saca un quinto de la vida (salvo que esté
// cerrada). Devuelve las criaturas que ya resolvió, para que la explosión no les pegue de nuevo.
export function onExplosion(user: RuntimeCharacter, mapId: number, at: Pos): Set<string> {
    const handled = new Set<string>();
    const now = Date.now();
    for (const facade of facades.values()) {
        if (facade.mapId !== mapId || chebyshev(at, facade.center) > FACE_BLAST_REACH) continue;
        const npc = vars.npcs?.[facade.npcId];
        if (!npc) continue;
        handled.add(facade.npcId);
        if (facade.mode !== "pelea") continue;
        if (now < facade.immuneUntil) {
            tell(user, "La cara se cerró: esperá a que vuelva a abrir los ojos.");
            continue;
        }
        facade.hits++;
        facade.immuneUntil = now + FACE_IMMUNE_MS;
        strike(npc, hitFor(npc, FACE_HITS), String(user.id), facade.room);
        if (!facades.has(facade.npcId)) continue;
        facePacket(facade, "golpe", { ms: FACE_IMMUNE_MS });
        tellRoom(facade.mapId, facade.room, `¡La bomba le dio en la cara al Rostro de Piedra! (${facade.hits} de ${FACE_HITS})`);
    }
    return handled;
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    for (const boss of smashers.values()) {
        if (boss.mapId !== mapId) continue;
        const npc = vars.npcs?.[boss.npcId];
        if (!npc) {
            smashers.delete(boss.npcId);
            continue;
        }
        const players = playersInRoom(mapId, boss.room);
        if (players.length || boss.ball?.estado === "jugador") tickSmasher(boss, npc, players, now);
    }
    for (const snake of snakes.values()) {
        if (snake.mapId !== mapId) continue;
        const npc = vars.npcs?.[snake.npcId];
        if (!npc) {
            snakes.delete(snake.npcId);
            continue;
        }
        const players = playersInRoom(mapId, snake.room);
        if (players.length || snake.mode === "digiere") tickSnake(snake, npc, players, now);
    }
    for (const facade of facades.values()) {
        if (facade.mapId !== mapId) continue;
        if (!vars.npcs?.[facade.npcId]) {
            facades.delete(facade.npcId);
            continue;
        }
        tickFacade(facade, playersInRoom(mapId, facade.room), now);
    }
}

module.exports = {
    register,
    onNpcDied,
    forgetMap,
    claimsTiles,
    invulnerableReason,
    liftBall,
    throwBall,
    dropBall,
    onExplosion,
    tick,
};
