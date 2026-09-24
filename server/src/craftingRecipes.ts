import craftingRecipesJson from "../jsons/craftingRecipes.json";
const vars = require("./vars");

export type CraftingProfession = "carpentry" | "blacksmith" | "tailoring";

export type CraftingMaterial = {
    itemId: number;
    amount: number;
};

export type CraftingRecipe = {
    id: number;
    profession: CraftingProfession;
    category: string;
    sortOrder?: number;
    deleted?: boolean;
    itemId: number;
    skill: number;
    level?: number;
    recipeItemId?: number;
    materials: CraftingMaterial[];
};

export const CRAFTING_RECIPES = craftingRecipesJson as CraftingRecipe[];

export function getCraftingRecipes(): CraftingRecipe[] {
    return Array.isArray(vars.craftingRecipes) && vars.craftingRecipes.length > 0
        ? vars.craftingRecipes
        : CRAFTING_RECIPES;
}

export function validateCraftingRecipesAgainstObjects(datObj: Record<string, Record<string, unknown>>): string[] {
    const problems: string[] = [];

    for (const recipe of getCraftingRecipes()) {
        if (recipe.deleted) {
            continue;
        }

        if (!datObj[String(recipe.itemId)]) {
            problems.push(`Receta ${recipe.id}: falta item fabricado ${recipe.itemId}.`);
        }

        if (Number(recipe.recipeItemId ?? 0) > 0) {
            const recipeObject = datObj[String(recipe.recipeItemId)];
            if (!recipeObject) {
                problems.push(`Receta ${recipe.id}: falta objeto-receta ${recipe.recipeItemId}.`);
            } else {
                if (Number(recipeObject.recipeId ?? 0) !== Number(recipe.id)) {
                    problems.push(
                        `Receta ${recipe.id}: objeto-receta ${recipe.recipeItemId} tiene recipeId ${recipeObject.recipeId ?? 0}.`,
                    );
                }

                if (Number(recipeObject.recipeForItemId ?? 0) !== Number(recipe.itemId)) {
                    problems.push(
                        `Receta ${recipe.id}: objeto-receta ${recipe.recipeItemId} apunta a item ${recipeObject.recipeForItemId ?? 0}.`,
                    );
                }
            }
        }

        for (const material of recipe.materials) {
            if (!datObj[String(material.itemId)]) {
                problems.push(`Receta ${recipe.id}: falta material ${material.itemId}.`);
            }
        }
    }

    return problems;
}
