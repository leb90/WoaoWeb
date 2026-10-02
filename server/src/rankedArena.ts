import crypto from "node:crypto";
import { getClientById, getCharacterById, getOnlineSessionById } from "./runtimeRegistry";
import {
    calculateRankedEloChange,
    calculateTeamEloAverage,
    getMatchmakingRange,
    getRankFromElo,
    RANKED_ROUND_COUNTDOWN_SECONDS,
    RankedArenaService,
    RankedQueueService,
    selectBestMatchCandidate,
    type RankedArenaConfig,
    type RankedMode,
    type RankedQueueEntry,
} from "./ranked";
import {
    fetchRankedLeaderboard,
    fetchRankedRating,
    fetchRankedRatings,
    persistRankedMatch,
    type RankedLeaderboardResponse,
    type RankedRating,
} from "./ranked/rankedRepository";
import type { RuntimeCharacter, PartyRuntimeState } from "./types/runtime";

const game = require("./game");
const handleProtocol = require("./handleProtocol");
const socket = require("./socket");
const vars = require("./vars");

const MODE_1V1: RankedMode = "RANKED_1V1";
const MODE_2V2: RankedMode = "RANKED_2V2";
const MATCHMAKING_TICK_MS = 2_000;
const NEXT_ROUND_DELAY_MS = 2_000;
const PARTY_CONFIRMATION_MS = 20_000;
const MATCH_CONFIRMATION_MS = 20_000;

type RankedTeam = "A" | "B";
type ConfirmationKind = "PARTY_QUEUE" | "MATCH_FOUND";

type RankedMatchParticipant = {
    id: string;
    persistedId: string;
    name: string;
    team: RankedTeam;
    eloBefore: number;
    originalMap: number;
    originalPos: {
        x: number;
        y: number;
    };
};

type RankedActiveMatch = {
    id: string;
    mode: RankedMode;
    map: number;
    arena: RankedArenaConfig;
    startedAt: number;
    participants: Record<RankedTeam, RankedMatchParticipant[]>;
    teamEloBefore: Record<RankedTeam, number>;
    score: Record<RankedTeam, number>;
    resolvingRound: boolean;
    finished: boolean;
    timerIds: ReturnType<typeof setTimeout>[];
};

type RankedConfirmation = {
    id: string;
    kind: ConfirmationKind;
    mode: RankedMode;
    createdAt: number;
    expiresAt: number;
    participantIds: string[];
    acceptedIds: Set<string>;
    timerId: ReturnType<typeof setTimeout>;
    partyQueue?: {
        leaderId: string;
        memberIds: string[];
    };
    matchFound?: {
        left: RankedQueueEntry;
        right: RankedQueueEntry;
    };
};

type RankedStatePayload = {
    modes: Record<
        RankedMode,
        {
            elo: number;
            wins: number;
            losses: number;
            matchesPlayed: number;
            winStreak: number;
            bestWinStreak: number;
            highestElo: number;
            rank: ReturnType<typeof getRankFromElo>;
        }
    >;
    leaderboards: Record<
        RankedMode,
        {
            page: number;
            pageSize: number;
            total: number;
            entries: Array<RankedLeaderboardResponse["entries"][number] & {
                winrate: number;
                rank: ReturnType<typeof getRankFromElo>;
            }>;
            selfEntry:
                | (RankedLeaderboardResponse["entries"][number] & {
                      winrate: number;
                      rank: ReturnType<typeof getRankFromElo>;
                  })
                | null;
        }
    >;
    queue: {
        status: "NONE" | "QUEUED" | "MATCH_FOUND" | "IN_MATCH";
        mode: RankedMode | null;
        enqueuedAt: number | null;
        searchRange: {
            minElo: number;
            maxElo: number;
            eloRange: number;
        } | null;
    };
    match: {
        id: string;
        mode: RankedMode;
        arenaMapId: number;
        scoreA: number;
        scoreB: number;
        team: RankedTeam;
        opponentName: string;
        lockedUntil: number | null;
    } | null;
    confirmation: {
        id: string;
        kind: ConfirmationKind;
        mode: RankedMode;
        title: string;
        description: string;
        expiresAt: number;
        accepted: boolean;
        acceptedCount: number;
        requiredCount: number;
        participants: Array<{
            id: string;
            name: string;
            accepted: boolean;
        }>;
    } | null;
};

const queueService = new RankedQueueService();
const arenaService = new RankedArenaService();
const activeMatchesByCharacter = new Map<string, RankedActiveMatch>();
const activeMatchesById = new Map<string, RankedActiveMatch>();
const confirmationsById = new Map<string, RankedConfirmation>();
const confirmationByCharacterId = new Map<string, string>();
let timer: ReturnType<typeof setInterval> | null = null;
let matchmakingInFlight = false;

function tell(idUser: string, message: string, color = "#E69500") {
    const client = getClientById(idUser);
    if (client) {
        handleProtocol.console(`Ranked> ${message}`, color, 1, 0, client);
    }
}

function tellMany(ids: readonly string[], message: string, color = "#E69500") {
    for (const id of ids) {
        tell(id, message, color);
    }
}

function broadcast(message: string) {
    if (typeof handleProtocol.consoleToAll === "function") {
        handleProtocol.consoleToAll(message, "#E69500", 1, 0);
    }
}

function formatRating(elo: number) {
    const rank = getRankFromElo(elo);
    return `${rank.label} - ${elo} ELO`;
}

function getWinrate(wins: number, losses: number): number {
    const total = Math.max(0, Number(wins) + Number(losses));
    return total > 0 ? Math.round((Number(wins) / total) * 100) : 0;
}

function decorateLeaderboard(leaderboard: RankedLeaderboardResponse) {
    const decorate = (entry: RankedLeaderboardResponse["entries"][number]) => ({
        ...entry,
        winrate: getWinrate(entry.wins, entry.losses),
        rank: getRankFromElo(entry.elo),
    });

    return {
        page: leaderboard.page,
        pageSize: leaderboard.pageSize,
        total: leaderboard.total,
        entries: leaderboard.entries.map(decorate),
        selfEntry: leaderboard.selfEntry ? decorate(leaderboard.selfEntry) : null,
    };
}

function formatMode(mode: RankedMode) {
    return mode === MODE_2V2 ? "2v2" : "1v1";
}

function getPersistedId(user: RuntimeCharacter | undefined) {
    return user?._id ? String(user._id) : null;
}

function getUserName(idUser: string) {
    return String(getCharacterById(idUser)?.nameCharacter ?? "Jugador");
}

function getParticipantFromMatch(match: RankedActiveMatch, idUser: string) {
    return [...match.participants.A, ...match.participants.B].find((participant) => participant.id === idUser) ?? null;
}

function getOppositeTeam(team: RankedTeam): RankedTeam {
    return team === "A" ? "B" : "A";
}

function getAllParticipants(match: RankedActiveMatch) {
    return [...match.participants.A, ...match.participants.B];
}

function getTeamNames(participants: readonly RankedMatchParticipant[]) {
    return participants.map((participant) => participant.name).join(" + ");
}

function clearTimers(match: RankedActiveMatch) {
    for (const timerId of match.timerIds) {
        clearTimeout(timerId);
    }

    match.timerIds = [];
}

function syncClient(client: unknown) {
    if (client && typeof socket.send === "function") {
        socket.send(client);
    }
}

function getConfirmationForCharacter(idUser: string) {
    const confirmationId = confirmationByCharacterId.get(idUser);
    return confirmationId ? (confirmationsById.get(confirmationId) ?? null) : null;
}

function sendRankedStateToMany(ids: readonly string[]) {
    for (const id of ids) {
        void sendRankedState(id);
    }
}

function buildConfirmationState(idUser: string) {
    const confirmation = getConfirmationForCharacter(idUser);
    if (!confirmation) {
        return null;
    }

    const isPartyQueue = confirmation.kind === "PARTY_QUEUE";
    const title = isPartyQueue
        ? `Confirmar cola Ranked ${formatMode(confirmation.mode)}`
        : `Duelo encontrado ${formatMode(confirmation.mode)}`;
    const description = isPartyQueue
        ? "Tu companero debe aceptar para entrar a la cola."
        : "Todos los jugadores deben aceptar para iniciar el duelo.";

    return {
        id: confirmation.id,
        kind: confirmation.kind,
        mode: confirmation.mode,
        title,
        description,
        expiresAt: confirmation.expiresAt,
        accepted: confirmation.acceptedIds.has(idUser),
        acceptedCount: confirmation.acceptedIds.size,
        requiredCount: confirmation.participantIds.length,
        participants: confirmation.participantIds.map((id) => ({
            id,
            name: getUserName(id),
            accepted: confirmation.acceptedIds.has(id),
        })),
    };
}

async function buildRankedState(idUser: string): Promise<RankedStatePayload | null> {
    const user = getCharacterById(idUser);
    const persistedId = getPersistedId(user);

    if (!user || !persistedId) {
        return null;
    }

    const [rating1v1, rating2v2, leaderboard1v1, leaderboard2v2] = await Promise.all([
        fetchRankedRating(persistedId, MODE_1V1),
        fetchRankedRating(persistedId, MODE_2V2),
        fetchRankedLeaderboard(MODE_1V1, 1, 10, persistedId),
        fetchRankedLeaderboard(MODE_2V2, 1, 10, persistedId),
    ]);
    user.elo = rating1v1.elo;
    const queued = queueService.getByCharacterId(idUser);
    const match = activeMatchesByCharacter.get(idUser) ?? null;
    const participant = match ? getParticipantFromMatch(match, idUser) : null;
    const opponentTeam = match && participant ? match.participants[getOppositeTeam(participant.team)] : [];

    return {
        modes: {
            RANKED_1V1: {
                elo: rating1v1.elo,
                wins: rating1v1.wins,
                losses: rating1v1.losses,
                matchesPlayed: rating1v1.matchesPlayed,
                winStreak: rating1v1.winStreak,
                bestWinStreak: rating1v1.bestWinStreak,
                highestElo: rating1v1.highestElo,
                rank: getRankFromElo(rating1v1.elo),
            },
            RANKED_2V2: {
                elo: rating2v2.elo,
                wins: rating2v2.wins,
                losses: rating2v2.losses,
                matchesPlayed: rating2v2.matchesPlayed,
                winStreak: rating2v2.winStreak,
                bestWinStreak: rating2v2.bestWinStreak,
                highestElo: rating2v2.highestElo,
                rank: getRankFromElo(rating2v2.elo),
            },
        },
        leaderboards: {
            RANKED_1V1: decorateLeaderboard(leaderboard1v1),
            RANKED_2V2: decorateLeaderboard(leaderboard2v2),
        },
        queue: match
            ? {
                  status: "IN_MATCH",
                  mode: match.mode,
                  enqueuedAt: null,
                  searchRange: null,
              }
            : queued
              ? {
                    status: queued.status,
                    mode: queued.mode,
                    enqueuedAt: queued.enqueuedAt,
                    searchRange: queued.status === "QUEUED" ? getMatchmakingRange(queued) : null,
                }
              : {
                    status: "NONE",
                    mode: null,
                    enqueuedAt: null,
                    searchRange: null,
                },
        match:
            match && participant
                ? {
                      id: match.id,
                      mode: match.mode,
                      arenaMapId: match.map,
                      scoreA: match.score.A,
                      scoreB: match.score.B,
                      team: participant.team,
                      opponentName: getTeamNames(opponentTeam),
                      lockedUntil: Number(user.rankedLockedUntil ?? 0) > Date.now() ? Number(user.rankedLockedUntil) : null,
                  }
                : null,
        confirmation: buildConfirmationState(idUser),
    };
}

export async function sendRankedState(idUser: string) {
    const client = getClientById(idUser);
    if (!client) {
        return;
    }

    try {
        const payload = await buildRankedState(idUser);
        if (payload) {
            handleProtocol.rankedState(payload, client);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        tell(idUser, `No se pudo actualizar el estado Ranked (${message}).`, "white");
    }
}

function registerConfirmation(confirmation: RankedConfirmation) {
    for (const participantId of confirmation.participantIds) {
        const previous = getConfirmationForCharacter(participantId);
        if (previous) {
            clearConfirmation(previous, false);
        }
    }

    confirmationsById.set(confirmation.id, confirmation);
    for (const participantId of confirmation.participantIds) {
        confirmationByCharacterId.set(participantId, confirmation.id);
    }
    sendRankedStateToMany(confirmation.participantIds);
}

function clearConfirmation(confirmation: RankedConfirmation, clearTimer = true) {
    confirmationsById.delete(confirmation.id);
    for (const participantId of confirmation.participantIds) {
        if (confirmationByCharacterId.get(participantId) === confirmation.id) {
            confirmationByCharacterId.delete(participantId);
        }
    }
    if (clearTimer) {
        clearTimeout(confirmation.timerId);
    }
}

function cancelConfirmation(confirmation: RankedConfirmation, message: string, clearQueues = true) {
    clearConfirmation(confirmation);
    if (clearQueues && confirmation.matchFound) {
        queueService.leaveByEntryId(confirmation.matchFound.left.id, "manual");
        queueService.leaveByEntryId(confirmation.matchFound.right.id, "manual");
    }
    tellMany(confirmation.participantIds, message, "white");
    sendRankedStateToMany(confirmation.participantIds);
}

function expireConfirmation(id: string) {
    const confirmation = confirmationsById.get(id);
    if (!confirmation) {
        return;
    }

    cancelConfirmation(confirmation, "La confirmacion Ranked expiro.");
}

function createConfirmation(args: {
    kind: ConfirmationKind;
    mode: RankedMode;
    participantIds: string[];
    acceptedIds?: string[];
    timeoutMs: number;
    partyQueue?: RankedConfirmation["partyQueue"];
    matchFound?: RankedConfirmation["matchFound"];
}) {
    const id = crypto.randomUUID();
    const confirmation: RankedConfirmation = {
        id,
        kind: args.kind,
        mode: args.mode,
        participantIds: [...args.participantIds],
        acceptedIds: new Set(args.acceptedIds ?? []),
        createdAt: Date.now(),
        expiresAt: Date.now() + args.timeoutMs,
        timerId: setTimeout(() => expireConfirmation(id), args.timeoutMs),
        partyQueue: args.partyQueue,
        matchFound: args.matchFound,
    };
    registerConfirmation(confirmation);
    return confirmation;
}

function getPartyRecord(partyId?: string | null): PartyRuntimeState | undefined {
    if (!partyId) {
        return;
    }

    return vars.parties?.[partyId] as PartyRuntimeState | undefined;
}

function getRankedEligibility() {
    return (require("./ranked") as typeof import("./ranked")).getRankedEligibility;
}

function validateMemberForQueue(idUser: string, mode: RankedMode, partySize?: number) {
    const user = getCharacterById(idUser);
    if (!user) {
        return { ok: false, message: "Uno de los jugadores ya no esta online." };
    }
    if (activeMatchesByCharacter.has(idUser)) {
        return { ok: false, message: `${getUserName(idUser)} ya esta en un combate Ranked.` };
    }
    if (queueService.getByCharacterId(idUser)) {
        return { ok: false, message: `${getUserName(idUser)} ya esta en cola Ranked.` };
    }

    const eligibility = getRankedEligibility()(user, {
        mode,
        isQueued: false,
        isInMatch: false,
        partySize,
    });
    if (!eligibility.ok) {
        return { ok: false, message: eligibility.message };
    }

    return { ok: true, message: "OK" };
}

function getValidatedParty2v2(idUser: string) {
    const user = getCharacterById(idUser);
    if (!user) {
        return { ok: false as const, message: "No se pudo entrar a Ranked." };
    }

    const party = getPartyRecord(user.partyId);
    if (!party || party.memberIds.length !== 2) {
        return { ok: false as const, message: "Para Ranked 2v2 necesitas una party exacta de 2 jugadores." };
    }

    if (String(party.leaderId) !== String(idUser)) {
        return { ok: false as const, message: "Solo el lider de la party puede anotar 2v2." };
    }

    const memberIds = party.memberIds.map(String);
    for (const memberId of memberIds) {
        const member = getCharacterById(memberId);
        const client = getClientById(memberId);
        if (!member || !client || member.cerrado || !member.connected) {
            return { ok: false as const, message: `${getUserName(memberId)} no esta disponible.` };
        }
        const validation = validateMemberForQueue(memberId, MODE_2V2, 2);
        if (!validation.ok) {
            return { ok: false as const, message: validation.message };
        }
    }

    return { ok: true as const, memberIds };
}

async function enqueueTeam(mode: RankedMode, leaderCharacterId: string, memberCharacterIds: readonly string[]) {
    const persistedIds = memberCharacterIds
        .map((id) => getPersistedId(getCharacterById(id)))
        .filter((id): id is string => Boolean(id));
    if (persistedIds.length !== memberCharacterIds.length) {
        return { ok: false, message: "El equipo todavia no esta listo para Ranked." };
    }

    const ratings = await fetchRankedRatings(persistedIds, mode);
    const ratingById = new Map(ratings.map((rating) => [rating.characterId, rating]));
    const orderedRatings = memberCharacterIds
        .map((id) => {
            const persistedId = getPersistedId(getCharacterById(id));
            return persistedId ? ratingById.get(persistedId) : null;
        })
        .filter((rating): rating is RankedRating => Boolean(rating));
    if (orderedRatings.length !== memberCharacterIds.length) {
        return { ok: false, message: "No se pudieron cargar los ELO del equipo." };
    }

    const entry = queueService.join({
        id: crypto.randomUUID(),
        mode,
        leaderCharacterId,
        memberCharacterIds,
        teamElo: calculateTeamEloAverage(orderedRatings.map((rating) => rating.elo)),
    });
    const range = getMatchmakingRange(entry);
    sendRankedStateToMany(memberCharacterIds);
    tellMany(
        memberCharacterIds,
        `Entraron a la cola Ranked ${formatMode(mode)}. Promedio ${formatRating(entry.teamElo)}. Busqueda inicial: ${range.minElo}-${range.maxElo} ELO.`,
    );
    return { ok: true, message: `Entraste a la cola Ranked ${formatMode(mode)}.` };
}

async function completePartyQueueConfirmation(confirmation: RankedConfirmation) {
    if (!confirmation.partyQueue) {
        return { ok: false, message: "Confirmacion invalida." };
    }

    clearConfirmation(confirmation);
    const memberIds = confirmation.partyQueue.memberIds;
    for (const memberId of memberIds) {
        const validation = validateMemberForQueue(memberId, MODE_2V2, 2);
        if (!validation.ok) {
            tellMany(memberIds, validation.message, "white");
            sendRankedStateToMany(memberIds);
            return validation;
        }
    }

    return enqueueTeam(MODE_2V2, confirmation.partyQueue.leaderId, memberIds);
}

function prepareUserForRound(participant: RankedMatchParticipant, arena: RankedArenaConfig, index: number, lockedUntil: number) {
    const session = getOnlineSessionById(participant.id);
    if (!session) {
        return;
    }

    const spawns = participant.team === "A" ? arena.teamA : arena.teamB;
    const spawn = spawns[index] ?? spawns[0];
    const { user, client } = session;

    game.forceDismount(user.id);
    game.revivirUsuario(user.id, {
        hp: Number(user.maxHp ?? user.hp ?? 1),
        mana: Number(user.maxMana ?? user.mana ?? 0),
    });
    game.setSpellInvisibility(user.id, false);
    user.hiddenSkill = false;
    user.invisibleSpell = false;
    user.envenenado = 0;
    user.inmovilizado = 0;
    user.paralizado = 0;
    user.cooldownParalizado = 0;
    user.pendingMoveQueue = [];
    user.rankedArena = true;
    user.rankedMatchId = activeMatchesByCharacter.get(participant.id)?.id ?? null;
    user.rankedTeam = participant.team;
    user.rankedLockedUntil = lockedUntil;

    game.telep(client, arena.map, spawn?.x ?? 50, spawn?.y ?? 50, `ranked-round-${participant.team}`);
    syncClient(client);
}

function startRound(match: RankedActiveMatch) {
    if (match.finished) {
        return;
    }

    match.resolvingRound = false;
    clearTimers(match);
    const lockedUntil = Date.now() + RANKED_ROUND_COUNTDOWN_SECONDS * 1000;
    match.participants.A.forEach((participant, index) => prepareUserForRound(participant, match.arena, index, lockedUntil));
    match.participants.B.forEach((participant, index) => prepareUserForRound(participant, match.arena, index, lockedUntil));
    tellMany(
        getAllParticipants(match).map((participant) => participant.id),
        `Ronda lista. Marcador ${match.score.A}-${match.score.B}. Pelea habilitada en ${RANKED_ROUND_COUNTDOWN_SECONDS} segundos.`,
    );
    sendRankedStateToMany(getAllParticipants(match).map((participant) => participant.id));
}

function restoreParticipant(match: RankedActiveMatch, participant: RankedMatchParticipant) {
    const user = getCharacterById(participant.id);
    const client = getClientById(participant.id);

    if (!user) {
        return;
    }

    user.rankedArena = false;
    user.rankedMatchId = null;
    user.rankedTeam = null;
    user.rankedLockedUntil = 0;
    user.inmovilizado = 0;
    user.paralizado = 0;
    user.cooldownParalizado = 0;

    if (!client) {
        return;
    }

    game.revivirUsuario(user.id, {
        hp: Number(user.maxHp ?? user.hp ?? 1),
        mana: Number(user.maxMana ?? user.mana ?? 0),
    });
    game.setSpellInvisibility(user.id, false);
    game.telep(
        client,
        participant.originalMap,
        participant.originalPos.x,
        participant.originalPos.y,
        `ranked-return-${match.id}`,
    );
}

function unregisterMatch(match: RankedActiveMatch) {
    activeMatchesById.delete(match.id);
    for (const participant of getAllParticipants(match)) {
        activeMatchesByCharacter.delete(participant.id);
    }
    arenaService.releaseArena(match.map);
    clearTimers(match);
}

async function finishMatch(match: RankedActiveMatch, winnerTeam: RankedTeam, reason = "victoria") {
    if (match.finished) {
        return;
    }

    match.finished = true;
    const loserTeam = getOppositeTeam(winnerTeam);
    const winners = match.participants[winnerTeam];
    const losers = match.participants[loserTeam];
    const eloChange = calculateRankedEloChange(match.teamEloBefore[winnerTeam], match.teamEloBefore[loserTeam]);
    const winnerEloAfter = Math.max(0, match.teamEloBefore[winnerTeam] + eloChange.winnerDelta);
    const loserEloAfter = Math.max(0, match.teamEloBefore[loserTeam] + eloChange.loserDelta);

    try {
        await persistRankedMatch({
            id: match.id,
            mode: match.mode,
            arenaMapId: match.map,
            startedAt: new Date(match.startedAt).toISOString(),
            finishedAt: new Date().toISOString(),
            teamAEloBefore: match.teamEloBefore.A,
            teamBEloBefore: match.teamEloBefore.B,
            teamAEloAfter: winnerTeam === "A" ? winnerEloAfter : loserEloAfter,
            teamBEloAfter: winnerTeam === "B" ? winnerEloAfter : loserEloAfter,
            winnerTeam,
            scoreA: match.score.A,
            scoreB: match.score.B,
            participants: [
                ...winners.map((winner) => ({
                    characterId: winner.persistedId,
                    team: winner.team,
                    eloBefore: winner.eloBefore,
                    eloAfter: Math.max(0, winner.eloBefore + eloChange.winnerDelta),
                    eloDelta: eloChange.winnerDelta,
                    result: "win" as const,
                })),
                ...losers.map((loser) => ({
                    characterId: loser.persistedId,
                    team: loser.team,
                    eloBefore: loser.eloBefore,
                    eloAfter: Math.max(0, loser.eloBefore + eloChange.loserDelta),
                    eloDelta: eloChange.loserDelta,
                    result: reason === "abandono" ? ("abandoned" as const) : ("loss" as const),
                })),
            ],
            metadata: {
                reason,
                winnerName: getTeamNames(winners),
                loserName: getTeamNames(losers),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        tellMany(getAllParticipants(match).map((participant) => participant.id), `No se pudo persistir el resultado (${message}).`, "white");
    }

    for (const winner of winners) {
        const user = getCharacterById(winner.id);
        if (user) {
            user.elo = Math.max(0, winner.eloBefore + eloChange.winnerDelta);
        }
        tell(winner.id, `Victoria ${match.score.A}-${match.score.B}. +${eloChange.winnerDelta} ELO.`);
    }
    for (const loser of losers) {
        const user = getCharacterById(loser.id);
        if (user) {
            user.elo = Math.max(0, loser.eloBefore + eloChange.loserDelta);
        }
        tell(loser.id, `Derrota ${match.score.A}-${match.score.B}. ${eloChange.loserDelta} ELO.`);
    }

    broadcast(
        `[RANKED ${formatMode(match.mode).toUpperCase()}] ${getTeamNames(winners)} vencio a ${getTeamNames(losers)} ${match.score.A}-${match.score.B}.`,
    );

    const ids = getAllParticipants(match).map((participant) => participant.id);
    for (const participant of getAllParticipants(match)) {
        restoreParticipant(match, participant);
    }
    unregisterMatch(match);
    sendRankedStateToMany(ids);
}

function scheduleNextRound(match: RankedActiveMatch, winnerTeam: RankedTeam) {
    if (match.finished || match.resolvingRound) {
        return;
    }

    match.resolvingRound = true;
    match.score[winnerTeam] += 1;
    const scoreText = `${match.score.A}-${match.score.B}`;
    tellMany(getAllParticipants(match).map((participant) => participant.id), `Fin de ronda. Marcador ${scoreText}.`);

    if (match.score[winnerTeam] >= 2) {
        void finishMatch(match, winnerTeam);
        return;
    }

    const timerId = setTimeout(() => {
        startRound(match);
    }, NEXT_ROUND_DELAY_MS);
    match.timerIds.push(timerId);
}

function buildParticipant(id: string, team: RankedTeam, rating: RankedRating): RankedMatchParticipant | null {
    const user = getCharacterById(id);
    const persistedId = getPersistedId(user);

    if (!user || !persistedId) {
        return null;
    }

    return {
        id,
        persistedId,
        name: String(user.nameCharacter ?? "Jugador"),
        team,
        eloBefore: rating.elo,
        originalMap: Number(user.map ?? 34),
        originalPos: {
            x: Number(user.pos?.x ?? 50),
            y: Number(user.pos?.y ?? 50),
        },
    };
}

async function getRatingsForEntries(left: RankedQueueEntry, right: RankedQueueEntry) {
    const ids = [...left.memberCharacterIds, ...right.memberCharacterIds]
        .map((id) => getPersistedId(getCharacterById(id)))
        .filter((id): id is string => Boolean(id));
    const ratings = await fetchRankedRatings(ids, left.mode);
    return new Map(ratings.map((rating) => [rating.characterId, rating]));
}

function buildTeamParticipants(entry: RankedQueueEntry, team: RankedTeam, ratingByCharacterId: Map<string, RankedRating>) {
    const participants: RankedMatchParticipant[] = [];

    for (const id of entry.memberCharacterIds) {
        const persistedId = getPersistedId(getCharacterById(id));
        const rating = persistedId ? ratingByCharacterId.get(persistedId) : null;
        if (!rating) {
            return null;
        }

        const participant = buildParticipant(id, team, rating);
        if (!participant) {
            return null;
        }

        participants.push(participant);
    }

    return participants;
}

async function startMatch(left: RankedQueueEntry, right: RankedQueueEntry) {
    if (left.mode !== right.mode || left.memberCharacterIds.length !== right.memberCharacterIds.length) {
        return false;
    }

    const matchId = crypto.randomUUID();
    const reservation = arenaService.reserveFreeArena(matchId);
    if (!reservation) {
        return false;
    }

    const arena = arenaService.getArenaConfig(reservation.map);
    const allIds = [...left.memberCharacterIds, ...right.memberCharacterIds];
    const allSessions = allIds.map((id) => getOnlineSessionById(id));

    if (!arena || allSessions.some((session) => !session)) {
        arenaService.releaseArena(reservation.map);
        return false;
    }

    const ratingByCharacterId = await getRatingsForEntries(left, right);
    const participantsA = buildTeamParticipants(left, "A", ratingByCharacterId);
    const participantsB = buildTeamParticipants(right, "B", ratingByCharacterId);
    if (!participantsA || !participantsB) {
        arenaService.releaseArena(reservation.map);
        return false;
    }

    queueService.leaveByEntryId(left.id, "match-found");
    queueService.leaveByEntryId(right.id, "match-found");

    const match: RankedActiveMatch = {
        id: String(reservation.reservedByMatchId ?? matchId),
        mode: left.mode,
        map: reservation.map,
        arena,
        startedAt: Date.now(),
        participants: {
            A: participantsA,
            B: participantsB,
        },
        teamEloBefore: {
            A: left.teamElo,
            B: right.teamElo,
        },
        score: {
            A: 0,
            B: 0,
        },
        resolvingRound: false,
        finished: false,
        timerIds: [],
    };

    arenaService.setArenaState(match.map, "IN_MATCH");
    activeMatchesById.set(match.id, match);
    for (const participant of getAllParticipants(match)) {
        activeMatchesByCharacter.set(participant.id, match);
        const session = getOnlineSessionById(participant.id);
        if (session) {
            session.user.rankedArena = true;
            session.user.rankedMatchId = match.id;
            session.user.rankedTeam = participant.team;
        }
        game.forceDismount(participant.id);
    }

    broadcast(
        `[RANKED ${formatMode(match.mode).toUpperCase()}] ${getTeamNames(participantsA)} [${formatRating(left.teamElo)}] VS ${getTeamNames(participantsB)} [${formatRating(right.teamElo)}]. Arena #${match.map}. Serie: Mejor de 3.`,
    );
    tellMany(participantsA.map((participant) => participant.id), `Rival encontrado: ${getTeamNames(participantsB)} (${formatRating(right.teamElo)}).`);
    tellMany(participantsB.map((participant) => participant.id), `Rival encontrado: ${getTeamNames(participantsA)} (${formatRating(left.teamElo)}).`);
    startRound(match);
    return true;
}

async function completeMatchConfirmation(confirmation: RankedConfirmation) {
    if (!confirmation.matchFound) {
        return { ok: false, message: "Confirmacion invalida." };
    }

    clearConfirmation(confirmation);
    const started = await startMatch(confirmation.matchFound.left, confirmation.matchFound.right);
    if (!started) {
        const ids = confirmation.participantIds;
        queueService.leaveByEntryId(confirmation.matchFound.left.id, "admin");
        queueService.leaveByEntryId(confirmation.matchFound.right.id, "admin");
        tellMany(ids, "No se pudo iniciar el duelo Ranked. La cola fue cancelada.", "white");
        sendRankedStateToMany(ids);
        return { ok: false, message: "No se pudo iniciar el duelo Ranked." };
    }

    sendRankedStateToMany(confirmation.participantIds);
    return { ok: true, message: "Duelo Ranked confirmado." };
}

function createMatchConfirmation(left: RankedQueueEntry, right: RankedQueueEntry) {
    queueService.setStatus(left.id, "MATCH_FOUND");
    queueService.setStatus(right.id, "MATCH_FOUND");
    const participantIds = [...left.memberCharacterIds, ...right.memberCharacterIds].map(String);
    createConfirmation({
        kind: "MATCH_FOUND",
        mode: left.mode,
        participantIds,
        timeoutMs: MATCH_CONFIRMATION_MS,
        matchFound: { left, right },
    });
    tellMany(participantIds, `Duelo Ranked ${formatMode(left.mode)} encontrado. Tienen que aceptar para iniciar.`);
}

function removeInvalidQueuedEntries() {
    for (const mode of [MODE_1V1, MODE_2V2] as const) {
        for (const entry of queueService.list(mode)) {
            if (entry.status !== "QUEUED") {
                continue;
            }

            const partySize = mode === MODE_2V2 ? 2 : undefined;
            const invalidMember = entry.memberCharacterIds.find((id) => {
                const user = getCharacterById(String(id));
                if (!user || activeMatchesByCharacter.has(String(id))) {
                    return true;
                }

                const eligibility = getRankedEligibility()(user, {
                    mode,
                    isQueued: true,
                    isInMatch: false,
                    partySize,
                });
                return !eligibility.ok;
            });
            if (!invalidMember) {
                continue;
            }

            queueService.leaveByEntryId(entry.id, "left-safe-zone");
            tellMany(entry.memberCharacterIds.map(String), "Has salido de la cola Ranked porque el equipo ya no cumple las condiciones.");
            sendRankedStateToMany(entry.memberCharacterIds.map(String));
        }
    }
}

async function joinSoloQueue(idUser: string) {
    const validation = validateMemberForQueue(idUser, MODE_1V1);
    if (!validation.ok) {
        return validation;
    }

    const persistedId = getPersistedId(getCharacterById(idUser));
    if (!persistedId) {
        return { ok: false, message: "El personaje todavia no esta listo para Ranked." };
    }

    const rating = await fetchRankedRating(persistedId, MODE_1V1);
    const entry = queueService.join({
        id: crypto.randomUUID(),
        mode: MODE_1V1,
        leaderCharacterId: idUser,
        memberCharacterIds: [idUser],
        teamElo: calculateTeamEloAverage([rating.elo]),
    });
    const range = getMatchmakingRange(entry);
    void sendRankedState(idUser);

    return {
        ok: true,
        message: `Entraste a la cola Ranked 1v1. ${formatRating(rating.elo)}. Busqueda inicial: ${range.minElo}-${range.maxElo} ELO.`,
    };
}

function requestPartyQueue(idUser: string) {
    const partyValidation = getValidatedParty2v2(idUser);
    if (!partyValidation.ok) {
        return partyValidation;
    }

    const teammateId = partyValidation.memberIds.find((id: string) => id !== idUser);
    if (!teammateId) {
        return { ok: false, message: "No se encontro tu companero de party." };
    }

    const confirmation = createConfirmation({
        kind: "PARTY_QUEUE",
        mode: MODE_2V2,
        participantIds: partyValidation.memberIds,
        acceptedIds: [idUser],
        timeoutMs: PARTY_CONFIRMATION_MS,
        partyQueue: {
            leaderId: idUser,
            memberIds: partyValidation.memberIds,
        },
    });
    tell(idUser, `Solicitud enviada a ${getUserName(teammateId)}. Esperando confirmacion.`);
    tell(teammateId, `${getUserName(idUser)} quiere anotarte a Ranked 2v2. Usa /rankedaceptar o /rankedrechazar.`);
    sendRankedStateToMany(confirmation.participantIds);
    return { ok: true, message: "Solicitud Ranked 2v2 enviada." };
}

export async function toggleQueue(idUser: string, rawMode = "") {
    const user = getCharacterById(idUser);
    if (!user) {
        return { ok: false, message: "No se pudo entrar a Ranked." };
    }

    if (activeMatchesByCharacter.has(idUser)) {
        return { ok: false, message: "Ya estas en un combate Ranked." };
    }

    const pending = getConfirmationForCharacter(idUser);
    if (pending) {
        return { ok: false, message: "Ya tienes una confirmacion Ranked pendiente." };
    }

    const currentEntry = queueService.getByCharacterId(idUser);
    if (currentEntry) {
        queueService.leaveByEntryId(currentEntry.id, "manual");
        tellMany(currentEntry.memberCharacterIds.map(String), "Salieron de la cola Ranked.");
        sendRankedStateToMany(currentEntry.memberCharacterIds.map(String));
        return { ok: true, message: "Saliste de la cola Ranked." };
    }

    const normalizedMode = rawMode.trim().toLowerCase().replace(/\s+/g, "");
    if (["2", "2v2", "2vs2"].includes(normalizedMode)) {
        return requestPartyQueue(idUser);
    }

    return joinSoloQueue(idUser);
}

export async function acceptConfirmation(idUser: string) {
    const confirmation = getConfirmationForCharacter(idUser);
    if (!confirmation) {
        return { ok: false, message: "No tienes una confirmacion Ranked pendiente." };
    }

    if (Date.now() > confirmation.expiresAt) {
        expireConfirmation(confirmation.id);
        return { ok: false, message: "La confirmacion Ranked expiro." };
    }

    confirmation.acceptedIds.add(idUser);
    sendRankedStateToMany(confirmation.participantIds);

    if (confirmation.acceptedIds.size < confirmation.participantIds.length) {
        return { ok: true, message: "Confirmaste Ranked. Esperando al resto." };
    }

    if (confirmation.kind === "PARTY_QUEUE") {
        return completePartyQueueConfirmation(confirmation);
    }

    return completeMatchConfirmation(confirmation);
}

export function rejectConfirmation(idUser: string, reason = "manual") {
    void reason;
    const confirmation = getConfirmationForCharacter(idUser);
    if (!confirmation) {
        return { ok: false, message: "No tienes una confirmacion Ranked pendiente." };
    }

    cancelConfirmation(confirmation, `${getUserName(idUser)} rechazo la confirmacion Ranked.`);
    return { ok: true, message: "Rechazaste la confirmacion Ranked." };
}

export function onUserDied(idUser: string) {
    const pending = getConfirmationForCharacter(String(idUser));
    if (pending) {
        cancelConfirmation(pending, `${getUserName(String(idUser))} murio y la confirmacion Ranked fue cancelada.`);
    }

    const queued = queueService.leaveByCharacterId(String(idUser), "death");
    if (queued) {
        tellMany(queued.memberCharacterIds.map(String), "Han salido de la cola Ranked porque un integrante murio.");
        sendRankedStateToMany(queued.memberCharacterIds.map(String));
    }

    const match = activeMatchesByCharacter.get(String(idUser));
    if (!match || match.finished) {
        return;
    }

    const participant = getParticipantFromMatch(match, String(idUser));
    if (!participant) {
        return;
    }

    scheduleNextRound(match, getOppositeTeam(participant.team));
}

export function onUserLeft(idUser: string) {
    const pending = getConfirmationForCharacter(String(idUser));
    if (pending) {
        cancelConfirmation(pending, `${getUserName(String(idUser))} se desconecto y la confirmacion Ranked fue cancelada.`);
    }

    const queued = queueService.leaveByCharacterId(String(idUser), "disconnect");
    if (queued) {
        sendRankedStateToMany(queued.memberCharacterIds.map(String));
    }

    const match = activeMatchesByCharacter.get(String(idUser));
    if (!match || match.finished) {
        return;
    }

    const participant = getParticipantFromMatch(match, String(idUser));
    if (!participant) {
        return;
    }

    void finishMatch(match, getOppositeTeam(participant.team), "abandono");
}

export async function tick() {
    if (matchmakingInFlight) {
        return;
    }

    matchmakingInFlight = true;
    try {
        removeInvalidQueuedEntries();
        for (const mode of [MODE_1V1, MODE_2V2] as const) {
            const waiting = queueService.list(mode).filter((entry) => entry.status === "QUEUED");

            for (const entry of waiting) {
                if (!queueService.getByCharacterId(entry.leaderCharacterId)) {
                    continue;
                }

                const candidate = selectBestMatchCandidate(entry, queueService.list(mode));
                if (!candidate) {
                    continue;
                }

                createMatchConfirmation(entry, candidate.entry);
                break;
            }
        }
    } finally {
        matchmakingInFlight = false;
    }
}

export function initialize() {
    if (timer) {
        return;
    }

    arenaService.reset();
    queueService.clear();
    confirmationsById.clear();
    confirmationByCharacterId.clear();
    timer = setInterval(() => {
        void tick();
    }, MATCHMAKING_TICK_MS);
}
