const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

type TradeOffer = {
    gold: number;
    items: Array<{ slot: string; idItem: number; amount: number }>;
    accepted: boolean;
};

type TradeSession = {
    a: string;
    b: string;
    offers: Record<string, TradeOffer>;
};

const sessions = new Map<string, TradeSession>();

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function emptyOffer(): TradeOffer {
    return { gold: 0, items: [], accepted: false };
}

function getSession(idUser: string) {
    return sessions.get(String(idUser));
}

function partnerId(session: TradeSession, idUser: string) {
    return session.a === String(idUser) ? session.b : session.a;
}

function closeSession(session: TradeSession, message: string) {
    tell(session.a, message);
    tell(session.b, message);
    sessions.delete(session.a);
    sessions.delete(session.b);
    const userA = vars.personajes[session.a];
    const userB = vars.personajes[session.b];
    if (userA) {
        userA.playerTrade = false;
    }
    if (userB) {
        userB.playerTrade = false;
    }
}

export function requestTrade(idUser: string, targetName: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return { ok: false, message: "No se pudo comerciar." };
    }

    if (getSession(idUser)) {
        return { ok: false, message: "Ya estas comerciando." };
    }

    let target: any;
    for (const candidate of Object.values(vars.personajes) as any[]) {
        if (candidate?.nameCharacter?.toLowerCase() === targetName.trim().toLowerCase()) {
            target = candidate;
            break;
        }
    }

    if (!target || !vars.clients[target.id]) {
        return { ok: false, message: "Ese usuario no esta online." };
    }

    if (String(target.id) === String(idUser)) {
        return { ok: false, message: "No puedes comerciar contigo mismo." };
    }

    if (Number(target.map) !== Number(user.map)) {
        return { ok: false, message: "El otro jugador no esta en tu mapa." };
    }

    if (getSession(String(target.id))) {
        return { ok: false, message: "Ese jugador ya esta comerciando." };
    }

    const session: TradeSession = {
        a: String(idUser),
        b: String(target.id),
        offers: {
            [String(idUser)]: emptyOffer(),
            [String(target.id)]: emptyOffer(),
        },
    };
    sessions.set(session.a, session);
    sessions.set(session.b, session);
    user.playerTrade = true;
    target.playerTrade = true;
    tell(String(target.id), `${user.nameCharacter} quiere comerciar. Usa /ofertar, /ofertaroro y /aceptarcomercio.`);
    return { ok: true, message: `Comercio iniciado con ${target.nameCharacter}.` };
}

export function offerItem(idUser: string, slot: string, amount: number) {
    const session = getSession(idUser);
    const user = vars.personajes[idUser];
    if (!session || !user) {
        return { ok: false, message: "No estas comerciando." };
    }

    const item = user.inv?.[slot];
    if (!item || Number(item.idItem) <= 0) {
        return { ok: false, message: "No hay un item en ese slot." };
    }

    if (item.equipped) {
        return { ok: false, message: "No puedes ofertar un item equipado." };
    }

    const safeAmount = Math.max(1, Math.min(Number(item.cant ?? item.amount ?? 0), Math.floor(amount)));
    const offer = session.offers[String(idUser)];
    offer.items = [{ slot: String(slot), idItem: Number(item.idItem), amount: safeAmount }];
    offer.accepted = false;
    session.offers[partnerId(session, idUser)].accepted = false;
    tell(partnerId(session, idUser), `${user.nameCharacter} ofrece ${safeAmount} x ${vars.datObj?.[item.idItem]?.name ?? item.idItem}.`);
    return { ok: true, message: "Oferta enviada." };
}

export function offerGold(idUser: string, amount: number) {
    const session = getSession(idUser);
    const user = vars.personajes[idUser];
    if (!session || !user) {
        return { ok: false, message: "No estas comerciando." };
    }

    const safeAmount = Math.max(0, Math.min(Number(user.gold ?? 0), Math.floor(amount)));
    const offer = session.offers[String(idUser)];
    offer.gold = safeAmount;
    offer.accepted = false;
    session.offers[partnerId(session, idUser)].accepted = false;
    tell(partnerId(session, idUser), `${user.nameCharacter} ofrece ${safeAmount} oro.`);
    return { ok: true, message: `Ofreces ${safeAmount} oro.` };
}

export function acceptTrade(idUser: string) {
    const session = getSession(idUser);
    if (!session) {
        return { ok: false, message: "No estas comerciando." };
    }

    session.offers[String(idUser)].accepted = true;
    if (!session.offers[session.a].accepted || !session.offers[session.b].accepted) {
        tell(partnerId(session, idUser), "El otro jugador acepto. Confirma con /aceptarcomercio.");
        return { ok: true, message: "Esperando la aceptacion del otro jugador." };
    }

    const userA = vars.personajes[session.a];
    const userB = vars.personajes[session.b];
    const clientA = vars.clients[session.a];
    const clientB = vars.clients[session.b];
    if (!userA || !userB || !clientA || !clientB) {
        closeSession(session, "El comercio se cancelo.");
        return { ok: false, message: "El comercio se cancelo." };
    }

    const offerA = session.offers[session.a];
    const offerB = session.offers[session.b];
    if (offerA.gold > Number(userA.gold ?? 0) || offerB.gold > Number(userB.gold ?? 0)) {
        closeSession(session, "No hay oro suficiente. Comercio cancelado.");
        return { ok: false, message: "No hay oro suficiente." };
    }

    if (offerA.gold) {
        userA.gold -= offerA.gold;
        userB.gold += offerA.gold;
    }
    if (offerB.gold) {
        userB.gold -= offerB.gold;
        userA.gold += offerB.gold;
    }
    handleProtocol.actGold(userA.gold, clientA);
    handleProtocol.actGold(userB.gold, clientB);

    for (const offerItemEntry of offerA.items) {
        game.quitarUserInvItem(session.a, offerItemEntry.slot, offerItemEntry.amount);
        game.putItemToInv(session.b, offerItemEntry.idItem, offerItemEntry.amount);
    }
    for (const offerItemEntry of offerB.items) {
        game.quitarUserInvItem(session.b, offerItemEntry.slot, offerItemEntry.amount);
        game.putItemToInv(session.a, offerItemEntry.idItem, offerItemEntry.amount);
    }

    closeSession(session, "Comercio completado.");
    return { ok: true, message: "Comercio completado." };
}

export function cancelTrade(idUser: string) {
    const session = getSession(idUser);
    if (!session) {
        return { ok: false, message: "No estas comerciando." };
    }

    closeSession(session, "El comercio fue cancelado.");
    return { ok: true, message: "Comercio cancelado." };
}

export function onUserLeft(idUser: string) {
    const session = getSession(idUser);
    if (session) {
        closeSession(session, "El comercio se cancelo porque un jugador se fue.");
    }
}
