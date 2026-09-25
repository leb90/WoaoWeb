import { NPC_TYPE, boolToFlag } from "./catalogs";
import type { NpcData } from "./presentation";

export function createNpcDraft(npcType: number, name?: string): NpcData {
  const base: NpcData = {
    name: name ?? defaultName(npcType),
    npcType,
    idBody: 1,
    idHead: 0,
    movement: 2,
    aguaValida: 0,
    tierraInvalida: 0,
    exp: 0,
    gold: 0,
    hp: 1,
    maxHp: 1,
    minHit: 0,
    maxHit: 0,
    def: 0,
    poderAtaque: 0,
    poderEvasion: 0,
    magicResistance: 0,
    magicDef: 0,
    defM: 0,
    snd1: 0,
    snd2: 0,
    desc: "",
    drop: [],
    objs: [],
    spells: [],
    hostile: 0,
    attackable: 1,
    comercia: 0,
    questNumber: 0,
  };

  switch (npcType) {
    case NPC_TYPE.comerciante:
      return {
        ...base,
        comercia: 1,
        hostile: 0,
        attackable: 0,
        movement: 0,
      };
    case NPC_TYPE.sacerdote:
    case NPC_TYPE.sacerdoteNewbie:
    case NPC_TYPE.banquero:
    case NPC_TYPE.entrenador:
    case NPC_TYPE.noble:
      return {
        ...base,
        hostile: 0,
        attackable: 0,
        movement: 0,
      };
    case NPC_TYPE.guardia:
    case NPC_TYPE.guardiaCaos:
      return {
        ...base,
        hostile: 0,
        attackable: 1,
        movement: 2,
        hp: 100,
        maxHp: 100,
      };
    case NPC_TYPE.dragon:
      return {
        ...base,
        hostile: boolToFlag(true),
        attackable: 1,
        movement: 3,
        hp: 1000,
        maxHp: 1000,
        exp: 100,
        minHit: 10,
        maxHit: 20,
      };
    case NPC_TYPE.comun:
    default:
      return base;
  }
}

function defaultName(npcType: number): string {
  switch (npcType) {
    case NPC_TYPE.comerciante:
      return "Nuevo comerciante";
    case NPC_TYPE.guardia:
      return "Nuevo guardia";
    case NPC_TYPE.sacerdote:
      return "Nuevo sacerdote";
    case NPC_TYPE.dragon:
      return "Nuevo monstruo";
    default:
      return "Nuevo NPC";
  }
}

export function duplicateNpcAsDraft(source: NpcData): NpcData {
  const copy = structuredClone(source) as NpcData;
  copy.name = `${String(source.name ?? "NPC")} - copia`;
  return copy;
}
