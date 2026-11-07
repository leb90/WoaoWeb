import crypto from "node:crypto";
import { DurableOutbox } from "./durableOutbox";
import { runtimeDataPath } from "./runtimeDataPath";
import { getProgress, saveProgress } from "./woaoProgress";
const vars = require("./vars");
const funct = require("./functions");
type WalletState = { balance: number; version?: number };
export async function economyRequest(route: string, payload: unknown): Promise<any> {
    return funct.fetchUrl(route, {
        method: "POST",
        headers: { Authorization: vars.tokenAuth, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
}
export function applyQuestWalletState(user: any, state: WalletState) {
    const progress = getProgress(user);
    if (Number(state.version ?? 0) < Number(progress.questWalletVersion ?? 0)) return;
    progress.puntosCanje = state.balance;
    progress.questWalletVersion = Number(state.version ?? 0);
    user.puntosCanje = state.balance;
    saveProgress(user);
}
export async function hydrateQuestWallet(user: any) {
    if (!user._id) return;
    const progress = getProgress(user);
    const state = await economyRequest("/internal/quest-wallets/initialize", {
        characterId: String(user._id),
        legacyBalance: Number(progress.puntosCanje ?? 0),
    });
    applyQuestWalletState(user, state);
}
const outbox = new DurableOutbox(runtimeDataPath("questRewardsOutbox.json"), async (operationId, payload) => {
    await economyRequest("/internal/quest-wallets/initialize", {
        characterId: payload.characterId,
        legacyBalance: Number(getProgress({ _id: payload.characterId }).puntosCanje ?? 0),
    });
    const state = await economyRequest("/internal/quest-wallets/mutate", {
        characterId: payload.characterId,
        operationId,
        delta: payload.amount,
        reason: payload.reason,
    });
    const user = Object.values(vars.personajes as Record<string, any>).find(
        (u) => String(u._id) === payload.characterId,
    ) ?? { _id: payload.characterId };
    applyQuestWalletState(user, state);
    const client = vars.clients[user.id];
    if (client) {
        require("./handleProtocol").console(
            `+${payload.amount} puntos Quest (${payload.reason}).`,
            "#E69500",
            1,
            0,
            client,
        );
        require("./handleProtocol").sendMyCharacter(user);
        require("./socket").send(client);
    }
});
export function queueQuestReward(user: any, amount: number, reason: string, operationId: string = crypto.randomUUID()) {
    if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error("Premio Quest inválido");
    if (!user._id) throw new Error("No se identificó el personaje del premio");
    outbox.enqueue(operationId, { characterId: String(user._id), amount, reason });
    void outbox.flush();
}
export async function spendQuestPoints(user: any, amount: number, operationId: string, reason: string) {
    const state = await economyRequest("/internal/quest-wallets/mutate", {
        characterId: String(user._id),
        delta: -amount,
        operationId,
        reason,
    });
    applyQuestWalletState(user, state);
    return state;
}
export function initializeQuestRewards() {
    require("./questPurchases").initializeQuestPurchases();
    void outbox.flush();
    setInterval(() => {
        void outbox.flush();
    }, 5000).unref();
}
