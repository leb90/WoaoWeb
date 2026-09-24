import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ROOT = path.resolve(ROOT, "..");
const CSV_PATH = path.join(PROJECT_ROOT, "crafting-candidates-from-old.csv");
const API_OBJS_PATH = path.join(PROJECT_ROOT, "api/src/jsons/objs.json");
const SERVER_OBJS_PATH = path.join(PROJECT_ROOT, "server/jsons/objs.json");
const CLIENT_OBJS_PATH = path.join(PROJECT_ROOT, "frontend/public/init/objs.json");
const API_NPCS_PATH = path.join(PROJECT_ROOT, "api/src/jsons/npcs.json");
const SERVER_NPCS_PATH = path.join(PROJECT_ROOT, "server/jsons/npcs.json");
const CRAFTING_API_PATH = path.join(PROJECT_ROOT, "api/src/jsons/craftingRecipes.json");
const CRAFTING_SERVER_PATH = path.join(PROJECT_ROOT, "server/jsons/craftingRecipes.json");
const GRAPHICS_PATH = path.join(PROJECT_ROOT, "frontend/public/init/graficos.json");
const GRAPHICS_OPTIMIZED_PATH = path.join(PROJECT_ROOT, "frontend/public/init/graficos_optimized.json");
const GRAPHICS_DIR = path.join(PROJECT_ROOT, "frontend/public/graphics");
const RESOURCES_DIR = path.join(PROJECT_ROOT, "Recursos");
const RESOURCE_CATALOG_PATH = path.join(PROJECT_ROOT, "crafting-resource-catalog.csv");

const RECIPE_OBJECT_TYPE = 46;
const FIRST_RECIPE_ITEM_ID = 1600;
const LEVEL_GRAPHICS = {
    10: { grhIndex: 36771, file: 24010, source: "receta nivel 10.png", accent: [234, 217, 178] },
    20: { grhIndex: 36772, file: 24011, source: "receta nivel 20.png", accent: [125, 211, 252] },
    30: { grhIndex: 36773, file: 24012, source: "receta nivel 30.png", accent: [250, 204, 21] },
    40: { grhIndex: 36774, file: 24013, source: "receta nivel 40.png", accent: [244, 114, 182] },
    50: { grhIndex: 36775, file: 24014, source: "receta nivel 50.png", accent: [55, 65, 81] },
};

function parseCsv(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;

    for (let index = 0; index < text.length; index++) {
        const char = text[index];
        const next = text[index + 1];

        if (char === '"') {
            if (quoted && next === '"') {
                cell += '"';
                index++;
            } else {
                quoted = !quoted;
            }
            continue;
        }

        if (!quoted && char === ";") {
            row.push(cell);
            cell = "";
            continue;
        }

        if (!quoted && (char === "\n" || char === "\r")) {
            if (char === "\r" && next === "\n") {
                index++;
            }
            row.push(cell);
            if (row.some((value) => value.trim().length > 0)) {
                rows.push(row);
            }
            row = [];
            cell = "";
            continue;
        }

        cell += char;
    }

    row.push(cell);
    if (row.some((value) => value.trim().length > 0)) {
        rows.push(row);
    }

    const header = rows.shift() ?? [];
    return rows.map((values) =>
        Object.fromEntries(header.map((name, index) => [name, values[index] ?? ""])),
    );
}

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

function toInt(value, fallback = 0) {
    const parsed = Number.parseInt(String(value ?? "").trim(), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeLookupKey(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

function normalizeProfession(value) {
    const profession = String(value ?? "").trim();
    if (profession === "carpentry" || profession === "tailoring" || profession === "blacksmith") {
        return profession;
    }
    return "blacksmith";
}

function loadMaterialLookup() {
    if (!fs.existsSync(RESOURCE_CATALOG_PATH)) {
        return new Map();
    }

    const lookup = new Map();
    for (const row of parseCsv(fs.readFileSync(RESOURCE_CATALOG_PATH, "utf8"))) {
        const itemId = toInt(row.itemId);
        if (!itemId) {
            continue;
        }
        lookup.set(normalizeLookupKey(row.name), itemId);
        lookup.set(normalizeLookupKey(row.resourceKey), itemId);
    }
    return lookup;
}

function parseMaterials(value) {
    const materials = [];
    const chunks = String(value ?? "")
        .split(/[+,]/)
        .map((chunk) => chunk.trim())
        .filter(Boolean);

    for (const chunk of chunks) {
        const idMatch = chunk.match(/\((\d+)\)\s*x\s*(\d+)/i) ?? chunk.match(/^(\d+)\s*x\s*(\d+)$/i);
        if (idMatch) {
            materials.push({
                itemId: Number(idMatch[1]),
                amount: Number(idMatch[2]),
            });
            continue;
        }

        const nameMatch = chunk.match(/^(.+?)\s*x\s*(\d+)$/i);
        if (!nameMatch) {
            continue;
        }

        const itemId = materialLookup.get(normalizeLookupKey(nameMatch[1]));
        if (itemId) {
            materials.push({
                itemId,
                amount: Number(nameMatch[2]),
            });
        }
    }

    return materials;
}

function createRecipeObject(baseObject, recipe, craftedName) {
    return {
        ...baseObject,
        name: `Receta: ${craftedName}`,
        objType: RECIPE_OBJECT_TYPE,
        grhIndex: LEVEL_GRAPHICS[recipe.level]?.grhIndex ?? LEVEL_GRAPHICS[10].grhIndex,
        valor: 1,
        anim: 0,
        minHit: 0,
        maxHit: 0,
        minDef: 0,
        maxDef: 0,
        minDefMag: 0,
        maxDefMag: 0,
        resistenciaMagica: 0,
        tipoPocion: 0,
        minModificador: 0,
        maxModificador: 0,
        porcentaje: 0,
        spellIndex: 0,
        subtipo: recipe.level,
        recipeId: recipe.id,
        recipeForItemId: recipe.itemId,
        recipeLevel: recipe.level,
        clasesNoPermitidas: [],
    };
}

function crc32(buffer) {
    let table = crc32.table;
    if (!table) {
        table = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            let c = n;
            for (let k = 0; k < 8; k++) {
                c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            }
            table[n] = c >>> 0;
        }
        crc32.table = table;
    }

    let crc = 0xffffffff;
    for (let index = 0; index < buffer.length; index++) {
        crc = table[(crc ^ buffer[index]) & 0xff] ^ (crc >>> 8);
    }

    return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
    const typeBuffer = Buffer.from(type, "ascii");
    const lengthBuffer = Buffer.alloc(4);
    lengthBuffer.writeUInt32BE(data.length, 0);
    const crcBuffer = Buffer.alloc(4);
    crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
    return Buffer.concat([lengthBuffer, typeBuffer, data, crcBuffer]);
}

function writeRecipePng(filePath, accent) {
    const width = 32;
    const height = 32;
    const raw = Buffer.alloc((width * 4 + 1) * height);
    const parchment = [229, 210, 168];
    const shade = [116, 79, 43];
    const dark = [36, 27, 21];
    const light = [255, 245, 206];

    for (let y = 0; y < height; y++) {
        const rowStart = y * (width * 4 + 1);
        raw[rowStart] = 0;
        for (let x = 0; x < width; x++) {
            const offset = rowStart + 1 + x * 4;
            let color = [0, 0, 0, 0];
            const inPaper = x >= 7 && x <= 24 && y >= 4 && y <= 27;
            const rolledTop = x >= 9 && x <= 27 && y >= 2 && y <= 6;
            const rolledBottom = x >= 5 && x <= 23 && y >= 25 && y <= 30;

            if (inPaper || rolledTop || rolledBottom) {
                color = parchment;
                if ((x + y) % 7 === 0) {
                    color = [222, 196, 149];
                }
                if (x === 7 || x === 24 || y === 4 || y === 27 || y === 2 || y === 30) {
                    color = shade;
                }
                if (x >= 10 && x <= 22 && [11, 15, 19].includes(y)) {
                    color = [123, 90, 58];
                }
                if (x >= 9 && x <= 23 && y >= 21 && y <= 24) {
                    color = accent;
                }
                if ((x === 8 && y === 5) || (x === 23 && y === 26)) {
                    color = light;
                }
                if ((x === 6 && y >= 6 && y <= 25) || (x === 25 && y >= 5 && y <= 26)) {
                    color = dark;
                }
            }

            raw[offset] = color[0];
            raw[offset + 1] = color[1];
            raw[offset + 2] = color[2];
            raw[offset + 3] = color[3];
        }
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8;
    ihdr[9] = 6;
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const png = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        pngChunk("IHDR", ihdr),
        pngChunk("IDAT", zlib.deflateSync(raw)),
        pngChunk("IEND", Buffer.alloc(0)),
    ]);

    fs.writeFileSync(filePath, png);
}

const materialLookup = loadMaterialLookup();
const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"))
    .map((row, index) => {
        const itemId = toInt(row.itemId);
        const level = toInt(row.suggestedRecipeLevel, 10);
        return {
            ...row,
            index,
            itemId,
            level: LEVEL_GRAPHICS[level] ? level : 10,
            materials: parseMaterials(row.materials),
        };
    })
    .filter((row) => row.itemId > 0 && row.materials.length > 0);

const apiObjs = readJson(API_OBJS_PATH);
const serverObjs = fs.existsSync(SERVER_OBJS_PATH) ? readJson(SERVER_OBJS_PATH) : { ...apiObjs };
const clientObjs = readJson(CLIENT_OBJS_PATH);
const apiNpcs = readJson(API_NPCS_PATH);
const serverNpcs = fs.existsSync(SERVER_NPCS_PATH) ? readJson(SERVER_NPCS_PATH) : structuredClone(apiNpcs);
const graphics = readJson(GRAPHICS_PATH);
const optimizedGraphics = readJson(GRAPHICS_OPTIMIZED_PATH);
const craftingItemIds = new Set(rows.map((row) => row.itemId));
let removedVendorEntries = 0;

for (const npc of Object.values(apiNpcs)) {
    if (!Array.isArray(npc.objs)) {
        continue;
    }

    const before = npc.objs.length;
    npc.objs = npc.objs.filter((entry) => !craftingItemIds.has(Number(entry?.item ?? 0)));
    removedVendorEntries += before - npc.objs.length;
}

for (const npc of Object.values(serverNpcs)) {
    if (!Array.isArray(npc.objs)) {
        continue;
    }

    npc.objs = npc.objs.filter((entry) => !craftingItemIds.has(Number(entry?.item ?? 0)));
}

const baseObject = {
    name: "",
    objType: 0,
    grhIndex: 0,
    valor: 0,
    minHit: 0,
    maxHit: 0,
    minDef: 0,
    maxDef: 0,
    minDefMag: 0,
    maxDefMag: 0,
    resistenciaMagica: 0,
    tipoPocion: 0,
    minModificador: 0,
    maxModificador: 0,
    anim: 0,
    newbie: 0,
    proyectil: 0,
    apu: 0,
    spellIndex: 0,
    razaEnana: 0,
    agarrable: 1,
    noSeCae: 0,
    staffDamageBonus: 0,
    magicDamageBonus: 0,
    porcentaje: 0,
    indexAbierta: 0,
    indexCerrada: 0,
    llave: 0,
    cerrada: 0,
    minSkill: 0,
    subtipo: 0,
    clasesNoPermitidas: [],
    objetoEspecial: 0,
    mataHobbits: 0,
};

const recipes = rows.map((row, index) => {
    const recipeId = index + 1;
    const recipeItemId = FIRST_RECIPE_ITEM_ID + index;
    const recipe = {
        id: recipeId,
        profession: normalizeProfession(row.profession),
        category: row.category || "Otros",
        sortOrder: recipeId,
        deleted: false,
        itemId: row.itemId,
        skill: 0,
        level: row.level,
        recipeItemId,
        materials: row.materials,
    };
    const craftedName = apiObjs[String(row.itemId)]?.name || row.name || `Item ${row.itemId}`;
    const recipeObject = createRecipeObject(baseObject, recipe, craftedName);

    apiObjs[String(recipeItemId)] = recipeObject;
    serverObjs[String(recipeItemId)] = recipeObject;
    clientObjs[String(recipeItemId)] = recipeObject;

    return recipe;
});

for (const [level, data] of Object.entries(LEVEL_GRAPHICS)) {
    const grhRecord = {
        numFrames: 1,
        numFile: data.file,
        sX: 0,
        sY: 0,
        width: 32,
        height: 32,
        frames: { 1: data.grhIndex },
    };
    const optimizedRecord = [data.file, 0, 0, 32, 32];

    graphics[String(data.grhIndex)] = grhRecord;
    optimizedGraphics[String(data.grhIndex)] = optimizedRecord;

    const sourcePath = path.join(RESOURCES_DIR, data.source);
    const targetPath = path.join(GRAPHICS_DIR, `${data.file}.png`);
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath);
    } else {
        writeRecipePng(targetPath, data.accent);
    }
    void level;
}

writeJson(API_OBJS_PATH, apiObjs);
writeJson(SERVER_OBJS_PATH, serverObjs);
writeJson(CLIENT_OBJS_PATH, clientObjs);
writeJson(API_NPCS_PATH, apiNpcs);
writeJson(SERVER_NPCS_PATH, serverNpcs);
writeJson(GRAPHICS_PATH, graphics);
writeJson(GRAPHICS_OPTIMIZED_PATH, optimizedGraphics);
writeJson(CRAFTING_API_PATH, recipes);
writeJson(CRAFTING_SERVER_PATH, recipes);

console.log(`Recetas generadas: ${recipes.length}`);
console.log(`Objetos-receta: ${FIRST_RECIPE_ITEM_ID}-${FIRST_RECIPE_ITEM_ID + recipes.length - 1}`);
console.log(`Entradas quitadas de comerciantes: ${removedVendorEntries}`);
