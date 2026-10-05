import type { RuntimeCharacter } from "./types/runtime";

const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

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
};

type HunterChest = {
    id: string;
    map: number;
    x: number;
    y: number;
    openedBy: string | null;
    loot: Array<{ idItem: number; amount: number }>;
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
    registrationStartsAt: number;
    startsAt: number;
    nextPhaseAt: number | null;
    timer: ReturnType<typeof setInterval> | null;
};

const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";
const REGISTRATION_MINUTES = 10;
const MATCH_DURATION_MS = 30 * 60_000;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 40;
const EXIT = { map: 34, x: 50, y: 50 };
const ARENA_MAPS = [260, 261, 262, 263];
const CHESTS_PER_PLAYER = 3;
const MIN_CHESTS = 12;
const MAX_CHESTS = 36;
const MIN_POTION_STACKS = 10;
const MAX_POTION_STACKS = 20;
const EQUIPMENT_LOOT = [
    1037, 559, 1056, 1127, 844, 732, 730, 729, 496, 952, 950, 500, 745, 1223, 766, 764, 1088, 400, 165, 756,
];
const POTION_LOOT = [36, 37, 38, 39];
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
    registrationStartsAt: 0,
    startsAt: 0,
    nextPhaseAt: null,
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

function findRandomArenaSpawn(index: number) {
    const preferredMap = ARENA_MAPS[index % ARENA_MAPS.length];
    const mapOrder = [preferredMap, ...ARENA_MAPS.filter((map) => map !== preferredMap)];

    for (const map of mapOrder) {
        for (let attempt = 0; attempt < 2400; attempt++) {
            const x = randomInt(5, 95);
            const y = randomInt(5, 95);
            if (game.validPosRespawn({ x, y }, map, false)) {
                return { map, x, y };
            }
        }
    }

    return { map: preferredMap, x: 50, y: 50 };
}

function isValidItem(idItem: number): boolean {
    return Boolean(vars.datObj?.[idItem]);
}

function generateChests() {
    state.chests.clear();

    const chestCount = Math.max(MIN_CHESTS, Math.min(MAX_CHESTS, state.participants.size * CHESTS_PER_PLAYER));
    let potionStacksLeft = randomInt(MIN_POTION_STACKS, MAX_POTION_STACKS);

    for (let index = 0; index < chestCount; index++) {
        const spawn = findRandomArenaSpawn(index);
        const equipment = randomFrom(EQUIPMENT_LOOT.filter(isValidItem));
        const loot: HunterChest["loot"] = [{ idItem: equipment, amount: 1 }];

        if (potionStacksLeft > 0 && Math.random() < 0.65) {
            const potion = randomFrom(POTION_LOOT.filter(isValidItem));
            loot.push({ idItem: potion, amount: randomInt(2, 6) });
            potionStacksLeft -= 1;
        }

        const chest: HunterChest = {
            id: `chest-${state.matchId}-${index}`,
            map: spawn.map,
            x: spawn.x,
            y: spawn.y,
            openedBy: null,
            loot,
        };
        state.chests.set(chest.id, chest);
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
        kills: participant?.kills ?? 0,
        zoneSecondsRemaining: endsAt ? Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)) : 0,
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
    state.chests.clear();
    state.killFeed = [];
    state.registrationStartsAt = now;
    state.startsAt = manual ? now + 30_000 : scheduledStartsAt ?? now + REGISTRATION_MINUTES * 60_000;
    state.nextPhaseAt = state.startsAt;

    announce(`Inscripcion abierta. Escribe /hunters para participar. Inicio en ${manual ? "30 segundos" : "10 minutos"}.`);
    sendStateToParticipants();

    return { ok: true, message: "Inscripcion de Hunters Game abierta." };
}

function abortEvent(reason: string) {
    const ids = Array.from(state.participants.keys());
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
    state.chests.clear();
    state.killFeed = [];
    state.nextPhaseAt = null;
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
    generateChests();
    announce(`La partida comenzo con ${state.participants.size} jugadores.`);

    let spawnIndex = 0;
    for (const idUser of state.participants.keys()) {
        const user = getUser(idUser);
        if (user) {
            const spawn = findRandomArenaSpawn(spawnIndex++);
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

    sendStateToParticipants();
}

function finishEvent(winnerId: string | null) {
    state.phase = "FINISHING";
    state.nextPhaseAt = Date.now() + 5_000;

    if (winnerId) {
        const winner = state.participants.get(winnerId);
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
    state.chests.clear();
    state.killFeed = [];
    state.nextPhaseAt = null;
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

    const delivered: string[] = [];
    for (const item of chest.loot) {
        if (addEventItemToInventory(idUser, item.idItem, item.amount)) {
            delivered.push(`${item.amount}x ${vars.datObj[item.idItem]?.name ?? item.idItem}`);
        }
    }

    if (delivered.length === 0) {
        return { ok: false, message: "No tienes espacio para abrir este cofre." };
    }

    chest.openedBy = idUser;
    tell(idUser, `Abriste un cofre: ${delivered.join(", ")}.`);
    return { ok: true, message: `Cofre abierto: ${delivered.join(", ")}.` };
}

export function joinEvent(idUser: string) {
    if (state.phase !== "REGISTRATION") {
        return { ok: false, message: "La inscripcion de Hunters Game no esta abierta." };
    }

    if (state.participants.has(idUser)) {
        return { ok: false, message: "Ya estas anotado en Hunters Game." };
    }

    if (state.participants.size >= MAX_PLAYERS) {
        return { ok: false, message: "Hunters Game ya alcanzo el maximo de participantes." };
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
    if (!victim?.alive) {
        return;
    }

    const killer = state.participants.get(killerId);
    if (killer && killerId !== victimId) {
        killer.kills += 1;
        state.killFeed.push({
            id: `${Date.now()}-${killerId}-${victimId}`,
            killerName: killer.name,
            victimName: victim.name,
            at: Date.now(),
        });
        if (state.killFeed.length > 12) {
            state.killFeed.splice(0, state.killFeed.length - 12);
        }
        announce(`${killer.name} mato a ${victim.name}. Quedan ${Math.max(0, aliveCount() - 1)} vivos.`);
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
