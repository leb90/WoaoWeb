import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  resolveBodyGrh,
  resolveHeadGrh,
  resolveHeadOffset,
} from "@/lib/graphics/sprites";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const body = Number(url.searchParams.get("body") ?? 0);
    const head = Number(url.searchParams.get("head") ?? 0);
    return NextResponse.json({
      bodyGrh: resolveBodyGrh(body),
      headGrh: resolveHeadGrh(head),
      headOffset: resolveHeadOffset(body),
    });
  } catch (error) {
    return jsonError(error);
  }
}
