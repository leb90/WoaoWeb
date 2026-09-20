const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

type TravelRoute = {
    fromMap: number;
    key: string;
    map: number;
    x: number;
    y: number;
    cost: number;
    boat?: boolean;
};

const routes = require("../jsons/fastTravel.json") as TravelRoute[];
const BOAT_ITEMS = [474, 475, 476];

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function hasBoat(user: any) {
    for (const item of Object.values(user.inv ?? {}) as Array<{ idItem?: number }>) {
        if (BOAT_ITEMS.includes(Number(item?.idItem ?? 0))) {
            return true;
        }
    }
    return false;
}

export function listRoutes(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    const available = routes.filter((route) => route.fromMap === Number(user.map));
    if (!available.length) {
        tell(idUser, "Desde este mapa no hay viajes rapidos. Ve a un viajero en una ciudad.");
        return;
    }

    tell(idUser, "Destinos: " + available.map((route) => route.key).join(", "));
    tell(idUser, "Usa /viaje DESTINO");
}

export function travel(idUser: string, destination: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo viajar." };
    }

    const key = destination.trim().toUpperCase();
    if (!key) {
        listRoutes(idUser);
        return { ok: true, message: "Elige un destino." };
    }

    const route = routes.find((entry) => entry.fromMap === Number(user.map) && entry.key === key);
    if (!route) {
        listRoutes(idUser);
        return { ok: false, message: "Ese destino no esta disponible desde aca." };
    }

    if (Number(user.gold ?? 0) < route.cost) {
        return { ok: false, message: `Necesitas ${route.cost} oro.` };
    }

    if (route.boat && !hasBoat(user)) {
        return { ok: false, message: "Para viajar a una isla necesitas una embarcacion y 40 de navegacion." };
    }

    if (route.cost) {
        user.gold -= route.cost;
        handleProtocol.actGold(user.gold, client);
    }

    game.forceDismount(idUser);
    game.telep(client, route.map, route.x, route.y, "viaje");
    return { ok: true, message: `Viajaste a ${route.key}.` };
}
