// Los jefes de la Torre del Águila (docs/mazmorras/08-TORRE_DEL_AGUILA.md), movidos por el server (customMotion) como
// los de las otras mazmorras. En la plantilla se marcan con `flautista` y `aguila`.
// - El Flautista (el Grim Creeper): no se lo puede lastimar. Al entrar toca la flauta y llama a sus murciélagos
//   (`murcielagos`: la plantilla; `bandada`: cuántos). Si los matan a todos, dice su frase y huye; si tardan, toca otra
//   vez y vuelven los que faltan. Después aparece montado en el Águila.
// - El Águila Malvada (el Evil Eagle), en lo alto de la torre: ronda alto fuera de alcance y ataca de tres maneras.
//   La pasada: cruza la terraza a baja altura por la fila de alguien (ahí se la golpea; empuja al que atropella). El
//   viento: se queda en un costado y aletea: empuja a todos hacia el borde del otro lado (el que se cae va a parar al
//   piso de abajo), mientras tira plumas por las filas; con el Campo de Protección de frente, el viento no empuja y la
//   pluma rebota: vuelve, la lastima y la tira a la terraza unos segundos, donde se la golpea de cualquier lado. La
//   picada: se para sobre alguien y cae encima.
//   Hacen falta `golpes` golpes (más con grupo); le entran los golpes cuerpo a cuerpo, las flechas y el Gancho solo
//   mientras vuela bajo o está en la terraza.
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";
export {};
const vars = require("./vars");

// El Flautista.
const PIPER_INTRO_MS = 1_800;
const PIPER_BATS = 6;
const PIPER_SPAWN_GAP_MS = 320;
const PIPER_RECALL_MS = 28_000;
const PIPER_FLEE_MS = 1_100;
// El Águila.
const EAGLE_INTRO_MS = 2_200;
const EAGLE_HITS = 12;
const EAGLE_HITS_PER_EXTRA_PLAYER = 3;
const EAGLE_HIT_COOLDOWN_MS = 350;
const EAGLE_ROUND_STEP_MS = 420;
const EAGLE_ROUND_MIN_MS = 1_400;
const EAGLE_ROUND_MAX_MS = 2_600;
const EAGLE_SWOOP_STEP_MS = 95;
const EAGLE_SWOOP_DAMAGE = 0.12;
const EAGLE_WIND_MS = 4_200;
const EAGLE_WIND_GUST_MS = 260;
const EAGLE_FEATHER_EVERY_MS = 850;
const EAGLE_FEATHER_TILE_MS = 55;
const EAGLE_FEATHER_DAMAGE = 0.08;
const EAGLE_DIVE_AIM_MS = 800;
const EAGLE_DIVE_MS = 260;
const EAGLE_DIVE_DAMAGE = 0.15;
const EAGLE_GROUNDED_MS = 4_000;
const EAGLE_DEATH_MS = 1_600;
const EAGLE_BODY_PERCHED = 585;
const TOUCH_COOLDOWN_MS = 900;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean; heading?: number };
type Piper = {
    npcId: string;
    mapId: number;
    room: number;
    home: Pos;
    mode: "espera" | "presenta" | "toca" | "huye";
    modeUntil: number;
    batTemplate: number;
    flock: number;
    bats: Set<string>;
    spawned: number;
    nextSpawnAt: number;
    nextRecallAt: number;
};
type Eagle = {
    npcId: string;
    mapId: number;
    room: number;
    bounds: { x1: number; y1: number; x2: number; y2: number };
    mode: "espera" | "presenta" | "ronda" | "pasada" | "viento" | "picada" | "posada" | "muere";
    modeUntil: number;
    nextAt: number;
    hitsNeeded: number;
    nextHitAt: number;
    low: boolean;
    flyingBody: number;
    // La pasada: de dónde a dónde, por qué fila.
    path: Pos[];
    step: number;
    // El viento: de qué lado está y hacia dónde sopla.
    side: 1 | -1;
    nextGustAt: number;
    nextFeatherAt: number;
    // La picada: sobre quién.
    target: Pos | null;
    attacksSinceWind: number;
    touchedAt: Map<string, number>;
};

const pipers = new Map<string, Piper>();
const eagles = new Map<string, Eagle>();
// Las corridas (por mapa del Flautista) de las que ya huyó: el Águila lo presenta distinto.
const fled = new Set<number>();

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

const chebyshev = (a: Pos, b: Pos) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

type Template = { flautista?: boolean; aguila?: boolean; murcielagos?: number; bandada?: number; golpes?: number };
function templateOf(npc: { templateNpcIndex?: number } | undefined): Template {
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

function headingFrom(from: Pos, toward: Pos): number {
    const d = vars.direcciones;
    const dx = toward.x - from.x;
    const dy = toward.y - from.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? d.right : d.left) : dy > 0 ? d.down : d.up;
}

// Mueve una criatura sin las reglas de la IA. El Águila vuela: pasa por encima de todo, pero ocupa la baldosa si está
// libre (la foto del área se arma con las baldosas ocupadas: si nunca ocupara ninguna, el cliente no la conocería).
function moveNpc(npc: any, mapId: number, to: Pos, occupy = true) {
    const cell = vars.mapData[mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    require("./targetAssist").recordTileLeft(npc, mapId, npc.pos.x, npc.pos.y);
    if (to.x !== npc.pos.x || to.y !== npc.pos.y) npc.heading = headingFrom(npc.pos, to);
    npc.pos.x = to.x;
    npc.pos.y = to.y;
    const target = vars.mapData[mapId]?.[to.y]?.[to.x];
    if (target && (occupy || !target.id)) target.id = npc.id;
    require("./npcs").npcToArea(npc.id, npc.heading);
}

// Se la presenta entera a los que están cerca (como a las criaturas escondidas del Santuario): al empezar la pelea y al
// volver a ocupar baldosa, por si alguno entró mientras volaba sobre alguien.
function present(npc: any) {
    require("./npcs").loopArea(npc.id, (target: { id: EntityId; dead?: boolean }) => {
        const area = (vars.areaNpc[npc.id] ??= []) as EntityId[];
        if (!target.dead && !area.includes(target.id)) area.push(target.id);
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (!client) return;
        getHandleProtocol().sendNpc(npc);
        require("./socket").send(client);
    });
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

function say(npc: any, mapId: number, text: string) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, npc.pos, (client) => handleProtocol.dialog(npc.id, text, "", "#E8E0C8", 0, client));
}

function hurt(user: Player, fraction: number, message: string) {
    getDungeons().hurtPlayer(user, fraction, message);
}

// Le saca vida sin pasar por la invulnerabilidad; si muere, cuenta para el que lo hizo.
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
    if (!template.flautista && !template.aguila) return false;
    const dungeons = getDungeons();
    const mapId = Number(npc.map);
    const room = dungeons.roomAt(mapId, npc.pos.x, npc.pos.y);
    if (room === undefined) return false;
    const id = String(npc.id);
    const now = Date.now();
    if (template.flautista) {
        pipers.set(id, {
            npcId: id,
            mapId,
            room,
            home: { x: npc.pos.x, y: npc.pos.y },
            mode: "espera",
            modeUntil: 0,
            batTemplate: Number(template.murcielagos ?? 0),
            flock: Number(template.bandada ?? PIPER_BATS),
            bats: new Set(),
            spawned: 0,
            nextSpawnAt: 0,
            nextRecallAt: 0,
        });
        npc.customMotion = true;
        return true;
    }
    const roomBounds = dungeons.roomBounds(mapId, room);
    if (!roomBounds) return false;
    // La terraza: las baldosas pisables de la sala (lo demás es vacío). Ahí cae posada y por ahí pasa bajo.
    const bounds = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
    for (let y = roomBounds.y1; y <= roomBounds.y2; y++) {
        for (let x = roomBounds.x1; x <= roomBounds.x2; x++) {
            if (dungeons.roomAt(mapId, x, y) !== room || dungeons.isHazard(mapId, x, y) || vars.mapa[mapId]?.[y]?.[x]?.blocked) continue;
            bounds.x1 = Math.min(bounds.x1, x);
            bounds.y1 = Math.min(bounds.y1, y);
            bounds.x2 = Math.max(bounds.x2, x);
            bounds.y2 = Math.max(bounds.y2, y);
        }
    }
    if (!Number.isFinite(bounds.x1)) return false;
    eagles.set(id, {
        npcId: id,
        mapId,
        room,
        bounds,
        mode: "espera",
        modeUntil: 0,
        nextAt: now,
        hitsNeeded: Number(template.golpes ?? EAGLE_HITS),
        nextHitAt: 0,
        low: false,
        flyingBody: Number(npc.idBody ?? 0),
        path: [],
        step: 0,
        side: 1,
        nextGustAt: 0,
        nextFeatherAt: 0,
        target: null,
        attacksSinceWind: 0,
        touchedAt: new Map(),
    });
    npc.customMotion = true;
    eaglePacket(eagles.get(id)!, npc, "ronda", { alto: true });
    return true;
}

export function onNpcDied(npc: { id?: EntityId; map?: number } | undefined) {
    const id = String(npc?.id ?? "");
    const eagle = eagles.get(id);
    if (eagle) {
        eagles.delete(id);
        eaglePacket(eagle, npc, "muere", { ms: EAGLE_DEATH_MS });
        tellRoom(eagle.mapId, eagle.room, "Flautista: «¡Nooo! ¡Mi águila! ¡Esto no termina acáaa...!»", "#E8E0C8");
        // Se abre la Sala del Órgano y aparece el cofre del jefe.
        const dungeons = getDungeons();
        const trophyRoom = dungeons.towerDataOf(eagle.mapId)?.torre.salaTrofeo;
        if (trophyRoom !== undefined && trophyRoom !== null) {
            setTimeout(() => {
                dungeons.solveRoomPuzzle(eagle.mapId, trophyRoom, "¡Se abrió la Sala del Órgano!");
                dungeons.revealBossChests(eagle.mapId, trophyRoom);
            }, EAGLE_DEATH_MS);
        }
        return;
    }
    // Un murciélago del Flautista.
    for (const piper of pipers.values()) {
        if (!piper.bats.delete(id)) continue;
        if (piper.bats.size === 0 && piper.spawned >= piper.flock && piper.mode === "toca") flee(piper);
    }
}

export function forgetMap(mapId: number) {
    for (const [id, piper] of pipers) if (piper.mapId === mapId) pipers.delete(id);
    for (const [id, eagle] of eagles) if (eagle.mapId === mapId) eagles.delete(id);
    fled.delete(mapId);
}

// --- El Flautista ---

function piperPacket(piper: Piper, npc: any, estado: string, extra: Record<string, unknown> = {}) {
    bossPacket(piper.mapId, npc.pos, { id: Number(piper.npcId), tipo: "flautista", x: npc.pos.x, y: npc.pos.y, estado, ...extra });
}

function flee(piper: Piper) {
    const npc = vars.npcs?.[piper.npcId];
    if (!npc) return;
    piper.mode = "huye";
    say(npc, piper.mapId, "¡Mis murciélagos! ¡Me las vas a pagar, ya vas a ver!");
    tellRoom(piper.mapId, piper.room, "¡El Flautista huyó!", "#E8E0C8");
    piperPacket(piper, npc, "huye", { ms: PIPER_FLEE_MS });
    fled.add(piper.mapId);
    setTimeout(() => {
        const alive = vars.npcs?.[piper.npcId];
        pipers.delete(piper.npcId);
        if (alive) getDungeons().despawnRunNpc(alive);
        getDungeons().releaseRoomIfEmpty(piper.mapId, piper.room);
    }, PIPER_FLEE_MS);
}

function tickPiper(piper: Piper, npc: any, players: Player[], now: number) {
    if (piper.mode === "espera") {
        if (!players.length) return;
        piper.mode = "presenta";
        piper.modeUntil = now + PIPER_INTRO_MS;
        say(npc, piper.mapId, "¡Je, je, je! ¿Y vos quién sos? ¡Escuchá esta canción... y a mis murciélagos!");
        piperPacket(piper, npc, "toca", { ms: PIPER_INTRO_MS });
        face(npc, (nearest(players, npc.pos) ?? players[0]).pos);
        return;
    }
    if (piper.mode === "presenta") {
        if (now < piper.modeUntil) return;
        piper.mode = "toca";
        piper.nextSpawnAt = now;
        piper.nextRecallAt = now + PIPER_RECALL_MS;
        return;
    }
    if (piper.mode !== "toca") return;
    // Van saliendo de a uno hasta completar la bandada.
    if (piper.spawned < piper.flock && now >= piper.nextSpawnAt && piper.batTemplate) {
        piper.nextSpawnAt = now + PIPER_SPAWN_GAP_MS;
        const bat = getDungeons().spawnRunNpc(piper.mapId, piper.batTemplate, piper.home, piper.room);
        if (bat) {
            piper.bats.add(String(bat.id));
            piper.spawned++;
            if (piper.spawned === piper.flock) tellRoom(piper.mapId, piper.room, "¡Vencé a todos los murciélagos del Flautista!");
        }
        return;
    }
    // Tardan: toca otra vez y vuelven los que faltan.
    if (piper.spawned >= piper.flock && piper.bats.size > 0 && now >= piper.nextRecallAt) {
        piper.nextRecallAt = now + PIPER_RECALL_MS;
        const missing = piper.flock - piper.bats.size;
        if (missing > 0) {
            piper.spawned -= missing;
            piperPacket(piper, npc, "toca", { ms: 1_200 });
            say(npc, piper.mapId, "¡Vengan, vengan, mis murciélagos!");
        }
    }
}

// --- El Águila Malvada ---

function eaglePacket(eagle: Eagle, npc: any, estado: string, extra: Record<string, unknown> = {}) {
    bossPacket(eagle.mapId, npc?.pos ?? { x: eagle.bounds.x1, y: eagle.bounds.y1 }, { id: Number(eagle.npcId), tipo: "aguila", x: npc?.pos?.x, y: npc?.pos?.y, estado, ...extra });
}

function setLow(eagle: Eagle, low: boolean) {
    eagle.low = low;
}

function roomCenter(eagle: Eagle): Pos {
    return { x: Math.floor((eagle.bounds.x1 + eagle.bounds.x2) / 2), y: Math.floor((eagle.bounds.y1 + eagle.bounds.y2) / 2) };
}

function touchPlayers(eagle: Eagle, npc: any, players: Player[], dir: Pos, fraction: number, message: string, now: number) {
    for (const user of players) {
        if (chebyshev(user.pos, npc.pos) > 0 && !(user.pos.y === npc.pos.y && Math.abs(user.pos.x - npc.pos.x) <= 1 && dir.x)) continue;
        if (now < (eagle.touchedAt.get(String(user.id)) ?? 0) || getMotion().isAirborne(user)) continue;
        eagle.touchedAt.set(String(user.id), now + TOUCH_COOLDOWN_MS);
        if (getTools().mirrorBlocksNpcHit(user, npc)) continue;
        hurt(user, fraction, message);
        if (!user.dead) getMotion().push(user, dir, 1);
    }
}

// Empieza a rondar alto, fuera de alcance, un rato antes del próximo ataque.
function startRound(eagle: Eagle, npc: any, now: number) {
    present(npc);
    eagle.mode = "ronda";
    setLow(eagle, false);
    eagle.modeUntil = now + randomBetween(EAGLE_ROUND_MIN_MS, EAGLE_ROUND_MAX_MS);
    eagle.nextAt = now;
    eaglePacket(eagle, npc, "ronda", { alto: true });
}

// La pasada: entra por un costado a la altura de alguien y cruza la terraza bajo.
function startSwoop(eagle: Eagle, npc: any, target: Player, now: number) {
    const fromLeft = Math.random() < 0.5;
    const y = target.pos.y;
    const x1 = eagle.bounds.x1 - 3;
    const x2 = eagle.bounds.x2 + 3;
    eagle.path = [];
    if (fromLeft) for (let x = x1; x <= x2; x++) eagle.path.push({ x, y });
    else for (let x = x2; x >= x1; x--) eagle.path.push({ x, y });
    eagle.step = 0;
    eagle.mode = "pasada";
    moveNpc(npc, eagle.mapId, eagle.path[0], false);
    setLow(eagle, true);
    eagle.nextAt = now + EAGLE_SWOOP_STEP_MS;
    eaglePacket(eagle, npc, "pasada", { desde: eagle.path[0], hasta: eagle.path[eagle.path.length - 1], ms: eagle.path.length * EAGLE_SWOOP_STEP_MS });
    sound(eagle.mapId, npc.pos, getTools().TOOL_SOUNDS.gancho);
}

function tickSwoop(eagle: Eagle, npc: any, players: Player[], now: number) {
    if (now < eagle.nextAt) return;
    eagle.nextAt = now + EAGLE_SWOOP_STEP_MS;
    eagle.step++;
    if (eagle.step >= eagle.path.length) return startRound(eagle, npc, now);
    const tile = eagle.path[eagle.step];
    const dir = { x: Math.sign(tile.x - npc.pos.x), y: 0 };
    moveNpc(npc, eagle.mapId, tile, false);
    touchPlayers(eagle, npc, players, dir, EAGLE_SWOOP_DAMAGE, "¡El Águila Malvada te atropelló!", now);
}

// El viento: se queda en un costado, fuera de la terraza, y aletea hacia el otro lado.
function startWind(eagle: Eagle, npc: any, now: number) {
    eagle.side = Math.random() < 0.5 ? 1 : -1;
    const center = roomCenter(eagle);
    const at = { x: eagle.side > 0 ? eagle.bounds.x1 - 3 : eagle.bounds.x2 + 3, y: center.y };
    eagle.mode = "viento";
    setLow(eagle, false);
    eagle.modeUntil = now + EAGLE_WIND_MS;
    eagle.nextGustAt = now + 400;
    eagle.nextFeatherAt = now + 600;
    eagle.attacksSinceWind = 0;
    moveNpc(npc, eagle.mapId, at, false);
    npc.heading = eagle.side > 0 ? vars.direcciones.right : vars.direcciones.left;
    require("./npcs").npcToArea(npc.id, npc.heading);
    eaglePacket(eagle, npc, "viento", { ms: EAGLE_WIND_MS, dir: eagle.side, alto: true });
    tellRoom(eagle.mapId, eagle.room, "¡El Águila aletea! Plantate con el Campo de Protección mirándola, o te lleva al borde.", "#FF6B3D");
}

function tickWind(eagle: Eagle, npc: any, players: Player[], now: number) {
    if (now >= eagle.modeUntil) return startRound(eagle, npc, now);
    const wind = { x: eagle.side, y: 0 };
    const tools = getTools();
    if (now >= eagle.nextGustAt) {
        eagle.nextGustAt = now + EAGLE_WIND_GUST_MS;
        for (const user of players) {
            if (getMotion().isAirborne(user) || tools.mirrorBlocks(user, wind)) continue;
            getMotion().push(user, wind, 1);
        }
    }
    if (now >= eagle.nextFeatherAt && players.length) {
        eagle.nextFeatherAt = now + EAGLE_FEATHER_EVERY_MS;
        const target = players[Math.floor(Math.random() * players.length)];
        shootFeather(eagle, npc, target, wind);
    }
}

// Una pluma recta por la fila del jugador; si le llega al que tiene el Campo de frente, rebota y vuelve al Águila.
function shootFeather(eagle: Eagle, npc: any, target: Player, wind: Pos) {
    const from = { x: npc.pos.x, y: target.pos.y };
    const to = { x: target.pos.x, y: target.pos.y };
    const distance = Math.max(1, Math.abs(to.x - from.x));
    const ms = distance * EAGLE_FEATHER_TILE_MS;
    eaglePacket(eagle, npc, "pluma", { desde: from, hasta: to, ms });
    setTimeout(() => {
        if (!eagles.has(eagle.npcId)) return;
        const tools = getTools();
        for (const user of playersInRoom(eagle.mapId, eagle.room)) {
            if (Math.hypot(user.pos.x - to.x, user.pos.y - to.y) > 0.75 || getMotion().isAirborne(user)) continue;
            if (tools.mirrorReflects(user, wind, "la pluma")) {
                reflectFeather(eagle, user, { x: user.pos.x, y: user.pos.y });
                return;
            }
            if (tools.mirrorBlocks(user, wind)) return;
            hurt(user, EAGLE_FEATHER_DAMAGE, "Te clavó una pluma el Águila Malvada:");
            return;
        }
    }, ms);
}

// La pluma rebotada vuelve al Águila: la lastima y la tira a la terraza, donde queda unos segundos al alcance.
function reflectFeather(eagle: Eagle, user: Player, from: Pos) {
    const npc = vars.npcs?.[eagle.npcId];
    if (!npc || eagle.mode !== "viento") return;
    const to = { x: npc.pos.x, y: npc.pos.y };
    const ms = Math.max(1, Math.abs(to.x - from.x)) * EAGLE_FEATHER_TILE_MS;
    eaglePacket(eagle, npc, "pluma", { desde: from, hasta: to, ms, rebote: true });
    setTimeout(() => {
        const alive = vars.npcs?.[eagle.npcId];
        if (!alive || !eagles.has(eagle.npcId) || eagle.mode !== "viento") return;
        tellRoom(eagle.mapId, eagle.room, "¡La pluma rebotada le dio al Águila! Cayó a la terraza: ¡ahora!", "#FFD24A");
        strike(alive, hitFor(alive, eagle.hitsNeeded), String(user.id), eagle.room);
        if (!eagles.has(eagle.npcId)) return;
        ground(eagle, alive, Date.now());
    }, ms);
}

// Cae a la terraza (la baldosa libre más cercana del lado donde estaba) y queda posada, al alcance de todos.
function ground(eagle: Eagle, npc: any, now: number) {
    const center = roomCenter(eagle);
    const x = eagle.side > 0 ? eagle.bounds.x1 + 1 : eagle.bounds.x2 - 1;
    const at = { x, y: center.y };
    eagle.mode = "posada";
    eagle.modeUntil = now + EAGLE_GROUNDED_MS;
    moveNpc(npc, eagle.mapId, at, false);
    setLow(eagle, true);
    npc.idBody = EAGLE_BODY_PERCHED;
    const handleProtocol = getHandleProtocol();
    eachClientNear(eagle.mapId, npc.pos, (client) => handleProtocol.changeNpcBody(npc, client));
    eaglePacket(eagle, npc, "posada", { ms: EAGLE_GROUNDED_MS });
    sound(eagle.mapId, at, getDungeons().DUNGEON_SOUNDS.golpe);
}

function takeOff(eagle: Eagle, npc: any, now: number) {
    npc.idBody = eagle.flyingBody;
    const handleProtocol = getHandleProtocol();
    eachClientNear(eagle.mapId, npc.pos, (client) => handleProtocol.changeNpcBody(npc, client));
    startRound(eagle, npc, now);
}

// La picada: se para alto sobre alguien y le cae encima.
function startDive(eagle: Eagle, npc: any, target: Player, now: number) {
    eagle.mode = "picada";
    setLow(eagle, false);
    eagle.target = { x: target.pos.x, y: target.pos.y };
    eagle.modeUntil = now + EAGLE_DIVE_AIM_MS;
    moveNpc(npc, eagle.mapId, eagle.target, false);
    eaglePacket(eagle, npc, "picada", { ms: EAGLE_DIVE_AIM_MS, alto: true });
}

function tickDive(eagle: Eagle, npc: any, players: Player[], now: number) {
    if (now < eagle.modeUntil) return;
    const at = eagle.target ?? npc.pos;
    eaglePacket(eagle, npc, "cae", { ms: EAGLE_DIVE_MS });
    setLow(eagle, true);
    for (const user of players) {
        if (chebyshev(user.pos, at) > 0 || getMotion().isAirborne(user)) continue;
        if (getTools().mirrorBlocksNpcHit(user, npc)) continue;
        hurt(user, EAGLE_DIVE_DAMAGE, "¡El Águila Malvada te cayó encima!");
        if (!user.dead) getMotion().push(user, { x: Math.random() < 0.5 ? 1 : -1, y: 0 }, 1);
    }
    eagle.mode = "ronda";
    eagle.modeUntil = now + EAGLE_DIVE_MS + 700;
    eagle.nextAt = now + EAGLE_DIVE_MS + 700;
    setTimeout(() => {
        if (eagles.get(eagle.npcId) === eagle && eagle.mode === "ronda") setLow(eagle, false);
    }, EAGLE_DIVE_MS + 500);
}

function tickRound(eagle: Eagle, npc: any, players: Player[], now: number) {
    if (now < eagle.nextAt) return;
    eagle.nextAt = now + EAGLE_ROUND_STEP_MS;
    // Da vueltas por el borde de arriba de la terraza, alto.
    if (now < eagle.modeUntil) {
        const y = eagle.bounds.y1 - 2;
        const next = { x: npc.pos.x + (npc.heading === vars.direcciones.left ? -1 : 1), y };
        if (next.x < eagle.bounds.x1 - 1) next.x = eagle.bounds.x1;
        if (next.x > eagle.bounds.x2 + 1) next.x = eagle.bounds.x2;
        const turned = next.x === eagle.bounds.x1 || next.x === eagle.bounds.x2;
        moveNpc(npc, eagle.mapId, next, false);
        if (turned) {
            npc.heading = next.x === eagle.bounds.x1 ? vars.direcciones.right : vars.direcciones.left;
            require("./npcs").npcToArea(npc.id, npc.heading);
        }
        return;
    }
    const target = nearest(players, npc.pos);
    if (!target) return;
    eagle.attacksSinceWind++;
    const roll = Math.random();
    if (eagle.attacksSinceWind >= 3 || roll < 0.3) return startWind(eagle, npc, now);
    if (roll < 0.5) return startDive(eagle, npc, target, now);
    return startSwoop(eagle, npc, target, now);
}

function tickEagle(eagle: Eagle, npc: any, players: Player[], now: number) {
    if (eagle.mode === "espera") {
        if (!players.length) return;
        eagle.mode = "presenta";
        eagle.modeUntil = now + EAGLE_INTRO_MS;
        eagle.hitsNeeded += EAGLE_HITS_PER_EXTRA_PLAYER * Math.max(0, players.length - 1);
        present(npc);
        const greeting = fled.size ? "Flautista: «¡Je, je, je! ¡Mirá quién subió hasta acá! ¡Águila, hacelo pedazos!»" : "Flautista: «¡Je, je, je! ¡Nadie llega tan alto y vuelve! ¡Águila, hacelo pedazos!»";
        tellRoom(eagle.mapId, eagle.room, greeting, "#E8E0C8");
        eaglePacket(eagle, npc, "presenta", { ms: EAGLE_INTRO_MS, alto: true });
        return;
    }
    if (eagle.mode === "presenta") {
        if (now < eagle.modeUntil) return;
        return startRound(eagle, npc, now);
    }
    // Sin nadie en la terraza (se cayeron todos), ronda hasta que vuelvan.
    if (!players.length) {
        if (eagle.mode !== "ronda") startRound(eagle, npc, now);
        eagle.modeUntil = now + 1_000;
        return tickRound(eagle, npc, players, now);
    }
    switch (eagle.mode) {
        case "ronda":
            return tickRound(eagle, npc, players, now);
        case "pasada":
            return tickSwoop(eagle, npc, players, now);
        case "viento":
            return tickWind(eagle, npc, players, now);
        case "picada":
            return tickDive(eagle, npc, players, now);
        case "posada":
            if (now >= eagle.modeUntil) takeOff(eagle, npc, now);
            return;
        default:
            return;
    }
}

// --- Lo que llega de afuera ---

// Los golpes cuerpo a cuerpo: al Águila solo le entran mientras vuela bajo o está posada.
export function onNpcStruck(npc: any, attacker: RuntimeCharacter): boolean {
    const id = String(npc?.id ?? "");
    if (pipers.has(id)) {
        tell(attacker, "El Flautista se escurre entre sus murciélagos: vencé a los murciélagos.");
        return true;
    }
    const eagle = eagles.get(id);
    if (!eagle) return false;
    if (!eagle.low) {
        tell(attacker, "El Águila vuela demasiado alto: esperá a que baje.");
        return true;
    }
    const now = Date.now();
    if (now < eagle.nextHitAt) return true;
    eagle.nextHitAt = now + EAGLE_HIT_COOLDOWN_MS;
    sound(eagle.mapId, npc.pos, getTools().TOOL_SOUNDS.romper);
    strike(npc, hitFor(npc, eagle.hitsNeeded), String(attacker.id), eagle.room);
    return true;
}

export function invulnerableReason(npc: any, source?: string): string | null {
    const id = String(npc?.id ?? "");
    if (pipers.has(id)) return "Al Flautista no le entra nada: vencé a sus murciélagos.";
    const eagle = eagles.get(id);
    if (!eagle) return null;
    if (!eagle.low) return "El Águila vuela demasiado alto: esperá a que baje.";
    if (source && source !== "flecha" && source !== "gancho" && source !== "bomba" && source !== "tiro") return "Al Águila le entran los golpes, las flechas y el Gancho.";
    return null;
}

// Una flecha, el Gancho o algo tirado, con el Águila baja: un golpe.
export function damageFor(npc: any, _source: string, amount: number): number {
    const eagle = eagles.get(String(npc?.id ?? ""));
    if (!eagle || !eagle.low) return amount;
    return hitFor(npc, eagle.hitsNeeded);
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    for (const piper of pipers.values()) {
        if (piper.mapId !== mapId) continue;
        const npc = vars.npcs?.[piper.npcId];
        if (!npc) {
            pipers.delete(piper.npcId);
            continue;
        }
        tickPiper(piper, npc, playersInRoom(mapId, piper.room), now);
    }
    for (const eagle of eagles.values()) {
        if (eagle.mapId !== mapId) continue;
        const npc = vars.npcs?.[eagle.npcId];
        if (!npc) {
            eagles.delete(eagle.npcId);
            continue;
        }
        tickEagle(eagle, npc, playersInRoom(mapId, eagle.room), now);
    }
}

module.exports = { register, onNpcDied, forgetMap, onNpcStruck, invulnerableReason, damageFor, tick };
