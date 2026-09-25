import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  createSpell,
  deleteSpell,
  getSpell,
  listSpellSummaries,
  restartHintsFor,
  upsertSpell,
} from "@/lib/game-data/catalog";
import { resolveFx, resolveFxAnimation } from "@/lib/graphics/fxs";

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
      const fxId = Number(data.fxGrh ?? 0);
      return NextResponse.json({
        id: Number(id),
        data,
        fx: fxId ? resolveFx(fxId) : null,
        fxAnim: fxId ? resolveFxAnimation(fxId) : null,
        hints: restartHintsFor("spells"),
      });
    }
    return NextResponse.json({ items: listSpellSummaries() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      data?: Record<string, unknown>;
      id?: number;
    };
    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json({ error: "data requerido" }, { status: 400 });
    }
    const id = createSpell(body.data, session, body.id);
    return NextResponse.json({ id, hints: restartHintsFor("spells") });
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

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();
    const url = new URL(request.url);
    const id = Number(url.searchParams.get("id") ?? 0);
    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }
    deleteSpell(id, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("spells") });
  } catch (error) {
    return jsonError(error);
  }
}
