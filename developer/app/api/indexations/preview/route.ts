import { NextResponse } from "next/server";
import { renderIndexationPreview } from "@/lib/graphics/mapIndexing";
import { jsonError, requireSession } from "@/lib/security/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const image = await renderIndexationPreview({
      grhIndice: Math.trunc(Number(url.searchParams.get("grh") ?? 0)),
      ancho: Math.trunc(Number(url.searchParams.get("ancho") ?? 1)),
      alto: Math.trunc(Number(url.searchParams.get("alto") ?? 1)),
      capa: Math.trunc(Number(url.searchParams.get("capa") ?? 1)),
      maxSize: Math.trunc(Number(url.searchParams.get("max") ?? 900)),
    });
    return new NextResponse(new Uint8Array(image), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
