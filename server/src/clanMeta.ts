import fs from "node:fs";
import path from "node:path";
import { getProgress, saveProgress } from "./woaoProgress";

const handleProtocol = require("./handleProtocol");
const vars = require("./vars");

type ClanMeta = {
    points: number;
    level: number;
    allies: string[];
    enemies: string[];
};

const DATA_PATH = path.resolve(__dirname, "../data/clanMeta.json");
const store = new Map<string, ClanMeta>();

function emptyMeta(): ClanMeta {
    return { points: 0, level: 1, allies: [], enemies: [] };
}

function loadStore() {
    if (!fs.existsSync(DATA_PATH)) {
        return;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Record<string, ClanMeta>;
        for (const [id, value] of Object.entries(parsed)) {
            store.set(id, { ...emptyMeta(), ...value });
        }
    } catch {
        store.clear();
    }
}

function persistStore() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    const payload: Record<string, ClanMeta> = {};
    for (const [id, value] of store) {
        payload[id] = value;
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(payload));
}

function getMeta(clanId: string) {
    const current = store.get(clanId);
    if (current) {
        return current;
    }

    const created = emptyMeta();
    store.set(clanId, created);
    return created;
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

export function getClanLevel(clanId?: string | null): number {
    if (!clanId) {
        return 1;
    }

    return getMeta(String(clanId)).level;
}

export function isAlliedWith(clanId: string | null | undefined, ownerClanName: string): boolean {
    if (!clanId || !ownerClanName) {
        return false;
    }

    return getMeta(String(clanId)).allies.includes(ownerClanName.trim().toLowerCase());
}

export function applyReputation(clanId: string | null | undefined, delta: number): void {
    if (!clanId || !delta) {
        return;
    }

    const meta = getMeta(String(clanId));
    meta.points = Math.max(0, meta.points + delta);
    if (delta > 0 && meta.points >= meta.level * 500) {
        meta.level += 1;
        handleProtocol.consoleToAll(`Clan> un clan subio al nivel ${meta.level}.`, "#E69500", 1, 0);
    }
    persistStore();
}

export function describeClan(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user?.clanId) {
        return { ok: false, message: "No perteneces a un clan." };
    }

    const meta = getMeta(String(user.clanId));
    const progress = getProgress(user);
    return {
        ok: true,
        message: `${user.clan || "Clan"} nivel ${meta.level} puntos ${meta.points}. Tus PClan: ${progress.pClan}. Aliados: ${meta.allies.join(", ") || "ninguno"}. En guerra: ${meta.enemies.join(", ") || "ninguno"}.`,
    };
}

export function declareRelation(idUser: string, targetClanName: string, kind: "war" | "ally") {
    const user = vars.personajes[idUser];
    if (!user?.clanId || user.clanRole !== "leader") {
        return { ok: false, message: "Solo el lider del clan puede declarar guerra o alianza." };
    }

    const targetName = targetClanName.trim().toLowerCase();
    if (!targetName) {
        return { ok: false, message: "Indica el nombre del clan." };
    }

    const meta = getMeta(String(user.clanId));
    const list = kind === "war" ? meta.enemies : meta.allies;
    const other = kind === "war" ? meta.allies : meta.enemies;
    if (!list.includes(targetName)) {
        list.push(targetName);
    }
    const otherIndex = other.indexOf(targetName);
    if (otherIndex >= 0) {
        other.splice(otherIndex, 1);
    }
    persistStore();
    return {
        ok: true,
        message: kind === "war" ? `Declaraste guerra a ${targetClanName}.` : `Declaraste alianza con ${targetClanName}.`,
    };
}

export function onPlayerKill(attackerId: string, victimId: string) {
    const attacker = vars.personajes[attackerId];
    const victim = vars.personajes[victimId];
    if (!attacker?.clanId || !victim?.clanId || String(attacker.clanId) === String(victim.clanId)) {
        return;
    }

    const attackerMeta = getMeta(String(attacker.clanId));
    attackerMeta.points += 1;
    if (attackerMeta.points >= attackerMeta.level * 500) {
        attackerMeta.level += 1;
        handleProtocol.consoleToAll(`Clan> ${attacker.clan} subio al nivel ${attackerMeta.level}.`, "#E69500", 1, 0);
    }
    persistStore();

    const progress = getProgress(attacker);
    progress.pClan += 1;
    attacker.pClan = progress.pClan;
    saveProgress(attacker);
    tell(String(attackerId), "Has sumado 1 punto al clan.");
}

export function initialize() {
    loadStore();
}
