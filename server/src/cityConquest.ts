import fs from "node:fs";
import path from "node:path";

const handleProtocol = require("./handleProtocol");

type Owner = 1 | 2;

const DATA_PATH = path.resolve(__dirname, "../data/cityOwnership.json");

const INSTANCE_CITIES: Record<number, { name: string; maps: number[] }> = {
    251: { name: "Ullathorpe", maps: [1] },
    252: { name: "Desierto", maps: [20] },
    254: { name: "Lindos", maps: [63, 62, 64] },
    255: { name: "Descanso", maps: [81] },
    256: { name: "Atlantis", maps: [83, 84, 85] },
    257: { name: "Esperanza", maps: [112] },
    258: { name: "Arghal", maps: [150, 151] },
    259: { name: "Quest", maps: [157] },
    260: { name: "Laurana", maps: [183, 184] },
};

const DISPLAY_MAPS = [1, 20, 63, 81, 84, 112, 151, 157, 184];

const owners = new Map<number, Owner>();

function loadOwners() {
    if (!fs.existsSync(DATA_PATH)) {
        return;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Record<string, number>;
        for (const [map, owner] of Object.entries(parsed)) {
            owners.set(Number(map), owner === 2 ? 2 : 1);
        }
    } catch {
        owners.clear();
    }
}

function persistOwners() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    const payload: Record<string, number> = {};
    for (const [map, owner] of owners) {
        payload[String(map)] = owner;
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(payload));
}

function factionOwner(faction?: string): Owner | 0 {
    if (faction === "armada") {
        return 1;
    }
    if (faction === "caos") {
        return 2;
    }
    return 0;
}

export function listCities(): string[] {
    return DISPLAY_MAPS.map((map) => {
        const owner = owners.get(map) === 2 ? "Horda" : "Alianza";
        const name =
            Object.values(INSTANCE_CITIES).find((city) => city.maps.includes(map))?.name ?? `Mapa ${map}`;
        return `${name} (${map}): ${owner}`;
    });
}

export function tryConquer(map: number, attackerFaction?: string) {
    const city = INSTANCE_CITIES[map];
    if (!city) {
        return;
    }

    const next = factionOwner(attackerFaction);
    if (!next) {
        return;
    }

    const current = owners.get(city.maps[0]) ?? 1;
    if (current === next) {
        return;
    }

    for (const cityMap of city.maps) {
        owners.set(cityMap, next);
    }
    persistOwners();

    const ownerName = next === 2 ? "Horda" : "Alianza";
    handleProtocol.consoleToAll(`Conquista> ${city.name} ahora pertenece a la ${ownerName}.`, "#E69500", 1, 0);
}

export function initialize() {
    loadOwners();
    console.log(`[Conquista] Ciudades cargadas: ${owners.size || "defaults Alianza"}`);
}
