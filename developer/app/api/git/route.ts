import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { getGitStatus } from "@/lib/game-data/git";
import { readRecentAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind") ?? "git";
    if (kind === "audit") {
      return NextResponse.json({ items: readRecentAudit(200) });
    }
    return NextResponse.json(getGitStatus());
  } catch (error) {
    return jsonError(error);
  }
}
