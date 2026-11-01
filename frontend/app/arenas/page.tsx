"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    Bot,
    Crown,
    Flame,
    HeartPulse,
    Shield,
    Skull,
    Swords,
    Target,
    Trophy,
    Users,
} from "lucide-react";
import CharacterSpritePreview from "@/components/CharacterSpritePreview";
import { formatNumber } from "@/lib/number-format";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import {
    ARENA_CLASSES,
    getArenaClassOption,
    type ArenaOverviewResponse,
} from "../../lib/arenas";

const SELECTED_CLASS_STORAGE_KEY = "woao.arena.clase";
const SELECTED_BOT_STORAGE_KEY = "woao.arena.claseBot";
const OVERVIEW_REFRESH_MS = 15_000;
const PREVIEW_DIRECTIONS = ["2", "3", "1", "4"] as const;

const RULES = [
    {
        icon: Shield,
        title: "Nivel 50, equipo completo",
        text: "Cada clase entra con su mejor raza, su set y sus hechizos.",
    },
    {
        icon: Swords,
        title: "Todos contra todos",
        text: "Sin zona segura, sin clanes ni facciones.",
    },
    {
        icon: Flame,
        title: "Subís en el ranking",
        text: "Cada muerte te da 10 puntos y la mitad de los de tu víctima.",
    },
    {
        icon: HeartPulse,
        title: "Revivís solo",
        text: "A los 5 segundos, en otro lugar. No se pierde nada.",
    },
];

const PODIUM_COLORS = ["text-amber-300", "text-stone-200", "text-orange-300"];

function readStoredClass(key: string): number {
    try {
        const stored = Number(window.localStorage.getItem(key));
        return getArenaClassOption(stored) ? stored : ARENA_CLASSES[0].idClase;
    } catch {
        return ARENA_CLASSES[0].idClase;
    }
}

function storeClass(key: string, idClase: number) {
    try {
        window.localStorage.setItem(key, String(idClase));
    } catch {
        // Sin almacenamiento la elección dura hasta recargar.
    }
}

// "2026-11-01T…" → "1/11", sin depender del idioma del navegador.
function formatShortDate(iso: string) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
        ? ""
        : `${date.getDate()}/${date.getMonth() + 1}`;
}

export default function ArenasPage() {
    const router = useRouter();
    const { session } = useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });
    const [selectedClassId, setSelectedClassId] = useState<number>(
        ARENA_CLASSES[0].idClase,
    );
    const [botClassId, setBotClassId] = useState<number>(
        ARENA_CLASSES[0].idClase,
    );
    const [overview, setOverview] = useState<ArenaOverviewResponse | null>(
        null,
    );
    const [overviewError, setOverviewError] = useState(false);
    const [directionIndex, setDirectionIndex] = useState(0);
    const [entering, setEntering] = useState(false);

    const selectedClass = useMemo(
        () => getArenaClassOption(selectedClassId) ?? ARENA_CLASSES[0],
        [selectedClassId],
    );

    useEffect(() => {
        setSelectedClassId(readStoredClass(SELECTED_CLASS_STORAGE_KEY));
        setBotClassId(readStoredClass(SELECTED_BOT_STORAGE_KEY));
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await fetch("/api/arenas", {
                    cache: "no-store",
                });
                if (!response.ok) {
                    throw new Error("No se pudo cargar la arena");
                }
                const result = (await response.json()) as ArenaOverviewResponse;
                if (!cancelled) {
                    setOverview(result);
                    setOverviewError(false);
                }
            } catch {
                if (!cancelled) {
                    setOverviewError(true);
                }
            }
        };

        void load();
        const timer = window.setInterval(
            () => void load(),
            OVERVIEW_REFRESH_MS,
        );

        return () => {
            cancelled = true;
            window.clearInterval(timer);
        };
    }, []);

    // La vista previa gira sola para mostrar el equipo de todos los lados.
    useEffect(() => {
        const timer = window.setInterval(
            () =>
                setDirectionIndex(
                    (current) => (current + 1) % PREVIEW_DIRECTIONS.length,
                ),
            1600,
        );
        return () => window.clearInterval(timer);
    }, []);

    const selectClass = (idClase: number) => {
        setSelectedClassId(idClase);
        storeClass(SELECTED_CLASS_STORAGE_KEY, idClase);
    };

    const selectBotClass = (idClase: number) => {
        setBotClassId(idClase);
        storeClass(SELECTED_BOT_STORAGE_KEY, idClase);
    };

    const enterArena = () => {
        setEntering(true);
        router.push(`/play?mode=arena&clase=${selectedClass.idClase}`);
    };

    const enterTraining = () => {
        setEntering(true);
        router.push(
            `/play?mode=arena&clase=${selectedClass.idClase}&bot=${botClassId}`,
        );
    };

    const live = overview?.enVivo;
    const ranking = overview?.ranking ?? [];
    const trainingRanking = overview?.entrenamiento ?? [];

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] px-4 py-10 text-stone-100">
            <div className="mx-auto max-w-6xl space-y-6">
                <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3 text-amber-300">
                            <Swords className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-semibold text-white md:text-4xl">
                                Arena
                            </h1>
                            <p className="mt-1 max-w-xl text-sm text-stone-400">
                                Elegí una clase y entrá a pelear contra todos,
                                o entrená uno contra uno con un bot. No hay
                                niveles que subir: se sube en el ranking.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start rounded-2xl border border-white/8 bg-stone-950/80 px-4 py-2 text-sm md:self-auto">
                        <Users className="h-4 w-4 text-emerald-300" />
                        <span className="text-stone-300">
                            Ahora en la arena:
                        </span>
                        <span className="font-semibold text-white tabular-nums">
                            {live ? formatNumber(live.jugadores) : "—"}
                        </span>
                    </div>
                </section>

                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {RULES.map(({ icon: Icon, title, text }) => (
                        <div
                            key={title}
                            className="rounded-2xl border border-white/8 bg-stone-950/70 p-4"
                        >
                            <div className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                                <Icon className="h-4 w-4 text-amber-300" />
                                {title}
                            </div>
                            <p className="mt-1.5 text-xs leading-5 text-stone-400">
                                {text}
                            </p>
                        </div>
                    ))}
                </section>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="rounded-[28px] border border-white/8 bg-stone-950/80 p-5 shadow-2xl backdrop-blur-md">
                        <h2 className="text-xl font-semibold text-white">
                            Elegí tu clase
                        </h2>
                        <p className="mt-1 text-sm text-stone-400">
                            Cada una va con la raza que mejor le rinde y con
                            todo su equipo puesto.
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {ARENA_CLASSES.map((option) => {
                                const active =
                                    option.idClase === selectedClass.idClase;
                                return (
                                    <button
                                        key={option.idClase}
                                        type="button"
                                        onClick={() =>
                                            selectClass(option.idClase)
                                        }
                                        aria-pressed={active}
                                        className={`rounded-2xl border p-3 text-left transition ${
                                            active
                                                ? "border-amber-300/60 bg-amber-300/10"
                                                : "border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                                        }`}
                                    >
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span
                                                className={`text-base font-semibold ${
                                                    active
                                                        ? "text-amber-100"
                                                        : "text-white"
                                                }`}
                                            >
                                                {option.nombre}
                                            </span>
                                            <span className="text-xs text-stone-400">
                                                {option.raza}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-xs text-stone-300">
                                            {option.equipo}
                                        </p>
                                        <p className="mt-1 text-xs text-stone-500">
                                            {option.destacado}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <section className="rounded-[28px] border border-amber-300/20 bg-stone-950/85 p-5 shadow-2xl backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <CharacterSpritePreview
                                    bodyId={selectedClass.look.bodyId}
                                    headId={selectedClass.look.headId}
                                    weaponId={selectedClass.look.weaponId}
                                    shieldId={selectedClass.look.shieldId}
                                    helmetId={selectedClass.look.helmetId}
                                    direction={
                                        PREVIEW_DIRECTIONS[directionIndex]
                                    }
                                    scale={1.3}
                                    className="shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-amber-200/75">
                                        Nivel 50
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold text-white">
                                        {selectedClass.nombre}
                                    </p>
                                    <p className="text-sm text-stone-300">
                                        {selectedClass.raza}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-stone-400">
                                {selectedClass.porQueRaza}
                            </p>

                            <button
                                type="button"
                                onClick={enterArena}
                                disabled={!session || entering}
                                className="mt-4 w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {entering ? "Entrando..." : "Entrar a la arena"}
                            </button>
                            <p className="mt-2 text-center text-xs text-stone-500">
                                {session
                                    ? `Vas a pelear como ${session.account.name}.`
                                    : "Cargando tu cuenta..."}
                            </p>
                        </section>

                        <section
                            aria-labelledby="entrenamiento-titulo"
                            className="rounded-[28px] border border-sky-300/20 bg-stone-950/85 p-5 shadow-2xl backdrop-blur-md"
                        >
                            <h2
                                id="entrenamiento-titulo"
                                className="flex items-center gap-2 text-lg font-semibold text-white"
                            >
                                <Bot className="h-4 w-4 text-sky-300" />
                                Entrenamiento contra el bot
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-stone-400">
                                Uno contra uno, solos. Cada vez que le ganás, el
                                bot sube de nivel y sumás puntos. Si te gana, tu
                                puntaje queda en el ranking y volvés al nivel 1.
                            </p>
                            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-sky-200/75">
                                Clase del bot
                            </p>
                            <div
                                role="radiogroup"
                                aria-label="Clase del bot"
                                className="mt-2 grid grid-cols-3 gap-1.5"
                            >
                                {ARENA_CLASSES.map((option) => {
                                    const active =
                                        option.idClase === botClassId;
                                    return (
                                        <button
                                            key={option.idClase}
                                            type="button"
                                            role="radio"
                                            aria-checked={active}
                                            onClick={() =>
                                                selectBotClass(option.idClase)
                                            }
                                            className={`truncate rounded-xl border px-2 py-1.5 text-xs font-medium transition ${
                                                active
                                                    ? "border-sky-300/60 bg-sky-300/15 text-sky-100"
                                                    : "border-white/8 bg-white/[0.03] text-stone-300 hover:border-white/20 hover:bg-white/[0.06]"
                                            }`}
                                        >
                                            {option.nombre}
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={enterTraining}
                                disabled={!session || entering}
                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-300/40 bg-sky-300/10 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:bg-sky-300/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Target className="h-4 w-4" />
                                {entering
                                    ? "Entrando..."
                                    : `Entrenar: ${selectedClass.nombre} contra ${
                                          getArenaClassOption(botClassId)
                                              ?.nombre ?? "el bot"
                                      }`}
                            </button>
                        </section>

                        <section className="rounded-[28px] border border-white/8 bg-stone-950/80 p-5 shadow-2xl backdrop-blur-md">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                                <Crown className="h-4 w-4 text-amber-300" />
                                Top 3 en vivo
                            </h2>
                            {live && live.top.length > 0 ? (
                                <ol className="mt-3 space-y-1.5">
                                    {live.top
                                        .slice(0, 3)
                                        .map((entry, index) => (
                                            <li
                                                key={`${entry.nombre}-${index}`}
                                                className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2 text-sm"
                                            >
                                                <span
                                                    className={`w-4 font-black tabular-nums ${PODIUM_COLORS[index]}`}
                                                >
                                                    {index + 1}
                                                </span>
                                                <span className="min-w-0 flex-1 truncate text-white">
                                                    {entry.nombre}
                                                    <span className="ml-1.5 text-xs text-stone-500">
                                                        {getArenaClassOption(
                                                            entry.idClase,
                                                        )?.nombre ?? ""}
                                                    </span>
                                                </span>
                                                <span
                                                    className={`font-semibold tabular-nums ${PODIUM_COLORS[index]}`}
                                                >
                                                    {formatNumber(entry.puntos)}
                                                </span>
                                            </li>
                                        ))}
                                </ol>
                            ) : (
                                <p className="mt-3 text-sm text-stone-400">
                                    {overviewError
                                        ? "No se pudo cargar la arena."
                                        : live && live.jugadores > 0
                                          ? "Todavía nadie sumó puntos."
                                          : "No hay nadie peleando. Entrá primero."}
                                </p>
                            )}
                        </section>
                    </aside>
                </div>

                <section className="rounded-[28px] border border-white/8 bg-stone-950/80 p-5 shadow-2xl backdrop-blur-md md:p-6">
                    <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                        <Trophy className="h-5 w-5 text-amber-300" />
                        Salón de la fama
                    </h2>
                    <p className="mt-1 text-sm text-stone-400">
                        El mejor puntaje que llegó a tener cada cuenta en una
                        partida.
                    </p>

                    {ranking.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[480px] text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                                        <th className="px-3 py-2 font-medium">
                                            #
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                            Cuenta
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            Récord
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            Mejor racha
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            Kills
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            <Skull className="ml-auto h-3.5 w-3.5" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ranking.map((row, index) => (
                                        <tr
                                            key={row.nombre}
                                            className="border-t border-white/6"
                                        >
                                            <td
                                                className={`px-3 py-2 font-bold tabular-nums ${
                                                    PODIUM_COLORS[index] ??
                                                    "text-stone-400"
                                                }`}
                                            >
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 text-white">
                                                {row.nombre}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-amber-200 tabular-nums">
                                                {formatNumber(row.mejorPuntaje)}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums text-stone-300">
                                                {formatNumber(row.mejorRacha)}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums text-stone-300">
                                                {formatNumber(row.kills)}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums text-stone-500">
                                                {formatNumber(row.muertes)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-stone-400">
                            {overviewError
                                ? "No se pudo cargar el ranking."
                                : "Todavía no hay récords. El primero en entrar se lo lleva."}
                        </p>
                    )}
                </section>

                <section
                    aria-labelledby="ranking-bot-titulo"
                    className="rounded-[28px] border border-white/8 bg-stone-950/80 p-5 shadow-2xl backdrop-blur-md md:p-6"
                >
                    <h2
                        id="ranking-bot-titulo"
                        className="flex items-center gap-2 text-xl font-semibold text-white"
                    >
                        <Bot className="h-5 w-5 text-sky-300" />
                        Mejores contra el bot
                    </h2>
                    <p className="mt-1 text-sm text-stone-400">
                        La mejor racha de cada cuenta en el entrenamiento: los
                        puntos que sumó y a cuántos niveles del bot les ganó.
                    </p>

                    {trainingRanking.length > 0 ? (
                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[520px] text-sm">
                                <thead>
                                    <tr className="text-left text-xs uppercase tracking-[0.18em] text-stone-500">
                                        <th className="px-3 py-2 font-medium">
                                            #
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                            Cuenta
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            Puntaje
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            Niveles
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                            Pelea
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium">
                                            Fecha
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trainingRanking.map((row, index) => (
                                        <tr
                                            key={row.nombre}
                                            className="border-t border-white/6"
                                        >
                                            <td
                                                className={`px-3 py-2 font-bold tabular-nums ${
                                                    PODIUM_COLORS[index] ??
                                                    "text-stone-400"
                                                }`}
                                            >
                                                {index + 1}
                                            </td>
                                            <td className="px-3 py-2 text-white">
                                                {row.nombre}
                                            </td>
                                            <td className="px-3 py-2 text-right font-semibold text-sky-200 tabular-nums">
                                                {formatNumber(row.puntaje)}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums text-stone-300">
                                                {formatNumber(row.nivel)}
                                            </td>
                                            <td className="px-3 py-2 text-stone-300">
                                                {getArenaClassOption(
                                                    row.idClase,
                                                )?.nombre ?? "?"}
                                                <span className="text-stone-500">
                                                    {" contra "}
                                                </span>
                                                {getArenaClassOption(
                                                    row.idClaseBot,
                                                )?.nombre ?? "?"}
                                            </td>
                                            <td className="px-3 py-2 text-right tabular-nums text-stone-500">
                                                {formatShortDate(row.fecha)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="mt-4 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-stone-400">
                            {overviewError
                                ? "No se pudo cargar el ranking."
                                : "Nadie entrenó todavía. Elegí la clase del bot y empezá la lista."}
                        </p>
                    )}
                </section>
            </div>
        </main>
    );
}
