import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../../security/paths";

export type NpcReference = {
  kind: "map-spawn" | "map-special" | "quest" | "quest-giver";
  label: string;
  detail?: string;
  href?: string;
};

function scanMapNpcs(npcId: number): NpcReference[] {
  const roots = [PATHS.serverMaps(), PATHS.apiMaps()].filter((r) =>
    fs.existsSync(r),
  );
  const seen = new Set<string>();
  const out: NpcReference[] = [];

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
      const mapId = dir.replace("mapa_", "");
      const npcsPath = path.join(root, dir, "npcs.json");
      if (fs.existsSync(npcsPath)) {
        try {
          const list = JSON.parse(fs.readFileSync(npcsPath, "utf8")) as Array<{
            npcIndex?: number;
          }>;
          let count = 0;
          if (Array.isArray(list)) {
            for (const p of list) {
              if (Number(p.npcIndex) === npcId) count++;
            }
          }
          if (count > 0) {
            const key = `spawn:${mapId}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push({
                kind: "map-spawn",
                label: `Mapa ${mapId}`,
                detail: `${count} spawn(s)`,
                href: `/maps/${mapId}`,
              });
            }
          }
        } catch {
          /* ignore */
        }
      }
      const specialsPath = path.join(root, dir, "specials.json");
      if (fs.existsSync(specialsPath)) {
        try {
          const specials = JSON.parse(
            fs.readFileSync(specialsPath, "utf8"),
          ) as { npcs?: Record<string, number> };
          let count = 0;
          for (const v of Object.values(specials.npcs ?? {})) {
            if (Number(v) === npcId) count++;
          }
          if (count > 0) {
            const key = `special:${mapId}`;
            if (!seen.has(key)) {
              seen.add(key);
              out.push({
                kind: "map-special",
                label: `Mapa ${mapId} (specials)`,
                detail: `${count} tile(s)`,
                href: `/maps/${mapId}`,
              });
            }
          }
        } catch {
          /* ignore */
        }
      }
    }
  }
  return out;
}

function scanQuests(npcId: number): NpcReference[] {
  const out: NpcReference[] = [];
  const repoRoot = path.dirname(path.dirname(PATHS.serverMaps()));
  const questFiles = [
    path.join(repoRoot, "server", "jsons", "quests.json"),
    path.join(PATHS.apiJsons(), "quests.json"),
  ];
  for (const p of questFiles) {
    if (!fs.existsSync(p)) continue;
    try {
      const raw = JSON.parse(fs.readFileSync(p, "utf8")) as unknown;
      const list = Array.isArray(raw)
        ? raw
        : Object.entries(raw as Record<string, unknown>).map(([id, q]) => ({
            ...(q as object),
            id: Number(id),
          }));
      for (const q of list as Array<{
        id?: number;
        name?: string;
        requiredNpcs?: Array<{ index?: number }>;
      }>) {
        if ((q.requiredNpcs ?? []).some((r) => Number(r.index) === npcId)) {
          out.push({
            kind: "quest",
            label: `Quest ${q.id ?? "?"} — ${q.name ?? ""}`,
            detail: "requiredNpcs",
          });
        }
      }
    } catch {
      /* ignore */
    }
    break;
  }

  const giverFiles = [
    path.join(repoRoot, "server", "jsons", "questGivers.json"),
    path.join(PATHS.apiJsons(), "questGivers.json"),
  ];
  for (const p of giverFiles) {
    if (!fs.existsSync(p)) continue;
    try {
      const givers = JSON.parse(fs.readFileSync(p, "utf8")) as Record<
        string,
        number
      >;
      if (givers[String(npcId)] != null) {
        out.push({
          kind: "quest-giver",
          label: `Quest giver → quest ${givers[String(npcId)]}`,
        });
      }
    } catch {
      /* ignore */
    }
    break;
  }
  return out;
}

export function findNpcReferences(npcId: number): NpcReference[] {
  return [...scanMapNpcs(npcId), ...scanQuests(npcId)];
}
