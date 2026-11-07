import fs from "node:fs";
import path from "node:path";
const root = path.resolve(__dirname, "../../..");
const read = (file: string) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const levels = [
    1, 10, 25, 25, 25, 30, 40, 35, 35, 40, 30, 25, 30, 40, 35, 45, 40, 45, 1, 10, 45, 20, 15, 40, 30, 35, 35, 40, 30,
    45, 45, 25, 30, 40, 10, 15,
];
const materials = [
    [739, 1095, 5],
    [754, 1095, 10],
    [761, 1096, 5],
    [726, 1096, 10],
    [585, 1241, 5],
    [726, 1241, 5],
];
const npcs = read("server/jsons/npcs.json");
const quests = read("server/jsons/quests.json");
const objs = read("server/jsons/objs.json");
const placements = fs.readdirSync(path.join(root, "server/mapas_source")).flatMap((map) => {
    const f = `server/mapas_source/${map}/npcs.json`;
    if (!fs.existsSync(path.join(root, f))) return [];
    return Object.values(read(f)).map((p: any) => ({ ...p, map }));
});
const lines = [
    "# Balance PvE para la apertura",
    "",
    "Valores base con EXP global x5 y oro x3. La EXP de misión se paga sin volver a multiplicar. El oro base del NPC se suma a sus drops monetarios explícitos. No es una medición de EXP/hora de jugadores.",
    "",
    "## Misiones",
    "",
    "| ID | Misión | Nivel anterior → nuevo | EXP anterior → nueva | EXP base de objetivos |",
    "| --- | --- | --- | --- | --- |",
];
for (const q of Object.values(quests) as any[]) {
    const base = q.requiredNpcs.reduce((n: number, r: any) => n + Number(npcs[r.index]?.exp ?? 0) * r.amount, 0);
    const nextExp = [1, 19].includes(q.id) ? 5000 : Math.floor(base * 0.5);
    lines.push(
        `| ${q.id} | ${q.name} | ${q.requiredLevel} → ${levels[q.id - 1]} | ${q.rewardExp} → ${nextExp} | ${base} |`,
    );
    q.requiredLevel = levels[q.id - 1];
    q.rewardExp = nextExp;
}
lines.push(
    "",
    "## Fuentes de materiales",
    "",
    "| NPC | Material | Chance | Mapas con aparición |",
    "| --- | --- | --- | --- |",
);
for (const [id, item, chance] of materials) {
    const maps = [...new Set(placements.filter((p) => Number(p.npcIndex) === id).map((p) => p.map))];
    if (id === 726) maps.push("mapa_279 (evento cada 8 horas)");
    if (id === 585) maps.push(`mapa_${require("../summonRoom").SUMMON_ROOM_MAP ?? 209} (sala de invocación)`);
    if (!maps.length) throw new Error(`Falta aparición del NPC ${id}`);
    lines.push(`| ${id} ${npcs[id].name} | ${item} ${objs[item].name} | ${chance}% | ${maps.join(", ")} |`);
}
lines.push(
    "",
    "## Referencia económica",
    "",
    "| NPC | HP | EXP por baja x5 | Oro base por baja x3 | EXP por HP |",
    "| --- | --- | --- | --- | --- |",
);
for (const id of [501, 510, 762, 749, 553, 739, 754, 726]) {
    const n = npcs[id];
    lines.push(
        `| ${id} ${n.name} | ${n.maxHp} | ${n.exp * 5} | ${n.gold * 3} | ${((n.exp * 5) / n.maxHp).toFixed(2)} |`,
    );
}
lines.push(
    "",
    "Consumibles de referencia (precio base del catálogo; comparar con el precio efectivo del comerciante):",
);
for (const id of [37, 38]) lines.push(`- ${objs[id].name}: ${objs[id].valor} oro.`);
const outputIndex = process.argv.indexOf("--output");
const output =
    outputIndex >= 0 ? path.resolve(process.argv[outputIndex + 1]) : path.join(root, "docs/balance/APERTURA_PVE.md");
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, lines.join("\n") + "\n");
if (process.argv.includes("--apply")) {
    for (const file of [
        "server/jsons/quests.json",
        "frontend/public/init/quests.json",
        "frontend/public/init/woao/quests.json",
    ])
        fs.writeFileSync(
            path.join(root, file),
            JSON.stringify(quests, null, file === "frontend/public/init/quests.json" ? undefined : 2) + "\n",
        );
    for (const file of ["server/jsons/npcs.json", "api/src/jsons/npcs.json"]) {
        const data = read(file);
        for (const [id, item, chancePercent] of materials) {
            data[id].drop = (data[id].drop ?? []).filter((d: any) => d.item !== item);
            data[id].drop.push({ item, cant: 1, chancePercent });
        }
        const original = fs.readFileSync(path.join(root, file), "utf8");
        fs.writeFileSync(path.join(root, file), JSON.stringify(data) + (original.endsWith("\n") ? "\n" : ""));
    }
}
console.log(`Informe: ${path.relative(root, output)}. Aplicar datos: ${process.argv.includes("--apply")}.`);
