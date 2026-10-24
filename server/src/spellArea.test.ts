// Forma de los hechizos de área (spellArea.ts).
//   npx tsx --test src/spellArea.test.ts
import assert from "node:assert/strict";
import test from "node:test";

const spellArea = require("./spellArea") as typeof import("./spellArea");

test("cruz de 5 baldosas (aoe 1): el centro y sus cuatro vecinas, sin diagonales", () => {
    const tiles = spellArea.getAreaTiles(50, 50, 1);
    assert.equal(tiles.length, 5);
    for (const [x, y] of [[50, 50], [50, 49], [50, 51], [49, 50], [51, 50]]) {
        assert.ok(tiles.some((t) => t.x === x && t.y === y), `${x},${y}`);
    }
    assert.ok(!tiles.some((t) => t.x === 51 && t.y === 51));
});

test("no se sale del mapa y sin área no hay baldosas", () => {
    assert.equal(spellArea.getAreaTiles(1, 1, 1).length, 3);
    assert.equal(spellArea.getAreaTiles(50, 50, 0).length, 0);
});
