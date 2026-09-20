import fs from "node:fs";
import path from "node:path";

const handleProtocol = require("./handleProtocol");
const vars = require("./vars");

type CastleId = "norte" | "sur" | "este" | "oeste" | "fortaleza";

type CastleRecord = {
    clanName: string;
    clanId: string;
    conqueredAt: number;
};

type CastleUser = {
    id?: string | number;
    nameCharacter?: string;
    clan?: string;
    clanId?: string | null;
    clanRole?: string | null;
    map?: number;
    hp?: number;
    maxHp?: number;
    privileges?: number;
    jailMinutes?: number;
    dead?: number | boolean;
};

type CastleNpc = {
    nameCharacter?: string;
    npcType?: number;
    map?: number;
    templateNpcIndex?: number;
};

const DATA_PATH = path.resolve(__dirname, "../data/castleOwnership.json");
const SAFE_MAP = 34;
const SAFE_POS = { x: 50, y: 50 };
const CASTLE_NPC_TYPES = new Set([33, 61, 77, 78]);
const KING_NPC_TYPE = 33;
const FORTRESS_DEFENDER_TYPE = 61;

const CASTLES: Record<
    CastleId,
    {
        label: string;
        maps: number[];
        innerMaps: number[];
        announce: string;
        basePoints: number;
    }
> = {
    norte: {
        label: "Castillo Norte",
        maps: [166, 268],
        innerMaps: [166],
        announce: "HA CONQUISTADO EL CASTILLO NORTE",
        basePoints: 10,
    },
    sur: {
        label: "Castillo Sur",
        maps: [167, 269],
        innerMaps: [167],
        announce: "HA CONQUISTADO EL CASTILLO SUR",
        basePoints: 10,
    },
    este: {
        label: "Castillo Este",
        maps: [168, 270],
        innerMaps: [168],
        announce: "HA CONQUISTADO EL CASTILLO ESTE",
        basePoints: 10,
    },
    oeste: {
        label: "Castillo Oeste",
        maps: [169, 271],
        innerMaps: [169],
        announce: "HA CONQUISTADO EL CASTILLO OESTE",
        basePoints: 10,
    },
    fortaleza: {
        label: "Fortaleza",
        maps: [185, 186],
        innerMaps: [185],
        announce: "HA CONQUISTADO LA FORTALEZA",
        basePoints: 15,
    },
};

const CASTLE_IDS: CastleId[] = ["norte", "sur", "este", "oeste"];
const owners = new Map<CastleId, CastleRecord>();

function emptyCastle(): CastleRecord {
    return { clanName: "", clanId: "", conqueredAt: 0 };
}

function normalizeClanName(value?: string | null): string {
    return String(value ?? "")
        .trim()
        .toLowerCase();
}

function formatOwnedSince(conqueredAt: number): string {
    if (!conqueredAt) {
        return "sin fecha";
    }

    const date = new Date(conqueredAt);
    const day = date.toLocaleDateString("es-AR");
    const hour = date.toLocaleTimeString("es-AR", { hour12: false });
    return `${day} ${hour}`;
}

function loadOwners() {
    if (!fs.existsSync(DATA_PATH)) {
        return;
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")) as Record<string, Partial<CastleRecord>>;
        for (const id of Object.keys(CASTLES) as CastleId[]) {
            const value = parsed[id];
            if (!value) {
                continue;
            }
            owners.set(id, {
                clanName: String(value.clanName ?? ""),
                clanId: String(value.clanId ?? ""),
                conqueredAt: Number(value.conqueredAt ?? 0),
            });
        }
    } catch {
        owners.clear();
    }
}

function persistOwners() {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    const payload: Record<string, CastleRecord> = {};
    for (const id of Object.keys(CASTLES) as CastleId[]) {
        payload[id] = owners.get(id) ?? emptyCastle();
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2));
}

function getCastle(id: CastleId): CastleRecord {
    return owners.get(id) ?? emptyCastle();
}

function castleIdByMap(mapId: number): CastleId | undefined {
    return (Object.keys(CASTLES) as CastleId[]).find((id) => CASTLES[id].maps.includes(mapId));
}

function isCastleTerrainMap(mapId: number): boolean {
    const terreno = String(vars.mapData?.[mapId]?.terreno ?? "").toUpperCase();
    const zona = String(vars.mapData?.[mapId]?.zona ?? "").toUpperCase();
    return terreno === "CASTILLO" || zona === "CASTILLO";
}

function isFortressMap(mapId: number): boolean {
    return CASTLES.fortaleza.maps.includes(mapId);
}

function isCastleDefenderNpc(npc: CastleNpc | undefined): boolean {
    if (!npc) {
        return false;
    }

    const npcType = Number(npc.npcType ?? 0);
    if (CASTLE_NPC_TYPES.has(npcType)) {
        return true;
    }

    const name = String(npc.nameCharacter ?? "").toLowerCase();
    return name === "rey del castillo" || name === "defensor fortaleza" || name === "puerta castillo";
}

function sameClan(user: CastleUser | undefined, record: CastleRecord): boolean {
    if (!user || !record.clanName) {
        return false;
    }

    if (user.clanId && record.clanId && String(user.clanId) === String(record.clanId)) {
        return true;
    }

    return Boolean(user.clan && normalizeClanName(user.clan) === normalizeClanName(record.clanName));
}

function isAlliedToCastle(user: CastleUser | undefined, record: CastleRecord): boolean {
    if (!user?.clanId || !record.clanName) {
        return false;
    }

    return require("./clanMeta").isAlliedWith(String(user.clanId), record.clanName);
}

function countClanMembersOnMap(mapId: number, clanName: string, clanId?: string | null): number {
    const expectedName = normalizeClanName(clanName);
    if (!expectedName && !clanId) {
        return 0;
    }

    return Object.values(vars.personajes ?? {}).filter((character: any) => {
        if (!character || Number(character.map) !== mapId || character.cerrado || !character.connected) {
            return false;
        }

        if (clanId && character.clanId && String(character.clanId) === String(clanId)) {
            return true;
        }

        return normalizeClanName(character.clan) === expectedName;
    }).length;
}

function occupancyLimit(clanId?: string | null): number {
    const level = Math.max(1, Number(require("./clanMeta").getClanLevel(clanId) ?? 1));
    return Math.min(8, 2 + level);
}

function countOnlineClanMembers(clanId?: string | null, clanName?: string): number {
    const expectedName = normalizeClanName(clanName);
    return Object.values(vars.personajes ?? {}).filter((character: any) => {
        if (!character?.connected || character.cerrado) {
            return false;
        }

        if (clanId && character.clanId && String(character.clanId) === String(clanId)) {
            return true;
        }

        return expectedName && normalizeClanName(character.clan) === expectedName;
    }).length;
}

function ownsAllOuterCastles(user: CastleUser | undefined): boolean {
    return CASTLE_IDS.every((id) => sameClan(user, getCastle(id)));
}

function conquestPoints(basePoints: number, memberCount: number): number {
    const percentage = Math.max(0, 60 - Math.max(1, memberCount));
    return Math.round(basePoints + percentage / 2);
}

export function listCastles(): string[] {
    return (Object.keys(CASTLES) as CastleId[]).map((id) => {
        const record = getCastle(id);
        const owner = record.clanName || "Nadie";
        return `${CASTLES[id].label}: ${owner} Fecha: ${formatOwnedSince(record.conqueredAt)}`;
    });
}

export function getCastleEntryDeniedMessage(user: CastleUser | undefined, mapId: number): string {
    if (!user || Number(user.privileges ?? 0) === 1) {
        return "";
    }

    if (!isCastleTerrainMap(mapId) || isFortressMap(mapId)) {
        return "";
    }

    if (!user.clan) {
        return "";
    }

    const alreadyInside = countClanMembersOnMap(mapId, user.clan, user.clanId);
    const limit = occupancyLimit(user.clanId);
    if (alreadyInside >= limit) {
        return "Tu clan ha llegado al límite de usuarios en el mapa.";
    }

    return "";
}

export function getCastleAttackDeniedMessage(user: CastleUser | undefined, npc: CastleNpc | undefined): string {
    if (!user || !npc || !isCastleDefenderNpc(npc)) {
        return "";
    }

    const castleId = castleIdByMap(Number(npc.map));
    if (!castleId) {
        return "";
    }

    if (!user.clan) {
        return "No tienes clan!!";
    }

    const record = getCastle(castleId);
    if (sameClan(user, record)) {
        return "No puedes atacar tu castillo";
    }

    if (isAlliedToCastle(user, record)) {
        return "No puedes atacar castillos de clanes aliados :P";
    }

    if (isFortressMap(Number(npc.map)) && !ownsAllOuterCastles(user)) {
        return "No puedes atacar Fortaleza sin tener conquistados los 4 Castillos.";
    }

    if (Number(npc.npcType) === FORTRESS_DEFENDER_TYPE) {
        const level = Number(require("./clanMeta").getClanLevel(user.clanId) ?? 1);
        if (level < 2) {
            return "Tu Clan no tiene suficiente Nivel.";
        }
    }

    return "";
}

export function isProtectedByCastle(user: CastleUser | undefined, mapId: number): boolean {
    const castleId = castleIdByMap(mapId);
    if (!castleId || !user?.clan) {
        return false;
    }

    const record = getCastle(castleId);
    return sameClan(user, record) || isAlliedToCastle(user, record);
}

export function onCastleNpcKilled(user: CastleUser | undefined, npc: CastleNpc | undefined): void {
    if (!user?.clan || !npc || !isCastleDefenderNpc(npc)) {
        return;
    }

    const mapId = Number(npc.map);
    const npcType = Number(npc.npcType ?? 0);
    const castleId =
        npcType === FORTRESS_DEFENDER_TYPE
            ? isFortressMap(mapId)
                ? "fortaleza"
                : undefined
            : npcType === KING_NPC_TYPE
              ? castleIdByMap(mapId)
              : undefined;

    if (!castleId) {
        return;
    }

    if (getCastleAttackDeniedMessage(user, npc)) {
        return;
    }

    const previous = getCastle(castleId);
    if (sameClan(user, previous)) {
        return;
    }

    const memberCount = Math.max(1, countOnlineClanMembers(user.clanId, user.clan));
    const points = conquestPoints(CASTLES[castleId].basePoints, memberCount);
    const clanMeta = require("./clanMeta");
    if (user.clanId) {
        clanMeta.applyReputation(String(user.clanId), points);
    }
    if (previous.clanId) {
        clanMeta.applyReputation(previous.clanId, -points);
    }

    const progress = require("./woaoProgress");
    const userProgress = progress.getProgress(user);
    userProgress.pClan += castleId === "fortaleza" ? 10 : 3;
    (user as { pClan?: number }).pClan = userProgress.pClan;
    progress.saveProgress(user);

    owners.set(castleId, {
        clanName: String(user.clan),
        clanId: String(user.clanId ?? ""),
        conqueredAt: Date.now(),
    });
    persistOwners();

    handleProtocol.consoleToAll(
        `El CLAN ${String(user.clan).toUpperCase()} ${CASTLES[castleId].announce}`,
        "#E69500",
        1,
        0,
    );
}

export function teleportToOwnedCastle(
    idUser: string,
    rawDestination: string,
): { ok: boolean; message: string; map?: number; x?: number; y?: number } {
    const user = vars.personajes[idUser] as CastleUser | undefined;
    if (!user) {
        return { ok: false, message: "No se pudo transportar." };
    }

    const destination = rawDestination.trim().toLowerCase();
    const castleId = CASTLE_IDS.find((id) => id === destination);
    if (!castleId) {
        return { ok: false, message: "Uso: /castillo norte|sur|este|oeste" };
    }

    if (!user.clan) {
        return { ok: false, message: "No perteneces a un clan." };
    }

    if (!sameClan(user, getCastle(castleId))) {
        return { ok: false, message: `Tu clan no controla el ${CASTLES[castleId].label}.` };
    }

    if (Number(user.hp ?? 0) < Number(user.maxHp ?? 0) || user.dead) {
        return { ok: false, message: "Tu salud debe estar completa." };
    }

    if (Number(user.jailMinutes ?? 0) > 0) {
        return { ok: false, message: "No puedes salir de la cárcel." };
    }

    const map = CASTLES[castleId].innerMaps[0];
    const occupancyDenied = getCastleEntryDeniedMessage(user, map);
    if (occupancyDenied) {
        return { ok: false, message: occupancyDenied };
    }

    const x = 48 + Math.floor(Math.random() * 8);
    const y = 50 + Math.floor(Math.random() * 11);
    return { ok: true, message: `${user.nameCharacter} transportado.`, map, x, y };
}

export function relocateFromFortressIfNeeded(user: {
    map?: number;
    pos?: { x: number; y: number };
    posX?: number;
    posY?: number;
    clan?: string;
    clanId?: string | null;
    privileges?: number;
}): string {
    if (!user || Number(user.privileges ?? 0) === 1) {
        return "";
    }

    const mapId = Number(user.map ?? 0);
    if (!isFortressMap(mapId)) {
        return "";
    }

    if (sameClan(user, getCastle("fortaleza"))) {
        return "";
    }

    user.map = SAFE_MAP;
    user.pos = { ...SAFE_POS };
    user.posX = SAFE_POS.x;
    user.posY = SAFE_POS.y;
    return "La Fortaleza ya no pertenece a tu clan.";
}

export function initialize() {
    loadOwners();
    console.log(`[Castillos] Dueños cargados: ${owners.size || "ninguno"}`);
}
