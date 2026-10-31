// Modo Arena: todos contra todos en un mapa de torneo, estilo argentumonline.io. Se entra desde /arenas con
// una clase (arenaClasses.ts), con el nombre de la cuenta, en nivel 50 y con todo el equipo. No se pierde nada
// al morir: se revive solo a los pocos segundos en otro lugar del mapa. En vez de subir de nivel se sube en el
// ranking de la partida (arenaScore.ts) y el Top 3 se ve en pantalla.
import type { EntityId, RuntimeCharacter } from "./types/runtime";
import { applyDeath, applyKill, createScore, pruneLastKills, standings, type ArenaScore } from "./arenaScore";

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");
const mapInstanceManager = require("./mapInstanceManager");

// game.ts carga login.ts, que carga este módulo: game se pide recién al usarlo.
function getGame() {
    return require("./game");
}

// El mapa 115 es un torneo grande (unas 76 × 44 baldosas abiertas), sin criaturas ni salidas. La arena es
// una instancia suya, para que nadie del mundo caiga adentro.
export const ARENA_BASE_MAP = 115;
export const ARENA_MAP = 30_000 + ARENA_BASE_MAP * 50;
const ARENA_MAP_NAME = "Arena";
const SPAWN_AREA = { x1: 13, y1: 24, x2: 88, y2: 67 };
const SPAWN_DISTANCES = [10, 6, 3, 0];
const SPAWN_ATTEMPTS = 60;

export const ARENA_REVIVE_DELAY_MS = 5_000;
const STATE_DEBOUNCE_MS = 200;
const API_FLUSH_INTERVAL_MS = 5_000;
const API_HEARTBEAT_MS = 30_000;
const RESEND_STATE_MS = 2_000;
const TOP_SIZE = 3;
const API_TOP_SIZE = 10;

type PendingResult = { accountId: string; kills: number; muertes: number; mejorPuntaje: number; mejorRacha: number };

const state = {
    scores: new Map<string, ArenaScore>(),
    lastKills: new Map<string, number>(),
    reviveTimers: new Map<string, ReturnType<typeof setTimeout>>(),
    reviveAt: new Map<string, number>(),
    /** Para el cartel de muerte: quién lo mató y cuántos puntos perdió. */
    deaths: new Map<string, { asesino: string | null; perdidos: number }>(),
    pending: new Map<string, PendingResult>(),
    stateTimer: null as ReturnType<typeof setTimeout> | null,
    flushTimer: null as ReturnType<typeof setInterval> | null,
    liveDirty: true,
    lastFlushAt: 0,
};

function getUser(idUser: EntityId): RuntimeCharacter | undefined {
    return vars.personajes[idUser] as RuntimeCharacter | undefined;
}

function getClient(idUser: EntityId) {
    return vars.clients[idUser];
}

export function isArenaCharacter(user: { arenaFfa?: boolean } | null | undefined): boolean {
    return Boolean(user?.arenaFfa);
}

export function isArenaUser(idUser: EntityId): boolean {
    return isArenaCharacter(getUser(idUser));
}

export function ensureArenaMap(): number {
    mapInstanceManager.ensureInstance(ARENA_MAP);
    // El clon de la instancia no copia el nombre del mapa base (cloneDeep de un arreglo ignora sus propiedades).
    const mapData = vars.mapData[ARENA_MAP];
    if (mapData && mapData.name !== ARENA_MAP_NAME) {
        mapData.name = ARENA_MAP_NAME;
    }
    return ARENA_MAP;
}

function isFreeSpawnTile(x: number, y: number): boolean {
    const tile = vars.mapa[ARENA_MAP]?.[y]?.[x];
    const occupant = vars.mapData[ARENA_MAP]?.[y]?.[x];
    if (!tile || !occupant || occupant.id || typeof tile.tileExit !== "undefined" || tile.objInfo?.objIndex) {
        return false;
    }

    return getGame().validPosRespawn({ x, y }, ARENA_MAP, false);
}

/** Un lugar libre del área de pelea, lo más lejos posible de los demás. */
export function pickSpawn(excludeId?: EntityId): { x: number; y: number } {
    ensureArenaMap();
    const others: Array<{ x: number; y: number }> = [];
    for (const score of state.scores.values()) {
        const user = getUser(score.id);
        if (user && score.id !== String(excludeId) && Number(user.map) === ARENA_MAP && !user.dead) {
            others.push(user.pos);
        }
    }

    for (const distance of SPAWN_DISTANCES) {
        for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt++) {
            const x = funct.randomIntFromInterval(SPAWN_AREA.x1, SPAWN_AREA.x2);
            const y = funct.randomIntFromInterval(SPAWN_AREA.y1, SPAWN_AREA.y2);
            const farEnough = others.every((pos) => Math.max(Math.abs(pos.x - x), Math.abs(pos.y - y)) >= distance);
            if (farEnough && isFreeSpawnTile(x, y)) {
                return { x, y };
            }
        }
    }

    for (let y = SPAWN_AREA.y1; y <= SPAWN_AREA.y2; y++) {
        for (let x = SPAWN_AREA.x1; x <= SPAWN_AREA.x2; x++) {
            if (isFreeSpawnTile(x, y)) {
                return { x, y };
            }
        }
    }

    return { x: 50, y: 45 };
}

function tellArena(message: string, color = "#E69500") {
    for (const score of state.scores.values()) {
        const client = getClient(score.id);
        if (client) {
            handleProtocol.console(message, color, 1, 0, client);
        }
    }
}

function topEntry(score: ArenaScore) {
    return { nombre: score.nombre, idClase: score.idClase, puntos: score.puntos, kills: score.kills };
}

function buildPayload(ranking: ArenaScore[], idUser: string) {
    const position = ranking.findIndex((score) => score.id === idUser);
    const mine = position >= 0 ? ranking[position] : null;
    return {
        jugadores: ranking.length,
        top: ranking.slice(0, TOP_SIZE).map(topEntry),
        yo: mine
            ? {
                  puesto: position + 1,
                  puntos: mine.puntos,
                  kills: mine.kills,
                  muertes: mine.muertes,
                  racha: mine.racha,
                  mejorPuntaje: mine.mejorPuntaje,
              }
            : null,
        reviveEn: Math.max(0, (state.reviveAt.get(idUser) ?? 0) - Date.now()),
        muerte: state.deaths.get(idUser) ?? null,
    };
}

function sendStateNow() {
    state.stateTimer = null;
    const ranking = standings(state.scores.values());
    for (const score of ranking) {
        const client = getClient(score.id);
        if (client && typeof handleProtocol.arenaState === "function") {
            handleProtocol.arenaState(buildPayload(ranking, score.id), client);
        }
    }
}

function scheduleState() {
    state.liveDirty = true;
    if (!state.stateTimer) {
        state.stateTimer = setTimeout(sendStateNow, STATE_DEBOUNCE_MS);
    }
}

export function sendState(idUser: EntityId) {
    const client = getClient(idUser);
    if (client && typeof handleProtocol.arenaState === "function") {
        handleProtocol.arenaState(buildPayload(standings(state.scores.values()), String(idUser)), client);
    }
}

function trackResult(score: ArenaScore, kills: number, muertes: number) {
    if (!score.accountId || score.accountId.startsWith("bot:")) {
        return;
    }

    const pending = state.pending.get(score.accountId) ?? {
        accountId: score.accountId,
        kills: 0,
        muertes: 0,
        mejorPuntaje: 0,
        mejorRacha: 0,
    };
    pending.kills += kills;
    pending.muertes += muertes;
    pending.mejorPuntaje = Math.max(pending.mejorPuntaje, score.mejorPuntaje);
    pending.mejorRacha = Math.max(pending.mejorRacha, score.mejorRacha);
    state.pending.set(score.accountId, pending);
}

/** Lo que ve /arenas: cuántos hay, el top en vivo y los resultados para el ranking de la cuenta. */
async function flushToApi(force = false) {
    const now = Date.now();
    const heartbeatDue = state.scores.size > 0 && now - state.lastFlushAt >= API_HEARTBEAT_MS;
    if (!force && !state.liveDirty && state.pending.size === 0 && !heartbeatDue) {
        return;
    }

    const resultados = [...state.pending.values()];
    state.pending.clear();
    state.liveDirty = false;
    state.lastFlushAt = now;
    const ranking = standings(state.scores.values());

    try {
        await funct.fetchUrl("/internal/arenas/estado", {
            method: "POST",
            headers: {
                Authorization: vars.tokenAuth,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                jugadores: ranking.length,
                top: ranking.slice(0, API_TOP_SIZE).map((score) => ({ ...topEntry(score), muertes: score.muertes })),
                resultados,
            }),
        });
    } catch (error) {
        // Si la API no contestó, los resultados vuelven a la cola para el próximo envío.
        for (const result of resultados) {
            const pending = state.pending.get(result.accountId);
            if (pending) {
                pending.kills += result.kills;
                pending.muertes += result.muertes;
                pending.mejorPuntaje = Math.max(pending.mejorPuntaje, result.mejorPuntaje);
                pending.mejorRacha = Math.max(pending.mejorRacha, result.mejorRacha);
            } else {
                state.pending.set(result.accountId, result);
            }
        }
        funct.dumpError(error);
    }
}

export function onConnected(idUser: EntityId) {
    const user = getUser(idUser);
    if (!isArenaCharacter(user) || !user) {
        return;
    }

    const id = String(idUser);
    state.scores.set(
        id,
        createScore(id, String(user.idAccount ?? ""), String(user.nameCharacter), Number(user.idClase), Date.now()),
    );
    tellArena(`Arena> ${user.nameCharacter} entró a la arena.`, "#9FD3FF");
    const client = getClient(idUser);
    if (client) {
        handleProtocol.console(
            "Arena> Todos contra todos. Cada muerte te saca la mitad de tus puntos y quien te mata se los lleva (+10). Revivís solo a los 5 segundos.",
            "#E69500",
            1,
            0,
            client,
        );
    }
    scheduleState();
    // El cliente descarta los paquetes que llegan antes de armar el HUD: se manda de nuevo al rato.
    setTimeout(() => sendState(idUser), RESEND_STATE_MS);
}

export function onDisconnected(user: RuntimeCharacter | undefined) {
    if (!isArenaCharacter(user) || !user) {
        return;
    }

    const id = String(user.id);
    const score = state.scores.get(id);
    clearRevive(id);
    if (!score) {
        return;
    }

    trackResult(score, 0, 0);
    state.scores.delete(id);
    for (const pair of [...state.lastKills.keys()]) {
        if (pair.startsWith(`${id}>`) || pair.endsWith(`>${id}`)) {
            state.lastKills.delete(pair);
        }
    }
    tellArena(`Arena> ${score.nombre} salió de la arena.`, "#9FD3FF");
    scheduleState();
    void flushToApi(true);
}

function clearRevive(id: string) {
    const timer = state.reviveTimers.get(id);
    if (timer) {
        clearTimeout(timer);
    }
    state.reviveTimers.delete(id);
    state.reviveAt.delete(id);
    state.deaths.delete(id);
}

function reviveInArena(id: string) {
    clearRevive(id);
    const user = getUser(id);
    const client = getClient(id);
    if (!user || !client || user.cerrado || !isArenaCharacter(user)) {
        return;
    }

    const spawn = pickSpawn(id);
    const game = getGame();
    game.forceDismount(id);
    game.telep(client, ARENA_MAP, spawn.x, spawn.y, "arena-revivir");
    if (user.dead) {
        game.revivirUsuario(id, { full: true });
    }
    user.sta = Number(user.maxSta ?? user.sta ?? 0);
    scheduleState();
}

/** Toda muerte pasa por putBodyAndHeadDead: acá se pierde la mitad de los puntos y se agenda el revivir. */
export function onUserDied(idUser: EntityId) {
    const id = String(idUser);
    const user = getUser(id);
    const score = state.scores.get(id);
    if (!isArenaCharacter(user) || !score) {
        return;
    }

    const now = Date.now();
    const perdidos = applyDeath(score, now);
    trackResult(score, 0, 1);
    clearRevive(id);
    state.deaths.set(id, { asesino: null, perdidos });
    state.reviveAt.set(id, now + ARENA_REVIVE_DELAY_MS);
    state.reviveTimers.set(
        id,
        setTimeout(() => reviveInArena(id), ARENA_REVIVE_DELAY_MS),
    );
    scheduleState();
}

/** Lo llama respawn.muere justo después de la muerte, cuando la mató otro jugador. */
export function onUserKilled(killerId: EntityId, victimId: EntityId) {
    const killer = state.scores.get(String(killerId));
    const victim = state.scores.get(String(victimId));
    if (!killer || !victim || killer.id === victim.id) {
        return;
    }

    const now = Date.now();
    pruneLastKills(state.lastKills, now);
    const result = applyKill(killer, victim, state.lastKills, now);
    const killerClient = getClient(killer.id);
    // Si la muerte no cuenta, la víctima recuperó lo que había perdido.
    const lost = result.repetida ? 0 : (state.deaths.get(victim.id)?.perdidos ?? 0);
    state.deaths.set(victim.id, { asesino: killer.nombre, perdidos: lost });

    if (result.repetida) {
        if (killerClient) {
            handleProtocol.console(
                `Arena> Ya mataste a ${victim.nombre} hace menos de un minuto: esta no suma.`,
                "gray",
                1,
                0,
                killerClient,
            );
        }
    } else {
        trackResult(killer, 1, 0);
        const streak = killer.racha >= 3 ? ` ¡Racha de ${killer.racha}!` : "";
        tellArena(`Arena> ${killer.nombre} mató a ${victim.nombre} (+${result.ganados}).${streak}`);
    }
    scheduleState();
}

/** El cartel del cliente y los mensajes de muerte: en la arena no hay mundo de los muertos. */
export function getReviveDelayMs(idUser: EntityId): number {
    const at = state.reviveAt.get(String(idUser));
    return at ? Math.max(0, at - Date.now()) : ARENA_REVIVE_DELAY_MS;
}

export function initialize() {
    if (state.flushTimer) {
        return;
    }

    state.flushTimer = setInterval(() => {
        void flushToApi();
    }, API_FLUSH_INTERVAL_MS);
}

/** Para los tests y el comando de GM. */
export function getStandings() {
    return standings(state.scores.values());
}
