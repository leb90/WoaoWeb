import type { PoolClient } from "pg";
import { z } from "zod";
import pool from "../db";
import {
    creditDonationPoints,
    deliverItemToCharacter,
} from "../lib/gameServerClient";
import type { TransmogSlot } from "../types";

// Pedidos de diseño personalizado de la tienda de donaciones. Ciclo de vida:
//   awaiting_payment -> (cobro ok) -> pending -> in_progress -> delivered
//                                         \______________\-> rejected (+ reembolso)
// 'awaiting_payment' es transitorio: la fila existe solo mientras se le cobra
// al game server; si el cobro falla se borra.

export const CUSTOM_DESIGN_STATUSES = [
    "awaiting_payment",
    "pending",
    "in_progress",
    "delivered",
    "rejected",
] as const;
export type CustomDesignStatus = (typeof CUSTOM_DESIGN_STATUSES)[number];

// Filtros que acepta el listado de staff. "open" = pending + in_progress.
// "all" incluye tambien 'awaiting_payment' para poder detectar pedidos que
// quedaron colgados a mitad de cobro.
export const CUSTOM_DESIGN_LIST_FILTERS = [
    "open",
    "pending",
    "in_progress",
    "delivered",
    "rejected",
    "all",
] as const;
export type CustomDesignListFilter = (typeof CUSTOM_DESIGN_LIST_FILTERS)[number];

export const CUSTOM_DESIGN_IMAGE_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
] as const;
export type CustomDesignImageMime = (typeof CUSTOM_DESIGN_IMAGE_MIME_TYPES)[number];

const PROCESSABLE_STATUSES: readonly CustomDesignStatus[] = ["pending", "in_progress"];
const LIST_LIMIT = 200;

type CustomDesignRecord = {
    id: string;
    character_id: string;
    account_id: string;
    character_name: string;
    product_id: string;
    slot: TransmogSlot;
    title: string;
    description: string;
    image_mime: string | null;
    has_image: boolean;
    points: number;
    status: CustomDesignStatus;
    staff_note: string | null;
    delivered_obj_index: number | null;
    handled_by: string | null;
    created_at: Date;
    updated_at: Date;
};

export type CustomDesignEntry = {
    id: string;
    characterId: string;
    accountId: string;
    characterName: string;
    productId: string;
    slot: TransmogSlot;
    title: string;
    description: string;
    hasImage: boolean;
    points: number;
    status: CustomDesignStatus;
    staffNote: string | null;
    deliveredObjIndex: number | null;
    handledBy: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type CustomDesignTransitionResult =
    | { ok: true; request: CustomDesignEntry }
    | { ok: false; status: number; error: string };

// Nunca se trae image_data en los listados: puede pesar hasta 1 MB por fila.
const ENTRY_COLUMNS = `
    id,
    character_id,
    account_id,
    character_name,
    product_id,
    slot,
    title,
    description,
    image_mime,
    (image_data IS NOT NULL) AS has_image,
    points,
    status,
    staff_note,
    delivered_obj_index,
    handled_by,
    created_at,
    updated_at
`;

const STATUS_LABELS: Record<CustomDesignStatus, string> = {
    awaiting_payment: "esperando el cobro",
    pending: "pendiente",
    in_progress: "en producción",
    delivered: "entregado",
    rejected: "rechazado",
};

function isUuid(value: string): boolean {
    return z.string().uuid().safeParse(value).success;
}

function toCustomDesignEntry(record: CustomDesignRecord): CustomDesignEntry {
    return {
        id: record.id,
        characterId: record.character_id,
        accountId: record.account_id,
        characterName: record.character_name,
        productId: record.product_id,
        slot: record.slot,
        title: record.title,
        description: record.description,
        hasImage: record.has_image,
        points: record.points,
        status: record.status,
        staffNote: record.staff_note,
        deliveredObjIndex: record.delivered_obj_index,
        handledBy: record.handled_by,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
    };
}

function invalidTransition(record: CustomDesignRecord): CustomDesignTransitionResult {
    return {
        ok: false,
        status: 409,
        error: `El pedido está ${STATUS_LABELS[record.status]} y no admite esa acción.`,
    };
}

// Crea el pedido en 'awaiting_payment' con slot y puntos provisorios: los
// definitivos los decide el game server al cobrar (markCustomDesignPaid).
export async function createAwaitingPaymentCustomDesign(params: {
    characterId: string;
    accountId: string;
    characterName: string;
    productId: string;
    title: string;
    description: string;
    image: { mime: CustomDesignImageMime; data: Buffer } | null;
}): Promise<CustomDesignEntry> {
    const result = await pool.query<CustomDesignRecord>(
        `
            INSERT INTO custom_design_requests (
                character_id,
                account_id,
                character_name,
                product_id,
                slot,
                title,
                description,
                image_mime,
                image_data,
                points,
                status
            )
            VALUES ($1, $2, $3, $4, 'casco', $5, $6, $7, $8, 0, 'awaiting_payment')
            RETURNING ${ENTRY_COLUMNS}
        `,
        [
            params.characterId,
            params.accountId,
            params.characterName,
            params.productId,
            params.title,
            params.description,
            params.image?.mime ?? null,
            params.image?.data ?? null,
        ],
    );

    return toCustomDesignEntry(result.rows[0]!);
}

export async function markCustomDesignPaid(params: {
    id: string;
    points: number;
    slot: TransmogSlot;
}): Promise<CustomDesignEntry | null> {
    const result = await pool.query<CustomDesignRecord>(
        `
            UPDATE custom_design_requests
            SET status = 'pending',
                points = $2,
                slot = $3,
                updated_at = NOW()
            WHERE id = $1 AND status = 'awaiting_payment'
            RETURNING ${ENTRY_COLUMNS}
        `,
        [params.id, params.points, params.slot],
    );

    return result.rows[0] ? toCustomDesignEntry(result.rows[0]) : null;
}

// Solo borra pedidos que todavia no se cobraron.
export async function deleteAwaitingPaymentCustomDesign(id: string): Promise<void> {
    await pool.query(
        `DELETE FROM custom_design_requests WHERE id = $1 AND status = 'awaiting_payment'`,
        [id],
    );
}

export async function listCustomDesignsForCharacter(
    characterId: string,
): Promise<CustomDesignEntry[]> {
    const result = await pool.query<CustomDesignRecord>(
        `
            SELECT ${ENTRY_COLUMNS}
            FROM custom_design_requests
            WHERE character_id = $1 AND status <> 'awaiting_payment'
            ORDER BY created_at DESC
            LIMIT ${LIST_LIMIT}
        `,
        [characterId],
    );

    return result.rows.map(toCustomDesignEntry);
}

export async function listCustomDesigns(
    filter: CustomDesignListFilter,
): Promise<CustomDesignEntry[]> {
    const statuses: readonly CustomDesignStatus[] =
        filter === "all"
            ? CUSTOM_DESIGN_STATUSES
            : filter === "open"
              ? PROCESSABLE_STATUSES
              : [filter];

    const result = await pool.query<CustomDesignRecord>(
        `
            SELECT ${ENTRY_COLUMNS}
            FROM custom_design_requests
            WHERE status = ANY($1::text[])
            ORDER BY created_at DESC
            LIMIT ${LIST_LIMIT}
        `,
        [[...statuses]],
    );

    return result.rows.map(toCustomDesignEntry);
}

export async function getCustomDesignImage(id: string): Promise<{
    accountId: string;
    mime: string;
    data: Buffer;
} | null> {
    if (!isUuid(id)) {
        return null;
    }

    const result = await pool.query<{
        account_id: string;
        image_mime: string | null;
        image_data: Buffer | null;
    }>(
        `
            SELECT account_id, image_mime, image_data
            FROM custom_design_requests
            WHERE id = $1 AND status <> 'awaiting_payment'
            LIMIT 1
        `,
        [id],
    );
    const row = result.rows[0];

    if (!row || !row.image_mime || !row.image_data) {
        return null;
    }

    return { accountId: row.account_id, mime: row.image_mime, data: row.image_data };
}

export async function startCustomDesign(params: {
    id: string;
    handledBy: string;
    note: string | null;
}): Promise<CustomDesignTransitionResult> {
    if (!isUuid(params.id)) {
        return { ok: false, status: 404, error: "Pedido no encontrado." };
    }

    const result = await pool.query<CustomDesignRecord>(
        `
            UPDATE custom_design_requests
            SET status = 'in_progress',
                handled_by = $2,
                staff_note = COALESCE($3, staff_note),
                updated_at = NOW()
            WHERE id = $1 AND status = 'pending'
            RETURNING ${ENTRY_COLUMNS}
        `,
        [params.id, params.handledBy, params.note],
    );

    if (result.rows[0]) {
        return { ok: true, request: toCustomDesignEntry(result.rows[0]) };
    }

    const current = await pool.query<CustomDesignRecord>(
        `SELECT ${ENTRY_COLUMNS} FROM custom_design_requests WHERE id = $1 LIMIT 1`,
        [params.id],
    );

    return current.rows[0]
        ? invalidTransition(current.rows[0])
        : { ok: false, status: 404, error: "Pedido no encontrado." };
}

// Ejecuta una transicion que depende del game server (entregar o reembolsar)
// con la fila bloqueada: si dos staff aprietan a la vez, el segundo espera y
// despues ve el estado ya cambiado, asi que el item/reembolso sale una sola vez.
// Si el callback devuelve error (o tira), no se toca la fila.
async function withLockedCustomDesign(
    id: string,
    run: (
        client: PoolClient,
        record: CustomDesignRecord,
    ) => Promise<CustomDesignTransitionResult>,
): Promise<CustomDesignTransitionResult> {
    if (!isUuid(id)) {
        return { ok: false, status: 404, error: "Pedido no encontrado." };
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        // La llamada al game server ocurre dentro de la transaccion: se le da
        // mas margen que el idle_in_transaction por defecto del pool.
        await client.query("SET LOCAL idle_in_transaction_session_timeout = '30s'");

        const locked = await client.query<CustomDesignRecord>(
            `SELECT ${ENTRY_COLUMNS} FROM custom_design_requests WHERE id = $1 FOR UPDATE`,
            [id],
        );
        const record = locked.rows[0];

        if (!record) {
            await client.query("ROLLBACK");
            return { ok: false, status: 404, error: "Pedido no encontrado." };
        }

        if (!PROCESSABLE_STATUSES.includes(record.status)) {
            await client.query("ROLLBACK");
            return invalidTransition(record);
        }

        const result = await run(client, record);
        await client.query(result.ok ? "COMMIT" : "ROLLBACK");
        return result;
    } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
    } finally {
        client.release();
    }
}

export async function deliverCustomDesign(params: {
    id: string;
    objIndex: number;
    note: string | null;
    handledBy: string;
}): Promise<CustomDesignTransitionResult> {
    return withLockedCustomDesign(params.id, async (client, record) => {
        const delivery = await deliverItemToCharacter({
            characterId: record.character_id,
            objIndex: params.objIndex,
            amount: 1,
            reason: `Diseño personalizado: ${record.title}`,
        });

        if (!delivery.ok) {
            if (delivery.status === 404) {
                return {
                    ok: false,
                    status: 400,
                    error: "Ese item no existe en el servidor de juego (¿ya se desplegó?)",
                };
            }

            return delivery;
        }

        try {
            const updated = await client.query<CustomDesignRecord>(
                `
                    UPDATE custom_design_requests
                    SET status = 'delivered',
                        delivered_obj_index = $2,
                        staff_note = COALESCE($3, staff_note),
                        handled_by = $4,
                        updated_at = NOW()
                    WHERE id = $1 AND status IN ('pending', 'in_progress')
                    RETURNING ${ENTRY_COLUMNS}
                `,
                [record.id, params.objIndex, params.note, params.handledBy],
            );

            return { ok: true, request: toCustomDesignEntry(updated.rows[0]!) };
        } catch (error) {
            // El item ya salio del game server: si no se pudo guardar el
            // estado hay que corregirlo a mano para no entregarlo dos veces.
            console.error(
                `[API][custom-designs] Item ${params.objIndex} entregado al pedido ${record.id} pero no se pudo marcar como entregado`,
                error,
            );
            throw error;
        }
    });
}

export async function rejectCustomDesign(params: {
    id: string;
    note: string;
    handledBy: string;
}): Promise<CustomDesignTransitionResult> {
    return withLockedCustomDesign(params.id, async (client, record) => {
        if (record.points > 0) {
            try {
                await creditDonationPoints({
                    characterId: record.character_id,
                    points: record.points,
                    orderId: `custom-design-refund:${record.id}`,
                    message: `Se rechazó tu diseño "${record.title}" y se te devolvieron ${record.points} puntos de donación. Motivo: ${params.note}`,
                });
            } catch (error) {
                console.error(
                    `[API][custom-designs] No se pudo reembolsar el pedido ${record.id}`,
                    error,
                );
                return {
                    ok: false,
                    status: 503,
                    error: "No se pudieron devolver los puntos (el servidor de juego no respondió). El pedido sigue abierto, probá de nuevo.",
                };
            }
        }

        try {
            const updated = await client.query<CustomDesignRecord>(
                `
                    UPDATE custom_design_requests
                    SET status = 'rejected',
                        staff_note = $2,
                        handled_by = $3,
                        updated_at = NOW()
                    WHERE id = $1 AND status IN ('pending', 'in_progress')
                    RETURNING ${ENTRY_COLUMNS}
                `,
                [record.id, params.note, params.handledBy],
            );

            return { ok: true, request: toCustomDesignEntry(updated.rows[0]!) };
        } catch (error) {
            console.error(
                `[API][custom-designs] Pedido ${record.id} reembolsado (${record.points} pts) pero no se pudo marcar como rechazado`,
                error,
            );
            throw error;
        }
    });
}
