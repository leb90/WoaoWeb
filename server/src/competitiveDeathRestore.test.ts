import assert from "node:assert/strict";
import test from "node:test";
test("el cierre de una ronda puede restaurar vida sin que la muerte posterior vuelva a ponerla en cero", () => {
    const vars = require("./vars"),
        game = require("./game"),
        protocol = require("./handleProtocol");
    const originals = {
        body: game.putBodyAndHeadDead,
        check: game.checkUserLevel,
        reset: game.resetFuerzaAgilidadBuffs,
        log: game.logCharacterActivity,
        console: protocol.console,
        hp: protocol.updateHP,
    };
    vars.personajes["restore-a"] = {
        id: "restore-a",
        nameCharacter: "A",
        rankedMatchId: "test-match",
        rankedTeam: "A",
        hp: 200,
        maxHp: 200,
        exp: 0,
        gold: 10,
        map: 1,
        pos: { x: 1, y: 1 },
        inv: {},
    };
    vars.personajes["restore-b"] = {
        id: "restore-b",
        nameCharacter: "B",
        rankedMatchId: "test-match",
        rankedTeam: "B",
        hp: 0,
        maxHp: 200,
        dead: 1,
        map: 1,
        pos: { x: 1, y: 2 },
        inv: {},
    };
    vars.clients["restore-a"] = { id: "restore-a" };
    vars.clients["restore-b"] = { id: "restore-b" };
    game.putBodyAndHeadDead = (id: string) =>
        Object.assign(vars.personajes[id], { hp: 200, dead: 0, rankedMatchId: null });
    game.checkUserLevel = () => {};
    game.resetFuerzaAgilidadBuffs = () => {};
    game.logCharacterActivity = () => {};
    protocol.console = () => {};
    protocol.updateHP = () => {};
    try {
        require("./respawn").muere(vars.clients["restore-a"], "restore-b");
        assert.equal(vars.personajes["restore-b"].hp, 200);
        assert.equal(vars.personajes["restore-b"].dead, 0);
        assert.equal(vars.personajes["restore-a"].gold, 10);
    } finally {
        game.putBodyAndHeadDead = originals.body;
        game.checkUserLevel = originals.check;
        game.resetFuerzaAgilidadBuffs = originals.reset;
        game.logCharacterActivity = originals.log;
        protocol.console = originals.console;
        protocol.updateHP = originals.hp;
        for (const id of ["restore-a", "restore-b"]) {
            delete vars.personajes[id];
            delete vars.clients[id];
        }
    }
});
