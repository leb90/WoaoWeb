import { getCraftingRecipes, type CraftingRecipe } from "./craftingRecipes";
import type { RuntimeNpc } from "./types/runtime";

export type CraftingRecipeDrop = {
    item: number;
    cant: number;
    recipeId: number;
    recipeLevel: number;
    chancePercent: number;
};

export const CRAFTING_RECIPE_DROP_TIERS = [
    { level: 10, minNpcMaxHpExclusive: 300, chancePercent: 5 },
    { level: 20, minNpcMaxHpExclusive: 1_500, chancePercent: 2 },
    { level: 30, minNpcMaxHpExclusive: 4_000, chancePercent: 1 },
    { level: 40, minNpcMaxHpExclusive: 10_000, chancePercent: 0.5 },
    { level: 50, minNpcMaxHpExclusive: 25_000, chancePercent: 0.1 },
] as const;

function getRecipeLevel(recipe: CraftingRecipe) {
    const level = Math.floor(Number(recipe.level ?? recipe.skill ?? 0));
    return Math.max(1, Number.isFinite(level) ? level : 1);
}

function isHostileNpc(npc: RuntimeNpc) {
    const exp = Math.floor(Number(npc.exp ?? 0));
    if (exp <= 0) {
        return false;
    }

    return (
        Number(npc.hostile ?? 0) > 0 ||
        Number(npc.attackable ?? 0) > 0 ||
        Number(npc.movement ?? 0) === 3
    );
}

function getRecipePoolsByLevel() {
    const pools = new Map<number, CraftingRecipe[]>();

    for (const recipe of getCraftingRecipes()) {
        if (recipe.deleted || !recipe.recipeItemId) {
            continue;
        }

        const level = getRecipeLevel(recipe);
        const pool = pools.get(level) ?? [];
        pool.push(recipe);
        pools.set(level, pool);
    }

    return pools;
}

export function getEligibleCraftingRecipeLevels(npc: RuntimeNpc): number[] {
    if (!isHostileNpc(npc)) {
        return [];
    }

    const npcMaxHp = Math.floor(Number(npc.maxHp ?? 0));
    return CRAFTING_RECIPE_DROP_TIERS
        .filter((tier) => npcMaxHp > tier.minNpcMaxHpExclusive)
        .map((tier) => tier.level);
}

export function rollCraftingRecipeDrops(npc: RuntimeNpc): CraftingRecipeDrop[] {
    const eligibleLevels = new Set(getEligibleCraftingRecipeLevels(npc));
    if (eligibleLevels.size === 0) {
        return [];
    }

    const poolsByLevel = getRecipePoolsByLevel();
    const drops: CraftingRecipeDrop[] = [];

    for (const tier of CRAFTING_RECIPE_DROP_TIERS) {
        if (!eligibleLevels.has(tier.level) || Math.random() * 100 >= tier.chancePercent) {
            continue;
        }

        const pool = poolsByLevel.get(tier.level) ?? [];
        if (pool.length === 0) {
            continue;
        }

        const recipe = pool[Math.floor(Math.random() * pool.length)];
        const recipeItemId = Number(recipe.recipeItemId ?? 0);

        if (recipeItemId <= 0) {
            continue;
        }

        drops.push({
            item: recipeItemId,
            cant: 1,
            recipeId: recipe.id,
            recipeLevel: tier.level,
            chancePercent: tier.chancePercent,
        });
    }

    return drops;
}
