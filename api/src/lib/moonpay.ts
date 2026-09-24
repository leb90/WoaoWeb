import crypto from "crypto";
import config from "../config";

const MOONPAY_API_BASE = "https://api.moonpay.com";
const LIMITS_CACHE_TTL_MS = 10 * 60 * 1000;

let limitsCache: { value: number | null; expiresAt: number } | null = null;

export function isMoonpayConfigured(): boolean {
    return Boolean(
        config.moonpayPublishableKey &&
            config.moonpaySecretKey &&
            config.moonpayWebhookKey &&
            config.moonpayWalletAddress,
    );
}

function getWidgetBaseUrl(): string {
    return config.moonpayPublishableKey?.startsWith("pk_test_")
        ? "https://buy-sandbox.moonpay.com"
        : "https://buy.moonpay.com";
}

export function buildSignedWidgetUrl(params: {
    orderId: string;
    usdAmount: number;
    redirectUrl: string;
}): string {
    if (!isMoonpayConfigured()) {
        throw new Error("MoonPay no está configurado");
    }

    const query = new URLSearchParams({
        apiKey: config.moonpayPublishableKey!,
        currencyCode: config.moonpayCurrencyCode,
        baseCurrencyCode: "usd",
        baseCurrencyAmount: String(Math.round(params.usdAmount)),
        lockAmount: "true",
        walletAddress: config.moonpayWalletAddress!,
        externalTransactionId: params.orderId,
        redirectURL: params.redirectUrl,
    });

    const originalUrl = `${getWidgetBaseUrl()}?${query.toString()}`;
    const signature = crypto
        .createHmac("sha256", config.moonpaySecretKey!)
        .update(new URL(originalUrl).search)
        .digest("base64");

    return `${originalUrl}&signature=${encodeURIComponent(signature)}`;
}

// Mínimo de compra con tarjeta (en USD, comisiones incluidas) para la moneda configurada.
// Devuelve null si no se pudo consultar; en ese caso no se bloquea nada.
export async function getCardMinimumUsd(): Promise<number | null> {
    if (!config.moonpayPublishableKey) {
        return null;
    }

    if (limitsCache && limitsCache.expiresAt > Date.now()) {
        return limitsCache.value;
    }

    let value: number | null = null;

    try {
        const query = new URLSearchParams({
            apiKey: config.moonpayPublishableKey,
            baseCurrencyCode: "usd",
            paymentMethod: "credit_debit_card",
            areFeesIncluded: "true",
        });
        const response = await fetch(
            `${MOONPAY_API_BASE}/v3/currencies/${encodeURIComponent(config.moonpayCurrencyCode)}/limits?${query.toString()}`,
        );

        if (response.ok) {
            const body = (await response.json()) as {
                baseCurrency?: { minBuyAmount?: number };
            };
            const min = Number(body.baseCurrency?.minBuyAmount);
            value = Number.isFinite(min) && min > 0 ? min : null;
        }
    } catch {
        value = null;
    }

    limitsCache = { value, expiresAt: Date.now() + LIMITS_CACHE_TTL_MS };
    return value;
}

// Header: "t=<timestamp>,s=<firma hex>", firma = HMAC-SHA256(webhookKey, `${t}.${cuerpoCrudo}`).
export function verifyWebhookSignature(
    rawBody: string,
    signatureHeader: string | undefined,
): boolean {
    if (!config.moonpayWebhookKey || !signatureHeader || !rawBody) {
        return false;
    }

    const parts = Object.fromEntries(
        signatureHeader.split(",").map((part) => {
            const separatorIndex = part.indexOf("=");
            return [part.slice(0, separatorIndex).trim(), part.slice(separatorIndex + 1).trim()];
        }),
    ) as Record<string, string>;

    if (!parts.t || !parts.s) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", config.moonpayWebhookKey)
        .update(`${parts.t}.${rawBody}`)
        .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(parts.s, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}
