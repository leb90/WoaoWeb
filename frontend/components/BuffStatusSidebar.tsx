"use client";

import React from "react";
import type { PlayerHudState, SkillsState } from "../lib/aowProtocol";
import type { RuntimeTimingConfig } from "../lib/runtime-config";
import { usePlayerStatusEntries } from "./playerStatusEntries";

export { getHiddenSkillDurationMs, OCULTARSE_SKILL_INDEX } from "./playerStatusEntries";

type BuffStatusSidebarProps = {
    hud: PlayerHudState | null;
    runtimeTiming: RuntimeTimingConfig;
    skillsState?: SkillsState | null;
};

function formatSecondsLabel(totalSeconds: number | null): string {
    if (totalSeconds === null) {
        return "";
    }

    const safeSeconds = Math.max(0, totalSeconds);
    const minutes = Math.floor(safeSeconds / 60);
    const seconds = safeSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// La columna de estados de mobile. En escritorio los estados van debajo del marco del personaje (PlayerUnitFrame).
export default function BuffStatusSidebar({
    hud,
    runtimeTiming,
    skillsState,
}: BuffStatusSidebarProps) {
    const entries = usePlayerStatusEntries({ hud, runtimeTiming, skillsState });

    if (!entries.length) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute left-2 top-2 z-20 flex flex-col gap-2 lg:-left-[72px] lg:top-0">
            {entries.map((entry) => {
                const Icon = entry.icon;
                return (
                    <div
                        key={entry.key}
                        className="relative h-[60px] w-[60px] rounded-[18px] border border-white/10 bg-stone-950/95 p-[4px] shadow-[0_18px_36px_rgba(0,0,0,0.38)]"
                    >
                        <div className="absolute inset-[4px] overflow-hidden rounded-[14px] bg-stone-900/95">
                            {entry.iconSrc ? (
                                <img
                                    src={entry.iconSrc}
                                    alt=""
                                    className="h-full w-full object-cover opacity-75"
                                    draggable={false}
                                />
                            ) : (
                                <Icon className={`absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 ${entry.tone}`} />
                            )}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_52%),linear-gradient(180deg,rgba(12,10,9,0.12),rgba(12,10,9,0.8))]" />
                            <div
                                className="absolute inset-x-0 top-0 px-1.5 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em]"
                                style={{ color: entry.accent }}
                            >
                                {entry.label}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 px-1.5 pb-1 text-center text-[11px] font-semibold text-stone-50 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                                {formatSecondsLabel(entry.seconds)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
