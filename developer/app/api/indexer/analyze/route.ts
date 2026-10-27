import { NextResponse } from "next/server";
import { createMapIndexJob } from "@/lib/graphics/mapIndexing";
import { jsonError, requireSession } from "@/lib/security/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireSession();
    const form = await request.formData();
    const file = form.get("file");
    const layer = Math.trunc(Number(form.get("layer")));
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Selecciona un grafico PNG o WebP." }, { status: 400 });
    }
    if (layer < 1 || layer > 4) {
      return NextResponse.json({ error: "Selecciona una capa valida." }, { status: 400 });
    }
    const result = await createMapIndexJob(Buffer.from(await file.arrayBuffer()), layer);
    return NextResponse.json({
      ...result,
      imageUrl: `/api/indexer/jobs/${result.jobId}`,
    });
  } catch (error) {
    return jsonError(error);
  }
}
