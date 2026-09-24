import { getCraftingRecipes, type CraftingRecipe } from "./craftingRecipes";
import type { RuntimeNpc } from "./types/runtime";

export type CraftingRecipeDrop = {
    item: number;
    cant: number;
    recipeId: number;
    recipeLevel: number;
    chancePercent: number;
};

const RECIPE_DROP_TIERS = [
    { level: 10, minNpcExp: 1, chancePercent: 5 },
    { level: 20, minNpcExp: 1_000, chancePercent: 2 },
    { level: 30, minNpcExp: 10_000, chancePercent: 1 },
    { level: 40, minNpcExp: 50_000, chancePercent: 0.5 },
    { level: 50, minNpcExp: 150_000, chancePercent: 0.1 },
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

export function rollCraftingRecipeDrops(npc: RuntimeNpc): CraftingRecipeDrop[] {
    if (!isHostileNpc(npc)) {
        return [];
    }

    const npcExp = Math.floor(Number(npc.exp ?? 0));
    const poolsByLevel = getRecipePoolsByLevel();
    const drops: CraftingRecipeDrop[] = [];

    for (const tier of RECIPE_DROP_TIERS) {
        if (npcExp < tier.minNpcExp || Math.random() * 100 >= tier.chancePercent) {
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
