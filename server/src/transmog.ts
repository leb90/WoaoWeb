export {};

// Transfiguración (estilo WoW): cuatro espacios cosméticos que cambian el
// dibujo del personaje sin tocar stats ni equipo. Los objetos que se ponen
// salen del inventario y quedan guardados en el espacio hasta que se quitan.
//
// El equipo real sigue en idHead/idBody/idHelmet/idWeapon/idShield (lo
// escriben equipar, montura, barco, muerte, eventos...). La transfiguración
// no toca esos campos: se aplica al serializar la apariencia hacia los
// clientes (handleProtocol), así ninguno de esos caminos la pisa.

const vars = require("./vars");
const itemKinds = require("./itemKinds");

export type TransmogSlot = "casco" | "escudo" | "arma" | "cuerpo";
export type TransmogRecord = Partial<Record<TransmogSlot, number>>;

export type Appearance = {
    head: number;
    body: number;
    helmet: number;
    weapon: number;
    shield: number;
};

export const TRANSMOG_SLOTS: TransmogSlot[] = ["casco", "escudo", "arma", "cuerpo"];

export const TRANSMOG_SLOT_LABELS: Record<TransmogSlot, string> = {
    casco: "casco",
    escudo: "escudo",
    arma: "arma",
    cuerpo: "disfraz de cuerpo completo",
};

// Gráficos que forman sets con aura (frontend/components/game/rendering/
// equipmentAuras.ts). Transfigurarlos prestaría el aura sin tener el set.
const AURA_LOCKED_GRAPHICS: Partial<Record<TransmogSlot, number[]>> = {
    casco: [44],
    escudo: [40],
    arma: [77],
};

type TransmogUser = {
    id?: unknown;
    _id?: unknown;
    idHead?: number;
    idBody?: number;
    idHelmet?: number;
    idWeapon?: number;
    idShield?: number;
    idLastHead?: number;
    idLastBody?: number;
    idLastHelmet?: number;
    idLastWeapon?: number;
    idLastShield?: number;
    dead?: boolean | number;
    navegando?: boolean | number;
    mounted?: boolean | number;
    morphBody?: number;
    huntersGame?: unknown;
    transmog?: unknown;
    inv?: Record<string, { idItem: number; cant: number; equipped?: number | boolean }>;
};

type TransmogObject = {
    name?: string;
    objType?: number;
    subtipo?: number;
    anim?: number;
    grhIndex?: number;
    disfraz?: number;
    cosmetico?: number;
    eventOnly?: unknown;
};

export function isTransmogSlot(value: unknown): value is TransmogSlot {
    return typeof value === "string" && (TRANSMOG_SLOTS as string[]).includes(value);
}

export function normalizeTransmog(raw: unknown): TransmogRecord {
    let source = raw;

    if (typeof source === "string") {
        try {
            source = JSON.parse(source);
        } catch {
            source = {};
        }
    }

    const result: TransmogRecord = {};

    if (!source || typeof source !== "object" || Array.isArray(source)) {
        return result;
    }

    for (const slot of TRANSMOG_SLOTS) {
        const idItem = Math.floor(Number((source as Record<string, unknown>)[slot] ?? 0));
        if (Number.isFinite(idItem) && idItem > 0) {
            result[slot] = idItem;
        }
    }

    return result;
}

export function getUserTransmog(user: TransmogUser): TransmogRecord {
    const normalized = normalizeTransmog(user.transmog);
    user.transmog = normalized;
    return normalized;
}

function getObject(idItem: number | undefined): TransmogObject | null {
    if (!idItem) {
        return null;
    }

    return (vars.datObj?.[idItem] as TransmogObject | undefined) ?? null;
}

export function getTransmogSlotForObject(obj: TransmogObject | null | undefined): TransmogSlot | null {
    if (!obj) {
        return null;
    }

    if (Number(obj.disfraz ?? 0) > 0) {
        return "cuerpo";
    }

    const equipType = Number(itemKinds.getEquipObjectType(obj));

    if (equipType === Number(vars.objType.cascos)) {
        return "casco";
    }

    if (equipType === Number(vars.objType.escudos)) {
        return "escudo";
    }

    if (Number(obj.objType) === Number(vars.objType.armas)) {
        return "arma";
    }

    return null;
}

export function getObjectTransmogGraphic(slot: TransmogSlot, obj: TransmogObject | null | undefined): number {
    if (!obj) {
        return 0;
    }

    return Math.max(0, Number(slot === "cuerpo" ? obj.disfraz : obj.anim) || 0);
}

export function isAuraLockedGraphic(slot: TransmogSlot, graphic: number): boolean {
    return Boolean(AURA_LOCKED_GRAPHICS[slot]?.includes(graphic));
}

/**
 * Motivo por el que la transfiguración no se ve en este momento (o null si
 * se ve). Muerto, navegando, montado o transformado se dibujan como siempre;
 * en el Hunters Game los personajes son anónimos y un disfraz los delataría.
 */
export function getTransmogSuppressedReason(user: TransmogUser): string | null {
    if (user.dead) {
        return "Estás muerto";
    }

    if (user.navegando) {
        return "Estás navegando";
    }

    if (user.mounted) {
        return "Estás montado";
    }

    if (Number(user.morphBody ?? 0) > 0) {
        return "Estás transformado";
    }

    if (user.huntersGame) {
        return "Estás en el Hunters Game";
    }

    return null;
}

function readRawAppearance(user: TransmogUser): Appearance {
    return {
        head: Number(user.idHead ?? 0),
        body: Number(user.idBody ?? 0),
        helmet: Number(user.idHelmet ?? 0),
        weapon: Number(user.idWeapon ?? 0),
        shield: Number(user.idShield ?? 0),
    };
}

/** Apariencia "a pie" (sin barco ni montura), base de la vista previa. */
function readFootAppearance(user: TransmogUser): Appearance {
    if (user.navegando || user.mounted) {
        return {
            head: Number(user.idLastHead ?? user.idHead ?? 0),
            body: Number(user.idLastBody ?? user.idBody ?? 0),
            helmet: Number(user.idLastHelmet ?? 0),
            weapon: Number(user.idLastWeapon ?? 0),
            shield: Number(user.idLastShield ?? 0),
        };
    }

    return readRawAppearance(user);
}

function applyTransmog(base: Appearance, transmog: TransmogRecord): Appearance {
    const bodyObject = getObject(transmog.cuerpo);
    const costumeBody = getObjectTransmogGraphic("cuerpo", bodyObject);

    if (costumeBody > 0) {
        // Disfraz de cuerpo completo: el cuerpo trae su propia cabeza y no
        // lleva casco, arma ni escudo (igual que el barco).
        return { head: 0, body: costumeBody, helmet: 0, weapon: 0, shield: 0 };
    }

    const visible = { ...base };
    const helmet = getObjectTransmogGraphic("casco", getObject(transmog.casco));
    const shield = getObjectTransmogGraphic("escudo", getObject(transmog.escudo));
    const weapon = getObjectTransmogGraphic("arma", getObject(transmog.arma));

    if (helmet > 0) {
        visible.helmet = helmet;
    }

    if (shield > 0) {
        visible.shield = shield;
    }

    if (weapon > 0) {
        visible.weapon = weapon;
    }

    return visible;
}

export function hasTransmog(user: TransmogUser | null | undefined): boolean {
    return Boolean(user && Object.keys(normalizeTransmog(user.transmog)).length > 0);
}

/** Apariencia que ven todos los clientes (incluido el dueño). */
export function getVisibleAppearance(user: TransmogUser): Appearance {
    const raw = readRawAppearance(user);

    if (!hasTransmog(user) || getTransmogSuppressedReason(user)) {
        return raw;
    }

    return applyTransmog(raw, normalizeTransmog(user.transmog));
}

export type TransmogSlotState = {
    idItem: number;
    name: string;
    grhIndex: number;
    graphic: number;
    cosmetic: boolean;
};

export type TransmogCandidate = {
    invSlot: number;
    idItem: number;
    name: string;
    grhIndex: number;
    slot: TransmogSlot;
    graphic: number;
    cosmetic: boolean;
    blockedReason: string | null;
};

export type TransmogStatePayload = {
    slots: Record<TransmogSlot, TransmogSlotState | null>;
    bodyLocked: boolean;
    suppressedReason: string | null;
    appearance: { base: Appearance; preview: Appearance };
    candidates: TransmogCandidate[];
};

export function getCandidateBlockedReason(
    user: TransmogUser,
    slot: TransmogSlot,
    obj: TransmogObject,
    equipped: boolean,
): string | null {
    const transmog = normalizeTransmog(user.transmog);
    const graphic = getObjectTransmogGraphic(slot, obj);

    if (equipped) {
        return "Está equipado";
    }

    if (obj.eventOnly) {
        return "Es un objeto de evento";
    }

    if (graphic <= 0) {
        return "No tiene un diseño visible";
    }

    if (isAuraLockedGraphic(slot, graphic)) {
        return "Diseño de un set con aura";
    }

    if (slot !== "cuerpo" && transmog.cuerpo) {
        return "Desactivado por el disfraz";
    }

    return null;
}

export function buildTransmogState(user: TransmogUser): TransmogStatePayload {
    const transmog = getUserTransmog(user);
    const slots = {} as Record<TransmogSlot, TransmogSlotState | null>;

    for (const slot of TRANSMOG_SLOTS) {
        const idItem = transmog[slot];
        const obj = getObject(idItem);
        slots[slot] =
            idItem && obj
                ? {
                      idItem,
                      name: String(obj.name ?? ""),
                      grhIndex: Number(obj.grhIndex ?? 0),
                      graphic: getObjectTransmogGraphic(slot, obj),
                      cosmetic: Number(obj.cosmetico ?? 0) === 1,
                  }
                : null;
    }

    const candidates: TransmogCandidate[] = [];

    for (const [key, item] of Object.entries(user.inv ?? {})) {
        const obj = getObject(Number(item?.idItem));
        const slot = getTransmogSlotForObject(obj);

        if (!obj || !slot) {
            continue;
        }

        candidates.push({
            invSlot: Number(key),
            idItem: Number(item.idItem),
            name: String(obj.name ?? ""),
            grhIndex: Number(obj.grhIndex ?? 0),
            slot,
            graphic: getObjectTransmogGraphic(slot, obj),
            cosmetic: Number(obj.cosmetico ?? 0) === 1,
            blockedReason: getCandidateBlockedReason(user, slot, obj, Boolean(item.equipped)),
        });
    }

    candidates.sort((left, right) => left.invSlot - right.invSlot);
    const base = readFootAppearance(user);

    return {
        slots,
        bodyLocked: Boolean(transmog.cuerpo),
        suppressedReason: getTransmogSuppressedReason(user),
        appearance: { base, preview: applyTransmog(base, transmog) },
        candidates,
    };
}

/** Apariencia de la vista previa (sin transfiguración y con ella). */
export function buildAppearancePreview(user: TransmogUser): { base: Appearance; preview: Appearance } {
    const base = readFootAppearance(user);
    return { base, preview: applyTransmog(base, normalizeTransmog(user.transmog)) };
}

module.exports = {
    TRANSMOG_SLOTS,
    TRANSMOG_SLOT_LABELS,
    isTransmogSlot,
    normalizeTransmog,
    getUserTransmog,
    getTransmogSlotForObject,
    getObjectTransmogGraphic,
    isAuraLockedGraphic,
    getTransmogSuppressedReason,
    getCandidateBlockedReason,
    getVisibleAppearance,
    hasTransmog,
    buildTransmogState,
    buildAppearancePreview,
};
