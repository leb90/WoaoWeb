import type { RankedMode } from "./rankedConfig";

export type RankedQueueStatus = "NONE" | "QUEUED" | "MATCH_FOUND" | "IN_MATCH";

export type RankedTeamSide = "A" | "B";

export type RankedMatchState =
    | "CREATED"
    | "RESERVING_ARENA"
    | "PREPARING"
    | "ROUND_COUNTDOWN"
    | "ROUND_ACTIVE"
    | "ROUND_END"
    | "MATCH_END"
    | "RETURNING_PLAYERS"
    | "COMPLETED"
    | "ABORTED";

export type RankedArenaState = "FREE" | "RESERVED" | "IN_MATCH" | "RESETTING";

export type RankedQueueEntry = {
    id: string;
    mode: RankedMode;
    leaderCharacterId: string;
    memberCharacterIds: readonly string[];
    teamElo: number;
    enqueuedAt: number;
    status: RankedQueueStatus;
};

export type RankedQueueJoinRequest = {
    id: string;
    mode: RankedMode;
    leaderCharacterId: string;
    memberCharacterIds: readonly string[];
    teamElo: number;
    now?: number;
};

export type RankedArenaReservation = {
    map: number;
    state: RankedArenaState;
    reservedByMatchId: string | null;
    reservedAt: number | null;
};

