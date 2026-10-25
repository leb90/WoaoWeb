import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const repoRoot = path.resolve(process.cwd(), "..");
const resourcesDir = path.join(repoRoot, "Recursos", "templo_entrenadores");
const graphicsDir = path.join(repoRoot, "frontend", "public", "graphics");
const frontendInitDir = path.join(repoRoot, "frontend", "public", "init");

const SOURCE = {
  innerWalls: path.join(resourcesDir, "muros_interiores.png"),
  outerWalls: path.join(resourcesDir, "muros_exteriores.png"),
  decor: path.join(resourcesDir, "pisos_decoracion.png"),
};

const MAP_ID = 34;
const AREA = { x0: 47, y0: 51, width: 33, height: 24 };
const CLEAR_AREA = { x0: 47, y0: 51, width: 33, height: 27 };
const ATLAS_FILE = 320256;
const FIRST_GRH = 38215;
const CELLS_PER_LAYER = AREA.width * AREA.height;
const REFERENCE_IDS = [2037, 2038, 2039];
const LAYER_NAMES = [
  "Templo de Entrenadores - Pisos",
  "Templo de Entrenadores - Alfombras y escaleras",
  "Templo de Entrenadores - Muros y decoracion",
];

const TRAINERS = [
  { npcIndex: 9704, x: 63, y: 57 },
  { npcIndex: 9700, x: 52, y: 57 },
  { npcIndex: 9701, x: 57, y: 57 },
  { npcIndex: 9702, x: 52, y: 63 },
  { npcIndex: 9703, x: 57, y: 63 },
  { npcIndex: 9705, x: 54, y: 69 },
  { npcIndex: 9706, x: 69, y: 57 },
  { npcIndex: 9707, x: 74, y: 57 },
  { npcIndex: 9708, x: 69, y: 63 },
  { npcIndex: 9709, x: 74, y: 63 },
  { npcIndex: 9710, x: 72, y: 69 },
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data)}\n`, "utf8");
}

function inTemple(x, y) {
  return (
    x >= CLEAR_AREA.x0 &&
    y >= CLEAR_AREA.y0 &&
    x < CLEAR_AREA.x0 + CLEAR_AREA.width &&
    y < CLEAR_AREA.y0 + CLEAR_AREA.height
  );
}

async function cropSprite(file, rect, width, height, options = {}) {
  const cropped = await sharp(file).extract(rect).png().toBuffer();
  let image = sharp(cropped).trim({
    background: { r: 0, g: 0, b: 0, alpha: 0 },
    threshold: 2,
  });
  if (options.flop) image = image.flop();
  return image
    .resize(width, height, { fit: options.fit ?? "fill" })
    .png()
    .toBuffer();
}

async function buildFloor() {
  const width = AREA.width * 32;
  const height = AREA.height * 32;
  const floorTiles = await Promise.all([
    cropSprite(SOURCE.decor, { left: 14, top: 24, width: 92, height: 72 }, 32, 32),
    cropSprite(SOURCE.decor, { left: 112, top: 24, width: 86, height: 72 }, 32, 32),
    cropSprite(SOURCE.decor, { left: 211, top: 24, width: 85, height: 72 }, 32, 32),
    cropSprite(SOURCE.decor, { left: 15, top: 112, width: 88, height: 80 }, 32, 32),
    cropSprite(SOURCE.decor, { left: 112, top: 112, width: 85, height: 80 }, 32, 32),
    cropSprite(SOURCE.decor, { left: 211, top: 112, width: 85, height: 80 }, 32, 32),
  ]);
  const composites = [];
  for (let y = 0; y < AREA.height; y += 1) {
    for (let x = 0; x < AREA.width; x += 1) {
      const variant = (x * 3 + y * 5 + (x * y) % 3) % floorTiles.length;
      composites.push({ input: floorTiles[variant], left: x * 32, top: y * 32 });
    }
  }
  return sharp({
    create: { width, height, channels: 4, background: { r: 22, g: 22, b: 20, alpha: 1 } },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function buildUnderlay() {
  const width = AREA.width * 32;
  const height = AREA.height * 32;
  const centralCarpet = await cropSprite(
    SOURCE.decor,
    { left: 16, top: 435, width: 91, height: 424 },
    128,
    588,
  );
  const wingCarpet = await cropSprite(
    SOURCE.decor,
    { left: 111, top: 435, width: 118, height: 102 },
    288,
    68,
  );
  const wingCarpetAlt = await cropSprite(
    SOURCE.decor,
    { left: 234, top: 435, width: 137, height: 102 },
    288,
    68,
  );
  const altarSteps = await cropSprite(
    SOURCE.decor,
    { left: 424, top: 285, width: 278, height: 139 },
    280,
    106,
  );
  const entranceSteps = await cropSprite(
    SOURCE.decor,
    { left: 277, top: 301, width: 118, height: 105 },
    176,
    84,
  );

  const composites = [
    { input: centralCarpet, left: 464, top: 112 },
    { input: altarSteps, left: 388, top: 50 },
    { input: entranceSteps, left: 440, top: 684 },
  ];
  for (const top of [150, 342, 534]) {
    composites.push({ input: wingCarpet, left: 64, top });
    composites.push({ input: wingCarpetAlt, left: 704, top });
  }

  return sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function buildOverhead() {
  const width = AREA.width * 32;
  const height = AREA.height * 32;

  const northWall = await cropSprite(
    SOURCE.outerWalls,
    { left: 12, top: 16, width: 280, height: 180 },
    352,
    126,
  );
  const sideWall = await cropSprite(
    SOURCE.outerWalls,
    { left: 1206, top: 14, width: 132, height: 386 },
    72,
    614,
  );
  const sideWallFlopped = await cropSprite(
    SOURCE.outerWalls,
    { left: 1206, top: 14, width: 132, height: 386 },
    72,
    614,
    { flop: true },
  );
  const entranceFacadeRaw = await cropSprite(
    SOURCE.outerWalls,
    { left: 9, top: 796, width: 786, height: 222 },
    width,
    122,
  );
  const entranceOpening = { left: 430, top: 30, width: 196, height: 92 };
  const entranceCutout = Buffer.from(
    `<svg width="${width}" height="122"><rect x="${entranceOpening.left}" y="${entranceOpening.top}" width="${entranceOpening.width}" height="${entranceOpening.height}" fill="white"/></svg>`,
  );
  const entranceFacade = await sharp(entranceFacadeRaw)
    .composite([{ input: entranceCutout, blend: "dest-out" }])
    .png()
    .toBuffer();

  const divider = await cropSprite(
    SOURCE.innerWalls,
    { left: 14, top: 19, width: 445, height: 106 },
    336,
    54,
  );
  const dividerFlopped = await cropSprite(
    SOURCE.innerWalls,
    { left: 14, top: 19, width: 445, height: 106 },
    336,
    54,
    { flop: true },
  );
  const verticalDivider = await cropSprite(
    SOURCE.innerWalls,
    { left: 130, top: 136, width: 62, height: 182 },
    40,
    112,
  );
  const verticalDividerFlopped = await cropSprite(
    SOURCE.innerWalls,
    { left: 130, top: 136, width: 62, height: 182 },
    40,
    112,
    { flop: true },
  );
  const bookcases = await cropSprite(
    SOURCE.decor,
    { left: 12, top: 645, width: 690, height: 166 },
    310,
    68,
  );
  const weapons = await cropSprite(
    SOURCE.decor,
    { left: 491, top: 807, width: 216, height: 99 },
    128,
    54,
  );
  const crossedWeapons = await cropSprite(
    SOURCE.decor,
    { left: 158, top: 852, width: 124, height: 166 },
    76,
    98,
  );
  const dummies = await cropSprite(
    SOURCE.decor,
    { left: 282, top: 850, width: 174, height: 170 },
    112,
    108,
  );
  const target = await cropSprite(
    SOURCE.decor,
    { left: 711, top: 886, width: 103, height: 196 },
    68,
    120,
  );
  const alchemy = await cropSprite(
    SOURCE.decor,
    { left: 474, top: 902, width: 230, height: 184 },
    146,
    112,
  );
  const studyTable = await cropSprite(
    SOURCE.decor,
    { left: 711, top: 756, width: 252, height: 142 },
    150,
    80,
  );
  const plants = await cropSprite(
    SOURCE.decor,
    { left: 894, top: 648, width: 284, height: 168 },
    174,
    96,
  );
  const statue = await cropSprite(
    SOURCE.decor,
    { left: 1210, top: 12, width: 134, height: 278 },
    76,
    158,
  );
  const stainedWindow = await cropSprite(
    SOURCE.decor,
    { left: 1340, top: 9, width: 88, height: 196 },
    46,
    112,
  );
  const banner = await cropSprite(
    SOURCE.decor,
    { left: 1230, top: 416, width: 97, height: 192 },
    48,
    104,
  );
  const column = await cropSprite(
    SOURCE.decor,
    { left: 887, top: 7, width: 96, height: 200 },
    48,
    114,
  );
  const candelabra = await cropSprite(
    SOURCE.decor,
    { left: 991, top: 418, width: 188, height: 240 },
    100,
    126,
  );
  const brazier = await cropSprite(
    SOURCE.decor,
    { left: 1175, top: 608, width: 91, height: 171 },
    52,
    94,
  );

  const composites = [
    { input: northWall, left: 0, top: 0 },
    { input: northWall, left: 352, top: 0 },
    { input: northWall, left: 704, top: 0 },
    { input: sideWall, left: 0, top: 94 },
    { input: sideWallFlopped, left: 984, top: 94 },
    { input: entranceFacade, left: 0, top: 646 },
    { input: divider, left: 32, top: 264 },
    { input: dividerFlopped, left: 688, top: 264 },
    { input: divider, left: 32, top: 456 },
    { input: dividerFlopped, left: 688, top: 456 },
    { input: verticalDivider, left: 360, top: 314 },
    { input: verticalDividerFlopped, left: 656, top: 314 },
    { input: verticalDivider, left: 360, top: 506 },
    { input: verticalDividerFlopped, left: 656, top: 506 },
    { input: bookcases, left: 64, top: 82 },
    { input: bookcases, left: 682, top: 82 },
    { input: alchemy, left: 70, top: 286 },
    { input: weapons, left: 916, top: 306 },
    { input: studyTable, left: 64, top: 492 },
    { input: crossedWeapons, left: 700, top: 526 },
    { input: dummies, left: 858, top: 516 },
    { input: target, left: 974, top: 506 },
    { input: plants, left: 292, top: 510 },
    { input: statue, left: 490, top: 8 },
    { input: stainedWindow, left: 421, top: 8 },
    { input: stainedWindow, left: 589, top: 8 },
    { input: banner, left: 342, top: 28 },
    { input: banner, left: 666, top: 28 },
    { input: column, left: 368, top: 120 },
    { input: column, left: 640, top: 120 },
    { input: column, left: 400, top: 330 },
    { input: column, left: 608, top: 330 },
    { input: column, left: 400, top: 522 },
    { input: column, left: 608, top: 522 },
    { input: candelabra, left: 478, top: 72 },
    { input: brazier, left: 414, top: 250 },
    { input: brazier, left: 590, top: 250 },
    { input: brazier, left: 414, top: 574 },
    { input: brazier, left: 590, top: 574 },
  ];

  return sharp({
    create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function layerOccupancy(layer) {
  const { data, info } = await sharp(layer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const result = Array.from({ length: AREA.height }, () => Array(AREA.width).fill(false));
  for (let y = 0; y < AREA.height; y += 1) {
    for (let x = 0; x < AREA.width; x += 1) {
      let hasInk = false;
      for (let py = y * 32; py < (y + 1) * 32 && !hasInk; py += 1) {
        for (let px = x * 32; px < (x + 1) * 32; px += 1) {
          if (data[(py * info.width + px) * 4 + 3] > 0) {
            hasInk = true;
            break;
          }
        }
      }
      result[y][x] = hasInk;
    }
  }
  return result;
}

async function publishAtlas(layers) {
  const width = AREA.width * 32;
  const atlas = await sharp({
    create: {
      width,
      height: AREA.height * 32 * layers.length,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      layers.map((input, index) => ({
        input,
        left: 0,
        top: index * AREA.height * 32,
      })),
    )
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  fs.writeFileSync(path.join(graphicsDir, `${ATLAS_FILE}.png`), atlas);

  const verbosePath = path.join(frontendInitDir, "graficos.json");
  const compactPath = path.join(frontendInitDir, "graficos_optimized.json");
  const verbose = readJson(verbosePath);
  const compact = readJson(compactPath);
  const occupancy = await Promise.all(layers.map(layerOccupancy));

  for (let layer = 0; layer < layers.length; layer += 1) {
    for (let y = 0; y < AREA.height; y += 1) {
      for (let x = 0; x < AREA.width; x += 1) {
        const offset = layer * CELLS_PER_LAYER + y * AREA.width + x;
        const grh = FIRST_GRH + offset;
        const sX = x * 32;
        const sY = (layer * AREA.height + y) * 32;
        verbose[String(grh)] = {
          numFrames: 1,
          numFile: ATLAS_FILE,
          sX,
          sY,
          width: 32,
          height: 32,
          frames: { "1": grh },
        };
        compact[String(grh)] = [ATLAS_FILE, sX, sY, 32, 32];
        if (layer === 0) occupancy[layer][y][x] = true;
      }
    }
  }
  writeJson(verbosePath, verbose);
  writeJson(compactPath, compact);
  return occupancy;
}

function graphicsFor(layers) {
  const last = layers.findLastIndex((value) => Boolean(value));
  if (last < 0) return undefined;
  if (last === 0) return layers[0];
  return layers.slice(0, last + 1).map((value) => value || null);
}

function expandTerrain(terrain) {
  return terrain.rows.map((row) =>
    row.map((paletteId) => {
      const entry = terrain.palette[String(paletteId)] ?? {};
      const graphics = Array.isArray(entry.graphics)
        ? [entry.graphics[0] || 0, entry.graphics[1] || 0, entry.graphics[2] || 0, entry.graphics[3] || 0]
        : [entry.graphics || 0, 0, 0, 0];
      return { graphics, blocked: Boolean(entry.blocked) };
    }),
  );
}

function collapseTerrain(tiles) {
  const palette = {};
  const paletteIds = new Map();
  const rows = [];
  for (const tileRow of tiles) {
    const row = [];
    for (const tile of tileRow) {
      const entry = {};
      const graphics = graphicsFor(tile.graphics);
      if (graphics !== undefined) entry.graphics = graphics;
      if (tile.blocked) entry.blocked = true;
      const signature = JSON.stringify(entry);
      let id = paletteIds.get(signature);
      if (!id) {
        id = paletteIds.size + 1;
        paletteIds.set(signature, id);
        palette[String(id)] = entry;
      }
      row.push(id);
    }
    rows.push(row);
  }
  return { id: MAP_ID, width: tiles[0].length, height: tiles.length, palette, rows };
}

function isBlockedTempleTile(localX, localY) {
  if (localY <= 1) return true;
  if (localX <= 1 || localX >= AREA.width - 2) return true;
  if (localY >= AREA.height - 2 && (localX < 13 || localX > 19)) return true;
  if ([8, 14].includes(localY) && (localX <= 10 || localX >= 22)) return true;
  if ([11, 21].includes(localX) && [4, 10, 16].includes(localY)) return true;
  if ([12, 19].includes(localX) && [11, 17].includes(localY)) return true;
  return false;
}

function removeAreaEntries(collection) {
  if (!collection) return;
  for (const key of Object.keys(collection)) {
    const [x, y] = key.split(",").map(Number);
    if (inTemple(x, y)) delete collection[key];
  }
}

function updateSpecials(specials) {
  for (const key of ["exits", "objects", "npcs", "triggers"]) {
    specials[key] ??= {};
    removeAreaEntries(specials[key]);
  }
  for (const [key, npcIndex] of Object.entries(specials.npcs)) {
    if (Number(npcIndex) >= 9700 && Number(npcIndex) <= 9710) delete specials.npcs[key];
  }
  for (const trainer of TRAINERS) {
    specials.npcs[`${trainer.x},${trainer.y}`] = trainer.npcIndex;
  }
  return specials;
}

function placementsFromSpecials(specials) {
  return Object.entries(specials.npcs ?? {})
    .map(([key, npcIndex]) => {
      const [x, y] = key.split(",").map(Number);
      return { mapNum: MAP_ID, x, y, npcIndex: Number(npcIndex) };
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

function normalizeExit(exit) {
  const raw = exit && typeof exit === "object" && "destinations" in exit ? exit.destinations?.[0] : exit;
  if (!raw) return null;
  const map = Number(raw.map);
  const x = Number(raw.x);
  const y = Number(raw.y);
  return [map, x, y].every(Number.isFinite) ? { m: map, x, y } : null;
}

function compactTile(x, y, terrain, specials) {
  const entry = terrain.palette[String(terrain.rows[y - 1]?.[x - 1])] ?? {};
  const tile = {};
  if (entry.blocked) tile.b = 1;
  if (entry.graphics !== undefined) tile.g = entry.graphics;
  const key = `${x},${y}`;
  const exit = normalizeExit(specials.exits?.[key]);
  if (exit) tile.e = exit;
  const npc = Number(specials.npcs?.[key]);
  if (Number.isFinite(npc) && npc > 0) tile.n = npc;
  const trigger = Number(specials.triggers?.[key]);
  if (Number.isFinite(trigger)) tile.t = trigger;
  const object = specials.objects?.[key];
  if (object && Number.isFinite(Number(object.objIndex)) && Number.isFinite(Number(object.amount))) {
    tile.o = { i: Number(object.objIndex), a: Number(object.amount) };
  }
  return tile;
}

function buildCompactMap(terrain, specials) {
  const data = [];
  const complex = [];
  const complexBySignature = new Map();
  for (let y = 1; y <= terrain.height; y += 1) {
    for (let x = 1; x <= terrain.width; x += 1) {
      const tile = compactTile(x, y, terrain, specials);
      const keys = Object.keys(tile);
      if (keys.length === 0) {
        data.push(0);
      } else if (keys.length === 1 && typeof tile.g === "number") {
        data.push(tile.g);
      } else if (keys.length === 2 && tile.b === 1 && typeof tile.g === "number") {
        data.push(100000 + tile.g);
      } else {
        const signature = JSON.stringify(tile);
        let index = complexBySignature.get(signature);
        if (index === undefined) {
          index = complex.length;
          complexBySignature.set(signature, index);
          complex.push(tile);
        }
        data.push(-(index + 1));
      }
    }
  }
  return complex.length
    ? { id: MAP_ID, w: terrain.width, h: terrain.height, d: data, cx: complex }
    : { id: MAP_ID, w: terrain.width, h: terrain.height, d: data };
}

function publishMap(occupancy) {
  const serverDir = path.join(repoRoot, "server", "mapas_source", `mapa_${MAP_ID}`);
  const terrainPath = path.join(serverDir, "terrain.json");
  const specialsPath = path.join(serverDir, "specials.json");
  const sourceTerrain = readJson(terrainPath);
  const tiles = expandTerrain(sourceTerrain);

  for (let localY = 0; localY < AREA.height; localY += 1) {
    for (let localX = 0; localX < AREA.width; localX += 1) {
      const x = AREA.x0 - 1 + localX;
      const y = AREA.y0 - 1 + localY;
      tiles[y][x] = {
        graphics: [
          FIRST_GRH + localY * AREA.width + localX,
          occupancy[1][localY][localX]
            ? FIRST_GRH + CELLS_PER_LAYER + localY * AREA.width + localX
            : 0,
          occupancy[2][localY][localX]
            ? FIRST_GRH + CELLS_PER_LAYER * 2 + localY * AREA.width + localX
            : 0,
          0,
        ],
        blocked: isBlockedTempleTile(localX, localY),
      };
    }
  }
  // Tall trees south of the building extend several tiles upward over the
  // facade. Keep the existing ground, but clear their upper layers and
  // collision across the entrance apron.
  for (let y = AREA.y0 + AREA.height; y < CLEAR_AREA.y0 + CLEAR_AREA.height; y += 1) {
    for (let x = CLEAR_AREA.x0; x < CLEAR_AREA.x0 + CLEAR_AREA.width; x += 1) {
      const tile = tiles[y - 1][x - 1];
      tile.graphics = [tile.graphics[0] || 0, 0, 0, 0];
      tile.blocked = false;
    }
  }

  const terrain = collapseTerrain(tiles);
  const specials = updateSpecials(readJson(specialsPath));
  const placements = placementsFromSpecials(specials);
  const compactMap = buildCompactMap(terrain, specials);
  for (const root of [
    path.join(repoRoot, "server", "mapas_source"),
    path.join(repoRoot, "api", "src", "mapas_source"),
  ]) {
    const mapDir = path.join(root, `mapa_${MAP_ID}`);
    writeJson(path.join(mapDir, "terrain.json"), terrain);
    writeJson(path.join(mapDir, "specials.json"), specials);
    writeJson(path.join(mapDir, "npcs.json"), placements);
  }
  writeJson(path.join(repoRoot, "frontend", "public", "maps", `mapa_${MAP_ID}.json`), compactMap);
  writeJson(
    path.join(repoRoot, "frontend", "public", "maps_optimized", `mapa_${MAP_ID}.json`),
    compactMap,
  );
}

function publishIndices() {
  const indicesPath = path.join(repoRoot, "Recursos", "indices.ini");
  let content = fs.readFileSync(indicesPath, "utf8");
  for (const id of REFERENCE_IDS) {
    const section = new RegExp(`\\r?\\n\\[REFERENCIA${id}\\][\\s\\S]*?(?=\\r?\\n\\[REFERENCIA|$)`, "i");
    content = content.replace(section, "");
  }
  content = content.trimEnd();
  for (let layer = 0; layer < 3; layer += 1) {
    content +=
      `\n\n[REFERENCIA${REFERENCE_IDS[layer]}]\n` +
      `Nombre=${LAYER_NAMES[layer]}\n` +
      `GrhIndice=${FIRST_GRH + layer * CELLS_PER_LAYER}\n` +
      `Ancho=${AREA.width}\n` +
      `Alto=${AREA.height}\n` +
      `Capa=${layer + 1}\n` +
      "Bloquear=0";
  }
  fs.writeFileSync(indicesPath, `${content}\n`, "utf8");
}

async function main() {
  for (const file of Object.values(SOURCE)) {
    if (!fs.existsSync(file)) throw new Error(`Falta el recurso ${file}`);
  }
  const layers = await Promise.all([buildFloor(), buildUnderlay(), buildOverhead()]);
  const occupancy = await publishAtlas(layers);
  publishMap(occupancy);
  publishIndices();
  const previewPath = path.join(repoRoot, ".run-logs", "templo-entrenadores-layers.png");
  fs.mkdirSync(path.dirname(previewPath), { recursive: true });
  await sharp(layers[0])
    .composite([{ input: layers[1] }, { input: layers[2] }])
    .png()
    .toFile(previewPath);
  console.log(
    JSON.stringify(
      {
        map: MAP_ID,
        area: AREA,
        atlasFile: ATLAS_FILE,
        grhRange: [FIRST_GRH, FIRST_GRH + CELLS_PER_LAYER * 3 - 1],
        trainers: TRAINERS.length,
        previewPath,
      },
      null,
      2,
    ),
  );
}

await main();
