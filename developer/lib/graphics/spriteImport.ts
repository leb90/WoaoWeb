import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { PATHS, ensureDir } from "../security/paths";

export type SpriteKind = "body" | "helmet" | "shield" | "weapon";
export type DirectionId = "1" | "2" | "3" | "4";
export type AlignMode = "bottom" | "center";

export type SourceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DetectedFrame = SourceBox & {
  index: number;
};

export type DetectedRow = {
  index: number;
  y: number;
  height: number;
  role: "animation" | "icon";
  frames: DetectedFrame[];
};

export type FramePlacement = {
  box: SourceBox;
  dx: number;
  dy: number;
};

export type DirectionPlacement = {
  direction: DirectionId;
  frames: FramePlacement[];
};

export type SpritePlan = {
  kind: SpriteKind;
  cellWidth: number;
  cellHeight: number;
  align: AlignMode;
  contentScale: number;
  directions: DirectionPlacement[];
  iconBox?: SourceBox;
  headOffsetX: number;
  headOffsetY: number;
  offsetX: number;
  offsetY: number;
  itemName: string;
  referenceItemId: number;
  statOverrides?: Record<string, number>;
};

export type SpriteImportResult = {
  graphicFile: number;
  iconFile: number;
  iconGrh: number;
  animationId: number;
  itemId: number;
  directions: Record<DirectionId, number>;
  frameCount: number;
};

const WALK_SPEED = 1000 / 18;
// Sur, este, norte, oeste: frente, derecha, espalda, izquierda.
const DIRECTION_ORDER: DirectionId[] = ["2", "3", "1", "4"];
const HELMET_FRAME_ORDER: DirectionId[] = ["2", "3", "1", "4"];
const JOB_DIR = path.join(PATHS.data(), "sprite-jobs");

type GraphicEntry = {
  numFrames?: number;
  numFile?: number;
  sX?: number;
  sY?: number;
  width?: number;
  height?: number;
  frames?: Record<string, number>;
  speed?: number;
};

type RgbaImage = {
  data: Buffer;
  width: number;
  height: number;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function maxNumericKey(record: Record<string, unknown>): number {
  let max = 0;
  for (const key of Object.keys(record)) {
    const value = Number(key);
    if (Number.isInteger(value) && value > max) max = value;
  }
  return max;
}

function graphicsPaths() {
  const init = PATHS.frontendInit();
  return {
    verbose: path.join(init, "graficos.json"),
    optimized: path.join(init, "graficos_optimized.json"),
    bodies: path.join(init, "bodies.json"),
    weapons: path.join(init, "armas.json"),
    helmets: path.join(init, "cascos.json"),
    shields: path.join(init, "escudos.json"),
    graphicsDir: PATHS.frontendGraphics(),
    serverObjects: path.join(PATHS.serverJsons(), "objs.json"),
    apiObjects: path.join(PATHS.apiJsons(), "objs.json"),
    clientObjects: path.join(init, "objs.json"),
  };
}

function catalogPath(kind: SpriteKind): string {
  const paths = graphicsPaths();
  if (kind === "body") return paths.bodies;
  if (kind === "weapon") return paths.weapons;
  if (kind === "helmet") return paths.helmets;
  return paths.shields;
}

let graphicsCache: { mtime: number; data: Record<string, GraphicEntry> } | null = null;

function loadGraphics(): Record<string, GraphicEntry> {
  const filePath = graphicsPaths().verbose;
  const mtime = fs.statSync(filePath).mtimeMs;
  if (graphicsCache && graphicsCache.mtime === mtime) return graphicsCache.data;
  const data = readJson<Record<string, GraphicEntry>>(filePath);
  graphicsCache = { mtime, data };
  return data;
}

function nextGraphicFileNumber(): number {
  const dir = graphicsPaths().graphicsDir;
  let max = 0;
  for (const name of fs.readdirSync(dir)) {
    const match = /^(\d+)\.png$/i.exec(name);
    if (!match) continue;
    max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

async function decode(input: Buffer): Promise<RgbaImage> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function cornerTransparent(image: RgbaImage): boolean {
  const points = [
    0,
    image.width - 1,
    (image.height - 1) * image.width,
    (image.height - 1) * image.width + (image.width - 1),
  ];
  let transparent = 0;
  for (const point of points) {
    if (image.data[point * 4 + 3] < 24) transparent += 1;
  }
  return transparent >= 2;
}

function isInk(image: RgbaImage, index: number, alphaMode: boolean): boolean {
  const offset = index * 4;
  const red = image.data[offset];
  const green = image.data[offset + 1];
  const blue = image.data[offset + 2];
  const alpha = image.data[offset + 3];
  if (alpha < 24) return false;
  if (alphaMode) return true;
  return red + green + blue > 22;
}

async function prepareSheet(input: Buffer): Promise<Buffer> {
  const image = await decode(input);
  if (cornerTransparent(image)) return input;
  const cleaned = Buffer.from(image.data);
  for (let index = 0; index < image.width * image.height; index += 1) {
    if (!isInk(image, index, false)) {
      cleaned[index * 4 + 3] = 0;
    }
  }
  return sharp(cleaned, { raw: { width: image.width, height: image.height, channels: 4 } }).png().toBuffer();
}

function occupancyBands(marks: boolean[], minGap: number, minLength: number): Array<[number, number]> {
  const found: Array<[number, number]> = [];
  let start = -1;
  for (let index = 0; index < marks.length; index += 1) {
    if (marks[index]) {
      if (start < 0) start = index;
      continue;
    }
    if (start >= 0 && index - start >= minLength) found.push([start, index - 1]);
    start = -1;
  }
  if (start >= 0 && marks.length - start >= minLength) found.push([start, marks.length - 1]);

  const merged: Array<[number, number]> = [];
  for (const band of found) {
    const previous = merged[merged.length - 1];
    if (previous && band[0] - previous[1] - 1 < minGap) previous[1] = band[1];
    else merged.push([band[0], band[1]]);
  }
  return merged;
}

export async function detectSheet(input: Buffer): Promise<{ width: number; height: number; rows: DetectedRow[] }> {
  const prepared = await prepareSheet(input);
  const image = await decode(prepared);
  const alphaMode = cornerTransparent(image);
  const rowMarks = new Array<boolean>(image.height).fill(false);
  for (let y = 0; y < image.height; y += 1) {
    let count = 0;
    for (let x = 0; x < image.width; x += 1) {
      if (isInk(image, y * image.width + x, alphaMode)) count += 1;
    }
    rowMarks[y] = count > 6;
  }

  const rowBands = occupancyBands(rowMarks, 2, 8);
  const rows: DetectedRow[] = [];
  for (const [y0, y1] of rowBands) {
    const frames = componentsInBand(image, y0, y1, alphaMode).map((frame, index) => ({
      ...frame,
      index,
    }));
    if (frames.length === 0) continue;
    rows.push({
      index: rows.length,
      y: y0,
      height: y1 - y0 + 1,
      role: "animation",
      frames,
    });
  }

  const heights = rows.map((row) => median(row.frames.map((frame) => frame.height)));
  const tallest = Math.max(1, ...heights);
  for (let index = 0; index < rows.length; index += 1) {
    if (heights[index] < tallest * 0.45) rows[index].role = "icon";
  }

  return { width: image.width, height: image.height, rows };
}

function componentsInBand(image: RgbaImage, y0: number, y1: number, alphaMode: boolean): SourceBox[] {
  const width = image.width;
  const seen = new Uint8Array(width * (y1 - y0 + 1));
  const boxes: SourceBox[] = [];
  const localIndex = (x: number, y: number) => (y - y0) * width + x;

  for (let y = y0; y <= y1; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = localIndex(x, y);
      if (seen[start] || !isInk(image, y * width + x, alphaMode)) continue;
      seen[start] = 1;
      const stack = [x, y];
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;
      while (stack.length > 0) {
        const cy = stack.pop() ?? y;
        const cx = stack.pop() ?? x;
        count += 1;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
        const neighbors = [
          [cx - 1, cy],
          [cx + 1, cy],
          [cx, cy - 1],
          [cx, cy + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || ny < y0 || nx >= width || ny > y1) continue;
          const next = localIndex(nx, ny);
          if (seen[next] || !isInk(image, ny * width + nx, alphaMode)) continue;
          seen[next] = 1;
          stack.push(nx, ny);
        }
      }
      if (count > 80) {
        boxes.push({ x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 });
      }
    }
  }

  boxes.sort((a, b) => a.x - b.x || a.y - b.y);
  return splitWideBoxes(image, boxes, y0, y1, alphaMode);
}

function splitWideBoxes(
  image: RgbaImage,
  boxes: SourceBox[],
  y0: number,
  y1: number,
  alphaMode: boolean,
): SourceBox[] {
  const typical = median(boxes.map((box) => box.width));
  if (typical <= 0) return boxes;
  const result: SourceBox[] = [];
  for (const box of boxes) {
    if (box.width < typical * 1.75) {
      result.push(box);
      continue;
    }
    const columns = new Array<number>(box.width).fill(0);
    for (let y = Math.max(y0, box.y); y <= Math.min(y1, box.y + box.height - 1); y += 1) {
      for (let x = box.x; x < box.x + box.width; x += 1) {
        if (isInk(image, y * image.width + x, alphaMode)) columns[x - box.x] += 1;
      }
    }
    let cursor = 0;
    while (cursor < columns.length) {
      while (cursor < columns.length && columns[cursor] < 3) cursor += 1;
      if (cursor >= columns.length) break;
      let end = cursor;
      while (end < columns.length && columns[end] >= 3) end += 1;
      if (end - cursor > 6) {
        result.push({
          x: box.x + cursor,
          y: box.y,
          width: end - cursor,
          height: box.height,
        });
      }
      cursor = end;
    }
  }
  return result.sort((a, b) => a.x - b.x);
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

function firstFrameOf(graphics: Record<string, GraphicEntry>, grhId: number): GraphicEntry | null {
  const entry = graphics[String(grhId)];
  if (!entry) return null;
  if ((entry.width ?? 0) > 0 && (entry.numFile ?? 0) > 0) return entry;
  const frameId = Number(entry.frames?.["1"] ?? 0);
  if (!frameId || frameId === grhId) return entry.width ? entry : null;
  return graphics[String(frameId)] ?? null;
}

export type ReferenceInfo = {
  itemId: number;
  name: string;
  objType: number;
  subtipo: number;
  anim: number;
  cellWidth: number;
  cellHeight: number;
  frameCount: number;
  headOffsetX: number;
  headOffsetY: number;
  offsetX: number;
  offsetY: number;
  stats: Record<string, number>;
};

const STAT_KEYS = [
  "minHit",
  "maxHit",
  "minDef",
  "maxDef",
  "minDefMag",
  "maxDefMag",
  "resistenciaMagica",
  "magicDamageBonus",
  "valor",
  "subtipo",
  "proyectil",
  "objetoEspecial",
] as const;

function kindOfObject(objectData: Record<string, unknown>): SpriteKind | null {
  const objType = Number(objectData.objType ?? 0);
  const subtipo = Number(objectData.subtipo ?? 0);
  if (objType === 2) return "weapon";
  if (objType === 17 || (objType === 3 && subtipo === 1)) return "helmet";
  if (objType === 16 || (objType === 3 && subtipo === 2)) return "shield";
  if (objType === 3 && subtipo === 0) return "body";
  return null;
}

export function listReferences(kind?: SpriteKind): ReferenceInfo[] {
  const objects = readJson<Record<string, Record<string, unknown>>>(graphicsPaths().serverObjects);
  const graphics = loadGraphics();
  const catalogs = {
    body: readJson<Record<string, Record<string, number>>>(graphicsPaths().bodies),
    weapon: readJson<Record<string, Record<string, number>>>(graphicsPaths().weapons),
    helmet: readJson<Record<string, Record<string, number>>>(graphicsPaths().helmets),
    shield: readJson<Record<string, Record<string, number>>>(graphicsPaths().shields),
  };
  const references: ReferenceInfo[] = [];
  const sampleFrame = new Map<SpriteKind, { width: number; height: number; frameCount: number }>();
  for (const objectKind of ["body", "weapon", "helmet", "shield"] as const) {
    const sample = catalogs[objectKind]["1"] ?? Object.values(catalogs[objectKind])[0];
    const sampleGrh = Number(sample?.["2"] ?? sample?.["1"] ?? 0);
    const frame = sampleGrh ? firstFrameOf(graphics, sampleGrh) : null;
    if (frame?.width && frame.height) {
      sampleFrame.set(objectKind, {
        width: frame.width,
        height: frame.height,
        frameCount: Number(graphics[String(sampleGrh)]?.numFrames ?? 1),
      });
    }
  }

  for (const [id, objectData] of Object.entries(objects)) {
    const objectKind = kindOfObject(objectData);
    if (!objectKind || (kind && objectKind !== kind)) continue;
    const anim = Number(objectData.anim ?? 0);
    const catalog = catalogs[objectKind][String(anim)];
    const grhId = Number(catalog?.["2"] ?? catalog?.["1"] ?? 0);
    const frame = grhId ? firstFrameOf(graphics, grhId) : null;
    const fallback = sampleFrame.get(objectKind);
    const cellWidth = frame?.width || fallback?.width || 0;
    const cellHeight = frame?.height || fallback?.height || 0;
    if (!cellWidth || !cellHeight) continue;
    const stats: Record<string, number> = {};
    for (const key of STAT_KEYS) stats[key] = Number(objectData[key] ?? 0);
    references.push({
      itemId: Number(id),
      name: String(objectData.name ?? id),
      objType: Number(objectData.objType ?? 0),
      subtipo: Number(objectData.subtipo ?? 0),
      anim,
      cellWidth,
      cellHeight,
      frameCount: Number(graphics[String(grhId)]?.numFrames ?? fallback?.frameCount ?? 1),
      headOffsetX: Number(catalog?.headOffsetX ?? 0),
      headOffsetY: Number(catalog?.headOffsetY ?? 0),
      offsetX: Number(catalog?.offsetX ?? 0),
      offsetY: Number(catalog?.offsetY ?? 0),
      stats,
    });
  }

  return references.sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getReference(itemId: number): ReferenceInfo {
  const match = listReferences().find((entry) => entry.itemId === itemId);
  if (!match) throw new Error(`El item ${itemId} no sirve como referencia de animación.`);
  return match;
}

export function defaultReferenceId(kind: SpriteKind): number {
  if (kind === "body") return 369;
  if (kind === "weapon") return 753;
  if (kind === "helmet") return 405;
  return 133;
}

export async function saveJob(input: Buffer): Promise<string> {
  ensureDir(JOB_DIR);
  const id = randomBytes(8).toString("hex");
  const prepared = await prepareSheet(input);
  fs.writeFileSync(path.join(JOB_DIR, `${id}.png`), prepared);
  return id;
}

export function readJob(jobId: string): Buffer {
  if (!/^[a-f0-9]{16}$/.test(jobId)) throw new Error("Trabajo inválido.");
  const filePath = path.join(JOB_DIR, `${jobId}.png`);
  if (!fs.existsSync(filePath)) throw new Error("La hoja ya no está disponible. Volvé a subirla.");
  return fs.readFileSync(filePath);
}

async function renderCell(
  sheet: Buffer,
  box: SourceBox,
  cellWidth: number,
  cellHeight: number,
  align: AlignMode,
  contentScale: number,
  dx: number,
  dy: number,
): Promise<Buffer> {
  const scale = Math.min(1, Math.max(0.2, contentScale));
  const maxWidth = Math.max(1, Math.round(cellWidth * scale));
  const maxHeight = Math.max(1, Math.round(cellHeight * scale));
  const resized = await sharp(sheet)
    .extract({
      left: Math.max(0, Math.round(box.x)),
      top: Math.max(0, Math.round(box.y)),
      width: Math.max(1, Math.round(box.width)),
      height: Math.max(1, Math.round(box.height)),
    })
    .resize({ width: maxWidth, height: maxHeight, fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  const width = meta.width ?? 1;
  const height = meta.height ?? 1;
  let left = Math.round((cellWidth - width) / 2) + dx;
  let top = align === "bottom" ? cellHeight - height + dy : Math.round((cellHeight - height) / 2) + dy;
  left = Math.max(-width + 1, Math.min(cellWidth - 1, left));
  top = Math.max(-height + 1, Math.min(cellHeight - 1, top));
  return sharp({
    create: { width: cellWidth, height: cellHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer();
}

export async function renderPreviewCells(
  sheet: Buffer,
  frames: SourceBox[],
  cellWidth: number,
  cellHeight: number,
  align: AlignMode,
  contentScale: number,
): Promise<string[]> {
  const previews: string[] = [];
  for (const frame of frames) {
    const png = await renderCell(sheet, frame, cellWidth, cellHeight, align, contentScale, 0, 0);
    previews.push(`data:image/png;base64,${png.toString("base64")}`);
  }
  return previews;
}

function clampCell(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value < 8) return fallback;
  return Math.max(8, Math.min(160, Math.round(value)));
}

export function normalizePlan(plan: SpritePlan, reference: ReferenceInfo): SpritePlan {
  const directions = plan.directions.filter((row) => row.frames.length > 0);
  const seen = new Set<DirectionId>();
  for (const row of directions) {
    if (!DIRECTION_ORDER.includes(row.direction)) throw new Error("Dirección inválida.");
    if (seen.has(row.direction)) throw new Error("Hay dos filas con la misma dirección.");
    seen.add(row.direction);
  }
  if (directions.length === 0) throw new Error("Asigná al menos una dirección.");
  const fallback = directions.find((row) => row.direction === "3") ?? directions[0];
  const completed = DIRECTION_ORDER.map((direction) => {
    return directions.find((row) => row.direction === direction) ?? {
      direction,
      frames: fallback.frames.map((frame) => ({ ...frame })),
    };
  });

  return {
    ...plan,
    kind: reference ? plan.kind : plan.kind,
    cellWidth: clampCell(plan.cellWidth, reference.cellWidth),
    cellHeight: clampCell(plan.cellHeight, reference.cellHeight),
    align: plan.align === "center" ? "center" : "bottom",
    contentScale: Math.min(1, Math.max(0.2, Number(plan.contentScale) || 1)),
    directions: completed,
    headOffsetX: Number.isFinite(plan.headOffsetX) ? Math.round(plan.headOffsetX) : reference.headOffsetX,
    headOffsetY: Number.isFinite(plan.headOffsetY) ? Math.round(plan.headOffsetY) : reference.headOffsetY,
    offsetX: Number.isFinite(plan.offsetX) ? Math.round(plan.offsetX) : reference.offsetX,
    offsetY: Number.isFinite(plan.offsetY) ? Math.round(plan.offsetY) : reference.offsetY,
    itemName: plan.itemName.trim(),
    referenceItemId: reference.itemId,
  };
}

async function composeAtlas(sheet: Buffer, plan: SpritePlan): Promise<{ atlas: Buffer; icon: Buffer; columns: number }> {
  const columns = Math.max(...plan.directions.map((row) => row.frames.length));
  const atlasWidth = columns * plan.cellWidth;
  const atlasHeight = plan.directions.length * plan.cellHeight;
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];

  for (let rowIndex = 0; rowIndex < plan.directions.length; rowIndex += 1) {
    const row = plan.directions[rowIndex];
    for (let column = 0; column < row.frames.length; column += 1) {
      const frame = row.frames[column];
      const cell = await renderCell(
        sheet,
        frame.box,
        plan.cellWidth,
        plan.cellHeight,
        plan.align,
        plan.contentScale,
        frame.dx,
        frame.dy,
      );
      composites.push({
        input: cell,
        left: column * plan.cellWidth,
        top: rowIndex * plan.cellHeight,
      });
    }
  }

  const atlas = await sharp({
    create: { width: atlasWidth, height: atlasHeight, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer();

  const iconSource = plan.iconBox ?? plan.directions.find((row) => row.direction === "2")?.frames[0]?.box ?? plan.directions[0].frames[0].box;
  const icon = await renderCell(sheet, iconSource, 32, 32, "center", 1, 0, 0);
  return { atlas, icon, columns };
}

function compactFrame(fileNumber: number, sX: number, sY: number, width: number, height: number): number[] {
  return [fileNumber, sX, sY, width, height];
}

function verboseFrame(fileNumber: number, sX: number, sY: number, width: number, height: number, grhId: number): GraphicEntry {
  return {
    numFrames: 1,
    numFile: fileNumber,
    sX,
    sY,
    width,
    height,
    frames: { "1": grhId },
  };
}

function clientObject(source: Record<string, unknown>, grhIndex: number): Record<string, unknown> {
  const client: Record<string, unknown> = {
    name: source.name,
    grhIndex: String(grhIndex),
    objType: source.objType,
  };
  for (const key of ["minHit", "maxHit", "minDef", "maxDef", "minDefMag", "maxDefMag", "resistenciaMagica", "proyectil", "magicDamageBonus", "subtipo", "objetoEspecial", "apu", "razaEnana"]) {
    const value = Number(source[key] ?? 0);
    if (value) client[key] = value;
  }
  if (Array.isArray(source.clasesNoPermitidas) && source.clasesNoPermitidas.length > 0) {
    client.clasesNoPermitidas = source.clasesNoPermitidas;
  }
  return client;
}

export function suggestAssignments(kind: SpriteKind, rows: DetectedRow[]) {
  const animationRows = rows.filter((row) => row.role === "animation");
  const iconRow = rows.find((row) => row.role === "icon") ?? null;
  if (kind === "helmet" && animationRows.length === 1 && animationRows[0] && animationRows[0].frames.length >= 2) {
    return {
      iconRow: iconRow?.index ?? null,
      splitFrames: true,
      rows: animationRows[0].frames.slice(0, 4).map((frame, index) => ({
        rowIndex: animationRows[0].index,
        frameIndex: frame.index,
        direction: HELMET_FRAME_ORDER[index] ?? "2",
      })),
    };
  }

  return {
    iconRow: iconRow?.index ?? null,
    splitFrames: false,
    rows: animationRows.slice(0, 4).map((row, index) => ({
      rowIndex: row.index,
      direction: DIRECTION_ORDER[index] ?? "2",
    })),
  };
}

export async function commitSpriteImport(sheet: Buffer, rawPlan: SpritePlan): Promise<SpriteImportResult> {
  const reference = getReference(rawPlan.referenceItemId);
  const objects = readJson<Record<string, Record<string, unknown>>>(graphicsPaths().serverObjects);
  const source = objects[String(rawPlan.referenceItemId)];
  if (!source) throw new Error("No existe el item de referencia.");
  const sourceKind = kindOfObject(source);
  if (sourceKind !== rawPlan.kind) {
    throw new Error("El item de referencia no es del mismo tipo que la hoja.");
  }
  const plan = normalizePlan(rawPlan, reference);
  if (!plan.itemName) throw new Error("El item necesita un nombre.");

  const prepared = await prepareSheet(sheet);
  const { atlas, icon } = await composeAtlas(prepared, plan);
  const paths = graphicsPaths();
  const graphicFile = nextGraphicFileNumber();
  const iconFile = graphicFile + 1;
  const graphics = loadGraphics();
  let nextGrh = maxNumericKey(graphics) + 1;
  const verboseEntries: Record<string, GraphicEntry> = {};
  const compactEntries: Record<string, unknown> = {};
  const directionGrh: Partial<Record<DirectionId, number>> = {};
  let frameCount = 0;

  plan.directions.forEach((row, rowIndex) => {
    const frameIds: number[] = [];
    row.frames.forEach((frame, column) => {
      const grhId = nextGrh;
      nextGrh += 1;
      frameIds.push(grhId);
      frameCount += 1;
      const sX = column * plan.cellWidth;
      const sY = rowIndex * plan.cellHeight;
      verboseEntries[String(grhId)] = verboseFrame(graphicFile, sX, sY, plan.cellWidth, plan.cellHeight, grhId);
      compactEntries[String(grhId)] = compactFrame(graphicFile, sX, sY, plan.cellWidth, plan.cellHeight);
    });

    if (frameIds.length === 1) {
      directionGrh[row.direction] = frameIds[0];
      return;
    }

    const animId = nextGrh;
    nextGrh += 1;
    const frames: Record<string, number> = {};
    frameIds.forEach((frameId, index) => {
      frames[String(index + 1)] = frameId;
    });
    verboseEntries[String(animId)] = { numFrames: frameIds.length, frames, speed: WALK_SPEED };
    compactEntries[String(animId)] = { f: frameIds.length, r: frameIds, s: WALK_SPEED };
    directionGrh[row.direction] = animId;
  });

  const iconGrh = nextGrh;
  verboseEntries[String(iconGrh)] = verboseFrame(iconFile, 0, 0, 32, 32, iconGrh);
  compactEntries[String(iconGrh)] = compactFrame(iconFile, 0, 0, 32, 32);

  const catalog = readJson<Record<string, Record<string, number>>>(catalogPath(plan.kind));
  const animationId = maxNumericKey(catalog) + 1;
  const catalogEntry: Record<string, number> = {
    "1": directionGrh["1"] ?? 0,
    "2": directionGrh["2"] ?? 0,
    "3": directionGrh["3"] ?? 0,
    "4": directionGrh["4"] ?? 0,
  };
  if (plan.kind === "body") {
    catalogEntry.headOffsetX = plan.headOffsetX;
    catalogEntry.headOffsetY = plan.headOffsetY;
  }
  if (plan.kind === "helmet") {
    catalogEntry.offsetX = plan.offsetX;
    catalogEntry.offsetY = plan.offsetY;
  }

  const item: Record<string, unknown> = { ...source, name: plan.itemName, grhIndex: iconGrh, anim: animationId };
  for (const [key, value] of Object.entries(plan.statOverrides ?? {})) {
    if (!STAT_KEYS.includes(key as (typeof STAT_KEYS)[number])) continue;
    item[key] = value;
  }
  const itemId = maxNumericKey(objects) + 1;

  const verboseNext = appendPreview(paths.verbose, verboseEntries);
  const optimizedNext = appendPreview(paths.optimized, compactEntries);
  const catalogNext = appendPreview(catalogPath(plan.kind), { [String(animationId)]: catalogEntry });
  const serverObjectsNext = appendPreview(paths.serverObjects, { [String(itemId)]: item });
  const apiObjectsNext = appendPreview(paths.apiObjects, { [String(itemId)]: item });
  const clientObjectsNext = appendPreview(paths.clientObjects, { [String(itemId)]: clientObject(item, iconGrh) });

  ensureDir(paths.graphicsDir);
  fs.writeFileSync(path.join(paths.graphicsDir, `${graphicFile}.png`), atlas);
  fs.writeFileSync(path.join(paths.graphicsDir, `${iconFile}.png`), icon);
  fs.writeFileSync(paths.verbose, verboseNext);
  fs.writeFileSync(paths.optimized, optimizedNext);
  fs.writeFileSync(catalogPath(plan.kind), catalogNext);
  fs.writeFileSync(paths.serverObjects, serverObjectsNext);
  fs.writeFileSync(paths.apiObjects, apiObjectsNext);
  fs.writeFileSync(paths.clientObjects, clientObjectsNext);
  graphicsCache = null;

  return {
    graphicFile,
    iconFile,
    iconGrh,
    animationId,
    itemId,
    directions: catalogEntry as Record<DirectionId, number>,
    frameCount,
  };
}

function appendPreview(filePath: string, entries: Record<string, unknown>): string {
  const raw = fs.readFileSync(filePath, "utf8");
  const trimmed = raw.trimEnd();
  if (!trimmed.endsWith("}")) throw new Error(`JSON inválido en ${path.basename(filePath)}`);
  const payload = Object.entries(entries)
    .map(([key, value]) => `${JSON.stringify(key)}:${JSON.stringify(value)}`)
    .join(",");
  const body = trimmed.slice(0, -1).trimEnd();
  const next = `${body}${body.endsWith("{") ? "" : ","}${payload}}`;
  JSON.parse(next);
  return next;
}

export function indexerStatus() {
  const paths = graphicsPaths();
  return {
    nextGraphicFile: nextGraphicFileNumber(),
    nextGrh: maxNumericKey(loadGraphics()) + 1,
    nextBody: maxNumericKey(readJson(paths.bodies)) + 1,
    nextWeapon: maxNumericKey(readJson(paths.weapons)) + 1,
    nextHelmet: maxNumericKey(readJson(paths.helmets)) + 1,
    nextShield: maxNumericKey(readJson(paths.shields)) + 1,
    nextItem: maxNumericKey(readJson(paths.serverObjects)) + 1,
  };
}
