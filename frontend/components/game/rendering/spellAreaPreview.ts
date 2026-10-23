import { Graphics } from "pixi.js";
import { TILE_SIZE } from "../../../lib/viewport";
import { getSpellAreaOffsets } from "../../../lib/spellArea";
import type { Engine } from "../engine/Engine";

// Mientras se apunta un hechizo de área (Llamarada, Ventisca) se pintan en verde las baldosas que va a afectar,
// como en el _React-Argentum viejo: relleno verde al 30 % y borde al 80 % con esquinas redondeadas. Va en el piso
// (encima del suelo y debajo de objetos y personajes) y solo lo ve quien apunta.
const AREA_FILL = { color: 0x00ff00, alpha: 0.3 };
const AREA_STROKE = { width: 3, color: 0x00ff00, alpha: 0.8 };
const CORNER_RADIUS = 4;

type PreviewEngine = Engine & {
    hoverPointerGlobal?: { x: number; y: number } | null;
    spellAreaPreview?: Graphics | null;
};

function ensurePreview(engine: PreviewEngine): Graphics | null {
    if (!engine.mapContainer) return null;
    const existing = engine.spellAreaPreview;
    if (existing && !existing.destroyed && existing.parent === engine.mapContainer) return existing;
    const graphics = new Graphics();
    graphics.zIndex = Number.MIN_SAFE_INTEGER + 2;
    graphics.eventMode = "none";
    engine.mapContainer.addChild(graphics);
    engine.spellAreaPreview = graphics;
    return graphics;
}

/** Se llama en cada cuadro con el `aoe` del hechizo que se está apuntando (0 = ninguno de área). */
export function updateSpellAreaPreview(engine: PreviewEngine, aoe: number) {
    const offsets = getSpellAreaOffsets(aoe);
    const pointer = engine.hoverPointerGlobal;
    if (!offsets.length || !pointer || !engine.mapContainer) {
        if (engine.spellAreaPreview && !engine.spellAreaPreview.destroyed) engine.spellAreaPreview.clear();
        return;
    }

    const graphics = ensurePreview(engine);
    if (!graphics) return;
    const local = engine.mapContainer.toLocal(pointer);
    const center = engine.worldToCurrentMapTile(local.x, local.y);

    graphics.clear();
    for (const { dx, dy } of offsets) {
        const x = engine.tileToWorldX(center.x + dx);
        const y = engine.tileToWorldY(center.y + dy);
        graphics
            .roundRect(x + 1.5, y + 1.5, TILE_SIZE - 3, TILE_SIZE - 3, CORNER_RADIUS)
            .fill(AREA_FILL)
            .stroke(AREA_STROKE);
    }
}
