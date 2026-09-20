const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getProgress, saveProgress } = require("./woaoProgress");

type Premio = {
    id: number;
    name: string;
    objIndex: number;
    cost: number;
    desc: string;
};

const premios = require("../jsons/premios.json") as Record<string, Premio>;

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

export function listPremios(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    tell(idUser, `Puntos de canje: ${progress.puntosCanje}`);
    for (const premio of Object.values(premios)) {
        tell(idUser, `[${premio.id}] ${premio.name} — ${premio.cost} pts`);
    }
    tell(idUser, "Usa /canjear numero para canjear.");
}

export function redeemPremio(idUser: string, premioId: number) {
    const user = vars.personajes[idUser];
    const premio = premios[String(premioId)];
    if (!user) {
        return { ok: false, message: "No se pudo canjear." };
    }

    if (!premio) {
        return { ok: false, message: "Ese premio no existe. Usa /premios." };
    }

    const progress = getProgress(user);
    if (progress.puntosCanje < premio.cost) {
        return { ok: false, message: `Necesitas ${premio.cost} puntos. Tienes ${progress.puntosCanje}.` };
    }

    if (!vars.datObj?.[premio.objIndex]) {
        return { ok: false, message: "Ese item todavia no esta cargado en el mundo." };
    }

    progress.puntosCanje -= premio.cost;
    user.puntosCanje = progress.puntosCanje;
    saveProgress(user);
    game.putItemToInv(idUser, premio.objIndex, 1);
    return { ok: true, message: `Canjeaste ${premio.name}. Te quedan ${progress.puntosCanje} puntos.` };
}
