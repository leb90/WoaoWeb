export {};

const vars = require("./vars");
const game = require("./game");
const handleProtocol = require("./handleProtocol");
const safeZone = require("./safeZone");
const balance = require("./balance");
const skills = require("./skills");

// Puerto fiel de DoRobar/RobarObjeto (Trabajo.bas del servidor viejo).
const STEAL_SUERTE_BY_SKILL: Array<[maxSkill: number, suerte: number]> = [
    [20, 35],
    [40, 30],
    [60, 28],
    [80, 24],
    [100, 22],
    [120, 20],
    [140, 18],
    [160, 15],
    [180, 11],
    [200, 7],
];

function getStealSuerte(skillRobar: number): number {
    if (skillRobar >= 200) {
        return 5;
    }

    for (const [maxSkill, suerte] of STEAL_SUERTE_BY_SKILL) {
        if (skillRobar <= maxSkill) {
            return suerte;
        }
    }

    return 7;
}

function rollStealSuccess(skillRobar: number): boolean {
    const suerte = getStealSuerte(skillRobar);
    const roll = Math.floor(Math.random() * suerte) + 1;
    return roll < 4;
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "white", 0, 0, client);
    }
}

function isRobableItem(item: { idItem?: number; cant?: number; equipped?: number | boolean } | null | undefined) {
    if (!item || Number(item.cant) <= 0 || Number(item.equipped)) {
        return false;
    }

    const data = vars.datObj[Number(item.idItem)];
    return Boolean(data) && Number(data.objType) !== vars.objType.llaves;
}

function findRobableSlot(victim: any): string | null {
    const slots = Object.keys(victim.inv ?? {})
        .filter((slot) => isRobableItem(victim.inv[slot]))
        .sort((a, b) => Number(a) - Number(b));

    if (slots.length === 0) {
        return null;
    }

    const ascending = Math.floor(Math.random() * 12) + 1 < 6;
    const ordered = ascending ? slots : slots.slice().reverse();

    for (const slot of ordered) {
        if (Math.floor(Math.random() * 10) + 1 < 4) {
            return slot;
        }
    }

    return null;
}

function stealItem(thiefId: string, victim: any): boolean {
    const slot = findRobableSlot(victim);

    if (!slot) {
        return false;
    }

    const item = victim.inv[slot];
    const idItem = Number(item.idItem);
    const amount = Math.min(Math.floor(Math.random() * 5) + 1, Number(item.cant));

    game.quitarUserInvItem(victim.id, slot, amount);
    game.putItemToInv(thiefId, idItem, amount);

    const name = vars.datObj[idItem]?.name ?? "un objeto";
    tell(thiefId, `Has robado ${amount} ${name}.`);
    return true;
}

function stealGold(thiefId: string, thief: any, victim: any): boolean {
    if (Number(victim.gold) <= 0) {
        tell(thiefId, `${victim.nameCharacter} no tiene oro.`);
        return false;
    }

    let n = Math.floor(Math.random() * 100) + 1;

    if (Number(thief.idClase) === vars.clases.ladron) {
        n += 1000;
    }

    if (Number(thief.idClase) === vars.clases.bandido) {
        n += 2500;
    }

    n = Math.min(n, Number(victim.gold));

    victim.gold = balance.clampGold(Number(victim.gold) - n);
    thief.gold = balance.clampGold(Number(thief.gold) + n);

    const thiefClient = vars.clients[thiefId];
    const victimClient = vars.clients[victim.id];
    if (thiefClient) {
        handleProtocol.actGold(thief.gold, thiefClient);
    }
    if (victimClient) {
        handleProtocol.actGold(victim.gold, victimClient);
    }

    tell(thiefId, `Le has robado ${n} monedas de oro a ${victim.nameCharacter}.`);
    return true;
}

export function doRobar(idUser: string, targetName: string) {
    const user = vars.personajes[idUser];

    if (!user) {
        return { ok: false, message: "No se pudo robar." };
    }

    if (user.dead) {
        return { ok: false, message: "No puedes robar estando muerto." };
    }

    let target: any;
    for (const candidate of Object.values(vars.personajes) as any[]) {
        if (candidate?.nameCharacter?.toLowerCase() === String(targetName ?? "").trim().toLowerCase()) {
            target = candidate;
            break;
        }
    }

    if (!target || !vars.clients[target.id]) {
        return { ok: false, message: "Ese usuario no esta online." };
    }

    if (String(target.id) === String(idUser)) {
        return { ok: false, message: "No puedes robarte a ti mismo." };
    }

    if (Number(target.map) !== Number(user.map)) {
        return { ok: false, message: "El otro jugador no esta en tu mapa." };
    }

    if (target.dead) {
        return { ok: false, message: "No puedes robarle a un personaje muerto." };
    }

    if (safeZone.isSafeZonePosition(user.map, user.pos) || safeZone.isSafeZonePosition(target.map, target.pos)) {
        return { ok: false, message: "No puedes robar en zonas seguras." };
    }

    if (Number(target.privileges ?? 0) >= 1) {
        return { ok: false, message: "No puedes robarle a un administrador." };
    }

    const skillRobar = skills.getSkill(user, skills.SKILLS.robar);

    if (!rollStealSuccess(skillRobar)) {
        tell(String(target.id), `¡${user.nameCharacter} ha intentado robarte!`);
        skills.applyTraining(user, skills.SKILLS.robar);
        return { ok: false, message: "¡No has logrado robar nada!" };
    }

    const preferItem = Number(user.idClase) === vars.clases.ladron && Math.floor(Math.random() * 50) + 1 < 18;
    let success = false;

    if (preferItem) {
        success = stealItem(String(idUser), target);
        if (!success) {
            tell(String(idUser), `${target.nameCharacter} no tiene objetos.`);
        }
    } else {
        success = stealGold(String(idUser), user, target);
    }

    skills.applyTraining(user, skills.SKILLS.robar);

    return { ok: true, message: success ? "Intento de robo realizado." : "No has robado nada." };
}

module.exports = { doRobar };
