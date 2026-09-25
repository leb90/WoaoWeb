/** NPC type catalog from server/src/vars.ts — do not invent IDs. */

export const NPC_TYPE = {
  comun: 0,
  sacerdote: 1,
  guardia: 2,
  entrenador: 3,
  banquero: 4,
  noble: 5,
  dragon: 6,
  timbero: 7,
  guardiaCaos: 8,
  sacerdoteNewbie: 9,
  comerciante: 10,
  subastador: 12,
  reyCastillo: 33,
  viajero: 43,
  crafter: 45,
  montura: 60,
  defensorFortaleza: 61,
  ettinCastillo: 77,
  puertaCastillo: 78,
} as const;

export type NpcTypeMeta = {
  id: number;
  key: string;
  label: string;
  icon: string;
  description: string;
  badgeTone: "citizen" | "guard" | "merchant" | "monster" | "special" | "neutral";
  clanLabel?: string;
};

export const NPC_TYPE_METAS: NpcTypeMeta[] = [
  { id: 0, key: "comun", label: "Común", icon: "👤", description: "NPC genérico / plantilla base.", badgeTone: "neutral" },
  { id: 1, key: "sacerdote", label: "Sacerdote", icon: "✝", description: "Click: revivir o curar.", badgeTone: "citizen", clanLabel: "<Sacerdote>" },
  { id: 2, key: "guardia", label: "Guardia", icon: "🛡", description: "Guardia de ciudad.", badgeTone: "guard", clanLabel: "<Guardia>" },
  { id: 3, key: "entrenador", label: "Entrenador", icon: "⚔", description: "Entrenador.", badgeTone: "citizen", clanLabel: "<Entrenador>" },
  { id: 4, key: "banquero", label: "Banquero", icon: "🏦", description: "Click: abrir banco.", badgeTone: "citizen", clanLabel: "<Banquero>" },
  { id: 5, key: "noble", label: "Noble", icon: "👑", description: "Noble de ciudad.", badgeTone: "citizen" },
  { id: 6, key: "dragon", label: "Dragón", icon: "🐉", description: "Boss / inmune a ciertos efectos.", badgeTone: "monster" },
  { id: 7, key: "timbero", label: "Timbero", icon: "🪓", description: "NPC de ciudad.", badgeTone: "citizen" },
  { id: 8, key: "guardiaCaos", label: "Guardia del Caos", icon: "☠", description: "Guardia del caos.", badgeTone: "guard", clanLabel: "<Guardia Del Caos>" },
  { id: 9, key: "sacerdoteNewbie", label: "Sacerdote newbie", icon: "✝", description: "Sacerdote para newbies.", badgeTone: "citizen" },
  { id: 10, key: "comerciante", label: "Comerciante", icon: "⚖", description: "Click: comercio (usa objs).", badgeTone: "merchant", clanLabel: "<Comerciante>" },
  { id: 12, key: "subastador", label: "Subastador", icon: "📢", description: "Click: mercado.", badgeTone: "special", clanLabel: "<Subastador>" },
  { id: 33, key: "reyCastillo", label: "Rey de castillo", icon: "🏰", description: "Clan castles.", badgeTone: "special" },
  { id: 43, key: "viajero", label: "Viajero", icon: "🗺", description: "Fast travel.", badgeTone: "special" },
  { id: 45, key: "crafter", label: "Crafter", icon: "⚒", description: "Crafting.", badgeTone: "special", clanLabel: "<Crafteo>" },
  { id: 60, key: "montura", label: "Montura", icon: "🦄", description: "Plantilla de montura/mascota.", badgeTone: "special" },
  { id: 61, key: "defensorFortaleza", label: "Defensor fortaleza", icon: "🏰", description: "Clan castles.", badgeTone: "special" },
  { id: 77, key: "ettinCastillo", label: "Ettin castillo", icon: "👹", description: "Clan castles.", badgeTone: "special" },
  { id: 78, key: "puertaCastillo", label: "Puerta castillo", icon: "🚪", description: "Clan castles.", badgeTone: "special" },
];

const BY_ID = new Map(NPC_TYPE_METAS.map((m) => [m.id, m]));

export function getNpcTypeMeta(npcType: number): NpcTypeMeta {
  return (
    BY_ID.get(npcType) ?? {
      id: npcType,
      key: `tipo_${npcType}`,
      label: `Tipo ${npcType}`,
      icon: "★",
      description: "Tipo fuera de vars.npcType.",
      badgeTone: "special",
    }
  );
}

export function getNpcTypeLabel(npcType: number): string {
  return getNpcTypeMeta(npcType).label;
}

/** Types offered in create wizard. */
export const CREATEABLE_NPC_TYPES: number[] = [
  NPC_TYPE.comun,
  NPC_TYPE.sacerdote,
  NPC_TYPE.guardia,
  NPC_TYPE.entrenador,
  NPC_TYPE.banquero,
  NPC_TYPE.comerciante,
  NPC_TYPE.noble,
  NPC_TYPE.dragon,
  NPC_TYPE.viajero,
  NPC_TYPE.crafter,
  NPC_TYPE.subastador,
];

/** Extra create presets that map to real npcTypes with role defaults. */
export type CreatePreset = {
  id: string;
  label: string;
  icon: string;
  description: string;
  npcType: number;
  applyDefaults?: (draft: import("./presentation").NpcData) => import("./presentation").NpcData;
};

export const CREATE_PRESETS: CreatePreset[] = [
  {
    id: "monstruo",
    label: "Monstruo",
    icon: "☠",
    description: "Hostil, atacable, movimiento combate (npcType común).",
    npcType: NPC_TYPE.comun,
    applyDefaults: (d) => ({
      ...d,
      name: "Nuevo monstruo",
      hostile: 1,
      attackable: 1,
      comercia: 0,
      movement: 3,
      hp: 50,
      maxHp: 50,
      exp: 10,
      minHit: 5,
      maxHit: 10,
    }),
  },
];
export function getMovementLabel(movement: number): string {
  if (movement === 3) return "Combate / persecución";
  return `Movimiento ${movement}`;
}

export const MOVEMENT_OPTIONS: Array<{ id: number; label: string }> = [
  { id: 0, label: "Movimiento 0" },
  { id: 1, label: "Movimiento 1" },
  { id: 2, label: "Movimiento 2" },
  { id: 3, label: "Combate / persecución" },
  { id: 4, label: "Movimiento 4" },
  { id: 5, label: "Movimiento 5" },
  { id: 10, label: "Movimiento 10" },
  { id: 11, label: "Movimiento 11" },
];

export function flagToBool(value: unknown): boolean {
  return Number(value) === 1 || value === true;
}

export function boolToFlag(value: boolean): number {
  return value ? 1 : 0;
}
