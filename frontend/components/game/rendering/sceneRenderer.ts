import { AnimatedSprite, Container, Sprite } from "pixi.js";
import type { MapTile } from "../../../types/game";
import { getTileAt } from "../../../utils/gameLoader";
import type { TileBounds } from "../assets/scenePreload";
import {
    collectMapGraphicIds,
    isTileWithinBounds,
} from "../assets/scenePreload";
import type { Engine } from "../engine/Engine";
import { getBottomAnchoredGraphicPosition } from "./characterLayout";
import { getRowZIndex, Z_INDEX_LAYERS } from "./mapLayers";
import {
    destroyDisplayObjectSafely,
    registerCullEntry,
    unregisterCullEntry,
} from "./pixiUtils";
import {
    getMapRowLayerContainer,
    getRoofRowContainer,
} from "./rowLayerContainers";
import {
    isTreeObjectData,
    type TreeFadeSource,
    type TreeSpriteEntry,
} from "./visibility";
import { isTileCoveredByOtherMap } from "../world/worldLayout";

export type RenderMapOptions = {
    includeLayers?: Array<"1" | "2" | "3" | "4">;
    includeObjects?: boolean;
    bounds?: TileBounds;
    excludeBounds?: TileBounds;
    // Mapa a dibujar; por defecto el actual. Tiene que estar en el layout de mundo.
    mapNumber?: number;
    // Permite saltear tiles (p.ej. el borde del mapa cubierto por un vecino).
    skipTile?: (x: number, y: number) => boolean;
};

// Con mundo continuo, el borde de un mapa que queda debajo del interior de un
// vecino no se dibuja (ver isTileCoveredByOtherMap).
function getDefaultSkipTile(
    engine: Engine,
    mapNumber: number,
): RenderMapOptions["skipTile"] | undefined {
    const layout = engine.worldLayout;
    const placement = layout?.placements.get(mapNumber);
    if (!layout || !placement) {
        return undefined;
    }

    return (x: number, y: number) =>
        isTileCoveredByOtherMap(layout, placement, x, y);
}

// Las claves de sprites llevan el mapa porque conviven tiles de varios mapas.
export function getSceneTileKey(mapNumber: number, x: number, y: number): string {
    return `${mapNumber}:${x},${y}`;
}

/**
 * Elimina todo lo dibujado de un mapa (capas, objetos, techos y árboles) sin
 * tocar el resto del mundo. Se usa al dejar de tener un mapa como vecino.
 */
export function removeMapSprites(engine: Engine, mapNumber: number): void {
    const prefix = `${mapNumber}:`;

    for (const spriteKey of Array.from(engine.sceneLayerSprites.keys())) {
        const separatorIndex = spriteKey.indexOf(":");
        const tileKey = spriteKey.slice(separatorIndex + 1);
        if (tileKey.startsWith(prefix)) {
            removeSceneLayerSprite(engine, spriteKey, tileKey);
        }
    }

    for (const tileKey of Array.from(engine.objectSprites.keys())) {
        if (tileKey.startsWith(prefix)) {
            removeObjectSprite(engine, tileKey);
        }
    }

    for (const tileKey of Array.from(engine.roofSprites.keys())) {
        if (tileKey.startsWith(prefix)) {
            removeRoofSpritesForTile(engine, tileKey);
        }
    }

    for (const tileKey of Array.from(engine.tileObjectRenderRequestIds.keys())) {
        if (tileKey.startsWith(prefix)) {
            engine.tileObjectRenderRequestIds.delete(tileKey);
        }
    }

    for (const queuedTile of Array.from(engine.pendingTileObjectVisualSyncs)) {
        if (queuedTile.startsWith(prefix)) {
            engine.pendingTileObjectVisualSyncs.delete(queuedTile);
        }
    }

    engine.worldRenderedBounds.delete(mapNumber);
    engine.cullingDirty = true;
}

export function registerTreeSprite(
    engine: Engine,
    tileKey: string,
    x: number,
    y: number,
    sprite: Sprite | AnimatedSprite,
    source: TreeFadeSource,
): void {
    const existingEntries = engine.treeSprites.get(tileKey) ?? [];
    const treeEntry: TreeSpriteEntry = {
        tileKey,
        x,
        y,
        sprite,
        source,
        isFaded: false,
    };

    existingEntries.push(treeEntry);
    engine.treeSprites.set(tileKey, existingEntries);

    const rowEntries = engine.treeSpritesByRow.get(y) ?? [];
    rowEntries.push(treeEntry);
    engine.treeSpritesByRow.set(y, rowEntries);
    engine.treeTransparencyDirty = true;
}

export function unregisterTreeSprite(
    engine: Engine,
    tileKey: string,
    sprite: Sprite | AnimatedSprite,
): void {
    const existingEntries = engine.treeSprites.get(tileKey);

    if (!existingEntries) {
        return;
    }

    const removedEntries = existingEntries.filter(
        (treeEntry) => treeEntry.sprite === sprite,
    );
    const remainingEntries = existingEntries.filter(
        (treeEntry) => treeEntry.sprite !== sprite,
    );

    for (const removedEntry of removedEntries) {
        const rowEntries = engine.treeSpritesByRow.get(removedEntry.y);

        if (rowEntries) {
            const remainingRowEntries = rowEntries.filter(
                (treeEntry) => treeEntry !== removedEntry,
            );

            if (remainingRowEntries.length === 0) {
                engine.treeSpritesByRow.delete(removedEntry.y);
            } else {
                engine.treeSpritesByRow.set(
                    removedEntry.y,
                    remainingRowEntries,
                );
            }
        }

        engine.fadedTreeSprites.delete(removedEntry);
        removedEntry.isFaded = false;
    }

    if (remainingEntries.length === 0) {
        engine.treeSprites.delete(tileKey);
        engine.treeTransparencyDirty = true;
        return;
    }

    engine.treeSprites.set(tileKey, remainingEntries);
    engine.treeTransparencyDirty = true;
}

export function removeSceneLayerSprite(
    engine: Engine,
    spriteKey: string,
    tileKey?: string,
): void {
    const sprite = engine.sceneLayerSprites.get(spriteKey);

    if (!sprite) {
        return;
    }

    if (tileKey) {
        unregisterTreeSprite(engine, tileKey, sprite);
    }

    unregisterCullEntry(engine, sprite);
    engine.animatedSpriteFrameCounters.delete(sprite as AnimatedSprite);
    sprite.parent?.removeChild(sprite);
    destroyDisplayObjectSafely(sprite);
    engine.sceneLayerSprites.delete(spriteKey);
}

export function removeRoofSpritesForTile(
    engine: Engine,
    tileKey: string,
): void {
    const sprites = engine.roofSprites.get(tileKey);

    if (!sprites || sprites.length === 0) {
        return;
    }

    for (const sprite of sprites) {
        unregisterCullEntry(engine, sprite);
        engine.animatedSpriteFrameCounters.delete(sprite as AnimatedSprite);
        sprite.parent?.removeChild(sprite);
        destroyDisplayObjectSafely(sprite);
    }

    engine.roofSprites.delete(tileKey);
    engine.roofTiles.delete(tileKey);
    engine.roofVisibilityDirty = true;
}

export function removeObjectSprite(engine: Engine, tileKey: string): void {
    const sprite = engine.objectSprites.get(tileKey);

    if (!sprite) {
        return;
    }

    unregisterTreeSprite(engine, tileKey, sprite);
    unregisterCullEntry(engine, sprite);
    engine.animatedSpriteFrameCounters.delete(sprite as AnimatedSprite);
    sprite.parent?.removeChild(sprite);
    destroyDisplayObjectSafely(sprite);
    engine.objectSprites.delete(tileKey);
}

export function ensureMapTile(
    engine: Engine,
    mapNumber: number,
    x: number,
    y: number,
): MapTile | null {
    if (!engine.mapData) {
        return null;
    }

    const mapKey = mapNumber.toString();
    const rowKey = y.toString();
    const columnKey = x.toString();

    if (!engine.mapData[mapKey]) {
        engine.mapData[mapKey] = {};
    }

    if (!engine.mapData[mapKey][rowKey]) {
        engine.mapData[mapKey][rowKey] = {};
    }

    if (!engine.mapData[mapKey][rowKey][columnKey]) {
        engine.mapData[mapKey][rowKey][columnKey] = {};
    }

    return engine.mapData[mapKey][rowKey][columnKey];
}

export function applyPendingTileStates(
    engine: Engine,
    pendingTileStates: Map<string, any>,
): void {
    for (const [key, pendingState] of pendingTileStates.entries()) {
        const [mapPart, tilePart] = key.split(":");
        const [xPart, yPart] = tilePart.split(",");
        const targetMap = Number(mapPart);
        const x = Number(xPart);
        const y = Number(yPart);
        const tile = ensureMapTile(engine, targetMap, x, y);

        if (!tile) {
            continue;
        }

        if (pendingState.objInfo !== undefined) {
            if (pendingState.objInfo === null) {
                delete tile.objInfo;
            } else {
                tile.objInfo = { ...pendingState.objInfo };
            }
        }

        if (pendingState.blocked !== undefined) {
            if (pendingState.blocked === null) {
                delete tile.blocked;
            } else {
                tile.blocked = pendingState.blocked;
            }
        }
    }
}

export function renderTileLayer(
    engine: Engine,
    canUseEngineContainer: (
        engine: Engine,
        container: Container | null | undefined,
    ) => boolean,
    graphicId: number,
    x: number,
    y: number,
    zIndex: number,
    container: Container,
    anchor: "tile" | "bottom" = "tile",
    mapNumber: number = engine.mapNumber,
): Sprite | AnimatedSprite | null {
    if (!engine.graphicsDB || !canUseEngineContainer(engine, container)) {
        return null;
    }

    const graphicData = engine.graphicsDB[graphicId.toString()];
    if (!graphicData) return null;

    let sprite: Sprite | AnimatedSprite;

    if (graphicData.numFrames > 1) {
        const frameTextures = engine.animatedTextureCache.get(
            graphicId.toString(),
        );
        if (frameTextures && frameTextures.length > 0) {
            const animatedSprite = new AnimatedSprite(frameTextures);
            animatedSprite.stop();
            (animatedSprite as any).frameCounter = 0.1;
            animatedSprite.currentFrame = 0;
            animatedSprite.alpha = 1;
            animatedSprite.visible = true;

            engine.animatedSpriteFrameCounters.set(animatedSprite, {
                graphicId: graphicId.toString(),
                graphicData,
            });

            sprite = animatedSprite;
        } else {
            return null;
        }
    } else {
        const texture = engine.textureCache.get(graphicId.toString());
        if (texture) {
            sprite = new Sprite(texture);
        } else {
            return null;
        }
    }

    sprite.x = engine.tileToWorldX(x, mapNumber);
    sprite.y = engine.tileToWorldY(y, mapNumber);

    if (anchor === "bottom") {
        if (graphicData.numFrames === 1) {
            const position = getBottomAnchoredGraphicPosition(
                graphicData.width,
                graphicData.height,
            );
            sprite.x += position.x;
            sprite.y += position.y;
        } else {
            const frameTextures = engine.animatedTextureCache.get(
                graphicId.toString(),
            );
            if (frameTextures && frameTextures.length > 0) {
                const position = getBottomAnchoredGraphicPosition(
                    frameTextures[0].width,
                    frameTextures[0].height,
                );
                sprite.x += position.x;
                sprite.y += position.y;
            }
        }
    }

    sprite.x = Math.round(sprite.x);
    sprite.y = Math.round(sprite.y);
    sprite.zIndex = zIndex;

    registerCullEntry(engine, sprite, "scene");
    container.addChild(sprite);
    return sprite;
}

export function renderRoofLayer(
    engine: Engine,
    canUseEngineContainer: (
        engine: Engine,
        container: Container | null | undefined,
    ) => boolean,
    graphicId: number,
    x: number,
    y: number,
    zIndex: number,
    mapNumber: number = engine.mapNumber,
): void {
    if (
        !engine.graphicsDB ||
        !canUseEngineContainer(engine, engine.roofContainer)
    ) {
        return;
    }

    const graphicData = engine.graphicsDB[graphicId.toString()];
    if (!graphicData) return;

    let sprite: Sprite | AnimatedSprite;

    if (graphicData.numFrames > 1) {
        const frameTextures = engine.animatedTextureCache.get(
            graphicId.toString(),
        );
        if (frameTextures && frameTextures.length > 0) {
            const animatedSprite = new AnimatedSprite(frameTextures);
            animatedSprite.stop();
            (animatedSprite as any).frameCounter = 0.1;
            animatedSprite.currentFrame = 0;
            animatedSprite.alpha = 1;
            animatedSprite.visible = true;
            engine.animatedSpriteFrameCounters.set(animatedSprite, {
                graphicId: graphicId.toString(),
                graphicData,
            });
            sprite = animatedSprite;
        } else {
            return;
        }
    } else {
        const texture = engine.textureCache.get(graphicId.toString());
        if (texture) {
            sprite = new Sprite(texture);
        } else {
            return;
        }
    }

    sprite.x = engine.tileToWorldX(x, mapNumber);
    sprite.y = engine.tileToWorldY(y, mapNumber);

    if (graphicData.numFrames === 1) {
        const position = getBottomAnchoredGraphicPosition(
            graphicData.width,
            graphicData.height,
        );
        sprite.x += position.x;
        sprite.y += position.y;
    } else {
        const frameTextures = engine.animatedTextureCache.get(
            graphicId.toString(),
        );
        if (frameTextures && frameTextures.length > 0) {
            const position = getBottomAnchoredGraphicPosition(
                frameTextures[0].width,
                frameTextures[0].height,
            );
            sprite.x += position.x;
            sprite.y += position.y;
        }
    }

    sprite.x = Math.round(sprite.x);
    sprite.y = Math.round(sprite.y);
    sprite.zIndex = zIndex;

    const tileKey = getSceneTileKey(mapNumber, x, y);
    if (!engine.roofSprites.has(tileKey)) {
        engine.roofSprites.set(tileKey, []);
    }
    engine.roofSprites.get(tileKey)!.push(sprite);
    engine.roofTiles.add(tileKey);
    engine.roofVisibilityDirty = true;

    const roofRowContainer = getRoofRowContainer(
        engine,
        engine.getWorldRow(y, mapNumber),
    );

    if (!roofRowContainer) {
        destroyDisplayObjectSafely(sprite);
        return;
    }

    registerCullEntry(engine, sprite, "roof");
    roofRowContainer.addChild(sprite);
}

export async function syncTileObjectVisual(
    engine: Engine,
    params: {
        mapNumber: number;
        x: number;
        y: number;
        canUseEngineContainer: (
            engine: Engine,
            container: Container | null | undefined,
        ) => boolean;
        loadTextures: (engine: Engine, graphicIds: string[]) => Promise<void>;
        renderTileLayer: (
            engine: Engine,
            canUseEngineContainer: (
                engine: Engine,
                container: Container | null | undefined,
            ) => boolean,
            graphicId: number,
            x: number,
            y: number,
            zIndex: number,
            container: Container,
            anchor?: "tile" | "bottom",
            mapNumber?: number,
        ) => Sprite | AnimatedSprite | null;
    },
): Promise<void> {
    const { mapNumber, x, y, canUseEngineContainer, loadTextures } = params;
    if (
        engine.isDestroyed ||
        (mapNumber !== engine.mapNumber &&
            !engine.isMapLoadedInWorld(mapNumber)) ||
        !canUseEngineContainer(engine, engine.mapContainer) ||
        !engine.mapData ||
        !engine.objectsDB
    ) {
        return;
    }

    const tileKey = getSceneTileKey(mapNumber, x, y);
    const renderRequestId =
        (engine.tileObjectRenderRequestIds.get(tileKey) ?? 0) + 1;
    engine.tileObjectRenderRequestIds.set(tileKey, renderRequestId);
    const isStaleRender = () =>
        engine.tileObjectRenderRequestIds.get(tileKey) !== renderRequestId;

    removeObjectSprite(engine, tileKey);

    const tile = getTileAt(engine.mapData, mapNumber, x, y);
    const objIndex = tile?.objInfo?.objIndex;

    if (!objIndex) {
        if (!isStaleRender()) {
            engine.tileObjectRenderRequestIds.delete(tileKey);
        }
        return;
    }

    const objectData = engine.objectsDB[objIndex.toString()];
    const grhIndex = objectData?.grhIndex;

    if (!grhIndex) {
        if (!isStaleRender()) {
            engine.tileObjectRenderRequestIds.delete(tileKey);
        }
        return;
    }

    await loadTextures(engine, [grhIndex.toString()]);

    if (
        isStaleRender() ||
        !canUseEngineContainer(engine, engine.mapContainer)
    ) {
        return;
    }

    const objectLayerContainer = getMapRowLayerContainer(
        engine,
        engine.getWorldRow(y, mapNumber),
        "object",
    );

    if (
        !objectLayerContainer ||
        !canUseEngineContainer(engine, objectLayerContainer)
    ) {
        if (!isStaleRender()) {
            engine.tileObjectRenderRequestIds.delete(tileKey);
        }
        return;
    }

    const sprite = params.renderTileLayer(
        engine,
        canUseEngineContainer,
        Number(grhIndex),
        x,
        y,
        getRowZIndex(y, Z_INDEX_LAYERS.OBJECT),
        objectLayerContainer,
        "bottom",
        mapNumber,
    );

    if (isStaleRender()) {
        if (sprite) {
            unregisterCullEntry(engine, sprite);
            engine.animatedSpriteFrameCounters.delete(sprite as AnimatedSprite);
            sprite.parent?.removeChild(sprite);
            destroyDisplayObjectSafely(sprite);
        }
        return;
    }

    if (sprite) {
        if (isTreeObjectData(objectData)) {
            const origin = engine.getMapWorldOrigin(mapNumber);
            registerTreeSprite(
                engine,
                tileKey,
                x + origin.x,
                y + origin.y,
                sprite,
                "object",
            );
        }

        engine.objectSprites.set(tileKey, sprite);
    }

    engine.tileObjectRenderRequestIds.delete(tileKey);
}

export async function flushPendingTileObjectVisualSyncs(
    engine: Engine,
    params: {
        syncTileObjectVisual: (engine: Engine, params: any) => Promise<void>;
        canUseEngineContainer: (
            engine: Engine,
            container: Container | null | undefined,
        ) => boolean;
        loadTextures: (engine: Engine, graphicIds: string[]) => Promise<void>;
        renderTileLayer: any;
        scheduleTileObjectVisualSyncFlush: (engine: Engine) => void;
    },
): Promise<void> {
    if (engine.isDestroyed) {
        engine.pendingTileObjectVisualSyncs.clear();
        return;
    }

    if (engine.isFlushingTileObjectVisuals) {
        return;
    }

    engine.isFlushingTileObjectVisuals = true;

    try {
        let processedTileCount = 0;
        const batchStartedAt = performance.now();

        while (engine.pendingTileObjectVisualSyncs.size > 0) {
            const nextQueuedTile = engine.pendingTileObjectVisualSyncs
                .values()
                .next().value;

            if (!nextQueuedTile) {
                break;
            }

            engine.pendingTileObjectVisualSyncs.delete(nextQueuedTile);

            const [mapPart, tilePart] = nextQueuedTile.split(":");
            const [xPart, yPart] = tilePart.split(",");

            try {
                await params.syncTileObjectVisual(engine, {
                    mapNumber: Number(mapPart),
                    x: Number(xPart),
                    y: Number(yPart),
                    canUseEngineContainer: params.canUseEngineContainer,
                    loadTextures: params.loadTextures,
                    renderTileLayer: params.renderTileLayer,
                });
            } catch (error) {
                console.warn("Failed to sync tile object visual", error);
            }

            processedTileCount++;

            if (
                engine.pendingTileObjectVisualSyncs.size > 0 &&
                (processedTileCount % 6 === 0 ||
                    performance.now() - batchStartedAt >= 4)
            ) {
                return;
            }
        }
    } finally {
        engine.isFlushingTileObjectVisuals = false;

        if (engine.pendingTileObjectVisualSyncs.size > 0) {
            params.scheduleTileObjectVisualSyncFlush(engine);
        }
    }
}

export function scheduleTileObjectVisualSyncFlush(
    engine: Engine,
    flush: (engine: Engine) => Promise<void>,
): void {
    if (
        engine.isDestroyed ||
        engine.tileObjectVisualFlushFrameId !== null ||
        engine.isFlushingTileObjectVisuals
    ) {
        return;
    }

    const runFlush = () => {
        engine.tileObjectVisualFlushFrameId = null;
        void flush(engine);
    };

    if (typeof window === "undefined") {
        runFlush();
        return;
    }

    engine.tileObjectVisualFlushFrameId =
        window.requestAnimationFrame(runFlush);
}

export function queueTileObjectVisualSync(
    engine: Engine,
    mapNumber: number,
    x: number,
    y: number,
    schedule: (engine: Engine) => void,
): void {
    engine.pendingTileObjectVisualSyncs.add(`${mapNumber}:${x},${y}`);
    schedule(engine);
}

export async function renderMap(
    engine: Engine,
    params: {
        canUseEngineContainer: (
            engine: Engine,
            container: Container | null | undefined,
        ) => boolean;
        preloadGraphicIds: (
            engine: Engine,
            graphicIds: string[],
        ) => Promise<void>;
        syncTileObjectVisual: (engine: Engine, params: any) => Promise<void>;
        renderTileLayer: any;
        renderRoofLayer: any;
    },
    options?: RenderMapOptions,
): Promise<void> {
    if (
        !params.canUseEngineContainer(engine, engine.mapContainer) ||
        !engine.mapData ||
        !engine.graphicsDB ||
        !engine.objectsDB
    ) {
        return;
    }

    const mapNumber = options?.mapNumber ?? engine.mapNumber;
    // Un mapa que dejó de ser vecino ya no tiene origen en el mundo.
    if (mapNumber !== engine.mapNumber && !engine.isMapLoadedInWorld(mapNumber)) {
        return;
    }
    const mapDimensions =
        mapNumber === engine.mapNumber
            ? engine.mapDimensions
            : (engine.worldLayout?.placements.get(mapNumber)?.dimensions ??
              engine.mapDimensions);
    const skipTile = options?.skipTile ?? getDefaultSkipTile(engine, mapNumber);
    const worldOrigin = engine.getMapWorldOrigin(mapNumber);
    if (!engine.mapData[mapNumber]) {
        return;
    }
    const includedLayers = new Set(
        options?.includeLayers ?? ["1", "2", "3", "4"],
    );
    const includeObjects = options?.includeObjects ?? true;
    const bounds = options?.bounds;
    const excludeBounds = options?.excludeBounds;

    const graphicIds = collectMapGraphicIds(
        engine.mapData,
        mapNumber,
        mapDimensions,
        engine.objectsDB,
        {
            includeLayers: Array.from(includedLayers) as Array<
                "1" | "2" | "3" | "4"
            >,
            includeObjects,
            bounds,
            excludeBounds,
        },
    );

    if (graphicIds.length > 0) {
        await params.preloadGraphicIds(engine, graphicIds);
    }

    if (!params.canUseEngineContainer(engine, engine.mapContainer)) {
        return;
    }

    const minY = bounds?.minY ?? 1;
    const maxY = bounds?.maxY ?? mapDimensions.height;
    const minX = bounds?.minX ?? 1;
    const maxX = bounds?.maxX ?? mapDimensions.width;

    for (let y = minY; y <= maxY; y++) {
        if (!params.canUseEngineContainer(engine, engine.mapContainer)) {
            return;
        }
        for (let x = minX; x <= maxX; x++) {
            if (excludeBounds && isTileWithinBounds(x, y, excludeBounds)) {
                continue;
            }

            if (skipTile?.(x, y)) {
                continue;
            }

            const tile = getTileAt(engine.mapData, mapNumber, x, y);
            const tileKey = getSceneTileKey(mapNumber, x, y);
            const worldRow = y + worldOrigin.y;

            if (!tile?.graphics) {
                continue;
            }

            const layer1 = tile.graphics["1"];
            if (includedLayers.has("1") && layer1) {
                const layer1Key = `layer1:${tileKey}`;
                removeSceneLayerSprite(engine, layer1Key);
                const layer1Sprite = params.renderTileLayer(
                    engine,
                    params.canUseEngineContainer,
                    layer1,
                    x,
                    y,
                    Z_INDEX_LAYERS.FLOOR,
                    engine.groundLayerContainer ?? engine.mapContainer!,
                    "tile",
                    mapNumber,
                );
                if (layer1Sprite) {
                    engine.sceneLayerSprites.set(layer1Key, layer1Sprite);
                }
            }

            const layer2 = tile.graphics["2"];
            if (includedLayers.has("2") && layer2) {
                const layer2Key = `layer2:${tileKey}`;
                removeSceneLayerSprite(engine, layer2Key);
                const layer2Sprite = params.renderTileLayer(
                    engine,
                    params.canUseEngineContainer,
                    layer2,
                    x,
                    y,
                    Z_INDEX_LAYERS.BELOW,
                    engine.belowLayerContainer ?? engine.mapContainer!,
                    "tile",
                    mapNumber,
                );
                if (layer2Sprite) {
                    engine.sceneLayerSprites.set(layer2Key, layer2Sprite);
                }
            }

            if (includeObjects && tile.objInfo && engine.objectsDB) {
                await params.syncTileObjectVisual(engine, {
                    mapNumber,
                    x,
                    y,
                    canUseEngineContainer: params.canUseEngineContainer,
                    loadTextures: params.preloadGraphicIds,
                    renderTileLayer: params.renderTileLayer,
                });
            }

            const layer3 = tile.graphics["3"];
            if (includedLayers.has("3") && layer3) {
                const layer3Key = `layer3:${tileKey}`;
                removeSceneLayerSprite(engine, layer3Key, tileKey);
                const layer3Container = getMapRowLayerContainer(
                    engine,
                    worldRow,
                    "above",
                );
                const layer3Sprite = params.renderTileLayer(
                    engine,
                    params.canUseEngineContainer,
                    layer3,
                    x,
                    y,
                    getRowZIndex(y, Z_INDEX_LAYERS.ABOVE),
                    layer3Container ?? engine.mapContainer!,
                    "bottom",
                    mapNumber,
                );

                if (layer3Sprite && engine.treeGraphicIds.has(Number(layer3))) {
                    registerTreeSprite(
                        engine,
                        tileKey,
                        x + worldOrigin.x,
                        worldRow,
                        layer3Sprite,
                        "layer3",
                    );
                }

                if (layer3Sprite) {
                    engine.sceneLayerSprites.set(layer3Key, layer3Sprite);
                }
            }

            const layer4 = tile.graphics["4"];
            if (includedLayers.has("4") && layer4 && engine.roofContainer) {
                removeRoofSpritesForTile(engine, tileKey);
                params.renderRoofLayer(
                    engine,
                    params.canUseEngineContainer,
                    layer4,
                    x,
                    y,
                    getRowZIndex(y, Z_INDEX_LAYERS.ROOF),
                    mapNumber,
                );
            }
        }
    }
}
