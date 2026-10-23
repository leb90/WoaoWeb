// Panel de aggro: a cada jugador le manda qué criaturas lo tienen de objetivo (nombre, vida y dibujo para
// el ícono). No hay un único evento de "ganó / perdió aggro" en npcs.ts, así que se arma la lista cada
// AGGRO_TICK_MS y se manda solo cuando cambia.
export {};

import type { EntityId } from "./types/runtime";

const vars = require("./vars");
const worldLayout = require("./worldLayout") as { isNeighborMap: (viewerMap: number, targetMap: number) => boolean };

const AGGRO_TICK_MS = 400;
const MAX_ENTRIES = 8;

export type AggroEntry = {
    id: number;
    name: string;
    hp: number;
    maxHp: number;
    body: number;
    head: number;
};

type NpcLike = {
    id?: EntityId;
    nameCharacter?: string;
    name?: string;
    hp?: number;
    maxHp?: number;
    idBody?: number;
    idHead?: number;
    map?: number;
    movement?: number;
    leashState?: string;
    summonedByUserId?: EntityId;
    currentTargetId?: EntityId;
};

let lastTickAt = 0;
const lastSignatureByUser = new Map<string, string>();

function buildAggroLists(): Map<string, AggroEntry[]> {
    const lists = new Map<string, AggroEntry[]>();
    for (const [rawId, rawNpc] of Object.entries(vars.npcs ?? {})) {
        const npc = rawNpc as NpcLike | undefined;
        if (!npc || npc.summonedByUserId || Number(npc.movement) !== 3 || Number(npc.hp ?? 0) <= 0) continue;
        if (npc.leashState === "returning" || npc.currentTargetId === undefined || npc.currentTargetId === null) continue;
        const targetId = String(npc.currentTargetId);
        const user = vars.personajes?.[targetId] as { dead?: boolean; map?: number } | undefined;
        if (!user || user.dead) continue;
        // Si el área del NPC quedó vacía, deja de pensar sin limpiar el objetivo: no cuenta como aggro.
        const area = (vars.areaNpc?.[npc.id ?? rawId] ?? []) as EntityId[];
        if (!area.some((id) => String(id) === targetId)) continue;
        if (!worldLayout.isNeighborMap(Number(user.map), Number(npc.map))) continue;
        const entry: AggroEntry = {
            id: Number(npc.id ?? rawId),
            name: String(npc.nameCharacter ?? npc.name ?? "Criatura"),
            hp: Math.max(0, Math.floor(Number(npc.hp ?? 0))),
            maxHp: Math.max(1, Math.floor(Number(npc.maxHp ?? npc.hp ?? 1))),
            body: Number(npc.idBody ?? 0),
            head: Number(npc.idHead ?? 0),
        };
        if (!lists.has(targetId)) lists.set(targetId, []);
        lists.get(targetId)!.push(entry);
    }
    return lists;
}

export function tickAggroState(now: number) {
    if (now - lastTickAt < AGGRO_TICK_MS) return;
    lastTickAt = now;
    const handleProtocol = require("./handleProtocol");
    const lists = buildAggroLists();
    const online = new Set(Object.keys(vars.personajes ?? {}));

    for (const userId of new Set([...lists.keys(), ...lastSignatureByUser.keys()])) {
        if (!online.has(userId)) {
            lastSignatureByUser.delete(userId);
            continue;
        }
        const entries = (lists.get(userId) ?? []).sort((a, b) => a.id - b.id).slice(0, MAX_ENTRIES);
        const signature = entries.map((entry) => `${entry.id}:${entry.hp}:${entry.maxHp}`).join("|");
        if (lastSignatureByUser.get(userId) === signature) continue;
        const client = vars.clients?.[userId];
        if (!client) continue;
        if (signature) lastSignatureByUser.set(userId, signature);
        else lastSignatureByUser.delete(userId);
        handleProtocol.aggroState({ npcs: entries, total: (lists.get(userId) ?? []).length }, client);
    }
}

module.exports = { tickAggroState };
