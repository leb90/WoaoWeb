import { z } from "zod";
import pool from "../db";

const rankedModeSchema = z.union([z.literal("RANKED_1V1"), z.literal("RANKED_2V2")]);
const teamSchema = z.union([z.literal("A"), z.literal("B")]);
const resultSchema = z.union([
    z.literal("win"),
    z.literal("loss"),
    z.literal("draw"),
    z.literal("abandoned"),
    z.literal("pending"),
]);

const rankedParticipantSchema = z.object({
    characterId: z.string().uuid(),
    team: teamSchema,
    eloBefore: z.coerce.number().int().min(0),
    eloAfter: z.coerce.number().int().min(0),
    eloDelta: z.coerce.number().int(),
    result: resultSchema,
});

const completeMatchSchema = z.object({
    id: z.string().uuid().optional(),
    mode: rankedModeSchema,
    arenaMapId: z.coerce.number().int().positive().optional().nullable(),
    startedAt: z.union([z.string().datetime(), z.date()]),
    finishedAt: z.union([z.string().datetime(), z.date()]),
    teamAEloBefore: z.coerce.number().int().min(0),
    teamBEloBefore: z.coerce.number().int().min(0),
    teamAEloAfter: z.coerce.number().int().min(0),
    teamBEloAfter: z.coerce.number().int().min(0),
    winnerTeam: teamSchema,
    scoreA: z.coerce.number().int().min(0).max(2),
    scoreB: z.coerce.number().int().min(0).max(2),
    participants: z.array(rankedParticipantSchema).min(2).max(4),
    metadata: z.record(z.string(), z.unknown()).optional(),
});

function toRating(row: {
    character_id: string;
    mode: string;
    elo: number;
    wins: number;
    losses: number;
    win_streak: number;
    best_win_streak: number;
    matches_played: number;
    highest_elo: number;
    created_at: Date;
    updated_at: Date;
}) {
    return {
        characterId: row.character_id,
        mode: row.mode,
        elo: row.elo,
        wins: row.wins,
        losses: row.losses,
        winStreak: row.win_streak,
        bestWinStreak: row.best_win_streak,
        matchesPlayed: row.matches_played,
        highestElo: row.highest_elo,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export async function getOrCreateRankedRating(characterId: string, mode: string) {
    const parsedMode = rankedModeSchema.parse(mode);
    const result = await pool.query(
        `
            INSERT INTO ranked_ratings (character_id, mode)
            VALUES ($1, $2)
            ON CONFLICT (character_id, mode) DO UPDATE
            SET updated_at = ranked_ratings.updated_at
            RETURNING *
        `,
        [characterId, parsedMode],
    );

    return toRating(result.rows[0]);
}

export async function listRankedRatings(characterIds: readonly string[], mode: string) {
    const parsedMode = rankedModeSchema.parse(mode);
    const uniqueCharacterIds = [...new Set(characterIds)].filter(Boolean);

    if (!uniqueCharacterIds.length) {
        return [];
    }

    await Promise.all(uniqueCharacterIds.map((characterId) => getOrCreateRankedRating(characterId, parsedMode)));

    const result = await pool.query(
        `
            SELECT *
            FROM ranked_ratings
            WHERE mode = $1 AND character_id = ANY($2::uuid[])
        `,
        [parsedMode, uniqueCharacterIds],
    );

    return result.rows.map(toRating);
}

export async function completeRankedMatch(payload: unknown) {
    const parsed = completeMatchSchema.parse(payload);
    const startedAt = new Date(parsed.startedAt);
    const finishedAt = new Date(parsed.finishedAt);

    return pool.connect().then(async (client) => {
        try {
            await client.query("BEGIN");

            const matchResult = await client.query(
                `
                    INSERT INTO ranked_matches (
                        id,
                        mode,
                        arena_map_id,
                        started_at,
                        finished_at,
                        team_a_elo_before,
                        team_b_elo_before,
                        team_a_elo_after,
                        team_b_elo_after,
                        winner_team,
                        score_a,
                        score_b,
                        status,
                        metadata
                    )
                    VALUES (COALESCE($1, gen_random_uuid()), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'COMPLETED', $13::jsonb)
                    RETURNING *
                `,
                [
                    parsed.id ?? null,
                    parsed.mode,
                    parsed.arenaMapId ?? null,
                    startedAt.toISOString(),
                    finishedAt.toISOString(),
                    parsed.teamAEloBefore,
                    parsed.teamBEloBefore,
                    parsed.teamAEloAfter,
                    parsed.teamBEloAfter,
                    parsed.winnerTeam,
                    parsed.scoreA,
                    parsed.scoreB,
                    JSON.stringify(parsed.metadata ?? {}),
                ],
            );
            const matchId = matchResult.rows[0].id as string;

            for (const participant of parsed.participants) {
                await client.query(
                    `
                        INSERT INTO ranked_match_participants (
                            match_id,
                            character_id,
                            team,
                            elo_before,
                            elo_after,
                            elo_delta,
                            result
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        ON CONFLICT (match_id, character_id) DO UPDATE
                        SET team = EXCLUDED.team,
                            elo_before = EXCLUDED.elo_before,
                            elo_after = EXCLUDED.elo_after,
                            elo_delta = EXCLUDED.elo_delta,
                            result = EXCLUDED.result
                    `,
                    [
                        matchId,
                        participant.characterId,
                        participant.team,
                        participant.eloBefore,
                        participant.eloAfter,
                        participant.eloDelta,
                        participant.result,
                    ],
                );

                if (participant.result === "pending" || participant.result === "draw") {
                    continue;
                }

                const won = participant.result === "win";
                await client.query(
                    `
                        INSERT INTO ranked_ratings (
                            character_id,
                            mode,
                            elo,
                            wins,
                            losses,
                            win_streak,
                            best_win_streak,
                            matches_played,
                            highest_elo
                        )
                        VALUES ($1, $2, $3, $4, $5, $6, $6, 1, $3)
                        ON CONFLICT (character_id, mode) DO UPDATE
                        SET elo = EXCLUDED.elo,
                            wins = ranked_ratings.wins + $4,
                            losses = ranked_ratings.losses + $5,
                            win_streak = CASE WHEN $4 = 1 THEN ranked_ratings.win_streak + 1 ELSE 0 END,
                            best_win_streak = GREATEST(
                                ranked_ratings.best_win_streak,
                                CASE WHEN $4 = 1 THEN ranked_ratings.win_streak + 1 ELSE ranked_ratings.best_win_streak END
                            ),
                            matches_played = ranked_ratings.matches_played + 1,
                            highest_elo = GREATEST(ranked_ratings.highest_elo, EXCLUDED.elo),
                            updated_at = NOW()
                    `,
                    [
                        participant.characterId,
                        parsed.mode,
                        participant.eloAfter,
                        won ? 1 : 0,
                        won ? 0 : 1,
                        won ? 1 : 0,
                    ],
                );
            }

            await client.query("COMMIT");
            return { id: matchId, status: "COMPLETED" };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    });
}

type LeaderboardRow = {
    character_id: string;
    character_name: string;
    clan_name: string | null;
    elo: number;
    wins: number;
    losses: number;
    win_streak: number;
    best_win_streak: number;
    matches_played: number;
    highest_elo: number;
};

function toLeaderboardEntry(row: LeaderboardRow, position: number) {
    return {
        position,
        characterId: row.character_id,
        characterName: row.character_name,
        clanName: row.clan_name,
        elo: row.elo,
        wins: row.wins,
        losses: row.losses,
        matchesPlayed: row.matches_played,
        winStreak: row.win_streak,
        bestWinStreak: row.best_win_streak,
        highestElo: row.highest_elo,
    };
}

export async function getRankedLeaderboard(
    mode: string,
    page = 1,
    pageSize = 20,
    selfCharacterId?: string,
) {
    const parsedMode = rankedModeSchema.parse(mode);
    const safePage = Math.max(1, Math.floor(page));
    const safePageSize = Math.max(1, Math.min(100, Math.floor(pageSize)));
    const offset = (safePage - 1) * safePageSize;

    const result = await pool.query(
        `
            SELECT rr.*, c.name AS character_name, cl.name AS clan_name
            FROM ranked_ratings rr
            JOIN characters c ON c.id = rr.character_id
            LEFT JOIN clans cl ON cl.id = c.clan_id
            WHERE rr.mode = $1 AND c.deleted_at IS NULL
            ORDER BY rr.elo DESC, rr.wins DESC, rr.character_id ASC
            LIMIT $2 OFFSET $3
        `,
        [parsedMode, safePageSize, offset],
    );
    const countResult = await pool.query(
        `
            SELECT COUNT(*)::int AS total
            FROM ranked_ratings rr
            JOIN characters c ON c.id = rr.character_id
            WHERE rr.mode = $1 AND c.deleted_at IS NULL
        `,
        [parsedMode],
    );

    let selfEntry = null;

    if (selfCharacterId) {
        const selfResult = await pool.query(
            `
                WITH self_rating AS (
                    SELECT rr.*, c.name AS character_name, cl.name AS clan_name
                    FROM ranked_ratings rr
                    JOIN characters c ON c.id = rr.character_id
                    LEFT JOIN clans cl ON cl.id = c.clan_id
                    WHERE rr.mode = $1 AND rr.character_id = $2::uuid AND c.deleted_at IS NULL
                    LIMIT 1
                )
                SELECT self_rating.*,
                    (
                        SELECT COUNT(*)::int + 1
                        FROM ranked_ratings rr2
                        JOIN characters c2 ON c2.id = rr2.character_id
                        WHERE rr2.mode = $1
                            AND c2.deleted_at IS NULL
                            AND (
                                rr2.elo > self_rating.elo
                                OR (rr2.elo = self_rating.elo AND rr2.wins > self_rating.wins)
                                OR (
                                    rr2.elo = self_rating.elo
                                    AND rr2.wins = self_rating.wins
                                    AND rr2.character_id::text < self_rating.character_id::text
                                )
                            )
                    ) AS position
                FROM self_rating
            `,
            [parsedMode, selfCharacterId],
        );

        const row = selfResult.rows[0];
        if (row) {
            selfEntry = toLeaderboardEntry(row, Number(row.position ?? 0));
        }
    }

    return {
        mode: parsedMode,
        page: safePage,
        pageSize: safePageSize,
        total: Number(countResult.rows[0]?.total ?? 0),
        entries: result.rows.map((row, index) =>
            toLeaderboardEntry(row, offset + index + 1),
        ),
        selfEntry,
    };
}
