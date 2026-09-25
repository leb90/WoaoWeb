import fs from "node:fs";
import path from "node:path";
import { appendAudit } from "../security/audit";
import type { SessionPayload } from "../security/auth";
import { atomicWriteMultipleJson, createBackup } from "../game-data/backups";
import { assertPathUnder, ensureDir, PATHS } from "../security/paths";
import { buildEditorState, collapseTerrain } from "./terrain";
import type {
  EditorMapState,
  MapMeta,
  NpcPlacement,
  SpecialsFile,
  TerrainFile,
  TileExit,
} from "./types";
import { tileKey } from "./types";

type CompactTile = {
  b?: 1;
  g?: number | Array<number | null>;
  e?: { m: number; x: number; y: number };
  n?: number;
  t?: number;
  o?: { i: number; a: number };
};

type CompactMap = {
  id: number;
  w: number;
  h: number;
  d: number[];
  cx?: CompactTile[];
};

function mapDir(mapId: number): string {
  return mapDirForRoot(PATHS.serverMaps(), mapId);
}

function mapDirForRoot(root: string, mapId: number): string {
  const dir = path.join(root, `mapa_${mapId}`);
  return assertPathUnder(dir, root);
}

function frontendMapPath(root: string, mapId: number): string {
  const file = path.join(root, `mapa_${mapId}.json`);
  return assertPathUnder(file, root);
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

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function normalizeExitDestination(
  exit: TileExit | undefined,
): { map: number; x: number; y: number } | null {
  const raw =
    exit && typeof exit === "object" && "destinations" in exit
      ? exit.destinations?.[0]
      : exit;
  if (!raw) return null;

  const map = toFiniteNumber(raw.map);
  const x = toFiniteNumber(raw.x);
  const y = toFiniteNumber(raw.y);
  if (map === undefined || x === undefined || y === undefined) {
    return null;
  }
  return { map, x, y };
}

function buildCompactTile(
  x: number,
  y: number,
  terrain: TerrainFile,
  specials: SpecialsFile,
): CompactTile {
  const paletteId = terrain.rows[y - 1]?.[x - 1] ?? 0;
  const terrainTile = paletteId > 0 ? terrain.palette[String(paletteId)] : undefined;
  const coordinateKey = `${x},${y}`;
  const compactTile: CompactTile = {};

  if (terrainTile?.blocked) {
    compactTile.b = 1;
  }

  if (terrainTile?.graphics !== undefined) {
    compactTile.g = terrainTile.graphics;
  }

  const exit = normalizeExitDestination(specials.exits?.[coordinateKey]);
  if (exit) {
    compactTile.e = { m: exit.map, x: exit.x, y: exit.y };
  }

  const objectInfo = specials.objects?.[coordinateKey];
  const objIndex = toFiniteNumber(objectInfo?.objIndex);
  const amount = toFiniteNumber(objectInfo?.amount);
  if (objIndex !== undefined && amount !== undefined) {
    compactTile.o = { i: objIndex, a: amount };
  }

  const trigger = toFiniteNumber(specials.triggers?.[coordinateKey]);
  if (trigger !== undefined) {
    compactTile.t = trigger;
  }

  const npcIndex = toFiniteNumber(specials.npcs?.[coordinateKey]);
  if (npcIndex !== undefined) {
    compactTile.n = npcIndex;
  }

  return sortCompactTile(compactTile);
}

function sortCompactTile(tile: CompactTile): CompactTile {
  const result: CompactTile = {};
  if (tile.b) result.b = 1;
  if (tile.g !== undefined) result.g = tile.g;
  if (tile.e) result.e = tile.e;
  if (tile.n !== undefined) result.n = tile.n;
  if (tile.t !== undefined) result.t = tile.t;
  if (tile.o) result.o = tile.o;
  return result;
}

function buildCompactMap(
  mapId: number,
  terrain: TerrainFile,
  specials: SpecialsFile,
): CompactMap {
  const width = Math.max(1, toFiniteNumber(terrain.width) ?? 100);
  const height = Math.max(1, toFiniteNumber(terrain.height) ?? 100);
  const complexTiles: CompactTile[] = [];
  const complexIndexBySignature = new Map<string, number>();
  const data: number[] = [];

  for (let y = 1; y <= height; y++) {
    for (let x = 1; x <= width; x++) {
      const compactTile = buildCompactTile(x, y, terrain, specials);
      const tileKeys = Object.keys(compactTile);
      if (tileKeys.length === 0) {
        data.push(0);
        continue;
      }

      if (tileKeys.length === 1 && typeof compactTile.g === "number") {
        data.push(compactTile.g);
        continue;
      }

      if (
        tileKeys.length === 2 &&
        compactTile.b === 1 &&
        typeof compactTile.g === "number"
      ) {
        data.push(100000 + compactTile.g);
        continue;
      }

      const signature = JSON.stringify(compactTile);
      let complexIndex = complexIndexBySignature.get(signature);
      if (complexIndex === undefined) {
        complexIndex = complexTiles.length;
        complexIndexBySignature.set(signature, complexIndex);
        complexTiles.push(compactTile);
      }
      data.push(-(complexIndex + 1));
    }
  }

  return complexTiles.length > 0
    ? { id: mapId, w: width, h: height, d: data, cx: complexTiles }
    : { id: mapId, w: width, h: height, d: data };
}

function graphicsToExpanded(
  graphics: CompactTile["g"],
): Record<string, number> | undefined {
  if (typeof graphics === "number") {
    return { "1": graphics };
  }
  if (!Array.isArray(graphics)) {
    return undefined;
  }

  const out: Record<string, number> = {};
  for (let i = 0; i < graphics.length; i++) {
    const value = graphics[i];
    if (typeof value === "number") {
      out[String(i + 1)] = value;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function compactTileToExpanded(tile: CompactTile): Record<string, unknown> {
  const expanded: Record<string, unknown> = {};
  if (tile.b) expanded.blocked = tile.b;
  const graphics = graphicsToExpanded(tile.g);
  if (graphics) expanded.graphics = graphics;
  if (tile.e) {
    expanded.tileExit = { map: tile.e.m, x: tile.e.x, y: tile.e.y };
  }
  if (tile.t !== undefined) expanded.trigger = tile.t;
  if (tile.o) {
    expanded.objInfo = { objIndex: tile.o.i, amount: tile.o.a };
  }
  return expanded;
}

function buildExpandedClientMap(
  mapId: number,
  terrain: TerrainFile,
  specials: SpecialsFile,
): Record<string, unknown> {
  const width = Math.max(1, toFiniteNumber(terrain.width) ?? 100);
  const height = Math.max(1, toFiniteNumber(terrain.height) ?? 100);
  const rows: Record<string, Record<string, unknown>> = {};

  for (let y = 1; y <= height; y++) {
    const row: Record<string, unknown> = {};
    for (let x = 1; x <= width; x++) {
      row[String(x)] = compactTileToExpanded(
        buildCompactTile(x, y, terrain, specials),
      );
    }
    rows[String(y)] = row;
  }

  return { [String(mapId)]: rows };
}

export function saveMapEditorState(
  state: EditorMapState,
  session: SessionPayload,
): void {
  validateEditorState(state);
  const serverDir = mapDir(state.id);
  const apiDir = mapDirForRoot(PATHS.apiMaps(), state.id);
  ensureDir(serverDir);
  ensureDir(apiDir);

  const sourceDirs = [serverDir, apiDir];

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
  const compactMap = buildCompactMap(state.id, terrain, specials);
  const frontendWrites: Array<{ absolutePath: string; data: unknown }> = [
    {
      absolutePath: frontendMapPath(PATHS.frontendMaps(), state.id),
      data: compactMap,
    },
    {
      absolutePath: frontendMapPath(PATHS.frontendMapsOptimized(), state.id),
      data: compactMap,
    },
  ];

  if (state.id >= 500 && state.id < 600) {
    frontendWrites.push({
      absolutePath: frontendMapPath(PATHS.frontendLocalMaps(), state.id),
      data: buildExpandedClientMap(state.id, terrain, specials),
    });
  }

  const meta: MapMeta = { ...state.meta, id: state.id };
  const writes: Array<{ absolutePath: string; data: unknown }> = [
    ...sourceDirs.flatMap((dir) => [
      { absolutePath: path.join(dir, "meta.json"), data: meta },
      { absolutePath: path.join(dir, "terrain.json"), data: terrain },
      { absolutePath: path.join(dir, "specials.json"), data: specials },
      { absolutePath: path.join(dir, "npcs.json"), data: placements },
    ]),
    ...frontendWrites,
  ];
  const backup = createBackup({
    resource: "map",
    resourceId: state.id,
    absoluteFiles: writes.map((write) => write.absolutePath),
  });
  atomicWriteMultipleJson(writes, { backupId: backup.id });

  for (const file of writes.map((write) => write.absolutePath)) {
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
  "Se publicaron copias para server, api y cliente; hacer hard refresh del cliente",
];
