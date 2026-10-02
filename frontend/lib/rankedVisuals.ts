import type { RankedRankPayload } from "./aowProtocol";

export type RankedTierId =
    | "BRONCE"
    | "PLATA"
    | "ORO"
    | "PLATINO"
    | "DIAMANTE"
    | "MAESTRO"
    | "GRAN_MAESTRO"
    | "KING";

export type RankedCharacterRank = {
    tier: string;
    label: string;
};

type RankedTierVisual = {
    id: RankedTierId;
    label: string;
    asset: string;
    textColor: string;
    textColorNumber: number;
    glow: string;
    minElo: number;
    maxElo: number;
    divisions: number;
};

const DIVISION_LABELS = ["V", "IV", "III", "II", "I"] as const;
const DIVISION_WIDTH = 100;

export const RANKED_TIER_VISUALS: RankedTierVisual[] = [
    {
        id: "BRONCE",
        label: "Bronce",
        asset: "/ranks/bronce.png",
        textColor: "#cd8a55",
        textColorNumber: 0xcd8a55,
        glow: "rgba(205,138,85,0.28)",
        minElo: 0,
        maxElo: 499,
        divisions: 5,
    },
    {
        id: "PLATA",
        label: "Plata",
        asset: "/ranks/plata.png",
        textColor: "#d6dbe5",
        textColorNumber: 0xd6dbe5,
        glow: "rgba(214,219,229,0.24)",
        minElo: 500,
        maxElo: 999,
        divisions: 5,
    },
    {
        id: "ORO",
        label: "Oro",
        asset: "/ranks/oro.png",
        textColor: "#f3c04f",
        textColorNumber: 0xf3c04f,
        glow: "rgba(243,192,79,0.26)",
        minElo: 1000,
        maxElo: 1499,
        divisions: 5,
    },
    {
        id: "PLATINO",
        label: "Platino",
        asset: "/ranks/platino.png",
        textColor: "#7dd3fc",
        textColorNumber: 0x7dd3fc,
        glow: "rgba(125,211,252,0.22)",
        minElo: 1500,
        maxElo: 1999,
        divisions: 5,
    },
    {
        id: "DIAMANTE",
        label: "Diamante",
        asset: "/ranks/diamante.png",
        textColor: "#8da2ff",
        textColorNumber: 0x8da2ff,
        glow: "rgba(141,162,255,0.25)",
        minElo: 2000,
        maxElo: 2499,
        divisions: 5,
    },
    {
        id: "MAESTRO",
        label: "Maestro",
        asset: "/ranks/maestro.png",
        textColor: "#c084fc",
        textColorNumber: 0xc084fc,
        glow: "rgba(192,132,252,0.26)",
        minElo: 2500,
        maxElo: 2999,
        divisions: 5,
    },
    {
        id: "GRAN_MAESTRO",
        label: "Gran Maestro",
        asset: "/ranks/gran-maestro.png",
        textColor: "#fb7185",
        textColorNumber: 0xfb7185,
        glow: "rgba(251,113,133,0.26)",
        minElo: 3000,
        maxElo: 3499,
        divisions: 5,
    },
    {
        id: "KING",
        label: "King",
        asset: "/ranks/king.png",
        textColor: "#f59e0b",
        textColorNumber: 0xf59e0b,
        glow: "rgba(245,158,11,0.34)",
        minElo: 3500,
        maxElo: Number.POSITIVE_INFINITY,
        divisions: 1,
    },
];

export function getRankTierVisual(tier: string | null | undefined): RankedTierVisual {
    return (
        RANKED_TIER_VISUALS.find((entry) => entry.id === tier) ??
        RANKED_TIER_VISUALS[0]
    );
}

export function getRankTierColorNumber(tier: string | null | undefined): number {
    return getRankTierVisual(tier).textColorNumber;
}

export function formatRankedCharacterName(
    name: string | null | undefined,
    rank?: RankedCharacterRank | null,
): string {
    const baseName = name?.trim() || "Jugador";

    if (!rank?.label) {
        return baseName;
    }

    return `<${rank.label}> ${baseName}`;
}

function clampRatio(value: number): number {
    return Math.max(0, Math.min(1, value));
}

export function getRankFromElo(rawElo: number): RankedRankPayload {
    const elo = Math.max(0, Math.floor(Number.isFinite(rawElo) ? rawElo : 0));
    const tier =
        RANKED_TIER_VISUALS.find(
            (entry) => elo >= entry.minElo && elo <= entry.maxElo,
        ) ?? RANKED_TIER_VISUALS[RANKED_TIER_VISUALS.length - 1];

    if (tier.id === "KING") {
        return {
            tier: tier.id,
            tierLabel: tier.label,
            division: null,
            divisionLabel: null,
            label: tier.label,
            minElo: tier.minElo,
            maxElo: null,
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
    const divisionIndex = Math.min(
        tier.divisions - 1,
        Math.floor(offset / DIVISION_WIDTH),
    );
    const division = tier.divisions - divisionIndex;
    const divisionLabel = DIVISION_LABELS[divisionIndex] ?? "I";
    const divisionMinElo = tier.minElo + divisionIndex * DIVISION_WIDTH;
    const divisionMaxElo = Math.min(
        tier.maxElo,
        divisionMinElo + DIVISION_WIDTH - 1,
    );
    const nextDivisionMinElo =
        divisionIndex + 1 < tier.divisions ? divisionMaxElo + 1 : tier.maxElo + 1;
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
