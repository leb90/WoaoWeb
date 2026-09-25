import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  loadBalance,
  restartHintsFor,
  saveBalance,
} from "@/lib/game-data/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({
      data: loadBalance(),
      hints: restartHintsFor("balance"),
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as { data?: Record<string, unknown> };
    if (!body.data) {
      return NextResponse.json({ error: "data requerido" }, { status: 400 });
    }
    saveBalance(body.data, session);
    return NextResponse.json({ ok: true, hints: restartHintsFor("balance") });
  } catch (error) {
    return jsonError(error);
  }
}
