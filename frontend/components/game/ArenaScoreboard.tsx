"use client";

import { useEffect, useState } from "react";
import { Bot, Skull } from "lucide-react";
import { formatNumber } from "@/lib/number-format";
import { getArenaClassOption } from "@/lib/arenas";
import type { ArenaStatePayload, ArenaTrainingState } from "@/lib/aowProtocol";

type ArenaScoreboardProps = {
    state: ArenaStatePayload & { receivedAt: number };
    dead: boolean;
    // En mobile, arriba a la derecha están los botones de chat, ajustes y meditar: el Top 3 va arriba al centro y
    // fijo a la pantalla, junto al HUD de mobile (el lienzo del mapa es más grande que la pantalla).
    isMobile?: boolean;
};

// Alto de la lista (Top 3 y tu puesto), para correr los avisos de arriba a la derecha.
export const ARENA_SCOREBOARD_HEIGHT = 88;

// Top 3 de la partida, como en los .io: una lista chica de texto, sin caja, para tapar lo menos posible.
export function ArenaScoreboard({
    state,
    dead,
    isMobile = false,
}: ArenaScoreboardProps) {
    if (state.entrenamiento) {
        return (
            <TrainingScoreboard
                state={state}
                training={state.entrenamiento}
                dead={dead}
                isMobile={isMobile}
            />
        );
    }

    const mine = state.yo;
    const mineInTop = mine ? mine.puesto <= state.top.length : false;

    return (
        <>
            <ol
                aria-label="Top de la arena"
                className={`pointer-events-none z-30 min-w-[110px] select-none font-semibold text-stone-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] ${
                    isMobile
                        ? "fixed left-1/2 top-2 z-40 -translate-x-1/2 text-[11px] leading-[15px]"
                        : "absolute right-3 top-3 text-xs leading-[18px]"
                }`}
            >
                {state.top.map((entry, index) => (
                    <li
                        key={`${entry.nombre}-${index}`}
                        className={`flex gap-2 ${
                            mine?.puesto === index + 1 ? "text-amber-300" : ""
                        }`}
                    >
                        <span className="max-w-[140px] truncate">
                            {index + 1}. {entry.nombre}
                        </span>
                        <span className="ml-auto tabular-nums">
                            {formatNumber(entry.puntos)}
                        </span>
                    </li>
                ))}
                {mine && !mineInTop ? (
                    <li className="flex gap-2 text-sky-300">
                        <span>{mine.puesto}. Vos</span>
                        <span className="ml-auto tabular-nums">
                            {formatNumber(mine.puntos)}
                        </span>
                    </li>
                ) : null}
            </ol>

            {dead ? (
                <ArenaReviveBanner state={state} isMobile={isMobile} />
            ) : null}
        </>
    );
}

function ArenaReviveBanner({
    state,
    isMobile,
}: {
    state: ArenaStatePayload & { receivedAt: number };
    isMobile: boolean;
}) {
    const reviveAt = state.receivedAt + state.reviveEn;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(timer);
    }, []);

    const seconds = Math.max(0, Math.ceil((reviveAt - now) / 1000));
    const death = state.muerte;

    return (
        <div
            className={`pointer-events-none ${isMobile ? "fixed" : "absolute"} left-1/2 top-1/3 z-40 -translate-x-1/2 rounded-xl border border-red-300/25 bg-stone-950/85 px-5 py-3 text-center font-serif shadow-2xl backdrop-blur-md`}
        >
            <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.26em] text-red-300/85">
                <Skull className="h-3.5 w-3.5" />
                {death?.asesino ? `Te mató ${death.asesino}` : "Moriste"}
            </div>
            <div className="mt-1 text-lg font-semibold text-stone-100">
                {seconds > 0 ? `Revivís en ${seconds}` : "Reviviendo…"}
            </div>
            {death && death.perdidos > 0 ? (
                <div className="mt-0.5 text-xs text-stone-400">
                    Perdiste {formatNumber(death.perdidos)} puntos.
                </div>
            ) : null}
        </div>
    );
}

function useNow(intervalMs = 250) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
        return () => window.clearInterval(timer);
    }, [intervalMs]);

    return now;
}

// Entrenamiento contra el bot: nivel, puntaje y récord en texto chico (como el Top 3), y en el centro la cuenta
// regresiva de cada ronda, lo que sumaste al ganarle y el cartel de cuando te gana.
function TrainingScoreboard({
    state,
    training,
    dead,
    isMobile,
}: {
    state: ArenaStatePayload & { receivedAt: number };
    training: ArenaTrainingState;
    dead: boolean;
    isMobile: boolean;
}) {
    const now = useNow();
    const botName = getArenaClassOption(training.idClaseBot)?.nombre ?? "Bot";
    const startsIn = Math.max(
        0,
        Math.ceil((state.receivedAt + training.empiezaEn - now) / 1000),
    );
    const sinceStart = now - (state.receivedAt + training.empiezaEn);
    const position = isMobile ? "fixed" : "absolute";

    let banner: { title: string; detail?: string; tone: string } | null = null;
    if (training.estado === "peleando" && startsIn > 0) {
        banner = {
            title: `Nivel ${training.nivel}`,
            detail: `${botName} · empieza en ${startsIn}`,
            tone: "text-sky-200",
        };
    } else if (training.estado === "peleando" && sinceStart < 900) {
        banner = { title: "¡A pelear!", tone: "text-amber-200" };
    } else if (training.estado === "entreRondas" && training.ultimo) {
        banner = {
            title: `¡Le ganaste al nivel ${training.ultimo.nivel}!`,
            detail: `+${formatNumber(training.ultimo.puntos)} puntos · sigue el nivel ${training.nivel}`,
            tone: "text-emerald-200",
        };
    }

    return (
        <>
            <ol
                aria-label="Entrenamiento"
                className={`pointer-events-none z-30 min-w-[120px] select-none font-semibold text-stone-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] ${
                    isMobile
                        ? "fixed left-1/2 top-2 z-40 -translate-x-1/2 text-[11px] leading-[15px]"
                        : "absolute right-3 top-3 text-xs leading-[18px]"
                }`}
            >
                <li className="flex items-center gap-1.5 text-sky-300">
                    <Bot className="h-3.5 w-3.5" />
                    <span>Bot {botName}</span>
                </li>
                <li className="flex gap-2">
                    <span>Nivel</span>
                    <span className="ml-auto tabular-nums">{training.nivel}</span>
                </li>
                <li className="flex gap-2 text-amber-300">
                    <span>Puntaje</span>
                    <span className="ml-auto tabular-nums">
                        {formatNumber(training.puntaje)}
                    </span>
                </li>
                <li className="flex gap-2 text-stone-300">
                    <span>Récord</span>
                    <span className="ml-auto tabular-nums">
                        {formatNumber(training.record)}
                    </span>
                </li>
            </ol>

            {banner && !dead ? (
                <div
                    role="status"
                    className={`pointer-events-none ${position} left-1/2 top-1/4 z-40 -translate-x-1/2 text-center font-serif [text-shadow:0_2px_6px_rgba(0,0,0,0.95)]`}
                >
                    <div className={`text-3xl font-semibold ${banner.tone}`}>
                        {banner.title}
                    </div>
                    {banner.detail ? (
                        <div className="mt-1 text-sm text-stone-200">
                            {banner.detail}
                        </div>
                    ) : null}
                </div>
            ) : null}

            {dead ? (
                <TrainingDefeatBanner
                    state={state}
                    training={training}
                    botName={botName}
                    now={now}
                    position={position}
                />
            ) : null}
        </>
    );
}

function TrainingDefeatBanner({
    state,
    training,
    botName,
    now,
    position,
}: {
    state: ArenaStatePayload & { receivedAt: number };
    training: ArenaTrainingState;
    botName: string;
    now: number;
    position: "fixed" | "absolute";
}) {
    const seconds = Math.max(
        0,
        Math.ceil((state.receivedAt + state.reviveEn - now) / 1000),
    );
    const level = training.ultimo?.nivel ?? training.nivel;
    const newRecord =
        training.puntaje > 0 && training.puntaje >= training.record;

    return (
        <div
            role="status"
            className={`pointer-events-none ${position} left-1/2 top-1/3 z-40 -translate-x-1/2 rounded-xl border border-red-300/25 bg-stone-950/85 px-5 py-3 text-center font-serif shadow-2xl backdrop-blur-md`}
        >
            <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.26em] text-red-300/85">
                <Skull className="h-3.5 w-3.5" />
                Te ganó el {botName} nivel {level}
            </div>
            <div className="mt-1 text-lg font-semibold text-stone-100">
                {formatNumber(training.puntaje)} puntos
                {newRecord ? (
                    <span className="ml-2 text-sm text-amber-300">¡Récord!</span>
                ) : null}
            </div>
            <div className="mt-0.5 text-xs text-stone-400">
                Le ganaste a {training.ganados}{" "}
                {training.ganados === 1 ? "nivel" : "niveles"} ·{" "}
                {seconds > 0 ? `Volvés al nivel 1 en ${seconds}` : "Volviendo…"}
            </div>
        </div>
    );
}
