const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getProgress, saveProgress } = require("./woaoProgress");

const ARENAS = [
    { map: 211, x1: 28, y1: 40, x2: 55, y2: 59 },
    { map: 212, x1: 28, y1: 40, x2: 55, y2: 59 },
    { map: 213, x1: 28, y1: 40, x2: 55, y2: 59 },
    { map: 214, x1: 28, y1: 40, x2: 55, y2: 59 },
    { map: 215, x1: 28, y1: 40, x2: 55, y2: 59 },
];

type RankedMatch = {
    a: string;
    b: string;
    map: number;
    wins: Record<string, number>;
    origin: Record<string, { map: number; x: number; y: number }>;
};

const queue = new Set<string>();
const matches = new Map<string, RankedMatch>();
let timer: ReturnType<typeof setInterval> | null = null;

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Ranked> ${message}`, "#E69500", 1, 0, client);
    }
}

function rankName(elo: number) {
    if (elo <= 300) {
        return "Bronce";
    }
    if (elo <= 600) {
        return "Plata";
    }
    if (elo <= 900) {
        return "Oro";
    }
    if (elo <= 1200) {
        return "Platino";
    }
    return "Diamante";
}

function warpBack(idUser: string, origin?: { map: number; x: number; y: number }) {
    const client = vars.clients[idUser];
    const user = vars.personajes[idUser];
    if (!client || !user) {
        return;
    }

    user.rankedArena = false;
    const dest = origin ?? { map: 34, x: 50, y: 50 };
    game.forceDismount(idUser);
    game.telep(client, dest.map, dest.x, dest.y, "ranked-end");
}

function freeArena() {
    const used = new Set([...matches.values()].map((match) => match.map));
    return ARENAS.find((arena) => !used.has(arena.map));
}

function startMatch(a: string, b: string) {
    const arena = freeArena();
    const userA = vars.personajes[a];
    const userB = vars.personajes[b];
    const clientA = vars.clients[a];
    const clientB = vars.clients[b];
    if (!arena || !userA || !userB || !clientA || !clientB) {
        queue.add(a);
        queue.add(b);
        return;
    }

    const match: RankedMatch = {
        a,
        b,
        map: arena.map,
        wins: { [a]: 0, [b]: 0 },
        origin: {
            [a]: { map: Number(userA.map), x: Number(userA.pos?.x ?? 50), y: Number(userA.pos?.y ?? 50) },
            [b]: { map: Number(userB.map), x: Number(userB.pos?.x ?? 50), y: Number(userB.pos?.y ?? 50) },
        },
    };
    matches.set(a, match);
    matches.set(b, match);
    userA.rankedArena = true;
    userB.rankedArena = true;
    game.forceDismount(a);
    game.forceDismount(b);
    game.telep(clientA, arena.map, arena.x1, arena.y1, "ranked");
    game.telep(clientB, arena.map, arena.x2, arena.y2, "ranked");
    tell(a, `Combate ranked vs ${userB.nameCharacter}. Bo2.`);
    tell(b, `Combate ranked vs ${userA.nameCharacter}. Bo2.`);
}

function finishMatch(match: RankedMatch, winnerId: string, loserId: string) {
    const winner = vars.personajes[winnerId];
    const loser = vars.personajes[loserId];
    const winnerProgress = winner ? getProgress(winner) : null;
    const loserProgress = loser ? getProgress(loser) : null;
    const delta = 10 + Math.floor(Math.random() * 31);

    if (winner && winnerProgress) {
        winnerProgress.elo = Math.max(1, winnerProgress.elo + delta);
        winner.elo = winnerProgress.elo;
        saveProgress(winner);
        tell(winnerId, `Victoria ranked. ELO ${winnerProgress.elo} (${rankName(winnerProgress.elo)}).`);
    }
    if (loser && loserProgress) {
        loserProgress.elo = Math.max(1, loserProgress.elo - delta);
        loser.elo = loserProgress.elo;
        saveProgress(loser);
        tell(loserId, `Derrota ranked. ELO ${loserProgress.elo} (${rankName(loserProgress.elo)}).`);
    }

    warpBack(winnerId, match.origin[winnerId]);
    warpBack(loserId, match.origin[loserId]);
    matches.delete(match.a);
    matches.delete(match.b);
}

export function toggleQueue(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return { ok: false, message: "No se pudo entrar a ranked." };
    }

    if (matches.has(String(idUser))) {
        return { ok: false, message: "Ya estas en un combate ranked." };
    }

    if (queue.has(String(idUser))) {
        queue.delete(String(idUser));
        return { ok: true, message: "Saliste de la cola ranked." };
    }

    const progress = getProgress(user);
    queue.add(String(idUser));
    return { ok: true, message: `Entraste a la cola ranked. ELO ${progress.elo} (${rankName(progress.elo)}).` };
}

export function onUserDied(idUser: string) {
    const match = matches.get(String(idUser));
    if (!match) {
        return;
    }

    const winnerId = match.a === String(idUser) ? match.b : match.a;
    match.wins[winnerId] = (match.wins[winnerId] ?? 0) + 1;
    if (match.wins[winnerId] >= 2) {
        finishMatch(match, winnerId, String(idUser));
        return;
    }

    const dead = vars.personajes[idUser];
    const winner = vars.personajes[winnerId];
    const deadClient = vars.clients[idUser];
    const winnerClient = vars.clients[winnerId];
    const arena = ARENAS.find((entry) => entry.map === match.map);
    if (dead && winner && deadClient && winnerClient && arena) {
        dead.hp = dead.maxHp;
        dead.dead = 0;
        handleProtocol.updateHP(dead.hp, deadClient);
        game.telep(deadClient, arena.map, arena.x1, arena.y1, "ranked-round");
        game.telep(winnerClient, arena.map, arena.x2, arena.y2, "ranked-round");
        tell(winnerId, `Ganaste la ronda (${match.wins[winnerId]}/2).`);
        tell(idUser, `Perdiste la ronda (${match.wins[idUser] ?? 0}/2).`);
    }
}

export function onUserLeft(idUser: string) {
    queue.delete(String(idUser));
    const match = matches.get(String(idUser));
    if (match) {
        const winnerId = match.a === String(idUser) ? match.b : match.a;
        finishMatch(match, winnerId, String(idUser));
    }
}

export function tick() {
    const waiting = [...queue];
    if (waiting.length < 2) {
        return;
    }

    const a = waiting[0];
    const b = waiting[1];
    queue.delete(a);
    queue.delete(b);
    startMatch(a, b);
}

export function initialize() {
    if (timer) {
        return;
    }

    timer = setInterval(() => {
        tick();
    }, 2000);
}
