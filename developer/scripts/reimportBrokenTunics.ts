import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import {
  commitSpriteImport,
  detectSheet,
  type DirectionId,
  type SourceBox,
  type SpritePlan,
} from "../lib/graphics/spriteImport";

const ROOT = path.resolve(__dirname, "..");
const SHEETS_DIR = path.join(ROOT, "tmp", "tunicas");
const ROW_DIRECTIONS: DirectionId[] = ["2", "1", "3", "4"];
const COLS = 7;

type TunicSpec = {
  file: string;
  itemName: string;
  existingItemId: number;
  bonusGoldNpcPct: number;
  bonusExpNpcPct: number;
  bonusDropNpcPct: number;
};

const TUNICS: TunicSpec[] = [
  {
    file: "experiencia.png",
    itemName: "Túnica Experiencia",
    existingItemId: 1815,
    bonusGoldNpcPct: 0,
    bonusExpNpcPct: 50,
    bonusDropNpcPct: 0,
  },
  {
    file: "dorada.png",
    itemName: "Túnica Dorada",
    existingItemId: 1816,
    bonusGoldNpcPct: 50,
    bonusExpNpcPct: 0,
    bonusDropNpcPct: 0,
  },
];

async function inkBoundsInBand(
  sheet: Buffer,
  y0: number,
  y1: number,
  width: number,
): Promise<{ left: number; right: number }> {
  const { data, info } = await sharp(sheet)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let left = width;
  let right = -1;
  for (let y = y0; y <= y1; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      const red = data[(y * width + x) * 4];
      const green = data[(y * width + x) * 4 + 1];
      const blue = data[(y * width + x) * 4 + 2];
      if (alpha < 24) continue;
      if (red + green + blue <= 22) continue;
      left = Math.min(left, x);
      right = Math.max(right, x);
    }
  }
  if (right < left) {
    return { left: 0, right: width - 1 };
  }
  return { left, right };
}

async function framesForRow(
  sheet: Buffer,
  rowY: number,
  rowHeight: number,
  imageWidth: number,
): Promise<SourceBox[]> {
  const y0 = rowY;
  const y1 = rowY + rowHeight - 1;
  const { left, right } = await inkBoundsInBand(sheet, y0, y1, imageWidth);
  const span = right - left + 1;
  const cellWidth = span / COLS;
  const frames: SourceBox[] = [];
  for (let column = 0; column < COLS; column += 1) {
    const x = Math.round(left + column * cellWidth);
    const nextX =
      column === COLS - 1
        ? right + 1
        : Math.round(left + (column + 1) * cellWidth);
    frames.push({
      x,
      y: y0,
      width: Math.max(1, nextX - x),
      height: rowHeight,
    });
  }
  return frames;
}

async function importForcedGrid(spec: TunicSpec) {
  const sheetPath = path.join(SHEETS_DIR, spec.file);
  const sheet = fs.readFileSync(sheetPath);
  const detected = await detectSheet(sheet);
  const animationRows = detected.rows.filter((row) => row.role === "animation");
  if (animationRows.length < 4) {
    throw new Error(`${spec.file}: faltan filas (${animationRows.length})`);
  }

  const directionFrames: Array<{ direction: DirectionId; frames: SourceBox[] }> =
    [];
  for (let index = 0; index < 4; index += 1) {
    const row = animationRows[index];
    const frames = await framesForRow(
      sheet,
      row.y,
      row.height,
      detected.width,
    );
    directionFrames.push({
      direction: ROW_DIRECTIONS[index],
      frames,
    });
  }

  const plan: SpritePlan = {
    kind: "body",
    cellWidth: 26,
    cellHeight: 46,
    align: "bottom",
    contentScale: 0.92,
    directions: directionFrames.map((row) => ({
      direction: row.direction,
      frames: row.frames.map((box) => ({ box, dx: 0, dy: 0 })),
    })),
    iconBox: directionFrames[0].frames[0],
    headOffsetX: 0,
    headOffsetY: -4,
    offsetX: 0,
    offsetY: 0,
    itemName: `${spec.itemName} (fix)`,
    referenceItemId: 1238,
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
    const created = data[String(imported.animationId)]
      ? null
      : data[String(Object.keys(data).pop()!)];

    // commitSpriteImport creates a NEW item; find the newest one by name suffix
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
  for (const tunic of TUNICS) {
    const result = await importForcedGrid(tunic);
    console.log(
      JSON.stringify({
        name: tunic.itemName,
        keptItemId: tunic.existingItemId,
        newBodyId: result.animationId,
        iconGrh: result.iconGrh,
        frames: result.frameCount,
      }),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
