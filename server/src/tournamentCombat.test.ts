import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
test("el duelo del torneo permite rivales del mismo clan y protege a quienes esperan turno", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woao-tournament-"));
    process.env.WOAO_DATA_DIR = dir;
    const vars = require("./vars"),
        game = require("./game"),
        protocol = require("./handleProtocol"),
        funct = require("./functions");
    const original = {
        telep: game.telep,
        dismount: game.forceDismount,
        all: protocol.consoleToAll,
        console: protocol.console,
        fetch: funct.fetchUrl,
    };
    game.telep = (client: any, map: number, x: number, y: number) =>
        Object.assign(vars.personajes[client.id], { map, pos: { x, y } });
    game.forceDismount = () => {};
    protocol.consoleToAll = () => {};
    protocol.console = () => {};
    funct.fetchUrl = async () => {
        throw Error("API aislada");
    };
    const ids = ["tourney-a", "tourney-b", "tourney-c", "tourney-d"];
    for (const id of ids) {
        vars.personajes[id] = {
            id,
            _id: crypto.randomUUID(),
            nameCharacter: id,
            clanId: "same-clan",
            level: 50,
            map: 34,
            pos: { x: 50, y: 50 },
        };
        vars.clients[id] = { id };
    }
    const tournament = require("./tournamentAuto");
    try {
        assert.equal(tournament.startEvent(2).ok, true);
        for (const id of ids) tournament.joinEvent(id);
        assert.equal(game.getFriendlyFireBlockReason(ids[0], ids[1]), null);
        assert.match(game.getFriendlyFireBlockReason(ids[0], ids[2]), /turno|duelo/i);
        assert.equal(tournament.isTournamentCombat(ids[0], ids[1]), true);
        tournament.onUserDied(ids[1]);
        assert.equal(tournament.isTournamentCombat(ids[2], ids[3]), true);
        assert.equal(tournament.isTournamentCombat(ids[0], ids[2]), false);
    } finally {
        tournament.cancelEvent();
        game.telep = original.telep;
        game.forceDismount = original.dismount;
        protocol.consoleToAll = original.all;
        protocol.console = original.console;
        funct.fetchUrl = original.fetch;
        for (const id of ids) {
            delete vars.personajes[id];
            delete vars.clients[id];
        }
        await new Promise((r) => setTimeout(r, 20));
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
