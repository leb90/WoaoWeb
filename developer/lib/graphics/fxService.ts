import fs from "node:fs";
import path from "node:path";
import { createBackup } from "../game-data/backups";
import { PATHS } from "../security/paths";
import {
  getTexturePublicPath,
  loadGraphicsDb,
  resolveGrh,
  type GraphicData,
} from "./grh";
import { invalidateFxsCache, loadFxsDb, type FxEntry } from "./fxs";

export type FxFrameDetail = {
  index: number;
  grhId: number;
  numFile: number;
  textureUrl: string;
  sX: number;
  sY: number;
  width: number;
  height: number;
};

export type FxDetail = {
  fx: FxEntry;
  grhIndex: number;
  numFrames: number;
  speed: number;
  frameMs: number;
  frames: FxFrameDetail[];
};

export type FxFramePatch = {
  grhId: number;
  sX?: number;
  sY?: number;
  width?: number;
  height?: number;
};

export type FxSavePayload = {
  id: number;
  grh?: number;
  offsetX?: number;
  offsetY?: number;
  speed?: number;
  frames?: FxFramePatch[];
};

function fxsPath() {
  return path.join(PATHS.frontendInit(), "fxs.json");
}

function graphicsPaths() {
  const init = PATHS.frontendInit();
  return {
    verbose: path.join(init, "graficos.json"),
    optimized: path.join(init, "graficos_optimized.json"),
  };
}

function findMatching(raw: string, start: number, openChar: string, closeChar: string) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < raw.length; i += 1) {
    const char = raw[i];
    if (inStr) {
      if (esc) esc = false;
      else if (char === "\\") esc = true;
      else if (char === '"') inStr = false;
      continue;
    }
    if (char === '"') {
      inStr = true;
      continue;
    }
    if (char === openChar) depth += 1;
    else if (char === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  throw new Error(`No se cerró ${openChar}`);
}

function replaceJsonKeyValue(raw: string, key: string, nextValue: unknown): string {
  const match = raw.match(new RegExp(`"${key}"\\s*:\\s*`));
  if (!match || match.index == null) {
    throw new Error(`No se encontró la clave ${key}`);
  }
  const valueStart = match.index + match[0].length;
  const first = raw[valueStart];
  let valueEnd: number;
  if (first === "{" || first === "[") {
    valueEnd = findMatching(raw, valueStart, first, first === "{" ? "}" : "]");
  } else if (first === '"') {
    valueEnd = findMatching(raw, valueStart, '"', '"');
  } else {
    const m = raw.slice(valueStart).match(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/);
    if (!m) throw new Error(`Valor no soportado para ${key}`);
    valueEnd = valueStart + m[0].length - 1;
  }
  return `${raw.slice(0, valueStart)}${JSON.stringify(nextValue)}${raw.slice(valueEnd + 1)}`;
}

function upsertJsonKeyValue(raw: string, key: string, nextValue: unknown): string {
  try {
    return replaceJsonKeyValue(raw, key, nextValue);
  } catch {
    const trimmed = raw.trimEnd();
    if (!trimmed.endsWith("}")) throw new Error("JSON inválido");
    const body = trimmed.slice(0, -1).trimEnd();
    const payload = `${JSON.stringify(key)}:${JSON.stringify(nextValue)}`;
    const next = `${body}${body.endsWith("{") ? "" : ","}${payload}}`;
    JSON.parse(next);
    return next;
  }
}

function toVerboseFrame(grhId: number, data: GraphicData): Record<string, unknown> {
  return {
    numFrames: 1,
    numFile: data.numFile,
    sX: data.sX,
    sY: data.sY,
    width: data.width,
    height: data.height,
    frames: { "1": grhId },
  };
}

function toCompactFrame(data: GraphicData): unknown {
  return [data.numFile, data.sX, data.sY, data.width, data.height];
}

function invalidateGraphicsCache() {
  // loadGraphicsDb caches by mtime; rewriting the file is enough.
}

export function getFxDetail(fxId: number): FxDetail | null {
  const db = loadFxsDb();
  const entry = db[String(fxId)];
  if (!entry) return null;

  const graphics = loadGraphicsDb();
  const grhIndex = Number(entry.grh ?? 0);
  const header = graphics[String(grhIndex)];
  if (!header) return null;

  const frameIds: number[] = [];
  if (header.frames && Object.keys(header.frames).length > 0) {
    const keys = Object.keys(header.frames).sort((a, b) => Number(a) - Number(b));
    for (const key of keys) frameIds.push(Number(header.frames![key]));
  } else {
    frameIds.push(grhIndex);
  }

  const frames: FxFrameDetail[] = [];
  for (let i = 0; i < frameIds.length; i += 1) {
    const grhId = frameIds[i]!;
    const resolved = resolveGrh(grhId);
    if (!resolved || !resolved.numFile) continue;
    frames.push({
      index: i + 1,
      grhId,
      numFile: resolved.numFile,
      textureUrl: getTexturePublicPath(resolved),
      sX: resolved.sX,
      sY: resolved.sY,
      width: resolved.width,
      height: resolved.height,
    });
  }

  const speed = header.speed != null ? Number(header.speed) : 500;
  return {
    fx: {
      id: fxId,
      grh: grhIndex,
      offsetX: Number(entry.offsetX ?? 0),
      offsetY: Number(entry.offsetY ?? 0),
    },
    grhIndex,
    numFrames: frames.length || Number(header.numFrames ?? 1),
    speed,
    frameMs: Math.max(speed || 500, 40),
    frames,
  };
}

export function listFxDetails(): Array<
  FxEntry & {
    numFrames: number;
    speed: number;
    preview?: Pick<FxFrameDetail, "textureUrl" | "sX" | "sY" | "width" | "height">;
  }
> {
  return Object.keys(loadFxsDb())
    .map(Number)
    .sort((a, b) => a - b)
    .map((id) => {
      const detail = getFxDetail(id);
      const first = detail?.frames[0];
      return {
        id,
        grh: detail?.fx.grh ?? Number(loadFxsDb()[String(id)]?.grh ?? 0),
        offsetX: detail?.fx.offsetX ?? 0,
        offsetY: detail?.fx.offsetY ?? 0,
        numFrames: detail?.numFrames ?? 0,
        speed: detail?.speed ?? 0,
        preview: first
          ? {
              textureUrl: first.textureUrl,
              sX: first.sX,
              sY: first.sY,
              width: first.width,
              height: first.height,
            }
          : undefined,
      };
    });
}

export function saveFx(payload: FxSavePayload, username: string) {
  const id = Number(payload.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("FX id inválido");
  }

  const current = getFxDetail(id);
  if (!current && payload.grh == null) {
    throw new Error("FX no encontrado");
  }

  const paths = graphicsPaths();
  const files = [fxsPath(), paths.verbose, paths.optimized].filter((file) =>
    fs.existsSync(file),
  );
  createBackup({
    resource: "fxs",
    resourceId: id,
    absoluteFiles: files,
    note: `save fx ${id} by ${username}`,
  });

  const fxs = { ...loadFxsDb() };
  const prev = fxs[String(id)] ?? { grh: 0, offsetX: 0, offsetY: 0 };
  const nextGrh = payload.grh != null ? Number(payload.grh) : Number(prev.grh);
  if (!Number.isInteger(nextGrh) || nextGrh <= 0) {
    throw new Error("GRH inválido");
  }

  fxs[String(id)] = {
    grh: nextGrh,
    offsetX: payload.offsetX != null ? Number(payload.offsetX) : Number(prev.offsetX ?? 0),
    offsetY: payload.offsetY != null ? Number(payload.offsetY) : Number(prev.offsetY ?? 0),
  };
  fs.writeFileSync(fxsPath(), JSON.stringify(fxs));
  invalidateFxsCache();

  let verboseRaw = fs.readFileSync(paths.verbose, "utf8");
  let optimizedRaw = fs.readFileSync(paths.optimized, "utf8");
  const graphics = loadGraphicsDb();
  const header = graphics[String(nextGrh)];
  if (!header) {
    throw new Error(`No existe el GRH ${nextGrh}`);
  }

  if (payload.speed != null) {
    const speed = Math.max(1, Number(payload.speed));
    const frameIds =
      header.frames && Object.keys(header.frames).length > 0
        ? Object.keys(header.frames)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => Number(header.frames![key]))
        : [nextGrh];

    const verboseHeader =
      frameIds.length > 1 || (header.numFile <= 0 && frameIds[0] !== nextGrh)
        ? {
            numFrames: frameIds.length,
            frames: Object.fromEntries(frameIds.map((fid, idx) => [String(idx + 1), fid])),
            speed,
          }
        : {
            numFrames: 1,
            numFile: header.numFile,
            sX: header.sX,
            sY: header.sY,
            width: header.width,
            height: header.height,
            frames: { "1": nextGrh },
            speed,
          };

    const compactHeader =
      frameIds.length > 1 || (header.numFile <= 0 && frameIds[0] !== nextGrh)
        ? { f: frameIds.length, r: frameIds, s: speed }
        : {
            n: header.numFile,
            x: header.sX,
            y: header.sY,
            w: header.width,
            h: header.height,
            s: speed,
          };

    verboseRaw = upsertJsonKeyValue(verboseRaw, String(nextGrh), verboseHeader);
    optimizedRaw = upsertJsonKeyValue(optimizedRaw, String(nextGrh), compactHeader);
  }

  for (const frame of payload.frames ?? []) {
    const grhId = Number(frame.grhId);
    const existing = graphics[String(grhId)];
    if (!existing || !existing.numFile) {
      throw new Error(`Frame GRH ${grhId} no encontrado`);
    }
    const next: GraphicData = {
      ...existing,
      sX: frame.sX != null ? Number(frame.sX) : existing.sX,
      sY: frame.sY != null ? Number(frame.sY) : existing.sY,
      width: frame.width != null ? Number(frame.width) : existing.width,
      height: frame.height != null ? Number(frame.height) : existing.height,
      offset: undefined,
    };
    if (next.width <= 0 || next.height <= 0) {
      throw new Error(`Tamaño inválido en frame GRH ${grhId}`);
    }
    verboseRaw = upsertJsonKeyValue(verboseRaw, String(grhId), toVerboseFrame(grhId, next));
    optimizedRaw = upsertJsonKeyValue(optimizedRaw, String(grhId), toCompactFrame(next));
  }

  JSON.parse(verboseRaw);
  JSON.parse(optimizedRaw);
  fs.writeFileSync(paths.verbose, verboseRaw);
  fs.writeFileSync(paths.optimized, optimizedRaw);
  invalidateGraphicsCache();
  invalidateFxsCache();

  return getFxDetail(id);
}
