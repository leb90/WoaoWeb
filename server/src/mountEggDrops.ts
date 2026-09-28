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
    maps: number[];
    movement?: number;
};

const CONFIG_PATH = path.resolve(__dirname, "../jsons/mountEggDrops.json");
const SPAWN_CONFIG_PATH = path.resolve(__dirname, "../jsons/mountEggSpawns.json");
const DONATION_ONLY_MOUNT_TYPE_IDS = new Set([7, 8]);

let entriesByNpcId = new Map<number, MountEggDropEntry[]>();

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

function loadSpawnEntries(): MountEggSpawnEntry[] {
    try {
        const rawEntries = JSON.parse(fs.readFileSync(SPAWN_CONFIG_PATH, "utf8")) as MountEggSpawnEntry[];
        return Array.isArray(rawEntries) ? rawEntries : [];
    } catch (error) {
        console.warn(
            `[MountEggDrops] No se pudo leer mountEggSpawns.json: ${
                error instanceof Error ? error.message : "error desconocido"
            }.`,
        );
        return [];
    }
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

function normalizeSpawnEntry(entry: MountEggSpawnEntry): MountEggSpawnEntry | null {
    const npcId = Math.floor(Number(entry.npcId ?? 0));
    const maps = Array.isArray(entry.maps)
        ? entry.maps
              .map((map) => Math.floor(Number(map ?? 0)))
              .filter((map) => map > 0 && Boolean(vars.mapData?.[map]))
        : [];
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
        movement,
    };
}

function pickRandom<T>(values: T[]): T | undefined {
    return values[Math.floor(Math.random() * values.length)];
}

function spawnConfiguredNpcs() {
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

    for (const rawEntry of loadSpawnEntries()) {
        const entry = normalizeSpawnEntry(rawEntry);
        if (!entry) {
            continue;
        }

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
