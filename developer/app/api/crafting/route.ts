import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  loadCraftingBundle,
  peekNextCraftingId,
  peekNextRecipeItemId,
  softDeleteCrafting,
  upsertCraftingWithRecipe,
  saveSmeltingOnly,
  createMissingRecipeForCrafting,
} from "@/lib/game-data/crafting/service";
import {
  CRAFTING_CATEGORIES,
  PROFESSION_METAS,
  RECIPE_LEVEL_DEFS,
  RECIPE_LEVELS,
  RECIPE_OBJECT_TYPE,
  type CraftingRecipe,
  type SmeltingRecipe,
} from "@/lib/game-data/crafting";
import { restartHintsFor } from "@/lib/game-data/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const bundle = loadCraftingBundle();
    const objSummaries = Object.entries(bundle.objects).map(([id, o]) => ({
      id: Number(id),
      name: String(o.name ?? ""),
      grhIndex: Number(o.grhIndex ?? 0),
      objType: Number(o.objType ?? 0),
      valor: Number(o.valor ?? 0),
      recipeId: o.recipeId != null ? Number(o.recipeId) : undefined,
      recipeForItemId:
        o.recipeForItemId != null ? Number(o.recipeForItemId) : undefined,
      recipeLevel: o.recipeLevel != null ? Number(o.recipeLevel) : undefined,
      subtipo: o.subtipo != null ? Number(o.subtipo) : undefined,
    }));

    const inconsistencies: Array<{
      craftingId: number;
      kind: string;
      message: string;
    }> = [];

    for (const r of bundle.crafting) {
      if (r.deleted) continue;
      const rid = Number(r.recipeItemId ?? 0);
      if (rid <= 0) {
        inconsistencies.push({
          craftingId: r.id,
          kind: "missing-recipe",
          message: "Falta item receta",
        });
        continue;
      }
      const obj = bundle.objects[String(rid)];
      if (!obj) {
        inconsistencies.push({
          craftingId: r.id,
          kind: "missing-recipe",
          message: `Item receta ${rid} no existe`,
        });
        continue;
      }
      if (Number(obj.recipeId) !== r.id) {
        inconsistencies.push({
          craftingId: r.id,
          kind: "bad-recipeId",
          message: `recipeId=${obj.recipeId} ≠ ${r.id}`,
        });
      }
      if (Number(obj.recipeForItemId) !== r.itemId) {
        inconsistencies.push({
          craftingId: r.id,
          kind: "bad-forItem",
          message: "recipeForItemId inconsistente",
        });
      }
      if (Number(obj.recipeLevel) !== Number(r.level)) {
        inconsistencies.push({
          craftingId: r.id,
          kind: "bad-level",
          message: "recipeLevel ≠ crafting.level",
        });
      }
    }

    for (const o of objSummaries) {
      if (o.objType !== RECIPE_OBJECT_TYPE) continue;
      const rid = o.recipeId;
      if (rid == null) continue;
      const craft = bundle.crafting.find((c) => c.id === rid && !c.deleted);
      if (!craft) {
        inconsistencies.push({
          craftingId: rid,
          kind: "orphan-recipe",
          message: `Objeto receta ${o.id} huérfano (recipeId ${rid})`,
        });
      }
    }

    return NextResponse.json({
      crafting: bundle.crafting,
      smelting: bundle.smelting,
      objects: objSummaries,
      nextCraftingId: peekNextCraftingId(),
      nextRecipeItemId: peekNextRecipeItemId(),
      meta: {
        professions: PROFESSION_METAS,
        categories: CRAFTING_CATEGORIES,
        levels: RECIPE_LEVELS.map((l) => RECIPE_LEVEL_DEFS[l]),
        recipeObjectType: RECIPE_OBJECT_TYPE,
      },
      inconsistencies,
      hints: {
        crafting: restartHintsFor("craftingRecipes"),
        smelting: restartHintsFor("smeltingRecipes"),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      action?: string;
      recipe?: CraftingRecipe;
      craftingId?: number;
      smelting?: SmeltingRecipe[];
    };

    if (body.action === "upsert-crafting" && body.recipe) {
      const result = upsertCraftingWithRecipe(
        {
          recipe: body.recipe,
          createRecipeItem:
            !body.recipe.recipeItemId || body.recipe.recipeItemId <= 0,
        },
        session,
      );
      return NextResponse.json({
        ok: true,
        ...result,
        hints: restartHintsFor("craftingRecipes"),
      });
    }

    if (body.action === "repair-recipe" && body.recipe) {
      const result = upsertCraftingWithRecipe(
        { recipe: body.recipe, repairRecipe: true },
        session,
      );
      return NextResponse.json({ ok: true, ...result });
    }

    if (body.action === "create-missing-recipe" && body.craftingId) {
      const recipeItemId = createMissingRecipeForCrafting(
        body.craftingId,
        session,
      );
      return NextResponse.json({ ok: true, recipeItemId });
    }

    if (body.action === "soft-delete" && body.craftingId) {
      softDeleteCrafting(body.craftingId, session);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "save-smelting" && body.smelting) {
      saveSmeltingOnly(body.smelting, session);
      return NextResponse.json({
        ok: true,
        hints: restartHintsFor("smeltingRecipes"),
      });
    }

    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}

// Keep PUT for bulk smelting from legacy UI compatibility
export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      smelting?: SmeltingRecipe[];
      recipe?: CraftingRecipe;
    };
    if (body.recipe) {
      const result = upsertCraftingWithRecipe(
        {
          recipe: body.recipe,
          createRecipeItem: !body.recipe.recipeItemId,
        },
        session,
      );
      return NextResponse.json({ ok: true, ...result });
    }
    if (body.smelting) {
      saveSmeltingOnly(body.smelting, session);
      return NextResponse.json({
        ok: true,
        hints: restartHintsFor("smeltingRecipes"),
      });
    }
    return NextResponse.json({ error: "Nada que guardar" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
