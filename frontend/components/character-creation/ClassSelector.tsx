"use client";

import { useState } from "react";
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
    // Al pasar el mouse (o el foco) por una clase se ve cuál es antes de elegirla: en el título y en un cartel.
    const [hoveredClass, setHoveredClass] = useState<CharacterClassKey | null>(null);
    const shownOption = options.find((option) => option.key === (hoveredClass ?? selectedClass));
    const hoveredOption = hoveredClass ? options.find((option) => option.key === hoveredClass) : undefined;

    return (
        <section className={`${panelClass} relative p-2.5`} aria-label="Clases">
            {/* Un solo cartel del ancho del panel, arriba de la grilla: no se sale de la pantalla en ninguna columna. */}
            {hoveredOption ? (
                <div
                    role="tooltip"
                    data-class-tooltip={hoveredOption.key}
                    className="pointer-events-none absolute inset-x-0 bottom-full z-30 mb-1.5 border border-[#6b5426] bg-black/95 px-3 py-2 shadow-[0_6px_18px_rgba(0,0,0,0.6)]"
                >
                    <span className="block text-[14px] font-semibold tracking-wide text-[#f3e6b8]">
                        <span aria-hidden="true" className="mr-1.5">{hoveredOption.icon}</span>
                        {hoveredOption.label}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-[#cbb892]">{hoveredOption.summary}</span>
                </div>
            ) : null}
            <h2 className="mb-2 flex items-baseline justify-between gap-2 text-[11px] tracking-[0.28em] text-[#d6a62d]">
                <span>⚔ CLASES</span>
                {shownOption ? (
                    <span
                        data-class-hover-name={shownOption.key}
                        className={`truncate text-[12px] font-semibold tracking-[0.12em] ${hoveredClass ? "text-[#f3e6b8]" : "text-[#cbb892]"}`}
                    >
                        {shownOption.label}
                    </span>
                ) : null}
            </h2>
            <div className="grid grid-cols-5 gap-1.5 min-[1400px]:grid-cols-6" onMouseLeave={() => setHoveredClass(null)}>
                {options.map((option) => {
                    const active = option.key === selectedClass;
                    return (
                        <button
                            key={option.key}
                            type="button"
                            aria-label={option.label}
                            aria-pressed={active}
                            onClick={() => onSelect(option.key)}
                            onMouseEnter={() => setHoveredClass(option.key)}
                            onFocus={() => setHoveredClass(option.key)}
                            onBlur={() => setHoveredClass(null)}
                            className={`relative flex h-11 w-11 items-center justify-center border text-base transition duration-150 ${focusRing} ${
                                active
                                    ? "border-[#d6a62d] bg-[#1c170d] text-[#f3e6b8] shadow-[0_0_12px_rgba(214,166,45,0.4)]"
                                    : "border-[#2a2418] bg-[#111] text-[#cbb892] hover:border-[#8a7040]"
                            }`}
                        >
                            <span aria-hidden="true">{option.icon}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
