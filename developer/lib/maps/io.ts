import fs from "node:fs";
import path from "node:path";
import { appendAudit } from "../security/audit";
import type { SessionPayload } from "../security/auth";
import { createBackup } from "../game-data/backups";
import { assertPathUnder, ensureDir, PATHS } from "../security/paths";
import { buildEditorState, collapseTerrain } from "./terrain";
import type {
  EditorMapState,
  MapMeta,
  NpcPlacement,
  SpecialsFile,
  TerrainFile,
} from "./types";
import { tileKey } from "./types";

function mapDir(mapId: number): string {
  const root = PATHS.serverMaps();
  const dir = path.join(root, `mapa_${mapId}`);
  return assertPathUnder(dir, root);
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

export function mapExists(mapId: number): boolean {
  try {
    return fs.existsSync(mapDir(mapId));
  } catch {
    return false;
  }
}

export function listMapSummaries(): Array<{
  id: number;
  name: string;
  dir: string;
  width?: number;
  height?: number;
  npcCount?: number;
  specialCount?: number;
  zona?: string;
  pk?: number;
}> {
  const root = PATHS.serverMaps();
  if (!fs.existsSync(root)) return [];

  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("mapa_"))
    .map((d) => d.name)
    .sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));

  return dirs.map((dir) => {
    const id = Number(dir.slice(5));
    const abs = path.join(root, dir);
    let name = dir;
    let width: number | undefined;
    let height: number | undefined;
    let npcCount = 0;
    let specialCount = 0;
    let zona: string | undefined;
    let pk: number | undefined;

    const metaPath = path.join(abs, "meta.json");
    if (fs.existsSync(metaPath)) {
      try {
        const meta = readJson<MapMeta>(metaPath);
        name = String(meta.name ?? name);
        zona = meta.zona != null ? String(meta.zona) : undefined;
        pk = meta.pk != null ? Number(meta.pk) : undefined;
      } catch {
        /* ignore */
      }
    }

    const terrainPath = path.join(abs, "terrain.json");
    if (fs.existsSync(terrainPath)) {
      try {
        const terrain = readJson<TerrainFile>(terrainPath);
        width = terrain.width;
        height = terrain.height;
      } catch {
        /* ignore */
      }
    }

    const npcsPath = path.join(abs, "npcs.json");
    if (fs.existsSync(npcsPath)) {
      try {
        const npcs = readJson<unknown[]>(npcsPath);
        npcCount = Array.isArray(npcs) ? npcs.length : 0;
      } catch {
        /* ignore */
      }
    }

    const specialsPath = path.join(abs, "specials.json");
    if (fs.existsSync(specialsPath)) {
      try {
        const specials = readJson<SpecialsFile>(specialsPath);
        specialCount =
          Object.keys(specials.exits ?? {}).length +
          Object.keys(specials.objects ?? {}).length +
          Object.keys(specials.triggers ?? {}).length +
          Object.keys(specials.npcs ?? {}).length;
      } catch {
        /* ignore */
      }
    }

    return { id, name, dir, width, height, npcCount, specialCount, zona, pk };
  });
}

export function loadMapEditorState(mapId: number): EditorMapState {
  const dir = mapDir(mapId);
  if (!fs.existsSync(dir)) {
    throw new Error(`Mapa ${mapId} no existe`);
  }

  const metaPath = path.join(dir, "meta.json");
  const terrainPath = path.join(dir, "terrain.json");
  const specialsPath = path.join(dir, "specials.json");
  const npcsPath = path.join(dir, "npcs.json");

  if (!fs.existsSync(terrainPath)) {
    throw new Error(`Mapa ${mapId} sin terrain.json`);
  }

  const meta = fs.existsSync(metaPath)
    ? readJson<MapMeta>(metaPath)
    : ({ id: mapId, name: `Mapa ${mapId}` } as MapMeta);
  const terrain = readJson<TerrainFile>(terrainPath);
  const specials = fs.existsSync(specialsPath)
    ? readJson<SpecialsFile>(specialsPath)
    : ({ id: mapId } as SpecialsFile);

  // Prefer npcs.json as canonical placements if present
  if (fs.existsSync(npcsPath)) {
    try {
      const placements = readJson<NpcPlacement[]>(npcsPath);
      if (Array.isArray(placements)) {
        const npcs: Record<string, number> = {};
        for (const p of placements) {
          if (p.x > 0 && p.y > 0 && p.npcIndex > 0) {
            npcs[tileKey(p.x, p.y)] = p.npcIndex;
          }
        }
        specials.npcs = npcs;
      }
    } catch {
      /* keep specials.npcs */
    }
  }

  meta.id = mapId;
  return buildEditorState({ meta, terrain, specials });
}

function validateEditorState(state: EditorMapState): void {
  if (!Number.isInteger(state.id) || state.id < 1) {
    throw new Error("ID de mapa inválido");
  }
  if (state.width < 1 || state.height < 1 || state.width > 200 || state.height > 200) {
    throw new Error("Tamaño de mapa fuera de rango");
  }
  if (state.tiles.length !== state.height) {
    throw new Error("Filas de terrain inconsistentes");
  }
  for (const row of state.tiles) {
    if (row.length !== state.width) {
      throw new Error("Columnas de terrain inconsistentes");
    }
  }
  if (!state.meta?.name) {
    throw new Error("meta.name obligatorio");
  }
}

function specialsToFile(state: EditorMapState): SpecialsFile {
  const file: SpecialsFile = { id: state.id };
  if (Object.keys(state.specials.exits).length) file.exits = state.specials.exits;
  if (Object.keys(state.specials.objects).length) {
    file.objects = state.specials.objects;
  }
  if (Object.keys(state.specials.npcs).length) file.npcs = state.specials.npcs;
  if (Object.keys(state.specials.triggers).length) {
    file.triggers = state.specials.triggers;
  }
  return file;
}

function npcsToPlacements(state: EditorMapState): NpcPlacement[] {
  const out: NpcPlacement[] = [];
  for (const [key, npcIndex] of Object.entries(state.specials.npcs)) {
    const [xs, ys] = key.split(",");
    const x = Number(xs);
    const y = Number(ys);
    if (!Number.isInteger(x) || !Number.isInteger(y) || npcIndex <= 0) continue;
    out.push({ mapNum: state.id, x, y, npcIndex });
  }
  out.sort((a, b) => a.y - b.y || a.x - b.x);
  return out;
}

export function saveMapEditorState(
  state: EditorMapState,
  session: SessionPayload,
): void {
  validateEditorState(state);
  const dir = mapDir(state.id);
  ensureDir(dir);

  const metaPath = path.join(dir, "meta.json");
  const terrainPath = path.join(dir, "terrain.json");
  const specialsPath = path.join(dir, "specials.json");
  const npcsPath = path.join(dir, "npcs.json");

  const terrain = collapseTerrain(
    state.id,
    state.width,
    state.height,
    state.tiles,
  );
  // Round-trip validate
  JSON.parse(JSON.stringify(terrain));
  JSON.parse(JSON.stringify(state.meta));
  const specials = specialsToFile(state);
  const placements = npcsToPlacements(state);

  createBackup({
    resource: "map",
    resourceId: state.id,
    absoluteFiles: [metaPath, terrainPath, specialsPath, npcsPath].filter((f) =>
      fs.existsSync(f),
    ),
  });

  const meta: MapMeta = { ...state.meta, id: state.id };

  // Atomic: write temps then rename
  const writes: Array<{ dest: string; data: unknown }> = [
    { dest: metaPath, data: meta },
    { dest: terrainPath, data: terrain },
    { dest: specialsPath, data: specials },
    { dest: npcsPath, data: placements },
  ];

  const temps: string[] = [];
  try {
    for (const { dest, data } of writes) {
      const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`;
      const serialized = JSON.stringify(data);
      JSON.parse(serialized);
      fs.writeFileSync(tmp, serialized, "utf8");
      temps.push(tmp);
    }
    for (let i = 0; i < writes.length; i++) {
      fs.renameSync(temps[i]!, writes[i]!.dest);
    }
  } catch (error) {
    for (const tmp of temps) {
      try {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
    throw error;
  }

  for (const file of [metaPath, terrainPath, specialsPath, npcsPath]) {
    appendAudit(session, {
      action: "save-map",
      resourceType: "maps",
      resourceId: state.id,
      file,
    });
  }
}

export const MAP_RESTART_HINTS = [
  "Este cambio requiere reiniciar el Game Server",
  "Para ver el mapa en el cliente: exportar mapas optimizados + hard refresh",
];
