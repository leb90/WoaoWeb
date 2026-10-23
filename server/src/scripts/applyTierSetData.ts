// Sets de tier (temporada 1): arma server/jsons/sets.json y fija los stats de sus piezas.
// Ver docs/balance/BALANCE_PVP.md, secciones 0 y 7.4.
//
// - Un set por clase con las piezas 1749 a 1780 (Arcano, Silvestre, Templario, Paladín, Bardo, Verdugo,
//   Silvano y Umbral). Las clases salen de las restricciones de cada pieza en objs.json.
// - Las apariencias de la tienda (1781 en adelante, cosmetico: 1) no cuentan como pieza.
// - Stats: los de la calibración de balance. En SETS va la base de cada pieza (un poco por encima de lo
//   mejor común de su clase; las de clases físicas suman resistencia mágica) y se escribe el nivel tope
//   (TOP_TIER: el de las versiones LEGENDARIA de los sets viejos, con el que se calibró el simulador).
//   El script es la fuente de verdad de estas piezas. Encima, la rareza Legendaria (itemRarity.ts) suma +3 / +6.
// - objetoEspecial: 2-7 fuerza o agilidad, 8-10 maná (ver getObjetoEspecialBonus en game.ts). 0 = nada.
//
//   pnpm --dir server apply-tier-sets   (después: pnpm --dir server export-client-objs)
import fs from "node:fs";
import path from "node:path";

type Slot = "armadura" | "arma" | "casco" | "escudo";
type Stats = {
    minHit?: number;
    maxHit?: number;
    minDef?: number;
    maxDef?: number;
    magicDamageBonus?: number;
    resistenciaMagica?: number;
    objetoEspecial?: number;
};
type PieceDef = { slot: Slot; id: number; stats: Stats };
type SetDef = { id: string; name: string; classes: number[]; pieces: PieceDef[] };

const root = path.resolve(__dirname, "../../..");
const OBJECT_PATHS = ["server/jsons/objs.json", "api/src/jsons/objs.json"];
const SETS_PATH = "server/jsons/sets.json";
// Campos que el script controla: lo que no figura en `stats` queda en 0.
const MANAGED_FIELDS: Array<keyof Stats> = ["minHit", "maxHit", "minDef", "maxDef", "magicDamageBonus", "resistenciaMagica", "objetoEspecial"];

const RM = 5;
const SETS: SetDef[] = [
    {
        id: "t1-arcano", name: "Set Arcano", classes: [1], pieces: [
            { slot: "casco", id: 1749, stats: { minDef: 20, maxDef: 25, magicDamageBonus: 26 } },
            { slot: "arma", id: 1750, stats: { minHit: 4, maxHit: 6, magicDamageBonus: 33 } },
            { slot: "escudo", id: 1751, stats: { minDef: 4, maxDef: 12, magicDamageBonus: 22 } },
            { slot: "armadura", id: 1752, stats: { minDef: 20, maxDef: 30, objetoEspecial: 10 } },
        ],
    },
    {
        id: "t1-silvestre", name: "Set Silvestre", classes: [7], pieces: [
            { slot: "casco", id: 1753, stats: { minDef: 20, maxDef: 25, magicDamageBonus: 26 } },
            { slot: "arma", id: 1754, stats: { minHit: 8, maxHit: 14, magicDamageBonus: 31 } },
            { slot: "escudo", id: 1755, stats: { minDef: 4, maxDef: 12, magicDamageBonus: 22 } },
            { slot: "armadura", id: 1756, stats: { minDef: 20, maxDef: 30, objetoEspecial: 9 } },
        ],
    },
    {
        id: "t1-templario", name: "Set Templario", classes: [2], pieces: [
            { slot: "casco", id: 1757, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 6 } },
            { slot: "arma", id: 1758, stats: { minHit: 35, maxHit: 47, objetoEspecial: 3 } },
            { slot: "escudo", id: 1759, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 3 } },
            { slot: "armadura", id: 1760, stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM, objetoEspecial: 4 } },
        ],
    },
    {
        id: "t1-paladin", name: "Set Paladín", classes: [8], pieces: [
            { slot: "casco", id: 1761, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 9 } },
            { slot: "arma", id: 1762, stats: { minHit: 36, maxHit: 49, objetoEspecial: 3 } },
            { slot: "escudo", id: 1763, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 3 } },
            { slot: "armadura", id: 1764, stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM, objetoEspecial: 2 } },
        ],
    },
    {
        id: "t1-bardo", name: "Set Bardo", classes: [6], pieces: [
            { slot: "casco", id: 1765, stats: { minDef: 24, maxDef: 32, resistenciaMagica: RM } },
            { slot: "arma", id: 1766, stats: { minHit: 34, maxHit: 46 } },
            { slot: "escudo", id: 1767, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 6 } },
            { slot: "armadura", id: 1768, stats: { minDef: 44, maxDef: 60, resistenciaMagica: RM, objetoEspecial: 4 } },
        ],
    },
    {
        id: "t1-verdugo", name: "Set del Verdugo", classes: [3], pieces: [
            { slot: "casco", id: 1769, stats: { minDef: 26, maxDef: 34, resistenciaMagica: RM, objetoEspecial: 5 } },
            { slot: "arma", id: 1770, stats: { minHit: 37, maxHit: 50, objetoEspecial: 4 } },
            { slot: "escudo", id: 1771, stats: { minDef: 26, maxDef: 34, resistenciaMagica: RM, objetoEspecial: 2 } },
            { slot: "armadura", id: 1772, stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM, objetoEspecial: 2 } },
        ],
    },
    {
        id: "t1-silvano", name: "Set Silvano", classes: [20], pieces: [
            { slot: "casco", id: 1773, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 6 } },
            { slot: "arma", id: 1774, stats: { minHit: 12, maxHit: 16 } },
            { slot: "escudo", id: 1775, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 3 } },
            { slot: "armadura", id: 1776, stats: { minDef: 52, maxDef: 72, resistenciaMagica: RM, objetoEspecial: 4 } },
        ],
    },
    {
        id: "t1-umbral", name: "Set del Umbral", classes: [4], pieces: [
            { slot: "casco", id: 1777, stats: { minDef: 20, maxDef: 28, resistenciaMagica: RM, objetoEspecial: 6 } },
            { slot: "arma", id: 1778, stats: { minHit: 34, maxHit: 46, objetoEspecial: 4 } },
            { slot: "escudo", id: 1779, stats: { minDef: 22, maxDef: 30, resistenciaMagica: RM, objetoEspecial: 3 } },
            { slot: "armadura", id: 1780, stats: { minDef: 44, maxDef: 60, resistenciaMagica: RM, objetoEspecial: 4 } },
        ],
    },
];

// Nivel tope sobre la base (lo que antes era la versión LEGENDARIA de cada pieza).
const TOP_TIER = { hit: 1.1, def: 1.15, magicDamage: 6, magicResistance: 2 };

function topTierStats(stats: Stats): Stats {
    const out: Stats = { ...stats };
    if (stats.minHit) out.minHit = Math.round(stats.minHit * TOP_TIER.hit);
    if (stats.maxHit) out.maxHit = Math.round(stats.maxHit * TOP_TIER.hit);
    if (stats.minDef) out.minDef = Math.round(stats.minDef * TOP_TIER.def);
    if (stats.maxDef) out.maxDef = Math.round(stats.maxDef * TOP_TIER.def);
    if (stats.magicDamageBonus) out.magicDamageBonus = stats.magicDamageBonus + TOP_TIER.magicDamage;
    if (stats.resistenciaMagica) out.resistenciaMagica = stats.resistenciaMagica + TOP_TIER.magicResistance;
    return out;
}

// Bonos del set (ver tierSets.ts). Solo cuentan lugares distintos.
const BONUSES = [
    { pieces: 2, hpPct: 10 },
    { pieces: 4, hpPct: 20, dmgPct: 25 },
];

type ObjectRecord = Record<string, unknown> & { name?: string; clasesNoPermitidas?: number[] };

// Las clases del set tienen que poder usar todas sus piezas.
function checkClasses(objects: Record<string, ObjectRecord>) {
    for (const set of SETS) {
        for (const piece of set.pieces) {
            const item = objects[String(piece.id)];
            if (!item) throw new Error(`No existe la pieza ${piece.id} (${set.name})`);
            const blocked = set.classes.filter((classId) => (item.clasesNoPermitidas ?? []).includes(classId));
            if (blocked.length) throw new Error(`${item.name} (#${piece.id}) no se permite para las clases ${blocked.join(", ")}`);
        }
    }
}

function updateObjects(relativePath: string) {
    const fullPath = path.join(root, relativePath);
    const objects = JSON.parse(fs.readFileSync(fullPath, "utf8")) as Record<string, ObjectRecord>;
    checkClasses(objects);
    let changed = 0;
    for (const set of SETS) {
        for (const piece of set.pieces) {
            const item = objects[String(piece.id)];
            const stats = topTierStats(piece.stats);
            for (const key of MANAGED_FIELDS) {
                const next = stats[key] ?? 0;
                if (Number(item[key] ?? 0) !== next) {
                    item[key] = next;
                    changed++;
                }
            }
        }
    }
    fs.writeFileSync(fullPath, `${JSON.stringify(objects)}\n`, "utf8");
    return changed;
}

const sets = SETS.map((set) => ({
    id: set.id,
    name: set.name,
    season: 1,
    classes: set.classes,
    pieces: Object.fromEntries(set.pieces.map((piece) => [piece.slot, [piece.id]])),
    bonuses: BONUSES,
}));

for (const relativePath of OBJECT_PATHS) {
    console.log(`${relativePath}: ${updateObjects(relativePath)} stats actualizados en ${SETS.length * 4} piezas.`);
}
fs.writeFileSync(path.join(root, SETS_PATH), `${JSON.stringify({ version: 2, sets }, null, 4)}\n`, "utf8");
console.log(`${SETS_PATH}: ${sets.length} sets.`);
