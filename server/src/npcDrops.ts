export const DEFAULT_NPC_DROP_CHANCE_PERCENT = 100;
const LEGACY_NPC_DROP_CHANCES = [90, 10, 1, 0.1, 0.01] as const;

export type NpcDropChanceEntry = {
    item?: number;
    cant?: number;
    chancePercent?: unknown;
    chance?: unknown;
    probabilityPercent?: unknown;
    probabilidad?: unknown;
};

const DROP_CHANCE_KEYS = ["chancePercent", "chance", "probabilityPercent", "probabilidad"] as const;

function toFiniteNumber(value: unknown): number | null {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
        const parsed = Number(value.trim().replace("%", "").replace(",", "."));
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

export function clampDropChancePercent(value: number): number {
    return Math.min(100, Math.max(0, value));
}

export function getNpcDropChancePercent(
    entry: NpcDropChanceEntry,
    fallback = DEFAULT_NPC_DROP_CHANCE_PERCENT,
): number {
    for (const key of DROP_CHANCE_KEYS) {
        const parsed = toFiniteNumber(entry[key]);
        if (parsed !== null) {
            return clampDropChancePercent(parsed);
        }
    }

    return clampDropChancePercent(fallback);
}

export function getLegacyNpcDropChancePercent(index: number): number {
    if (index < LEGACY_NPC_DROP_CHANCES.length) {
        return LEGACY_NPC_DROP_CHANCES[index] ?? DEFAULT_NPC_DROP_CHANCE_PERCENT;
    }

    return LEGACY_NPC_DROP_CHANCES[LEGACY_NPC_DROP_CHANCES.length - 1];
}

export function shouldDropNpcItem(
    entry: NpcDropChanceEntry,
    rollPercent = Math.random() * 100,
    fallback = DEFAULT_NPC_DROP_CHANCE_PERCENT,
): boolean {
    const chancePercent = getNpcDropChancePercent(entry, fallback);

    if (chancePercent <= 0) {
        return false;
    }

    if (chancePercent >= 100) {
        return true;
    }

    return rollPercent < chancePercent;
}
