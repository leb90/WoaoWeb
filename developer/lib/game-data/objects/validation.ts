import { OBJ_TYPE } from "./catalogs";
import type { ObjData } from "./presentation";

export type ValidationIssue = {
  level: "error" | "warning";
  field?: string;
  message: string;
};

function num(data: ObjData, key: string): number {
  const v = data[key];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

export function validateObject(
  data: ObjData,
  opts?: {
    existingIds?: Set<number>;
    currentId?: number;
    isNew?: boolean;
    spellIds?: Set<number>;
    objectIds?: Set<number>;
  },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const name = String(data.name ?? "").trim();
  if (!name) {
    issues.push({ level: "error", field: "name", message: "El nombre es obligatorio." });
  }

  const objType = num(data, "objType");
  if (!Number.isInteger(objType) || objType < 0) {
    issues.push({ level: "error", field: "objType", message: "Tipo de objeto inválido." });
  }

  const grh = num(data, "grhIndex");
  if (grh < 0) {
    issues.push({ level: "error", field: "grhIndex", message: "GRH no puede ser negativo." });
  }
  if (grh === 0) {
    issues.push({ level: "warning", field: "grhIndex", message: "Sin gráfico (GRH 0)." });
  }

  const minHit = num(data, "minHit");
  const maxHit = num(data, "maxHit");
  if (
    (objType === OBJ_TYPE.armas ||
      objType === OBJ_TYPE.flechas ||
      objType === OBJ_TYPE.instrumentosMusicales) &&
    minHit > maxHit
  ) {
    issues.push({
      level: "error",
      field: "minHit",
      message: "Daño mínimo no puede ser mayor que el máximo.",
    });
  }

  const minDef = num(data, "minDef");
  const maxDef = num(data, "maxDef");
  if (
    (objType === OBJ_TYPE.armaduras ||
      objType === OBJ_TYPE.escudos ||
      objType === OBJ_TYPE.cascos) &&
    minDef > maxDef
  ) {
    issues.push({
      level: "error",
      field: "minDef",
      message: "Defensa mínima no puede ser mayor que la máxima.",
    });
  }

  const minDefMag = num(data, "minDefMag");
  const maxDefMag = num(data, "maxDefMag");
  if (minDefMag > maxDefMag) {
    issues.push({
      level: "error",
      field: "minDefMag",
      message: "Defensa mágica mínima > máxima.",
    });
  }

  if (objType === OBJ_TYPE.pociones) {
    const minM = num(data, "minModificador");
    const maxM = num(data, "maxModificador");
    if (minM > maxM) {
      issues.push({
        level: "error",
        field: "minModificador",
        message: "Modificador mínimo > máximo.",
      });
    }
  }

  if (objType === OBJ_TYPE.pergaminos) {
    const spell = num(data, "spellIndex");
    if (spell <= 0) {
      issues.push({
        level: "warning",
        field: "spellIndex",
        message: "Pergamino sin hechizo asociado.",
      });
    } else if (opts?.spellIds && !opts.spellIds.has(spell)) {
      issues.push({
        level: "error",
        field: "spellIndex",
        message: `Hechizo ${spell} no existe.`,
      });
    }
  }

  if (objType === OBJ_TYPE.puerta) {
    const abierta = num(data, "indexAbierta");
    const cerrada = num(data, "indexCerrada");
    if (opts?.objectIds) {
      if (abierta > 0 && !opts.objectIds.has(abierta)) {
        issues.push({
          level: "warning",
          field: "indexAbierta",
          message: `Objeto abierta #${abierta} no existe.`,
        });
      }
      if (cerrada > 0 && !opts.objectIds.has(cerrada)) {
        issues.push({
          level: "warning",
          field: "indexCerrada",
          message: `Objeto cerrada #${cerrada} no existe.`,
        });
      }
    }
  }

  if (opts?.isNew && opts.currentId != null && opts.existingIds?.has(opts.currentId)) {
    issues.push({
      level: "error",
      field: "id",
      message: `El ID ${opts.currentId} ya está en uso.`,
    });
  }

  return issues;
}

export function hasCriticalErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}
