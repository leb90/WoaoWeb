import type { InventoryItem, InventoryRecord } from "./types/runtime";

export const INVENTORY_SLOT_COUNT = 21;

export const EQUIPMENT_STORAGE_SLOTS = {
    body: 22,
    weapon: 23,
    shield: 24,
    helmet: 25,
    arrows: 26,
    ring: 27,
} as const;

export const MAX_CHARACTER_ITEM_SLOT = EQUIPMENT_STORAGE_SLOTS.ring;

export type EquipmentStorageSlot =
    (typeof EQUIPMENT_STORAGE_SLOTS)[keyof typeof EQUIPMENT_STORAGE_SLOTS];

export type EquipmentObjectTypes = {
    armaduras: number;
    armas: number;
    escudos: number;
    cascos: number;
    flechas: number;
    anillos: number;
};

type TransferSuccess = {
    ok: true;
    inventory: InventoryRecord;
    equipmentSlot: EquipmentStorageSlot;
};

type TransferFailure = {
    ok: false;
    reason: "invalid-source" | "inventory-full";
};

export type EquipmentTransferResult = TransferSuccess | TransferFailure;

function cloneInventory(record: InventoryRecord): InventoryRecord {
    return Object.fromEntries(
        Object.entries(record).map(([slot, item]) => [slot, { ...item }]),
    );
}

export function isInventorySlot(slot: number | string): boolean {
    const numericSlot = Number(slot);
    return (
        Number.isInteger(numericSlot) &&
        numericSlot >= 1 &&
        numericSlot <= INVENTORY_SLOT_COUNT
    );
}

export function isEquipmentStorageSlot(
    slot: number | string,
): slot is EquipmentStorageSlot {
    const numericSlot = Number(slot);
    return Object.values(EQUIPMENT_STORAGE_SLOTS).includes(
        numericSlot as EquipmentStorageSlot,
    );
}

export function getEquipmentStorageSlotForObjectType(
    objectType: number,
    objectTypes: EquipmentObjectTypes,
): EquipmentStorageSlot | null {
    if (objectType === objectTypes.armaduras) {
        return EQUIPMENT_STORAGE_SLOTS.body;
    }
    if (objectType === objectTypes.armas) {
        return EQUIPMENT_STORAGE_SLOTS.weapon;
    }
    if (objectType === objectTypes.escudos) {
        return EQUIPMENT_STORAGE_SLOTS.shield;
    }
    if (objectType === objectTypes.cascos) {
        return EQUIPMENT_STORAGE_SLOTS.helmet;
    }
    if (objectType === objectTypes.flechas) {
        return EQUIPMENT_STORAGE_SLOTS.arrows;
    }
    if (objectType === objectTypes.anillos) {
        return EQUIPMENT_STORAGE_SLOTS.ring;
    }

    return null;
}

export function countOccupiedInventorySlots(
    record: Record<string, unknown>,
): number {
    return Object.keys(record).filter(isInventorySlot).length;
}

export function findAvailableInventorySlot(record: InventoryRecord): number {
    for (let slot = 1; slot <= INVENTORY_SLOT_COUNT; slot += 1) {
        if (!record[String(slot)]) {
            return slot;
        }
    }

    return 0;
}

export function getInventoryStackCapacity(
    record: InventoryRecord,
    idItem: number,
    maxStack = 10_000,
): number {
    let capacity = 0;

    for (const [slot, item] of Object.entries(record)) {
        if (
            !isInventorySlot(slot) ||
            item.idItem !== idItem ||
            item.cant >= maxStack
        ) {
            continue;
        }

        capacity += maxStack - item.cant;
    }

    return capacity;
}

export function canAddToInventory(
    record: InventoryRecord,
    idItem: number,
    amount: number,
    maxStack = 10_000,
): boolean {
    const stackCapacity = getInventoryStackCapacity(
        record,
        idItem,
        maxStack,
    );
    const slotsNeeded = Math.ceil(
        Math.max(0, amount - stackCapacity) / maxStack,
    );

    return (
        countOccupiedInventorySlots(record) + slotsNeeded <=
        INVENTORY_SLOT_COUNT
    );
}

function addItemToInventory(
    record: InventoryRecord,
    item: InventoryItem,
    preferredSlot?: number,
    maxStack = 10_000,
): boolean {
    let remaining = item.cant;

    if (
        preferredSlot &&
        isInventorySlot(preferredSlot) &&
        !record[String(preferredSlot)]
    ) {
        const amount = Math.min(remaining, maxStack);
        record[String(preferredSlot)] = {
            idItem: item.idItem,
            cant: amount,
            equipped: 0,
        };
        remaining -= amount;
    }

    for (const [slot, inventoryItem] of Object.entries(record)) {
        if (
            remaining <= 0 ||
            !isInventorySlot(slot) ||
            inventoryItem.idItem !== item.idItem ||
            inventoryItem.cant >= maxStack
        ) {
            continue;
        }

        const amount = Math.min(remaining, maxStack - inventoryItem.cant);
        inventoryItem.cant += amount;
        inventoryItem.equipped = 0;
        remaining -= amount;
    }

    while (remaining > 0) {
        const slot = findAvailableInventorySlot(record);
        if (!slot) {
            return false;
        }

        const amount = Math.min(remaining, maxStack);
        record[String(slot)] = {
            idItem: item.idItem,
            cant: amount,
            equipped: 0,
        };
        remaining -= amount;
    }

    return true;
}

export function equipInventoryItem(
    record: InventoryRecord,
    sourceSlot: number,
    equipmentSlot: EquipmentStorageSlot,
    options?: { moveWholeStack?: boolean },
): EquipmentTransferResult {
    if (!isInventorySlot(sourceSlot)) {
        return { ok: false, reason: "invalid-source" };
    }

    const sourceItem = record[String(sourceSlot)];
    if (!sourceItem) {
        return { ok: false, reason: "invalid-source" };
    }

    const next = cloneInventory(record);
    const nextSourceItem = next[String(sourceSlot)];
    const previousEquipment = next[String(equipmentSlot)];
    const amountToEquip =
        options?.moveWholeStack === false ? 1 : nextSourceItem.cant;

    nextSourceItem.cant -= amountToEquip;
    if (nextSourceItem.cant <= 0) {
        delete next[String(sourceSlot)];
    }

    delete next[String(equipmentSlot)];

    if (
        previousEquipment &&
        !addItemToInventory(
            next,
            { ...previousEquipment, equipped: 0 },
            sourceSlot,
        )
    ) {
        return { ok: false, reason: "inventory-full" };
    }

    next[String(equipmentSlot)] = {
        idItem: sourceItem.idItem,
        cant: amountToEquip,
        equipped: 1,
    };

    return { ok: true, inventory: next, equipmentSlot };
}

export function unequipInventoryItem(
    record: InventoryRecord,
    equipmentSlot: EquipmentStorageSlot,
): EquipmentTransferResult {
    const equippedItem = record[String(equipmentSlot)];
    if (!equippedItem) {
        return { ok: false, reason: "invalid-source" };
    }

    const next = cloneInventory(record);
    delete next[String(equipmentSlot)];

    if (!addItemToInventory(next, { ...equippedItem, equipped: 0 })) {
        return { ok: false, reason: "inventory-full" };
    }

    return { ok: true, inventory: next, equipmentSlot };
}

export function normalizeEquipmentStorage(
    record: InventoryRecord,
    resolveEquipmentSlot: (
        item: InventoryItem,
    ) => EquipmentStorageSlot | null,
): { inventory: InventoryRecord; changed: boolean } {
    const next = cloneInventory(record);
    let changed = false;

    for (const [slot, item] of Object.entries(next)) {
        if (!item.equipped || !isInventorySlot(slot)) {
            continue;
        }

        const equipmentSlot = resolveEquipmentSlot(item);
        if (!equipmentSlot) {
            item.equipped = 0;
            changed = true;
            continue;
        }

        if (next[String(equipmentSlot)]) {
            item.equipped = 0;
            changed = true;
            continue;
        }

        delete next[slot];
        next[String(equipmentSlot)] = { ...item, equipped: 1 };
        changed = true;
    }

    for (const equipmentSlot of Object.values(EQUIPMENT_STORAGE_SLOTS)) {
        const item = next[String(equipmentSlot)];
        if (!item) {
            continue;
        }

        if (resolveEquipmentSlot(item) === equipmentSlot) {
            if (!item.equipped) {
                item.equipped = 1;
                changed = true;
            }
            continue;
        }

        const fallback = cloneInventory(next);
        delete fallback[String(equipmentSlot)];
        if (addItemToInventory(fallback, { ...item, equipped: 0 })) {
            for (const key of Object.keys(next)) {
                delete next[key];
            }
            Object.assign(next, fallback);
            changed = true;
        }
    }

    return { inventory: next, changed };
}
