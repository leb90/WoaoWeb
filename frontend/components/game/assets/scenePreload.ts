import type { MapData, ObjectsDB } from "../../../types/game";
import type { CharacterSnapshot, SpellEntry } from "../../../lib/aowProtocol";
import {
    VIEWPORT_TILE_HEIGHT,
    VIEWPORT_TILE_WIDTH,
} from "../../../lib/viewport";
import { getTileAt } from "../../../utils/gameLoader";
import type { Engine } from "../engine/Engine";

export const NAKED_BODY_IDS = [
    21, 32, 39, 40, 53, 60, 178, 212, 215, 217, 486, 488, 526, 527, 528, 529, 530, 531,
] as const;

const HEAD_ID_TO_NAKED_BODY_RANGES = [
    { startHeadId: 3, endHeadId: 53, bodyId: 21 },
    { startHeadId: 70, endHeadId: 82, bodyId: 39 },
    { startHeadId: 101, endHeadId: 119, bodyId: 21 },
    { startHeadId: 170, endHeadId: 180, bodyId: 39 },
    { startHeadId: 201, endHeadId: 216, bodyId: 32 },
    { startHeadId: 270, endHeadId: 277, bodyId: 40 },
    { startHeadId: 301, endHeadId: 315, bodyId: 53 },
    { startHeadId: 370, endHeadId: 373, bodyId: 60 },
    { startHeadId: 401, endHeadId: 411, bodyId: 53 },
    { startHeadId: 470, endHeadId: 476, bodyId: 60 },
    { startHeadId: 501, endHeadId: 503, bodyId: 40 },
    { startHeadId: 505, endHeadId: 512, bodyId: 32 },
    { startHeadId: 601, endHeadId: 606, bodyId: 215 },
    { startHeadId: 607, endHeadId: 609, bodyId: 217 },
    { startHeadId: 701, endHeadId: 704, bodyId: 212 },
    { startHeadId: 705, endHeadId: 712, bodyId: 178 },
    { startHeadId: 801, endHeadId: 804, bodyId: 488 },
    { startHeadId: 851, endHeadId: 853, bodyId: 486 },
    { startHeadId: 860, endHeadId: 863, bodyId: 527 },
    { startHeadId: 880, endHeadId: 883, bodyId: 526 },
    { startHeadId: 890, endHeadId: 893, bodyId: 530 },
    { startHeadId: 900, endHeadId: 903, bodyId: 531 },
    { startHeadId: 910, endHeadId: 913, bodyId: 528 },
    { startHeadId: 920, endHeadId: 923, bodyId: 529 },
] as const;

export type TileBounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
};

export function isTileWithinBounds(
    x: number,
    y: number,
    bounds: TileBounds,
): boolean {
    return (
        x >= bounds.minX &&
        x <= bounds.maxX &&
        y >= bounds.minY &&
        y <= bounds.maxY
    );
}

export function isCharacterWithinBounds(
    character: { pos: { x: number; y: number } },
    bounds: TileBounds,
): boolean {
    return isTileWithinBounds(character.pos.x, character.pos.y, bounds);
}

export function collectMapGraphicIds(
    mapData: MapData,
    targetMapNumber: number,
    mapDimensions: { width: number; height: number },
    objectsDB: ObjectsDB,
    options?: {
        includeLayers?: Array<"1" | "2" | "3" | "4">;
        includeObjects?: boolean;
        bounds?: TileBounds;
        excludeBounds?: TileBounds;
    },
): string[] {
    const includedLayers = new Set(
        options?.includeLayers ?? ["1", "2", "3", "4"],
    );
    const includeObjects = options?.includeObjects ?? true;
    const bounds = options?.bounds;
    const excludeBounds = options?.excludeBounds;
    const uniqueGraphics = new Set<string>();

    const minY = bounds?.minY ?? 1;
    const maxY = bounds?.maxY ?? mapDimensions.height;
    const minX = bounds?.minX ?? 1;
    const maxX = bounds?.maxX ?? mapDimensions.width;

    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            if (excludeBounds && isTileWithinBounds(x, y, excludeBounds)) {
                continue;
            }

            const tile = getTileAt(mapData, targetMapNumber, x, y);
            if (tile?.graphics) {
                for (const [layerKey, graphicId] of Object.entries(
                    tile.graphics,
                )) {
                    if (
                        !includedLayers.has(layerKey as "1" | "2" | "3" | "4")
                    ) {
                        continue;
                    }

                    uniqueGraphics.add(graphicId.toString());
                }
            }

            if (includeObjects && tile?.objInfo) {
                const objectData = objectsDB[tile.objInfo.objIndex.toString()];
                if (objectData?.grhIndex) {
                    uniqueGraphics.add(objectData.grhIndex.toString());
                }
            }
        }
    }

    return Array.from(uniqueGraphics);
}

export function collectSpecificBodyGraphicIds(
    engine: Engine,
    bodyIds: readonly number[],
): string[] {
    if (!engine.bodiesDB) {
        return [];
    }

    const uniqueGraphics = new Set<string>();

    for (const bodyId of bodyIds) {
        const bodyData = engine.bodiesDB[bodyId.toString()];
        if (!bodyData) {
            continue;
        }

        for (const graphicId of [
            bodyData["1"],
            bodyData["2"],
            bodyData["3"],
            bodyData["4"],
        ]) {
            if (graphicId && graphicId > 0) {
                uniqueGraphics.add(graphicId.toString());
            }
        }
    }

    return Array.from(uniqueGraphics);
}

export function collectCharacterGraphicIds(
    engine: Engine,
    snapshot: CharacterSnapshot,
    options?: { includeBody?: boolean },
): string[] {
    if (!engine.bodiesDB || !engine.headsDB) {
        return [];
    }

    const uniqueGraphics = new Set<string>();
    const includeBody = options?.includeBody ?? true;
    const bodyData = includeBody
        ? engine.bodiesDB[snapshot.idBody.toString()]
        : undefined;
    const headData = snapshot.idHead
        ? engine.headsDB[snapshot.idHead.toString()]
        : undefined;
    const weaponData = snapshot.idWeapon
        ? engine.weaponsDB?.[snapshot.idWeapon.toString()]
        : undefined;
    const shieldData = snapshot.idShield
        ? engine.shieldsDB?.[snapshot.idShield.toString()]
        : undefined;
    const helmetData = snapshot.idHelmet
        ? engine.helmetsDB?.[snapshot.idHelmet.toString()]
        : undefined;

    const addDirectionalGraphic = (graphicId: number | undefined) => {
        if (graphicId && graphicId > 0) {
            uniqueGraphics.add(graphicId.toString());
        }
    };

    if (bodyData) {
        addDirectionalGraphic(bodyData["1"]);
        addDirectionalGraphic(bodyData["2"]);
        addDirectionalGraphic(bodyData["3"]);
        addDirectionalGraphic(bodyData["4"]);
    }

    if (headData && snapshot.idHead > 0) {
        addDirectionalGraphic(headData["1"]);
        addDirectionalGraphic(headData["2"]);
        addDirectionalGraphic(headData["3"]);
        addDirectionalGraphic(headData["4"]);
    }

    if (weaponData) {
        addDirectionalGraphic(weaponData["1"]);
        addDirectionalGraphic(weaponData["2"]);
        addDirectionalGraphic(weaponData["3"]);
        addDirectionalGraphic(weaponData["4"]);
    }

    if (shieldData) {
        addDirectionalGraphic(shieldData["1"]);
        addDirectionalGraphic(shieldData["2"]);
        addDirectionalGraphic(shieldData["3"]);
        addDirectionalGraphic(shieldData["4"]);
    }

    if (helmetData) {
        addDirectionalGraphic(helmetData["1"]);
        addDirectionalGraphic(helmetData["2"]);
        addDirectionalGraphic(helmetData["3"]);
        addDirectionalGraphic(helmetData["4"]);
    }

    return Array.from(uniqueGraphics);
}

export function collectSpellGraphicIds(
    engine: Engine,
    spells: SpellEntry[],
): string[] {
    if (!engine.spellsDB || !engine.fxsDB) {
        return [];
    }

    const uniqueGraphics = new Set<string>();
    for (const spell of spells) {
        const spellData = engine.spellsDB[spell.idSpell.toString()];
        const fxId = spellData?.fxGrh ?? 0;
        if (!fxId) {
            continue;
        }

        const fxData = engine.fxsDB[fxId.toString()];
        if (fxData?.grh) {
            uniqueGraphics.add(fxData.grh.toString());
        }
    }

    return Array.from(uniqueGraphics);
}

export function collectAdjacentMapNumbers(
    mapData: MapData,
    targetMapNumber: number,
): number[] {
    const mapTiles = mapData[targetMapNumber];
    if (!mapTiles) {
        return [];
    }

    const adjacentMaps = new Set<number>();
    for (const row of Object.values(mapTiles)) {
        for (const tile of Object.values(row)) {
            if (tile.tileExit?.map && tile.tileExit.map !== targetMapNumber) {
                adjacentMaps.add(tile.tileExit.map);
            }
        }
    }

    return Array.from(adjacentMaps);
}

export function getInitialVisibleBounds(
    mapDimensions: { width: number; height: number },
    snapshot?: CharacterSnapshot | null,
): TileBounds | null {
    if (!snapshot) {
        return null;
    }

    const halfWidth = Math.floor(VIEWPORT_TILE_WIDTH / 2);
    const halfHeight = Math.floor(VIEWPORT_TILE_HEIGHT / 2);

    return {
        minX: Math.max(1, snapshot.pos.x - halfWidth),
        maxX: Math.min(
            mapDimensions.width,
            snapshot.pos.x + (VIEWPORT_TILE_WIDTH - halfWidth - 1),
        ),
        minY: Math.max(1, snapshot.pos.y - halfHeight),
        maxY: Math.min(
            mapDimensions.height,
            snapshot.pos.y + (VIEWPORT_TILE_HEIGHT - halfHeight - 1),
        ),
    };
}

export function resolveNakedBodyIdFromHeadId(headId: number): number | null {
    for (const range of HEAD_ID_TO_NAKED_BODY_RANGES) {
        if (headId >= range.startHeadId && headId <= range.endHeadId) {
            return range.bodyId;
        }
    }

    return null;
}
