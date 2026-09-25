import type { SpellData } from "./presentation";
import { CREATE_SPELL_PRESETS } from "./catalogs";

const BASE_SPELL: SpellData = {
  name: "Nuevo hechizo",
  desc: "",
  type: 1,
  wav: 16,
  fxGrh: 0,
  minSkill: 0,
  manaRequired: 0,
  staRequired: 0,
  target: 3,
  palabrasMagicas: "",
  paraliza: 0,
  inmoviliza: 0,
  removerParalisis: 0,
  invisibilidad: 0,
  revivir: 0,
  curaVeneno: 0,
  envenena: 0,
  ceguera: 0,
  estupidez: 0,
  paralizaarea: 0,
  remueveInvisibilidadParcial: 0,
  morph: 0,
  protec: 0,
  invoca: 0,
  cant: 0,
  minNivel: 0,
  noesquivar: 0,
  minHp: 0,
  maxHp: 0,
  subeHp: 0,
  subeAg: 0,
  minAg: 0,
  maxAg: 0,
  subeFz: 0,
  minFz: 0,
  maxFz: 0,
  subeMana: 0,
  minMana: 0,
  maxMana: 0,
  subeHam: 0,
  minHam: 0,
  maxHam: 0,
  subeSed: 0,
  minSed: 0,
  maxSed: 0,
  staffAffected: 0,
  loops: 1,
  numNpc: 0,
};

export function createSpellDraft(presetId?: string, name?: string): SpellData {
  const preset = CREATE_SPELL_PRESETS.find((p) => p.id === presetId);
  return {
    ...structuredClone(BASE_SPELL),
    ...(preset?.defaults ?? {}),
    name: name ?? (preset ? `Nuevo ${preset.label.toLowerCase()}` : "Nuevo hechizo"),
  };
}

export function duplicateSpellAsDraft(source: SpellData): SpellData {
  const copy = structuredClone(source) as SpellData;
  copy.name = `${String(source.name ?? "Hechizo")} - copia`;
  return copy;
}
