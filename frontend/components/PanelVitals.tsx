"use client";

import React from "react";
import { Droplet, Heart, type LucideIcon } from "lucide-react";

// El panel de la derecha (escritorio), abajo de Transfigurar y Tienda: la vida y el maná en dos barras grandes, para
// leerlas de un vistazo al pelear, y debajo el hambre y la sed (finas, apiladas) al lado del botón Menú (children).
// El FPS, el ping y los seguros van al pie del panel (PanelStatusLine) y la energía, en el marco del personaje.

// Debajo de este porcentaje la vida late, para que se note en medio de una pelea.
const LOW_RATIO = 0.25;

// Barra grande: marco dorado con bisel, relleno con volumen, marcas cada 10 % y remates en rombo a los costados.
function VitalBar({
    label,
    icon: Icon,
    value,
    max,
    fromColor,
    toColor,
    glowColor,
    pulseWhenLow = false,
    testId,
}: {
    label: string;
    icon: LucideIcon;
    value: number;
    max: number;
    fromColor: string;
    toColor: string;
    glowColor: string;
    pulseWhenLow?: boolean;
    testId: string;
}) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    const isLow = pulseWhenLow && max > 0 && ratio < LOW_RATIO;
    const cap =
        "pointer-events-none absolute top-1/2 z-10 flex h-[12px] w-[12px] -translate-y-1/2 rotate-45 items-center justify-center border border-[#3a250e] bg-[linear-gradient(135deg,#fbe2a0,#b07d2c_50%,#5a3a12)] shadow-[0_0_4px_rgba(0,0,0,0.85)]";

    return (
        <div data-testid={testId} title={`${label}: ${value}/${max}`} data-value={value} data-max={max} className="relative px-[7px]">
            <span className={`${cap} left-0`} aria-hidden="true">
                <span className="h-[4px] w-[4px] rounded-full" style={{ background: toColor, boxShadow: `0 0 3px ${glowColor}` }} />
            </span>
            <span className={`${cap} right-0`} aria-hidden="true">
                <span className="h-[4px] w-[4px] rounded-full" style={{ background: toColor, boxShadow: `0 0 3px ${glowColor}` }} />
            </span>
            {/* El marco: un borde dorado con luz arriba y sombra abajo. */}
            <div className="rounded-[4px] bg-[linear-gradient(180deg,#f0d08a_0%,#a87a30_45%,#5c3c14_100%)] p-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                <div className="relative h-[18px] overflow-hidden rounded-[2px] bg-[#0a0605] shadow-[inset_0_2px_4px_rgba(0,0,0,0.95)]">
                    <div
                        className={`absolute inset-y-0 left-0 transition-[width] duration-300 ease-out ${isLow ? "animate-pulse" : ""}`}
                        style={{
                            width: `${ratio * 100}%`,
                            background: `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 48%, rgba(0,0,0,0.12) 52%, rgba(0,0,0,0.38) 100%), linear-gradient(90deg, ${fromColor}, ${toColor})`,
                            boxShadow: `0 0 8px ${glowColor}`,
                        }}
                    >
                        {/* El borde del relleno brilla, como el nivel de un líquido. */}
                        {ratio > 0 && ratio < 1 ? (
                            <span className="absolute inset-y-0 right-0 w-[2px] bg-white/55 shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
                        ) : null}
                    </div>
                    {/* Marcas cada 10 %. */}
                    <div
                        className="pointer-events-none absolute inset-0 opacity-35"
                        style={{
                            backgroundImage: "repeating-linear-gradient(90deg, transparent 0, transparent calc(10% - 1px), rgba(0,0,0,0.85) calc(10% - 1px), rgba(0,0,0,0.85) 10%)",
                        }}
                    />
                    <span className="absolute inset-y-0 left-[6px] flex items-center">
                        <Icon className="h-[12px] w-[12px] fill-current text-[#fbf5e8] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" aria-hidden="true" />
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold leading-none tabular-nums tracking-[0.02em] text-[#fffaf0] [text-shadow:0_1px_2px_rgba(0,0,0,1),0_0_4px_rgba(0,0,0,0.9)]">
                        {value} / {max}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Barra fina con el nombre y el número adentro.
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
            className="relative h-[11px] min-w-0 overflow-hidden rounded-[2px] border border-[#6f5530]/90 bg-black/70"
        >
            <div
                className="absolute inset-y-0 left-0 transition-[width] duration-200"
                style={{
                    width: `${ratio * 100}%`,
                    background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                }}
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/20 to-black/20" />
            <span className="absolute inset-0 flex items-center px-[4px] text-[8px] font-bold uppercase leading-none tracking-[0.04em] text-[#fbf5e8] [text-shadow:0_1px_1px_rgba(0,0,0,1)]">
                <span className="min-w-0 truncate">{label}</span>
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
        <div data-testid="panel-vitals">
            <div className="flex flex-col gap-[6px]">
                <VitalBar
                    testId="panel-hp"
                    label="Vida"
                    icon={Heart}
                    value={hp}
                    max={maxHp}
                    fromColor={isStarving ? "#3d0710" : "#6e0b0b"}
                    toColor={isStarving ? "#7a1224" : "#e2412a"}
                    glowColor={isStarving ? "rgba(122,18,36,0.45)" : "rgba(226,65,42,0.4)"}
                    pulseWhenLow
                />
                <VitalBar
                    testId="panel-mana"
                    label="Maná"
                    icon={Droplet}
                    value={mana}
                    max={maxMana}
                    fromColor="#082f57"
                    toColor="#33c0f0"
                    glowColor="rgba(51,192,240,0.35)"
                />
            </div>
            <div className="mt-[6px] flex h-[24px] items-stretch gap-[4px]">
                <div className="flex min-w-0 flex-1 flex-col justify-between">
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
                <p className="mt-[3px] text-[8px] font-semibold uppercase leading-[9px] tracking-[0.03em] text-[#e08a8a]">
                    Hambre y sed te están quitando vida
                </p>
            ) : null}
        </div>
    );
}
