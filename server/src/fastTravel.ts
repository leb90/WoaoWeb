const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const socket = require("./socket");
const { getProgress, saveProgress } = require("./woaoProgress");

type TravelRoute = {
    fromMap: number;
    key: string;
    map: number;
    x: number;
    y: number;
    cost: number;
    boat?: boolean;
};

type DungeonRoute = {
    key: string;
    name: string;
    map: number;
    x: number;
    y: number;
    cost: number;
};

const routes = require("../jsons/fastTravel.json") as TravelRoute[];
const dungeonRoutes = require("../jsons/dungeonTravel.json") as DungeonRoute[];
const BOAT_ITEMS = [474, 475, 476];
const DUNGEON_LANDING_RADIUS = 5;

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

    tell(
        idUser,
        "Destinos: " + available.map((route) => `${route.key} (${route.cost} oro)`).join(", "),
    );
    tell(idUser, "Usa /viaje DESTINO");
}

function refreshUserSnapshot(idUser: string, user: any) {
    const client = vars.clients[idUser];
    if (!client) {
        return;
    }

    handleProtocol.sendMyCharacter(user);
    socket.send(client);
}

function isDungeonLandingTile(map: number, x: number, y: number, userId: string) {
    if (x < 1 || y < 1 || x > 100 || y > 100) {
        return false;
    }

    const tile = vars.mapa?.[map]?.[y]?.[x];
    if (!tile || tile.blocked || typeof tile.tileExit !== "undefined") {
        return false;
    }

    if (game.hayAgua(map, { x, y })) {
        return false;
    }

    const occupantId = vars.mapData?.[map]?.[y]?.[x]?.id;
    return !occupantId || String(occupantId) === String(userId);
}

function findDungeonLanding(route: DungeonRoute, userId: string) {
    let best: { x: number; y: number; distance: number } | null = null;

    for (let offsetY = -DUNGEON_LANDING_RADIUS; offsetY <= DUNGEON_LANDING_RADIUS; offsetY++) {
        for (let offsetX = -DUNGEON_LANDING_RADIUS; offsetX <= DUNGEON_LANDING_RADIUS; offsetX++) {
            const x = route.x + offsetX;
            const y = route.y + offsetY;
            if (!isDungeonLandingTile(route.map, x, y, userId)) {
                continue;
            }

            const distance = offsetX * offsetX + offsetY * offsetY;
            if (!best || distance < best.distance) {
                best = { x, y, distance };
            }
        }
    }

    return best;
}

export function travelDungeon(idUser: string, destination: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo viajar." };
    }

    if (user.dead) {
        return { ok: false, message: "No podes viajar mientras estas muerto." };
    }

    const key = destination.trim();
    const route = dungeonRoutes.find((entry) => entry.key === key || String(entry.map) === key);
    if (!route) {
        return { ok: false, message: "Ese dungeon no existe." };
    }

    const denied = game.getMapEntryDeniedMessage(user, route.map);
    if (denied) {
        return { ok: false, message: denied };
    }

    const landing = findDungeonLanding(route, idUser);
    if (!landing) {
        return { ok: false, message: "No hay tierra libre junto a esa entrada." };
    }

    const progress = getProgress(user);
    const points = Number(progress.puntosDonacion ?? 0);
    if (points < route.cost) {
        return { ok: false, message: `Necesitas ${route.cost} puntos de donacion. Tienes ${points}.` };
    }

    progress.puntosDonacion = points - route.cost;
    user.puntosDonacion = progress.puntosDonacion;
    saveProgress(user);

    game.forceDismount(idUser);
    game.telep(client, route.map, landing.x, landing.y, "dungeon");
    refreshUserSnapshot(idUser, user);
    return {
        ok: true,
        message: `Llegaste a ${route.name}. Gastaste ${route.cost} puntos de donacion. Te quedan ${progress.puntosDonacion}.`,
    };
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
        return { ok: false, message: `Necesitas ${route.cost} monedas de oro.` };
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
    return {
        ok: true,
        message: route.cost ? `Viajaste a ${route.key} por ${route.cost} monedas de oro.` : `Viajaste a ${route.key}.`,
    };
}
