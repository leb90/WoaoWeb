import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { listBackups, restoreBackup } from "@/lib/game-data/backups";
import { resolveResourcePaths, type AllowedResource } from "@/lib/security/paths";
import { appendAudit } from "@/lib/security/audit";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    return NextResponse.json({ items: listBackups(80) });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = (await request.json()) as {
      id?: string;
      resource?: AllowedResource;
    };
    if (!body.id || !body.resource) {
      return NextResponse.json(
        { error: "id y resource requeridos" },
        { status: 400 },
      );
    }
    const targets = resolveResourcePaths(body.resource);
    restoreBackup(body.id, targets);
    for (const file of targets) {
      appendAudit(session, {
        action: "restore-backup",
        resourceType: body.resource,
        resourceId: body.id,
        file,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
