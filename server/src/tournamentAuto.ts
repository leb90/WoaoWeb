const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getProgress, saveProgress } = require("./woaoProgress");

const MAP = 208;
const WAIT = { x: 50, y: 75 };
const EXIT = { map: 34, x: 50, y: 50 };
const CORNERS = [
    { x: 42, y: 42 },
    { x: 61, y: 42 },
    { x: 42, y: 57 },
    { x: 61, y: 57 },
];
const PRIZE_ITEM = 1245;

type TournamentState = {
    open: boolean;
    active: boolean;
    rounds: number;
    capacity: number;
    participants: string[];
    fighting: [string, string] | null;
    waitingFight: string[];
    beginAt: number;
    timer: ReturnType<typeof setInterval> | null;
};

const state: TournamentState = {
    open: false,
    active: false,
    rounds: 0,
    capacity: 0,
    participants: [],
    fighting: null,
    waitingFight: [],
    beginAt: 0,
    timer: null,
};

function announce(message: string) {
    handleProtocol.consoleToAll(`Torneo> ${message}`, "#E69500", 1, 0);
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Torneo> ${message}`, "#E69500", 1, 0, client);
    }
}

function warp(idUser: string, map: number, x: number, y: number) {
    const client = vars.clients[idUser];
    const user = vars.personajes[idUser];
    if (!client || !user) {
        return;
    }

    user.automaticTournament = false;
    game.forceDismount(idUser);
    game.telep(client, map, x, y, "torneo");
}

function resetState() {
    state.open = false;
    state.active = false;
    state.rounds = 0;
    state.capacity = 0;
    state.participants = [];
    state.fighting = null;
    state.waitingFight = [];
    state.beginAt = 0;
}

function startNextFight() {
    if (state.waitingFight.length < 2) {
        if (state.waitingFight.length === 1) {
            finishWinner(state.waitingFight[0]);
        }
        return;
    }

    const a = state.waitingFight.shift() as string;
    const b = state.waitingFight.shift() as string;
    state.fighting = [a, b];
    const userA = vars.personajes[a];
    const userB = vars.personajes[b];
    const clientA = vars.clients[a];
    const clientB = vars.clients[b];
    if (!userA || !userB || !clientA || !clientB) {
        state.waitingFight.push(...[a, b].filter((id) => vars.personajes[id]));
        state.fighting = null;
        startNextFight();
        return;
    }

    game.forceDismount(a);
    game.forceDismount(b);
    game.telep(clientA, MAP, CORNERS[0].x, CORNERS[0].y, "torneo-fight");
    game.telep(clientB, MAP, CORNERS[1].x, CORNERS[1].y, "torneo-fight");
    announce(`${userA.nameCharacter} vs ${userB.nameCharacter}`);
}

function finishWinner(idUser: string) {
    const user = vars.personajes[idUser];
    if (user) {
        const progress = getProgress(user);
        progress.puntosCanje += 100;
        user.puntosCanje = progress.puntosCanje;
        saveProgress(user);
        if (vars.datObj?.[PRIZE_ITEM]) {
            game.putItemToInv(idUser, PRIZE_ITEM, 1);
        }
        tell(idUser, "Ganaste el torneo automatico. +100 puntos de canje.");
        announce(`${user.nameCharacter} gano el torneo automatico.`);
        warp(idUser, EXIT.map, EXIT.x, EXIT.y);
    }

    resetState();
}

export function startEvent(rounds: number) {
    if (state.open || state.active) {
        return { ok: false, message: "Ya hay un torneo automatico en curso." };
    }

    const safeRounds = Math.max(1, Math.min(5, Math.floor(rounds)));
    resetState();
    state.open = true;
    state.rounds = safeRounds;
    state.capacity = 2 ** safeRounds;
    state.beginAt = Date.now() + 10000;
    announce(`Torneo automatico de ${state.capacity} jugadores. Nivel minimo 25. Envia /participar`);
    return { ok: true, message: `Torneo abierto para ${state.capacity} jugadores.` };
}

export function joinEvent(idUser: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo participar." };
    }

    if (!state.open) {
        return { ok: false, message: "No hay un torneo recibiendo participantes." };
    }

    if (Number(user.level ?? 1) < 25) {
        return { ok: false, message: "Necesitas nivel 25 para participar." };
    }

    if (state.participants.includes(String(idUser))) {
        return { ok: false, message: "Ya estas inscripto." };
    }

    if (state.participants.length >= state.capacity) {
        return { ok: false, message: "El cupo del torneo esta completo." };
    }

    state.participants.push(String(idUser));
    user.automaticTournament = true;
    game.forceDismount(idUser);
    game.telep(client, MAP, WAIT.x, WAIT.y, "torneo-wait");

    if (state.participants.length >= state.capacity) {
        state.open = false;
        state.active = true;
        state.waitingFight = [...state.participants];
        announce("Comienza el torneo.");
        startNextFight();
    }

    return { ok: true, message: "Ingresaste al torneo automatico." };
}

export function cancelEvent() {
    if (!state.open && !state.active) {
        return { ok: false, message: "No hay un torneo en curso." };
    }

    announce("El torneo ha sido cancelado.");
    for (const idUser of state.participants) {
        const user = vars.personajes[idUser];
        if (user && Number(user.map) === MAP) {
            warp(idUser, EXIT.map, EXIT.x, EXIT.y);
        }
    }
    resetState();
    return { ok: true, message: "Torneo cancelado." };
}

export function onUserDied(idUser: string) {
    if (!state.participants.includes(String(idUser))) {
        return;
    }

    const user = vars.personajes[idUser];
    if (user) {
        user.automaticTournament = false;
    }

    if (state.fighting && state.fighting.includes(String(idUser))) {
        const winner = state.fighting.find((id) => id !== String(idUser));
        state.fighting = null;
        if (winner) {
            const winnerUser = vars.personajes[winner];
            const winnerClient = vars.clients[winner];
            if (winnerUser && winnerClient) {
                tell(winner, "Ganaste la ronda.");
                game.telep(winnerClient, MAP, WAIT.x, WAIT.y, "torneo-winround");
                state.waitingFight.push(winner);
            }
        }
        startNextFight();
    }

    state.participants = state.participants.filter((id) => id !== String(idUser));
    state.waitingFight = state.waitingFight.filter((id) => id !== String(idUser));
}

export function tick() {
    if (state.open && state.beginAt > 0 && Date.now() >= state.beginAt && state.participants.length >= 2) {
        state.open = false;
        state.active = true;
        state.waitingFight = [...state.participants];
        announce("Se acabo el tiempo de espera. Comienza el torneo.");
        startNextFight();
    }
}

export function initialize() {
    if (state.timer) {
        return;
    }

    state.timer = setInterval(() => {
        tick();
    }, 1000);
}
