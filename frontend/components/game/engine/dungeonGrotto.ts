import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// El Genio de la Botella de la Gruta de la Botella (server/src/dungeonGrotto.ts), como el Genie de Link's Awakening:
// - la botella salta de baldosa en baldosa en arco, con su sombra en el piso;
// - el Genio sale y vuelve a meterse en una nube de humo; adentro no se lo ve, afuera flota;
// - aturdida, la botella queda torcida y al final tiembla; levantada, la lleva el personaje (dungeonTools.ts);
// - al romperse quedan los pedazos un momento;
// - las bolas de fuego vuelan en arco desde las manos del Genio.
// Sprite de la botella: un ánfora de "Free ceramic jars" de Clodo (CC-BY 4.0), pasada a violeta (graphics/330012.png).

const SHEET_URL = "/graphics/330012.png";
const TILE = 32;
const HOP_HEIGHT = 26;
const STALE_MS = 3_000;
const BROKEN_MS = 2_500;
const SMOKE_MS = 750;
const FLOAT_PX = 6;

type Tile = { x: number; y: number };
type BottleView = {
    id: number;
    map: number;
    tile: Tile;
    hop: { from: Tile; to: Tile; start: number; ms: number } | null;
    inside: boolean;
    stunned: boolean;
    shaking: boolean;
    carried: boolean;
    brokenAt: number | null;
    lastSeenAt: number;
    sprite: Sprite | null;
    shadow: Graphics;
};
type Effect = (now: number) => boolean;

// El objeto de mazmorra de la botella (lo que se lleva sobre la cabeza y vuela al tirarla, dungeonTools.ts).
export const GENIE_BOTTLE_OBJ = 1869;

const bottles = new Map<number, BottleView>();
// Los Genios que flotan (afuera de la botella o ya sin ella), para mecerlos.
const floating = new Map<number, number>();
const effects: Effect[] = [];
let textures: { whole: Texture; broken: Texture } | null = null;
let loading = false;

function loadTextures() {
    if (textures || loading) return;
    loading = true;
    Assets.load(SHEET_URL)
        .then((base: Texture) => {
            textures = {
                whole: new Texture({ source: base.source, frame: new Rectangle(0, 0, 56, 48) }),
                broken: new Texture({ source: base.source, frame: new Rectangle(56, 0, 56, 48) }),
            };
        })
        .catch(() => {
            loading = false;
        });
}

// La botella entera, para dibujarla en las manos del que la levanta aunque el gráfico del objeto no esté en el caché.
export function genieBottleTexture(): Texture | null {
    loadTextures();
    return textures?.whole ?? null;
}

// Abajo al centro de una baldosa (con decimales), en coordenadas del mundo.
function groundOf(engine: Engine, map: number, tile: Tile) {
    return { x: engine.tileToWorldX(tile.x, map) + TILE / 2, y: engine.tileToWorldY(tile.y, map) + TILE - 3 };
}

function genieContainer(engine: Engine, id: number): Container | null {
    return engine.remoteEntities.get(id) ?? null;
}

function destroyBottle(engine: Engine, view: BottleView) {
    view.sprite?.destroy();
    view.shadow.destroy();
    bottles.delete(view.id);
    const genie = genieContainer(engine, view.id);
    if (genie && !floating.has(view.id)) genie.visible = true;
}

export function handleGrottoBoss(engine: Engine, payload: DungeonBossPayload) {
    loadTextures();
    const now = engine.timestamp();
    if (payload.tipo === "humo") return smoke(engine, { x: payload.x ?? 0, y: payload.y ?? 0 });
    if (payload.tipo === "fuego") return fireball(engine, payload);
    if (payload.tipo !== "botella") return;
    let view = bottles.get(payload.id);
    if (payload.fin) {
        if (view) destroyBottle(engine, view);
        floating.delete(payload.id);
        return;
    }
    const tile = { x: payload.x ?? 0, y: payload.y ?? 0 };
    if (!view) {
        const shadow = new Graphics().ellipse(0, 0, 15, 5).fill({ color: 0x000000, alpha: 0.35 });
        view = {
            id: payload.id,
            map: engine.mapNumber,
            tile,
            hop: null,
            inside: true,
            stunned: false,
            shaking: false,
            carried: false,
            brokenAt: null,
            lastSeenAt: now,
            sprite: null,
            shadow,
        };
        bottles.set(payload.id, view);
    }
    view.lastSeenAt = now;
    if (payload.rota) {
        view.brokenAt = now;
        view.hop = null;
        view.tile = tile;
        view.carried = false;
        view.inside = false;
        floating.set(payload.id, now);
        return;
    }
    if (payload.salto) {
        view.hop = { from: payload.salto.desde, to: payload.salto.hasta, start: now, ms: payload.salto.ms };
    } else if (!view.hop) {
        view.tile = tile;
    }
    view.inside = payload.dentro !== false;
    view.stunned = payload.estado === "aturdida";
    view.shaking = Boolean(payload.tiembla);
    view.carried = Boolean(payload.cargada) || payload.estado === "cargada" || payload.estado === "vuela";
    if (view.inside) floating.delete(payload.id);
    else floating.set(payload.id, now);
}

// Una nube de humo violácea que se abre y sube.
function smoke(engine: Engine, tile: Tile) {
    const map = engine.mapNumber;
    const at = groundOf(engine, map, tile);
    const start = engine.timestamp();
    const puffs = Array.from({ length: 8 }, (_, i) => {
        const puff = new Graphics().circle(0, 0, 9).fill({ color: i % 2 ? 0xd9d2ea : 0xb7aed0 });
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
        return { puff, dx: Math.cos(angle) * (10 + Math.random() * 8), dy: Math.sin(angle) * 6 - 10 };
    });
    effects.push((now) => {
        const t = (now - start) / SMOKE_MS;
        if (t >= 1 || engine.mapNumber !== map) {
            for (const p of puffs) p.puff.destroy();
            return false;
        }
        for (const p of puffs) {
            p.puff.x = at.x + p.dx * (0.4 + t);
            p.puff.y = at.y - 18 + p.dy * (0.4 + t) - t * 22;
            p.puff.scale.set(0.5 + t * 1.2);
            p.puff.alpha = 0.85 * (1 - t);
            syncDisplayObjectToEntityFXRow(engine, at.y + 2, p.puff);
        }
        return true;
    });
}

// Una bola de fuego en arco, con una estela; al llegar, chispas.
function fireball(engine: Engine, payload: DungeonBossPayload) {
    if (!payload.desde || !payload.hasta) return;
    const map = engine.mapNumber;
    const from = { x: engine.tileToWorldX(payload.desde.x, map) + TILE / 2, y: engine.tileToWorldY(payload.desde.y, map) + TILE / 2 };
    const to = { x: engine.tileToWorldX(payload.hasta.x, map) + TILE / 2, y: engine.tileToWorldY(payload.hasta.y, map) + TILE / 2 };
    const ms = Math.max(1, payload.ms ?? 400);
    const start = engine.timestamp();
    const ball = new Graphics();
    const pointAt = (t: number) => ({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * 18 });
    effects.push((now) => {
        const t = (now - start) / ms;
        if (engine.mapNumber !== map) {
            ball.destroy();
            return false;
        }
        if (t >= 1) {
            ball.destroy();
            sparks(engine, to);
            return false;
        }
        ball.clear();
        // La estela: dos círculos atrás, más chicos y más transparentes.
        for (const [lag, radius, alpha] of [
            [0.1, 4, 0.25],
            [0.05, 5.5, 0.45],
        ] as const) {
            const p = pointAt(Math.max(0, t - lag));
            const here = pointAt(t);
            ball.circle(p.x - here.x, p.y - here.y, radius).fill({ color: 0xff7a1a, alpha });
        }
        ball.circle(0, 0, 9).fill({ color: 0xff5a14, alpha: 0.45 });
        ball.circle(0, 0, 6).fill({ color: 0xffa233 });
        ball.circle(0, 0, 3).fill({ color: 0xfff0a0 });
        const here = pointAt(t);
        ball.x = here.x;
        ball.y = here.y;
        syncDisplayObjectToEntityFXRow(engine, here.y + TILE, ball);
        return true;
    });
}

function sparks(engine: Engine, at: { x: number; y: number }) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const bits = Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return { g: new Graphics().circle(0, 0, 2.5).fill({ color: i % 2 ? 0xffd25a : 0xff6a1a }), vx: Math.cos(angle), vy: Math.sin(angle) };
    });
    effects.push((now) => {
        const t = (now - start) / 350;
        if (t >= 1 || engine.mapNumber !== map) {
            for (const b of bits) b.g.destroy();
            return false;
        }
        for (const b of bits) {
            b.g.x = at.x + b.vx * 16 * t;
            b.g.y = at.y + b.vy * 10 * t;
            b.g.alpha = 1 - t;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE, b.g);
        }
        return true;
    });
}

export function updateDungeonGrotto(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    // El Genio afuera flota: se mece arriba del piso.
    for (const [id] of floating) {
        const genie = genieContainer(engine, id);
        if (!genie) {
            if (!engine.personajes[id]) floating.delete(id);
            continue;
        }
        genie.visible = true;
        genie.pivot.y = FLOAT_PX + Math.sin(now / 260 + id) * 3;
    }
    if (!bottles.size || !textures) return;
    for (const view of [...bottles.values()]) {
        if (view.map !== engine.mapNumber || (view.brokenAt === null && now - view.lastSeenAt > STALE_MS)) {
            destroyBottle(engine, view);
            continue;
        }
        const genie = genieContainer(engine, view.id);
        // Adentro de la botella no se lo ve.
        if (genie && view.inside && view.brokenAt === null) {
            genie.visible = false;
            genie.pivot.y = 0;
        }
        if (!view.sprite) {
            view.sprite = new Sprite(textures.whole);
            view.sprite.anchor.set(0.5, 1);
        }
        const sprite = view.sprite;
        if (view.brokenAt !== null) {
            const t = (now - view.brokenAt) / BROKEN_MS;
            if (t >= 1) {
                destroyBottle(engine, view);
                continue;
            }
            sprite.texture = textures.broken;
            sprite.rotation = 0;
            const at = groundOf(engine, view.map, view.tile);
            sprite.x = at.x;
            sprite.y = at.y + 4;
            sprite.alpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
            view.shadow.visible = false;
            syncDisplayObjectToEntityFXRow(engine, at.y, sprite);
            continue;
        }
        sprite.visible = !view.carried;
        view.shadow.visible = !view.carried;
        if (view.carried) continue;
        let ground = groundOf(engine, view.map, view.tile);
        let lift = 0;
        if (view.hop) {
            const t = Math.min(1, (now - view.hop.start) / view.hop.ms);
            const a = groundOf(engine, view.map, view.hop.from);
            const b = groundOf(engine, view.map, view.hop.to);
            ground = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
            lift = Math.sin(Math.PI * t) * HOP_HEIGHT;
            if (t >= 1) {
                view.tile = view.hop.to;
                view.hop = null;
            }
        }
        const shake = view.shaking ? Math.sin(now / 22) * 2.5 : 0;
        sprite.texture = textures.whole;
        sprite.x = ground.x + shake;
        sprite.y = ground.y - lift;
        // Aturdida queda torcida; al saltar se estira un poco al subir y se aplasta al caer.
        sprite.rotation = view.stunned ? 0.22 : 0;
        const squash = view.hop ? 1 + Math.cos(Math.PI * Math.min(1, (now - view.hop.start) / view.hop.ms)) * -0.06 : 1;
        sprite.scale.set(1 / squash, squash);
        sprite.alpha = 1;
        const shadowScale = 1 - (lift / HOP_HEIGHT) * 0.35;
        view.shadow.x = ground.x;
        view.shadow.y = ground.y - 1;
        view.shadow.scale.set(shadowScale);
        view.shadow.alpha = 0.6 + 0.4 * shadowScale;
        syncDisplayObjectToEntityFXRow(engine, ground.y - 2, view.shadow);
        syncDisplayObjectToEntityFXRow(engine, ground.y, sprite);
    }
}
