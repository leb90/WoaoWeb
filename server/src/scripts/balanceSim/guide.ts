// Guía de nivelación por clase (markdown) a partir de dos resultados del simulador: antes (main) y ahora.
// Muestra, para cada clase, el equipo exacto (nombres y stats), vida, maná, hechizo y aciertos para matar
// por nivel. Los bonos del set salen de jsons/sets.json.
//   tsx guide.ts <antes.json> <ahora.json> [salida.md]
import fs from "node:fs";
import path from "node:path";

import { targetHits, type SimResult } from "./targets";

type Row = SimResult & { hp: number; dmgAvg: number; dmgP10: number; dmgP90: number; hitRate: number; casts: number | null };
type Loadout = { gear: Record<string, number>; maxHp?: number; maxMana?: number; spell?: { name: string; mana: number; damage: string } | null };
type Data = { results: Row[]; loadouts: Record<string, Loadout> };

const [currentFile, resultFile, outArg] = process.argv.slice(2);
if (!currentFile || !resultFile) {
    console.log("Uso: guide.ts <antes.json> <ahora.json> [salida.md]");
    process.exit(1);
}
const output = outArg ?? path.resolve(__dirname, "../../../../docs/balance/NIVELACION_POR_CLASE.md");
const current: Data = JSON.parse(fs.readFileSync(currentFile, "utf8"));
const proposal: Data = JSON.parse(fs.readFileSync(resultFile, "utf8"));
type SetBonusStep = { pieces: number; hpPct?: number; dmgPct?: number; manaPct?: number };
const tierSets: Array<{ name: string; classes: number[]; bonuses: SetBonusStep[] }> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../jsons/sets.json"), "utf8")).sets ?? [];
const objects: Record<string, Record<string, any>> = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../jsons/objs.json"), "utf8"));

const CLASSES: Array<{ id: number; name: string; modes: string[]; identity: string }> = [
    { id: 1, name: "Mago", modes: ["magia"], identity: "El que más daño hace con magia. Nada de daño físico." },
    { id: 7, name: "Druida", modes: ["magia", "melee"], identity: "Menos magia que el mago y un arma que sirva." },
    { id: 2, name: "Clérigo", modes: ["melee", "magia"], identity: "Como el druida, pero puede usar más armas: pega más cuerpo a cuerpo que con magia." },
    { id: 6, name: "Bardo", modes: ["magia", "melee"], identity: "Mixto: un poco de magia y un poco de arma (identidad a confirmar)." },
    { id: 8, name: "Paladín", modes: ["melee", "magia"], identity: "Mucho cuerpo a cuerpo, poca magia." },
    { id: 4, name: "Asesino", modes: ["melee", "magia"], identity: "Golpe común por debajo del guerrero; su fuerte es la apuñalada por la espalda." },
    { id: 3, name: "Guerrero", modes: ["melee"], identity: "El que más pega físico. Nada de magia." },
    { id: 9, name: "Cazador", modes: ["rango", "melee"], identity: "Arco; el cuerpo a cuerpo queda en segundo plano." },
];
const NAME: Record<number, string> = Object.fromEntries(CLASSES.map((c) => [c.id, c.name]));
const MODE: Record<string, string> = { magia: "magia", melee: "golpe", rango: "flecha" };
const LEVELS = [30, 40, 50];

const OE_TEXT: Record<number, string> = {
    2: "+5 Fuerza", 3: "+2 Fuerza", 4: "+3 Fuerza", 5: "+5 Agilidad", 6: "+2 Agilidad", 7: "+3 Agilidad",
    8: "+100 maná*", 9: "+200 maná*", 10: "+300 maná*", 12: "+1 Fuerza +3 Agilidad", 13: "+2 Fuerza +2 Agilidad",
    14: "+5 Fuerza +2 Agilidad", 15: "+3 Fuerza +2 Agilidad", 16: "+1 Fuerza +1 Agilidad", 17: "+2 Agilidad +200 maná*",
    18: "+1 Agilidad", 19: "+55 maná*",
};

const num = (value: number, decimals = 1) => (Number.isFinite(value) ? value.toFixed(decimals).replace(".", ",") : "∞");

function describeItem(id: number | undefined): string {
    if (!id) return "—";
    const item = objects[String(id)];
    if (!item) return `#${id}`;
    const stats: string[] = [];
    const type = Number(item.objType);
    if (type === 2) stats.push(`${item.proyectil ? "arco, " : ""}golpe ${item.minHit}-${item.maxHit}`);
    else if (type === 32) stats.push(`flecha, golpe ${item.minHit}-${item.maxHit}`);
    else if (Number(item.maxDef) > 0) stats.push(`defensa ${item.minDef}-${item.maxDef}`);
    if (Number(item.magicDamageBonus) > 0) stats.push(`+${item.magicDamageBonus} daño mágico`);
    if (Number(item.resistenciaMagica) > 0) stats.push(`resistencia mágica ${item.resistenciaMagica}`);
    if (Number(item.maxDefMag) > 0) stats.push(`defensa mágica ${item.minDefMag}-${item.maxDefMag}`);
    const oe = OE_TEXT[Number(item.objetoEspecial)];
    if (oe) stats.push(oe);
    return `**${item.name}** (${stats.join(", ") || "sin stats de combate"}) · #${id}`;
}

function hasCombatEffect(id: number | undefined): boolean {
    const item = id ? objects[String(id)] : undefined;
    if (!item) return false;
    return [item.maxHit, item.maxDef, item.magicDamageBonus, item.resistenciaMagica, item.maxDefMag, OE_TEXT[Number(item.objetoEspecial)] ? 1 : 0].some((value) => Number(value) > 0);
}

const find = (data: Data, level: number, atkClass: number, mode: string, defClass: number, atkProfile: string, defProfile: string) =>
    data.results.find((r) => r.level === level && r.atkClass === atkClass && r.mode === mode && r.defClass === defClass && r.atkProfile === atkProfile && r.defProfile === defProfile);

function hitsCell(level: number, atkClass: number, mode: string, defClass: number, atkProfile = "comun", defProfile = "comun") {
    const before = find(current, level, atkClass, mode, defClass, atkProfile, defProfile);
    const after = find(proposal, level, atkClass, mode, defClass, atkProfile, defProfile);
    if (!after) return "—";
    const target = targetHits(after);
    const mark = target !== null && Math.abs(after.mean - target) > 0.5 ? " ⚠" : "";
    return `${num(before?.mean ?? NaN)} → **${num(after.mean)}**${target !== null ? ` (${num(target)})` : ""}${mark}`;
}

function damageCell(level: number, atkClass: number, mode: string, defClass: number) {
    const before = find(current, level, atkClass, mode, defClass, "comun", "comun");
    const after = find(proposal, level, atkClass, mode, defClass, "comun", "comun");
    const hit = mode === "magia" ? "" : ` (acierta ${Math.round((after?.hitRate ?? 0) * 100)} %)`;
    return `${before?.dmgAvg ?? "—"} → **${after?.dmgAvg ?? "—"}**${hit}`;
}

const mageHp = proposal.results.find((r) => r.level === 50 && r.defClass === 1 && r.defProfile === "comun")?.hp ?? 0;
const oneShotters = CLASSES.flatMap((cls) =>
    cls.modes
        .filter((mode) => (find(current, 50, cls.id, mode, 1, "comun", "comun")?.dmgAvg ?? 0) >= mageHp)
        .map((mode) => `${cls.name.toLowerCase()} (${MODE[mode]})`),
);
const oneShotAfter = CLASSES.flatMap((cls) => cls.modes.filter((mode) => (find(proposal, 50, cls.id, mode, 1, "comun", "comun")?.dmgAvg ?? 0) >= mageHp));
const oneShotText = oneShotters.length
    ? `Antes lo mataban de un solo acierto: ${oneShotters.join(", ")}. Ahora, ${oneShotAfter.length ? `todavía ${oneShotAfter.length}` : "ninguno"}.`
    : "Ninguna clase lo mata de un acierto.";

// Clases que con set matan más lento que con equipo común (pieza de tier peor que la común).
const averageMean = (data: Data, atkClass: number, mode: string, atkProfile: string, defProfile: string) => {
    const rows = data.results.filter((r) => r.level === 50 && r.atkClass === atkClass && r.mode === mode && r.atkProfile === atkProfile && r.defProfile === defProfile && Number.isFinite(r.mean));
    return rows.reduce((total, r) => total + r.mean, 0) / Math.max(1, rows.length);
};
const worseWithSet = CLASSES.flatMap((cls) =>
    cls.modes
        .filter((mode) => averageMean(proposal, cls.id, mode, "tier", "comun") > averageMean(proposal, cls.id, mode, "comun", "comun") + 0.2)
        .map((mode) => `el ${cls.name.toLowerCase()} (${MODE[mode]})`),
);

const lines: string[] = [];
const push = (...text: string[]) => lines.push(...text);
// Escalones del set (todos los sets usan los mismos; si alguno difiere se avisa).
const setSteps = tierSets[0]?.bonuses ?? [];
const sameSteps = tierSets.every((set) => JSON.stringify(set.bonuses) === JSON.stringify(setSteps));
const describeStep = (step: SetBonusStep) =>
    [step.hpPct ? `+${step.hpPct} % de vida máxima` : "", step.manaPct ? `+${step.manaPct} % de maná` : "", step.dmgPct ? `+${step.dmgPct} % de daño contra jugadores` : ""]
        .filter(Boolean)
        .join(" y ");
const setText = setSteps.map((step) => `**${step.pieces} piezas:** ${describeStep(step)}`).join("; ");

push(
    "# Nivelación PvP por clase: cómo queda con los ítems",
    "",
    "Guía para leer rápido el balance de [BALANCE_PVP.md](BALANCE_PVP.md): qué ítems usa cada clase, cuánta vida y maná tiene, cuánto pega y en cuántos aciertos mata a alguien de su nivel, **antes** (en `main`) y **ahora** (con este cambio). Todos los números salen del simulador, que usa el motor real del server y que se comparó contra el juego en vivo.",
    "",
    "## Cómo leer los números",
    "",
    "- **Acierto**: un golpe, flecha o hechizo que entra. Los golpes fallados no cuentan (al lado del daño figura la chance de acertar).",
    "- **Aciertos para matar**: cuántos aciertos seguidos hacen falta para bajar toda la vida del otro, sin que se cure. Es un promedio: 2,5 quiere decir que la mitad de las veces son 2 y la otra mitad 3.",
    "- **`antes → ahora (objetivo)`**: lo que pasaba en `main`, lo que pasa ahora y lo que se busca. ⚠ marca cuando ahora queda a más de medio acierto del objetivo.",
    "- **Equipo común**: lo mejor que se consigue sin premios (crafteo, drops, misiones o comerciantes).",
    "- **Set**: el set de tier de la clase (Arcano, Silvestre, Templario, Paladín, Bardo, Verdugo, Silvano y Umbral; ítems 1749 a 1780). Donde el set no tiene pieza se usa la mejor común. El cazador y el pirata no tienen set: para ellos \"con set\" es su equipo común. Las piezas de set son **siempre Legendarias**: +3 al golpe o a la defensa y +6 al daño mágico, y no se caen al morir. Las stats de las tablas son las del ítem sin la rareza.",
    "- Todos pelean **buffeados** (fuerza y agilidad al doble, como en cualquier pelea), con raza humana y los skills al tope del nivel.",
    "- \\* Los ítems con \"+maná\" antes **no sumaban maná** (bug). Ahora sí.",
    "- ² Las clases físicas no tienen anillo útil: el Anillo de Magia (#1242) no tiene efecto en combate y el Anillo de Resistencia Mágica (#988) no se consigue por ninguna vía.",
    "",
    "## Lo pedido, en un gráfico",
    "",
    "![Aciertos pedidos: antes y ahora](graficos/anclas-del-pedido.svg)",
    "",
    "## Cuánto pega cada clase a nivel 50",
    "",
    `La línea roja es la vida de un mago nivel 50 (${mageHp}). ${oneShotText}`,
    "",
    "![Daño por acierto contra un mago, nivel 50](graficos/dano-contra-mago-nivel-50.svg)",
    "",
    "## En cuántos aciertos mata cada clase a alguien de su nivel",
    "",
    "![Aciertos para matar, nivel 50](graficos/aciertos-nivel-50.svg)",
    "",
    "Los mismos gráficos para [nivel 30](graficos/aciertos-nivel-30.svg) y [nivel 40](graficos/aciertos-nivel-40.svg).",
    "",
    "## Qué da el set",
    "",
    `Bonos del set (\`server/jsons/sets.json\`, por piezas distintas equipadas): ${setText}${sameSteps ? "" : " (algunos sets tienen otros escalones; ver el archivo)"}. El daño es físico o mágico, según con qué pegue la clase, y solo cuenta contra jugadores. Se aplica el escalón más alto alcanzado, sin acumular. La idea es que **el set valga más o menos un acierto a nivel 50**: con set matás un poco más rápido y aguantás un poco más.`,
    "",
    "Antes las tres barras de cada clase casi no cambiaban, porque el set no daba ventaja. Ahora se separan:",
    ...(worseWithSet.length
        ? ["", `⚠ **Ojo:** con set mata más lento ${worseWithSet.join(", ")}. Es un problema de los ítems, no del bono: la pieza de tier es peor que la común. Se arregla normalizando las piezas de tier (sección 7.5 de [BALANCE_PVP.md](BALANCE_PVP.md)).`]
        : []),
    "",
    "![Efecto del set antes](graficos/efecto-set-nivel-50-antes.svg)",
    "",
    "![Efecto del set ahora](graficos/efecto-set-nivel-50-ahora.svg)",
    "",
    "## Todas las clases a nivel 50, en una tabla",
    "",
    "Equipo común contra común.",
    "",
    "| Clase | Daño a un mago por acierto | Aciertos para matar a un mago | a un guerrero | a su misma clase |",
    "|---|---|---|---|---|",
);
for (const cls of CLASSES) {
    for (const mode of cls.modes) {
        push(`| ${cls.name} (${MODE[mode]}) | ${damageCell(50, cls.id, mode, 1)} | ${hitsCell(50, cls.id, mode, 1)} | ${hitsCell(50, cls.id, mode, 3)} | ${hitsCell(50, cls.id, mode, cls.id)} |`);
    }
}
push("", "## Clase por clase", "");

for (const cls of CLASSES) {
    const defense = (profile: string, level = 50) => proposal.loadouts[`${cls.id}|${level}|${profile}|defensa`];
    const attack = (profile: string, mode: string, level = 50) => proposal.loadouts[`${cls.id}|${level}|${profile}|${mode}`];
    const classSet = tierSets.find((set) => set.classes.includes(cls.id));
    push(
        `### ${cls.name}`,
        "",
        `*${cls.identity}*`,
        "",
        classSet ? `Set de tier: **${classSet.name}**.` : "**No tiene set de tier:** la columna del set repite su equipo común.",
        "",
        "**Equipo**",
        "",
        "| Lugar | Equipo común | Set de tier |",
        "|---|---|---|",
    );
    for (const mode of cls.modes) {
        const label = cls.modes.length > 1 ? `Arma (para ${MODE[mode] === "magia" ? "la magia" : MODE[mode] === "flecha" ? "tirar flechas" : "pegar"})` : "Arma";
        push(`| ${label} | ${describeItem(attack("comun", mode)?.gear.weapon)} | ${describeItem(attack("tier", mode)?.gear.weapon)} |`);
        if (mode === "rango") push(`| Flecha | ${describeItem(attack("comun", mode)?.gear.arrow)} | ${describeItem(attack("tier", mode)?.gear.arrow)} |`);
    }
    for (const [slot, label] of [["body", "Armadura o túnica"], ["helmet", "Casco"], ["shield", "Escudo"], ["ring", "Anillo"]] as const) {
        const cell = (profile: string) => {
            const id = defense(profile)?.gear[slot];
            return hasCombatEffect(id) ? describeItem(id) : slot === "ring" ? "— (no hay anillo útil para esta clase²)" : "—";
        };
        push(`| ${label} | ${cell("comun")} | ${cell("tier")} |`);
    }

    push("", "**Vida, maná y hechizo**", "", "| Nivel | Vida | Vida con set | Maná antes → ahora | Hechizo principal |", "|---|---:|---:|---|---|");
    for (const level of LEVELS) {
        const hpCommon = defense("comun", level)?.maxHp ?? 0;
        const hpTier = defense("tier", level)?.maxHp ?? 0;
        const magicMode = cls.modes.includes("magia") ? "magia" : cls.modes[0];
        const manaNow = current.loadouts[`${cls.id}|${level}|comun|${magicMode}`]?.maxMana ?? 0;
        const manaProp = attack("comun", magicMode, level)?.maxMana ?? 0;
        const spell = attack("comun", "magia", level)?.spell;
        const casts = spell ? Math.floor(manaProp / spell.mana) : 0;
        push(`| ${level} | ${hpCommon} | ${hpTier} | ${manaNow ? `${manaNow} → ${manaProp}` : "—"} | ${spell ? `${spell.name} (${spell.damage} base, ${spell.mana} de maná: ${casts} con el maná lleno)` : "—"} |`);
    }

    // Contra mago, guerrero y su misma clase (si no es una de esas dos).
    const opponents = [1, 3, ...(cls.id === 1 || cls.id === 3 ? [] : [cls.id])];
    for (const mode of cls.modes) {
        push(
            "",
            `**Aciertos para matar con ${MODE[mode]}** (equipo común contra común)`,
            "",
            `| Nivel | Daño a un mago | ${opponents.map((id) => `Contra ${NAME[id].toLowerCase()}`).join(" | ")} |`,
            `|---|---|${opponents.map(() => "---").join("|")}|`,
        );
        for (const level of LEVELS) {
            push(`| ${level} | ${damageCell(level, cls.id, mode, 1)} | ${opponents.map((id) => hitsCell(level, cls.id, mode, id)).join(" | ")} |`);
        }
    }

    const main = cls.modes[0];
    push(
        "",
        `**Con set a nivel 50** (${MODE[main]})`,
        "",
        "| Situación | Contra un mago | Contra un guerrero |",
        "|---|---|---|",
        `| Los dos con equipo común | ${hitsCell(50, cls.id, main, 1)} | ${hitsCell(50, cls.id, main, 3)} |`,
        `| Vos con set, el otro sin set | ${hitsCell(50, cls.id, main, 1, "tier", "comun")} | ${hitsCell(50, cls.id, main, 3, "tier", "comun")} |`,
        `| Vos sin set, el otro con set | ${hitsCell(50, cls.id, main, 1, "comun", "tier")} | ${hitsCell(50, cls.id, main, 3, "comun", "tier")} |`,
        `| Los dos con set | ${hitsCell(50, cls.id, main, 1, "tier", "tier")} | ${hitsCell(50, cls.id, main, 3, "tier", "tier")} |`,
        "",
    );
}

push(
    "## De dónde salen estos números",
    "",
    "- Simulador: `server/src/scripts/balanceSim/` (explicado en la sección 4 de [BALANCE_PVP.md](BALANCE_PVP.md)). Usa las funciones reales de combate del server (`game.userDmgUser` y `game.userSpellUser`) con 2000 tiradas por cruce.",
    "- Validado contra el juego en vivo el 2026-10-23: golpe de guerrero 398-439 en el juego contra 392-449 simulado; Llama de Dragón 137-145 en los dos.",
    "- Para regenerar esta guía y los gráficos:",
    "",
    "```bash",
    "# Antes: el simulador corrido sobre main (sin este cambio), por ejemplo en un worktree.",
    "git worktree add /tmp/woao-main main && pnpm --dir /tmp/woao-main/server install",
    "pnpm --dir /tmp/woao-main/server balance-sim --tiradas 2000 --salida /tmp/antes.json",
    "# Ahora: el código actual.",
    "pnpm --dir server balance-sim --tiradas 2000 --salida /tmp/ahora.json",
    "cd server && npx tsx src/scripts/balanceSim/charts.ts /tmp/antes.json /tmp/ahora.json",
    "npx tsx src/scripts/balanceSim/guide.ts /tmp/antes.json /tmp/ahora.json",
    "```",
    "",
);

fs.writeFileSync(output, lines.join("\n"));
console.log(`Guía escrita en ${output}`);
