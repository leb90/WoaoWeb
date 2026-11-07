import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("un canje con respuesta perdida reintenta el mismo débito y conserva una entrega", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woao-purchase-"));
    process.env.WOAO_DATA_DIR = dir;
    const funct = require("./functions");
    const original = funct.fetchUrl;
    const receipts = new Set();
    let calls = 0;
    funct.fetchUrl = async (_route: string, { body }: any) => {
        const p = JSON.parse(body);
        receipts.add(p.operationId);
        if (++calls === 1) throw new Error("respuesta perdida después del commit");
        return { balance: 50, version: 1 };
    };
    try {
        const purchases = require("./questPurchases"),
            progress = require("./woaoProgress");
        const user = { _id: "purchase-user" };
        const payload = {
            characterId: user._id,
            cost: 50,
            objIndex: 100,
            amount: 1,
            rarity: 2,
            reason: "Canje de prueba",
        };
        assert.equal(await purchases.queueQuestPurchase("purchase-1", payload), "pending");
        await purchases.flushQuestPurchases();
        await purchases.flushQuestPurchases();
        assert.equal(receipts.size, 1);
        assert.equal(progress.getProgress(user).pendingDeliveries.length, 1);
        assert.equal(progress.getProgress(user).pendingDeliveries[0].rarity, 2);
        assert.equal(progress.getProgress(user).puntosCanje, 50);
    } finally {
        funct.fetchUrl = original;
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
