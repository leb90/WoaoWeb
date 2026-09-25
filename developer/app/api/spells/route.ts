import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  getSpell,
  listSpellSummaries,
  restartHintsFor,
  upsertSpell,
} from "@/lib/game-data/catalog";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) {
      const data = getSpell(Number(id));
      if (!data) {
        return NextResponse.json({ error: "No encontrado" }, { status: 404 });
      }
      return NextResponse.json({
        id: Number(id),
        data,
        hints: restartHintsFor("spells"),
      });
    }
    return NextResponse.json({ items: listSpellSummaries() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      id?: number;
      data?: Record<string, unknown>;
    };
    if (!body.id || !body.data) {
      return NextResponse.json(
        { error: "id y data requeridos" },
        { status: 400 },
      );
    }
    upsertSpell(body.id, body.data, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("spells") });
  } catch (error) {
    return jsonError(error);
  }
}
