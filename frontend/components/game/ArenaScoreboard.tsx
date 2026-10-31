"use client";

import { useEffect, useState } from "react";
import { Crown, Skull, Swords } from "lucide-react";
import { formatNumber } from "@/lib/number-format";
import { getArenaClassOption } from "@/lib/arenas";
import type { ArenaStatePayload } from "@/lib/aowProtocol";

type ArenaScoreboardProps = {
    state: ArenaStatePayload & { receivedAt: number };
    dead: boolean;
};

// Alto del cartel, para correr los avisos de arriba a la derecha.
export const ARENA_SCOREBOARD_HEIGHT = 176;

const PODIUM_COLORS = ["text-amber-300", "text-stone-200", "text-orange-300"];

// Top 3 de la partida, como en los .io: arriba a la derecha y siempre a la vista.
export function ArenaScoreboard({ state, dead }: ArenaScoreboardProps) {
    const mine = state.yo;
    const mineInTop = mine ? mine.puesto <= state.top.length : false;

    return (
        <>
            <div className="pointer-events-none absolute right-3 top-3 z-30 w-[220px] select-none">
                <div className="rounded-xl border border-amber-200/20 bg-stone-950/82 px-3 py-2 font-serif shadow-2xl backdrop-blur-md">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-amber-200/80">
                        <span className="flex items-center gap-1.5">
                            <Swords className="h-3 w-3" />
                            Arena
                        </span>
                        <span className="tracking-[0.14em] text-stone-400">
                            {state.jugadores === 1
                                ? "1 jugador"
                                : `${formatNumber(state.jugadores)} jugadores`}
                        </span>
                    </div>

                    <ol className="mt-1.5 space-y-0.5">
                        {state.top.map((entry, index) => {
                            const isMe = mine?.puesto === index + 1;
                            return (
                                <li
                                    key={`${entry.nombre}-${index}`}
                                    className={`flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm ${
                                        isMe ? "bg-amber-300/15" : ""
                                    }`}
                                >
                                    <span
                                        className={`w-4 text-center font-black tabular-nums ${PODIUM_COLORS[index]}`}
                                    >
                                        {index === 0 ? (
                                            <Crown className="mx-auto h-3.5 w-3.5" />
                                        ) : (
                                            index + 1
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1 truncate text-stone-100">
                                        {entry.nombre}
                                        <span className="ml-1 text-[10px] text-stone-500">
                                            {getArenaClassOption(entry.idClase)
                                                ?.nombre ?? ""}
                                        </span>
                                    </span>
                                    <span
                                        className={`font-bold tabular-nums ${PODIUM_COLORS[index]}`}
                                    >
                                        {formatNumber(entry.puntos)}
                                    </span>
                                </li>
                            );
                        })}
                        {state.top.length === 0 ? (
                            <li className="px-1.5 py-0.5 text-xs text-stone-400">
                                Todavía nadie sumó puntos.
                            </li>
                        ) : null}
                    </ol>

                    {mine && !mineInTop ? (
                        <div className="mt-1 flex items-center gap-1.5 border-t border-white/8 px-1.5 pt-1 text-sm">
                            <span className="w-4 text-center text-xs font-bold tabular-nums text-sky-300">
                                {mine.puesto}
                            </span>
                            <span className="flex-1 text-sky-200">Vos</span>
                            <span className="font-bold tabular-nums text-sky-200">
                                {formatNumber(mine.puntos)}
                            </span>
                        </div>
                    ) : null}

                    {mine ? (
                        <div className="mt-1 flex justify-between px-1.5 text-[11px] text-stone-400">
                            <span>{formatNumber(mine.kills)} kills</span>
                            <span>{formatNumber(mine.muertes)} muertes</span>
                            <span>racha {formatNumber(mine.racha)}</span>
                        </div>
                    ) : null}
                </div>
            </div>

            {dead ? <ArenaReviveBanner state={state} /> : null}
        </>
    );
}

function ArenaReviveBanner({
    state,
}: {
    state: ArenaStatePayload & { receivedAt: number };
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
        <div className="pointer-events-none absolute left-1/2 top-1/3 z-40 -translate-x-1/2 rounded-xl border border-red-300/25 bg-stone-950/85 px-5 py-3 text-center font-serif shadow-2xl backdrop-blur-md">
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
