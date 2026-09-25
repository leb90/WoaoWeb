import {
  isRecipeLevel,
  type CraftingMaterial,
  type CraftingRecipe,
  type RecipeLevel,
} from "./catalogs";

export type ValidationIssue = {
  level: "error" | "warning";
  field?: string;
  message: string;
};

export function validateCraftingRecipe(
  recipe: CraftingRecipe,
  opts?: {
    objectIds?: Set<number>;
    existingCraftIds?: Set<number>;
    isNew?: boolean;
    recipeObj?: Record<string, unknown> | null;
    expectCreateRecipe?: boolean;
  },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const level = Number(recipe.level ?? 0);

  if (!isRecipeLevel(level)) {
    issues.push({
      level: "error",
      field: "level",
      message: "Nivel debe ser 10, 20, 30, 40 o 50.",
    });
  }
  if (!recipe.profession) {
    issues.push({ level: "error", field: "profession", message: "Profesión requerida." });
  }
  if (!recipe.category) {
    issues.push({ level: "error", field: "category", message: "Categoría requerida." });
  }
  if (!recipe.itemId || recipe.itemId <= 0) {
    issues.push({ level: "error", field: "itemId", message: "Resultado requerido." });
  } else if (opts?.objectIds && !opts.objectIds.has(recipe.itemId)) {
    issues.push({
      level: "error",
      field: "itemId",
      message: `Objeto resultado ${recipe.itemId} no existe.`,
    });
  }

  const mats = recipe.materials ?? [];
  if (mats.length < 1) {
    issues.push({
      level: "error",
      field: "materials",
      message: "Se necesita al menos 1 material.",
    });
  }
  const seen = new Set<number>();
  for (const m of mats) {
    if (!m.itemId || m.itemId <= 0) {
      issues.push({ level: "error", field: "materials", message: "Material inválido." });
      continue;
    }
    if (seen.has(m.itemId)) {
      issues.push({
        level: "error",
        field: "materials",
        message: `Material duplicado: ${m.itemId}.`,
      });
    }
    seen.add(m.itemId);
    if (!Number.isInteger(m.amount) || m.amount < 1) {
      issues.push({
        level: "error",
        field: "materials",
        message: `Cantidad inválida para ${m.itemId}.`,
      });
    }
    if (opts?.objectIds && !opts.objectIds.has(m.itemId)) {
      issues.push({
        level: "error",
        field: "materials",
        message: `Material ${m.itemId} no existe.`,
      });
    }
    if (m.itemId === recipe.itemId) {
      issues.push({
        level: "warning",
        field: "materials",
        message: "El resultado aparece como material.",
      });
    }
  }

  if (opts?.isNew && opts.existingCraftIds?.has(recipe.id)) {
    issues.push({
      level: "error",
      field: "id",
      message: `Crafting ID ${recipe.id} ya existe.`,
    });
  }

  const rid = Number(recipe.recipeItemId ?? 0);
  if (!opts?.expectCreateRecipe) {
    if (rid <= 0) {
      issues.push({
        level: "error",
        field: "recipeItemId",
        message: "Falta item receta.",
      });
    } else if (opts?.objectIds && !opts.objectIds.has(rid) && !opts.recipeObj) {
      issues.push({
        level: "error",
        field: "recipeItemId",
        message: `Item receta ${rid} no existe.`,
      });
    }
  }

  if (opts?.recipeObj) {
    const o = opts.recipeObj;
    if (Number(o.recipeId) !== recipe.id) {
      issues.push({
        level: "error",
        field: "recipeId",
        message: `recipeId del objeto (${o.recipeId}) ≠ crafting.id (${recipe.id}).`,
      });
    }
    if (Number(o.recipeForItemId) !== recipe.itemId) {
      issues.push({
        level: "error",
        field: "recipeForItemId",
        message: "recipeForItemId no coincide con itemId del crafting.",
      });
    }
    if (Number(o.recipeLevel) !== level) {
      issues.push({
        level: "error",
        field: "recipeLevel",
        message: "recipeLevel no coincide con level del crafting.",
      });
    }
  }

  return issues;
}

export function hasCriticalErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}

export function normalizeMaterials(mats: CraftingMaterial[]): CraftingMaterial[] {
  const map = new Map<number, number>();
  for (const m of mats) {
    const id = Number(m.itemId);
    const amt = Math.floor(Number(m.amount) || 0);
    if (id <= 0 || amt < 1) continue;
    map.set(id, (map.get(id) ?? 0) + amt);
  }
  return [...map.entries()].map(([itemId, amount]) => ({ itemId, amount }));
}

export function createCraftingDraft(opts?: {
  id?: number;
  itemId?: number;
  profession?: string;
  category?: string;
  level?: RecipeLevel;
}): CraftingRecipe {
  return {
    id: opts?.id ?? 0,
    profession: opts?.profession ?? "carpentry",
    category: opts?.category ?? "Armas",
    sortOrder: opts?.id ?? 1,
    deleted: false,
    itemId: opts?.itemId ?? 0,
    skill: 0,
    level: opts?.level ?? 10,
    recipeItemId: 0,
    materials: [],
  };
}
