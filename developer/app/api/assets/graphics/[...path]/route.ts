import fs from "node:fs";
import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  resolveGraphicsPngAbsolute,
} from "@/lib/graphics/grh";

export const runtime = "nodejs";

type Params = { params: Promise<{ path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const { path: parts } = await params;
    const name = parts?.join("/") ?? "";
    const match = /^(\d+)\.png$/i.exec(name);
    if (!match) {
      return NextResponse.json({ error: "Asset no permitido" }, { status: 400 });
    }
    const numFile = Number(match[1]);
    const abs = resolveGraphicsPngAbsolute(numFile);
    if (!fs.existsSync(abs)) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }
    const buf = fs.readFileSync(abs);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
