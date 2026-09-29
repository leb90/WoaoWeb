export const CLAN_JOIN_PROTECTION_HOURS = 24;
export const CLAN_PVP_PAIR_COOLDOWN_MINUTES = 10;
export const CASTLE_REWARD_INTERVAL_MINUTES = 60;

export const CASTLE_IDS = [
    "norte",
    "sur",
    "este",
    "oeste",
    "fortaleza",
] as const;

export type CastleId = (typeof CASTLE_IDS)[number];

export const CASTLE_REWARD_POINTS: Record<CastleId, number> = {
    norte: 3,
    sur: 3,
    este: 3,
    oeste: 3,
    fortaleza: 4,
};

export const CLAN_POINT_EVENT_TYPES = [
    "CASTLE_REWARD",
    "PVP_TRANSFER",
    "ADMIN_ADJUSTMENT",
    "SEASON_RESET",
] as const;

export type ClanPointEventType = (typeof CLAN_POINT_EVENT_TYPES)[number];

export const CLAN_JOIN_PROTECTION_MS =
    CLAN_JOIN_PROTECTION_HOURS * 60 * 60 * 1000;
export const CLAN_PVP_PAIR_COOLDOWN_MS =
    CLAN_PVP_PAIR_COOLDOWN_MINUTES * 60 * 1000;
export const CASTLE_REWARD_INTERVAL_MS =
    CASTLE_REWARD_INTERVAL_MINUTES * 60 * 1000;
