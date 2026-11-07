import assert from "node:assert/strict";
import test from "node:test";
const { recordRankedDeath } = require("./rankedRoundElimination");
test("en 2v2 la primera muerte no termina la ronda; la segunda sí y nunca dos veces", () => {
    const eliminated = new Set<string>();
    const team = ["a", "b"];
    assert.equal(recordRankedDeath(eliminated, team, "a"), false);
    assert.equal(recordRankedDeath(eliminated, team, "a"), false);
    assert.equal(recordRankedDeath(eliminated, team, "outside"), false);
    assert.equal(recordRankedDeath(eliminated, team, "b"), true);
    assert.equal(recordRankedDeath(eliminated, team, "b"), false);
    eliminated.clear();
    assert.equal(recordRankedDeath(eliminated, ["a"], "a"), true);
});

test("un compañero resucitado deja de contar como eliminado en esa ronda", () => {
    const eliminated = new Set<string>();
    const team = ["a", "b"];
    assert.equal(recordRankedDeath(eliminated, team, "a"), false);
    assert.equal(recordRankedDeath(eliminated, team, "b", ["a"]), false);
    assert.equal(recordRankedDeath(eliminated, team, "a"), true);
});
