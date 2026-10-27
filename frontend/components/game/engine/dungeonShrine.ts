import { Assets, Graphics, Sprite, Texture } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// Lo que se ve aparte en el Santuario del Rostro (server/src/dungeonShrine.ts):
// - las criaturas escondidas (los hechiceros entre apariciones, los mocos hasta que alguien se acerca) no se dibujan;
// - las baldosas voladoras suben de su lugar, flotan temblando y salen derecho hacia donde estaba el jugador;
// - el rayo del ojo de piedra: primero un aviso fino y después el rayo.
// Las bolas de fuego de los lanzallamas y de los hechiceros son las del Genio (engine/dungeonGrotto.ts).

const TILE_URL = "/graphics/330015.png";
const TILE = 32;
const RISE_PX = 18;

type Effect = (now: number) => boolean;

// Las criaturas escondidas: el server avisa cuándo se esconden y cuándo aparecen.
const hidden = new Set<number>();
const effects: Effect[] = [];
let tileTexture: Texture | null = null;
let loading = false;

function loadTexture() {
    if (tileTexture || loading) return;
    loading = true;
    Assets.load(TILE_URL)
        .then((texture: Texture) => {
            tileTexture = texture;
        })
        .catch(() => {
            loading = false;
        });
}

const centerOf = (engine: Engine, map: number, tile: { x: number; y: number }) => ({
    x: engine.tileToWorldX(tile.x, map) + TILE / 2,
    y: engine.tileToWorldY(tile.y, map) + TILE / 2,
});

export function handleShrineEffect(engine: Engine, payload: DungeonBossPayload) {
    loadTexture();
    if (payload.tipo === "oculto") {
        if (payload.oculto) hidden.add(payload.id);
        else {
            hidden.delete(payload.id);
            const entity = engine.remoteEntities.get(payload.id);
            if (entity) entity.visible = true;
        }
        return;
    }
    if (payload.tipo === "baldosa") return flyingTile(engine, payload);
    if (payload.tipo === "rayo") return beam(engine, payload);
}

function tileNode(): Sprite | Graphics {
    if (tileTexture) {
        const sprite = new Sprite(tileTexture);
        sprite.anchor.set(0.5);
        return sprite;
    }
    return new Graphics().rect(-15, -15, 30, 30).fill({ color: 0x9a8f78 }).stroke({ color: 0x4d4536, width: 2 });
}

// La baldosa: sube y tiembla en su lugar ("sube") o vuela hasta donde estaba el jugador ("vuela").
function flyingTile(engine: Engine, payload: DungeonBossPayload) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const ms = Math.max(1, payload.ms ?? 500);
    const node = tileNode();
    const shadow = new Graphics().ellipse(0, 0, 13, 4).fill({ color: 0x000000, alpha: 0.35 });
    if (payload.fase === "sube") {
        const at = centerOf(engine, map, { x: payload.x ?? 0, y: payload.y ?? 0 });
        effects.push((now) => {
            const t = (now - start) / ms;
            if (t >= 1 || engine.mapNumber !== map) {
                node.destroy();
                shadow.destroy();
                return false;
            }
            const lift = Math.min(1, t * 1.6) * RISE_PX;
            node.x = at.x + (t > 0.6 ? Math.sin(now / 25) * 2 : 0);
            node.y = at.y - lift;
            shadow.x = at.x;
            shadow.y = at.y + 8;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2 - 1, shadow);
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2, node);
            return true;
        });
        return;
    }
    if (!payload.desde || !payload.hasta) return;
    const from = centerOf(engine, map, payload.desde);
    const to = centerOf(engine, map, payload.hasta);
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            shadow.destroy();
            if (t >= 1) shards(engine, to);
            return false;
        }
        const ground = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
        node.x = ground.x;
        node.y = ground.y - RISE_PX;
        node.rotation = t * 6;
        shadow.x = ground.x;
        shadow.y = ground.y + 8;
        syncDisplayObjectToEntityFXRow(engine, ground.y + TILE / 2 - 1, shadow);
        syncDisplayObjectToEntityFXRow(engine, ground.y + TILE / 2, node);
        return true;
    });
}

function shards(engine: Engine, at: { x: number; y: number }) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const bits = Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        return { g: new Graphics().rect(-3, -3, 6, 6).fill({ color: i % 2 ? 0x9a8f78 : 0x6b6252 }), vx: Math.cos(angle), vy: Math.sin(angle) };
    });
    effects.push((now) => {
        const t = (now - start) / 400;
        if (t >= 1 || engine.mapNumber !== map) {
            for (const b of bits) b.g.destroy();
            return false;
        }
        for (const b of bits) {
            b.g.x = at.x + b.vx * 18 * t;
            b.g.y = at.y - RISE_PX * (1 - t) + b.vy * 10 * t;
            b.g.rotation = t * 4;
            b.g.alpha = 1 - t;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE, b.g);
        }
        return true;
    });
}

// El rayo del ojo: el aviso es una línea fina y titilante; el rayo, una franja roja con brillo que se apaga.
function beam(engine: Engine, payload: DungeonBossPayload) {
    if (!payload.desde || !payload.hasta) return;
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const ms = Math.max(1, payload.ms ?? 250);
    const from = centerOf(engine, map, payload.desde);
    const to = centerOf(engine, map, payload.hasta);
    const line = new Graphics();
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            line.destroy();
            return false;
        }
        line.clear();
        if (payload.aviso) {
            if (Math.floor(now / 60) % 2) line.moveTo(from.x, from.y).lineTo(to.x, to.y).stroke({ color: 0xff5a5a, width: 1, alpha: 0.7 });
        } else {
            const alpha = 1 - t;
            line.moveTo(from.x, from.y).lineTo(to.x, to.y).stroke({ color: 0xff2a2a, width: 7, alpha: 0.45 * alpha });
            line.moveTo(from.x, from.y).lineTo(to.x, to.y).stroke({ color: 0xfff0f0, width: 2.5, alpha });
        }
        syncDisplayObjectToEntityFXRow(engine, Math.max(from.y, to.y) + TILE, line);
        return true;
    });
}

export function updateDungeonShrine(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    for (const id of hidden) {
        const entity = engine.remoteEntities.get(id);
        if (entity) entity.visible = false;
        else if (!engine.personajes[id]) hidden.delete(id);
    }
}
