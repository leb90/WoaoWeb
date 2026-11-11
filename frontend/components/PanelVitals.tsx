"use client";

import React from "react";

// El panel de la derecha (escritorio), abajo de Transfigurar y Tienda: la vida y el maná en dos barras grandes, para
// leerlas de un vistazo al pelear, y debajo el hambre, la sed y el botón Menú (que llega como children).
// El FPS, el ping y los seguros van como texto sobre el render (GameStatusOverlay) y la energía, en el marco del
// personaje (PlayerUnitFrame).

// Barra grande con remates en rombo a los costados, como un marco de metal.
function VitalBar({
    label,
    value,
    max,
    fromColor,
    toColor,
    testId,
}: {
    label: string;
    value: number;
    max: number;
    fromColor: string;
    toColor: string;
    testId: string;
}) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    const cap =
        "pointer-events-none absolute top-1/2 z-10 h-[11px] w-[11px] -translate-y-1/2 rotate-45 border border-[#4a3216] bg-[linear-gradient(135deg,#f5d58a,#9a6a24_55%,#5a3a12)] shadow-[0_0_3px_rgba(0,0,0,0.8)]";

    return (
        <div data-testid={testId} title={`${label}: ${value}/${max}`} data-value={value} data-max={max} className="relative px-[6px]">
            <span className={`${cap} left-0`} aria-hidden="true" />
            <span className={`${cap} right-0`} aria-hidden="true" />
            <div className="relative h-[22px] overflow-hidden rounded-[3px] border border-[#c9a45c]/85 bg-black/75 shadow-[inset_0_1px_3px_rgba(0,0,0,0.9),0_1px_0_rgba(255,230,180,0.08)]">
                <div
                    className="absolute inset-y-0 left-0 transition-[width] duration-200"
                    style={{
                        width: `${ratio * 100}%`,
                        background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                    }}
                />
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/25 via-white/5 to-black/25" />
                <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold leading-none tabular-nums text-[#fbf5e8] [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_3px_rgba(0,0,0,0.9)]">
                    {value} / {max}
                </span>
            </div>
        </div>
    );
}

// Barra con el nombre y el número adentro: ocupa todo su lugar, sin huecos entre la etiqueta y el valor.
function NeedBar({
    label,
    value,
    max,
    fromColor,
    toColor,
    testId,
}: {
    label: string;
    value: number;
    max: number;
    fromColor: string;
    toColor: string;
    testId: string;
}) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

    return (
        <div
            data-testid={testId}
            title={`${label}: ${value}/${max}`}
            className="relative h-full min-w-0 overflow-hidden rounded-sm border border-[#8b6b3e]/90 bg-black/65"
        >
            <div
                className="absolute inset-y-0 left-0 transition-[width] duration-200"
                style={{
                    width: `${ratio * 100}%`,
                    background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                }}
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/22 to-black/15" />
            <span className="absolute inset-0 flex items-center gap-[2px] px-[5px] text-[10px] font-bold leading-none text-[#fbf5e8] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                <span className="min-w-0 truncate uppercase">{label}</span>
                <span className="ml-auto shrink-0 tabular-nums">
                    {value}/{max}
                </span>
            </span>
        </div>
    );
}

export default function PanelVitals({
    hp,
    maxHp,
    mana,
    maxMana,
    hambre,
    maxHambre,
    sed,
    maxSed,
    children,
}: {
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    hambre: number;
    maxHambre: number;
    sed: number;
    maxSed: number;
    // A la derecha del hambre y la sed (el botón Menú).
    children?: React.ReactNode;
}) {
    // Hambre y sed en 0 a la vez: el personaje está perdiendo vida y estamina. La vida se pinta bordó.
    const isStarving = hambre <= 0 && sed <= 0;

    return (
        <div data-testid="panel-vitals" className="space-y-[3px]">
            <VitalBar
                testId="panel-hp"
                label="Vida"
                value={hp}
                max={maxHp}
                fromColor={isStarving ? "#4a0a12" : "#7d0f0f"}
                toColor={isStarving ? "#7a1224" : "#e0432b"}
            />
            <VitalBar testId="panel-mana" label="Maná" value={mana} max={maxMana} fromColor="#0b3a66" toColor="#2fb8ed" />
            <div className="flex h-[22px] items-stretch gap-[3px]">
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-[3px]">
                    <NeedBar
                        testId="need-hambre"
                        label="Hambre"
                        value={hambre}
                        max={maxHambre}
                        fromColor={hambre <= 0 ? "#4a0a12" : "#6b3a12"}
                        toColor={hambre <= 0 ? "#7a1224" : "#d4893a"}
                    />
                    <NeedBar
                        testId="need-sed"
                        label="Sed"
                        value={sed}
                        max={maxSed}
                        fromColor={sed <= 0 ? "#4a0a12" : "#1a5f73"}
                        toColor={sed <= 0 ? "#7a1224" : "#5ad0e6"}
                    />
                </div>
                {children}
            </div>
            {isStarving ? (
                <p className="text-[8px] font-semibold uppercase leading-[9px] tracking-[0.03em] text-[#e08a8a]">
                    Hambre y sed te están quitando vida
                </p>
            ) : null}
        </div>
    );
}
