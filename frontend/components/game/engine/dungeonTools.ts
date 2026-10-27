import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { DungeonMotionPayload } from "../../../lib/aowProtocol";
import type { SpellData } from "../../../types/game";
import { createSpellProjectileVisual } from "../rendering/effectsRenderer";
import { getEntityFXRowContainer, syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import { GENIE_BOTTLE_OBJ, genieBottleTexture } from "./dungeonGrotto";
import { IRON_BALL_OBJ, ironBallTexture } from "./dungeonShrineBosses";
import type { Engine } from "./Engine";

// Mazmorras: el Polvo de Fuego, el Gancho y la Pulsera (server/src/dungeonTools.ts). Llegan en el mismo paquete que
// la Carrera y el salto, y acá se animan:
// - fuego: una llamarada que vuela (el mismo proyectil de los hechizos, en colores de fuego) y estalla al llegar;
// - gancho: la cadena sale hasta el blanco; si engancha, arrastra al personaje hasta ahí; si no, vuelve;
// - levanta / tira / suelta: lo que se lleva sobre la cabeza, el vuelo en arco al tirarlo y los pedazos al romperse;
// - bomba: la bomba con la mecha encendida, que titila cada vez más rápido, y la explosión de 3 × 3 baldosas;
// - escudo: el Escudo Espejo levantado delante del personaje, con un brillo que lo recorre, mientras dura;
// - polvo: una nube de chispas doradas y violetas sobre la baldosa de adelante.
// Bomba: "16-bit animated bomb" de victordelima (CC0); explosión: "Pixel Explosion (12 Frames)" de JROB774 (CC-BY 3.0),
// docs/CREDITOS_GRAFICOS.md. La flecha del Arco usa el proyectil de los arqueros (paquete createProjectile).

const TILE = 32;
const CARRY_Y = -30;
const THROW_ARC = 20;
const CHAIN_LINK_PX = 6;

const FIRE_SPELL = {
    projectileVisual: { coreColor: "#ffe08a", ringColor: "#ff8c1a", trailColor: "#ff3b00", magnitude: 1.35 },
} as unknown as SpellData;

const TOOL_TYPES = new Set(["fuego", "gancho", "levanta", "tira", "suelta", "bomba", "escudo", "polvo"]);
// El Escudo de Diamantes del juego (grh 28661), que parece un espejo.
const MIRROR_URL = "/sprites/escudo-espejo.png";

const BOMB_URL = "/sprites/bomba.png"; // 3 cuadros de 32 × 32 (la chispa de la mecha)
const EXPLOSION_URL = "/sprites/explosion.png"; // 12 cuadros de 96 × 96
const EXPLOSION_FRAME_MS = 50;
const BOMB_THROW_MS = 450;
let bombTextures: { bomb: Texture[]; explosion: Texture[] } | null = null;
let bombTexturesLoading: Promise<void> | null = null;

function frames(base: Texture, size: number, count: number) {
    return Array.from({ length: count }, (_, i) => new Texture({ source: base.source, frame: new Rectangle(i * size, 0, size, size) }));
}

function loadBombTextures() {
    bombTexturesLoading ??= Promise.all([Assets.load(BOMB_URL), Assets.load(EXPLOSION_URL)])
        .then(([bomb, explosion]: Texture[]) => {
            bombTextures = { bomb: frames(bomb, 32, 3), explosion: frames(explosion, 96, 12) };
        })
        .catch(() => {
            bombTexturesLoading = null;
        });
    return bombTexturesLoading;
}

export function isDungeonToolMotion(payload: DungeonMotionPayload): boolean {
    return TOOL_TYPES.has(payload.tipo);
}

function containerOf(engine: Engine, id: number): Container | null {
    if (engine.user?.id === id) return engine.playerContainer ?? null;
    return engine.remoteEntities.get(id) ?? null;
}

// Centro de una baldosa del mapa del personaje, en coordenadas del mundo.
function tileCenter(engine: Engine, id: number, tile: { x: number; y: number }) {
    const map = engine.personajes[id]?.map ?? engine.mapNumber;
    return { x: engine.tileToWorldX(tile.x, map) + TILE / 2, y: engine.tileToWorldY(tile.y, map) + TILE / 2 };
}

// Centro del personaje tal como se ve (con el paso a medio camino).
function characterCenter(engine: Engine, id: number) {
    const container = containerOf(engine, id);
    if (container) return { x: container.x + TILE / 2, y: container.y + TILE / 2 };
    const entity = engine.personajes[id];
    return entity ? tileCenter(engine, id, entity.pos) : null;
}

// Chispas o pedazos que salen de un punto y se desvanecen.
function burst(engine: Engine, at: { x: number; y: number }, colors: number[], count: number, speed: number) {
    for (let i = 0; i < count; i++) {
        const piece = new Graphics();
        const size = 1.5 + Math.random() * 2.5;
        piece.rect(-size / 2, -size / 2, size, size).fill({ color: colors[i % colors.length], alpha: 0.95 });
        piece.x = at.x;
        piece.y = at.y;
        syncDisplayObjectToEntityFXRow(engine, at.y, piece);
        const angle = Math.random() * Math.PI * 2;
        const velocity = speed * (0.5 + Math.random());
        engine.dungeonParticles.push({
            node: piece,
            born: engine.timestamp(),
            life: 280 + Math.random() * 220,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 0.03,
            grow: 0,
            x0: piece.x,
            y0: piece.y,
            alpha0: 1,
        });
    }
}

function textureOfObject(engine: Engine, objIndex: number) {
    const grh = engine.objectsDB?.[String(objIndex)]?.grhIndex;
    return grh ? (engine.textureCache.get(String(grh)) ?? null) : null;
}

// Lo que se lleva: la textura del objeto o, si todavía no está cargada, una vasija dibujada.
function carriedNode(engine: Engine, objIndex: number): Container {
    const texture =
        textureOfObject(engine, objIndex) ??
        (objIndex === GENIE_BOTTLE_OBJ ? genieBottleTexture() : objIndex === IRON_BALL_OBJ ? ironBallTexture() : null);
    if (texture) {
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5, 1);
        sprite.label = String(objIndex);
        return sprite;
    }
    const fallback = new Graphics();
    fallback.label = String(objIndex);
    fallback.ellipse(0, -11, 11, 11).fill({ color: 0x9a5b2e }).stroke({ color: 0x4a2a12, width: 1.5 });
    return fallback;
}

function dropCarried(engine: Engine, id: number, breakAt: { x: number; y: number } | null) {
    const node = engine.dungeonCarried.get(id);
    if (!node) return;
    engine.dungeonCarried.delete(id);
    node.destroy({ children: true });
    if (breakAt) burst(engine, breakAt, [0x9a5b2e, 0x6b3a1c, 0xc98a52], 10, 0.09);
}

function playFire(engine: Engine, payload: DungeonMotionPayload) {
    const from = characterCenter(engine, payload.id);
    if (!from || !payload.to) return;
    const to = tileCenter(engine, payload.id, payload.to);
    const distance = Math.max(1, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / TILE));
    const durationMs = distance * payload.ms;
    const rotation = Math.atan2(to.y - from.y, to.x - from.x);
    const overlay = engine.entityFXOverlayContainer;
    if (!overlay) return;
    const { container, updateVisual, cleanupVisual } = createSpellProjectileVisual(
        (worldY) => getEntityFXRowContainer(engine, Math.floor(worldY / TILE) + 1) ?? overlay,
        rotation,
        FIRE_SPELL,
    );
    container.x = Math.round(from.x);
    container.y = Math.round(from.y);
    (getEntityFXRowContainer(engine, Math.floor(from.y / TILE) + 1) ?? overlay).addChild(container);
    const projectileId = engine.nextProjectileVisualId++;
    engine.projectileVisuals.set(projectileId, {
        id: projectileId,
        sprite: container,
        startedAt: performance.now(),
        durationMs,
        startWorldX: from.x,
        startWorldY: from.y,
        endWorldX: to.x,
        endWorldY: to.y,
        updateVisual,
        cleanupVisual,
    });
    window.setTimeout(() => burst(engine, to, [0xffe08a, 0xff8c1a, 0xff3b00], 14, 0.1), durationMs);
}

// Un paso del arrastre del Gancho: se desliza hacia la baldosa sin girar.
function stepPull(engine: Engine, id: number, tile: { x: number; y: number }, ms: number) {
    const entity = engine.personajes[id];
    if (!entity) return;
    const dx = tile.x - entity.pos.x;
    const dy = tile.y - entity.pos.y;
    entity.pos.x = tile.x;
    entity.pos.y = tile.y;
    entity.pixelX = tile.x;
    entity.pixelY = tile.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) engine.startCharacterMovement(entity, dx, dy, { durationMs: ms });
    else engine.snapCharacter(id, tile.x, tile.y);
    if (engine.user?.id === id) engine.onPlayerPositionChange?.({ x: tile.x, y: tile.y });
}

function playHook(engine: Engine, payload: DungeonMotionPayload) {
    const start = characterCenter(engine, payload.id);
    if (!start || !payload.to) return;
    const isSelf = engine.user?.id === payload.id;
    const target = tileCenter(engine, payload.id, payload.to);
    const reach = Math.max(1, Math.round(Math.hypot(target.x - start.x, target.y - start.y) / TILE));
    const extendMs = reach * payload.ms;
    const path = payload.path ?? [];
    const pullMs = payload.pullMs ?? payload.ms;
    const hooked = payload.golpe === "engancha" && path.length > 0;
    const backMs = hooked ? path.length * pullMs : extendMs;
    const startedAt = engine.timestamp();
    if (isSelf) engine.dungeonMotionUntil = startedAt + extendMs + backMs + 120;
    const chain = new Graphics();
    syncDisplayObjectToEntityFXRow(engine, start.y, chain);
    if (hooked) {
        path.forEach((tile, index) => window.setTimeout(() => stepPull(engine, payload.id, tile, pullMs), extendMs + index * pullMs));
    }
    if (payload.golpe === "criatura" || payload.golpe === "engancha") {
        window.setTimeout(() => burst(engine, target, [0xd9d9d9, 0x8c8c8c], 6, 0.06), extendMs);
    }
    if (isSelf) window.setTimeout(() => engine.resumeMovementInput(), extendMs + backMs + 140);
    const dir = { x: Math.sign(target.x - start.x), y: Math.sign(target.y - start.y) };
    engine.dungeonToolEffects.push((now) => {
        const elapsed = now - startedAt;
        const from = characterCenter(engine, payload.id);
        if (!from || elapsed >= extendMs + backMs || chain.destroyed) {
            chain.destroy();
            return false;
        }
        // La punta: va hasta el blanco; después queda ahí (si engancha) o vuelve a la mano.
        let tip = target;
        if (elapsed < extendMs) {
            const t = elapsed / extendMs;
            tip = { x: start.x + (target.x - start.x) * t, y: start.y + (target.y - start.y) * t };
        } else if (!hooked) {
            const t = (elapsed - extendMs) / backMs;
            tip = { x: target.x + (from.x - target.x) * t, y: target.y + (from.y - target.y) * t };
        }
        chain.clear();
        const length = Math.hypot(tip.x - from.x, tip.y - from.y);
        for (let d = CHAIN_LINK_PX; d < length; d += CHAIN_LINK_PX) {
            const k = d / length;
            chain.circle(from.x + (tip.x - from.x) * k, from.y + (tip.y - from.y) * k, 1.8).fill({ color: 0xa6a6a6 }).stroke({ color: 0x3d3d3d, width: 0.8 });
        }
        // La garra del gancho, apuntando hacia adonde va.
        const side = { x: -dir.y, y: dir.x };
        chain
            .poly([
                tip.x + dir.x * 6, tip.y + dir.y * 6,
                tip.x + side.x * 5 - dir.x * 2, tip.y + side.y * 5 - dir.y * 2,
                tip.x - side.x * 5 - dir.x * 2, tip.y - side.y * 5 - dir.y * 2,
            ])
            .fill({ color: 0xcfcfcf })
            .stroke({ color: 0x2b2b2b, width: 1 });
        syncDisplayObjectToEntityFXRow(engine, Math.max(from.y, tip.y), chain);
        return true;
    });
}

function playLift(engine: Engine, payload: DungeonMotionPayload) {
    if (!payload.obj) return;
    dropCarried(engine, payload.id, null);
    const node = carriedNode(engine, payload.obj);
    engine.dungeonCarried.set(payload.id, node);
    syncCarried(engine);
}

function playThrow(engine: Engine, payload: DungeonMotionPayload) {
    const from = characterCenter(engine, payload.id);
    dropCarried(engine, payload.id, null);
    if (!from || !payload.to || !payload.obj) return;
    const to = tileCenter(engine, payload.id, payload.to);
    const distance = Math.max(1, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / TILE));
    const durationMs = distance * payload.ms;
    const flying = carriedNode(engine, payload.obj);
    const startY = from.y + CARRY_Y;
    const startedAt = engine.timestamp();
    syncDisplayObjectToEntityFXRow(engine, from.y, flying);
    engine.dungeonToolEffects.push((now) => {
        const t = Math.min(1, (now - startedAt) / durationMs);
        if (flying.destroyed) return false;
        flying.x = from.x + (to.x - from.x) * t;
        // Arco: sale de arriba de la cabeza y cae en la baldosa.
        flying.y = startY + (to.y + TILE / 2 - startY) * t - Math.sin(Math.PI * t) * THROW_ARC;
        flying.rotation = t * 0.6 * (to.x >= from.x ? 1 : -1);
        syncDisplayObjectToEntityFXRow(engine, flying.y, flying);
        if (t < 1) return true;
        flying.destroy({ children: true });
        // La botella del Genio cae entera si no le pegó a una pared (el server la vuelve a mostrar en el piso).
        if (!payload.entera) burst(engine, to, [0x9a5b2e, 0x6b3a1c, 0xc98a52], 12, 0.1);
        return false;
    });
}

// Lo que se lleva va arriba de la cabeza: se vuelve a enganchar si el personaje se redibujó.
function syncCarried(engine: Engine) {
    for (const [id, node] of engine.dungeonCarried) {
        const container = containerOf(engine, id);
        if (!container || node.destroyed) {
            if (!engine.personajes[id]) engine.dungeonCarried.delete(id);
            continue;
        }
        if (node.parent !== container) container.addChild(node);
        node.x = TILE / 2;
        node.y = CARRY_Y + TILE / 2;
    }
}

// Las bombas en el piso, por baldosa: una Serpiente Glotona se la puede tragar antes de que explote.
const bombsOnFloor = new Map<string, { eaten: boolean }>();

async function playBomb(engine: Engine, payload: DungeonMotionPayload) {
    if (!payload.to) return;
    const key = `${payload.to.x},${payload.to.y}`;
    if (payload.comida) {
        const eaten = bombsOnFloor.get(key);
        if (eaten) eaten.eaten = true;
        return;
    }
    const fuse = { eaten: false };
    bombsOnFloor.set(key, fuse);
    const startedAt = engine.timestamp();
    await loadBombTextures();
    const at = tileCenter(engine, payload.id, payload.to);
    // La que tira el Cíclope vuela en arco desde él antes de quedar en el piso.
    const thrownFrom = payload.from ? tileCenter(engine, payload.id, payload.from) : null;
    const textures = bombTextures;
    const bomb: Container = textures ? new Sprite(textures.bomb[0]) : new Graphics().circle(0, 0, 10).fill({ color: 0x1b1b1b });
    if (bomb instanceof Sprite) bomb.anchor.set(0.5);
    bomb.x = at.x;
    bomb.y = at.y + 4;
    syncDisplayObjectToEntityFXRow(engine, at.y, bomb);
    let explosion: Sprite | null = null;
    engine.dungeonToolEffects.push((now) => {
        const elapsed = now - startedAt;
        if (fuse.eaten) {
            bomb.destroy();
            if (bombsOnFloor.get(key) === fuse) bombsOnFloor.delete(key);
            return false;
        }
        if (elapsed < payload.ms) {
            if (bomb.destroyed) return false;
            if (thrownFrom) {
                const t = Math.min(1, elapsed / BOMB_THROW_MS);
                bomb.x = thrownFrom.x + (at.x - thrownFrom.x) * t;
                bomb.y = thrownFrom.y + (at.y + 4 - thrownFrom.y) * t - Math.sin(Math.PI * t) * 30;
                syncDisplayObjectToEntityFXRow(engine, Math.max(bomb.y, at.y), bomb);
            }
            if (bomb instanceof Sprite && textures) bomb.texture = textures.bomb[Math.floor(elapsed / 120) % 3];
            // Titila cada vez más rápido y se infla un poco antes de explotar.
            const left = payload.ms - elapsed;
            const blink = left < 700 ? Math.floor(elapsed / (left < 300 ? 60 : 120)) % 2 === 0 : false;
            bomb.tint = blink ? 0xff5a3c : 0xffffff;
            bomb.scale.set(1 + Math.max(0, 1 - left / 700) * 0.25);
            return true;
        }
        if (!bomb.destroyed) {
            bomb.destroy();
            if (bombsOnFloor.get(key) === fuse) bombsOnFloor.delete(key);
            burst(engine, at, [0xffe08a, 0xff8c1a, 0x6b6b6b], 18, 0.14);
            if (textures) {
                explosion = new Sprite(textures.explosion[0]);
                explosion.anchor.set(0.5);
                explosion.x = at.x;
                explosion.y = at.y;
                syncDisplayObjectToEntityFXRow(engine, at.y + TILE, explosion);
            }
        }
        const frame = Math.floor((elapsed - payload.ms) / EXPLOSION_FRAME_MS);
        if (!explosion || explosion.destroyed || !textures || frame >= textures.explosion.length) {
            explosion?.destroy();
            return false;
        }
        explosion.texture = textures.explosion[frame];
        return true;
    });
}

// Delante del personaje según adonde mira (en el contenedor del personaje, que arranca arriba a la izquierda de su
// baldosa): adelante, a un costado o un poco más arriba que el cuerpo.
// Orientaciones del juego: 1 arriba, 2 abajo, 3 derecha, 4 izquierda.
const MIRROR_OFFSET: Record<number, { x: number; y: number; behind: boolean }> = {
    1: { x: 16, y: -14, behind: true },
    2: { x: 16, y: 14, behind: false },
    3: { x: 30, y: 6, behind: false },
    4: { x: 2, y: 6, behind: false },
};

async function playMirror(engine: Engine, payload: DungeonMotionPayload) {
    const startedAt = engine.timestamp();
    const texture = await Assets.load(MIRROR_URL).catch(() => null);
    const shield: Container = texture ? new Sprite(texture as Texture) : new Graphics().roundRect(-8, -10, 16, 20, 4).fill({ color: 0xcfe8ff });
    if (shield instanceof Sprite) shield.anchor.set(0.5);
    const shine = new Graphics();
    engine.dungeonToolEffects.push((now) => {
        const elapsed = now - startedAt;
        const container = containerOf(engine, payload.id);
        const entity = engine.personajes[payload.id];
        if (elapsed >= payload.ms || !container || !entity || shield.destroyed) {
            shield.destroy();
            shine.destroy();
            return false;
        }
        const offset = MIRROR_OFFSET[entity.heading] ?? MIRROR_OFFSET[2];
        if (shield.parent !== container) container.addChild(shield, shine);
        // Mirando hacia arriba, el escudo queda detrás del cuerpo.
        container.setChildIndex(shield, offset.behind ? 0 : container.children.length - 1);
        shield.x = offset.x;
        shield.y = offset.y;
        shield.alpha = elapsed > payload.ms - 300 ? (payload.ms - elapsed) / 300 : 1;
        // Un brillo que cruza el escudo cada medio segundo.
        const t = (elapsed % 500) / 500;
        shine.clear();
        shine.rect(-1.5, -9, 3, 18).fill({ color: 0xffffff, alpha: 0.55 * Math.sin(Math.PI * t) });
        shine.x = offset.x - 7 + t * 14;
        shine.y = offset.y;
        shine.rotation = 0.35;
        if (container.getChildIndex(shine) < container.getChildIndex(shield)) container.setChildIndex(shine, container.getChildIndex(shield));
        return true;
    });
}

// El polvo mágico: sale de la mano y cae como una nube de chispas en la baldosa de adelante.
function playPowder(engine: Engine, payload: DungeonMotionPayload) {
    if (!payload.to) return;
    const from = characterCenter(engine, payload.id);
    const at = tileCenter(engine, payload.id, payload.to);
    if (from) burst(engine, { x: (from.x + at.x) / 2, y: (from.y + at.y) / 2 }, [0xfff3b0, 0xd7a6ff], 6, 0.04);
    burst(engine, at, [0xffe066, 0xfff3b0, 0xc77dff, 0xffffff], 18, 0.06);
}

export function playDungeonTool(engine: Engine, payload: DungeonMotionPayload) {
    if (payload.tipo === "fuego") return playFire(engine, payload);
    if (payload.tipo === "gancho") return playHook(engine, payload);
    if (payload.tipo === "levanta") return playLift(engine, payload);
    if (payload.tipo === "tira") return playThrow(engine, payload);
    if (payload.tipo === "bomba") return void playBomb(engine, payload);
    if (payload.tipo === "escudo") return void playMirror(engine, payload);
    if (payload.tipo === "polvo") return playPowder(engine, payload);
    if (payload.tipo === "suelta") {
        // La botella del Genio y la bola del Machacador caen enteras (el server las vuelve a mostrar en el piso).
        const obj = Number(engine.dungeonCarried.get(payload.id)?.label);
        const whole = obj === GENIE_BOTTLE_OBJ || obj === IRON_BALL_OBJ;
        dropCarried(engine, payload.id, whole ? null : characterCenter(engine, payload.id));
    }
}

export function updateDungeonTools(engine: Engine, now: number) {
    if (engine.dungeonToolEffects.length) engine.dungeonToolEffects = engine.dungeonToolEffects.filter((effect) => effect(now));
    if (engine.dungeonCarried.size) syncCarried(engine);
}

// Al cambiar de mapa o salir del juego: no queda nada colgando.
export function clearDungeonTools(engine: Engine) {
    for (const node of engine.dungeonCarried.values()) node.destroy({ children: true });
    engine.dungeonCarried.clear();
    engine.dungeonToolEffects = [];
}
