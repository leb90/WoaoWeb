import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DurableOutbox } from "./durableOutbox";
test("un premio pendiente sobrevive al reinicio y conserva su ID al reintentar", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "woao-outbox-"));
    const file = path.join(dir, "pending.json");
    try {
        const offline = new DurableOutbox(file, async () => {
            throw new Error("sin conexión");
        });
        offline.enqueue("reward-1", { amount: 8 });
        await offline.flush();
        assert.equal(offline.size, 1);
        let received = 0;
        const online = new DurableOutbox(file, async (id, payload) => {
            assert.equal(id, "reward-1");
            received += payload.amount;
        });
        online.enqueue("reward-1", { amount: 8 });
        await online.flush();
        await online.flush();
        assert.equal(received, 8);
        assert.equal(online.size, 0);
        assert.equal(new DurableOutbox(file, async () => {}).size, 0);
    } finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
