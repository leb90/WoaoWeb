import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  deleteQuest,
  duplicateQuest,
  getQuestDetail,
  updateQuest,
} from "@/lib/game-data/quests/service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    await requireSession();
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const detail = getQuestDetail(id);
    if (!detail) {
      return NextResponse.json({ error: "Quest no encontrada" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, ctx: Ctx) {
  try {
    const session = await requireSession();
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const body = (await request.json()) as {
      quest?: Record<string, unknown>;
      giverNpcId?: number | null;
      unlinkGivers?: boolean;
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
      const result = updateQuest(
        id,
        {
          quest: body.quest as never,
          giverNpcId: body.giverNpcId,
          unlinkGivers: body.unlinkGivers,
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

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const session = await requireSession();
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const result = deleteQuest(id, session);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const session = await requireSession();
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    const body = (await request.json()) as {
      action?: string;
      assignMode?: "none" | "existing" | "create";
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

    if (body.action === "duplicate") {
      const result = duplicateQuest(
        id,
        {
          assignMode: body.assignMode ?? "none",
          giverNpcId: body.giverNpcId,
          createNpc: body.createNpc,
          replaceNpcQuest: body.replaceNpcQuest,
        },
        session,
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "action desconocida" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
