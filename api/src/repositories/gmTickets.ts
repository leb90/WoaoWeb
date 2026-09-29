import { z } from "zod";
import pool from "../db";

export const GM_TICKET_TYPES = [
    "report_player",
    "bug",
    "general",
] as const;
export type GmTicketType = (typeof GM_TICKET_TYPES)[number];

export type GmTicketRecord = {
    id: string;
    type: string;
    reporter_character_id: string;
    reporter_name: string;
    target_character_id: string | null;
    target_name: string | null;
    message: string;
    context: unknown;
    status: string;
    created_at: Date;
    resolved_at: Date | null;
    resolved_by: string | null;
};

export type GmTicketEntry = {
    id: string;
    type: string;
    reporterCharacterId: string;
    reporterName: string;
    targetCharacterId: string | null;
    targetName: string | null;
    message: string;
    context: unknown;
    status: string;
    createdAt: Date;
    resolvedAt: Date | null;
    resolvedBy: string | null;
};

const createGmTicketSchema = z.object({
    type: z.enum(GM_TICKET_TYPES),
    reporterCharacterId: z.string().uuid(),
    reporterName: z.string().trim().min(1).max(64),
    targetCharacterId: z.string().uuid().optional().nullable(),
    targetName: z.string().trim().min(1).max(64).optional().nullable(),
    message: z.string().trim().min(1).max(2000),
    context: z.record(z.string(), z.unknown()).optional().nullable(),
});

function toGmTicketEntry(record: GmTicketRecord): GmTicketEntry {
    return {
        id: record.id,
        type: record.type,
        reporterCharacterId: record.reporter_character_id,
        reporterName: record.reporter_name,
        targetCharacterId: record.target_character_id,
        targetName: record.target_name,
        message: record.message,
        context: record.context,
        status: record.status,
        createdAt: record.created_at,
        resolvedAt: record.resolved_at,
        resolvedBy: record.resolved_by,
    };
}

export async function createGmTicket(payload: unknown): Promise<GmTicketEntry> {
    const parsed = createGmTicketSchema.parse(payload);

    const result = await pool.query<GmTicketRecord>(
        `
            INSERT INTO gm_tickets (
                type,
                reporter_character_id,
                reporter_name,
                target_character_id,
                target_name,
                message,
                context
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)
            RETURNING *
        `,
        [
            parsed.type,
            parsed.reporterCharacterId,
            parsed.reporterName,
            parsed.targetCharacterId ?? null,
            parsed.targetName ?? null,
            parsed.message,
            JSON.stringify(parsed.context ?? {}),
        ],
    );

    return toGmTicketEntry(result.rows[0]);
}

export async function listGmTickets(status?: string): Promise<GmTicketEntry[]> {
    const result = status
        ? await pool.query<GmTicketRecord>(
              `SELECT * FROM gm_tickets WHERE status = $1 ORDER BY created_at DESC LIMIT 200`,
              [status],
          )
        : await pool.query<GmTicketRecord>(
              `SELECT * FROM gm_tickets ORDER BY created_at DESC LIMIT 200`,
          );

    return result.rows.map(toGmTicketEntry);
}

export async function getGmTicket(id: string): Promise<GmTicketEntry | null> {
    const result = await pool.query<GmTicketRecord>(
        `SELECT * FROM gm_tickets WHERE id = $1 LIMIT 1`,
        [id],
    );

    return result.rows[0] ? toGmTicketEntry(result.rows[0]) : null;
}

export async function resolveGmTicket(
    id: string,
    resolvedBy: string,
    note?: string | null,
): Promise<GmTicketEntry | null> {
    const result = await pool.query<GmTicketRecord>(
        `
            UPDATE gm_tickets
            SET status = 'resolved',
                resolved_at = NOW(),
                resolved_by = $2,
                message = message || $3
            WHERE id = $1 AND status != 'resolved'
            RETURNING *
        `,
        [id, resolvedBy, note ? `\n\n[Resuelto por ${resolvedBy}] ${note}` : ""],
    );

    return result.rows[0] ? toGmTicketEntry(result.rows[0]) : null;
}
