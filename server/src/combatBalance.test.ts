import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
    MAGIC_EQUIPMENT_FLAT_CAP,
    MAGIC_EQUIPMENT_FLAT_EFFECTIVENESS,
    MAGIC_PENETRATION_CAP,
    MAGIC_RESISTANCE_CAP,
    PLAYER_HEAL_CAP,
    NORMAL_HEALTH_POTION_RECOVERY,
    calculateMagicDamage,
    clampMagicResistance,
    getMagicEquipmentTotals,
    getHealthPotionRecovery,
    getManaPotionRecovery,
    getPlayerHealingAmount,
} from "./combatBalance";

const equipment = getMagicEquipmentTotals([
    { magicDamageBonus: 38, magicPenetration: 15 },
    { magicDamageBonus: 30, magicPenetration: 15 },
    { magicDamagePercent: 20 },
]);

assert.equal(equipment.flatDamage, 68);
assert.equal(equipment.percentDamage, 15);
assert.equal(equipment.penetration, MAGIC_PENETRATION_CAP);
assert.equal(clampMagicResistance(900), MAGIC_RESISTANCE_CAP);
assert.equal(getPlayerHealingAmount(500), PLAYER_HEAL_CAP);
assert.equal(getPlayerHealingAmount(0), 1);
assert.equal(getHealthPotionRecovery(500, 30), NORMAL_HEALTH_POTION_RECOVERY);
assert.equal(getHealthPotionRecovery(500, 125), NORMAL_HEALTH_POTION_RECOVERY);

const cappedEquipment = getMagicEquipmentTotals([{ magicDamageBonus: MAGIC_EQUIPMENT_FLAT_CAP }]);
assert.equal(calculateMagicDamage(65, 50, 1.05, cappedEquipment), 183);
assert.equal(MAGIC_EQUIPMENT_FLAT_CAP * MAGIC_EQUIPMENT_FLAT_EFFECTIVENESS, 45);

const standardBluePotion = getManaPotionRecovery(2764, 50, 20);
assert.equal(standardBluePotion, 136);
assert.equal(getManaPotionRecovery(2764, 50, 270), standardBluePotion);

const root = path.resolve(__dirname, "..");
const spells = JSON.parse(fs.readFileSync(path.join(root, "jsons/spells.json"), "utf8"));
const objects = JSON.parse(fs.readFileSync(path.join(root, "jsons/objs.json"), "utf8"));
const npcs = JSON.parse(fs.readFileSync(path.join(root, "jsons/npcs.json"), "utf8"));
const balance = require("./balance");
const vars = require("./vars");

const dragonFlameCost = Number(spells[45].manaRequired);
assert.equal(dragonFlameCost, 1000);
assert.ok(vars.timing.actionCooldowns.useItemMs < vars.timing.actionCooldowns.spellMs);

const mageMaxMana = balance.getMaxManaForLevel(1, 20, 50);
assert.equal(mageMaxMana, 2764);
let mageMana = mageMaxMana;
for (let cast = 1; cast <= 3; cast++) {
    assert.ok(mageMana >= dragonFlameCost, `Falta mana para Llama de Dragon ${cast}`);
    mageMana -= dragonFlameCost;
    if (cast < 3) {
        mageMana = Math.min(mageMaxMana, mageMana + standardBluePotion);
    }
}
assert.equal(mageMana, 36);

const npcDropItemIds = Object.values(npcs).flatMap((npc: any) =>
    Array.isArray(npc.drop) ? npc.drop.map((drop: any) => Number(drop.item)) : [],
);
assert.ok(!npcDropItemIds.some((itemId) => [848, 849, 1091, 1092].includes(itemId)));

function strongestSingleTargetSpellForClass(classId: number): number {
    const candidates = Object.values(objects)
        .filter((item: any) =>
            Number(item.objType) === 24 &&
            Number(item.spellIndex) > 0 &&
            !item.clasesNoPermitidas?.includes(classId),
        )
        .map((item: any) => Number(item.spellIndex))
        .filter((spellId) => Number(spells[spellId]?.subeHp) === 2)
        .sort((left, right) => {
            const damageDelta = Number(spells[right].maxHp) - Number(spells[left].maxHp);
            return damageDelta || Number(spells[right].minHp) - Number(spells[left].minHp);
        });

    return candidates[0] ?? 0;
}

assert.equal(objects[821].spellIndex, 45);
assert.equal(objects[1214].spellIndex, 61);
assert.equal(strongestSingleTargetSpellForClass(1), 45, "El mejor hechizo de Mago debe ser Llama de Dragon");
assert.equal(strongestSingleTargetSpellForClass(7), 61, "El mejor hechizo de Druida debe ser Incinerar/Lluvia de Fuego");
assert.equal(strongestSingleTargetSpellForClass(2), 75, "El mejor hechizo de Clerigo debe ser Purificar");
assert.equal(strongestSingleTargetSpellForClass(4), 73, "El mejor hechizo de Asesino debe ser Destello infernal");

console.log("combatBalance.test.ts: OK");
