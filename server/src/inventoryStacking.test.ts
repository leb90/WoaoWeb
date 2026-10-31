import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import type { InventoryRecord, RuntimeClient } from "./types/runtime";

const vars = require("./vars");
const { loadObjectsDataFromJsonFile } = require("./objectData");
vars.datObj = loadObjectsDataFromJsonFile(path.resolve(__dirname, "../jsons/objs.json"));
const game = require("./game");
const handleProtocol = require("./handleProtocol");
const MATADRAGONES = 402;
const RED_POTION = 38;
const TEST_MAP = 99999;
const TEST_USER = "inventory-stacking-test";

async function withInventory(
    inventory: InventoryRecord,
    run: (client: RuntimeClient, messages: string[], updates: number[]) => Promise<void>,
) {
    const client = { id: TEST_USER, OPEN: 1, readyState: 1 } as RuntimeClient;
    const messages: string[] = [];
    const updates: number[] = [];
    const originals = {
        console: handleProtocol.console,
        agregarUserInvItem: handleProtocol.agregarUserInvItem,
        loopAreaPos: game.loopAreaPos,
    };
    vars.personajes[TEST_USER] = { id: TEST_USER, map: TEST_MAP, pos: { x: 1, y: 1 }, inv: inventory };
    vars.clients[TEST_USER] = client;
    vars.mapa[TEST_MAP] = { "1": { "1": {} } };
    handleProtocol.console = (message: string) => messages.push(message);
    handleProtocol.agregarUserInvItem = (_id: unknown, slot: number) => updates.push(slot);
    game.loopAreaPos = () => undefined;
    try {
        await run(client, messages, updates);
    } finally {
        Object.assign(handleProtocol, { console: originals.console, agregarUserInvItem: originals.agregarUserInvItem });
        game.loopAreaPos = originals.loopAreaPos;
        delete vars.personajes[TEST_USER];
        delete vars.clients[TEST_USER];
        delete vars.mapa[TEST_MAP];
        delete vars.floorItems[`${TEST_MAP}:1:1`];
    }
}

test("recoger sucesivamente la misma mejora actualiza una sola pila", async () => {
    for (let rarity = 0; rarity <= 3; rarity++) {
        const inventory: InventoryRecord = {
            "1": { idItem: MATADRAGONES, cant: 1, equipped: 0, rarity },
            "23": { idItem: MATADRAGONES, cant: 1, equipped: 1, rarity },
        };
        await withInventory(inventory, async (client, messages, updates) => {
            for (let drop = 0; drop < 3; drop++) {
                game.placeDroppedFloorItem(TEST_MAP, { x: 1, y: 1 }, MATADRAGONES, 1, rarity);
                await game.agarrarItem(client);
                assert.equal(vars.mapa[TEST_MAP][1][1].objInfo, undefined);
            }
            assert.equal(inventory["1"].cant, 4);
            assert.equal(inventory["23"].cant, 1);
            assert.deepEqual(Object.keys(inventory), ["1", "23"]);
            assert.deepEqual(updates, [1, 1, 1]);
            assert.deepEqual(messages, []);
        });
    }
});

test("recoger otra mejora la separa y una pila llena distribuye el sobrante", async () => {
    const inventory: InventoryRecord = {
        "1": { idItem: MATADRAGONES, cant: 9999, equipped: 0, rarity: 2 },
    };
    await withInventory(inventory, async (client, messages) => {
        game.placeDroppedFloorItem(TEST_MAP, { x: 1, y: 1 }, MATADRAGONES, 3, 2);
        await game.agarrarItem(client);
        assert.equal(inventory["1"].cant, 10000);
        assert.equal(inventory["2"].cant, 2);
        assert.equal(inventory["2"].rarity, 2);

        game.placeDroppedFloorItem(TEST_MAP, { x: 1, y: 1 }, MATADRAGONES, 1, 1);
        await game.agarrarItem(client);
        assert.equal(inventory["3"].cant, 1);
        assert.equal(inventory["3"].rarity, 1);
        assert.deepEqual(messages, []);
    });
});

test("con la mochila llena se recoge la misma mejora; si no cabe queda en el piso", async () => {
    const inventory: InventoryRecord = {};
    for (let slot = 1; slot <= 21; slot++) inventory[String(slot)] = { idItem: RED_POTION, cant: 1, equipped: 0 };
    inventory["1"] = { idItem: MATADRAGONES, cant: 9998, equipped: 0, rarity: 2 };
    await withInventory(inventory, async (client, messages) => {
        game.placeDroppedFloorItem(TEST_MAP, { x: 1, y: 1 }, MATADRAGONES, 1, 2);
        await game.agarrarItem(client);
        assert.equal(inventory["1"].cant, 9999);
        assert.equal(vars.mapa[TEST_MAP][1][1].objInfo, undefined);

        const before = structuredClone(inventory);
        for (const [amount, rarity] of [[2, 2], [1, 1]]) {
            game.placeDroppedFloorItem(TEST_MAP, { x: 1, y: 1 }, MATADRAGONES, amount, rarity);
            await game.agarrarItem(client);
            assert.deepEqual(inventory, before);
            assert.equal(vars.mapa[TEST_MAP][1][1].objInfo.amount, amount);
            assert.equal(vars.mapa[TEST_MAP][1][1].objInfo.rarity, rarity);
        }
        assert.equal(messages.length, 2);
    });
});

test("entregar varias unidades mejoradas usa pilas de 10000 y conserva la rareza", async () => {
    const inventory: InventoryRecord = {};
    await withInventory(inventory, async (_client, messages) => {
        game.putItemToInv(TEST_USER, MATADRAGONES, 10002, 2);
        assert.equal(inventory["1"].cant, 10000);
        assert.equal(inventory["2"].cant, 2);
        assert.equal(inventory["1"].rarity, 2);
        assert.equal(inventory["2"].rarity, 2);
        assert.equal(Object.keys(inventory).length, 2);
        assert.deepEqual(messages, []);
    });
});
