import {
  getProfessionLabel,
  getRecipeLevelDefinition,
  isRecipeLevel,
  type CraftingRecipe,
} from "./catalogs";

export type CraftingFilterProfession = "all" | string;

export function getCraftingPresentation(
  recipe: CraftingRecipe,
  objNames?: Map<number, string>,
) {
  const level = Number(recipe.level ?? 0);
  const levelDef = getRecipeLevelDefinition(level);
  const resultName =
    objNames?.get(recipe.itemId) ?? `Objeto ${recipe.itemId}`;
  return {
    level,
    levelLabel: levelDef?.label ?? String(level || "?"),
    levelTone: levelDef?.badgeTone ?? "other",
    professionLabel: getProfessionLabel(recipe.profession),
    resultName,
    materialsSummary: (recipe.materials ?? [])
      .map((m) => {
        const n = objNames?.get(m.itemId) ?? `#${m.itemId}`;
        return `${n}×${m.amount}`;
      })
      .join(", "),
    isValidLevel: isRecipeLevel(level),
  };
}
