import { NextResponse } from "next/server";
import {
  loadIndexationRecords,
  updateIndexationRecord,
  type IndexationInput,
} from "@/lib/maps/indexations";
import { jsonError, requireSession } from "@/lib/security/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await requireSession();
    const url = new URL(request.url);
    const query = (url.searchParams.get("q") ?? "").trim().toLocaleLowerCase("es");
    const layer = Math.trunc(Number(url.searchParams.get("layer") ?? 0));
    const page = Math.max(1, Math.trunc(Number(url.searchParams.get("page") ?? 1)) || 1);
    const limit = Math.min(200, Math.max(20, Math.trunc(Number(url.searchParams.get("limit") ?? 80)) || 80));
    const loaded = loadIndexationRecords();
    let items = loaded.items;
    if (query) {
      items = items.filter((item) =>
        item.nombre.toLocaleLowerCase("es").includes(query) ||
        String(item.id).includes(query) ||
        String(item.grhIndice).includes(query),
      );
    }
    if (layer >= 1 && layer <= 4) items = items.filter((item) => item.capa === layer);
    const total = items.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const currentPage = Math.min(page, pages);
    return NextResponse.json({
      items: items.slice((currentPage - 1) * limit, currentPage * limit),
      total,
      page: currentPage,
      pages,
      revision: loaded.revision,
      duplicates: loaded.items.filter((item) => item.duplicateCount > 1).length,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    await requireSession();
    const body = (await request.json()) as {
      ordinal?: number;
      revision?: number;
      value?: IndexationInput;
    };
    if (!Number.isInteger(body.ordinal) || !Number.isInteger(body.revision) || !body.value) {
      return NextResponse.json({ error: "La edicion esta incompleta." }, { status: 400 });
    }
    return NextResponse.json(updateIndexationRecord({
      ordinal: body.ordinal!,
      revision: body.revision!,
      value: body.value,
    }));
  } catch (error) {
    return jsonError(error);
  }
}
