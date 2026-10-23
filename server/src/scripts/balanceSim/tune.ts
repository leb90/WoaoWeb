// Barrido de factores PvP por fila de atacante (golpe, flecha, magia) contra la matriz objetivo.
// Cada fila depende solo de su propio factor, así que se prueba el mismo valor para todas y se elige el mejor por fila.
//   tsx tune.ts <propuesta-base.json> [perfiles=comun,tier] [salida.json]
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { targetHits, type SimResult } from "./targets";

const [basePath, profiles = "comun,tier", outputPath] = process.argv.slice(2);
const base = basePath ? JSON.parse(fs.readFileSync(basePath, "utf8")) : {};
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "balance-tune-"));
const serverDir = path.resolve(__dirname, "../../..");
const errors: Record<string, Record<string, number>> = {};

for (let step = 0; step <= 25; step++) {
    const factor = Number((0.25 + step * 0.05).toFixed(2));
    const proposalFile = path.join(temp, "propuesta.json");
    const resultFile = path.join(temp, "resultado.json");
    fs.writeFileSync(proposalFile, JSON.stringify({ ...base, pvpMelee: { default: factor }, pvpRanged: { default: factor }, pvpMagic: { default: factor } }));
    execFileSync("npx", ["tsx", path.join(__dirname, "simulate.ts"), "--tiradas", "400", "--perfiles", profiles, "--propuesta", proposalFile, "--salida", resultFile], { cwd: serverDir, stdio: "pipe" });
    const { results } = JSON.parse(fs.readFileSync(resultFile, "utf8")) as { results: SimResult[] };
    for (const result of results) {
        const target = targetHits(result);
        if (target === null || !Number.isFinite(result.mean)) continue;
        const key = `${result.atkClass}|${result.mode}`;
        errors[key] = errors[key] || {};
        errors[key][factor] = (errors[key][factor] || 0) + (result.mean - target) ** 2;
    }
    process.stderr.write(`factor ${factor} listo\n`);
}

const best = { pvpMelee: {} as Record<string, number>, pvpRanged: {} as Record<string, number>, pvpMagic: {} as Record<string, number> };
for (const [key, byFactor] of Object.entries(errors)) {
    const [factor, error] = Object.entries(byFactor).sort((a, b) => a[1] - b[1])[0];
    const [classId, mode] = key.split("|");
    const table = mode === "magia" ? best.pvpMagic : mode === "rango" ? best.pvpRanged : best.pvpMelee;
    table[classId] = Number(factor);
    console.log(`${key.padEnd(8)} factor ${factor} (error ${error.toFixed(2)}; con 1,0: ${(byFactor[1] ?? NaN).toFixed(2)})`);
}
if (outputPath) fs.writeFileSync(outputPath, JSON.stringify({ ...base, ...best }, null, 1));
fs.rmSync(temp, { recursive: true, force: true });
