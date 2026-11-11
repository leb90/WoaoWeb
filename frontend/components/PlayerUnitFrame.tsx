"use client";

import React from "react";
import { Skull, Zap } from "lucide-react";
import type { PlayerHudState, SkillsState } from "../lib/aowProtocol";
import type { RuntimeTimingConfig } from "../lib/runtime-config";
import UnitFrameShell, { Bar, HeadPortrait, StandingBadge } from "./UnitFrameShell";
import {
    formatStatusCountdown,
    usePlayerStatusEntries,
    type PlayerStatusEntry,
} from "./playerStatusEntries";

// El marco del personaje (escritorio), al estilo del de WoW: nombre y energía, el retrato con el escudo del bando y,
// debajo, los estados con lo que les falta. La vida y el maná van en grande en el panel de la derecha (PanelVitals).
// Va a la izquierda del chat; toma el ancho de su caja.

type PlayerUnitFrameProps = {
    hud: PlayerHudState | null;
    runtimeTiming: RuntimeTimingConfig;
    skillsState?: SkillsState | null;
    className?: string;
    style?: React.CSSProperties;
    // Lo que va debajo de los estados (el aggro o el objetivo), para que se apile sin pisarse.
    children?: React.ReactNode;
    // Fuera del render (a la izquierda del chat) acepta el mouse para los tooltips; adentro no tapa clics del mapa.
    interactive?: boolean;
};

function StatusIcon({ entry }: { entry: PlayerStatusEntry }) {
    const Icon = entry.icon;
    const border =
        entry.kind === "debuff"
            ? "border-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.35)]"
            : entry.kind === "buff"
              ? "border-amber-300/55"
              : "border-stone-500/50";

    return (
        <div
            data-testid={`player-status-${entry.key}`}
            data-kind={entry.kind}
            data-seconds={entry.seconds ?? ""}
            title={`${entry.name}${entry.detail ? `: ${entry.detail}` : ""}`}
            className="pointer-events-auto flex w-[28px] flex-col items-center gap-[2px]"
        >
            <div className={`relative flex h-[24px] w-[24px] items-center justify-center overflow-hidden rounded-[5px] border bg-[#2a1b12] ${border}`}>
                <Icon className={`h-[15px] w-[15px] ${entry.tone}`} strokeWidth={2.2} />
                {/* Lo que ya pasó se oscurece desde arriba, como el reloj de los íconos de WoW. */}
                {entry.seconds !== null ? (
                    <div
                        className="pointer-events-none absolute inset-x-0 top-0 bg-black/55"
                        style={{ height: `${(1 - entry.progress) * 100}%` }}
                    />
                ) : null}
            </div>
            <span
                className={`min-w-[26px] rounded-sm border border-black/60 bg-black/80 px-[3px] py-[1px] text-center text-[9px] font-bold leading-none tabular-nums ${
                    entry.kind === "debuff" ? "text-red-100" : "text-amber-100"
                }`}
            >
                {/* Sin vencimiento (veneno, quemadura): dura hasta que te curás. */}
                {entry.seconds === null ? <span className="text-[11px] leading-[9px]">∞</span> : formatStatusCountdown(entry.seconds)}
            </span>
        </div>
    );
}

export default function PlayerUnitFrame({
    hud,
    runtimeTiming,
    skillsState,
    className,
    style,
    children,
    interactive = false,
}: PlayerUnitFrameProps) {
    const entries = usePlayerStatusEntries({ hud, runtimeTiming, skillsState });

    if (!hud) {
        return null;
    }

    const sta = hud.sta ?? 0;
    const maxSta = hud.maxSta ?? 0;
    const dead = Boolean(hud.dead);

    return (
        <div
            data-testid="player-unit-frame"
            className={`${interactive ? "pointer-events-auto" : "pointer-events-none"} z-30 flex flex-col items-stretch gap-[5px] ${className ?? ""}`}
            style={style}
        >
            <UnitFrameShell
                testId="player-frame"
                dead={dead}
                bodyHeightClass="h-[16px]"
                bodyClassName="py-[4px]"
                portrait={<HeadPortrait bodyId={hud.idBody ?? 0} headId={hud.idHead ?? 0} />}
                badge={<StandingBadge color={hud.color} testId="player-frame-standing" />}
                band={
                    <>
                        <span data-testid="player-frame-name" className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-none text-[#f4ead6] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]">
                            {hud.nameCharacter}
                        </span>
                        {dead ? (
                            <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-stone-300">
                                <Skull className="h-2.5 w-2.5" /> Muerto
                            </span>
                        ) : null}
                        {/* La energía (el nivel ya está en el panel de la derecha, junto al nombre). */}
                        <span
                            data-testid="player-frame-energy-value"
                            title="Energía"
                            className="flex shrink-0 items-center gap-[2px] text-[10px] font-bold leading-none tabular-nums text-[#f2cf5b] [text-shadow:0_1px_2px_rgba(0,0,0,0.9)]"
                        >
                            <Zap className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                            {sta}/{maxSta}
                        </span>
                    </>
                }
            >
                <Bar
                    testId="player-frame-energy"
                    title={`Energía: ${sta}/${maxSta}`}
                    value={sta}
                    max={maxSta}
                    fromColor="#8a6514"
                    toColor="#f2cf5b"
                    heightClass="h-[8px]"
                    showText={false}
                    gloss="from-white/15 to-black/25"
                />
            </UnitFrameShell>

            {entries.length ? (
                <div data-testid="player-status-row" className="flex flex-wrap gap-[3px]">
                    {entries.map((entry) => (
                        <StatusIcon key={entry.key} entry={entry} />
                    ))}
                </div>
            ) : null}

            {children}
        </div>
    );
}
