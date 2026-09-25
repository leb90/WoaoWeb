import type { QuestData, QuestRequirement } from "./types";

export type QuestValidationIssue = {
  level: "error" | "warning";
  field?: string;
  message: string;
};

function validReqs(
  list: QuestRequirement[] | undefined,
  label: string,
  exists: (id: number) => boolean,
  issues: QuestValidationIssue[],
) {
  const seen = new Set<number>();
  for (const [i, req] of (list ?? []).entries()) {
    const index = Number(req.index);
    const amount = Number(req.amount);
    if (!Number.isInteger(index) || index <= 0) {
      issues.push({
        level: "error",
        field: label,
        message: `${label}[${i}]: index inválido`,
      });
      continue;
    }
    if (!exists(index)) {
      issues.push({
        level: "error",
        field: label,
        message: `${label}[${i}]: ID ${index} no existe`,
      });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      issues.push({
        level: "error",
        field: label,
        message: `${label}[${i}]: amount debe ser entero > 0`,
      });
    }
    if (seen.has(index)) {
      issues.push({
        level: "error",
        field: label,
        message: `${label}: índice ${index} duplicado`,
      });
    }
    seen.add(index);
  }
}

export function validateQuest(
  quest: QuestData,
  opts: {
    key?: string;
    isNew?: boolean;
    npcExists: (id: number) => boolean;
    objExists: (id: number) => boolean;
    existingIds?: Set<number>;
  },
): QuestValidationIssue[] {
  const issues: QuestValidationIssue[] = [];
  const id = Number(quest.id);

  if (!Number.isInteger(id) || id <= 0) {
    issues.push({ level: "error", field: "id", message: "ID inválido" });
  }
  if (opts.key != null && String(opts.key) !== String(id)) {
    issues.push({
      level: "error",
      field: "id",
      message: `La key "${opts.key}" debe coincidir con id ${id}`,
    });
  }
  if (opts.isNew && opts.existingIds?.has(id)) {
    issues.push({ level: "error", field: "id", message: `ID ${id} ya existe` });
  }
  if (!String(quest.name ?? "").trim()) {
    issues.push({ level: "error", field: "name", message: "Nombre vacío" });
  }
  if (quest.requiredLevel == null || Number.isNaN(Number(quest.requiredLevel))) {
    issues.push({
      level: "error",
      field: "requiredLevel",
      message: "requiredLevel debe existir",
    });
  }
  if (opts.isNew && Number(quest.requiredLevel) !== 1) {
    issues.push({
      level: "error",
      field: "requiredLevel",
      message: "Quests nuevas deben tener requiredLevel = 1",
    });
  }
  if (typeof quest.repeatable !== "boolean") {
    issues.push({
      level: "error",
      field: "repeatable",
      message: "repeatable debe ser boolean",
    });
  }
  for (const field of ["rewardGold", "rewardExp", "rewardPoints"] as const) {
    const v = Number(quest[field] ?? 0);
    if (!Number.isFinite(v) || v < 0) {
      issues.push({
        level: "error",
        field,
        message: `${field} debe ser >= 0`,
      });
    }
  }

  validReqs(quest.requiredNpcs, "requiredNpcs", opts.npcExists, issues);
  validReqs(quest.requiredObjs, "requiredObjs", opts.objExists, issues);
  validReqs(quest.rewardObjs, "rewardObjs", opts.objExists, issues);

  return issues;
}

export function hasCriticalErrors(issues: QuestValidationIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}
