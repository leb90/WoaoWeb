"use client";

import React from "react";
import { usePerformanceReadout } from "../lib/performanceReadout";

// FPS, ping y los dos seguros como texto suelto arriba a la izquierda del render (escritorio): sin recuadro ni fondo,
// solo con sombra para que se lea sobre cualquier piso, así no tapan el juego. En mobile se dibujan en el canvas.

const ON_TONE = "text-[#4ade80]";
const OFF_TONE = "text-[#ff5a4f]";

function pingTone(pingMs: number | null): string {
    if (pingMs === null) return "text-stone-300";
    if (pingMs < 120) return ON_TONE;
    if (pingMs < 250) return "text-amber-300";
    return OFF_TONE;
}

function Item({ label, value, tone, testId }: { label: string; value: string; tone: string; testId: string }) {
    return (
        <span data-testid={testId} className="whitespace-nowrap">
            <span className="text-[#f1e6cf]/85">{label}</span> <span className={`tabular-nums ${tone}`}>{value}</span>
        </span>
    );
}

export default function GameStatusOverlay({
    seguro,
    seguroClan,
    hasClan,
    className,
}: {
    seguro: boolean;
    seguroClan: boolean;
    hasClan: boolean;
    className?: string;
}) {
    const { fps, pingMs } = usePerformanceReadout();

    return (
        <div
            data-testid="game-status-overlay"
            className={`pointer-events-none z-30 flex select-none flex-col gap-[1px] text-[11px] font-bold uppercase leading-[14px] tracking-[0.04em] [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_3px_rgba(0,0,0,0.9)] ${className ?? ""}`}
        >
            <div className="flex gap-3">
                <Item testId="overlay-fps" label="FPS" value={fps === null ? "--" : String(fps)} tone="text-white" />
                <Item testId="overlay-ping" label="Ping" value={pingMs === null ? "-- ms" : `${pingMs} ms`} tone={pingTone(pingMs)} />
            </div>
            <div className="flex gap-3">
                <Item testId="overlay-seguro" label="Seguro" value={seguro ? "ON" : "OFF"} tone={seguro ? ON_TONE : OFF_TONE} />
                {hasClan ? (
                    <Item testId="overlay-clan" label="Clan" value={seguroClan ? "ON" : "OFF"} tone={seguroClan ? ON_TONE : OFF_TONE} />
                ) : null}
            </div>
        </div>
    );
}
