// Contorno de 1 px al pasar el mouse sobre un personaje o NPC, con el color de la relación (como en
// leb90/_React-Argentum: characterRenderer.js, drawGreenOutline / getRelationColor).
// Se arma con 8 copias de las partes visibles corridas ±1 px, pintadas de un color sólido con un
// ColorMatrixFilter y dibujadas debajo del cuerpo: el personaje las tapa y solo queda el borde.
import { ColorMatrixFilter, Container, Sprite } from "pixi.js";
import type { Character, Engine } from "../engine/Engine";

export type HoverRelation = "self" | "clan" | "party" | "npc-hostile" | "npc" | "other";

export const HOVER_OUTLINE_COLORS: Record<HoverRelation, number> = {
    self: 0x9aee7d,
    clan: 0x6ed6ff,
    party: 0x76e37a,
    "npc-hostile": 0xff5151,
    npc: 0xf6bf63,
    other: 0xff9b7a,
};

export function getHoverRelation(engine: Engine, entity: Character): HoverRelation {
    if (entity.id === engine.user?.id) return "self";
    if (entity.isNpc) {
        return entity.isHostileNpc || engine.healthBarEntityIds.has(entity.id) ? "npc-hostile" : "npc";
    }
    if (entity.isPartyMember || engine.partyMemberIds.has(String(entity.id))) return "party";
    if (entity.isClanMember) return "clan";
    return "other";
}

const OFFSETS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
] as const;
const PARTS = ["bodySprite", "headSprite", "helmetSprite", "weaponSprite", "shieldSprite"] as const;

type OutlineRig = Container & { copies: Sprite[]; colorFilter: ColorMatrixFilter; color: number };
type HostContainer = Container & { hoverOutline?: OutlineRig } & Partial<Record<(typeof PARTS)[number], Sprite>>;

// Matriz que pinta todo píxel visible del color pedido y conserva su alfa.
function solidColorMatrix(color: number) {
    const r = ((color >> 16) & 255) / 255;
    const g = ((color >> 8) & 255) / 255;
    const b = (color & 255) / 255;
    return [0, 0, 0, 0, r, 0, 0, 0, 0, g, 0, 0, 0, 0, b, 0, 0, 0, 1, 0] as ColorMatrixFilter["matrix"];
}

export function syncHoverOutline(host: HostContainer, color: number | null) {
    let rig = host.hoverOutline;
    if (color === null) {
        if (rig && !rig.destroyed) rig.visible = false;
        return;
    }
    if (!rig || rig.destroyed) {
        rig = Object.assign(new Container(), { copies: [] as Sprite[], colorFilter: new ColorMatrixFilter(), color: -1 });
        rig.eventMode = "none";
        rig.zIndex = 0.05;
        rig.filters = [rig.colorFilter];
        host.addChild(rig);
        host.hoverOutline = rig;
    }
    if (rig.color !== color) {
        rig.colorFilter.matrix = solidColorMatrix(color);
        rig.color = color;
    }
    rig.visible = true;
    let index = 0;
    for (const key of PARTS) {
        const part = host[key];
        if (!part || part.destroyed || !part.visible || !part.texture) continue;
        for (const [dx, dy] of OFFSETS) {
            let copy = rig.copies[index++];
            if (!copy) {
                copy = new Sprite();
                copy.eventMode = "none";
                rig.addChild(copy);
                rig.copies.push(copy);
            }
            copy.texture = part.texture;
            copy.anchor.copyFrom(part.anchor);
            copy.scale.copyFrom(part.scale);
            copy.position.set(part.x + dx, part.y + dy);
            copy.visible = true;
        }
    }
    for (; index < rig.copies.length; index++) rig.copies[index].visible = false;
}

function getEntityContainer(engine: Engine, entity: Character): HostContainer | null {
    const container = entity.id === engine.user?.id ? engine.playerContainer : engine.remoteEntities.get(entity.id);
    return (container as HostContainer | null | undefined) ?? null;
}

// Se llama en cada cuadro: la cámara se mueve y el personaje camina, así que se recalcula siempre.
export function updateHoverHighlight(
    engine: Engine & { hoverPointerGlobal?: { x: number; y: number } | null; hoveredEntityId?: number | null },
    findEntityAtTile: (engine: Engine, tileX: number, tileY: number) => Character | null,
) {
    let next: Character | null = null;
    const pointer = engine.hoverPointerGlobal;
    if (pointer && engine.mapContainer) {
        const local = engine.mapContainer.toLocal(pointer);
        const tile = engine.worldToCurrentMapTile(local.x, local.y);
        const candidate = findEntityAtTile(engine, tile.x, tile.y);
        const container = candidate ? getEntityContainer(engine, candidate) : null;
        // No delatar invisibles ni muertos: si casi no se ve, no se resalta.
        if (candidate && container && !candidate.dead && container.visible && container.alpha > 0.2) {
            next = candidate;
        }
    }

    const previousId = engine.hoveredEntityId ?? null;
    const nextId = next?.id ?? null;
    if (previousId !== null && previousId !== nextId) {
        const previous = engine.personajes[previousId];
        const previousContainer = previous ? getEntityContainer(engine, previous) : null;
        if (previousContainer) syncHoverOutline(previousContainer, null);
    }
    engine.hoveredEntityId = nextId;
    // La barra de vida de los NPC también se muestra al pasar el mouse: redibujar al entrar y salir.
    if (previousId !== nextId) {
        if (previousId !== null && engine.personajes[previousId]?.isNpc) engine.requestCharacterRerender?.(previousId);
        if (nextId !== null && next?.isNpc) engine.requestCharacterRerender?.(nextId);
    }
    if (next) {
        const container = getEntityContainer(engine, next);
        if (container) syncHoverOutline(container, HOVER_OUTLINE_COLORS[getHoverRelation(engine, next)]);
    }
}
