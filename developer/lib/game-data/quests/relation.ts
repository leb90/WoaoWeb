import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../../security/paths";
import { loadNpcs } from "../catalog";
import type { QuestGiverInfo, QuestGiversFile, QuestMapLocation } from "./types";

export function loadQuestGivers(): QuestGiversFile {
  const p = path.join(PATHS.serverJsons(), "questGivers.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8")) as QuestGiversFile;
}

/** NPCs that deliver a given quest (from questGivers + npc.questNumber). */
export function findGiversForQuest(questId: number): QuestGiverInfo[] {
  const npcs = loadNpcs();
  const givers = loadQuestGivers();
  const seen = new Set<number>();
  const out: QuestGiverInfo[] = [];

  function push(npcId: number) {
    if (seen.has(npcId)) return;
    const npc = npcs[String(npcId)];
    if (!npc) return;
    seen.add(npcId);
    out.push({
      npcId,
      name: String(npc.name ?? `NPC ${npcId}`),
      idBody: Number(npc.idBody ?? 0),
      idHead: Number(npc.idHead ?? 0),
      npcType: Number(npc.npcType ?? 0),
    });
  }

  for (const [npcIdStr, qid] of Object.entries(givers)) {
    if (Number(qid) === questId) push(Number(npcIdStr));
  }
  for (const [npcIdStr, npc] of Object.entries(npcs)) {
    if (Number(npc.questNumber ?? 0) === questId) push(Number(npcIdStr));
  }

  return out.sort((a, b) => a.npcId - b.npcId);
}

/** Quest currently bound to an NPC (0 if none). */
export function getNpcBoundQuestId(npcId: number): number {
  const npcs = loadNpcs();
  const npc = npcs[String(npcId)];
  const fromNpc = Number(npc?.questNumber ?? 0);
  if (fromNpc > 0) return fromNpc;
  const givers = loadQuestGivers();
  return Number(givers[String(npcId)] ?? 0);
}

export function findNpcMapLocations(npcId: number): QuestMapLocation[] {
  const roots = [PATHS.serverMaps(), PATHS.apiMaps()].filter((r) =>
    fs.existsSync(r),
  );
  const seen = new Set<string>();
  const out: QuestMapLocation[] = [];

  for (const root of roots) {
    let dirs: string[] = [];
    try {
      dirs = fs
        .readdirSync(root, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith("mapa_"))
        .map((d) => d.name);
    } catch {
      continue;
    }
    for (const dir of dirs) {
      const mapId = Number(dir.replace("mapa_", ""));
      const npcsPath = path.join(root, dir, "npcs.json");
      if (!fs.existsSync(npcsPath)) continue;
      try {
        const list = JSON.parse(fs.readFileSync(npcsPath, "utf8")) as Array<{
          npcIndex?: number;
          x?: number;
          y?: number;
        }>;
        if (!Array.isArray(list)) continue;
        for (const spawn of list) {
          if (Number(spawn.npcIndex) !== npcId) continue;
          const key = `${mapId}:${spawn.x}:${spawn.y}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            mapId,
            x: Number(spawn.x ?? 0),
            y: Number(spawn.y ?? 0),
            href: `/maps/${mapId}`,
          });
        }
      } catch {
        /* ignore */
      }
    }
  }
  return out;
}

/**
 * Apply NPC↔quest binding in-memory.
 * One NPC → one quest. Replacing clears previous binding for that NPC.
 * Does not remove other givers of the same quest unless unlinkOthersOnNpc is set.
 */
export function applyNpcQuestBinding(opts: {
  npcs: Record<string, Record<string, unknown>>;
  givers: QuestGiversFile;
  npcId: number;
  questId: number | null;
  /** If true, unlink other NPCs that currently deliver this quest. */
  exclusiveGiver?: boolean;
}): { previousQuestOnNpc: number } {
  const { npcs, givers, npcId, questId, exclusiveGiver } = opts;
  const npc = npcs[String(npcId)];
  if (!npc) {
    throw new Error(`NPC ${npcId} no existe`);
  }

  const previousQuestOnNpc = Number(
    npc.questNumber ?? givers[String(npcId)] ?? 0,
  );

  if (exclusiveGiver && questId != null) {
    for (const [otherId, qid] of Object.entries(givers)) {
      if (Number(qid) === questId && Number(otherId) !== npcId) {
        delete givers[otherId];
        const other = npcs[otherId];
        if (other && Number(other.questNumber) === questId) {
          other.questNumber = 0;
        }
      }
    }
    for (const [otherId, other] of Object.entries(npcs)) {
      if (Number(otherId) === npcId) continue;
      if (Number(other.questNumber ?? 0) === questId) {
        other.questNumber = 0;
        delete givers[otherId];
      }
    }
  }

  if (questId == null || questId <= 0) {
    npc.questNumber = 0;
    delete givers[String(npcId)];
  } else {
    npc.questNumber = questId;
    givers[String(npcId)] = questId;
  }

  return { previousQuestOnNpc };
}

/** Unlink all NPCs that deliver questId. */
export function unlinkAllGiversForQuest(
  npcs: Record<string, Record<string, unknown>>,
  givers: QuestGiversFile,
  questId: number,
): number[] {
  const unlinked: number[] = [];
  for (const [npcIdStr, qid] of Object.entries(givers)) {
    if (Number(qid) !== questId) continue;
    delete givers[npcIdStr];
    const npc = npcs[npcIdStr];
    if (npc && Number(npc.questNumber) === questId) {
      npc.questNumber = 0;
    }
    unlinked.push(Number(npcIdStr));
  }
  for (const [npcIdStr, npc] of Object.entries(npcs)) {
    if (Number(npc.questNumber ?? 0) !== questId) continue;
    npc.questNumber = 0;
    delete givers[npcIdStr];
    if (!unlinked.includes(Number(npcIdStr))) {
      unlinked.push(Number(npcIdStr));
    }
  }
  return unlinked;
}
