import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { listMapSummaries } from "@/lib/maps/io";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({ items: listMapSummaries() });
  } catch (error) {
    return jsonError(error);
  }
}
