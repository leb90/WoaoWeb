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
    selectedClass: CharacterClassKey | null;
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
                    const showName = option.key === hoveredClass;
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
                            {/* El nombre sale al costado del ícono apenas pasás el mouse: se despliega desde el ícono. */}
                            <span
                                aria-hidden="true"
                                data-class-hover-label={option.key}
                                data-visible={showName ? "1" : "0"}
                                className={`pointer-events-none absolute left-full top-1/2 z-20 ml-2 flex origin-left -translate-y-1/2 items-center whitespace-nowrap border border-[#d6a62d] bg-black/95 px-2 py-1 text-[12px] font-semibold tracking-[0.08em] text-[#f3e6b8] shadow-[0_4px_14px_rgba(0,0,0,0.65),0_0_10px_rgba(214,166,45,0.25)] transition-[opacity,scale,translate] duration-200 ease-out ${
                                    showName ? "scale-100 opacity-100" : "translate-x-[-6px] scale-x-50 opacity-0"
                                }`}
                            >
                                {/* Piquito que apunta al ícono. */}
                                <span className="absolute -left-[5px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-[#d6a62d] bg-black" />
                                {option.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
