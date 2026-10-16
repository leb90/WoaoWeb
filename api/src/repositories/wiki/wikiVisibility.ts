import type { WikiMapMetadata } from "./wikiTypes";

// The public atlas is the explicit allow-list approved for the Wiki. New maps
// stay private until they are intentionally added to the atlas metadata.
const PUBLIC_ATLAS_MAP_IDS = new Set([
    1, 2, 4, 8, 9, 10, 11, 12, 14, 16, 17, 20, 21, 26, 27, 29, 30, 31,
    32, 34, 35, 39, 40, 41, 42, 43, 44, 45, 47, 48, 53, 54, 56, 57, 59,
    60, 61, 62, 63, 64, 66, 67, 68, 69, 70, 71, 75, 79, 81, 82, 83, 84,
    85, 86, 87, 88, 89, 90, 91, 92, 93, 95, 102, 104, 106, 109, 110, 111,
    112, 113, 114, 123, 124, 127, 128, 133, 134, 135, 136, 137, 138, 139,
    140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 156,
    160, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 174, 175, 178,
    179, 180, 181, 182, 183, 184, 185, 186, 187, 189, 190, 191, 192, 194,
    277, 291, 292, 303,
]);

const PUBLIC_INVENTORY_OBJECT_TYPES = new Set([
    0, 1, 2, 3, 5, 9, 11, 12, 13, 14, 17, 18, 19, 21, 23, 24, 26, 29,
    30, 31, 32, 33, 34, 36, 37, 38, 39, 40, 41, 42, 43, 46, 50, 60, 62,
    63, 64, 65, 66, 67, 68, 71, 72, 77,
]);

export function isWikiMapPublic(map: WikiMapMetadata): boolean {
    return PUBLIC_ATLAS_MAP_IDS.has(map.id);
}

export function isWikiObjectPublic(data: Record<string, unknown>): boolean {
    const name = String(data.name ?? "").trim();
    const objType = Number(data.objType ?? 0);

    if (!name || /(?:^|\b)(?:e2e|dummy|debug|test)(?:\b|$)/i.test(name)) {
        return false;
    }

    return PUBLIC_INVENTORY_OBJECT_TYPES.has(objType);
}
