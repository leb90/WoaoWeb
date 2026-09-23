import { getProgress, MAX_QUESTS, saveProgress, type QuestProgress } from "./woaoProgress";

const game = require("./game");
const vars = require("./vars");
const handleProtocol = require("./handleProtocol");
const jsonQuests = require("../jsons/quests.json") as Record<string, QuestDefinition>;
const jsonQuestGivers = require("../jsons/questGivers.json") as Record<string, number>;

type QuestRequirement = {
    index: number;
    amount: number;
};

type QuestDefinition = {
    id: number;
    name: string;
    desc: string;
    requiredLevel: number;
    requiredNpcs: QuestRequirement[];
    requiredObjs: QuestRequirement[];
    rewardGold: number;
    rewardExp: number;
    rewardPoints: number;
    rewardObjs: QuestRequirement[];
};

type QuestObjectiveState = {
    index: number;
    name: string;
    current: number;
    amount: number;
    type: "npc" | "item";
};

type QuestRewardState = {
    type: "gold" | "exp" | "points" | "item";
    label: string;
    amount: number;
    index?: number;
};

type QuestEntryState = {
    id: number;
    name: string;
    desc: string;
    status: "available" | "active" | "ready" | "done";
    npcId?: number;
    requiredLevel: number;
    objectives: QuestObjectiveState[];
    rewards: QuestRewardState[];
};

const quests = new Map<number, QuestDefinition>();
const questGivers = new Map<number, number>();

function tell(idUser: string, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.console(message, "#E69500", 1, 0, client);
    }
}

function npcTalk(idUser: string, npcId: unknown, message: string) {
    const client = vars.clients[idUser];
    if (client) {
        handleProtocol.dialog(npcId, message, "", "white", 0, client);
    }
}

function countItem(user: { inv?: Record<string, { idItem?: number; cant?: number; amount?: number }> }, itemId: number) {
    let total = 0;
    for (const item of Object.values(user.inv ?? {})) {
        if (Number(item?.idItem) === itemId) {
            total += Number(item.cant ?? item.amount ?? 0);
        }
    }
    return total;
}

function countFreeSlots(user: { inv?: Record<string, unknown> }) {
    return Math.max(0, 21 - Object.keys(user.inv ?? {}).length);
}

function removeItems(idUser: string, itemId: number, amount: number) {
    const user = vars.personajes[idUser];
    if (!user?.inv) {
        return;
    }

    let remaining = amount;
    for (const [slot, item] of Object.entries(user.inv as Record<string, { idItem?: number; cant?: number; amount?: number }>)) {
        if (remaining <= 0) {
            break;
        }

        if (Number(item?.idItem) !== itemId) {
            continue;
        }

        const have = Number(item.cant ?? item.amount ?? 0);
        const take = Math.min(have, remaining);
        game.quitarUserInvItem(idUser, slot, take);
        remaining -= take;
    }
}

function findQuestSlot(progressQuests: QuestProgress[], questIndex: number) {
    return progressQuests.findIndex((entry) => entry.questIndex === questIndex);
}

function getNpcName(npcIndex: number): string {
    return vars.datNpc?.[npcIndex]?.name ?? `NPC ${npcIndex}`;
}

function getObjName(objIndex: number): string {
    return vars.datObj?.[objIndex]?.name ?? `Item ${objIndex}`;
}

function buildRewards(quest: QuestDefinition): QuestRewardState[] {
    const rewards: QuestRewardState[] = [];

    if (quest.rewardGold) {
        rewards.push({ type: "gold", label: "Oro", amount: quest.rewardGold });
    }
    if (quest.rewardExp) {
        rewards.push({ type: "exp", label: "Experiencia", amount: quest.rewardExp });
    }
    if (quest.rewardPoints) {
        rewards.push({ type: "points", label: "Puntos de canje", amount: quest.rewardPoints });
    }
    for (const reward of quest.rewardObjs) {
        rewards.push({
            type: "item",
            index: reward.index,
            label: getObjName(reward.index),
            amount: reward.amount,
        });
    }

    return rewards;
}

function buildObjectives(user: any, quest: QuestDefinition, entry?: QuestProgress): QuestObjectiveState[] {
    const objectives: QuestObjectiveState[] = [];

    for (const [index, req] of quest.requiredNpcs.entries()) {
        objectives.push({
            type: "npc",
            index: req.index,
            name: getNpcName(req.index),
            current: Math.min(req.amount, Number(entry?.npcsKilled?.[index] ?? 0)),
            amount: req.amount,
        });
    }

    for (const req of quest.requiredObjs) {
        objectives.push({
            type: "item",
            index: req.index,
            name: getObjName(req.index),
            current: Math.min(req.amount, countItem(user, req.index)),
            amount: req.amount,
        });
    }

    return objectives;
}

function isQuestReady(user: any, quest: QuestDefinition, entry: QuestProgress): boolean {
    return buildObjectives(user, quest, entry).every((objective) => objective.current >= objective.amount);
}

function buildQuestEntryState(
    user: any,
    quest: QuestDefinition,
    status: QuestEntryState["status"],
    options?: { npcId?: unknown; progress?: QuestProgress },
): QuestEntryState {
    return {
        id: quest.id,
        name: quest.name,
        desc: quest.desc,
        status,
        npcId: typeof options?.npcId === "number" ? options.npcId : Number(options?.npcId ?? 0) || undefined,
        requiredLevel: quest.requiredLevel,
        objectives: buildObjectives(user, quest, options?.progress),
        rewards: buildRewards(quest),
    };
}

function getActiveQuestStates(user: any): QuestEntryState[] {
    const progress = getProgress(user);
    const entries: QuestEntryState[] = [];

    for (const entry of progress.quests) {
        const quest = quests.get(entry.questIndex);
        if (!quest) {
            continue;
        }

        entries.push(buildQuestEntryState(user, quest, isQuestReady(user, quest, entry) ? "ready" : "active", { progress: entry }));
    }

    return entries;
}

function sendAreaNpcQuestSnapshot(idUser: string) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return;
    }

    const rangeX = Number(vars.areaVisionRangeX ?? 15);
    const rangeY = Number(vars.areaVisionRangeY ?? 15);
    const visibleNpcs = (Object.values(vars.npcs ?? {}) as any[]).filter((npc) => {
        if (!npc?.pos || Number(npc.map) !== Number(user.map)) {
            return false;
        }

        return Math.abs(Number(npc.pos.x) - Number(user.pos.x)) <= rangeX && Math.abs(Number(npc.pos.y) - Number(user.pos.y)) <= rangeY;
    });

    handleProtocol.areaNpcsSnapshot(visibleNpcs, client);
}

export function sendQuestState(idUser: string, offer?: QuestEntryState | null, completedQuestId?: number) {
    const user = vars.personajes[idUser];
    const client = vars.clients[idUser];
    if (!user || !client) {
        return;
    }

    handleProtocol.questState(
        {
            active: getActiveQuestStates(user),
            offer: offer ?? null,
            completedQuestId,
        },
        client,
    );
}

function getNearbyQuestNpc(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return null;
    }

    const targetId = user.targetNpcId;
    if (targetId && vars.npcs[targetId]) {
        const npc = vars.npcs[targetId];
        if (Number(npc.map) === Number(user.map)) {
            return npc;
        }
    }

    let closest: { npc: any; distance: number } | null = null;
    for (const npc of Object.values(vars.npcs) as any[]) {
        if (!npc || Number(npc.map) !== Number(user.map) || !npc.pos) {
            continue;
        }

        const questNumber = getNpcQuestNumber(npc);
        if (!questNumber) {
            continue;
        }

        const distance = Math.round(Math.hypot(user.pos.x - npc.pos.x, user.pos.y - npc.pos.y));
        if (distance > 5) {
            continue;
        }

        if (!closest || distance < closest.distance) {
            closest = { npc, distance };
        }
    }

    return closest?.npc ?? null;
}

export function getNpcQuestNumber(npc: { templateNpcIndex?: number; questNumber?: number }): number {
    const fromNpc = Number(npc?.questNumber ?? 0);
    if (fromNpc > 0) {
        return fromNpc;
    }

    return questGivers.get(Number(npc?.templateNpcIndex ?? 0)) ?? 0;
}

export function getNpcQuestStatusForUser(idUser: string, npc: { templateNpcIndex?: number; questNumber?: number }): number {
    const user = vars.personajes[idUser];
    if (!user) {
        return 0;
    }

    const questNumber = getNpcQuestNumber(npc);
    const quest = quests.get(questNumber);
    if (!quest) {
        return 0;
    }

    const progress = getProgress(user);
    if (progress.done.includes(questNumber)) {
        return 0;
    }

    const slot = findQuestSlot(progress.quests, questNumber);
    if (slot >= 0) {
        const entry = progress.quests[slot];
        return isQuestReady(user, quest, entry) ? 3 : 2;
    }

    if (Number(user.level ?? 1) < quest.requiredLevel) {
        return 0;
    }

    return 1;
}

export function describeQuest(quest: QuestDefinition): string[] {
    const lines = [`${quest.name}`, quest.desc];

    if (quest.requiredNpcs.length) {
        const names = quest.requiredNpcs.map((req) => {
            const npcName = vars.datNpc?.[req.index]?.name ?? `NPC ${req.index}`;
            return `${req.amount} ${npcName}`;
        });
        lines.push(`Criaturas: ${names.join(", ")}`);
    }

    if (quest.requiredObjs.length) {
        const names = quest.requiredObjs.map((req) => {
            const objName = vars.datObj?.[req.index]?.name ?? `Item ${req.index}`;
            return `${req.amount} ${objName}`;
        });
        lines.push(`Objetos: ${names.join(", ")}`);
    }

    const rewards: string[] = [];
    if (quest.rewardGold) {
        rewards.push(`${quest.rewardGold} oro`);
    }
    if (quest.rewardExp) {
        rewards.push(`${quest.rewardExp} exp`);
    }
    if (quest.rewardPoints) {
        rewards.push(`${quest.rewardPoints} puntos de canje`);
    }
    for (const reward of quest.rewardObjs) {
        const objName = vars.datObj?.[reward.index]?.name ?? `Item ${reward.index}`;
        rewards.push(`${reward.amount} ${objName}`);
    }
    if (rewards.length) {
        lines.push(`Recompensa: ${rewards.join(", ")}`);
    }

    return lines;
}

export function handleQuest(idUser: string) {
    const user = vars.personajes[idUser];
    const npc = getNearbyQuestNpc(idUser);

    if (!user || !npc) {
        tell(idUser, "No hay ningun NPC de mision cerca.");
        return;
    }

    const questNumber = getNpcQuestNumber(npc);
    if (!questNumber) {
        npcTalk(idUser, npc.id, "No tengo ninguna mision para ti.");
        return;
    }

    const quest = quests.get(questNumber);
    if (!quest) {
        npcTalk(idUser, npc.id, "No tengo ninguna mision para ti.");
        return;
    }

    if (Number(user.level ?? 1) < quest.requiredLevel) {
        npcTalk(idUser, npc.id, `Debes ser por lo menos nivel ${quest.requiredLevel} para emprender esta mision.`);
        return;
    }

    const progress = getProgress(user);
    if (progress.done.includes(questNumber)) {
        sendQuestState(idUser, null);
        npcTalk(idUser, npc.id, "Ya has completado esta mision.");
        return;
    }

    const slot = findQuestSlot(progress.quests, questNumber);
    if (slot >= 0) {
        const entry = progress.quests[slot];
        const status = isQuestReady(user, quest, entry) ? "ready" : "active";
        sendQuestState(idUser, buildQuestEntryState(user, quest, status, { npcId: npc.id, progress: entry }));
        if (status === "ready") {
            finishQuest(idUser, questNumber, npc.id);
        } else {
            npcTalk(idUser, npc.id, "Todavia no has completado todos los objetivos de esta mision.");
        }
        return;
    }

    if (progress.quests.length >= MAX_QUESTS) {
        npcTalk(idUser, npc.id, "Estas haciendo demasiadas misiones. Vuelve cuando hayas completado alguna.");
        return;
    }

    progress.lastQuestOffer = questNumber;
    saveProgress(user);
    sendQuestState(idUser, buildQuestEntryState(user, quest, "available", { npcId: npc.id }));
    for (const line of describeQuest(quest)) {
        tell(idUser, line);
    }
    tell(idUser, "Escribe /questaceptar para tomar esta mision.");
}

export function acceptQuest(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    const questNumber = progress.lastQuestOffer;
    const quest = quests.get(questNumber);
    if (!quest) {
        tell(idUser, "No hay una mision ofrecida. Habla con un NPC de mision y usa /quest.");
        return;
    }

    if (findQuestSlot(progress.quests, questNumber) >= 0) {
        tell(idUser, "Ya estas haciendo esa mision.");
        return;
    }

    if (progress.quests.length >= MAX_QUESTS) {
        tell(idUser, "No te quedan espacios de mision.");
        return;
    }

    progress.quests.push({
        questIndex: questNumber,
        npcsKilled: quest.requiredNpcs.map(() => 0),
    });
    progress.lastQuestOffer = 0;
    saveProgress(user);
    sendQuestState(idUser, null);
    sendAreaNpcQuestSnapshot(idUser);
    tell(idUser, `Has aceptado la mision "${quest.name}".`);
}

export function abandonQuest(idUser: string, questNumber: number) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    const progress = getProgress(user);
    const slot = findQuestSlot(progress.quests, questNumber);
    if (slot < 0) {
        tell(idUser, "No estas haciendo esa mision.");
        return;
    }

    const quest = quests.get(questNumber);
    progress.quests.splice(slot, 1);
    saveProgress(user);
    sendQuestState(idUser, null);
    sendAreaNpcQuestSnapshot(idUser);
    tell(idUser, `Abandonaste la mision "${quest?.name ?? questNumber}".`);
}

export function listQuests(idUser: string) {
    const user = vars.personajes[idUser];
    if (!user) {
        return;
    }

    sendQuestState(idUser, null);

    const progress = getProgress(user);
    if (!progress.quests.length) {
        tell(idUser, "No tienes misiones activas. Habla con un NPC de Quest y usa /quest.");
        return;
    }

    for (const entry of progress.quests) {
        const quest = quests.get(entry.questIndex);
        if (!quest) {
            continue;
        }

        const kills = quest.requiredNpcs
            .map((req, index) => {
                const npcName = vars.datNpc?.[req.index]?.name ?? `NPC ${req.index}`;
                return `${npcName} ${entry.npcsKilled[index] ?? 0}/${req.amount}`;
            })
            .join(", ");
        tell(idUser, `[${entry.questIndex}] ${quest.name}${kills ? ` — ${kills}` : ""}`);
    }
}

export function finishQuest(idUser: string, questNumber: number, npcId?: unknown) {
    const user = vars.personajes[idUser];
    const quest = quests.get(questNumber);
    if (!user || !quest) {
        return;
    }

    const progress = getProgress(user);
    const slot = findQuestSlot(progress.quests, questNumber);
    if (slot < 0) {
        return;
    }

    const current = progress.quests[slot];

    for (const req of quest.requiredObjs) {
        if (countItem(user, req.index) < req.amount) {
            sendQuestState(idUser, buildQuestEntryState(user, quest, "active", { npcId, progress: current }));
            npcTalk(idUser, npcId ?? idUser, "No has conseguido todos los objetos que te he pedido.");
            return;
        }
    }

    for (const [index, req] of quest.requiredNpcs.entries()) {
        if ((current.npcsKilled[index] ?? 0) < req.amount) {
            sendQuestState(idUser, buildQuestEntryState(user, quest, "active", { npcId, progress: current }));
            npcTalk(idUser, npcId ?? idUser, "No has matado todas las criaturas que te he pedido.");
            return;
        }
    }

    if (quest.rewardObjs.length > countFreeSlots(user)) {
        sendQuestState(idUser, buildQuestEntryState(user, quest, "ready", { npcId, progress: current }));
        npcTalk(
            idUser,
            npcId ?? idUser,
            "No tienes suficiente espacio en el inventario para recibir la recompensa. Vuelve cuando hayas hecho mas espacio.",
        );
        return;
    }

    for (const req of quest.requiredObjs) {
        removeItems(idUser, req.index, req.amount);
    }

    if (quest.rewardExp) {
        user.exp = Number(user.exp ?? 0) + quest.rewardExp;
        game.checkUserLevel(idUser);
        tell(idUser, `Has ganado ${quest.rewardExp} puntos de experiencia como recompensa.`);
    }

    if (quest.rewardGold) {
        user.gold = Number(user.gold ?? 0) + quest.rewardGold;
        const client = vars.clients[idUser];
        if (client) {
            handleProtocol.actGold(user.gold, client);
        }
        tell(idUser, `Has ganado ${quest.rewardGold} monedas de oro como recompensa.`);
    }

    if (quest.rewardPoints) {
        progress.puntosCanje += quest.rewardPoints;
        user.puntosCanje = progress.puntosCanje;
        tell(idUser, `Has ganado ${quest.rewardPoints} Puntos de Canje como recompensa.`);
    }

    for (const reward of quest.rewardObjs) {
        game.putItemToInv(idUser, reward.index, reward.amount);
        const objName = vars.datObj?.[reward.index]?.name ?? `Item ${reward.index}`;
        tell(idUser, `Has recibido ${reward.amount} ${objName} como recompensa.`);
    }

    progress.quests.splice(slot, 1);
    if (!progress.done.includes(questNumber)) {
        progress.done.push(questNumber);
    }
    saveProgress(user);
    sendQuestState(idUser, null, questNumber);
    sendAreaNpcQuestSnapshot(idUser);
    tell(idUser, `Has completado la mision "${quest.name}"!`);
}

export function onNpcKilled(idUser: string, npcTemplateIndex: number) {
    const user = vars.personajes[idUser];
    if (!user || npcTemplateIndex <= 0) {
        return;
    }

    const progress = getProgress(user);
    let changed = false;

    for (const entry of progress.quests) {
        const quest = quests.get(entry.questIndex);
        if (!quest) {
            continue;
        }

        quest.requiredNpcs.forEach((req, index) => {
            if (req.index !== npcTemplateIndex) {
                return;
            }

            const current = entry.npcsKilled[index] ?? 0;
            if (current >= req.amount) {
                return;
            }

            entry.npcsKilled[index] = current + 1;
            changed = true;
            const npcName = vars.datNpc?.[req.index]?.name ?? `NPC ${req.index}`;
            tell(idUser, `${quest.name}: ${npcName} ${entry.npcsKilled[index]}/${req.amount}`);
        });
    }

    if (changed) {
        saveProgress(user);
        sendQuestState(idUser, null);
        sendAreaNpcQuestSnapshot(idUser);
    }
}

export function initialize() {
    quests.clear();
    for (const quest of Object.values(jsonQuests)) {
        quests.set(Number(quest.id), quest);
    }

    questGivers.clear();
    for (const [npcId, questNumber] of Object.entries(jsonQuestGivers)) {
        questGivers.set(Number(npcId), Number(questNumber));
    }

    console.log(`[Quests] Cargadas ${quests.size} misiones y ${questGivers.size} NPCs entregadores.`);
}
