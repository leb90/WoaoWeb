import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getRepoRoot, PATHS } from "../security/paths";
import {
  loadGraphicsDb,
  resolveGraphicsPngAbsolute,
  resolveGrh,
  type GraphicData,
} from "./grh";
import type { DirectionId, SpriteKind } from "./spriteImport";

export type MannequinFrame = {
  grh: number;
  src: string;
  width: number;
  height: number;
};

export type MannequinPayload = {
  body: {
    id: number;
    headOffsetX: number;
    headOffsetY: number;
    frames: Record<DirectionId, MannequinFrame[]>;
  };
  head: {
    id: number;
    frames: Record<DirectionId, MannequinFrame[]>;
  };
  item: {
    kind: SpriteKind;
    anim: number;
    offsetX: number;
    offsetY: number;
    headOffsetX: number;
    headOffsetY: number;
    frames: Record<DirectionId, MannequinFrame[]>;
  } | null;
};

const DIRECTIONS: DirectionId[] = ["1", "2", "3", "4"];

function initFile(name: string): string {
  return path.join(PATHS.frontendInit(), name);
}

function catalogFile(kind: SpriteKind): string {
  if (kind === "body") return initFile("bodies.json");
  if (kind === "helmet") return initFile("cascos.json");
  if (kind === "shield") return initFile("escudos.json");
  return initFile("armas.json");
}

function readCatalog(kind: SpriteKind): Record<string, Record<string, number>> {
  return JSON.parse(fs.readFileSync(catalogFile(kind), "utf8")) as Record<string, Record<string, number>>;
}

function frameIdsOf(grhId: number): number[] {
  const entry = loadGraphicsDb()[String(grhId)];
  if (!entry) return [];
  if (entry.frames && entry.numFrames > 1) {
    return Object.keys(entry.frames)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => Number(entry.frames?.[key]))
      .filter((id) => id > 0);
  }
  return [grhId];
}

function staticGraphic(grhId: number): GraphicData | null {
  const entry = loadGraphicsDb()[String(grhId)];
  if (entry && entry.numFile > 0 && entry.width > 0 && entry.height > 0) return entry;
  return resolveGrh(grhId);
}

async function paintFrames(grhId: number, files: Map<number, Buffer>): Promise<MannequinFrame[]> {
  const frames: MannequinFrame[] = [];
  for (const id of frameIdsOf(grhId).slice(0, 8)) {
    const graphic = staticGraphic(id);
    if (!graphic) continue;
    let file = files.get(graphic.numFile);
    if (!file) {
      file = fs.readFileSync(resolveGraphicsPngAbsolute(graphic.numFile));
      files.set(graphic.numFile, file);
    }
    const png = await sharp(file)
      .extract({
        left: graphic.sX,
        top: graphic.sY,
        width: graphic.width,
        height: graphic.height,
      })
      .png()
      .toBuffer();
    frames.push({
      grh: id,
      src: `data:image/png;base64,${png.toString("base64")}`,
      width: graphic.width,
      height: graphic.height,
    });
  }
  return frames;
}

async function paintCatalog(
  record: Record<string, number> | undefined,
  files: Map<number, Buffer>,
): Promise<Record<DirectionId, MannequinFrame[]>> {
  const frames = {} as Record<DirectionId, MannequinFrame[]>;
  for (const direction of DIRECTIONS) {
    frames[direction] = record ? await paintFrames(Number(record[direction] ?? 0), files) : [];
  }
  return frames;
}

export async function loadMannequin(options: {
  kind?: SpriteKind;
  anim?: number;
  bodyId?: number;
  headId?: number;
}): Promise<MannequinPayload> {
  const files = new Map<number, Buffer>();
  const bodies = readCatalog("body");
  const heads = JSON.parse(fs.readFileSync(initFile("heads.json"), "utf8")) as Record<string, Record<string, number>>;
  const bodyId = options.bodyId && bodies[String(options.bodyId)] ? options.bodyId : 1;
  const headId = options.headId && heads[String(options.headId)] ? options.headId : 1;
  const bodyRecord = bodies[String(bodyId)];
  const useItemAsBody = options.kind === "body" && options.anim && bodies[String(options.anim)];
  const shownBody = useItemAsBody ? bodies[String(options.anim)] : bodyRecord;

  const itemRecord =
    options.kind && options.anim && options.kind !== "body"
      ? readCatalog(options.kind)[String(options.anim)]
      : undefined;

  return {
    body: {
      id: useItemAsBody ? Number(options.anim) : bodyId,
      headOffsetX: Number(shownBody?.headOffsetX ?? 0),
      headOffsetY: Number(shownBody?.headOffsetY ?? 0),
      frames: await paintCatalog(shownBody, files),
    },
    head: {
      id: headId,
      frames: await paintCatalog(heads[String(headId)], files),
    },
    item: itemRecord
      ? {
          kind: options.kind as SpriteKind,
          anim: Number(options.anim),
          offsetX: Number(itemRecord.offsetX ?? 0),
          offsetY: Number(itemRecord.offsetY ?? 0),
          headOffsetX: Number(itemRecord.headOffsetX ?? 0),
          headOffsetY: Number(itemRecord.headOffsetY ?? 0),
          frames: await paintCatalog(itemRecord, files),
        }
      : null,
  };
}

export function collectFrameIds(kind: SpriteKind, anim: number, direction?: DirectionId): number[] {
  const record = readCatalog(kind)[String(anim)];
  if (!record) throw new Error("No existe esa animación.");
  const directions: DirectionId[] = direction ? [direction] : ["1", "2", "3", "4"];
  const ids = directions.flatMap((item) => frameIdsOf(Number(record[item] ?? 0)));
  return [...new Set(ids)];
}

export async function shiftGraphics(grhIds: number[], dx: number, dy: number): Promise<void> {
  if (dx === 0 && dy === 0) return;
  const ids = [...new Set(grhIds)].filter((id) => id > 0);
  if (ids.length === 0) throw new Error("Esa dirección no tiene frames.");
  if (ids.length > 48) throw new Error("Hay demasiados frames para moverlos juntos.");
  for (const id of ids) {
    await shiftGraphic(id, dx, dy);
  }
}

export async function shiftGraphic(grhId: number, dx: number, dy: number): Promise<void> {
  const graphic = staticGraphic(grhId);
  if (!graphic) throw new Error("Ese GRH no es un frame dibujable.");
  const filePath = resolveGraphicsPngAbsolute(graphic.numFile);
  const source = fs.readFileSync(filePath);
  const { data, info } = await sharp(source)
    .extract({ left: graphic.sX, top: graphic.sY, width: graphic.width, height: graphic.height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const shifted = Buffer.alloc(data.length);
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const nextX = x + dx;
      const nextY = y + dy;
      if (nextX < 0 || nextY < 0 || nextX >= info.width || nextY >= info.height) continue;
      const from = (y * info.width + x) * 4;
      const to = (nextY * info.width + nextX) * 4;
      shifted[to] = data[from];
      shifted[to + 1] = data[from + 1];
      shifted[to + 2] = data[from + 2];
      shifted[to + 3] = data[from + 3];
    }
  }
  const full = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const dest = Buffer.from(full.data);
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixel = ((graphic.sY + y) * full.info.width + graphic.sX + x) * 4;
      dest[pixel] = 0;
      dest[pixel + 1] = 0;
      dest[pixel + 2] = 0;
      dest[pixel + 3] = 0;
    }
  }
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const from = (y * info.width + x) * 4;
      if (shifted[from + 3] === 0) continue;
      const pixel = ((graphic.sY + y) * full.info.width + graphic.sX + x) * 4;
      dest[pixel] = shifted[from];
      dest[pixel + 1] = shifted[from + 1];
      dest[pixel + 2] = shifted[from + 2];
      dest[pixel + 3] = shifted[from + 3];
    }
  }
  const next = await sharp(dest, {
    raw: { width: full.info.width, height: full.info.height, channels: 4 },
  }).png().toBuffer();
  fs.writeFileSync(filePath, next);
}

function replaceJsonValue(filePath: string, key: string, value: unknown): void {
  const raw = fs.readFileSync(filePath, "utf8");
  const token = `${JSON.stringify(key)}:`;
  let start = -1;
  let valueStart = -1;
  let from = 0;
  while (from < raw.length) {
    const found = raw.indexOf(token, from);
    if (found < 0) break;
    let cursor = found + token.length;
    while (raw[cursor] === " " || raw[cursor] === "\n" || raw[cursor] === "\r" || raw[cursor] === "\t") cursor += 1;
    if (raw[cursor] === "{" || raw[cursor] === "[") {
      start = found;
      valueStart = cursor;
      break;
    }
    from = found + token.length;
  }
  if (start < 0 || valueStart < 0) throw new Error(`No está la clave ${key} en ${path.basename(filePath)}.`);
  const opener = raw[valueStart];
  const closer = opener === "{" ? "}" : "]";
  let index = valueStart;
  let depth = 0;
  for (; index < raw.length; index += 1) {
    if (raw[index] === opener) depth += 1;
    else if (raw[index] === closer) {
      depth -= 1;
      if (depth === 0) {
        index += 1;
        break;
      }
    }
  }
  const next = `${raw.slice(0, start + token.length)}${JSON.stringify(value)}${raw.slice(index)}`;
  JSON.parse(next);
  fs.writeFileSync(filePath, next);
}

export function saveCatalogOffset(
  kind: SpriteKind,
  anim: number,
  offsetX: number,
  offsetY: number,
): void {
  const filePath = catalogFile(kind);
  const catalog = readCatalog(kind);
  const current = catalog[String(anim)];
  if (!current) throw new Error("No existe esa animación.");
  const next = { ...current };
  if (kind === "body") {
    next.headOffsetX = offsetX;
    next.headOffsetY = offsetY;
  } else {
    next.offsetX = offsetX;
    next.offsetY = offsetY;
  }
  replaceJsonValue(filePath, String(anim), next);
  bumpClientCatalog(kind);
}

export function swapCatalogDirections(kind: SpriteKind, anim: number, from: DirectionId, to: DirectionId): void {
  if (from === to) return;
  const current = readCatalog(kind)[String(anim)];
  if (!current) throw new Error("No existe esa animación.");
  const next = { ...current, [from]: current[to], [to]: current[from] };
  replaceJsonValue(catalogFile(kind), String(anim), next);
  bumpClientCatalog(kind);
}

export function rotateCatalogDirections(kind: SpriteKind, anim: number, clockwise: boolean): void {
  const current = readCatalog(kind)[String(anim)];
  if (!current) throw new Error("No existe esa animación.");
  const next = { ...current };
  if (clockwise) {
    next["3"] = current["1"];
    next["2"] = current["3"];
    next["4"] = current["2"];
    next["1"] = current["4"];
  } else {
    next["1"] = current["3"];
    next["4"] = current["1"];
    next["2"] = current["4"];
    next["3"] = current["2"];
  }
  replaceJsonValue(catalogFile(kind), String(anim), next);
  bumpClientCatalog(kind);
}

function bumpClientCatalog(kind: SpriteKind): void {
  const asset = kind === "body" ? "bodies.json" : kind === "helmet" ? "cascos.json" : kind === "shield" ? "escudos.json" : "armas.json";
  const filePath = path.join(getRepoRoot(), "frontend", "utils", "gameLoader.ts");
  const raw = fs.readFileSync(filePath, "utf8");
  const pattern = new RegExp(`(${asset.replace(".", "\\.")}\\?v=)(\\d+)\\.(\\d+)`, "g");
  const next = raw.replace(pattern, (_all, prefix: string, major: string, minor: string) => `${prefix}${major}.${Number(minor) + 1}`);
  if (next !== raw) fs.writeFileSync(filePath, next);
}
