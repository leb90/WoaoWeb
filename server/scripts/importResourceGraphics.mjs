import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROJECT_ROOT = path.resolve(ROOT, "..");
const RESOURCES_DIR = path.join(PROJECT_ROOT, "Recursos");
const GRAPHICS_DIR = path.join(PROJECT_ROOT, "frontend/public/graphics");
const GRAPHICS_PATH = path.join(PROJECT_ROOT, "frontend/public/init/graficos.json");
const GRAPHICS_OPTIMIZED_PATH = path.join(PROJECT_ROOT, "frontend/public/init/graficos_optimized.json");
const API_OBJS_PATH = path.join(PROJECT_ROOT, "api/src/jsons/objs.json");
const CLIENT_OBJS_PATH = path.join(PROJECT_ROOT, "frontend/public/init/objs.json");
const CATALOG_PATH = path.join(PROJECT_ROOT, "crafting-resource-catalog.csv");

const RECIPE_GRAPHICS = [
    { level: 10, grhIndex: 36771, file: 24010, source: "receta nivel 10.png" },
    { level: 20, grhIndex: 36772, file: 24011, source: "receta nivel 20.png" },
    { level: 30, grhIndex: 36773, file: 24012, source: "receta nivel 30.png" },
    { level: 40, grhIndex: 36774, file: 24013, source: "receta nivel 40.png" },
    { level: 50, grhIndex: 36775, file: 24014, source: "receta nivel 50.png" },
];

const RESOURCE_START_GRH = 36776;
const RESOURCE_START_FILE = 24015;
const RESOURCE_START_ITEM_ID = 1701;

const RESOURCES = [
    { source: "cuero.png", name: "Cuero", key: "cuero", objType: 29, valor: 5 },
    { source: "diamantes.png", name: "Diamantes", key: "diamantes", objType: 29, valor: 100 },
    {
        source: "Esencia m\u00e1gica epica.png",
        name: "Esencia magica epica",
        key: "esencia_magica_epica",
        objType: 29,
        valor: 250,
    },
    {
        source: "Esencia m\u00e1gica.png",
        name: "Esencia magica",
        key: "esencia_magica",
        objType: 29,
        valor: 100,
    },
    { source: "hilo.png", name: "Hilo", key: "hilo", objType: 29, valor: 5 },
    {
        source: "le\u00f1a elfica.png",
        name: "Le\u00f1a elfica",
        key: "lena_elfica",
        objType: 14,
        valor: 20,
    },
    { source: "le\u00f1a.png", name: "Le\u00f1a", key: "lena", objType: 14, valor: 1, preferExistingId: 58 },
    {
        source: "lingote de hierro.png",
        name: "Lingote de hierro",
        key: "lingote_hierro",
        objType: 29,
        valor: 2000,
        preferExistingId: 386,
    },
    {
        source: "lingote de mitrilo.png",
        name: "Lingote de mitrilo",
        key: "lingote_mitrilo",
        objType: 29,
        valor: 3000,
    },
    {
        source: "lingote de obsidiana.png",
        name: "Lingote de obsidiana",
        key: "lingote_obsidiana",
        objType: 29,
        valor: 4000,
    },
    {
        source: "lingote de oro.png",
        name: "Lingote de oro",
        key: "lingote_oro",
        objType: 29,
        valor: 4000,
        preferExistingId: 388,
    },
    {
        source: "lingote de plata.png",
        name: "Lingote de plata",
        key: "lingote_plata",
        objType: 29,
        valor: 3000,
        preferExistingId: 387,
    },
    { source: "madera.png", name: "Madera", key: "madera", objType: 14, valor: 3 },
    { source: "mena de hierro.png", name: "Mena de hierro", key: "mena_hierro", objType: 23, valor: 50 },
    { source: "mena de mitrilo.png", name: "Mena de mitrilo", key: "mena_mitrilo", objType: 23, valor: 80 },
    { source: "mena de obsidiana.png", name: "Mena de obsidiana", key: "mena_obsidiana", objType: 23, valor: 120 },
    { source: "mena de oro.png", name: "Mena de oro", key: "mena_oro", objType: 23, valor: 80 },
    { source: "mena de plata.png", name: "Mena de plata", key: "mena_plata", objType: 23, valor: 70 },
    {
        source: "pa\u00f1os de tela.png",
        name: "Pa\u00f1os de tela",
        key: "panos_tela",
        objType: 29,
        valor: 5,
    },
    { source: "polvo de oro.png", name: "Polvo de oro", key: "polvo_oro", objType: 29, valor: 50 },
    { source: "runa celeste.png", name: "Runa celeste", key: "runa_celeste", objType: 29, valor: 100 },
    { source: "runa roja.png", name: "Runa roja", key: "runa_roja", objType: 29, valor: 100 },
    { source: "runa violeta.png", name: "Runa violeta", key: "runa_violeta", objType: 29, valor: 100 },
];

const BASE_OBJECT = {
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

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

function normalize(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");
}

function getMaxNumericKey(record) {
    return Math.max(0, ...Object.keys(record).map((key) => Number(key)).filter(Number.isFinite));
}

function findExistingObjectId(objs, resource) {
    if (resource.preferExistingId && objs[String(resource.preferExistingId)]) {
        return String(resource.preferExistingId);
    }

    const target = normalize(resource.name);
    return Object.entries(objs).find(([, obj]) => normalize(obj.name) === target)?.[0] ?? null;
}

function ensureGraphic(graphics, optimizedGraphics, grhIndex, file, source) {
    const sourcePath = path.join(RESOURCES_DIR, source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error(`No existe el recurso grafico: ${source}`);
    }

    const targetPath = path.join(GRAPHICS_DIR, `${file}.png`);
    fs.copyFileSync(sourcePath, targetPath);

    graphics[String(grhIndex)] = {
        numFrames: 1,
        numFile: file,
        sX: 0,
        sY: 0,
        width: 32,
        height: 32,
        frames: { 1: grhIndex },
    };
    optimizedGraphics[String(grhIndex)] = [file, 0, 0, 32, 32];
}

function csvEscape(value) {
    const text = String(value ?? "");
    if (/[;"\r\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

const apiObjs = readJson(API_OBJS_PATH);
const clientObjs = readJson(CLIENT_OBJS_PATH);
const graphics = readJson(GRAPHICS_PATH);
const optimizedGraphics = readJson(GRAPHICS_OPTIMIZED_PATH);

for (const data of RECIPE_GRAPHICS) {
    ensureGraphic(graphics, optimizedGraphics, data.grhIndex, data.file, data.source);
}

let nextObjectId = Math.max(RESOURCE_START_ITEM_ID, getMaxNumericKey(apiObjs) + 1);
let createdObjects = 0;
let updatedObjects = 0;
const catalog = [];

for (const [index, resource] of RESOURCES.entries()) {
    const grhIndex = RESOURCE_START_GRH + index;
    const file = RESOURCE_START_FILE + index;
    ensureGraphic(graphics, optimizedGraphics, grhIndex, file, resource.source);

    let objectId = findExistingObjectId(apiObjs, resource);
    const created = !objectId;
    if (!objectId) {
        objectId = String(nextObjectId++);
        createdObjects++;
    } else {
        updatedObjects++;
    }

    const previous = apiObjs[objectId] ?? BASE_OBJECT;
    const obj = {
        ...BASE_OBJECT,
        ...previous,
        name: resource.name,
        objType: resource.objType,
        grhIndex,
        valor: resource.valor,
        agarrable: 1,
        craftingResource: true,
        resourceKey: resource.key,
        resourceSource: resource.source,
    };

    apiObjs[objectId] = obj;
    clientObjs[objectId] = obj;
    catalog.push({
        itemId: objectId,
        name: obj.name,
        resourceKey: resource.key,
        objType: obj.objType,
        grhIndex,
        graphicFile: `${file}.png`,
        sourceFile: resource.source,
        created: Number(objectId) >= RESOURCE_START_ITEM_ID,
    });
}

writeJson(API_OBJS_PATH, apiObjs);
writeJson(CLIENT_OBJS_PATH, clientObjs);
writeJson(GRAPHICS_PATH, graphics);
writeJson(GRAPHICS_OPTIMIZED_PATH, optimizedGraphics);

const csv = [
    "itemId;name;resourceKey;objType;grhIndex;graphicFile;sourceFile;created",
    ...catalog.map((row) =>
        [
            row.itemId,
            row.name,
            row.resourceKey,
            row.objType,
            row.grhIndex,
            row.graphicFile,
            row.sourceFile,
            row.created ? "yes" : "no",
        ]
            .map(csvEscape)
            .join(";"),
    ),
].join("\n");
fs.writeFileSync(CATALOG_PATH, `${csv}\n`, "utf8");

console.log(`Graficos de recetas actualizados: ${RECIPE_GRAPHICS.length}`);
console.log(`Graficos de recursos indexados: ${RESOURCES.length}`);
console.log(`Objetos de recursos creados: ${createdObjects}`);
console.log(`Objetos de recursos actualizados: ${updatedObjects}`);
console.log(`Catalogo: ${path.relative(PROJECT_ROOT, CATALOG_PATH)}`);
