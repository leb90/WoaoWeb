/** Crafting recipe levels & professions — from real data + server types. */

export const RECIPE_OBJECT_TYPE = 46;

export const RECIPE_LEVELS = [10, 20, 30, 40, 50] as const;
export type RecipeLevel = (typeof RECIPE_LEVELS)[number];

export const RECIPE_LEVEL_DEFS: Record<
  RecipeLevel,
  { level: RecipeLevel; label: string; grhIndex: number; badgeTone: string }
> = {
  10: { level: 10, label: "10", grhIndex: 36771, badgeTone: "l10" },
  20: { level: 20, label: "20", grhIndex: 36772, badgeTone: "l20" },
  30: { level: 30, label: "30", grhIndex: 36773, badgeTone: "l30" },
  40: { level: 40, label: "40", grhIndex: 36774, badgeTone: "l40" },
  50: { level: 50, label: "50", grhIndex: 36775, badgeTone: "l50" },
};

export function isRecipeLevel(n: number): n is RecipeLevel {
  return (RECIPE_LEVELS as readonly number[]).includes(n);
}

export function getRecipeLevelDefinition(level: number) {
  if (!isRecipeLevel(level)) return null;
  return RECIPE_LEVEL_DEFS[level];
}

export type CraftingProfession = "carpentry" | "blacksmith" | "tailoring";

export const PROFESSION_METAS: Array<{
  id: CraftingProfession;
  label: string;
  icon: string;
}> = [
  { id: "carpentry", label: "Carpintería", icon: "🪓" },
  { id: "blacksmith", label: "Herrería", icon: "⚒" },
  { id: "tailoring", label: "Sastrería", icon: "🧵" },
];

export function getProfessionLabel(profession: string): string {
  return PROFESSION_METAS.find((p) => p.id === profession)?.label ?? profession;
}

export const CRAFTING_CATEGORIES = [
  "Armas",
  "Armaduras/Tunicas",
  "Cascos",
  "Escudos",
  "Otros",
] as const;

export type CraftingMaterial = { itemId: number; amount: number };

export type CraftingRecipe = {
  id: number;
  profession: string;
  category: string;
  sortOrder?: number;
  deleted?: boolean;
  itemId: number;
  skill: number;
  level?: number;
  recipeItemId?: number;
  materials: CraftingMaterial[];
};

export type SmeltingRecipe = {
  id: number;
  mineralItemId: number;
  ingotItemId: number;
  requiredSkill: number;
  mineralsPerIngot: number;
};

export function buildRecipeItemName(resultName: string): string {
  const clean = String(resultName ?? "").trim() || "Objeto";
  return `Receta: ${clean}`;
}

/** Structural template matching existing recipe objs (objType 46). */
export function createRecipeObjectData(opts: {
  resultName: string;
  recipeId: number;
  recipeForItemId: number;
  recipeLevel: RecipeLevel;
}): Record<string, unknown> {
  const def = RECIPE_LEVEL_DEFS[opts.recipeLevel];
  return {
    name: buildRecipeItemName(opts.resultName),
    objType: RECIPE_OBJECT_TYPE,
    grhIndex: def.grhIndex,
    valor: 1,
    minHit: 0,
    maxHit: 0,
    minDef: 0,
    maxDef: 0,
    minDefMag: 0,
    maxDefMag: 0,
    resistenciaMagica: 0,
    tipoPocion: 0,
    minModificador: 0,
    maxModificador: 0,
    anim: 0,
    newbie: 0,
    proyectil: 0,
    apu: 0,
    spellIndex: 0,
    razaEnana: 0,
    agarrable: 1,
    noSeCae: 0,
    staffDamageBonus: 0,
    magicDamageBonus: 0,
    porcentaje: 0,
    indexAbierta: 0,
    indexCerrada: 0,
    llave: 0,
    cerrada: 0,
    minSkill: 0,
    subtipo: opts.recipeLevel,
    clasesNoPermitidas: [],
    objetoEspecial: 0,
    mataHobbits: 0,
    recipeId: opts.recipeId,
    recipeForItemId: opts.recipeForItemId,
    recipeLevel: opts.recipeLevel,
  };
}

export function syncRecipeObjectFields(
  existing: Record<string, unknown>,
  opts: {
    resultName: string;
    recipeId: number;
    recipeForItemId: number;
    recipeLevel: RecipeLevel;
  },
): Record<string, unknown> {
  const def = RECIPE_LEVEL_DEFS[opts.recipeLevel];
  return {
    ...existing,
    name: buildRecipeItemName(opts.resultName),
    objType: RECIPE_OBJECT_TYPE,
    grhIndex: def.grhIndex,
    subtipo: opts.recipeLevel,
    recipeId: opts.recipeId,
    recipeForItemId: opts.recipeForItemId,
    recipeLevel: opts.recipeLevel,
  };
}
