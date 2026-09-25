import fs from "node:fs";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  resolveGrh,
  getTexturePublicPath,
  resolveGraphicsPngAbsolute,
} from "@/lib/graphics/grh";

export const runtime = "nodejs";

/** Known bad "DADI GRATIA" die placeholder used when a graphic failed conversion */
const DADI_PLACEHOLDER_SHA256 =
  "02ba84297bdbfc07bf3e9b88fe4118711718a91c3d21fa106e5eccf78e760779";

/**
 * Batch resolve GRH metadata for the map canvas.
 * POST { grhIndexes: number[] } → { entries: Record<string, preview|null> }
 */
export async function POST(request: Request) {
  try {
    await requireSession();
    const body = (await request.json()) as { grhIndexes?: number[] };
    const indexes = Array.isArray(body.grhIndexes) ? body.grhIndexes : [];
    const unique = [
      ...new Set(indexes.filter((n) => Number.isFinite(n) && n > 0)),
    ];
    const entries: Record<
      string,
      {
        textureUrl: string;
        sX: number;
        sY: number;
        width: number;
        height: number;
        numFile: number;
        placeholder?: boolean;
      } | null
    > = {};

    for (const grhIndex of unique.slice(0, 2000)) {
      const grh = resolveGrh(grhIndex);
      if (!grh || !grh.numFile || grh.width <= 0 || grh.height <= 0) {
        entries[String(grhIndex)] = null;
        continue;
      }
      let abs: string;
      try {
        abs = resolveGraphicsPngAbsolute(grh.numFile);
      } catch {
        entries[String(grhIndex)] = null;
        continue;
      }
      if (!fs.existsSync(abs)) {
        entries[String(grhIndex)] = null;
        continue;
      }
      let placeholder = false;
      try {
        const buf = fs.readFileSync(abs);
        if (buf.length === 11790) {
          const hash = createHash("sha256").update(buf).digest("hex");
          if (hash === DADI_PLACEHOLDER_SHA256) placeholder = true;
        }
      } catch {
        /* ignore hash errors */
      }
      entries[String(grhIndex)] = {
        textureUrl: getTexturePublicPath(grh),
        sX: grh.sX,
        sY: grh.sY,
        width: grh.width,
        height: grh.height,
        numFile: grh.numFile,
        ...(placeholder ? { placeholder: true } : {}),
      };
    }

    return NextResponse.json({ entries });
  } catch (error) {
    return jsonError(error);
  }
}
