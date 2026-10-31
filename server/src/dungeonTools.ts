// Ítems de mazmorra que se tiran o se usan con las manos (docs/mazmorras/04-ROCA_DE_LA_TORTUGA.md, secciones 6 y
// 6.2): el Polvo de Fuego (una llamarada que vuela), el Gancho (una cadena que engancha y arrastra, o aturde), el
// Brazalete de Fuerza (levantar, llevar y tirar vasijas y piedras; el II también las pesadas) y el Campo de Protección (el
// Escudo Espejo de Zelda: frena lo que llega de frente y rebota los rayos, las bolas de fuego y las plumas). Además, los básicos que tiene todo el mundo desde la primera mazmorra: las Bombas (explotan
// a los 2 s y abren paredes rajadas), el Arco y el Polvo mágico (enciende la antorcha de adelante). Solo funcionan adentro de una mazmorra. Ninguno toca los atributos ni
// los hechizos del personaje: son mecánicas de mazmorra.
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
export const STRONG_BRACELET_ITEM = "pulsera_poderosa";
export const MIRROR_ITEM = "campo_de_proteccion";
export const BOMB_ITEM = "bombas";
export const BOW_ITEM = "arco";
export const POWDER_ITEM = "polvo_magico";

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
const MIRROR_MS = 3_000;
const MIRROR_COOLDOWN_MS = 1_500;
const ARROW_RANGE = 8;
const ARROW_STEP_MS = 35;
const ARROW_COOLDOWN_MS = 600;
// La flecha común de los arqueros (objeto 480).
const ARROW_GRH = 752;
const POWDER_COOLDOWN_MS = 500;

export const TOOL_SOUNDS = {
    fuego: 222,
    gancho: 223,
    romper: 224,
    levantar: 225,
    explosion: 226,
    bomba: 227,
    flecha: 228,
    escudo: 229,
    bloqueo: 230,
    polvo: 231,
} as const;

// Lo que engancha el Gancho (como en Zelda: cofres, bloques, vasijas, estatuas y antorchas).
const HOOKABLE = new Set(["antorcha", "antorchaEncendida", "hielo", "vasija", "piedra", "pesada", "estatua", "interruptor", "cofre", "bloque", "cristal", "puerta"]);

type Pos = { x: number; y: number };
type ToolUser = RuntimeCharacter & {
    dungeonMotion?: { tipo: string; until: number } | null;
    dungeonCarry?: { tipo: string; objIndex: number; map: number; sala?: number } | null;
    nextFireAt?: number;
    nextHookAt?: number;
    nextLiftAt?: number;
    bombUntil?: number;
    mirrorUntil?: number;
    nextMirrorAt?: number;
    fieldEatenUntil?: number;
    nextArrowAt?: number;
    nextPowderAt?: number;
    heading?: number;
    dead?: boolean;
    level?: number;
};
type Hit = "antorcha" | "hielo" | "criatura" | "engancha" | "pared" | null;
// Una bomba puesta que todavía no explotó (las Serpientes Glotonas del Santuario del Rostro se la pueden tragar).
type LiveBomb = { mapId: number; x: number; y: number; ownerId: string; placedAt: number; eaten: boolean };

const liveBombs = new Set<LiveBomb>();

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

// `source`: con qué le pega (fuego, gancho, tiro, bomba, flecha o polvo); a algunas criaturas solo les entra lo tirado.
function damageNpc(user: ToolUser, npcId: EntityId, amount: number, source: string) {
    const npc = vars.npcs?.[npcId];
    const ws = vars.clients?.[user.id] as RuntimeClient | undefined;
    if (!npc || !ws) return false;
    const denied = getDungeons().getNpcWaterDeniedReason(npc, user, source);
    if (denied) {
        tell(user.id, denied);
        return false;
    }
    // Una flecha, una bomba o algo tirado a la botella con el Genio adentro también la aturde.
    if (require("./dungeonGrotto").onNpcStruck(npc)) return false;
    // Una bomba o algo tirado mata a un hechicero de una (Santuario del Rostro).
    amount = require("./dungeonShrine").damageFor(npc, source, amount);
    // Las Gohma (Fauces del Bagre): con el ojo abierto, una flecha saca un tercio y el Gancho, un sexto.
    amount = require("./dungeonMawBosses").damageFor(npc, source, amount);
    // El Águila Malvada (Torre del Águila): una flecha, el Gancho o algo tirado, con ella baja, es un golpe.
    amount = require("./dungeonTowerBosses").damageFor(npc, source, amount);
    // Las Máscaras de Hierro (Fauces del Bagre) se cubren de frente de todo menos de las bombas.
    const masked = require("./dungeonMaw").invulnerableReason(npc, user, source);
    if (masked) {
        tell(user.id, masked);
        return false;
    }
    if (!getDungeons().canToolHitNpc(npc, source, user)) {
        const reason = getDungeons().getNpcInvulnerableReason(npc, user, source);
        if (reason) tell(user.id, reason);
        return false;
    }
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
        else if (line.target === "interruptor") dungeons.hitSwitch(mapId, to.x, to.y);
        else if (golpe === "criatura" && line.npcId) {
            // Las babosas, las momias, las hélices y los vire (plantillas con "debilFuego") se queman el doble.
            const npc = vars.npcs?.[line.npcId];
            const weak = Boolean(vars.datNpc?.[Number(npc?.templateNpcIndex ?? 0)]?.debilFuego);
            damageNpc(user, line.npcId, toolDamage(user, 20, 3) * (weak ? 2 : 1), "fuego");
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
        // Las anclas que la cadena pasó por encima arman su puente (Fauces del Bagre).
        require("./dungeonMaw").onHookPath(mapId, mover.pos, line.end ? [...line.path, line.end] : line.path);
        // A una Máscara de Hierro de frente, el Gancho le arranca la máscara en vez de aturdirla.
        const hooked = golpe === "criatura" && line.npcId ? vars.npcs?.[line.npcId] : null;
        if (hooked && require("./dungeonMaw").onHooked(hooked, mover)) return;
        // A la Anguila Viscosa (Fauces del Bagre), el Gancho la saca de la pared.
        if (hooked && require("./dungeonMawBosses").onHooked(hooked, mover)) return;
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
    if (!npc || !getDungeons().canToolHitNpc(npc, "gancho", user)) return;
    damageNpc(user, npcId, toolDamage(user, 5, 1), "gancho");
    const stunned = vars.npcs?.[npcId];
    if (!stunned || Number(stunned.hp ?? 0) <= 0 || stunned.customMotion || stunned.paralizado) return;
    stunned.paralizado = 1;
    stunned.cooldownParalizado = Date.now();
    setTimeout(() => {
        if (vars.npcs?.[npcId] === stunned) stunned.paralizado = 0;
    }, HOOK_STUN_MS);
}

// --- Brazalete de Fuerza ---

// Levanta lo que hay adelante (con el II, también lo pesado) o tira lo que lleva.
export function bracelet(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user) return;
    const dungeons = getDungeons();
    const strong = dungeons.characterHasDungeonItem(user, STRONG_BRACELET_ITEM);
    if (!getMotion().canAct(sessionId, user, strong ? STRONG_BRACELET_ITEM : BRACELET_ITEM, "el Brazalete de Fuerza", true)) return;
    const now = Date.now();
    if (now < Number(user.nextLiftAt ?? 0)) return;
    user.nextLiftAt = now + LIFT_COOLDOWN_MS;
    if (user.dungeonCarry) return throwCarried(user);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const from = { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
    const kind = dungeons.liftableKindAt(Number(user.map), from.x, from.y);
    if ((kind === "pesada" || kind === "estatua") && !strong) {
        return tell(sessionId, "Es demasiado pesada: hace falta el Brazalete de Fuerza nivel 2.");
    }
    // La cabeza de caballo cuenta para la sala de la que salió aunque la tiren a otra.
    const headRoom = kind === "cabeza" ? require("./dungeonShrine").headRoomAt(Number(user.map), from.x, from.y) : undefined;
    // El Orbe de la Torre del Águila: se lleva y se tira contra los pilares.
    if (require("./dungeonTower").liftOrb(user, from)) {
        const obj = dungeons.DUNGEON_OBJ.orbe;
        user.dungeonCarry = { tipo: "orbe", objIndex: obj, map: Number(user.map) };
        playSound(user, TOOL_SOUNDS.levantar);
        return broadcast(user, { id: Number(user.id), tipo: "levanta", heading, ms: 150, from, obj });
    }
    // La bola de hierro del Machacador del Santuario del Rostro.
    if (require("./dungeonShrineBosses").liftBall(user, from)) {
        const obj = dungeons.DUNGEON_OBJ.bolaDeHierro;
        user.dungeonCarry = { tipo: "bola", objIndex: obj, map: Number(user.map) };
        playSound(user, TOOL_SOUNDS.levantar);
        return broadcast(user, { id: Number(user.id), tipo: "levanta", heading, ms: 150, from, obj });
    }
    // La botella aturdida del Genio de la Gruta de la Botella.
    if (require("./dungeonGrotto").liftBottle(user, from)) {
        const obj = dungeons.DUNGEON_OBJ.botellaGenio;
        user.dungeonCarry = { tipo: "botella", objIndex: obj, map: Number(user.map) };
        playSound(user, TOOL_SOUNDS.levantar);
        return broadcast(user, { id: Number(user.id), tipo: "levanta", heading, ms: 150, from, obj });
    }
    const lifted = dungeons.liftAt(Number(user.map), from.x, from.y);
    if (!lifted) return tell(sessionId, "No hay nada para levantar adelante tuyo.");
    user.dungeonCarry = { tipo: lifted.tipo, objIndex: lifted.objIndex, map: Number(user.map), ...(headRoom !== undefined ? { sala: headRoom } : {}) };
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
    if (carry.tipo === "botella") return require("./dungeonGrotto").throwBottle(user, heading, dir);
    if (carry.tipo === "bola") return require("./dungeonShrineBosses").throwBall(user, heading, dir);
    if (carry.tipo === "orbe") return require("./dungeonTower").throwOrb(user, heading, dir);
    const line = traceLine(mapId, user.pos, dir, THROW_RANGE, false);
    const golpe: Hit = line.npcId ? "criatura" : line.target || line.blocked ? "pared" : null;
    const to = line.npcId ? line.end! : (line.end ?? { x: user.pos.x, y: user.pos.y });
    const distance = Math.max(1, Math.abs(to.x - user.pos.x) + Math.abs(to.y - user.pos.y));
    // La cabeza de caballo del Santuario del Rostro no se rompe: cae en la última baldosa libre del vuelo.
    const head = carry.tipo === "cabeza";
    broadcast(user, { id: Number(user.id), tipo: "tira", heading, ms: THROW_STEP_MS, to, golpe, obj: carry.objIndex, ...(head ? { entera: true } : {}) });
    setTimeout(() => {
        playSoundAt(mapId, to, TOOL_SOUNDS.romper);
        const heavy = carry.tipo === "pesada" || carry.tipo === "estatua";
        if (line.npcId) damageNpc(user, line.npcId, heavy ? toolDamage(user, 30, 3) : toolDamage(user, 15, 2), "tiro");
        // Lo tirado contra una persiana la abre; contra el cofre trabado, lo abre (Santuario del Rostro).
        if (line.target && line.end) getDungeons().onThrowHit(user, mapId, line.end, line.target);
        if (head) {
            const landing = line.npcId || line.target ? (line.path.at(-1) ?? { x: user.pos.x, y: user.pos.y }) : to;
            require("./dungeonShrine").landHead(user, mapId, landing, carry.sala);
        }
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
    const live: LiveBomb = { mapId, x: at.x, y: at.y, ownerId: String(sessionId), placedAt: now, eaten: false };
    liveBombs.add(live);
    setTimeout(() => {
        liveBombs.delete(live);
        if (!live.eaten) explode(user, mapId, at);
    }, BOMB_FUSE_MS);
}

// Las bombas sin explotar de un mapa.
export function bombsOn(mapId: number): LiveBomb[] {
    return [...liveBombs].filter((bomb) => bomb.mapId === mapId && !bomb.eaten);
}

// Una Serpiente Glotona se la tragó: no explota, desaparece del piso y su dueño ya puede poner otra.
export function eatBomb(bomb: LiveBomb) {
    bomb.eaten = true;
    liveBombs.delete(bomb);
    const owner = vars.personajes?.[bomb.ownerId] as ToolUser | undefined;
    if (owner) owner.bombUntil = 0;
    const handleProtocol = getHandleProtocol();
    getGame().loopAreaPos(bomb.mapId, bomb, (target: { id: EntityId }) => {
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (client) handleProtocol.dungeonMotion({ id: Number(bomb.ownerId), tipo: "bomba", ms: 0, to: { x: bomb.x, y: bomb.y }, comida: true }, client);
    });
}

function isFreeFloor(mapId: number, tile: Pos) {
    if (!inBounds(tile)) return false;
    const dungeons = getDungeons();
    if (vars.mapa[mapId]?.[tile.y]?.[tile.x]?.blocked || vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id) return false;
    return !dungeons.isHazard(mapId, tile.x, tile.y) && !getGame().hayAgua(mapId, tile);
}

function explode(user: ToolUser, mapId: number, at: Pos) {
    playSoundAt(mapId, at, TOOL_SOUNDS.explosion);
    const dungeons = getDungeons();
    dungeons.bombBlast(mapId, at.x, at.y);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) dungeons.hitSwitch(mapId, at.x + dx, at.y + dy);
    // La cara del Rostro de Piedra (Santuario del Rostro) y el Maestro Stalfos (Fauces del Bagre) los resuelven sus
    // módulos: solo les entran las bombas.
    const hit = require("./dungeonShrineBosses").onExplosion(user, mapId, at) as Set<string>;
    for (const id of require("./dungeonMawBosses").onExplosion(user, mapId, at) as Set<string>) hit.add(id);
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const npcId = vars.mapData[mapId]?.[at.y + dy]?.[at.x + dx]?.id;
            if (!npcId || !vars.npcs?.[npcId] || hit.has(String(npcId))) continue;
            hit.add(String(npcId));
            damageNpc(user, npcId, toolDamage(user, 30, 4), "bomba");
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
        setTimeout(() => damageNpc(user, npcId, toolDamage(user, 15, 2.5), "flecha"), distance * ARROW_STEP_MS);
    } else if (line.target === "interruptor") {
        setTimeout(() => getDungeons().hitSwitch(mapId, to.x, to.y), distance * ARROW_STEP_MS);
    }
}

// --- Polvo mágico ---

// Espolvorea la baldosa de adelante: enciende una antorcha apagada o le saca un poco a la criatura que esté ahí.
export function powder(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user || !getMotion().canAct(sessionId, user, POWDER_ITEM, "el Polvo mágico")) return;
    const now = Date.now();
    if (now < Number(user.nextPowderAt ?? 0)) return;
    user.nextPowderAt = now + POWDER_COOLDOWN_MS;
    const mapId = Number(user.map);
    const heading = Number(user.heading ?? vars.direcciones.down);
    const dir = getMotion().headingOffset(heading);
    const to = { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
    playSound(user, TOOL_SOUNDS.polvo);
    broadcast(user, { id: Number(user.id), tipo: "polvo", heading, ms: 0, to });
    const dungeons = getDungeons();
    if (dungeons.toolTargetAt(mapId, to.x, to.y) === "antorcha") {
        dungeons.lightTorch(mapId, to.x, to.y);
        return;
    }
    const npcId = vars.mapData[mapId]?.[to.y]?.[to.x]?.id;
    if (npcId && vars.npcs?.[npcId]) {
        const weak = Boolean(vars.datNpc?.[Number(vars.npcs[npcId].templateNpcIndex ?? 0)]?.debilFuego);
        damageNpc(user, npcId, toolDamage(user, 10, 1.5) * (weak ? 2 : 1), "polvo");
    }
}

// --- Campo de Protección ---

// Levanta el Campo 3 s: lo que llega de frente (golpes de criaturas y, en las trampas que lo consultan, rayos y bolas
// de fuego) no entra, y lo que lo consulta con `mirrorReflects` rebota hacia donde vino. Solo adentro de las mazmorras.
export function mirror(sessionId: EntityId) {
    const user = vars.personajes?.[sessionId] as ToolUser | undefined;
    if (!user || !getMotion().canAct(sessionId, user, MIRROR_ITEM, "el Campo de Protección")) return;
    const now = Date.now();
    if (now < Number(user.nextMirrorAt ?? 0)) return;
    if (now < Number(user.fieldEatenUntil ?? 0)) return tell(sessionId, `Un Tragón se comió tu Campo: vuelve en ${Math.ceil((Number(user.fieldEatenUntil) - now) / 1000)} s.`);
    user.mirrorUntil = now + MIRROR_MS;
    user.nextMirrorAt = now + MIRROR_MS + MIRROR_COOLDOWN_MS;
    const heading = Number(user.heading ?? vars.direcciones.down);
    playSound(user, TOOL_SOUNDS.escudo);
    broadcast(user, { id: Number(user.id), tipo: "escudo", heading, ms: MIRROR_MS });
}

function isMirrorUp(user: ToolUser | undefined) {
    return Boolean(user && Number(user.mirrorUntil ?? 0) > Date.now() && getDungeons().isDungeonInstanceMap(user.map));
}

// Si algo que viaja en la dirección `dir` (de la trampa al jugador) le llega de frente a quien mira hacia `heading`.
export function comesFromFront(heading: number, dir: Pos): boolean {
    const facing = getMotion().headingOffset(heading);
    return facing.x === -Math.sign(dir.x) && facing.y === -Math.sign(dir.y);
}

// Si el escudo levantado frena algo que viaja en la dirección `dir`.
export function mirrorBlocks(user: RuntimeCharacter | undefined, dir: Pos): boolean {
    const shielder = user as ToolUser | undefined;
    return isMirrorUp(shielder) && comesFromFront(Number(shielder!.heading ?? vars.direcciones.down), dir);
}

// Lo que rebota (el rayo de un ojo de piedra, la bola de un hechicero, una pluma del Águila): si el Campo lo frena de
// frente, además destella y avisa. El que lo consulta decide qué pasa con lo rebotado.
export function mirrorReflects(user: RuntimeCharacter | undefined, dir: Pos, what = "lo"): boolean {
    if (!mirrorBlocks(user, dir)) return false;
    const shielder = user as ToolUser;
    playSound(shielder, TOOL_SOUNDS.bloqueo);
    broadcast(shielder, { id: Number(shielder.id), tipo: "rebote", heading: Number(shielder.heading ?? vars.direcciones.down), ms: 260 });
    tell(shielder.id, `¡El Campo de Protección ${what} rebotó!`);
    return true;
}

// Mientras un Tragón tiene el Campo comido, no se levanta (Torre del Águila).
export function eatField(user: RuntimeCharacter | undefined, ms: number): boolean {
    const victim = user as ToolUser | undefined;
    if (!victim || !isMirrorUp(victim)) return false;
    victim.mirrorUntil = 0;
    victim.fieldEatenUntil = Date.now() + ms;
    broadcast(victim, { id: Number(victim.id), tipo: "escudo", heading: Number(victim.heading ?? vars.direcciones.down), ms: 1 });
    return true;
}

// El golpe de una criatura que está adelante no entra (lo consulta npcs.ts antes de pegar).
export function mirrorBlocksNpcHit(user: RuntimeCharacter | undefined, npc: { pos?: Pos } | undefined): boolean {
    const shielder = user as ToolUser | undefined;
    if (!shielder || !npc?.pos || !isMirrorUp(shielder)) return false;
    const dx = npc.pos.x - shielder.pos.x;
    const dy = npc.pos.y - shielder.pos.y;
    const dir = Math.abs(dx) >= Math.abs(dy) ? { x: -Math.sign(dx), y: 0 } : { x: 0, y: -Math.sign(dy) };
    if (!mirrorBlocks(shielder, dir)) return false;
    playSound(shielder, TOOL_SOUNDS.bloqueo);
    tell(shielder.id, "¡El Campo de Protección frenó el golpe!");
    return true;
}

// Suelta lo que lleva (se rompe a sus pies): al salir de la mazmorra, al morir o al cambiar de mapa.
export function dropCarry(user: RuntimeCharacter | undefined) {
    const carrier = user as ToolUser | undefined;
    if (!carrier?.dungeonCarry) return;
    const kind = carrier.dungeonCarry.tipo;
    carrier.dungeonCarry = null;
    broadcast(carrier, { id: Number(carrier.id), tipo: "suelta", ms: 0 });
    if (kind === "botella") require("./dungeonGrotto").dropBottle(carrier);
    if (kind === "bola") require("./dungeonShrineBosses").dropBall(carrier);
    if (kind === "orbe") require("./dungeonTower").dropOrb(carrier);
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
    STRONG_BRACELET_ITEM,
    MIRROR_ITEM,
    BOMB_ITEM,
    BOW_ITEM,
    POWDER_ITEM,
    TOOL_SOUNDS,
    traceLine,
    damageNpc,
    fire,
    hookshot,
    bracelet,
    mirror,
    comesFromFront,
    mirrorBlocks,
    mirrorReflects,
    eatField,
    mirrorBlocksNpcHit,
    bomb,
    bombsOn,
    eatBomb,
    arrow,
    powder,
    dropCarry,
    checkCarry,
};
