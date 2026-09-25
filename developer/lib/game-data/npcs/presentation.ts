import {
  NPC_TYPE,
  flagToBool,
  getMovementLabel,
  getNpcTypeMeta,
} from "./catalogs";

export type NpcData = Record<string, unknown>;

export type FilterGroup =
  | "all"
  | "comerciantes"
  | "ciudadanos"
  | "guardias"
  | "monstruos"
  | "monturas"
  | "especiales"
  | "comunes";

function num(d: NpcData, k: string): number {
  const v = d[k];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

function arr(d: NpcData, k: string): unknown[] {
  return Array.isArray(d[k]) ? (d[k] as unknown[]) : [];
}

export function isEffectiveMerchant(d: NpcData): boolean {
  return (
    num(d, "npcType") === NPC_TYPE.comerciante ||
    flagToBool(d.comercia) ||
    arr(d, "objs").length > 0
  );
}

export function getNpcFilterGroup(d: NpcData): FilterGroup {
  const t = num(d, "npcType");
  if (t === NPC_TYPE.montura) return "monturas";
  if (isEffectiveMerchant(d)) return "comerciantes";
  if (t === NPC_TYPE.guardia || t === NPC_TYPE.guardiaCaos) return "guardias";
  if (
    t === NPC_TYPE.sacerdote ||
    t === NPC_TYPE.entrenador ||
    t === NPC_TYPE.banquero ||
    t === NPC_TYPE.noble ||
    t === NPC_TYPE.timbero ||
    t === NPC_TYPE.sacerdoteNewbie
  ) {
    return "ciudadanos";
  }
  if (
    t === NPC_TYPE.dragon ||
    (t === NPC_TYPE.comun &&
      (flagToBool(d.hostile) || num(d, "movement") === 3 || num(d, "exp") > 0))
  ) {
    return "monstruos";
  }
  if (
    t === NPC_TYPE.viajero ||
    t === NPC_TYPE.crafter ||
    t === NPC_TYPE.subastador ||
    t === NPC_TYPE.reyCastillo ||
    t === NPC_TYPE.defensorFortaleza ||
    t === NPC_TYPE.ettinCastillo ||
    t === NPC_TYPE.puertaCastillo ||
    !NPC_TYPE_KNOWN.has(t)
  ) {
    return "especiales";
  }
  if (t === NPC_TYPE.comun) return "comunes";
  return "especiales";
}

const NPC_TYPE_KNOWN = new Set([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 33, 43, 45, 60, 61, 77, 78,
]);

export type NpcTabId =
  | "commerce"
  | "drops"
  | "dialogue"
  | "attributes"
  | "spells"
  | "appearance"
  | "advanced";

export function getNpcTabs(d: NpcData): NpcTabId[] {
  const t = num(d, "npcType");
  const group = getNpcFilterGroup(d);
  const tabs: NpcTabId[] = [];

  if (isEffectiveMerchant(d) || t === NPC_TYPE.comerciante) {
    tabs.push("commerce");
  }

  if (group === "monstruos") {
    tabs.push("attributes", "drops", "spells", "dialogue", "appearance", "advanced");
  } else if (group === "guardias") {
    tabs.push("attributes", "dialogue", "drops", "spells", "appearance", "advanced");
  } else if (group === "comerciantes") {
    tabs.push("dialogue", "appearance", "attributes", "drops", "spells", "advanced");
  } else if (group === "ciudadanos") {
    tabs.push("dialogue");
    if (
      t === NPC_TYPE.sacerdote ||
      t === NPC_TYPE.sacerdoteNewbie ||
      arr(d, "spells").length > 0
    ) {
      tabs.push("spells");
    }
    tabs.push("appearance", "attributes", "drops", "advanced");
  } else {
    tabs.push("dialogue", "attributes", "drops", "spells", "appearance", "advanced");
  }

  return [...new Set(tabs)];
}

/** Attribute fields relevant for this NPC (UI only; all keys still stored). */
export function getRelevantAttributeKeys(d: NpcData): string[] {
  const group = getNpcFilterGroup(d);
  const combat = [
    "hp",
    "maxHp",
    "exp",
    "gold",
    "minHit",
    "maxHit",
    "def",
    "poderAtaque",
    "poderEvasion",
    "magicResistance",
    "magicDef",
    "defM",
  ];
  if (group === "monstruos" || group === "guardias") return combat;
  if (group === "comerciantes" || group === "ciudadanos") {
    return ["hp", "maxHp"];
  }
  return combat;
}

export function getNpcPresentation(d: NpcData) {
  const meta = getNpcTypeMeta(num(d, "npcType"));
  const minHit = num(d, "minHit");
  const maxHit = num(d, "maxHit");
  const summaryParts: string[] = [];
  if (flagToBool(d.hostile)) summaryParts.push("Hostil");
  else summaryParts.push("Pacífico");
  if (isEffectiveMerchant(d)) summaryParts.push(`Shop ${arr(d, "objs").length}`);
  if (arr(d, "drop").length) summaryParts.push(`Drops ${arr(d, "drop").length}`);
  if (minHit || maxHit) summaryParts.push(`Daño ${minHit}-${maxHit}`);
  return {
    typeLabel: meta.label,
    typeIcon: meta.icon,
    badgeTone: meta.badgeTone,
    filterGroup: getNpcFilterGroup(d),
    summary: summaryParts.join(" · ") || "—",
    movementLabel: getMovementLabel(num(d, "movement")),
    shopCount: arr(d, "objs").length,
    dropCount: arr(d, "drop").length,
    spellCount: arr(d, "spells").length,
  };
}

export type ShopEntry = { item: number; cant: number };
export type DropEntry = { item: number; cant: number; chancePercent?: number };
export type SpellEntry = { idSpell: number; cooldownSeconds?: number };

export function normalizeShop(d: NpcData): ShopEntry[] {
  return arr(d, "objs")
    .map((e) => {
      const o = e as Record<string, unknown>;
      return { item: Number(o.item ?? 0), cant: Number(o.cant ?? 1) };
    })
    .filter((e) => e.item > 0);
}

export function normalizeDrops(d: NpcData): DropEntry[] {
  return arr(d, "drop")
    .map((e) => {
      const o = e as Record<string, unknown>;
      const chance =
        o.chancePercent ?? o.chance ?? o.probabilityPercent ?? o.probabilidad;
      return {
        item: Number(o.item ?? 0),
        cant: Number(o.cant ?? 1),
        ...(chance != null && Number.isFinite(Number(chance))
          ? { chancePercent: Number(chance) }
          : {}),
      };
    })
    .filter((e) => e.item > 0);
}

export function normalizeSpells(d: NpcData): SpellEntry[] {
  return arr(d, "spells")
    .map((e) => {
      const o = e as Record<string, unknown>;
      const entry: SpellEntry = { idSpell: Number(o.idSpell ?? 0) };
      if (o.cooldownSeconds != null) {
        entry.cooldownSeconds = Number(o.cooldownSeconds);
      }
      return entry;
    })
    .filter((e) => e.idSpell > 0);
}
