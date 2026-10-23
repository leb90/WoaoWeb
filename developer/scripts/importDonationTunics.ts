import fs from "node:fs";
import path from "node:path";
import {
  commitSpriteImport,
  detectSheet,
  type DirectionId,
  type SpritePlan,
} from "../lib/graphics/spriteImport";

const ROOT = path.resolve(__dirname, "..");
const SHEETS_DIR = path.join(ROOT, "tmp", "tunicas");

type TunicSpec = {
  file: string;
  itemName: string;
  bonusGoldNpcPct: number;
  bonusExpNpcPct: number;
  bonusDropNpcPct: number;
};

const TUNICS: TunicSpec[] = [
  {
    file: "suerte.png",
    itemName: "Túnica Suerte",
    bonusGoldNpcPct: 0,
    bonusExpNpcPct: 0,
    bonusDropNpcPct: 50,
  },
  {
    file: "experiencia.png",
    itemName: "Túnica Experiencia",
    bonusGoldNpcPct: 0,
    bonusExpNpcPct: 50,
    bonusDropNpcPct: 0,
  },
  {
    file: "dorada.png",
    itemName: "Túnica Dorada",
    bonusGoldNpcPct: 50,
    bonusExpNpcPct: 0,
    bonusDropNpcPct: 0,
  },
];

// Hojas ChatGPT: frente, espalda, derecha, izquierda.
const ROW_DIRECTIONS: DirectionId[] = ["2", "1", "3", "4"];

async function importOne(spec: TunicSpec) {
  const sheetPath = path.join(SHEETS_DIR, spec.file);
  if (!fs.existsSync(sheetPath)) {
    throw new Error(`No está la hoja: ${sheetPath}`);
  }

  const sheet = fs.readFileSync(sheetPath);
  const detected = await detectSheet(sheet);
  const animationRows = detected.rows.filter((row) => row.role === "animation");
  if (animationRows.length < 4) {
    throw new Error(
      `${spec.file}: se esperaban 4 filas de animación y hay ${animationRows.length}`,
    );
  }

  const plan: SpritePlan = {
    kind: "body",
    cellWidth: 26,
    cellHeight: 46,
    align: "bottom",
    contentScale: 0.92,
    directions: ROW_DIRECTIONS.map((direction, index) => ({
      direction,
      frames: animationRows[index].frames.map((frame) => ({
        box: {
          x: frame.x,
          y: frame.y,
          width: frame.width,
          height: frame.height,
        },
        dx: 0,
        dy: 0,
      })),
    })),
    iconBox: {
      x: animationRows[0].frames[0].x,
      y: animationRows[0].frames[0].y,
      width: animationRows[0].frames[0].width,
      height: animationRows[0].frames[0].height,
    },
    headOffsetX: 0,
    headOffsetY: -4,
    offsetX: 0,
    offsetY: 0,
    itemName: spec.itemName,
    referenceItemId: 1238,
    statOverrides: {
      minDef: 8,
      maxDef: 12,
    },
  };

  const result = await commitSpriteImport(sheet, plan);
  patchItem(result.itemId, spec);
  return result;
}

function patchItem(itemId: number, spec: TunicSpec) {
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
    const item = data[String(itemId)];
    if (!item) {
      throw new Error(`No quedó el item ${itemId} en ${filePath}`);
    }

    item.name = spec.itemName;
    item.noSeCae = 1;
    item.newbie = 0;
    item.razaEnana = 0;
    item.objetoEspecial = 0;
    item.clasesNoPermitidas = [];
    item.bonusGoldNpcPct = spec.bonusGoldNpcPct;
    item.bonusExpNpcPct = spec.bonusExpNpcPct;
    item.bonusDropNpcPct = spec.bonusDropNpcPct;
    item.desc =
      spec.bonusDropNpcPct > 0
        ? "Túnica de donación. +50% chance de drop de NPCs. No se cae."
        : spec.bonusExpNpcPct > 0
          ? "Túnica de donación. +50% experiencia de NPCs. No se cae."
          : "Túnica de donación. +50% oro de NPCs. No se cae.";

    fs.writeFileSync(filePath, JSON.stringify(data));
  }
}

function addDonationEntries(
  results: Array<{ itemId: number; itemName: string }>,
) {
  const donationsPath = path.join(
    ROOT,
    "..",
    "server",
    "jsons",
    "donaciones.json",
  );
  const donations = JSON.parse(fs.readFileSync(donationsPath, "utf8")) as Record<
    string,
    {
      id: number;
      name: string;
      objIndex: number;
      cost: number;
      desc: string;
      photo: number;
    }
  >;

  let nextId = Math.max(...Object.values(donations).map((entry) => entry.id)) + 1;
  let nextPhoto =
    Math.max(...Object.values(donations).map((entry) => Number(entry.photo) || 0)) +
    1;

  for (const result of results) {
    const key = String(nextId);
    donations[key] = {
      id: nextId,
      name: result.itemName.replace(/^Túnica /, "Tunica "),
      objIndex: result.itemId,
      cost: 800,
      desc:
        result.itemName === "Túnica Suerte"
          ? "Tunica Suerte: +50% chance de drop de NPCs. No se cae."
          : result.itemName === "Túnica Experiencia"
            ? "Tunica Experiencia: +50% experiencia de NPCs. No se cae."
            : "Tunica Dorada: +50% oro de NPCs. No se cae.",
      photo: nextPhoto,
    };
    nextId += 1;
    nextPhoto += 1;
  }

  fs.writeFileSync(donationsPath, `${JSON.stringify(donations, null, 2)}\n`);
}

async function main() {
  const results = [];
  for (const tunic of TUNICS) {
    const imported = await importOne(tunic);
    console.log(
      JSON.stringify({
        name: tunic.itemName,
        itemId: imported.itemId,
        bodyId: imported.animationId,
        iconGrh: imported.iconGrh,
        graphicFile: imported.graphicFile,
        frames: imported.frameCount,
      }),
    );
    results.push({ itemId: imported.itemId, itemName: tunic.itemName });
  }

  addDonationEntries(results);
  console.log("Donaciones actualizadas.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
