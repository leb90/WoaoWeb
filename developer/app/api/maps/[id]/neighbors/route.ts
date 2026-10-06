import { NextResponse } from "next/server";
import { loadNeighborStrips } from "@/lib/maps/continuousNeighbors";
import { jsonError, requireSession } from "@/lib/security/api";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const view = loadNeighborStrips(id);
    return NextResponse.json(view);
  } catch (error) {
    return jsonError(error);
  }
}
