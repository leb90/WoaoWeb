import type { MapData } from "../../../types/game";
import { getMapDimensions, loadMapData } from "../../../utils/gameLoader";
import type { TileBounds } from "../assets/scenePreload";
import type { Engine } from "../engine/Engine";
import { removeMapSprites, type RenderMapOptions } from "../rendering/sceneRenderer";
import {
    boundsContain,
    buildWorldLayout,
    collectCandidateNeighborMaps,
    computeMapEdges,
    getNeighborRenderBounds,
    isTileCoveredByOtherMap,
    resolveReciprocalNeighbors,
    unionBounds,
    type MapEdges,
} from "./worldLayout";

// Cuántos tiles del vecino se dibujan más allá del borde del mapa actual. La
// vista es de 25x16 tiles más 4 de margen de culling, así que con 18 nunca se
// ve el final de la franja mientras el jugador está dentro del mapa actual.
export const NEIGHBOR_RENDER_DEPTH = 18;

// Filas por frame al dibujar en segundo plano (ver RenderMapOptions.yieldEveryRows).
export const BACKGROUND_RENDER_ROWS_PER_FRAME = 3;

type RenderMapFn = (engine: Engine, options?: RenderMapOptions) => Promise<void>;

// Los exits de un mapa son estáticos: se calculan una vez por sesión.
const edgesCache = new Map<number, MapEdges>();
const dimensionsCache = new Map<number, { width: number; height: number }>();

async function ensureMapLoaded(engine: Engine, mapNumber: number): Promise<boolean> {
    if (!engine.mapData) {
        return false;
    }

    // ensureMapTile puede haber creado un esqueleto con un par de tiles (ítems
    // del suelo recibidos antes de cargar el mapa): no cuenta como cargado.
    const hasFullMapData = Object.keys(engine.mapData[mapNumber] ?? {}).length >= 100;

    if (!hasFullMapData) {
        let loaded: MapData;
        try {
            loaded = await loadMapData(mapNumber);
        } catch (error) {
            console.warn(`No se pudo cargar el mapa vecino ${mapNumber}:`, error);
            return false;
        }

        if (engine.isDestroyed || !engine.mapData) {
            return false;
        }

        if (loaded[mapNumber] && Object.keys(engine.mapData[mapNumber] ?? {}).length < 100) {
            engine.mapData[mapNumber] = loaded[mapNumber];
        }
    }

    if (!engine.mapData[mapNumber]) {
        return false;
    }

    if (!dimensionsCache.has(mapNumber)) {
        dimensionsCache.set(mapNumber, getMapDimensions(engine.mapData, mapNumber));
    }
    if (!edgesCache.has(mapNumber)) {
        edgesCache.set(
            mapNumber,
            computeMapEdges(engine.mapData, mapNumber, dimensionsCache.get(mapNumber)!),
        );
    }

    return true;
}

/**
 * Recalcula el vecindario 3x3 del mapa actual, carga los datos de los mapas que
 * falten y descarta lo dibujado de los mapas que ya no son vecinos (o que
 * cambiaron de lugar). Devuelve false si el motor se destruyó o si hubo un
 * sync más nuevo mientras se cargaban datos.
 */
export async function syncWorldLayout(engine: Engine): Promise<boolean> {
    if (engine.isDestroyed || !engine.mapData) {
        return false;
    }

    const version = ++engine.worldStreamingVersion;
    const currentMap = engine.mapNumber;
    const isStale = () =>
        engine.isDestroyed ||
        engine.worldStreamingVersion !== version ||
        engine.mapNumber !== currentMap;

    if (!(await ensureMapLoaded(engine, currentMap)) || isStale()) {
        return false;
    }

    // Vecinos directos, y después los vecinos de esos vecinos para las esquinas.
    const edgeCandidates = collectCandidateNeighborMaps(edgesCache.get(currentMap));
    for (const candidate of edgeCandidates) {
        await ensureMapLoaded(engine, candidate);
        if (isStale()) {
            return false;
        }
    }

    const neighbors = resolveReciprocalNeighbors(currentMap, edgesCache);
    for (const edge of Object.values(neighbors)) {
        if (!edge) {
            continue;
        }
        for (const candidate of collectCandidateNeighborMaps(edgesCache.get(edge.map))) {
            await ensureMapLoaded(engine, candidate);
            if (isStale()) {
                return false;
            }
        }
    }

    const layout = buildWorldLayout(
        currentMap,
        { x: engine.worldOriginX, y: engine.worldOriginY },
        edgesCache,
        dimensionsCache,
    );

    const previousLayout = engine.worldLayout;
    if (previousLayout) {
        for (const previous of previousLayout.placements.values()) {
            const next = layout.placements.get(previous.map);
            const keepsPlace =
                next && next.originX === previous.originX && next.originY === previous.originY;
            if (!keepsPlace) {
                removeMapSprites(engine, previous.map);
            }
            if (!next && previous.map !== currentMap && engine.mapData) {
                delete engine.mapData[previous.map];
            }
        }
    }

    engine.worldLayout = layout;
    engine.cullingDirty = true;
    return true;
}

export function getCurrentMapSkipTile(
    engine: Engine,
    mapNumber: number = engine.mapNumber,
): RenderMapOptions["skipTile"] | undefined {
    const layout = engine.worldLayout;
    const placement = layout?.placements.get(mapNumber);
    if (!layout || !placement) {
        return undefined;
    }

    return (x: number, y: number) => isTileCoveredByOtherMap(layout, placement, x, y);
}

function getFullMapBounds(engine: Engine, mapNumber: number): TileBounds {
    const dimensions =
        engine.worldLayout?.placements.get(mapNumber)?.dimensions ?? engine.mapDimensions;
    return { minX: 1, maxX: dimensions.width, minY: 1, maxY: dimensions.height };
}

export function markMapRendered(engine: Engine, mapNumber: number, bounds?: TileBounds): void {
    const renderedBounds = bounds ?? getFullMapBounds(engine, mapNumber);
    const previous = engine.worldRenderedBounds.get(mapNumber);
    engine.worldRenderedBounds.set(
        mapNumber,
        previous ? unionBounds(previous, renderedBounds) : renderedBounds,
    );
}

function intersectBounds(a: TileBounds, b: TileBounds): TileBounds | null {
    const result = {
        minX: Math.max(a.minX, b.minX),
        maxX: Math.min(a.maxX, b.maxX),
        minY: Math.max(a.minY, b.minY),
        maxY: Math.min(a.maxY, b.maxY),
    };
    return result.minX > result.maxX || result.minY > result.maxY ? null : result;
}

/**
 * Dibuja las franjas de los vecinos que todavía no están dibujadas. Primero los
 * laterales (son los que se ven al acercarse a un borde) y después las esquinas.
 * `clipToCurrentMapBounds` (tiles locales del mapa actual) limita el trabajo a
 * una ventana, p.ej. la vista inicial antes de mostrar la escena.
 */
export async function renderWorldNeighbors(
    engine: Engine,
    renderMap: RenderMapFn,
    clipToCurrentMapBounds?: TileBounds,
    depth: number = NEIGHBOR_RENDER_DEPTH,
): Promise<void> {
    const layout = engine.worldLayout;
    if (!layout) {
        return;
    }

    const clipWorld = clipToCurrentMapBounds
        ? {
              minX: clipToCurrentMapBounds.minX + engine.worldOriginX,
              maxX: clipToCurrentMapBounds.maxX + engine.worldOriginX,
              minY: clipToCurrentMapBounds.minY + engine.worldOriginY,
              maxY: clipToCurrentMapBounds.maxY + engine.worldOriginY,
          }
        : null;

    const version = engine.worldStreamingVersion;
    const placements = Array.from(layout.placements.values())
        .filter((placement) => placement.role !== "current")
        .sort((left, right) => (left.role === "edge" ? 0 : 1) - (right.role === "edge" ? 0 : 1));

    for (const placement of placements) {
        if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
            return;
        }

        let needed = getNeighborRenderBounds(layout, placement, depth);
        if (needed && clipWorld) {
            needed = intersectBounds(needed, {
                minX: clipWorld.minX - placement.originX,
                maxX: clipWorld.maxX - placement.originX,
                minY: clipWorld.minY - placement.originY,
                maxY: clipWorld.maxY - placement.originY,
            });
        }
        if (!needed) {
            continue;
        }

        const rendered = engine.worldRenderedBounds.get(placement.map);
        if (rendered && boundsContain(rendered, needed)) {
            continue;
        }

        await renderMap(engine, {
            mapNumber: placement.map,
            bounds: needed,
            excludeBounds: rendered,
            skipTile: getCurrentMapSkipTile(engine, placement.map),
            yieldEveryRows: clipToCurrentMapBounds ? 0 : BACKGROUND_RENDER_ROWS_PER_FRAME,
        });

        if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
            return;
        }

        markMapRendered(engine, placement.map, needed);
    }
}

/**
 * Completa el mapa actual cuando antes era un vecino dibujado solo en parte
 * (después de cruzar un borde).
 */
export async function renderCurrentMapRemainder(
    engine: Engine,
    renderMap: RenderMapFn,
): Promise<void> {
    const mapNumber = engine.mapNumber;
    const version = engine.worldStreamingVersion;
    const full = getFullMapBounds(engine, mapNumber);
    const rendered = engine.worldRenderedBounds.get(mapNumber);

    if (rendered && boundsContain(rendered, full)) {
        return;
    }

    await renderMap(engine, {
        includeLayers: ["1", "2"],
        includeObjects: false,
        excludeBounds: rendered,
        yieldEveryRows: BACKGROUND_RENDER_ROWS_PER_FRAME,
    });

    if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
        return;
    }

    await renderMap(engine, {
        includeLayers: ["3", "4"],
        includeObjects: true,
        excludeBounds: rendered,
        yieldEveryRows: BACKGROUND_RENDER_ROWS_PER_FRAME,
    });

    if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
        return;
    }

    markMapRendered(engine, mapNumber, full);
}

/**
 * Flujo completo tras un rebase: nuevo vecindario, resto del mapa actual y
 * franjas de los vecinos nuevos.
 */
export async function streamWorldAroundCurrentMap(
    engine: Engine,
    renderMap: RenderMapFn,
): Promise<void> {
    if (!(await syncWorldLayout(engine))) {
        return;
    }

    await renderCurrentMapRemainder(engine, renderMap);
    await renderWorldNeighbors(engine, renderMap);
}
