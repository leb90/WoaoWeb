import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { loadMannequin } from "@/lib/graphics/mannequin";
import type { SpriteKind } from "@/lib/graphics/spriteImport";

export const runtime = "nodejs";

function kindOf(value: string | null): SpriteKind | undefined {
  if (value === "body" || value === "helmet" || value === "shield" || value === "weapon") return value;
  return undefined;
}

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const kind = kindOf(url.searchParams.get("kind"));
    const anim = Number(url.searchParams.get("anim") || 0);
    const payload = await loadMannequin({
      kind,
      anim: anim > 0 ? anim : undefined,
      bodyId: Number(url.searchParams.get("body") || 1),
      headId: Number(url.searchParams.get("head") || 1),
    });
    return NextResponse.json(payload);
  } catch (error) {
    return jsonError(error);
  }
}
