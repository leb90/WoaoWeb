import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { getTexturePublicPath, resolveGrh } from "@/lib/graphics/grh";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const grhIndex = Number(new URL(request.url).searchParams.get("grhIndex") ?? 0);
    const grh = resolveGrh(grhIndex);
    if (!grh) {
      return NextResponse.json({ preview: null });
    }
    return NextResponse.json({
      preview: { ...grh, textureUrl: getTexturePublicPath(grh) },
    });
  } catch (error) {
    return jsonError(error);
  }
}
