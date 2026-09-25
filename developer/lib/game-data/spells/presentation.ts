import {
  flagToBool,
  getSpellTargetMeta,
  getSpellTypeMeta,
  getSubeHpLabel,
} from "./catalogs";

export type SpellData = Record<string, unknown>;

export type SpellCategory =
  | "all"
  | "damage"
  | "heal"
  | "support"
  | "control"
  | "summon"
  | "other";

function num(d: SpellData, k: string): number {
  const v = d[k];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

export function isSummonSpell(d: SpellData): boolean {
  return num(d, "type") === 4 || flagToBool(d.invoca) || num(d, "numNpc") > 0;
}

/** Mirrors game.ts isSupportSpell (subset used for presentation). */
export function isSupportSpell(d: SpellData): boolean {
  return Boolean(
    num(d, "subeHp") === 1 ||
      flagToBool(d.revivir) ||
      flagToBool(d.removerParalisis) ||
      flagToBool(d.invisibilidad) ||
      flagToBool(d.curaVeneno) ||
      num(d, "subeAg") === 1 ||
      num(d, "subeFz") === 1 ||
      num(d, "subeMana") === 1 ||
      num(d, "subeHam") === 1 ||
      num(d, "subeSed") === 1 ||
      num(d, "protec") > 0,
  );
}

export function isOffensiveSpell(d: SpellData): boolean {
  const subeHp = num(d, "subeHp");
  return Boolean(
    flagToBool(d.paraliza) ||
      flagToBool(d.inmoviliza) ||
      flagToBool(d.paralizaarea) ||
      num(d, "envenena") > 0 ||
      flagToBool(d.ceguera) ||
      flagToBool(d.estupidez) ||
      subeHp === 2 ||
      subeHp === 3 ||
      subeHp === 4 ||
      num(d, "subeAg") === 2 ||
      num(d, "subeFz") === 2 ||
      num(d, "subeHam") === 2 ||
      num(d, "subeSed") === 2 ||
      num(d, "subeMana") === 2,
  );
}

export function getSpellCategory(d: SpellData): Exclude<SpellCategory, "all"> {
  if (isSummonSpell(d)) return "summon";
  const subeHp = num(d, "subeHp");
  if (subeHp === 2 || subeHp === 3 || subeHp === 4) return "damage";
  if (subeHp === 1 || flagToBool(d.curaVeneno) || flagToBool(d.revivir)) {
    return "heal";
  }
  if (
    flagToBool(d.paraliza) ||
      flagToBool(d.inmoviliza) ||
      flagToBool(d.paralizaarea) ||
      flagToBool(d.ceguera) ||
      flagToBool(d.estupidez) ||
      num(d, "envenena") > 0
  ) {
    return "control";
  }
  if (isSupportSpell(d)) return "support";
  return "other";
}

export type SpellBadgeTone =
  | "damage"
  | "heal"
  | "support"
  | "control"
  | "summon"
  | "other";

const CATEGORY_META: Record<
  Exclude<SpellCategory, "all">,
  { label: string; icon: string; tone: SpellBadgeTone }
> = {
  damage: { label: "Daño", icon: "🔥", tone: "damage" },
  heal: { label: "Curación", icon: "✚", tone: "heal" },
  support: { label: "Soporte", icon: "🛡", tone: "support" },
  control: { label: "Control", icon: "⏸", tone: "control" },
  summon: { label: "Invocación", icon: "👹", tone: "summon" },
  other: { label: "Otros", icon: "★", tone: "other" },
};

export function getSpellPresentation(d: SpellData) {
  const category = getSpellCategory(d);
  const meta = CATEGORY_META[category];
  const subeHp = num(d, "subeHp");
  const parts: string[] = [];

  if (subeHp === 1) {
    parts.push(`Cura ${num(d, "minHp")}–${num(d, "maxHp")} HP`);
  } else if (subeHp === 2) {
    parts.push(`Daño ${num(d, "minHp")}–${num(d, "maxHp")}`);
  } else if (subeHp === 3 || subeHp === 4) {
    parts.push(`${getSubeHpLabel(subeHp)} ${num(d, "minHp")}–${num(d, "maxHp")}`);
  }
  if (flagToBool(d.paraliza) || flagToBool(d.paralizaarea)) parts.push("Paraliza");
  if (flagToBool(d.inmoviliza)) parts.push("Inmoviliza");
  if (num(d, "envenena") > 0) parts.push(`Envenena (${num(d, "envenena")})`);
  if (flagToBool(d.curaVeneno)) parts.push("Cura veneno");
  if (flagToBool(d.revivir)) parts.push("Resucita");
  if (num(d, "protec") > 0) parts.push(`Protec ${num(d, "protec")}`);
  if (isSummonSpell(d)) parts.push(`NPC ${num(d, "numNpc")} ×${Math.max(1, num(d, "cant"))}`);

  return {
    category,
    label: meta.label,
    icon: meta.icon,
    badgeTone: meta.tone,
    summary: parts.join(" · ") || String(d.desc ?? "—"),
    targetLabel: getSpellTargetMeta(num(d, "target")).label,
    typeLabel: getSpellTypeMeta(num(d, "type")).label,
    importantStats: {
      mana: num(d, "manaRequired"),
      skill: num(d, "minSkill"),
      fx: num(d, "fxGrh"),
      loops: num(d, "loops"),
      wav: num(d, "wav"),
    },
  };
}

export type SpellTabId =
  | "general"
  | "effects"
  | "animation"
  | "conditions"
  | "target"
  | "advanced";

export function getSpellTabs(d: SpellData): SpellTabId[] {
  const tabs: SpellTabId[] = [
    "general",
    "effects",
    "animation",
    "conditions",
    "target",
    "advanced",
  ];
  return tabs;
}
