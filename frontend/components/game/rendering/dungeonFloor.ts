import { Graphics, Rectangle, Sprite } from "pixi.js";
import type { Engine } from "../engine/Engine";

// La grieta es una superposición transparente: conserva el piso propio de cada mazmorra.
export function renderDungeonFloor(engine: Engine, open: boolean, map: number, x: number, y: number): Sprite | null {
    if (!engine.app) return null;
    const key = open ? "dungeon-pit" : "dungeon-cracks";
    let texture = engine.textureCache.get(key);
    if (!texture) {
        const drawing = new Graphics();
        if (open) {
            drawing.rect(0, 0, 32, 32).fill(0x080d12);
            drawing.poly([0, 1, 9, 3, 17, 0, 25, 3, 31, 1, 30, 12, 32, 21, 29, 31, 19, 29, 9, 32, 1, 28, 3, 18, 0, 9]).fill(0x010306);
            drawing.moveTo(1, 1).lineTo(10, 3).lineTo(17, 1).lineTo(25, 3).lineTo(31, 1).stroke({ color: 0x42616a, width: 1 });
        } else {
            for (const points of [
                [1, 5, 9, 10, 13, 8, 17, 17, 24, 20, 30, 29],
                [17, 17, 10, 22, 7, 30],
                [17, 17, 23, 12, 28, 13, 31, 7],
                [13, 8, 16, 3, 15, 0],
            ]) {
                drawing.moveTo(points[0], points[1]);
                for (let i = 2; i < points.length; i += 2) drawing.lineTo(points[i], points[i + 1]);
                drawing.stroke({ color: 0x03090c, width: 2, alpha: 0.95 });
            }
            drawing.moveTo(2, 6).lineTo(9, 11).lineTo(13, 10).lineTo(16, 17).stroke({ color: 0x66858b, width: 1, alpha: 0.65 });
        }
        texture = engine.app.renderer.generateTexture({ target: drawing, frame: new Rectangle(0, 0, 32, 32), resolution: 1 });
        engine.textureCache.set(key, texture);
        drawing.destroy();
    }
    const sprite = new Sprite(texture);
    sprite.x = engine.tileToWorldX(x, map);
    sprite.y = engine.tileToWorldY(y, map);
    return sprite;
}
