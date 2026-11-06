import levels from "../jsons/clanLevels.json";
export const CLAN_LEVELS = levels;
export function clanLevelConfig(level: number) {
    return levels[Math.max(0, Math.min(5, Math.floor(level || 1) - 1))];
}
export function clanLevelForMembers(count: number) {
    return levels.find((l) => count <= l.maxMembers)?.level ?? 6;
}
