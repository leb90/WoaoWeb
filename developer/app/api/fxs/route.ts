import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { resolveFxAnimation, listFxSummaries } from "@/lib/graphics/fxs";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const fxId = Number(url.searchParams.get("fxId") ?? 0);
    if (!fxId) {
      return NextResponse.json({ items: listFxSummaries() });
    }
    const anim = resolveFxAnimation(fxId);
    if (!anim) {
      return NextResponse.json({ error: "FX no encontrado", fxId }, { status: 404 });
    }
    return NextResponse.json(anim);
  } catch (error) {
    return jsonError(error);
  }
}
