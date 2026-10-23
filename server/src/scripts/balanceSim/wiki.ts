// Datos de nivelación PvP para la Wiki (frontend/lib/wiki-pvp-balance.json) a partir de un resultado del
// simulador con el código actual. Los bonos y piezas de los sets salen de jsons/sets.json y objs.json.
//   tsx wiki.ts <ahora.json> [salida.json]
import fs from "node:fs";
import path from "node:path";

import type { SimResult } from "./targets";

type Row = SimResult & { hp: number; dmgAvg: number };
type Data = { trials: number; results: Row[] };

const [resultFile, outArg] = process.argv.slice(2);
if (!resultFile) {
    console.log("Uso: wiki.ts <ahora.json> [salida.json]");
    process.exit(1);
}
const output = outArg ?? path.resolve(__dirname, "../../../../frontend/lib/wiki-pvp-balance.json");
const data: Data = JSON.parse(fs.readFileSync(resultFile, "utf8"));
const jsons = path.resolve(__dirname, "../../../jsons");
const objects: Record<string, { name?: string }> = JSON.parse(fs.readFileSync(path.join(jsons, "objs.json"), "utf8"));
const setsFile = JSON.parse(fs.readFileSync(path.join(jsons, "sets.json"), "utf8")) as {
    sets: Array<{ id: string; name: string; season: number; classes: number[]; pieces: Record<string, number[]>; bonuses: Array<Record<string, number>> }>;
};

// Mismo orden y modos que la guía (guide.ts): magia pura, híbridos, físicos.
const CLASSES = [
    { id: 1, name: "Mago", modes: ["magia"] },
    { id: 7, name: "Druida", modes: ["magia", "melee"] },
    { id: 2, name: "Clérigo", modes: ["melee", "magia"] },
    { id: 6, name: "Bardo", modes: ["magia", "melee"] },
    { id: 8, name: "Paladín", modes: ["melee", "magia"] },
    { id: 4, name: "Asesino", modes: ["melee", "magia"] },
    { id: 3, name: "Guerrero", modes: ["melee"] },
    { id: 9, name: "Cazador", modes: ["rango", "melee"] },
    { id: 18, name: "Pirata", modes: ["melee", "magia"] },
    { id: 20, name: "Arquero", modes: ["rango"] },
    { id: 22, name: "Chamán", modes: ["magia"] },
];
const LEVELS = [30, 40, 50];
const round = (value: number) => (Number.isFinite(value) ? Math.round(value * 10) / 10 : null);
const rowsOf = (level: number, atkClass: number, mode: string, atkProfile: string, defProfile: string) =>
    data.results.filter((r) => r.level === level && r.atkClass === atkClass && r.mode === mode && r.atkProfile === atkProfile && r.defProfile === defProfile && Number.isFinite(r.mean));
const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : NaN);

const attackers = CLASSES.flatMap((cls) =>
    cls.modes.map((mode) => {
        const vs = (level: number, atkProfile = "comun", defProfile = "comun") =>
            Object.fromEntries(rowsOf(level, cls.id, mode, atkProfile, defProfile).map((r) => [r.defClass, round(r.mean)]));
        return {
            classId: cls.id,
            mode,
            // Promedio contra las 10 clases, equipo común contra común.
            average: Object.fromEntries(LEVELS.map((level) => [level, round(average(rowsOf(level, cls.id, mode, "comun", "comun").map((r) => r.mean)))])),
            // Uno contra uno por nivel.
            vs: Object.fromEntries(LEVELS.map((level) => [level, vs(level)])),
            // Efecto del set a nivel 50 (promedio contra las 10 clases).
            set50: {
                comun: round(average(rowsOf(50, cls.id, mode, "comun", "comun").map((r) => r.mean))),
                conSet: round(average(rowsOf(50, cls.id, mode, "tier", "comun").map((r) => r.mean))),
                contraSet: round(average(rowsOf(50, cls.id, mode, "comun", "tier").map((r) => r.mean))),
                ambos: round(average(rowsOf(50, cls.id, mode, "tier", "tier").map((r) => r.mean))),
            },
        };
    }),
);

const hp = Object.fromEntries(
    LEVELS.map((level) => [
        level,
        Object.fromEntries(
            CLASSES.map((cls) => {
                const common = data.results.find((r) => r.level === level && r.defClass === cls.id && r.defProfile === "comun");
                const tier = data.results.find((r) => r.level === level && r.defClass === cls.id && r.defProfile === "tier");
                return [cls.id, { comun: common?.hp ?? null, set: tier?.hp ?? null }];
            }),
        ),
    ]),
);

const SLOT_NAMES: Record<string, string> = { armadura: "Armadura", arma: "Arma", casco: "Casco", escudo: "Escudo", anillo: "Anillo" };
const sets = setsFile.sets.map((set) => ({
    id: set.id,
    name: set.name,
    season: set.season,
    classes: set.classes,
    bonuses: set.bonuses,
    // Primera pieza de cada lugar (si un lugar acepta varias, el resto figura como variantes).
    pieces: Object.entries(set.pieces).map(([slot, ids]) => ({ slot: SLOT_NAMES[slot] ?? slot, id: ids[0], name: objects[String(ids[0])]?.name ?? `#${ids[0]}`, variants: ids.length })),
}));

const result = {
    generatedAt: new Date().toISOString().slice(0, 10),
    trials: data.trials,
    levels: LEVELS,
    classes: CLASSES.map(({ id, name, modes }) => ({ id, name, modes })),
    attackers,
    hp,
    sets,
};
fs.writeFileSync(output, JSON.stringify(result, null, 1) + "\n");
console.log(`Datos de la Wiki escritos en ${output}`);
