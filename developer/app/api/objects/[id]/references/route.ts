import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { findObjectReferences } from "@/lib/game-data/catalog";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const references = findObjectReferences(id);
    return NextResponse.json({ id, references, count: references.length });
  } catch (error) {
    return jsonError(error);
  }
}
