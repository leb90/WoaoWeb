import { Assets, Container, Graphics, Sprite, Texture } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// Los jefes de las Fauces del Bagre (server/src/dungeonMawBosses.ts):
// - el Maestro Stalfos: el tajo que carga, el montón de huesos cuando se desarma (tiembla antes de rearmarse) y la
//   huida, volando;
// - las Gohma: el ojo que se abre (es cuando se las lastima) y el temblor antes de arremeter;
// - la Anguila Viscosa: los agujeros de las paredes, el pozo del medio, la cola que gira, la cabeza que asoma y, sacada
//   de la pared, el cuerpo con el corazón que titila. La criatura de AO no se ve.
// Los huesos son el sprite del hueso de los esqueletos (graphics/330030.png); lo demás se dibuja con formas.

const BONE_URL = "/graphics/330030.png";
const TILE = 32;
const TAIL_RADII = [1.5, 2.3, 3.1, 3.9, 4.7];
const WIGGLE_MS = 2_130;
const STALE_MS = 3_000;

type Tile = { x: number; y: number };
type Effect = (now: number) => boolean;
type EelHead = {
    estado: string;
    x: number;
    y: number;
    dir: Tile;
    corazon: Tile;
    cuerpo: Tile[];
    agujero: Tile;
};
type EelView = {
    id: number;
    map: number;
    holes: Array<Tile & { dir: number }>;
    pit: Tile[];
    tail: { cx: number; cy: number; angle: number; vel: number; serverT: number; at: number } | null;
    head: EelHead | null;
    headSince: number;
    lastSeenAt: number;
    node: Graphics;
    floor: Graphics;
};

const effects: Effect[] = [];
// El Maestro Stalfos desarmado: hasta cuándo (para el montón de huesos) y la Gohma con el ojo abierto o temblando.
const collapsed = new Map<number, { start: number; ms: number; node: Container }>();
const eyes = new Map<number, { until: number; node: Graphics }>();
const trembling = new Map<number, number>();
const fleeing = new Map<number, { start: number; ms: number }>();
const eels = new Map<number, EelView>();
let boneTexture: Texture | null = null;
let loading = false;

function loadTextures() {
    if (boneTexture || loading) return;
    loading = true;
    Assets.load(BONE_URL)
        .then((texture: Texture) => {
            boneTexture = texture;
        })
        .catch(() => {
            loading = false;
        });
}

const centerOf = (engine: Engine, map: number, tile: Tile) => ({
    x: engine.tileToWorldX(tile.x, map) + TILE / 2,
    y: engine.tileToWorldY(tile.y, map) + TILE / 2,
});

function putOnFloor(engine: Engine, node: Container) {
    const floor = engine.belowLayerContainer ?? engine.mapContainer;
    if (!floor) return;
    if (node.parent !== floor || floor.children[floor.children.length - 1] !== node) floor.addChild(node);
}

export function handleMawBoss(engine: Engine, payload: DungeonBossPayload) {
    loadTextures();
    if (payload.tipo === "stalfos") return stalfos(engine, payload);
    if (payload.tipo === "gohma") return gohma(engine, payload);
    if (payload.tipo === "anguila") return eel(engine, payload);
}

// --- El Maestro Stalfos ---

function bonePile(): Container {
    const pile = new Container();
    for (let i = 0; i < 6; i++) {
        const node: Sprite | Graphics = boneTexture ? new Sprite(boneTexture) : new Graphics().roundRect(-7, -2, 14, 4, 2).fill({ color: 0xece4cf });
        if (node instanceof Sprite) node.anchor.set(0.5);
        node.x = Math.cos(i * 1.7) * 11;
        node.y = Math.sin(i * 2.3) * 6;
        node.rotation = i * 1.1;
        pile.addChild(node);
    }
    // Una calavera arriba del montón.
    const skull = new Graphics().circle(0, -4, 6).fill({ color: 0xf2ecdb }).circle(-2, -5, 1.4).circle(2, -5, 1.4).fill({ color: 0x2b2b2b });
    pile.addChild(skull);
    return pile;
}

function stalfos(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    const id = payload.id;
    const estado = payload.estado ?? "";
    if (estado === "desarmado") {
        collapsed.get(id)?.node.destroy({ children: true });
        collapsed.set(id, { start: now, ms: Math.max(1, payload.ms ?? 4_500), node: bonePile() });
        return;
    }
    if (estado === "armado" || estado === "rearma") {
        if (estado === "armado") {
            collapsed.get(id)?.node.destroy({ children: true });
            collapsed.delete(id);
            const entity = engine.remoteEntities.get(id);
            if (entity) entity.alpha = 1;
        }
        return;
    }
    if (estado === "huye") {
        fleeing.set(id, { start: now, ms: Math.max(1, payload.ms ?? 1_000) });
        return;
    }
    if (estado === "tajo") return slashArc(engine, payload);
    if (estado === "aparece") puff(engine, { x: payload.x ?? 0, y: payload.y ?? 0 }, 0xd8d0b8);
}

// El tajo: un arco blanco adelante del Maestro Stalfos que se carga y se descarga.
function slashArc(engine: Engine, payload: DungeonBossPayload) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const ms = Math.max(1, payload.ms ?? 450);
    const node = new Graphics();
    effects.push((now) => {
        const t = (now - start) / (ms + 200);
        const entity = engine.personajes[payload.id];
        if (t >= 1 || engine.mapNumber !== map || !entity) {
            node.destroy();
            return false;
        }
        const at = centerOf(engine, map, entity.pos);
        const facing = { 1: -Math.PI / 2, 2: Math.PI / 2, 3: 0, 4: Math.PI }[entity.heading as 1 | 2 | 3 | 4] ?? Math.PI / 2;
        node.clear();
        const charge = Math.min(1, (now - start) / ms);
        const swing = now - start > ms ? 1 : 0;
        node.arc(0, 0, 22, facing - 0.9, facing + 0.9).stroke({ color: swing ? 0xffffff : 0xffe7a3, width: swing ? 4 : 1 + charge * 2, alpha: swing ? 1 - (t - 0.7) / 0.3 : 0.4 + charge * 0.5 });
        node.x = at.x;
        node.y = at.y - 6;
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2 + 1, node);
        return true;
    });
}

// --- Las Gohma ---

function gohma(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    const estado = payload.estado ?? "";
    if (estado === "ojo") {
        eyes.get(payload.id)?.node.destroy();
        eyes.set(payload.id, { until: now + Math.max(1, payload.ms ?? 1_200), node: new Graphics() });
        return;
    }
    if (estado === "cierra") {
        eyes.get(payload.id)?.node.destroy();
        eyes.delete(payload.id);
        return;
    }
    if (estado === "tiembla") trembling.set(payload.id, now + Math.max(1, payload.ms ?? 800));
}

// --- La Anguila Viscosa ---

function eel(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    let view = eels.get(payload.id);
    if (payload.fin) {
        if (view) {
            view.node.destroy();
            view.floor.destroy();
            eels.delete(payload.id);
            puff(engine, view.head ? { x: view.head.x, y: view.head.y } : { x: view.tail?.cx ?? 0, y: view.tail?.cy ?? 0 }, 0x6fbf73, true);
        }
        return;
    }
    if (!view) {
        view = { id: payload.id, map: engine.mapNumber, holes: [], pit: [], tail: null, head: null, headSince: now, lastSeenAt: now, node: new Graphics(), floor: new Graphics() };
        eels.set(payload.id, view);
    }
    view.lastSeenAt = now;
    if (payload.agujeros) view.holes = payload.agujeros;
    if (payload.pozo) view.pit = payload.pozo;
    if (payload.cola) {
        view.tail = { cx: payload.cola.cx, cy: payload.cola.cy, angle: payload.cola.angulo, vel: payload.cola.vel, serverT: payload.t ?? 0, at: now };
    }
    if (payload.cabeza !== undefined) {
        if (!payload.cabeza || payload.cabeza.estado !== view.head?.estado) view.headSince = now;
        view.head = payload.cabeza;
    }
    if (payload.rompe) shakeFloor(engine, view, payload.rompe);
    if (payload.explota) puff(engine, payload.explota, 0xff8c1a, true);
}

// El piso se rompe: unas rajaduras que crecen desde el medio antes de que se abra el pozo.
function shakeFloor(engine: Engine, view: EelView, ms: number) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const node = new Graphics();
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        if (!view.tail) return true;
        const at = { x: engine.tileToWorldX(view.tail.cx, map), y: engine.tileToWorldY(view.tail.cy, map) };
        node.clear();
        for (let i = 0; i < 7; i++) {
            const angle = (i / 7) * Math.PI * 2 + 0.3;
            const length = 10 + 60 * t;
            node.moveTo(at.x, at.y).lineTo(at.x + Math.cos(angle) * length, at.y + Math.sin(angle) * length * 0.7).stroke({ color: 0x1a1612, width: 2, alpha: 0.8 });
        }
        putOnFloor(engine, node);
        return true;
    });
}

function drawEel(engine: Engine, view: EelView, now: number) {
    const map = view.map;
    const { node, floor } = view;
    node.clear();
    floor.clear();
    // El pozo del medio y los agujeros de las paredes.
    for (const tile of view.pit) {
        const x = engine.tileToWorldX(tile.x, map);
        const y = engine.tileToWorldY(tile.y, map);
        floor.rect(x, y, TILE, TILE).fill({ color: 0x050403 });
    }
    if (view.pit.length) {
        const xs = view.pit.map((t) => t.x);
        const ys = view.pit.map((t) => t.y);
        const x = engine.tileToWorldX(Math.min(...xs), map);
        const y = engine.tileToWorldY(Math.min(...ys), map);
        floor.rect(x, y, (Math.max(...xs) - Math.min(...xs) + 1) * TILE, (Math.max(...ys) - Math.min(...ys) + 1) * TILE).stroke({ color: 0x3a2f24, width: 3 });
    }
    putOnFloor(engine, floor);
    for (const hole of view.holes) {
        const at = centerOf(engine, map, hole);
        node.ellipse(at.x, at.y + 4 * hole.dir, 13, 10).fill({ color: 0x080808 }).stroke({ color: 0x2c3e33, width: 2 });
    }
    // La cola: cinco segmentos que giran desde el pozo, meneándose.
    const tail = view.tail;
    if (tail) {
        const angle = tail.angle + tail.vel * (now - tail.at);
        const serverNow = tail.serverT + (now - tail.at);
        const wiggle = Math.sin((serverNow / WIGGLE_MS) * 2 * Math.PI) * 0.785;
        const ox = engine.tileToWorldX(tail.cx, map);
        const oy = engine.tileToWorldY(tail.cy, map);
        TAIL_RADII.forEach((r, i) => {
            const a = angle + wiggle * (r / TAIL_RADII[TAIL_RADII.length - 1]);
            const x = ox + Math.cos(a) * r * TILE;
            const y = oy + Math.sin(a) * r * TILE;
            const size = 12 - i * 1.3;
            node.circle(x, y, size).fill({ color: 0x3f7d4a }).stroke({ color: 0x9fe0b0, width: 1.5 });
            node.circle(x - size * 0.3, y - size * 0.3, size * 0.3).fill({ color: 0xbff0c8, alpha: 0.5 });
        });
    }
    // La cabeza (y, afuera, el cuerpo con el corazón que titila).
    const head = view.head;
    if (head) {
        const t = now - view.headSince;
        const show = head.estado === "asoma" ? Math.min(1, t / 700) * 0.6 : head.estado === "esconde" ? Math.max(0, 1 - t / 500) : 1;
        for (const tile of head.cuerpo) {
            const at = centerOf(engine, map, tile);
            node.circle(at.x, at.y, 12).fill({ color: 0x3f7d4a }).stroke({ color: 0x9fe0b0, width: 1.5 });
        }
        if (head.estado === "tirada" || head.estado === "vuelve") {
            const at = centerOf(engine, map, head.corazon);
            const blink = Math.floor(now / 130) % 2 === 0;
            node.circle(at.x, at.y, 13).fill({ color: blink ? 0xff7fb0 : 0xd94d86 }).stroke({ color: 0xffd0e4, width: 2 });
        }
        const at = centerOf(engine, map, { x: head.x, y: head.y });
        const angle = Math.atan2(head.dir.y, head.dir.x);
        const fx = Math.cos(angle);
        const fy = Math.sin(angle);
        const scale = 0.6 + 0.4 * show;
        node.ellipse(at.x, at.y, 15 * scale, 15 * scale).fill({ color: 0x356b3f, alpha: show }).stroke({ color: 0x9fe0b0, width: 2, alpha: show });
        // Ojos amarillos y la boca con dientes, hacia adonde mira.
        for (const side of [-1, 1]) {
            const ex = at.x + fx * 5 * scale - fy * 6 * side * scale;
            const ey = at.y + fy * 5 * scale + fx * 6 * side * scale;
            node.circle(ex, ey, 3.2 * scale).fill({ color: 0xffe04a, alpha: show }).circle(ex + fx, ey + fy, 1.4 * scale).fill({ color: 0x111111, alpha: show });
        }
        const mx = at.x + fx * 12 * scale;
        const my = at.y + fy * 12 * scale;
        node.moveTo(mx - fy * 7 * scale, my + fx * 7 * scale).lineTo(mx + fy * 7 * scale, my - fx * 7 * scale).stroke({ color: 0xf5f5f5, width: 2, alpha: show });
    }
    syncDisplayObjectToEntityFXRow(engine, engine.tileToWorldY((tail?.cy ?? 0) + 8, map), node);
}

// Humo o una explosión (al reventar).
function puff(engine: Engine, tile: Tile, color: number, big = false) {
    const map = engine.mapNumber;
    const at = centerOf(engine, map, tile);
    const start = engine.timestamp();
    const count = big ? 12 : 7;
    const life = big ? 900 : 650;
    const puffs = Array.from({ length: count }, (_, i) => {
        const node = new Graphics().circle(0, 0, big ? 9 : 6).fill({ color: i % 2 ? color : 0xaaaaaa });
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
        return { node, dx: Math.cos(angle) * (big ? 22 : 12), dy: Math.sin(angle) * (big ? 12 : 7) - 8 };
    });
    effects.push((now) => {
        const t = (now - start) / life;
        if (t >= 1 || engine.mapNumber !== map) {
            for (const p of puffs) p.node.destroy();
            return false;
        }
        for (const p of puffs) {
            p.node.x = at.x + p.dx * (0.3 + t);
            p.node.y = at.y - 8 + p.dy * (0.3 + t) - t * 14;
            p.node.scale.set(0.6 + t);
            p.node.alpha = 0.85 * (1 - t);
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2, p.node);
        }
        return true;
    });
}

export function updateDungeonMawBosses(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    // El Maestro Stalfos desarmado: no se lo ve; en su lugar, el montón de huesos (tiembla al final).
    for (const [id, pile] of collapsed) {
        const entity = engine.personajes[id];
        const container = engine.remoteEntities.get(id);
        if (!entity) {
            pile.node.destroy({ children: true });
            collapsed.delete(id);
            continue;
        }
        if (container) container.alpha = 0;
        const at = centerOf(engine, engine.mapNumber, entity.pos);
        const left = pile.ms - (now - pile.start);
        pile.node.x = at.x + (left < 1_000 ? Math.sin(now / 25) * 2 : 0);
        pile.node.y = at.y + 8;
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE / 2, pile.node);
    }
    // Huye volando: sube y se desvanece.
    for (const [id, flight] of fleeing) {
        const container = engine.remoteEntities.get(id);
        const t = (now - flight.start) / flight.ms;
        if (!container || t >= 1) {
            fleeing.delete(id);
            continue;
        }
        container.pivot.y = t * 90;
        container.alpha = 1 - t;
    }
    // La Gohma: el ojo abierto (rojo, grande) arriba del cuerpo; temblando, se sacude.
    for (const [id, eye] of eyes) {
        const entity = engine.personajes[id];
        if (!entity || now > eye.until) {
            eye.node.destroy();
            eyes.delete(id);
            continue;
        }
        const at = centerOf(engine, engine.mapNumber, entity.pos);
        const open = Math.min(1, (eye.until - now) / 150, 1);
        eye.node.clear();
        eye.node.ellipse(0, 0, 13, 9 * open).fill({ color: 0xfff3d6 }).stroke({ color: 0x5a1010, width: 2 });
        eye.node.circle(0, 0, 5.5 * open).fill({ color: 0xd61f1f }).circle(0, 0, 2.2 * open).fill({ color: 0x111111 });
        eye.node.x = at.x;
        eye.node.y = at.y - 22;
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE, eye.node);
    }
    for (const [id, until] of trembling) {
        const container = engine.remoteEntities.get(id);
        if (!container || now > until) {
            if (container) container.pivot.x = 0;
            trembling.delete(id);
            continue;
        }
        container.pivot.x = Math.sin(now / 18) * 2.5;
    }
    for (const view of [...eels.values()]) {
        if (view.map !== engine.mapNumber || now - view.lastSeenAt > STALE_MS) {
            view.node.destroy();
            view.floor.destroy();
            eels.delete(view.id);
            continue;
        }
        drawEel(engine, view, now);
    }
}
