import type { DataNpc } from "./npcData";

export const NPC_RANKS = {
    normal: { label: "Normal", chancePerTenThousand: 9650, hp: 1, damage: 1, reward: 1, drop: 1, color: "white" },
    mejorado: {
        label: "Mejorado",
        chancePerTenThousand: 150,
        hp: 1.5,
        damage: 1.2,
        reward: 2,
        drop: 1.25,
        color: "#35c76d",
    },
    lider: { label: "Líder", chancePerTenThousand: 100, hp: 2, damage: 1.4, reward: 3, drop: 1.5, color: "#60a5fa" },
    especial: { label: "Especial", chancePerTenThousand: 90, hp: 3, damage: 1.7, reward: 5, drop: 2, color: "#b084ee" },
    legendario: {
        label: "Legendario",
        chancePerTenThousand: 10,
        hp: 4,
        damage: 2,
        reward: 7,
        drop: 3,
        color: "#e8b84e",
    },
} as const;
export type NpcRankId = keyof typeof NPC_RANKS;
const EXCLUDED = new Set([699, 692, 666, 667, 587, 594, 633, 611, 585, 621, 778, 676, 726]);

export function rollNpcRank(random: () => number = Math.random): NpcRankId {
    const roll = random() * 10000;
    let boundary = 0;
    for (const [rank, config] of Object.entries(NPC_RANKS)) {
        boundary += config.chancePerTenThousand;
        if (roll < boundary) return rank as NpcRankId;
    }
    return "legendario";
}
export function isNpcRankEligible(
    base: DataNpc | Record<string, any>,
    npc: Record<string, any>,
    context: { safe?: boolean; newbie?: boolean; special?: boolean },
): boolean {
    const id = Number(npc.templateNpcIndex ?? 0);
    return (
        id >= 500 &&
        id < 9000 &&
        !EXCLUDED.has(id) &&
        !context.safe &&
        !context.newbie &&
        !context.special &&
        !npc.summonedByUserId &&
        !npc.ephemeralSummon &&
        !npc.bossEventManaged &&
        !Number(base.Raid ?? base.raid ?? 0) &&
        Number(base.hostile) === 1 &&
        Number(base.attackable ?? 1) === 1 &&
        Number(base.exp) > 0 &&
        !Number(base.comercia) &&
        ![6, 60].includes(Number(base.npcType))
    );
}
export function applyNpcRank(base: DataNpc | Record<string, any>, rank: NpcRankId) {
    const cfg = NPC_RANKS[rank];
    return {
        ...base,
        name: rank === "normal" ? base.name : `${base.name} · ${cfg.label}`,
        hp: Math.max(1, Math.floor(Number(base.maxHp ?? base.hp ?? 1) * cfg.hp)),
        maxHp: Math.max(1, Math.floor(Number(base.maxHp ?? base.hp ?? 1) * cfg.hp)),
        minHit: Math.floor(Number(base.minHit ?? 0) * cfg.damage),
        maxHit: Math.floor(Number(base.maxHit ?? 0) * cfg.damage),
        exp: Math.floor(Number(base.exp ?? 0) * cfg.reward),
        gold: Math.floor(Number(base.gold ?? 0) * cfg.reward),
        npcRank: rank,
        npcRankDamageMultiplier: cfg.damage,
        color: cfg.color,
    };
}
export function getRankedDropChance(baseChance: number, rank: NpcRankId = "normal", equipmentBonusPct = 0): number {
    if (!Number.isFinite(baseChance)) return 0;
    return Math.min(100, Math.max(0, baseChance * NPC_RANKS[rank].drop * (1 + Math.max(0, equipmentBonusPct) / 100)));
}
export function refreshNpcRank(npc: Record<string, any>, base: DataNpc, rank: NpcRankId): void {
    const currentHp = Number(npc.hp ?? 0);
    const wasRanked = Boolean(npc.npcRank);
    const next = applyNpcRank(base, rank);
    Object.assign(npc, {
        nameCharacter: next.name,
        color: next.color,
        maxHp: next.maxHp,
        hp: wasRanked ? Math.min(currentHp, next.maxHp) : next.hp,
        minHit: next.minHit,
        maxHit: next.maxHit,
        exp: next.exp,
        gold: next.gold,
        npcRank: rank,
        npcRankDamageMultiplier: next.npcRankDamageMultiplier,
        npcRankBaseHp: Number(base.maxHp ?? base.hp ?? 1),
    });
}
export function assignNaturalNpcRank(npc: Record<string, any>, base: DataNpc): void {
    const vars = require("./vars");
    const map = Number(npc.map);
    const meta = vars.mapData[map] ?? {};
    const tags = `${meta.name ?? ""} ${meta.restringir ?? ""} ${meta.zona ?? ""}`.toLowerCase();
    const dungeon = require("./dungeons");
    const eligible = isNpcRankEligible(base, npc, {
        safe: Number(meta.pk) === 1 || require("./safeZone").isSafeZonePosition(map, npc.pos),
        newbie: /newbi|principiante/.test(tags) || (Number(meta.maxLevel) > 0 && Number(meta.maxLevel) <= 15),
        special:
            map >= 1000 ||
            dungeon.isDungeonBaseMap(map) ||
            [
                165, 166, 167, 168, 169, 185, 186, 203, 204, 205, 208, 211, 212, 213, 214, 215, 260, 261, 262, 263,
            ].includes(map),
    });
    refreshNpcRank(npc, base, eligible ? rollNpcRank() : "normal");
}
