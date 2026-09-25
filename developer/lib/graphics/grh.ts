import fs from "node:fs";
import path from "node:path";
import { PATHS, assertPathUnder } from "../security/paths";

export type GraphicData = {
  numFrames: number;
  numFile: number;
  sX: number;
  sY: number;
  width: number;
  height: number;
  frames?: Record<string, number>;
  speed?: number;
  offset?: { x: number; y: number };
};

type GraphicsDb = Record<string, GraphicData>;

let cachedDb: GraphicsDb | null = null;
let cachedDbMtime = -1;

function buildFrames(
  graphicId: number,
  frameIds: number[] | undefined,
  defaultToSelf: boolean,
): Record<string, number> | undefined {
  if (frameIds && frameIds.length > 0) {
    const frames: Record<string, number> = {};
    for (let i = 0; i < frameIds.length; i++) {
      frames[String(i + 1)] = Number(frameIds[i]);
    }
    return frames;
  }
  if (defaultToSelf) {
    return { "1": graphicId };
  }
  return undefined;
}

function decompressEntry(
  graphicId: string,
  raw: unknown,
): GraphicData | null {
  if (!raw) return null;
  const idNum = Number(graphicId);

  if (Array.isArray(raw)) {
    const [numFile, sX, sY, width, height] = raw as number[];
    return {
      numFrames: 1,
      numFile: Number(numFile),
      sX: Number(sX),
      sY: Number(sY),
      width: Number(width),
      height: Number(height),
      frames: { "1": idNum },
    };
  }

  if (typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  // Optimized compact object { f, n, x, y, w, h, r, s, o }
  if ("n" in o || "f" in o || "r" in o) {
    const frameIds = Array.isArray(o.r) ? (o.r as number[]) : undefined;
    const hasStatic =
      o.n !== undefined &&
      o.x !== undefined &&
      o.y !== undefined &&
      o.w !== undefined &&
      o.h !== undefined;
    const numFrames = Number(
      o.f ?? (frameIds && frameIds.length > 0 ? frameIds.length : 1),
    );
    const frames = buildFrames(
      idNum,
      frameIds,
      hasStatic && !frameIds && numFrames <= 1,
    );

    const entry: GraphicData = {
      numFrames,
      numFile: hasStatic ? Number(o.n) : 0,
      sX: hasStatic ? Number(o.x) : 0,
      sY: hasStatic ? Number(o.y) : 0,
      width: hasStatic ? Number(o.w) : 0,
      height: hasStatic ? Number(o.h) : 0,
      frames,
      speed: o.s != null ? Number(o.s) : undefined,
      offset: o.o
        ? Array.isArray(o.o)
          ? { x: Number((o.o as number[])[0] ?? 0), y: Number((o.o as number[])[1] ?? 0) }
          : {
              x: Number((o.o as { x?: number }).x ?? 0),
              y: Number((o.o as { y?: number }).y ?? 0),
            }
        : undefined,
    };
    return entry;
  }

  // Legacy verbose
  return {
    numFrames: Number(o.numFrames ?? 1),
    numFile: Number(o.numFile ?? 0),
    sX: Number(o.sX ?? 0),
    sY: Number(o.sY ?? 0),
    width: Number(o.width ?? 0),
    height: Number(o.height ?? 0),
    frames: o.frames as Record<string, number> | undefined,
    speed: o.speed != null ? Number(o.speed) : undefined,
    offset: o.offset as { x: number; y: number } | undefined,
  };
}

export function loadGraphicsDb(): GraphicsDb {
  const init = PATHS.frontendInit();
  const optimized = path.join(init, "graficos_optimized.json");
  const legacy = path.join(init, "graficos.json");
  const file = fs.existsSync(optimized) ? optimized : legacy;
  const mtime = fs.statSync(file).mtimeMs;
  if (cachedDb && cachedDbMtime === mtime) return cachedDb;

  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
    string,
    unknown
  >;
  const db: GraphicsDb = {};
  for (const [key, value] of Object.entries(raw)) {
    const entry = decompressEntry(key, value);
    if (entry) db[key] = entry;
  }
  cachedDb = db;
  cachedDbMtime = mtime;
  return db;
}

/**
 * Resolve a GRH for drawing. Animation headers (water, etc.) only have
 * frames[] — follow frame 1 to the real atlas rect (same as the game client).
 */
export function resolveGrh(grhIndex: number): GraphicData | null {
  if (!grhIndex) return null;
  const db = loadGraphicsDb();
  const entry = db[String(grhIndex)];
  if (!entry) return null;

  if (entry.numFile > 0 && entry.width > 0 && entry.height > 0) {
    return entry;
  }

  const frameId =
    entry.frames?.["1"] ??
    (entry.frames ? Number(Object.values(entry.frames)[0]) : 0);
  if (frameId && frameId !== grhIndex) {
    const frame = db[String(frameId)];
    if (frame && frame.numFile > 0 && frame.width > 0) {
      return frame;
    }
  }

  return entry.numFile > 0 ? entry : null;
}

export function getTexturePublicPath(graphic: GraphicData): string {
  return `/api/assets/graphics/${graphic.numFile}.png`;
}

export function resolveGraphicsPngAbsolute(numFile: number): string {
  const root = PATHS.frontendGraphics();
  const candidate = path.join(root, `${numFile}.png`);
  return assertPathUnder(candidate, root);
}
