import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import {
  loadMapEditorState,
  MAP_RESTART_HINTS,
  saveMapEditorState,
} from "@/lib/maps/io";
import type { EditorMapState } from "@/lib/maps/types";
import { listNpcSummaries, listObjectSummaries } from "@/lib/game-data/catalog";
import {
  resolveBodyGrh,
  resolveHeadGrh,
  resolveHeadOffset,
} from "@/lib/graphics/sprites";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireSession();
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const state = loadMapEditorState(id);
    return NextResponse.json({
      state,
      catalogs: {
        npcs: listNpcSummaries().map((n) => {
          const bodyGrh = resolveBodyGrh(n.idBody);
          const headGrh = resolveHeadGrh(n.idHead);
          const headOffset = resolveHeadOffset(n.idBody);
          return {
            id: n.id,
            name: n.name,
            idBody: n.idBody,
            idHead: n.idHead,
            bodyGrh,
            headGrh,
            headOffsetX: headOffset.x,
            headOffsetY: headOffset.y,
          };
        }),
        objects: listObjectSummaries().map((o) => ({
          id: o.id,
          name: o.name,
          grhIndex: o.grhIndex,
        })),
      },
      hints: MAP_RESTART_HINTS,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id < 1) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const body = (await request.json()) as { state?: EditorMapState };
    if (!body.state) {
      return NextResponse.json({ error: "state requerido" }, { status: 400 });
    }
    if (Number(body.state.id) !== id) {
      return NextResponse.json(
        { error: "state.id no coincide con la URL" },
        { status: 400 },
      );
    }
    saveMapEditorState(body.state, session);
    return NextResponse.json({ ok: true, hints: MAP_RESTART_HINTS });
  } catch (error) {
    return jsonError(error);
  }
}
