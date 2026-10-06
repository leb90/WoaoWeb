import type { RuntimeCharacter } from "./types/runtime";

const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const socket = require("./socket");
const { getProgress, saveProgress } = require("./woaoProgress");

export type HuntersGamePhase =
    | "CLOSED"
    | "REGISTRATION"
    | "PREPARING"
    | "ACTIVE"
    | "FINISHING"
    | "REWARDING"
    | "CLEANUP"
    | "COMPLETED"
    | "ABORTED";

type HunterParticipant = {
    id: string;
    name: string;
    joinedAt: number;
    alive: boolean;
    kills: number;
    returnMap: number;
    returnX: number;
    returnY: number;
    assignedMap?: number;
};

type HunterChest = {
    id: string;
    map: number;
    x: number;
    y: number;
    openedBy: string | null;
    loot: Array<{ idItem: number; amount: number }>;
};

type ArenaPosition = {
    map: number;
    x: number;
    y: number;
};

type KillFeedEntry = {
    id: string;
    killerName: string;
    victimName: string;
    at: number;
};

type InventoryRecord = Record<string, { idItem: number; cant: number; equipped?: number | boolean }>;

type HuntersInventoryBackup = {
    inv: InventoryRecord;
    idBody?: number;
    idWeapon?: number;
    idHelmet?: number;
    idShield?: number;
    idItemBody?: number | string;
    idItemWeapon?: number | string;
    idItemHelmet?: number | string;
    idItemShield?: number | string;
    idItemArrow?: number | string;
    idItemRing?: number | string;
};

type HuntersGameState = {
    phase: HuntersGamePhase;
    matchId: string | null;
    participants: Map<string, HunterParticipant>;
    chests: Map<string, HunterChest>;
    killFeed: KillFeedEntry[];
    rewardedKills: Set<string>;
    registrationStartsAt: number;
    startsAt: number;
    nextPhaseAt: number | null;
    safePhaseEndsAt: number | null;
    initialParticipantCount: number;
    safePhaseNoticesSent: Set<number>;
    timer: ReturnType<typeof setInterval> | null;
};

export const HUNTERS_ITEM_IDS = {
    chest: 1720,
    redPotion: 1721,
    bluePotion: 1722,
    arrows: 1723,
} as const;

const huntersGameConfig = {
    timezone: "America/Argentina/Buenos_Aires",
    registrationMinutes: 10,
    matchDurationMs: 30 * 60_000,
    initialSafeSeconds: 120,
    minPlayers: 3,
    maxPlayers: 20,
    exit: { map: 34, x: 50, y: 50 },
    maps: [260, 261, 262, 263],
    playerSpawn: {
        minDistance: 15,
        attemptsPerMap: 2400,
    },
    chestGeneration: {
        perPlayer: 1.5,
        min: 4,
        max: 30,
        minChestDistance: 8,
        minPlayerChestDistance: 6,
    },
    chestLoot: {
        potionsMin: 10,
        potionsMax: 20,
        arrowsMin: 10,
        arrowsMax: 20,
    },
    killReward: {
        questPoints: 2,
        gold: 1000,
    },
    winnerReward: {
        baseQuestPoints: 5,
        questPointsPerParticipant: 1,
        baseGold: 5000,
        goldPerParticipant: 1000,
    },
};

const ARGENTINA_TIMEZONE = huntersGameConfig.timezone;
const REGISTRATION_MINUTES = huntersGameConfig.registrationMinutes;
const MATCH_DURATION_MS = huntersGameConfig.matchDurationMs;
const MIN_PLAYERS = huntersGameConfig.minPlayers;
const MAX_PLAYERS = huntersGameConfig.maxPlayers;
const EXIT = huntersGameConfig.exit;
const ARENA_MAPS = huntersGameConfig.maps;
const EQUIPMENT_LOOT = [
    1724, 1725, 1726, 1727, 1728, 1729, 1730, 1731, 1732, 1733, 1734, 1735, 1736, 1737, 1738, 1739, 1740, 1741, 1742,
    1743, 1744, 1745, 1746, 1747, 1748,
];
const SCHEDULE = [
    { hour: 10, minute: 0 },
    { hour: 22, minute: 0 },
];

const state: HuntersGameState = {
    phase: "CLOSED",
    matchId: null,
    participants: new Map(),
    chests: new Map(),
    killFeed: [],
    rewardedKills: new Set(),
    registrationStartsAt: 0,
    startsAt: 0,
    nextPhaseAt: null,
    safePhaseEndsAt: null,
    initialParticipantCount: 0,
    safePhaseNoticesSent: new Set(),
    timer: null,
};

function nowInArgentina(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: ARGENTINA_TIMEZONE,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(date);

    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: get("hour"),
        minute: get("minute"),
        second: get("second"),
    };
}

function currentArgentinaSeconds(date = new Date()): number {
    const current = nowInArgentina(date);
    return current.hour * 3600 + current.minute * 60 + current.second;
}

function scheduledSeconds(entry: { hour: number; minute: number }): number {
    return entry.hour * 3600 + entry.minute * 60;
}

function getCurrentRegistrationWindow(now = Date.now()) {
    const seconds = currentArgentinaSeconds(new Date(now));
    const registrationSeconds = REGISTRATION_MINUTES * 60;

    for (const entry of SCHEDULE) {
        const startSeconds = scheduledSeconds(entry);
        const openSeconds = startSeconds - registrationSeconds;

        if (seconds >= openSeconds && seconds < startSeconds) {
            return {
                startsAt: now + (startSeconds - seconds) * 1000,
                registrationStartsAt: now - (seconds - openSeconds) * 1000,
            };
        }
    }

    return null;
}

function getUser(idUser: string): RuntimeCharacter | undefined {
    return vars.personajes[idUser] as RuntimeCharacter | undefined;
}

function getClient(idUser: string) {
    return vars.clients[idUser];
}

function cloneInventoryRecord(record: InventoryRecord | undefined): InventoryRecord {
    if (!record) {
        return {};
    }

    return Object.fromEntries(Object.entries(record).map(([slot, item]) => [slot, { ...item, equipped: item.equipped ? 1 : 0 }]));
}

function syncInventoryToClient(idUser: string, previous: InventoryRecord, next: InventoryRecord) {
    const client = getClient(idUser);
    if (!client) {
        return;
    }

    for (const [slot, item] of Object.entries(previous)) {
        handleProtocol.quitarUserInvItem(idUser, slot, Number(item.cant ?? 1), client);
    }

    for (const slot of Object.keys(next)) {
        handleProtocol.agregarUserInvItem(idUser, slot, client);
    }
}

function notifyEquipmentVisuals(user: RuntimeCharacter) {
    game.loopAreaPos(user.map, user.pos, function (target: RuntimeCharacter) {
        const targetClient = getClient(String(target.id));
        if (!targetClient) {
            return;
        }

        handleProtocol.changeRopa(user.id, user.idBody ?? game.bodyNaked(user.id), 0, targetClient);
        handleProtocol.changeWeapon(user.id, user.idWeapon ?? 0, 0, targetClient);
        handleProtocol.changeShield(user.id, user.idShield ?? 0, 0, targetClient);
        handleProtocol.changeHelmet(user.id, user.idHelmet ?? 0, 0, targetClient);
        handleProtocol.changeArrow(user.id, 0, targetClient);
    });
}

function getBackup(user: RuntimeCharacter): HuntersInventoryBackup | null {
    const backup = user.huntersInventoryBackup as HuntersInventoryBackup | undefined;
    return backup?.inv ? backup : null;
}

function applyEventInventory(idUser: string) {
    const user = getUser(idUser);
    if (!user) {
        return;
    }

    const currentInventory = cloneInventoryRecord(user.inv as InventoryRecord | undefined);

    if (!getBackup(user)) {
        user.huntersInventoryBackup = {
            inv: currentInventory,
            idBody: user.idBody,
            idWeapon: user.idWeapon,
            idHelmet: user.idHelmet,
            idShield: user.idShield,
            idItemBody: user.idItemBody,
            idItemWeapon: user.idItemWeapon,
            idItemHelmet: user.idItemHelmet,
            idItemShield: user.idItemShield,
            idItemArrow: user.idItemArrow,
            idItemRing: user.idItemRing,
        } satisfies HuntersInventoryBackup;
    }

    user.inv = {};
    user.idItemBody = 0;
    user.idItemWeapon = 0;
    user.idItemHelmet = 0;
    user.idItemShield = 0;
    user.idItemArrow = 0;
    user.idItemRing = 0;
    user.idBody = game.bodyNaked(user.id);
    user.idWeapon = 0;
    user.idHelmet = 0;
    user.idShield = 0;

    syncInventoryToClient(idUser, currentInventory, user.inv as InventoryRecord);
    notifyEquipmentVisuals(user);
}

function restoreRealInventory(idUser: string) {
    const user = getUser(idUser);
    if (!user) {
        return;
    }

    const backup = getBackup(user);
    if (!backup) {
        return;
    }

    const currentInventory = cloneInventoryRecord(user.inv as InventoryRecord | undefined);
    user.inv = cloneInventoryRecord(backup.inv);
    user.idBody = backup.idBody ?? user.idBody;
    user.idWeapon = backup.idWeapon ?? 0;
    user.idHelmet = backup.idHelmet ?? 0;
    user.idShield = backup.idShield ?? 0;
    user.idItemBody = backup.idItemBody ?? 0;
    user.idItemWeapon = backup.idItemWeapon ?? 0;
    user.idItemHelmet = backup.idItemHelmet ?? 0;
    user.idItemShield = backup.idItemShield ?? 0;
    user.idItemArrow = backup.idItemArrow ?? 0;
    user.idItemRing = backup.idItemRing ?? 0;
    delete user.huntersInventoryBackup;

    syncInventoryToClient(idUser, currentInventory, user.inv as InventoryRecord);
    notifyEquipmentVisuals(user);
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(items: T[]): T {
    return items[randomInt(0, items.length - 1)];
}

function positionKey(map: number, x: number, y: number): string {
    return `${map}:${x}:${y}`;
}

function chebyshevDistance(left: ArenaPosition, right: ArenaPosition): number {
    if (Number(left.map) !== Number(right.map)) {
        return Number.POSITIVE_INFINITY;
    }

    return Math.max(Math.abs(left.x - right.x), Math.abs(left.y - right.y));
}

function hasNpcAt(map: number, x: number, y: number): boolean {
    for (const npc of Object.values(vars.npc ?? {}) as Array<any>) {
        if (!npc || npc.dead) {
            continue;
        }

        if (Number(npc.map) === Number(map) && Number(npc.pos?.x ?? 0) === x && Number(npc.pos?.y ?? 0) === y) {
            return true;
        }
    }

    return false;
}

function hasPlayerAt(map: number, x: number, y: number): boolean {
    for (const user of Object.values(vars.personajes ?? {}) as Array<any>) {
        if (!user || user.dead) {
            continue;
        }

        if (Number(user.map) === Number(map) && Number(user.pos?.x ?? 0) === x && Number(user.pos?.y ?? 0) === y) {
            return true;
        }
    }

    return false;
}

function isValidArenaPosition(
    map: number,
    x: number,
    y: number,
    reserved: Set<string>,
    existingPositions: ArenaPosition[],
    minDistance: number,
): boolean {
    const tile = vars.mapa[map]?.[y]?.[x];
    if (!tile || reserved.has(positionKey(map, x, y))) {
        return false;
    }

    if (typeof tile.tileExit !== "undefined" || tile.objInfo?.objIndex || hasNpcAt(map, x, y) || hasPlayerAt(map, x, y)) {
        return false;
    }

    if (!game.validPosRespawn({ x, y }, map, false)) {
        return false;
    }

    const candidate = { map, x, y };
    return existingPositions.every((position) => chebyshevDistance(candidate, position) >= minDistance);
}

function findRandomArenaSpawn(
    map: number,
    reserved: Set<string>,
    existingPositions: ArenaPosition[],
    minDistance: number,
): ArenaPosition {
    const attemptsPerMap = huntersGameConfig.playerSpawn.attemptsPerMap;
    const distanceAttempts = [minDistance, Math.max(8, Math.floor(minDistance / 2)), 4, 0];

    for (const distance of distanceAttempts) {
        for (let attempt = 0; attempt < attemptsPerMap; attempt++) {
            const x = randomInt(5, 95);
            const y = randomInt(5, 95);
            if (isValidArenaPosition(map, x, y, reserved, existingPositions, distance)) {
                reserved.add(positionKey(map, x, y));
                const position = { map, x, y };
                existingPositions.push(position);
                return position;
            }
        }
    }

    const fallback = { map, x: 50, y: 50 };
    reserved.add(positionKey(map, 50, 50));
    existingPositions.push(fallback);
    return fallback;
}

function pickLeastUsedMap(counts: Map<number, number>): number {
    const min = Math.min(...ARENA_MAPS.map((map) => Number(counts.get(map) ?? 0)));
    return randomFrom(ARENA_MAPS.filter((map) => Number(counts.get(map) ?? 0) === min));
}

function assignParticipantSpawns(): Map<string, ArenaPosition> {
    const counts = new Map<number, number>(ARENA_MAPS.map((map) => [map, 0]));
    const reserved = new Set<string>();
    const positions: ArenaPosition[] = [];
    const assignments = new Map<string, ArenaPosition>();

    for (const idUser of state.participants.keys()) {
        const map = pickLeastUsedMap(counts);
        counts.set(map, Number(counts.get(map) ?? 0) + 1);
        const spawn = findRandomArenaSpawn(map, reserved, positions, huntersGameConfig.playerSpawn.minDistance);
        assignments.set(idUser, spawn);
        const participant = state.participants.get(idUser);
        if (participant) {
            participant.assignedMap = spawn.map;
        }
    }

    return assignments;
}

function isValidItem(idItem: number): boolean {
    return Boolean(vars.datObj?.[idItem]);
}

function placeChestOnMap(chest: HunterChest) {
    const tile = vars.mapa[chest.map]?.[chest.y]?.[chest.x];
    if (!tile) {
        return;
    }

    tile.objInfo = {
        objIndex: HUNTERS_ITEM_IDS.chest,
        amount: 1,
        huntersChestId: chest.id,
    };

    game.loopAreaPos(chest.map, { x: chest.x, y: chest.y }, function (target: RuntimeCharacter) {
        const targetClient = getClient(String(target.id));
        if (targetClient) {
            handleProtocol.renderItem(HUNTERS_ITEM_IDS.chest, chest.map, { x: chest.x, y: chest.y }, targetClient);
        }
    });
}

function removeChestFromMap(chest: HunterChest) {
    const tile = vars.mapa[chest.map]?.[chest.y]?.[chest.x];
    if (tile?.objInfo?.objIndex === HUNTERS_ITEM_IDS.chest) {
        delete tile.objInfo;
    }

    game.loopAreaPos(chest.map, { x: chest.x, y: chest.y }, function (target: RuntimeCharacter) {
        const targetClient = getClient(String(target.id));
        if (targetClient) {
            handleProtocol.deleteItem(chest.map, { x: chest.x, y: chest.y }, targetClient);
        }
    });
}

function clearChestsFromMap() {
    for (const chest of state.chests.values()) {
        removeChestFromMap(chest);
    }
}

function buildChestLoot(): HunterChest["loot"] {
    const equipmentPool = EQUIPMENT_LOOT.filter(isValidItem);
    const equipment = equipmentPool.length > 0 ? randomFrom(equipmentPool) : 480;
    const potionTotal = randomInt(huntersGameConfig.chestLoot.potionsMin, huntersGameConfig.chestLoot.potionsMax);
    const redPotions = randomInt(0, potionTotal);
    const bluePotions = potionTotal - redPotions;
    const loot: HunterChest["loot"] = [{ idItem: equipment, amount: 1 }];

    if (redPotions > 0) {
        loot.push({ idItem: HUNTERS_ITEM_IDS.redPotion, amount: redPotions });
    }

    if (bluePotions > 0) {
        loot.push({ idItem: HUNTERS_ITEM_IDS.bluePotion, amount: bluePotions });
    }

    loot.push({
        idItem: HUNTERS_ITEM_IDS.arrows,
        amount: randomInt(huntersGameConfig.chestLoot.arrowsMin, huntersGameConfig.chestLoot.arrowsMax),
    });

    return loot;
}

function generateChests() {
    clearChestsFromMap();
    state.chests.clear();

    const chestCount = Math.max(
        huntersGameConfig.chestGeneration.min,
        Math.min(huntersGameConfig.chestGeneration.max, Math.ceil(state.participants.size * huntersGameConfig.chestGeneration.perPlayer)),
    );
    const counts = new Map<number, number>(ARENA_MAPS.map((map) => [map, 0]));
    const reserved = new Set<string>();
    const playerPositions = Array.from(state.participants.values())
        .map((participant) => {
            const user = getUser(participant.id);
            return user?.map && user?.pos ? { map: Number(user.map), x: Number(user.pos.x), y: Number(user.pos.y) } : null;
        })
        .filter(Boolean) as ArenaPosition[];
    const chestPositions: ArenaPosition[] = [];

    for (let index = 0; index < chestCount; index++) {
        const map = pickLeastUsedMap(counts);
        counts.set(map, Number(counts.get(map) ?? 0) + 1);
        const blockedByPlayers = [...chestPositions, ...playerPositions];
        const spawn = findRandomArenaSpawn(
            map,
            reserved,
            blockedByPlayers,
            index < playerPositions.length
                ? huntersGameConfig.chestGeneration.minPlayerChestDistance
                : huntersGameConfig.chestGeneration.minChestDistance,
        );
        chestPositions.push(spawn);

        const chest: HunterChest = {
            id: `chest-${state.matchId}-${index}`,
            map: spawn.map,
            x: spawn.x,
            y: spawn.y,
            openedBy: null,
            loot: buildChestLoot(),
        };
        state.chests.set(chest.id, chest);
        placeChestOnMap(chest);
    }
}

function addEventItemToInventory(idUser: string, idItem: number, amount: number): boolean {
    const user = getUser(idUser);
    const client = getClient(idUser);
    if (!user || !client || !isValidItem(idItem) || amount < 1) {
        return false;
    }

    const inv = (user.inv ?? {}) as InventoryRecord;
    for (const [slot, item] of Object.entries(inv)) {
        if (Number(item.idItem) === Number(idItem) && !item.equipped) {
            const previousAmount = Number(item.cant ?? 0);
            handleProtocol.quitarUserInvItem(idUser, slot, previousAmount || amount, client);
            item.cant = previousAmount + amount;
            handleProtocol.agregarUserInvItem(idUser, slot, client);
            return true;
        }
    }

    for (let slot = 1; slot <= 21; slot++) {
        const key = String(slot);
        if (!inv[key]) {
            inv[key] = { idItem, cant: amount, equipped: 0 };
            user.inv = inv;
            handleProtocol.agregarUserInvItem(idUser, key, client);
            return true;
        }
    }

    return false;
}

function findNearestClosedChest(user: RuntimeCharacter): HunterChest | null {
    let nearest: HunterChest | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const chest of state.chests.values()) {
        if (chest.openedBy || Number(chest.map) !== Number(user.map)) {
            continue;
        }

        const distance = Math.max(Math.abs(Number(user.pos?.x ?? 0) - chest.x), Math.abs(Number(user.pos?.y ?? 0) - chest.y));
        if (distance <= 2 && distance < nearestDistance) {
            nearest = chest;
            nearestDistance = distance;
        }
    }

    return nearest;
}

function announce(message: string) {
    handleProtocol.consoleToAll(`Hunters Game> ${message}`, "#E69500", 1, 0);
}

function tell(idUser: string, message: string) {
    const client = getClient(idUser);
    if (client) {
        handleProtocol.console(`Hunters Game> ${message}`, "#E69500", 1, 0, client);
    }
}

function aliveCount(): number {
    let count = 0;
    for (const participant of state.participants.values()) {
        if (participant.alive) {
            count++;
        }
    }
    return count;
}

export function isSafePhaseActive(): boolean {
    return state.phase === "ACTIVE" && Boolean(state.safePhaseEndsAt && Date.now() < state.safePhaseEndsAt);
}

export function isPvpEnabled(): boolean {
    return state.phase === "ACTIVE" && !isSafePhaseActive();
}

export function isParticipant(idUser: string | number | undefined | null): boolean {
    return typeof idUser !== "undefined" && idUser !== null && state.participants.has(String(idUser));
}

export function isHuntersCombat(leftId: string | number | undefined | null, rightId: string | number | undefined | null): boolean {
    if (!leftId || !rightId || !isPvpEnabled()) {
        return false;
    }

    const left = getUser(String(leftId));
    const right = getUser(String(rightId));
    return Boolean(
        left?.huntersGame &&
            right?.huntersGame &&
            left.huntersGameMatchId &&
            left.huntersGameMatchId === right.huntersGameMatchId &&
            state.participants.get(String(leftId))?.alive &&
            state.participants.get(String(rightId))?.alive,
    );
}

export function getAttackDeniedReason(
    attacker: RuntimeCharacter | undefined,
    target: RuntimeCharacter | undefined,
): string | null {
    if (!attacker?.huntersGame || !target?.huntersGame) {
        return null;
    }

    if (!attacker.huntersGameMatchId || attacker.huntersGameMatchId !== target.huntersGameMatchId) {
        return null;
    }

    if (isSafePhaseActive()) {
        return "Hunters Game> Fase segura activa. No puedes atacar todavia.";
    }

    return null;
}

function safePhaseSecondsRemaining(): number {
    return state.safePhaseEndsAt ? Math.max(0, Math.ceil((state.safePhaseEndsAt - Date.now()) / 1000)) : 0;
}

function statusLabel(): string {
    if (state.phase === "ACTIVE" && isSafePhaseActive()) {
        return "FASE SEGURA";
    }

    if (state.phase === "ACTIVE") {
        return "COMBATE ACTIVO";
    }

    return state.phase;
}

function addQuestPoints(user: RuntimeCharacter, amount: number) {
    if (amount <= 0) {
        return;
    }

    const progress = getProgress(user);
    progress.puntosCanje = Number(progress.puntosCanje ?? 0) + amount;
    user.puntosCanje = progress.puntosCanje;
    saveProgress(user);
}

function addGold(idUser: string, amount: number) {
    const user = getUser(idUser);
    const client = getClient(idUser);
    if (!user || amount <= 0) {
        return;
    }

    user.gold = Number(user.gold ?? 0) + amount;
    if (client) {
        handleProtocol.actGold(user.gold, client);
    }
}

function sendCharacterRefresh(idUser: string) {
    const user = getUser(idUser);
    const client = getClient(idUser);
    if (!user || !client) {
        return;
    }

    handleProtocol.sendMyCharacter(user);
    socket.send(client);
}

function awardKillReward(killerId: string, victimId: string) {
    const key = `${state.matchId}:${killerId}:${victimId}`;
    const user = getUser(killerId);
    if (!user || state.rewardedKills.has(key)) {
        return;
    }

    state.rewardedKills.add(key);
    addQuestPoints(user, huntersGameConfig.killReward.questPoints);
    addGold(killerId, huntersGameConfig.killReward.gold);
    sendCharacterRefresh(killerId);
    tell(
        killerId,
        `Kill valida: +${huntersGameConfig.killReward.questPoints} puntos de canje y +${huntersGameConfig.killReward.gold} oro.`,
    );
}

function awardWinnerReward(winnerId: string) {
    const user = getUser(winnerId);
    if (!user) {
        return;
    }

    const participantCount = Math.max(MIN_PLAYERS, Number(state.initialParticipantCount || state.participants.size || 0));
    const questPoints =
        huntersGameConfig.winnerReward.baseQuestPoints + participantCount * huntersGameConfig.winnerReward.questPointsPerParticipant;
    const gold = huntersGameConfig.winnerReward.baseGold + participantCount * huntersGameConfig.winnerReward.goldPerParticipant;

    addQuestPoints(user, questPoints);
    addGold(winnerId, gold);
    sendCharacterRefresh(winnerId);
    tell(winnerId, `Ganaste Hunters Game: +${questPoints} puntos de canje y +${gold} oro.`);
}

function buildPayload(idUser?: string) {
    const participant = idUser ? state.participants.get(idUser) : null;
    const active = state.phase !== "CLOSED" && state.phase !== "COMPLETED" && state.phase !== "ABORTED";
    const endsAt = state.phase === "ACTIVE" && state.nextPhaseAt ? state.nextPhaseAt : null;

    return {
        active,
        phase: state.phase,
        matchId: state.matchId,
        aliveCount: aliveCount(),
        totalPlayers: state.participants.size,
        maxPlayers: MAX_PLAYERS,
        isFull: state.participants.size >= MAX_PLAYERS,
        kills: participant?.kills ?? 0,
        zoneSecondsRemaining: endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : 0,
        safePhaseActive: isSafePhaseActive(),
        safePhaseSecondsRemaining: safePhaseSecondsRemaining(),
        pvpEnabled: isPvpEnabled(),
        statusLabel: statusLabel(),
        nextPhaseAt: state.nextPhaseAt,
        killFeed: state.killFeed.slice(-5),
    };
}

function sendStateToClient(idUser: string, payload = buildPayload(idUser)) {
    const client = getClient(idUser);
    if (client && typeof handleProtocol.huntersGameState === "function") {
        handleProtocol.huntersGameState(payload, client);
    }
}

function sendStateToParticipants(payload?: ReturnType<typeof buildPayload>) {
    for (const idUser of state.participants.keys()) {
        sendStateToClient(idUser, payload ?? buildPayload(idUser));
    }
}

function clearParticipantFlag(idUser: string) {
    const user = getUser(idUser);
    if (user) {
        user.huntersGame = false;
        user.huntersGameMatchId = null;
        user.huntersGameQueued = false;
        sendCharacterRefresh(idUser);
    }
}

function reviveIfDead(idUser: string) {
    const user = getUser(idUser);
    if (!user?.dead) {
        return;
    }

    game.revivirUsuario(idUser, {
        hp: Number(user.maxHp ?? 0),
        mana: Number(user.maxMana ?? user.mana ?? 0),
    });
}

function teleportToExit(idUser: string, source: string) {
    const client = getClient(idUser);
    if (!client) {
        return;
    }

    reviveIfDead(idUser);
    game.telep(client, EXIT.map, EXIT.x, EXIT.y, source);
}

function startRegistration(manual = false, scheduledStartsAt?: number) {
    if (state.phase !== "CLOSED" && state.phase !== "COMPLETED" && state.phase !== "ABORTED") {
        return { ok: false, message: "El evento ya esta abierto o en curso." };
    }

    const now = Date.now();
    state.phase = "REGISTRATION";
    state.matchId = `hunters-${now}`;
    state.participants.clear();
    state.rewardedKills.clear();
    state.chests.clear();
    state.killFeed = [];
    state.registrationStartsAt = now;
    state.startsAt = manual ? now + 30_000 : scheduledStartsAt ?? now + REGISTRATION_MINUTES * 60_000;
    state.nextPhaseAt = state.startsAt;
    state.safePhaseEndsAt = null;
    state.initialParticipantCount = 0;
    state.safePhaseNoticesSent.clear();

    announce(`Inscripcion abierta. Escribe /hunters para participar. Inicio en ${manual ? "30 segundos" : "10 minutos"}.`);
    sendStateToParticipants();

    return { ok: true, message: "Inscripcion de Hunters Game abierta." };
}

function abortEvent(reason: string) {
    const ids = Array.from(state.participants.keys());
    clearChestsFromMap();
    for (const idUser of ids) {
        const wasInMatch = Boolean(getUser(idUser)?.huntersGame);
        restoreRealInventory(idUser);
        clearParticipantFlag(idUser);
        if (wasInMatch) {
            teleportToExit(idUser, "hunters-abort");
        }
        sendStateToClient(idUser, { ...buildPayload(idUser), active: false, phase: "ABORTED" });
    }

    state.phase = "ABORTED";
    state.matchId = null;
    state.participants.clear();
    state.rewardedKills.clear();
    state.chests.clear();
    state.killFeed = [];
    state.nextPhaseAt = null;
    state.safePhaseEndsAt = null;
    state.initialParticipantCount = 0;
    state.safePhaseNoticesSent.clear();
    announce(`Evento cancelado: ${reason}`);

    return { ok: true, message: `Hunters Game cancelado: ${reason}` };
}

function beginMatch() {
    if (state.participants.size < MIN_PLAYERS) {
        abortEvent("no hubo suficientes participantes");
        return;
    }

    state.phase = "ACTIVE";
    state.nextPhaseAt = Date.now() + MATCH_DURATION_MS;
    state.safePhaseEndsAt = Date.now() + huntersGameConfig.initialSafeSeconds * 1000;
    state.initialParticipantCount = state.participants.size;
    state.safePhaseNoticesSent.clear();
    announce(`La partida comenzo con ${state.participants.size} jugadores. Fase segura: ${huntersGameConfig.initialSafeSeconds} segundos.`);

    const spawns = assignParticipantSpawns();
    for (const idUser of state.participants.keys()) {
        const user = getUser(idUser);
        if (user) {
            const spawn = spawns.get(idUser) ?? { map: randomFrom(ARENA_MAPS), x: 50, y: 50 };
            applyEventInventory(idUser);
            game.forceDismount(idUser);
            user.huntersGame = true;
            user.huntersGameMatchId = state.matchId;
            const client = getClient(idUser);
            if (client) {
                game.telep(client, spawn.map, spawn.x, spawn.y, "hunters-start");
            }
        }
    }

    generateChests();
    sendStateToParticipants();
}

function finishEvent(winnerId: string | null) {
    state.phase = "FINISHING";
    state.nextPhaseAt = Date.now() + 5_000;
    clearChestsFromMap();

    if (winnerId) {
        const winner = state.participants.get(winnerId);
        awardWinnerReward(winnerId);
        announce(`${winner?.name ?? "Un jugador"} gano Hunters Game.`);
    } else {
        announce("Hunters Game finalizo sin ganador.");
    }

    for (const idUser of state.participants.keys()) {
        restoreRealInventory(idUser);
        clearParticipantFlag(idUser);
        teleportToExit(idUser, "hunters-finish");
        sendStateToClient(idUser, { ...buildPayload(idUser), active: false, phase: "COMPLETED" });
    }

    state.phase = "COMPLETED";
    state.matchId = null;
    state.participants.clear();
    state.rewardedKills.clear();
    state.chests.clear();
    state.killFeed = [];
    state.nextPhaseAt = null;
    state.safePhaseEndsAt = null;
    state.initialParticipantCount = 0;
    state.safePhaseNoticesSent.clear();
}

function sendSafePhaseNotices() {
    if (!isSafePhaseActive()) {
        return;
    }

    const remaining = safePhaseSecondsRemaining();
    const notices = [60, 30, 10, 5, 4, 3, 2, 1];
    for (const notice of notices) {
        if (remaining <= notice && !state.safePhaseNoticesSent.has(notice)) {
            state.safePhaseNoticesSent.add(notice);
            announce(`Fase segura: ${notice} segundo${notice === 1 ? "" : "s"}.`);
        }
    }
}

function tick() {
    const now = Date.now();

    if (state.phase === "CLOSED" || state.phase === "COMPLETED" || state.phase === "ABORTED") {
        const window = getCurrentRegistrationWindow(now);
        if (window && Math.abs(state.startsAt - window.startsAt) > 1000) {
            startRegistration(false, window.startsAt);
        }
        return;
    }

    if (state.phase === "REGISTRATION" && state.nextPhaseAt && now >= state.nextPhaseAt) {
        beginMatch();
        return;
    }

    if (state.phase === "ACTIVE") {
        if (isSafePhaseActive()) {
            sendSafePhaseNotices();
        } else if (state.safePhaseEndsAt && !state.safePhaseNoticesSent.has(0)) {
            state.safePhaseNoticesSent.add(0);
            announce("COMIENZA LA CACERIA!");
        }

        sendStateToParticipants();

        if (aliveCount() <= 1) {
            const winner = Array.from(state.participants.values()).find((participant) => participant.alive);
            finishEvent(winner?.id ?? null);
            return;
        }

        if (state.nextPhaseAt && now >= state.nextPhaseAt) {
            finishEvent(null);
        }
    }
}

export function initialize() {
    if (state.timer) {
        return;
    }

    state.timer = setInterval(tick, 1000);
}

export function startEvent() {
    return startRegistration(true);
}

export function cancelEvent() {
    return abortEvent("interrumpido por un administrador");
}

export function openNearestChest(idUser: string) {
    if (state.phase !== "ACTIVE") {
        return { ok: false, message: "Los cofres solo se pueden abrir con la partida en curso." };
    }

    const user = getUser(idUser);
    const participant = state.participants.get(idUser);
    if (!user?.huntersGame || !participant?.alive) {
        return { ok: false, message: "No estas participando activamente en Hunters Game." };
    }

    const chest = findNearestClosedChest(user);
    if (!chest) {
        return { ok: false, message: "No hay cofres cerrados cerca." };
    }

    return openChest(idUser, chest);
}

function openChest(idUser: string, chest: HunterChest) {
    if (chest.openedBy) {
        return { ok: false, message: "Ese cofre ya fue abierto." };
    }

    const delivered: string[] = [];
    const deliveredItems: Array<{ idItem: number; amount: number }> = [];
    for (const item of chest.loot) {
        if (addEventItemToInventory(idUser, item.idItem, item.amount)) {
            delivered.push(`${item.amount}x ${vars.datObj[item.idItem]?.name ?? item.idItem}`);
            deliveredItems.push(item);
        }
    }

    if (deliveredItems.length !== chest.loot.length) {
        for (const item of deliveredItems) {
            game.quitarUserInvItem(idUser, findSlotWithItem(idUser, item.idItem), item.amount);
        }
        return { ok: false, message: "No tienes espacio suficiente para abrir este cofre." };
    }

    chest.openedBy = idUser;
    removeChestFromMap(chest);
    tell(idUser, `Abriste un cofre: ${delivered.join(", ")}.`);
    return { ok: true, message: `Cofre abierto: ${delivered.join(", ")}.` };
}

function findSlotWithItem(idUser: string, idItem: number): string {
    const user = getUser(idUser);
    const inv = (user?.inv ?? {}) as InventoryRecord;
    return Object.entries(inv).find(([, item]) => Number(item.idItem) === Number(idItem))?.[0] ?? "0";
}

export function openChestAt(idUser: string, map: number, x: number, y: number) {
    if (state.phase !== "ACTIVE") {
        return { ok: false, message: "Los cofres solo se pueden abrir con la partida en curso." };
    }

    const user = getUser(idUser);
    const participant = state.participants.get(idUser);
    if (!user?.huntersGame || !participant?.alive) {
        return { ok: false, message: "No estas participando activamente en Hunters Game." };
    }

    if (Number(user.map) !== Number(map)) {
        return { ok: false, message: "Ese cofre no esta en tu mapa." };
    }

    const distance = Math.max(Math.abs(Number(user.pos?.x ?? 0) - x), Math.abs(Number(user.pos?.y ?? 0) - y));
    if (distance > 2) {
        return { ok: false, message: "Estas demasiado lejos del cofre." };
    }

    const tile = vars.mapa[map]?.[y]?.[x];
    if (tile?.objInfo?.objIndex !== HUNTERS_ITEM_IDS.chest) {
        return { ok: false, message: "No hay un Cofre Hunters en esa posicion." };
    }

    const chestId = tile.objInfo.huntersChestId;
    const chest = (chestId ? state.chests.get(String(chestId)) : null) ?? findNearestClosedChest(user);
    if (!chest || Number(chest.map) !== Number(map) || Number(chest.x) !== x || Number(chest.y) !== y) {
        return { ok: false, message: "Ese cofre ya no esta disponible." };
    }

    return openChest(idUser, chest);
}

export function joinEvent(idUser: string) {
    if (state.phase !== "REGISTRATION") {
        return { ok: false, message: "La inscripcion de Hunters Game no esta abierta." };
    }

    if (state.participants.has(idUser)) {
        return { ok: false, message: "Ya estas anotado en Hunters Game." };
    }

    if (state.participants.size >= MAX_PLAYERS) {
        return { ok: false, message: `Hunters Game esta completo (${MAX_PLAYERS}/${MAX_PLAYERS}).` };
    }

    const user = getUser(idUser);
    if (!user) {
        return { ok: false, message: "No se encontro tu personaje." };
    }

    if (user.dead) {
        return { ok: false, message: "No puedes anotarte muerto." };
    }

    if (user.rankedMatchId || user.rankedArena || user.bloodCastle || user.hungerGames || user.factionWarMatchId) {
        return { ok: false, message: "No puedes anotarte mientras participas en otro evento." };
    }

    game.forceDismount(idUser);
    user.huntersGameQueued = true;
    user.huntersGameMatchId = state.matchId;

    const participant: HunterParticipant = {
        id: idUser,
        name: user.nameCharacter,
        joinedAt: Date.now(),
        alive: true,
        kills: 0,
        returnMap: Number(user.map ?? EXIT.map),
        returnX: Number(user.pos?.x ?? EXIT.x),
        returnY: Number(user.pos?.y ?? EXIT.y),
    };

    state.participants.set(idUser, participant);
    tell(idUser, `Entraste a Hunters Game. Arena: mapas ${ARENA_MAPS.join(", ")}.`);
    sendStateToParticipants();

    return { ok: true, message: "Entraste a Hunters Game." };
}

export function onUserKilled(killerId: string, victimId: string) {
    const victim = state.participants.get(victimId);
    if (!victim?.alive || state.phase !== "ACTIVE" || !isPvpEnabled()) {
        return;
    }

    const killer = state.participants.get(killerId);
    if (killer && killerId !== victimId) {
        killer.kills += 1;
        awardKillReward(killerId, victimId);
        state.killFeed.push({
            id: `${Date.now()}-${killerId}-${victimId}`,
            killerName: "Jugador",
            victimName: "Jugador",
            at: Date.now(),
        });
        if (state.killFeed.length > 12) {
            state.killFeed.splice(0, state.killFeed.length - 12);
        }
        announce(`Jugador mato a Jugador. Quedan ${Math.max(0, aliveCount() - 1)} vivos.`);
    }

    onUserDied(victimId);
}

export function onUserDied(idUser: string) {
    const participant = state.participants.get(idUser);
    if (!participant?.alive) {
        return;
    }

    participant.alive = false;
    restoreRealInventory(idUser);
    clearParticipantFlag(idUser);
    teleportToExit(idUser, "hunters-death");
    sendStateToParticipants();

    if (state.phase === "ACTIVE" && aliveCount() <= 1) {
        const winner = Array.from(state.participants.values()).find((current) => current.alive);
        finishEvent(winner?.id ?? null);
    }
}

export function shouldUseHuntersDeathFlow(idUser: string): boolean {
    const participant = state.participants.get(idUser);
    const user = getUser(idUser);
    return Boolean(participant?.alive && user?.huntersGame);
}

export function isArenaMap(map: number): boolean {
    return ARENA_MAPS.includes(Number(map));
}

export function status() {
    return {
        phase: state.phase,
        matchId: state.matchId,
        players: state.participants.size,
        alive: aliveCount(),
        startsAt: state.startsAt,
        nextPhaseAt: state.nextPhaseAt,
        safePhaseEndsAt: state.safePhaseEndsAt,
        safePhaseActive: isSafePhaseActive(),
        maxPlayers: MAX_PLAYERS,
        arenaMaps: ARENA_MAPS,
        chests: state.chests.size,
        closedChests: Array.from(state.chests.values()).filter((chest) => !chest.openedBy).length,
    };
}

export function listPlayers() {
    return Array.from(state.participants.values()).map((participant) => ({
        id: participant.id,
        name: participant.name,
        alive: participant.alive,
        kills: participant.kills,
    }));
}
