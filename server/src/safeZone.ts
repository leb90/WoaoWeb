import type { Position } from "./types/runtime";

export {};

const vars = require("./vars");
const mapInstanceManager = require("./mapInstanceManager");

function resolveZoneMapId(mapId: number | undefined): number | undefined {
    if (!mapId) {
        return mapId;
    }

    return mapInstanceManager.isInstanceMap(mapId) ? (mapInstanceManager.getBaseMapId(mapId) ?? mapId) : mapId;
}

export function isSafeZonePosition(mapId: number | undefined, pos: Position | undefined): boolean {
    if (!mapId || !pos) {
        return false;
    }

    const zoneMapId = resolveZoneMapId(mapId);

    if (!zoneMapId) {
        return false;
    }

    return vars.mapData[zoneMapId]?.pk === 1 || vars.mapa[zoneMapId]?.[pos.y]?.[pos.x]?.trigger === 6;
}

export function isUnsafeArenaPosition(mapId: number | undefined, pos: Position | undefined): boolean {
    if (!mapId || !pos) {
        return false;
    }

    const zoneMapId = resolveZoneMapId(mapId);

    if (!zoneMapId) {
        return false;
    }

    return vars.mapa[zoneMapId]?.[pos.y]?.[pos.x]?.trigger === 6;
}

const normalizeMapTag = (value: unknown) =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

// Ciudad segura: zona segura dentro de un mapa de ciudad (zona o terreno CIUDAD). Ahí no se ataca a otros usuarios
// ni a los NPC neutrales o aliados; las criaturas hostiles se pueden atacar.
export function isSafeCityPosition(mapId: number | undefined, pos: Position | undefined): boolean {
    if (!isSafeZonePosition(mapId, pos)) {
        return false;
    }

    const mapData = vars.mapData[resolveZoneMapId(mapId) ?? 0];
    return normalizeMapTag(mapData?.zona) === "CIUDAD" || normalizeMapTag(mapData?.terreno) === "CIUDAD";
}

export function getSafeZoneFlag(mapId: number | undefined, pos: Position | undefined): 0 | 1 {
    return isSafeZonePosition(mapId, pos) ? 1 : 0;
}

module.exports = {
    getSafeZoneFlag,
    isSafeCityPosition,
    isSafeZonePosition,
    isUnsafeArenaPosition,
};
