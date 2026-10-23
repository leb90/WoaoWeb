import assert from "node:assert/strict";
import {
    EQUIPMENT_STORAGE_SLOTS,
    countOccupiedInventorySlots,
    equipInventoryItem,
    normalizeEquipmentStorage,
    unequipInventoryItem,
} from "./equipmentStorage";
import type { InventoryRecord } from "./types/runtime";

const fullInventory = (): InventoryRecord =>
    Object.fromEntries(
        Array.from({ length: 21 }, (_, index) => [
            String(index + 1),
            { idItem: 1_000 + index, cant: 1, equipped: 0 },
        ]),
    );

{
    const inventory: InventoryRecord = {
        "1": { idItem: 100, cant: 1, equipped: 0 },
    };
    const result = equipInventoryItem(
        inventory,
        1,
        EQUIPMENT_STORAGE_SLOTS.weapon,
    );

    assert.equal(result.ok, true);
    if (result.ok) {
        assert.equal(result.inventory["1"], undefined);
        assert.deepEqual(result.inventory["23"], {
            idItem: 100,
            cant: 1,
            equipped: 1,
        });
        assert.equal(countOccupiedInventorySlots(result.inventory), 0);
    }
}

{
    const inventory = fullInventory();
    inventory["1"].cant = 3;
    inventory["23"] = { idItem: 200, cant: 1, equipped: 1 };
    const result = equipInventoryItem(
        inventory,
        1,
        EQUIPMENT_STORAGE_SLOTS.weapon,
        { moveWholeStack: true },
    );

    assert.equal(result.ok, true);
    if (result.ok) {
        assert.equal(result.inventory["1"].idItem, 200);
        assert.equal(result.inventory["1"].equipped, 0);
        assert.equal(result.inventory["23"].idItem, 1_000);
        assert.equal(result.inventory["23"].cant, 3);
        assert.equal(result.inventory["23"].equipped, 1);
        assert.equal(countOccupiedInventorySlots(result.inventory), 21);
    }
}

{
    const inventory = fullInventory();
    inventory["23"] = { idItem: 200, cant: 1, equipped: 1 };
    const result = unequipInventoryItem(
        inventory,
        EQUIPMENT_STORAGE_SLOTS.weapon,
    );

    assert.deepEqual(result, { ok: false, reason: "inventory-full" });
    assert.equal(inventory["23"].equipped, 1);
}

{
    const legacy: InventoryRecord = {
        "1": { idItem: 100, cant: 1, equipped: 1 },
        "2": { idItem: 300, cant: 4, equipped: 0 },
    };
    const result = normalizeEquipmentStorage(legacy, (item) =>
        item.idItem === 100 ? EQUIPMENT_STORAGE_SLOTS.weapon : null,
    );

    assert.equal(result.changed, true);
    assert.equal(result.inventory["1"], undefined);
    assert.equal(result.inventory["23"].idItem, 100);
    assert.equal(result.inventory["23"].equipped, 1);
}

console.log("Equipment storage tests passed.");
