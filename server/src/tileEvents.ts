const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const funct = require("./functions");

const TRAP_A = new Set(["71,41", "67,66", "55,62", "47,54", "40,25", "12,11", "92,43"]);
const TRAP_B = new Set(["52,54", "15,40", "29,61", "35,22", "56,22", "70,82"]);
const DESERT_MAPS = new Set([20, 178, 179]);

function damageUser(idUser: string, amount: number, message: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || user.dead || !client) {
        return;
    }

    user.hp = Math.max(0, Number(user.hp ?? 0) - amount);
    handleProtocol.updateHP(user.hp, client);
    handleProtocol.console(message, "red", 1, 0, client);

    if (user.hp <= 0) {
        require("./game").putBodyAndHeadDead(idUser);
    }
}

export function onWalk(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user || user.dead || user.privileges === 1 || user.privileges === 2) {
        return;
    }

    const map = Number(user.map);
    const key = `${Number(user.pos?.x)},${Number(user.pos?.y)}`;

    if ((map === 178 || map === 179) && TRAP_A.has(key)) {
        damageUser(idUser, funct.randomIntFromInterval(5, 20), `Una trampa te causa dano.`);
        return;
    }

    if (map === 178 && TRAP_B.has(key)) {
        damageUser(idUser, funct.randomIntFromInterval(5, 20), `Una trampa te causa dano.`);
        return;
    }

    if (DESERT_MAPS.has(map) && funct.randomIntFromInterval(1, 100) > 98) {
        damageUser(idUser, funct.randomIntFromInterval(5, 20), `Un Gusano te causa dano.`);
    }
}
