// Rarezas por instancia (itemRarity.ts).
//   npx tsx --test src/itemRarity.test.ts
import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

const vars = require("./vars");
const { loadObjectsDataFromJsonFile } = require("./objectData");
vars.datObj = loadObjectsDataFromJsonFile(path.resolve(__dirname, "../jsons/objs.json"));
const itemRarity = require("./itemRarity");
const { canAddToInventory, equipInventoryItem, unequipInventoryItem, EQUIPMENT_STORAGE_SLOTS } = require("./equipmentStorage");

const MATADRAGONES = 402; // arma común
const TIER_SWORD = 1503; // Espada del Caído LEGENDARIO (set del guerrero)
const RED_POTION = 38; // no lleva rareza

test("los sets de tier son siempre legendarios y lo no elegible es Normal", () => {
    assert.equal(itemRarity.getItemRarity(TIER_SWORD, 0), 3);
    assert.equal(itemRarity.getItemRarity(TIER_SWORD, 1), 3);
    assert.equal(itemRarity.getItemRarity(RED_POTION, 3), 0);
    assert.equal(itemRarity.getItemRarity(MATADRAGONES, 2), 2);
    assert.equal(itemRarity.getItemRarity(MATADRAGONES, 9), 3);
});

test("el sorteo respeta los cortes del repo original", () => {
    const at = (roll: number) => itemRarity.rollRarity(() => (roll - 1) / 10000);
    assert.equal(at(1), 3);
    assert.equal(at(10), 3);
    assert.equal(at(11), 2);
    assert.equal(at(310), 2);
    assert.equal(at(311), 1);
    assert.equal(at(3310), 1);
    assert.equal(at(3311), 0);
    assert.equal(at(10000), 0);
});

test("cada rareza suma +1/+2/+3 al golpe o la defensa y +2/+4/+6 al daño mágico", () => {
    const base = vars.datObj[MATADRAGONES];
    const epic = itemRarity.getEffectiveItemData(MATADRAGONES, 2);
    assert.equal(epic.minHit, base.minHit + 2);
    assert.equal(epic.maxHit, base.maxHit + 2);
    assert.equal(itemRarity.getEffectiveItemData(MATADRAGONES, 0), base);

    const staff = 1225; // Báculo de la Naturaleza (+28 DM)
    assert.equal(itemRarity.getEffectiveItemData(staff, 3).magicDamageBonus, vars.datObj[staff].magicDamageBonus + 6);
});

test("solo el legendario no se cae al morir", () => {
    assert.equal(itemRarity.isRarityNoDrop(MATADRAGONES, 2), false);
    assert.equal(itemRarity.isRarityNoDrop(MATADRAGONES, 3), true);
    assert.equal(itemRarity.isRarityNoDrop(TIER_SWORD, 0), true);
});

test("un ítem con rareza no se apila y conserva la rareza al equipar y desequipar", () => {
    assert.equal(itemRarity.canStackWith({ idItem: MATADRAGONES, rarity: 0 }, MATADRAGONES, 0), true);
    assert.equal(itemRarity.canStackWith({ idItem: MATADRAGONES, rarity: 1 }, MATADRAGONES, 1), false);

    // 20 lugares ocupados: entra una espada normal en el que queda, pero no dos con rareza.
    const inventory: Record<string, { idItem: number; cant: number; equipped: number; rarity?: number }> = {};
    for (let slot = 1; slot <= 20; slot++) inventory[String(slot)] = { idItem: RED_POTION, cant: 1, equipped: 0 };
    assert.equal(canAddToInventory(inventory, MATADRAGONES, 2, 10_000, 0), true);
    assert.equal(canAddToInventory(inventory, MATADRAGONES, 2, 10_000, 2), false);

    inventory["21"] = { idItem: MATADRAGONES, cant: 1, equipped: 0, rarity: 2 };
    const equipped = equipInventoryItem(inventory, 21, EQUIPMENT_STORAGE_SLOTS.weapon);
    assert.equal(equipped.ok, true);
    assert.equal(equipped.inventory[String(EQUIPMENT_STORAGE_SLOTS.weapon)].rarity, 2);

    delete equipped.inventory["1"];
    const unequipped = unequipInventoryItem(equipped.inventory, EQUIPMENT_STORAGE_SLOTS.weapon);
    assert.equal(unequipped.ok, true);
    const back = Object.values(unequipped.inventory).find((item: any) => item.idItem === MATADRAGONES) as { rarity?: number };
    assert.equal(back.rarity, 2);
});
