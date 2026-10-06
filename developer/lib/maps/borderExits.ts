import { cloneEditorState } from "./terrain";
import type { EditorMapState, TileExitDestination } from "./types";
import { tileKey } from "./types";

/**
 * Classic Argentum / WorldEditor border warp rows for 100×100 maps.
 * Matches existing mapas_source conventions (e.g. mapa_1).
 */
export const AO_BORDER = {
  /** Local Y of northern exit row */
  northY: 10,
  /** Destination Y when walking north into another map */
  northDestY: 90,
  southY: 91,
  southDestY: 11,
  westX: 13,
  westDestX: 87,
  eastX: 88,
  eastDestX: 14,
  /** Inclusive X range for N/S strips */
  xMin: 12,
  xMax: 88,
  /** Inclusive Y range for E/W strips */
  yMin: 11,
  yMax: 90,
} as const;

export type BorderMapsForm = {
  north: number | null;
  south: number | null;
  east: number | null;
  west: number | null;
  /** If true, remove previous exits on those border rows/cols first */
  replaceExisting: boolean;
};

export type BorderExitPlan = {
  key: string;
  dest: TileExitDestination;
  edge: "north" | "south" | "east" | "west";
};

export function planBorderExits(
  width: number,
  height: number,
  form: BorderMapsForm,
): BorderExitPlan[] {
  const b = AO_BORDER;
  const xMin = Math.max(1, Math.min(width, b.xMin));
  const xMax = Math.max(1, Math.min(width, b.xMax));
  const yMin = Math.max(1, Math.min(height, b.yMin));
  const yMax = Math.max(1, Math.min(height, b.yMax));
  const northY = Math.max(1, Math.min(height, b.northY));
  const southY = Math.max(1, Math.min(height, b.southY));
  const westX = Math.max(1, Math.min(width, b.westX));
  const eastX = Math.max(1, Math.min(width, b.eastX));

  const out: BorderExitPlan[] = [];

  if (form.north && form.north > 0) {
    for (let x = xMin; x <= xMax; x++) {
      out.push({
        key: tileKey(x, northY),
        dest: { map: form.north, x, y: b.northDestY },
        edge: "north",
      });
    }
  }
  if (form.south && form.south > 0) {
    for (let x = xMin; x <= xMax; x++) {
      out.push({
        key: tileKey(x, southY),
        dest: { map: form.south, x, y: b.southDestY },
        edge: "south",
      });
    }
  }
  if (form.west && form.west > 0) {
    for (let y = yMin; y <= yMax; y++) {
      out.push({
        key: tileKey(westX, y),
        dest: { map: form.west, x: b.westDestX, y },
        edge: "west",
      });
    }
  }
  if (form.east && form.east > 0) {
    for (let y = yMin; y <= yMax; y++) {
      out.push({
        key: tileKey(eastX, y),
        dest: { map: form.east, x: b.eastDestX, y },
        edge: "east",
      });
    }
  }

  return out;
}

function sideOpen(mapId: number | null): boolean {
  return mapId != null && mapId > 0;
}

/**
 * Un tile de una línea de salida no se abre si cae en un borde sin traslado
 * o en la franja exterior (árboles).
 */
function exitTileStaysBlocked(
  x: number,
  y: number,
  form: BorderMapsForm,
): boolean {
  const b = AO_BORDER;
  if (y < b.northY || y > b.southY || x < b.westX || x > b.eastX) return true;
  if (!sideOpen(form.north) && y === b.northY) return true;
  if (!sideOpen(form.south) && y === b.southY) return true;
  if (!sideOpen(form.west) && x === b.westX) return true;
  if (!sideOpen(form.east) && x === b.eastX) return true;
  return false;
}

/**
 * Bloqueos de los cuatro bordes. El lado con mapa deja libre la línea de
 * traslados. El lado vacío se bloquea entero, sin salida.
 */
export function planBorderBlocks(
  width: number,
  height: number,
  form: BorderMapsForm,
): Array<{ x: number; y: number }> {
  const b = AO_BORDER;
  const blocks: Array<{ x: number; y: number }> = [];
  const push = (x: number, y: number) => {
    if (x < 1 || y < 1 || x > width || y > height) return;
    blocks.push({ x, y });
  };

  for (let y = 1; y < b.northY; y++) {
    for (let x = 1; x <= width; x++) push(x, y);
  }
  for (let y = b.southY + 1; y <= height; y++) {
    for (let x = 1; x <= width; x++) push(x, y);
  }
  for (let x = 1; x < b.westX; x++) {
    for (let y = 1; y <= height; y++) push(x, y);
  }
  for (let x = b.eastX + 1; x <= width; x++) {
    for (let y = 1; y <= height; y++) push(x, y);
  }

  if (sideOpen(form.north)) {
    for (let x = 1; x <= width; x++) {
      if (x < b.xMin || x > b.xMax) push(x, b.northY);
    }
  } else {
    for (let x = 1; x <= width; x++) push(x, b.northY);
  }
  if (sideOpen(form.south)) {
    for (let x = 1; x <= width; x++) {
      if (x < b.xMin || x > b.xMax) push(x, b.southY);
    }
  } else {
    for (let x = 1; x <= width; x++) push(x, b.southY);
  }
  if (sideOpen(form.west)) {
    for (let y = 1; y <= height; y++) {
      if (y < b.yMin || y > b.yMax) push(b.westX, y);
    }
  } else {
    for (let y = 1; y <= height; y++) push(b.westX, y);
  }
  if (sideOpen(form.east)) {
    for (let y = 1; y <= height; y++) {
      if (y < b.yMin || y > b.yMax) push(b.eastX, y);
    }
  } else {
    for (let y = 1; y <= height; y++) push(b.eastX, y);
  }

  return blocks;
}

export function applyBorderExits(
  state: EditorMapState,
  form: BorderMapsForm,
): { state: EditorMapState; placed: number; cleared: number; blocked: number } {
  const plan = planBorderExits(state.width, state.height, form);
  const next = cloneEditorState(state);

  let cleared = 0;
  if (form.replaceExisting) {
    const borderKeys = new Set(
      planBorderExits(state.width, state.height, {
        north: 1,
        south: 1,
        east: 1,
        west: 1,
        replaceExisting: false,
      }).map((p) => p.key),
    );
    for (const key of Object.keys(next.specials.exits)) {
      if (borderKeys.has(key)) {
        delete next.specials.exits[key];
        cleared++;
      }
    }
  }

  const exitKeys = new Set(plan.map((p) => p.key));
  let blocked = 0;
  const seen = new Set<string>();
  for (const cell of planBorderBlocks(state.width, state.height, form)) {
    const key = tileKey(cell.x, cell.y);
    if (seen.has(key) || exitKeys.has(key)) continue;
    seen.add(key);
    const tile = next.tiles[cell.y - 1]?.[cell.x - 1];
    if (!tile) continue;
    tile.blocked = true;
    blocked++;
    if (next.specials.exits[key]) {
      delete next.specials.exits[key];
      cleared++;
    }
  }

  const b = AO_BORDER;
  if (!sideOpen(form.north)) {
    for (let x = 1; x <= state.width; x++) delete next.specials.exits[tileKey(x, b.northY)];
  }
  if (!sideOpen(form.south)) {
    for (let x = 1; x <= state.width; x++) delete next.specials.exits[tileKey(x, b.southY)];
  }
  if (!sideOpen(form.west)) {
    for (let y = 1; y <= state.height; y++) delete next.specials.exits[tileKey(b.westX, y)];
  }
  if (!sideOpen(form.east)) {
    for (let y = 1; y <= state.height; y++) delete next.specials.exits[tileKey(b.eastX, y)];
  }

  let placed = 0;
  for (const p of plan) {
    const [xs, ys] = p.key.split(",");
    const x = Number(xs);
    const y = Number(ys);
    const tile = next.tiles[y - 1]?.[x - 1];
    if (exitTileStaysBlocked(x, y, form)) {
      if (tile) tile.blocked = true;
      delete next.specials.exits[p.key];
      continue;
    }
    next.specials.exits[p.key] = { ...p.dest };
    if (tile) tile.blocked = false;
    placed++;
  }

  for (const key of seen) {
    const [xs, ys] = key.split(",");
    const tile = next.tiles[Number(ys) - 1]?.[Number(xs) - 1];
    if (!tile?.blocked || !next.specials.exits[key]) continue;
    delete next.specials.exits[key];
    cleared++;
  }

  return { state: next, placed, cleared, blocked };
}
