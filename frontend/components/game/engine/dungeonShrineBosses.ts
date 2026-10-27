import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// Los jefes del Santuario del Rostro (server/src/dungeonShrineBosses.ts):
// - la bola de hierro del Machacador: en el piso con su sombra, arriba de la cabeza del Machacador o volando en arco
//   (en las manos de un jugador la dibuja dungeonTools.ts);
// - las Serpientes Glotonas titilan al tragarse una bomba, se inflan cuando les explota adentro y eructan humo;
// - el Rostro de Piedra es una cara en el piso (la criatura de AO no se dibuja): aparece de a poco, a veces abre la
//   boca, se enoja con cada bomba y se esconde un rato;
// - sus pozos: el piso se raja, se abre un agujero que gira y se vuelve a cerrar.
// Sprites: la cara son tres cabezas de "[LPC] Jungle Ruins" de bluecarrot16 (CC-BY 3.0+, graphics/330021.png); la
// bola de hierro está dibujada para el juego (graphics/330022.png).

const FACE_URL = "/graphics/330021.png";
const BALL_URL = "/graphics/330022.png";
const TILE = 32;
const FACE_SIZE = 96;
const HELD_Y = -58;
const BALL_ARC = 22;
const STALE_MS = 3_000;
const FACE_FADE_MS = 800;
const FACE_ANGRY_MS = 500;
const FACE_DEATH_MS = 2_500;
const MOUTH_EVERY_MS = 1_070;
const MOUTH_MS = 500;

// El objeto de la bola cuando la lleva un jugador (dungeonTools.ts); no está en objs.json.
export const IRON_BALL_OBJ = 1881;

type Tile = { x: number; y: number };
type BallView = {
    id: number;
    map: number;
    tile: Tile;
    estado: string;
    flight: { from: Tile; to: Tile; start: number; ms: number; high: boolean } | null;
    lastSeenAt: number;
    sprite: Sprite | Graphics;
    shadow: Graphics;
};
type FaceView = {
    id: number;
    map: number;
    tile: Tile;
    estado: string;
    since: number;
    ms: number;
    lastSeenAt: number;
    sprite: Sprite | null;
};
type SnakeFx = { kind: string; start: number };
type Effect = (now: number) => boolean;

const balls = new Map<number, BallView>();
const faces = new Map<number, FaceView>();
const snakeFx = new Map<number, SnakeFx>();
const effects: Effect[] = [];
let faceFrames: Texture[] | null = null;
let ballTexture: Texture | null = null;
let loading = false;

function loadTextures() {
    if (loading) return;
    loading = true;
    Assets.load([FACE_URL, BALL_URL])
        .then((loaded: Record<string, Texture>) => {
            const sheet = loaded[FACE_URL];
            faceFrames = [0, 1, 2].map((i) => new Texture({ source: sheet.source, frame: new Rectangle(i * FACE_SIZE, 0, FACE_SIZE, FACE_SIZE) }));
            ballTexture = loaded[BALL_URL];
        })
        .catch(() => {
            loading = false;
        });
}

// La bola, para dibujarla en las manos del que la levanta (dungeonTools.ts).
export function ironBallTexture(): Texture | null {
    loadTextures();
    return ballTexture;
}

function ballNode(): Sprite | Graphics {
    if (ballTexture) {
        const sprite = new Sprite(ballTexture);
        sprite.anchor.set(0.5, 1);
        return sprite;
    }
    return new Graphics().circle(0, -13, 12).fill({ color: 0x4a4e57 }).circle(-4, -17, 3).fill({ color: 0xc9ccd4 });
}

const groundOf = (engine: Engine, map: number, tile: Tile) => ({ x: engine.tileToWorldX(tile.x, map) + TILE / 2, y: engine.tileToWorldY(tile.y, map) + TILE - 2 });
const centerOf = (engine: Engine, map: number, tile: Tile) => ({ x: engine.tileToWorldX(tile.x, map) + TILE / 2, y: engine.tileToWorldY(tile.y, map) + TILE / 2 });

// Lo que va pegado al piso (la cara y los pozos): arriba de las baldosas y debajo de los objetos y los personajes.
function putOnFloor(engine: Engine, node: Container) {
    const floor = engine.belowLayerContainer ?? engine.mapContainer;
    if (!floor) return;
    if (node.parent !== floor || floor.children[floor.children.length - 1] !== node) floor.addChild(node);
}

export function handleShrineBoss(engine: Engine, payload: DungeonBossPayload) {
    loadTextures();
    if (payload.tipo === "bola") return ballPacket(engine, payload);
    if (payload.tipo === "rostro") return facePacket(engine, payload);
    if (payload.tipo === "pozo") return pit(engine, payload);
    if (payload.tipo === "glotona") return snakePacket(engine, payload);
}

// --- La bola del Machacador ---

function destroyBall(view: BallView) {
    view.sprite.destroy();
    view.shadow.destroy();
    balls.delete(view.id);
}

function ballPacket(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    let view = balls.get(payload.id);
    if (payload.fin) {
        if (view) destroyBall(view);
        return;
    }
    const tile = { x: payload.x ?? 0, y: payload.y ?? 0 };
    if (!view) {
        view = {
            id: payload.id,
            map: engine.mapNumber,
            tile,
            estado: payload.estado ?? "piso",
            flight: null,
            lastSeenAt: now,
            sprite: ballNode(),
            shadow: new Graphics().ellipse(0, 0, 12, 4).fill({ color: 0x000000, alpha: 0.35 }),
        };
        balls.set(payload.id, view);
    }
    // Si se creó antes de que cargara la textura, se cambia el dibujo por el sprite.
    if (!(view.sprite instanceof Sprite) && ballTexture) {
        view.sprite.destroy();
        view.sprite = ballNode();
    }
    view.lastSeenAt = now;
    view.estado = payload.estado ?? view.estado;
    if (payload.estado === "vuela" && payload.desde && payload.hasta) {
        view.flight = { from: payload.desde, to: payload.hasta, start: now, ms: Math.max(1, payload.ms ?? 400), high: Boolean(payload.alto) };
        view.tile = payload.hasta;
    } else if (payload.estado !== "vuela") {
        view.flight = null;
        view.tile = tile;
    }
}

function updateBalls(engine: Engine, now: number) {
    for (const view of [...balls.values()]) {
        if (view.map !== engine.mapNumber || now - view.lastSeenAt > STALE_MS) {
            destroyBall(view);
            continue;
        }
        const { sprite, shadow } = view;
        if (view.estado === "jugador") {
            sprite.visible = false;
            shadow.visible = false;
            continue;
        }
        sprite.visible = true;
        if (view.estado === "jefe") {
            // Arriba de la cabeza del Machacador.
            shadow.visible = false;
            const boss = engine.remoteEntities.get(view.id);
            if (!boss) continue;
            if (sprite.parent !== boss) boss.addChild(sprite);
            sprite.x = TILE / 2;
            sprite.y = HELD_Y + Math.sin(now / 140) * 1.5;
            continue;
        }
        let ground = groundOf(engine, view.map, view.tile);
        let lift = 0;
        if (view.flight) {
            const t = Math.min(1, (now - view.flight.start) / view.flight.ms);
            const a = groundOf(engine, view.map, view.flight.from);
            const b = groundOf(engine, view.map, view.flight.to);
            ground = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
            // La que tira el Machacador sale de arriba de su cabeza; después cae en arco.
            const start = view.flight.high ? -HELD_Y - 6 : 0;
            lift = start * (1 - t) + Math.sin(Math.PI * t) * BALL_ARC;
            if (t >= 1) view.flight = null;
        }
        shadow.visible = true;
        sprite.x = ground.x;
        sprite.y = ground.y - lift;
        sprite.rotation = view.flight ? (now / 90) % (Math.PI * 2) : 0;
        shadow.x = ground.x;
        shadow.y = ground.y - 1;
        shadow.scale.set(1 - Math.min(0.5, lift / 80));
        syncDisplayObjectToEntityFXRow(engine, ground.y - 2, shadow);
        syncDisplayObjectToEntityFXRow(engine, ground.y, sprite);
    }
}

// --- El Rostro de Piedra ---

function facePacket(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    let view = faces.get(payload.id);
    if (!view) {
        view = { id: payload.id, map: engine.mapNumber, tile: { x: payload.x ?? 0, y: payload.y ?? 0 }, estado: "oculta", since: now, ms: 0, lastSeenAt: now, sprite: null };
        faces.set(payload.id, view);
    }
    view.lastSeenAt = now;
    const estado = payload.estado ?? "pelea";
    // La sincronización de cada segundo no corta lo que se está animando (el golpe, la aparición, la muerte).
    if (payload.sync) {
        const busy = (view.estado === "golpe" || view.estado === "aparece") && now - view.since < view.ms;
        if (busy || view.estado === "muere" || estado === view.estado) return;
        if (estado === "cerrada") {
            view.estado = "golpe";
            view.ms = FACE_ANGRY_MS + FACE_FADE_MS + Math.max(FACE_FADE_MS, payload.ms ?? 0);
            view.since = now - FACE_ANGRY_MS - FACE_FADE_MS;
            return;
        }
    }
    view.estado = estado;
    view.since = now;
    view.ms = payload.ms ?? 0;
}

function faceLook(view: FaceView, now: number): { frame: number; alpha: number; shake: number } {
    const t = now - view.since;
    if (view.estado === "oculta") return { frame: 0, alpha: 0, shake: 0 };
    if (view.estado === "aparece") return { frame: 0, alpha: Math.min(1, t / Math.max(1, view.ms)), shake: 0 };
    if (view.estado === "golpe" && t < view.ms) {
        // Enojada y temblando, se hunde en el piso y vuelve a aparecer.
        if (t < FACE_ANGRY_MS) return { frame: 2, alpha: 1, shake: 2.5 };
        if (t < FACE_ANGRY_MS + FACE_FADE_MS) return { frame: 2, alpha: 1 - (t - FACE_ANGRY_MS) / FACE_FADE_MS, shake: 1 };
        if (t > view.ms - FACE_FADE_MS) return { frame: 0, alpha: 1 - (view.ms - t) / FACE_FADE_MS, shake: 0 };
        return { frame: 0, alpha: 0, shake: 0 };
    }
    if (view.estado === "muere") return { frame: 2, alpha: Math.max(0, 1 - t / FACE_DEATH_MS), shake: 3 * (1 - t / FACE_DEATH_MS) };
    // Peleando: cada tanto abre la boca, como el original que parpadea.
    const bucket = Math.floor(now / MOUTH_EVERY_MS);
    const open = (bucket * 7919) % 11 < 5 && now % MOUTH_EVERY_MS < MOUTH_MS;
    return { frame: open ? 1 : 0, alpha: 1, shake: 0 };
}

function updateFaces(engine: Engine, now: number) {
    for (const view of [...faces.values()]) {
        const entity = engine.remoteEntities.get(view.id);
        // La criatura de AO no se ve: lo que se ve es la cara.
        if (entity) entity.visible = false;
        const gone = view.estado === "muere" ? now - view.since > FACE_DEATH_MS : now - view.lastSeenAt > STALE_MS;
        if (view.map !== engine.mapNumber || gone) {
            view.sprite?.destroy();
            faces.delete(view.id);
            continue;
        }
        if (!faceFrames) continue;
        if (!view.sprite) {
            view.sprite = new Sprite(faceFrames[0]);
            view.sprite.anchor.set(0.5);
        }
        const look = faceLook(view, now);
        const at = centerOf(engine, view.map, view.tile);
        view.sprite.texture = faceFrames[look.frame];
        view.sprite.alpha = look.alpha;
        view.sprite.visible = look.alpha > 0.01;
        view.sprite.x = at.x + (look.shake ? Math.sin(now / 18) * look.shake : 0);
        view.sprite.y = at.y;
        putOnFloor(engine, view.sprite);
    }
}

// --- Los pozos del Rostro ---

function pit(engine: Engine, payload: DungeonBossPayload) {
    const fases = payload.fases;
    if (!fases) return;
    const map = engine.mapNumber;
    const at = centerOf(engine, map, { x: payload.x ?? 0, y: payload.y ?? 0 });
    const start = engine.timestamp();
    const node = new Graphics();
    node.label = "pozo-rostro";
    node.x = at.x;
    node.y = at.y;
    const total = fases.aviso + fases.abre + fases.abierto + fases.cierra;
    // Las rajaduras: cinco líneas quebradas desde el centro.
    const cracks = Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2 + 0.4;
        return { angle, bend: (i % 2 ? 1 : -1) * 0.35 };
    });
    effects.push((now) => {
        const t = now - start;
        if (t >= total || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.clear();
        let radius = 0;
        if (t < fases.aviso) {
            const k = t / fases.aviso;
            for (const crack of cracks) {
                const length = 6 + 9 * k;
                const mid = { x: Math.cos(crack.angle) * length * 0.5, y: Math.sin(crack.angle) * length * 0.35 };
                const end = { x: Math.cos(crack.angle + crack.bend) * length, y: Math.sin(crack.angle + crack.bend) * length * 0.7 };
                node.moveTo(0, 0).lineTo(mid.x, mid.y).lineTo(end.x, end.y).stroke({ color: 0x1d1813, width: 1.5, alpha: 0.4 + 0.6 * k });
            }
            node.x = at.x + (k > 0.6 ? Math.sin(now / 20) : 0);
        } else if (t < fases.aviso + fases.abre) {
            radius = (t - fases.aviso) / fases.abre;
        } else if (t < fases.aviso + fases.abre + fases.abierto) {
            radius = 1;
        } else {
            radius = 1 - (t - fases.aviso - fases.abre - fases.abierto) / fases.cierra;
        }
        if (radius > 0) {
            node.x = at.x;
            node.ellipse(0, 0, 15 * radius, 11 * radius).fill({ color: 0x3a2f24 });
            node.ellipse(0, 1, 12.5 * radius, 9 * radius).fill({ color: 0x050403 });
            // El remolino que chupa: dos arcos que giran.
            if (radius >= 1) {
                const spin = now / 160;
                for (let i = 0; i < 2; i++) {
                    const a = spin + i * Math.PI;
                    node.moveTo(Math.cos(a) * 9, Math.sin(a) * 6.5)
                        .bezierCurveTo(Math.cos(a + 1) * 7, Math.sin(a + 1) * 5, Math.cos(a + 2) * 4, Math.sin(a + 2) * 3, 0, 0)
                        .stroke({ color: 0x4a3c2e, width: 1.5, alpha: 0.8 });
                }
            }
        }
        putOnFloor(engine, node);
        return true;
    });
}

// --- Las Serpientes Glotonas ---

function snakePacket(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    const estado = payload.estado ?? "";
    snakeFx.set(payload.id, { kind: estado, start: now });
    if (estado === "eructa" || estado === "revienta") {
        const entity = engine.personajes[payload.id];
        const tile = entity ? { x: entity.pos.x, y: entity.pos.y } : { x: payload.x ?? 0, y: payload.y ?? 0 };
        puff(engine, tile, estado === "revienta");
    }
}

// Cuánto se infla (1 = normal) y si titila, según lo que le está pasando.
function snakeLook(fx: SnakeFx, now: number): { scale: number; blink: boolean; done: boolean } {
    const t = now - fx.start;
    if (fx.kind === "come") return { scale: 1, blink: Math.floor(t / 60) % 2 === 0, done: t > 360 };
    if (fx.kind === "infla") {
        if (t > 800) return { scale: 1, blink: false, done: true };
        const grow = t < 200 ? t / 200 : t > 600 ? 1 - (t - 600) / 200 : 1;
        return { scale: 1 + 0.32 * grow + Math.sin(t / 40) * 0.03 * grow, blink: false, done: false };
    }
    if (fx.kind === "revienta") return { scale: 1 + 0.5 * Math.min(1, t / 400), blink: Math.floor(t / 50) % 2 === 0, done: t > 1_200 };
    return { scale: 1, blink: false, done: true };
}

function updateSnakes(engine: Engine, now: number) {
    for (const [id, fx] of snakeFx) {
        const entity = engine.remoteEntities.get(id);
        const look = snakeLook(fx, now);
        if (!entity || look.done) {
            if (entity) {
                entity.scale.set(1);
                entity.pivot.set(0, 0);
                entity.alpha = 1;
            }
            snakeFx.delete(id);
            continue;
        }
        // Se infla desde el piso: el pie de la baldosa (16, 32) queda en su lugar.
        entity.scale.set(look.scale);
        entity.pivot.set(TILE / 2 - TILE / 2 / look.scale, TILE - TILE / look.scale);
        entity.alpha = look.blink ? 0.45 : 1;
    }
}

// Humo (el eructo) o una explosión de humo y fuego (al reventar).
function puff(engine: Engine, tile: Tile, big: boolean) {
    const map = engine.mapNumber;
    const at = groundOf(engine, map, tile);
    const start = engine.timestamp();
    const count = big ? 12 : 6;
    const life = big ? 900 : 650;
    const puffs = Array.from({ length: count }, (_, i) => {
        const colors = big ? [0xff8c1a, 0x9a9a9a, 0xffd25a, 0x6b6b6b] : [0xc9c9c9, 0xa8a8a8];
        const node = new Graphics().circle(0, 0, big ? 9 : 6).fill({ color: colors[i % colors.length] });
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        return { node, dx: Math.cos(angle) * (big ? 22 : 10), dy: Math.sin(angle) * (big ? 12 : 6) - 8 };
    });
    effects.push((now) => {
        const t = (now - start) / life;
        if (t >= 1 || engine.mapNumber !== map) {
            for (const p of puffs) p.node.destroy();
            return false;
        }
        for (const p of puffs) {
            p.node.x = at.x + p.dx * (0.3 + t);
            p.node.y = at.y - 14 + p.dy * (0.3 + t) - t * 16;
            p.node.scale.set(0.6 + t);
            p.node.alpha = 0.85 * (1 - t);
            syncDisplayObjectToEntityFXRow(engine, at.y + 2, p.node);
        }
        return true;
    });
}

export function updateDungeonShrineBosses(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    if (balls.size) updateBalls(engine, now);
    if (faces.size) updateFaces(engine, now);
    if (snakeFx.size) updateSnakes(engine, now);
}
