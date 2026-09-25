import type { SpellData } from "./presentation";
import { isSummonSpell } from "./presentation";

export type ValidationIssue = {
  level: "error" | "warning";
  field?: string;
  message: string;
};

function num(d: SpellData, k: string): number {
  const v = d[k];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

export function validateSpell(
  data: SpellData,
  opts?: {
    isNew?: boolean;
    currentId?: number;
    existingIds?: Set<number>;
    fxIds?: Set<number>;
    npcIds?: Set<number>;
  },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!String(data.name ?? "").trim()) {
    issues.push({ level: "error", field: "name", message: "El nombre es obligatorio." });
  }
  if (num(data, "manaRequired") < 0) {
    issues.push({ level: "error", field: "manaRequired", message: "Mana < 0." });
  }
  if (num(data, "minSkill") < 0) {
    issues.push({ level: "error", field: "minSkill", message: "Skill < 0." });
  }
  if (num(data, "minHp") > num(data, "maxHp")) {
    issues.push({ level: "error", field: "minHp", message: "minHp > maxHp." });
  }
  if (num(data, "minMana") > num(data, "maxMana")) {
    issues.push({ level: "error", field: "minMana", message: "minMana > maxMana." });
  }
  for (const pair of [
    ["minAg", "maxAg"],
    ["minFz", "maxFz"],
    ["minHam", "maxHam"],
    ["minSed", "maxSed"],
  ] as const) {
    if (num(data, pair[0]) > num(data, pair[1])) {
      issues.push({
        level: "error",
        field: pair[0],
        message: `${pair[0]} > ${pair[1]}.`,
      });
    }
  }

  const subeHp = num(data, "subeHp");
  if (subeHp > 0 && num(data, "maxHp") <= 0) {
    issues.push({
      level: "warning",
      field: "maxHp",
      message: "subeHp activo pero maxHp es 0.",
    });
  }

  const fx = num(data, "fxGrh");
  if (fx > 0 && opts?.fxIds && !opts.fxIds.has(fx)) {
    issues.push({
      level: "error",
      field: "fxGrh",
      message: `FX ${fx} no existe en fxs.json.`,
    });
  }

  if (isSummonSpell(data)) {
    const npc = num(data, "numNpc");
    if (npc <= 0) {
      issues.push({
        level: "error",
        field: "numNpc",
        message: "Invocación sin numNpc.",
      });
    } else if (opts?.npcIds && !opts.npcIds.has(npc)) {
      issues.push({
        level: "warning",
        field: "numNpc",
        message: `NPC ${npc} no está en npcs.json.`,
      });
    }
  }

  if (opts?.isNew && opts.currentId != null && opts.existingIds?.has(opts.currentId)) {
    issues.push({
      level: "error",
      field: "id",
      message: `ID ${opts.currentId} ya existe.`,
    });
  }

  return issues;
}

export function hasCriticalErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}
