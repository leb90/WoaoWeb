import assert from "node:assert/strict";
import {
    CRAFTING_RECIPE_DROP_TIERS,
    getEligibleCraftingRecipeLevels,
} from "./craftingRecipeDrops";
import type { RuntimeNpc } from "./types/runtime";

function combatNpc(maxHp: number): RuntimeNpc {
    return {
        id: "test-npc",
        map: 1,
        pos: { x: 50, y: 50 },
        maxHp,
        exp: 1,
        hostile: 1,
    };
}

assert.deepEqual(
    CRAFTING_RECIPE_DROP_TIERS.map((tier) => ({
        level: tier.level,
        minNpcMaxHpExclusive: tier.minNpcMaxHpExclusive,
        chancePercent: tier.chancePercent,
    })),
    [
        { level: 10, minNpcMaxHpExclusive: 300, chancePercent: 5 },
        { level: 20, minNpcMaxHpExclusive: 1_500, chancePercent: 2 },
        { level: 30, minNpcMaxHpExclusive: 4_000, chancePercent: 1 },
        { level: 40, minNpcMaxHpExclusive: 10_000, chancePercent: 0.5 },
        { level: 50, minNpcMaxHpExclusive: 25_000, chancePercent: 0.1 },
    ],
);

assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(300)), []);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(301)), [10]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(1_500)), [10]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(1_501)), [10, 20]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(4_000)), [10, 20]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(4_001)), [10, 20, 30]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(10_000)), [10, 20, 30]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(10_001)), [10, 20, 30, 40]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(25_000)), [10, 20, 30, 40]);
assert.deepEqual(getEligibleCraftingRecipeLevels(combatNpc(25_001)), [10, 20, 30, 40, 50]);

assert.deepEqual(
    getEligibleCraftingRecipeLevels({ ...combatNpc(100_000), exp: 0 }),
    [],
);
assert.deepEqual(
    getEligibleCraftingRecipeLevels({
        ...combatNpc(100_000),
        hostile: 0,
        attackable: 0,
        movement: 1,
    }),
    [],
);

console.log("Crafting recipe drop tier tests passed.");
