import { NextResponse } from "next/server";
import { readMapIndexJob } from "@/lib/graphics/mapIndexing";
import { jsonError, requireSession } from "@/lib/security/api";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    await requireSession();
    const { jobId } = await params;
    return new NextResponse(new Uint8Array(readMapIndexJob(jobId)), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
