import type { RankedMode } from "./rankedConfig";

const funct = require("../functions");
const vars = require("../vars");

export type RankedRating = {
    characterId: string;
    mode: RankedMode;
    elo: number;
    wins: number;
    losses: number;
    winStreak: number;
    bestWinStreak: number;
    matchesPlayed: number;
    highestElo: number;
};

export type CompleteRankedMatchParticipant = {
    characterId: string;
    team: "A" | "B";
    eloBefore: number;
    eloAfter: number;
    eloDelta: number;
    result: "win" | "loss" | "draw" | "abandoned" | "pending";
};

export type CompleteRankedMatchPayload = {
    id?: string;
    mode: RankedMode;
    arenaMapId: number | null;
    startedAt: string;
    finishedAt: string;
    teamAEloBefore: number;
    teamBEloBefore: number;
    teamAEloAfter: number;
    teamBEloAfter: number;
    winnerTeam: "A" | "B";
    scoreA: number;
    scoreB: number;
    participants: CompleteRankedMatchParticipant[];
    metadata?: Record<string, unknown>;
};

function authHeaders(extra?: Record<string, string>) {
    return {
        ...(extra ?? {}),
        Authorization: vars.tokenAuth,
    };
}

export async function fetchRankedRating(characterId: string, mode: RankedMode): Promise<RankedRating> {
    return (await funct.fetchUrl(
        `/internal/ranked/ratings/${encodeURIComponent(characterId)}?mode=${encodeURIComponent(mode)}`,
        {
            headers: authHeaders(),
        },
    )) as RankedRating;
}

export async function fetchRankedRatings(characterIds: readonly string[], mode: RankedMode): Promise<RankedRating[]> {
    return (await funct.fetchUrl("/internal/ranked/ratings/batch", {
        method: "POST",
        body: JSON.stringify({ characterIds, mode }),
        headers: authHeaders({
            "Content-Type": "application/json",
        }),
    })) as RankedRating[];
}

export async function persistRankedMatch(payload: CompleteRankedMatchPayload): Promise<{ id: string; status: string }> {
    return (await funct.fetchUrl("/internal/ranked/matches/complete", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: authHeaders({
            "Content-Type": "application/json",
        }),
    })) as { id: string; status: string };
}
