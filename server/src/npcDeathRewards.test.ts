import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("la muerte completa de un NPC paga oro base y drop monetario una sola vez", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woao-npc-death-"));
    process.env.WOAO_DATA_DIR = dir;
    const vars = require("./vars"),
        game = require("./game"),
        npcs = require("./npcs"),
        protocol = require("./handleProtocol");
    const old = {
        muere: npcs.muereNpc,
        exp: game.distribuirExpRestanteNpc,
        log: game.logCharacterActivity,
        console: protocol.console,
        gold: protocol.actGold,
    };
    vars.datObj[12] = { name: "Oro", objType: vars.objType.dinero };
    vars.multiplicadorGold = 3;
    vars.personajes["reward-player"] = {
        id: "reward-player",
        nameCharacter: "Prueba",
        map: 1,
        pos: { x: 1, y: 1 },
        gold: 0,
        inv: {},
        npcMatados: 0,
    };
    vars.clients["reward-player"] = { id: "reward-player" };
    vars.npcs["reward-npc"] = {
        id: "reward-npc",
        nameCharacter: "Criatura",
        isNpc: true,
        map: 1,
        pos: { x: 1, y: 2 },
        hp: 0,
        maxHp: 100,
        exp: 0,
        gold: 100,
        drop: [{ item: 12, cant: 10, chancePercent: 100 }],
    };
    npcs.muereNpc = () => {};
    game.distribuirExpRestanteNpc = () => 0;
    game.logCharacterActivity = () => {};
    protocol.console = () => {};
    protocol.actGold = () => {};
    try {
        const death = require("./respawn");
        death.muere(vars.clients["reward-player"], "reward-npc");
        death.muere(vars.clients["reward-player"], "reward-npc");
        assert.equal(vars.personajes["reward-player"].gold, 330);
    } finally {
        npcs.muereNpc = old.muere;
        game.distribuirExpRestanteNpc = old.exp;
        game.logCharacterActivity = old.log;
        protocol.console = old.console;
        protocol.actGold = old.gold;
        delete vars.personajes["reward-player"];
        delete vars.clients["reward-player"];
        delete vars.npcs["reward-npc"];
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
