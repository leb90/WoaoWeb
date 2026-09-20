const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getProgress, saveProgress } = require("./woaoProgress");

const MAP_ID = 205;
const JOIN_POS = { x: 24, y: 86 };
const EXIT_POS = { map: 34, x: 50, y: 50 };
const GATE_TILES = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46].map((x) => ({ x, y: 79 }));
const INNER_BLOCK_TILES = [
    { x: 40, y: 40 },
    { x: 41, y: 40 },
    { x: 43, y: 40 },
];
const ARCHAVON_UNLOCK = [
    { x: 71, y: 44 },
    { x: 73, y: 44 },
];
const WAVE_NPCS_EARLY = [772, 773, 774];
const WAVE_NPCS_LATE = [775, 776, 777];
const EVENT_NPCS = [14, 24, 772, 773, 774, 775, 776, 777, 778, 779];
const WAVE_DURATION_MS = 600_000;

type BloodState = {
    open: boolean;
    started: boolean;
    capacity: number;
    participants: Set<string>;
    beginAt: number;
    rewardAt: number;
    waveEndsAt: number;
    nextWaveAt: number;
    timer: ReturnType<typeof setInterval> | null;
};

const state: BloodState = {
    open: false,
    started: false,
    capacity: 0,
    participants: new Set(),
    beginAt: 0,
    rewardAt: 0,
    waveEndsAt: 0,
    nextWaveAt: 0,
    timer: null,
};

function announce(message: string) {
    handleProtocol.consoleToAll(`Blood Castle> ${message}`, "#E69500", 1, 0);
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Blood Castle> ${message}`, "#E69500", 1, 0, client);
    }
}

function setTilesBlocked(tiles: Array<{ x: number; y: number }>, blocked: number) {
    for (const tile of tiles) {
        if (vars.mapa[MAP_ID]?.[tile.y]?.[tile.x]) {
            game.blockMap(MAP_ID, tile, blocked);
        }
    }
}

function spawnNpc(npcIndex: number, x: number, y: number) {
    const loadNpcs = require("./loadNpcs");
    const loader = new loadNpcs();
    if (!vars.datNpc[npcIndex]) {
        return;
    }

    loader.createNpcInMap(
        {
            mapNum: MAP_ID,
            x,
            y,
            npcIndex,
            movement: 0,
        },
        true,
    );
}

function cleanupEventNpcs() {
    const npcs = require("./npcs");
    for (const [idNpc, npc] of Object.entries(vars.npcs) as Array<[string, any]>) {
        if (!npc || Number(npc.map) !== MAP_ID) {
            continue;
        }

        if (!EVENT_NPCS.includes(Number(npc.templateNpcIndex ?? 0))) {
            continue;
        }

        try {
            npcs.muereNpc(idNpc);
        } catch {
            delete vars.npcs[idNpc];
        }
    }
}

function spawnWaves() {
    if (!state.started || state.waveEndsAt <= 0) {
        return;
    }

    const remaining = state.waveEndsAt - Date.now();
    const pool = remaining > 350_000 ? WAVE_NPCS_EARLY : WAVE_NPCS_LATE;

    for (const idUser of state.participants) {
        const user = vars.personajes[idUser];
        if (!user || Number(user.map) !== MAP_ID || !user.pos) {
            continue;
        }

        const roll = Math.floor(Math.random() * 18) + 1;
        if (roll < 7 || roll > 9) {
            continue;
        }

        const npcIndex = pool[9 - roll] ?? pool[0];
        spawnNpc(npcIndex, Number(user.pos.x), Number(user.pos.y));
    }
}

function warpUser(idUser: string, map: number, x: number, y: number) {
    const client = vars.clients[idUser];
    const user = vars.personajes[idUser];
    if (!client || !user) {
        return;
    }

    user.bloodCastle = false;
    game.forceDismount(idUser);
    game.telep(client, map, x, y, "bloodcastle");
}

function resetState() {
    state.open = false;
    state.started = false;
    state.capacity = 0;
    state.participants.clear();
    state.beginAt = 0;
    state.rewardAt = 0;
    state.waveEndsAt = 0;
    state.nextWaveAt = 0;
}

function finishEvent(won: boolean) {
    if (won) {
        announce("Felicidades a nuestros nobles Guerreros, el rey de Archavon fue derrotado.");
    } else {
        announce("El mal triunfo sobre nuestro mundo. Hemos perdido a todos nuestros guerreros en Blood Castle.");
    }

    for (const idUser of state.participants) {
        const user = vars.personajes[idUser];
        if (!user || Number(user.map) !== MAP_ID) {
            continue;
        }

        if (won) {
            const progress = getProgress(user);
            progress.puntosCanje += 150;
            user.puntosCanje = progress.puntosCanje;
            saveProgress(user);
            tell(idUser, "Has ganado 150 Puntos de Canje, felicidades Noble Guerrero.");
        }

        warpUser(idUser, EXIT_POS.map, EXIT_POS.x, EXIT_POS.y);
    }

    cleanupEventNpcs();
    resetState();
}

function beginCombat() {
    if (!state.open || state.started) {
        return;
    }

    state.started = true;
    state.open = false;
    state.waveEndsAt = Date.now() + WAVE_DURATION_MS;
    state.nextWaveAt = Date.now() + 4000;
    announce("Comienza el evento. Suerte a los participantes.");
    setTilesBlocked(GATE_TILES, 0);
    setTilesBlocked(INNER_BLOCK_TILES, 1);
    spawnNpc(779, 42, 40);
    spawnNpc(778, 42, 17);
}

export function startEvent(capacity: number) {
    if (state.open || state.started) {
        return { ok: false, message: "Ya hay un evento de este tipo en curso." };
    }

    const safeCapacity = Math.max(1, Math.min(50, Math.floor(capacity)));
    resetState();
    state.open = true;
    state.capacity = safeCapacity;
    setTilesBlocked(GATE_TILES, 1);
    spawnNpc(24, 30, 80);
    spawnNpc(14, 30, 80);
    announce(`Podran entrar [${safeCapacity}] jugadores. Si deseas ingresar envia /bloodcastle`);
    return { ok: true, message: `Blood Castle abierto para ${safeCapacity} jugadores.` };
}

export function joinEvent(idUser: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];

    if (!user || !client) {
        return { ok: false, message: "No se pudo ingresar al evento." };
    }

    if (!state.open) {
        return { ok: false, message: "El evento no esta recibiendo participantes." };
    }

    if (state.participants.size >= state.capacity) {
        return { ok: false, message: "El cupo de participacion del evento esta completo." };
    }

    if (state.participants.has(String(idUser))) {
        return { ok: false, message: "Ya estas inscripto en Blood Castle." };
    }

    state.participants.add(String(idUser));
    user.bloodCastle = true;
    game.forceDismount(idUser);
    game.telep(client, MAP_ID, JOIN_POS.x, JOIN_POS.y, "bloodcastle-join");

    if (state.participants.size >= state.capacity) {
        beginCombat();
    }

    return { ok: true, message: "Ingresaste a Blood Castle." };
}

export function cancelEvent() {
    if (!state.open && !state.started) {
        return { ok: false, message: "No hay un Blood Castle en curso." };
    }

    announce("El evento ha sido cancelado.");
    for (const idUser of state.participants) {
        const user = vars.personajes[idUser];
        if (user && Number(user.map) === MAP_ID) {
            warpUser(idUser, EXIT_POS.map, EXIT_POS.x, EXIT_POS.y);
        }
    }

    cleanupEventNpcs();
    resetState();
    return { ok: true, message: "Blood Castle cancelado." };
}

export function onNpcDied(npcIndex: number) {
    if (!state.started) {
        return;
    }

    if (npcIndex === 779) {
        setTilesBlocked(ARCHAVON_UNLOCK, 0);
        return;
    }

    if (npcIndex === 778) {
        announce("El rey Archavon ha sido derrotado. Tienen 10 segundos para recoger tesoros.");
        state.rewardAt = Date.now() + 10000;
    }
}

export function onUserDied(idUser: string) {
    if (!state.participants.has(String(idUser))) {
        return;
    }

    state.participants.delete(String(idUser));
    const user = vars.personajes[idUser];
    if (user) {
        user.bloodCastle = false;
    }

    if (state.started && state.participants.size === 0) {
        finishEvent(false);
    }
}

export function tick() {
    if (state.rewardAt > 0 && Date.now() >= state.rewardAt) {
        state.rewardAt = 0;
        finishEvent(true);
        return;
    }

    if (state.started && state.waveEndsAt > 0 && Date.now() >= state.waveEndsAt && state.rewardAt === 0) {
        announce("Se acabo el tiempo en Blood Castle.");
        finishEvent(false);
        return;
    }

    if (state.started && state.nextWaveAt > 0 && Date.now() >= state.nextWaveAt) {
        spawnWaves();
        state.nextWaveAt = Date.now() + 8000;
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
