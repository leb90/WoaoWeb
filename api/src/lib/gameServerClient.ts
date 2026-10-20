import config from "../config";
import type { TransmogSlot } from "../types";

const TRANSMOG_SLOTS: readonly TransmogSlot[] = ["casco", "escudo", "arma", "cuerpo"];
const SHOP_UNAVAILABLE_MESSAGE = "La tienda no está disponible en este momento.";
const GAME_SERVER_UNAVAILABLE_MESSAGE = "El servidor de juego no está disponible en este momento.";
// Errores del game server que se le pasan tal cual a quien llamo:
// 400 datos invalidos, 402 puntos insuficientes, 404 producto/item inexistente.
const PASSTHROUGH_ERROR_STATUSES = new Set([400, 402, 404]);

// Resultado de una llamada al game server que puede fallar "de forma esperada"
// (puntos insuficientes, producto o item inexistente, datos invalidos). Esos
// casos no tiran excepcion: vuelven con el status y el mensaje del game server
// para que la ruta los reenvie tal cual al jugador o al staff.
export type GameServerFailure = {
    ok: false;
    status: number;
    error: string;
    // true si no hubo respuesta (corte de red): el resultado es incierto.
    network?: boolean;
};

export type ChargeCustomDesignResult =
    | {
          ok: true;
          points: number;
          slot: TransmogSlot;
          productName: string;
          balance: number;
      }
    | (GameServerFailure & {
          // true si el game server confirmo el cobro pero la respuesta no se
          // pudo interpretar: el pedido NO se debe borrar (hay que conciliar).
          charged?: boolean;
      });

export type DeliverItemResult =
    | {
          ok: true;
          delivered: "now" | "queued";
      }
    | GameServerFailure;

export async function creditDonationPoints(params: {
    characterId: string;
    points: number;
    orderId?: string;
    // Si viene, el game server se lo muestra al jugador en vez del
    // "gracias por tu donación" (por ejemplo, en un reembolso).
    message?: string;
}): Promise<void> {
    const response = await fetch(`${config.gameServerUrl}/internal/credit-donation-points`, {
        method: "POST",
        headers: {
            Authorization: config.tokenAuth,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const body = await response.text().catch(() => "");
        throw new Error(`No se pudo acreditar los puntos en el game-server (${response.status}): ${body}`);
    }
}

async function readJsonBody(response: Response): Promise<Record<string, unknown>> {
    const text = await response.text().catch(() => "");

    if (!text.trim()) {
        return {};
    }

    try {
        const parsed = JSON.parse(text) as unknown;
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
}

// POST JSON a un endpoint /internal del game server. Si no hay conexion (o el
// game server explota) devuelve un 503 con unavailableMessage en vez de tirar.
async function postToGameServer(
    path: string,
    body: unknown,
    unavailableMessage: string,
): Promise<{ ok: true; body: Record<string, unknown> } | GameServerFailure> {
    let response: Response;

    try {
        response = await fetch(`${config.gameServerUrl}${path}`, {
            method: "POST",
            headers: {
                Authorization: config.tokenAuth,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (error) {
        console.error(`[API][game-server] POST ${path} fallo por red`, error);
        return { ok: false, status: 503, error: unavailableMessage, network: true };
    }

    const json = await readJsonBody(response);

    if (!response.ok) {
        const message = typeof json.error === "string" && json.error.trim() ? json.error : null;

        // Solo se reenvian los errores "de negocio" del contrato (con mensaje).
        // Un 401 (token mal configurado), un 5xx o una respuesta sin { error }
        // se muestran como "no disponible": no le sirven al jugador y un 401
        // reenviado se confundiria con una sesion vencida en el frontend.
        if (!message || !PASSTHROUGH_ERROR_STATUSES.has(response.status)) {
            console.error(`[API][game-server] POST ${path} -> ${response.status}`, json);
            return { ok: false, status: 503, error: unavailableMessage };
        }

        return { ok: false, status: response.status, error: message };
    }

    return { ok: true, body: json };
}

// Cobra un diseño personalizado descontando puntos de donacion. El game server
// es el que conoce el catalogo (precio y slot de cada producto).
export async function chargeCustomDesign(params: {
    characterId: string;
    productId: string;
    requestId: string;
}): Promise<ChargeCustomDesignResult> {
    let result = await postToGameServer(
        "/internal/donation-shop/charge-design",
        params,
        SHOP_UNAVAILABLE_MESSAGE,
    );

    // Si se cortó la red no sabemos si el game server llegó a cobrar: se
    // reintenta una vez con el mismo requestId (el cobro es idempotente por
    // pedido, un reintento nunca cobra dos veces).
    if (!result.ok && result.network) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        result = await postToGameServer(
            "/internal/donation-shop/charge-design",
            params,
            SHOP_UNAVAILABLE_MESSAGE,
        );
    }

    if (!result.ok) {
        return result;
    }

    const { points, slot, productName, balance } = result.body;

    if (
        typeof points !== "number" ||
        typeof slot !== "string" ||
        !TRANSMOG_SLOTS.includes(slot as TransmogSlot)
    ) {
        // Si llega aca, el game server cobro pero respondio algo que no
        // entendemos: se loguea fuerte para poder conciliar a mano.
        console.error(
            "[API][game-server] charge-design respondio ok con un body invalido",
            { ...params, body: result.body },
        );
        return {
            ok: false,
            status: 502,
            error: "No pudimos confirmar tu pedido. Avisale al staff para que lo revise.",
            charged: true,
        };
    }

    return {
        ok: true,
        points,
        slot: slot as TransmogSlot,
        productName: typeof productName === "string" ? productName : "",
        balance: typeof balance === "number" ? balance : 0,
    };
}

// Entrega un item al personaje: si esta online va directo al inventario
// ("now"), si no queda encolado para cuando entre ("queued").
export async function deliverItemToCharacter(params: {
    characterId: string;
    objIndex: number;
    amount: number;
    reason: string;
}): Promise<DeliverItemResult> {
    const result = await postToGameServer(
        "/internal/deliver-item",
        params,
        GAME_SERVER_UNAVAILABLE_MESSAGE,
    );

    if (!result.ok) {
        return result;
    }

    return {
        ok: true,
        delivered: result.body.delivered === "queued" ? "queued" : "now",
    };
}
