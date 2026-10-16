"use client";

import { panelClass } from "./styles";
import type { CombatPreview } from "../../lib/characterCreation";

const LEFT: { label: string; hint: string; value: keyof CombatPreview }[] = [
    {
        label: "Acierto armas",
        hint: "Chance de acertar un golpe cuerpo a cuerpo. Depende de la agilidad y de la clase.",
        value: "aciertoArmas",
    },
    {
        label: "Daño armas",
        hint: "Daño cuerpo a cuerpo. Sube con la fuerza y el modificador de la clase.",
        value: "danoArmas",
    },
    {
        label: "Evasión",
        hint: "Chance de esquivar un golpe. Depende de la agilidad y de la clase.",
        value: "evasion",
    },
    {
        label: "Defensa",
        hint: "Defensa física base con la que empieza el personaje.",
        value: "defensaFisica",
    },
];

const RIGHT: { label: string; hint: string; value: keyof CombatPreview }[] = [
    {
        label: "Acierto proyectiles",
        hint: "Chance de acertar con arco o proyectil. Depende de la agilidad y de la clase.",
        value: "aciertoProyectiles",
    },
    {
        label: "Daño proyectiles",
        hint: "Daño con arco o proyectil. Sube con la fuerza y el modificador de la clase.",
        value: "danoProyectiles",
    },
    {
        label: "Defensa escudos",
        hint: "Reducción al bloquear con escudo, según la clase.",
        value: "defensaEscudos",
    },
    {
        label: "Resist. magia",
        hint: "Resistencia a hechizos, según la clase.",
        value: "resistMagia",
    },
    {
        label: "Daño cañón",
        hint: "Daño mágico base de la clase.",
        value: "danoMagia",
    },
];

function Column({
    rows,
    preview,
}: {
    rows: typeof LEFT;
    preview: CombatPreview;
}) {
    return (
        <dl className="space-y-1">
            {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-3 text-[13px]" title={row.hint}>
                    <dt className="text-[#9f9587]">{row.label}</dt>
                    <dd className="text-[#eee5d3]">{preview[row.value]}</dd>
                </div>
            ))}
        </dl>
    );
}

export default function DerivedStats({ preview }: { preview: CombatPreview }) {
    return (
        <section className={`${panelClass} px-3 py-2.5`} aria-label="Estadísticas derivadas">
            <h2 className="mb-2 text-[11px] tracking-[0.22em] text-[#d6a62d]">
                ESTADÍSTICAS DERIVADAS
            </h2>
            <div className="grid grid-cols-2 gap-x-8">
                <Column rows={LEFT} preview={preview} />
                <Column rows={RIGHT} preview={preview} />
            </div>
        </section>
    );
}
