import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  listNpcSummaries,
  loadSpells,
  peekNextSpellId,
  restartHintsFor,
} from "@/lib/game-data/catalog";
import {
  CREATE_SPELL_PRESETS,
  SPELL_TARGET_METAS,
  SPELL_TYPE_METAS,
} from "@/lib/game-data/spells";
import { listFxSummaries } from "@/lib/graphics/fxs";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const spells = loadSpells();
    return NextResponse.json({
      nextId: peekNextSpellId(),
      types: SPELL_TYPE_METAS,
      targets: SPELL_TARGET_METAS,
      presets: CREATE_SPELL_PRESETS,
      fxs: listFxSummaries(),
      npcs: listNpcSummaries().map((n) => ({
        id: n.id,
        name: n.name,
        npcType: n.npcType,
      })),
      existingIds: Object.keys(spells).map(Number),
      hints: restartHintsFor("spells"),
    });
  } catch (error) {
    return jsonError(error);
  }
}
