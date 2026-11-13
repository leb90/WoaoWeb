import type { EntityId } from "./types/runtime";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol");

// /hogar con vida fuera de zona segura: 30 segundos quieto, sin atacar ni recibir ataques.
export const HOME_RECALL_DELAY_MS = 30_000;
const CHECK_INTERVAL_MS = 250;
const ANNOUNCE_EVERY_MS = 10_000;
const COLOR = "#E69500";

type PendingRecall = {
    startedAt: number;
    endsAt: number;
    map: number;
    x: number;
    y: number;
    nextAnnounceAt: number;
    complete: () => void;
};

const pending = new Map<string, PendingRecall>();
let timer: ReturnType<typeof setInterval> | null = null;

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, COLOR, 1, 0, client);
    }
}

function stopTimerIfIdle() {
    if (pending.size === 0 && timer) {
        clearInterval(timer);
        timer = null;
    }
}

export function isRecalling(idUser: EntityId): boolean {
    return pending.has(String(idUser));
}

export function startHomeRecall(idUser: EntityId, complete: () => void, now = Date.now()): boolean {
    const key = String(idUser);
    const user = vars.personajes[key];

    if (!user || pending.has(key)) {
        return false;
    }

    pending.set(key, {
        startedAt: now,
        endsAt: now + HOME_RECALL_DELAY_MS,
        map: Number(user.map ?? 0),
        x: Number(user.pos?.x ?? 0),
        y: Number(user.pos?.y ?? 0),
        nextAnnounceAt: now + ANNOUNCE_EVERY_MS,
        complete,
    });
    tell(
        key,
        `Volverás a tu hogar en ${HOME_RECALL_DELAY_MS / 1000} segundos. Si te movés, atacás o te atacan, se cancela.`,
    );

    if (!timer) {
        timer = setInterval(() => tickHomeRecalls(), CHECK_INTERVAL_MS);
        timer.unref?.();
    }

    return true;
}

export function cancelHomeRecall(idUser: EntityId | undefined, reason?: string): void {
    if (idUser === undefined || idUser === null) {
        return;
    }

    const key = String(idUser);
    if (!pending.delete(key)) {
        return;
    }

    if (reason) {
        tell(key, `Regreso al hogar cancelado: ${reason}`);
    }
    stopTimerIfIdle();
}

// Ataque declarado (golpe, flecha o hechizo hostil, acierte o no): corta el regreso de los dos.
export function noteHostileAction(attackerId: EntityId | undefined, targetId?: EntityId, targetIsNpc = false): void {
    cancelHomeRecall(attackerId, "atacaste.");
    if (!targetIsNpc) {
        cancelHomeRecall(targetId, "te atacaron.");
    }
}

function getCancelReason(user: any, recall: PendingRecall): string | null {
    if (Number(user.map ?? 0) !== recall.map || Number(user.pos?.x ?? 0) !== recall.x || Number(user.pos?.y ?? 0) !== recall.y) {
        return "te moviste.";
    }

    // Marcas que ya deja el combate: daño recibido de cualquiera y golpes de NPC (npcs.ts / racialPassives.ts).
    if (Number(user.lastAttackedAt ?? 0) >= recall.startedAt) {
        return "te atacaron.";
    }

    if (Number(user.lastCombatActivityAt ?? 0) >= recall.startedAt) {
        return "estás en combate.";
    }

    return null;
}

export function tickHomeRecalls(now = Date.now()): void {
    for (const [key, recall] of [...pending]) {
        const user = vars.personajes[key];

        if (!user || !vars.clients[key] || user.dead) {
            // Muerto puede usar /hogar al instante; desconectado no vuelve.
            pending.delete(key);
            continue;
        }

        const reason = getCancelReason(user, recall);
        if (reason) {
            cancelHomeRecall(key, reason);
            continue;
        }

        if (now >= recall.endsAt) {
            pending.delete(key);
            recall.complete();
            continue;
        }

        if (now >= recall.nextAnnounceAt) {
            recall.nextAnnounceAt += ANNOUNCE_EVERY_MS;
            tell(key, `Volverás a tu hogar en ${Math.ceil((recall.endsAt - now) / 1000)} segundos.`);
        }
    }

    stopTimerIfIdle();
}

module.exports = {
    HOME_RECALL_DELAY_MS,
    cancelHomeRecall,
    isRecalling,
    noteHostileAction,
    startHomeRecall,
    tickHomeRecalls,
};
