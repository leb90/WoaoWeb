import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { indexerStatus, listReferences } from "@/lib/graphics/spriteImport";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const kind = new URL(request.url).searchParams.get("kind") ?? undefined;
    const allowed = kind === "body" || kind === "helmet" || kind === "shield" || kind === "weapon" ? kind : undefined;
    return NextResponse.json({
      status: indexerStatus(),
      references: listReferences(allowed).slice(0, 500),
    });
  } catch (error) {
    return jsonError(error);
  }
}
