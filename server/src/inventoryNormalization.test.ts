import assert from "node:assert/strict";
import test from "node:test";
import { normalizeEquipmentStorage, equipInventoryItem, unequipInventoryItem } from "./equipmentStorage";
import type { InventoryRecord } from "./types/runtime";
const vars = require("./vars");
vars.datObj = { 402: { objType: 2 } };

test("cargar consolida la misma mejora sin tocar equipo ni perder unidades", () => {
    const inv: InventoryRecord = {
        "1": { idItem: 402, cant: 9999, equipped: 0, rarity: 2 },
        "2": { idItem: 402, cant: 3, equipped: 0, rarity: 2 },
        "3": { idItem: 402, cant: 1, equipped: 0, rarity: 1 },
        "23": { idItem: 402, cant: 1, equipped: 1, rarity: 2 },
    };
    const next = normalizeEquipmentStorage(inv, () => 23);
    assert.equal(next.changed, true);
    assert.equal(next.inventory["1"].cant, 10000);
    assert.equal(next.inventory["2"].cant, 2);
    assert.equal(next.inventory["3"].rarity, 1);
    assert.equal(next.inventory["23"].cant, 1);
    assert.equal(inv["1"].cant, 9999);
    assert.equal(normalizeEquipmentStorage(next.inventory, () => 23).changed, false);
});

test("reemplazar y quitar equipo devuelve la mejora a su pila existente", () => {
    const inv: InventoryRecord = {
        "1": { idItem: 402, cant: 2, equipped: 0, rarity: 2 },
        "23": { idItem: 402, cant: 1, equipped: 1, rarity: 2 },
    };
    const equipped = equipInventoryItem(inv, 1, 23, { moveWholeStack: false });
    assert.equal(equipped.ok, true);
    if (!equipped.ok) return;
    assert.equal(equipped.inventory["1"].cant, 2);
    const removed = unequipInventoryItem(equipped.inventory, 23);
    assert.equal(removed.ok, true);
    if (removed.ok) assert.deepEqual(removed.inventory, { "1": { idItem: 402, cant: 3, equipped: 0, rarity: 2 } });
});
