import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("entregar una misión con mochila llena apila premios y confirma EXP, oro y Quest una sola vez", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woao-quest-turnin-"));
    process.env.WOAO_DATA_DIR = dir;
    const vars = require("./vars"),
        game = require("./game"),
        protocol = require("./handleProtocol"),
        socket = require("./socket"),
        funct = require("./functions");
    vars.datObj = require("./objectData").loadObjectsDataFromJsonFile(
        path.resolve(__dirname, "../jsons/objs.json"),
    );
    const original = {
        check: game.checkUserLevel,
        send: protocol.sendMyCharacter,
        console: protocol.console,
        gold: protocol.actGold,
        quests: protocol.questState,
        socket: socket.send,
        random: Math.random,
        fetch: funct.fetchUrl,
    };
    const user: any = {
        id: "quest-test",
        _id: "quest-test",
        level: 50,
        map: 1,
        pos: { x: 50, y: 50 },
        gold: 100,
        exp: 0,
        inv: Object.fromEntries(
            Array.from({ length: 21 }, (_, i) => [
                i + 1,
                { idItem: 37, cant: 10000, equipped: 0 },
            ]),
        ),
    };
    vars.personajes[user.id] = user;
    vars.clients[user.id] = { id: user.id };
    game.checkUserLevel = () => {};
    protocol.sendMyCharacter = () => {};
    protocol.console = () => {};
    protocol.actGold = () => {};
    protocol.questState = () => {};
    socket.send = () => {};
    Math.random = () => 0;
    let credited = 0;
    funct.fetchUrl = async (route: string, options: any) => {
        if (route.endsWith("mutate"))
            credited += JSON.parse(options.body).delta;
        return { balance: credited, version: 1 };
    };
    const progress = require("./woaoProgress").getProgress(user);
    progress.quests = [{ questIndex: 2, npcsKilled: [8, 10] }];
    const quests = require("./quests");
    quests.initialize();
    try {
        quests.finishQuest(user.id, 2);
        assert.equal(user.gold, 100);
        assert.equal(user.exp, 0);
        assert.equal(progress.quests.length, 1);
        user.inv[20] = { idItem: 400, cant: 3, rarity: 3, equipped: 0 };
        user.inv[21] = { idItem: 756, cant: 4, rarity: 3, equipped: 0 };
        quests.finishQuest(user.id, 2);
        quests.finishQuest(user.id, 2);
        await new Promise((resolve) => setTimeout(resolve, 20));
        assert.equal(user.inv[20].cant, 4);
        assert.equal(user.inv[21].cant, 5);
        assert.equal(user.gold, 350);
        assert.equal(user.exp, 5960);
        assert.equal(credited, 3);
        assert.equal(progress.quests.length, 0);
    } finally {
        game.checkUserLevel = original.check;
        protocol.sendMyCharacter = original.send;
        protocol.console = original.console;
        protocol.actGold = original.gold;
        protocol.questState = original.quests;
        socket.send = original.socket;
        Math.random = original.random;
        funct.fetchUrl = original.fetch;
        delete vars.personajes[user.id];
        delete vars.clients[user.id];
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
