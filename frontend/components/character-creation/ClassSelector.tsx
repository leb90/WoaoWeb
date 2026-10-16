"use client";

import { focusRing, panelClass } from "./styles";
import type { CharacterClassKey, CharacterClassOption } from "../../lib/characterCreation";

export default function ClassSelector({
    options,
    selectedClass,
    onSelect,
}: {
    options: CharacterClassOption[];
    selectedClass: CharacterClassKey;
    onSelect: (key: CharacterClassKey) => void;
}) {
    return (
        <section className={`${panelClass} p-2.5`} aria-label="Clases">
            <h2 className="mb-2 text-[11px] tracking-[0.28em] text-[#d6a62d]">⚔ CLASES</h2>
            <div className="grid grid-cols-5 gap-1.5 min-[1400px]:grid-cols-6">
                {options.map((option) => {
                    const active = option.key === selectedClass;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            title={option.label}
                            aria-label={option.label}
                            aria-pressed={active}
                            onClick={() => onSelect(option.key)}
                            className={`group relative flex h-11 w-11 items-center justify-center border text-base transition duration-150 ${focusRing} ${
                                active
                                    ? "border-[#d6a62d] bg-[#1c170d] text-[#f3e6b8] shadow-[0_0_12px_rgba(214,166,45,0.4)]"
                                    : "border-[#2a2418] bg-[#111] text-[#cbb892] hover:border-[#8a7040]"
                            }`}
                        >
                            <span aria-hidden="true">{option.icon}</span>
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden -translate-x-1/2 whitespace-nowrap border border-[#41351f] bg-black px-2 py-1 text-[11px] tracking-wide text-[#eee5d3] group-hover:block group-focus-visible:block">
                                {option.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
