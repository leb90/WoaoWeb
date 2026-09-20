const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const { getProgress, saveProgress } = require("./woaoProgress");

const REAL_NPC = 365;
const CAOS_NPC = 366;
const REAL_MAP = 204;
const CAOS_MAP = 203;
const NPC_POS = { x: 54, y: 45 };
const ATTACK_POS = { x: 77, y: 20 };
const DEFEND_POS = { x: 45, y: 88 };
const EXIT = { map: 34, x: 50, y: 50 };
const TEMPLE = { map: 210, x: 59, y: 24 };
const WAR_MINUTES = 10;
const INTERVAL_MINUTES = 120;
const GOLD_REWARD = 30_000;
const POINTS_REWARD = 80;

type WarState = {
    active: boolean;
    automatic: boolean;
    map: number;
    npcIndex: number;
    temple: 0 | 1 | 2;
    startedAt: number;
    nextAt: number;
    alianzas: Set<string>;
    hordas: Set<string>;
    timer: ReturnType<typeof setInterval> | null;
};

const state: WarState = {
    active: false,
    automatic: true,
    map: 0,
    npcIndex: 0,
    temple: 0,
    startedAt: 0,
    nextAt: Date.now() + INTERVAL_MINUTES * 60_000,
    alianzas: new Set(),
    hordas: new Set(),
    timer: null,
};

function announce(message: string) {
    handleProtocol.consoleToAll(`Guerra Faccionaria> ${message}`, "#E69500", 1, 0);
}

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(`Guerra Faccionaria> ${message}`, "#E69500", 1, 0, client);
    }
}

function spawnNpc(npcIndex: number, map: number) {
    if (!vars.datNpc?.[npcIndex]) {
        return;
    }

    const loader = new (require("./loadNpcs"))();
    loader.createNpcInMap(
        {
            mapNum: map,
            x: NPC_POS.x,
            y: NPC_POS.y,
            npcIndex,
            movement: 0,
        },
        true,
    );
}

function removeWarNpc() {
    const npcs = require("./npcs");
    for (const [idNpc, npc] of Object.entries(vars.npcs) as Array<[string, any]>) {
        if (!npc || Number(npc.map) !== state.map) {
            continue;
        }

        if (Number(npc.templateNpcIndex ?? 0) !== state.npcIndex) {
            continue;
        }

        npcs.muereNpc(idNpc);
    }
}

function warp(idUser: string, map: number, x: number, y: number) {
    const client = vars.clients[idUser];
    const user = vars.personajes[idUser];
    if (!client || !user) {
        return;
    }

    user.guerra = false;
    game.forceDismount(idUser);
    game.telep(client, map, x, y, "guerra");
}

function rewardFaction(winner: "armada" | "caos") {
    const winners = winner === "armada" ? state.alianzas : state.hordas;
    for (const idUser of winners) {
        const user = vars.personajes[idUser];
        if (!user) {
            continue;
        }

        user.gold = Number(user.gold ?? 0) + GOLD_REWARD;
        const progress = getProgress(user);
        progress.puntosCanje += POINTS_REWARD;
        user.puntosCanje = progress.puntosCanje;
        saveProgress(user);
        const client = vars.clients[idUser];
        if (client) {
            handleProtocol.actGold(user.gold, client);
        }
        tell(idUser, `Recompensa: ${GOLD_REWARD} oro y ${POINTS_REWARD} puntos de canje.`);
    }
}

function finish(winner: "armada" | "caos" | "none", npcDied: boolean) {
    if (!state.active) {
        return;
    }

    if (winner === "none") {
        announce("La Guerra ha terminado. Ninguna faccion resulto victoriosa.");
        state.temple = 0;
    } else {
        const name = winner === "armada" ? "Alianza" : "Horda";
        announce(`La Guerra ha terminado. Gano la ${name}.`);
        announce(`El dominio del templo pasa a manos de la ${name}. Usa /templo para ingresar.`);
        state.temple = winner === "armada" ? 1 : 2;
        rewardFaction(winner);
    }

    for (const idUser of [...state.alianzas, ...state.hordas]) {
        const user = vars.personajes[idUser];
        if (user && (Number(user.map) === REAL_MAP || Number(user.map) === CAOS_MAP)) {
            warp(idUser, EXIT.map, EXIT.x, EXIT.y);
        } else if (user) {
            user.guerra = false;
        }
    }

    if (!npcDied) {
        removeWarNpc();
    }

    state.active = false;
    state.map = 0;
    state.npcIndex = 0;
    state.alianzas.clear();
    state.hordas.clear();
    state.nextAt = Date.now() + INTERVAL_MINUTES * 60_000;
}

export function startWar() {
    if (state.active) {
        return { ok: false, message: "Ya hay una Guerra Actualmente." };
    }

    const onRealMap = Math.random() < 0.5;
    state.active = true;
    state.map = onRealMap ? REAL_MAP : CAOS_MAP;
    state.npcIndex = onRealMap ? CAOS_NPC : REAL_NPC;
    state.startedAt = Date.now();
    state.alianzas.clear();
    state.hordas.clear();
    spawnNpc(state.npcIndex, state.map);
    announce("La Guerra ha Comenzado. Para participar envia /guerra.");
    return { ok: true, message: "Guerra faccionaria iniciada." };
}

export function joinWar(idUser: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo entrar a la guerra." };
    }

    if (!state.active) {
        return { ok: false, message: "No Hay Ninguna Guerra Actualmente." };
    }

    if (user.guerra) {
        return { ok: false, message: "Ya estas participando de la Guerra." };
    }

    const faction = user.faction === "caos" ? "caos" : user.faction === "armada" ? "armada" : "";
    if (!faction) {
        return { ok: false, message: "No perteneces a ninguna faccion." };
    }

    if (faction === "caos" && state.hordas.size > state.alianzas.size) {
        return { ok: false, message: "Hay demasiados de la Horda. Esperá a que entre alguien de la Alianza." };
    }

    if (faction === "armada" && state.alianzas.size > state.hordas.size) {
        return { ok: false, message: "Hay demasiados de la Alianza. Esperá a que entre alguien de la Horda." };
    }

    const attacking = (state.map === REAL_MAP && faction === "caos") || (state.map === CAOS_MAP && faction === "armada");
    const dest = attacking ? ATTACK_POS : DEFEND_POS;
    user.guerra = true;
    if (faction === "armada") {
        state.alianzas.add(String(idUser));
    } else {
        state.hordas.add(String(idUser));
    }

    game.forceDismount(idUser);
    game.telep(client, state.map, dest.x, dest.y, "guerra-join");
    return { ok: true, message: "La Guerra ha Comenzado para ti. Defiende a tu faccion." };
}

export function enterTemple(idUser: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return { ok: false, message: "No se pudo entrar al templo." };
    }

    if (user.faction !== "armada" && user.faction !== "caos") {
        return { ok: false, message: "No perteneces a ninguna faccion." };
    }

    if (Number(user.hp ?? 0) < Number(user.maxHp ?? 0)) {
        return { ok: false, message: "Tu salud debe estar completa." };
    }

    if (state.temple === 0) {
        return { ok: false, message: "El templo no esta en dominio de nadie." };
    }

    const owns = (user.faction === "armada" && state.temple === 1) || (user.faction === "caos" && state.temple === 2);
    if (!owns) {
        return {
            ok: false,
            message: state.temple === 1 ? "El templo esta en dominio de la Alianza." : "El templo esta en dominio de la Horda.",
        };
    }

    game.forceDismount(idUser);
    game.telep(client, TEMPLE.map, TEMPLE.x, TEMPLE.y, "templo");
    return { ok: true, message: "Has sido transportado al templo." };
}

export function onNpcDied(templateNpcIndex: number) {
    if (!state.active || Number(templateNpcIndex) !== state.npcIndex) {
        return;
    }

    if (Number(templateNpcIndex) === REAL_NPC) {
        finish("caos", true);
        return;
    }

    if (Number(templateNpcIndex) === CAOS_NPC) {
        finish("armada", true);
    }
}

export function onUserLeft(idUser: string) {
    state.alianzas.delete(String(idUser));
    state.hordas.delete(String(idUser));
    const user = vars.personajes[idUser];
    if (user) {
        user.guerra = false;
    }
}

export function cancelWar() {
    if (!state.active) {
        return { ok: false, message: "No hay guerra en curso." };
    }

    finish("none", false);
    return { ok: true, message: "Guerra cancelada." };
}

export function setAutomatic(on: boolean) {
    state.automatic = on;
    return { ok: true, message: on ? "Las Guerras Automaticas han sido Activadas." : "Las Guerras Automaticas han sido Desactivadas." };
}

export function describe() {
    if (state.active) {
        const left = Math.max(0, Math.ceil((state.startedAt + WAR_MINUTES * 60_000 - Date.now()) / 60_000));
        return `Guerra activa en mapa ${state.map}. Quedan ${left} minutos. /guerra para entrar.`;
    }

    const temple = state.temple === 1 ? "Alianza" : state.temple === 2 ? "Horda" : "nadie";
    return `No hay guerra. Templo: ${temple}. Proxima automatica en ${Math.max(0, Math.ceil((state.nextAt - Date.now()) / 60_000))} min.`;
}

export function initialize() {
    if (state.timer) {
        return;
    }

    state.timer = setInterval(() => {
        const now = Date.now();
        if (state.active) {
            const remaining = state.startedAt + WAR_MINUTES * 60_000 - now;
            if (remaining <= 0) {
                finish(state.map === REAL_MAP ? "caos" : "armada", false);
                return;
            }

            if (remaining <= 60_000) {
                announce("Queda 1 minuto de Guerra. Envia /guerra para defender a tu reino.");
            }
            return;
        }

        if (!state.automatic) {
            return;
        }

        const wait = state.nextAt - now;
        if (wait <= 5 * 60_000 && wait > 4 * 60_000) {
            announce("Alianza y Horda pelearan una Guerra en 5 minutos. Equipense y preparense.");
        }

        if (now >= state.nextAt) {
            startWar();
        }
    }, 60_000);

    console.log("[Guerras] Automaticas cada 120 minutos.");
}
