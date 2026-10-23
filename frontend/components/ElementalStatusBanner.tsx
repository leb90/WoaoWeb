"use client";

import React from "react";
import { Droplets, Flame, Snail, Wind, Zap } from "lucide-react";
import type { ElementalEntityState } from "@/lib/elementalState";

type Props = {
    state?: ElementalEntityState;
    dead?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

type Line = {
    key: string;
    label: string;
    until?: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    glow: string;
};

/**
 * Carteles de los efectos del chamán sobre el propio personaje (server/src/elementalEffects.ts), con la cuenta
 * regresiva que late como la del desangrado: Silenciado (Rayo Eléctrico y Prisión de agua), Sin magia (Ráfaga de
 * viento), Ralentizado (Descarga eléctrica) y la quemadura del Rayo de Fuego, que dura hasta que te curás.
 */
export default function ElementalStatusBanner({ state, dead, className, style }: Props) {
    const tracking = Boolean(state) && !dead;
    const [now, setNow] = React.useState(0);

    React.useEffect(() => {
        if (!tracking) return;
        const tick = () => setNow(Date.now());
        tick();
        const timer = window.setInterval(tick, 100);
        return () => window.clearInterval(timer);
    }, [tracking, state]);

    if (!tracking || !state || now <= 0) {
        return null;
    }

    const lines: Line[] = [];
    if (state.fullSilenceUntil > now) {
        lines.push(
            state.silenceKind === "rayo"
                ? { key: "silence", label: "Silenciado", until: state.fullSilenceUntil, icon: Zap, color: "#c4b5fd", glow: "rgba(139, 92, 246, 0.9)" }
                : { key: "silence", label: "Silenciado", until: state.fullSilenceUntil, icon: Droplets, color: "#93c5fd", glow: "rgba(59, 130, 246, 0.9)" },
        );
    } else if (state.magicSilenceUntil > now) {
        lines.push({ key: "nomagic", label: "Sin magia", until: state.magicSilenceUntil, icon: Wind, color: "#a5f3fc", glow: "rgba(34, 211, 238, 0.85)" });
    }
    if (state.slowUntil > now) {
        lines.push({ key: "slow", label: "Ralentizado", until: state.slowUntil, icon: Snail, color: "#bae6fd", glow: "rgba(56, 189, 248, 0.85)" });
    }
    if (state.burning) {
        lines.push({ key: "burn", label: "Te estás quemando", icon: Flame, color: "#fdba74", glow: "rgba(249, 115, 22, 0.9)" });
    }

    if (!lines.length) {
        return null;
    }

    return (
        <div
            data-elemental-banner="true"
            role="alert"
            className={`pointer-events-none z-40 flex flex-col items-center gap-1 ${className ?? ""}`}
            style={style}
        >
            {lines.map((line) => {
                const Icon = line.icon;
                // Redondeado, como el desangrado: llega a 0 en el último medio segundo.
                const seconds = line.until ? Math.round(Math.max(0, line.until - now) / 1000) : null;
                return (
                    <div
                        key={line.key}
                        data-elemental-line={line.key}
                        className="elemental-banner-text flex items-center gap-3"
                        style={{ color: line.color, ["--elemental-glow" as string]: line.glow }}
                    >
                        <Icon className="h-5 w-5 shrink-0 drop-shadow-[0_2px_2px_rgba(0,0,0,0.95)]" aria-hidden />
                        <span className="text-base font-black uppercase tracking-[0.18em]">{line.label}</span>
                        {seconds !== null ? (
                            <span
                                key={seconds}
                                data-elemental-seconds={seconds}
                                className="elemental-pulse min-w-[2ch] text-center font-mono text-3xl font-black tabular-nums"
                            >
                                {seconds}
                            </span>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
