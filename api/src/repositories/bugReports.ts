import { z } from "zod";
import pool from "../db";

// Bugs que reportan los jugadores desde el juego. Ciclo de vida:
//   pending (Pendiente) -> in_progress (En proceso) -> resolved (Solucionado)
// Un GM puede mover un reporte a cualquier estado, también volver atrás, o borrarlo.

export const BUG_REPORT_STATUSES = ["pending", "in_progress", "resolved"] as const;
export type BugReportStatus = (typeof BUG_REPORT_STATUSES)[number];

export const BUG_REPORT_LIST_FILTERS = [...BUG_REPORT_STATUSES, "all"] as const;
export type BugReportListFilter = (typeof BUG_REPORT_LIST_FILTERS)[number];

export const BUG_REPORT_MESSAGE_MIN = 10;
export const BUG_REPORT_MESSAGE_MAX = 2000;

// Anti-spam: cada cuenta puede mandar hasta 5 reportes cada 10 minutos.
export const BUG_REPORT_RATE_LIMIT = 5;
export const BUG_REPORT_RATE_WINDOW_MINUTES = 10;

const LIST_LIMIT = 500;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const coordinate = z.number().int().min(0).max(100_000).nullable().optional();

export const createBugReportSchema = z.object({
    message: z
        .string({ error: "Escribí qué pasó." })
        .trim()
        .min(
            BUG_REPORT_MESSAGE_MIN,
            `Contá un poco más: el reporte necesita al menos ${BUG_REPORT_MESSAGE_MIN} caracteres.`,
        )
        .max(
            BUG_REPORT_MESSAGE_MAX,
            `El reporte puede tener hasta ${BUG_REPORT_MESSAGE_MAX} caracteres.`,
        ),
    map: coordinate,
    x: coordinate,
    y: coordinate,
    client: z
        .object({
            userAgent: z.string().max(400).optional(),
            viewport: z.string().max(40).optional(),
            mobile: z.boolean().optional(),
        })
        .optional(),
});

export type CreateBugReportInput = z.infer<typeof createBugReportSchema>;

type BugReportRecord = {
    id: string;
    account_id: string;
    character_id: string | null;
    reporter_name: string;
    message: string;
    map: number | null;
    pos_x: number | null;
    pos_y: number | null;
    client: Record<string, unknown> | null;
    status: BugReportStatus;
    handled_by: string | null;
    created_at: Date;
    updated_at: Date;
};

export type BugReportEntry = {
    id: string;
    characterId: string | null;
    reporterName: string;
    message: string;
    map: number | null;
    x: number | null;
    y: number | null;
    client: Record<string, unknown>;
    status: BugReportStatus;
    handledBy: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type BugReportCounts = Record<BugReportStatus, number> & { all: number };

function toBugReportEntry(record: BugReportRecord): BugReportEntry {
    return {
        id: record.id,
        characterId: record.character_id,
        reporterName: record.reporter_name,
        message: record.message,
        map: record.map,
        x: record.pos_x,
        y: record.pos_y,
        client: record.client ?? {},
        status: record.status,
        handledBy: record.handled_by,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
    };
}

export function isBugReportId(id: string): boolean {
    return UUID_PATTERN.test(id);
}

export type CreateBugReportResult =
    | { ok: true; report: BugReportEntry }
    | { ok: false; status: number; error: string };

export async function createBugReport(params: {
    accountId: string;
    characterId: string | null;
    reporterName: string;
    input: CreateBugReportInput;
}): Promise<CreateBugReportResult> {
    const recent = await pool.query<{ count: string }>(
        `
            SELECT COUNT(*)::text AS count
            FROM bug_reports
            WHERE account_id = $1
              AND created_at > NOW() - make_interval(mins => $2)
        `,
        [params.accountId, BUG_REPORT_RATE_WINDOW_MINUTES],
    );

    if (Number(recent.rows[0]?.count ?? 0) >= BUG_REPORT_RATE_LIMIT) {
        return {
            ok: false,
            status: 429,
            error: `Ya mandaste ${BUG_REPORT_RATE_LIMIT} reportes en los últimos ${BUG_REPORT_RATE_WINDOW_MINUTES} minutos. Esperá un rato para mandar otro.`,
        };
    }

    const { input } = params;
    const result = await pool.query<BugReportRecord>(
        `
            INSERT INTO bug_reports (
                account_id, character_id, reporter_name, message, map, pos_x, pos_y, client
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
            RETURNING *
        `,
        [
            params.accountId,
            params.characterId,
            params.reporterName,
            input.message,
            input.map ?? null,
            input.x ?? null,
            input.y ?? null,
            JSON.stringify(input.client ?? {}),
        ],
    );

    return { ok: true, report: toBugReportEntry(result.rows[0]) };
}

export async function listBugReports(filter: BugReportListFilter): Promise<{
    reports: BugReportEntry[];
    counts: BugReportCounts;
}> {
    const statuses: readonly BugReportStatus[] =
        filter === "all" ? BUG_REPORT_STATUSES : [filter];

    const [reports, counts] = await Promise.all([
        pool.query<BugReportRecord>(
            `
                SELECT *
                FROM bug_reports
                WHERE status = ANY($1::text[])
                ORDER BY created_at DESC
                LIMIT ${LIST_LIMIT}
            `,
            [[...statuses]],
        ),
        pool.query<{ status: BugReportStatus; count: string }>(
            `SELECT status, COUNT(*)::text AS count FROM bug_reports GROUP BY status`,
        ),
    ]);

    const totals: BugReportCounts = { pending: 0, in_progress: 0, resolved: 0, all: 0 };
    for (const row of counts.rows) {
        const count = Number(row.count);
        if ((BUG_REPORT_STATUSES as readonly string[]).includes(row.status)) {
            totals[row.status] = count;
        }
        totals.all += count;
    }

    return { reports: reports.rows.map(toBugReportEntry), counts: totals };
}

export async function updateBugReportStatus(
    id: string,
    status: BugReportStatus,
    handledBy: string,
): Promise<BugReportEntry | null> {
    if (!isBugReportId(id)) {
        return null;
    }

    const result = await pool.query<BugReportRecord>(
        `
            UPDATE bug_reports
            SET status = $2, handled_by = $3, updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `,
        [id, status, handledBy],
    );

    return result.rows[0] ? toBugReportEntry(result.rows[0]) : null;
}

export async function deleteBugReport(id: string): Promise<boolean> {
    if (!isBugReportId(id)) {
        return false;
    }

    const result = await pool.query(`DELETE FROM bug_reports WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
}
