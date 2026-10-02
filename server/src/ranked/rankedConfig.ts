export type RankedMode = "RANKED_1V1" | "RANKED_2V2";

export type RankedTierId =
    | "BRONCE"
    | "PLATA"
    | "ORO"
    | "PLATINO"
    | "DIAMANTE"
    | "MAESTRO"
    | "GRAN_MAESTRO"
    | "KING";

export type RankedTierConfig = {
    id: RankedTierId;
    label: string;
    minElo: number;
    maxElo: number;
    divisions: number;
};

export type MatchmakingWindow = {
    afterSeconds: number;
    eloRange: number;
};

export type RankedArenaSpawn = {
    x: number;
    y: number;
};

export type RankedArenaConfig = {
    map: number;
    teamA: readonly RankedArenaSpawn[];
    teamB: readonly RankedArenaSpawn[];
};

export const RANKED_MODES = ["RANKED_1V1", "RANKED_2V2"] as const satisfies readonly RankedMode[];

export const INITIAL_RANKED_ELO = 0;
export const RANKED_K_FACTOR = 32;
export const RANKED_RECONNECT_SECONDS = 30;
export const RANKED_ROUND_COUNTDOWN_SECONDS = 10;
export const RANKED_ROUND_RESET_DELAY_MS = 3_000;
export const RANKED_DIVISION_WIDTH = 100;

export const RANKED_DIVISION_LABELS = ["V", "IV", "III", "II", "I"] as const;

export const RANKED_TIERS = [
    { id: "BRONCE", label: "Bronce", minElo: 0, maxElo: 499, divisions: 5 },
    { id: "PLATA", label: "Plata", minElo: 500, maxElo: 999, divisions: 5 },
    { id: "ORO", label: "Oro", minElo: 1000, maxElo: 1499, divisions: 5 },
    { id: "PLATINO", label: "Platino", minElo: 1500, maxElo: 1999, divisions: 5 },
    { id: "DIAMANTE", label: "Diamante", minElo: 2000, maxElo: 2499, divisions: 5 },
    { id: "MAESTRO", label: "Maestro", minElo: 2500, maxElo: 2999, divisions: 5 },
    { id: "GRAN_MAESTRO", label: "Gran Maestro", minElo: 3000, maxElo: 3499, divisions: 5 },
    { id: "KING", label: "King", minElo: 3500, maxElo: Number.POSITIVE_INFINITY, divisions: 1 },
] as const satisfies readonly RankedTierConfig[];

export const MATCHMAKING_WINDOWS = [
    { afterSeconds: 0, eloRange: 100 },
    { afterSeconds: 15, eloRange: 200 },
    { afterSeconds: 30, eloRange: 350 },
    { afterSeconds: 45, eloRange: 500 },
    { afterSeconds: 60, eloRange: 750 },
] as const satisfies readonly MatchmakingWindow[];

export const MATCHMAKING_EXTRA_EXPANSION_SECONDS = 30;
export const MATCHMAKING_EXTRA_EXPANSION_ELO = 250;

export const RANKED_QUEUE_ALLOWED_MAPS: readonly number[] = [];

export const RANKED_ARENAS = [
    {
        map: 211,
        teamA: [
            { x: 28, y: 40 },
            { x: 29, y: 40 },
        ],
        teamB: [
            { x: 55, y: 59 },
            { x: 54, y: 59 },
        ],
    },
    {
        map: 212,
        teamA: [
            { x: 28, y: 40 },
            { x: 29, y: 40 },
        ],
        teamB: [
            { x: 55, y: 59 },
            { x: 54, y: 59 },
        ],
    },
    {
        map: 213,
        teamA: [
            { x: 28, y: 40 },
            { x: 29, y: 40 },
        ],
        teamB: [
            { x: 55, y: 59 },
            { x: 54, y: 59 },
        ],
    },
    {
        map: 214,
        teamA: [
            { x: 28, y: 40 },
            { x: 29, y: 40 },
        ],
        teamB: [
            { x: 55, y: 59 },
            { x: 54, y: 59 },
        ],
    },
    {
        map: 215,
        teamA: [
            { x: 28, y: 40 },
            { x: 29, y: 40 },
        ],
        teamB: [
            { x: 55, y: 59 },
            { x: 54, y: 59 },
        ],
    },
] as const satisfies readonly RankedArenaConfig[];
