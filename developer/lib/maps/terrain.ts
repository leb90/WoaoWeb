import {
  cloneTile,
  emptyTile,
  type EditorMapState,
  type EditorSpecials,
  type EditorTile,
  type MapMeta,
  type PaletteTile,
  type SpecialsFile,
  type TerrainFile,
} from "./types";

function normalizeLayers(
  graphics: PaletteTile["graphics"],
): [number, number, number, number] {
  const layers: [number, number, number, number] = [0, 0, 0, 0];
  if (typeof graphics === "number" && Number.isFinite(graphics) && graphics > 0) {
    layers[0] = graphics;
    return layers;
  }
  if (Array.isArray(graphics)) {
    for (let i = 0; i < 4; i++) {
      const v = graphics[i];
      if (typeof v === "number" && Number.isFinite(v) && v > 0) {
        layers[i] = v;
      }
    }
  }
  return layers;
}

function encodeGraphics(
  layers: [number, number, number, number],
): number | Array<number | null> | undefined {
  const hasAny = layers.some((g) => g > 0);
  if (!hasAny) return undefined;
  const hasUpper = layers[1] > 0 || layers[2] > 0 || layers[3] > 0;
  if (!hasUpper) return layers[0];
  const arr: Array<number | null> = [null, null, null, null];
  for (let i = 0; i < 4; i++) {
    arr[i] = layers[i] > 0 ? layers[i] : null;
  }
  let last = 0;
  for (let i = 0; i < 4; i++) {
    if (arr[i] != null) last = i;
  }
  return arr.slice(0, last + 1);
}

function paletteKey(tile: EditorTile): string {
  return JSON.stringify({
    b: tile.blocked ? 1 : 0,
    g: tile.layers,
  });
}

export function expandTerrain(terrain: TerrainFile): {
  width: number;
  height: number;
  tiles: EditorTile[][];
} {
  const width = Number(terrain.width) || 100;
  const height = Number(terrain.height) || 100;
  const palette = terrain.palette ?? {};
  const rows = terrain.rows ?? [];
  const tiles: EditorTile[][] = [];

  for (let y = 0; y < height; y++) {
    const row: EditorTile[] = [];
    const srcRow = rows[y] ?? [];
    for (let x = 0; x < width; x++) {
      const paletteId = srcRow[x];
      if (paletteId == null || paletteId === 0) {
        row.push(emptyTile());
        continue;
      }
      const entry = palette[String(paletteId)];
      if (!entry) {
        row.push(emptyTile());
        continue;
      }
      row.push({
        layers: normalizeLayers(entry.graphics),
        blocked: Boolean(entry.blocked),
      });
    }
    tiles.push(row);
  }

  return { width, height, tiles };
}

export function collapseTerrain(
  id: number,
  width: number,
  height: number,
  tiles: EditorTile[][],
): TerrainFile {
  const paletteByKey = new Map<string, number>();
  const palette: Record<string, PaletteTile> = {};
  const rows: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const tile = tiles[y]?.[x] ?? emptyTile();
      const key = paletteKey(tile);
      let paletteId = paletteByKey.get(key);
      if (!paletteId) {
        paletteId = paletteByKey.size + 1;
        paletteByKey.set(key, paletteId);
        const graphics = encodeGraphics(tile.layers);
        const entry: PaletteTile = {};
        if (graphics !== undefined) entry.graphics = graphics;
        if (tile.blocked) entry.blocked = true;
        palette[String(paletteId)] = entry;
      }
      row.push(paletteId);
    }
    rows.push(row);
  }

  return { id, width, height, palette, rows };
}

export function normalizeSpecials(
  specials: SpecialsFile | null | undefined,
): EditorSpecials {
  return {
    exits: { ...(specials?.exits ?? {}) },
    objects: { ...(specials?.objects ?? {}) },
    npcs: { ...(specials?.npcs ?? {}) },
    triggers: { ...(specials?.triggers ?? {}) },
  };
}

export function cloneEditorState(state: EditorMapState): EditorMapState {
  return {
    id: state.id,
    meta: structuredClone(state.meta),
    width: state.width,
    height: state.height,
    tiles: state.tiles.map((row) => row.map(cloneTile)),
    specials: structuredClone(state.specials),
  };
}

export function buildEditorState(opts: {
  meta: MapMeta;
  terrain: TerrainFile;
  specials: SpecialsFile;
}): EditorMapState {
  const expanded = expandTerrain(opts.terrain);
  return {
    id: Number(opts.meta.id ?? opts.terrain.id),
    meta: opts.meta,
    width: expanded.width,
    height: expanded.height,
    tiles: expanded.tiles,
    specials: normalizeSpecials(opts.specials),
  };
}

export function floodFillLayer(
  tiles: EditorTile[][],
  width: number,
  height: number,
  startX0: number,
  startY0: number,
  layerIndex: number,
  newGrh: number,
): void {
  if (
    startX0 < 0 ||
    startY0 < 0 ||
    startX0 >= width ||
    startY0 >= height ||
    layerIndex < 0 ||
    layerIndex > 3
  ) {
    return;
  }
  const target = tiles[startY0]![startX0]!.layers[layerIndex];
  if (target === newGrh) return;

  const stack: Array<[number, number]> = [[startX0, startY0]];
  const seen = new Set<string>();

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const tile = tiles[y]![x]!;
    if (tile.layers[layerIndex] !== target) continue;
    tile.layers[layerIndex] = newGrh;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
}
