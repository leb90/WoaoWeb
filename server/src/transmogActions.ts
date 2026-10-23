export {};

import {
    countOccupiedInventorySlots,
    isInventorySlot,
} from "./equipmentStorage";

// Acciones de la transfiguración: poner y quitar objetos de los espacios,
// avisar a los clientes del área y persistir inventario + transfiguración en
// una sola escritura (así un objeto nunca queda en los dos lados).

const vars = require("./vars");
const transmog = require("./transmog") as typeof import("./transmog");

type InventorySlot = { idItem: number; cant: number; equipped?: number | boolean };

type ActionUser = {
    id: string | number;
    _id?: string;
    dead?: boolean | number;
    huntersGame?: unknown;
    transmog?: unknown;
    inv: Record<string, InventorySlot>;
};

type ActionResult = { ok: boolean; message: string };

function getGame() {
    return require("./game");
}

function getHandleProtocol() {
    return require("./handleProtocol");
}

function getUser(idUser: string | number): ActionUser | null {
    return (vars.personajes?.[idUser] as ActionUser | undefined) ?? null;
}

function getClient(idUser: string | number) {
    return vars.clients?.[idUser];
}

function tell(idUser: string | number, message: string, color = "#E69500") {
    const client = getClient(idUser);
    if (client) {
        getHandleProtocol().console(message, color, 1, 0, client);
    }
}

function hasFreeInventorySlot(user: ActionUser): boolean {
    return countOccupiedInventorySlots(user.inv ?? {}) < 21;
}

export function sendTransmogState(idUser: string | number): void {
    const user = getUser(idUser);
    const client = getClient(idUser);

    if (!user || !client) {
        return;
    }

    getHandleProtocol().transmogState(transmog.buildTransmogState(user), client);
}

/** Reenvía la apariencia visible del personaje a todos los que lo ven. */
export function broadcastVisibleAppearance(idUser: string | number): void {
    const client = getClient(idUser);
    const handleProtocol = getHandleProtocol();
    const notified = new Set<string>();

    const notify = (targetId: string | number) => {
        const key = String(targetId);
        const targetClient = getClient(targetId);

        if (notified.has(key) || !targetClient) {
            return;
        }

        notified.add(key);
        handleProtocol.changeBody(idUser, targetClient);
    };

    if (client) {
        getGame().loopArea(client, (target: { id?: string | number; isNpc?: boolean }) => {
            if (!target?.isNpc && target?.id !== undefined) {
                notify(target.id);
            }
        });
    }

    notify(idUser);
}

function persist(idUser: string | number) {
    void getGame()
        .persistCharacterItemsAndTransmogById(idUser)
        .catch((error: unknown) => {
            console.error("[Transfiguración] No se pudo guardar", idUser, error);
        });
}

function afterChange(idUser: string | number) {
    persist(idUser);
    broadcastVisibleAppearance(idUser);
    sendTransmogState(idUser);
}

function precheck(user: ActionUser | null): ActionResult | null {
    if (!user) {
        return { ok: false, message: "No se pudo transfigurar." };
    }

    if (user.dead) {
        return { ok: false, message: "Los muertos no pueden transfigurar." };
    }

    if (user.huntersGame) {
        return { ok: false, message: "No podés transfigurar durante el Hunters Game." };
    }

    return null;
}

export function placeItem(idUser: string | number, invSlotRaw: unknown, slotRaw?: unknown): ActionResult {
    const user = getUser(idUser);
    const blocked = precheck(user);

    if (blocked || !user) {
        return blocked ?? { ok: false, message: "No se pudo transfigurar." };
    }

    const invSlot = String(Math.floor(Number(invSlotRaw)));
    const item = user.inv?.[invSlot];

    if (!item) {
        return { ok: false, message: "No hay ningún objeto en ese lugar del inventario." };
    }

    const obj = vars.datObj?.[item.idItem];
    const slot = transmog.getTransmogSlotForObject(obj);

    if (!obj || !slot) {
        return { ok: false, message: "Ese objeto no se puede usar para transfigurar." };
    }

    if (slotRaw !== undefined && slotRaw !== "" && slotRaw !== slot) {
        const wanted = transmog.isTransmogSlot(slotRaw) ? transmog.TRANSMOG_SLOT_LABELS[slotRaw] : String(slotRaw);
        return {
            ok: false,
            message: `Ese objeto va en el espacio de ${transmog.TRANSMOG_SLOT_LABELS[slot]}, no en el de ${wanted}.`,
        };
    }

    const reason = transmog.getCandidateBlockedReason(user, slot, obj, Boolean(item.equipped));

    if (reason === "Está equipado") {
        return { ok: false, message: "Desequipá ese objeto antes de usarlo para transfigurar." };
    }

    if (reason === "Desactivado por el disfraz") {
        return {
            ok: false,
            message: "Con un disfraz de cuerpo completo puesto, el casco, el escudo y el arma quedan desactivados.",
        };
    }

    if (reason === "Diseño de un set con aura") {
        return { ok: false, message: "Ese diseño pertenece a un set con aura: solo se ve con el set completo equipado." };
    }

    if (reason) {
        return { ok: false, message: `No se puede transfigurar con ese objeto: ${reason.toLowerCase()}.` };
    }

    const state = transmog.getUserTransmog(user);
    const previous = state[slot];
    const freesSlot = Number(item.cant) <= 1;

    if (previous && !freesSlot && !hasFreeInventorySlot(user)) {
        return {
            ok: false,
            message: "No tenés lugar en el inventario para guardar el objeto que estaba en ese espacio.",
        };
    }

    const game = getGame();
    game.quitarUserInvItem(idUser, invSlot, 1);
    state[slot] = Number(item.idItem);
    user.transmog = state;

    if (previous) {
        if (!user.inv[invSlot]) {
            // El objeto que estaba puesto vuelve al mismo lugar del inventario.
            user.inv[invSlot] = { idItem: previous, cant: 1, equipped: 0 };
            const client = getClient(idUser);
            if (client) {
                getHandleProtocol().agregarUserInvItem(idUser, invSlot, client);
            }
        } else {
            game.putItemToInv(idUser, previous, 1);
        }
    }

    afterChange(idUser);
    const label = transmog.TRANSMOG_SLOT_LABELS[slot];
    return { ok: true, message: `Transfiguraste tu ${label}: ${obj.name}.` };
}

export function removeItem(idUser: string | number, slotRaw: unknown): ActionResult {
    const user = getUser(idUser);
    const blocked = precheck(user);

    if (blocked || !user) {
        return blocked ?? { ok: false, message: "No se pudo quitar la transfiguración." };
    }

    if (!transmog.isTransmogSlot(slotRaw)) {
        return { ok: false, message: "Usá /transmogquitar casco|escudo|arma|cuerpo." };
    }

    const slot = slotRaw;
    const state = transmog.getUserTransmog(user);
    const idItem = state[slot];

    if (!idItem) {
        return { ok: false, message: "Ese espacio está vacío." };
    }

    if (slot !== "cuerpo" && state.cuerpo) {
        return { ok: false, message: "Quitá primero el disfraz de cuerpo completo: los demás espacios están desactivados." };
    }

    const existingStack = Object.entries(user.inv ?? {}).some(
        ([inventorySlot, item]) =>
            isInventorySlot(inventorySlot) &&
            Number(item?.idItem) === idItem &&
            Number(item?.cant ?? 0) < 10000,
    );

    if (!existingStack && !hasFreeInventorySlot(user)) {
        return { ok: false, message: "No tenés lugar en el inventario." };
    }

    delete state[slot];
    user.transmog = state;
    getGame().putItemToInv(idUser, idItem, 1);
    afterChange(idUser);

    const name = vars.datObj?.[idItem]?.name ?? "el objeto";
    return { ok: true, message: `Quitaste ${name} de la transfiguración.` };
}

export function handleTransmogCommand(idUser: string | number, action: "estado" | "poner" | "quitar", args: string[]) {
    if (action === "poner") {
        const result = placeItem(idUser, args[0], args[1]);
        tell(idUser, result.message, result.ok ? "#E69500" : "white");
        if (!result.ok) {
            sendTransmogState(idUser);
        }
        return;
    }

    if (action === "quitar") {
        const result = removeItem(idUser, args[0]);
        tell(idUser, result.message, result.ok ? "#E69500" : "white");
        if (!result.ok) {
            sendTransmogState(idUser);
        }
        return;
    }

    sendTransmogState(idUser);
}

module.exports = {
    sendTransmogState,
    broadcastVisibleAppearance,
    placeItem,
    removeItem,
    handleTransmogCommand,
};
