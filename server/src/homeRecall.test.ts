import assert from "node:assert/strict";
import test from "node:test";

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const homeRecall = require("./homeRecall");

const ID = "home-recall-test";

function withRecallUser(run: (user: any, messages: string[], completed: () => number) => void) {
    const messages: string[] = [];
    const originalConsole = handleProtocol.console;
    const previousUser = vars.personajes[ID];
    const previousClient = vars.clients[ID];
    let completions = 0;

    handleProtocol.console = (message: string) => messages.push(message);
    vars.personajes[ID] = { id: ID, map: 34, pos: { x: 50, y: 50 }, dead: 0 };
    vars.clients[ID] = { id: ID };

    try {
        homeRecall.startHomeRecall(ID, () => completions++, 1_000);
        run(vars.personajes[ID], messages, () => completions);
    } finally {
        homeRecall.cancelHomeRecall(ID);
        handleProtocol.console = originalConsole;
        vars.personajes[ID] = previousUser;
        vars.clients[ID] = previousClient;
    }
}

test("/hogar con vida vuelve tras 30 segundos quieto", () => {
    withRecallUser((_user, messages, completed) => {
        homeRecall.tickHomeRecalls(1_000 + 10_000);
        homeRecall.tickHomeRecalls(1_000 + 20_000);
        homeRecall.tickHomeRecalls(1_000 + 29_000);
        assert.equal(completed(), 0);
        homeRecall.tickHomeRecalls(1_000 + 30_000);
        assert.equal(completed(), 1);
        assert.equal(homeRecall.isRecalling(ID), false);
        assert.ok(messages.some((m) => m.includes("10 segundos")));
    });
});

test("/hogar se corta al moverse", () => {
    withRecallUser((user, messages, completed) => {
        user.pos = { x: 51, y: 50 };
        homeRecall.tickHomeRecalls(2_000);
        homeRecall.tickHomeRecalls(31_000);
        assert.equal(completed(), 0);
        assert.ok(messages.some((m) => m.includes("te moviste")));
    });
});

test("/hogar se corta al recibir daño", () => {
    withRecallUser((user, messages, completed) => {
        user.lastAttackedAt = 5_000;
        homeRecall.tickHomeRecalls(5_000);
        homeRecall.tickHomeRecalls(31_000);
        assert.equal(completed(), 0);
        assert.ok(messages.some((m) => m.includes("te atacaron")));
    });
});

test("/hogar se corta al atacar o ser atacado aunque el golpe falle", () => {
    withRecallUser((_user, messages, completed) => {
        homeRecall.noteHostileAction("otro-jugador", ID, false);
        homeRecall.tickHomeRecalls(31_000);
        assert.equal(completed(), 0);
        assert.ok(messages.some((m) => m.includes("te atacaron")));
    });

    withRecallUser((_user, messages, completed) => {
        homeRecall.noteHostileAction(ID, "npc-1", true);
        homeRecall.tickHomeRecalls(31_000);
        assert.equal(completed(), 0);
        assert.ok(messages.some((m) => m.includes("atacaste")));
    });
});

test("/hogar no vuelve si el personaje murió durante el conteo", () => {
    withRecallUser((user, _messages, completed) => {
        user.dead = 1;
        homeRecall.tickHomeRecalls(31_000);
        assert.equal(completed(), 0);
        assert.equal(homeRecall.isRecalling(ID), false);
    });
});
