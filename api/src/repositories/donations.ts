import pool from "../db";

export type DonationPaymentRecord = {
    id: string;
    character_id: string;
    account_id: string;
    provider: string;
    provider_payment_id: string | null;
    order_id: string;
    package_id: string;
    price_amount: string;
    price_currency: string;
    pay_amount: string | null;
    pay_currency: string | null;
    points: number;
    status: string;
    credited: boolean;
    raw_payload: unknown;
    created_at: Date;
    updated_at: Date;
};

export async function createPendingDonationPayment(params: {
    characterId: string;
    accountId: string;
    provider: "nowpayments" | "moonpay";
    orderId: string;
    packageId: string;
    priceAmount: number;
    priceCurrency: string;
    points: number;
}): Promise<DonationPaymentRecord> {
    const result = await pool.query<DonationPaymentRecord>(
        `
      INSERT INTO donation_payments (
        character_id, account_id, provider, order_id, package_id,
        price_amount, price_currency, points, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
      RETURNING *
    `,
        [
            params.characterId,
            params.accountId,
            params.provider,
            params.orderId,
            params.packageId,
            params.priceAmount,
            params.priceCurrency,
            params.points,
        ],
    );

    return result.rows[0]!;
}

// Marca la orden como acreditada de forma atómica: si dos webhooks llegan a
// la vez, solo uno obtiene la fila y acredita los puntos.
export async function claimDonationPaymentForCredit(
    orderId: string,
): Promise<DonationPaymentRecord | null> {
    const result = await pool.query<DonationPaymentRecord>(
        `
      UPDATE donation_payments
      SET credited = TRUE, updated_at = NOW()
      WHERE order_id = $1 AND credited = FALSE
      RETURNING *
    `,
        [orderId],
    );

    return result.rows[0] ?? null;
}

export async function releaseDonationPaymentClaim(orderId: string): Promise<void> {
    await pool.query(
        `UPDATE donation_payments SET credited = FALSE, updated_at = NOW() WHERE order_id = $1`,
        [orderId],
    );
}

export async function findDonationPaymentByOrderId(
    orderId: string,
): Promise<DonationPaymentRecord | null> {
    const result = await pool.query<DonationPaymentRecord>(
        `SELECT * FROM donation_payments WHERE order_id = $1 LIMIT 1`,
        [orderId],
    );

    return result.rows[0] ?? null;
}

export async function markDonationPaymentCredited(params: {
    orderId: string;
    providerPaymentId: string | null;
    status: string;
    payAmount: number | null;
    payCurrency: string | null;
    rawPayload: unknown;
}): Promise<void> {
    await pool.query(
        `
      UPDATE donation_payments
      SET
        provider_payment_id = $2,
        status = $3,
        pay_amount = $4,
        pay_currency = $5,
        raw_payload = $6,
        credited = TRUE,
        updated_at = NOW()
      WHERE order_id = $1
    `,
        [
            params.orderId,
            params.providerPaymentId,
            params.status,
            params.payAmount,
            params.payCurrency,
            JSON.stringify(params.rawPayload),
        ],
    );
}

export async function updateDonationPaymentStatus(params: {
    orderId: string;
    providerPaymentId: string | null;
    status: string;
    rawPayload: unknown;
}): Promise<void> {
    await pool.query(
        `
      UPDATE donation_payments
      SET provider_payment_id = $2, status = $3, raw_payload = $4, updated_at = NOW()
      WHERE order_id = $1
    `,
        [params.orderId, params.providerPaymentId, params.status, JSON.stringify(params.rawPayload)],
    );
}
