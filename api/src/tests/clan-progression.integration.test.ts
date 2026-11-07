import assert from "node:assert/strict";
import crypto from "node:crypto";
import { beforeAll, afterAll, test } from "vitest";
import pool from "../db";
import config from "../config";
import { initializeQuestWallet } from "../repositories/questWallets";
import {
    donateClanQuestPoints,
    upgradeClan,
    getClanProgression,
    importClanProgression,
} from "../repositories/clanProgression";
import { acceptClanRequest } from "../repositories/clans";
import { syncClanVault } from "../repositories/vaults";
let accountId: string;
let leader: string;
let member: string;
let clanId: string;
beforeAll(async () => {
    assert.match(new URL(config.databaseUrl).pathname, /_test$/);
    const key = crypto.randomUUID();
    accountId = (
        await pool.query("INSERT INTO accounts(name,email,password) VALUES($1,$2,'fixture') RETURNING id", [
            key,
            `${key}@fixture.invalid`,
        ])
    ).rows[0].id;
    const create = async () =>
        (
            await pool.query("INSERT INTO characters(account_id,name,level) VALUES($1,$2,40) RETURNING id", [
                accountId,
                crypto.randomUUID(),
            ])
        ).rows[0].id;
    leader = await create();
    member = await create();
    clanId = (
        await pool.query(
            "INSERT INTO clans(name,name_normalized,leader_character_id,alignment) VALUES($1,$1,$2,'citizen') RETURNING id",
            [key, leader],
        )
    ).rows[0].id;
    await pool.query("UPDATE characters SET clan_id=$1 WHERE id=ANY($2::uuid[])", [clanId, [leader, member]]);
    await pool.query("INSERT INTO clan_members(clan_id,character_id,role) VALUES($1,$2,'leader'),($1,$3,'member')", [
        clanId,
        leader,
        member,
    ]);
    await initializeQuestWallet({ characterId: member, legacyBalance: 100 });
    await pool.query("INSERT INTO clan_vaults(clan_id,gold) VALUES($1,300000)", [clanId]);
    await pool.query("INSERT INTO clan_vault_items(clan_id,id_pos,id_item,cant) VALUES($1,1,1095,1)", [clanId]);
});
afterAll(async () => {
    if (clanId) await pool.query("DELETE FROM clans WHERE id=$1", [clanId]);
    if (accountId) await pool.query("DELETE FROM accounts WHERE id=$1", [accountId]);
});
test("un miembro dona una vez, sólo líder compra y dos subidas del mismo nivel cobran una", async () => {
    const donation = { characterId: member, clanId, amount: 50, operationId: crypto.randomUUID() };
    await donateClanQuestPoints(donation);
    await donateClanQuestPoints(donation);
    assert.equal((await getClanProgression(clanId)).questPoints, 50);
    await assert.rejects(donateClanQuestPoints({ ...donation, amount: -1, operationId: crypto.randomUUID() }));
    await assert.rejects(
        upgradeClan({
            leaderCharacterId: member,
            clanId,
            expectedLevel: 1,
            expectedVaultRevision: 0,
            operationId: crypto.randomUUID(),
        }),
    );
    const payload = {
        leaderCharacterId: leader,
        clanId,
        expectedLevel: 1,
        expectedVaultRevision: 0,
        operationId: crypto.randomUUID(),
    };
    const settled = await Promise.allSettled([
        upgradeClan(payload),
        upgradeClan({ ...payload, operationId: crypto.randomUUID() }),
    ]);
    assert.equal(settled.filter((r) => r.status === "fulfilled").length, 1);
    const state = await getClanProgression(clanId);
    assert.equal(state.level, 2);
    assert.equal(state.maxMembers, 33);
    assert.equal(state.questPoints, 0);
    assert.equal(state.vaultGold, 0);
    assert.equal(state.materials[1095], undefined);
    await assert.rejects(
        syncClanVault(clanId, { expectedRevision: 0, gold: 300000, items: [{ idPos: 1, idItem: 1095, cant: 1 }] }),
    );
    assert.equal((await getClanProgression(clanId)).vaultGold, 0);
    const success = settled[0].status === "fulfilled" ? payload : null;
    if (success) assert.equal((await upgradeClan(payload)).applied, false);
});

test("dos aceptaciones disputan la última plaza; la migración conserva miembros y tope seis", async () => {
    const state = await getClanProgression(clanId);
    const cap = state.maxMembers;
    for (let i = 0; i < cap - 3; i++) {
        const id = (
            await pool.query("INSERT INTO characters(account_id,name,clan_id) VALUES($1,$2,$3) RETURNING id", [
                accountId,
                crypto.randomUUID(),
                clanId,
            ])
        ).rows[0].id;
        await pool.query("INSERT INTO clan_members(clan_id,character_id,role) VALUES($1,$2,'member')", [clanId, id]);
    }
    const requests: string[] = [];
    for (let i = 0; i < 2; i++) {
        const id = (
            await pool.query("INSERT INTO characters(account_id,name,level) VALUES($1,$2,40) RETURNING id", [
                accountId,
                crypto.randomUUID(),
            ])
        ).rows[0].id;
        requests.push(
            (
                await pool.query("INSERT INTO clan_requests(clan_id,character_id) VALUES($1,$2) RETURNING id", [
                    clanId,
                    id,
                ])
            ).rows[0].id,
        );
    }
    const result = await Promise.allSettled(
        requests.map((requestId) => acceptClanRequest({ reviewerCharacterId: leader, requestId })),
    );
    assert.equal(result.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
        Number((await pool.query("SELECT count(*) FROM clan_members WHERE clan_id=$1", [clanId])).rows[0].count),
        cap,
    );
    await pool.query("UPDATE clans SET progression_imported=FALSE WHERE id=$1", [clanId]);
    assert.equal((await importClanProgression({ clanId, legacyLevel: 43 })).level, 6);
    assert.equal((await importClanProgression({ clanId, legacyLevel: 1 })).level, 6);
    await assert.rejects(
        upgradeClan({
            leaderCharacterId: leader,
            clanId,
            expectedLevel: 6,
            expectedVaultRevision: state.vaultRevision,
            operationId: crypto.randomUUID(),
        }),
    );
});
