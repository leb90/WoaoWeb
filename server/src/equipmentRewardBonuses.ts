export {};

type InventorySlotLike = {
    idItem?: number | string;
} | null | undefined;

// Personaje en juego: el inventario vive en `inv` (no en `items`, que es la forma serializada para guardar).
type CharacterLike = {
    idItemBody?: number | string;
    inv?: Record<string | number, InventorySlotLike> | InventorySlotLike[] | null;
} | null | undefined;

type ObjectLike = {
    bonusGoldNpcPct?: unknown;
    bonusExpNpcPct?: unknown;
    bonusDropNpcPct?: unknown;
} | null | undefined;

const vars = require("./vars");

function toPercent(value: unknown): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        return 0;
    }
    return Math.min(500, parsed);
}

function getInventorySlot(user: CharacterLike, slotKey: string): InventorySlotLike {
    const bag = user?.inv;
    if (!bag || typeof bag !== "object" || Array.isArray(bag)) {
        return null;
    }

    return (bag as Record<string, InventorySlotLike>)[slotKey] ?? null;
}

function getEquippedBodyObject(user: CharacterLike): ObjectLike {
    if (!user) {
        return null;
    }

    const slotKey = user.idItemBody;
    if (slotKey === undefined || slotKey === null || slotKey === "" || slotKey === 0) {
        return null;
    }

    const inventoryItem = getInventorySlot(user, String(slotKey));
    const itemId = Number(inventoryItem?.idItem ?? 0);
    if (!itemId) {
        return null;
    }

    return (vars.datObj?.[itemId] ?? null) as ObjectLike;
}

export function getEquippedNpcGoldBonusPct(user: CharacterLike): number {
    return toPercent(getEquippedBodyObject(user)?.bonusGoldNpcPct);
}

export function getEquippedNpcExpBonusPct(user: CharacterLike): number {
    return toPercent(getEquippedBodyObject(user)?.bonusExpNpcPct);
}

export function getEquippedNpcDropBonusPct(user: CharacterLike): number {
    return toPercent(getEquippedBodyObject(user)?.bonusDropNpcPct);
}

export function applyPercentBonus(baseAmount: number, bonusPct: number): number {
    const amount = Math.floor(Number(baseAmount) || 0);
    if (amount <= 0 || bonusPct <= 0) {
        return Math.max(0, amount);
    }

    return Math.max(0, Math.floor(amount * (1 + bonusPct / 100)));
}

export function applyDropChanceBonus(chancePercent: number, bonusPct: number): number {
    const chance = Number(chancePercent);
    if (!Number.isFinite(chance) || chance <= 0) {
        return 0;
    }

    if (bonusPct <= 0) {
        return Math.min(100, Math.max(0, chance));
    }

    return Math.min(100, Math.max(0, chance * (1 + bonusPct / 100)));
}
