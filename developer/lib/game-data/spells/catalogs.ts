/** Spell type/target catalogs — labels from server behavior, not invented enums. */

export const SPELL_TYPE = {
  especial: 0,
  activo: 1,
  utilidad: 2,
  invocacion: 4,
} as const;

export type SpellTypeMeta = {
  id: number;
  label: string;
  description: string;
};

export const SPELL_TYPE_METAS: SpellTypeMeta[] = [
  {
    id: 0,
    label: "Especial",
    description: "Sin rama dedicada (auras / casos raros).",
  },
  {
    id: 1,
    label: "Activo",
    description: "Mayoría de daño, curación y buffs.",
  },
  {
    id: 2,
    label: "Utilidad",
    description: "Estados, curas de veneno, resucitar, control.",
  },
  {
    id: 4,
    label: "Invocación",
    description: "type=4 + numNpc → spawn en tile.",
  },
];

export function getSpellTypeMeta(type: number): SpellTypeMeta {
  return (
    SPELL_TYPE_METAS.find((t) => t.id === type) ?? {
      id: type,
      label: `Tipo ${type}`,
      description: "Tipo fuera del mapa conocido.",
    }
  );
}

/** target validation in protocol.ts */
export const SPELL_TARGET_METAS: Array<{
  id: number;
  label: string;
  description: string;
}> = [
  {
    id: 0,
    label: "Especial / aura",
    description: "Usado por auras; sin filtro usuario/NPC.",
  },
  {
    id: 1,
    label: "Usuarios",
    description: "Rechaza NPCs.",
  },
  {
    id: 2,
    label: "NPCs",
    description: "Rechaza usuarios.",
  },
  {
    id: 3,
    label: "Personaje o NPC",
    description: "Default; usuarios y NPCs.",
  },
  {
    id: 4,
    label: "Posición / invocación",
    description: "Cast por tile (invocaciones, detectar invis).",
  },
];

export function getSpellTargetMeta(target: number) {
  return (
    SPELL_TARGET_METAS.find((t) => t.id === target) ?? {
      id: target,
      label: `Target ${target}`,
      description: "Valor no documentado en protocol.",
    }
  );
}

/** Resource modifier: 0 none, 1 raise/heal, 2 lower/damage (+ HP area 3/4). */
export const RESOURCE_MOD = {
  none: 0,
  raise: 1,
  lower: 2,
  areaNear: 3,
  areaScreen: 4,
} as const;

export function getSubeHpLabel(subeHp: number): string {
  switch (subeHp) {
    case 0:
      return "Sin cambio de HP";
    case 1:
      return "Curación";
    case 2:
      return "Daño";
    case 3:
      return "Daño en área cercana";
    case 4:
      return "Daño en área (pantalla)";
    default:
      return `subeHp ${subeHp}`;
  }
}

export function getResourceModLabel(v: number): string {
  if (v === 1) return "Aumenta";
  if (v === 2) return "Reduce";
  if (v === 0) return "Sin cambio";
  return `Mod ${v}`;
}

export const FLAG_EFFECTS: Array<{
  key: string;
  label: string;
  group: "control" | "support" | "misc";
}> = [
  { key: "paraliza", label: "Paraliza", group: "control" },
  { key: "paralizaarea", label: "Parálisis en área", group: "control" },
  { key: "inmoviliza", label: "Inmoviliza", group: "control" },
  { key: "ceguera", label: "Ceguera", group: "control" },
  { key: "estupidez", label: "Estupidez", group: "control" },
  { key: "curaVeneno", label: "Cura veneno", group: "support" },
  { key: "removerParalisis", label: "Remueve parálisis", group: "support" },
  { key: "invisibilidad", label: "Invisibilidad", group: "support" },
  {
    key: "remueveInvisibilidadParcial",
    label: "Remueve invisibilidad parcial",
    group: "support",
  },
  { key: "revivir", label: "Resucita", group: "support" },
  { key: "morph", label: "Morph", group: "misc" },
  { key: "invoca", label: "Invoca", group: "misc" },
];

/** Numeric intensity fields (not 0/1). */
export const INTENSITY_EFFECTS: Array<{
  key: string;
  label: string;
  hint: string;
  defaultOn: number;
}> = [
  {
    key: "envenena",
    label: "Envenena",
    hint: "Intensidad (ej. 5, 15). Runtime: envenenado = este valor.",
    defaultOn: 5,
  },
  {
    key: "protec",
    label: "Protección",
    hint: "% reducción daño mágico (ej. 10). Self-cast.",
    defaultOn: 10,
  },
];

export function flagToBool(value: unknown): boolean {
  return Number(value) === 1 || value === true;
}

export function boolToFlag(value: boolean): number {
  return value ? 1 : 0;
}

export type CreateSpellPreset = {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaults: Record<string, unknown>;
};

export const CREATE_SPELL_PRESETS: CreateSpellPreset[] = [
  {
    id: "damage",
    label: "Daño",
    icon: "🔥",
    description: "Daño single-target (subeHp=2).",
    defaults: {
      type: 1,
      target: 3,
      subeHp: 2,
      minHp: 10,
      maxHp: 20,
      manaRequired: 20,
      minSkill: 10,
      loops: 1,
      noesquivar: 0,
      staffAffected: 0,
    },
  },
  {
    id: "heal",
    label: "Curación",
    icon: "✚",
    description: "Cura HP (subeHp=1).",
    defaults: {
      type: 1,
      target: 3,
      subeHp: 1,
      minHp: 10,
      maxHp: 25,
      manaRequired: 15,
      minSkill: 8,
      loops: 1,
      noesquivar: 1,
    },
  },
  {
    id: "control",
    label: "Control",
    icon: "⏸",
    description: "Paraliza / control (type utilidad).",
    defaults: {
      type: 2,
      target: 3,
      paraliza: 1,
      manaRequired: 25,
      minSkill: 15,
      loops: 1,
    },
  },
  {
    id: "support",
    label: "Soporte",
    icon: "🛡",
    description: "Buff / utilidad de soporte.",
    defaults: {
      type: 2,
      target: 1,
      manaRequired: 20,
      minSkill: 10,
      loops: 1,
      noesquivar: 1,
    },
  },
  {
    id: "summon",
    label: "Invocación",
    icon: "👹",
    description: "type=4, target=4, requiere numNpc.",
    defaults: {
      type: 4,
      target: 4,
      invoca: 1,
      numNpc: 1,
      cant: 1,
      manaRequired: 50,
      minSkill: 20,
      loops: 0,
      fxGrh: 0,
    },
  },
];
