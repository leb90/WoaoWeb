import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  defaultReferenceId,
  detectSheet,
  getReference,
  readJob,
  renderPreviewCells,
  saveJob,
  suggestAssignments,
  type AlignMode,
  type SpriteKind,
} from "@/lib/graphics/spriteImport";

export const runtime = "nodejs";

function isKind(value: unknown): value is SpriteKind {
  return value === "body" || value === "helmet" || value === "shield" || value === "weapon";
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const form = await request.formData();
    const file = form.get("file");
    const kindValue = form.get("kind");
    if (!(file instanceof File) || !isKind(kindValue)) {
      return NextResponse.json({ error: "Subí una hoja y elegí el tipo." }, { status: 400 });
    }

    const referenceId = Number(form.get("referenceItemId") || defaultReferenceId(kindValue));
    const reference = getReference(referenceId);
    const cellWidth = Number(form.get("cellWidth") || reference.cellWidth);
    const cellHeight = Number(form.get("cellHeight") || reference.cellHeight);
    const contentScale = Number(form.get("contentScale") || (kindValue === "shield" ? 0.62 : kindValue === "weapon" ? 0.9 : 1));
    const align: AlignMode = form.get("align") === "center" || kindValue !== "body" ? "center" : "bottom";
    const input = Buffer.from(await file.arrayBuffer());
    const jobId = await saveJob(input);
    const sheet = readJob(jobId);
    const detected = await detectSheet(sheet);
    const suggestion = suggestAssignments(kindValue, detected.rows);
    const previews: Record<string, string[]> = {};

    for (const row of detected.rows) {
      previews[String(row.index)] = await renderPreviewCells(
        sheet,
        row.frames,
        Math.max(8, Math.min(160, Math.round(cellWidth))),
        Math.max(8, Math.min(160, Math.round(cellHeight))),
        align,
        contentScale,
      );
    }

    return NextResponse.json({
      jobId,
      width: detected.width,
      height: detected.height,
      rows: detected.rows,
      previews,
      suggestion,
      reference,
      cellWidth,
      cellHeight,
      align,
      contentScale,
    });
  } catch (error) {
    return jsonError(error);
  }
}
