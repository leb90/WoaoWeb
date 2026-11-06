import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeAll, afterAll, test } from "vitest";
import pool from "../db";
import config from "../config";
import { completeRankedMatch } from "../repositories/ranked";
import { initializeQuestWallet } from "../repositories/questWallets";
import { argentinaRewardDay } from "../repositories/rankedRewards";
const accounts: string[] = [];
const ids: string[] = [];
beforeAll(async () => {
    assert.match(new URL(config.databaseUrl).pathname, /_test$/);
    for (let i = 0; i < 5; i++) {
        const key = crypto.randomUUID();
        const account = (
            await pool.query("INSERT INTO accounts(name,email,password) VALUES($1,$2,'fixture') RETURNING id", [
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
test("la cuarta partida contra la misma cuenta no paga y el abandono propio tampoco", async () => {
    const before = (await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance;
    for (let i = 0; i < 4; i++)
        await completeRankedMatch({
            ...match(),
            startedAt: "2026-11-08T18:00:00.000Z",
            finishedAt: "2026-11-08T18:02:00.000Z",
        });
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance - before, 36);
    const abandoned = match();
    abandoned.participants[0].result = "abandoned";
    await completeRankedMatch({
        ...abandoned,
        startedAt: "2026-11-09T18:00:00.000Z",
        finishedAt: "2026-11-09T18:02:00.000Z",
    });
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance - before, 36);
});
test("dos primeras victorias concurrentes dan un bonus y el tope diario es 80", async () => {
    const before = (await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance;
    const make = (opponent: string) => {
        const m = match();
        m.startedAt = "2026-11-10T18:00:00.000Z";
        m.finishedAt = "2026-11-10T18:02:00.000Z";
        m.participants[1].characterId = opponent;
        m.metadata.activity = { [ids[0]]: 2, [opponent]: 2 };
        return m;
    };
    await Promise.all([completeRankedMatch(make(ids[1])), completeRankedMatch(make(ids[2]))]);
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance - before, 28);
    for (const i of [1, 1, 2, 2, 3, 3, 3, 4, 4, 4]) await completeRankedMatch(make(ids[i]));
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance - before, 80);
    const m = make(ids[3]);
    m.mode = "RANKED_2V2";
    m.participants.push({ ...m.participants[0], characterId: ids[2] }, { ...m.participants[1], characterId: ids[4] });
    m.metadata.activity = { [ids[0]]: 2, [ids[2]]: 2, [ids[3]]: 2, [ids[4]]: 2 };
    await completeRankedMatch(m);
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance - before, 80);
});
test("sin actividad y contra otra ficha propia no se cobran monedas", async () => {
    const m = match();
    m.startedAt = "2026-11-11T18:00:00.000Z";
    m.finishedAt = "2026-11-11T18:02:00.000Z";
    m.metadata.activity = {};
    const before = (await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance;
    await completeRankedMatch(m);
    await pool.query("UPDATE characters SET account_id=$2 WHERE id=$1", [ids[1], accounts[0]]);
    try {
        await completeRankedMatch({
            ...m,
            id: crypto.randomUUID(),
            metadata: { activity: { [ids[0]]: 3, [ids[1]]: 3 } },
        });
    } finally {
        await pool.query("UPDATE characters SET account_id=$2 WHERE id=$1", [ids[1], accounts[1]]);
    }
    assert.equal((await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance, before);
    assert.equal(argentinaRewardDay(new Date("2026-11-06T02:59:59Z")), "2026-11-05");
    assert.equal(argentinaRewardDay(new Date("2026-11-06T03:00:00Z")), "2026-11-06");
});
afterAll(async () => {
    await pool.query(
        "DELETE FROM ranked_matches WHERE id IN (SELECT match_id FROM ranked_match_participants WHERE character_id=ANY($1::uuid[]))",
        [ids],
    );
    await pool.query("DELETE FROM accounts WHERE id=ANY($1::uuid[])", [accounts]);
});
const match = () => ({
    id: crypto.randomUUID(),
    mode: "RANKED_1V1",
    arenaMapId: 211,
    startedAt: "2026-11-06T18:00:00.000Z",
    finishedAt: "2026-11-06T18:02:00.000Z",
    teamAEloBefore: 0,
    teamBEloBefore: 0,
    teamAEloAfter: 32,
    teamBEloAfter: 0,
    winnerTeam: "A",
    scoreA: 2,
    scoreB: 0,
    participants: [
        { characterId: ids[0], team: "A", eloBefore: 0, eloAfter: 32, eloDelta: 32, result: "win" },
        { characterId: ids[1], team: "B", eloBefore: 0, eloAfter: 0, eloDelta: 0, result: "loss" },
    ],
    metadata: { activity: { [ids[0]]: 2, [ids[1]]: 2 } },
});
test("ranked paga 20 en la primera victoria y 2 al perdedor; un reintento no duplica ELO ni monedas", async () => {
    const before = await Promise.all(
        ids.slice(0, 2).map((characterId) => initializeQuestWallet({ characterId, legacyBalance: 0 })),
    );
    const wins = Number(
        (await pool.query("SELECT wins FROM ranked_ratings WHERE character_id=$1 AND mode='RANKED_1V1'", [ids[0]]))
            .rows[0]?.wins ?? 0,
    );
    const payload = match();
    const first = await completeRankedMatch(payload);
    assert.equal(first.status, "COMPLETED");
    await completeRankedMatch(payload);
    assert.equal(
        (await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance,
        before[0].balance + 20,
    );
    assert.equal(
        (await initializeQuestWallet({ characterId: ids[1], legacyBalance: 0 })).balance,
        before[1].balance + 2,
    );
    assert.equal(
        (await pool.query("SELECT wins FROM ranked_ratings WHERE character_id=$1 AND mode='RANKED_1V1'", [ids[0]]))
            .rows[0].wins,
        wins + 1,
    );
    await assert.rejects(completeRankedMatch({ ...payload, winnerTeam: "B" }));
    await completeRankedMatch({ ...match(), finishedAt: "2026-11-06T18:00:30.000Z" });
    assert.equal(
        (await initializeQuestWallet({ characterId: ids[0], legacyBalance: 0 })).balance,
        before[0].balance + 20,
    );
});
