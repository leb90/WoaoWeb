// Ítems de mazmorra que se tiran o se usan con las manos (docs/mazmorras/04-ROCA_DE_LA_TORTUGA.md, secciones 6 y
// 6.2): el Polvo de Fuego (una llamarada que vuela), el Gancho (una cadena que engancha y arrastra, o aturde) y la
// Pulsera (levantar, llevar y tirar vasijas y piedras). Además, los básicos que tiene todo el mundo desde la primera
// mazmorra: las Bombas (explotan a los 2 s y abren paredes rajadas) y el Arco. Solo funcionan adentro de una mazmorra.
//
// Como la Carrera y el salto (dungeonMotion.ts), el server decide todo de una vez y se lo manda a los que miran en el
// mismo paquete (dungeonMotion), con tipos nuevos: el cliente anima la llamarada, la cadena y lo que se lleva y se
// tira. Lo que pasa al llegar (encender, derretir, lastimar, arrastrar) lo aplica el server cuando termina el vuelo.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

export const FIRE_ITEM = "polvo_de_fuego";
export const HOOK_ITEM = "gancho";
export const BRACELET_ITEM = "pulsera";
export const BOMB_ITEM = "bombas";
export const BOW_ITEM = "arco";

const FIRE_RANGE = 6;
const FIRE_STEP_MS = 45;
const FIRE_COOLDOWN_MS = 700;
const HOOK_RANGE = 7;
const HOOK_STEP_MS = 40;
const HOOK_PULL_STEP_MS = 50;
const HOOK_COOLDOWN_MS = 900;
const HOOK_STUN_MS = 1_500;
const THROW_RANGE = 4;
const THROW_STEP_MS = 70;
const LIFT_COOLDOWN_MS = 350;
const BOMB_FUSE_MS = 2_000;
const ARROW_RANGE = 8;
const ARROW_STEP_MS = 35;
const ARROW_COOLDOWN_MS = 600;
// La flecha común de los arqueros (objeto 480).
const ARROW_GRH = 752;

export const TOOL_SOUNDS = {
    fuego: 222,
    gancho: 223,
    romper: 224,
    levantar: 225,
    explosion: 226,
    bomba: 227,
    flecha: 228,
} as const;

// Lo que engancha el Gancho (como en Zelda: cofres, bloques, vasijas, estatuas y antorchas).
const HOOKABLE = new Set(["antorcha", "antorchaEncendida", "hielo", "vasija", "piedra", "estatua", "cofre", "bloque", "cristal", "puerta"]);

type Pos = { x: number; y: number };
type ToolUser = RuntimeCharacter & {
    dungeonMotion?: { tipo: string; until: number } | null;
    dungeonCarry?: { tipo: string; objIndex: number; map: number } | null;
    nextFireAt?: number;
    nextHookAt?: number;
    nextLiftAt?: number;
    bombUntil?: number;
    nextArrowAt?: number;
    heading?: number;
    dead?: boolean;
    level?: number;
};
type Hit = "antorcha" | "hielo" | "criatura" | "engancha" | "pared" | null;

function getDungeons() {
    return require("./dungeons");
}

function getMotion() {
    return require("./dungeonMotion");
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

function tell(sessionId: EntityId, message: string) {
    const client = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (client) getHandleProtocol().console(message, "white", 0, 0, client);
}

function playSound(user: RuntimeCharacter, soundId: number) {
    const handleProtocol = getHandleProtocol();
    getGame().loopAreaPos(Number(user.map), user.pos, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) handleProtocol.playSound(0, soundId, client);
    });
    const own = vars.clients?.[user.id] as RuntimeClient | undefined;
    if (own) handleProtocol.playSound(0, soundId, own);
}

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

const inBounds = (tile: Pos) => tile.x >= 1 && tile.y >= 1 && tile.x <= 100 && tile.y <= 100;

// Recorre la línea hacia adonde mira, hasta `range` baldosas: se frena en la primera criatura, en lo de la mazmorra
// (antorchas, hielo, vasijas, cofres...) o en lo bloqueado. Los pozos y la lava se pasan por arriba; los personajes
// también (no hay fuego amigo), salvo para el Gancho, que no atraviesa a nadie.
export function traceLine(mapId: number, from: Pos, dir: Pos, range: number, stopAtPlayers: boolean) {
    const dungeons = getDungeons();
    const path: Pos[] = [];
    for (let distance = 1; distance <= range; distance++) {
        const tile = { x: from.x + dir.x * distance, y: from.y + dir.y * distance };
        if (!inBounds(tile)) return { path, end: path.at(-1) ?? null, target: null, npcId: null, blocked: true };
        const occupantId = vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id;
        const npc = occupantId ? vars.npcs?.[occupantId] : undefined;
        if (npc) return { path, end: tile, target: null, npcId: occupantId as EntityId, blocked: false };
        if (occupantId && stopAtPlayers) return { path, end: path.at(-1) ?? null, target: null, npcId: null, blocked: true };
        const target = dungeons.toolTargetAt(mapId, tile.x, tile.y) as string | null;
        if (target) return { path, end: tile, target, npcId: null, blocked: false };
        if (vars.mapa[mapId]?.[tile.y]?.[tile.x]?.blocked) return { path, end: path.at(-1) ?? null, target: null, npcId: null, blocked: true };
        path.push(tile);
    }
    return { path, end: path.at(-1) ?? null, target: null, npcId: null, blocked: false };
}

// Daño de los ítems: crece con el nivel, como el de un golpe, y no depende del arma.
function toolDamage(user: ToolUser, base: number, perLevel: number) {
    const level = Math.max(1, Number(user.level ?? 1));
    return Math.max(1, Math.round((base + level * perLevel) * (0.9 + Math.random() * 0.2)));
}

function damageNpc(user: ToolUser, npcId: EntityId, amount: number) {
    const npc = vars.npcs?.[npcId];
    const ws = vars.clients?.[user.id] as RuntimeClient | undefined;
    if (!npc || !ws || !getDungeons().canToolHitNpc(npc)) return false;
    npc.hp = Math.max(0, Number(npc.hp ?? 0) - amount);
    const handleProtocol = getHandleProtocol();
    getGame().loopAreaPos(Number(npc.map), npc.pos, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) handleProtocol.dialog(npcId, `${amount}`, "", "red", 0, client);
    });
    getDungeons().broadcastNpcVitals(npc);
    if (npc.hp <= 0) require("./respawn").muere(ws, npcId);
    return true;
}

// --- Polvo de Fuego ---

export function fire(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user || !getMotion().canAct(sessionId, user, FIRE_ITEM, "el Polvo de Fuego")) return;
    const now = Date.now();
    if (now < Number(user.nextFireAt ?? 0)) return;
    user.nextFireAt = now + FIRE_COOLDOWN_MS;
    const mapId = Number(user.map);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const line = traceLine(mapId, user.pos, dir, FIRE_RANGE, false);
    let golpe: Hit = null;
    if (line.npcId) golpe = "criatura";
    else if (line.target === "antorcha") golpe = "antorcha";
    else if (line.target === "hielo") golpe = "hielo";
    else if (line.target || line.blocked) golpe = "pared";
    // La llamarada llega a la baldosa del blanco (o a la última libre si se apaga contra la pared).
    const to = line.end ?? { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
    const distance = Math.max(1, Math.abs(to.x - user.pos.x) + Math.abs(to.y - user.pos.y));
    playSound(user, TOOL_SOUNDS.fuego);
    broadcast(user, { id: Number(user.id), tipo: "fuego", heading, ms: FIRE_STEP_MS, to, golpe });
    setTimeout(() => {
        const dungeons = getDungeons();
        if (golpe === "antorcha") dungeons.lightTorch(mapId, to.x, to.y);
        else if (golpe === "hielo") dungeons.meltIce(mapId, to.x, to.y);
        else if (golpe === "criatura" && line.npcId) {
            // Las babosas, las momias, las hélices y los vire (plantillas con "debilFuego") se queman el doble.
            const npc = vars.npcs?.[line.npcId];
            const weak = Boolean(vars.datNpc?.[Number(npc?.templateNpcIndex ?? 0)]?.debilFuego);
            damageNpc(user, line.npcId, toolDamage(user, 20, 3) * (weak ? 2 : 1));
        }
    }, distance * FIRE_STEP_MS);
}

// --- Gancho ---

export function hookshot(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    const ws = vars.clients?.[sessionId] as RuntimeClient | undefined;
    if (!user || !ws || !getMotion().canAct(sessionId, user, HOOK_ITEM, "el Gancho")) return;
    const now = Date.now();
    if (now < Number(user.nextHookAt ?? 0)) return;
    const mapId = Number(user.map);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const line = traceLine(mapId, user.pos, dir, HOOK_RANGE, true);
    let golpe: Hit = null;
    let pull: Pos[] = [];
    if (line.npcId) golpe = "criatura";
    else if (line.target && HOOKABLE.has(line.target)) {
        golpe = "engancha";
        pull = line.path;
    } else if (line.blocked) golpe = "pared";
    // La cadena llega hasta el blanco, o hasta su largo si no encontró nada.
    const to = line.end ?? { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
    const reach = Math.max(1, Math.abs(to.x - user.pos.x) + Math.abs(to.y - user.pos.y));
    const extendMs = reach * HOOK_STEP_MS;
    const pullMs = pull.length * HOOK_PULL_STEP_MS;
    const total = extendMs + (pull.length ? pullMs : extendMs);
    user.nextHookAt = now + total + HOOK_COOLDOWN_MS;
    user.dungeonMotion = { tipo: "gancho", until: now + total + 50 };
    playSound(user, TOOL_SOUNDS.gancho);
    broadcast(user, { id: Number(user.id), tipo: "gancho", heading, ms: HOOK_STEP_MS, to, golpe, path: pull, pullMs: HOOK_PULL_STEP_MS });
    setTimeout(() => {
        const mover = vars.personajes?.[sessionId] as ToolUser | undefined;
        if (!mover || Number(mover.map) !== mapId) return;
        if (golpe === "criatura" && line.npcId) stunNpc(mover, line.npcId);
        if (!pull.length) return;
        // Lo arrastra por encima de pozos y lava: recién al llegar cuenta lo que hay en el piso.
        const protocol = getProtocol();
        pull.forEach((tile, index) => {
            setTimeout(() => {
                const pulled = vars.personajes?.[sessionId] as ToolUser | undefined;
                if (!pulled || Number(pulled.map) !== mapId) return;
                protocol.moveUserByServer(ws, tile.x, tile.y, heading);
                if (index < pull.length - 1) return;
                pulled.dungeonMotion = null;
                protocol.syncOwnPosition(ws);
                getDungeons().afterStep(ws, pulled);
                getDungeons().fallIfHazard(ws, pulled);
            }, (index + 1) * HOOK_PULL_STEP_MS);
        });
    }, extendMs);
    if (!pull.length) setTimeout(() => {
        if (user.dungeonMotion?.tipo === "gancho") user.dungeonMotion = null;
    }, total);
}

// El Gancho en una criatura: la aturde un momento y le saca un poco de vida.
function stunNpc(user: ToolUser, npcId: EntityId) {
    const npc = vars.npcs?.[npcId];
    if (!npc || !getDungeons().canToolHitNpc(npc)) return;
    damageNpc(user, npcId, toolDamage(user, 5, 1));
    const stunned = vars.npcs?.[npcId];
    if (!stunned || Number(stunned.hp ?? 0) <= 0 || stunned.customMotion || stunned.paralizado) return;
    stunned.paralizado = 1;
    stunned.cooldownParalizado = Date.now();
    setTimeout(() => {
        if (vars.npcs?.[npcId] === stunned) stunned.paralizado = 0;
    }, HOOK_STUN_MS);
}

// --- Pulsera ---

export function bracelet(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user || !getMotion().canAct(sessionId, user, BRACELET_ITEM, "la Pulsera", true)) return;
    const now = Date.now();
    if (now < Number(user.nextLiftAt ?? 0)) return;
    user.nextLiftAt = now + LIFT_COOLDOWN_MS;
    if (user.dungeonCarry) return throwCarried(user);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const from = { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
    const lifted = getDungeons().liftAt(Number(user.map), from.x, from.y);
    if (!lifted) return tell(sessionId, "No hay nada para levantar adelante tuyo.");
    user.dungeonCarry = { tipo: lifted.tipo, objIndex: lifted.objIndex, map: Number(user.map) };
    playSound(user, TOOL_SOUNDS.levantar);
    broadcast(user, { id: Number(user.id), tipo: "levanta", heading, ms: 150, from, obj: lifted.objIndex });
}

// Lo tira hacia adonde mira: vuela hasta 4 baldosas, por encima de pozos y lava, y se rompe al caer o al pegarle a
// una criatura.
function throwCarried(user: ToolUser) {
    const carry = user.dungeonCarry;
    if (!carry) return;
    user.dungeonCarry = null;
    const mapId = Number(user.map);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const line = traceLine(mapId, user.pos, dir, THROW_RANGE, false);
    const golpe: Hit = line.npcId ? "criatura" : line.target || line.blocked ? "pared" : null;
    const to = line.npcId ? line.end! : (line.end ?? { x: user.pos.x, y: user.pos.y });
    const distance = Math.max(1, Math.abs(to.x - user.pos.x) + Math.abs(to.y - user.pos.y));
    broadcast(user, { id: Number(user.id), tipo: "tira", heading, ms: THROW_STEP_MS, to, golpe, obj: carry.objIndex });
    setTimeout(() => {
        playSoundAt(mapId, to, TOOL_SOUNDS.romper);
        if (line.npcId) damageNpc(user, line.npcId, toolDamage(user, 15, 2));
    }, distance * THROW_STEP_MS);
}

function playSoundAt(mapId: number, pos: Pos, soundId: number) {
    const handleProtocol = getHandleProtocol();
    getGame().loopAreaPos(mapId, pos, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) handleProtocol.playSound(0, soundId, client);
    });
}

// --- Bombas ---

// Pone una bomba adelante (o a sus pies, si adelante no hay piso libre). Una por jugador a la vez: a los 2 s explota
// en las 3 × 3 baldosas de alrededor, lastima a las criaturas y abre las paredes rajadas. No lastima a los jugadores.
export function bomb(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user || !getMotion().canAct(sessionId, user, BOMB_ITEM, "las Bombas")) return;
    const now = Date.now();
    if (now < Number(user.bombUntil ?? 0)) return tell(sessionId, "Ya pusiste una bomba.");
    user.bombUntil = now + BOMB_FUSE_MS;
    const mapId = Number(user.map);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const front = { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
    const at = isFreeFloor(mapId, front) ? front : { x: user.pos.x, y: user.pos.y };
    playSoundAt(mapId, at, TOOL_SOUNDS.bomba);
    broadcast(user, { id: Number(user.id), tipo: "bomba", heading, ms: BOMB_FUSE_MS, to: at });
    setTimeout(() => explode(user, mapId, at), BOMB_FUSE_MS);
}

function isFreeFloor(mapId: number, tile: Pos) {
    if (!inBounds(tile)) return false;
    const dungeons = getDungeons();
    if (vars.mapa[mapId]?.[tile.y]?.[tile.x]?.blocked || vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id) return false;
    return !dungeons.isHazard(mapId, tile.x, tile.y) && !getGame().hayAgua(mapId, tile);
}

function explode(user: ToolUser, mapId: number, at: Pos) {
    playSoundAt(mapId, at, TOOL_SOUNDS.explosion);
    getDungeons().bombBlast(mapId, at.x, at.y);
    const hit = new Set<string>();
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const npcId = vars.mapData[mapId]?.[at.y + dy]?.[at.x + dx]?.id;
            if (!npcId || !vars.npcs?.[npcId] || hit.has(String(npcId))) continue;
            hit.add(String(npcId));
            damageNpc(user, npcId, toolDamage(user, 30, 4));
        }
    }
}

// --- Arco ---

// Una flecha en línea recta hasta 8 baldosas, sin gastar flechas: se clava en la primera criatura o en lo que tape
// el paso. Se dibuja con el mismo proyectil que las flechas de los arqueros.
export function arrow(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user || !getMotion().canAct(sessionId, user, BOW_ITEM, "el Arco")) return;
    const now = Date.now();
    if (now < Number(user.nextArrowAt ?? 0)) return;
    user.nextArrowAt = now + ARROW_COOLDOWN_MS;
    const mapId = Number(user.map);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const line = traceLine(mapId, user.pos, dir, ARROW_RANGE, false);
    const to = line.npcId || line.target ? line.end! : (line.end ?? { x: user.pos.x + dir.x, y: user.pos.y + dir.y });
    const distance = Math.max(1, Math.abs(to.x - user.pos.x) + Math.abs(to.y - user.pos.y));
    playSound(user, TOOL_SOUNDS.flecha);
    const handleProtocol = getHandleProtocol();
    const start = { map: mapId, x: user.pos.x, y: user.pos.y };
    const end = { map: mapId, x: to.x, y: to.y };
    const sent = new Set<string>();
    const send = (id: EntityId) => {
        const client = vars.clients?.[id] as RuntimeClient | undefined;
        if (!client || sent.has(String(id))) return;
        sent.add(String(id));
        handleProtocol.createProjectile(start, end, ARROW_GRH, client);
    };
    send(user.id);
    getGame().loopAreaPos(mapId, user.pos, (target: { id: EntityId }) => send(target.id));
    if (line.npcId) {
        const npcId = line.npcId;
        setTimeout(() => damageNpc(user, npcId, toolDamage(user, 15, 2.5)), distance * ARROW_STEP_MS);
    }
}

// Suelta lo que lleva (se rompe a sus pies): al salir de la mazmorra, al morir o al cambiar de mapa.
export function dropCarry(user: RuntimeCharacter | undefined) {
    const carrier = user as ToolUser | undefined;
    if (!carrier?.dungeonCarry) return;
    carrier.dungeonCarry = null;
    broadcast(carrier, { id: Number(carrier.id), tipo: "suelta", ms: 0 });
}

// Lo revisa el tic de la mazmorra: si murió o cambió de mapa con algo levantado, lo suelta.
export function checkCarry(user: RuntimeCharacter | undefined) {
    const carrier = user as ToolUser | undefined;
    const carry = carrier?.dungeonCarry;
    if (!carrier || !carry) return;
    if (carrier.dead || Number(carrier.map) !== carry.map) dropCarry(carrier);
}

module.exports = {
    FIRE_ITEM,
    HOOK_ITEM,
    BRACELET_ITEM,
    BOMB_ITEM,
    BOW_ITEM,
    TOOL_SOUNDS,
    traceLine,
    fire,
    hookshot,
    bracelet,
    bomb,
    arrow,
    dropCarry,
    checkCarry,
};
