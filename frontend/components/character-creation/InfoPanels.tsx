"use client";

import RacePortrait from "./RacePortrait";
import { panelClass } from "./styles";
import type { CharacterClassOption, GenderKey, RaceOption } from "../../lib/characterCreation";

export function RaceInfoPanel({
    race,
    gender,
}: {
    race: RaceOption;
    gender: GenderKey;
}) {
    return (
        <section className={`${panelClass} flex min-h-0 flex-col p-3`} aria-label={`Raza ${race.label}`}>
            <header className="mb-2 flex items-center gap-2">
                <span className="border border-[#41351f] bg-black">
                    <RacePortrait headId={race.genders[gender].startHeadId} label={race.label} size={42} />
                </span>
                <h2 className="text-[13px] tracking-[0.16em] text-[#eee5d3]">
                    RAZA: {race.label.toUpperCase()}
                </h2>
            </header>
            <p className="text-[13px] leading-relaxed text-[#d7ccb4]">{race.summary}</p>
        </section>
    );
}

export function ClassInfoPanel({ option }: { option: CharacterClassOption | null }) {
    if (!option) {
        return (
            <section className={`${panelClass} flex min-h-0 flex-1 flex-col p-3`} aria-label="Clase sin elegir">
                <header className="mb-2 flex items-center gap-2">
                    <span className="flex h-11 w-11 items-center justify-center border border-dashed border-[#41351f] bg-black text-xl text-[#6f675c]">
                        ?
                    </span>
                    <h2 className="text-[13px] tracking-[0.16em] text-[#eee5d3]">CLASE: SIN ELEGIR</h2>
                </header>
                <p className="text-[13px] leading-relaxed text-[#d7ccb4]">
                    Elegí la raza y la cara mirando el cuerpo desnudo; después elegí una clase abajo y el personaje se viste con su equipo.
                </p>
            </section>
        );
    }

    return (
        <section className={`${panelClass} flex min-h-0 flex-1 flex-col p-3`} aria-label={`Clase ${option.label}`}>
            <header className="mb-2 flex items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center border border-[#41351f] bg-black text-xl text-[#f3e6b8]">
                    {option.icon}
                </span>
                <h2 className="text-[13px] tracking-[0.16em] text-[#eee5d3]">
                    CLASE: {option.label.toUpperCase()}
                </h2>
            </header>
            <p className="text-[13px] leading-relaxed text-[#d7ccb4]">{option.summary}</p>
        </section>
    );
}
