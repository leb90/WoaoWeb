const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getProgress, saveProgress } = require("./woaoProgress");

const LOBBY = { map: 268, x: 40, y: 50 };
const ARENA = { map: 269 };
const EXIT = { map: 34, x: 50, y: 50 };

type HungerState = {
    open: boolean;
    started: boolean;
    capacity: number;
    participants: Set<string>;
    timer: ReturnType<typeof setInterval> | null;
};

const state: HungerState = {
    open: false,
    started: false,
    capacity: 0,
    participants: new Set(),
    timer: null,
};

function announce(message: string) {
    handleProtocol.consoleToAll(`Juegos del Hambre> ${message}`, "#E69500", 1, 0);
}

export function announceToParticipants(message: string) {
    for (const idUser of state.participants) {
        tell(idUser, message);
    }
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Juegos del Hambre> ${message}`, "#E69500", 1, 0, client);
    }
}

function warp(idUser: string, map: number, x: number, y: number) {
    const client = vars.clients[idUser];
    const user = vars.personajes[idUser];
    if (!client || !user) {
        return;
    }

    user.hungerGames = false;
    game.forceDismount(idUser);
    game.telep(client, map, x, y, "hungergames");
}

function giveKit(idUser: string, user: any) {
    game.putItemToInv(idUser, 38, 75);
    game.putItemToInv(idUser, 37, 75);
    game.putItemToInv(idUser, 36, 10);
    game.putItemToInv(idUser, 39, 10);

    const race = Number(user.idRaza ?? 1);
    const dwarfLike = race === 4 || race === 5 || race === 9;
    game.putItemToInv(idUser, dwarfLike ? 240 : 31, 1);

    const clase = Number(user.idClase ?? 0);
    if ([2, 3, 6].includes(clase)) {
        game.putItemToInv(idUser, 756, 1);
    } else if ([1, 5].includes(clase)) {
        game.putItemToInv(idUser, 400, 1);
    } else if ([4, 7].includes(clase)) {
        game.putItemToInv(idUser, 165, 1);
    } else {
        game.putItemToInv(idUser, 478, 1);
        game.putItemToInv(idUser, 480, 300);
    }
}

function beginEvent() {
    if (!state.open || state.started) {
        return;
    }

    state.started = true;
    state.open = false;
    announce("Comienza el evento. Suerte a los participantes.");

    for (const idUser of state.participants) {
        const user = vars.personajes[idUser];
        const client = vars.clients[idUser];
        if (!user || !client) {
            continue;
        }

        const x = 45 + Math.floor(Math.random() * 6);
        const y = 57 + Math.floor(Math.random() * 2);
        game.forceDismount(idUser);
        game.telep(client, ARENA.map, x, y, "hungergames-start");
        giveKit(idUser, user);
    }
}

function resetState() {
    state.open = false;
    state.started = false;
    state.capacity = 0;
    state.participants.clear();
}

export function startEvent(capacity: number) {
    if (state.open || state.started) {
        return { ok: false, message: "Ya hay Juegos del Hambre en curso." };
    }

    resetState();
    state.open = true;
    state.capacity = Math.max(2, Math.min(20, Math.floor(capacity)));
    announce(`Podran entrar [${state.capacity}] jugadores. Si deseas ingresar envia /hunger`);
    return { ok: true, message: `Juegos del Hambre abiertos para ${state.capacity} jugadores.` };
}

export function joinEvent(idUser: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo ingresar." };
    }

    if (!state.open) {
        return { ok: false, message: "El evento no esta recibiendo participantes." };
    }

    if (state.participants.size >= state.capacity) {
        return { ok: false, message: "El cupo de participacion esta completo." };
    }

    if (user.dead) {
        return { ok: false, message: "No puedes entrar muerto." };
    }

    if (user.mounted) {
        return { ok: false, message: "No puedes entrar montado." };
    }

    if (user.navegando) {
        return { ok: false, message: "No puedes entrar navegando." };
    }

    if (user.invisibleSpell || user.hiddenSkill) {
        return { ok: false, message: "Debes estar visible para entrar." };
    }

    state.participants.add(String(idUser));
    user.hungerGames = true;
    game.forceDismount(idUser);
    game.telep(client, LOBBY.map, LOBBY.x, LOBBY.y, "hungergames-join");

    if (state.participants.size >= state.capacity) {
        beginEvent();
    }

    return { ok: true, message: "Ingresaste a los Juegos del Hambre." };
}

export function cancelEvent() {
    if (!state.open && !state.started) {
        return { ok: false, message: "No hay Juegos del Hambre en curso." };
    }

    announce("El evento ha sido cancelado.");
    for (const idUser of state.participants) {
        const user = vars.personajes[idUser];
        if (user && (Number(user.map) === LOBBY.map || Number(user.map) === ARENA.map)) {
            warp(idUser, EXIT.map, EXIT.x, EXIT.y);
        }
    }
    resetState();
    return { ok: true, message: "Juegos del Hambre cancelados." };
}

export function onUserDied(idUser: string) {
    if (!state.participants.has(String(idUser))) {
        return;
    }

    state.participants.delete(String(idUser));
    const user = vars.personajes[idUser];
    if (user) {
        user.hungerGames = false;
    }

    if (!state.started) {
        return;
    }

    const alive = [...state.participants].filter((id) => {
        const participant = vars.personajes[id];
        return participant && Number(participant.map) === ARENA.map && !participant.dead;
    });

    if (alive.length === 1) {
        const winnerId = alive[0];
        const winner = vars.personajes[winnerId];
        if (winner) {
            const progress = getProgress(winner);
            progress.puntosCanje += 100;
            winner.puntosCanje = progress.puntosCanje;
            saveProgress(winner);
            tell(winnerId, "Ganaste los Juegos del Hambre. +100 puntos de canje.");
            announce(`${winner.nameCharacter} gano los Juegos del Hambre.`);
            warp(winnerId, EXIT.map, EXIT.x, EXIT.y);
        }
        resetState();
    } else if (alive.length === 0) {
        announce("El ganador se ha desconectado o muerto.");
        resetState();
    }
}

export function initialize() {
    if (state.timer) {
        return;
    }

    state.timer = setInterval(() => undefined, 1000);
}
