import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  commitSpriteImport,
  type DirectionId,
  type SourceBox,
  type SpritePlan,
} from "../lib/graphics/spriteImport";

const ROOT = path.resolve(__dirname, "..");
const SHEETS_DIR = path.join(ROOT, "tmp", "tunicas");
const ROW_DIRECTIONS: DirectionId[] = ["2", "1", "3", "4"];

/** Ancho máx. pedido + alto estándar de armadura/túnica de altos. */
const CELL_WIDTH = 32;
const CELL_HEIGHT = 46;
/** Escala no proporcional: más fino de ancho, más alto. */
const CONTENT_SCALE_X = 0.72;
const CONTENT_SCALE_Y = 0.98;

type TunicSpec = {
  file: string;
  itemName: string;
  existingItemId: number;
  cols: number;
  bonusGoldNpcPct: number;
  bonusExpNpcPct: number;
  bonusDropNpcPct: number;
};

const TUNICS: TunicSpec[] = [
  {
    file: "suerte.png",
    itemName: "Túnica Suerte",
    existingItemId: 1814,
    cols: 8,
    bonusGoldNpcPct: 0,
    bonusExpNpcPct: 0,
    bonusDropNpcPct: 50,
  },
  {
    file: "experiencia.png",
    itemName: "Túnica Experiencia",
    existingItemId: 1815,
    cols: 10,
    bonusGoldNpcPct: 0,
    bonusExpNpcPct: 50,
    bonusDropNpcPct: 0,
  },
  {
    file: "dorada.png",
    itemName: "Túnica Dorada",
    existingItemId: 1816,
    cols: 8,
    bonusGoldNpcPct: 50,
    bonusExpNpcPct: 0,
    bonusDropNpcPct: 0,
  },
];

function uniformGridFrames(
  imageWidth: number,
  imageHeight: number,
  cols: number,
  rows: number,
): SourceBox[][] {
  const cellW = imageWidth / cols;
  const cellH = imageHeight / rows;
  const out: SourceBox[][] = [];
  for (let row = 0; row < rows; row += 1) {
    const frames: SourceBox[] = [];
    for (let col = 0; col < cols; col += 1) {
      const x = Math.round(col * cellW);
      const y = Math.round(row * cellH);
      const nextX = Math.round((col + 1) * cellW);
      const nextY = Math.round((row + 1) * cellH);
      frames.push({
        x,
        y,
        width: Math.max(1, nextX - x),
        height: Math.max(1, nextY - y),
      });
    }
    out.push(frames);
  }
  return out;
}

async function importForcedGrid(spec: TunicSpec) {
  const sheetPath = path.join(SHEETS_DIR, spec.file);
  const sheet = fs.readFileSync(sheetPath);
  const meta = await sharp(sheet).metadata();
  const imageWidth = meta.width ?? 0;
  const imageHeight = meta.height ?? 0;
  if (!imageWidth || !imageHeight) {
    throw new Error(`${spec.file}: dimensiones inválidas`);
  }

  // Hojas ChatGPT regulares: grilla fija (detectSheet fusiona frames en la azul).
  const grid = uniformGridFrames(imageWidth, imageHeight, spec.cols, 4);
  const directionFrames = ROW_DIRECTIONS.map((direction, index) => ({
    direction,
    frames: grid[index],
  }));

  const plan: SpritePlan = {
    kind: "body",
    cellWidth: CELL_WIDTH,
    cellHeight: CELL_HEIGHT,
    align: "bottom",
    contentScale: 1,
    contentScaleX: CONTENT_SCALE_X,
    contentScaleY: CONTENT_SCALE_Y,
    directions: directionFrames.map((row) => ({
      direction: row.direction,
      frames: row.frames.map((box) => ({ box, dx: 0, dy: 0 })),
    })),
    iconBox: directionFrames[0].frames[0],
    headOffsetX: 0,
    headOffsetY: -4,
    offsetX: 0,
    offsetY: 0,
    itemName: `${spec.itemName} (replace)`,
    referenceItemId: 239,
    statOverrides: {
      minDef: 8,
      maxDef: 12,
    },
  };

  const result = await commitSpriteImport(sheet, plan);
  remapExistingItem(spec.existingItemId, result, spec);
  return result;
}

function remapExistingItem(
  existingItemId: number,
  imported: {
    animationId: number;
    iconGrh: number;
  },
  spec: TunicSpec,
) {
  const files = [
    path.join(ROOT, "..", "server", "jsons", "objs.json"),
    path.join(ROOT, "..", "api", "src", "jsons", "objs.json"),
    path.join(ROOT, "..", "frontend", "public", "init", "objs.json"),
  ];

  for (const filePath of files) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8")) as Record<
      string,
      Record<string, unknown>
    >;
    const existing = data[String(existingItemId)];
    const newestId = Math.max(...Object.keys(data).map(Number));
    const newest = data[String(newestId)];
    if (!existing || !newest) {
      throw new Error(`No se pudo remapear ${spec.itemName}`);
    }

    existing.name = spec.itemName;
    existing.anim = newest.anim;
    existing.grhIndex = newest.grhIndex;
    existing.noSeCae = 1;
    existing.newbie = 0;
    existing.razaEnana = 0;
    existing.minDef = 8;
    existing.maxDef = 12;
    existing.clasesNoPermitidas = [];
    existing.bonusGoldNpcPct = spec.bonusGoldNpcPct;
    existing.bonusExpNpcPct = spec.bonusExpNpcPct;
    existing.bonusDropNpcPct = spec.bonusDropNpcPct;
    existing.desc =
      spec.bonusDropNpcPct > 0
        ? "Túnica de donación. +50% chance de drop de NPCs. No se cae."
        : spec.bonusExpNpcPct > 0
          ? "Túnica de donación. +50% experiencia de NPCs. No se cae."
          : "Túnica de donación. +50% oro de NPCs. No se cae.";

    delete data[String(newestId)];
    fs.writeFileSync(filePath, JSON.stringify(data));
  }
}

async function main() {
  const filter = process.argv[2]?.toLowerCase();
  const selected = filter
    ? TUNICS.filter(
        (tunic) =>
          tunic.file.toLowerCase().includes(filter) ||
          tunic.itemName.toLowerCase().includes(filter),
      )
    : TUNICS;
  if (selected.length === 0) {
    throw new Error(`No hay túnicas que coincidan con "${filter}"`);
  }

  for (const tunic of selected) {
    const result = await importForcedGrid(tunic);
    console.log(
      JSON.stringify({
        name: tunic.itemName,
        keptItemId: tunic.existingItemId,
        newBodyId: result.animationId,
        iconGrh: result.iconGrh,
        frames: result.frameCount,
        cell: `${CELL_WIDTH}x${CELL_HEIGHT}`,
        scale: `X${CONTENT_SCALE_X}/Y${CONTENT_SCALE_Y}`,
      }),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
