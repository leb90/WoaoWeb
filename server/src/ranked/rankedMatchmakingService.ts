import {
    MATCHMAKING_EXTRA_EXPANSION_ELO,
    MATCHMAKING_EXTRA_EXPANSION_SECONDS,
    MATCHMAKING_WINDOWS,
    type RankedMode,
} from "./rankedConfig";
import type { RankedQueueEntry } from "./rankedTypes";

export type RankedMatchmakingRange = {
    minElo: number;
    maxElo: number;
    eloRange: number;
};

export type RankedMatchCandidate = {
    entry: RankedQueueEntry;
    eloDifference: number;
};

function normalizeNow(now?: number) {
    return Number.isFinite(now) ? Number(now) : Date.now();
}

function getElapsedSeconds(enqueuedAt: number, now?: number) {
    return Math.max(0, Math.floor((normalizeNow(now) - enqueuedAt) / 1000));
}

export function getMatchmakingEloRange(waitSeconds: number) {
    const safeWaitSeconds = Math.max(0, Math.floor(Number.isFinite(waitSeconds) ? waitSeconds : 0));
    const baseWindow = [...MATCHMAKING_WINDOWS]
        .reverse()
        .find((window) => safeWaitSeconds >= window.afterSeconds);

    if (!baseWindow) {
        return MATCHMAKING_WINDOWS[0].eloRange;
    }

    const lastWindow = MATCHMAKING_WINDOWS[MATCHMAKING_WINDOWS.length - 1];
    if (baseWindow !== lastWindow) {
        return baseWindow.eloRange;
    }

    const extraWait = Math.max(0, safeWaitSeconds - lastWindow.afterSeconds);
    const extraSteps = Math.floor(extraWait / MATCHMAKING_EXTRA_EXPANSION_SECONDS);
    return lastWindow.eloRange + extraSteps * MATCHMAKING_EXTRA_EXPANSION_ELO;
}

export function getMatchmakingRange(entry: Pick<RankedQueueEntry, "teamElo" | "enqueuedAt">, now?: number): RankedMatchmakingRange {
    const eloRange = getMatchmakingEloRange(getElapsedSeconds(entry.enqueuedAt, now));
    const teamElo = Math.max(0, Math.floor(entry.teamElo));

    return {
        minElo: Math.max(0, teamElo - eloRange),
        maxElo: teamElo + eloRange,
        eloRange,
    };
}

function isSameParticipants(left: RankedQueueEntry, right: RankedQueueEntry) {
    return left.memberCharacterIds.some((characterId) => right.memberCharacterIds.includes(characterId));
}

function canMatchEntry(request: RankedQueueEntry, candidate: RankedQueueEntry, mode: RankedMode, now?: number) {
    if (candidate.status !== "QUEUED" || request.status !== "QUEUED") {
        return false;
    }

    if (candidate.id === request.id || candidate.mode !== mode || isSameParticipants(request, candidate)) {
        return false;
    }

    const eloDifference = Math.abs(candidate.teamElo - request.teamElo);
    const requestRange = getMatchmakingRange(request, now).eloRange;
    const candidateRange = getMatchmakingRange(candidate, now).eloRange;

    return eloDifference <= requestRange && eloDifference <= candidateRange;
}

export function selectBestMatchCandidate(
    request: RankedQueueEntry,
    candidates: readonly RankedQueueEntry[],
    now?: number,
): RankedMatchCandidate | null {
    const compatible = candidates
        .filter((candidate) => canMatchEntry(request, candidate, request.mode, now))
        .map((entry) => ({
            entry,
            eloDifference: Math.abs(entry.teamElo - request.teamElo),
        }))
        .sort((left, right) => {
            const byDifference = left.eloDifference - right.eloDifference;
            if (byDifference !== 0) {
                return byDifference;
            }

            return left.entry.enqueuedAt - right.entry.enqueuedAt;
        });

    return compatible[0] ?? null;
}

