const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const balance = require("./balance");
const { getProgress, saveProgress } = require("./woaoProgress");

const ANKH_ITEM = 882;
const MIN_LEVEL = 57;

const BRANCHES: Record<string, { name: string; int: number; con: number }> = {
    "ELIAN-LAL": { name: "Elian-LAL", int: 4, con: 0 },
    "GORK-ROR": { name: "Gork-RoR", int: 0, con: 4 },
    DRAKON: { name: "Drakon", int: 2, con: 2 },
};

const SPAWNS: Record<number, { map: number; x: number; y: number }> = {
    6: { map: 34, x: 50, y: 50 },
    1: { map: 34, x: 50, y: 50 },
    8: { map: 34, x: 50, y: 50 },
    2: { map: 34, x: 50, y: 50 },
    3: { map: 34, x: 50, y: 50 },
    7: { map: 34, x: 50, y: 50 },
    4: { map: 34, x: 50, y: 50 },
    5: { map: 34, x: 50, y: 50 },
    9: { map: 34, x: 50, y: 50 },
    10: { map: 34, x: 50, y: 50 },
    11: { map: 34, x: 50, y: 50 },
    12: { map: 34, x: 50, y: 50 },
};

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function countItem(user: any, itemId: number) {
    let total = 0;
    for (const item of Object.values(user.inv ?? {}) as Array<{ idItem?: number; cant?: number; amount?: number }>) {
        if (Number(item?.idItem) === itemId) {
            total += Number(item.cant ?? item.amount ?? 0);
        }
    }
    return total;
}

function clearInventory(idUser: string, user: any) {
    for (const slot of Object.keys(user.inv ?? {})) {
        const item = user.inv[slot];
        const amount = Number(item?.cant ?? item?.amount ?? 0);
        if (amount > 0) {
            game.quitarUserInvItem(idUser, slot, amount);
        }
    }
    user.idItemWeapon = 0;
    user.idItemBody = 0;
    user.idItemShield = 0;
    user.idItemHelmet = 0;
    user.idItemArrow = 0;
    user.idItemRing = 0;
}

export function doRemort(idUser: string, raceRaw: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo hacer remort." };
    }

    const branch = BRANCHES[raceRaw.trim().toUpperCase()];
    if (!branch) {
        return { ok: false, message: "Razas posibles: ELIAN-LAL, GORK-ROR, DRAKON." };
    }

    if (user.navegando) {
        return { ok: false, message: "Deja de navegar." };
    }

    if (user.mounted) {
        return { ok: false, message: "Bajate de la montura." };
    }

    if (user.idItemWeapon || user.idItemBody || user.idItemShield || user.idItemHelmet) {
        return { ok: false, message: "Desequipate todo." };
    }

    if (Number(user.level ?? 1) < MIN_LEVEL) {
        return { ok: false, message: "Podras hacer remort desde nivel 57 (Temporada 2)." };
    }

    if (Number(user.privileges ?? 0) > 0) {
        return { ok: false, message: "Dejate de joder, y atende los SOS." };
    }

    const progress = getProgress(user);
    if (progress.remort > 0 || Number(user.remort ?? 0) > 0) {
        return { ok: false, message: "Ya has hecho remort." };
    }

    if (user.clanId || user.clan) {
        return { ok: false, message: "Debes salir del Clan." };
    }

    if (Number(user.gold ?? 0) > 0) {
        return { ok: false, message: "Deja tu oro en el Banco antes de hacer remort." };
    }

    if (countItem(user, ANKH_ITEM) < 1 && vars.datObj?.[ANKH_ITEM]) {
        return { ok: false, message: "Necesitas un Amuleto Ankh (882) para hacer remort." };
    }

    if (vars.datObj?.[ANKH_ITEM]) {
        for (const [slot, item] of Object.entries(user.inv ?? {}) as Array<[string, any]>) {
            if (Number(item?.idItem) === ANKH_ITEM) {
                game.quitarUserInvItem(idUser, slot, 1);
                break;
            }
        }
    }

    user.attrInteligencia = Number(user.attrInteligencia ?? 18) + branch.int;
    user.attrConstitucion = Number(user.attrConstitucion ?? 18) + branch.con;
    user.level = 1;
    user.exp = 0;
    user.expNextLevel = balance.getLegacyExpNextLevelForLevel(1);
    user.gold = 0;
    user.minHit = 2;
    user.maxHit = 3;
    user.faction = "none";
    user.criminal = 0;
    user.spells = {};
    clearInventory(idUser, user);
    game.forceDismount(idUser);

    user.maxHp = balance.getMaxHpForLevel(user.idClase, user.attrConstitucion, 1);
    user.hp = user.maxHp;
    user.maxMana = Number(user.maxMana ?? 0) > 0 ? 50 + Number(user.attrInteligencia ?? 0) : 0;
    user.mana = user.maxMana;
    handleProtocol.updateHP(user.hp, client);
    handleProtocol.updateMaxHP(idUser, user.hp, user.maxHp, client);
    if (typeof handleProtocol.updateMana === "function") {
        handleProtocol.updateMana(user.mana, client);
    }
    handleProtocol.actGold(0, client);
    handleProtocol.actExp(user.exp, client);
    handleProtocol.actMyLevel(idUser, client);

    progress.remort = 1;
    progress.remorted = branch.name;
    progress.pClan = 0;
    user.remort = 1;
    user.remorted = branch.name;
    saveProgress(user);

    const spawn = SPAWNS[Number(user.idRaza ?? 1)] ?? { map: 34, x: 50, y: 50 };
    game.telep(client, spawn.map, spawn.x, spawn.y, "remort");
    tell(idUser, `Has renacido como ${branch.name}. Bienvenido a la Temporada 2.`);
    void game.persistCharacterSnapshot(user, { connected: true });
    return { ok: true, message: `Remort completado: ${branch.name}.` };
}
