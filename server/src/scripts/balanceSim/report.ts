// Tablas markdown a partir de resultados del simulador.
//   tsx report.ts tabla <resultado.json> <nivel> <perfilAtacante> <perfilDefensor> [--dano]
//   tsx report.ts comparar <actual.json> <propuesta.json> <nivel> <perfilAtacante> <perfilDefensor>
import fs from "node:fs";

import { TOLERANCE, targetHits, type SimResult } from "./targets";

type Row = SimResult & { hp: number; hitRate: number; dmgP10: number; dmgP90: number; casts: number | null };
type Data = { results: Row[]; loadouts: Record<string, { spell?: { name: string } | null }> };

const CLASS_NAMES: Record<number, string> = { 1: "Mago", 2: "Clérigo", 3: "Guerrero", 4: "Asesino", 5: "Ladrón", 6: "Bardo", 7: "Druida", 8: "Paladín", 9: "Cazador", 12: "Bandido", 18: "Pirata", 20: "Arquero" };
const MODE_NAMES: Record<string, string> = { magia: "magia", melee: "golpe", rango: "flecha" };
const format = (value: number | undefined) => (value !== undefined && Number.isFinite(value) ? value.toFixed(1).replace(".", ",") : "∞");
const load = (file: string): Data => JSON.parse(fs.readFileSync(file, "utf8"));

function select(data: Data, level: number, atkProfile: string, defProfile: string) {
    const rows = data.results.filter((r) => r.level === level && r.atkProfile === atkProfile && r.defProfile === defProfile);
    const defenders = [...new Set(rows.map((r) => r.defClass))];
    const attackers = [...new Set(rows.map((r) => `${r.atkClass}|${r.mode}`))];
    const find = (key: string, defClass: number) => rows.find((r) => `${r.atkClass}|${r.mode}` === key && r.defClass === defClass);
    return { rows, defenders, attackers, find };
}

function header(defenders: number[], hpOf: (defClass: number) => number | undefined) {
    console.log(`| Atacante \\ Defensor | ${defenders.map((d) => `${CLASS_NAMES[d]} (${hpOf(d) ?? "?"} HP)`).join(" | ")} |`);
    console.log(`|---|${defenders.map(() => "---:").join("|")}|`);
}

function table(file: string, level: number, atkProfile: string, defProfile: string, showDamage: boolean) {
    const data = load(file);
    const { rows, defenders, attackers, find } = select(data, level, atkProfile, defProfile);
    header(defenders, (d) => rows.find((r) => r.defClass === d)?.hp);
    for (const key of attackers) {
        const [atkClass, mode] = key.split("|");
        const spell = mode === "magia" ? data.loadouts[`${atkClass}|${level}|${atkProfile}|magia`]?.spell : null;
        const cells = defenders.map((d) => {
            const r = find(key, d);
            if (!r) return "-";
            const hit = mode === "magia" ? "" : ` · ${Math.round(r.hitRate * 100)}%`;
            return showDamage ? `${r.dmgP10}-${r.dmgP90}${hit}` : `${format(r.mean)}${hit}`;
        });
        console.log(`| ${CLASS_NAMES[Number(atkClass)]} ${MODE_NAMES[mode]}${spell ? ` (${spell.name})` : ""} | ${cells.join(" | ")} |`);
    }
}

function compare(currentFile: string, proposalFile: string, level: number, atkProfile: string, defProfile: string) {
    const current = select(load(currentFile), level, atkProfile, defProfile);
    const proposed = select(load(proposalFile), level, atkProfile, defProfile);
    header(proposed.defenders, (d) => proposed.rows.find((r) => r.defClass === d)?.hp);
    for (const key of proposed.attackers) {
        const [atkClass, mode] = key.split("|");
        const cells = proposed.defenders.map((d) => {
            const before = current.find(key, d);
            const after = proposed.find(key, d);
            const target = after ? targetHits(after) : null;
            if (target === null) return `${format(before?.mean)} → ${format(after?.mean)}`;
            const warn = after && Math.abs(after.mean - target) > TOLERANCE ? " ⚠" : "";
            return `${format(before?.mean)} → **${format(after?.mean)}** (${format(target)})${warn}`;
        });
        console.log(`| ${CLASS_NAMES[Number(atkClass)]} ${MODE_NAMES[mode]} | ${cells.join(" | ")} |`);
    }
}

const [command, ...rest] = process.argv.slice(2);
if (command === "tabla") table(rest[0], Number(rest[1]), rest[2], rest[3], rest.includes("--dano"));
else if (command === "comparar") compare(rest[0], rest[1], Number(rest[2]), rest[3], rest[4]);
else console.log("Uso: report.ts tabla <resultado> <nivel> <perfilAtk> <perfilDef> [--dano] | comparar <actual> <propuesta> <nivel> <perfilAtk> <perfilDef>");
