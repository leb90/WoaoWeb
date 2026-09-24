import config from "../config";

const MERCADOPAGO_API_BASE = "https://api.mercadopago.com";

export function isMercadoPagoConfigured(): boolean {
    return Boolean(config.mercadopagoAccessToken && config.donationsArsPerUsd);
}

export function usdToArs(usd: number): number {
    return Math.ceil(usd * (config.donationsArsPerUsd ?? 0));
}

export async function createCheckoutPreference(params: {
    orderId: string;
    title: string;
    unitPriceArs: number;
    notificationUrl: string;
    successUrl: string;
    pendingUrl: string;
    failureUrl: string;
}): Promise<{ id: string; initPoint: string }> {
    const response = await fetch(`${MERCADOPAGO_API_BASE}/checkout/preferences`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${config.mercadopagoAccessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            items: [
                {
                    id: params.orderId,
                    title: params.title,
                    quantity: 1,
                    currency_id: "ARS",
                    unit_price: params.unitPriceArs,
                },
            ],
            external_reference: params.orderId,
            notification_url: params.notificationUrl,
            back_urls: {
                success: params.successUrl,
                pending: params.pendingUrl,
                failure: params.failureUrl,
            },
            auto_return: "approved",
            statement_descriptor: "WORLD OF AO",
        }),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Mercado Pago no pudo crear el pago (${response.status}): ${body}`);
    }

    const preference = (await response.json()) as { id: string; init_point: string };
    return { id: preference.id, initPoint: preference.init_point };
}

export type MercadoPagoPayment = {
    id: number;
    status: string;
    external_reference: string | null;
    transaction_amount: number;
    currency_id: string;
};

// Se consulta el pago directo a Mercado Pago con nuestro token: así no importa
// lo que diga el aviso que llegó, solo cuenta el estado real del pago.
export async function getPayment(paymentId: string): Promise<MercadoPagoPayment | null> {
    const response = await fetch(
        `${MERCADOPAGO_API_BASE}/v1/payments/${encodeURIComponent(paymentId)}`,
        { headers: { Authorization: `Bearer ${config.mercadopagoAccessToken}` } },
    );

    if (response.status === 404 || response.status === 403) {
        return null;
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`Mercado Pago no pudo consultar el pago (${response.status}): ${body}`);
    }

    return (await response.json()) as MercadoPagoPayment;
}
