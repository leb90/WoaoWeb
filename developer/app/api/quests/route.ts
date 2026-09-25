import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  createQuest,
  listQuestSummaries,
  peekNextQuestId,
} from "@/lib/game-data/quests/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({
      items: listQuestSummaries(),
      nextId: peekNextQuestId(),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      quest?: Record<string, unknown>;
      giverNpcId?: number | null;
      createNpc?: {
        name: string;
        npcType?: number;
        idBody?: number;
        idHead?: number;
        desc?: string;
      } | null;
      replaceNpcQuest?: boolean;
    };

    if (!body.quest || typeof body.quest !== "object") {
      return NextResponse.json({ error: "quest requerido" }, { status: 400 });
    }

    try {
      const result = createQuest(
        {
          quest: body.quest as never,
          giverNpcId: body.giverNpcId,
          createNpc: body.createNpc,
          replaceNpcQuest: body.replaceNpcQuest,
        },
        session,
      );
      return NextResponse.json(result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.startsWith("NPC_HAS_QUEST:")) {
        const questId = Number(msg.split(":")[1]);
        return NextResponse.json(
          {
            error: "npc_has_quest",
            questId,
            message: `Este NPC ya entrega la quest #${questId}.`,
          },
          { status: 409 },
        );
      }
      throw error;
    }
  } catch (error) {
    return jsonError(error);
  }
}
