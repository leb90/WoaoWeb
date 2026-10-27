import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { createBackup } from "../game-data/backups";
import { PATHS, ensureDir } from "../security/paths";
import {
  appendIndexationSections,
  loadIndexationRecords,
  maxIndexationId,
  type IndexationInput,
} from "../maps/indexations";
import { resolveGraphicsPngAbsolute, resolveGrh } from "./grh";

export type MapSourceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type MapIndexRegion = MapSourceBox & {
  clientId: string;
  nombre: string;
  capa: number;
  bloquear: boolean;
  ancho: number;
  alto: number;
};

export type MapIndexCommitResult = {
  graphicFile: number;
  firstGrh: number;
  lastGrh: number;
  created: Array<{
    id: number;
    ordinal: number;
    nombre: string;
    grhIndice: number;
    ancho: number;
    alto: number;
    capa: number;
  }>;
  revision: number;
};

type GraphicEntry = {
  numFrames: number;
  numFile: number;
  sX: number;
  sY: number;
  width: number;
  height: number;
  frames: Record<string, number>;
};

type PackedRegion = MapIndexRegion & {
  atlasX: number;
  atlasY: number;
  pixelWidth: number;
  pixelHeight: number;
  grhIndice: number;
  referenceId: number;
};

const JOB_DIR = path.join(PATHS.data(), "map-index-jobs");
const MAX_IMAGE_SIDE = 4096;
const MAX_REGIONS = 300;
const MAX_TILES = 4096;

function jobPath(jobId: string): string {
  if (!/^[a-f0-9]{16}$/.test(jobId)) throw new Error("Trabajo de indexacion invalido.");
  return path.join(JOB_DIR, `${jobId}.png`);
}

export function readMapIndexJob(jobId: string): Buffer {
  const filePath = jobPath(jobId);
  if (!fs.existsSync(filePath)) throw new Error("La hoja ya no esta disponible. Volve a subirla.");
  return fs.readFileSync(filePath);
}

function foregroundMask(data: Buffer, width: number, height: number): Uint8Array {
  const corners = [0, width - 1, (height - 1) * width, width * height - 1];
  const transparentCorners = corners.filter((index) => data[index * 4 + 3] < 32).length;
  const alphaMode = transparentCorners >= 2;
  const background = corners.reduce(
    (sum, index) => ({
      r: sum.r + data[index * 4],
      g: sum.g + data[index * 4 + 1],
      b: sum.b + data[index * 4 + 2],
    }),
    { r: 0, g: 0, b: 0 },
  );
  background.r /= corners.length;
  background.g /= corners.length;
  background.b /= corners.length;
  const mask = new Uint8Array(width * height);
  for (let index = 0; index < mask.length; index += 1) {
    const alpha = data[index * 4 + 3];
    if (alpha < 24) continue;
    if (alphaMode) {
      mask[index] = 1;
      continue;
    }
    const dr = data[index * 4] - background.r;
    const dg = data[index * 4 + 1] - background.g;
    const db = data[index * 4 + 2] - background.b;
    if (dr * dr + dg * dg + db * db > 28 * 28) mask[index] = 1;
  }
  return mask;
}

function dilate(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
  const horizontal = new Uint8Array(mask.length);
  const result = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    let count = 0;
    for (let x = -radius; x < width + radius; x += 1) {
      const addX = x + radius;
      const removeX = x - radius - 1;
      if (addX >= 0 && addX < width) count += mask[y * width + addX];
      if (removeX >= 0 && removeX < width) count -= mask[y * width + removeX];
      if (x >= 0 && x < width && count > 0) horizontal[y * width + x] = 1;
    }
  }
  for (let x = 0; x < width; x += 1) {
    let count = 0;
    for (let y = -radius; y < height + radius; y += 1) {
      const addY = y + radius;
      const removeY = y - radius - 1;
      if (addY >= 0 && addY < height) count += horizontal[addY * width + x];
      if (removeY >= 0 && removeY < height) count -= horizontal[removeY * width + x];
      if (y >= 0 && y < height && count > 0) result[y * width + x] = 1;
    }
  }
  return result;
}

function connectedBoxes(mask: Uint8Array, width: number, height: number): MapSourceBox[] {
  const expanded = dilate(mask, width, height, 3);
  const seen = new Uint8Array(expanded.length);
  const boxes: MapSourceBox[] = [];
  for (let start = 0; start < expanded.length; start += 1) {
    if (!expanded[start] || seen[start]) continue;
    seen[start] = 1;
    const stack = [start];
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;
    let ink = 0;
    while (stack.length > 0) {
      const current = stack.pop()!;
      const x = current % width;
      const y = Math.floor(current / width);
      if (mask[current]) {
        ink += 1;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      for (let oy = -1; oy <= 1; oy += 1) {
        for (let ox = -1; ox <= 1; ox += 1) {
          if (ox === 0 && oy === 0) continue;
          const nx = x + ox;
          const ny = y + oy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          const next = ny * width + nx;
          if (!expanded[next] || seen[next]) continue;
          seen[next] = 1;
          stack.push(next);
        }
      }
    }
    if (ink < 40 || minX > maxX || minY > maxY) continue;
    const padding = 2;
    const x = Math.max(0, minX - padding);
    const y = Math.max(0, minY - padding);
    const right = Math.min(width, maxX + padding + 1);
    const bottom = Math.min(height, maxY + padding + 1);
    boxes.push({ x, y, width: right - x, height: bottom - y });
  }
  const rows: MapSourceBox[][] = [];
  for (const box of boxes.sort((a, b) => a.y - b.y || a.x - b.x)) {
    const row = rows.find((candidate) => Math.abs(candidate[0]!.y - box.y) <= 32);
    if (row) row.push(box);
    else rows.push([box]);
  }
  return rows
    .flatMap((row) => row.sort((a, b) => a.x - b.x))
    .slice(0, MAX_REGIONS);
}

export async function createMapIndexJob(input: Buffer, layer: number): Promise<{
  jobId: string;
  width: number;
  height: number;
  regions: MapSourceBox[];
}> {
  if (input.length > 30 * 1024 * 1024) throw new Error("La imagen supera el limite de 30 MB.");
  const normalized = await sharp(input).ensureAlpha().png().toBuffer();
  const { data, info } = await sharp(normalized).raw().toBuffer({ resolveWithObject: true });
  if (info.width > MAX_IMAGE_SIDE || info.height > MAX_IMAGE_SIDE) {
    throw new Error(`La imagen no puede superar ${MAX_IMAGE_SIDE}px por lado.`);
  }
  ensureDir(JOB_DIR);
  const jobId = randomBytes(8).toString("hex");
  fs.writeFileSync(jobPath(jobId), normalized);
  const regions = layer === 1
    ? [{ x: 0, y: 0, width: info.width, height: info.height }]
    : connectedBoxes(foregroundMask(data, info.width, info.height), info.width, info.height);
  return { jobId, width: info.width, height: info.height, regions };
}

function maxNumericKey(record: Record<string, unknown>): number {
  let max = 0;
  for (const key of Object.keys(record)) {
    const value = Number(key);
    if (Number.isInteger(value)) max = Math.max(max, value);
  }
  return max;
}

function nextGraphicFile(): number {
  let max = 0;
  for (const name of fs.readdirSync(PATHS.frontendGraphics())) {
    const match = /^(\d+)\.png$/i.exec(name);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

/** Capa 1 = stamp en grilla 32x32. Capas 2–4 = un solo GRH con el tamaño del recorte. */
function regionGrhCount(region: Pick<MapIndexRegion, "capa" | "ancho" | "alto">): number {
  return region.capa === 1 ? region.ancho * region.alto : 1;
}

function normalizeRegion(region: MapIndexRegion, sourceWidth: number, sourceHeight: number): MapIndexRegion {
  const x = Math.max(0, Math.min(sourceWidth - 1, Math.trunc(Number(region.x))));
  const y = Math.max(0, Math.min(sourceHeight - 1, Math.trunc(Number(region.y))));
  const width = Math.max(1, Math.min(sourceWidth - x, Math.trunc(Number(region.width))));
  const height = Math.max(1, Math.min(sourceHeight - y, Math.trunc(Number(region.height))));
  const capa = Math.min(4, Math.max(1, Math.trunc(Number(region.capa)) || 1));
  let ancho: number;
  let alto: number;
  if (capa === 1) {
    const minimumWidth = Math.ceil(width / 32);
    const minimumHeight = Math.ceil(height / 32);
    if (minimumWidth > 64 || minimumHeight > 64) {
      throw new Error("Una region no puede superar 64x64 tiles. Dividila en selecciones mas chicas.");
    }
    ancho = Math.max(minimumWidth, Math.min(64, Math.trunc(Number(region.ancho)) || minimumWidth));
    alto = Math.max(minimumHeight, Math.min(64, Math.trunc(Number(region.alto)) || minimumHeight));
  } else {
    if (width > 2048 || height > 2048) {
      throw new Error("Una decoracion no puede superar 2048x2048 px. Dividila en selecciones mas chicas.");
    }
    ancho = 1;
    alto = 1;
  }
  const nombre = region.nombre.trim().slice(0, 100);
  if (!nombre) throw new Error("Todas las indexaciones necesitan un nombre.");
  return { ...region, x, y, width, height, ancho, alto, capa, nombre, bloquear: Boolean(region.bloquear) };
}

function packRegions(regions: MapIndexRegion[], firstGrh: number, firstReference: number): {
  packed: PackedRegion[];
  atlasWidth: number;
  atlasHeight: number;
} {
  const widest = Math.max(
    ...regions.map((region) => (region.capa === 1 ? region.ancho * 32 : region.width)),
  );
  const atlasWidth = Math.max(widest, Math.min(2048, 1024));
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  let nextGrh = firstGrh;
  const packed: PackedRegion[] = [];
  regions.forEach((region, index) => {
    const pixelWidth = region.capa === 1 ? region.ancho * 32 : region.width;
    const pixelHeight = region.capa === 1 ? region.alto * 32 : region.height;
    if (x > 0 && x + pixelWidth > atlasWidth) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    packed.push({
      ...region,
      atlasX: x,
      atlasY: y,
      pixelWidth,
      pixelHeight,
      grhIndice: nextGrh,
      referenceId: firstReference + index,
    });
    nextGrh += regionGrhCount(region);
    x += pixelWidth;
    rowHeight = Math.max(rowHeight, pixelHeight);
  });
  return { packed, atlasWidth, atlasHeight: y + rowHeight };
}

function atomicWriteFiles(writes: Array<{ target: string; data: string | Buffer }>): void {
  const originals = new Map<string, Buffer | null>();
  const temps: Array<{ target: string; temp: string }> = [];
  try {
    for (const [index, write] of writes.entries()) {
      ensureDir(path.dirname(write.target));
      originals.set(write.target, fs.existsSync(write.target) ? fs.readFileSync(write.target) : null);
      const temp = path.join(path.dirname(write.target), `.${path.basename(write.target)}.${process.pid}.${Date.now()}.${index}.tmp`);
      fs.writeFileSync(temp, write.data);
      temps.push({ target: write.target, temp });
    }
    for (const item of temps) fs.renameSync(item.temp, item.target);
  } catch (error) {
    for (const item of temps) {
      if (fs.existsSync(item.temp)) fs.unlinkSync(item.temp);
    }
    for (const [target, original] of originals) {
      if (original === null) {
        if (fs.existsSync(target)) fs.unlinkSync(target);
      } else {
        fs.writeFileSync(target, original);
      }
    }
    throw error;
  }
}

export async function commitMapIndexJob(jobId: string, rawRegions: MapIndexRegion[]): Promise<MapIndexCommitResult> {
  if (rawRegions.length < 1 || rawRegions.length > MAX_REGIONS) {
    throw new Error(`Selecciona entre 1 y ${MAX_REGIONS} regiones.`);
  }
  const sheet = readMapIndexJob(jobId);
  const metadata = await sharp(sheet).metadata();
  const sourceWidth = metadata.width ?? 0;
  const sourceHeight = metadata.height ?? 0;
  const regions = rawRegions.map((region) => normalizeRegion(region, sourceWidth, sourceHeight));
  const totalTiles = regions.reduce((sum, region) => sum + regionGrhCount(region), 0);
  if (totalTiles > MAX_TILES) throw new Error(`El lote supera el limite de ${MAX_TILES} tiles.`);

  const verbosePath = path.join(PATHS.frontendInit(), "graficos.json");
  const optimizedPath = path.join(PATHS.frontendInit(), "graficos_optimized.json");
  const indicesPath = PATHS.indicesIni();
  const verbose = JSON.parse(fs.readFileSync(verbosePath, "utf8")) as Record<string, GraphicEntry>;
  const optimized = JSON.parse(fs.readFileSync(optimizedPath, "utf8")) as Record<string, unknown>;
  const indicesContent = fs.readFileSync(indicesPath, "utf8");
  const firstGrh = Math.max(maxNumericKey(verbose), maxNumericKey(optimized)) + 1;
  const firstReference = maxIndexationId(indicesContent) + 1;
  const graphicFile = nextGraphicFile();
  const { packed, atlasWidth, atlasHeight } = packRegions(regions, firstGrh, firstReference);

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  for (const region of packed) {
    const extracted = await sharp(sheet)
      .extract({ left: region.x, top: region.y, width: region.width, height: region.height })
      .png()
      .toBuffer();
    const padX = region.capa === 1 ? Math.floor((region.pixelWidth - region.width) / 2) : 0;
    const padY = region.capa === 1 ? region.pixelHeight - region.height : 0;
    composites.push({
      input: extracted,
      left: region.atlasX + padX,
      top: region.atlasY + padY,
    });
  }
  const atlas = await sharp({
    create: {
      width: atlasWidth,
      height: atlasHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  }).composite(composites).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();

  for (const region of packed) {
    if (region.capa === 1) {
      for (let tileY = 0; tileY < region.alto; tileY += 1) {
        for (let tileX = 0; tileX < region.ancho; tileX += 1) {
          const offset = tileY * region.ancho + tileX;
          const grh = region.grhIndice + offset;
          const sX = region.atlasX + tileX * 32;
          const sY = region.atlasY + tileY * 32;
          verbose[String(grh)] = {
            numFrames: 1,
            numFile: graphicFile,
            sX,
            sY,
            width: 32,
            height: 32,
            frames: { "1": grh },
          };
          optimized[String(grh)] = [graphicFile, sX, sY, 32, 32];
        }
      }
      continue;
    }
    const grh = region.grhIndice;
    verbose[String(grh)] = {
      numFrames: 1,
      numFile: graphicFile,
      sX: region.atlasX,
      sY: region.atlasY,
      width: region.pixelWidth,
      height: region.pixelHeight,
      frames: { "1": grh },
    };
    optimized[String(grh)] = [graphicFile, region.atlasX, region.atlasY, region.pixelWidth, region.pixelHeight];
  }

  const indexValues: Array<IndexationInput & { id: number }> = packed.map((region) => ({
    id: region.referenceId,
    nombre: region.nombre,
    grhIndice: region.grhIndice,
    ancho: region.ancho,
    alto: region.alto,
    capa: region.capa,
    bloquear: region.bloquear,
  }));
  const nextIndices = appendIndexationSections(indicesContent, indexValues);
  createBackup({
    resource: "map-indexations",
    resourceId: firstReference,
    absoluteFiles: [verbosePath, optimizedPath, indicesPath],
    note: `Importacion de ${regions.length} indexaciones desde el indexador`,
  });
  atomicWriteFiles([
    { target: path.join(PATHS.frontendGraphics(), `${graphicFile}.png`), data: atlas },
    { target: verbosePath, data: JSON.stringify(verbose) },
    { target: optimizedPath, data: JSON.stringify(optimized) },
    { target: indicesPath, data: nextIndices },
  ]);

  const loaded = loadIndexationRecords();
  const created = packed.map((region) => {
    const item = loaded.items.find((candidate) => candidate.id === region.referenceId);
    return {
      id: region.referenceId,
      ordinal: item?.ordinal ?? -1,
      nombre: region.nombre,
      grhIndice: region.grhIndice,
      ancho: region.ancho,
      alto: region.alto,
      capa: region.capa,
    };
  });
  return {
    graphicFile,
    firstGrh,
    lastGrh: firstGrh + totalTiles - 1,
    created,
    revision: loaded.revision,
  };
}

type RawTexture = { data: Buffer; width: number; height: number };

function blendPixel(target: Buffer, targetIndex: number, source: Buffer, sourceIndex: number): void {
  const sourceAlpha = source[sourceIndex + 3] / 255;
  if (sourceAlpha <= 0) return;
  const targetAlpha = target[targetIndex + 3] / 255;
  const outputAlpha = sourceAlpha + targetAlpha * (1 - sourceAlpha);
  for (let channel = 0; channel < 3; channel += 1) {
    const value = (source[sourceIndex + channel] * sourceAlpha + target[targetIndex + channel] * targetAlpha * (1 - sourceAlpha)) / outputAlpha;
    target[targetIndex + channel] = Math.round(value);
  }
  target[targetIndex + 3] = Math.round(outputAlpha * 255);
}

export async function renderIndexationPreview(opts: {
  grhIndice: number;
  ancho: number;
  alto: number;
  capa: number;
  maxSize?: number;
}): Promise<Buffer> {
  const capa = Math.min(4, Math.max(1, Math.trunc(opts.capa) || 1));
  const ancho = capa === 1 ? Math.min(64, Math.max(1, Math.trunc(opts.ancho))) : 1;
  const alto = capa === 1 ? Math.min(64, Math.max(1, Math.trunc(opts.alto))) : 1;
  if (ancho * alto > MAX_TILES) throw new Error("La preview supera el limite permitido.");

  const textures = new Map<number, Promise<RawTexture>>();
  const getTexture = (numFile: number) => {
    let pending = textures.get(numFile);
    if (!pending) {
      pending = sharp(resolveGraphicsPngAbsolute(numFile)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
        .then(({ data, info }) => ({ data, width: info.width, height: info.height }));
      textures.set(numFile, pending);
    }
    return pending;
  };

  // Capas 2–4: un solo GRH con su tamaño real (no grilla 32x32).
  if (capa !== 1) {
    const graphic = resolveGrh(opts.grhIndice);
    if (!graphic) throw new Error("No se encontro el GRH de la indexacion.");
    const texture = await getTexture(graphic.numFile);
    const width = Math.max(1, graphic.width);
    const height = Math.max(1, graphic.height);
    const target = Buffer.alloc(width * height * 4);
    for (let sourceY = 0; sourceY < graphic.height; sourceY += 1) {
      const textureY = graphic.sY + sourceY;
      if (textureY < 0 || textureY >= texture.height) continue;
      for (let sourceX = 0; sourceX < graphic.width; sourceX += 1) {
        const textureX = graphic.sX + sourceX;
        if (textureX < 0 || textureX >= texture.width) continue;
        blendPixel(
          target,
          (sourceY * width + sourceX) * 4,
          texture.data,
          (textureY * texture.width + textureX) * 4,
        );
      }
    }
    let preview = sharp(target, { raw: { width, height, channels: 4 } });
    const maxSize = Math.min(1200, Math.max(64, opts.maxSize ?? 900));
    if (width > maxSize || height > maxSize) {
      preview = preview.resize({ width: maxSize, height: maxSize, fit: "inside", kernel: "nearest" });
    }
    return preview.png().toBuffer();
  }

  const width = ancho * 32;
  const height = alto * 32;
  const target = Buffer.alloc(width * height * 4);

  for (let tileY = 0; tileY < alto; tileY += 1) {
    for (let tileX = 0; tileX < ancho; tileX += 1) {
      const graphic = resolveGrh(opts.grhIndice + tileY * ancho + tileX);
      if (!graphic) continue;
      const texture = await getTexture(graphic.numFile);
      const drawX = tileX * 32;
      const drawY = tileY * 32;
      for (let sourceY = 0; sourceY < graphic.height; sourceY += 1) {
        const targetY = drawY + sourceY;
        const textureY = graphic.sY + sourceY;
        if (targetY < 0 || targetY >= height || textureY < 0 || textureY >= texture.height) continue;
        for (let sourceX = 0; sourceX < graphic.width; sourceX += 1) {
          const targetX = drawX + sourceX;
          const textureX = graphic.sX + sourceX;
          if (targetX < 0 || targetX >= width || textureX < 0 || textureX >= texture.width) continue;
          blendPixel(
            target,
            (targetY * width + targetX) * 4,
            texture.data,
            (textureY * texture.width + textureX) * 4,
          );
        }
      }
    }
  }
  let preview = sharp(target, { raw: { width, height, channels: 4 } });
  const maxSize = Math.min(1200, Math.max(64, opts.maxSize ?? 900));
  if (width > maxSize || height > maxSize) {
    preview = preview.resize({ width: maxSize, height: maxSize, fit: "inside", kernel: "nearest" });
  }
  return preview.png().toBuffer();
}
