import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../security/paths";
import { getTexturePublicPath, loadGraphicsDb, resolveGrh } from "./grh";

export type FxEntry = {
  id: number;
  grh: number;
  offsetX: number;
  offsetY: number;
};

let fxsCache: Record<string, { grh: number; offsetX: number; offsetY: number }> | null =
  null;

export function loadFxsDb() {
  if (!fxsCache) {
    const file = path.join(PATHS.frontendInit(), "fxs.json");
    if (!fs.existsSync(file)) {
      fxsCache = {};
    } else {
      fxsCache = JSON.parse(fs.readFileSync(file, "utf8")) as typeof fxsCache;
    }
  }
  return fxsCache!;
}

export function resolveFx(fxId: number): FxEntry | null {
  if (!fxId) return null;
  const entry = loadFxsDb()[String(fxId)];
  if (!entry) return null;
  return {
    id: fxId,
    grh: Number(entry.grh ?? 0),
    offsetX: Number(entry.offsetX ?? 0),
    offsetY: Number(entry.offsetY ?? 0),
  };
}

export type AnimFramePreview = {
  textureUrl: string;
  sX: number;
  sY: number;
  width: number;
  height: number;
};

/** Resolve FX catalog id → animation frames (same GRH chain as the game). */
export function resolveFxAnimation(fxId: number): {
  fx: FxEntry;
  grhIndex: number;
  numFrames: number;
  /** ms per frame — mirrors entityOverlays Math.max(speed||500, 40) */
  frameMs: number;
  frames: AnimFramePreview[];
} | null {
  const fx = resolveFx(fxId);
  if (!fx || !fx.grh) return null;
  const db = loadGraphicsDb();
  const header = db[String(fx.grh)];
  if (!header) return null;

  const frameIds: number[] = [];
  if (header.frames && Object.keys(header.frames).length > 0) {
    const keys = Object.keys(header.frames).sort(
      (a, b) => Number(a) - Number(b),
    );
    for (const k of keys) {
      frameIds.push(Number(header.frames![k]));
    }
  } else {
    frameIds.push(fx.grh);
  }

  const frames: AnimFramePreview[] = [];
  for (const id of frameIds) {
    const g = resolveGrh(id);
    if (!g || !g.numFile) continue;
    frames.push({
      textureUrl: getTexturePublicPath(g),
      sX: g.sX,
      sY: g.sY,
      width: g.width,
      height: g.height,
    });
  }

  const speed = header.speed != null ? Number(header.speed) : 500;
  const frameMs = Math.max(speed || 500, 40);

  return {
    fx,
    grhIndex: fx.grh,
    numFrames: frames.length || Number(header.numFrames ?? 1),
    frameMs,
    frames,
  };
}

export function listFxSummaries() {
  return Object.entries(loadFxsDb()).map(([id, e]) => ({
    id: Number(id),
    grh: Number(e.grh ?? 0),
    offsetX: Number(e.offsetX ?? 0),
    offsetY: Number(e.offsetY ?? 0),
  }));
}
