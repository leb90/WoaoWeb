// Las mecánicas propias del Santuario del Rostro (docs/mazmorras/06-SANTUARIO_DEL_ROSTRO.md), como en el original
// (zladx/LADX-Disassembly):
// - cabezas de caballo: se levantan con el Brazalete y se tiran; al caer quedan paradas o acostadas (mitad y mitad).
//   Con todas las de la sala paradas, la sala se resuelve (abre sus puertas "=");
// - baldosas voladoras: con alguien en la sala se despegan de a una, flotan y salen derecho hacia donde está el jugador
//   más cercano; las marcadas dejan un pozo. Rotas todas, la sala se resuelve (aparecen sus cofres);
// - cintas transportadoras: corren una baldosa al que está encima;
// - lanzallamas: escupen una bola de fuego hacia la sala cada tanto;
// - ojo de piedra (el Beamos): gira y, si ve a alguien en línea, le tira un rayo; el Escudo Espejo lo frena;
// - hechiceros (los Wizrobes): aparecen, tiran un rayo y desaparecen. Solo se los lastima mientras se ven; el golpe
//   solo los empuja y una bomba o algo tirado los mata de una;
// - mocos escondidos (los Zoles): no se ven hasta que alguien se les acerca;
// - estrellas: rebotan en diagonal contra las paredes.
// Lo que se ve aparte (las baldosas en el aire, los rayos y las criaturas escondidas) va por el paquete dungeonBoss con
// `tipo` (engine/dungeonShrine.ts); las bolas de fuego usan las del Genio (engine/dungeonGrotto.ts).
import type { EntityId, RuntimeCharacter, RuntimeClient } from "./types/runtime";

export {};

const vars = require("./vars");

const TILE_EVERY_MS = 1_100;
const TILE_RISE_MS = 750;
const TILE_TILE_MS = 140;
const TILE_DAMAGE = 0.1;
const HIT_RADIUS = 0.75;
const CONVEYOR_MS = 330;
const SHOOT_EVERY_MS = 2_600;
const FIRE_TILE_MS = 110;
const FIRE_DAMAGE = 0.12;
const EYE_TURN_MS = 450;
const EYE_RANGE = 8;
const EYE_AIM_MS = 350;
const EYE_COOLDOWN_MS = 1_600;
const EYE_DAMAGE = 0.12;
const WIZROBE_HIDDEN_MIN_MS = 1_600;
const WIZROBE_HIDDEN_MAX_MS = 2_600;
const WIZROBE_SHOW_MS = 1_700;
const WIZROBE_FIRE_AFTER_MS = 600;
const BOLT_TILE_MS = 90;
const BOLT_DAMAGE = 0.1;
const HIDDEN_RADIUS = 2;
const STAR_STEP_MS = 260;
const STAR_DAMAGE = 0.08;
const STAR_COOLDOWN_MS = 900;
const SYNC_MS = 1_000;

type Pos = { x: number; y: number };
type Player = RuntimeCharacter & { dead?: boolean };
type FlyingTile = { x: number; y: number; pozo: boolean };
type ShrineMap = {
    mapId: number;
    roomOf: Record<string, number>;
    heads: Map<string, { standing: boolean; sala: number }>;
    headRooms: Map<number, number>;
    solvedHeadRooms: Set<number>;
    tiles: Map<number, FlyingTile[]>;
    tilesInFlight: Map<number, number>;
    nextTileAt: Map<number, number>;
    solvedTileRooms: Set<number>;
    conveyors: Map<string, Pos>;
    nextConveyorAt: number;
    shooters: Array<{ x: number; y: number; dir: Pos; sala: number; nextAt: number }>;
    eyes: Array<{ x: number; y: number; sala: number; dir: number; nextTurnAt: number; nextShotAt: number }>;
    // Baldosas cuyo bloqueo cambió (las cabezas que se mueven): van en la foto del área.
    touched: Set<string>;
};
type Creature = {
    npcId: string;
    mapId: number;
    kind: "hechicero" | "escondido" | "estrella";
    hidden: boolean;
    nextAt: number;
    dir: Pos;
    touchedAt: Map<string, number>;
};

const maps = new Map<number, ShrineMap>();
const creatures = new Map<string, Creature>();
const nextHiddenSyncAt = new Map<number, number>();

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
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);
const DIR_OF: Record<string, Pos> = { norte: { x: 0, y: -1 }, sur: { x: 0, y: 1 }, este: { x: 1, y: 0 }, oeste: { x: -1, y: 0 } };
// Las 8 direcciones del ojo, en orden de giro (horario, desde arriba).
const EYE_DIRS: Pos[] = [
    { x: 0, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 },
    { x: -1, y: 1 },
    { x: -1, y: 0 },
    { x: -1, y: -1 },
];

function templateOf(npc: { templateNpcIndex?: number } | undefined): { hechicero?: boolean; escondido?: boolean; estrella?: boolean } {
    return (npc ? vars.datNpc?.[Number(npc.templateNpcIndex ?? 0)] : undefined) ?? {};
}

// El estado del Santuario de un mapa de corrida: se arma la primera vez que hace falta.
function stateOf(mapId: number): ShrineMap | null {
    if (maps.has(mapId)) return maps.get(mapId)!;
    const data = getDungeons().shrineDataOf(mapId);
    if (!data) return null;
    const { santuario, roomOf } = data;
    const heads = new Map<string, { standing: boolean; sala: number }>();
    const headRooms = new Map<number, number>();
    for (const head of santuario.cabezas) {
        heads.set(coordKey(head.x, head.y), { standing: false, sala: head.sala });
        headRooms.set(head.sala, (headRooms.get(head.sala) ?? 0) + 1);
    }
    const tiles = new Map<number, FlyingTile[]>();
    for (const tile of santuario.baldosas) tiles.set(tile.sala, [...(tiles.get(tile.sala) ?? []), { x: tile.x, y: tile.y, pozo: tile.pozo }]);
    const state: ShrineMap = {
        mapId,
        roomOf,
        heads,
        headRooms,
        solvedHeadRooms: new Set(),
        tiles,
        tilesInFlight: new Map(),
        nextTileAt: new Map(),
        solvedTileRooms: new Set(),
        conveyors: new Map(santuario.cintas.map((c: { x: number; y: number; dir: string }) => [coordKey(c.x, c.y), DIR_OF[c.dir]])),
        nextConveyorAt: 0,
        shooters: santuario.lanzallamas.map((s: { x: number; y: number; dir: string; sala: number }) => ({ x: s.x, y: s.y, dir: DIR_OF[s.dir], sala: s.sala, nextAt: 0 })),
        eyes: santuario.ojos.map((e: { x: number; y: number; sala: number }) => ({ x: e.x, y: e.y, sala: e.sala, dir: 0, nextTurnAt: 0, nextShotAt: 0 })),
        touched: new Set(),
    };
    maps.set(mapId, state);
    return state;
}

function playersOf(mapId: number): Player[] {
    return (Object.values(vars.personajes ?? {}) as Player[]).filter((user) => user && !user.dead && Number(user.map) === mapId);
}

function roomOfPos(state: ShrineMap, pos: Pos): number | undefined {
    return state.roomOf[coordKey(pos.x, pos.y)];
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

function tell(user: RuntimeCharacter, text: string) {
    const client = vars.clients?.[user.id] as RuntimeClient | undefined;
    if (client) getHandleProtocol().console(text, "white", 1, 0, client);
}

function isFree(mapId: number, tile: Pos): boolean {
    const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
    if (!cell || cell.blocked || vars.mapData[mapId]?.[tile.y]?.[tile.x]?.id) return false;
    return !getDungeons().isHazard(mapId, tile.x, tile.y);
}

// Lo que viaja en línea recta (fuego, baldosa, rayo) le pega al que esté cerca de donde llega, salvo que lo frene el
// Escudo Espejo de frente o que esté en el aire.
function hitAt(mapId: number, at: Pos, travel: Pos, fraction: number, message: string): Player | null {
    const tools = getTools();
    const motion = getMotion();
    const dir = Math.abs(travel.x) >= Math.abs(travel.y) ? { x: Math.sign(travel.x), y: 0 } : { x: 0, y: Math.sign(travel.y) };
    for (const user of playersOf(mapId)) {
        if (Math.hypot(user.pos.x - at.x, user.pos.y - at.y) > HIT_RADIUS || motion.isAirborne(user)) continue;
        if (tools.mirrorBlocks(user, dir)) {
            sound(mapId, user.pos, tools.TOOL_SOUNDS.bloqueo);
            tell(user, "¡El Escudo Espejo lo frenó!");
            return user;
        }
        getDungeons().hurtPlayer(user, fraction, message);
        return user;
    }
    return null;
}

// --- Cabezas de caballo ---

export function headAt(mapId: number, x: number, y: number): boolean {
    return Boolean(stateOf(mapId)?.heads.has(coordKey(x, y)));
}

// El Brazalete la levanta: deja libre su baldosa.
export function liftHead(mapId: number, x: number, y: number): boolean {
    const state = stateOf(mapId);
    const key = coordKey(x, y);
    if (!state?.heads.has(key)) return false;
    state.heads.delete(key);
    state.touched.add(key);
    getDungeons().setShrineObject(mapId, x, y, 0, false);
    return true;
}

// Cae donde la tiraron (o en la baldosa libre más cercana): parada o acostada, mitad y mitad. Si con eso quedaron
// paradas todas las de su sala, la sala se resuelve.
export function landHead(user: RuntimeCharacter, mapId: number, at: Pos, homeRoom: number | undefined) {
    const state = stateOf(mapId);
    if (!state) return;
    const tile = isFree(mapId, at) ? at : freeTileNear(mapId, at);
    if (!tile) return;
    const standing = Math.random() < 0.5;
    const sala = homeRoom ?? roomOfPos(state, tile) ?? 0;
    const key = coordKey(tile.x, tile.y);
    state.heads.set(key, { standing, sala });
    state.touched.add(key);
    const dungeons = getDungeons();
    dungeons.setShrineObject(mapId, tile.x, tile.y, standing ? dungeons.DUNGEON_OBJ.cabezaParada : dungeons.DUNGEON_OBJ.cabezaAcostada, true);
    tell(user, standing ? "La cabeza de caballo cayó parada." : "La cabeza de caballo cayó acostada.");
    const total = state.headRooms.get(sala) ?? 0;
    const up = [...state.heads.values()].filter((head) => head.sala === sala && head.standing).length;
    if (total && up === total && !state.solvedHeadRooms.has(sala)) {
        state.solvedHeadRooms.add(sala);
        dungeons.solveRoomPuzzle(mapId, sala, "¡Las cabezas de caballo quedaron paradas!");
    }
}

// La sala de la que salió una cabeza (para contarla en su sala aunque la tiren a otra).
export function headRoomAt(mapId: number, x: number, y: number): number | undefined {
    return stateOf(mapId)?.heads.get(coordKey(x, y))?.sala;
}

function freeTileNear(mapId: number, near: Pos): Pos | null {
    for (let radius = 1; radius <= 3; radius++) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
                const tile = { x: near.x + dx, y: near.y + dy };
                if (isFree(mapId, tile)) return tile;
            }
        }
    }
    return null;
}

// Las baldosas donde cambió el bloqueo (dungeons.getDynamicBlocked, para los que entran a la vista después).
export function isTouchedTile(mapId: number, x: number, y: number): boolean {
    return Boolean(maps.get(mapId)?.touched.has(coordKey(x, y)));
}

// --- Baldosas voladoras ---

type FlightOptions = { damage: number; message: string; obj?: number; onLanded?: () => void };

// Lo que se despega del piso (una baldosa o, en la sala del Rostro de Piedra, una vasija): sube, flota y sale derecho
// hacia donde está el jugador más cercano de la sala. Se rompe al llegar.
function flyFromFloor(state: ShrineMap, tile: Pos, sala: number, options: FlightOptions) {
    const obj = options.obj ? { obj: options.obj } : {};
    packet(state.mapId, tile, { id: 0, tipo: "baldosa", fase: "sube", x: tile.x, y: tile.y, ms: TILE_RISE_MS, ...obj });
    setTimeout(() => {
        if (maps.get(state.mapId) !== state) return;
        const players = playersOf(state.mapId);
        const inRoom = players.filter((user) => roomOfPos(state, user.pos) === sala);
        const target = nearest(inRoom.length ? inRoom : players, tile);
        const to = target ? { x: target.pos.x, y: target.pos.y } : { ...tile };
        const ms = Math.max(200, Math.round(Math.hypot(to.x - tile.x, to.y - tile.y) * TILE_TILE_MS));
        packet(state.mapId, tile, { id: 0, tipo: "baldosa", fase: "vuela", desde: { x: tile.x, y: tile.y }, hasta: to, ms, ...obj });
        setTimeout(() => {
            if (maps.get(state.mapId) !== state) return;
            hitAt(state.mapId, to, { x: to.x - tile.x, y: to.y - tile.y }, options.damage, options.message);
            sound(state.mapId, to, getTools().TOOL_SOUNDS.romper);
            options.onLanded?.();
        }, ms);
    }, TILE_RISE_MS);
}

function launchTile(state: ShrineMap, sala: number, now: number) {
    const left = state.tiles.get(sala) ?? [];
    // Como en el original, de a parejas opuestas: una del principio de la lista y otra del final.
    const tile = (left.length % 2 ? left.pop() : left.shift())!;
    state.nextTileAt.set(sala, now + TILE_EVERY_MS);
    state.tilesInFlight.set(sala, (state.tilesInFlight.get(sala) ?? 0) + 1);
    const dungeons = getDungeons();
    if (tile.pozo) dungeons.openPitAt(state.mapId, tile.x, tile.y);
    else dungeons.setShrineObject(state.mapId, tile.x, tile.y, 0, false);
    flyFromFloor(state, tile, sala, {
        damage: TILE_DAMAGE,
        message: "Te pegó una baldosa:",
        onLanded: () => {
            const flying = (state.tilesInFlight.get(sala) ?? 1) - 1;
            state.tilesInFlight.set(sala, flying);
            if (!flying && !(state.tiles.get(sala) ?? []).length && !state.solvedTileRooms.has(sala)) {
                state.solvedTileRooms.add(sala);
                getDungeons().solveRoomPuzzle(state.mapId, sala, "¡Se rompieron todas las baldosas!");
            }
        },
    });
}

// Las baldosas de la sala del Rostro de Piedra (dungeonShrineBosses.ts): se las lleva él, para tirarlas en su orden.
export function takeRoomTiles(mapId: number, sala: number): Pos[] {
    const state = stateOf(mapId);
    const tiles = state?.tiles.get(sala) ?? [];
    state?.tiles.set(sala, []);
    return tiles.map((tile) => ({ x: tile.x, y: tile.y }));
}

// El Rostro de Piedra tira una baldosa o una vasija (`lifted`: la vasija ya la sacó del piso con dungeons.liftAt).
export function launchFloorTile(mapId: number, tile: Pos, sala: number, options: FlightOptions & { lifted?: boolean }) {
    const state = stateOf(mapId);
    if (!state) return;
    if (!options.lifted) getDungeons().setShrineObject(mapId, tile.x, tile.y, 0, false);
    flyFromFloor(state, tile, sala, options);
}

function tickTiles(state: ShrineMap, players: Player[], now: number) {
    const bosses = require("./dungeonShrineBosses");
    for (const [sala, left] of state.tiles) {
        if (!left.length || now < (state.nextTileAt.get(sala) ?? 0)) continue;
        if (bosses.claimsTiles(state.mapId, sala)) continue;
        const inRoom = players.filter((user) => roomOfPos(state, user.pos) === sala);
        if (!inRoom.length) continue;
        launchTile(state, sala, now);
    }
}

// --- Cintas, lanzallamas y ojos ---

function tickConveyors(state: ShrineMap, players: Player[], now: number) {
    if (!state.conveyors.size || now < state.nextConveyorAt) return;
    state.nextConveyorAt = now + CONVEYOR_MS;
    const motion = getMotion();
    for (const user of players) {
        const dir = state.conveyors.get(coordKey(user.pos.x, user.pos.y));
        if (!dir || motion.isAirborne(user) || motion.isMoving(user)) continue;
        const to = { x: user.pos.x + dir.x, y: user.pos.y + dir.y };
        const cell = vars.mapa[state.mapId]?.[to.y]?.[to.x];
        if (!cell || cell.blocked || vars.mapData[state.mapId]?.[to.y]?.[to.x]?.id) continue;
        motion.push(user, dir, 1);
    }
}

// Una bola de fuego en línea recta hasta la pared: quema al primero que encuentra en el camino.
function fireLine(mapId: number, from: Pos, dir: Pos, tileMs: number, damage: number, message: string, color?: string) {
    const path: Pos[] = [];
    for (let step = 1; step <= 14; step++) {
        const tile = { x: from.x + dir.x * step, y: from.y + dir.y * step };
        const cell = vars.mapa[mapId]?.[tile.y]?.[tile.x];
        if (!cell || cell.blocked) break;
        path.push(tile);
    }
    if (!path.length) return;
    const end = path[path.length - 1];
    packet(mapId, from, {
        id: 0,
        tipo: "fuego",
        desde: { x: from.x + dir.x * 0.4, y: from.y + dir.y * 0.4 },
        hasta: end,
        ms: path.length * tileMs,
        recto: true,
        ...(color ? { color } : {}),
    });
    let done = false;
    path.forEach((tile, index) => {
        setTimeout(() => {
            if (done) return;
            if (hitAt(mapId, tile, dir, damage, message)) done = true;
        }, (index + 1) * tileMs);
    });
}

function tickShooters(state: ShrineMap, players: Player[], now: number) {
    for (const shooter of state.shooters) {
        if (now < shooter.nextAt) continue;
        if (!players.some((user) => roomOfPos(state, user.pos) === shooter.sala)) continue;
        shooter.nextAt = now + SHOOT_EVERY_MS;
        sound(state.mapId, shooter, getTools().TOOL_SOUNDS.fuego);
        fireLine(state.mapId, shooter, shooter.dir, FIRE_TILE_MS, FIRE_DAMAGE, "Te quemó un lanzallamas:");
    }
}

// ¿Está `to` en la línea de `dir` (recta o diagonal) desde `from`, sin paredes en el medio y a tiro?
function inLine(mapId: number, from: Pos, dir: Pos, to: Pos): boolean {
    for (let step = 1; step <= EYE_RANGE; step++) {
        const tile = { x: from.x + dir.x * step, y: from.y + dir.y * step };
        if (tile.x === to.x && tile.y === to.y) return true;
        if (vars.mapa[mapId]?.[tile.y]?.[tile.x]?.blocked) return false;
    }
    return false;
}

function tickEyes(state: ShrineMap, players: Player[], now: number) {
    for (const eye of state.eyes) {
        const inRoom = players.filter((user) => roomOfPos(state, user.pos) === eye.sala);
        if (!inRoom.length || now < eye.nextTurnAt) continue;
        eye.nextTurnAt = now + EYE_TURN_MS;
        eye.dir = (eye.dir + 1) % EYE_DIRS.length;
        if (now < eye.nextShotAt) continue;
        const dir = EYE_DIRS[eye.dir];
        const target = inRoom.find((user) => inLine(state.mapId, eye, dir, user.pos));
        if (!target) continue;
        eye.nextShotAt = now + EYE_COOLDOWN_MS;
        eye.nextTurnAt = now + EYE_AIM_MS + EYE_TURN_MS;
        const to = { x: target.pos.x, y: target.pos.y };
        // Un aviso fino y, enseguida, el rayo.
        packet(state.mapId, eye, { id: 0, tipo: "rayo", desde: { x: eye.x, y: eye.y - 0.4 }, hasta: to, ms: EYE_AIM_MS, aviso: true });
        setTimeout(() => {
            if (maps.get(state.mapId) !== state) return;
            packet(state.mapId, eye, { id: 0, tipo: "rayo", desde: { x: eye.x, y: eye.y - 0.4 }, hasta: to, ms: 260 });
            sound(state.mapId, eye, getTools().TOOL_SOUNDS.fuego);
            hitAt(state.mapId, to, { x: to.x - eye.x, y: to.y - eye.y }, EYE_DAMAGE, "Te quemó el rayo del ojo de piedra:");
        }, EYE_AIM_MS);
    }
}

// --- Criaturas: hechiceros, mocos escondidos y estrellas ---

export function register(npc: any): boolean {
    const template = templateOf(npc);
    const kind = template.hechicero ? "hechicero" : template.escondido ? "escondido" : template.estrella ? "estrella" : null;
    if (!kind) return false;
    const creature: Creature = {
        npcId: String(npc.id),
        mapId: Number(npc.map),
        kind,
        hidden: false,
        nextAt: Date.now() + randomBetween(WIZROBE_HIDDEN_MIN_MS, WIZROBE_HIDDEN_MAX_MS),
        dir: { x: Math.random() < 0.5 ? 1 : -1, y: Math.random() < 0.5 ? 1 : -1 },
        touchedAt: new Map(),
    };
    creatures.set(creature.npcId, creature);
    // El server las mueve (el moco escondido, solo mientras está escondido: después pelea como cualquiera).
    npc.customMotion = true;
    if (kind !== "estrella") hide(creature, npc);
    return true;
}

// Escondida: no se ve, no ocupa su baldosa y no se mueve.
function hide(creature: Creature, npc: any) {
    creature.hidden = true;
    const cell = vars.mapData[creature.mapId]?.[npc.pos.y]?.[npc.pos.x];
    if (cell && String(cell.id) === creature.npcId) cell.id = 0;
    packet(creature.mapId, npc.pos, { id: Number(creature.npcId), tipo: "oculto", oculto: true });
}

function show(creature: Creature, npc: any, at: Pos) {
    creature.hidden = false;
    moveNpc(npc, creature.mapId, at);
    if (creature.kind === "escondido") npc.customMotion = false;
    // Escondida no ocupaba baldosa, así que los que la ven no la conocen: se la presenta entera (como al revivir).
    require("./npcs").loopArea(npc.id, (target: { id: EntityId; dead?: boolean }) => {
        const area = (vars.areaNpc[npc.id] ??= []) as EntityId[];
        if (!target.dead && !area.includes(target.id)) area.push(target.id);
        const client = vars.clients?.[target.id] as RuntimeClient | undefined;
        if (!client) return;
        getHandleProtocol().sendNpc(npc);
        require("./socket").send(client);
    });
    packet(creature.mapId, at, { id: Number(creature.npcId), tipo: "oculto", oculto: false });
    packet(creature.mapId, at, { id: Number(creature.npcId), tipo: "humo", x: at.x, y: at.y });
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

// La dirección (de AO) para mirar desde `from` hacia `toward`.
function headingFrom(from: Pos, toward: Pos): number {
    const d = vars.direcciones;
    const dx = toward.x - from.x;
    const dy = toward.y - from.y;
    return Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? d.right : d.left) : dy > 0 ? d.down : d.up;
}

function headingDir(npc: any): Pos {
    return getMotion().headingOffset(Number(npc.heading ?? vars.direcciones.down));
}

// Un lugar para aparecer: en la fila o la columna del jugador, a 2-5 baldosas y con línea libre.
function wizrobeSpot(mapId: number, room: number | undefined, target: Player): Pos | null {
    const options: Pos[] = [];
    for (const dir of [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }]) {
        for (let distance = 2; distance <= 5; distance++) {
            const tile = { x: target.pos.x + dir.x * distance, y: target.pos.y + dir.y * distance };
            if (vars.mapa[mapId]?.[tile.y]?.[tile.x]?.blocked) break;
            if (getDungeons().roomAt(mapId, tile.x, tile.y) === room && isFree(mapId, tile)) options.push(tile);
        }
    }
    return options.length ? options[Math.floor(Math.random() * options.length)] : null;
}

function tickWizrobe(creature: Creature, npc: any, players: Player[], now: number) {
    if (now < creature.nextAt) return;
    if (creature.hidden) {
        const room = getDungeons().roomAt(creature.mapId, npc.pos.x, npc.pos.y);
        const inRoom = players.filter((user) => getDungeons().roomAt(creature.mapId, user.pos.x, user.pos.y) === room);
        const target = nearest(inRoom, npc.pos);
        const spot = target ? wizrobeSpot(creature.mapId, room, target) : null;
        if (!target || !spot) {
            creature.nextAt = now + 500;
            return;
        }
        npc.heading = headingFrom(spot, target.pos);
        show(creature, npc, spot);
        creature.nextAt = now + WIZROBE_SHOW_MS;
        setTimeout(() => {
            const alive = vars.npcs?.[creature.npcId];
            if (!alive || creature.hidden || !creatures.has(creature.npcId)) return;
            fireLine(creature.mapId, alive.pos, headingDir(alive), BOLT_TILE_MS, BOLT_DAMAGE, "Te pegó el rayo de un hechicero:", "magia");
        }, WIZROBE_FIRE_AFTER_MS);
        return;
    }
    hide(creature, npc);
    creature.nextAt = now + randomBetween(WIZROBE_HIDDEN_MIN_MS, WIZROBE_HIDDEN_MAX_MS);
}

function tickHidden(creature: Creature, npc: any, players: Player[]) {
    if (!creature.hidden) return;
    const near = players.some((user) => Math.max(Math.abs(user.pos.x - npc.pos.x), Math.abs(user.pos.y - npc.pos.y)) <= HIDDEN_RADIUS);
    if (near && isFree(creature.mapId, npc.pos)) show(creature, npc, { x: npc.pos.x, y: npc.pos.y });
}

function tickStar(creature: Creature, npc: any, players: Player[], now: number) {
    if (now < creature.nextAt) return;
    creature.nextAt = now + STAR_STEP_MS;
    const room = getDungeons().roomAt(creature.mapId, npc.pos.x, npc.pos.y);
    const canGo = (tile: Pos) => getDungeons().roomAt(creature.mapId, tile.x, tile.y) === room && isFree(creature.mapId, tile);
    for (const dir of [creature.dir, { x: -creature.dir.x, y: creature.dir.y }, { x: creature.dir.x, y: -creature.dir.y }, { x: -creature.dir.x, y: -creature.dir.y }]) {
        const to = { x: npc.pos.x + dir.x, y: npc.pos.y + dir.y };
        const victim = players.find((user) => user.pos.x === to.x && user.pos.y === to.y);
        if (victim) {
            if (now >= (creature.touchedAt.get(String(victim.id)) ?? 0)) {
                creature.touchedAt.set(String(victim.id), now + STAR_COOLDOWN_MS);
                getDungeons().hurtPlayer(victim, STAR_DAMAGE, "Te pegó una estrella:");
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

// El golpe cuerpo a cuerpo a un hechicero lo empuja (no le hace daño); a uno escondido no le llega.
export function onNpcStruck(npc: any, attacker: RuntimeCharacter): boolean {
    const creature = creatures.get(String(npc?.id ?? ""));
    if (!creature || creature.kind === "estrella") return false;
    if (creature.hidden) return true;
    if (creature.kind !== "hechicero") return false;
    const dx = Math.sign(npc.pos.x - attacker.pos.x);
    const dy = Math.sign(npc.pos.y - attacker.pos.y);
    const to = Math.abs(npc.pos.x - attacker.pos.x) >= Math.abs(npc.pos.y - attacker.pos.y) ? { x: npc.pos.x + dx, y: npc.pos.y } : { x: npc.pos.x, y: npc.pos.y + dy };
    if (isFree(creature.mapId, to)) moveNpc(npc, creature.mapId, to);
    tell(attacker, "El golpe solo empuja al hechicero: probá con una bomba, algo tirado o flechas.");
    return true;
}

export function invulnerableReason(npc: any): string | null {
    const creature = creatures.get(String(npc?.id ?? ""));
    if (!creature?.hidden) return null;
    return creature.kind === "hechicero" ? "El hechicero no está: esperá a que aparezca." : "No hay nada ahí... todavía.";
}

// Una bomba o algo tirado mata a un hechicero de una (dungeonTools.damageNpc).
export function damageFor(npc: any, source: string, amount: number): number {
    const creature = creatures.get(String(npc?.id ?? ""));
    if (creature?.kind === "hechicero" && !creature.hidden && (source === "bomba" || source === "tiro")) return Number(npc.hp ?? amount);
    return amount;
}

export function onNpcDied(npc: { id?: EntityId } | undefined) {
    creatures.delete(String(npc?.id ?? ""));
}

export function forgetMap(mapId: number) {
    maps.delete(mapId);
    nextHiddenSyncAt.delete(mapId);
    for (const [id, creature] of creatures) if (creature.mapId === mapId) creatures.delete(id);
}

// Los que entran a la vista después tienen que saber quién está escondido.
function syncHidden(mapId: number) {
    for (const creature of creatures.values()) {
        if (creature.mapId !== mapId || !creature.hidden) continue;
        const npc = vars.npcs?.[creature.npcId];
        if (npc) packet(mapId, npc.pos, { id: Number(creature.npcId), tipo: "oculto", oculto: true });
    }
}

// Cada 50 ms, por mapa de la corrida.
export function tick(mapId: number, now: number) {
    const players = playersOf(mapId);
    if (!players.length) return;
    const state = stateOf(mapId);
    if (state) {
        tickTiles(state, players, now);
        tickConveyors(state, players, now);
        tickShooters(state, players, now);
        tickEyes(state, players, now);
    }
    if (now >= (nextHiddenSyncAt.get(mapId) ?? 0)) {
        nextHiddenSyncAt.set(mapId, now + SYNC_MS);
        syncHidden(mapId);
    }
    for (const creature of creatures.values()) {
        if (creature.mapId !== mapId) continue;
        const npc = vars.npcs?.[creature.npcId];
        if (!npc) {
            creatures.delete(creature.npcId);
            continue;
        }
        if (creature.kind === "hechicero") tickWizrobe(creature, npc, players, now);
        else if (creature.kind === "escondido") tickHidden(creature, npc, players);
        else tickStar(creature, npc, players, now);
    }
}

module.exports = {
    register,
    tick,
    headAt,
    liftHead,
    landHead,
    headRoomAt,
    isTouchedTile,
    takeRoomTiles,
    launchFloorTile,
    onNpcStruck,
    invulnerableReason,
    damageFor,
    onNpcDied,
    forgetMap,
};
