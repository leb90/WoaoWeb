// Apuntado asistido, como la orden "a unidad" de Dota 2 (DOTA_UNIT_ORDER_CAST_TARGET con TargetIndex): el
// cliente manda, además de la baldosa, a quién apuntó. El server lo acepta si ese personaje o criatura estuvo
// en la baldosa clickeada hace poco; así un objetivo que justo dio un paso no se escapa por la latencia.
// El mago tiene la mitad de ventana que el resto (pedido de Leandro). Sin esto, la ventana es 0: solo vale
// quien está ahora en la baldosa.
export {};

import type { EntityId } from "./types/runtime";

const vars = require("./vars");
const worldLayout = require("./worldLayout") as { isNeighborMap: (viewerMap: number, targetMap: number) => boolean };

export const TARGET_ASSIST_WINDOW_MS = 600;
export const MAGE_TARGET_ASSIST_WINDOW_MS = 300;
const HISTORY_SIZE = 4;

type TileVisit = { map: number; x: number; y: number; leftAt: number };
type Trackable = { map?: number; pos?: { x: number; y: number }; recentTiles?: TileVisit[] };
type AssistTarget = Trackable & {
    id?: EntityId;
    isNpc?: boolean;
    dead?: boolean;
    hp?: number;
    invisibleSpell?: unknown;
    hiddenSkill?: unknown;
    invisibleAdmin?: unknown;
};

/** Anota la baldosa que deja (llamar justo antes de cambiar la posición al caminar). */
export function recordTileLeft(entity: Trackable | undefined, map: number, x: number, y: number, now = Date.now()) {
    if (!entity) return;
    const visits = (entity.recentTiles ??= []);
    visits.unshift({ map, x, y, leftAt: now });
    if (visits.length > HISTORY_SIZE) visits.length = HISTORY_SIZE;
}

export function wasAtTileRecently(entity: Trackable, map: number, x: number, y: number, windowMs: number, now = Date.now()) {
    if (entity.map === map && entity.pos?.x === x && entity.pos?.y === y) return true;
    return (entity.recentTiles ?? []).some(
        (visit) => visit.map === map && visit.x === x && visit.y === y && now - visit.leftAt <= windowMs,
    );
}

export function getTargetAssistWindowMs(attacker: { idClase?: number } | undefined) {
    return Number(attacker?.idClase) === Number(vars.clases.mago) ? MAGE_TARGET_ASSIST_WINDOW_MS : TARGET_ASSIST_WINDOW_MS;
}

/**
 * Objetivo pedido por id si sigue siendo válido: existe, está vivo y cerca del atacante, no está invisible
 * ni oculto (a esos solo se les pega clickeando su baldosa, como siempre) y estuvo en la baldosa clickeada
 * dentro de la ventana del atacante.
 */
export function resolveAssistedTarget(
    attacker: { map: number; idClase?: number } | undefined,
    targetId: number,
    map: number,
    x: number,
    y: number,
    now = Date.now(),
): { id: EntityId; target: AssistTarget; isNpc: boolean } | undefined {
    if (!attacker || !Number.isFinite(targetId) || targetId <= 0) return undefined;

    const npc = vars.npcs?.[targetId] as AssistTarget | undefined;
    const character = npc ? undefined : (vars.personajes?.[targetId] as AssistTarget | undefined);
    const target = npc ?? character;
    if (!target || !target.pos || target.map === undefined) return undefined;
    if (Number(target.hp ?? 1) <= 0 || target.dead) return undefined;
    if (!npc && (target.invisibleSpell || target.hiddenSkill || target.invisibleAdmin)) return undefined;
    if (!worldLayout.isNeighborMap(attacker.map, Number(target.map))) return undefined;
    if (!wasAtTileRecently(target, map, x, y, getTargetAssistWindowMs(attacker), now)) return undefined;

    return { id: (target.id ?? targetId) as EntityId, target, isNpc: Boolean(npc) };
}

module.exports = {
    TARGET_ASSIST_WINDOW_MS,
    MAGE_TARGET_ASSIST_WINDOW_MS,
    recordTileLeft,
    wasAtTileRecently,
    getTargetAssistWindowMs,
    resolveAssistedTarget,
};
