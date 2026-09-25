import type { EditorMapState, IndexReferencia, MapViewMode } from "./types";
import { TILE_SIZE } from "./types";
import type { OverlayPrefs } from "./mapEditorPrefs";
import { triggerColor } from "./triggerCatalog";

export type GrhMeta = {
  textureUrl: string;
  sX: number;
  sY: number;
  width: number;
  height: number;
  numFile: number;
  /** True when the PNG is the known DADI GRATIA conversion placeholder */
  placeholder?: boolean;
};

export type CatalogObj = { id: number; name: string; grhIndex: number };

export type CatalogNpc = {
  id: number;
  name: string;
  bodyGrh?: number;
  headGrh?: number;
  headOffsetX?: number;
  headOffsetY?: number;
};

export type RenderFrameArgs = {
  ctx: CanvasRenderingContext2D;
  canvasW: number;
  canvasH: number;
  state: EditorMapState;
  pan: { x: number; y: number };
  zoom: number;
  view: MapViewMode;
  layerVisible: [boolean, boolean, boolean, boolean];
  layerOpacity: [number, number, number, number];
  overlays: OverlayPrefs;
  triggerVisibility: Record<string, boolean>;
  showTriggerNumbers: boolean;
  cursor: { x: number; y: number } | null;
  selected: { x: number; y: number } | null;
  stampPreview: IndexReferencia | null;
  stampTool: boolean;
  objects: CatalogObj[];
  npcs: CatalogNpc[];
  grhCache: Map<number, GrhMeta | null>;
  imageCache: Map<number, HTMLImageElement>;
};

function terrainAlpha(view: MapViewMode): number {
  switch (view) {
    case "collisions":
      return 0.35;
    case "gameplay":
      return 0.4;
    case "triggers":
      return 0.3;
    default:
      return 1;
  }
}

export function renderMapFrame(args: RenderFrameArgs): void {
  const {
    ctx,
    canvasW,
    canvasH,
    state,
    pan,
    zoom,
    view,
    layerVisible,
    layerOpacity,
    overlays,
    triggerVisibility,
    showTriggerNumbers,
    cursor,
    selected,
    stampPreview,
    stampTool,
    objects,
    npcs,
    grhCache,
    imageCache,
  } = args;

  ctx.fillStyle = "#0a0e14";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.save();
  ctx.translate(pan.x, pan.y);
  ctx.scale(zoom, zoom);

  // Strict viewport (grid / overlays). Tall L3/L4/objects need a wider
  // scrape so bottom-anchored sprites whose tile sits just below/beside
  // the screen still paint into the visible area (same as the game cull).
  const viewStartX = Math.max(0, Math.floor(-pan.x / zoom / TILE_SIZE) - 1);
  const viewStartY = Math.max(0, Math.floor(-pan.y / zoom / TILE_SIZE) - 1);
  const viewEndX = Math.min(
    state.width,
    Math.ceil((-pan.x + canvasW) / zoom / TILE_SIZE) + 1,
  );
  const viewEndY = Math.min(
    state.height,
    Math.ceil((-pan.y + canvasH) / zoom / TILE_SIZE) + 1,
  );
  const TALL_PAD_X = 10;
  const TALL_PAD_Y = 12;
  // Overlays / grid stay on the strict viewport.
  const startX = viewStartX;
  const startY = viewStartY;
  const endX = viewEndX;
  const endY = viewEndY;
  // Terrain scrape: pad so large L2 (tile-anchored, extends down-right) and
  // L3/L4 (bottom-anchored, extends up) still paint into the visible area.
  const tallStartX = Math.max(0, viewStartX - TALL_PAD_X);
  const tallStartY = Math.max(0, viewStartY - TALL_PAD_Y);
  const tallEndX = Math.min(state.width, viewEndX + TALL_PAD_X);
  const tallEndY = Math.min(state.height, viewEndY + TALL_PAD_Y);

  const baseAlpha = terrainAlpha(view);
  const showTerrain = view !== "gameplay" || true;

  const drawGrh = (
    grhIndex: number,
    dx: number,
    dy: number,
    bottomAnchor: boolean,
    alpha: number,
  ): boolean => {
    const meta = grhCache.get(grhIndex);
    if (meta === null) {
      // Resolved as missing — mark tile so "gráficos faltantes" are obvious
      ctx.fillStyle = "rgba(255, 0, 180, 0.35)";
      ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = "#ff00b4";
      ctx.lineWidth = 1 / zoom;
      ctx.strokeRect(dx + 1, dy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      return false;
    }
    if (!meta) return false;
    const img = imageCache.get(meta.numFile);
    if (!img || !img.complete) return false;
    let drawX = dx;
    let drawY = dy;
    if (bottomAnchor) {
      drawX = dx + 16 - Math.floor((meta.width * 16) / 32);
      drawY = dy + 32 - Math.floor((meta.height * 16) / 16);
    }
    ctx.globalAlpha = alpha;
    try {
      ctx.drawImage(
        img,
        meta.sX,
        meta.sY,
        meta.width,
        meta.height,
        drawX,
        drawY,
        meta.width,
        meta.height,
      );
    } catch {
      ctx.globalAlpha = 1;
      return false;
    }
    ctx.globalAlpha = 1;
    // Flag known bad placeholder textures (wrong art in the PNG pack)
    if (meta.placeholder) {
      ctx.fillStyle = "rgba(255, 180, 0, 0.25)";
      ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE);
      ctx.fillStyle = "#ffb400";
      ctx.font = `bold ${Math.max(8, 10 / zoom)}px ui-sans-serif`;
      ctx.fillText("!", dx + 3, dy + 12);
    }
    return true;
  };

  if (showTerrain) {
    // Match the game: ALL L1 (ground) first, then ALL L2 (below).
    // Painting L1+L2 in the same tile loop covers large L2 sprites
    // (carpas, banners, etc.) with later ground tiles — the client avoids
    // that with separate Pixi containers / z-index.
    if (layerVisible[0]) {
      for (let y = tallStartY; y < tallEndY; y++) {
        for (let x = tallStartX; x < tallEndX; x++) {
          const g = state.tiles[y]![x]!.layers[0];
          if (g) {
            drawGrh(
              g,
              x * TILE_SIZE,
              y * TILE_SIZE,
              false,
              baseAlpha * layerOpacity[0],
            );
          }
        }
      }
    }
    // L2: tile-anchored, often 200–250px — needs the tall scrape
    if (layerVisible[1]) {
      for (let y = tallStartY; y < tallEndY; y++) {
        for (let x = tallStartX; x < tallEndX; x++) {
          const g = state.tiles[y]![x]!.layers[1];
          if (g) {
            drawGrh(
              g,
              x * TILE_SIZE,
              y * TILE_SIZE,
              false,
              baseAlpha * layerOpacity[1],
            );
          }
        }
      }
    }

    // Map objects — real GRH only (no colored ID squares)
    // Use tall scrape: objects bottom-anchor and often extend above their tile.
    if (overlays.objects || view === "gameplay") {
      for (const [key, obj] of Object.entries(state.specials.objects)) {
        const [xs, ys] = key.split(",");
        const x = Number(xs) - 1;
        const y = Number(ys) - 1;
        if (x < tallStartX || x >= tallEndX || y < tallStartY || y >= tallEndY)
          continue;
        const found = objects.find((o) => o.id === obj.objIndex);
        if (found?.grhIndex) {
          drawGrh(found.grhIndex, x * TILE_SIZE, y * TILE_SIZE, true, 1);
        }
      }
    }

    // Layer 3 (walls / stalls / tall decor) — bottom-anchored, wide scrape
    if (layerVisible[2]) {
      for (let y = tallStartY; y < tallEndY; y++) {
        for (let x = tallStartX; x < tallEndX; x++) {
          const g = state.tiles[y]![x]!.layers[2];
          if (g) {
            drawGrh(
              g,
              x * TILE_SIZE,
              y * TILE_SIZE,
              true,
              baseAlpha * layerOpacity[2],
            );
          }
        }
      }
    }

    // NPCs — body/head sprites between L3 and L4 (game-like order)
    if (overlays.npcs || view === "gameplay") {
      for (const [key, npcId] of Object.entries(state.specials.npcs)) {
        const [xs, ys] = key.split(",");
        const x = Number(xs) - 1;
        const y = Number(ys) - 1;
        if (x < tallStartX || x >= tallEndX || y < tallStartY || y >= tallEndY)
          continue;
        const npc = npcs.find((n) => n.id === npcId);
        const dx = x * TILE_SIZE;
        const dy = y * TILE_SIZE;
        if (npc?.bodyGrh) {
          drawGrh(npc.bodyGrh, dx, dy, true, 1);
          if (npc.headGrh) {
            const bodyMeta = grhCache.get(npc.bodyGrh);
            const headMeta = grhCache.get(npc.headGrh);
            const img = headMeta
              ? imageCache.get(headMeta.numFile)
              : undefined;
            if (bodyMeta && headMeta && img?.complete) {
              const hx =
                dx +
                16 -
                Math.floor((headMeta.width * 16) / 32) +
                (npc.headOffsetX ?? 0);
              const hy =
                dy +
                TILE_SIZE -
                bodyMeta.height +
                (npc.headOffsetY ?? -4);
              ctx.globalAlpha = 1;
              try {
                ctx.drawImage(
                  img,
                  headMeta.sX,
                  headMeta.sY,
                  headMeta.width,
                  headMeta.height,
                  hx,
                  hy,
                  headMeta.width,
                  headMeta.height,
                );
              } catch {
                /* ignore */
              }
            }
          }
        } else {
          ctx.fillStyle = "rgba(74,222,128,0.35)";
          ctx.fillRect(dx + 8, dy + 8, 16, 16);
        }
      }
    }

    // Layer 4 (roofs) — bottom-anchored, wide scrape; hide in gameplay view
    if (layerVisible[3] && view !== "gameplay") {
      for (let y = tallStartY; y < tallEndY; y++) {
        for (let x = tallStartX; x < tallEndX; x++) {
          const g = state.tiles[y]![x]!.layers[3];
          if (g) {
            drawGrh(
              g,
              x * TILE_SIZE,
              y * TILE_SIZE,
              true,
              baseAlpha * layerOpacity[3],
            );
          }
        }
      }
    }
  }

  // Collisions / blocked
  if (overlays.blocked || view === "collisions") {
    const strength = view === "collisions" ? 0.55 : 0.28;
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const blocked = state.tiles[y]![x]!.blocked;
        if (view === "collisions") {
          ctx.fillStyle = blocked
            ? `rgba(220,40,40,${strength})`
            : "rgba(40,180,90,0.12)";
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          if (blocked) {
            ctx.strokeStyle = "rgba(255,80,80,0.7)";
            ctx.lineWidth = 1 / zoom;
            ctx.beginPath();
            ctx.moveTo(x * TILE_SIZE, y * TILE_SIZE);
            ctx.lineTo(x * TILE_SIZE + TILE_SIZE, y * TILE_SIZE + TILE_SIZE);
            ctx.stroke();
          }
        } else if (blocked) {
          ctx.fillStyle = `rgba(220,40,40,${strength})`;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  const markRect = (
    x: number,
    y: number,
    color: string,
    label: string,
    fillAlpha = 0.2,
  ) => {
    ctx.fillStyle = color.replace(")", `, ${fillAlpha})`).replace(
      "rgb",
      "rgba",
    );
    // color may be hex
    ctx.fillStyle = hexAlpha(color, fillAlpha);
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 / zoom;
    ctx.strokeRect(
      x * TILE_SIZE + 1,
      y * TILE_SIZE + 1,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
    );
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(9, 11 / zoom)}px ui-sans-serif`;
    ctx.fillText(label, x * TILE_SIZE + 3, y * TILE_SIZE + 12);
  };

  if (overlays.exits || view === "gameplay") {
    for (const key of Object.keys(state.specials.exits)) {
      const [xs, ys] = key.split(",");
      const x = Number(xs) - 1;
      const y = Number(ys) - 1;
      if (x < startX || x >= endX || y < startY || y >= endY) continue;
      markRect(x, y, "#22d3ee", "↗");
    }
  }

  // Optional ID labels only when "Especiales" overlay is on (debug)
  if (overlays.especiales) {
    if (overlays.npcs) {
      for (const [key, id] of Object.entries(state.specials.npcs)) {
        const [xs, ys] = key.split(",");
        const x = Number(xs) - 1;
        const y = Number(ys) - 1;
        if (x < startX || x >= endX || y < startY || y >= endY) continue;
        ctx.fillStyle = "rgba(74,222,128,0.9)";
        ctx.font = `bold ${9 / zoom}px ui-sans-serif`;
        ctx.fillText(`N${id}`, x * TILE_SIZE + 2, y * TILE_SIZE + 10);
      }
    }
    if (overlays.objects) {
      for (const [key, obj] of Object.entries(state.specials.objects)) {
        const [xs, ys] = key.split(",");
        const x = Number(xs) - 1;
        const y = Number(ys) - 1;
        if (x < startX || x >= endX || y < startY || y >= endY) continue;
        ctx.fillStyle = "rgba(251,191,36,0.9)";
        ctx.font = `bold ${9 / zoom}px ui-sans-serif`;
        ctx.fillText(`O${obj.objIndex}`, x * TILE_SIZE + 2, y * TILE_SIZE + 10);
      }
    }
  }

  if (overlays.triggers || view === "triggers" || view === "gameplay") {
    for (const [key, value] of Object.entries(state.specials.triggers)) {
      if (triggerVisibility[String(value)] === false) continue;
      const [xs, ys] = key.split(",");
      const x = Number(xs) - 1;
      const y = Number(ys) - 1;
      if (x < startX || x >= endX || y < startY || y >= endY) continue;
      const color = triggerColor(value);
      markRect(
        x,
        y,
        color,
        showTriggerNumbers || view === "triggers" ? String(value) : "T",
        view === "triggers" ? 0.45 : 0.22,
      );
    }
  }

  if (overlays.grid) {
    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1 / zoom;
    for (let x = startX; x <= endX; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, startY * TILE_SIZE);
      ctx.lineTo(x * TILE_SIZE, endY * TILE_SIZE);
      ctx.stroke();
    }
    for (let y = startY; y <= endY; y++) {
      ctx.beginPath();
      ctx.moveTo(startX * TILE_SIZE, y * TILE_SIZE);
      ctx.lineTo(endX * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }
  }

  if (overlays.coordinates) {
    ctx.fillStyle = "rgba(180,200,230,0.55)";
    ctx.font = `${9 / zoom}px ui-monospace`;
    for (let y = startY; y < endY; y += Math.max(1, Math.floor(4 / zoom))) {
      for (let x = startX; x < endX; x += Math.max(1, Math.floor(4 / zoom))) {
        ctx.fillText(`${x + 1},${y + 1}`, x * TILE_SIZE + 2, y * TILE_SIZE + 10);
      }
    }
  }

  if (overlays.grhIds) {
    ctx.fillStyle = "rgba(255,200,120,0.7)";
    ctx.font = `${8 / zoom}px ui-monospace`;
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const g = state.tiles[y]![x]!.layers[0];
        if (g) ctx.fillText(String(g), x * TILE_SIZE + 1, y * TILE_SIZE + 9);
      }
    }
  }

  if (selected) {
    ctx.strokeStyle = "#3d8bfd";
    ctx.lineWidth = 2 / zoom;
    ctx.strokeRect(
      (selected.x - 1) * TILE_SIZE,
      (selected.y - 1) * TILE_SIZE,
      TILE_SIZE,
      TILE_SIZE,
    );
  }

  if (cursor) {
    ctx.strokeStyle = "rgba(61,139,253,0.85)";
    ctx.lineWidth = 1.5 / zoom;
    const w = stampTool && stampPreview ? stampPreview.ancho : 1;
    const h = stampTool && stampPreview ? stampPreview.alto : 1;
    ctx.strokeRect(
      (cursor.x - 1) * TILE_SIZE,
      (cursor.y - 1) * TILE_SIZE,
      TILE_SIZE * w,
      TILE_SIZE * h,
    );
  }

  ctx.restore();
}

function hexAlpha(hex: string, alpha: number): string {
  if (hex.startsWith("#") && (hex.length === 7 || hex.length === 4)) {
    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === 7) {
      r = Number.parseInt(hex.slice(1, 3), 16);
      g = Number.parseInt(hex.slice(3, 5), 16);
      b = Number.parseInt(hex.slice(5, 7), 16);
    } else {
      r = Number.parseInt(hex[1]! + hex[1]!, 16);
      g = Number.parseInt(hex[2]! + hex[2]!, 16);
      b = Number.parseInt(hex[3]! + hex[3]!, 16);
    }
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return hex;
}

export type CoveringGraphic = {
  /** 1-based tile where the GRH is stored */
  x: number;
  y: number;
  /** 1..4 */
  layer: number;
  grh: number;
  width: number;
  height: number;
};

/**
 * Find tall/wide layer graphics whose drawn footprint overlaps the given tile.
 * L1/L2 are top-left anchored; L3/L4 are bottom-center (same as the game).
 * Used by the tile inspector so you can find the anchor of a carpa/banner.
 */
export function findCoveringGraphics(
  state: EditorMapState,
  tileX1: number,
  tileY1: number,
  grhCache: Map<number, GrhMeta | null>,
): CoveringGraphic[] {
  const sx = tileX1 - 1;
  const sy = tileY1 - 1;
  if (sx < 0 || sy < 0 || sx >= state.width || sy >= state.height) return [];

  const tileLeft = sx * TILE_SIZE;
  const tileTop = sy * TILE_SIZE;
  const tileRight = tileLeft + TILE_SIZE;
  const tileBottom = tileTop + TILE_SIZE;
  const PAD = 14;
  const out: CoveringGraphic[] = [];

  const y0 = Math.max(0, sy - PAD);
  const y1 = Math.min(state.height, sy + PAD);
  const x0 = Math.max(0, sx - PAD);
  const x1 = Math.min(state.width, sx + PAD);

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const layers = state.tiles[y]![x]!.layers;
      for (let li = 0; li < 4; li++) {
        const g = layers[li]!;
        if (!g) continue;
        // Own-tile layers are already listed in the inspector
        if (x === sx && y === sy) continue;
        const meta = grhCache.get(g);
        if (!meta || meta.width <= 0 || meta.height <= 0) continue;
        // Skip tiny 32x32 that can't meaningfully cover another tile
        if (meta.width <= TILE_SIZE && meta.height <= TILE_SIZE) continue;

        const bottom = li >= 2;
        let drawX = x * TILE_SIZE;
        let drawY = y * TILE_SIZE;
        if (bottom) {
          drawX = drawX + 16 - Math.floor((meta.width * 16) / 32);
          drawY = drawY + 32 - Math.floor((meta.height * 16) / 16);
        }

        const overlaps =
          drawX < tileRight &&
          drawX + meta.width > tileLeft &&
          drawY < tileBottom &&
          drawY + meta.height > tileTop;
        if (!overlaps) continue;

        out.push({
          x: x + 1,
          y: y + 1,
          layer: li + 1,
          grh: g,
          width: meta.width,
          height: meta.height,
        });
      }
    }
  }

  out.sort((a, b) => a.layer - b.layer || a.y - b.y || a.x - b.x);
  return out;
}

/** Draw compact minimap into a small canvas. */
export function renderMinimap(
  ctx: CanvasRenderingContext2D,
  state: EditorMapState,
  pan: { x: number; y: number },
  zoom: number,
  viewW: number,
  viewH: number,
  mapW: number,
  mapH: number,
): void {
  const scaleX = mapW / state.width;
  const scaleY = mapH / state.height;
  ctx.fillStyle = "#121820";
  ctx.fillRect(0, 0, mapW, mapH);

  // sample every N tiles
  const step = Math.max(1, Math.floor(state.width / mapW));
  for (let y = 0; y < state.height; y += step) {
    for (let x = 0; x < state.width; x += step) {
      const tile = state.tiles[y]![x]!;
      const g = tile.layers[0] || tile.layers[1];
      ctx.fillStyle = tile.blocked
        ? "#5a2020"
        : g
          ? "#2a4a32"
          : "#1a2030";
      ctx.fillRect(x * scaleX, y * scaleY, scaleX * step + 1, scaleY * step + 1);
    }
  }

  const vx = (-pan.x / zoom / TILE_SIZE) * scaleX;
  const vy = (-pan.y / zoom / TILE_SIZE) * scaleY;
  const vw = (viewW / zoom / TILE_SIZE) * scaleX;
  const vh = (viewH / zoom / TILE_SIZE) * scaleY;
  ctx.strokeStyle = "#3d8bfd";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(vx, vy, vw, vh);
}
