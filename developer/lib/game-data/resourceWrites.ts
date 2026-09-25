import path from "node:path";
import {
  PATHS,
  resolveResourcePaths,
  type AllowedResource,
} from "../security/paths";

export type JsonWrite = {
  absolutePath: string;
  data: unknown;
};

type JsonRecord = Record<string, Record<string, unknown>>;

const CLIENT_OBJECT_NUMBER_FIELDS = [
  "objType",
  "minHit",
  "maxHit",
  "minDef",
  "maxDef",
  "minDefMag",
  "maxDefMag",
  "resistenciaMagica",
  "apu",
  "proyectil",
  "staffDamageBonus",
  "magicDamageBonus",
  "magicDamagePercent",
  "objetoEspecial",
  "mataHobbits",
  "subtipo",
] as const;

const CLIENT_NPC_FIELDS = [
  "npcType",
  "desc",
  "exp",
  "gold",
  "hp",
  "maxHp",
  "minHit",
  "maxHit",
  "def",
  "poderAtaque",
  "poderEvasion",
  "questNumber",
] as const;

function isFrontendInitPath(filePath: string): boolean {
  const initRoot = path.resolve(PATHS.frontendInit());
  const resolved = path.resolve(filePath);
  const rel = path.relative(initRoot, resolved);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
}

function toRecordMap(data: unknown, resource: AllowedResource): JsonRecord {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error(`Formato invalido para ${resource}`);
  }
  return data as JsonRecord;
}

export function toClientObjects(data: unknown): Record<string, unknown> {
  const objects = toRecordMap(data, "objs");
  const client: Record<string, unknown> = {};

  for (const [id, objectData] of Object.entries(objects)) {
    const clientObject: Record<string, unknown> = {
      name: objectData.name,
      grhIndex: String(objectData.grhIndex ?? 0),
    };

    for (const key of CLIENT_OBJECT_NUMBER_FIELDS) {
      const value = Number(objectData[key] ?? 0);
      if (value) {
        clientObject[key] = value;
      }
    }

    const blockedClasses = objectData.clasesNoPermitidas;
    if (Array.isArray(blockedClasses) && blockedClasses.length > 0) {
      clientObject.clasesNoPermitidas = blockedClasses;
    }

    client[id] = clientObject;
  }

  return client;
}

export function toClientNpcs(data: unknown): Record<string, unknown> {
  const npcs = toRecordMap(data, "npcs");
  const client: Record<string, unknown> = {};

  for (const [id, npc] of Object.entries(npcs)) {
    const clientNpc: Record<string, unknown> = {
      name: npc.name,
      idHead: npc.idHead,
      idBody: npc.idBody,
    };

    for (const key of CLIENT_NPC_FIELDS) {
      const value = npc[key];
      if (value) {
        clientNpc[key] = value;
      }
    }

    if (Array.isArray(npc.drop) && npc.drop.length > 0) {
      clientNpc.drop = npc.drop;
    }

    client[id] = clientNpc;
  }

  return client;
}

export function buildResourceWrites(
  resource: AllowedResource,
  data: unknown,
): JsonWrite[] {
  return resolveResourcePaths(resource).map((absolutePath) => {
    if (resource === "objs" && isFrontendInitPath(absolutePath)) {
      return { absolutePath, data: toClientObjects(data) };
    }

    if (resource === "npcs" && isFrontendInitPath(absolutePath)) {
      return { absolutePath, data: toClientNpcs(data) };
    }

    return { absolutePath, data };
  });
}
