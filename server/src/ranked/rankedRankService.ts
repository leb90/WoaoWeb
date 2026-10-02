import {
    RANKED_DIVISION_LABELS,
    RANKED_DIVISION_WIDTH,
    RANKED_TIERS,
    type RankedTierConfig,
    type RankedTierId,
} from "./rankedConfig";

export type RankedRank = {
    tier: RankedTierId;
    tierLabel: string;
    division: number | null;
    divisionLabel: string | null;
    label: string;
    minElo: number;
    maxElo: number;
    divisionMinElo: number;
    divisionMaxElo: number | null;
    nextDivisionMinElo: number | null;
    progress: {
        current: number;
        required: number;
        ratio: number;
    };
};

function normalizeElo(elo: number) {
    return Math.max(0, Math.floor(Number.isFinite(elo) ? elo : 0));
}

function findTier(elo: number): RankedTierConfig {
    return RANKED_TIERS.find((tier) => elo >= tier.minElo && elo <= tier.maxElo) ?? RANKED_TIERS[RANKED_TIERS.length - 1];
}

function clampRatio(value: number) {
    return Math.max(0, Math.min(1, value));
}

export function getRankFromElo(rawElo: number): RankedRank {
    const elo = normalizeElo(rawElo);
    const tier = findTier(elo);

    if (tier.id === "KING") {
        return {
            tier: tier.id,
            tierLabel: tier.label,
            division: null,
            divisionLabel: null,
            label: tier.label,
            minElo: tier.minElo,
            maxElo: tier.maxElo,
            divisionMinElo: tier.minElo,
            divisionMaxElo: null,
            nextDivisionMinElo: null,
            progress: {
                current: elo - tier.minElo,
                required: 0,
                ratio: 1,
            },
        };
    }

    const offset = Math.max(0, elo - tier.minElo);
    const divisionIndex = Math.min(tier.divisions - 1, Math.floor(offset / RANKED_DIVISION_WIDTH));
    const division = tier.divisions - divisionIndex;
    const divisionLabel = RANKED_DIVISION_LABELS[divisionIndex] ?? "I";
    const divisionMinElo = tier.minElo + divisionIndex * RANKED_DIVISION_WIDTH;
    const divisionMaxElo = Math.min(tier.maxElo, divisionMinElo + RANKED_DIVISION_WIDTH - 1);
    const nextDivisionMinElo = divisionIndex + 1 < tier.divisions ? divisionMaxElo + 1 : tier.maxElo + 1;
    const current = Math.max(0, elo - divisionMinElo);
    const required = Math.max(1, nextDivisionMinElo - divisionMinElo);

    return {
        tier: tier.id,
        tierLabel: tier.label,
        division,
        divisionLabel,
        label: `${tier.label} ${divisionLabel}`,
        minElo: tier.minElo,
        maxElo: tier.maxElo,
        divisionMinElo,
        divisionMaxElo,
        nextDivisionMinElo,
        progress: {
            current,
            required,
            ratio: clampRatio(current / required),
        },
    };
}

