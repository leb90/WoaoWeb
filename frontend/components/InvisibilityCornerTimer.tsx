"use client";

import React from "react";
import { EyeOff } from "lucide-react";
import type { PlayerHudState, SkillsState } from "../lib/aowProtocol";
import type { RuntimeTimingConfig } from "../lib/runtime-config";
import { getHiddenSkillDurationMs, OCULTARSE_SKILL_INDEX } from "./BuffStatusSidebar";

type Props = {
    hud: PlayerHudState | null;
    runtimeTiming: RuntimeTimingConfig;
    skillsState?: SkillsState | null;
    className?: string;
    style?: React.CSSProperties;
};

function formatRemaining(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Tiempo que le queda al propio jugador invisible (hechizo) u oculto (skill), en una esquina del render.
 * El vencimiento del hechizo lo manda el server; el de Ocultarse se estima con la misma fórmula.
 */
export default function InvisibilityCornerTimer({ hud, runtimeTiming, skillsState, className, style }: Props) {
    const invisible = Boolean(hud?.invisibleSpell);
    const hidden = !invisible && Boolean(hud?.hiddenSkill);
    const [hiddenStartedAt, setHiddenStartedAt] = React.useState(0);
    const [now, setNow] = React.useState(() => Date.now());

    // Ocultarse: el contador arranca cuando el flag pasa de apagado a prendido.
    React.useEffect(() => {
        setHiddenStartedAt(hidden ? Date.now() : 0);
    }, [hidden]);

    React.useEffect(() => {
        if (!invisible && !hidden) return;
        const timer = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(timer);
    }, [invisible, hidden]);

    if (!hud || (!invisible && !hidden)) {
        return null;
    }

    let totalMs: number;
    let expiresAt: number;
    if (invisible) {
        totalMs = Math.max(1, runtimeTiming.statusDurations.invisibilitySpellMs);
        const reported = Number(hud.invisibleSpellRemainingMs ?? 0);
        const updatedAt = Number(hud.invisibleSpellUpdatedAt ?? 0);
        expiresAt = reported > 0 && updatedAt > 0 ? updatedAt + reported : now;
    } else {
        totalMs = getHiddenSkillDurationMs(
            Math.min(100, Number(skillsState?.values?.[OCULTARSE_SKILL_INDEX] ?? 0)),
            hud.idClase,
        );
        expiresAt = (hiddenStartedAt || now) + totalMs;
    }
    const remainingMs = Math.max(0, expiresAt - now);
    const progress = Math.max(0, Math.min(1, remainingMs / totalMs));
    const label = invisible ? "Invisible" : "Oculto";

    return (
        <div
            data-invisibility-timer={invisible ? "invisible" : "oculto"}
            className={`pointer-events-none z-30 min-w-[132px] rounded-md border border-violet-300/25 bg-stone-950/78 px-2.5 py-1.5 text-[11px] leading-none text-violet-100 shadow-xl backdrop-blur-sm ${className ?? ""}`}
            style={style}
        >
            <div className="flex items-center gap-1.5">
                <EyeOff className="h-3.5 w-3.5 shrink-0 text-violet-300" />
                <span className="font-semibold uppercase tracking-[0.14em]">{label}</span>
                <span className="ml-auto font-mono tabular-nums text-violet-50">{formatRemaining(remainingMs)}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-violet-950/80">
                <div className="h-full rounded-full bg-violet-400 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
            </div>
        </div>
    );
}
