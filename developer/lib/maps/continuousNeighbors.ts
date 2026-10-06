import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../security/paths";
import { loadMapEditorState } from "./io";
import type { SpecialsFile, TileExit } from "./types";

/**
 * Vecindario del mapeador. Misma regla que
 * frontend/components/game/world/worldLayout.ts: franjas de tileExit
 * recíprocas, mismo offset y mismas esquinas.
 */

type MapSide = "N" | "S" | "W" | "E";

type MapEdge = {
  side: MapSide;
  map: number;
  line: number;
  offsetX: number;
  offsetY: number;
};

type MapEdges = Partial<Record<MapSide, MapEdge[]>>;

type ExitSample = {
  x: number;
  y: number;
  destMap: number;
  dx: number;
  dy: number;
};

const MIN_EDGE_EXITS = 8;
const MIN_OFFSET_CONSISTENCY = 0.9;
const NEIGHBOR_DEPTH = 42;
const OPPOSITE: Record<MapSide, MapSide> = { N: "S", S: "N", W: "E", E: "W" };

const CORNER_PATHS: Array<{ corner: string; first: MapSide; second: MapSide }> = [
  { corner: "NW", first: "N", second: "W" },
  { corner: "NW", first: "W", second: "N" },
  { corner: "NE", first: "N", second: "E" },
  { corner: "NE", first: "E", second: "N" },
  { corner: "SW", first: "S", second: "W" },
  { corner: "SW", first: "W", second: "S" },
  { corner: "SE", first: "S", second: "E" },
  { corner: "SE", first: "E", second: "S" },
];

export type NeighborStrip = {
  id: number;
  name: string;
  role: "edge" | "corner";
  originX: number;
  originY: number;
  tiles: Array<{
    x: number;
    y: number;
    layers: [number, number, number, number];
  }>;
};

export type NeighborView = {
  /** Interior jugable del mapa editado. El borde afuera de esto lo tapa el vecino en el juego. */
  interior: { minX: number; maxX: number; minY: number; maxY: number };
  neighbors: NeighborStrip[];
};

function singleExit(
  exit: TileExit | undefined,
): { map: number; x: number; y: number } | null {
  if (!exit || typeof exit !== "object") return null;
  if ("destinations" in exit) {
    return exit.destinations.length === 1 ? singleExit(exit.destinations[0]) : null;
  }
  if (
    typeof exit.map !== "number" ||
    typeof exit.x !== "number" ||
    typeof exit.y !== "number"
  ) {
    return null;
  }
  return exit;
}

function readSamples(mapId: number): ExitSample[] {
  const file = path.join(PATHS.serverMaps(), `mapa_${mapId}`, "specials.json");
  if (!fs.existsSync(file)) return [];
  let specials: SpecialsFile;
  try {
    specials = JSON.parse(fs.readFileSync(file, "utf8")) as SpecialsFile;
  } catch {
    return [];
  }
  const samples: ExitSample[] = [];
  for (const [key, raw] of Object.entries(specials.exits ?? {})) {
    const dest = singleExit(raw);
    if (!dest || dest.map === mapId) continue;
    const [xs, ys] = key.split(",");
    const x = Number(xs);
    const y = Number(ys);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    samples.push({ x, y, destMap: dest.map, dx: dest.x, dy: dest.y });
  }
  return samples;
}

function pickDominantOffset(samples: ExitSample[]) {
  const counts = new Map<string, number>();
  for (const sample of samples) {
    const key = `${sample.x - sample.dx},${sample.y - sample.dy}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let bestKey = "";
  let bestCount = 0;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestKey = key;
      bestCount = count;
    }
  }
  const [offsetX, offsetY] = (bestKey || "0,0").split(",").map(Number);
  return {
    offsetX,
    offsetY,
    share: samples.length ? bestCount / samples.length : 0,
  };
}

function isInnerLine(side: MapSide, candidate: number, current: number): boolean {
  return side === "N" || side === "W" ? candidate > current : candidate < current;
}

function computeEdges(mapId: number): MapEdges {
  const edges: MapEdges = {};
  const byRow = new Map<string, ExitSample[]>();
  const byCol = new Map<string, ExitSample[]>();
  for (const sample of readSamples(mapId)) {
    const rowKey = `${sample.destMap}:${sample.y}`;
    const colKey = `${sample.destMap}:${sample.x}`;
    byRow.set(rowKey, [...(byRow.get(rowKey) ?? []), sample]);
    byCol.set(colKey, [...(byCol.get(colKey) ?? []), sample]);
  }

  const push = (side: MapSide, map: number, line: number, group: ExitSample[]) => {
    const dominant = pickDominantOffset(group);
    if (dominant.share < MIN_OFFSET_CONSISTENCY) return;
    edges[side] = [
      ...(edges[side] ?? []),
      {
        side,
        map,
        line,
        offsetX: dominant.offsetX,
        offsetY: dominant.offsetY,
      },
    ];
  };

  for (const [groupKey, group] of byRow) {
    if (group.length < MIN_EDGE_EXITS) continue;
    const [mapPart, linePart] = groupKey.split(":");
    const line = Number(linePart);
    push(line < 50 ? "N" : "S", Number(mapPart), line, group);
  }
  for (const [groupKey, group] of byCol) {
    if (group.length < MIN_EDGE_EXITS) continue;
    const [mapPart, linePart] = groupKey.split(":");
    const line = Number(linePart);
    push(line < 50 ? "W" : "E", Number(mapPart), line, group);
  }
  return edges;
}

function reciprocalNeighbors(
  mapId: number,
  edgesByMap: Map<number, MapEdges>,
): Partial<Record<MapSide, MapEdge>> {
  const own = edgesByMap.get(mapId);
  if (!own) return {};
  const neighbors: Partial<Record<MapSide, MapEdge>> = {};
  for (const side of Object.keys(own) as MapSide[]) {
    let chosen: MapEdge | undefined;
    for (const edge of own[side] ?? []) {
      const back = (edgesByMap.get(edge.map)?.[OPPOSITE[side]] ?? []).some(
        (candidate) =>
          candidate.map === mapId &&
          candidate.offsetX === -edge.offsetX &&
          candidate.offsetY === -edge.offsetY,
      );
      if (!back) continue;
      if (!chosen || isInnerLine(side, edge.line, chosen.line)) chosen = edge;
    }
    if (chosen) neighbors[side] = chosen;
  }
  return neighbors;
}

function interiorOf(edges: MapEdges | undefined) {
  const line = (side: MapSide): number | null => {
    const lines = (edges?.[side] ?? []).map((edge) => edge.line);
    if (!lines.length) return null;
    return side === "N" || side === "W" ? Math.max(...lines) : Math.min(...lines);
  };
  const north = line("N");
  const south = line("S");
  const west = line("W");
  const east = line("E");
  return {
    minX: west !== null ? west + 1 : 1,
    maxX: east !== null ? east - 1 : 100,
    minY: north !== null ? north + 1 : 1,
    maxY: south !== null ? south - 1 : 100,
  };
}

type Placement = {
  map: number;
  role: "current" | "edge" | "corner";
  originX: number;
  originY: number;
  interior: { minX: number; maxX: number; minY: number; maxY: number };
};

function ensureEdges(mapId: number, edgesByMap: Map<number, MapEdges>) {
  if (!edgesByMap.has(mapId)) edgesByMap.set(mapId, computeEdges(mapId));
}

export function loadNeighborStrips(mapId: number): NeighborView {
  const edgesByMap = new Map<number, MapEdges>();
  ensureEdges(mapId, edgesByMap);

  const seed = new Set<number>([mapId]);
  for (const sideEdges of Object.values(edgesByMap.get(mapId) ?? {})) {
    for (const edge of sideEdges ?? []) seed.add(edge.map);
  }
  for (const id of [...seed]) ensureEdges(id, edgesByMap);
  for (const id of [...seed]) {
    if (id === mapId) continue;
    for (const sideEdges of Object.values(edgesByMap.get(id) ?? {})) {
      for (const edge of sideEdges ?? []) ensureEdges(edge.map, edgesByMap);
    }
  }

  const placements = new Map<number, Placement>();
  const place = (
    id: number,
    role: Placement["role"],
    originX: number,
    originY: number,
  ) => {
    if (placements.has(id)) return;
    placements.set(id, {
      map: id,
      role,
      originX,
      originY,
      interior: interiorOf(edgesByMap.get(id)),
    });
  };

  place(mapId, "current", 0, 0);
  const neighbors = reciprocalNeighbors(mapId, edgesByMap);
  for (const edge of Object.values(neighbors)) {
    if (!edge) continue;
    place(edge.map, "edge", edge.offsetX, edge.offsetY);
  }

  const corners = new Map<string, { map: number; originX: number; originY: number } | null>();
  for (const pathDef of CORNER_PATHS) {
    const first = neighbors[pathDef.first];
    if (!first) continue;
    const second = reciprocalNeighbors(first.map, edgesByMap)[pathDef.second];
    if (!second || second.map === mapId || placements.has(second.map)) continue;
    const candidate = {
      map: second.map,
      originX: first.offsetX + second.offsetX,
      originY: first.offsetY + second.offsetY,
    };
    const previous = corners.get(pathDef.corner);
    if (previous === undefined) corners.set(pathDef.corner, candidate);
    else if (previous && previous.map !== candidate.map) corners.set(pathDef.corner, null);
  }
  for (const corner of corners.values()) {
    if (corner) place(corner.map, "corner", corner.originX, corner.originY);
  }

  const current = placements.get(mapId)!;
  const strips: NeighborStrip[] = [];

  for (const placement of placements.values()) {
    if (placement.role === "current") continue;
    const worldMinX = Math.max(
      placement.interior.minX + placement.originX,
      current.interior.minX - NEIGHBOR_DEPTH,
    );
    const worldMaxX = Math.min(
      placement.interior.maxX + placement.originX,
      current.interior.maxX + NEIGHBOR_DEPTH,
    );
    const worldMinY = Math.max(
      placement.interior.minY + placement.originY,
      current.interior.minY - NEIGHBOR_DEPTH,
    );
    const worldMaxY = Math.min(
      placement.interior.maxY + placement.originY,
      current.interior.maxY + NEIGHBOR_DEPTH,
    );
    if (worldMinX > worldMaxX || worldMinY > worldMaxY) continue;

    let state;
    try {
      state = loadMapEditorState(placement.map);
    } catch {
      continue;
    }

    const localMinX = worldMinX - placement.originX;
    const localMaxX = worldMaxX - placement.originX;
    const localMinY = worldMinY - placement.originY;
    const localMaxY = worldMaxY - placement.originY;
    const tiles: NeighborStrip["tiles"] = [];
    for (let y = localMinY; y <= localMaxY; y++) {
      const row = state.tiles[y - 1];
      if (!row) continue;
      for (let x = localMinX; x <= localMaxX; x++) {
        const worldX = x + placement.originX;
        const worldY = y + placement.originY;
        const coveredByCurrent =
          worldX >= current.interior.minX &&
          worldX <= current.interior.maxX &&
          worldY >= current.interior.minY &&
          worldY <= current.interior.maxY;
        if (coveredByCurrent) continue;
        const tile = row[x - 1];
        if (!tile) continue;
        if (!tile.layers.some((layer) => layer > 0)) continue;
        tiles.push({ x, y, layers: tile.layers });
      }
    }

    strips.push({
      id: placement.map,
      name: state.meta.name,
      role: placement.role,
      originX: placement.originX,
      originY: placement.originY,
      tiles,
    });
  }

  return { interior: current.interior, neighbors: strips };
}
