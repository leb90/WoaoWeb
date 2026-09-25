import {
  ALL_CLASS_IDS,
  GAME_CLASSES,
  OBJ_TYPE,
  getObjectTypeMeta,
  getPotionTypeLabel,
  flagToBool,
} from "./catalogs";

export type ObjData = Record<string, unknown>;

export type ObjectPresentation = {
  typeLabel: string;
  typeIcon: string;
  badgeTone: string;
  filterGroup: string;
  summary: string;
  importantStats: Array<{ label: string; value: string }>;
};

function num(data: ObjData, key: string): number {
  const v = data[key];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

function str(data: ObjData, key: string): string {
  return String(data[key] ?? "");
}

/** Effective equip kind considering armadura subtipos (itemKinds). */
export function getEffectiveEquipKind(data: ObjData): string {
  const t = num(data, "objType");
  const sub = num(data, "subtipo");
  if (t === OBJ_TYPE.armaduras) {
    if (sub === 1) return "casco";
    if (sub === 2) return "escudo";
    return "armadura";
  }
  return getObjectTypeMeta(t).key;
}

export function getObjectSummary(data: ObjData): string {
  const t = num(data, "objType");
  const minHit = num(data, "minHit");
  const maxHit = num(data, "maxHit");
  const minDef = num(data, "minDef");
  const maxDef = num(data, "maxDef");
  const minDefMag = num(data, "minDefMag");
  const maxDefMag = num(data, "maxDefMag");

  switch (t) {
    case OBJ_TYPE.armas:
    case OBJ_TYPE.flechas:
    case OBJ_TYPE.instrumentosMusicales:
      if (minHit || maxHit) return `Daño ${minHit} - ${maxHit}`;
      return "—";
    case OBJ_TYPE.armaduras:
    case OBJ_TYPE.escudos:
    case OBJ_TYPE.cascos: {
      const parts: string[] = [];
      if (minDef || maxDef) parts.push(`Def ${minDef}-${maxDef}`);
      if (minDefMag || maxDefMag) parts.push(`Mag ${minDefMag}-${maxDefMag}`);
      return parts.length ? parts.join(" · ") : "—";
    }
    case OBJ_TYPE.anillos: {
      const res = num(data, "resistenciaMagica");
      if (res) return `Resist. mágica ${res}`;
      if (minDefMag || maxDefMag) return `Def mag ${minDefMag}-${maxDefMag}`;
      return "Accesorio";
    }
    case OBJ_TYPE.pociones: {
      const tipo = num(data, "tipoPocion");
      const minM = num(data, "minModificador");
      const maxM = num(data, "maxModificador");
      const pct = num(data, "porcentaje");
      const label = getPotionTypeLabel(tipo);
      if (pct) return `${label} ${pct}%`;
      if (minM || maxM) return `${label} ${minM} - ${maxM}`;
      return label;
    }
    case OBJ_TYPE.comida: {
      const a = num(data, "minHam");
      const b = num(data, "maxHam");
      if (a || b) return `Hambre ${a} - ${b}`;
      return "Comida";
    }
    case OBJ_TYPE.bebidas: {
      const a = num(data, "minSed") || num(data, "minAgu");
      const b = num(data, "maxSed");
      if (a || b) return `Sed ${a} - ${b}`;
      return "Bebida";
    }
    case OBJ_TYPE.puerta: {
      // Runtime uses index pair; cerrada is stored but not read in openDoor.
      const abierta = num(data, "indexAbierta");
      const cerrada = num(data, "indexCerrada");
      if (abierta || cerrada) {
        return num(data, "llave")
          ? "Puerta (con llave)"
          : "Puerta (sin llave)";
      }
      return "Puerta";
    }
    case OBJ_TYPE.objetoContenedor:
      return "Contenedor";
    case OBJ_TYPE.carteles:
      return "Cartel / Informativo";
    case OBJ_TYPE.dinero:
      return "Moneda / Currency";
    case OBJ_TYPE.pergaminos: {
      const sp = num(data, "spellIndex");
      return sp ? `Hechizo #${sp}` : "Pergamino";
    }
    case OBJ_TYPE.muebles:
    case OBJ_TYPE.manchas:
    case OBJ_TYPE.flores:
      return "Decorativo / Escenario";
    default:
      return "—";
  }
}

export function getObjectPresentation(data: ObjData): ObjectPresentation {
  const t = num(data, "objType");
  const meta = getObjectTypeMeta(t);
  const summary = getObjectSummary(data);
  const importantStats: Array<{ label: string; value: string }> = [
    { label: "Nombre", value: str(data, "name") || "—" },
    { label: "Tipo", value: meta.label },
    { label: "Valor", value: String(num(data, "valor")) },
    { label: "GRH", value: String(num(data, "grhIndex")) },
    { label: "Anim", value: String(num(data, "anim")) },
  ];
  if (num(data, "subtipo")) {
    importantStats.push({ label: "Subtipo", value: String(num(data, "subtipo")) });
  }
  if (summary !== "—") {
    importantStats.push({ label: "Resumen", value: summary });
  }
  return {
    typeLabel: meta.label,
    typeIcon: meta.icon,
    badgeTone: meta.badgeTone,
    filterGroup: meta.filterGroup,
    summary,
    importantStats,
  };
}

export function getAllowedClassIds(data: ObjData): number[] {
  const blocked = Array.isArray(data.clasesNoPermitidas)
    ? (data.clasesNoPermitidas as unknown[])
        .map((n) => Number(n))
        .filter((n) => Number.isInteger(n) && n > 0)
    : [];
  const blockedSet = new Set(blocked);
  return ALL_CLASS_IDS.filter((id) => !blockedSet.has(id));
}

export function allowedClassesToBlocked(allowedIds: number[]): number[] {
  const allowed = new Set(allowedIds);
  return ALL_CLASS_IDS.filter((id) => !allowed.has(id));
}

export function getClassCategoryLabel(
  category: (typeof GAME_CLASSES)[number]["category"],
): string {
  switch (category) {
    case "combat":
      return "Combatientes";
    case "magic":
      return "Mágicas";
    case "worker":
      return "Trabajadores";
  }
}

/** Keys the UI may edit for a given type — everything else is preserved as-is. */
export function getKnownEditorKeys(objType: number): Set<string> {
  const base = [
    "name",
    "objType",
    "grhIndex",
    "valor",
    "anim",
    "subtipo",
    "clasesNoPermitidas",
    "newbie",
    "agarrable",
    "noSeCae",
    "objetoEspecial",
    "razaEnana",
    "abriga",
    "mataHobbits",
  ];
  const combat = [
    "minHit",
    "maxHit",
    "minDef",
    "maxDef",
    "minDefMag",
    "maxDefMag",
    "resistenciaMagica",
    "apu",
    "proyectil",
    "porcentaje",
    "staffDamageBonus",
    "magicDamageBonus",
    "magicDamagePercent",
    "magicPenetration",
  ];
  const potion = ["tipoPocion", "minModificador", "maxModificador", "porcentaje", "spellIndex"];
  const door = ["indexAbierta", "indexCerrada", "llave", "cerrada"];
  const food = ["minHam", "maxHam"];
  const drink = ["minAgu", "minSed", "maxSed"];
  const scroll = ["spellIndex"];

  const keys = new Set(base);
  const add = (arr: string[]) => arr.forEach((k) => keys.add(k));

  switch (objType) {
    case OBJ_TYPE.armas:
    case OBJ_TYPE.flechas:
    case OBJ_TYPE.instrumentosMusicales:
      add(combat);
      break;
    case OBJ_TYPE.armaduras:
    case OBJ_TYPE.escudos:
    case OBJ_TYPE.cascos:
    case OBJ_TYPE.anillos:
      add(combat);
      break;
    case OBJ_TYPE.pociones:
      add(potion);
      break;
    case OBJ_TYPE.puerta:
    case OBJ_TYPE.objetoContenedor:
      add(door);
      break;
    case OBJ_TYPE.comida:
      add(food);
      break;
    case OBJ_TYPE.bebidas:
      add(drink);
      break;
    case OBJ_TYPE.pergaminos:
      add(scroll);
      break;
    default:
      add(combat);
      add(potion);
      add(door);
      add(food);
      add(drink);
      break;
  }
  return keys;
}

export function listUnknownKeys(data: ObjData): string[] {
  const known = getKnownEditorKeys(num(data, "objType"));
  // Always treat common extras as known for "unknown" warning purposes
  const alwaysOk = new Set([
    ...known,
    "minSkill",
    "travelTicketDestination",
    "crafting",
    "desc",
    "texto",
    "msg",
  ]);
  return Object.keys(data).filter((k) => !alwaysOk.has(k));
}

export { flagToBool };
