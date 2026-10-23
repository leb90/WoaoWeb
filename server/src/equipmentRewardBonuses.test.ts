import assert from "node:assert/strict";
import test from "node:test";

const {
    applyDropChanceBonus,
    applyPercentBonus,
} = require("./equipmentRewardBonuses");

test("applyPercentBonus suma el porcentaje entero", () => {
    assert.equal(applyPercentBonus(100, 50), 150);
    assert.equal(applyPercentBonus(0, 50), 0);
    assert.equal(applyPercentBonus(33, 50), 49);
});

test("applyDropChanceBonus convierte 50% en 75%", () => {
    assert.equal(applyDropChanceBonus(50, 50), 75);
    assert.equal(applyDropChanceBonus(100, 50), 100);
    assert.equal(applyDropChanceBonus(10, 50), 15);
    assert.equal(applyDropChanceBonus(50, 0), 50);
});
