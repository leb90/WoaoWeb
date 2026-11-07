import assert from "node:assert/strict";
import test from "node:test";
const vars = require("./vars");
const game = require("./game");
const npcs = require("./npcs");
const protocol = require("./handleProtocol");

test("oro base y drop monetario pagan una vez por muerte y se reparten al jugador", () => {
    const originals = { console: protocol.console, actGold: protocol.actGold };
    protocol.console = () => {};
    protocol.actGold = () => {};
    const previousObjs = vars.datObj;
    vars.datObj = { 12: { objType: vars.objType.dinero } };
    vars.personajes.reward = { id: "reward", gold: 0, map: 1, pos: { x: 1, y: 1 }, inv: {} };
    vars.clients.reward = { id: "reward" };
    vars.multiplicadorGold = 3;
    try {
        vars.npcs.reward = { id: "reward", gold: 100, drop: [], map: 1, pos: { x: 1, y: 1 }, exp: 0, maxHp: 1 };
        npcs.tirarItems("reward", vars.clients.reward);
        assert.equal(vars.personajes.reward.gold, 300);
        npcs.tirarItems("reward", vars.clients.reward);
        assert.equal(vars.personajes.reward.gold, 300);
        vars.npcs.reward = {
            id: "reward",
            gold: 100,
            drop: [{ item: 12, cant: 10, chancePercent: 100 }],
            map: 1,
            pos: { x: 1, y: 1 },
            exp: 0,
            maxHp: 1,
        };
        npcs.tirarItems("reward", vars.clients.reward);
        npcs.tirarItems("reward", vars.clients.reward);
        assert.equal(vars.personajes.reward.gold, 630);
    } finally {
        Object.assign(protocol, originals);
        vars.datObj = previousObjs;
        delete vars.personajes.reward;
        delete vars.clients.reward;
        delete vars.npcs.reward;
    }
});
