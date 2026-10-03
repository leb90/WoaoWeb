import type { Position } from "./types/runtime";

export {};

const vars = require("./vars");

// Mundo continuo (lado servidor). Debe producir exactamente el mismo
// vecindario que frontend/components/game/world/worldLayout.ts: ambos deducen
// la adyacencia de las franjas de tile exits del borde y solo la aceptan cuando
// es recíproca. Si se cambia una regla acá hay que cambiarla también allá.

export type MapSide = "N" | "S" | "W" | "E";

export type MapEdge = {
    side: MapSide;
    map: number;
    line: number;
    // Vecino tile (nx, ny) -> (nx + offsetX, ny + offsetY) en el marco del mapa origen.
    offsetX: number;
    offsetY: number;
    exitCount: number;
};

type MapEdges = Partial<Record<MapSide, MapEdge[]>>;

export type TileBounds = { minX: number; maxX: number; minY: number; maxY: number };

export type WorldMapRole = "current" | "edge" | "corner";

export type WorldMapPlacement = {
    map: number;
    role: WorldMapRole;
    // Origen del mapa en tiles, relativo al mapa central del layout.
    originX: number;
    originY: number;
    interior: TileBounds;
};

export type WorldLayout = {
    currentMap: number;
    placements: Map<number, WorldMapPlacement>;
};

export type MapTileRef = { map: number; x: number; y: number };

const MAP_SIZE = 100;
const MIN_EDGE_EXITS = 8;
const MIN_OFFSET_CONSISTENCY = 0.9;
const OPPOSITE_SIDE: Record<MapSide, MapSide> = { N: "S", S: "N", W: "E", E: "W" };

const edgesCache = new Map<number, MapEdges>();
const layoutCache = new Map<number, WorldLayout>();

type ExitSample = { x: number; y: number; dx: number; dy: number };

function getSingleExitDestination(tileExit: unknown): { map: number; x: number; y: number } | null {
    if (!tileExit || typeof tileExit !== "object") {
        return null;
    }

    const exit = tileExit as { map?: number; x?: number; y?: number; destinations?: unknown[] };
    if (Array.isArray(exit.destinations)) {
        return exit.destinations.length === 1 ? getSingleExitDestination(exit.destinations[0]) : null;
    }

    if (typeof exit.map !== "number" || typeof exit.x !== "number" || typeof exit.y !== "number") {
        return null;
    }

    return { map: exit.map, x: exit.x, y: exit.y };
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

    const [offsetX, offsetY] = bestKey.split(",").map(Number);
    return { offsetX, offsetY, share: bestCount / samples.length };
}

function isInnerLine(side: MapSide, candidate: number, current: number): boolean {
    return side === "N" || side === "W" ? candidate > current : candidate < current;
}

export function computeMapEdges(mapNumber: number): MapEdges {
    const cached = edgesCache.get(mapNumber);
    if (cached) {
        return cached;
    }

    const rows = vars.mapa[mapNumber] as Record<string, Record<string, { tileExit?: unknown }>> | undefined;
    const edges: MapEdges = {};
    if (!rows) {
        edgesCache.set(mapNumber, edges);
        return edges;
    }

    const samplesByRow = new Map<string, ExitSample[]>();
    const samplesByColumn = new Map<string, ExitSample[]>();

    for (const [rowKey, row] of Object.entries(rows)) {
        const y = Number(rowKey);
        if (!row) {
            continue;
        }
        for (const [columnKey, tile] of Object.entries(row)) {
            const exit = getSingleExitDestination(tile?.tileExit);
            if (!exit || !exit.map || exit.map === mapNumber) {
                continue;
            }

            const x = Number(columnKey);
            const sample = { x, y, dx: exit.x, dy: exit.y };
            const rowGroupKey = `${exit.map}:${y}`;
            const columnGroupKey = `${exit.map}:${x}`;
            samplesByRow.set(rowGroupKey, [...(samplesByRow.get(rowGroupKey) ?? []), sample]);
            samplesByColumn.set(columnGroupKey, [...(samplesByColumn.get(columnGroupKey) ?? []), sample]);
        }
    }

    const pushEdge = (side: MapSide, map: number, line: number, samples: ExitSample[]) => {
        const dominant = pickDominantOffset(samples);
        if (dominant.share < MIN_OFFSET_CONSISTENCY) {
            return;
        }
        edges[side] = [
            ...(edges[side] ?? []),
            { side, map, line, offsetX: dominant.offsetX, offsetY: dominant.offsetY, exitCount: samples.length },
        ];
    };

    for (const [groupKey, samples] of samplesByRow) {
        if (samples.length < MIN_EDGE_EXITS) {
            continue;
        }
        const [mapPart, linePart] = groupKey.split(":");
        const line = Number(linePart);
        pushEdge(line < MAP_SIZE / 2 ? "N" : "S", Number(mapPart), line, samples);
    }

    for (const [groupKey, samples] of samplesByColumn) {
        if (samples.length < MIN_EDGE_EXITS) {
            continue;
        }
        const [mapPart, linePart] = groupKey.split(":");
        const line = Number(linePart);
        pushEdge(line < MAP_SIZE / 2 ? "W" : "E", Number(mapPart), line, samples);
    }

    edgesCache.set(mapNumber, edges);
    return edges;
}

function isReciprocal(edge: MapEdge, sourceMap: number): boolean {
    const candidates = computeMapEdges(edge.map)[OPPOSITE_SIDE[edge.side]] ?? [];
    return candidates.some(
        (back) => back.map === sourceMap && back.offsetX === -edge.offsetX && back.offsetY === -edge.offsetY,
    );
}

export function resolveReciprocalNeighbors(mapNumber: number): Partial<Record<MapSide, MapEdge>> {
    const ownEdges = computeMapEdges(mapNumber);
    const neighbors: Partial<Record<MapSide, MapEdge>> = {};

    for (const side of Object.keys(ownEdges) as MapSide[]) {
        let chosen: MapEdge | undefined;
        for (const edge of ownEdges[side] ?? []) {
            if (!isReciprocal(edge, mapNumber)) {
                continue;
            }
            if (!chosen || isInnerLine(side, edge.line, chosen.line)) {
                chosen = edge;
            }
        }
        if (chosen) {
            neighbors[side] = chosen;
        }
    }

    return neighbors;
}

export function computeMapInterior(mapNumber: number): TileBounds {
    const edges = computeMapEdges(mapNumber);
    const innermost = (side: MapSide): number | null => {
        const lines = (edges[side] ?? []).map((edge) => edge.line);
        if (lines.length === 0) {
            return null;
        }
        return side === "N" || side === "W" ? Math.max(...lines) : Math.min(...lines);
    };

    const north = innermost("N");
    const south = innermost("S");
    const west = innermost("W");
    const east = innermost("E");

    return {
        minX: west !== null ? west + 1 : 1,
        maxX: east !== null ? east - 1 : MAP_SIZE,
        minY: north !== null ? north + 1 : 1,
        maxY: south !== null ? south - 1 : MAP_SIZE,
    };
}

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

/**
 * Vecindario 3x3 del mapa, con el mapa en el origen (0,0). Se cachea porque
 * los mapas son estáticos.
 */
export function getWorldLayout(mapNumber: number): WorldLayout {
    const cached = layoutCache.get(mapNumber);
    if (cached) {
        return cached;
    }

    const placements = new Map<number, WorldMapPlacement>();
    const place = (map: number, role: WorldMapRole, originX: number, originY: number) => {
        if (placements.has(map)) {
            return;
        }
        placements.set(map, { map, role, originX, originY, interior: computeMapInterior(map) });
    };

    place(mapNumber, "current", 0, 0);

    const neighbors = vars.mapa[mapNumber] ? resolveReciprocalNeighbors(mapNumber) : {};
    for (const edge of Object.values(neighbors)) {
        if (edge) {
            place(edge.map, "edge", edge.offsetX, edge.offsetY);
        }
    }

    const resolvedCorners = new Map<string, { map: number; originX: number; originY: number } | null>();
    for (const path of CORNER_PATHS) {
        const firstEdge = neighbors[path.first];
        if (!firstEdge) {
            continue;
        }
        const secondEdge = resolveReciprocalNeighbors(firstEdge.map)[path.second];
        if (!secondEdge || secondEdge.map === mapNumber || placements.has(secondEdge.map)) {
            continue;
        }

        const candidate = {
            map: secondEdge.map,
            originX: firstEdge.offsetX + secondEdge.offsetX,
            originY: firstEdge.offsetY + secondEdge.offsetY,
        };
        const previous = resolvedCorners.get(path.corner);
        if (previous === undefined) {
            resolvedCorners.set(path.corner, candidate);
        } else if (previous && previous.map !== candidate.map) {
            resolvedCorners.set(path.corner, null);
        }
    }

    for (const corner of resolvedCorners.values()) {
        if (corner) {
            place(corner.map, "corner", corner.originX, corner.originY);
        }
    }

    const layout = { currentMap: mapNumber, placements };
    layoutCache.set(mapNumber, layout);
    return layout;
}

export function isNeighborMap(viewerMap: number, targetMap: number): boolean {
    return viewerMap === targetMap || getWorldLayout(viewerMap).placements.has(targetMap);
}

/**
 * Convierte un tile de `targetMap` al marco del mapa del observador. Devuelve
 * null si el mapa destino no es el observador ni uno de sus vecinos.
 */
export function toViewerFrame(viewerMap: number, targetMap: number, x: number, y: number): Position | null {
    if (viewerMap === targetMap) {
        return { x, y };
    }

    const placement = getWorldLayout(viewerMap).placements.get(targetMap);
    if (!placement) {
        return null;
    }

    return { x: x + placement.originX, y: y + placement.originY };
}

/**
 * Distancia en tiles entre dos entidades que pueden estar en mapas vecinos,
 * medida en el marco de la primera. null si no comparten vecindario.
 */
export function getWorldDelta(
    originMap: number,
    originPos: Position,
    targetMap: number,
    targetPos: Position,
): { dx: number; dy: number } | null {
    const target = toViewerFrame(originMap, targetMap, targetPos.x, targetPos.y);
    if (!target) {
        return null;
    }

    return { dx: target.x - originPos.x, dy: target.y - originPos.y };
}

export function isWithinWorldRange(
    originMap: number,
    originPos: Position,
    targetMap: number,
    targetPos: Position,
    rangeX: number,
    rangeY: number,
): boolean {
    const delta = getWorldDelta(originMap, originPos, targetMap, targetPos);
    return Boolean(delta && Math.abs(delta.dx) <= rangeX && Math.abs(delta.dy) <= rangeY);
}

/**
 * Tiles de almacenamiento que ocupan una posición expresada en el marco del
 * observador. Puede haber más de uno: la fila de exits de un mapa se solapa
 * con la primera fila jugable del vecino. El primero es el del propio mapa del
 * observador cuando existe.
 */
export function resolveStorageTiles(viewerMap: number, x: number, y: number): MapTileRef[] {
    const results: MapTileRef[] = [];
    const layout = getWorldLayout(viewerMap);

    const ownTile = { map: viewerMap, x, y };
    if (x >= 1 && x <= MAP_SIZE && y >= 1 && y <= MAP_SIZE && vars.mapa[viewerMap]) {
        results.push(ownTile);
    }

    for (const placement of layout.placements.values()) {
        if (placement.map === viewerMap) {
            continue;
        }
        const localX = x - placement.originX;
        const localY = y - placement.originY;
        if (localX < 1 || localX > MAP_SIZE || localY < 1 || localY > MAP_SIZE || !vars.mapa[placement.map]) {
            continue;
        }
        results.push({ map: placement.map, x: localX, y: localY });
    }

    return results;
}

/**
 * Id del ocupante (usuario o NPC) parado en una posición del marco del
 * observador, mirando todos los tiles de almacenamiento que la cubren.
 */
export function findOccupantAtViewerTile(viewerMap: number, x: number, y: number): MapTileRef & { id: number | string } | null {
    for (const tile of resolveStorageTiles(viewerMap, x, y)) {
        const occupantId = vars.mapData[tile.map]?.[tile.y]?.[tile.x]?.id;
        if (occupantId) {
            return { ...tile, id: occupantId };
        }
    }

    return null;
}

/**
 * Recorre los tiles de almacenamiento de una ventana rectangular expresada en
 * el marco del observador (centro ± rango). Visita primero el mapa del
 * observador y después cada vecino, cada uno recortado a su propio 1..100.
 */
export function forEachAreaTile(
    viewerMap: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    callback: (map: number, x: number, y: number) => void,
): void {
    const layout = getWorldLayout(viewerMap);
    const ordered = [layout.placements.get(viewerMap), ...layout.placements.values()];
    const visited = new Set<number>();

    for (const placement of ordered) {
        if (!placement || visited.has(placement.map) || !vars.mapa[placement.map]) {
            continue;
        }
        visited.add(placement.map);

        const localMinX = Math.max(1, minX - placement.originX);
        const localMaxX = Math.min(MAP_SIZE, maxX - placement.originX);
        const localMinY = Math.max(1, minY - placement.originY);
        const localMaxY = Math.min(MAP_SIZE, maxY - placement.originY);

        for (let y = localMinY; y <= localMaxY; y++) {
            for (let x = localMinX; x <= localMaxX; x++) {
                callback(placement.map, x, y);
            }
        }
    }
}

/**
 * Indica si un tile exit es un cruce continuo: su destino es el tile del mapa
 * vecino que ocupa exactamente la misma posición del mundo. Esos exits se
 * caminan como un paso más en vez de teletransportar.
 */
export function isContinuousExit(map: number, x: number, y: number, destination: MapTileRef): boolean {
    if (destination.map === map) {
        return false;
    }

    const inViewerFrame = toViewerFrame(map, destination.map, destination.x, destination.y);
    return Boolean(inViewerFrame && inViewerFrame.x === x && inViewerFrame.y === y);
}

export function resetWorldLayoutCache(): void {
    edgesCache.clear();
    layoutCache.clear();
}

module.exports = {
    computeMapEdges,
    computeMapInterior,
    findOccupantAtViewerTile,
    forEachAreaTile,
    getWorldDelta,
    getWorldLayout,
    isContinuousExit,
    isNeighborMap,
    isWithinWorldRange,
    resetWorldLayoutCache,
    resolveReciprocalNeighbors,
    resolveStorageTiles,
    toViewerFrame,
};
