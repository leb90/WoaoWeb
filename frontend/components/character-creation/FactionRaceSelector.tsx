"use client";

import RacePortrait from "./RacePortrait";
import { focusRing, panelClass } from "./styles";
import type { GenderKey, RaceKey, RaceOption } from "../../lib/characterCreation";

function FactionMark({ tone }: { tone: "alianza" | "horda" }) {
    if (tone === "alianza") {
        return (
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#8eb4e8]" aria-hidden="true">
                <path d="M12 2 5 6v6c0 4.2 2.8 7.4 7 8.8 4.2-1.4 7-4.6 7-8.8V6l-7-4zm0 2.3 5 2.8v4.7c0 3-1.9 5.4-5 6.6-3.1-1.2-5-3.6-5-6.6V7.1l5-2.8z" />
                <path d="M12 7.2c-1.6 1.8-2.4 3.2-2.4 4.8 0 1.5.8 2.6 2.4 3.4 1.6-.8 2.4-1.9 2.4-3.4 0-1.6-.8-3-2.4-4.8z" />
            </svg>
        );
    }

    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#e07a6a]" aria-hidden="true">
            <path d="M12 3 4 8.2 6.2 20h11.6L20 8.2 12 3zm0 2.4 5.2 3.4-1.4 8.2H8.2L6.8 8.8 12 5.4z" />
            <path d="M12 8.2 9.2 14h5.6L12 8.2z" />
        </svg>
    );
}

function RaceOptionButton({
    race,
    selected,
    onSelect,
}: {
    race: RaceOption;
    selected: boolean;
    onSelect: (race: RaceKey) => void;
}) {
    return (
        <button
            type="button"
            title={race.label}
            aria-label={race.label}
            aria-pressed={selected}
            onClick={() => onSelect(race.key)}
            className={`group relative flex h-[52px] w-[52px] items-center justify-center border bg-[#0b0b0b] transition duration-150 ${focusRing} ${
                selected
                    ? "border-[#d6a62d] bg-[#1c170d] shadow-[0_0_0_1px_#d6a62d,0_0_12px_rgba(214,166,45,0.45)]"
                    : "border-[#2a2418] hover:border-[#8a7040]"
            }`}
        >
            <RacePortrait headId={race.genders.male.startHeadId} label={race.label} />
            <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden -translate-y-1/2 whitespace-nowrap border border-[#41351f] bg-black px-2 py-1 text-[11px] tracking-wide text-[#eee5d3] group-hover:block group-focus-visible:block">
                {race.label}
            </span>
        </button>
    );
}

function FactionPanel({
    title,
    tone,
    races,
    selectedRace,
    onSelect,
}: {
    title: string;
    tone: "alianza" | "horda";
    races: RaceOption[];
    selectedRace: RaceKey;
    onSelect: (race: RaceKey) => void;
}) {
    const skin =
        tone === "alianza"
            ? "border-[#243e72] bg-[linear-gradient(180deg,rgba(16,28,58,0.95),rgba(5,5,5,0.94))]"
            : "border-[#6a2420] bg-[linear-gradient(180deg,rgba(58,16,16,0.95),rgba(5,5,5,0.94))]";

    return (
        <section className={`flex flex-col items-center border px-3 py-2.5 ${skin}`} aria-label={title}>
            <header className="mb-2 flex items-center justify-center gap-1.5">
                <FactionMark tone={tone} />
                <h2
                    className={`text-[11px] tracking-[0.22em] ${
                        tone === "alianza" ? "text-[#9eb6e4]" : "text-[#e7a097]"
                    }`}
                >
                    {title}
                </h2>
            </header>
            <div className="flex flex-col items-center gap-1.5">
                {races.map((race) => (
                    <RaceOptionButton
                        key={race.key}
                        race={race}
                        selected={race.key === selectedRace}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </section>
    );
}

export default function FactionRaceSelector({
    alianza,
    horda,
    selectedRace,
    selectedGender,
    onSelectRace,
    onSelectGender,
}: {
    alianza: RaceOption[];
    horda: RaceOption[];
    selectedRace: RaceKey;
    selectedGender: GenderKey;
    onSelectRace: (race: RaceKey) => void;
    onSelectGender: (gender: GenderKey) => void;
}) {
    return (
        <div className="flex h-full flex-col gap-2">
            <div className="grid grid-cols-2 justify-center gap-4">
                <FactionPanel
                    title="ALIANZA"
                    tone="alianza"
                    races={alianza}
                    selectedRace={selectedRace}
                    onSelect={onSelectRace}
                />
                <FactionPanel
                    title="HORDA"
                    tone="horda"
                    races={horda}
                    selectedRace={selectedRace}
                    onSelect={onSelectRace}
                />
            </div>
            <div className={`${panelClass} flex gap-2 p-1.5`} role="group" aria-label="Sexo">
                {(
                    [
                        ["male", "♂ Hombre"],
                        ["female", "♀ Mujer"],
                    ] as const
                ).map(([key, label]) => {
                    const active = selectedGender === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onSelectGender(key)}
                            className={`flex-1 px-2 py-1 text-[11px] tracking-[0.14em] transition duration-150 ${focusRing} ${
                                active
                                    ? "border border-[#d6a62d] bg-[#1c170d] text-[#eee5d3] shadow-[0_0_10px_rgba(214,166,45,0.28)]"
                                    : "border border-transparent text-[#9f9587] hover:text-[#eee5d3]"
                            }`}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
