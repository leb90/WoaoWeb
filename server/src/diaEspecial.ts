const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

type DailyState = {
    npcIndex: number;
    name: string;
    mode: number;
};

const state: DailyState = {
    npcIndex: 0,
    name: "",
    mode: 1,
};

function pickDailyNpc() {
    const candidates: Array<{ id: number; name: string }> = [];
    for (const [rawId, npc] of Object.entries(vars.datNpc ?? {}) as Array<[string, any]>) {
        const id = Number(rawId);
        if (id < 500 || id > 779) {
            continue;
        }

        const name = String(npc?.name ?? "").trim();
        if (!name || name.toUpperCase().includes("COFRE")) {
            continue;
        }

        candidates.push({ id, name });
    }

    if (!candidates.length) {
        return;
    }

    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    state.npcIndex = picked.id;
    state.name = picked.name;
    state.mode = 1 + Math.floor(Math.random() * 2);
}

export function scaleExp(npc: { templateNpcIndex?: number }, exp: number) {
    if (!exp) {
        return exp;
    }

    if (state.mode === 2) {
        return Math.floor(exp * 1.4);
    }

    if (state.mode === 1 && Number(npc?.templateNpcIndex ?? 0) === state.npcIndex) {
        return Math.floor(exp * 1.5);
    }

    return exp;
}

export function describe() {
    if (!state.npcIndex) {
        return "Hoy no hay evento especial.";
    }

    if (state.mode === 2) {
        return `Evento del dia: +40% de experiencia global. Bicho destacado: ${state.name}.`;
    }

    return `Bicho del dia: ${state.name}. +50% de experiencia al cazarlo.`;
}

export function announceTo(idUser: string) {
    const client = vars.clients[idUser];
    if (client && state.npcIndex) {
        handleProtocol.console(`WOAO> ${describe()}`, "#E69500", 1, 0, client);
    }
}

export function initialize() {
    pickDailyNpc();
    if (state.npcIndex) {
        console.log(`[DiaEspecial] ${describe()}`);
    }
}
