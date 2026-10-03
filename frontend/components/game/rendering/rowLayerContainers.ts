import { Container } from "pixi.js";
import { TILE_SIZE } from "../../../lib/viewport";
import type { Character, Engine } from "../engine/Engine";
import { getRowZIndex, Z_INDEX_LAYERS } from "./mapLayers";

export type MapRowLayerKind = "object" | "character" | "above";

const MAP_ROW_LAYER_Z_OFFSET: Record<MapRowLayerKind, number> = {
    object: Z_INDEX_LAYERS.OBJECT,
    character: Z_INDEX_LAYERS.CHARACTER,
    above: Z_INDEX_LAYERS.ABOVE,
};

// Las filas son filas de mundo (tile local + origen del mapa), así que con
// vecinos cargados pueden ser negativas o pasar de 100. Los contenedores se
// crean cuando hace falta y el padre los ordena por zIndex.
function getMapRowLayerKey(row: number, kind: MapRowLayerKind): string {
    return `${row}:${kind}`;
}

function normalizeRow(row: number): number {
    return Math.round(row);
}

export function createMapRowLayerContainers(engine: Engine): void {
    if (!engine.mapContainer) {
        return;
    }

    engine.mapRowLayerContainers.clear();
    engine.mapContainer.sortableChildren = true;
    engine.groundLayerContainer = new Container();
    engine.groundLayerContainer.zIndex = Number.MIN_SAFE_INTEGER;
    engine.belowLayerContainer = new Container();
    engine.belowLayerContainer.zIndex = Number.MIN_SAFE_INTEGER + 1;
    engine.mapContainer.addChild(engine.groundLayerContainer);
    engine.mapContainer.addChild(engine.belowLayerContainer);
}

export function createRoofRowContainers(engine: Engine): void {
    if (!engine.roofContainer) {
        return;
    }

    engine.roofRowContainers.clear();
    engine.roofContainer.sortableChildren = true;
}

export function createEntityFXRowContainers(engine: Engine): void {
    if (!engine.entityFXOverlayContainer) {
        return;
    }

    engine.entityFXRowContainers.clear();
    engine.entityFXOverlayContainer.sortableChildren = true;
}

export function getMapRowLayerContainer(
    engine: Engine,
    row: number,
    kind: MapRowLayerKind,
): Container | null {
    if (!engine.mapContainer) {
        return null;
    }

    const normalizedRow = normalizeRow(row);
    const key = getMapRowLayerKey(normalizedRow, kind);
    const existing = engine.mapRowLayerContainers.get(key);
    if (existing) {
        return existing;
    }

    const container = new Container();
    container.zIndex = getRowZIndex(normalizedRow, MAP_ROW_LAYER_Z_OFFSET[kind]);
    engine.mapContainer.addChild(container);
    engine.mapRowLayerContainers.set(key, container);
    return container;
}

export function getRoofRowContainer(
    engine: Engine,
    row: number,
): Container | null {
    if (!engine.roofContainer) {
        return null;
    }

    const normalizedRow = normalizeRow(row);
    const existing = engine.roofRowContainers.get(normalizedRow);
    if (existing) {
        return existing;
    }

    const container = new Container();
    container.zIndex = normalizedRow;
    engine.roofContainer.addChild(container);
    engine.roofRowContainers.set(normalizedRow, container);
    return container;
}

export function getEntityFXRowContainer(
    engine: Engine,
    row: number,
): Container | null {
    if (!engine.entityFXOverlayContainer) {
        return null;
    }

    const normalizedRow = normalizeRow(row);
    const existing = engine.entityFXRowContainers.get(normalizedRow);
    if (existing) {
        return existing;
    }

    const container = new Container();
    container.zIndex = normalizedRow;
    engine.entityFXOverlayContainer.addChild(container);
    engine.entityFXRowContainers.set(normalizedRow, container);
    return container;
}

export function getWorldRowFromWorldY(_engine: Engine, worldY: number): number {
    return Math.floor(worldY / TILE_SIZE) + 1;
}

export function getCharacterBaseRenderRow(
    engine: Engine,
    character: Character,
): number {
    return engine.getWorldRow(character.pos.y - character.addtoUserPos.y);
}

export function syncCharacterContainerToRenderRow(
    engine: Engine,
    character: Character | null | undefined,
    container: Container | null | undefined,
): void {
    if (!character || !container) {
        return;
    }

    const targetContainer = getMapRowLayerContainer(
        engine,
        getCharacterBaseRenderRow(engine, character),
        "character",
    );

    if (!targetContainer || container.parent === targetContainer) {
        return;
    }

    targetContainer.addChild(container);
}

export function syncDisplayObjectToEntityFXRow(
    engine: Engine,
    worldY: number,
    displayObject: any,
): void {
    const targetContainer = getEntityFXRowContainer(
        engine,
        getWorldRowFromWorldY(engine, worldY),
    );

    if (!targetContainer || displayObject.parent === targetContainer) {
        return;
    }

    targetContainer.addChild(displayObject as Container);
}
