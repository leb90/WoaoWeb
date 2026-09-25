import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  listSpellSummaries,
  loadObjects,
  peekNextObjectId,
} from "@/lib/game-data/catalog";
import {
  CREATEABLE_OBJECT_TYPES,
  GAME_CLASSES,
  OBJECT_TYPE_METAS,
  POTION_TYPES,
  getObjectTypeMeta,
} from "@/lib/game-data/objects";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const objs = loadObjects();
    const objectIds = Object.keys(objs).map(Number).filter((n) => n > 0);
    return NextResponse.json({
      nextId: peekNextObjectId(),
      types: OBJECT_TYPE_METAS,
      createableTypes: CREATEABLE_OBJECT_TYPES.map((id) => getObjectTypeMeta(id)),
      classes: GAME_CLASSES,
      potionTypes: POTION_TYPES,
      spells: listSpellSummaries(),
      objectLabels: objectIds.slice(0, 5000).map((id) => ({
        id,
        name: String(objs[String(id)]?.name ?? ""),
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
