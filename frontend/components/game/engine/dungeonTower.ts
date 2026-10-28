import { Graphics } from "pixi.js";
import type { DungeonBossPayload } from "../../../lib/aowProtocol";
import { syncDisplayObjectToEntityFXRow } from "../rendering/rowLayerContainers";
import type { Engine } from "./Engine";
import { handleTowerBoss, updateDungeonTowerBosses } from "./dungeonTowerBosses";

// Lo que se ve aparte en la Torre del Águila (server/src/dungeonTower.ts):
// - un pilar que se rompe: polvo y pedazos de piedra;
// - el derrumbe: la cámara tiembla y caen escombros por toda la pantalla;
// - el Orbe que cae a un pozo (se achica y desaparece) y el que vuelve a aparecer (un destello);
// - el Tragón que se traga a alguien: el personaje se ve apenas (adentro del moco) hasta que lo escupe.
// Los jefes (el Flautista y el Águila Malvada) están en dungeonTowerBosses.ts.

const TILE = 32;
const STONE_COLORS = [0xb8b09a, 0x8f8878, 0x6e6757, 0xd3cbb5];

type Effect = (now: number) => boolean;
const effects: Effect[] = [];
// Los personajes tragados: hasta cuándo.
const swallowed = new Map<number, number>();

const centerOf = (engine: Engine, map: number, tile: { x: number; y: number }) => ({
    x: engine.tileToWorldX(tile.x, map) + TILE / 2,
    y: engine.tileToWorldY(tile.y, map) + TILE / 2,
});

// Pedazos de piedra que saltan y caen.
function rubble(engine: Engine, at: { x: number; y: number }, count: number, spread: number, ms: number) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const pieces = Array.from({ length: count }, () => {
        const node = new Graphics();
        const size = 2 + Math.random() * 4;
        node.rect(-size / 2, -size / 2, size, size).fill({ color: STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)] });
        const angle = Math.random() * Math.PI * 2;
        const speed = spread * (0.4 + Math.random() * 0.6);
        return { node, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed * 0.6 - spread * 0.9, spin: (Math.random() - 0.5) * 0.3 };
    });
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            for (const piece of pieces) piece.node.destroy();
            return false;
        }
        for (const piece of pieces) {
            const dt = (now - start) / 16;
            piece.node.x = at.x + piece.vx * dt;
            piece.node.y = at.y + piece.vy * dt + 0.08 * dt * dt;
            piece.node.rotation += piece.spin;
            piece.node.alpha = t > 0.7 ? (1 - t) / 0.3 : 1;
            syncDisplayObjectToEntityFXRow(engine, at.y + TILE, piece.node);
        }
        return true;
    });
}

// Una nube de polvo que se abre y se desvanece.
function dust(engine: Engine, at: { x: number; y: number }, radius: number, ms: number, color = 0xc9c2ae) {
    const map = engine.mapNumber;
    const start = engine.timestamp();
    const node = new Graphics();
    effects.push((now) => {
        const t = (now - start) / ms;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.clear();
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + t;
            node.circle(at.x + Math.cos(a) * radius * t, at.y - 6 + Math.sin(a) * radius * t * 0.5 - t * 8, radius * (0.5 + t * 0.6)).fill({ color, alpha: 0.35 * (1 - t) });
        }
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
        return true;
    });
}

// El derrumbe: tiembla la cámara y, durante un rato, caen escombros por toda la pantalla y el polvo se levanta.
function collapse(engine: Engine, ms: number) {
    engine.cameraShake = { until: engine.timestamp() + ms, amplitude: 6 };
    const map = engine.mapNumber;
    const start = engine.timestamp();
    let nextAt = start;
    effects.push((now) => {
        if (now - start >= ms || engine.mapNumber !== map) return false;
        if (now < nextAt) return true;
        nextAt = now + 70;
        const me = engine.user?.pos;
        if (!me) return true;
        const tile = { x: me.x + Math.round((Math.random() - 0.5) * 16), y: me.y + Math.round((Math.random() - 0.5) * 12) };
        const at = centerOf(engine, map, tile);
        rubble(engine, { x: at.x, y: at.y - 40 }, 3, 1.2, 700);
        if (Math.random() < 0.4) dust(engine, at, 10, 600);
        return true;
    });
}

// El Orbe se achica y cae por el pozo; al volver, destella.
function orbFalls(engine: Engine, tile: { x: number; y: number }) {
    const map = engine.mapNumber;
    const at = centerOf(engine, map, tile);
    const start = engine.timestamp();
    const node = new Graphics();
    effects.push((now) => {
        const t = (now - start) / 600;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.clear();
        node.circle(at.x, at.y + t * 10, 10 * (1 - t)).fill({ color: 0x5a5a66 }).stroke({ color: 0x2a2a30, width: 1 });
        node.alpha = 1 - t * 0.6;
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
        return true;
    });
}

function flash(engine: Engine, tile: { x: number; y: number }, color: number) {
    const map = engine.mapNumber;
    const at = centerOf(engine, map, tile);
    const start = engine.timestamp();
    const node = new Graphics();
    effects.push((now) => {
        const t = (now - start) / 500;
        if (t >= 1 || engine.mapNumber !== map) {
            node.destroy();
            return false;
        }
        node.clear();
        node.circle(at.x, at.y - 8, 6 + t * 18).stroke({ color, width: 3 * (1 - t), alpha: 1 - t });
        node.circle(at.x, at.y - 8, 4 + t * 6).fill({ color: 0xffffff, alpha: 0.6 * (1 - t) });
        syncDisplayObjectToEntityFXRow(engine, at.y + TILE, node);
        return true;
    });
}

export function handleTowerEffect(engine: Engine, payload: DungeonBossPayload) {
    if (payload.tipo === "flautista" || payload.tipo === "aguila") return handleTowerBoss(engine, payload);
    const now = engine.timestamp();
    const estado = payload.estado ?? "";
    const tile = { x: payload.x ?? 0, y: payload.y ?? 0 };
    if (estado === "pilar") {
        const at = centerOf(engine, engine.mapNumber, tile);
        rubble(engine, { x: at.x, y: at.y - 24 }, 14, 2.2, 900);
        dust(engine, at, 14, 800);
        engine.cameraShake = { until: now + 350, amplitude: 3 };
        return;
    }
    if (estado === "derrumbe") return collapse(engine, Math.max(1, payload.ms ?? 1_600));
    if (estado === "cae") return orbFalls(engine, tile);
    if (estado === "aparece") return flash(engine, tile, 0xcfd8ff);
    if (estado === "traga") {
        swallowed.set(payload.id, now + Math.max(1, payload.ms ?? 1_400));
        const at = centerOf(engine, engine.mapNumber, tile);
        dust(engine, at, 10, 500, 0x8fd49a);
        return;
    }
    if (estado === "escupe") {
        swallowed.delete(payload.id);
        const container = engine.user?.id === payload.id ? engine.playerContainer : engine.remoteEntities.get(payload.id);
        if (container) container.alpha = 1;
    }
}

export function updateDungeonTower(engine: Engine, now: number) {
    for (let i = effects.length - 1; i >= 0; i--) if (!effects[i](now)) effects.splice(i, 1);
    for (const [id, until] of swallowed) {
        const container = engine.user?.id === id ? engine.playerContainer : engine.remoteEntities.get(id);
        if (!container || now >= until) {
            if (container) container.alpha = 1;
            swallowed.delete(id);
            continue;
        }
        // Adentro del Tragón se ve apenas, y late.
        container.alpha = 0.3 + 0.15 * Math.sin(now / 90);
    }
    updateDungeonTowerBosses(engine, now);
}
