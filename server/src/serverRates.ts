// Multiplicadores de experiencia y oro de las criaturas (vars.multiplicadorExp y multiplicadorGold). Los guarda la API
// en runtime_settings: se cargan al arrancar y un GM los cambia en vivo con /experiencia y /oro. Si nunca se cambiaron,
// la API arranca en experiencia x20 (pedido para la beta, 2026-11-01).
export {};

const vars = require("./vars");
const funct = require("./functions");

type ServerRates = { expMultiplier: number; goldMultiplier: number };

function applyRates(rates: Partial<ServerRates> | undefined) {
    if (Number(rates?.expMultiplier) > 0) {
        vars.multiplicadorExp = Number(rates?.expMultiplier);
    }
    if (Number(rates?.goldMultiplier) > 0) {
        vars.multiplicadorGold = Number(rates?.goldMultiplier);
    }
}

export async function loadServerRates() {
    try {
        const result = (await funct.fetchUrl("/internal/runtime-config", {
            cache: "no-store",
            headers: { Authorization: vars.tokenAuth },
        })) as { rates?: ServerRates };
        applyRates(result.rates);
    } catch (error) {
        funct.dumpError(error);
    }
    return getServerRates();
}

export async function updateServerRate(key: keyof ServerRates, value: number) {
    const result = (await funct.fetchUrl("/internal/runtime-config/rates", {
        method: "PUT",
        body: JSON.stringify({ key, value }),
        headers: {
            "Content-Type": "application/json",
            Authorization: vars.tokenAuth,
        },
    })) as { rates?: ServerRates };
    applyRates(result.rates);
    return getServerRates();
}

export function getServerRates(): ServerRates {
    return { expMultiplier: Number(vars.multiplicadorExp), goldMultiplier: Number(vars.multiplicadorGold) };
}
