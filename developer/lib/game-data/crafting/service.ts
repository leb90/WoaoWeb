import type { SessionPayload } from "../../security/auth";
import { resolveResourcePaths } from "../../security/paths";
import { appendAudit } from "../../security/audit";
import {
  loadCraftingRecipes,
  loadObjects,
  loadSmeltingRecipes,
  saveCraftingRecipes,
  saveSmeltingRecipes,
} from "../catalog";
import { atomicWriteMultipleJson, createBackup } from "../backups";
import {
  createRecipeObjectData,
  isRecipeLevel,
  syncRecipeObjectFields,
  type CraftingRecipe,
  type RecipeLevel,
  type SmeltingRecipe,
} from "./catalogs";
import {
  hasCriticalErrors,
  normalizeMaterials,
  validateCraftingRecipe,
} from "./validation";

type ObjMap = Record<string, Record<string, unknown>>;

function nextArrayId(list: Array<{ id: number }>): number {
  let id = 1;
  const used = new Set(list.map((r) => r.id));
  while (used.has(id)) id++;
  return id;
}

function nextObjId(objs: ObjMap): number {
  let id = 1;
  while (objs[String(id)]) id++;
  return id;
}

function resultName(objs: ObjMap, itemId: number): string {
  return String(objs[String(itemId)]?.name ?? `Objeto ${itemId}`);
}

function persistCraftingAndObjs(
  crafting: CraftingRecipe[],
  objs: ObjMap,
  session: SessionPayload,
  action: string,
  resourceId?: number,
): void {
  const craftPaths = resolveResourcePaths("craftingRecipes");
  const objPaths = resolveResourcePaths("objs");
  const allPaths = [...craftPaths, ...objPaths];
  const backup = createBackup({
    resource: "crafting+objs",
    resourceId: resourceId ?? null,
    absoluteFiles: allPaths,
    note: action,
  });
  const writes = [
    ...craftPaths.map((absolutePath) => ({ absolutePath, data: crafting })),
    ...objPaths.map((absolutePath) => ({ absolutePath, data: objs })),
  ];
  atomicWriteMultipleJson(writes, { backupId: backup.id });
  for (const file of allPaths) {
    appendAudit(session, {
      action,
      resourceType: "craftingRecipes",
      resourceId: resourceId ?? null,
      file,
    });
  }
}

export function peekNextCraftingId(): number {
  return nextArrayId(loadCraftingRecipes() as CraftingRecipe[]);
}

export function peekNextRecipeItemId(): number {
  return nextObjId(loadObjects() as ObjMap);
}

export type UpsertCraftingInput = {
  recipe: CraftingRecipe;
  /** When true, allocate new recipeItemId and create obj */
  createRecipeItem?: boolean;
  /** Force repair/rebuild of recipe object fields */
  repairRecipe?: boolean;
};

export function upsertCraftingWithRecipe(
  input: UpsertCraftingInput,
  session: SessionPayload,
): { craftingId: number; recipeItemId: number } {
  const list = structuredClone(loadCraftingRecipes()) as CraftingRecipe[];
  const objs = structuredClone(loadObjects()) as ObjMap;
  const recipe = {
    ...input.recipe,
    materials: normalizeMaterials(input.recipe.materials ?? []),
    skill: 0,
    deleted: Boolean(input.recipe.deleted),
  };

  const level = Number(recipe.level ?? 0);
  if (!isRecipeLevel(level)) {
    throw new Error("Nivel inválido");
  }
  const typedLevel = level as RecipeLevel;

  const isNew = !list.some((r) => r.id === recipe.id);
  let craftingId = recipe.id;
  if (!craftingId || (isNew && list.some((r) => r.id === craftingId))) {
    craftingId = nextArrayId(list);
    recipe.id = craftingId;
  }
  if (recipe.sortOrder == null) recipe.sortOrder = craftingId;

  let recipeItemId = Number(recipe.recipeItemId ?? 0);
  const needCreate =
    input.createRecipeItem ||
    recipeItemId <= 0 ||
    !objs[String(recipeItemId)];

  if (needCreate) {
    recipeItemId = nextObjId(objs);
    recipe.recipeItemId = recipeItemId;
    objs[String(recipeItemId)] = createRecipeObjectData({
      resultName: resultName(objs, recipe.itemId),
      recipeId: craftingId,
      recipeForItemId: recipe.itemId,
      recipeLevel: typedLevel,
    });
  } else {
    const existing = objs[String(recipeItemId)]!;
    objs[String(recipeItemId)] = syncRecipeObjectFields(existing, {
      resultName: resultName(objs, recipe.itemId),
      recipeId: craftingId,
      recipeForItemId: recipe.itemId,
      recipeLevel: typedLevel,
    });
  }

  const issues = validateCraftingRecipe(recipe, {
    isNew: !list.some((r) => r.id === craftingId),
    existingCraftIds: new Set(list.map((r) => r.id)),
    objectIds: new Set(Object.keys(objs).map(Number)),
    recipeObj: objs[String(recipeItemId)],
  });
  if (hasCriticalErrors(issues)) {
    throw new Error(issues.filter((i) => i.level === "error").map((i) => i.message).join(" "));
  }

  const idx = list.findIndex((r) => r.id === craftingId);
  if (idx >= 0) list[idx] = recipe;
  else list.push(recipe);
  list.sort((a, b) => a.id - b.id);

  persistCraftingAndObjs(
    list,
    objs,
    session,
    needCreate ? "create-crafting+recipe" : "upsert-crafting+recipe",
    craftingId,
  );

  return { craftingId, recipeItemId };
}

export function softDeleteCrafting(
  id: number,
  session: SessionPayload,
): void {
  const list = structuredClone(loadCraftingRecipes()) as CraftingRecipe[];
  const idx = list.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error(`Crafting ${id} no existe`);
  list[idx] = { ...list[idx]!, deleted: true };
  // Soft-delete only crafting; keep recipe item for inventories
  saveCraftingRecipes(list, session);
}

export function createMissingRecipeForCrafting(
  craftingId: number,
  session: SessionPayload,
): number {
  const list = loadCraftingRecipes() as CraftingRecipe[];
  const recipe = list.find((r) => r.id === craftingId);
  if (!recipe) throw new Error("Crafting no encontrado");
  const result = upsertCraftingWithRecipe(
    { recipe: { ...recipe, recipeItemId: 0 }, createRecipeItem: true },
    session,
  );
  return result.recipeItemId;
}

export function saveSmeltingOnly(
  smelting: SmeltingRecipe[],
  session: SessionPayload,
): void {
  saveSmeltingRecipes(smelting, session);
}

export function replaceAllCraftingOnly(
  crafting: CraftingRecipe[],
  session: SessionPayload,
): void {
  saveCraftingRecipes(crafting, session);
}

export function loadCraftingBundle() {
  return {
    crafting: loadCraftingRecipes() as CraftingRecipe[],
    smelting: loadSmeltingRecipes() as SmeltingRecipe[],
    objects: loadObjects() as ObjMap,
  };
}
