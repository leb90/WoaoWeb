import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeAll, afterAll, test } from "vitest";
import pool from "../db";
import config from "../config";
import { initializeQuestWallet, mutateQuestWallet } from "../repositories/questWallets";
let accountId: string;
let characterId: string;
beforeAll(async () => {
    assert.match(new URL(config.databaseUrl).pathname, /_test$/, "Usar una base exclusiva de pruebas");
    const key = crypto.randomUUID();
    accountId = (
        await pool.query("INSERT INTO accounts(name,email,password) VALUES($1,$2,'fixture') RETURNING id", [
            key,
            `${key}@fixture.invalid`,
        ])
    ).rows[0].id;
    characterId = (
        await pool.query("INSERT INTO characters(account_id,name) VALUES($1,$2) RETURNING id", [accountId, key])
    ).rows[0].id;
});
afterAll(async () => {
    if (accountId) await pool.query("DELETE FROM accounts WHERE id=$1", [accountId]);
});
test("importa una vez y dos gastos concurrentes no pueden consumir el mismo saldo", async () => {
    assert.equal((await initializeQuestWallet({ characterId, legacyBalance: 100 })).balance, 100);
    const operations = [crypto.randomUUID(), crypto.randomUUID()];
    const settled = await Promise.allSettled(
        operations.map((operationId) => mutateQuestWallet({ characterId, operationId, delta: -80, reason: "test" })),
    );
    assert.equal(settled.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal((await initializeQuestWallet({ characterId, legacyBalance: 999 })).balance, 20);
    const success = settled.findIndex((r) => r.status === "fulfilled");
    const replay = await mutateQuestWallet({
        characterId,
        operationId: operations[success],
        delta: -80,
        reason: "test",
    });
    assert.equal(replay.applied, false);
    assert.equal(replay.balance, 20);
    await assert.rejects(
        mutateQuestWallet({ characterId, operationId: operations[success], delta: 10, reason: "test" }),
    );
});
