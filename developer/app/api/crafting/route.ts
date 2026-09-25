import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  loadCraftingRecipes,
  loadSmeltingRecipes,
  restartHintsFor,
  saveCraftingRecipes,
  saveSmeltingRecipes,
} from "@/lib/game-data/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({
      crafting: loadCraftingRecipes(),
      smelting: loadSmeltingRecipes(),
      hints: {
        crafting: restartHintsFor("craftingRecipes"),
        smelting: restartHintsFor("smeltingRecipes"),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      crafting?: unknown[];
      smelting?: unknown[];
    };
    if (body.crafting) {
      saveCraftingRecipes(body.crafting, session);
    }
    if (body.smelting) {
      saveSmeltingRecipes(body.smelting, session);
    }
    return NextResponse.json({
      ok: true,
      hints: {
        crafting: restartHintsFor("craftingRecipes"),
        smelting: restartHintsFor("smeltingRecipes"),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
