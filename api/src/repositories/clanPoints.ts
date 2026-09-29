import { z } from "zod";
import type { PoolClient } from "pg";
import pool from "../db";
import {
    CASTLE_IDS,
    CASTLE_REWARD_INTERVAL_MS,
    CASTLE_REWARD_POINTS,
    CLAN_JOIN_PROTECTION_MS,
    CLAN_PVP_PAIR_COOLDOWN_MS,
    type CastleId,
} from "../lib/clanPointConfig";

const pvpKillSchema = z.object({
    killerCharacterId: z.string().uuid(),
    victimCharacterId: z.string().uuid(),
});

const castleCaptureSchema = z.object({
    castleId: z.enum(CASTLE_IDS),
    ownerClanId: z.string().uuid(),
    ownerClanName: z.string().trim().max(80).optional(),
});

type PvpCharacterRow = {
    id: string;
    name: string;
    clan_id: string | null;
    clan_name: string | null;
    joined_at: Date | null;
};

type ClanPointsRow = {
    id: string;
    points: number;
};

type CastleStateRow = {
    castle_id: CastleId;
    owner_clan_id: string | null;
    owner_clan_name: string;
    captured_at: Date | null;
    next_reward_at: Date | null;
    points_per_reward: number;
};

export type PvpClanPointTransferResult = {
    ok: true;
    transferred: boolean;
    reason?: string;
    killerCharacterId: string;
    victimCharacterId: string;
    winnerClanId?: string;
    winnerClanName?: string;
    loserClanId?: string;
    loserClanName?: string;
    winnerClanPoints?: number;
    loserClanPoints?: number;
};

export type ClanCastleCaptureResult = {
    ok: true;
    castleId: CastleId;
    ownerClanId: string;
    ownerClanName: string;
    capturedAt: string;
    nextRewardAt: string;
    pointsPerReward: number;
};

export type ClanCastleAward = {
    castleId: CastleId;
    clanId: string;
    clanName: string;
    amount: number;
    intervals: number;
    pointsPerReward: number;
    nextRewardAt: string;
    clanPoints: number;
};

export type ClanCastleAwardResult = {
    ok: true;
    awardedAt: string;
    awards: ClanCastleAward[];
};

function addMs(date: Date, ms: number): Date {
    return new Date(date.getTime() + ms);
}

function isOlderThan(date: Date | null | undefined, now: Date, ms: number): boolean {
    return Boolean(date && now.getTime() - date.getTime() >= ms);
}

function countDueIntervals(nextRewardAt: Date, now: Date): number {
    if (nextRewardAt.getTime() > now.getTime()) {
        return 0;
    }

    return Math.floor((now.getTime() - nextRewardAt.getTime()) / CASTLE_REWARD_INTERVAL_MS) + 1;
}

async function ensureCastleRows(client: PoolClient): Promise<void> {
    await client.query(
        `
            INSERT INTO clan_castle_states (castle_id, points_per_reward)
            VALUES
                ('norte', $1),
                ('sur', $2),
                ('este', $3),
                ('oeste', $4),
                ('fortaleza', $5)
            ON CONFLICT (castle_id) DO UPDATE
            SET points_per_reward = EXCLUDED.points_per_reward,
                updated_at = NOW()
        `,
        [
            CASTLE_REWARD_POINTS.norte,
            CASTLE_REWARD_POINTS.sur,
            CASTLE_REWARD_POINTS.este,
            CASTLE_REWARD_POINTS.oeste,
            CASTLE_REWARD_POINTS.fortaleza,
        ],
    );
}

async function commitNoTransfer(
    client: PoolClient,
    parsed: z.infer<typeof pvpKillSchema>,
    reason: string,
): Promise<PvpClanPointTransferResult> {
    await client.query("COMMIT");
    return {
        ok: true,
        transferred: false,
        reason,
        killerCharacterId: parsed.killerCharacterId,
        victimCharacterId: parsed.victimCharacterId,
    };
}

export async function transferClanPointForPvp(
    payload: unknown,
    options?: { now?: Date },
): Promise<PvpClanPointTransferResult> {
    const parsed = pvpKillSchema.parse(payload);
    const now = options?.now ?? new Date();

    if (parsed.killerCharacterId === parsed.victimCharacterId) {
        return {
            ok: true,
            transferred: false,
            reason: "same_character",
            killerCharacterId: parsed.killerCharacterId,
            victimCharacterId: parsed.victimCharacterId,
        };
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const characters = await client.query<PvpCharacterRow>(
            `
                SELECT
                    c.id,
                    c.name,
                    c.clan_id,
                    cl.name AS clan_name,
                    cm.joined_at
                FROM characters c
                LEFT JOIN clans cl ON cl.id = c.clan_id
                LEFT JOIN clan_members cm ON cm.character_id = c.id AND cm.clan_id = c.clan_id
                WHERE c.id = ANY($1::uuid[])
                  AND c.deleted_at IS NULL
            `,
            [[parsed.killerCharacterId, parsed.victimCharacterId]],
        );

        const killer = characters.rows.find((row) => row.id === parsed.killerCharacterId);
        const victim = characters.rows.find((row) => row.id === parsed.victimCharacterId);

        if (!killer || !victim) {
            return commitNoTransfer(client, parsed, "character_not_found");
        }

        if (!killer.clan_id || !victim.clan_id) {
            return commitNoTransfer(client, parsed, "missing_clan");
        }

        if (killer.clan_id === victim.clan_id) {
            return commitNoTransfer(client, parsed, "same_clan");
        }

        if (
            !isOlderThan(killer.joined_at, now, CLAN_JOIN_PROTECTION_MS) ||
            !isOlderThan(victim.joined_at, now, CLAN_JOIN_PROTECTION_MS)
        ) {
            return commitNoTransfer(client, parsed, "join_protection");
        }

        const clanIds = [killer.clan_id, victim.clan_id].sort();
        const lockedClans = await client.query<ClanPointsRow>(
            `
                SELECT id, points
                FROM clans
                WHERE id = ANY($1::uuid[])
                ORDER BY id
                FOR UPDATE
            `,
            [clanIds],
        );
        const pointsByClanId = new Map(
            lockedClans.rows.map((row) => [row.id, Number(row.points)]),
        );

        const victimClanPoints = pointsByClanId.get(victim.clan_id) ?? 0;
        if (victimClanPoints <= 0) {
            return commitNoTransfer(client, parsed, "victim_clan_without_points");
        }

        const cooldown = await client.query<{ last_transfer_at: Date }>(
            `
                SELECT last_transfer_at
                FROM clan_pvp_pair_cooldowns
                WHERE killer_character_id = $1
                  AND victim_character_id = $2
                FOR UPDATE
            `,
            [parsed.killerCharacterId, parsed.victimCharacterId],
        );
        const lastTransferAt = cooldown.rows[0]?.last_transfer_at;
        if (
            lastTransferAt &&
            now.getTime() - lastTransferAt.getTime() < CLAN_PVP_PAIR_COOLDOWN_MS
        ) {
            return commitNoTransfer(client, parsed, "pair_cooldown");
        }

        const loserUpdate = await client.query<ClanPointsRow>(
            `
                UPDATE clans
                SET points = points - 1,
                    updated_at = NOW()
                WHERE id = $1
                  AND points > 0
                RETURNING id, points
            `,
            [victim.clan_id],
        );
        const loser = loserUpdate.rows[0];
        if (!loser) {
            return commitNoTransfer(client, parsed, "victim_clan_without_points");
        }

        const winnerUpdate = await client.query<ClanPointsRow>(
            `
                UPDATE clans
                SET points = points + 1,
                    updated_at = NOW()
                WHERE id = $1
                RETURNING id, points
            `,
            [killer.clan_id],
        );
        const winner = winnerUpdate.rows[0];

        await client.query(
            `
                UPDATE clan_members
                SET season_points_won = season_points_won + 1,
                    lifetime_points_won = lifetime_points_won + 1
                WHERE clan_id = $1
                  AND character_id = $2
            `,
            [killer.clan_id, parsed.killerCharacterId],
        );
        await client.query(
            `
                UPDATE clan_members
                SET season_points_lost = season_points_lost + 1,
                    lifetime_points_lost = lifetime_points_lost + 1
                WHERE clan_id = $1
                  AND character_id = $2
            `,
            [victim.clan_id, parsed.victimCharacterId],
        );
        await client.query(
            `
                INSERT INTO clan_pvp_pair_cooldowns (
                    killer_character_id,
                    victim_character_id,
                    last_transfer_at
                )
                VALUES ($1, $2, $3)
                ON CONFLICT (killer_character_id, victim_character_id) DO UPDATE
                SET last_transfer_at = EXCLUDED.last_transfer_at
            `,
            [parsed.killerCharacterId, parsed.victimCharacterId, now],
        );
        await client.query(
            `
                INSERT INTO clan_point_events (
                    event_type,
                    clan_id,
                    opposing_clan_id,
                    killer_character_id,
                    victim_character_id,
                    amount,
                    reason,
                    validation
                )
                VALUES (
                    'PVP_TRANSFER',
                    $1,
                    $2,
                    $3,
                    $4,
                    1,
                    'player_kill',
                    $5::jsonb
                )
            `,
            [
                killer.clan_id,
                victim.clan_id,
                parsed.killerCharacterId,
                parsed.victimCharacterId,
                JSON.stringify({
                    joinProtectionHours: CLAN_JOIN_PROTECTION_MS / 60 / 60 / 1000,
                    pairCooldownMinutes: CLAN_PVP_PAIR_COOLDOWN_MS / 60 / 1000,
                }),
            ],
        );

        await client.query("COMMIT");
        return {
            ok: true,
            transferred: true,
            killerCharacterId: parsed.killerCharacterId,
            victimCharacterId: parsed.victimCharacterId,
            winnerClanId: killer.clan_id,
            winnerClanName: killer.clan_name ?? "",
            loserClanId: victim.clan_id,
            loserClanName: victim.clan_name ?? "",
            winnerClanPoints: Number(winner?.points ?? 0),
            loserClanPoints: Number(loser.points),
        };
    } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
    } finally {
        client.release();
    }
}

export async function captureClanCastle(
    payload: unknown,
    options?: { now?: Date },
): Promise<ClanCastleCaptureResult> {
    const parsed = castleCaptureSchema.parse(payload);
    const now = options?.now ?? new Date();
    const nextRewardAt = addMs(now, CASTLE_REWARD_INTERVAL_MS);
    const pointsPerReward = CASTLE_REWARD_POINTS[parsed.castleId];
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await ensureCastleRows(client);

        const clan = await client.query<{ id: string; name: string }>(
            `
                SELECT id, name
                FROM clans
                WHERE id = $1
                FOR SHARE
            `,
            [parsed.ownerClanId],
        );
        const ownerClan = clan.rows[0];
        if (!ownerClan) {
            throw new Error("Clan invalido");
        }

        await client.query(
            `
                UPDATE clan_castle_states
                SET owner_clan_id = $2,
                    owner_clan_name = $3,
                    captured_at = $4,
                    next_reward_at = $5,
                    points_per_reward = $6,
                    updated_at = NOW()
                WHERE castle_id = $1
            `,
            [
                parsed.castleId,
                parsed.ownerClanId,
                parsed.ownerClanName || ownerClan.name,
                now,
                nextRewardAt,
                pointsPerReward,
            ],
        );

        await client.query("COMMIT");
        return {
            ok: true,
            castleId: parsed.castleId,
            ownerClanId: parsed.ownerClanId,
            ownerClanName: parsed.ownerClanName || ownerClan.name,
            capturedAt: now.toISOString(),
            nextRewardAt: nextRewardAt.toISOString(),
            pointsPerReward,
        };
    } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
    } finally {
        client.release();
    }
}

export async function awardDueCastleClanPoints(options?: {
    now?: Date;
}): Promise<ClanCastleAwardResult> {
    const now = options?.now ?? new Date();
    const awards: ClanCastleAward[] = [];
    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await ensureCastleRows(client);

        const dueStates = await client.query<CastleStateRow>(
            `
                SELECT
                    castle_id,
                    owner_clan_id,
                    owner_clan_name,
                    captured_at,
                    next_reward_at,
                    points_per_reward
                FROM clan_castle_states
                WHERE owner_clan_id IS NOT NULL
                  AND next_reward_at IS NOT NULL
                  AND next_reward_at <= $1
                ORDER BY castle_id
                FOR UPDATE
            `,
            [now],
        );

        for (const state of dueStates.rows) {
            if (!state.owner_clan_id || !state.next_reward_at) {
                continue;
            }

            const pointsPerReward = CASTLE_REWARD_POINTS[state.castle_id];
            const intervals = countDueIntervals(state.next_reward_at, now);
            if (intervals <= 0) {
                continue;
            }

            const amount = pointsPerReward * intervals;
            const nextRewardAt = addMs(
                state.next_reward_at,
                intervals * CASTLE_REWARD_INTERVAL_MS,
            );
            const clanUpdate = await client.query<ClanPointsRow>(
                `
                    UPDATE clans
                    SET points = points + $2,
                        updated_at = NOW()
                    WHERE id = $1
                    RETURNING id, points
                `,
                [state.owner_clan_id, amount],
            );
            const clan = clanUpdate.rows[0];
            if (!clan) {
                await client.query(
                    `
                        UPDATE clan_castle_states
                        SET owner_clan_id = NULL,
                            owner_clan_name = '',
                            captured_at = NULL,
                            next_reward_at = NULL,
                            updated_at = NOW()
                        WHERE castle_id = $1
                    `,
                    [state.castle_id],
                );
                continue;
            }

            await client.query(
                `
                    UPDATE clan_castle_states
                    SET next_reward_at = $2,
                        points_per_reward = $3,
                        updated_at = NOW()
                    WHERE castle_id = $1
                `,
                [state.castle_id, nextRewardAt, pointsPerReward],
            );
            await client.query(
                `
                    INSERT INTO clan_point_events (
                        event_type,
                        clan_id,
                        castle_id,
                        amount,
                        reason,
                        validation
                    )
                    VALUES (
                        'CASTLE_REWARD',
                        $1,
                        $2,
                        $3,
                        'castle_hourly_reward',
                        $4::jsonb
                    )
                `,
                [
                    state.owner_clan_id,
                    state.castle_id,
                    amount,
                    JSON.stringify({
                        intervals,
                        pointsPerReward,
                        capturedAt: state.captured_at?.toISOString() ?? null,
                        previousNextRewardAt: state.next_reward_at.toISOString(),
                    }),
                ],
            );

            awards.push({
                castleId: state.castle_id,
                clanId: state.owner_clan_id,
                clanName: state.owner_clan_name,
                amount,
                intervals,
                pointsPerReward,
                nextRewardAt: nextRewardAt.toISOString(),
                clanPoints: Number(clan.points),
            });
        }

        await client.query("COMMIT");
        return {
            ok: true,
            awardedAt: now.toISOString(),
            awards,
        };
    } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
    } finally {
        client.release();
    }
}
