import { Graphics } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";

// Los jefes de la Torre del Águila (server/src/dungeonTowerBosses.ts):
// - el Flautista: las notas de la flauta cuando toca y la huida (sube y se desvanece);
// - el Águila Malvada: vuela alto (el dibujo se levanta y deja una sombra en el piso) o bajo; la pasada deja una estela;
//   el viento son rachas que cruzan la terraza; las plumas vuelan rectas (y rebotadas vuelven); la picada es una sombra
//   que crece debajo del blanco; al morir cae girando y suelta plumas. Mientras vive, el Flautista va montado encima.
// Todo se dibuja con formas; el cuerpo del Águila es el sprite 584 (en vuelo) o el 585 (posada).

const TILE = 32;
const HIGH_PX = 46;
const LOW_PX = 10;

type Effect = (now: number) => boolean;
type EagleView = { id: number; map: number; high: boolean; lift: number; shadow: Graphics; rider: Graphics; dying: number; diveAt: { x: number; y: number } | null; diveUntil: number };

const effects: Effect[] = [];
const eagles = new Map<number, EagleView>();
const fleeing = new Map<number, { start: number; ms: number }>();

const centerOf = (engine: Engine, map: number, tile: { x: number; y: number }) => ({
    x: engine.tileToWorldX(tile.x, map) + TILE / 2,
    y: engine.tileToWorldY(tile.y, map) + TILE / 2,
});

function entityCenter(engine: Engine, id: number) {
    const container = engine.remoteEntities.get(id);
    if (container) return { x: container.x + TILE / 2, y: container.y + TILE / 2 };
    const entity = engine.personajes[id];
    return entity ? centerOf(engine, engine.mapNumber, entity.pos) : null;
}

// --- El Flautista ---

// Notas que suben desde el Flautista, de a una, mientras toca.
function notes(engine: Engine, id: number, ms: number) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    let nextAt = start;
    effects.push((now) => {
        if (now - start >= ms || engine.mapNumber !== map) return false;
        if (now < nextAt) return true;
        nextAt = now + 220;
        const at = entityCenter(engine, id);
        if (!at) return true;
        const node = new Graphics();
        const side = Math.random() < 0.5 ? -1 : 1;
        const born = now;
        node.circle(0, 0, 2.5).fill({ color: 0xfff1a8 }).moveTo(2.5, 0).lineTo(2.5, -9).stroke({ color: 0xfff1a8, width: 1.5 }).moveTo(2.5, -9).lineTo(7, -7).stroke({ color: 0xfff1a8, width: 1.5 });
        effects.push((t) => {
            const k = (t - born) / 900;
            if (k >= 1 || engine.mapNumber !== map) {
                node.destroy();
                return false;
            }
            node.x = at.x + side * (6 + k * 14) + Math.sin(k * 9) * 3;
            node.y = at.y - 24 - k * 30;
            node.alpha = 1 - k;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
            return true;
        });
        return true;
    });
}

function piper(engine: Engine, payload: DungeonBossPayload) {
    const estado = payload.estado ?? "";
    if (estado === "toca") return notes(engine, payload.id, Math.max(1, payload.ms ?? 1_500));
    if (estado === "huye") fleeing.set(payload.id, { start: engine.timestamp(), ms: Math.max(1, payload.ms ?? 1_000) });
}

// --- El Águila Malvada ---

function viewOf(engine: Engine, id: number): EagleView {
    let view = eagles.get(id);
    if (!view) {
        view = { id, map: engine.mapNumber, high: true, lift: HIGH_PX, shadow: new Graphics(), rider: new Graphics(), dying: 0, diveAt: null, diveUntil: 0 };
        // El Flautista montado: una capucha oscura con dos ojos.
        view.rider.moveTo(-6, 4).lineTo(0, -10).lineTo(6, 4).closePath().fill({ color: 0x2a2433 });
        view.rider.circle(-2, -1, 1.2).circle(2, -1, 1.2).fill({ color: 0xffd34a });
        eagles.set(id, view);
    }
    return view;
}

// La pluma: una línea blanca con punta, que vuela recta (rebotada, celeste).
function feather(engine: Engine, payload: DungeonBossPayload) {
    if (!payload.desde || !payload.hasta) return;
    const map = engine.mapNumber;
    const from = centerOf(engine, map, payload.desde);
    const to = centerOf(engine, map, payload.hasta);
    const ms = Math.max(1, payload.ms ?? 300);
    const start = engine.timestamp();
    const color = payload.rebote ? 0x9feaff : 0xf4f0e6;
    const node = new Graphics();
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    node.moveTo(-9, 0).lineTo(7, 0).stroke({ color, width: 3 }).moveTo(7, 0).lineTo(11, 0).stroke({ color: 0x3a3230, width: 2 });
    node.moveTo(-6, -3).lineTo(2, -1).moveTo(-6, 3).lineTo(2, 1).stroke({ color, width: 1, alpha: 0.7 });
    node.rotation = angle;
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.x = from.x + (to.x - from.x) * t;
        node.y = from.y + (to.y - from.y) * t - 12 + Math.sin(t * 20) * 1.5;
        syncDisplayObjectToEntityFXRow(engine, node.y + TILE, node);
        return true;
    });
}

// El viento: rachas blancas que cruzan la terraza hacia `dir` mientras dura.
function wind(engine: Engine, payload: DungeonBossPayload) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const ms = Math.max(1, payload.ms ?? 4_000);
    const dir = payload.dir ?? 1;
    let nextAt = start;
    effects.push((now) => {
        if (now - start >= ms || engine.mapNumber !== map) return false;
        if (now < nextAt) return true;
        nextAt = now + 90;
        const me = engine.user?.pos;
        if (!me) return true;
        const tile = { x: me.x - dir * (6 + Math.random() * 6), y: me.y + Math.round((Math.random() - 0.5) * 12) };
        const at = centerOf(engine, map, tile);
        const node = new Graphics();
        const length = 18 + Math.random() * 22;
        node.moveTo(0, 0).lineTo(length * dir, 0).stroke({ color: 0xffffff, width: 1.5, alpha: 0.55 });
        const born = now;
        const speed = 0.55 + Math.random() * 0.3;
        effects.push((t) => {
            const k = (t - born) / 700;
            if (k >= 1 || engine.mapNumber !== map) {
                node.destroy();
                return false;
            }
            node.x = at.x + dir * (t - born) * speed;
            node.y = at.y - 8 + Math.sin(k * 6) * 2;
            node.alpha = Math.sin(Math.PI * k);
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
            return true;
        });
        return true;
    });
}

// Plumas sueltas que caen girando (al morir y al caer a la terraza).
function looseFeathers(engine: Engine, at: { x: number; y: number }, count: number) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    for (let i = 0; i < count; i++) {
        const node = new Graphics();
        node.ellipse(0, 0, 6, 2).fill({ color: i % 3 ? 0xe9e2d2 : 0x6b4a2a });
        const vx = (Math.random() - 0.5) * 1.2;
        const phase = Math.random() * 6;
        const life = 900 + Math.random() * 700;
        effects.push((now) => {
            const t = (now - start) / life;
            if (t >= 1 || engine.mapNumber !== map) {
                node.destroy();
                return false;
            }
            node.x = at.x + vx * (now - start) * 0.06 + Math.sin(t * 8 + phase) * 8;
            node.y = at.y - 30 + t * 60;
            node.rotation = Math.sin(t * 8 + phase) * 0.8;
            node.alpha = 1 - t * t;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
            return true;
        });
    }
}

function dust(engine: Engine, at: { x: number; y: number }) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const node = new Graphics();
    effects.push((now) => {
        const t = (now - start) / 500;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.clear();
        node.ellipse(at.x, at.y + 4, 10 + t * 22, 4 + t * 7).stroke({ color: 0xd8d0ba, width: 2, alpha: 0.6 * (1 - t) });
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
        return true;
    });
}

function eagle(engine: Engine, payload: DungeonBossPayload) {
    const now = engine.timestamp();
    const view = viewOf(engine, payload.id);
    const estado = payload.estado ?? "";
    if (estado === "pluma") return feather(engine, payload);
    if (estado === "viento") {
        view.high = true;
        return wind(engine, payload);
    }
    if (estado === "picada") {
        view.high = true;
        view.diveAt = { x: payload.x ?? 0, y: payload.y ?? 0 };
        view.diveUntil = now + Math.max(1, payload.ms ?? 800);
        return;
    }
    if (estado === "cae") {
        view.high = false;
        view.diveAt = null;
        const at = entityCenter(engine, payload.id);
        if (at) dust(engine, at);
        return;
    }
    if (estado === "pasada") {
        view.high = false;
        return;
    }
    if (estado === "posada") {
        view.high = false;
        const at = entityCenter(engine, payload.id);
        if (at) {
            dust(engine, at);
            looseFeathers(engine, at, 6);
        }
        return;
    }
    if (estado === "muere") {
        view.dying = now + Math.max(1, payload.ms ?? 1_600);
        const at = entityCenter(engine, payload.id);
        if (at) looseFeathers(engine, at, 14);
        return;
    }
    // ronda y presenta: alto.
    view.high = Boolean(payload.alto ?? true);
}

export function handleTowerBoss(engine: Engine, payload: DungeonBossPayload) {
    if (payload.tipo === "flautista") return piper(engine, payload);
    if (payload.tipo === "aguila") return eagle(engine, payload);
}

export function updateDungeonTowerBosses(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    for (const [id, flee] of fleeing) {
        const entity = engine.remoteEntities.get(id);
        const t = (now - flee.start) / flee.ms;
        if (!entity || t >= 1) {
            if (entity) {
                entity.pivot.y = 0;
                entity.alpha = 1;
            }
            fleeing.delete(id);
            continue;
        }
        entity.pivot.y = t * 70;
        entity.alpha = 1 - t;
    }
    for (const [id, view] of eagles) {
        const entity = engine.remoteEntities.get(id);
        if (!entity || engine.mapNumber !== view.map) {
            if (!engine.personajes[id] || engine.mapNumber !== view.map) {
                view.shadow.destroy();
                view.rider.destroy();
                eagles.delete(id);
            }
            continue;
        }
        if (view.dying) {
            const t = Math.min(1, 1 - (view.dying - now) / 1_600);
            entity.rotation = t * 7;
            entity.pivot.y = view.lift - t * 60;
            entity.alpha = 1 - t * t;
            if (t >= 1) {
                view.shadow.destroy();
                view.rider.destroy();
                eagles.delete(id);
            }
            continue;
        }
        // Sube o baja de a poco; el aleteo mece el dibujo.
        const target = view.high ? HIGH_PX : LOW_PX;
        view.lift += (target - view.lift) * 0.12;
        entity.pivot.y = view.lift + Math.sin(now / 160) * (view.high ? 3 : 1.5);
        // El Flautista montado.
        if (view.rider.parent !== entity) entity.addChild(view.rider);
        view.rider.x = TILE / 2;
        view.rider.y = -34;
        view.rider.visible = true;
        // La sombra en el piso: más chica y tenue cuanto más alto vuela; en la picada, crece sobre el blanco.
        const center = { x: entity.x + TILE / 2, y: entity.y + TILE / 2 };
        const shadowAt = view.diveAt && now < view.diveUntil ? centerOf(engine, view.map, view.diveAt) : center;
        const k = view.diveAt && now < view.diveUntil ? 1 - (view.diveUntil - now) / 800 : 0;
        const scale = view.high ? 0.55 + k * 0.6 : 1;
        view.shadow.clear();
        view.shadow.ellipse(shadowAt.x, shadowAt.y + 6, 22 * scale, 8 * scale).fill({ color: 0x000000, alpha: (view.high ? 0.22 : 0.35) + k * 0.25 });
        syncDisplayObjectToEntityFXRow(engine, shadowAt.y - TILE, view.shadow);
    }
}
