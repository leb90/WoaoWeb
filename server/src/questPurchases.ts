import { DurableOutbox } from "./durableOutbox";
import { runtimeDataPath } from "./runtimeDataPath";
import { economyRequest, applyQuestWalletState } from "./questWallet";
import { getProgress, saveProgress } from "./woaoProgress";
type Purchase = { characterId: string; cost: number; objIndex: number; amount: number; rarity: number; reason: string };
const rejected = new Map<string, string>();
const outbox = new DurableOutbox(runtimeDataPath("questPurchasesOutbox.json"), async (id, payload: Purchase) => {
    const vars = require("./vars");
    const user = Object.values(vars.personajes as Record<string, any>).find(
        (u) => String(u._id) === payload.characterId,
    ) ?? { _id: payload.characterId };
    let state;
    try {
        state = await economyRequest("/internal/quest-wallets/mutate", {
            characterId: payload.characterId,
            operationId: id,
            delta: -payload.cost,
            reason: payload.reason,
        });
    } catch (error) {
        if ((error as { status?: number }).status === 400) {
            const message = error instanceof Error ? error.message : "Canje rechazado";
            rejected.set(id, message);
            setTimeout(() => rejected.delete(id), 5000).unref();
            if (vars.clients[user.id])
                require("./handleProtocol").console(
                    `Canje rechazado: ${message}`,
                    "#E69500",
                    1,
                    0,
                    vars.clients[user.id],
                );
            return;
        }
        throw error;
    }
    const progress = getProgress(user);
    applyQuestWalletState(user, state);
    if (!progress.rewardDeliveriesApplied?.[id]) {
        progress.pendingDeliveries.push({
            objIndex: payload.objIndex,
            amount: payload.amount,
            rarity: payload.rarity,
            reason: payload.reason,
            createdAt: Date.now(),
        });
        (progress.rewardDeliveriesApplied ??= {})[id] = true;
        saveProgress(user);
    }
    if (vars.clients[user.id]) require("./donationShop").deliverPendingItems(user.id);
});
export async function queueQuestPurchase(id: string, payload: Purchase): Promise<"complete" | "pending"> {
    if (outbox.hasPending((p) => p.characterId === payload.characterId)) return "pending";
    outbox.enqueue(id, payload);
    await outbox.flush();
    const error = rejected.get(id);
    rejected.delete(id);
    if (error) throw new Error(error);
    return getProgress({ _id: payload.characterId }).rewardDeliveriesApplied?.[id] ? "complete" : "pending";
}
export function flushQuestPurchases() {
    return outbox.flush();
}
export function initializeQuestPurchases() {
    void outbox.flush();
    setInterval(() => {
        void outbox.flush();
    }, 5000).unref();
}
