import { Graphics } from "pixi.js";
import type { DungeonDarkRoom } from "../../../lib/aowProtocol";
import type { Engine } from "./Engine";

// Mazmorras: las salas a oscuras (las que tienen alguna antorcha apagada, server/src/dungeons.ts). Un velo negro sobre
// la sala, más claro cuantas más antorchas estén encendidas, con un círculo de luz alrededor de cada personaje y de cada
// antorcha encendida. Va arriba de todo lo del mapa (también tapa a las criaturas), como en Zelda.

const TILE = 32;
const MAX_ALPHA = 0.9;
const PLAYER_LIGHT = 64;
const TORCH_LIGHT = 80;

function veil(engine: Engine): Graphics | null {
    const overlay = engine.entityFXOverlayContainer;
    if (!overlay) return null;
    if (!engine.dungeonDarknessLayer || engine.dungeonDarknessLayer.destroyed) {
        const layer = new Graphics();
        layer.eventMode = "none";
        layer.zIndex = 1_000_000;
        overlay.sortableChildren = true;
        overlay.addChild(layer);
        engine.dungeonDarknessLayer = layer;
    }
    return engine.dungeonDarknessLayer;
}

// Dónde se ve cada personaje (con el paso a medio camino), en coordenadas del mundo.
function lightsOfPlayers(engine: Engine) {
    const lights: Array<{ x: number; y: number }> = [];
    const add = (x: number | undefined, y: number | undefined) => {
        if (typeof x === "number" && typeof y === "number") lights.push({ x: x + TILE / 2, y: y + TILE / 2 });
    };
    add(engine.playerContainer?.x, engine.playerContainer?.y);
    for (const [id, container] of engine.remoteEntities) {
        const character = engine.personajes[id];
        if (character && !character.isNpc) add(container.x, container.y);
    }
    return lights;
}

function drawRoom(engine: Engine, layer: Graphics, room: DungeonDarkRoom, players: Array<{ x: number; y: number }>) {
    // Con un borde de una baldosa, para tapar también las paredes de la sala.
    const x1 = engine.tileToWorldX(room.x1 - 1);
    const y1 = engine.tileToWorldY(room.y1 - 1);
    const x2 = engine.tileToWorldX(room.x2 + 2);
    const y2 = engine.tileToWorldY(room.y2 + 2);
    const alpha = MAX_ALPHA * (1 - room.luz);
    const inside = (p: { x: number; y: number }) => p.x >= x1 && p.x <= x2 && p.y >= y1 && p.y <= y2;
    const lights = [
        ...players.filter(inside).map((p) => ({ ...p, r: PLAYER_LIGHT })),
        ...room.antorchas.map((t) => ({ x: engine.tileToWorldX(t.x) + TILE / 2, y: engine.tileToWorldY(t.y) + TILE / 2, r: TORCH_LIGHT })),
    ];
    // El velo con los huecos de luz, y un aro a media sombra alrededor de cada hueco para que el borde no quede duro.
    layer.rect(x1, y1, x2 - x1, y2 - y1).fill({ color: 0x000000, alpha });
    for (const light of lights) layer.circle(light.x, light.y, light.r).cut();
    for (const light of lights) {
        layer.circle(light.x, light.y, light.r).fill({ color: 0x000000, alpha: alpha * 0.45 });
        layer.circle(light.x, light.y, light.r * 0.62).cut();
    }
}

export function updateDungeonDarkness(engine: Engine) {
    const rooms = engine.inDungeon ? engine.dungeonDarkRooms : [];
    if (!rooms.length) {
        if (engine.dungeonDarknessLayer && !engine.dungeonDarknessLayer.destroyed) engine.dungeonDarknessLayer.clear();
        return;
    }
    const layer = veil(engine);
    if (!layer) return;
    layer.clear();
    const players = lightsOfPlayers(engine);
    for (const room of rooms) drawRoom(engine, layer, room, players);
}
