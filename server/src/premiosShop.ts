const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const socket = require("./socket");
const { getProgress, saveProgress } = require("./woaoProgress");

type Premio = {
    id: number;
    name: string;
    objIndex: number;
    cost: number;
    desc: string;
};

const premios = require("../jsons/premios.json") as Record<string, Premio>;
const donaciones = require("../jsons/donaciones.json") as Record<string, Premio>;

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

export function listDonaciones(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    tell(idUser, `Puntos de donacion: ${progress.puntosDonacion}`);
    for (const premio of Object.values(donaciones)) {
        tell(idUser, `[${premio.id}] ${premio.name} - ${premio.cost} pts`);
    }
    tell(idUser, "Usa /canjeardonacion numero para canjear.");
}

function clampQuantity(quantity: number) {
    return Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));
}

function refreshUserSnapshot(idUser: string, user: any) {
    const client = vars.clients[idUser];
    if (!client) {
        return;
    }

    handleProtocol.sendMyCharacter(user);
    socket.send(client);
}

function canReceiveItem(user: any, idItem: number, quantity: number) {
    const obj = vars.datObj?.[idItem];
    if (!obj) {
        return false;
    }

    if (obj.objType == vars.objType.dinero) {
        return true;
    }

    const inventory = user.inv ?? {};
    let existingCapacity = 0;
    for (const item of Object.values(inventory) as any[]) {
        if (Number(item?.idItem) === idItem) {
            existingCapacity += Math.max(0, 10000 - Number(item?.cant ?? 0));
        }
    }

    const slotsNeeded = Math.ceil(Math.max(0, quantity - existingCapacity) / 10000);
    return Object.keys(inventory).length + slotsNeeded <= 21;
}

function redeemFromCatalog(
    idUser: string,
    premioId: number,
    quantity: number,
    catalog: Record<string, Premio>,
    currency: "quest" | "donation",
) {
    const user = vars.personajes[idUser];
    const premio = catalog[String(premioId)];
    if (!user) {
        return { ok: false, message: "No se pudo canjear." };
    }

    if (!premio) {
        return { ok: false, message: "Ese premio no existe." };
    }

    const safeQuantity = clampQuantity(quantity);
    const totalCost = premio.cost * safeQuantity;
    const progress = getProgress(user);
    const currentPoints = currency === "quest" ? progress.puntosCanje : progress.puntosDonacion;
    if (currentPoints < totalCost) {
        return { ok: false, message: `Necesitas ${totalCost} puntos. Tienes ${currentPoints}.` };
    }

    if (!vars.datObj?.[premio.objIndex]) {
        return { ok: false, message: "Ese item todavia no esta cargado en el mundo." };
    }

    if (!canReceiveItem(user, premio.objIndex, safeQuantity)) {
        return { ok: false, message: "No tienes suficiente espacio en el inventario." };
    }

    if (currency === "quest") {
        progress.puntosCanje -= totalCost;
        user.puntosCanje = progress.puntosCanje;
    } else {
        progress.puntosDonacion -= totalCost;
        user.puntosDonacion = progress.puntosDonacion;
    }

    saveProgress(user);
    game.putItemToInv(idUser, premio.objIndex, safeQuantity);
    refreshUserSnapshot(idUser, user);

    const remaining = currency === "quest" ? progress.puntosCanje : progress.puntosDonacion;
    const quantityText = safeQuantity > 1 ? ` x${safeQuantity}` : "";
    return { ok: true, message: `Canjeaste ${premio.name}${quantityText}. Te quedan ${remaining} puntos.` };
}

export function redeemPremio(idUser: string, premioId: number, quantity = 1) {
    return redeemFromCatalog(idUser, premioId, quantity, premios, "quest");
}

export function redeemDonacion(idUser: string, premioId: number, quantity = 1) {
    return redeemFromCatalog(idUser, premioId, quantity, donaciones, "donation");
}
