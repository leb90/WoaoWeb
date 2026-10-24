// Forma de los hechizos de área (spellArea.ts).
//   npx tsx --test src/spellArea.test.ts
import assert from "node:assert/strict";
import test from "node:test";

const spellArea = require("./spellArea") as typeof import("./spellArea");

test("cruz de 5 baldosas (aoe 1)", () => {
    const tiles = spellArea.getAreaTiles(50, 50, 1);
    assert.equal(tiles.length, 5);
    assert.ok(tiles.some((t) => t.x === 51 && t.y === 50));
    assert.ok(!tiles.some((t) => t.x === 51 && t.y === 51));
});

test("cuadrado de 3x3 (aoe 2), con diagonales: Ventisca y Llamarada", () => {
    const tiles = spellArea.getAreaTiles(50, 50, 2);
    assert.equal(tiles.length, 9);
    for (const [x, y] of [[49, 49], [51, 51], [49, 51], [51, 49], [50, 50]]) {
        assert.ok(tiles.some((t) => t.x === x && t.y === y), `${x},${y}`);
    }
});

test("no se sale del mapa", () => {
    assert.equal(spellArea.getAreaTiles(1, 1, 2).length, 4);
    assert.equal(spellArea.getAreaTiles(50, 50, 0).length, 0);
});
