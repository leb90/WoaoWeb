import type {
  QuestData,
  QuestGiverInfo,
  QuestListItem,
  QuestMapLocation,
  QuestRequirement,
} from "./types";

export function isQuestRepeatable(quest: QuestData | null | undefined): boolean {
  return Boolean(quest?.repeatable);
}

export function formatCompactNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) {
    const m = n / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (abs >= 10_000) {
    const k = n / 1_000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return n.toLocaleString("es-AR");
}

export function formatRewardsLabel(quest: {
  rewardGold?: number;
  rewardExp?: number;
  rewardPoints?: number;
  rewardObjs?: QuestRequirement[];
}): string {
  const parts: string[] = [];
  if (quest.rewardGold) parts.push(`${formatCompactNumber(quest.rewardGold)} oro`);
  if (quest.rewardExp) parts.push(`${formatCompactNumber(quest.rewardExp)} EXP`);
  if (quest.rewardPoints) parts.push(`${quest.rewardPoints} puntos`);
  const objs = quest.rewardObjs ?? [];
  if (objs.length) parts.push(`${objs.length} obj.`);
  return parts.length ? parts.join(" · ") : "Sin recompensas";
}

export function formatObjectivesLabel(
  requiredNpcs: QuestRequirement[],
  nameOf: (id: number) => string,
): string {
  if (!requiredNpcs.length) return "Sin objetivos NPC";
  return requiredNpcs
    .map((r) => `${nameOf(r.index)} x${r.amount}`)
    .join(" + ");
}

export function emptyQuest(id: number, partial?: Partial<QuestData>): QuestData {
  const base: QuestData = {
    id,
    name: "",
    desc: "",
    requiredLevel: 1,
    repeatable: false,
    requiredNpcs: [],
    requiredObjs: [],
    rewardGold: 0,
    rewardExp: 0,
    rewardPoints: 0,
    rewardObjs: [],
  };
  return {
    ...base,
    ...partial,
    id,
    requiredLevel: 1,
  };
}

export function normalizeQuestForEditor(raw: QuestData): QuestData {
  return {
    ...structuredClone(raw),
    id: Number(raw.id),
    name: String(raw.name ?? ""),
    desc: String(raw.desc ?? ""),
    requiredLevel: Number(raw.requiredLevel ?? 1),
    repeatable: isQuestRepeatable(raw),
    requiredNpcs: Array.isArray(raw.requiredNpcs)
      ? raw.requiredNpcs.map((r) => ({
          index: Number(r.index),
          amount: Number(r.amount),
        }))
      : [],
    requiredObjs: Array.isArray(raw.requiredObjs)
      ? raw.requiredObjs.map((r) => ({
          index: Number(r.index),
          amount: Number(r.amount),
        }))
      : [],
    rewardGold: Number(raw.rewardGold ?? 0),
    rewardExp: Number(raw.rewardExp ?? 0),
    rewardPoints: Number(raw.rewardPoints ?? 0),
    rewardObjs: Array.isArray(raw.rewardObjs)
      ? raw.rewardObjs.map((r) => ({
          index: Number(r.index),
          amount: Number(r.amount),
        }))
      : [],
  };
}

export function toPersistedQuest(
  editor: QuestData,
  previous?: QuestData | null,
  opts?: { forceRequiredLevel1?: boolean },
): QuestData {
  const base = previous ? structuredClone(previous) : {};
  const requiredLevel = opts?.forceRequiredLevel1
    ? 1
    : Number(previous?.requiredLevel ?? editor.requiredLevel ?? 1);

  const out: QuestData = {
    ...(base as QuestData),
    id: Number(editor.id),
    name: String(editor.name ?? "").trim(),
    desc: String(editor.desc ?? ""),
    requiredLevel,
    repeatable: Boolean(editor.repeatable),
    requiredNpcs: (editor.requiredNpcs ?? []).map((r) => ({
      index: Number(r.index),
      amount: Number(r.amount),
    })),
    requiredObjs: (editor.requiredObjs ?? []).map((r) => ({
      index: Number(r.index),
      amount: Number(r.amount),
    })),
    rewardGold: Math.max(0, Number(editor.rewardGold ?? 0)),
    rewardExp: Math.max(0, Number(editor.rewardExp ?? 0)),
    rewardPoints: Math.max(0, Number(editor.rewardPoints ?? 0)),
    rewardObjs: (editor.rewardObjs ?? []).map((r) => ({
      index: Number(r.index),
      amount: Number(r.amount),
    })),
  };
  return out;
}

export function buildListItem(
  quest: QuestData,
  givers: QuestGiverInfo[],
  locations: QuestMapLocation[],
  nameOfNpc: (id: number) => string,
): QuestListItem {
  return {
    id: Number(quest.id),
    name: String(quest.name ?? ""),
    desc: String(quest.desc ?? ""),
    repeatable: isQuestRepeatable(quest),
    requiredLevel: Number(quest.requiredLevel ?? 1),
    objectivesLabel: formatObjectivesLabel(quest.requiredNpcs ?? [], nameOfNpc),
    rewardsLabel: formatRewardsLabel(quest),
    giver: givers[0] ?? null,
    givers,
    locations,
    requiredNpcs: quest.requiredNpcs ?? [],
    requiredObjs: quest.requiredObjs ?? [],
    rewardGold: Number(quest.rewardGold ?? 0),
    rewardExp: Number(quest.rewardExp ?? 0),
    rewardPoints: Number(quest.rewardPoints ?? 0),
    rewardObjs: quest.rewardObjs ?? [],
  };
}
