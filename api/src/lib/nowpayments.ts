import crypto from "crypto";
import config from "../config";

const NOWPAYMENTS_API_BASE = "https://api.nowpayments.io/v1";

export type CreateInvoiceParams = {
    priceAmount: number;
    priceCurrency: string;
    orderId: string;
    orderDescription: string;
    ipnCallbackUrl: string;
    successUrl: string;
    cancelUrl: string;
};

export type NowPaymentsInvoice = {
    id: string;
    invoice_url: string;
};

export async function createInvoice(
    params: CreateInvoiceParams,
): Promise<NowPaymentsInvoice> {
    if (!config.nowpaymentsApiKey) {
        throw new Error("NOWPayments no está configurado (falta NOWPAYMENTS_API_KEY)");
    }

    const response = await fetch(`${NOWPAYMENTS_API_BASE}/invoice`, {
        method: "POST",
        headers: {
            "x-api-key": config.nowpaymentsApiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            price_amount: params.priceAmount,
            price_currency: params.priceCurrency,
            order_id: params.orderId,
            order_description: params.orderDescription,
            ipn_callback_url: params.ipnCallbackUrl,
            success_url: params.successUrl,
            cancel_url: params.cancelUrl,
        }),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`NOWPayments createInvoice fallo (${response.status}): ${body}`);
    }

    return (await response.json()) as NowPaymentsInvoice;
}

function sortObjectKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sortObjectKeys);
    }

    if (value && typeof value === "object") {
        const sorted: Record<string, unknown> = {};
        for (const key of Object.keys(value as Record<string, unknown>).sort()) {
            sorted[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
        }
        return sorted;
    }

    return value;
}

export function verifyIpnSignature(
    body: unknown,
    signatureHeader: string | undefined,
): boolean {
    if (!config.nowpaymentsIpnSecret || !signatureHeader) {
        return false;
    }

    const sortedPayload = JSON.stringify(sortObjectKeys(body));
    const expected = crypto
        .createHmac("sha512", config.nowpaymentsIpnSecret)
        .update(sortedPayload)
        .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signatureHeader, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
