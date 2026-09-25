import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  deleteNpc,
  duplicateNpc,
  findNpcReferences,
  getNpc,
  listObjectSummaries,
  listSpellSummaries,
  restartHintsFor,
  upsertNpc,
} from "@/lib/game-data/catalog";
import {
  resolveBodyGrh,
  resolveHeadGrh,
  resolveHeadOffset,
} from "@/lib/graphics/sprites";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const id = Number((await params).id);
    const data = getNpc(id);
    if (!data) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const idBody = Number(data.idBody ?? 0);
    const idHead = Number(data.idHead ?? 0);
    return NextResponse.json({
      id,
      data,
      preview: {
        bodyGrh: resolveBodyGrh(idBody),
        headGrh: resolveHeadGrh(idHead),
        headOffset: resolveHeadOffset(idBody),
      },
      catalogs: {
        objects: listObjectSummaries().map((o) => ({
          id: o.id,
          name: o.name,
          grhIndex: o.grhIndex,
          valor: o.valor,
          objType: o.objType,
        })),
        spells: listSpellSummaries().map((s) => ({
          id: s.id,
          name: s.name,
        })),
      },
      hints: restartHintsFor("npcs"),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const id = Number((await params).id);
    const body = (await request.json()) as { data?: Record<string, unknown> };
    if (!body.data) {
      return NextResponse.json({ error: "data requerido" }, { status: 400 });
    }
    upsertNpc(id, body.data, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("npcs") });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const id = Number((await params).id);
    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "1";
    const references = findNpcReferences(id);
    if (references.length > 0 && !force) {
      return NextResponse.json(
        {
          error: "NPC referenciado",
          references,
          count: references.length,
        },
        { status: 409 },
      );
    }
    deleteNpc(id, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("npcs") });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const id = Number((await params).id);
    const body = (await request.json()) as { action?: string };
    if (body.action === "duplicate") {
      const newId = duplicateNpc(id, session);
      return NextResponse.json({ id: newId, hints: restartHintsFor("npcs") });
    }
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
