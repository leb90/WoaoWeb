export const WIKI_TRAINING_MAP_GROUPS = [
    { label: "Dungeons Newbie", mapIds: [37, 168] },
    { label: "Isla Pirata", mapIds: [201] },
    { label: "Nueva Esperanza", mapIds: [111, 112, 113, 114] },
    { label: "Dungeon Marabel", mapIds: [115, 116] },
    {
        label: "Dungeon Veriil",
        mapIds: [140, 141, 142, 146, 143, 144, 145, 48],
    },
    { label: "Mausoleo", mapIds: [281] },
    { label: "Dungeon Inferno", mapIds: [184] },
    { label: "Ruinas de Earost", mapIds: [283, 284, 285] },
    { label: "Polo Norte", mapIds: [286, 287, 288] },
    { label: "Montaña", mapIds: [264, 265, 266, 267, 268, 269, 270, 271] },
    { label: "Dungeon Dragon", mapIds: [166] },
] as const;

export type WikiTrainingMapLike = {
    id: number;
    name: string;
    minLevel: number;
    maxLevel: number;
    topNpcs: Array<{
        npcId: number;
        npcName: string;
        maxHp: number;
        expReward: number;
    }>;
};

export function canEnterMapAtLevel(
    map: Pick<WikiTrainingMapLike, "minLevel" | "maxLevel">,
    level: number,
): boolean {
    const safeLevel = Math.max(1, Math.floor(level));
    const minOk = map.minLevel <= 0 || safeLevel >= map.minLevel;
    const maxOk = map.maxLevel <= 0 || safeLevel <= map.maxLevel;
    return minOk && maxOk;
}

function averageTopNpcHp(map: WikiTrainingMapLike): number {
    if (!map.topNpcs.length) {
        return 0;
    }

    const total = map.topNpcs.reduce((sum, npc) => sum + Math.max(0, Number(npc.maxHp) || 0), 0);
    return total / map.topNpcs.length;
}

export function getRecommendedTrainingMapsForLevel(
    maps: WikiTrainingMapLike[],
    level: number,
    characterAverageHp: number,
    limit = 3,
): Array<WikiTrainingMapLike & { groupLabel: string; score: number }> {
    const mapsById = new Map(maps.map((map) => [map.id, map]));
    const candidates: Array<WikiTrainingMapLike & { groupLabel: string; score: number }> = [];

    for (const group of WIKI_TRAINING_MAP_GROUPS) {
        for (const mapId of group.mapIds) {
            const map = mapsById.get(mapId);
            if (!map || !canEnterMapAtLevel(map, level)) {
                continue;
            }

            const npcHp = averageTopNpcHp(map);
            const score =
                npcHp > 0
                    ? Math.abs(npcHp - Math.max(1, characterAverageHp))
                    : Number.POSITIVE_INFINITY;

            candidates.push({
                ...map,
                groupLabel: group.label,
                score,
            });
        }
    }

    candidates.sort((left, right) => {
        if (left.score !== right.score) {
            return left.score - right.score;
        }
        return left.id - right.id;
    });

    const seenGroups = new Set<string>();
    const selected: typeof candidates = [];

    for (const candidate of candidates) {
        if (seenGroups.has(candidate.groupLabel)) {
            continue;
        }
        seenGroups.add(candidate.groupLabel);
        selected.push(candidate);
        if (selected.length >= limit) {
            break;
        }
    }

    if (selected.length > 0) {
        return selected;
    }

    return maps
        .filter((map) => canEnterMapAtLevel(map, level))
        .slice(0, limit)
        .map((map) => ({
            ...map,
            groupLabel: map.name,
            score: Number.POSITIVE_INFINITY,
        }));
}
