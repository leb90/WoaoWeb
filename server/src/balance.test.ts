import assert from "node:assert/strict";

const balance = require("./balance");
const vars = require("./vars");

assert.deepEqual(balance.getHpGainRange(1, 19), {
    min: 5,
    max: 9,
    average: 7,
});
assert.equal(balance.rollHpGain(1, 19, () => 0), 5);
assert.equal(balance.rollHpGain(1, 19, () => 0.999999), 9);
assert.equal(balance.getMinHpForLevel(1, 19, 50), 264);
assert.equal(balance.getMaxHpForLevel(1, 19, 50), 362);
assert.equal(balance.getMaxRolledHpForLevel(1, 19, 50), 460);

assert.deepEqual(balance.getHpGainRange(3, 21), {
    min: 9,
    max: 13,
    average: 11,
});
assert.equal(balance.getMaxHpForLevel(3, 21, 50), 560);

// Si la tabla de razas cambia la constitución, la vida guardada se corre lo mismo que el promedio.
assert.equal(balance.getHpShiftForConstitutionChange(1, 19, 20, 50), 26);
assert.equal(balance.getHpShiftForConstitutionChange(1, 20, 19, 50), -26);
assert.equal(balance.getHpShiftForConstitutionChange(1, 19, 20, 1), 1);
assert.equal(balance.getHpShiftForConstitutionChange(3, 21, 21, 50), 0);

const classIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const raceIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

for (const classId of classIds) {
    for (const raceId of raceIds) {
        const constitution = 18 + Number(vars.balanceRazas[raceId].constitucion ?? 0);
        const range = balance.getHpGainRange(classId, constitution);
        assert.ok(range.min >= 1, `Clase ${classId}, raza ${raceId}: minimo invalido`);
        assert.ok(range.max >= range.min, `Clase ${classId}, raza ${raceId}: rango invertido`);
        assert.equal(range.average, (range.min + range.max) / 2);
        assert.ok(balance.getMinHpForLevel(classId, constitution, 50) <= balance.getMaxHpForLevel(classId, constitution, 50));
        assert.ok(balance.getMaxHpForLevel(classId, constitution, 50) <= balance.getMaxRolledHpForLevel(classId, constitution, 50));
    }
}

console.log("balance.test.ts: OK");
