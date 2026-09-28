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

const CONFIG_PATH = path.resolve(__dirname, "../jsons/mountEggDrops.json");
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
