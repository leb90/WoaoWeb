import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { loadIndices } from "@/lib/maps/indices";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
    const limit = Math.min(
      500,
      Math.max(1, Number(url.searchParams.get("limit") ?? 200) || 200),
    );
    let items = loadIndices();
    if (q) {
      items = items.filter(
        (r) =>
          r.nombre.toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          String(r.grhIndice).includes(q),
      );
    }
    return NextResponse.json({
      total: items.length,
      items: items.slice(0, limit),
    });
  } catch (error) {
    return jsonError(error);
  }
}
