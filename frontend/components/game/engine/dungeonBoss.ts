import { Assets, Rectangle, Sprite, Texture } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// El Ciempiés Colosal de la Cueva de la Cola (server/src/dungeonBoss.ts), que se mueve como el Moldorm de Zelda. El
// server manda unas 10 veces por segundo dónde está la cabeza, hacia dónde va y qué tan rápido; acá se interpola, se
// guarda el rastro de la cabeza y se dibujan la cabeza, dos segmentos y la cola sobre ese rastro, cada parte girada
// hacia donde avanza. La criatura de AO (nombre y barra de vida) es la cola, sin cuerpo propio.
// Sprite: "[LPC] Centipede" de FiveBrosStopMosYT (OGA-BY 3.0), docs/CREDITOS_GRAFICOS.md.

const SHEET_URL = "/sprites/ciempies.png";
const FRAME = 128;
// Cuadros de la caminata mirando hacia arriba (fila, columna).
const WALK_FRAMES: Array<[number, number]> = [
    [1, 1],
    [1, 2],
    [1, 3],
    [1, 4],
    [2, 0],
    [2, 1],
];
// Cortes de cada parte en el cuadro: la cabeza con las tenazas, dos segmentos y la cola.
const PART_X = 40;
const PART_WIDTH = 50;
const PARTS = [
    { y0: 32, y1: 60 },
    { y0: 59, y1: 81 },
    { y0: 80, y1: 101 },
    { y0: 100, y1: 120 },
];
const SCALE = 1.6;
const TILE = 32;
// Se dibuja un poco atrás en el tiempo para tener siempre dos muestras entre las que interpolar.
const DELAY_MS = 110;
const MAX_EXTRAPOLATE_MS = 150;
const LEG_FRAME_MS = 80;
const STALE_MS = 2_000;
const FADE_MS = 600;
const TRAIL_STEP_PX = 2;
const TRAIL_MAX = 400;

type Sample = { t: number; x: number; y: number; a: number; v: number };
type Point = { x: number; y: number };
type BossView = {
    id: number;
    map: number;
    samples: Sample[];
    trail: Point[];
    segments: number[];
    sprites: Sprite[];
    frame: number;
    nextFrameAt: number;
    lastSampleAt: number;
    fadeStartedAt: number | null;
};

const views = new Map<number, BossView>();
let partTextures: Texture[][] | null = null;
let loading = false;

function loadTextures() {
    if (partTextures || loading) return;
    loading = true;
    Assets.load(SHEET_URL)
        .then((base: Texture) => {
            partTextures = WALK_FRAMES.map(([row, col]) =>
                PARTS.map(
                    (part) =>
                        new Texture({
                            source: base.source,
                            frame: new Rectangle(col * FRAME + PART_X, row * FRAME + part.y0, PART_WIDTH, part.y1 - part.y0),
                        }),
                ),
            );
        })
        .catch(() => {
            loading = false;
        });
}

function destroyView(view: BossView) {
    for (const sprite of view.sprites) if (!sprite.destroyed) sprite.destroy();
    views.delete(view.id);
}

export function handleDungeonBoss(engine: Engine, payload: DungeonBossPayload) {
    loadTextures();
    const now = engine.timestamp();
    let view = views.get(payload.id);
    if (payload.fin) {
        if (view && view.fadeStartedAt === null) view.fadeStartedAt = now;
        return;
    }
    if (!view) {
        view = {
            id: payload.id,
            map: engine.mapNumber,
            samples: [],
            trail: [],
            segments: payload.s ?? [0.9, 1.8, 2.7],
            sprites: [],
            frame: 0,
            nextFrameAt: 0,
            lastSampleAt: now,
            fadeStartedAt: null,
        };
        views.set(payload.id, view);
    }
    view.lastSampleAt = now;
    if (payload.s) view.segments = payload.s;
    view.samples.push({ t: now, x: payload.x ?? 0, y: payload.y ?? 0, a: payload.a ?? 0, v: payload.v ?? 0 });
    if (view.samples.length > 12) view.samples.shift();
}

// Dónde está la cabeza a la hora `t` (en baldosas).
function headAt(view: BossView, t: number): Sample | null {
    const samples = view.samples;
    if (!samples.length) return null;
    for (let i = samples.length - 1; i > 0; i--) {
        const a = samples[i - 1];
        const b = samples[i];
        if (t >= a.t && t <= b.t) {
            const k = b.t > a.t ? (t - a.t) / (b.t - a.t) : 1;
            return { t, x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, a: b.a, v: b.v };
        }
    }
    const last = samples[samples.length - 1];
    if (t < samples[0].t) return samples[0];
    // Más allá de la última muestra: sigue un poco en la misma dirección.
    const ahead = Math.min(MAX_EXTRAPOLATE_MS, t - last.t) / 1000;
    const radians = (last.a * Math.PI) / 8;
    return { ...last, x: last.x + Math.cos(radians) * last.v * ahead, y: last.y + Math.sin(radians) * last.v * ahead };
}

// El punto del rastro a `distance` píxeles detrás de la cabeza (lo mismo que pointBehind del server).
function pointBehind(trail: Point[], distance: number): Point {
    let left = distance;
    for (let i = trail.length - 1; i > 0; i--) {
        const a = trail[i];
        const b = trail[i - 1];
        const segment = Math.hypot(a.x - b.x, a.y - b.y);
        if (segment >= left && segment > 0) {
            const k = left / segment;
            return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
        }
        left -= segment;
    }
    return trail[0] ?? { x: 0, y: 0 };
}

export function updateDungeonBosses(engine: Engine, now: number) {
    if (!views.size) return;
    for (const view of [...views.values()]) {
        if (view.map !== engine.mapNumber || now - view.lastSampleAt > STALE_MS) {
            destroyView(view);
            continue;
        }
        const fade = view.fadeStartedAt === null ? 1 : 1 - (now - view.fadeStartedAt) / FADE_MS;
        if (fade <= 0) {
            destroyView(view);
            continue;
        }
        const head = headAt(view, now - DELAY_MS);
        if (!head || !partTextures) continue;
        const world = {
            x: engine.tileToWorldX(head.x, view.map) + TILE / 2,
            y: engine.tileToWorldY(head.y, view.map) + TILE / 2,
        };
        const last = view.trail[view.trail.length - 1];
        if (!last || Math.hypot(world.x - last.x, world.y - last.y) >= TRAIL_STEP_PX) {
            view.trail.push(world);
            if (view.trail.length > TRAIL_MAX) view.trail.shift();
        }
        if (head.v > 0 && now >= view.nextFrameAt) {
            view.frame = (view.frame + 1) % WALK_FRAMES.length;
            // Con el doble de velocidad, las patas también van al doble.
            view.nextFrameAt = now + LEG_FRAME_MS * (3 / Math.max(1, head.v));
        }
        if (!view.sprites.length) {
            view.sprites = PARTS.map(() => {
                const sprite = new Sprite(partTextures![0][0]);
                sprite.anchor.set(0.5);
                sprite.scale.set(SCALE);
                return sprite;
            });
        }
        // De la cola a la cabeza, así la cabeza queda arriba.
        const distances = [0, ...view.segments.map((tiles) => tiles * TILE)];
        for (let part = PARTS.length - 1; part >= 0; part--) {
            const sprite = view.sprites[part];
            const distance = distances[part] ?? distances[distances.length - 1];
            const at = part === 0 ? world : pointBehind(view.trail, distance);
            const front = pointBehind(view.trail, Math.max(0, distance - 6));
            const back = pointBehind(view.trail, distance + 6);
            const heading =
                Math.hypot(front.x - back.x, front.y - back.y) > 0.5 ? Math.atan2(front.y - back.y, front.x - back.x) : (head.a * Math.PI) / 8;
            sprite.texture = partTextures[view.frame][part];
            sprite.x = at.x;
            sprite.y = at.y;
            // El sprite mira hacia arriba: girarlo un cuarto de vuelta más que el ángulo del movimiento.
            sprite.rotation = heading + Math.PI / 2;
            sprite.alpha = fade;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2 + (PARTS.length - part), sprite);
        }
    }
}
