import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { listNpcSummaries, listObjectSummaries } from "@/lib/game-data/catalog";
import { checkNpcQuestConflict, peekNextQuestId } from "@/lib/game-data/quests/service";
import { NPC_TYPE_METAS } from "@/lib/game-data/npcs";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const checkNpc = url.searchParams.get("checkNpc");
    const forQuest = url.searchParams.get("forQuest");

    if (checkNpc && forQuest) {
      return NextResponse.json(
        checkNpcQuestConflict(Number(checkNpc), Number(forQuest)),
      );
    }

    return NextResponse.json({
      nextId: peekNextQuestId(),
      npcTypes: NPC_TYPE_METAS.map((t) => ({
        id: t.id,
        label: t.label,
      })),
      npcs: listNpcSummaries().map((n) => ({
        id: n.id,
        name: n.name,
        npcType: n.npcType,
        idBody: n.idBody,
        idHead: n.idHead,
      })),
      objects: listObjectSummaries().map((o) => ({
        id: o.id,
        name: o.name,
        grhIndex: o.grhIndex,
        objType: o.objType,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
