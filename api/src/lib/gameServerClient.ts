import config from "../config";

export async function creditDonationPoints(params: {
    characterId: string;
    points: number;
    orderId: string;
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
