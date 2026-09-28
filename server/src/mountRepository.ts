import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export type MountPerks = {
    level10?: string;
    level20?: string;
    level30?: string;
};

export type MountRoll = {
    level: number;
    kind: "create" | "level";
    npcDamageDelta: number;
    vidaDelta: number;
    meleeAttackDelta: number;
    meleeDefenseDelta: number;
    rangedAttackDelta: number;
    rangedDefenseDelta: number;
    magicAttackDelta: number;
    magicDefenseDelta: number;
    evasionDelta: number;
    createdAt: string;
};

export type MountInstance = {
    id: string;
    typeId: number;
    ownerCharacterId: string;
    name: string;
    level: number;
    exp: number;
    npcDamage: number;
    vida: number;
    meleeAttack: number;
    meleeDefense: number;
    rangedAttack: number;
    rangedDefense: number;
    magicAttack: number;
    magicDefense: number;
    evasion: number;
    freeStatPoints: number;
    perks: MountPerks;
    rollHistory: MountRoll[];
    previousOwners: string[];
    createdAt: string;
    updatedAt: string;
    migratedFromTypeId?: number;
};

type MountStore = {
    schemaVersion: number;
    instances: Record<string, MountInstance>;
};

const DATA_PATH = path.resolve(__dirname, "../data/mountInstances.json");
const SCHEMA_VERSION = 1;
const ASSIGNABLE_STAT_KEYS = [
    "meleeAttack",
    "meleeDefense",
    "rangedAttack",
    "rangedDefense",
    "magicAttack",
    "magicDefense",
    "evasion",
] as const;

function normalizeRollHistory(rawRollHistory: unknown): MountRoll[] {
    if (!Array.isArray(rawRollHistory)) {
        return [];
    }

    return rawRollHistory
        .map((roll): MountRoll | null => {
            if (!roll || typeof roll !== "object") {
                return null;
            }

            const source = roll as Partial<MountRoll>;
            const kind = source.kind === "create" || source.kind === "level" ? source.kind : "level";
            return {
                level: Math.max(1, Math.floor(Number(source.level ?? 1))),
                kind,
                npcDamageDelta: Math.max(0, Math.floor(Number(source.npcDamageDelta ?? 0))),
                vidaDelta: Math.max(0, Math.floor(Number(source.vidaDelta ?? 0))),
                meleeAttackDelta: Math.max(0, Math.floor(Number(source.meleeAttackDelta ?? 0))),
                meleeDefenseDelta: Math.max(0, Math.floor(Number(source.meleeDefenseDelta ?? 0))),
                rangedAttackDelta: Math.max(0, Math.floor(Number(source.rangedAttackDelta ?? 0))),
                rangedDefenseDelta: Math.max(0, Math.floor(Number(source.rangedDefenseDelta ?? 0))),
                magicAttackDelta: Math.max(0, Math.floor(Number(source.magicAttackDelta ?? 0))),
                magicDefenseDelta: Math.max(0, Math.floor(Number(source.magicDefenseDelta ?? 0))),
                evasionDelta: Math.max(0, Math.floor(Number(source.evasionDelta ?? 0))),
                createdAt: String(source.createdAt ?? new Date().toISOString()),
            };
        })
        .filter((roll): roll is MountRoll => Boolean(roll));
}

let loaded = false;
let store: MountStore = {
    schemaVersion: SCHEMA_VERSION,
    instances: {},
};

function normalizeInstance(raw: Partial<MountInstance>): MountInstance | null {
    if (!raw.id || !raw.ownerCharacterId || !Number.isFinite(Number(raw.typeId))) {
        return null;
    }

    const level = Math.max(1, Math.floor(Number(raw.level ?? 1)));
    const rollHistory = normalizeRollHistory(raw.rollHistory);
    const assignableBudget = Math.max(0, level * 2);
    const rawStats = {
        meleeAttack: Math.max(0, Math.floor(Number(raw.meleeAttack ?? 0))),
        meleeDefense: Math.max(0, Math.floor(Number(raw.meleeDefense ?? 0))),
        rangedAttack: Math.max(0, Math.floor(Number(raw.rangedAttack ?? 0))),
        rangedDefense: Math.max(0, Math.floor(Number(raw.rangedDefense ?? 0))),
        magicAttack: Math.max(0, Math.floor(Number(raw.magicAttack ?? 0))),
        magicDefense: Math.max(0, Math.floor(Number(raw.magicDefense ?? 0))),
        evasion: Math.max(0, Math.floor(Number(raw.evasion ?? 0))),
    };
    const rawAssigned = ASSIGNABLE_STAT_KEYS.reduce((sum, key) => sum + rawStats[key], 0);
    const normalizedStats = { ...rawStats };

    if (rawAssigned > assignableBudget && rawAssigned > 0) {
        let assigned = 0;

        for (const key of ASSIGNABLE_STAT_KEYS) {
            const nextValue = Math.floor((rawStats[key] / rawAssigned) * assignableBudget);
            normalizedStats[key] = nextValue;
            assigned += nextValue;
        }

        let remaining = assignableBudget - assigned;
        for (const key of ASSIGNABLE_STAT_KEYS) {
            if (remaining <= 0) {
                break;
            }
            if (rawStats[key] > 0) {
                normalizedStats[key] += 1;
                remaining -= 1;
            }
        }
    }

    const assignedStats = ASSIGNABLE_STAT_KEYS.reduce((sum, key) => sum + normalizedStats[key], 0);
    const storedFreePoints = Math.max(0, Math.floor(Number(raw.freeStatPoints ?? 0)));
    const availableFreePoints = Math.max(0, assignableBudget - assignedStats);
    const freeStatPoints = rawAssigned > assignableBudget
        ? availableFreePoints
        : Number.isFinite(Number(raw.freeStatPoints))
          ? Math.min(storedFreePoints, availableFreePoints)
          : availableFreePoints;
    const storedNpcDamage = Math.max(0, Math.floor(Number(raw.npcDamage ?? 0)));
    const npcDamageFromHistory = rollHistory.reduce(
        (sum, roll) => sum + Math.max(0, Math.floor(Number(roll.npcDamageDelta ?? 0))),
        0,
    );
    const storedVida = Math.max(0, Math.floor(Number(raw.vida ?? 0)));
    const vidaFromHistory = rollHistory.reduce(
        (sum, roll) => sum + Math.max(0, Math.floor(Number(roll.vidaDelta ?? 0))),
        0,
    );

    return {
        id: String(raw.id),
        typeId: Number(raw.typeId),
        ownerCharacterId: String(raw.ownerCharacterId),
        name: String(raw.name ?? "Mascota"),
        level,
        exp: Math.max(0, Math.floor(Number(raw.exp ?? 0))),
        npcDamage: storedNpcDamage > 0 ? storedNpcDamage : npcDamageFromHistory,
        vida: storedVida > 0 ? storedVida : vidaFromHistory,
        meleeAttack: normalizedStats.meleeAttack,
        meleeDefense: normalizedStats.meleeDefense,
        rangedAttack: normalizedStats.rangedAttack,
        rangedDefense: normalizedStats.rangedDefense,
        magicAttack: normalizedStats.magicAttack,
        magicDefense: normalizedStats.magicDefense,
        evasion: normalizedStats.evasion,
        freeStatPoints,
        perks: raw.perks ?? {},
        rollHistory,
        previousOwners: Array.isArray(raw.previousOwners) ? raw.previousOwners.map(String) : [],
        createdAt: String(raw.createdAt ?? new Date().toISOString()),
        updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
        migratedFromTypeId: Number.isFinite(Number(raw.migratedFromTypeId))
            ? Number(raw.migratedFromTypeId)
            : undefined,
    };
}

function loadStore() {
    if (loaded) {
        return;
    }

    loaded = true;

    if (!fs.existsSync(DATA_PATH)) {
        return;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Partial<MountStore>;
        const next: MountStore = {
            schemaVersion: Number(parsed.schemaVersion ?? SCHEMA_VERSION),
            instances: {},
        };

        for (const rawInstance of Object.values(parsed.instances ?? {})) {
            const instance = normalizeInstance(rawInstance);
            if (instance) {
                next.instances[instance.id] = instance;
            }
        }

        store = next;
    } catch {
        store = {
            schemaVersion: SCHEMA_VERSION,
            instances: {},
        };
    }
}

function persistStore() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(store));
}

export function listMountInstancesByOwner(ownerCharacterId: string): MountInstance[] {
    loadStore();
    return Object.values(store.instances).filter(
        (instance) => instance.ownerCharacterId === ownerCharacterId,
    );
}

export function getMountInstance(instanceId: string): MountInstance | null {
    loadStore();
    return store.instances[instanceId] ?? null;
}

export function findMigratedMount(ownerCharacterId: string, typeId: number): MountInstance | null {
    loadStore();
    return (
        Object.values(store.instances).find(
            (instance) =>
                instance.ownerCharacterId === ownerCharacterId &&
                instance.migratedFromTypeId === typeId,
        ) ?? null
    );
}

export function createMountInstance(
    input: Omit<MountInstance, "id" | "createdAt" | "updatedAt"> & { id?: string },
): MountInstance {
    loadStore();
    const now = new Date().toISOString();
    const instance = normalizeInstance({
        ...input,
        id: input.id ?? randomUUID(),
        createdAt: now,
        updatedAt: now,
    });

    if (!instance) {
        throw new Error("Invalid mount instance");
    }

    store.instances[instance.id] = instance;
    persistStore();
    return instance;
}

export function saveMountInstance(instance: MountInstance): void {
    loadStore();
    instance.updatedAt = new Date().toISOString();
    store.instances[instance.id] = instance;
    persistStore();
}

export function deleteMountInstance(instanceId: string, ownerCharacterId?: string): boolean {
    loadStore();
    const instance = store.instances[instanceId];
    if (!instance) {
        return false;
    }
    if (ownerCharacterId && instance.ownerCharacterId !== ownerCharacterId) {
        return false;
    }
    delete store.instances[instanceId];
    persistStore();
    return true;
}

export function transferMountInstance(
    instanceId: string,
    fromOwnerCharacterId: string,
    toOwnerCharacterId: string,
): MountInstance {
    loadStore();
    const instance = store.instances[instanceId];

    if (!instance) {
        throw new Error("La mascota no existe.");
    }

    if (instance.ownerCharacterId !== fromOwnerCharacterId) {
        throw new Error("La mascota no pertenece al personaje actual.");
    }

    instance.previousOwners = Array.from(new Set([...instance.previousOwners, fromOwnerCharacterId]));
    instance.ownerCharacterId = toOwnerCharacterId;
    instance.updatedAt = new Date().toISOString();
    store.instances[instance.id] = instance;
    persistStore();
    return instance;
}
