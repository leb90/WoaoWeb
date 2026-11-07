import crypto from "node:crypto";
import { DurableOutbox } from "./durableOutbox";
import { runtimeDataPath } from "./runtimeDataPath";
import { economyRequest, applyQuestWalletState } from "./questWallet";
import { hasCombatActivity } from "./combatActivity";
import { getProgress, saveProgress } from "./woaoProgress";
const vars = require("./vars");
type EventType = "tournament" | "hungerGames" | "huntersGame" | "bloodCastle" | "factionWar";
type Run = { id: string; type: EventType; startedAt: string; users: Set<string> };
const runs = new Map<EventType, Run>();
const outbox = new DurableOutbox(runtimeDataPath("eventRewardsOutbox.json"), async (id, payload) => {
    const result = await economyRequest(payload.route, payload.body);
    if (payload.route.endsWith("register-rewards")) return;
    const user = Object.values(vars.personajes as Record<string, any>).find(
        (u) => u._id === payload.body.characterId,
    ) ?? { _id: payload.body.characterId };
    const progress = getProgress(user);
    applyQuestWalletState(user, result);
    if (result.item && !progress.rewardDeliveriesApplied?.[id]) {
        progress.pendingDeliveries.push({ ...result.item, reason: "Premio de torneo", createdAt: Date.now() });
        (progress.rewardDeliveriesApplied ??= {})[id] = true;
        saveProgress(user);
    }
    const client = vars.clients[user.id];
    if (client && result.item) require("./donationShop").deliverPendingItems(user.id);
    if (client && result.applied && result.points > 0) {
        require("./handleProtocol").console(
            `Premio de evento: +${result.points} puntos Quest.`,
            "#E69500",
            1,
            0,
            client,
        );
        require("./handleProtocol").sendMyCharacter(user);
        require("./socket").send(client);
    }
});
function register(run: Run, ids: string[]) {
    const characterIds = ids.map((id) => vars.personajes[id]?._id).filter(Boolean) as string[];
    if (!characterIds.length) return;
    const hash = crypto.createHash("sha256").update(characterIds.slice().sort().join(",")).digest("hex");
    outbox.enqueue(`register:${run.id}:${hash}`, {
        route: "/internal/events/register-rewards",
        body: { runId: run.id, type: run.type, startedAt: run.startedAt, characterIds },
    });
    void outbox.flush();
}
export function startRewardRun(type: EventType, ids: Iterable<string>) {
    const run: Run = { id: crypto.randomUUID(), type, startedAt: new Date().toISOString(), users: new Set(ids) };
    runs.set(type, run);
    register(run, [...run.users]);
    return run.id;
}
export function joinRewardRun(type: EventType, id: string) {
    const run = runs.get(type);
    if (!run) return;
    run.users.add(id);
    register(run, [id]);
}
export function endRewardRun(type: EventType) {
    runs.delete(type);
}
export function rewardEventUser(
    type: EventType,
    id: string,
    kind: string,
    options: { victimId?: string; completed?: boolean } = {},
) {
    const run = runs.get(type);
    const user = vars.personajes[id];
    if (!run || !user?._id || !run.users.has(id)) return;
    const victimCharacterId = options.victimId ? vars.personajes[options.victimId]?._id : undefined;
    const operationId = `event:${run.id}:${user._id}:${kind}${victimCharacterId ? `:${victimCharacterId}` : ""}`;
    outbox.enqueue(operationId, {
        route: "/internal/events/grant-reward",
        body: {
            runId: run.id,
            characterId: user._id,
            kind,
            operationId,
            activity: hasCombatActivity(id, new Date(run.startedAt).getTime()),
            ...(victimCharacterId ? { victimCharacterId } : {}),
            ...(options.completed !== undefined ? { completed: options.completed } : {}),
        },
    });
    void outbox.flush();
}
export function initializeEventRewards() {
    void outbox.flush();
    setInterval(() => {
        void outbox.flush();
    }, 5000).unref();
}
