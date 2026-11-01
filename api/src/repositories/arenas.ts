import crypto from "crypto";
import { z } from "zod";
import pool from "../db";
import type {
  ArenaLiveEntry,
  ArenaOverviewResponse,
  ArenaRankingEntry,
  ArenaTrainingRankingEntry,
  AuthSessionRecord,
  GameTicketResponse,
} from "../types";

// Modo Arena: todos contra todos, se entra con la cuenta y una clase (server/src/arenaClasses.ts).
const ARENA_GAME_TICKET_TTL_MS = 1000 * 60;
const ARENA_CLASS_IDS = [1, 2, 3, 4, 6, 7, 8, 9, 18, 20, 22] as const;
// El server de juego manda el estado cada 5 s si hubo cambios y cada 30 s igual: pasado esto, la arena está vacía.
const ARENA_LIVE_STALE_MS = 1000 * 90;
const ARENA_RANKING_SIZE = 20;

const classIdSchema = z.coerce
  .number()
  .int()
  .refine((value) => (ARENA_CLASS_IDS as readonly number[]).includes(value), "Clase invalida");

const ticketSchema = z.object({
  idClase: classIdSchema,
  // Entrenamiento contra el bot (server/src/arenaTraining.ts): la clase del bot. Sin ella, es el todos contra todos.
  idClaseBot: classIdSchema.optional().nullable(),
});

const liveEntrySchema = z.object({
  nombre: z.string().max(60),
  idClase: z.coerce.number().int(),
  puntos: z.coerce.number().int().min(0),
  kills: z.coerce.number().int().min(0),
  muertes: z.coerce.number().int().min(0),
});

const resultSchema = z.object({
  accountId: z.string().uuid(),
  kills: z.coerce.number().int().min(0),
  muertes: z.coerce.number().int().min(0),
  mejorPuntaje: z.coerce.number().int().min(0),
  mejorRacha: z.coerce.number().int().min(0),
});

const trainingResultSchema = z.object({
  accountId: z.string().uuid(),
  puntaje: z.coerce.number().int().min(0),
  nivel: z.coerce.number().int().min(0),
  idClase: classIdSchema,
  idClaseBot: classIdSchema,
});

const trainingStateSchema = z.object({
  resultados: z.array(trainingResultSchema).max(500),
});

const stateSchema = z.object({
  jugadores: z.coerce.number().int().min(0),
  top: z.array(liveEntrySchema).max(50),
  resultados: z.array(resultSchema).max(500),
});

let liveState: { jugadores: number; top: ArenaLiveEntry[]; receivedAt: number } | null = null;

function createOpaqueTicket(): string {
  return crypto.randomBytes(32).toString("base64url");
}

async function getSessionRecord(token: string): Promise<AuthSessionRecord | null> {
  const sessionResult = await pool.query<AuthSessionRecord>(
    `
      SELECT token, account_id, selected_character_id, created_at, expires_at
      FROM auth_sessions
      WHERE token = $1
        AND expires_at > NOW()
      LIMIT 1
    `,
    [token],
  );

  return sessionResult.rows[0] ?? null;
}

export async function createArenaGameTicket(token: string, payload: unknown): Promise<GameTicketResponse | null> {
  const session = await getSessionRecord(token);

  if (!session) {
    return null;
  }

  const { idClase, idClaseBot } = ticketSchema.parse(payload);
  const ticket = createOpaqueTicket();

  const result = await pool.query<{ expires_at: Date }>(
    `
      INSERT INTO game_tickets (
        ticket,
        auth_token,
        account_id,
        character_id,
        mode,
        pvp_template_id,
        arena_bot_class_id,
        expires_at
      )
      VALUES ($1, $2, $3, NULL, 'arena', $4, $5, NOW() + ($6 * INTERVAL '1 millisecond'))
      RETURNING expires_at
    `,
    [ticket, token, session.account_id, idClase, idClaseBot ?? null, ARENA_GAME_TICKET_TTL_MS],
  );

  return {
    ticket,
    expiresAt: result.rows[0].expires_at,
  };
}

/** Lo manda el server de juego: quién está ahora y lo que hizo cada cuenta desde el envío anterior. */
export async function saveArenaState(payload: unknown): Promise<void> {
  const state = stateSchema.parse(payload);
  liveState = { jugadores: state.jugadores, top: state.top, receivedAt: Date.now() };

  for (const result of state.resultados) {
    await pool.query(
      `
        INSERT INTO arena_stats (account_id, kills, deaths, best_points, best_streak, updated_at)
        SELECT id, $2, $3, $4, $5, NOW()
        FROM accounts
        WHERE id = $1
        ON CONFLICT (account_id) DO UPDATE
        SET kills = arena_stats.kills + EXCLUDED.kills,
            deaths = arena_stats.deaths + EXCLUDED.deaths,
            best_points = GREATEST(arena_stats.best_points, EXCLUDED.best_points),
            best_streak = GREATEST(arena_stats.best_streak, EXCLUDED.best_streak),
            updated_at = NOW()
      `,
      [result.accountId, result.kills, result.muertes, result.mejorPuntaje, result.mejorRacha],
    );
  }
}

/** Lo manda el server de juego cuando termina una racha contra el bot: queda la mejor de cada cuenta. */
export async function saveArenaTrainingResults(payload: unknown): Promise<void> {
  const { resultados } = trainingStateSchema.parse(payload);

  for (const result of resultados) {
    await pool.query(
      `
        INSERT INTO arena_training_records (
          account_id, best_score, best_level, class_id, bot_class_id, runs, achieved_at, updated_at
        )
        SELECT id, $2, $3, $4, $5, 1, NOW(), NOW()
        FROM accounts
        WHERE id = $1
        ON CONFLICT (account_id) DO UPDATE
        SET runs = arena_training_records.runs + 1,
            updated_at = NOW(),
            best_level = CASE WHEN EXCLUDED.best_score > arena_training_records.best_score
              THEN EXCLUDED.best_level ELSE arena_training_records.best_level END,
            class_id = CASE WHEN EXCLUDED.best_score > arena_training_records.best_score
              THEN EXCLUDED.class_id ELSE arena_training_records.class_id END,
            bot_class_id = CASE WHEN EXCLUDED.best_score > arena_training_records.best_score
              THEN EXCLUDED.bot_class_id ELSE arena_training_records.bot_class_id END,
            achieved_at = CASE WHEN EXCLUDED.best_score > arena_training_records.best_score
              THEN NOW() ELSE arena_training_records.achieved_at END,
            best_score = GREATEST(arena_training_records.best_score, EXCLUDED.best_score)
      `,
      [result.accountId, result.puntaje, result.nivel, result.idClase, result.idClaseBot],
    );
  }
}

export async function getArenaOverview(): Promise<ArenaOverviewResponse> {
  const live = liveState && Date.now() - liveState.receivedAt <= ARENA_LIVE_STALE_MS ? liveState : null;

  const rankingResult = await pool.query<{
    name: string;
    kills: number;
    deaths: number;
    best_points: number;
    best_streak: number;
  }>(
    `
      SELECT accounts.name, arena_stats.kills, arena_stats.deaths, arena_stats.best_points, arena_stats.best_streak
      FROM arena_stats
      JOIN accounts ON accounts.id = arena_stats.account_id
      WHERE arena_stats.best_points > 0 OR arena_stats.kills > 0
      ORDER BY arena_stats.best_points DESC, arena_stats.kills DESC, arena_stats.updated_at ASC
      LIMIT $1
    `,
    [ARENA_RANKING_SIZE],
  );

  const ranking: ArenaRankingEntry[] = rankingResult.rows.map((row) => ({
    nombre: row.name,
    kills: Number(row.kills),
    muertes: Number(row.deaths),
    mejorPuntaje: Number(row.best_points),
    mejorRacha: Number(row.best_streak),
  }));

  const trainingResult = await pool.query<{
    name: string;
    best_score: number;
    best_level: number;
    class_id: number;
    bot_class_id: number;
    achieved_at: Date;
  }>(
    `
      SELECT accounts.name, arena_training_records.best_score, arena_training_records.best_level,
        arena_training_records.class_id, arena_training_records.bot_class_id, arena_training_records.achieved_at
      FROM arena_training_records
      JOIN accounts ON accounts.id = arena_training_records.account_id
      WHERE arena_training_records.best_score > 0
      ORDER BY arena_training_records.best_score DESC, arena_training_records.achieved_at ASC
      LIMIT $1
    `,
    [ARENA_RANKING_SIZE],
  );

  const entrenamiento: ArenaTrainingRankingEntry[] = trainingResult.rows.map((row) => ({
    nombre: row.name,
    puntaje: Number(row.best_score),
    nivel: Number(row.best_level),
    idClase: Number(row.class_id),
    idClaseBot: Number(row.bot_class_id),
    fecha: new Date(row.achieved_at).toISOString(),
  }));

  return {
    entrenamiento,
    enVivo: {
      jugadores: live?.jugadores ?? 0,
      top: live?.top ?? [],
      actualizado: live ? new Date(live.receivedAt).toISOString() : null,
    },
    ranking,
  };
}
