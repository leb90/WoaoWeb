import { RANKED_K_FACTOR } from "./rankedConfig";

export type RankedEloChange = {
    winnerDelta: number;
    loserDelta: number;
    winnerEloAfter: number;
    loserEloAfter: number;
    expectedWinner: number;
    expectedLoser: number;
};

function normalizeElo(elo: number) {
    return Math.max(0, Math.floor(Number.isFinite(elo) ? elo : 0));
}

export function calculateExpectedScore(eloA: number, eloB: number) {
    const safeA = normalizeElo(eloA);
    const safeB = normalizeElo(eloB);
    return 1 / (1 + 10 ** ((safeB - safeA) / 400));
}

export function calculateTeamEloAverage(elos: readonly number[]) {
    if (!elos.length) {
        return 0;
    }

    const total = elos.reduce((sum, elo) => sum + normalizeElo(elo), 0);
    return Math.round(total / elos.length);
}

export function calculateRankedEloChange(winnerElo: number, loserElo: number, kFactor = RANKED_K_FACTOR): RankedEloChange {
    const safeWinnerElo = normalizeElo(winnerElo);
    const safeLoserElo = normalizeElo(loserElo);
    const expectedWinner = calculateExpectedScore(safeWinnerElo, safeLoserElo);
    const expectedLoser = calculateExpectedScore(safeLoserElo, safeWinnerElo);
    const winnerDelta = Math.max(1, Math.round(kFactor * (1 - expectedWinner)));
    const loserDelta = -Math.max(1, Math.round(kFactor * expectedLoser));

    return {
        winnerDelta,
        loserDelta,
        winnerEloAfter: safeWinnerElo + winnerDelta,
        loserEloAfter: Math.max(0, safeLoserElo + loserDelta),
        expectedWinner,
        expectedLoser,
    };
}

