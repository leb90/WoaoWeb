import { Container, Graphics, Sprite, Text } from "pixi.js";
import type { DungeonMotionPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Character, Engine } from "./Engine";

// Mazmorras: la Carrera de las Botas de Pegaso y el salto de la Pluma (server/src/dungeonMotion.ts). El server manda
// el movimiento entero y acá se anima como en Zelda:
// - carga: el personaje patalea en el lugar (las piernas al doble) y levanta polvo;
// - carrera: corre en línea recta, con una estela del personaje que se desvanece y polvo en cada baldosa;
// - salto: arco con la sombra en el piso; al caer, polvo;
// - choque: un sacudón corto.

const TILE = 32;
const JUMP_BASE_HEIGHT = 22;
const JUMP_HEIGHT_PER_TILE = 6;
const BUMP_MS = 260;

// vx, vy: píxeles por ms. grow: escala que suma por ms.
export type DungeonParticle = {
    node: Container;
    born: number;
    life: number;
    vx: number;
    vy: number;
    grow: number;
    x0: number;
    y0: number;
    alpha0: number;
};

export type DungeonMotionCharacter = Character & {
    dungeonChargeUntil?: number;
    dungeonJump?: { startedAt: number; durationMs: number; height: number };
    dungeonShadow?: Graphics;
    dungeonBumpUntil?: number;
};

function containerOf(engine: Engine, id: number): Container | null {
    if (engine.user?.id === id) return engine.playerContainer ?? null;
    return engine.remoteEntities.get(id) ?? null;
}

function addParticle(engine: Engine, node: Container, worldY: number, particle: { life: number; vx: number; vy: number; grow: number }) {
    syncDisplayObjectToEntityFXRow(engine, worldY, node);
    engine.dungeonParticles.push({ node, born: engine.timestamp(), x0: node.x, y0: node.y, alpha0: node.alpha, ...particle });
}

// Polvo en los pies del personaje.
export function spawnDust(engine: Engine, id: number, count: number) {
    const container = containerOf(engine, id);
    if (!container) return;
    const feetX = container.x + TILE / 2;
    const feetY = container.y + TILE - 4;
    for (let i = 0; i < count; i++) {
        const puff = new Graphics();
        const radius = 2.5 + Math.random() * 2.5;
        puff.circle(0, 0, radius).fill({ color: 0xd8cdb4, alpha: 0.75 });
        puff.x = feetX + (Math.random() - 0.5) * 18;
        puff.y = feetY + (Math.random() - 0.5) * 6;
        addParticle(engine, puff, puff.y, {
            life: 380 + Math.random() * 160,
            vx: (Math.random() - 0.5) * 0.03,
            vy: -0.02 - Math.random() * 0.02,
            grow: 0.0025,
        });
    }
}

// Copia del personaje que queda atrás y se desvanece.
function spawnAfterimage(engine: Engine, id: number) {
    const container = containerOf(engine, id);
    if (!container) return;
    const ghost = new Container();
    ghost.x = container.x;
    ghost.y = container.y;
    for (const child of container.children) {
        if (!(child instanceof Sprite) || child instanceof Text || !child.visible || !child.texture) continue;
        const copy = new Sprite(child.texture);
        copy.anchor.set(child.anchor.x, child.anchor.y);
        copy.x = child.x;
        copy.y = child.y;
        copy.scale.set(child.scale.x, child.scale.y);
        ghost.addChild(copy);
    }
    if (!ghost.children.length) {
        ghost.destroy();
        return;
    }
    ghost.alpha = 0.45;
    ghost.tint = 0xbfd8ff;
    addParticle(engine, ghost, ghost.y + TILE - 1, { life: 240, vx: 0, vy: 0, grow: 0 });
}

function stepDash(engine: Engine, id: number, tile: { x: number; y: number }, heading: number, ms: number) {
    const entity = engine.personajes[id];
    if (!entity) return;
    spawnAfterimage(engine, id);
    spawnDust(engine, id, 1);
    const dx = tile.x - entity.pos.x;
    const dy = tile.y - entity.pos.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) {
        engine.snapCharacter(id, tile.x, tile.y, heading);
        return;
    }
    if (engine.user?.id === id) engine.moveCharByHead(id, heading, true, { durationMs: ms });
    else engine.moveCharByPos(id, tile.x, tile.y, { heading, durationMs: ms });
}

function startJump(engine: Engine, id: number, to: { x: number; y: number }, ms: number) {
    const entity = engine.personajes[id] as DungeonMotionCharacter | undefined;
    if (!entity) return;
    const dx = to.x - entity.pos.x;
    const dy = to.y - entity.pos.y;
    const now = engine.timestamp();
    spawnDust(engine, id, 3);
    entity.dungeonJump = {
        startedAt: now,
        durationMs: ms,
        height: JUMP_BASE_HEIGHT + JUMP_HEIGHT_PER_TILE * Math.max(Math.abs(dx), Math.abs(dy)),
    };
    entity.pos.x = to.x;
    entity.pos.y = to.y;
    entity.pixelX = to.x;
    entity.pixelY = to.y;
    engine.startCharacterMovement(entity, dx, dy, { durationMs: ms });
    if (engine.user?.id === id) engine.onPlayerPositionChange?.({ x: to.x, y: to.y });
    const container = containerOf(engine, id);
    if (container && !entity.dungeonShadow) {
        const shadow = new Graphics();
        shadow.ellipse(0, 0, 11, 4).fill({ color: 0x000000, alpha: 0.35 });
        shadow.x = TILE / 2;
        shadow.y = TILE - 2;
        container.addChildAt(shadow, 0);
        entity.dungeonShadow = shadow;
    }
    window.setTimeout(() => spawnDust(engine, id, 4), ms);
}

function bump(engine: Engine, id: number) {
    const entity = engine.personajes[id] as DungeonMotionCharacter | undefined;
    if (!entity) return;
    entity.dungeonBumpUntil = engine.timestamp() + BUMP_MS;
    spawnDust(engine, id, 5);
}

export function playDungeonMotion(engine: Engine, payload: DungeonMotionPayload) {
    const entity = engine.personajes[payload.id] as DungeonMotionCharacter | undefined;
    if (!entity) return;
    const isSelf = engine.user?.id === entity.id;
    const now = engine.timestamp();
    if (typeof payload.heading === "number" && entity.heading !== payload.heading) {
        entity.heading = payload.heading;
        engine.requestCharacterRerender?.(entity.id);
    }

    if (payload.tipo === "carga") {
        entity.dungeonChargeUntil = now + payload.ms;
        entity.bodyAnimationStartedAt = now;
        if (isSelf) engine.dungeonMotionUntil = Math.max(engine.dungeonMotionUntil, now + payload.ms + 120);
        for (let t = 0; t < payload.ms; t += 110) window.setTimeout(() => spawnDust(engine, entity.id, 2), t);
        return;
    }

    if (payload.tipo === "carrera") {
        const path = payload.path ?? [];
        const dashMs = path.length * payload.ms;
        const total = dashMs + (payload.salto ? payload.salto.ms : 0);
        entity.dungeonChargeUntil = 0;
        if (isSelf) engine.dungeonMotionUntil = now + total + 120;
        const heading = payload.heading ?? entity.heading;
        path.forEach((tile, index) => window.setTimeout(() => stepDash(engine, entity.id, tile, heading, payload.ms), index * payload.ms));
        window.setTimeout(() => {
            if (payload.salto) startJump(engine, entity.id, payload.salto.to, payload.salto.ms);
            else if (payload.golpe) bump(engine, entity.id);
        }, dashMs);
        if (isSelf) window.setTimeout(() => engine.resumeMovementInput(), total + 140);
        return;
    }

    if (payload.tipo === "salto" && payload.to) {
        if (isSelf) engine.dungeonMotionUntil = now + payload.ms + 120;
        startJump(engine, entity.id, payload.to, payload.ms);
        if (isSelf) window.setTimeout(() => engine.resumeMovementInput(), payload.ms + 140);
    }
}

// Cuánto se eleva el personaje en el aire (el arco del salto), en píxeles.
export function getDungeonLift(engine: Engine, character: Character, now: number): number {
    const entity = character as DungeonMotionCharacter;
    const jump = entity.dungeonJump;
    if (!jump) return 0;
    const t = (now - jump.startedAt) / jump.durationMs;
    if (t >= 1) {
        entity.dungeonJump = undefined;
        if (entity.dungeonShadow) {
            entity.dungeonShadow.destroy();
            entity.dungeonShadow = undefined;
        }
        return 0;
    }
    const lift = Math.sin(Math.PI * Math.max(0, t)) * jump.height;
    // La sombra queda en el piso: baja lo que sube el personaje, y se achica en lo alto.
    if (entity.dungeonShadow) {
        entity.dungeonShadow.y = TILE - 2 + lift;
        entity.dungeonShadow.scale.set(1 - (lift / jump.height) * 0.35);
    }
    void engine;
    return lift;
}

// Sacudón horizontal al chocar.
export function getDungeonShake(character: Character, now: number): number {
    const until = (character as DungeonMotionCharacter).dungeonBumpUntil ?? 0;
    if (until <= now) return 0;
    return Math.round(Math.sin(now / 18) * 3);
}

export function isDungeonCharging(character: Character, now: number): boolean {
    return ((character as DungeonMotionCharacter).dungeonChargeUntil ?? 0) > now;
}

// Avanza y borra las partículas (polvo y estela).
export function updateDungeonParticles(engine: Engine, now: number) {
    if (!engine.dungeonParticles.length) return;
    engine.dungeonParticles = engine.dungeonParticles.filter((particle) => {
        const age = now - particle.born;
        if (age >= particle.life || particle.node.destroyed) {
            if (!particle.node.destroyed) particle.node.destroy({ children: true });
            return false;
        }
        const progress = age / particle.life;
        particle.node.x = particle.x0 + particle.vx * age;
        particle.node.y = particle.y0 + particle.vy * age;
        particle.node.alpha = particle.alpha0 * (1 - progress);
        if (particle.grow) particle.node.scale.set(1 + age * particle.grow);
        return true;
    });
}
