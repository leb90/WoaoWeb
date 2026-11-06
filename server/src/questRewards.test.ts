import assert from "node:assert/strict";
import test from "node:test";
import { planQuestInventory } from "./questRewards";
import type { InventoryRecord } from "./types/runtime";
const vars = require("./vars");
vars.datObj = { 402: { objType: 2 }, 38: { objType: 11 }, 1095: { objType: 0 } };
const full = (): InventoryRecord =>
    Object.fromEntries(Array.from({ length: 21 }, (_, i) => [String(i + 1), { idItem: 38, cant: 1, equipped: 0 }]));

test("misión con mochila llena usa una pila de la misma mejora", () => {
    const inv = full();
    inv["1"] = { idItem: 402, cant: 2, equipped: 0, rarity: 2 };
    const result = planQuestInventory(inv, [], [{ idItem: 402, cant: 1, rarity: 2 }]);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.inventory["1"].cant, 3);
    assert.equal(inv["1"].cant, 2);
});
test("misión libera el slot del material consumido antes de evaluar sus premios", () => {
    const inv = full();
    inv["1"] = { idItem: 1095, cant: 1, equipped: 0 };
    const result = planQuestInventory(inv, [{ index: 1095, amount: 1 }], [{ idItem: 402, cant: 1, rarity: 1 }]);
    assert.equal(result.ok, true);
    if (result.ok) assert.deepEqual(result.inventory["1"], { idItem: 402, cant: 1, equipped: 0, rarity: 1 });
    assert.equal(inv["1"].idItem, 1095);
});
test("dos rarezas distintas sin capacidad rechazan todo y conservan requisitos", () => {
    const inv = full();
    inv["1"] = { idItem: 1095, cant: 1, equipped: 0 };
    const before = structuredClone(inv);
    assert.equal(
        planQuestInventory(
            inv,
            [{ index: 1095, amount: 1 }],
            [
                { idItem: 402, cant: 1, rarity: 1 },
                { idItem: 402, cant: 1, rarity: 2 },
            ],
        ).ok,
        false,
    );
    assert.deepEqual(inv, before);
});
