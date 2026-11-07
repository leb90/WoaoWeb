import { addItemToInventory, isInventorySlot } from "./equipmentStorage";
import type { InventoryRecord } from "./types/runtime";

type Requirement = { index: number; amount: number };
export type RolledQuestReward = { idItem: number; cant: number; rarity?: number };

/** Plan completo: nada de la entrada se modifica si falta un requisito o espacio. */
export function planQuestInventory(
    inventory: InventoryRecord,
    requirements: Requirement[],
    rewards: RolledQuestReward[],
): { ok: true; inventory: InventoryRecord } | { ok: false; reason: string } {
    const next = structuredClone(inventory);
    for (const req of requirements) {
        if (!Number.isSafeInteger(req.amount) || req.amount <= 0) return { ok: false, reason: "invalid-amount" };
        let remaining = req.amount;
        for (const [slot, item] of Object.entries(next)) {
            if (!remaining) break;
            if (!isInventorySlot(slot) || item.idItem !== req.index) continue;
            const removed = Math.min(remaining, item.cant);
            remaining -= removed;
            item.cant -= removed;
            if (!item.cant) delete next[slot];
        }
        if (remaining) return { ok: false, reason: "missing-items" };
    }
    for (const reward of rewards) {
        if (!addItemToInventory(next, { ...reward, equipped: 0 })) return { ok: false, reason: "inventory-full" };
    }
    return { ok: true, inventory: next };
}
