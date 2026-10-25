import { NextResponse } from "next/server";
import { commitMapIndexJob, type MapIndexRegion } from "@/lib/graphics/mapIndexing";
import { jsonError, requireSession } from "@/lib/security/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = (await request.json()) as { jobId?: string; regions?: MapIndexRegion[] };
    if (!body.jobId || !Array.isArray(body.regions)) {
      return NextResponse.json({ error: "Falta la hoja o el plan de indexacion." }, { status: 400 });
    }
    const result = await commitMapIndexJob(body.jobId, body.regions);
    return NextResponse.json({ result });
  } catch (error) {
    return jsonError(error);
  }
}
