import fs from "node:fs";
import path from "node:path";

export type QuestProgress = {
    questIndex: number;
    npcsKilled: number[];
};

export type MountProgress = {
    nivel: number;
    exp: number;
    elu: number;
    vida: number;
    golpe: number;
    name: string;
};

// Objeto que hay que entregarle al personaje la próxima vez que entre o
// tenga lugar en el inventario (por ejemplo un diseño personalizado).
export type PendingDelivery = {
    objIndex: number;
    amount: number;
    reason: string;
    createdAt: number;
    rarity?: number;
};

export type WoaoProgress = {
    puntosCanje: number;
    puntosDonacion: number;
    quests: QuestProgress[];
    done: number[];
    lastQuestOffer: number;
    mounts: Record<string, MountProgress>;
    activeMountInstanceId: string;
    mountMigrationVersion: number;
    elo: number;
    pClan: number;
    houseKeys: number[];
    pendingDeliveries: PendingDelivery[];
    // Cobros de diseños personalizados por id de pedido: si la api reintenta
    // el mismo pedido no se cobra dos veces.
    designCharges?: Record<string, { points: number; slot: string; productName: string; at: number }>;
    // Ítems de mazmorra (dungeons.ts), para siempre: "patas_de_rana" deja nadar por el agua profunda.
    dungeonItems?: string[];
};

const DATA_PATH = path.resolve(__dirname, "../data/woaoProgress.json");
const MAX_QUESTS = 3;

const store = new Map<string, WoaoProgress>();
let loaded = false;

function emptyProgress(): WoaoProgress {
    return {
        puntosCanje: 0,
        puntosDonacion: 0,
        quests: [],
        done: [],
        lastQuestOffer: 0,
        mounts: {},
        activeMountInstanceId: "",
        mountMigrationVersion: 0,
        elo: 300,
        pClan: 0,
        houseKeys: [],
        pendingDeliveries: [],
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
        const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Record<string, WoaoProgress>;
        for (const [id, value] of Object.entries(parsed)) {
            store.set(id, {
                ...emptyProgress(),
                ...value,
                quests: Array.isArray(value.quests) ? value.quests : [],
                done: Array.isArray(value.done) ? value.done : [],
                mounts: value.mounts ?? {},
                activeMountInstanceId:
                    typeof value.activeMountInstanceId === "string" ? value.activeMountInstanceId : "",
                mountMigrationVersion: Number(value.mountMigrationVersion ?? 0),
                houseKeys: Array.isArray(value.houseKeys) ? value.houseKeys : [],
                pendingDeliveries: Array.isArray(value.pendingDeliveries) ? value.pendingDeliveries : [],
            });
        }
    } catch {
        store.clear();
    }
}

function persistStore() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    const payload: Record<string, WoaoProgress> = {};
    for (const [id, value] of store) {
        payload[id] = value;
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(payload));
}

export function getCharacterKey(user: { _id?: unknown; id?: unknown }): string {
    return String(user._id ?? user.id ?? "");
}

export function getProgress(user: { _id?: unknown; id?: unknown }): WoaoProgress {
    loadStore();
    const key = getCharacterKey(user);
    if (!key) {
        return emptyProgress();
    }

    const current = store.get(key);
    if (current) {
        return current;
    }

    const created = emptyProgress();
    store.set(key, created);
    return created;
}

export function saveProgress(user: { _id?: unknown; id?: unknown }): void {
    loadStore();
    const key = getCharacterKey(user);
    if (!key) {
        return;
    }

    persistStore();
}

export function hydrateUser(user: {
    _id?: unknown;
    id?: unknown;
    puntosCanje?: number;
    puntosDonacion?: number;
    questStats?: WoaoProgress;
    elo?: number;
    pClan?: number;
}): void {
    const progress = getProgress(user);
    user.puntosCanje = progress.puntosCanje;
    user.puntosDonacion = progress.puntosDonacion;
    user.questStats = progress;
    user.elo = progress.elo;
    user.pClan = progress.pClan;
}

export { MAX_QUESTS };
