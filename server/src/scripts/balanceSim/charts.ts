// Gráficos de barras (SVG) de balance PvP a partir de dos resultados del simulador: antes (main) y ahora.
//   tsx charts.ts <antes.json> <ahora.json> [carpeta de salida=docs/balance/graficos]
import fs from "node:fs";
import path from "node:path";

import { targetHits, type SimResult } from "./targets";

type Row = SimResult & { hp: number; dmgAvg: number };
type Data = { results: Row[] };

const [currentFile, proposalFile, outArg] = process.argv.slice(2);
if (!currentFile || !proposalFile) {
    console.log("Uso: charts.ts <antes.json> <ahora.json> [carpeta de salida]");
    process.exit(1);
}
const outDir = outArg ?? path.resolve(__dirname, "../../../../docs/balance/graficos");
const current: Data = JSON.parse(fs.readFileSync(currentFile, "utf8"));
const proposal: Data = JSON.parse(fs.readFileSync(proposalFile, "utf8"));
fs.mkdirSync(outDir, { recursive: true });

const CLASS_NAMES: Record<number, string> = { 1: "Mago", 2: "Clérigo", 3: "Guerrero", 4: "Asesino", 6: "Bardo", 7: "Druida", 8: "Paladín", 9: "Cazador", 18: "Pirata", 20: "Arquero" };
const MODE_NAMES: Record<string, string> = { magia: "magia", melee: "golpe", rango: "flecha" };
// Orden de lectura: magia pura, híbridos, físicos.
const ATTACKERS = ["1|magia", "7|magia", "7|melee", "2|magia", "2|melee", "6|magia", "6|melee", "8|magia", "8|melee", "4|magia", "4|melee", "3|melee", "18|melee", "9|rango", "9|melee", "20|rango"];
const COLORS = { hoy: "#9ca3af", propuesta: "#2563eb", objetivo: "#15803d", extra: "#f59e0b", ref: "#dc2626" };

type Series = { name: string; color: string; values: Array<number | null> };
type Marker = { name: string; color: string; values: Array<number | null>; labels?: string[]; ranges?: Array<[number, number] | null> };
type ChartSpec = {
    file: string;
    title: string;
    subtitle: string;
    yLabel: string;
    categories: Array<[string, string]>;
    series: Series[];
    marker?: Marker;
    refLine?: { value: number; label: string };
    decimals: number;
};

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fmt = (value: number, decimals: number) => value.toFixed(decimals).replace(".", ",");

function niceMax(value: number) {
    const steps = [1, 2, 2.5, 5, 10];
    const magnitude = 10 ** Math.floor(Math.log10(Math.max(1, value)));
    for (const step of steps) if (step * magnitude >= value) return step * magnitude;
    return 10 * magnitude;
}

function renderChart(spec: ChartSpec) {
    // Barras horizontales: una fila por categoría, entra en el ancho de GitHub (~900 px) sin achicar la letra.
    const width = 900;
    const left = 190;
    const right = 70;
    const top = 104;
    const barHeight = 13;
    const barGap = 3;
    const rowPadding = 12;
    const rowHeight = spec.series.length * (barHeight + barGap) - barGap + rowPadding * 2;
    const plotHeight = spec.categories.length * rowHeight;
    const bottom = 46;
    const height = top + plotHeight + bottom;
    const plotWidth = width - left - right;
    const allValues = [
        ...spec.series.flatMap((s) => s.values),
        ...(spec.marker?.values ?? []),
        spec.refLine?.value ?? 0,
    ].filter((v): v is number => v !== null && Number.isFinite(v));
    const xMax = niceMax(Math.max(...allValues) * 1.08);
    const x = (value: number) => left + (Math.min(value, xMax) / xMax) * plotWidth;
    const halo = `paint-order="stroke" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"`;
    const parts: string[] = [];
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="Helvetica, Arial, sans-serif">`);
    parts.push(`<rect width="100%" height="100%" fill="#ffffff"/>`);
    parts.push(`<text x="20" y="30" font-size="19" font-weight="700" fill="#111827">${escape(spec.title)}</text>`);
    parts.push(`<text x="20" y="52" font-size="12.5" fill="#4b5563">${escape(spec.subtitle)}</text>`);

    // Leyenda.
    let legendX = 20;
    const legend = [
        ...spec.series.map((s) => ({ name: s.name, color: s.color, kind: "bar" })),
        ...(spec.marker ? [{ name: spec.marker.name, color: spec.marker.color, kind: "marker" }] : []),
        ...(spec.refLine ? [{ name: spec.refLine.label, color: COLORS.ref, kind: "ref" }] : []),
    ];
    for (const item of legend) {
        if (item.kind === "bar") parts.push(`<rect x="${legendX}" y="68" width="14" height="12" fill="${item.color}" rx="2"/>`);
        else if (item.kind === "marker") parts.push(`<rect x="${legendX + 5}" y="64" width="4" height="20" fill="${item.color}"/>`);
        else parts.push(`<line x1="${legendX + 7}" y1="63" x2="${legendX + 7}" y2="85" stroke="${item.color}" stroke-width="2" stroke-dasharray="4 3"/>`);
        parts.push(`<text x="${legendX + 20}" y="79" font-size="12.5" fill="#374151">${escape(item.name)}</text>`);
        legendX += 36 + item.name.length * 6.9;
    }

    // Grilla y eje de valores.
    for (let i = 0; i <= 5; i++) {
        const value = (xMax / 5) * i;
        const lineX = x(value);
        parts.push(`<line x1="${lineX}" y1="${top}" x2="${lineX}" y2="${top + plotHeight}" stroke="${i === 0 ? "#6b7280" : "#e5e7eb"}" stroke-width="1"/>`);
        parts.push(`<text x="${lineX}" y="${top + plotHeight + 18}" font-size="11" text-anchor="middle" fill="#6b7280">${fmt(value, value % 1 ? 1 : 0)}</text>`);
    }
    parts.push(`<text x="${left + plotWidth / 2}" y="${top + plotHeight + 38}" font-size="12" text-anchor="middle" fill="#374151">${escape(spec.yLabel)}</text>`);

    spec.categories.forEach(([line1, line2], index) => {
        const rowTop = top + index * rowHeight;
        if (index % 2 === 1) parts.push(`<rect x="${left}" y="${rowTop}" width="${plotWidth}" height="${rowHeight}" fill="#f9fafb"/>`);
        const centerY = rowTop + rowHeight / 2;
        parts.push(`<text x="${left - 10}" y="${centerY - 2}" font-size="12.5" font-weight="600" text-anchor="end" fill="#111827">${escape(line1)}</text>`);
        parts.push(`<text x="${left - 10}" y="${centerY + 13}" font-size="11.5" text-anchor="end" fill="#4b5563">${escape(line2)}</text>`);
        // Orden de dibujo: barras, objetivo y recién después los números, para que la marca no los tape.
        const labels: string[] = [];
        spec.series.forEach((series, seriesIndex) => {
            const value = series.values[index];
            if (value === null || !Number.isFinite(value)) return;
            const barY = rowTop + rowPadding + seriesIndex * (barHeight + barGap);
            parts.push(`<rect x="${left}" y="${barY}" width="${Math.max(1, x(value) - left)}" height="${barHeight}" fill="${series.color}" rx="2"/>`);
            labels.push(`<text x="${x(value) + 5}" y="${barY + barHeight - 2}" font-size="11" font-weight="600" fill="#111827" ${halo}>${fmt(value, spec.decimals)}</text>`);
        });
        const markerValue = spec.marker?.values[index];
        if (spec.marker && markerValue !== null && markerValue !== undefined && Number.isFinite(markerValue)) {
            const range = spec.marker.ranges?.[index];
            if (range && range[1] > range[0]) {
                parts.push(`<rect x="${x(range[0])}" y="${rowTop + 4}" width="${x(range[1]) - x(range[0])}" height="${rowHeight - 8}" fill="${spec.marker.color}" fill-opacity="0.18" stroke="${spec.marker.color}" stroke-width="2"/>`);
            } else {
                parts.push(`<rect x="${x(markerValue) - 2}" y="${rowTop + 4}" width="4" height="${rowHeight - 8}" fill="${spec.marker.color}"/>`);
            }
            const label = spec.marker.labels?.[index];
            if (label) labels.push(`<text x="${x(markerValue)}" y="${rowTop + 2}" font-size="10.5" font-weight="700" text-anchor="middle" fill="${spec.marker.color}" ${halo}>${escape(label)}</text>`);
        }
        parts.push(...labels);
    });

    if (spec.refLine) {
        const refX = x(spec.refLine.value);
        parts.push(`<line x1="${refX}" y1="${top}" x2="${refX}" y2="${top + plotHeight}" stroke="${COLORS.ref}" stroke-width="2" stroke-dasharray="6 4"/>`);
    }
    parts.push(`</svg>`);
    fs.writeFileSync(path.join(outDir, spec.file), parts.join("\n") + "\n");
    console.log(`${spec.file} (${width}x${height})`);
}

const rowsFor = (data: Data, level: number, atkProfile: string, defProfile: string, key: string) =>
    data.results.filter((r) => r.level === level && r.atkProfile === atkProfile && r.defProfile === defProfile && `${r.atkClass}|${r.mode}` === key);
const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);
const labelOf = (key: string): [string, string] => {
    const [classId, mode] = key.split("|");
    return [CLASS_NAMES[Number(classId)], MODE_NAMES[mode]];
};

// 1) Aciertos para matar, mismo nivel, equipo común contra común (promedio contra las 10 clases).
for (const level of [30, 40, 50]) {
    const meanOf = (data: Data, key: string) => average(rowsFor(data, level, "comun", "comun", key).map((r) => r.mean).filter(Number.isFinite));
    renderChart({
        file: `aciertos-nivel-${level}.svg`,
        title: `Nivel ${level}: aciertos para matar a alguien de tu nivel`,
        subtitle: "Equipo común contra común, buffeados. Promedio contra las 10 clases. Más alto = combate más largo.",
        yLabel: "Aciertos para matar",
        categories: ATTACKERS.map(labelOf),
        series: [
            { name: "Antes (main)", color: COLORS.hoy, values: ATTACKERS.map((k) => meanOf(current, k)) },
            { name: "Ahora", color: COLORS.propuesta, values: ATTACKERS.map((k) => meanOf(proposal, k)) },
        ],
        marker: { name: "Objetivo", color: COLORS.objetivo, values: ATTACKERS.map((k) => average(rowsFor(proposal, level, "comun", "comun", k).map((r) => targetHits(r) ?? NaN).filter(Number.isFinite))) },
        decimals: 1,
    });
}

// 2) Daño por acierto contra un mago nivel 50 (equipo común), con su vida como referencia.
{
    const damageOf = (data: Data, key: string) => rowsFor(data, 50, "comun", "comun", key).find((r) => r.defClass === 1)?.dmgAvg ?? null;
    const mageHp = proposal.results.find((r) => r.level === 50 && r.defClass === 1 && r.defProfile === "comun")?.hp ?? 0;
    renderChart({
        file: "dano-contra-mago-nivel-50.svg",
        title: "Nivel 50: daño por acierto contra un mago",
        subtitle: "Equipo común contra común, buffeados. Si la barra pasa la línea roja, lo mata de un acierto.",
        yLabel: "Daño promedio por acierto",
        categories: ATTACKERS.map(labelOf),
        series: [
            { name: "Antes (main)", color: COLORS.hoy, values: ATTACKERS.map((k) => damageOf(current, k)) },
            { name: "Ahora", color: COLORS.propuesta, values: ATTACKERS.map((k) => damageOf(proposal, k)) },
        ],
        refLine: { value: mageHp, label: `Vida del mago (${mageHp})` },
        decimals: 0,
    });
}

// 3) Efecto del set de tier a nivel 50, antes y ahora.
const SET_SUBTITLES = {
    antes: "Promedio contra las 10 clases. Antes las barras casi no cambiaban: el set no daba ventaja, y en algunas clases era peor.",
    ahora: "Promedio contra las 10 clases. Con set matás más rápido (azul); sin set contra uno con set tardás más (naranja).",
};
for (const [data, name, label] of [[current, "antes", "antes, en main"], [proposal, "ahora", "ahora"]] as const) {
    const meanOf = (atk: string, def: string, key: string) => average(rowsFor(data, 50, atk, def, key).map((r) => r.mean).filter(Number.isFinite));
    renderChart({
        file: `efecto-set-nivel-50-${name}.svg`,
        title: `Nivel 50: cuánto cambia tener el set de tier (${label})`,
        subtitle: SET_SUBTITLES[name],
        yLabel: "Aciertos para matar",
        categories: ATTACKERS.map(labelOf),
        series: [
            { name: "Con set contra sin set", color: COLORS.propuesta, values: ATTACKERS.map((k) => meanOf("tier", "comun", k)) },
            { name: "Mismo equipo (común)", color: COLORS.hoy, values: ATTACKERS.map((k) => meanOf("comun", "comun", k)) },
            { name: "Sin set contra con set", color: COLORS.extra, values: ATTACKERS.map((k) => meanOf("comun", "tier", k)) },
        ],
        decimals: 1,
    });
}

// 4) Las anclas del pedido.
{
    const pick = (data: Data, level: number, atk: string, def: string, defClass: number) =>
        data.results.find((r) => r.level === level && r.atkClass === 1 && r.mode === "magia" && r.defClass === defClass && r.atkProfile === atk && r.defProfile === def)?.mean ?? null;
    const cases: Array<{ label: [string, string]; args: [number, string, string, number]; range: [number, number]; targetLabel: string }> = [
        { label: ["Mago vs mago", "nivel 30"], args: [30, "comun", "comun", 1], range: [2, 2], targetLabel: "2" },
        { label: ["Mago vs mago", "nivel 40"], args: [40, "comun", "comun", 1], range: [2, 3], targetLabel: "2-3" },
        { label: ["Mago vs mago", "nivel 50"], args: [50, "comun", "comun", 1], range: [3, 3], targetLabel: "3" },
        { label: ["Mago con set vs", "guerrero sin set (50)"], args: [50, "tier", "comun", 3], range: [2, 3], targetLabel: "2-3" },
        { label: ["Mago con set vs", "guerrero con set (50)"], args: [50, "tier", "tier", 3], range: [4, 5], targetLabel: "4-5" },
    ];
    renderChart({
        file: "anclas-del-pedido.svg",
        title: "Lo que se pidió: aciertos de magia para matar",
        subtitle: "Llama de Dragón (Lluvia de Sangre a nivel 30). En verde, el número o el rango pedido.",
        yLabel: "Aciertos para matar",
        categories: cases.map((c) => c.label),
        series: [
            { name: "Antes (main)", color: COLORS.hoy, values: cases.map((c) => pick(current, ...c.args)) },
            { name: "Ahora", color: COLORS.propuesta, values: cases.map((c) => pick(proposal, ...c.args)) },
        ],
        marker: { name: "Pedido", color: COLORS.objetivo, values: cases.map((c) => (c.range[0] + c.range[1]) / 2), labels: cases.map((c) => c.targetLabel), ranges: cases.map((c) => c.range) },
        decimals: 1,
    });
}
