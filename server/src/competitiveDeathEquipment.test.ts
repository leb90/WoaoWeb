import assert from "node:assert/strict";
import test from "node:test";

test("el cierre competitivo conserva el equipo restaurado y no vuelve a emitir una muerte", () => {
    const vars = require("./vars");
    const game = require("./game");
    const ranked = require("./rankedArena");
    const rankedModule = require.cache[require.resolve("./rankedArena")]!;
    const original = rankedModule.exports;
    const user = {
        id: "death-equipment",
        nameCharacter: "Fixture",
        map: 1,
        pos: { x: 5, y: 5 },
        hp: 0,
        maxHp: 200,
        idHead: 1,
        idBody: 1,
        inv: {},
        rankedMatchId: "match",
        attrFuerza: 18,
        attrAgilidad: 18,
        bkAttrFuerza: 18,
        bkAttrAgilidad: 18,
        idItemWeapon: 23,
        idItemBody: 22,
        idItemHelmet: 25,
        idItemShield: 24,
        idItemRing: 27,
        deadWorldTransitionEndsAt: 0,
    };
    vars.personajes[user.id] = user;
    rankedModule.exports = {
        ...ranked,
        onUserDied: () =>
            Object.assign(user, {
                hp: 200,
                dead: 0,
                idItemWeapon: 23,
                idItemBody: 22,
                idItemHelmet: 25,
                idItemShield: 24,
                idItemRing: 27,
            }),
    };
    try {
        game.putBodyAndHeadDead(user.id);
        assert.equal(user.hp, 200);
        assert.equal(user.idItemWeapon, 23);
        assert.equal(user.idItemBody, 22);
        assert.equal(user.idItemHelmet, 25);
        assert.equal(user.idItemShield, 24);
        assert.equal(user.idItemRing, 27);
        assert.equal(user.deadWorldTransitionEndsAt, 0);
    } finally {
        rankedModule.exports = original;
        delete vars.personajes[user.id];
    }
});
