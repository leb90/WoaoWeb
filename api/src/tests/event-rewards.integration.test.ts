import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeAll, afterAll, test } from "vitest";
import pool from "../db";
import config from "../config";
import { initializeQuestWallet } from "../repositories/questWallets";
import { registerEventRun, grantEventReward } from "../repositories/eventRewards";
const accounts: string[] = [];
const ids: string[] = [];
const runs: string[] = [];
beforeAll(async () => {
    assert.match(new URL(config.databaseUrl).pathname, /_test$/);
    for (let i = 0; i < 4; i++) {
        const key = crypto.randomUUID();
        const account = (
            await pool.query("INSERT INTO accounts(name,email) VALUES($1,$2) RETURNING id", [
                key,
                `${key}@fixture.invalid`,
            ])
        ).rows[0].id;
        accounts.push(account);
        const id = (
            await pool.query("INSERT INTO characters(account_id,name) VALUES($1,$2) RETURNING id", [account, key])
        ).rows[0].id;
        ids.push(id);
        await initializeQuestWallet({ characterId: id, legacyBalance: 0 });
    }
});
afterAll(async () => {
    await pool.query("DELETE FROM reward_event_runs WHERE id=ANY($1::uuid[])", [runs]);
    await pool.query("DELETE FROM accounts WHERE id=ANY($1::uuid[])", [accounts]);
});
test("campeón de cuatro cuentas cobra108 una vez y AFK no cobra", async () => {
    const runId = crypto.randomUUID();
    runs.push(runId);
    await registerEventRun({ runId, type: "tournament", startedAt: new Date().toISOString(), characterIds: ids });
    const prize = { runId, characterId: ids[0], kind: "champion", activity: true, operationId: crypto.randomUUID() };
    assert.equal((await grantEventReward(prize)).points, 108);
    assert.equal((await grantEventReward(prize)).applied, false);
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance, 108);
    assert.equal(
        (
            await grantEventReward({
                ...prize,
                characterId: ids[1],
                kind: "finalist",
                activity: false,
                operationId: crypto.randomUUID(),
            })
        ).points,
        0,
    );
});
test("Hunters premia una baja por cuenta víctima y no permite que la misma cuenta infle el evento", async () => {
    const runId = crypto.randomUUID();
    runs.push(runId);
    await registerEventRun({ runId, type: "huntersGame", startedAt: new Date().toISOString(), characterIds: ids });
    const prize = {
        runId,
        characterId: ids[0],
        kind: "kill",
        activity: true,
        victimCharacterId: ids[1],
        operationId: crypto.randomUUID(),
    };
    assert.equal((await grantEventReward(prize)).points, 3);
    assert.equal((await grantEventReward({ ...prize, operationId: crypto.randomUUID() })).points, 0);
    assert.equal(
        (await grantEventReward({ ...prize, victimCharacterId: ids[0], operationId: crypto.randomUUID() })).points,
        0,
    );
});
test("las demás recompensas usan la tabla y un cierre con otro ID tampoco vuelve a pagar", async () => {
    for (const [type, kind, points] of [
        ["tournament", "finalist", 30],
        ["huntersGame", "champion", 23],
        ["bloodCastle", "survivor", 170],
        ["factionWar", "win", 40],
        ["factionWar", "loss", 10],
        ["factionWar", "mvp-damage", 15],
    ] as const) {
        const runId = crypto.randomUUID();
        runs.push(runId);
        await registerEventRun({ runId, type, startedAt: new Date().toISOString(), characterIds: ids });
        const payload = {
            runId,
            kind,
            characterId: ids[2],
            activity: true,
            completed: true,
            operationId: crypto.randomUUID(),
        };
        assert.equal((await grantEventReward(payload)).points, points);
        assert.equal((await grantEventReward({ ...payload, operationId: crypto.randomUUID() })).points, 0);
    }
    const runId = crypto.randomUUID();
    runs.push(runId);
    await registerEventRun({
        runId,
        type: "tournament",
        startedAt: new Date().toISOString(),
        characterIds: ids.slice(0, 3),
    });
    assert.equal(
        (
            await grantEventReward({
                runId,
                characterId: ids[0],
                kind: "champion",
                activity: true,
                operationId: crypto.randomUUID(),
            })
        ).points,
        0,
    );
});
