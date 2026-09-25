import type { NpcData } from "./presentation";
import { normalizeDrops, normalizeShop, normalizeSpells } from "./presentation";

export type ValidationIssue = {
  level: "error" | "warning";
  field?: string;
  message: string;
};

function num(d: NpcData, k: string): number {
  const v = d[k];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

export function validateNpc(
  data: NpcData,
  opts?: {
    isNew?: boolean;
    currentId?: number;
    existingIds?: Set<number>;
    objectIds?: Set<number>;
    spellIds?: Set<number>;
    bodyIds?: Set<number>;
    headIds?: Set<number>;
  },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!String(data.name ?? "").trim()) {
    issues.push({ level: "error", field: "name", message: "El nombre es obligatorio." });
  }
  if (num(data, "npcType") < 0) {
    issues.push({ level: "error", field: "npcType", message: "Tipo inválido." });
  }
  const body = num(data, "idBody");
  if (body <= 0) {
    issues.push({ level: "warning", field: "idBody", message: "Sin body." });
  } else if (opts?.bodyIds && !opts.bodyIds.has(body)) {
    issues.push({ level: "warning", field: "idBody", message: `Body ${body} no está en bodies.json.` });
  }
  const head = num(data, "idHead");
  if (head > 0 && opts?.headIds && !opts.headIds.has(head)) {
    issues.push({ level: "warning", field: "idHead", message: `Head ${head} no está en heads.json.` });
  }
  if (num(data, "minHit") > num(data, "maxHit")) {
    issues.push({ level: "error", field: "minHit", message: "Daño mínimo > máximo." });
  }
  const hp = num(data, "hp");
  const maxHp = num(data, "maxHp");
  if (maxHp > 0 && hp > maxHp) {
    issues.push({ level: "warning", field: "hp", message: "HP mayor que maxHp." });
  }

  for (const e of normalizeShop(data)) {
    if (opts?.objectIds && !opts.objectIds.has(e.item)) {
      issues.push({
        level: "error",
        field: "objs",
        message: `Comercio: objeto ${e.item} no existe.`,
      });
    }
    if (e.cant < 1) {
      issues.push({ level: "error", field: "objs", message: "Cantidad de comercio < 1." });
    }
  }
  for (const e of normalizeDrops(data)) {
    if (opts?.objectIds && !opts.objectIds.has(e.item)) {
      issues.push({
        level: "error",
        field: "drop",
        message: `Drop: objeto ${e.item} no existe.`,
      });
    }
    if (e.chancePercent != null && (e.chancePercent < 0 || e.chancePercent > 100)) {
      issues.push({
        level: "error",
        field: "drop",
        message: "Probabilidad de drop fuera de 0–100.",
      });
    }
  }
  for (const e of normalizeSpells(data)) {
    if (opts?.spellIds && !opts.spellIds.has(e.idSpell)) {
      issues.push({
        level: "error",
        field: "spells",
        message: `Hechizo ${e.idSpell} no existe.`,
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
