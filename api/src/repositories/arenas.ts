import crypto from "crypto";
import { z } from "zod";
import pool from "../db";
import type {
  ArenaLiveEntry,
  ArenaOverviewResponse,
  ArenaRankingEntry,
  AuthSessionRecord,
  GameTicketResponse,
} from "../types";

// Modo Arena: todos contra todos, se entra con la cuenta y una clase (server/src/arenaClasses.ts).
const ARENA_GAME_TICKET_TTL_MS = 1000 * 60;
const ARENA_CLASS_IDS = [1, 2, 3, 4, 6, 7, 8, 9, 18, 20, 22] as const;
// El server de juego manda el estado cada 5 s si hubo cambios y cada 30 s igual: pasado esto, la arena está vacía.
const ARENA_LIVE_STALE_MS = 1000 * 90;
const ARENA_RANKING_SIZE = 20;

const ticketSchema = z.object({
  idClase: z.coerce
    .number()
    .int()
    .refine((value) => (ARENA_CLASS_IDS as readonly number[]).includes(value), "Clase invalida"),
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

  const { idClase } = ticketSchema.parse(payload);
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
        expires_at
      )
      VALUES ($1, $2, $3, NULL, 'arena', $4, NOW() + ($5 * INTERVAL '1 millisecond'))
      RETURNING expires_at
    `,
    [ticket, token, session.account_id, idClase, ARENA_GAME_TICKET_TTL_MS],
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

  return {
    enVivo: {
      jugadores: live?.jugadores ?? 0,
      top: live?.top ?? [],
      actualizado: live ? new Date(live.receivedAt).toISOString() : null,
    },
    ranking,
  };
}
