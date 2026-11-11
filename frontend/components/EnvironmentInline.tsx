"use client";

import React from "react";
import {
    CloudFog,
    CloudLightning,
    CloudRain,
    Flower2,
    Leaf,
    Moon,
    Snowflake,
    Sun,
    Sunrise,
    Sunset,
    Thermometer,
    type LucideIcon,
} from "lucide-react";
import { DAY_PHASE, SEASON, WEATHER, type EnvironmentState } from "../lib/aowProtocol";

const SEASON_LABELS: Record<number, string> = {
    [SEASON.verano]: "Verano",
    [SEASON.otono]: "Otoño",
    [SEASON.invierno]: "Invierno",
    [SEASON.primavera]: "Primavera",
};

const DAY_PHASE_LABELS: Record<number, string> = {
    [DAY_PHASE.manana]: "Mañana",
    [DAY_PHASE.mediodia]: "Mediodía",
    [DAY_PHASE.tarde]: "Tarde",
    [DAY_PHASE.noche]: "Noche",
};

const WEATHER_LABELS: Record<number, string> = {
    [WEATHER.despejado]: "Despejado",
    [WEATHER.lluvia]: "Lluvia",
    [WEATHER.tormenta]: "Tormenta",
    [WEATHER.nieve]: "Nieve",
    [WEATHER.niebla]: "Niebla",
};

const SEASON_ICONS: Record<number, LucideIcon> = {
    [SEASON.verano]: Sun,
    [SEASON.otono]: Leaf,
    [SEASON.invierno]: Snowflake,
    [SEASON.primavera]: Flower2,
};

const DAY_PHASE_ICONS: Record<number, LucideIcon> = {
    [DAY_PHASE.manana]: Sunrise,
    [DAY_PHASE.mediodia]: Sun,
    [DAY_PHASE.tarde]: Sunset,
    [DAY_PHASE.noche]: Moon,
};

const WEATHER_ICONS: Record<number, LucideIcon> = {
    [WEATHER.despejado]: Sun,
    [WEATHER.lluvia]: CloudRain,
    [WEATHER.tormenta]: CloudLightning,
    [WEATHER.nieve]: Snowflake,
    [WEATHER.niebla]: CloudFog,
};

type EnvironmentChip = {
    key: string;
    kind: string;
    icon: LucideIcon | undefined;
    label: string | undefined;
};

function getEnvironmentChips(environment: EnvironmentState) {
    const chips: EnvironmentChip[] = [
        { key: "season", kind: "Estación", icon: SEASON_ICONS[environment.season], label: SEASON_LABELS[environment.season] },
        { key: "phase", kind: "Momento del día", icon: DAY_PHASE_ICONS[environment.dayPhase], label: DAY_PHASE_LABELS[environment.dayPhase] },
        { key: "weather", kind: "Clima", icon: WEATHER_ICONS[environment.weather], label: WEATHER_LABELS[environment.weather] },
        { key: "temperature", kind: "Temperatura", icon: Thermometer, label: `${environment.temperatureC}°C` },
    ];
    return chips.filter(
        (chip): chip is EnvironmentChip & { icon: LucideIcon; label: string } =>
            chip.icon !== undefined && Boolean(chip.label),
    );
}

// Estación, momento del día, clima y temperatura en una sola línea, sin recuadros propios: va en el recuadro de
// coordenadas de abajo a la derecha del render (escritorio), así no ocupa lugar en el panel. La estación y el momento
// del día solo con su ícono; el clima y la temperatura, con texto. Al pasar el mouse cada uno dice qué es
// ("Estación: Primavera").
const ENVIRONMENT_KEYS_WITH_TEXT = new Set(["weather", "temperature"]);

export default function EnvironmentInline({ environment, className }: { environment: EnvironmentState; className?: string }) {
    const chips = getEnvironmentChips(environment);
    return (
        <div data-environment-chips="true" className={`flex shrink-0 items-center gap-[7px] ${className ?? ""}`}>
            {chips.map(({ key, kind, icon: Icon, label }) => (
                <span
                    key={key}
                    data-environment-chip={key}
                    aria-label={`${kind}: ${label}`}
                    className="group pointer-events-auto relative flex cursor-help items-center gap-[3px] whitespace-nowrap leading-none transition-colors hover:text-amber-50"
                >
                    <Icon className="h-[12px] w-[12px] shrink-0 text-[#e0bd78]" aria-hidden="true" />
                    {ENVIRONMENT_KEYS_WITH_TEXT.has(key) ? <span>{label}</span> : null}
                    <span
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 whitespace-nowrap rounded border border-[#6b5636] bg-stone-950/95 px-1.5 py-1 font-sans text-[10px] font-semibold normal-case tracking-normal text-amber-50 opacity-0 shadow-lg transition-opacity duration-100 group-hover:opacity-100"
                    >
                        <span className="text-[#c9a86a]">{kind}:</span> {label}
                    </span>
                </span>
            ))}
        </div>
    );
}

