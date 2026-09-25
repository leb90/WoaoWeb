import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  listObjectSummaries,
  listSpellSummaries,
  loadNpcs,
  peekNextNpcId,
} from "@/lib/game-data/catalog";
import {
  CREATEABLE_NPC_TYPES,
  MOVEMENT_OPTIONS,
  NPC_TYPE_METAS,
  getNpcTypeMeta,
} from "@/lib/game-data/npcs";
import { loadBodiesDb, loadHeadsDb } from "@/lib/graphics/sprites";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const npcs = loadNpcs();
    const bodies = loadBodiesDb();
    const heads = loadHeadsDb();
    return NextResponse.json({
      nextId: peekNextNpcId(),
      types: NPC_TYPE_METAS,
      createableTypes: CREATEABLE_NPC_TYPES.map((id) => getNpcTypeMeta(id)),
      movements: MOVEMENT_OPTIONS,
      spells: listSpellSummaries(),
      objects: listObjectSummaries().map((o) => ({
        id: o.id,
        name: o.name,
        objType: o.objType,
        grhIndex: o.grhIndex,
        valor: o.valor,
      })),
      bodyIds: Object.keys(bodies)
        .map(Number)
        .filter((n) => n > 0)
        .sort((a, b) => a - b),
      headIds: Object.keys(heads)
        .map(Number)
        .filter((n) => n > 0)
        .sort((a, b) => a - b),
      existingIds: Object.keys(npcs).map(Number),
    });
  } catch (error) {
    return jsonError(error);
  }
}
