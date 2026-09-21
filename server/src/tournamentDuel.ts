import type { EntityId, RuntimeCharacter, RuntimeClient, RuntimeNpc } from "./types/runtime";

const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

const CLASSIC_TOURNAMENT_NPC_TEMPLATE_ID = 113;
const TOURNAMENT_MAP = 164;
const ANNOUNCE_MAP = 34;
const NPC_MAX_DISTANCE = 12;
const MIN_X = 52;
const MAX_X = 71;
const MIN_Y = 44;
const MAX_Y = 59;

type TournamentDuelResult = {
    ok: boolean;
    message: string;
};

function getCharacter(idUser: EntityId): RuntimeCharacter | undefined {
    const characters = vars.personajes as Record<string, RuntimeCharacter | undefined>;
    return characters[String(idUser)];
}

function getClient(idUser: EntityId): RuntimeClient | undefined {
    const clients = vars.clients as Record<string, RuntimeClient | undefined>;
    return clients[String(idUser)];
}

function isInsideRange(user: RuntimeCharacter, npc: RuntimeNpc, maxDistance: number) {
    return Math.round(Math.hypot(user.pos.x - npc.pos.x, user.pos.y - npc.pos.y)) <= maxDistance;
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function countUsersInTournamentMap() {
    const characters = vars.personajes as Record<string, RuntimeCharacter | undefined>;

    return Object.entries(characters).filter(([idUser, user]) => {
        if (!user || Number(user.map) !== TOURNAMENT_MAP || user.cerrado) {
            return false;
        }

        return Boolean(getClient(idUser));
    }).length;
}

function announceToMap(map: number, message: string) {
    for (const [idUser, client] of Object.entries(vars.clients) as Array<[string, RuntimeClient | undefined]>) {
        const user = getCharacter(idUser);

        if (!client || !user || Number(user.map) !== map) {
            continue;
        }

        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function hasActiveSummons(user: RuntimeCharacter) {
    const npcs = vars.npcs as Record<string, RuntimeNpc | undefined>;
    return (user.summons ?? []).some((idNpc) => Boolean(npcs[String(idNpc)]));
}

export function isClassicTournamentNpc(npc: RuntimeNpc | undefined | null) {
    return Number(npc?.templateNpcIndex ?? 0) === CLASSIC_TOURNAMENT_NPC_TEMPLATE_ID;
}

export function enterTournament(idUser: EntityId): TournamentDuelResult {
    const user = getCharacter(idUser);
    const client = getClient(idUser);

    if (!user || !client) {
        return { ok: false, message: "No se pudo entrar al torneo." };
    }

    if (user.dead) {
        return { ok: false, message: "No puedes entrar muerto al torneo." };
    }

    if (Number(user.morphBody ?? 0) > 0 || Number(user.cooldownMorph ?? 0) > Date.now()) {
        return { ok: false, message: "No puedes entrar transformado a Torneo." };
    }

    if (user.mounted) {
        return { ok: false, message: "No se permiten Mascotas." };
    }

    const targetNpcId = user.targetNpcId;
    const npcs = vars.npcs as Record<string, RuntimeNpc | undefined>;
    const npc = targetNpcId ? npcs[String(targetNpcId)] : undefined;

    if (!npc) {
        return { ok: false, message: "Debes seleccionar al NPC de Torneos primero." };
    }

    if (!isClassicTournamentNpc(npc)) {
        return { ok: false, message: "Ese NPC no organiza torneos 1vs1." };
    }

    if (!isInsideRange(user, npc, NPC_MAX_DISTANCE)) {
        return { ok: false, message: "Estas demasiado lejos del NPC." };
    }

    if (hasActiveSummons(user)) {
        return { ok: false, message: "No puedes llevar mascotas al torneo." };
    }

    if (user.invisibleSpell || user.hiddenSkill) {
        return { ok: false, message: "No puedes ir invisible al torneo." };
    }

    const tournamentUsers = countUsersInTournamentMap();

    if (tournamentUsers > 1) {
        return { ok: false, message: "El mapa de torneo esta ocupado ahora mismo." };
    }

    if (tournamentUsers === 0) {
        announceToMap(ANNOUNCE_MAP, `Torneo 1vs1: ${user.nameCharacter} espera rival en la Sala De Torneos.`);
    } else {
        announceToMap(ANNOUNCE_MAP, `Torneo 1vs1: ${user.nameCharacter} acepto el desafio!!!`);
    }

    game.closeTradeSession(idUser);
    game.forceDismount(idUser);
    game.telep(client, TOURNAMENT_MAP, randomInt(MIN_X, MAX_X), randomInt(MIN_Y, MAX_Y), "torneo-1v1");

    return { ok: true, message: "Entraste a la sala de Torneos 1vs1." };
}
