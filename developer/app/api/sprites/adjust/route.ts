import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { collectFrameIds, rotateCatalogDirections, saveCatalogOffset, shiftGraphic, shiftGraphics, swapCatalogDirections } from "@/lib/graphics/mannequin";
import type { DirectionId, SpriteKind } from "@/lib/graphics/spriteImport";

export const runtime = "nodejs";

function isKind(value: unknown): value is SpriteKind {
  return value === "body" || value === "helmet" || value === "shield" || value === "weapon";
}

function isDirection(value: unknown): value is DirectionId {
  return value === "1" || value === "2" || value === "3" || value === "4";
}

export async function POST(request: Request) {
  try {
    await requireSession();
    const body = (await request.json()) as {
      action?: string;
      grh?: number;
      dx?: number;
      dy?: number;
      kind?: string;
      anim?: number;
      direction?: string;
      from?: string;
      to?: string;
      scope?: string;
      clockwise?: boolean;
      offsetX?: number;
      offsetY?: number;
    };

    if (body.action === "shift") {
      const dx = Math.round(Number(body.dx) || 0);
      const dy = Math.round(Number(body.dy) || 0);
      const grh = Math.round(Number(body.grh) || 0);
      if (!grh || Math.abs(dx) > 12 || Math.abs(dy) > 12) {
        return NextResponse.json({ error: "El ajuste tiene que ser de hasta 12 píxeles." }, { status: 400 });
      }
      await shiftGraphic(grh, dx, dy);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "shiftGroup" && isKind(body.kind)) {
      const dx = Math.round(Number(body.dx) || 0);
      const dy = Math.round(Number(body.dy) || 0);
      const anim = Math.round(Number(body.anim) || 0);
      if (!anim || Math.abs(dx) > 12 || Math.abs(dy) > 12) {
        return NextResponse.json({ error: "El ajuste tiene que ser de hasta 12 píxeles." }, { status: 400 });
      }
      let direction: DirectionId | undefined;
      if (body.scope === "direction") {
        if (!isDirection(body.direction)) {
          return NextResponse.json({ error: "Elegí una dirección." }, { status: 400 });
        }
        direction = body.direction;
      } else if (body.scope !== "all") {
        return NextResponse.json({ error: "Elegí si mover una dirección o todas." }, { status: 400 });
      }
      await shiftGraphics(collectFrameIds(body.kind, anim, direction), dx, dy);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "swapDirections" && isKind(body.kind)) {
      const anim = Math.round(Number(body.anim) || 0);
      if (!anim || !isDirection(body.from) || !isDirection(body.to) || body.from === body.to) {
        return NextResponse.json({ error: "Elegí dos direcciones distintas." }, { status: 400 });
      }
      swapCatalogDirections(body.kind, anim, body.from, body.to);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "rotateDirections" && isKind(body.kind)) {
      const anim = Math.round(Number(body.anim) || 0);
      if (!anim) return NextResponse.json({ error: "No hay animación para girar." }, { status: 400 });
      rotateCatalogDirections(body.kind, anim, Boolean(body.clockwise));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "offset" && isKind(body.kind)) {
      saveCatalogOffset(
        body.kind,
        Math.round(Number(body.anim) || 0),
        Math.round(Number(body.offsetX) || 0),
        Math.round(Number(body.offsetY) || 0),
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Ajuste desconocido." }, { status: 400 });
  } catch (error) {
    return jsonError(error);
  }
}
