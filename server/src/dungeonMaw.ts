// Las mecánicas propias de las Fauces del Bagre (docs/mazmorras/07-FAUCES_DEL_BAGRE.md), como en el original
// (zladx/LADX-Disassembly):
// - el ancla del Gancho: si la cadena pasa por encima, nace un puente que vuelve hacia el jugador por la columna de
//   pozos hasta el piso firme (queda armado toda la corrida);
// - el piso que se hunde: el que se queda quieto encima un momento, se cae (vuelve a los pocos segundos);
// - los cristales que se rompen de un golpe (o con una bomba);
// - los bloques que se juntan: con dos de la sala pegados en la misma fila, la sala se resuelve (aparece su cofre);
// - las Máscaras de Hierro: de frente se cubren de todo menos de las bombas; el Gancho de frente les arranca la máscara;
// - los esqueletos que saltan encima del jugador y los que saltan para atrás y le tiran un hueso;
// - las pulgas de agua, que patinan en diagonal solo por el agua;
// - los peces que saltan de los huecos de agua y lastiman al que está al lado.
// Lo que se ve aparte (los saltos de los esqueletos, el hueso, el pez y la máscara que vuela) va por el paquete
// dungeonBoss con `tipo` (engine/dungeonMaw.ts). La Máscara de Hierro sin máscara cambia de cuerpo ("cuerpoSinMascara").
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

const BRIDGE_STEP_MS = 70;
const SINK_AFTER_MS = 650;
const SINK_RESTORE_MS = 5_000;
const LEAP_RANGE = 2;
const LEAP_MS = 420;
const LEAP_COOLDOWN_MS = 2_400;
const LEAP_DAMAGE = 0.08;
const DODGE_MS = 380;
const DODGE_COOLDOWN_MS = 2_200;
const DODGE_CHANCE = 0.6;
const BONE_AFTER_MS = 250;
const BONE_TILE_MS = 80;
const BONE_RANGE = 6;
const BONE_DAMAGE = 0.06;
const FLEA_STEP_MS = 240;
const FLEA_DAMAGE = 0.06;
const FISH_EVERY_MS = 2_600;
const FISH_JUMP_MS = 800;
const FISH_DAMAGE = 0.08;
const TOUCH_COOLDOWN_MS = 900;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean };
type MawData = {
    anclas: string[];
    pisoFlojo: string[];
    cristalesGolpe: string[];
    salasJuntar: number[];
    peces: Array<{ x: number; y: number; sala: number }>;
    aguaBaja: string[];
};
type MawMap = {
    mapId: number;
    data: MawData;
    roomOf: Record<string, number>;
    anchors: Set<string>;
    usedAnchors: Set<string>;
    sinking: Set<string>;
    sunk: Map<string, number>;
    standing: Map<string, { key: string; since: number }>;
    crystals: Set<string>;
    joinedRooms: Set<number>;
    fish: Array<{ x: number; y: number; sala: number; nextAt: number }>;
    shallow: Set<string>;
};
type Creature = {
    npcId: string;
    mapId: number;
    kind: "mascara" | "saltarin" | "esquiva" | "pulga";
    masked: boolean;
    nextAt: number;
    dir: Pos;
    touchedAt: Map<string, number>;
};

const maps = new Map<number, MawMap>();
const creatures = new Map<string, Creature>();

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
const parseKey = (key: string): Pos => {
    const [x, y] = key.split(",").map(Number);
    return { x, y };
};
const chebyshev = (a: Pos, b: Pos) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

function templateOf(npc: { templateNpcIndex?: number } | undefined): {
    mascara?: boolean;
    cuerpoSinMascara?: number;
    saltarin?: boolean;
    esquiva?: boolean;
    pulga?: boolean;
} {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

// El estado de las Fauces de un mapa de corrida: se arma la primera vez que hace falta.
function stateOf(mapId: number): MawMap | null {
    if (maps.has(mapId)) return maps.get(mapId)!;
    const found = getDungeons().mawDataOf(mapId);
    if (!found) return null;
    const data = found.fauces as MawData;
    const state: MawMap = {
        mapId,
        data,
        roomOf: found.roomOf,
        anchors: new Set(data.anclas),
        usedAnchors: new Set(),
        sinking: new Set(data.pisoFlojo),
        sunk: new Map(),
        standing: new Map(),
        crystals: new Set(data.cristalesGolpe),
        joinedRooms: new Set(),
        fish: data.peces.map((spot, i) => ({ ...spot, nextAt: Date.now() + 800 + i * 650 })),
        shallow: new Set(data.aguaBaja),
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
    eachClientNear(mapId, pos, (client) => handleProtocol.dungeonBoss(payload, client));
}

function sound(mapId: number, pos: Pos, soundId: number) {
    const handleProtocol = getHandleProtocol();
    eachClientNear(mapId, pos, (client) => handleProtocol.playSound(0, soundId, client));
}

function tell(user: RuntimeCharacter | null | undefined, text: string) {
    const client = user ? (vars.clients?.[user.id] as RuntimeClient | undefined) : undefined;
    if (client) getHandleProtocol().console(text, "white", 1, 0, client);
}

function tellMap(mapId: number, text: string) {
    for (const user of playersOf(mapId)) tell(user, text);
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

// Una baldosa libre de la misma sala: piso, sin nadie, sin pozos ni lava.
function canStand(mapId: number, room: number | undefined, tile: Pos, ignoreId?: string): boolean {
    const dungeons = getDungeons();
    const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
    if (!cell || cell.blocked || dungeons.isHazard(mapId, tile.x, tile.y) || getGame().hayAgua(mapId, tile)) return false;
    if (room !== undefined && dungeons.roomAt(mapId, tile.x, tile.y) !== room) return false;
    const occupant = vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id;
    return !occupant || String(occupant) === ignoreId;
}

function moveNpc(npc: any, mapId: number, to: Pos) {
    const cell = vars.mapData[mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === String(npc.id)) cell.id = 0;
    require("./targetAssist").recordTileLeft(npc, mapId, npc.pos.x, npc.pos.y);
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

// Lo que viaja hacia el jugador (el hueso, el salto): con el Escudo Espejo de frente no entra.
function hurtUnlessShield(user: Player, travel: Pos, fraction: number, message: string): boolean {
    const tools = getTools();
    const dir = Math.abs(travel.x) >= Math.abs(travel.y) ? { x: Math.sign(travel.x), y: 0 } : { x: 0, y: Math.sign(travel.y) };
    if (getMotion().isAirborne(user)) return false;
    if (tools.mirrorBlocks(user, dir)) {
        sound(Number(user.map), user.pos, tools.TOOL_SOUNDS.bloqueo);
        tell(user, "¡El Escudo Espejo lo frenó!");
        return true;
    }
    getDungeons().hurtPlayer(user, fraction, message);
    return true;
}

// --- El ancla y el puente del Gancho ---

// La cadena del Gancho pasó por estas baldosas, desde `from`: si pasó sobre un ancla, el puente nace en el ancla y
// vuelve hacia el jugador mientras abajo haya pozo.
export function onHookPath(mapId: number, from: Pos, tiles: Pos[]) {
    const state = stateOf(mapId);
    if (!state?.anchors.size) return;
    for (const tile of tiles) {
        const key = coordKey(tile.x, tile.y);
        if (!state.anchors.has(key) || state.usedAnchors.has(key)) continue;
        const back = { x: Math.sign(from.x - tile.x), y: Math.sign(from.y - tile.y) };
        const span: Pos[] = [];
        for (let step = 1; step <= 12; step++) {
            const next = { x: tile.x + back.x * step, y: tile.y + back.y * step };
            if (!getDungeons().isPitAt(mapId, next.x, next.y)) break;
            span.push(next);
        }
        if (!span.length) continue;
        state.usedAnchors.add(key);
        sound(mapId, tile, getTools().TOOL_SOUNDS.gancho);
        span.forEach((pit, index) => setTimeout(() => {
            if (maps.get(mapId) !== state) return;
            getDungeons().bridgePit(mapId, pit.x, pit.y, back.y === 0);
            if (index === span.length - 1) {
                sound(mapId, pit, getDungeons().DUNGEON_SOUNDS.secreto);
                tellMap(mapId, "¡El Gancho enganchó el ancla y armó un puente!");
            }
        }, (index + 1) * BRIDGE_STEP_MS));
    }
}

// --- El piso que se hunde ---

function tickSinking(state: MawMap, players: Player[], now: number) {
    const dungeons = getDungeons();
    for (const [key, restoreAt] of [...state.sunk]) {
        const tile = parseKey(key);
        if (now < restoreAt || vars.mapData[state.mapId]?.[tile.y]?.[tile.x]?.id) continue;
        state.sunk.delete(key);
        dungeons.setBossPit(state.mapId, tile.x, tile.y, false);
        dungeons.setDungeonObject(state.mapId, tile.x, tile.y, dungeons.DUNGEON_OBJ.pisoFlojo);
    }
    if (!state.sinking.size) return;
    const motion = getMotion();
    for (const user of players) {
        const key = coordKey(user.pos.x, user.pos.y);
        const id = String(user.id);
        if (!state.sinking.has(key) || state.sunk.has(key) || motion.isAirborne(user)) {
            state.standing.delete(id);
            continue;
        }
        const standing = state.standing.get(id);
        if (!standing || standing.key !== key) {
            state.standing.set(id, { key, since: now });
            continue;
        }
        if (now - standing.since < SINK_AFTER_MS) continue;
        state.standing.delete(id);
        state.sunk.set(key, now + SINK_RESTORE_MS);
        dungeons.setDungeonObject(state.mapId, user.pos.x, user.pos.y, dungeons.DUNGEON_OBJ.hueco);
        dungeons.setBossPit(state.mapId, user.pos.x, user.pos.y, true);
        sound(state.mapId, user.pos, dungeons.DUNGEON_SOUNDS.derrumbe);
        const ws = vars.clients?.[user.id] as RuntimeClient | undefined;
        if (ws) dungeons.fallIfHazard(ws, user);
    }
}

// --- Los cristales que se rompen de un golpe ---

function breakCrystal(state: MawMap, key: string) {
    if (!state.crystals.has(key)) return false;
    state.crystals.delete(key);
    const tile = parseKey(key);
    const dungeons = getDungeons();
    dungeons.setShrineObject(state.mapId, tile.x, tile.y, 0, false);
    sound(state.mapId, tile, dungeons.DUNGEON_SOUNDS.cristal);
    return true;
}

// El golpe al aire sobre la baldosa de adelante.
export function onAirSwing(mapId: number, tile: Pos): boolean {
    const state = stateOf(mapId);
    return Boolean(state && breakCrystal(state, coordKey(tile.x, tile.y)));
}

// Una bomba rompe los cristales de las 3 × 3 baldosas de alrededor.
export function onBlast(mapId: number, at: Pos) {
    const state = stateOf(mapId);
    if (!state?.crystals.size) return;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) breakCrystal(state, coordKey(at.x + dx, at.y + dy));
}

// --- Los bloques que se juntan ---

// Después de empujar un bloque: si en una sala de bloques que se juntan quedaron dos pegados en la misma fila, la sala
// se resuelve (aparece su cofre).
export function onBlockMoved(mapId: number) {
    const state = stateOf(mapId);
    if (!state?.data.salasJuntar.length) return;
    const dungeons = getDungeons();
    for (const room of state.data.salasJuntar) {
        if (state.joinedRooms.has(room)) continue;
        const blocks = dungeons.blocksInRoom(mapId, room) as Pos[];
        const joined = blocks.some((a) => blocks.some((b) => a.y === b.y && b.x === a.x + 1));
        if (!joined) continue;
        state.joinedRooms.add(room);
        dungeons.solveRoomPuzzle(mapId, room, "¡Los bloques encajaron!");
    }
}

// --- Criaturas ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    const kind = template.mascara ? "mascara" : template.saltarin ? "saltarin" : template.esquiva ? "esquiva" : template.pulga ? "pulga" : null;
    if (!kind) return false;
    const creature: Creature = {
        npcId: String(npc.id),
        mapId: Number(npc.map),
        kind,
        masked: kind === "mascara",
        nextAt: Date.now() + 1_000,
        dir: { x: Math.random() < 0.5 ? 1 : -1, y: Math.random() < 0.5 ? 1 : -1 },
        touchedAt: new Map(),
    };
    creatures.set(creature.npcId, creature);
    // Las pulgas las mueve el server (solo por el agua); el resto camina y pega con la IA de siempre.
    if (kind === "pulga") npc.customMotion = true;
    return true;
}

// ¿El que pega está adelante de la criatura (hacia donde mira)?
function fromFront(npc: any, attacker: Pos): boolean {
    const facing = getMotion().headingOffset(Number(npc.heading ?? vars.direcciones.down));
    const dx = Math.sign(attacker.x - npc.pos.x);
    const dy = Math.sign(attacker.y - npc.pos.y);
    return (facing.x !== 0 && dx === facing.x) || (facing.y !== 0 && dy === facing.y);
}

// La Máscara de Hierro con máscara se cubre de frente de los golpes y de lo que le tiran (menos las bombas).
export function invulnerableReason(npc: any, attacker?: RuntimeCharacter, source?: string): string | null {
    const creature = creatures.get(String(npc?.id ?? ""));
    if (!creature?.masked || !attacker || source === "bomba" || !fromFront(npc, attacker.pos)) return null;
    return "La Máscara de Hierro se cubre de frente: pegale de costado o por la espalda, o arrancale la máscara con el Gancho.";
}

// El Gancho de frente le arranca la máscara (sin daño). Devuelve true si lo resolvió.
export function onHooked(npc: any, user: RuntimeCharacter): boolean {
    const creature = creatures.get(String(npc?.id ?? ""));
    if (!creature?.masked) return false;
    if (!fromFront(npc, user.pos)) return false;
    creature.masked = false;
    sound(creature.mapId, npc.pos, getTools().TOOL_SOUNDS.romper);
    // Pasa al cuerpo sin máscara (lo ven también los que llegan después) y el cliente hace volar la máscara.
    const bare = Number(templateOf(npc).cuerpoSinMascara ?? 0);
    if (bare) {
        npc.idBody = bare;
        const handleProtocol = getHandleProtocol();
        eachClientNear(creature.mapId, npc.pos, (client) => handleProtocol.changeNpcBody(npc, client));
    }
    packet(creature.mapId, npc.pos, { id: Number(creature.npcId), tipo: "mascara", puesta: false, x: npc.pos.x, y: npc.pos.y });
    tell(user, "¡El Gancho le arrancó la máscara! Ahora se la puede lastimar de cualquier lado.");
    return true;
}

// Un salto de una criatura hasta `to`, con su arco (lo dibuja el cliente).
function leapTo(creature: Creature, npc: any, to: Pos, ms: number) {
    const from = { x: npc.pos.x, y: npc.pos.y };
    npc.heading = headingFrom(from, to);
    moveNpc(npc, creature.mapId, to);
    packet(creature.mapId, to, { id: Number(creature.npcId), tipo: "salto", desde: from, hasta: to, ms });
}

// El esqueleto saltarín: si alguien está cerca (sin estar pegado), le salta al lado y lo golpea al caer.
function tickLeaper(creature: Creature, npc: any, players: Player[], now: number) {
    if (now < creature.nextAt) return;
    const room = getDungeons().roomAt(creature.mapId, npc.pos.x, npc.pos.y);
    const target = players.find((user) => {
        const distance = chebyshev(user.pos, npc.pos);
        return distance === LEAP_RANGE && getDungeons().roomAt(creature.mapId, user.pos.x, user.pos.y) === room;
    });
    if (!target) return;
    const landing = { x: target.pos.x + Math.sign(npc.pos.x - target.pos.x), y: target.pos.y + Math.sign(npc.pos.y - target.pos.y) };
    if (!canStand(creature.mapId, room, landing, creature.npcId)) return;
    creature.nextAt = now + LEAP_COOLDOWN_MS;
    leapTo(creature, npc, landing, LEAP_MS);
    setTimeout(() => {
        const victim = vars.personajes?.[target.id] as Player | undefined;
        if (!creatures.has(creature.npcId) || !victim || victim.dead || chebyshev(victim.pos, landing) > 1) return;
        hurtUnlessShield(victim, { x: victim.pos.x - landing.x, y: victim.pos.y - landing.y }, LEAP_DAMAGE, "Un esqueleto te cayó encima:");
    }, LEAP_MS);
}

// El esqueleto que esquiva: si alguien se le pega, salta para atrás y le tira un hueso.
function tickDodger(creature: Creature, npc: any, players: Player[], now: number) {
    if (now < creature.nextAt) return;
    const target = players.find((user) => chebyshev(user.pos, npc.pos) === 1);
    if (!target) return;
    creature.nextAt = now + 400;
    if (Math.random() > DODGE_CHANCE) return;
    const room = getDungeons().roomAt(creature.mapId, npc.pos.x, npc.pos.y);
    const away = { x: Math.sign(npc.pos.x - target.pos.x), y: Math.sign(npc.pos.y - target.pos.y) };
    const options = [2, 1].map((n) => ({ x: npc.pos.x + away.x * n, y: npc.pos.y + away.y * n }));
    const landing = options.find((tile) => canStand(creature.mapId, room, tile, creature.npcId));
    if (!landing) return;
    creature.nextAt = now + DODGE_COOLDOWN_MS;
    leapTo(creature, npc, landing, DODGE_MS);
    setTimeout(() => {
        const alive = vars.npcs?.[creature.npcId];
        const victim = vars.personajes?.[target.id] as Player | undefined;
        if (!alive || !creatures.has(creature.npcId) || !victim || victim.dead) return;
        throwBone(creature, alive, victim);
    }, DODGE_MS + BONE_AFTER_MS);
}

// El hueso vuela en línea recta hacia donde está el jugador y le pega al primero que encuentra.
function throwBone(creature: Creature, npc: any, target: Player) {
    const from = { x: npc.pos.x, y: npc.pos.y };
    const dx = target.pos.x - from.x;
    const dy = target.pos.y - from.y;
    const span = Math.max(Math.abs(dx), Math.abs(dy));
    if (!span) return;
    npc.heading = headingFrom(from, target.pos);
    require("./npcs").npcToArea(npc.id, npc.heading);
    const path: Pos[] = [];
    for (let i = 1; i <= Math.min(BONE_RANGE, span + 2); i++) {
        const tile = { x: Math.round(from.x + (dx * i) / span), y: Math.round(from.y + (dy * i) / span) };
        if (vars.mapa[creature.mapId]?.[tile.y]?.[tile.x]?.blocked) break;
        path.push(tile);
    }
    if (!path.length) return;
    packet(creature.mapId, from, { id: Number(creature.npcId), tipo: "hueso", desde: from, hasta: path[path.length - 1], ms: path.length * BONE_TILE_MS });
    let done = false;
    path.forEach((tile, index) => setTimeout(() => {
        if (done) return;
        const victim = playersOf(creature.mapId).find((user) => user.pos.x === tile.x && user.pos.y === tile.y);
        if (victim && hurtUnlessShield(victim, { x: dx, y: dy }, BONE_DAMAGE, "Te pegó un hueso:")) done = true;
    }, (index + 1) * BONE_TILE_MS));
}

// La pulga de agua patina en diagonal y rebota, pero solo por el agua (baja o profunda).
function tickFlea(creature: Creature, npc: any, players: Player[], now: number) {
    if (now < creature.nextAt) return;
    creature.nextAt = now + FLEA_STEP_MS;
    const state = stateOf(creature.mapId);
    const room = getDungeons().roomAt(creature.mapId, npc.pos.x, npc.pos.y);
    const isWater = (tile: Pos) => Boolean(state?.shallow.has(coordKey(tile.x, tile.y))) || getGame().hayAgua(creature.mapId, tile);
    const canGo = (tile: Pos) => {
        const cell = vars.mapa[creature.mapId]?.[tile.y]?.[tile.x];
        return Boolean(cell && !cell.blocked && isWater(tile) && !vars.mapData[creature.mapId]?.[tile.y]?.[tile.x]?.id && getDungeons().roomAt(creature.mapId, tile.x, tile.y) === room);
    };
    const d = creature.dir;
    for (const dir of [d, { x: -d.x, y: d.y }, { x: d.x, y: -d.y }, { x: -d.x, y: -d.y }]) {
        const to = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
        const victim = players.find((user) => user.pos.x === to.x && user.pos.y === to.y);
        if (victim) {
            if (now >= (creature.touchedAt.get(String(victim.id)) ?? 0)) {
                creature.touchedAt.set(String(victim.id), now + TOUCH_COOLDOWN_MS);
                if (!getTools().mirrorBlocksNpcHit(victim, npc)) getDungeons().hurtPlayer(victim, FLEA_DAMAGE, "Te mordió una pulga de agua:");
            }
            creature.dir = { x: -dir.x, y: -dir.y };
            return;
        }
        if (!canGo(to)) continue;
        creature.dir = dir;
        npc.heading = headingFrom(npc.pos, to);
        moveNpc(npc, creature.mapId, to);
        return;
    }
}

// --- Los peces que saltan ---

function tickFish(state: MawMap, players: Player[], now: number) {
    for (const fish of state.fish) {
        if (now < fish.nextAt) continue;
        if (!players.some((user) => state.roomOf[coordKey(user.pos.x, user.pos.y)] === fish.sala)) continue;
        fish.nextAt = now + FISH_EVERY_MS + Math.random() * 600;
        packet(state.mapId, fish, { id: 0, tipo: "pez", x: fish.x, y: fish.y, ms: FISH_JUMP_MS });
        // En lo más alto del salto lastima al que está encima del hueco o al lado.
        setTimeout(() => {
            if (maps.get(state.mapId) !== state) return;
            for (const user of playersOf(state.mapId)) {
                if (chebyshev(user.pos, fish) > 1) continue;
                getDungeons().hurtPlayer(user, FISH_DAMAGE, "Te mordió un pez que saltó del agua:");
            }
        }, FISH_JUMP_MS / 2);
    }
}

// --- Del resto del motor ---

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    creatures.delete(String(npc?.id ?? ""));
}

export function forgetMap(mapId: number) {
    maps.delete(mapId);
    for (const [id, creature] of creatures) if (creature.mapId === mapId) creatures.delete(id);
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    const players = playersOf(mapId);
    if (!players.length) return;
    const state = stateOf(mapId);
    if (state) {
        tickSinking(state, players, now);
        tickFish(state, players, now);
    }
    for (const creature of creatures.values()) {
        if (creature.mapId !== mapId) continue;
        const npc = vars.npcs?.[creature.npcId];
        if (!npc) {
            creatures.delete(creature.npcId);
            continue;
        }
        if (creature.kind === "saltarin") tickLeaper(creature, npc, players, now);
        else if (creature.kind === "esquiva") tickDodger(creature, npc, players, now);
        else if (creature.kind === "pulga") tickFlea(creature, npc, players, now);
    }
}

module.exports = {
    onHookPath,
    onAirSwing,
    onBlast,
    onBlockMoved,
    register,
    invulnerableReason,
    onHooked,
    onNpcDied,
    forgetMap,
    tick,
};
