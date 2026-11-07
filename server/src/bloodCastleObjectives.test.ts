import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

test("Blood Castle sólo termina por sus objetivos del mapa205 y después del guardián", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woao-blood-"));
    process.env.WOAO_DATA_DIR = dir;
    const vars = require("./vars"),
        game = require("./game"),
        protocol = require("./handleProtocol"),
        funct = require("./functions");
    const original = {
        telep: game.telep,
        forceDismount: game.forceDismount,
        console: protocol.console,
        all: protocol.consoleToAll,
        fetch: funct.fetchUrl,
        now: Date.now,
    };
    const messages: string[] = [];
    let now = Date.now();
    let exits = 0;
    game.telep = (_client: unknown, map: number) => {
        if (map === 34) exits++;
    };
    game.forceDismount = () => {};
    protocol.console = () => {};
    protocol.consoleToAll = (message: string) => messages.push(message);
    funct.fetchUrl = async () => {
        throw new Error("API aislada");
    };
    Date.now = () => now;
    vars.personajes.blood = { id: "blood", _id: crypto.randomUUID(), level: 30, map: 205, hp: 100, inv: {} };
    vars.clients.blood = { id: "blood" };
    const blood = require("./bloodCastle");
    try {
        assert.equal(blood.startEvent(1).ok, true);
        assert.equal(blood.joinEvent("blood").ok, true);
        messages.length = 0;
        blood.onNpcDied(778, 6);
        assert.equal(messages.length, 0, "un jefe de otro mapa no termina Blood Castle");
        blood.onNpcDied(778, 205);
        assert.equal(messages.length, 0, "primero debe morir el guardián");
        blood.onNpcDied(779, 205);
        blood.onNpcDied(778, 205);
        assert.equal(messages.filter((m) => m.includes("rey Archavon")).length, 1);
        now += 10001;
        blood.tick();
        blood.tick();
        assert.equal(exits, 1);
    } finally {
        blood.cancelEvent();
        game.telep = original.telep;
        game.forceDismount = original.forceDismount;
        protocol.console = original.console;
        protocol.consoleToAll = original.all;
        funct.fetchUrl = original.fetch;
        Date.now = original.now;
        delete vars.personajes.blood;
        delete vars.clients.blood;
        await new Promise((resolve) => setTimeout(resolve, 10));
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
