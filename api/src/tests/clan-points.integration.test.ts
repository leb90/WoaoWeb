import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "vitest";
import pool from "../db";
import { CASTLE_REWARD_INTERVAL_MS } from "../lib/clanPointConfig";
import {
    awardDueCastleClanPoints,
    captureClanCastle,
    transferClanPointForPvp,
} from "../repositories/clanPoints";

const DAY_MS = 24 * 60 * 60 * 1000;

type TestCharacter = {
    id: string;
    name: string;
};

type ClanFixture = {
    clanId: string;
    leader: TestCharacter;
    member: TestCharacter;
    outsider: TestCharacter;
};

function uniqueSuffix(): string {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

async function createTestCharacter(prefix: string): Promise<TestCharacter> {
    const suffix = uniqueSuffix();
    const account = await pool.query<{ id: string }>(
        `
            INSERT INTO accounts (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id
        `,
        [`Acct ${suffix}`.slice(0, 15), `clan-points-${suffix}@local.test`, "test"],
    );
    const name = `${prefix} ${suffix}`.slice(0, 15);
    const character = await pool.query<{ id: string; name: string }>(
        `
            INSERT INTO characters (
                account_id,
                name,
                id_clase,
                level,
                gold,
                hp,
                max_hp,
                id_head,
                id_raza,
                id_genero
            )
            VALUES ($1, $2, 3, 30, 1600000, 100, 100, 1, 1, 1)
            RETURNING id, name
        `,
        [account.rows[0]?.id, name],
    );

    return character.rows[0]!;
}

async function createClanFixture(): Promise<ClanFixture> {
    const leader = await createTestCharacter("Lead");
    const member = await createTestCharacter("Memb");
    const outsider = await createTestCharacter("Outs");
    const suffix = uniqueSuffix();
    const clanName = `Clan ${suffix}`.slice(0, 18);
    const clan = await pool.query<{ id: string }>(
        `
            INSERT INTO clans (
                name,
                name_normalized,
                leader_character_id,
                alignment,
                min_join_level,
                points
            )
            VALUES ($1, $2, $3, 'citizen', 1, 0)
            RETURNING id
        `,
        [clanName, clanName.toLowerCase(), leader.id],
    );
    const clanId = clan.rows[0]!.id;

    await pool.query(
        `
            UPDATE characters
            SET clan_id = $1
            WHERE id = ANY($2::uuid[])
        `,
        [clanId, [leader.id, member.id]],
    );
    await pool.query(
        `
            INSERT INTO clan_members (clan_id, character_id, role)
            VALUES
                ($1, $2, 'leader'),
                ($1, $3, 'member')
        `,
        [clanId, leader.id, member.id],
    );

    return { clanId, leader, member, outsider };
}

async function createClanWarFixture(): Promise<{
    attackerClan: ClanFixture;
    victimClan: ClanFixture;
}> {
    const attackerClan = await createClanFixture();
    const victimClan = await createClanFixture();
    return { attackerClan, victimClan };
}

async function setClanPoints(clanId: string, points: number): Promise<void> {
    await pool.query(
        `
            UPDATE clans
            SET points = $2
            WHERE id = $1
        `,
        [clanId, points],
    );
}

async function getClanPoints(clanId: string): Promise<number> {
    const result = await pool.query<{ points: number }>(
        `
            SELECT points
            FROM clans
            WHERE id = $1
        `,
        [clanId],
    );
    return Number(result.rows[0]?.points ?? 0);
}

async function setClanMembersJoinedAt(
    clanId: string,
    joinedAt: Date,
): Promise<void> {
    await pool.query(
        `
            UPDATE clan_members
            SET joined_at = $2
            WHERE clan_id = $1
        `,
        [clanId, joinedAt],
    );
}

async function getMemberStats(characterId: string): Promise<{
    won: number;
    lost: number;
}> {
    const result = await pool.query<{
        season_points_won: number;
        season_points_lost: number;
    }>(
        `
            SELECT season_points_won, season_points_lost
            FROM clan_members
            WHERE character_id = $1
        `,
        [characterId],
    );
    return {
        won: Number(result.rows[0]?.season_points_won ?? 0),
        lost: Number(result.rows[0]?.season_points_lost ?? 0),
    };
}

async function resetCastleStates(): Promise<void> {
    await pool.query(
        `
            UPDATE clan_castle_states
            SET owner_clan_id = NULL,
                owner_clan_name = '',
                captured_at = NULL,
                next_reward_at = NULL,
                updated_at = NOW()
        `,
    );
}

async function prepareEligibleWar(
    attackerClan: ClanFixture,
    victimClan: ClanFixture,
    options?: { victimPoints?: number; now?: Date },
): Promise<Date> {
    const now = options?.now ?? new Date();
    const joinedAt = new Date(now.getTime() - DAY_MS - 60_000);
    await setClanMembersJoinedAt(attackerClan.clanId, joinedAt);
    await setClanMembersJoinedAt(victimClan.clanId, joinedAt);
    await setClanPoints(attackerClan.clanId, 0);
    await setClanPoints(victimClan.clanId, options?.victimPoints ?? 2);
    return now;
}

test("PvP transfiere 1 punto entre clanes elegibles y actualiza stats", async () => {
    const { attackerClan, victimClan } = await createClanWarFixture();
    const now = await prepareEligibleWar(attackerClan, victimClan);

    const result = await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now },
    );

    assert.equal(result.transferred, true);
    assert.equal(await getClanPoints(attackerClan.clanId), 1);
    assert.equal(await getClanPoints(victimClan.clanId), 1);
    assert.deepEqual(await getMemberStats(attackerClan.leader.id), {
        won: 1,
        lost: 0,
    });
    assert.deepEqual(await getMemberStats(victimClan.leader.id), {
        won: 0,
        lost: 1,
    });
});

test("PvP no transfiere si el clan victima no tiene puntos", async () => {
    const { attackerClan, victimClan } = await createClanWarFixture();
    const now = await prepareEligibleWar(attackerClan, victimClan, {
        victimPoints: 0,
    });

    const result = await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now },
    );

    assert.equal(result.transferred, false);
    assert.equal(result.reason, "victim_clan_without_points");
    assert.equal(await getClanPoints(attackerClan.clanId), 0);
    assert.equal(await getClanPoints(victimClan.clanId), 0);
});

test("PvP no transfiere entre miembros del mismo clan", async () => {
    const fixture = await createClanFixture();
    const now = new Date();
    await setClanMembersJoinedAt(
        fixture.clanId,
        new Date(now.getTime() - DAY_MS - 60_000),
    );
    await setClanPoints(fixture.clanId, 5);

    const result = await transferClanPointForPvp(
        {
            killerCharacterId: fixture.leader.id,
            victimCharacterId: fixture.member.id,
        },
        { now },
    );

    assert.equal(result.transferred, false);
    assert.equal(result.reason, "same_clan");
    assert.equal(await getClanPoints(fixture.clanId), 5);
});

test("PvP no transfiere si alguno no pertenece a un clan", async () => {
    const fixture = await createClanFixture();
    const now = new Date();
    await setClanMembersJoinedAt(
        fixture.clanId,
        new Date(now.getTime() - DAY_MS - 60_000),
    );
    await setClanPoints(fixture.clanId, 3);

    const result = await transferClanPointForPvp(
        {
            killerCharacterId: fixture.leader.id,
            victimCharacterId: fixture.outsider.id,
        },
        { now },
    );

    assert.equal(result.transferred, false);
    assert.equal(result.reason, "missing_clan");
    assert.equal(await getClanPoints(fixture.clanId), 3);
});

test("PvP respeta la proteccion de 24 horas desde ingreso al clan", async () => {
    const { attackerClan, victimClan } = await createClanWarFixture();
    const now = new Date();
    await setClanMembersJoinedAt(attackerClan.clanId, now);
    await setClanMembersJoinedAt(
        victimClan.clanId,
        new Date(now.getTime() - DAY_MS - 60_000),
    );
    await setClanPoints(attackerClan.clanId, 0);
    await setClanPoints(victimClan.clanId, 2);

    const result = await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now },
    );

    assert.equal(result.transferred, false);
    assert.equal(result.reason, "join_protection");
});

test("PvP aplica cooldown de 10 minutos por pareja killer-victima", async () => {
    const { attackerClan, victimClan } = await createClanWarFixture();
    const now = await prepareEligibleWar(attackerClan, victimClan, {
        victimPoints: 2,
    });

    const first = await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now },
    );
    const second = await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now: new Date(now.getTime() + 60_000) },
    );

    assert.equal(first.transferred, true);
    assert.equal(second.transferred, false);
    assert.equal(second.reason, "pair_cooldown");
    assert.equal(await getClanPoints(attackerClan.clanId), 1);
    assert.equal(await getClanPoints(victimClan.clanId), 1);
});

test("PvP permite volver a transferir despues del cooldown", async () => {
    const { attackerClan, victimClan } = await createClanWarFixture();
    const now = await prepareEligibleWar(attackerClan, victimClan, {
        victimPoints: 2,
    });

    await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now },
    );
    const second = await transferClanPointForPvp(
        {
            killerCharacterId: attackerClan.leader.id,
            victimCharacterId: victimClan.leader.id,
        },
        { now: new Date(now.getTime() + 10 * 60_000 + 1) },
    );

    assert.equal(second.transferred, true);
    assert.equal(await getClanPoints(attackerClan.clanId), 2);
    assert.equal(await getClanPoints(victimClan.clanId), 0);
});

test("PvP concurrente no deja puntos negativos", async () => {
    const { attackerClan, victimClan } = await createClanWarFixture();
    const now = await prepareEligibleWar(attackerClan, victimClan, {
        victimPoints: 1,
    });

    const results = await Promise.all([
        transferClanPointForPvp(
            {
                killerCharacterId: attackerClan.leader.id,
                victimCharacterId: victimClan.leader.id,
            },
            { now },
        ),
        transferClanPointForPvp(
            {
                killerCharacterId: attackerClan.member.id,
                victimCharacterId: victimClan.leader.id,
            },
            { now },
        ),
    ]);

    assert.equal(results.filter((result) => result.transferred).length, 1);
    assert.equal(await getClanPoints(attackerClan.clanId), 1);
    assert.equal(await getClanPoints(victimClan.clanId), 0);
});

test("Capturar castillo reinicia timer y no paga antes de 60 minutos", async () => {
    const fixture = await createClanFixture();
    const base = new Date("2026-01-01T00:00:00.000Z");
    await resetCastleStates();
    await setClanPoints(fixture.clanId, 0);

    await captureClanCastle(
        {
            castleId: "norte",
            ownerClanId: fixture.clanId,
            ownerClanName: "Norte Test",
        },
        { now: base },
    );
    const award = await awardDueCastleClanPoints({
        now: new Date(base.getTime() + CASTLE_REWARD_INTERVAL_MS - 1),
    });

    assert.equal(award.awards.length, 0);
    assert.equal(await getClanPoints(fixture.clanId), 0);
});

test("Castillo comun paga 3 puntos por hora completa", async () => {
    const fixture = await createClanFixture();
    const base = new Date("2026-01-02T00:00:00.000Z");
    await resetCastleStates();
    await setClanPoints(fixture.clanId, 0);

    await captureClanCastle(
        {
            castleId: "sur",
            ownerClanId: fixture.clanId,
            ownerClanName: "Sur Test",
        },
        { now: base },
    );
    const award = await awardDueCastleClanPoints({
        now: new Date(base.getTime() + CASTLE_REWARD_INTERVAL_MS),
    });

    assert.equal(award.awards.length, 1);
    assert.equal(award.awards[0]?.amount, 3);
    assert.equal(await getClanPoints(fixture.clanId), 3);
});

test("Fortaleza paga 4 puntos por hora y recupera intervalos tras reinicio", async () => {
    const fixture = await createClanFixture();
    const base = new Date("2026-01-03T00:00:00.000Z");
    await resetCastleStates();
    await setClanPoints(fixture.clanId, 0);

    await captureClanCastle(
        {
            castleId: "fortaleza",
            ownerClanId: fixture.clanId,
            ownerClanName: "Fort Test",
        },
        { now: base },
    );
    const award = await awardDueCastleClanPoints({
        now: new Date(base.getTime() + 3 * CASTLE_REWARD_INTERVAL_MS),
    });

    assert.equal(award.awards.length, 1);
    assert.equal(award.awards[0]?.intervals, 3);
    assert.equal(award.awards[0]?.amount, 12);
    assert.equal(await getClanPoints(fixture.clanId), 12);
});

test("Nueva captura descarta progreso parcial del dueño anterior", async () => {
    const firstOwner = await createClanFixture();
    const secondOwner = await createClanFixture();
    const base = new Date("2026-01-04T00:00:00.000Z");
    await resetCastleStates();
    await setClanPoints(firstOwner.clanId, 0);
    await setClanPoints(secondOwner.clanId, 0);

    await captureClanCastle(
        {
            castleId: "oeste",
            ownerClanId: firstOwner.clanId,
            ownerClanName: "Oeste Uno",
        },
        { now: base },
    );
    await captureClanCastle(
        {
            castleId: "oeste",
            ownerClanId: secondOwner.clanId,
            ownerClanName: "Oeste Dos",
        },
        { now: new Date(base.getTime() + 30 * 60_000) },
    );

    const earlyAward = await awardDueCastleClanPoints({
        now: new Date(base.getTime() + CASTLE_REWARD_INTERVAL_MS),
    });
    assert.equal(earlyAward.awards.length, 0);
    assert.equal(await getClanPoints(firstOwner.clanId), 0);
    assert.equal(await getClanPoints(secondOwner.clanId), 0);

    const dueAward = await awardDueCastleClanPoints({
        now: new Date(base.getTime() + 90 * 60_000),
    });
    assert.equal(dueAward.awards.length, 1);
    assert.equal(dueAward.awards[0]?.clanId, secondOwner.clanId);
    assert.equal(dueAward.awards[0]?.amount, 3);
    assert.equal(await getClanPoints(firstOwner.clanId), 0);
    assert.equal(await getClanPoints(secondOwner.clanId), 3);
});
