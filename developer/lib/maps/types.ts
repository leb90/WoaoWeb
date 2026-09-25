export const TILE_SIZE = 32;

export type MapMeta = {
  id: number;
  name: string;
  musicNum?: number;
  magiaSinEfecto?: number;
  noEncriptarMp?: number;
  terreno?: string;
  zona?: string;
  restringir?: string | number;
  minLevel?: number;
  maxLevel?: number;
  backup?: number;
  pk?: number;
  [key: string]: unknown;
};

/** graphics: number = layer1 only; array index 0..3 = layers 1..4 */
export type PaletteTile = {
  graphics?: number | Array<number | null>;
  blocked?: boolean;
};

export type TerrainFile = {
  id: number;
  width: number;
  height: number;
  palette: Record<string, PaletteTile>;
  rows: number[][];
};

export type TileExitDestination = { map: number; x: number; y: number };

export type TileExit =
  | TileExitDestination
  | { destinations: TileExitDestination[] };

export type SpecialsFile = {
  id: number;
  exits?: Record<string, TileExit>;
  objects?: Record<string, { objIndex: number; amount: number }>;
  npcs?: Record<string, number>;
  triggers?: Record<string, number>;
};

export type NpcPlacement = {
  mapNum: number;
  x: number;
  y: number;
  npcIndex: number;
  movement?: number;
};

/** Expanded in-memory tile (editor working model) */
export type EditorTile = {
  /** layers 1..4 as GRH ids; 0 = empty */
  layers: [number, number, number, number];
  blocked: boolean;
};

export type EditorSpecials = {
  exits: Record<string, TileExit>;
  objects: Record<string, { objIndex: number; amount: number }>;
  npcs: Record<string, number>;
  triggers: Record<string, number>;
};

export type EditorMapState = {
  id: number;
  meta: MapMeta;
  width: number;
  height: number;
  tiles: EditorTile[][]; // [y0][x0] 0-based
  specials: EditorSpecials;
};

export type IndexReferencia = {
  id: number;
  nombre: string;
  grhIndice: number;
  ancho: number;
  alto: number;
  capa: number;
  bloquear: boolean;
};

export type MapTool =
  | "select"
  | "brush"
  | "eraser"
  | "fill"
  | "stamp"
  | "rect"
  | "line"
  | "blocked"
  | "npc"
  | "object"
  | "exit"
  | "trigger";

export type MapViewMode =
  | "normal"
  | "layers"
  | "collisions"
  | "gameplay"
  | "triggers"
  | "debug";

export type ContentPlaceMode = "blocked" | "npc" | "object" | "exit" | "trigger" | null;

export function tileKey(x: number, y: number): string {
  return `${x},${y}`;
}

export function parseTileKey(key: string): { x: number; y: number } | null {
  const [rawX, rawY] = key.split(",");
  const x = Number.parseInt(rawX ?? "", 10);
  const y = Number.parseInt(rawY ?? "", 10);
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1) {
    return null;
  }
  return { x, y };
}

export function emptyTile(): EditorTile {
  return { layers: [0, 0, 0, 0], blocked: false };
}

export function cloneTile(tile: EditorTile): EditorTile {
  return {
    layers: [...tile.layers] as [number, number, number, number],
    blocked: tile.blocked,
  };
}

/** GRH grid for a stamp reference (row-major). Safe for client + server. */
export function expandStampGrhs(ref: IndexReferencia): number[][] {
  const grid: number[][] = [];
  for (let dy = 0; dy < ref.alto; dy++) {
    const row: number[] = [];
    for (let dx = 0; dx < ref.ancho; dx++) {
      row.push(ref.grhIndice + dy * ref.ancho + dx);
    }
    grid.push(row);
  }
  return grid;
}
