import { Assets, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// Lo que se ve aparte en las Fauces del Bagre (server/src/dungeonMaw.ts):
// - los esqueletos saltan en arco (el server ya los movió: acá solo se levanta el dibujo);
// - el hueso que tiran vuela girando;
// - el pez sale del agua, da un salto y vuelve a meterse;
// - la máscara que el Gancho le arranca a la Máscara de Hierro sale volando y cae (el cuerpo sin máscara lo manda el
//   server).
// Sprites (docs/CREDITOS_GRAFICOS.md): el hueso (graphics/330030.png), el pez de "Swimming Fish" de Mepavi
// (330033.png: sube, arriba, baja y salpicón) y la máscara del orco enmascarado de DungeonTileset II de 0x72 (330036.png).

const BONE_URL = "/graphics/330030.png";
const FISH_URL = "/graphics/330033.png";
const MASK_URL = "/graphics/330036.png";
const TILE = 32;
const LEAP_HEIGHT = 30;
const FISH_HEIGHT = 34;
const MASK_MS = 900;

type Effect = (now: number) => boolean;

const effects: Effect[] = [];
// Las criaturas que están saltando: hasta cuándo y cómo.
const leaps = new Map<number, { start: number; ms: number }>();
let textures: { bone: Texture; fish: Texture[]; mask: Texture } | null = null;
let loading = false;

function loadTextures() {
    if (textures || loading) return;
    loading = true;
    Assets.load([BONE_URL, FISH_URL, MASK_URL])
        .then((loaded: Record<string, Texture>) => {
            const fish = loaded[FISH_URL];
            textures = {
                bone: loaded[BONE_URL],
                fish: [0, 1, 2, 3].map((i) => new Texture({ source: fish.source, frame: new Rectangle(i * 40, 0, 40, 44) })),
                mask: loaded[MASK_URL],
            };
        })
        .catch(() => {
            loading = false;
        });
}

const centerOf = (engine: Engine, map: number, tile: { x: number; y: number }) => ({
    x: engine.tileToWorldX(tile.x, map) + TILE / 2,
    y: engine.tileToWorldY(tile.y, map) + TILE / 2,
});

export function handleMawEffect(engine: Engine, payload: DungeonBossPayload) {
    loadTextures();
    const now = engine.timestamp();
    if (payload.tipo === "salto") {
        leaps.set(payload.id, { start: now, ms: Math.max(1, payload.ms ?? 400) });
        return;
    }
    if (payload.tipo === "hueso") return bone(engine, payload);
    if (payload.tipo === "pez") return fish(engine, payload);
    if (payload.tipo === "mascara" && payload.puesta === false) mask(engine, payload);
}

// La máscara arrancada: sale para arriba girando y cae al lado.
function mask(engine: Engine, payload: DungeonBossPayload) {
    if (!textures) return;
    const map = engine.mapNumber;
    const at = centerOf(engine, map, { x: payload.x ?? 0, y: payload.y ?? 0 });
    const start = engine.timestamp();
    const node = new Sprite(textures.mask);
    node.anchor.set(0.5);
    const side = Math.random() < 0.5 ? -1 : 1;
    effects.push((now) => {
        const t = (now - start) / MASK_MS;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.x = at.x + side * 22 * t;
        node.y = at.y - 18 - Math.sin(Math.PI * t) * 26 + t * 18;
        node.rotation = side * t * 7;
        node.alpha = t > 0.8 ? (1 - t) / 0.2 : 1;
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
        return true;
    });
}

// Un hueso que gira mientras vuela en línea recta.
function bone(engine: Engine, payload: DungeonBossPayload) {
    if (!payload.desde || !payload.hasta) return;
    const map = engine.mapNumber;
    const from = centerOf(engine, map, payload.desde);
    const to = centerOf(engine, map, payload.hasta);
    const ms = Math.max(1, payload.ms ?? 300);
    const start = engine.timestamp();
    const node: Sprite | Graphics = textures
        ? new Sprite(textures.bone)
        : new Graphics().roundRect(-7, -1.8, 14, 3.6, 1.8).fill({ color: 0xece4cf });
    if (node instanceof Sprite) node.anchor.set(0.5);
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.x = from.x + (to.x - from.x) * t;
        node.y = from.y + (to.y - from.y) * t - 10;
        node.rotation = t * 14;
        syncDisplayObjectToEntityFXRow(engine, node.y + TILE, node);
        return true;
    });
}

// El pez: sale del agua, sube, gira en lo alto y vuelve a caer en el mismo hueco, con unas gotas.
function fish(engine: Engine, payload: DungeonBossPayload) {
    const map = engine.mapNumber;
    const at = centerOf(engine, map, { x: payload.x ?? 0, y: payload.y ?? 0 });
    const ms = Math.max(1, payload.ms ?? 800);
    const start = engine.timestamp();
    const frames = textures?.fish;
    const node: Sprite | Graphics = frames ? new Sprite(frames[0]) : new Graphics().ellipse(0, 0, 9, 5.5).fill({ color: 0xe8573a });
    if (node instanceof Sprite) node.anchor.set(0.5, 0.7);
    const splash = new Graphics();
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            splash.destroy();
            return false;
        }
        node.x = at.x;
        node.y = at.y + 6 - Math.sin(Math.PI * t) * FISH_HEIGHT;
        // Sube, en lo alto y baja (los cuadros del sprite ya traen la inclinación).
        if (node instanceof Sprite && frames) node.texture = frames[t < 0.35 ? 0 : t < 0.65 ? 1 : 2];
        else node.rotation = -Math.PI / 2 + t * Math.PI;
        splash.clear();
        // Gotas al salir y al entrar.
        const near = t < 0.2 ? 1 - t / 0.2 : t > 0.8 ? (t - 0.8) / 0.2 : 0;
        if (near > 0) {
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI - Math.PI;
                splash.circle(at.x + Math.cos(angle) * 10 * (1.2 - near), at.y + 8 + Math.sin(angle) * 6 * (1.2 - near), 1.6).fill({ color: 0xd8f0ff, alpha: near });
            }
        }
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2, splash);
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2, node);
        return true;
    });
}

export function updateDungeonMaw(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    for (const [id, leap] of leaps) {
        const entity = engine.remoteEntities.get(id);
        const t = (now - leap.start) / leap.ms;
        if (!entity || t >= 1) {
            if (entity) entity.pivot.y = 0;
            leaps.delete(id);
            continue;
        }
        entity.pivot.y = Math.sin(Math.PI * t) * LEAP_HEIGHT;
    }
}
