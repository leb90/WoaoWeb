import assert from "node:assert/strict";
import test from "node:test";

test("Hunters permite enfrentar al mismo clan sólo durante el combate activo", () => {
    const vars = require("./vars"),
        game = require("./game"),
        hunters = require("./huntersGame");
    const cached = require.cache[require.resolve("./huntersGame")]!,
        original = cached.exports;
    let active = false;
    cached.exports = { ...hunters, isHuntersCombat: () => active };
    for (const id of ["hunter-a", "hunter-b"]) vars.personajes[id] = { id, clanId: "same-clan" };
    try {
        assert.match(game.getFriendlyFireBlockReason("hunter-a", "hunter-b"), /clan/);
        active = true;
        assert.equal(game.getFriendlyFireBlockReason("hunter-a", "hunter-b"), null);
    } finally {
        cached.exports = original;
        delete vars.personajes["hunter-a"];
        delete vars.personajes["hunter-b"];
    }
});

test("una muerte con atacante notifica la baja de Hunters antes de eliminar a la víctima", () => {
    const vars = require("./vars"),
        game = require("./game"),
        hunters = require("./huntersGame");
    const cached = require.cache[require.resolve("./huntersGame")]!,
        original = cached.exports;
    const notifications: string[] = [];
    const user = {
        id: "hunter-death",
        nameCharacter: "Fixture",
        map: 1,
        pos: { x: 5, y: 5 },
        hp: 0,
        idHead: 1,
        idBody: 1,
        inv: {},
        rankedMatchId: "test",
        huntersGame: true,
        attrFuerza: 18,
        attrAgilidad: 18,
        bkAttrFuerza: 18,
        bkAttrAgilidad: 18,
    };
    vars.personajes[user.id] = user;
    cached.exports = {
        ...hunters,
        onUserDied: () => notifications.push("eliminación sin baja"),
        onUserKilled: (killer: string, victim: string) => notifications.push(`${killer}:${victim}`),
    };
    try {
        game.putBodyAndHeadDead(user.id, "killer");
        assert.deepEqual(notifications, ["killer:hunter-death"]);
    } finally {
        cached.exports = original;
        delete vars.personajes[user.id];
    }
});
