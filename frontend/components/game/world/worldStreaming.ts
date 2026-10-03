import type { MapData } from "../../../types/game";
import { getMapDimensions, loadMapData } from "../../../utils/gameLoader";
import { collectMapGraphicIds, type TileBounds } from "../assets/scenePreload";
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

// Presupuesto de trabajo por frame para dibujar o descartar en segundo plano
// (ver RenderMapOptions.frameBudgetMs). Un cruce de mapa no tiene que costar
// ni un frame: todo lo que no se ve se hace de a poco.
export const BACKGROUND_FRAME_BUDGET_MS = 3;

type RenderMapFn = (engine: Engine, options?: RenderMapOptions) => Promise<void>;
type PreloadGraphicIdsFn = (engine: Engine, graphicIds: string[]) => Promise<void>;

// Gráficos por ciclo ocioso al precalentar texturas del vecindario.
const TEXTURE_PREFETCH_BATCH = 6;
type MapRows = MapData[string];

// Caches de sesión: los mapas son estáticos. Las filas se cargan y
// descomprimen una sola vez y se comparten con el motor sin clonar, así un
// cruce no vuelve a pagar la carga ni la clonación de 10.000 tiles.
const mapRowsCache = new Map<number, MapRows>();
const mapLoadPromises = new Map<number, Promise<MapRows | null>>();
const edgesCache = new Map<number, MapEdges>();
const dimensionsCache = new Map<number, { width: number; height: number }>();

async function loadMapRows(mapNumber: number): Promise<MapRows | null> {
    const cached = mapRowsCache.get(mapNumber);
    if (cached) {
        return cached;
    }

    const pending = mapLoadPromises.get(mapNumber);
    if (pending) {
        return pending;
    }

    const promise = (async () => {
        try {
            const loaded = await loadMapData(mapNumber);
            const rows = loaded[mapNumber];
            if (!rows) {
                return null;
            }
            const existing = mapRowsCache.get(mapNumber);
            if (existing) {
                return existing;
            }
            mapRowsCache.set(mapNumber, rows);
            dimensionsCache.set(mapNumber, getMapDimensions(loaded, mapNumber));
            edgesCache.set(mapNumber, computeMapEdges(loaded, mapNumber, dimensionsCache.get(mapNumber)!));
            return rows;
        } catch (error) {
            console.warn(`No se pudo cargar el mapa vecino ${mapNumber}:`, error);
            return null;
        } finally {
            mapLoadPromises.delete(mapNumber);
        }
    })();

    mapLoadPromises.set(mapNumber, promise);
    return promise;
}

function hasFullMapData(engine: Engine, mapNumber: number): boolean {
    // ensureMapTile puede haber creado un esqueleto con un par de tiles (ítems
    // del suelo recibidos antes de cargar el mapa): no cuenta como cargado.
    return Object.keys(engine.mapData?.[mapNumber] ?? {}).length >= 100;
}

/**
 * Deja las filas del mapa disponibles en `engine.mapData` y sus aristas en la
 * caché. El mapa actual del motor ya viene cargado por `initResources`.
 */
async function ensureMapLoaded(engine: Engine, mapNumber: number): Promise<boolean> {
    if (!engine.mapData) {
        return false;
    }

    if (!hasFullMapData(engine, mapNumber)) {
        const rows = await loadMapRows(mapNumber);
        if (!rows || engine.isDestroyed || !engine.mapData) {
            return false;
        }
        if (!hasFullMapData(engine, mapNumber)) {
            engine.mapData[mapNumber] = rows;
        }
    }

    if (!dimensionsCache.has(mapNumber)) {
        dimensionsCache.set(mapNumber, getMapDimensions(engine.mapData, mapNumber));
    }
    if (!edgesCache.has(mapNumber)) {
        edgesCache.set(mapNumber, computeMapEdges(engine.mapData, mapNumber, dimensionsCache.get(mapNumber)!));
    }

    return true;
}

function scheduleIdle(callback: () => void): void {
    if (typeof window === "undefined") {
        return;
    }
    const idle = (
        window as Window & {
            requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        }
    ).requestIdleCallback;
    // Sin timeout: la precarga nunca compite con un frame ocupado.
    if (idle) {
        idle(callback);
    } else {
        window.setTimeout(callback, 100);
    }
}

/**
 * Precarga en tiempo ocioso los mapas que harían falta si el jugador cruzara
 * a cualquiera de sus vecinos (el vecindario de cada vecino), de a uno por
 * ciclo ocioso, para que el cruce en sí no tenga que cargar ni decodificar
 * nada.
 */
function prefetchOuterRing(engine: Engine): void {
    const layout = engine.worldLayout;
    if (!layout || engine.isDestroyed) {
        return;
    }

    const version = engine.worldStreamingVersion;
    const wanted = new Set<number>();
    const neighbors = resolveReciprocalNeighbors(layout.currentMap, edgesCache);
    for (const edge of Object.values(neighbors)) {
        if (!edge) {
            continue;
        }
        for (const candidate of collectCandidateNeighborMaps(edgesCache.get(edge.map))) {
            wanted.add(candidate);
            for (const second of collectCandidateNeighborMaps(edgesCache.get(candidate))) {
                wanted.add(second);
            }
        }
    }

    const queue = Array.from(wanted).filter(
        (map) => !mapRowsCache.has(map) && !layout.placements.has(map),
    );

    const loadNext = () => {
        if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
            return;
        }
        const next = queue.shift();
        if (next === undefined) {
            return;
        }
        void loadMapRows(next).finally(() => scheduleIdle(loadNext));
    };

    scheduleIdle(loadNext);
}

/**
 * Precalienta en tiempo ocioso las texturas de todo lo que rodea al jugador:
 * los mapas del vecindario completos (al cruzar hay que dibujar el resto del
 * mapa nuevo) y después el anillo exterior ya cargado. Así el cruce no tiene
 * que decodificar ni recortar ningún gráfico nuevo.
 */
export function prefetchWorldTextures(engine: Engine, preloadGraphicIds: PreloadGraphicIdsFn): void {
    const layout = engine.worldLayout;
    if (!layout || engine.isDestroyed || !engine.mapData || !engine.objectsDB) {
        return;
    }

    const version = engine.worldStreamingVersion;
    const objectsDB = engine.objectsDB;
    const orderedMaps: number[] = [];
    for (const placement of layout.placements.values()) {
        if (placement.role === "edge") {
            orderedMaps.push(placement.map);
        }
    }
    for (const placement of layout.placements.values()) {
        if (placement.role === "corner") {
            orderedMaps.push(placement.map);
        }
    }
    for (const map of mapRowsCache.keys()) {
        if (!layout.placements.has(map)) {
            orderedMaps.push(map);
        }
    }

    // Recorrer los 10.000 tiles de un mapa para juntar sus gráficos también
    // cuesta: se hace de a un mapa por ciclo ocioso, nunca todos juntos.
    const queue: string[] = [];
    const queued = new Set<string>();
    const collectNextMap = (): boolean => {
        const map = orderedMaps.shift();
        if (map === undefined) {
            return false;
        }
        const rows = engine.mapData?.[map] ?? mapRowsCache.get(map);
        const dimensions = dimensionsCache.get(map);
        if (!rows || !dimensions) {
            return true;
        }
        const graphicIds = collectMapGraphicIds({ [map]: rows }, map, dimensions, objectsDB, {
            includeLayers: ["1", "2", "3", "4"],
            includeObjects: true,
        });
        for (const graphicId of graphicIds) {
            if (
                queued.has(graphicId) ||
                engine.textureCache.has(graphicId) ||
                engine.animatedTextureCache.has(graphicId)
            ) {
                continue;
            }
            queued.add(graphicId);
            queue.push(graphicId);
        }
        return true;
    };

    const loadNext = () => {
        if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
            return;
        }
        if (queue.length === 0) {
            if (collectNextMap()) {
                scheduleIdle(loadNext);
            }
            return;
        }
        const batch = queue.splice(0, TEXTURE_PREFETCH_BATCH);
        void preloadGraphicIds(engine, batch)
            .catch(() => undefined)
            .finally(() => scheduleIdle(loadNext));
    };

    scheduleIdle(loadNext);
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
                void removeMapSprites(engine, previous.map, {
                    frameBudgetMs: BACKGROUND_FRAME_BUDGET_MS,
                });
            }
            if (!next && previous.map !== currentMap && engine.mapData) {
                // Las filas siguen en la caché de sesión; solo salen del motor.
                delete engine.mapData[previous.map];
            }
        }
    }

    engine.worldLayout = layout;
    engine.cullingDirty = true;
    prefetchOuterRing(engine);
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
 * una ventana, p.ej. la vista inicial antes de mostrar la escena; en ese caso
 * se dibuja de una vez, el resto va con presupuesto por frame.
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
            frameBudgetMs: clipWorld ? 0 : BACKGROUND_FRAME_BUDGET_MS,
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
        frameBudgetMs: BACKGROUND_FRAME_BUDGET_MS,
    });

    if (engine.isDestroyed || engine.worldStreamingVersion !== version) {
        return;
    }

    await renderMap(engine, {
        includeLayers: ["3", "4"],
        includeObjects: true,
        excludeBounds: rendered,
        frameBudgetMs: BACKGROUND_FRAME_BUDGET_MS,
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
    preloadGraphicIds?: PreloadGraphicIdsFn,
): Promise<void> {
    const debugWorld = (window as unknown as { __woaoDebugWorld?: boolean }).__woaoDebugWorld;
    const startedAt = performance.now();
    const synced = await syncWorldLayout(engine);
    if (debugWorld) {
        console.log(`[woao] syncWorldLayout ${(performance.now() - startedAt).toFixed(1)}ms ok=${synced} t=${Math.round(performance.now())}`);
    }
    if (!synced) {
        return;
    }

    const remainderStartedAt = performance.now();
    await renderCurrentMapRemainder(engine, renderMap);
    if (debugWorld) {
        console.log(`[woao] remainder ${(performance.now() - remainderStartedAt).toFixed(1)}ms t=${Math.round(performance.now())}`);
    }
    const neighborsStartedAt = performance.now();
    await renderWorldNeighbors(engine, renderMap);
    if (debugWorld) {
        console.log(`[woao] neighbors ${(performance.now() - neighborsStartedAt).toFixed(1)}ms t=${Math.round(performance.now())}`);
    }
    if (preloadGraphicIds) {
        prefetchWorldTextures(engine, preloadGraphicIds);
    }
}
