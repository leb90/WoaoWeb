"use client";

import React from "react";
import { Activity, ShieldCheck, ShieldOff, Users, Wifi, type LucideIcon } from "lucide-react";
import { usePerformanceReadout } from "../lib/performanceReadout";

// El panel de la derecha (escritorio), donde antes estaban la energía, la vida y el maná (que pasaron al marco del
// personaje): FPS, ping, los dos seguros y el hambre y la sed. Junto con el clima (EnvironmentChips) tiene que caber
// en el alto de la columna de botones de al lado.

const ON_TONE = "text-[#34c759]";
const OFF_TONE = "text-[#ff3b30]";

function pingTone(pingMs: number | null): string {
    if (pingMs === null) return "text-stone-400";
    if (pingMs < 120) return ON_TONE;
    if (pingMs < 250) return "text-amber-300";
    return OFF_TONE;
}

function ReadoutChip({
    icon: Icon,
    label,
    value,
    tone,
    testId,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    tone: string;
    testId: string;
}) {
    return (
        <span
            data-testid={testId}
            className="flex h-[15px] min-w-0 items-center gap-[4px] rounded-sm border border-[#6b5636]/50 bg-black/30 px-[4px] text-[9px] font-semibold leading-none"
        >
            <Icon className={`h-2.5 w-2.5 shrink-0 ${tone}`} aria-hidden="true" />
            <span className="min-w-0 truncate uppercase text-[#d7c4a4]">{label}</span>
            <span className={`ml-auto shrink-0 font-bold tabular-nums ${tone}`}>{value}</span>
        </span>
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
            className="relative h-[15px] min-w-0 overflow-hidden rounded-sm border border-[#8b6b3e]/90 bg-black/65"
        >
            <div
                className="absolute inset-y-0 left-0 transition-[width] duration-200"
                style={{
                    width: `${ratio * 100}%`,
                    background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                }}
            />
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/22 to-black/15" />
            <span className="absolute inset-0 flex items-center gap-[2px] px-[4px] text-[9px] font-bold leading-none text-[#fbf5e8] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                <span className="min-w-0 truncate uppercase">{label}</span>
                <span className="ml-auto shrink-0 tabular-nums">
                    {value}/{max}
                </span>
            </span>
        </div>
    );
}

export default function PanelStatusReadout({
    seguro,
    seguroClan,
    hasClan,
    hambre,
    maxHambre,
    sed,
    maxSed,
}: {
    seguro: boolean;
    seguroClan: boolean;
    hasClan: boolean;
    hambre: number;
    maxHambre: number;
    sed: number;
    maxSed: number;
}) {
    const { fps, pingMs } = usePerformanceReadout();
    // Hambre y sed en 0 a la vez: el personaje está perdiendo vida y estamina.
    const isStarving = hambre <= 0 && sed <= 0;

    return (
        <div data-testid="panel-status-readout" className="space-y-[3px]">
            <div className="grid grid-cols-2 gap-[2px]">
                <ReadoutChip testId="readout-fps" icon={Activity} label="FPS" value={fps === null ? "--" : String(fps)} tone="text-stone-100" />
                <ReadoutChip testId="readout-ping" icon={Wifi} label="Ping" value={pingMs === null ? "-- ms" : `${pingMs} ms`} tone={pingTone(pingMs)} />
                <ReadoutChip
                    testId="readout-seguro"
                    icon={seguro ? ShieldCheck : ShieldOff}
                    label="Seguro"
                    value={seguro ? "ON" : "OFF"}
                    tone={seguro ? ON_TONE : OFF_TONE}
                />
                <ReadoutChip
                    testId="readout-clan"
                    icon={Users}
                    label="Clan"
                    value={hasClan ? (seguroClan ? "ON" : "OFF") : "—"}
                    tone={hasClan ? (seguroClan ? ON_TONE : OFF_TONE) : "text-stone-500"}
                />
            </div>
            <div className="grid grid-cols-2 gap-[2px]">
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
            {isStarving ? (
                <p className="text-[8px] font-semibold uppercase leading-[9px] tracking-[0.03em] text-[#e08a8a]">
                    Hambre y sed te están quitando vida
                </p>
            ) : null}
        </div>
    );
}
