import { Container } from "pixi.js";
import type { SpellData } from "../../../types/game";

type CombatTargetEntity = {
    isNpc?: boolean;
    pos: { x: number; y: number };
};

export function isSelfFirstSupportSpell(
    spellData: SpellData | null | undefined,
) {
    if (!spellData) {
        return false;
    }

    return Boolean(
        Number(spellData.removerParalisis ?? 0) === 1 ||
        Number(spellData.invisibilidad ?? 0) === 1 ||
        Number(spellData.subeHp ?? 0) === 1 ||
        Number(spellData.subeAg ?? 0) > 0 ||
        Number(spellData.subeFz ?? 0) > 0,
    );
}

export function getPointerTargetPriority(
    entity: CombatTargetEntity,
    isSelf: boolean,
    preferSelfFirst: boolean,
) {
    if (preferSelfFirst) {
        if (isSelf) {
            return 0;
        }

        return entity.isNpc ? 2 : 1;
    }

    if (!entity.isNpc && !isSelf) {
        return 0;
    }

    if (entity.isNpc) {
        return 1;
    }

    return 2;
}

export function getCombatTileMatchRank(
    entity: CombatTargetEntity,
    tileX: number,
    tileY: number,
) {
    if (entity.pos.x === tileX && entity.pos.y === tileY) {
        return 0;
    }

    if (entity.pos.x === tileX && entity.pos.y === tileY + 1) {
        return 1;
    }

    return 2;
}

export function getCombatTileDistance(
    entity: CombatTargetEntity,
    tileX: number,
    tileY: number,
) {
    const verticalDistance = Math.min(
        Math.abs(entity.pos.y - tileY),
        Math.abs(entity.pos.y - (tileY + 1)),
    );

    return Math.abs(entity.pos.x - tileX) + verticalDistance;
}

// Área clickeable de un personaje. Antes era más chica que el dibujo (se recortaban los bordes); ahora, como
// la caja "select_low" de Dota 2, se agranda media anchura del dibujo por costado. `assist` va de 0 (el área
// de antes) a 1 (toda la ayuda): el mago usa 0,5, la mitad de lo que se agrega (nunca menos que antes).
const ASSISTED_MARGIN_X = 0.5;
const ASSISTED_MARGIN_TOP = 0.1;
const ASSISTED_MARGIN_BOTTOM = 0.25;

export function getCombatHitbox(
    bounds: { x: number; y: number; width: number; height: number },
    // En mobile el dedo es menos preciso que el mouse: el área de antes ya era más permisiva.
    wide = false,
    assist = 1,
) {
    const insetScale = wide ? 0.4 : 1;
    const before = {
        x: -Math.min(bounds.width * 0.18, 12) * insetScale,
        top: -Math.min(bounds.height * 0.12, 14) * insetScale,
        bottom: -Math.min(bounds.height * 0.06, 8) * insetScale,
    };
    const full = {
        x: bounds.width * ASSISTED_MARGIN_X,
        top: bounds.height * ASSISTED_MARGIN_TOP,
        bottom: bounds.height * ASSISTED_MARGIN_BOTTOM,
    };
    const k = Math.max(0, Math.min(1, assist));
    const marginX = before.x + (full.x - before.x) * k;
    const marginTop = before.top + (full.top - before.top) * k;
    const marginBottom = before.bottom + (full.bottom - before.bottom) * k;
    const width = Math.max(8, bounds.width + marginX * 2);
    const height = Math.max(8, bounds.height + marginTop + marginBottom);
    return {
        x: bounds.x + bounds.width / 2 - width / 2,
        y: bounds.y - marginTop,
        width,
        height,
    };
}

export function isPointerInsideCombatHitbox(
    bounds: { x: number; y: number; width: number; height: number },
    pointerX: number,
    pointerY: number,
    wide = false,
    assist = 1,
) {
    const box = getCombatHitbox(bounds, wide, assist);
    return pointerX >= box.x && pointerX <= box.x + box.width && pointerY >= box.y && pointerY <= box.y + box.height;
}

type HitMarker =
    | "isPlayerBody"
    | "isPlayerHead"
    | "isPlayerHelmet"
    | "isRemoteBody"
    | "isRemoteHead"
    | "isRemoteHelmet";

export type PointerSpriteMatch = {
    // El puntero está sobre el dibujo mismo (no solo sobre el área agrandada): como "select_high" de Dota,
    // desempata cuando las áreas de dos personajes se pisan.
    tight: boolean;
    // Distancia del puntero al centro del dibujo, en píxeles de pantalla.
    distance: number;
};

export function getPointerSpriteMatch(
    container: Container | null | undefined,
    hitMarkers: HitMarker[],
    pointerX: number,
    pointerY: number,
    wide = false,
    assist = 1,
): PointerSpriteMatch | null {
    if (!container || container.destroyed) {
        return null;
    }

    let match: PointerSpriteMatch | null = null;
    for (const child of container.children) {
        if (!hitMarkers.some((marker) => Boolean((child as any)[marker]))) {
            continue;
        }

        const displayObject = child as Container["children"][number] & {
            getBounds?: () => { x: number; y: number; width: number; height: number };
        };
        if (typeof displayObject.getBounds !== "function" || displayObject.visible === false || displayObject.alpha <= 0.05) {
            continue;
        }

        const bounds = displayObject.getBounds();
        if (!isPointerInsideCombatHitbox(bounds, pointerX, pointerY, wide, assist)) {
            continue;
        }

        const tight =
            pointerX >= bounds.x && pointerX <= bounds.x + bounds.width && pointerY >= bounds.y && pointerY <= bounds.y + bounds.height;
        const distance = Math.hypot(pointerX - (bounds.x + bounds.width / 2), pointerY - (bounds.y + bounds.height / 2));
        if (!match || (tight && !match.tight) || (tight === match.tight && distance < match.distance)) {
            match = { tight, distance };
        }
    }

    return match;
}

export function isPointerOverMarkedSprite(
    container: Container | null | undefined,
    hitMarkers: HitMarker[],
    pointerX: number,
    pointerY: number,
    wide = false,
    assist = 1,
): boolean {
    return getPointerSpriteMatch(container, hitMarkers, pointerX, pointerY, wide, assist) !== null;
}

/** Ayuda de apuntado según la clase de quien apunta: el mago recibe la mitad de lo que se agrega. */
export function getTargetAssistForClass(idClase: number | null | undefined) {
    return Number(idClase) === 1 ? 0.5 : 1;
}

/** Mejor coincidencia entre varias: primero la que tiene el puntero sobre el dibujo y después la más cercana. */
export function isBetterPointerMatch(candidate: PointerSpriteMatch, current: PointerSpriteMatch | null) {
    if (!current) return true;
    if (candidate.tight !== current.tight) return candidate.tight;
    return candidate.distance < current.distance;
}
