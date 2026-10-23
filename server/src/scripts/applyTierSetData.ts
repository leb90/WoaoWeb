// Sets de tier (temporada 1): arma server/jsons/sets.json y normaliza los stats de sus piezas.
// Ver docs/balance/BALANCE_PVP.md, secciones 7.4 y 7.5.
//
// - Un set por clase con las piezas de premios de canje (Desterrado y del Caído). Cada lugar acepta la
//   pieza base y sus versiones +1, +2 y LEGENDARIA (y la variante para razas bajas).
// - Stats: cada pieza base queda un poco por encima de lo mejor común de su clase; las piezas de clases
//   físicas suman resistencia mágica; +1/+2/LEGENDARIA suben de verdad sobre la base.
// - Nunca baja un stat: queda el máximo entre el valor actual y el nuevo.
//
//   pnpm --dir server apply-tier-sets   (después: pnpm --dir server export-client-objs)
import fs from "node:fs";
import path from "node:path";

type Slot = "armadura" | "arma" | "casco" | "escudo" | "anillo";
type Stats = { minHit?: number; maxHit?: number; minDef?: number; maxDef?: number; magicDamageBonus?: number; resistenciaMagica?: number };
type PieceDef = { slot: Slot; baseIds: number[]; stats: Stats };
type SetDef = { id: string; name: string; classes: number[]; pieces: PieceDef[] };

const root = path.resolve(__dirname, "../../..");
const OBJECT_PATHS = ["server/jsons/objs.json", "api/src/jsons/objs.json"];
const SETS_PATH = "server/jsons/sets.json";

const RM = 5;
const SETS: SetDef[] = [
    {
        id: "t1-mago", name: "Set Desterrado del Mago", classes: [1], pieces: [
            { slot: "armadura", baseIds: [1341, 1343], stats: { minDef: 20, maxDef: 30 } },
            { slot: "arma", baseIds: [1373], stats: { magicDamageBonus: 33 } },
            { slot: "casco", baseIds: [1355], stats: { minDef: 20, maxDef: 25, magicDamageBonus: 26 } },
            { slot: "anillo", baseIds: [1357], stats: { magicDamageBonus: 22 } },
        ],
    },
    {
        id: "t1-druida", name: "Set Desterrado del Druida", classes: [7], pieces: [
            { slot: "armadura", baseIds: [1342, 1344], stats: { minDef: 20, maxDef: 30 } },
            { slot: "arma", baseIds: [1374], stats: { minHit: 8, maxHit: 14, magicDamageBonus: 31 } },
            { slot: "casco", baseIds: [1356], stats: { minDef: 20, maxDef: 25, magicDamageBonus: 26 } },
            { slot: "anillo", baseIds: [1358], stats: { magicDamageBonus: 22 } },
        ],
    },
    {
        id: "t1-clerigo", name: "Set del Caído del Clérigo", classes: [2], pieces: [
            { slot: "armadura", baseIds: [1345, 1350], stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM } },
            { slot: "arma", baseIds: [1371], stats: { minHit: 35, maxHit: 47 } },
            { slot: "casco", baseIds: [1364], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
            { slot: "escudo", baseIds: [1359], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
        ],
    },
    {
        id: "t1-bardo", name: "Set del Caído del Bardo", classes: [6], pieces: [
            { slot: "armadura", baseIds: [1346, 1351], stats: { minDef: 44, maxDef: 60, resistenciaMagica: RM } },
            { slot: "arma", baseIds: [1087], stats: { minHit: 34, maxHit: 46 } },
            { slot: "casco", baseIds: [1366], stats: { minDef: 24, maxDef: 32, resistenciaMagica: RM } },
            { slot: "escudo", baseIds: [1361], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
        ],
    },
    {
        id: "t1-guerrero", name: "Set del Caído del Guerrero y el Pirata", classes: [3, 18], pieces: [
            { slot: "armadura", baseIds: [1347, 1352], stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM } },
            { slot: "arma", baseIds: [1369], stats: { minHit: 37, maxHit: 50 } },
            { slot: "casco", baseIds: [1367], stats: { minDef: 26, maxDef: 34, resistenciaMagica: RM } },
            { slot: "escudo", baseIds: [1362], stats: { minDef: 26, maxDef: 34, resistenciaMagica: RM } },
        ],
    },
    {
        id: "t1-paladin", name: "Set del Caído del Paladín", classes: [8], pieces: [
            { slot: "armadura", baseIds: [1348, 1353], stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM } },
            { slot: "arma", baseIds: [1372], stats: { minHit: 36, maxHit: 49 } },
            { slot: "casco", baseIds: [1365], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
            { slot: "escudo", baseIds: [1360], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
        ],
    },
    {
        id: "t1-cazador", name: "Set del Caído del Cazador y el Arquero", classes: [9, 20], pieces: [
            { slot: "armadura", baseIds: [1349, 1354], stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM } },
            { slot: "arma", baseIds: [1052], stats: { minHit: 12, maxHit: 16 } },
            { slot: "casco", baseIds: [1368], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
            { slot: "escudo", baseIds: [1363], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
        ],
    },
    {
        id: "t1-asesino", name: "Set Desterrado del Asesino", classes: [4], pieces: [
            { slot: "armadura", baseIds: [1181, 196], stats: { minDef: 44, maxDef: 60, resistenciaMagica: RM } },
            { slot: "arma", baseIds: [1054], stats: { minHit: 34, maxHit: 46 } },
            { slot: "casco", baseIds: [1159], stats: { minDef: 20, maxDef: 28, resistenciaMagica: RM } },
            { slot: "escudo", baseIds: [1256], stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM } },
        ],
    },
];

// Bonos del set (ver tierSets.ts). Solo cuentan lugares distintos.
const BONUSES = [
    { pieces: 2, hpPct: 10 },
    { pieces: 4, hpPct: 20, dmgPct: 25 },
];

// Cuánto suben las versiones sobre la base.
const VARIANT_LEVEL = [
    { suffix: /\+\s*1\s*$/i, level: 1 },
    { suffix: /\+\s*2\s*$/i, level: 2 },
    { suffix: /legendari[oa]\s*$/i, level: 3 },
];
const HIT_FACTOR = [1, 1.03, 1.06, 1.1];
const DEF_FACTOR = [1, 1.05, 1.1, 1.15];
const DM_EXTRA = [0, 2, 4, 6];
const RM_EXTRA = [0, 0, 1, 2];

const baseName = (name: unknown) => String(name ?? "").replace(/\s*(\+\s*\d|legendari[oa])\s*$/i, "").trim();

function variantStats(stats: Stats, level: number): Stats {
    const out: Stats = {};
    if (stats.minHit !== undefined) out.minHit = Math.round(stats.minHit * HIT_FACTOR[level]);
    if (stats.maxHit !== undefined) out.maxHit = Math.round(stats.maxHit * HIT_FACTOR[level]);
    if (stats.minDef !== undefined) out.minDef = Math.round(stats.minDef * DEF_FACTOR[level]);
    if (stats.maxDef !== undefined) out.maxDef = Math.round(stats.maxDef * DEF_FACTOR[level]);
    if (stats.magicDamageBonus !== undefined) out.magicDamageBonus = stats.magicDamageBonus + DM_EXTRA[level];
    if (stats.resistenciaMagica !== undefined) out.resistenciaMagica = stats.resistenciaMagica + RM_EXTRA[level];
    return out;
}

function updateObjects(relativePath: string, plan: Map<number, Stats>) {
    const fullPath = path.join(root, relativePath);
    const objects = JSON.parse(fs.readFileSync(fullPath, "utf8")) as Record<string, Record<string, unknown>>;
    let changed = 0;
    for (const [id, stats] of plan) {
        const item = objects[String(id)];
        if (!item) throw new Error(`No existe el objeto ${id} en ${relativePath}`);
        for (const [key, value] of Object.entries(stats) as Array<[keyof Stats, number]>) {
            const next = Math.max(Number(item[key] ?? 0), value);
            if (Number(item[key] ?? 0) !== next) {
                item[key] = next;
                changed++;
            }
        }
    }
    fs.writeFileSync(fullPath, `${JSON.stringify(objects)}\n`, "utf8");
    return changed;
}

const objects = JSON.parse(fs.readFileSync(path.join(root, OBJECT_PATHS[0]), "utf8")) as Record<string, { name?: string }>;
const plan = new Map<number, Stats>();
const sets = SETS.map((set) => {
    const pieces: Partial<Record<Slot, number[]>> = {};
    for (const piece of set.pieces) {
        const ids: number[] = [];
        for (const baseId of piece.baseIds) {
            const base = baseName(objects[baseId]?.name);
            if (!base) throw new Error(`No existe la pieza base ${baseId}`);
            for (const [rawId, item] of Object.entries(objects)) {
                if (baseName(item.name) !== base) continue;
                const id = Number(rawId);
                const variant = VARIANT_LEVEL.find((v) => v.suffix.test(String(item.name)));
                plan.set(id, variantStats(piece.stats, variant?.level ?? 0));
                ids.push(id);
            }
        }
        pieces[piece.slot] = ids.sort((a, b) => a - b);
    }
    return { id: set.id, name: set.name, season: 1, classes: set.classes, pieces, bonuses: BONUSES };
});

fs.writeFileSync(path.join(root, SETS_PATH), `${JSON.stringify({ version: 1, sets }, null, 4)}\n`, "utf8");
for (const relativePath of OBJECT_PATHS) {
    console.log(`${relativePath}: ${updateObjects(relativePath, plan)} stats actualizados en ${plan.size} piezas.`);
}
console.log(`${SETS_PATH}: ${sets.length} sets.`);
