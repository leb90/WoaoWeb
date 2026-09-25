import fs from "node:fs";
import {
  atomicWriteJsonFile,
  createBackup,
} from "./backups";
import {
  resolvePrimaryResourcePath,
  resolveResourcePaths,
  type AllowedResource,
} from "../security/paths";
import type { SessionPayload } from "../security/auth";
import { appendAudit } from "../security/audit";

export type ObjRecord = Record<string, unknown> & {
  name?: string;
  objType?: number;
  grhIndex?: number;
};

export type NpcRecord = Record<string, unknown> & {
  name?: string;
  npcType?: number;
  idBody?: number;
  idHead?: number;
  hostile?: number;
  hp?: number;
  maxHp?: number;
  exp?: number;
};

export type SpellRecord = Record<string, unknown> & {
  name?: string;
};

export type ObjectsFile = Record<string, ObjRecord>;
export type NpcsFile = Record<string, NpcRecord>;
export type SpellsFile = Record<string, SpellRecord>;

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function loadObjects(): ObjectsFile {
  return readJsonFile(resolvePrimaryResourcePath("objs"));
}

export function loadNpcs(): NpcsFile {
  return readJsonFile(resolvePrimaryResourcePath("npcs"));
}

export function loadSpells(): SpellsFile {
  return readJsonFile(resolvePrimaryResourcePath("spells"));
}

export function loadCraftingRecipes(): unknown[] {
  return readJsonFile(resolvePrimaryResourcePath("craftingRecipes"));
}

export function loadSmeltingRecipes(): unknown[] {
  return readJsonFile(resolvePrimaryResourcePath("smeltingRecipes"));
}

export function loadBalance(): Record<string, unknown> {
  return readJsonFile(resolvePrimaryResourcePath("balance"));
}

export function listObjectSummaries() {
  const objs = loadObjects();
  return Object.entries(objs).map(([id, data]) => ({
    id: Number(id),
    name: String(data.name ?? ""),
    objType: Number(data.objType ?? 0),
    grhIndex: Number(data.grhIndex ?? 0),
    valor: Number(data.valor ?? 0),
    anim: Number(data.anim ?? 0),
    subtipo: Number(data.subtipo ?? 0),
    minHit: Number(data.minHit ?? 0),
    maxHit: Number(data.maxHit ?? 0),
    minDef: Number(data.minDef ?? 0),
    maxDef: Number(data.maxDef ?? 0),
    minDefMag: Number(data.minDefMag ?? 0),
    maxDefMag: Number(data.maxDefMag ?? 0),
    tipoPocion: Number(data.tipoPocion ?? 0),
    minModificador: Number(data.minModificador ?? 0),
    maxModificador: Number(data.maxModificador ?? 0),
    porcentaje: Number(data.porcentaje ?? 0),
    indexAbierta: Number(data.indexAbierta ?? 0),
    indexCerrada: Number(data.indexCerrada ?? 0),
    llave: Number(data.llave ?? 0),
    spellIndex: Number(data.spellIndex ?? 0),
    resistenciaMagica: Number(data.resistenciaMagica ?? 0),
    minHam: Number(data.minHam ?? 0),
    maxHam: Number(data.maxHam ?? 0),
    minSed: Number(data.minSed ?? 0),
    maxSed: Number(data.maxSed ?? 0),
  }));
}

export function listNpcSummaries() {
  const npcs = loadNpcs();
  return Object.entries(npcs).map(([id, data]) => ({
    id: Number(id),
    name: String(data.name ?? ""),
    npcType: Number(data.npcType ?? 0),
    idBody: Number(data.idBody ?? 0),
    idHead: Number(data.idHead ?? 0),
    hostile: Number(data.hostile ?? 0),
    attackable: Number(data.attackable ?? 1),
    comercia: Number(data.comercia ?? 0),
    hp: Number(data.hp ?? data.maxHp ?? 0),
    maxHp: Number(data.maxHp ?? data.hp ?? 0),
    exp: Number(data.exp ?? 0),
    gold: Number(data.gold ?? 0),
    movement: Number(data.movement ?? 0),
    minHit: Number(data.minHit ?? 0),
    maxHit: Number(data.maxHit ?? 0),
    def: Number(data.def ?? 0),
    objsCount: Array.isArray(data.objs) ? data.objs.length : 0,
    dropCount: Array.isArray(data.drop) ? data.drop.length : 0,
    spellsCount: Array.isArray(data.spells) ? data.spells.length : 0,
  }));
}

export function peekNextNpcId(): number {
  return nextAvailableId(loadNpcs());
}

export { findNpcReferences } from "./npcs/references";
export type { NpcReference } from "./npcs/references";

export function listSpellSummaries() {
  const spells = loadSpells();
  return Object.entries(spells).map(([id, data]) => ({
    id: Number(id),
    name: String(data.name ?? ""),
    desc: String(data.desc ?? ""),
    type: Number(data.type ?? 0),
    target: Number(data.target ?? 3),
    manaRequired: Number(data.manaRequired ?? 0),
    minSkill: Number(data.minSkill ?? 0),
    fxGrh: Number(data.fxGrh ?? 0),
    loops: Number(data.loops ?? 0),
    wav: Number(data.wav ?? 0),
    subeHp: Number(data.subeHp ?? 0),
    minHp: Number(data.minHp ?? 0),
    maxHp: Number(data.maxHp ?? 0),
    invoca: Number(data.invoca ?? 0),
    numNpc: Number(data.numNpc ?? 0),
    cant: Number(data.cant ?? 0),
    paraliza: Number(data.paraliza ?? 0),
    inmoviliza: Number(data.inmoviliza ?? 0),
    curaVeneno: Number(data.curaVeneno ?? 0),
    revivir: Number(data.revivir ?? 0),
    envenena: Number(data.envenena ?? 0),
    ceguera: Number(data.ceguera ?? 0),
    estupidez: Number(data.estupidez ?? 0),
    paralizaarea: Number(data.paralizaarea ?? 0),
    invisibilidad: Number(data.invisibilidad ?? 0),
    removerParalisis: Number(data.removerParalisis ?? 0),
    protec: Number(data.protec ?? 0),
    subeAg: Number(data.subeAg ?? 0),
    subeFz: Number(data.subeFz ?? 0),
    subeMana: Number(data.subeMana ?? 0),
    subeHam: Number(data.subeHam ?? 0),
    subeSed: Number(data.subeSed ?? 0),
  }));
}

export function peekNextSpellId(): number {
  return nextAvailableId(loadSpells());
}

function nextAvailableId(map: Record<string, unknown>): number {
  let id = 1;
  while (map[String(id)]) id++;
  return id;
}

export function peekNextObjectId(): number {
  return nextAvailableId(loadObjects());
}

export { findObjectReferences } from "./objects/references";
export type { ObjectReference } from "./objects/references";

export function getObject(id: number): ObjRecord | null {
  const objs = loadObjects();
  return objs[String(id)] ?? null;
}

export function getNpc(id: number): NpcRecord | null {
  const npcs = loadNpcs();
  return npcs[String(id)] ?? null;
}

export function getSpell(id: number): SpellRecord | null {
  const spells = loadSpells();
  return spells[String(id)] ?? null;
}

export function saveResourceFile(
  resource: AllowedResource,
  data: unknown,
  session: SessionPayload,
  opts?: { resourceId?: string | number | null; action?: string },
): void {
  const paths = resolveResourcePaths(resource);
  createBackup({
    resource,
    resourceId: opts?.resourceId ?? null,
    absoluteFiles: paths,
  });
  for (const filePath of paths) {
    atomicWriteJsonFile(filePath, data);
    appendAudit(session, {
      action: opts?.action ?? "save",
      resourceType: resource,
      resourceId: opts?.resourceId ?? null,
      file: filePath,
    });
  }
}

export function upsertObject(
  id: number,
  data: ObjRecord,
  session: SessionPayload,
): void {
  const objs = loadObjects();
  objs[String(id)] = data;
  saveResourceFile("objs", objs, session, {
    resourceId: id,
    action: "upsert-object",
  });
}

export function deleteObject(id: number, session: SessionPayload): void {
  const objs = loadObjects();
  if (!(String(id) in objs)) throw new Error(`Objeto ${id} no existe`);
  delete objs[String(id)];
  saveResourceFile("objs", objs, session, {
    resourceId: id,
    action: "delete-object",
  });
}

export function duplicateObject(
  sourceId: number,
  session: SessionPayload,
): number {
  const objs = loadObjects();
  const source = objs[String(sourceId)];
  if (!source) throw new Error(`Objeto ${sourceId} no existe`);
  const newId = nextAvailableId(objs);
  objs[String(newId)] = {
    ...structuredClone(source),
    name: `${String(source.name ?? "Objeto")} (copia)`,
  };
  saveResourceFile("objs", objs, session, {
    resourceId: newId,
    action: "duplicate-object",
  });
  return newId;
}

export function createObject(
  data: ObjRecord,
  session: SessionPayload,
  preferredId?: number,
): number {
  const objs = loadObjects();
  const id =
    preferredId && !objs[String(preferredId)]
      ? preferredId
      : nextAvailableId(objs);
  objs[String(id)] = data;
  saveResourceFile("objs", objs, session, {
    resourceId: id,
    action: "create-object",
  });
  return id;
}

export function upsertNpc(
  id: number,
  data: NpcRecord,
  session: SessionPayload,
): void {
  const npcs = loadNpcs();
  npcs[String(id)] = data;
  saveResourceFile("npcs", npcs, session, {
    resourceId: id,
    action: "upsert-npc",
  });
}

export function deleteNpc(id: number, session: SessionPayload): void {
  const npcs = loadNpcs();
  if (!(String(id) in npcs)) throw new Error(`NPC ${id} no existe`);
  delete npcs[String(id)];
  saveResourceFile("npcs", npcs, session, {
    resourceId: id,
    action: "delete-npc",
  });
}

export function duplicateNpc(
  sourceId: number,
  session: SessionPayload,
): number {
  const npcs = loadNpcs();
  const source = npcs[String(sourceId)];
  if (!source) throw new Error(`NPC ${sourceId} no existe`);
  const newId = nextAvailableId(npcs);
  npcs[String(newId)] = {
    ...structuredClone(source),
    name: `${String(source.name ?? "NPC")} (copia)`,
  };
  saveResourceFile("npcs", npcs, session, {
    resourceId: newId,
    action: "duplicate-npc",
  });
  return newId;
}

export function createNpc(
  data: NpcRecord,
  session: SessionPayload,
  preferredId?: number,
): number {
  const npcs = loadNpcs();
  const id =
    preferredId && !npcs[String(preferredId)]
      ? preferredId
      : nextAvailableId(npcs);
  npcs[String(id)] = data;
  saveResourceFile("npcs", npcs, session, {
    resourceId: id,
    action: "create-npc",
  });
  return id;
}

export function upsertSpell(
  id: number,
  data: SpellRecord,
  session: SessionPayload,
): void {
  const spells = loadSpells();
  spells[String(id)] = data;
  saveResourceFile("spells", spells, session, {
    resourceId: id,
    action: "upsert-spell",
  });
}

export function createSpell(
  data: SpellRecord,
  session: SessionPayload,
  preferredId?: number,
): number {
  const spells = loadSpells();
  const id =
    preferredId && !spells[String(preferredId)]
      ? preferredId
      : nextAvailableId(spells);
  spells[String(id)] = data;
  saveResourceFile("spells", spells, session, {
    resourceId: id,
    action: "create-spell",
  });
  return id;
}

export function deleteSpell(id: number, session: SessionPayload): void {
  const spells = loadSpells();
  if (!(String(id) in spells)) throw new Error(`Spell ${id} no existe`);
  delete spells[String(id)];
  saveResourceFile("spells", spells, session, {
    resourceId: id,
    action: "delete-spell",
  });
}

export function duplicateSpell(
  sourceId: number,
  session: SessionPayload,
): number {
  const spells = loadSpells();
  const source = spells[String(sourceId)];
  if (!source) throw new Error(`Spell ${sourceId} no existe`);
  const newId = nextAvailableId(spells);
  spells[String(newId)] = {
    ...structuredClone(source),
    name: `${String(source.name ?? "Hechizo")} - copia`,
  };
  saveResourceFile("spells", spells, session, {
    resourceId: newId,
    action: "duplicate-spell",
  });
  return newId;
}

export function saveCraftingRecipes(
  data: unknown[],
  session: SessionPayload,
): void {
  saveResourceFile("craftingRecipes", data, session, {
    action: "save-crafting",
  });
}

export function saveSmeltingRecipes(
  data: unknown[],
  session: SessionPayload,
): void {
  saveResourceFile("smeltingRecipes", data, session, {
    action: "save-smelting",
  });
}

export function saveBalance(
  data: Record<string, unknown>,
  session: SessionPayload,
): void {
  saveResourceFile("balance", data, session, { action: "save-balance" });
}

export function restartHintsFor(resource: AllowedResource): string[] {
  switch (resource) {
    case "objs":
      return [
        "Ejecutá: corepack pnpm -C api import-game-data",
        "En juego (GM): /recargarobjs",
        "Si el cliente debe ver cambios: export client objs + hard refresh",
      ];
    case "npcs":
      return [
        "Ejecutá: corepack pnpm -C api import-game-data",
        "En juego (GM): /recargarnpcs",
        "Opcional: export frontend npcs + hard refresh",
      ];
    case "craftingRecipes":
      return [
        "Ejecutá: corepack pnpm -C api import-game-data",
        "En juego (GM): /recargarcrafting",
      ];
    case "smeltingRecipes":
      return [
        "Ejecutá: corepack pnpm -C api import-game-data",
        "Reiniciá el Game Server (no hay /recargarsmelting)",
      ];
    case "balance":
      return [
        "Ejecutá: corepack pnpm -C api import-game-data",
        "En juego (GM): /recargarbalance",
      ];
    case "spells":
      return [
        "Este cambio requiere reiniciar el Game Server",
        "Se actualizaron api/src/jsons/spells.json y server/jsons/spells.json",
      ];
    default:
      return [];
  }
}
