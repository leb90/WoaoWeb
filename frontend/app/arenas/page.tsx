"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
    Crown,
    Flame,
    HeartPulse,
    Shield,
    Skull,
    Swords,
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

function readStoredClass(): number {
    try {
        const stored = Number(
            window.localStorage.getItem(SELECTED_CLASS_STORAGE_KEY),
        );
        return getArenaClassOption(stored) ? stored : ARENA_CLASSES[0].idClase;
    } catch {
        return ARENA_CLASSES[0].idClase;
    }
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
        setSelectedClassId(readStoredClass());
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
        try {
            window.localStorage.setItem(
                SELECTED_CLASS_STORAGE_KEY,
                String(idClase),
            );
        } catch {
            // Sin almacenamiento la elección dura hasta recargar.
        }
    };

    const enterArena = () => {
        setEntering(true);
        router.push(`/play?mode=arena&clase=${selectedClass.idClase}`);
    };

    const live = overview?.enVivo;
    const ranking = overview?.ranking ?? [];

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
                                Elegí una clase y entrá a pelear contra todos.
                                No hay niveles que subir: se sube en el ranking
                                de la partida.
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
            </div>
        </main>
    );
}
