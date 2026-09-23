import fs from "fs";
import path from "path";
import type { EntityId, Position, RuntimeClient, RuntimeNpc } from "./types/runtime";

export {};

const vars = require("./vars");
const game = require("./game");
const npcs = require("./npcs");
const login = require("./login");
const socket = require("./socket");
const handleProtocol = require("./handleProtocol");

const STATE_PATH = path.resolve(__dirname, "../jsons/bossEvents.json");
const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

type BossEventKey = "mummyPharaoh" | "gollum";

type BossEventConfig = {
    key: BossEventKey;
    label: string;
    npcIndex: number;
    expectedTemplateNames: string[];
    intervalMs: number;
    defaultSpawn: { map: number; x: number; y: number };
    despawnMs?: number;
    spawnMessage: string;
    despawnMessage?: string;
};

type BossEventState = {
    nextSpawnAt: number;
    activeNpcId?: EntityId;
    spawnedAt?: number;
    despawnAt?: number;
};

type BossEventsState = Record<BossEventKey, BossEventState>;

const BOSS_EVENTS: Record<BossEventKey, BossEventConfig> = {
    mummyPharaoh: {
        key: "mummyPharaoh",
        label: "Momia Faraon",
        npcIndex: 611,
        expectedTemplateNames: ["Momia Faraon", "Momia Faraón"],
        intervalMs: 6 * HOUR_MS,
        defaultSpawn: { map: 182, x: 47, y: 30 },
        spawnMessage:
            "Se ha invocado el Faraon en las piramides. Deberas superar el laberinto para llegar a el.",
    },
    gollum: {
        key: "gollum",
        label: "Gollum",
        npcIndex: 594,
        expectedTemplateNames: ["Gollum"],
        intervalMs: 4 * HOUR_MS,
        despawnMs: 30 * MINUTE_MS,
        defaultSpawn: { map: 175, x: 52, y: 35 },
        spawnMessage: "Gollum aparecio en el mundo. Tienes 30 minutos para derrotarlo.",
        despawnMessage: "Gollum desaparecio entre las sombras.",
    },
};

const bossAliases: Record<string, BossEventKey> = {
    momia: "mummyPharaoh",
    faraon: "mummyPharaoh",
    mummy: "mummyPharaoh",
    mummypharaoh: "mummyPharaoh",
    momiafaraon: "mummyPharaoh",
    gollum: "gollum",
};

let initialized = false;
let canonicalNpcTemplates: Record<string, any> | null = null;
let state: BossEventsState = {
    mummyPharaoh: { nextSpawnAt: 0 },
    gollum: { nextSpawnAt: 0 },
};

function now() {
    return Date.now();
}

function normalizeBossKey(input: string | undefined): BossEventKey | null {
    const normalized = String(input ?? "")
        .trim()
        .toLocaleLowerCase("es-AR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z]/g, "");

    return bossAliases[normalized] ?? null;
}

function normalizeName(value: unknown) {
    return String(value ?? "")
        .trim()
        .toLocaleLowerCase("es-AR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function templateNameMatches(datNpc: any, config: BossEventConfig) {
    const templateName = normalizeName(datNpc?.name);

    return config.expectedTemplateNames.some((name) => normalizeName(name) === templateName);
}

function loadCanonicalNpcTemplates() {
    if (canonicalNpcTemplates) {
        return canonicalNpcTemplates;
    }

    const canonicalPath = path.resolve(__dirname, "../../api/src/jsons/npcs.json");

    try {
        canonicalNpcTemplates = JSON.parse(fs.readFileSync(canonicalPath, "utf8")) as Record<string, any>;
    } catch (error) {
        console.warn(
            `[BOSS EVENTS] No se pudo leer npcs.json canonico: ${error instanceof Error ? error.message : "error desconocido"}.`,
        );
        canonicalNpcTemplates = {};
    }

    return canonicalNpcTemplates;
}

function getBossNpcTemplate(config: BossEventConfig) {
    const currentTemplate = vars.datNpc[config.npcIndex];

    if (templateNameMatches(currentTemplate, config)) {
        return currentTemplate;
    }

    const canonicalTemplate = loadCanonicalNpcTemplates()[String(config.npcIndex)];

    if (templateNameMatches(canonicalTemplate, config)) {
        return canonicalTemplate;
    }

    return currentTemplate;
}

function createInitialEventState(config: BossEventConfig, currentTime = now()): BossEventState {
    return { nextSpawnAt: currentTime + config.intervalMs };
}

function normalizeState(raw: Partial<BossEventsState> | null | undefined): BossEventsState {
    const currentTime = now();

    return {
        mummyPharaoh: {
            ...createInitialEventState(BOSS_EVENTS.mummyPharaoh, currentTime),
            ...(raw?.mummyPharaoh ?? {}),
        },
        gollum: {
            ...createInitialEventState(BOSS_EVENTS.gollum, currentTime),
            ...(raw?.gollum ?? {}),
        },
    };
}

function persistState() {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function loadState() {
    try {
        if (!fs.existsSync(STATE_PATH)) {
            state = normalizeState(null);
            persistState();
            return;
        }

        state = normalizeState(JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as Partial<BossEventsState>);
    } catch (error) {
        console.warn(
            `[BOSS EVENTS] No se pudo leer bossEvents.json: ${error instanceof Error ? error.message : "error desconocido"}.`,
        );
        state = normalizeState(null);
    }
}

function getActiveBoss(config: BossEventConfig): RuntimeNpc | undefined {
    return (Object.values(vars.npcs ?? {}) as RuntimeNpc[]).find((npc) => {
        if (!npc?.isNpc) {
            return false;
        }

        if (String(npc.bossEventKey ?? "") === config.key) {
            return true;
        }

        return Number(npc.templateNpcIndex ?? 0) === config.npcIndex && Number(npc.bossEventManaged ?? 0) === 1;
    }) as RuntimeNpc | undefined;
}

function sendNpcToVisibleClients(npc: RuntimeNpc) {
    game.loopAreaPos(npc.map, npc.pos, (target: { id: EntityId }) => {
        const targetClient = vars.clients[target.id] as RuntimeClient | undefined;

        if (!targetClient) {
            return;
        }

        handleProtocol.sendNpc(npc);
        socket.send(targetClient);
    });
}

function deleteNpcFromVisibleClients(npc: RuntimeNpc) {
    const visibleIds = new Set<EntityId>();

    for (const id of (vars.areaNpc[npc.id] ?? []) as EntityId[]) {
        visibleIds.add(id);
    }

    game.loopAreaPos(npc.map, npc.pos, (target: { id: EntityId }) => {
        visibleIds.add(target.id);
    });

    for (const id of visibleIds) {
        const targetClient = vars.clients[id] as RuntimeClient | undefined;

        if (!targetClient) {
            continue;
        }

        handleProtocol.deleteCharacter(npc.id, targetClient);
    }
}

function isValidSpawn(map: number, pos: Position, datNpc: any) {
    return game.validInitialNpcSpawn(
        pos,
        map,
        Boolean(datNpc.aguaValida),
        Number(datNpc.movement ?? 0),
        Boolean(datNpc.tierraInvalida),
    );
}

function findNearbySpawnPosition(map: number, origin: Position, datNpc: any): Position | null {
    for (let radius = 1; radius <= 4; radius++) {
        for (let y = origin.y - radius; y <= origin.y + radius; y++) {
            for (let x = origin.x - radius; x <= origin.x + radius; x++) {
                const pos = { x, y };

                if (Math.abs(origin.x - x) !== radius && Math.abs(origin.y - y) !== radius) {
                    continue;
                }

                if (isValidSpawn(map, pos, datNpc)) {
                    return pos;
                }
            }
        }
    }

    return null;
}

function resolveSpawnPosition(config: BossEventConfig, override?: { map?: number; pos?: Position }) {
    const datNpc = getBossNpcTemplate(config);
    const map = Number(override?.map ?? config.defaultSpawn.map);
    const preferredPos = override?.pos ?? { x: config.defaultSpawn.x, y: config.defaultSpawn.y };

    if (vars.mapData[map] && isValidSpawn(map, preferredPos, datNpc)) {
        return { map, pos: preferredPos };
    }

    if (vars.mapData[map] && override?.pos) {
        const nearbyPos = findNearbySpawnPosition(map, preferredPos, datNpc);

        if (nearbyPos) {
            return { map, pos: nearbyPos };
        }
    }

    const fallback = game.respawnNpc(map, Boolean(datNpc.aguaValida), Boolean(datNpc.tierraInvalida));
    return { map, pos: { x: fallback.posNewX, y: fallback.posNewY } };
}

function spawnBoss(config: BossEventConfig, options?: { map?: number; pos?: Position; announce?: boolean }) {
    const active = getActiveBoss(config);

    if (active) {
        state[config.key].activeNpcId = active.id;
        state[config.key].nextSpawnAt = 0;
        persistState();
        return active;
    }

    const datNpc = getBossNpcTemplate(config);

    if (!datNpc) {
        console.warn(`[BOSS EVENTS] No existe el template NPC ${config.npcIndex} para ${config.label}.`);
        return null;
    }

    const spawn = resolveSpawnPosition(config, options);
    const npc = npcs.createNpc() as RuntimeNpc;
    const currentTime = now();

    npc.id = login.createId();
    npc.templateNpcIndex = config.npcIndex;
    npc.bossEventKey = config.key;
    npc.bossEventManaged = 1;
    npc.spawnMapNum = spawn.map;
    npc.spawnOrigin = { ...spawn.pos };
    npc.map = spawn.map;
    npc.pos = { ...spawn.pos };
    npc.nameCharacter = datNpc.name;
    npc.color = "white";
    npc.isNpc = true;
    npc.idBody = datNpc.idBody;
    npc.idHead = datNpc.idHead;
    npc.movement = datNpc.movement;
    npc.npcType = Number.parseInt(String(datNpc.npcType ?? 0), 10);
    npc.exp = datNpc.exp ?? 0;
    npc.gold = datNpc.gold ?? 0;
    npc.hp = datNpc.hp ?? datNpc.maxHp ?? 1;
    npc.maxHp = datNpc.maxHp ?? datNpc.hp ?? 1;
    npc.minHit = datNpc.minHit ?? 0;
    npc.maxHit = datNpc.maxHit ?? 0;
    npc.def = datNpc.def ?? 0;
    npc.defM = datNpc.defM ?? datNpc.magicDef ?? 0;
    npc.magicDef = datNpc.magicDef ?? datNpc.defM ?? 0;
    npc.magicResistance = datNpc.magicResistance ?? 0;
    npc.poderAtaque = datNpc.poderAtaque ?? 0;
    npc.poderEvasion = datNpc.poderEvasion ?? 0;
    npc.snd1 = datNpc.snd1 ?? 0;
    npc.snd2 = datNpc.snd2 ?? 0;
    npc.soundClose = datNpc.soundClose ?? 0;
    npc.spellCastIntervalMs = datNpc.spellCastIntervalMs ?? 0;
    npc.spellRange = datNpc.spellRange ?? 0;
    npc.spells = Array.isArray(datNpc.spells)
        ? datNpc.spells
              .filter((spell: { idSpell?: number }) => Number(spell?.idSpell ?? 0) > 0)
              .map((spell: { idSpell?: number; cooldownSeconds?: number }) => ({
                  idSpell: Number(spell.idSpell),
                  cooldownSeconds: Math.max(0, Number(spell.cooldownSeconds ?? 0)),
                  lastUsedAt: 0,
              }))
        : [];
    npc.drop = Array.isArray(datNpc.drop) ? datNpc.drop : [];
    npc.objs = datNpc.objs ?? [];
    npc.aguaValida = datNpc.aguaValida ?? 0;
    npc.tierraInvalida = datNpc.tierraInvalida ?? 0;
    npc.desc = datNpc.desc ?? "";
    npc.cooldownAtaque = currentTime + 4000;
    npc.nextThinkAt = currentTime + vars.timing.npcThinkMs;

    const clan = vars.clanNpc[npc.npcType as number];

    if (clan) {
        npc.clan = clan;
    }

    vars.npcs[npc.id] = npc;
    vars.areaNpc[npc.id] = [];
    vars.mapData[npc.map][npc.pos.y][npc.pos.x].id = npc.id;

    state[config.key] = {
        nextSpawnAt: 0,
        activeNpcId: npc.id,
        spawnedAt: currentTime,
        despawnAt: config.despawnMs ? currentTime + config.despawnMs : 0,
    };
    persistState();

    sendNpcToVisibleClients(npc);

    if (options?.announce !== false) {
        handleProtocol.consoleToAll(config.spawnMessage, "#E69500", 1, 0);
    }

    return npc;
}

function scheduleNext(config: BossEventConfig, currentTime = now()) {
    state[config.key] = {
        nextSpawnAt: currentTime + config.intervalMs,
    };
    persistState();
}

function despawnActive(config: BossEventConfig, reason: "expired" | "admin" = "expired") {
    const active = getActiveBoss(config);

    if (!active) {
        scheduleNext(config);
        return false;
    }

    deleteNpcFromVisibleClients(active);

    const tile = vars.mapData[active.map]?.[active.pos?.y]?.[active.pos?.x];

    if (tile?.id === active.id) {
        tile.id = 0;
    }

    delete vars.npcs[active.id];
    delete vars.areaNpc[active.id];
    scheduleNext(config);

    if (reason === "expired" && config.despawnMessage) {
        handleProtocol.consoleToAll(config.despawnMessage, "#E69500", 1, 0);
    }

    return true;
}

function tickEvent(config: BossEventConfig, currentTime = now()) {
    const active = getActiveBoss(config);

    if (active) {
        const eventState = state[config.key];
        const stateChanged = eventState.activeNpcId !== active.id || eventState.nextSpawnAt !== 0;

        eventState.activeNpcId = active.id;
        eventState.nextSpawnAt = 0;

        const despawnAt = Number(eventState.despawnAt ?? 0);

        if (config.despawnMs && despawnAt > 0 && currentTime >= despawnAt) {
            despawnActive(config, "expired");
            return;
        }

        if (stateChanged) {
            persistState();
        }
        return;
    }

    if (state[config.key].activeNpcId || state[config.key].despawnAt) {
        scheduleNext(config, currentTime);
        return;
    }

    if (!state[config.key].nextSpawnAt) {
        state[config.key].nextSpawnAt = currentTime + config.intervalMs;
        persistState();
        return;
    }

    if (currentTime >= state[config.key].nextSpawnAt) {
        spawnBoss(config);
    }
}

function initialize() {
    if (initialized) {
        return;
    }

    initialized = true;
    loadState();
    tick();
}

function tick() {
    if (!initialized) {
        return;
    }

    tickEvent(BOSS_EVENTS.mummyPharaoh);
    tickEvent(BOSS_EVENTS.gollum);
}

function onNpcDied(npc: RuntimeNpc | undefined) {
    const key = normalizeBossKey(String(npc?.bossEventKey ?? ""));

    if (!key) {
        return false;
    }

    scheduleNext(BOSS_EVENTS[key]);
    return true;
}

function forceSpawn(key: BossEventKey, options?: { nearUser?: RuntimeNpc | { map: number; pos: Position } }) {
    const config = BOSS_EVENTS[key];
    const nearUser = options?.nearUser;

    return spawnBoss(config, nearUser ? { map: nearUser.map, pos: nearUser.pos, announce: true } : { announce: true });
}

function forceDespawn(key: BossEventKey) {
    return despawnActive(BOSS_EVENTS[key], "admin");
}

function resetTimer(key: BossEventKey) {
    scheduleNext(BOSS_EVENTS[key]);
}

function formatRemaining(ms: number) {
    const remaining = Math.max(0, ms);
    const totalSeconds = Math.ceil(remaining / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
}

function getSnapshot() {
    const currentTime = now();

    return Object.values(BOSS_EVENTS).map((config) => {
        const eventState = state[config.key];
        const active = getActiveBoss(config);

        return {
            key: config.key,
            label: config.label,
            npcIndex: config.npcIndex,
            activeNpcId: active?.id ?? null,
            map: active?.map ?? config.defaultSpawn.map,
            pos: active?.pos ?? { x: config.defaultSpawn.x, y: config.defaultSpawn.y },
            nextSpawnAt: eventState.nextSpawnAt || null,
            remaining: eventState.nextSpawnAt ? formatRemaining(eventState.nextSpawnAt - currentTime) : "vivo",
            despawnAt: eventState.despawnAt || null,
            despawnRemaining:
                active && eventState.despawnAt ? formatRemaining(eventState.despawnAt - currentTime) : null,
        };
    });
}

module.exports = {
    initialize,
    tick,
    onNpcDied,
    normalizeBossKey,
    forceSpawn,
    forceDespawn,
    resetTimer,
    getSnapshot,
};
