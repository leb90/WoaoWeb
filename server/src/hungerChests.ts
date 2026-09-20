const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

const CHEST_NPCS = new Set([732, 733, 734, 735, 736]);

const SHIELDS: Record<number, number> = {
    1: 952,
    2: 950,
    3: 500,
    4: 745,
    6: 745,
    7: 951,
    8: 500,
    9: 745,
    20: 745,
};

const WEAPONS: Record<number, number> = {
    1: 1037,
    2: 559,
    3: 1056,
    4: 1127,
    6: 559,
    7: 1037,
    8: 1056,
    9: 844,
    18: 1056,
    20: 844,
};

const ARMORS: Record<number, [number, number]> = {
    1: [732, 952],
    2: [730, 950],
    3: [729, 500],
    4: [496, 745],
    6: [496, 745],
    7: [731, 951],
    8: [729, 500],
    9: [496, 745],
    20: [496, 745],
};

const HELMETS: Record<number, number> = {
    1: 1223,
    2: 766,
    3: 764,
    4: 766,
    6: 766,
    7: 1223,
    8: 1088,
    9: 765,
    18: 1077,
    20: 765,
};

function classId(user: { idClase?: number }) {
    return Number(user.idClase ?? 3);
}

function drop(idUser: string, user: { map?: number; pos?: { x: number; y: number } }, objIndex: number, amount: number) {
    if (!vars.datObj?.[objIndex] || !user.pos) {
        return;
    }

    require("./npcs").tirarItemAlSuelo(objIndex, amount, Number(user.map), user.pos, idUser);
}

function announce(idUser: string, message: string) {
    const hungerGames = require("./hungerGames") as { announceToParticipants?: (message: string) => void };
    if (typeof hungerGames.announceToParticipants === "function") {
        hungerGames.announceToParticipants(message);
        return;
    }

    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Juegos del Hambre> ${message}`, "#E69500", 1, 0, client);
    }
}

export function isChestNpc(templateNpcIndex: number) {
    return CHEST_NPCS.has(Number(templateNpcIndex));
}

export function onChestNpcKilled(idUser: string, templateNpcIndex: number) {
    const user = vars.personajes[idUser];
    if (!user?.hungerGames || Number(user.map) !== 269) {
        return false;
    }

    const chest = Number(templateNpcIndex);
    if (!CHEST_NPCS.has(chest)) {
        return false;
    }

    const clase = classId(user);
    const name = String(user.nameCharacter ?? "Alguien");

    if (chest === 732) {
        announce(idUser, `${name} encontro un Cofre Sorpresa de Armas.`);
        drop(idUser, user, WEAPONS[clase] ?? 1056, 1);
        return true;
    }

    if (chest === 733) {
        announce(idUser, `${name} encontro un Cofre Sorpresa de Armaduras.`);
        const [armor, shield] = ARMORS[clase] ?? [729, 500];
        drop(idUser, user, armor, 1);
        drop(idUser, user, shield, 1);
        return true;
    }

    if (chest === 734) {
        announce(idUser, `${name} encontro un Cofre Sorpresa de Cascos.`);
        drop(idUser, user, HELMETS[clase] ?? 764, 1);
        return true;
    }

    if (chest === 735) {
        announce(idUser, `${name} encontro un Cofre Sorpresa de Pociones.`);
        drop(idUser, user, 36, 4);
        drop(idUser, user, 39, 4);
        drop(idUser, user, 38, 20);
        return true;
    }

    announce(idUser, `${name} encontro un Cofre Sorpresa de Escudos y Mana.`);
    drop(idUser, user, SHIELDS[clase] ?? 500, 1);
    drop(idUser, user, 37, 20);
    return true;
}
