import fs from "node:fs";
import path from "node:path";

const handleProtocol = require("./handleProtocol");
const vars = require("./vars");
const funct = require("./functions");

type CastleId = "norte" | "sur" | "este" | "oeste" | "fortaleza";

type CastleRecord = {
    clanName: string;
    clanId: string;
    conqueredAt: number;
    nextRewardAt?: number;
    pointsPerReward?: number;
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
    id?: string | number;
    nameCharacter?: string;
    npcType?: number;
    map?: number;
    pos?: { x: number; y: number };
    templateNpcIndex?: number;
    spawnMapNum?: number;
    spawnOrigin?: { x: number; y: number };
    hp?: number;
    maxHp?: number;
    deathProcessed?: boolean;
    cooldownAtaque?: number;
    cooldownParalizado?: number;
    inmovilizado?: number | boolean;
    paralizado?: number | boolean;
    nextThinkAt?: number;
    currentTargetId?: string | number;
    currentTargetLockedUntil?: number;
    lastAggressorId?: string | number;
    lastAggressedAt?: number;
};

const DATA_PATH = path.resolve(__dirname, "../data/castleOwnership.json");
const SAFE_MAP = 34;
const SAFE_POS = { x: 50, y: 50 };
const CASTLE_NPC_TYPES = new Set([33, 61, 77, 78]);
const KING_NPC_TYPE = 33;
const FORTRESS_DEFENDER_TYPE = 61;
const CASTLE_DOOR_NPC_TYPE = 78;
const CASTLE_DOOR_NPC_INDEX = 667;
const CASTLE_KING_NPC_INDEX = 587;
const FORTRESS_DEFENDER_NPC_INDEX = 621;

type CastleFixedNpcConfig = {
    mapNum: number;
    x: number;
    y: number;
    npcIndex: number;
};

const CASTLES: Record<
    CastleId,
    {
        label: string;
        maps: number[];
        innerMaps: number[];
        announce: string;
        pointsPerReward: number;
    }
> = {
    norte: {
        label: "Castillo Norte",
        maps: [166, 268],
        innerMaps: [166],
        announce: "HA CONQUISTADO EL CASTILLO NORTE",
        pointsPerReward: 3,
    },
    sur: {
        label: "Castillo Sur",
        maps: [167, 269],
        innerMaps: [167],
        announce: "HA CONQUISTADO EL CASTILLO SUR",
        pointsPerReward: 3,
    },
    este: {
        label: "Castillo Este",
        maps: [168, 270],
        innerMaps: [168],
        announce: "HA CONQUISTADO EL CASTILLO ESTE",
        pointsPerReward: 3,
    },
    oeste: {
        label: "Castillo Oeste",
        maps: [169, 271],
        innerMaps: [169],
        announce: "HA CONQUISTADO EL CASTILLO OESTE",
        pointsPerReward: 3,
    },
    fortaleza: {
        label: "Fortaleza",
        maps: [185, 186],
        innerMaps: [185],
        announce: "HA CONQUISTADO LA FORTALEZA",
        pointsPerReward: 4,
    },
};

const CASTLE_IDS: CastleId[] = ["norte", "sur", "este", "oeste"];
const owners = new Map<CastleId, CastleRecord>();
const castleUnderAttack = new Map<CastleId, boolean>();
const CASTLE_REWARD_INTERVAL_MS = 60 * 60 * 1000;
const CASTLE_AWARD_SYNC_INTERVAL_MS = 60 * 1000;
let castleAwardTimer: NodeJS.Timeout | null = null;

type CastleCaptureResponse = {
    ok: true;
    castleId: CastleId;
    ownerClanId: string;
    ownerClanName: string;
    capturedAt: string;
    nextRewardAt: string;
    pointsPerReward: number;
};

type CastleAwardResponse = {
    ok: true;
    awards: Array<{
        castleId: CastleId;
        clanId: string;
        clanName: string;
        amount: number;
        nextRewardAt: string;
        clanPoints: number;
    }>;
};

const CASTLE_FIXED_NPCS: Record<
    CastleId,
    {
        king: CastleFixedNpcConfig;
        door?: CastleFixedNpcConfig;
    }
> = {
    norte: {
        king: { mapNum: 166, x: 45, y: 16, npcIndex: CASTLE_KING_NPC_INDEX },
        door: { mapNum: 166, x: 45, y: 75, npcIndex: CASTLE_DOOR_NPC_INDEX },
    },
    sur: {
        king: { mapNum: 167, x: 45, y: 16, npcIndex: CASTLE_KING_NPC_INDEX },
        door: { mapNum: 167, x: 45, y: 75, npcIndex: CASTLE_DOOR_NPC_INDEX },
    },
    este: {
        king: { mapNum: 168, x: 45, y: 16, npcIndex: CASTLE_KING_NPC_INDEX },
        door: { mapNum: 168, x: 45, y: 75, npcIndex: CASTLE_DOOR_NPC_INDEX },
    },
    oeste: {
        king: { mapNum: 169, x: 45, y: 16, npcIndex: CASTLE_KING_NPC_INDEX },
        door: { mapNum: 169, x: 45, y: 75, npcIndex: CASTLE_DOOR_NPC_INDEX },
    },
    fortaleza: {
        king: { mapNum: 185, x: 51, y: 20, npcIndex: FORTRESS_DEFENDER_NPC_INDEX },
    },
};

function emptyCastle(): CastleRecord {
    return { clanName: "", clanId: "", conqueredAt: 0, nextRewardAt: 0, pointsPerReward: 0 };
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
                nextRewardAt: Number(value.nextRewardAt ?? 0),
                pointsPerReward: Number(value.pointsPerReward ?? 0),
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

function updateCastleRecordFromApi(castleId: CastleId, response: CastleCaptureResponse): void {
    owners.set(castleId, {
        clanName: response.ownerClanName,
        clanId: response.ownerClanId,
        conqueredAt: new Date(response.capturedAt).getTime(),
        nextRewardAt: new Date(response.nextRewardAt).getTime(),
        pointsPerReward: response.pointsPerReward,
    });
    persistOwners();
}

function syncCastleCaptureWithApi(castleId: CastleId, record: CastleRecord): void {
    if (!record.clanId) {
        return;
    }

    void funct
        .fetchUrl("/internal/clan-points/castle-capture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: vars.tokenAuth,
            },
            body: JSON.stringify({
                castleId,
                ownerClanId: record.clanId,
                ownerClanName: record.clanName,
            }),
        })
        .then((response: CastleCaptureResponse) => {
            updateCastleRecordFromApi(castleId, response);
        })
        .catch((error: unknown) => {
            funct.dumpError(error);
        });
}

function runCastleAwardTick(): void {
    void funct
        .fetchUrl("/internal/clan-points/castle-awards/run", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: vars.tokenAuth,
            },
        })
        .then((response: CastleAwardResponse) => {
            if (!response.awards.length) {
                return;
            }

            const clanMeta = require("./clanMeta");
            for (const award of response.awards) {
                clanMeta.setReputation(award.clanId, award.clanPoints);
                const record = getCastle(award.castleId);
                owners.set(award.castleId, {
                    ...record,
                    clanName: award.clanName || record.clanName,
                    clanId: award.clanId || record.clanId,
                    nextRewardAt: new Date(award.nextRewardAt).getTime(),
                });
            }
            persistOwners();
        })
        .catch((error: unknown) => {
            funct.dumpError(error);
        });
}

function castleIdByMap(mapId: number): CastleId | undefined {
    return (Object.keys(CASTLES) as CastleId[]).find((id) => CASTLES[id].maps.includes(mapId));
}

function getCastleEntryByNpc(npc: CastleNpc | undefined): { id: CastleId; config: (typeof CASTLE_FIXED_NPCS)[CastleId] } | null {
    if (!npc) {
        return null;
    }

    const mapId = Number(npc.map ?? 0);
    const templateNpcIndex = Number(npc.templateNpcIndex ?? 0);
    const npcType = Number(npc.npcType ?? 0);

    for (const id of Object.keys(CASTLE_FIXED_NPCS) as CastleId[]) {
        const config = CASTLE_FIXED_NPCS[id];
        const isKing =
            mapId === config.king.mapNum &&
            (templateNpcIndex === config.king.npcIndex ||
                npcType === KING_NPC_TYPE ||
                npcType === FORTRESS_DEFENDER_TYPE);
        const isDoor =
            Boolean(config.door) &&
            mapId === config.door!.mapNum &&
            (templateNpcIndex === config.door!.npcIndex || npcType === CASTLE_DOOR_NPC_TYPE);

        if (isKing || isDoor) {
            return { id, config };
        }
    }

    return null;
}

function isCastleDoorNpc(npc: CastleNpc | undefined): boolean {
    return Boolean(
        npc &&
            (Number(npc.npcType ?? 0) === CASTLE_DOOR_NPC_TYPE ||
                Number(npc.templateNpcIndex ?? 0) === CASTLE_DOOR_NPC_INDEX ||
                String(npc.nameCharacter ?? "").toLowerCase() === "puerta castillo"),
    );
}

function isCastleKingNpc(npc: CastleNpc | undefined): boolean {
    return Boolean(
        npc &&
            (Number(npc.npcType ?? 0) === KING_NPC_TYPE ||
                Number(npc.npcType ?? 0) === FORTRESS_DEFENDER_TYPE ||
                Number(npc.templateNpcIndex ?? 0) === CASTLE_KING_NPC_INDEX ||
                Number(npc.templateNpcIndex ?? 0) === FORTRESS_DEFENDER_NPC_INDEX),
    );
}

function doorFootTiles(door: CastleFixedNpcConfig): Array<{ x: number; y: number }> {
    return [
        { x: door.x - 2, y: door.y },
        { x: door.x - 1, y: door.y },
        { x: door.x, y: door.y },
        { x: door.x + 1, y: door.y },
    ].filter((tile) => tile.x >= 1 && tile.x <= 100 && tile.y >= 1 && tile.y <= 100);
}

function setDoorTilesBlocked(door: CastleFixedNpcConfig, blocked: boolean) {
    const game = require("./game");

    for (const tile of doorFootTiles(door)) {
        if (!vars.mapa?.[door.mapNum]?.[tile.y]?.[tile.x]) {
            continue;
        }

        game.blockMap(door.mapNum, tile, blocked ? 1 : 0);
    }
}

function getRuntimeNpcs(): CastleNpc[] {
    return Object.values(vars.npcs ?? {}).filter(Boolean) as CastleNpc[];
}

function findFixedNpc(config: CastleFixedNpcConfig, onlyAlive = true): CastleNpc | undefined {
    return getRuntimeNpcs().find((npc) => {
        if (Number(npc.map ?? 0) !== config.mapNum || Number(npc.templateNpcIndex ?? 0) !== config.npcIndex) {
            return false;
        }

        if (Number(npc.pos?.x ?? 0) !== config.x || Number(npc.pos?.y ?? 0) !== config.y) {
            return false;
        }

        return !onlyAlive || Number(npc.hp ?? 0) > 0;
    });
}

function broadcastNpcSnapshot(npc: CastleNpc | undefined) {
    if (!npc?.id || !npc.pos) {
        return;
    }

    const game = require("./game");
    const socket = require("./socket");
    const { getClientById } = require("./runtimeRegistry");

    game.loopAreaPos(Number(npc.map), npc.pos, (target: CastleUser) => {
        const targetClient = getClientById(target.id);
        if (!targetClient) {
            return;
        }

        handleProtocol.sendNpc(npc);
        socket.send(targetClient);
    });
}

function deleteNpcFromVisibleClients(npc: CastleNpc | undefined) {
    if (!npc?.id || !npc.pos) {
        return;
    }

    const game = require("./game");
    const { getClientById } = require("./runtimeRegistry");

    game.loopAreaPos(Number(npc.map), npc.pos, (target: CastleUser) => {
        const targetClient = getClientById(target.id);
        if (targetClient) {
            handleProtocol.deleteCharacter(npc.id, targetClient);
        }
    });
}

function removeRuntimeNpc(npc: CastleNpc | undefined) {
    if (!npc?.id || !npc.pos) {
        return;
    }

    const mapId = Number(npc.map);
    const x = Number(npc.pos.x);
    const y = Number(npc.pos.y);

    if (vars.mapData?.[mapId]?.[y]?.[x]?.id === npc.id) {
        vars.mapData[mapId][y][x].id = 0;
    }

    deleteNpcFromVisibleClients(npc);
    delete vars.npcs[String(npc.id)];
    delete vars.areaNpc[String(npc.id)];
}

function resetNpcAtFixedPosition(npc: CastleNpc, config: CastleFixedNpcConfig) {
    const template = vars.datNpc?.[config.npcIndex] ?? {};
    const maxHp = Number(template.maxHp ?? template.hp ?? npc.maxHp ?? npc.hp ?? 1);
    const previousMap = Number(npc.map ?? 0);
    const previousX = Number(npc.pos?.x ?? 0);
    const previousY = Number(npc.pos?.y ?? 0);

    if (vars.mapData?.[previousMap]?.[previousY]?.[previousX]?.id === npc.id) {
        vars.mapData[previousMap][previousY][previousX].id = 0;
    }

    npc.templateNpcIndex = config.npcIndex;
    npc.spawnMapNum = config.mapNum;
    npc.spawnOrigin = { x: config.x, y: config.y };
    npc.map = config.mapNum;
    npc.pos = { x: config.x, y: config.y };
    npc.nameCharacter = String(template.name ?? npc.nameCharacter ?? "");
    npc.npcType = Number(template.npcType ?? npc.npcType ?? 0);
    npc.hp = maxHp;
    npc.maxHp = maxHp;
    npc.deathProcessed = false;
    npc.cooldownAtaque = Date.now() + 2000;
    npc.cooldownParalizado = 0;
    npc.inmovilizado = 0;
    npc.paralizado = 0;
    npc.nextThinkAt = Date.now() + Number(vars.timing?.npcThinkMs ?? 500);
    npc.currentTargetId = 0;
    npc.currentTargetLockedUntil = 0;
    npc.lastAggressorId = 0;
    npc.lastAggressedAt = 0;

    if (vars.mapData?.[config.mapNum]?.[config.y]?.[config.x]) {
        vars.mapData[config.mapNum][config.y][config.x].id = npc.id;
    }

    broadcastNpcSnapshot(npc);
}

function spawnFixedNpc(config: CastleFixedNpcConfig): CastleNpc | undefined {
    const existing = findFixedNpc(config);
    if (existing) {
        resetNpcAtFixedPosition(existing, config);
        return existing;
    }

    const LoadNpcs = require("./loadNpcs");
    new LoadNpcs().createNpcInMap(config, true, false, true);
    const created = findFixedNpc(config);

    if (created) {
        broadcastNpcSnapshot(created);
    }

    return created;
}

function resetDoorForCastle(castleId: CastleId) {
    const door = CASTLE_FIXED_NPCS[castleId].door;
    if (!door) {
        return;
    }

    for (const npc of getRuntimeNpcs()) {
        if (
            isCastleDoorNpc(npc) &&
            Number(npc.map ?? 0) === door.mapNum &&
            (Number(npc.pos?.x ?? 0) !== door.x || Number(npc.pos?.y ?? 0) !== door.y)
        ) {
            removeRuntimeNpc(npc);
        }
    }

    const fixedDoor = findFixedNpc(door, false);
    if (fixedDoor && Number(fixedDoor.hp ?? 0) > 0) {
        resetNpcAtFixedPosition(fixedDoor, door);
    } else {
        if (fixedDoor) {
            removeRuntimeNpc(fixedDoor);
        }
        spawnFixedNpc(door);
    }

    setDoorTilesBlocked(door, true);
}

function castleHasDamagedNpc(castleId: CastleId): boolean {
    const config = CASTLE_FIXED_NPCS[castleId];
    const king = findFixedNpc(config.king);
    if (king && Number(king.hp ?? 0) > 0 && Number(king.hp ?? 0) < Number(king.maxHp ?? 0)) {
        return true;
    }

    if (config.door) {
        const door = findFixedNpc(config.door);
        if (door && Number(door.hp ?? 0) > 0 && Number(door.hp ?? 0) < Number(door.maxHp ?? 0)) {
            return true;
        }
    }

    return false;
}

function buildCastleStatePayload() {
    const underAttack: Record<string, boolean> = {};

    for (const id of Object.keys(CASTLES) as CastleId[]) {
        underAttack[id] = Boolean(castleUnderAttack.get(id));
    }

    return { underAttack };
}

function broadcastCastleState() {
    const payload = buildCastleStatePayload();

    for (const client of Object.values(vars.clients ?? {}) as Array<{ readyState?: number; OPEN?: number }>) {
        if (!client || client.readyState !== client.OPEN) {
            continue;
        }

        handleProtocol.castleState(payload, client);
    }
}

function syncCastleAttackState(castleId: CastleId, force = false) {
    const nextState = castleHasDamagedNpc(castleId);
    const previousState = Boolean(castleUnderAttack.get(castleId));

    castleUnderAttack.set(castleId, nextState);

    if (force || previousState !== nextState) {
        broadcastCastleState();
    }
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

function ownsAllOuterCastles(user: CastleUser | undefined): boolean {
    return CASTLE_IDS.every((id) => sameClan(user, getCastle(id)));
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

    const capturedAt = Date.now();
    const nextRewardAt = capturedAt + CASTLE_REWARD_INTERVAL_MS;
    const record: CastleRecord = {
        clanName: String(user.clan),
        clanId: String(user.clanId ?? ""),
        conqueredAt: capturedAt,
        nextRewardAt,
        pointsPerReward: CASTLES[castleId].pointsPerReward,
    };

    owners.set(castleId, record);
    persistOwners();
    syncCastleCaptureWithApi(castleId, record);

    handleProtocol.consoleToAll(
        `El CLAN ${String(user.clan).toUpperCase()} ${CASTLES[castleId].announce}`,
        "#E69500",
        1,
        0,
    );
}

export function syncCastleNpcDamageState(npc: CastleNpc | undefined): void {
    const entry = getCastleEntryByNpc(npc);
    if (!entry || (!isCastleDoorNpc(npc) && !isCastleKingNpc(npc))) {
        return;
    }

    syncCastleAttackState(entry.id);
}

export function onCastleNpcRuntimeDeath(npc: CastleNpc | undefined): { handled: boolean; removeNpc: boolean } {
    const entry = getCastleEntryByNpc(npc);
    if (!entry || (!isCastleDoorNpc(npc) && !isCastleKingNpc(npc))) {
        return { handled: false, removeNpc: false };
    }

    if (isCastleDoorNpc(npc)) {
        if (entry.config.door) {
            setDoorTilesBlocked(entry.config.door, false);
        }

        syncCastleAttackState(entry.id, true);
        return { handled: true, removeNpc: true };
    }

    if (npc) {
        resetNpcAtFixedPosition(npc, entry.config.king);
    }

    resetDoorForCastle(entry.id);
    syncCastleAttackState(entry.id, true);
    return { handled: true, removeNpc: false };
}

export function sendCastleState(client: any): void {
    handleProtocol.castleState(buildCastleStatePayload(), client);
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

    for (const id of Object.keys(CASTLES) as CastleId[]) {
        castleUnderAttack.set(id, castleHasDamagedNpc(id));

        const door = CASTLE_FIXED_NPCS[id].door;
        if (door && findFixedNpc(door)) {
            setDoorTilesBlocked(door, true);
        }
    }

    if (!castleAwardTimer) {
        castleAwardTimer = setInterval(runCastleAwardTick, CASTLE_AWARD_SYNC_INTERVAL_MS);
        castleAwardTimer.unref?.();
        runCastleAwardTick();
    }

    console.log(`[Castillos] Dueños cargados: ${owners.size || "ninguno"}`);
}
