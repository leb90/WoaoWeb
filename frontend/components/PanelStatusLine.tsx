"use client";

import React from "react";
import { usePerformanceReadout } from "../lib/performanceReadout";

// FPS, ping y los dos seguros en una línea de texto al pie del panel de la derecha (escritorio): sin recuadros, para
// que no ocupen lugar ni tapen el juego. En mobile se dibujan en el canvas.

const ON_TONE = "text-[#4ade80]";
const OFF_TONE = "text-[#ff5a4f]";

function pingTone(pingMs: number | null): string {
    if (pingMs === null) return "text-stone-400";
    if (pingMs < 120) return ON_TONE;
    if (pingMs < 250) return "text-amber-300";
    return OFF_TONE;
}

function Item({ label, value, tone, testId }: { label: string; value: string; tone: string; testId: string }) {
    return (
        <span data-testid={testId} className="whitespace-nowrap">
            <span className="text-[#bfa982]">{label}</span> <span className={`tabular-nums ${tone}`}>{value}</span>
        </span>
    );
}

// Seguro y Clan se activan o desactivan con un clic (igual que con sus teclas).
function ToggleItem({
    label,
    value,
    tone,
    testId,
    title,
    onClick,
}: {
    label: string;
    value: string;
    tone: string;
    testId: string;
    title: string;
    onClick?: () => void;
}) {
    if (!onClick) {
        return <Item testId={testId} label={label} value={value} tone={tone} />;
    }

    return (
        <button
            type="button"
            data-testid={testId}
            title={title}
            aria-label={title}
            // Sin foco después del clic: así Espacio o Enter siguen yendo al juego y no repiten el cambio.
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClick}
            className="-mx-1 -my-0.5 cursor-pointer whitespace-nowrap rounded-sm px-1 py-0.5 uppercase transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-amber-300"
        >
            <span className="text-[#bfa982]">{label}</span> <span className={`tabular-nums ${tone}`}>{value}</span>
        </button>
    );
}

export default function PanelStatusLine({
    seguro,
    seguroClan,
    hasClan,
    className,
    onToggleSeguro,
    onToggleClanSeguro,
}: {
    seguro: boolean;
    seguroClan: boolean;
    hasClan: boolean;
    className?: string;
    onToggleSeguro?: () => void;
    onToggleClanSeguro?: () => void;
}) {
    const { fps, pingMs } = usePerformanceReadout();

    return (
        <div
            data-testid="panel-status-line"
            className={`flex select-none items-center justify-between gap-2 text-[10px] font-bold uppercase leading-none tracking-[0.05em] ${className ?? ""}`}
        >
            <Item testId="status-fps" label="FPS" value={fps === null ? "--" : String(fps)} tone="text-stone-100" />
            <Item testId="status-ping" label="Ping" value={pingMs === null ? "-- ms" : `${pingMs} ms`} tone={pingTone(pingMs)} />
            <ToggleItem
                testId="status-seguro"
                label="Seguro"
                value={seguro ? "ON" : "OFF"}
                tone={seguro ? ON_TONE : OFF_TONE}
                title={seguro ? "Desactivar seguro" : "Activar seguro"}
                onClick={onToggleSeguro}
            />
            <ToggleItem
                testId="status-clan"
                label="Clan"
                value={hasClan ? (seguroClan ? "ON" : "OFF") : "—"}
                tone={hasClan ? (seguroClan ? ON_TONE : OFF_TONE) : "text-stone-500"}
                title={seguroClan ? "Desactivar seguro de clan" : "Activar seguro de clan"}
                onClick={hasClan ? onToggleClanSeguro : undefined}
            />
        </div>
    );
}
