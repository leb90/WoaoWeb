import type {
    EntityId,
    PendingMoveCommand,
    Position,
    RuntimeCharacter,
    RuntimeCharacters,
    RuntimeClient,
} from "./types/runtime";
import { getClientById } from "./runtimeRegistry";

export {};
const vars = require("./vars");
const game = require("./game");
const login = require("./login");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");

type PopulationBotCharacter = RuntimeCharacter & {
    id: EntityId;
    nameCharacter: string;
    map: number;
    pos: Position;
    hp?: number;
    maxHp?: number;
    mana?: number;
    maxMana?: number;
    dead?: boolean | number;
    cerrado?: boolean;
    connected?: boolean;
    spells?: Record<string, { idSpell?: number } | undefined>;
};

// Ciudades con coordenadas reales (tomadas de fastTravel.json) para no
// adivinar posiciones a ciegas — son los mismos destinos que ya usa /viaje.
const HUB_CITIES = [
    { name: "Ulla", map: 1, pos: { x: 50, y: 50 } },
    { name: "Nix", map: 34, pos: { x: 50, y: 50 } },
    { name: "Caos", map: 170, pos: { x: 24, y: 78 } },
    { name: "Bander", map: 59, pos: { x: 50, y: 50 } },
] as const;

const BOT_NAMES = [
    "Facu", "Mati", "Tomi", "Naza", "Vale", "Cami", "Bruno", "Santi",
    "Agus", "Fede", "Gonza", "Lauti", "Micaela", "Juanpi", "Rocio", "Tobias",
    "Ivan", "Delfi", "Nico", "Sofi", "Ezequiel", "Male", "Ramiro", "Yamila",
];

const DEFAULT_BOT_COUNT = 24;
const THINK_INTERVAL_MS = 900;
const THINK_JITTER_MS = 400;
const LOCAL_BFS_RADIUS = 24;
const LOCAL_MAX_STEPS_PER_THINK = 4;
const WAYPOINTS_PER_MAP = 5;
const WAYPOINT_MIN_RADIUS = 6;
const WAYPOINT_MAX_RADIUS = 22;
const WAYPOINT_ARRIVE_DISTANCE = 2;
const RESPAWN_GRACE_MS = 1500;
const CHAT_COOLDOWN_MS = 25000;
const CHAT_CHANCE_PER_THINK = 0.03;
const DEFEND_MELEE_RANGE = 1;
const DEFEND_SPELL_RANGE = 9;
// Tope duro de "piensos" (A*/BFS) por tick del loop principal: si varios
// bots quedan escalonados para pensar en el mismo tick, el resto espera al
// siguiente en vez de que todos calculen ruta a la vez (medido en pruebas:
// sin este tope aparecen picos puntuales de ~40ms sobre un presupuesto de
// tick de 50ms).
const MAX_THINKS_PER_TICK = 8;

// Frases escritas directo en tono informal/argentino, sin exagerar - no es
// un algoritmo de "inyectar errores", es contenido curado a mano.
const WANDER_LINES = [
    "aca ando, dando vueltas",
    "que mapa mas grande la verdad",
    "alguien vio un herrero cerca?",
    "voy para el centro",
    "nada q hacer hoy eh",
    "re tranqui el server hoy",
];
const ARRIVE_LINES = [
    "bueno llegue",
    "listo, aca estoy",
    "q lugar copado este",
    "ya llegue, ahora q hago",
];
const ATTACKED_LINES = [
    "eh que haces",
    "posta me estas atacando?",
    "banca q me defiendo",
    "ah asi que asi es la cosa",
    "no te tengo miedo eh",
];
const DEFEATED_LINES = [
    "uh me mataron",
    "posta perdi",
    "bueno ahi voy de nuevo",
];

let botsEnabled = false;
let spawnedOnce = false;

type WaypointNode = { id: string; pos: Position };
type MapGraph = { nodes: WaypointNode[] };

const mapGraphCache = new Map<number, MapGraph>();

function distance(a: Position, b: Position): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function randomFrom<T>(items: readonly T[]): T {
    return items[Math.floor(Math.random() * items.length)] as T;
}

function tryFindNearbyValidPos(
    map: number,
    anchor: Position,
    minRadius: number,
    maxRadius: number,
): Position | null {
    for (let attempt = 0; attempt < 40; attempt++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);
        const pos = {
            x: Math.round(anchor.x + Math.cos(angle) * radius),
            y: Math.round(anchor.y + Math.sin(angle) * radius),
        };

        if (game.validPosRespawn(pos, map, false)) {
            return pos;
        }
    }

    return null;
}

function getOrBuildMapGraph(map: number, anchor: Position): MapGraph {
    const cached = mapGraphCache.get(map);
    if (cached) {
        return cached;
    }

    const nodes: WaypointNode[] = [{ id: "anchor", pos: anchor }];

    for (let i = 0; i < WAYPOINTS_PER_MAP - 1; i++) {
        const pos = tryFindNearbyValidPos(map, anchor, WAYPOINT_MIN_RADIUS, WAYPOINT_MAX_RADIUS);
        if (pos) {
            nodes.push({ id: `w${i}`, pos });
        }
    }

    const graph: MapGraph = { nodes };
    mapGraphCache.set(map, graph);
    return graph;
}

// A* real sobre el grafo chico de waypoints de la ciudad (no sobre la
// grilla completa del mapa) - el "punto A a punto B" fino lo resuelve la
// capa local (BFS) de mas abajo.
function aStarNextWaypoint(graph: MapGraph, fromPos: Position, excludeId?: string): WaypointNode | null {
    const candidates = graph.nodes.filter((node) => node.id !== excludeId);
    if (candidates.length === 0) {
        return null;
    }

    const goalOptions = candidates;
    let best: { node: WaypointNode; path: WaypointNode[] } | null = null;

    for (const goal of goalOptions) {
        const startNode: WaypointNode = { id: "__start__", pos: fromPos };
        const allNodes = [startNode, ...graph.nodes];
        const nodeById = new Map(allNodes.map((node) => [node.id, node]));

        const gScore = new Map<string, number>([[startNode.id, 0]]);
        const fScore = new Map<string, number>([[startNode.id, distance(fromPos, goal.pos)]]);
        const cameFrom = new Map<string, string>();
        const open = new Set<string>([startNode.id]);

        let reached: string | null = null;

        while (open.size > 0) {
            let currentId: string | null = null;
            let bestF = Infinity;
            for (const id of open) {
                const f = fScore.get(id) ?? Infinity;
                if (f < bestF) {
                    bestF = f;
                    currentId = id;
                }
            }
            if (!currentId) {
                break;
            }
            if (currentId === goal.id) {
                reached = currentId;
                break;
            }

            open.delete(currentId);
            const current = nodeById.get(currentId)!;

            for (const neighbor of allNodes) {
                if (neighbor.id === currentId) {
                    continue;
                }
                const tentativeG = (gScore.get(currentId) ?? Infinity) + distance(current.pos, neighbor.pos);
                if (tentativeG < (gScore.get(neighbor.id) ?? Infinity)) {
                    cameFrom.set(neighbor.id, currentId);
                    gScore.set(neighbor.id, tentativeG);
                    fScore.set(neighbor.id, tentativeG + distance(neighbor.pos, goal.pos));
                    open.add(neighbor.id);
                }
            }
        }

        if (reached) {
            const cost = gScore.get(reached) ?? Infinity;
            if (!best || cost < (gScore.get(best.node.id) ?? Infinity)) {
                const path: WaypointNode[] = [];
                let cur: string | undefined = reached;
                while (cur) {
                    const node = nodeById.get(cur);
                    if (node) path.unshift(node);
                    cur = cameFrom.get(cur);
                }
                best = { node: goal, path };
            }
        }
    }

    return best?.node ?? randomFrom(candidates);
}

function posKey(x: number, y: number): string {
    return `${x},${y}`;
}

const HEADING_DELTAS: Array<{ dx: number; dy: number; heading: number }> = [
    { dx: 0, dy: -1, heading: vars.direcciones.up },
    { dx: 0, dy: 1, heading: vars.direcciones.down },
    { dx: 1, dy: 0, heading: vars.direcciones.right },
    { dx: -1, dy: 0, heading: vars.direcciones.left },
];

// BFS acotado (mismo espiritu que el flow-field que ya usan los NPCs, pero
// calculado directo punto-a-punto: cada bot persigue su propio objetivo, no
// tiene sentido compartir cache entre bots como si fuera un solo target).
function localBfsHeadings(map: number, from: Position, to: Position, maxSteps: number): number[] {
    const startKey = posKey(from.x, from.y);
    const visited = new Map<string, { fromKey: string | null; heading: number | null }>();
    visited.set(startKey, { fromKey: null, heading: null });

    const queue: Position[] = [{ x: from.x, y: from.y }];
    let bestKey = startKey;
    let bestDist = distance(from, to);

    let head = 0;
    while (head < queue.length) {
        const current = queue[head++]!;
        const currentKey = posKey(current.x, current.y);

        if (current.x === to.x && current.y === to.y) {
            bestKey = currentKey;
            break;
        }

        if (
            Math.abs(current.x - from.x) >= LOCAL_BFS_RADIUS ||
            Math.abs(current.y - from.y) >= LOCAL_BFS_RADIUS
        ) {
            continue;
        }

        for (const dir of HEADING_DELTAS) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            const key = posKey(nx, ny);
            if (visited.has(key) || !game.legalPos(nx, ny, map, false)) {
                continue;
            }

            visited.set(key, { fromKey: currentKey, heading: dir.heading });
            queue.push({ x: nx, y: ny });

            const d = distance({ x: nx, y: ny }, to);
            if (d < bestDist) {
                bestDist = d;
                bestKey = key;
            }
        }
    }

    const headings: number[] = [];
    let curKey: string | null = bestKey;
    while (curKey && curKey !== startKey) {
        const node = visited.get(curKey);
        if (!node || node.heading === null) {
            break;
        }
        headings.unshift(node.heading);
        curKey = node.fromKey;
    }

    return headings.slice(0, maxSteps);
}

function createInternalBotClient(): RuntimeClient {
    const OPEN = 1;
    const CLOSED = 3;
    const internalClient: RuntimeClient = {
        id: 0,
        OPEN,
        readyState: OPEN,
        bot: true,
        on: () => undefined,
        send: () => undefined,
        close: () => undefined,
        _socket: { remoteAddress: "127.0.0.1" },
    };

    internalClient.close = () => {
        internalClient.readyState = CLOSED;
    };

    return internalClient;
}

function botSay(bot: PopulationBotCharacter, message: string) {
    const client = getClientById(bot.id);
    if (!client) {
        return;
    }

    game.loopArea(client, (target: { isNpc: boolean; id: EntityId }) => {
        if (target.isNpc) {
            return;
        }
        const targetClient = getClientById(target.id);
        if (!targetClient) {
            return;
        }
        handleProtocol.dialog(bot.id, message, bot.nameCharacter, "#c9c9c9", 0, targetClient);
    });
}

function maybeChat(bot: PopulationBotCharacter, now: number, pool: readonly string[]) {
    if ((bot.populationBotNextChatAt ?? 0) > now) {
        return;
    }
    if (Math.random() > CHAT_CHANCE_PER_THINK) {
        return;
    }

    bot.populationBotNextChatAt = now + CHAT_COOLDOWN_MS;
    botSay(bot, randomFrom(pool));
}

async function spawnOneBot(hubIndex: number, ordinal: number): Promise<void> {
    const hub = HUB_CITIES[hubIndex % HUB_CITIES.length]!;
    const client = createInternalBotClient();
    const templateIndex = ordinal % (Array.isArray(vars.charactersPvP) ? vars.charactersPvP.length : 1);
    const spawnPos =
        tryFindNearbyValidPos(hub.map, hub.pos, 1, WAYPOINT_MAX_RADIUS) ?? hub.pos;
    const name = `${randomFrom(BOT_NAMES)}${Math.floor(Math.random() * 90 + 10)}`;

    try {
        await login.connectCharacterPvP(
            client,
            name,
            `population-bot:${Date.now()}:${ordinal}`,
            templateIndex,
            undefined,
            undefined,
            {
                spawn: { mapId: hub.map, x: spawnPos.x, y: spawnPos.y },
                markAsBot: true,
                pvpChar: false,
            },
        );
    } catch (error) {
        funct.dumpError(error);
        return;
    }

    const bot = (vars.personajes as RuntimeCharacters)[client.id!] as PopulationBotCharacter | undefined;
    if (!bot) {
        return;
    }

    bot.populationBot = true;
    bot.populationBotHomeMap = hub.map;
    bot.populationBotNextThinkAt = Date.now() + Math.random() * THINK_INTERVAL_MS;
}

export async function spawnPopulationBots(count: number = DEFAULT_BOT_COUNT): Promise<number> {
    let spawned = 0;
    for (let i = 0; i < count; i++) {
        await spawnOneBot(i % HUB_CITIES.length, i);
        spawned++;
    }
    spawnedOnce = true;
    return spawned;
}

function getAllPopulationBots(): PopulationBotCharacter[] {
    return Object.values(vars.personajes as RuntimeCharacters).filter(
        (target): target is PopulationBotCharacter => Boolean(target?.populationBot),
    );
}

function removePopulationBot(bot: PopulationBotCharacter) {
    const tile = vars.mapData[bot.map]?.[bot.pos.y]?.[bot.pos.x];
    if (tile?.id === bot.id) {
        tile.id = 0;
    }

    for (const target of Object.values(vars.personajes as RuntimeCharacters)) {
        if (!target || target.populationBot || String(target.id) === String(bot.id)) {
            continue;
        }
        const targetClient = getClientById(target.id);
        if (targetClient) {
            handleProtocol.deleteCharacter(bot.id, targetClient);
        }
    }

    const botClient = getClientById(bot.id);
    botClient?.close();

    delete (vars.clients as Record<string, unknown>)[String(bot.id)];
    delete (vars.personajes as Record<string, unknown>)[String(bot.id)];
}

export function despawnAllPopulationBots(): number {
    const bots = getAllPopulationBots();
    bots.forEach(removePopulationBot);
    return bots.length;
}

export function setPopulationBotsEnabled(enabled: boolean): void {
    botsEnabled = enabled;
}

export function isPopulationBotsEnabled(): boolean {
    return botsEnabled;
}

export function hasSpawnedPopulationBots(): boolean {
    return spawnedOnce;
}

function findAttacker(bot: PopulationBotCharacter): { id: EntityId; isNpc: boolean; pos: Position; map: number } | null {
    const attackerId = bot.lastAttackerId;
    if (typeof attackerId === "undefined") {
        return null;
    }

    const npc = vars.npcs[attackerId];
    if (npc && Number(npc.hp ?? 0) > 0) {
        return { id: attackerId, isNpc: true, pos: npc.pos, map: npc.map };
    }

    const user = (vars.personajes as RuntimeCharacters)[String(attackerId)];
    if (user && !user.dead && user.connected && !user.cerrado) {
        return { id: attackerId, isNpc: false, pos: user.pos as Position, map: user.map as number };
    }

    return null;
}

function pickOffensiveSpellId(bot: PopulationBotCharacter): number | null {
    const spells = bot.spells ?? {};
    const known = Object.values(spells)
        .map((slot) => Number(slot?.idSpell ?? 0))
        .filter((id) => id > 0);

    for (const idSpell of known) {
        const datSpell = vars.datSpell[idSpell];
        if (!datSpell) {
            continue;
        }
        const isOffensive = Number(datSpell.minHp ?? 0) > 0 || Number(datSpell.maxHp ?? 0) > 0;
        const manaRequired = Number(datSpell.manaRequired ?? 0);
        if (isOffensive && Number(bot.mana ?? 0) >= manaRequired) {
            return idSpell;
        }
    }

    return null;
}

function defendAgainstAttacker(bot: PopulationBotCharacter, now: number) {
    const attacker = findAttacker(bot);
    if (!attacker || attacker.map !== bot.map) {
        return;
    }

    const dist = Math.max(Math.abs(attacker.pos.x - bot.pos.x), Math.abs(attacker.pos.y - bot.pos.y));

    if (dist > DEFEND_SPELL_RANGE) {
        return;
    }

    maybeChat(bot, now, ATTACKED_LINES);

    const idSpell = Math.random() < 0.6 ? pickOffensiveSpellId(bot) : null;

    if (idSpell) {
        const datSpell = vars.datSpell[idSpell];
        if (attacker.isNpc) {
            game.userSpellNpc(bot.id, attacker.id, idSpell);
        } else {
            game.userSpellUser(bot.id, attacker.id, idSpell);
        }
        bot.mana = Math.max(0, Number(bot.mana ?? 0) - Number(datSpell?.manaRequired ?? 0));
        return;
    }

    if (dist <= DEFEND_MELEE_RANGE) {
        if (attacker.isNpc) {
            game.userDmgNpc(bot.id, attacker.id);
        } else {
            game.userDmgUser(bot.id, attacker.id);
        }
    }
}

function respawnBot(bot: PopulationBotCharacter) {
    const hub = HUB_CITIES.find((h) => h.map === bot.populationBotHomeMap) ?? HUB_CITIES[0]!;
    const spawnPos = tryFindNearbyValidPos(hub.map, hub.pos, 0, WAYPOINT_MAX_RADIUS) ?? hub.pos;

    game.revivirUsuario(bot.id);

    const client = getClientById(bot.id);
    if (client) {
        game.telep(client, hub.map, spawnPos.x, spawnPos.y, "population-bot-respawn");
    }

    bot.populationBotWaypoint = null;
    maybeChat(bot, Date.now(), DEFEATED_LINES);
}

function wanderStep(bot: PopulationBotCharacter, now: number) {
    const hub = HUB_CITIES.find((h) => h.map === bot.populationBotHomeMap);
    if (!hub) {
        return;
    }

    const graph = getOrBuildMapGraph(hub.map, hub.pos);
    let waypoint = bot.populationBotWaypoint ?? null;

    if (!waypoint || distance(bot.pos, waypoint) <= WAYPOINT_ARRIVE_DISTANCE) {
        if (waypoint) {
            maybeChat(bot, now, ARRIVE_LINES);
        }
        const next = aStarNextWaypoint(graph, bot.pos);
        waypoint = next?.pos ?? hub.pos;
        bot.populationBotWaypoint = waypoint;
    }

    const headings = localBfsHeadings(bot.map, bot.pos, waypoint, LOCAL_MAX_STEPS_PER_THINK);
    const queue: PendingMoveCommand[] = bot.pendingMoveQueue ?? [];

    if (queue.length === 0) {
        for (const heading of headings) {
            queue.push({ heading, moveId: 0 });
        }
        bot.pendingMoveQueue = queue;
    }

    maybeChat(bot, now, WANDER_LINES);
}

export function processPopulationBotTick(now: number): void {
    if (!botsEnabled) {
        return;
    }

    let thinksUsed = 0;

    for (const bot of getAllPopulationBots()) {
        if (!bot.connected || bot.cerrado) {
            continue;
        }

        if (bot.dead) {
            if ((bot.populationBotNextThinkAt ?? 0) <= now) {
                bot.populationBotNextThinkAt = now + RESPAWN_GRACE_MS;
                respawnBot(bot);
            }
            continue;
        }

        if ((bot.populationBotNextThinkAt ?? 0) > now) {
            continue;
        }

        if (thinksUsed >= MAX_THINKS_PER_TICK) {
            // Deja el nextThinkAt como esta: lo retoma el proximo tick (50ms
            // despues), no se pierde el turno, solo se corre un poco.
            continue;
        }
        thinksUsed++;

        bot.populationBotNextThinkAt = now + THINK_INTERVAL_MS + Math.random() * THINK_JITTER_MS;

        // Puede haber cruzado de mapa caminando por una salida/portal normal
        // (el mismo mecanismo que usa cualquier jugador) - lo mandamos de
        // vuelta a su ciudad, no queremos bots vagando por mapas ajenos.
        if (bot.map !== bot.populationBotHomeMap) {
            const hub = HUB_CITIES.find((h) => h.map === bot.populationBotHomeMap) ?? HUB_CITIES[0]!;
            const client = getClientById(bot.id);
            if (client) {
                game.telep(client, hub.map, hub.pos.x, hub.pos.y, "population-bot-recall");
            }
            bot.populationBotWaypoint = null;
            continue;
        }

        const recentlyAttacked = now - Number(bot.lastAttackedAt ?? 0) < 4000;
        if (recentlyAttacked) {
            defendAgainstAttacker(bot, now);
        }

        wanderStep(bot, now);
    }
}
