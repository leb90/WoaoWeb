import fs from "node:fs";
import path from "node:path";
import type { SessionPayload } from "../../security/auth";
import { appendAudit } from "../../security/audit";
import {
  resolveResourcePaths,
  type AllowedResource,
} from "../../security/paths";
import { createBackup, restoreBackup } from "../backups";
import { loadNpcs, loadObjects, restartHintsFor } from "../catalog";
import { createNpcDraft } from "../npcs/defaults";
import {
  buildListItem,
  emptyQuest,
  normalizeQuestForEditor,
  toPersistedQuest,
} from "./presentation";
import {
  applyNpcQuestBinding,
  findGiversForQuest,
  findNpcMapLocations,
  getNpcBoundQuestId,
  loadQuestGivers,
  unlinkAllGiversForQuest,
} from "./relation";
import type {
  AssignNpcMode,
  QuestData,
  QuestGiversFile,
  QuestNpcDraft,
  QuestsFile,
} from "./types";
import { hasCriticalErrors, validateQuest } from "./validation";

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function loadQuests(): QuestsFile {
  const primary = resolveResourcePaths("quests")[0]!;
  if (!fs.existsSync(primary)) return {};
  return readJson<QuestsFile>(primary);
}

export function peekNextQuestId(): number {
  const quests = loadQuests();
  let id = 1;
  while (quests[String(id)]) id++;
  return id;
}

function nextNpcId(npcs: Record<string, unknown>): number {
  let id = 1;
  while (npcs[String(id)]) id++;
  return id;
}

function npcName(id: number): string {
  const npcs = loadNpcs();
  return String(npcs[String(id)]?.name ?? `NPC ${id}`);
}

function objExists(id: number): boolean {
  return Boolean(loadObjects()[String(id)]);
}

function npcExists(id: number): boolean {
  return Boolean(loadNpcs()[String(id)]);
}

function persistAtomic(
  writes: Array<{ absolutePath: string; data: unknown }>,
  session: SessionPayload,
  action: string,
  resourceId?: number | null,
  resources: AllowedResource[] = ["quests"],
): string[] {
  const paths = writes.map((w) => w.absolutePath);
  const backup = createBackup({
    resource: resources.join("+"),
    resourceId: resourceId ?? null,
    absoluteFiles: paths,
    note: action,
  });

  const temps: Array<{ tmp: string; dest: string }> = [];
  try {
    for (const w of writes) {
      const dir = path.dirname(w.absolutePath);
      fs.mkdirSync(dir, { recursive: true });
      const tmp = path.join(
        dir,
        `.${path.basename(w.absolutePath)}.${process.pid}.${Date.now()}.${temps.length}.tmp`,
      );
      const serialized = JSON.stringify(w.data, null, 2);
      JSON.parse(serialized);
      fs.writeFileSync(tmp, serialized, "utf8");
      temps.push({ tmp, dest: w.absolutePath });
    }
    for (const t of temps) {
      fs.renameSync(t.tmp, t.dest);
    }
  } catch (error) {
    for (const t of temps) {
      try {
        if (fs.existsSync(t.tmp)) fs.unlinkSync(t.tmp);
      } catch {
        /* ignore */
      }
    }
    try {
      restoreBackup(backup.id, paths);
    } catch {
      /* ignore */
    }
    throw error;
  }

  const hints: string[] = [];
  for (const res of resources) {
    for (const file of resolveResourcePaths(res)) {
      if (!paths.includes(file)) continue;
      appendAudit(session, {
        action,
        resourceType: res,
        resourceId: resourceId ?? null,
        file,
      });
    }
    hints.push(...restartHintsFor(res));
  }
  if (paths.some((p) => p.endsWith(`${path.sep}npcs.json`) || p.endsWith("/npcs.json"))) {
    hints.push(...restartHintsFor("npcs"));
  }
  return [...new Set(hints)];
}

function questWritePayload(quests: QuestsFile) {
  return resolveResourcePaths("quests").map((absolutePath) => ({
    absolutePath,
    data: quests,
  }));
}

function giverWritePayload(givers: QuestGiversFile) {
  return resolveResourcePaths("questGivers").map((absolutePath) => ({
    absolutePath,
    data: givers,
  }));
}

function npcWritePayload(npcs: Record<string, unknown>) {
  return resolveResourcePaths("npcs").map((absolutePath) => ({
    absolutePath,
    data: npcs,
  }));
}

function bindGiverOrCreate(opts: {
  npcs: Record<string, Record<string, unknown>>;
  givers: QuestGiversFile;
  questId: number;
  giverNpcId?: number | null;
  createNpc?: QuestNpcDraft | null;
  replaceNpcQuest?: boolean;
}): { createdNpcId?: number; touchRelation: boolean } {
  const { npcs, givers, questId } = opts;
  let createdNpcId: number | undefined;
  let touchRelation = false;

  if (opts.createNpc) {
    createdNpcId = nextNpcId(npcs);
    const draft = createNpcDraft(
      Number(opts.createNpc.npcType ?? 0),
      opts.createNpc.name,
    );
    draft.idBody = Number(opts.createNpc.idBody ?? draft.idBody ?? 1);
    draft.idHead = Number(opts.createNpc.idHead ?? 0);
    draft.desc = String(opts.createNpc.desc ?? "");
    draft.hostile = 0;
    draft.attackable = 0;
    draft.questNumber = questId;
    npcs[String(createdNpcId)] = draft as unknown as Record<string, unknown>;
    applyNpcQuestBinding({
      npcs,
      givers,
      npcId: createdNpcId,
      questId,
    });
    touchRelation = true;
  } else if (opts.giverNpcId != null && opts.giverNpcId > 0) {
    const bound = getNpcBoundQuestId(opts.giverNpcId);
    if (bound > 0 && bound !== questId && !opts.replaceNpcQuest) {
      throw new Error(`NPC_HAS_QUEST:${bound}`);
    }
    applyNpcQuestBinding({
      npcs,
      givers,
      npcId: opts.giverNpcId,
      questId,
    });
    touchRelation = true;
  }

  return { createdNpcId, touchRelation };
}

export function listQuestSummaries() {
  const quests = loadQuests();
  return Object.values(quests)
    .map((q) => {
      const givers = findGiversForQuest(Number(q.id));
      const locations = givers.flatMap((g) => findNpcMapLocations(g.npcId));
      return buildListItem(q, givers, locations, npcName);
    })
    .sort((a, b) => a.id - b.id);
}

export function getQuestDetail(id: number) {
  const quests = loadQuests();
  const raw = quests[String(id)];
  if (!raw) return null;
  const quest = normalizeQuestForEditor(raw);
  const givers = findGiversForQuest(id);
  const locations = givers.flatMap((g) => findNpcMapLocations(g.npcId));
  return {
    quest,
    raw,
    givers,
    locations,
    listItem: buildListItem(raw, givers, locations, npcName),
  };
}

export type SaveQuestInput = {
  quest: QuestData;
  giverNpcId?: number | null;
  unlinkGivers?: boolean;
  replaceNpcQuest?: boolean;
  createNpc?: QuestNpcDraft | null;
};

export function createQuest(
  input: SaveQuestInput,
  session: SessionPayload,
  preferredId?: number,
): { id: number; npcId?: number; hints: string[] } {
  const quests = loadQuests();
  const id =
    preferredId && !quests[String(preferredId)]
      ? preferredId
      : peekNextQuestId();

  const editor = emptyQuest(id, {
    ...input.quest,
    id,
    requiredLevel: 1,
    repeatable: Boolean(input.quest.repeatable),
  });
  const persisted = toPersistedQuest(editor, null, { forceRequiredLevel1: true });

  const issues = validateQuest(persisted, {
    key: String(id),
    isNew: true,
    existingIds: new Set(Object.keys(quests).map(Number)),
    npcExists,
    objExists,
  });
  if (hasCriticalErrors(issues)) {
    throw new Error(issues.map((i) => i.message).join("; "));
  }

  quests[String(id)] = persisted;

  const npcs = loadNpcs() as Record<string, Record<string, unknown>>;
  const givers = loadQuestGivers();
  const resources: AllowedResource[] = ["quests"];

  const { createdNpcId, touchRelation } = bindGiverOrCreate({
    npcs,
    givers,
    questId: id,
    giverNpcId: input.giverNpcId,
    createNpc: input.createNpc,
    replaceNpcQuest: input.replaceNpcQuest,
  });

  if (touchRelation) {
    resources.push("questGivers", "npcs");
  }

  const writes = [
    ...questWritePayload(quests),
    ...(touchRelation ? giverWritePayload(givers) : []),
    ...(touchRelation ? npcWritePayload(npcs) : []),
  ];

  const hints = persistAtomic(writes, session, "create-quest", id, resources);
  return { id, npcId: createdNpcId, hints };
}

export function updateQuest(
  id: number,
  input: SaveQuestInput,
  session: SessionPayload,
): { hints: string[]; npcId?: number } {
  const quests = loadQuests();
  const previous = quests[String(id)];
  if (!previous) throw new Error(`Quest ${id} no existe`);

  const editor = normalizeQuestForEditor({
    ...input.quest,
    id,
  });
  const persisted = toPersistedQuest(editor, previous, {
    forceRequiredLevel1: false,
  });
  persisted.requiredLevel = Number(previous.requiredLevel ?? 1);

  const issues = validateQuest(persisted, {
    key: String(id),
    isNew: false,
    npcExists,
    objExists,
  });
  if (hasCriticalErrors(issues)) {
    throw new Error(issues.map((i) => i.message).join("; "));
  }

  quests[String(id)] = persisted;

  const npcs = loadNpcs() as Record<string, Record<string, unknown>>;
  const givers = loadQuestGivers();
  const resources: AllowedResource[] = ["quests"];
  let touchRelation = false;
  let createdNpcId: number | undefined;

  if (input.unlinkGivers) {
    unlinkAllGiversForQuest(npcs, givers, id);
    touchRelation = true;
  }

  if (input.createNpc || input.giverNpcId !== undefined) {
    if (
      input.giverNpcId !== undefined &&
      (input.giverNpcId == null || input.giverNpcId <= 0) &&
      !input.createNpc
    ) {
      unlinkAllGiversForQuest(npcs, givers, id);
      touchRelation = true;
    } else {
      const result = bindGiverOrCreate({
        npcs,
        givers,
        questId: id,
        giverNpcId: input.giverNpcId,
        createNpc: input.createNpc,
        replaceNpcQuest: input.replaceNpcQuest,
      });
      createdNpcId = result.createdNpcId;
      touchRelation = touchRelation || result.touchRelation;
    }
  }

  if (touchRelation) {
    resources.push("questGivers", "npcs");
  }

  const writes = [
    ...questWritePayload(quests),
    ...(touchRelation ? giverWritePayload(givers) : []),
    ...(touchRelation ? npcWritePayload(npcs) : []),
  ];

  const hints = persistAtomic(writes, session, "update-quest", id, resources);
  return { hints, npcId: createdNpcId };
}

export function duplicateQuest(
  sourceId: number,
  opts: {
    assignMode: AssignNpcMode;
    giverNpcId?: number | null;
    createNpc?: QuestNpcDraft | null;
    replaceNpcQuest?: boolean;
  },
  session: SessionPayload,
): { id: number; npcId?: number; hints: string[] } {
  const quests = loadQuests();
  const source = quests[String(sourceId)];
  if (!source) throw new Error(`Quest ${sourceId} no existe`);

  const newId = peekNextQuestId();
  const copy = emptyQuest(newId, {
    name: `${String(source.name ?? "Quest")} - copia`,
    desc: String(source.desc ?? ""),
    repeatable: Boolean(source.repeatable),
    requiredNpcs: structuredClone(source.requiredNpcs ?? []),
    requiredObjs: structuredClone(source.requiredObjs ?? []),
    rewardGold: Number(source.rewardGold ?? 0),
    rewardExp: Number(source.rewardExp ?? 0),
    rewardPoints: Number(source.rewardPoints ?? 0),
    rewardObjs: structuredClone(source.rewardObjs ?? []),
  });

  return createQuest(
    {
      quest: copy,
      giverNpcId:
        opts.assignMode === "existing" ? (opts.giverNpcId ?? null) : undefined,
      createNpc: opts.assignMode === "create" ? opts.createNpc : null,
      replaceNpcQuest: opts.replaceNpcQuest,
    },
    session,
    newId,
  );
}

export function deleteQuest(
  id: number,
  session: SessionPayload,
): { hints: string[]; unlinkedNpcIds: number[] } {
  const quests = loadQuests();
  if (!quests[String(id)]) throw new Error(`Quest ${id} no existe`);

  const npcs = loadNpcs() as Record<string, Record<string, unknown>>;
  const givers = loadQuestGivers();
  const unlinked = unlinkAllGiversForQuest(npcs, givers, id);
  delete quests[String(id)];

  const writes = [
    ...questWritePayload(quests),
    ...giverWritePayload(givers),
    ...npcWritePayload(npcs),
  ];

  const hints = persistAtomic(writes, session, "delete-quest", id, [
    "quests",
    "questGivers",
    "npcs",
  ]);
  return { hints, unlinkedNpcIds: unlinked };
}

export function checkNpcQuestConflict(npcId: number, questId: number) {
  const bound = getNpcBoundQuestId(npcId);
  if (bound > 0 && bound !== questId) {
    const quests = loadQuests();
    const q = quests[String(bound)];
    return {
      conflict: true as const,
      questId: bound,
      questName: String(q?.name ?? `Quest ${bound}`),
    };
  }
  return { conflict: false as const };
}
