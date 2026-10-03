import type { MapData } from "../../../types/game";
import type { TileBounds } from "../assets/scenePreload";

// Mundo continuo: los mapas del AO no tienen una grilla declarada. La única
// adyacencia real está en las franjas de tile exits que cada mapa tiene cerca
// de su borde (fila y=10 hacia el mapa del norte, columna x=88 hacia el este,
// etc.). Este módulo deduce, a partir de esas franjas, qué mapa hay a cada lado
// y con qué desplazamiento hay que dibujarlo para que el tile de llegada quede
// exactamente donde está el tile de salida.

export type MapSide = "N" | "S" | "W" | "E";

export type MapEdge = {
    side: MapSide;
    map: number;
    // Fila (N/S) o columna (W/E) del mapa origen donde están los exits.
    line: number;
    // Desplazamiento para ubicar al vecino en coordenadas del mapa origen:
    // tile (nx, ny) del vecino -> (nx + offsetX, ny + offsetY) del origen.
    offsetX: number;
    offsetY: number;
    exitCount: number;
};

export type MapEdges = Partial<Record<MapSide, MapEdge[]>>;

export type WorldMapRole = "current" | "edge" | "corner";

export type WorldMapPlacement = {
    map: number;
    role: WorldMapRole;
    // Origen del mapa en tiles dentro del marco de mundo compartido.
    originX: number;
    originY: number;
    // Rectángulo jugable del mapa, en coordenadas locales (1..100).
    interior: TileBounds;
    dimensions: { width: number; height: number };
};

export type WorldLayout = {
    currentMap: number;
    placements: Map<number, WorldMapPlacement>;
};

const MIN_EDGE_EXITS = 8;
const MIN_OFFSET_CONSISTENCY = 0.9;

const OPPOSITE_SIDE: Record<MapSide, MapSide> = {
    N: "S",
    S: "N",
    W: "E",
    E: "W",
};

type ExitSample = { x: number; y: number; dx: number; dy: number };

function pickDominantOffset(samples: ExitSample[]): {
    offsetX: number;
    offsetY: number;
    share: number;
} {
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
    // La línea "interna" es la más cercana al centro del mapa: en mapas con
    // dos franjas de exits (una vieja y una nueva) la jugable es la interna.
    return side === "N" || side === "W" ? candidate > current : candidate < current;
}

export function computeMapEdges(
    mapData: MapData,
    mapNumber: number,
    dimensions: { width: number; height: number },
): MapEdges {
    const rows = mapData[mapNumber];
    if (!rows) {
        return {};
    }

    const halfWidth = dimensions.width / 2;
    const halfHeight = dimensions.height / 2;
    const samplesByRow = new Map<string, ExitSample[]>();
    const samplesByColumn = new Map<string, ExitSample[]>();

    for (const [rowKey, row] of Object.entries(rows)) {
        const y = Number(rowKey);
        for (const [columnKey, tile] of Object.entries(row)) {
            const exit = tile.tileExit;
            if (!exit || !exit.map || exit.map === mapNumber) {
                continue;
            }

            const x = Number(columnKey);
            const sample = { x, y, dx: exit.x, dy: exit.y };
            const rowGroupKey = `${exit.map}:${y}`;
            const columnGroupKey = `${exit.map}:${x}`;
            samplesByRow.set(rowGroupKey, [
                ...(samplesByRow.get(rowGroupKey) ?? []),
                sample,
            ]);
            samplesByColumn.set(columnGroupKey, [
                ...(samplesByColumn.get(columnGroupKey) ?? []),
                sample,
            ]);
        }
    }

    const edges: MapEdges = {};
    const pushEdge = (side: MapSide, map: number, line: number, samples: ExitSample[]) => {
        const dominant = pickDominantOffset(samples);
        if (dominant.share < MIN_OFFSET_CONSISTENCY) {
            return;
        }

        const edge: MapEdge = {
            side,
            map,
            line,
            offsetX: dominant.offsetX,
            offsetY: dominant.offsetY,
            exitCount: samples.length,
        };
        edges[side] = [...(edges[side] ?? []), edge];
    };

    for (const [groupKey, samples] of samplesByRow) {
        if (samples.length < MIN_EDGE_EXITS) {
            continue;
        }
        const [mapPart, linePart] = groupKey.split(":");
        const line = Number(linePart);
        pushEdge(line < halfHeight ? "N" : "S", Number(mapPart), line, samples);
    }

    for (const [groupKey, samples] of samplesByColumn) {
        if (samples.length < MIN_EDGE_EXITS) {
            continue;
        }
        const [mapPart, linePart] = groupKey.split(":");
        const line = Number(linePart);
        pushEdge(line < halfWidth ? "W" : "E", Number(mapPart), line, samples);
    }

    return edges;
}

function isReciprocal(edge: MapEdge, sourceMap: number, targetEdges: MapEdges | undefined): boolean {
    const candidates = targetEdges?.[OPPOSITE_SIDE[edge.side]] ?? [];
    return candidates.some(
        (back) =>
            back.map === sourceMap &&
            back.offsetX === -edge.offsetX &&
            back.offsetY === -edge.offsetY,
    );
}

/**
 * Devuelve el vecino confiable de cada lado: la franja de exits más interna
 * cuyo mapa destino tiene, en el lado opuesto, una franja que vuelve con el
 * desplazamiento inverso. Los lados sin reciprocidad quedan sin vecino y se
 * siguen dibujando con el borde original del mapa.
 */
export function resolveReciprocalNeighbors(
    mapNumber: number,
    edgesByMap: Map<number, MapEdges>,
): Partial<Record<MapSide, MapEdge>> {
    const ownEdges = edgesByMap.get(mapNumber);
    if (!ownEdges) {
        return {};
    }

    const neighbors: Partial<Record<MapSide, MapEdge>> = {};

    for (const side of Object.keys(ownEdges) as MapSide[]) {
        let chosen: MapEdge | undefined;
        for (const edge of ownEdges[side] ?? []) {
            if (!isReciprocal(edge, mapNumber, edgesByMap.get(edge.map))) {
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

/**
 * Rectángulo jugable del mapa: todo lo que queda estrictamente adentro de sus
 * franjas de exits. Donde no hay franja, llega hasta el borde del mapa.
 */
export function computeMapInterior(
    edges: MapEdges | undefined,
    dimensions: { width: number; height: number },
): TileBounds {
    const innermost = (side: MapSide): number | null => {
        const lines = (edges?.[side] ?? []).map((edge) => edge.line);
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
        maxX: east !== null ? east - 1 : dimensions.width,
        minY: north !== null ? north + 1 : 1,
        maxY: south !== null ? south - 1 : dimensions.height,
    };
}

export function collectCandidateNeighborMaps(edges: MapEdges | undefined): number[] {
    const maps = new Set<number>();
    for (const sideEdges of Object.values(edges ?? {})) {
        for (const edge of sideEdges ?? []) {
            maps.add(edge.map);
        }
    }
    return Array.from(maps);
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
 * Arma el vecindario 3x3 del mapa actual. `edgesByMap` tiene que incluir las
 * aristas del mapa actual, de sus candidatos a vecino y de los candidatos de
 * esos vecinos (para las esquinas); lo que falte simplemente no se ubica.
 */
export function buildWorldLayout(
    currentMap: number,
    currentOrigin: { x: number; y: number },
    edgesByMap: Map<number, MapEdges>,
    dimensionsByMap: Map<number, { width: number; height: number }>,
): WorldLayout {
    const placements = new Map<number, WorldMapPlacement>();
    const dimensionsOf = (map: number) => dimensionsByMap.get(map) ?? { width: 100, height: 100 };
    const place = (map: number, role: WorldMapRole, originX: number, originY: number) => {
        if (placements.has(map)) {
            return;
        }
        const dimensions = dimensionsOf(map);
        placements.set(map, {
            map,
            role,
            originX,
            originY,
            interior: computeMapInterior(edgesByMap.get(map), dimensions),
            dimensions,
        });
    };

    place(currentMap, "current", currentOrigin.x, currentOrigin.y);

    const neighbors = resolveReciprocalNeighbors(currentMap, edgesByMap);
    for (const edge of Object.values(neighbors)) {
        if (!edge) {
            continue;
        }
        place(edge.map, "edge", currentOrigin.x + edge.offsetX, currentOrigin.y + edge.offsetY);
    }

    // Esquinas: primero por el vecino N/S y después por el W/E. Cuando los dos
    // caminos existen y coinciden en mapa se usa el primero; si apuntan a mapas
    // distintos la geometría no cierra y es más seguro no dibujar esa esquina.
    const resolvedCorners = new Map<string, { map: number; originX: number; originY: number } | null>();
    for (const path of CORNER_PATHS) {
        const firstEdge = neighbors[path.first];
        if (!firstEdge) {
            continue;
        }
        const secondEdge = resolveReciprocalNeighbors(firstEdge.map, edgesByMap)[path.second];
        if (!secondEdge || secondEdge.map === currentMap || placements.has(secondEdge.map)) {
            continue;
        }

        const candidate = {
            map: secondEdge.map,
            originX: currentOrigin.x + firstEdge.offsetX + secondEdge.offsetX,
            originY: currentOrigin.y + firstEdge.offsetY + secondEdge.offsetY,
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

    return { currentMap, placements };
}

export function getPlacementWorldInterior(placement: WorldMapPlacement): TileBounds {
    return {
        minX: placement.interior.minX + placement.originX,
        maxX: placement.interior.maxX + placement.originX,
        minY: placement.interior.minY + placement.originY,
        maxY: placement.interior.maxY + placement.originY,
    };
}

const ROLE_PRIORITY: Record<WorldMapRole, number> = {
    current: 3,
    edge: 2,
    corner: 1,
};

/**
 * Un tile de un mapa no se dibuja cuando su posición de mundo cae en el
 * interior jugable de otro mapa que tiene prioridad sobre él: así el borde de
 * árboles del mapa actual desaparece debajo del vecino, y la franja de exits
 * del vecino no pisa el interior del mapa actual.
 */
export function isTileCoveredByOtherMap(
    layout: WorldLayout,
    placement: WorldMapPlacement,
    x: number,
    y: number,
): boolean {
    const worldX = x + placement.originX;
    const worldY = y + placement.originY;
    const insideOwnInterior =
        x >= placement.interior.minX &&
        x <= placement.interior.maxX &&
        y >= placement.interior.minY &&
        y <= placement.interior.maxY;

    for (const other of layout.placements.values()) {
        if (other.map === placement.map) {
            continue;
        }
        if (insideOwnInterior && ROLE_PRIORITY[other.role] <= ROLE_PRIORITY[placement.role]) {
            continue;
        }
        const otherInterior = getPlacementWorldInterior(other);
        if (
            worldX >= otherInterior.minX &&
            worldX <= otherInterior.maxX &&
            worldY >= otherInterior.minY &&
            worldY <= otherInterior.maxY
        ) {
            return true;
        }
    }

    return false;
}

/**
 * Parte de un mapa vecino que vale la pena dibujar: su interior recortado a
 * una franja de `depth` tiles alrededor del mapa actual, en coordenadas
 * locales del vecino. Devuelve null si no hay nada que dibujar.
 */
export function getNeighborRenderBounds(
    layout: WorldLayout,
    placement: WorldMapPlacement,
    depth: number,
): TileBounds | null {
    const current = layout.placements.get(layout.currentMap);
    if (!current || placement.map === current.map) {
        return null;
    }

    const currentWorld = getPlacementWorldInterior(current);
    const neighborWorld = getPlacementWorldInterior(placement);
    const minX = Math.max(neighborWorld.minX, currentWorld.minX - depth);
    const maxX = Math.min(neighborWorld.maxX, currentWorld.maxX + depth);
    const minY = Math.max(neighborWorld.minY, currentWorld.minY - depth);
    const maxY = Math.min(neighborWorld.maxY, currentWorld.maxY + depth);

    if (minX > maxX || minY > maxY) {
        return null;
    }

    return {
        minX: minX - placement.originX,
        maxX: maxX - placement.originX,
        minY: minY - placement.originY,
        maxY: maxY - placement.originY,
    };
}

export function boundsContain(outer: TileBounds, inner: TileBounds): boolean {
    return (
        inner.minX >= outer.minX &&
        inner.maxX <= outer.maxX &&
        inner.minY >= outer.minY &&
        inner.maxY <= outer.maxY
    );
}

export function unionBounds(a: TileBounds, b: TileBounds): TileBounds {
    return {
        minX: Math.min(a.minX, b.minX),
        maxX: Math.max(a.maxX, b.maxX),
        minY: Math.min(a.minY, b.minY),
        maxY: Math.max(a.maxY, b.maxY),
    };
}
