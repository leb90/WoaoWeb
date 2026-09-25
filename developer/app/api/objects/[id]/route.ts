import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  deleteObject,
  duplicateObject,
  findObjectReferences,
  getObject,
  restartHintsFor,
  upsertObject,
} from "@/lib/game-data/catalog";
import { resolveGrh, getTexturePublicPath } from "@/lib/graphics/grh";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const id = Number((await params).id);
    const data = getObject(id);
    if (!data) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const grh = resolveGrh(Number(data.grhIndex ?? 0));
    return NextResponse.json({
      id,
      data,
      preview: grh
        ? {
            ...grh,
            textureUrl: getTexturePublicPath(grh),
          }
        : null,
      hints: restartHintsFor("objs"),
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
    upsertObject(id, body.data, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("objs") });
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
    const references = findObjectReferences(id);
    if (references.length > 0 && !force) {
      return NextResponse.json(
        {
          error: "Objeto referenciado",
          references,
          count: references.length,
        },
        { status: 409 },
      );
    }
    deleteObject(id, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("objs") });
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
      const newId = duplicateObject(id, session);
      return NextResponse.json({
        id: newId,
        hints: restartHintsFor("objs"),
      });
    }
    return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
