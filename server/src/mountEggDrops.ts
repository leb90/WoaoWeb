import fs from "node:fs";
import path from "node:path";
import type { DropItem, RuntimeNpc } from "./types/runtime";

const vars = require("./vars");

type MountEggDropEntry = {
    npcId: number;
    npcName?: string;
    mountTypeId: number;
    eggItemId: number;
    chancePercent: number;
};

type MountEggSpawnEntry = {
    npcId: number;
    npcName?: string;
    count?: number;
    maps?: number[];
    mapPool?: string;
    movement?: number;
};

export type MountEggMapPool = {
    rootMap: number;
    excludedMapIds?: number[];
    excludedTags?: string[];
};

type MountEggSpawnConfig = {
    mapPools?: Record<string, MountEggMapPool>;
    spawns?: MountEggSpawnEntry[];
};

type LoadedSpawnConfig = {
    mapPools: Record<string, MountEggMapPool>;
    spawns: MountEggSpawnEntry[];
};

const CONFIG_PATH = path.resolve(__dirname, "../jsons/mountEggDrops.json");
const SPAWN_CONFIG_PATH = path.resolve(__dirname, "../jsons/mountEggSpawns.json");
const DONATION_ONLY_MOUNT_TYPE_IDS = new Set([7, 8]);
const WORLD_EDGE_BAND = 12;

let entriesByNpcId = new Map<number, MountEggDropEntry[]>();
let spawnMapsByPool = new Map<string, number[]>();
const respawnMapsByNpcId = new Map<number, number[]>();

function loadEntries(): MountEggDropEntry[] {
    try {
        const rawEntries = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")) as MountEggDropEntry[];
        return Array.isArray(rawEntries) ? rawEntries : [];
    } catch (error) {
        console.warn(
            `[MountEggDrops] No se pudo leer mountEggDrops.json: ${error instanceof Error ? error.message : "error desconocido"}.`,
        );
        return [];
    }
}

function loadSpawnConfig(): LoadedSpawnConfig {
    try {
        const rawConfig = JSON.parse(fs.readFileSync(SPAWN_CONFIG_PATH, "utf8")) as
            | MountEggSpawnEntry[]
            | MountEggSpawnConfig;

        if (Array.isArray(rawConfig)) {
            return { mapPools: {}, spawns: rawConfig };
        }

        return {
            mapPools: rawConfig?.mapPools && typeof rawConfig.mapPools === "object" ? rawConfig.mapPools : {},
            spawns: Array.isArray(rawConfig?.spawns) ? rawConfig.spawns : [],
        };
    } catch (error) {
        console.warn(
            `[MountEggDrops] No se pudo leer mountEggSpawns.json: ${
                error instanceof Error ? error.message : "error desconocido"
            }.`,
        );
        return { mapPools: {}, spawns: [] };
    }
}

function normalizeMapTag(value: unknown): string {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}

function isCityMap(mapNum: number): boolean {
    const mapData = vars.mapData?.[mapNum];
    const terrain = normalizeMapTag(mapData?.terreno);
    const zone = normalizeMapTag(mapData?.zona);
    return terrain === "CIUDAD" || zone === "CIUDAD";
}

function normalizeTileExitDestinations(tileExit: unknown): Array<{ map: number; x: number; y: number }> {
    let rawDestinations: unknown[] = [];

    if (Array.isArray(tileExit)) {
        rawDestinations = tileExit;
    } else if (
        tileExit &&
        typeof tileExit === "object" &&
        "destinations" in tileExit &&
        Array.isArray((tileExit as { destinations?: unknown[] }).destinations)
    ) {
        rawDestinations = (tileExit as { destinations: unknown[] }).destinations;
    } else if (tileExit && typeof tileExit === "object") {
        rawDestinations = [tileExit];
    }

    return rawDestinations
        .map((destination) => {
            const rawDestination = destination as { map?: unknown; x?: unknown; y?: unknown };
            const map = Math.floor(Number(rawDestination?.map ?? 0));
            const x = Math.floor(Number(rawDestination?.x ?? 0));
            const y = Math.floor(Number(rawDestination?.y ?? 0));

            if (map <= 0 || x <= 0 || y <= 0) {
                return null;
            }

            return { map, x, y };
        })
        .filter((destination): destination is { map: number; x: number; y: number } => Boolean(destination));
}

function isWorldEdgeTransition(x: number, y: number, destination: { x: number; y: number }): boolean {
    const oppositeEdgeStart = 101 - WORLD_EDGE_BAND;

    return (
        (y <= WORLD_EDGE_BAND && destination.y >= oppositeEdgeStart) ||
        (y >= oppositeEdgeStart && destination.y <= WORLD_EDGE_BAND) ||
        (x <= WORLD_EDGE_BAND && destination.x >= oppositeEdgeStart) ||
        (x >= oppositeEdgeStart && destination.x <= WORLD_EDGE_BAND)
    );
}

function getWorldMapNeighbors(mapNum: number): number[] {
    const neighbors = new Set<number>();
    const map = vars.mapa?.[mapNum];

    if (!map) {
        return [];
    }

    for (const [rawY, row] of Object.entries(map)) {
        const y = Number(rawY);

        if (!row || typeof row !== "object") {
            continue;
        }

        for (const [rawX, rawTile] of Object.entries(row as Record<string, unknown>)) {
            const x = Number(rawX);
            const tile = rawTile as { tileExit?: unknown };

            if (!tile?.tileExit) {
                continue;
            }

            for (const destination of normalizeTileExitDestinations(tile.tileExit)) {
                if (destination.map !== mapNum && isWorldEdgeTransition(x, y, destination)) {
                    neighbors.add(destination.map);
                }
            }
        }
    }

    return Array.from(neighbors);
}

function hasDryNpcSpawnTile(mapNum: number): boolean {
    const map = vars.mapa?.[mapNum];

    if (!map) {
        return false;
    }

    const { isWaterTileGraphics } = require("./waterTiles") as {
        isWaterTileGraphics: (graphicLayer1: number, graphicLayer2: number) => boolean;
    };

    for (const row of Object.values(map)) {
        if (!row || typeof row !== "object") {
            continue;
        }

        for (const rawTile of Object.values(row as Record<string, unknown>)) {
            const tile = rawTile as {
                blocked?: number | boolean;
                graphics?: Record<number, number>;
                tileExit?: unknown;
            };
            const graphicLayer1 = Number(tile?.graphics?.[1] ?? 0);
            const graphicLayer2 = Number(tile?.graphics?.[2] ?? 0);

            if (!tile?.blocked && !tile?.tileExit && !isWaterTileGraphics(graphicLayer1, graphicLayer2)) {
                return true;
            }
        }
    }

    return false;
}

export function resolveMapPool(poolName: string, pool: MountEggMapPool): number[] {
    const rootMap = Math.floor(Number(pool.rootMap ?? 0));
    const excludedMapIds = new Set(
        (Array.isArray(pool.excludedMapIds) ? pool.excludedMapIds : [])
            .map((mapId) => Math.floor(Number(mapId ?? 0)))
            .filter((mapId) => mapId > 0),
    );
    const excludedTags = new Set(
        (Array.isArray(pool.excludedTags) ? pool.excludedTags : []).map(normalizeMapTag).filter(Boolean),
    );
    const allowedCache = new Map<number, boolean>();

    const isAllowed = (mapNum: number) => {
        const cached = allowedCache.get(mapNum);
        if (typeof cached === "boolean") {
            return cached;
        }

        const mapData = vars.mapData?.[mapNum];
        const terrain = normalizeMapTag(mapData?.terreno);
        const zone = normalizeMapTag(mapData?.zona);
        const allowed =
            Boolean(mapData) &&
            !isCityMap(mapNum) &&
            !excludedMapIds.has(mapNum) &&
            !excludedTags.has(terrain) &&
            !excludedTags.has(zone) &&
            hasDryNpcSpawnTile(mapNum);

        allowedCache.set(mapNum, allowed);
        return allowed;
    };

    const canTraverse = (mapNum: number) => Boolean(vars.mapData?.[mapNum]) && (isAllowed(mapNum) || isCityMap(mapNum));

    if (rootMap <= 0 || !canTraverse(rootMap)) {
        console.warn(`[MountEggDrops] El pool de mapas "${poolName}" no tiene un mapa raiz valido.`);
        return [];
    }

    const pending = [rootMap];
    const visited = new Set([rootMap]);

    while (pending.length > 0) {
        const currentMap = pending.shift();
        if (!currentMap) {
            continue;
        }

        for (const neighbor of getWorldMapNeighbors(currentMap)) {
            if (visited.has(neighbor) || !canTraverse(neighbor)) {
                continue;
            }

            visited.add(neighbor);
            pending.push(neighbor);
        }
    }

    return Array.from(visited)
        .filter((mapNum) => isAllowed(mapNum))
        .sort((left, right) => left - right);
}

function resolveMapPools(mapPools: Record<string, MountEggMapPool>): Map<string, number[]> {
    const resolved = new Map<string, number[]>();

    for (const [poolName, pool] of Object.entries(mapPools)) {
        const maps = resolveMapPool(poolName, pool);
        resolved.set(poolName, maps);

        if (maps.length > 0) {
            console.log(`[MountEggDrops] Pool "${poolName}": ${maps.length} mapas habilitados (${maps.join(", ")}).`);
        }
    }

    return resolved;
}

function normalizeEntry(entry: MountEggDropEntry): MountEggDropEntry | null {
    const npcId = Math.floor(Number(entry.npcId ?? 0));
    const mountTypeId = Math.floor(Number(entry.mountTypeId ?? 0));
    const eggItemId = Math.floor(Number(entry.eggItemId ?? 0));
    const chancePercent = Number(entry.chancePercent ?? 0);

    if (npcId <= 0 || mountTypeId <= 0 || eggItemId <= 0 || chancePercent <= 0) {
        return null;
    }

    if (DONATION_ONLY_MOUNT_TYPE_IDS.has(mountTypeId)) {
        return null;
    }

    if (!vars.datObj?.[eggItemId]) {
        return null;
    }

    return {
        npcId,
        npcName: entry.npcName,
        mountTypeId,
        eggItemId,
        chancePercent: Math.min(100, chancePercent),
    };
}

function normalizeSpawnEntry(entry: MountEggSpawnEntry): (MountEggSpawnEntry & { maps: number[] }) | null {
    const npcId = Math.floor(Number(entry.npcId ?? 0));
    const poolMaps = entry.mapPool ? (spawnMapsByPool.get(entry.mapPool) ?? []) : [];
    const maps = Array.from(
        new Set([
            ...poolMaps,
            ...(Array.isArray(entry.maps)
                ? entry.maps
                      .map((map) => Math.floor(Number(map ?? 0)))
                      .filter(
                          (map) =>
                              map > 0 &&
                              Boolean(vars.mapData?.[map]) &&
                              !isCityMap(map) &&
                              hasDryNpcSpawnTile(map),
                      )
                : []),
        ]),
    );
    const count = Math.max(1, Math.floor(Number(entry.count ?? 1)));
    const movement = Number.isInteger(Number(entry.movement)) ? Number(entry.movement) : undefined;

    if (npcId <= 0 || maps.length === 0 || !vars.datNpc?.[npcId]) {
        return null;
    }

    return {
        npcId,
        npcName: entry.npcName,
        count,
        maps,
        mapPool: entry.mapPool,
        movement,
    };
}

function pickRandom<T>(values: T[]): T | undefined {
    return values[Math.floor(Math.random() * values.length)];
}

function spawnConfiguredNpcs() {
    const spawnConfig = loadSpawnConfig();
    spawnMapsByPool = resolveMapPools(spawnConfig.mapPools);
    const LoadNpcs = require("./loadNpcs") as {
        new (): {
            createNpcInMap: (
                npc: { mapNum: number; x: number; y: number; npcIndex: number; movement?: number },
                skipRespawnCooldownCheck?: boolean,
                forceRandomSpawn?: boolean,
                preserveInitialPosition?: boolean,
            ) => void;
        };
    };
    const loader = new LoadNpcs();
    let spawned = 0;
    const spawnedByMap = new Map<number, number>();
    respawnMapsByNpcId.clear();

    for (const rawEntry of spawnConfig.spawns) {
        const entry = normalizeSpawnEntry(rawEntry);
        if (!entry) {
            continue;
        }

        respawnMapsByNpcId.set(entry.npcId, entry.maps);

        for (let index = 0; index < (entry.count ?? 1); index++) {
            const mapNum = pickRandom(entry.maps);
            if (!mapNum) {
                continue;
            }

            const npcsBefore = Object.keys(vars.npcs ?? {}).length;
            loader.createNpcInMap(
                {
                    mapNum,
                    x: 50,
                    y: 50,
                    npcIndex: entry.npcId,
                    movement: entry.movement,
                },
                true,
                true,
                false,
            );

            if (Object.keys(vars.npcs ?? {}).length > npcsBefore) {
                spawned++;
                spawnedByMap.set(mapNum, (spawnedByMap.get(mapNum) ?? 0) + 1);
                console.log(`[MountEggDrops] ${entry.npcName || `NPC ${entry.npcId}`} aparecio en el mapa ${mapNum}.`);
            }
        }
    }

    if (spawned > 0) {
        const mapSummary = Array.from(spawnedByMap.entries())
            .sort(([leftMap], [rightMap]) => leftMap - rightMap)
            .map(([mapNum, count]) => `mapa ${mapNum}: ${count}`)
            .join(", ");
        console.log(`[MountEggDrops] Spawneados ${spawned} NPCs de huevos en mapas asignados (${mapSummary}).`);
    }
}

export function initialize() {
    entriesByNpcId = new Map();

    for (const rawEntry of loadEntries()) {
        const entry = normalizeEntry(rawEntry);
        if (!entry) {
            continue;
        }

        const current = entriesByNpcId.get(entry.npcId) ?? [];
        current.push(entry);
        entriesByNpcId.set(entry.npcId, current);
    }

    console.log(`[MountEggDrops] Cargadas ${Array.from(entriesByNpcId.values()).flat().length} reglas.`);
    spawnConfiguredNpcs();
}

export function pickMountRespawnMap(templateNpcIndex: number): number | null {
    const maps = respawnMapsByNpcId.get(Math.floor(Number(templateNpcIndex) || 0));
    if (!maps?.length) {
        return null;
    }

    return pickRandom(maps) ?? null;
}

export function rollMountEggDrops(npc: RuntimeNpc | undefined | null): DropItem[] {
    if (!npc || Number(npc.hostile ?? 0) !== 1) {
        return [];
    }

    const npcId = Math.floor(Number(npc.templateNpcIndex ?? 0));
    if (npcId <= 0) {
        return [];
    }

    const entries = entriesByNpcId.get(npcId) ?? [];
    const drops: DropItem[] = [];

    for (const entry of entries) {
        if (Math.random() * 100 >= entry.chancePercent) {
            continue;
        }

        drops.push({ item: entry.eggItemId, cant: 1, chancePercent: entry.chancePercent });
    }

    return drops;
}

export function getSnapshot() {
    return Array.from(entriesByNpcId.values()).flat();
}
