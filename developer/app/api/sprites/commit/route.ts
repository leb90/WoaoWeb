import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { commitSpriteImport, readJob, type SpritePlan } from "@/lib/graphics/spriteImport";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = (await request.json()) as { jobId?: string; plan?: SpritePlan };
    if (!body.jobId || !body.plan) {
      return NextResponse.json({ error: "Falta la hoja o el plan." }, { status: 400 });
    }
    const result = await commitSpriteImport(readJob(body.jobId), body.plan);
    return NextResponse.json({ result });
  } catch (error) {
    return jsonError(error);
  }
}
