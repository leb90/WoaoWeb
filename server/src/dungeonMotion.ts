// Ítems de mazmorra que mueven al personaje (docs/mazmorras/02-CAVERNA_DE_LAS_LLAVES.md, secciones 6 y 7): la
// Carrera de las Botas de Pegaso y el salto de la Pluma. Solo funcionan adentro de una mazmorra.
//
// El server decide el movimiento entero y se lo manda de una vez a los que miran (paquete dungeonMotion): cada
// cliente lo anima (la carga previa, la corrida con su estela, el arco del salto). Después el server mueve al
// personaje baldosa por baldosa con la misma contabilidad que un paso normal, sin avisar cada paso: así no se pisa
// con la animación. Basado en el Dash Attack del guerrero de _Argentum/_React-Argentum.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

export const DASH_ITEM = "botas_de_pegaso";
export const JUMP_ITEM = "pluma";

const CHARGE_MS = 500;
const DASH_STEP_MS = 55;
const DASH_MAX_TILES = 8;
const DASH_COOLDOWN_MS = 1_500;
const DASH_HIT_BONUS = 0.5; // un golpe y medio
const JUMP_MS = 420;
const JUMP_COOLDOWN_MS = 1_000;
// Saltando se pasa por encima de 1 baldosa (cae 2 adelante); corriendo, de 2 (cae 3 adelante).
const JUMP_GAP = 1;
const LONG_JUMP_GAP = 2;
const PUSH_STEP_MS = 70;

type Motion = { tipo: "carga" | "carrera" | "salto" | "empujon" | "gancho"; until: number };
type MotionUser = RuntimeCharacter & {
    dungeonMotion?: Motion | null;
    // Lo que lleva sobre la cabeza con el Brazalete de Fuerza (dungeonTools.ts).
    dungeonCarry?: { tipo: string; objIndex: number; map: number } | null;
    nextDashAt?: number;
    nextJumpAt?: number;
    dead?: boolean;
    paralizado?: boolean;
    inmovilizado?: boolean;
    heading?: number;
};
type Pos = { x: number; y: number };

function getDungeons() {
    return require("./dungeons");
}

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

function getProtocol() {
    return require("./protocol");
}

export function headingOffset(heading: number): Pos {
    const dir = vars.direcciones;
    if (heading === dir.up) return { x: 0, y: -1 };
    if (heading === dir.down) return { x: 0, y: 1 };
    if (heading === dir.right) return { x: 1, y: 0 };
    if (heading === dir.left) return { x: -1, y: 0 };
    return { x: 0, y: 1 };
}

function tell(sessionId: EntityId, message: string) {
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (client) getHandleProtocol().console(message, "white", 0, 0, client);
}

// Lo mismo que ven todos los que tienen al personaje a la vista (y él).
function broadcast(user: RuntimeCharacter, payload: Record<string, unknown>) {
    const handleProtocol = getHandleProtocol();
    const sent = new Set<string>();
    const send = (id: EntityId) => {
        const client = vars.clients?.[id] as RuntimeClient | undefined;
        if (!client || sent.has(String(id))) return;
        sent.add(String(id));
        handleProtocol.dungeonMotion(payload, client);
    };
    send(user.id);
    getGame().loopAreaPos(Number(user.map), user.pos, (target: { id: EntityId }) => send(target.id));
}

export function isMoving(user: RuntimeCharacter | undefined): boolean {
    const motion = (user as MotionUser | undefined)?.dungeonMotion;
    return Boolean(motion && motion.until > Date.now());
}

// En el aire (saltando con la Pluma o colgado de la cadena del Gancho): el rodillo, el Ciempiés y la lava no lo tocan.
export function isAirborne(user: RuntimeCharacter | undefined): boolean {
    const motion = (user as MotionUser | undefined)?.dungeonMotion;
    return Boolean(motion && (motion.tipo === "salto" || motion.tipo === "gancho") && motion.until > Date.now());
}

// Mientras carga, corre, salta, lo empujan o lo arrastra el Gancho no se ataca ni se lanzan hechizos; tampoco con
// algo levantado con el Brazalete de Fuerza.
export function getMotionBlockReason(user: RuntimeCharacter | undefined): string | null {
    const mover = user as MotionUser | undefined;
    const motion = mover?.dungeonMotion;
    if (!motion || motion.until <= Date.now()) return mover?.dungeonCarry ? "Tenés las manos ocupadas." : null;
    if (motion.tipo === "salto") return "No podés atacar en el aire.";
    if (motion.tipo === "gancho") return "No podés atacar colgado del gancho.";
    return motion.tipo === "empujon" ? "No podés atacar mientras te empujan." : "No podés atacar mientras corrés.";
}

// Si puede usar un ítem de mazmorra ahora (avisa por qué no). `carrying`: lo puede usar con algo levantado.
export function canAct(sessionId: EntityId, user: MotionUser, itemId: string, itemName: string, carrying = false): boolean {
    const dungeons = getDungeons();
    if (!dungeons.isDungeonInstanceMap(user.map)) {
        tell(sessionId, "Los ítems de mazmorra solo funcionan adentro de una mazmorra.");
        return false;
    }
    if (!dungeons.characterHasDungeonItem(user, itemId)) {
        tell(sessionId, `Necesitás ${itemName}.`);
        return false;
    }
    if (user.dead) return false;
    if (user.paralizado || user.inmovilizado) {
        tell(sessionId, "No te podés mover.");
        return false;
    }
    if (getGame().hayAgua(Number(user.map), user.pos)) {
        tell(sessionId, "Nadando no se puede.");
        return false;
    }
    if (user.dungeonCarry && !carrying) {
        tell(sessionId, "Tenés las manos ocupadas.");
        return false;
    }
    return !isMoving(user);
}

// Dónde cae un salto desde `from` hacia `dir`: la baldosa segura más lejana a `gap + 1` baldosas como mucho. Se
// pasa por encima de pozos, lava, pinchos, agua o criaturas; las paredes y lo bloqueado cortan el salto.
export function findLanding(mapId: number, from: Pos, dir: Pos, gap: number, ignoreId?: EntityId): Pos | null {
    const dungeons = getDungeons();
    let landing: Pos | null = null;
    for (let distance = 1; distance <= gap + 1; distance++) {
        const tile = { x: from.x + dir.x * distance, y: from.y + dir.y * distance };
        if (!dungeons.isJumpable(mapId, tile.x, tile.y)) break;
        if (dungeons.isSafeLanding(mapId, tile.x, tile.y, ignoreId)) landing = tile;
    }
    return landing;
}

// --- Carrera ---

type DashPlan = {
    path: Pos[];
    golpe: "pared" | "criatura" | "obstaculo" | null;
    impact: Pos | null;
    npcId: EntityId | null;
    crystals: Pos[];
    salto: { from: Pos; to: Pos } | null;
};

export function planDash(user: RuntimeCharacter, canJump: boolean): DashPlan {
    const dungeons = getDungeons();
    const game = getGame();
    const mapId = Number(user.map);
    const dir = headingOffset(Number((user as MotionUser).heading ?? vars.direcciones.down));
    const plan: DashPlan = { path: [], golpe: null, impact: null, npcId: null, crystals: [], salto: null };
    let current = { x: user.pos.x, y: user.pos.y };
    for (let i = 0; i < DASH_MAX_TILES; i++) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (next.x < 1 || next.y < 1 || next.x > 100 || next.y > 100) break;
        if (!dungeons.canPassOneWay(mapId, current, next)) {
            plan.golpe = "obstaculo";
            plan.impact = next;
            break;
        }
        const obstacle = dungeons.getDashObstacle(mapId, next.x, next.y);
        if (obstacle === "cristal") {
            plan.crystals.push(next);
        } else if (obstacle === "pared") {
            plan.golpe = "pared";
            plan.impact = next;
            break;
        }
        const occupantId = vars.mapData[mapId]?.[next.y]?.[next.x]?.id;
        if (occupantId && String(occupantId) !== String(user.id)) {
            const npc = vars.npcs?.[occupantId];
            plan.golpe = npc ? "criatura" : "obstaculo";
            plan.impact = next;
            plan.npcId = npc ? occupantId : null;
            break;
        }
        if (obstacle !== "cristal" && vars.mapa[mapId]?.[next.y]?.[next.x]?.blocked) {
            plan.golpe = "obstaculo";
            plan.impact = next;
            break;
        }
        if (game.hayAgua(mapId, next)) break;
        if (dungeons.isHazard(mapId, next.x, next.y)) {
            // Al borde de un pozo: con la pluma salta solo (salto largo); sin ella, frena.
            const landing = canJump ? findLanding(mapId, current, dir, LONG_JUMP_GAP, user.id) : null;
            if (landing) plan.salto = { from: current, to: landing };
            break;
        }
        plan.path.push(next);
        current = next;
    }
    return plan;
}

export function startDash(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as MotionUser | undefined;
    const ws = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !ws || !canAct(sessionId, user, DASH_ITEM, "las Botas de Pegaso")) return;
    const now = Date.now();
    if (now < Number(user.nextDashAt ?? 0)) return;
    const heading = Number(user.heading ?? vars.direcciones.down);
    user.dungeonMotion = { tipo: "carga", until: now + CHARGE_MS + 50 };
    broadcast(user, { id: Number(user.id), tipo: "carga", heading, ms: CHARGE_MS });
    setTimeout(() => runDash(sessionId, heading), CHARGE_MS);
}

function runDash(sessionId: EntityId, heading: number) {
    const user = vars.personajes?.[sessionId] as MotionUser | undefined;
    const ws = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !ws || user.dead || !getDungeons().isDungeonInstanceMap(user.map)) {
        if (user) user.dungeonMotion = null;
        return;
    }
    user.heading = heading;
    const dungeons = getDungeons();
    const canJump = dungeons.characterHasDungeonItem(user, JUMP_ITEM);
    const plan = planDash(user, canJump);
    const mapId = Number(user.map);
    const dashMs = plan.path.length * DASH_STEP_MS;
    const total = dashMs + (plan.salto ? JUMP_MS : 0);
    user.dungeonMotion = { tipo: "carrera", until: Date.now() + total + 50 };
    user.nextDashAt = Date.now() + total + DASH_COOLDOWN_MS;
    dungeons.playDungeonSound(mapId, user.pos, "carrera");
    broadcast(user, {
        id: Number(user.id),
        tipo: "carrera",
        heading,
        ms: DASH_STEP_MS,
        path: plan.path,
        golpe: plan.golpe,
        salto: plan.salto ? { to: plan.salto.to, ms: JUMP_MS } : null,
    });
    const protocol = getProtocol();
    plan.path.forEach((tile, index) => {
        // El cristal se rompe justo cuando el personaje llega.
        if (plan.crystals.some((crystal) => crystal.x === tile.x && crystal.y === tile.y)) {
            setTimeout(() => dungeons.breakCrystal(mapId, tile.x, tile.y), index * DASH_STEP_MS);
        }
        setTimeout(() => {
            const mover = vars.personajes?.[sessionId] as MotionUser | undefined;
            if (!mover || mover.map !== mapId) return;
            protocol.moveUserByServer(ws, tile.x, tile.y, heading);
            dungeons.afterStep(ws, mover);
        }, (index + 1) * DASH_STEP_MS);
    });
    setTimeout(() => {
        const mover = vars.personajes?.[sessionId] as MotionUser | undefined;
        if (!mover || mover.map !== mapId) return;
        if (plan.salto) {
            // Salto largo al llegar al borde: cae cuando termina el arco.
            const to = plan.salto.to;
            dungeons.playDungeonSound(mapId, mover.pos, "salto");
            setTimeout(() => landJump(sessionId, to, heading), JUMP_MS);
            return;
        }
        if (plan.golpe === "criatura" && plan.npcId) hitNpc(ws, mover, plan.npcId, heading);
        if (plan.golpe === "pared" && plan.impact) dungeons.onDashImpact(ws, mover, plan.impact.x, plan.impact.y);
        if (plan.golpe === "obstaculo") dungeons.playDungeonSound(mapId, mover.pos, "golpe");
        mover.dungeonMotion = null;
        getProtocol().syncOwnPosition(ws);
    }, dashMs + 10);
}

// El choque contra una criatura: un golpe y medio y la empuja una baldosa.
function hitNpc(ws: RuntimeClient, user: RuntimeCharacter, npcId: EntityId, heading: number) {
    const game = getGame();
    const npc = vars.npcs?.[npcId];
    if (!npc) return;
    const dmg = game.userDmgNpc(user.id, npcId);
    if (typeof dmg === "number" && dmg > 0 && vars.npcs?.[npcId]) {
        const extra = Math.max(1, Math.floor(dmg * DASH_HIT_BONUS));
        npc.hp = Number(npc.hp ?? 0) - extra;
        const handleProtocol = getHandleProtocol();
        game.loopAreaPos(Number(user.map), user.pos, (target: { id: EntityId; isNpc?: boolean }) => {
            const client = vars.clients?.[target.id] as RuntimeClient | undefined;
            if (client) handleProtocol.dialog(npcId, `${dmg + extra}`, "", "red", 0, client);
        });
    }
    if (dmg) require("./respawn").muere(ws, npcId);
    const pushed = vars.npcs?.[npcId];
    // Las criaturas con movimiento propio (chispas, cuchillas, el rodillo y el Ciempiés) no se dejan correr.
    if (!pushed || Number(pushed.hp ?? 0) <= 0 || pushed.customMotion) return;
    const dir = headingOffset(heading);
    const to = { x: pushed.pos.x + dir.x, y: pushed.pos.y + dir.y };
    if (game.legalPosNpc(to.x, to.y, pushed.map, Boolean(pushed.aguaValida), Boolean(pushed.tierraInvalida))) {
        require("./npcs").moveNpcByPos(npcId, to);
    }
}

// --- Empujón ---

// Un golpe que empuja (escarabajos, chispas, cuchillas, el rodillo y el Ciempiés): corre al personaje hasta `tiles`
// baldosas hacia `dir`, sin girarlo. Frena en paredes, en lo bloqueado y en lo ocupado; si pasa por un pozo, cae.
export function push(user: RuntimeCharacter, dir: Pos, tiles: number) {
    const mover = user as MotionUser;
    const ws = vars.clients?.[user.id] as RuntimeClient | undefined;
    if (!ws || mover.dead || isMoving(mover) || (!dir.x && !dir.y)) return;
    const dungeons = getDungeons();
    const game = getGame();
    const mapId = Number(user.map);
    const path: Pos[] = [];
    let current = { x: user.pos.x, y: user.pos.y };
    for (let i = 0; i < tiles; i++) {
        const next = { x: current.x + dir.x, y: current.y + dir.y };
        if (next.x < 1 || next.y < 1 || next.x > 100 || next.y > 100) break;
        if (!dungeons.canPassOneWay(mapId, current, next)) break;
        const occupantId = vars.mapData[mapId]?.[next.y]?.[next.x]?.id;
        if (occupantId && String(occupantId) !== String(user.id)) break;
        if (vars.mapa[mapId]?.[next.y]?.[next.x]?.blocked || game.hayAgua(mapId, next)) break;
        path.push(next);
        current = next;
        if (dungeons.isHazard(mapId, next.x, next.y)) break;
    }
    if (!path.length) return;
    const heading = Number(mover.heading ?? vars.direcciones.down);
    mover.dungeonMotion = { tipo: "empujon", until: Date.now() + path.length * PUSH_STEP_MS + 50 };
    broadcast(user, { id: Number(user.id), tipo: "empujon", heading, ms: PUSH_STEP_MS, path });
    const protocol = getProtocol();
    path.forEach((tile, index) => {
        setTimeout(() => {
            const pushed = vars.personajes?.[user.id] as MotionUser | undefined;
            if (!pushed || pushed.map !== mapId) return;
            protocol.moveUserByServer(ws, tile.x, tile.y, heading);
            if (index < path.length - 1) return;
            pushed.dungeonMotion = null;
            protocol.syncOwnPosition(ws);
            dungeons.afterStep(ws, pushed);
            dungeons.fallIfHazard(ws, pushed);
        }, (index + 1) * PUSH_STEP_MS);
    });
}

// --- Salto ---

export function jump(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as MotionUser | undefined;
    const ws = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !ws || !canAct(sessionId, user, JUMP_ITEM, "la Pluma")) return;
    const now = Date.now();
    if (now < Number(user.nextJumpAt ?? 0)) return;
    const heading = Number(user.heading ?? vars.direcciones.down);
    const landing = findLanding(Number(user.map), user.pos, headingOffset(heading), JUMP_GAP, user.id);
    if (!landing) {
        tell(sessionId, "No hay dónde caer.");
        return;
    }
    user.dungeonMotion = { tipo: "salto", until: now + JUMP_MS + 50 };
    user.nextJumpAt = now + JUMP_MS + JUMP_COOLDOWN_MS;
    getDungeons().playDungeonSound(Number(user.map), user.pos, "salto");
    broadcast(user, { id: Number(user.id), tipo: "salto", heading, ms: JUMP_MS, to: landing });
    setTimeout(() => landJump(sessionId, landing, heading), JUMP_MS);
}

// Cae del salto: recién ahí cuenta lo que hay en el piso (placas, lava, salas).
function landJump(sessionId: EntityId, to: Pos, heading: number) {
    const user = vars.personajes?.[sessionId] as MotionUser | undefined;
    const ws = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !ws) return;
    const dungeons = getDungeons();
    const mapId = Number(user.map);
    // Si alguien se paró donde iba a caer, cae en la baldosa libre más cercana.
    const landing = dungeons.isSafeLanding(mapId, to.x, to.y, user.id)
        ? to
        : (getGame().getFreeSpace(ws, mapId, to.x, to.y, "dungeon.salto") ?? { x: user.pos.x, y: user.pos.y });
    getProtocol().moveUserByServer(ws, landing.x, landing.y, heading);
    user.dungeonMotion = null;
    getProtocol().syncOwnPosition(ws);
    dungeons.afterStep(ws, user);
}

module.exports = {
    DASH_ITEM,
    JUMP_ITEM,
    headingOffset,
    isMoving,
    isAirborne,
    getMotionBlockReason,
    canAct,
    push,
    findLanding,
    planDash,
    startDash,
    jump,
};
