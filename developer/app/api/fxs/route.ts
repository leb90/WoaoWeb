import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { appendAudit } from "@/lib/security/audit";
import {
  getFxDetail,
  listFxDetails,
  saveFx,
  type FxSavePayload,
} from "@/lib/graphics/fxService";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const fxId = Number(url.searchParams.get("fxId") ?? 0);
    if (!fxId) {
      return NextResponse.json({ items: listFxDetails() });
    }
    const detail = getFxDetail(fxId);
    if (!detail) {
      return NextResponse.json({ error: "FX no encontrado", fxId }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as FxSavePayload;
    const saved = saveFx(body, session.username);
    if (!saved) {
      return NextResponse.json({ error: "No se pudo guardar el FX" }, { status: 400 });
    }
    appendAudit(session, {
      action: "update",
      resourceType: "fxs",
      resourceId: saved.fx.id,
      file: "fxs.json",
    });
    return NextResponse.json({ ok: true, detail: saved });
  } catch (error) {
    return jsonError(error);
  }
}
