import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  createObject,
  listObjectSummaries,
  restartHintsFor,
} from "@/lib/game-data/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({ items: listObjectSummaries() });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      data?: Record<string, unknown>;
      id?: number;
    };
    if (!body.data || typeof body.data !== "object") {
      return NextResponse.json({ error: "data requerido" }, { status: 400 });
    }
    const id = createObject(body.data, session, body.id);
    return NextResponse.json({
      id,
      hints: restartHintsFor("objs"),
    });
  } catch (error) {
    return jsonError(error);
  }
}
