"use client";

import React from "react";
import { X } from "lucide-react";
import type { QuestEntryState, QuestStatePayload } from "../lib/aowProtocol";

export type WoaoHubTab = "misiones" | "montura" | "premios" | "ranked" | "viajes" | "guerra" | "eventos";

type MountDef = {
    id: number;
    name: string;
    topeLevel: number;
    aumentoCuerpo: number;
    aumentoFlecha: number;
    aumentoMagia: number;
};

type PremioDef = {
    id: number;
    name: string;
    cost: number;
    desc: string;
};

type TravelRoute = {
    fromMap: number;
    key: string;
    map: number;
    cost: number;
};

type WoaoHubModalProps = {
    tab: WoaoHubTab;
    mapId?: number;
    questState?: QuestStatePayload | null;
    onTabChange: (tab: WoaoHubTab) => void;
    onClose: () => void;
    onSendCommand?: (message: string) => void;
};

const TABS: Array<{ id: WoaoHubTab; label: string }> = [
    { id: "misiones", label: "Misiones" },
    { id: "montura", label: "Montura" },
    { id: "premios", label: "Premios" },
    { id: "ranked", label: "Ranked" },
    { id: "viajes", label: "Viajes" },
    { id: "guerra", label: "Guerra" },
    { id: "eventos", label: "Eventos" },
];

function formatAmount(value: number): string {
    return new Intl.NumberFormat("es-AR").format(value);
}

function questStatusLabel(status: QuestEntryState["status"]): string {
    if (status === "available") {
        return "Disponible";
    }
    if (status === "ready") {
        return "Lista";
    }
    if (status === "done") {
        return "Completada";
    }

    return "Activa";
}

function QuestProgressRows({ quest }: { quest: QuestEntryState }) {
    return (
        <div className="mt-4 space-y-3">
            {quest.objectives.map((objective) => {
                const progress = Math.max(0, Math.min(1, objective.current / Math.max(1, objective.amount)));
                const complete = objective.current >= objective.amount;
                return (
                    <div key={`${objective.type}-${objective.index}`} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                            <span className={complete ? "text-emerald-200" : "text-stone-200"}>{objective.name}</span>
                            <span className={complete ? "text-emerald-200" : "text-amber-200"}>
                                {formatAmount(objective.current)}/{formatAmount(objective.amount)}
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-[#2a2422]">
                            <div
                                className={complete ? "h-full bg-emerald-400" : "h-full bg-amber-300"}
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function QuestRewardPills({ quest }: { quest: QuestEntryState }) {
    if (!quest.rewards.length) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap gap-2">
            {quest.rewards.map((reward, index) => (
                <span
                    key={`${reward.type}-${reward.index ?? index}`}
                    className="rounded border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100"
                >
                    {formatAmount(reward.amount)} {reward.label}
                </span>
            ))}
        </div>
    );
}

export default function WoaoHubModal({
    tab,
    mapId,
    questState,
    onTabChange,
    onClose,
    onSendCommand,
}: WoaoHubModalProps) {
    const [mounts, setMounts] = React.useState<MountDef[]>([]);
    const [premios, setPremios] = React.useState<PremioDef[]>([]);
    const [routes, setRoutes] = React.useState<TravelRoute[]>([]);

    React.useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const [mountRes, premioRes, travelRes] = await Promise.all([
                fetch("/init/woao/mountTypes.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/premios.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/fastTravel.json").then((res) => res.json()).catch(() => []),
            ]);

            if (cancelled) {
                return;
            }

            setMounts(Object.values(mountRes ?? {}) as MountDef[]);
            setPremios(Object.values(premioRes ?? {}) as PremioDef[]);
            setRoutes(Array.isArray(travelRes) ? travelRes : []);
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    const availableRoutes = routes.filter((route) => route.fromMap === Number(mapId ?? 0));
    const visibleQuestEntries = React.useMemo(() => {
        const active = questState?.active ?? [];
        const offer = questState?.offer;
        const entries = [...active];

        if (offer && !entries.some((entry) => entry.id === offer.id)) {
            entries.unshift(offer);
        }

        return entries;
    }, [questState?.active, questState?.offer]);
    const [selectedQuestId, setSelectedQuestId] = React.useState<number | null>(null);
    const selectedQuest =
        visibleQuestEntries.find((entry) => entry.id === selectedQuestId) ?? visibleQuestEntries[0] ?? null;

    React.useEffect(() => {
        if (selectedQuestId && visibleQuestEntries.some((entry) => entry.id === selectedQuestId)) {
            return;
        }

        setSelectedQuestId(visibleQuestEntries[0]?.id ?? null);
    }, [selectedQuestId, visibleQuestEntries]);

    return (
        <div
            className="fixed inset-0 z-[84] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]"
            onClick={onClose}
        >
            <div
                className={`flex max-h-[82vh] w-full flex-col overflow-hidden rounded border border-amber-200/20 bg-[#120c08]/96 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.6)] ${
                    tab === "misiones" ? "max-w-4xl" : "max-w-xl"
                }`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 border-b border-amber-200/10 bg-[linear-gradient(180deg,rgba(127,78,35,0.28),rgba(18,12,8,0))] px-4 py-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/72">
                            World of AO
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-[#f2e5ca]">
                            Panel WOAO
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 bg-black/20 text-stone-300 transition hover:border-stone-500 hover:text-white"
                        aria-label="Cerrar panel WOAO"
                    >
                        <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-1 border-b border-amber-200/10 px-3 py-2">
                    {TABS.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            onClick={() => onTabChange(entry.id)}
                            className={`rounded-[10px] px-3 py-1.5 text-[11px] font-semibold transition ${
                                tab === entry.id
                                    ? "border border-amber-400/50 bg-amber-500/15 text-amber-100"
                                    : "border border-transparent text-stone-300 hover:border-stone-600 hover:text-white"
                            }`}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm text-[#f2e5ca]">
                    {tab === "misiones" ? (
                        <div className="grid min-h-[420px] gap-3 md:grid-cols-[minmax(220px,0.85fr)_minmax(280px,1.15fr)]">
                            <div className="min-h-0 rounded border border-amber-200/10 bg-black/32">
                                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                        Misiones
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onSendCommand?.("/quests")}
                                        className="rounded border border-stone-600/40 px-2 py-1 text-xs text-stone-300 transition hover:border-stone-400 hover:text-white"
                                    >
                                        Actualizar
                                    </button>
                                </div>

                                <div className="max-h-[360px] overflow-y-auto p-2">
                                    {visibleQuestEntries.length ? (
                                        <div className="space-y-2">
                                            {visibleQuestEntries.map((quest) => (
                                                <button
                                                    key={quest.id}
                                                    type="button"
                                                    onClick={() => setSelectedQuestId(quest.id)}
                                                    className={`w-full rounded border p-3 text-left transition ${
                                                        selectedQuest?.id === quest.id
                                                            ? "border-amber-300/50 bg-amber-300/10"
                                                            : "border-transparent bg-white/[0.03] hover:border-stone-600/70 hover:bg-white/[0.06]"
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="min-w-0 text-sm font-semibold text-stone-50">{quest.name}</p>
                                                        <span className={quest.status === "ready" ? "shrink-0 text-xs text-amber-200" : "shrink-0 text-xs text-stone-400"}>
                                                            {questStatusLabel(quest.status)}
                                                        </span>
                                                    </div>
                                                    <QuestProgressRows quest={quest} />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex min-h-[260px] items-center justify-center px-4 text-center text-sm text-stone-400">
                                            No tenes misiones activas. Hablale a un NPC con signo amarillo para pedir una.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="min-h-0 rounded border border-amber-200/10 bg-black/28 p-4">
                                {selectedQuest ? (
                                    <>
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                                    Mision
                                                </p>
                                                <h3 className="mt-1 text-xl font-semibold leading-7 text-stone-50">
                                                    {selectedQuest.name}
                                                </h3>
                                            </div>
                                            <span className={selectedQuest.status === "ready" ? "text-sm text-amber-200" : "text-sm text-stone-400"}>
                                                {questStatusLabel(selectedQuest.status)}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm leading-6 text-stone-300">{selectedQuest.desc}</p>
                                        <QuestProgressRows quest={selectedQuest} />
                                        <QuestRewardPills quest={selectedQuest} />

                                        <div className="mt-6 flex justify-end gap-2">
                                            {selectedQuest.status === "available" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onSendCommand?.("/questaceptar")}
                                                    className="rounded border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25"
                                                >
                                                    Aceptar
                                                </button>
                                            ) : null}
                                            {selectedQuest.status === "ready" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => onSendCommand?.("/quest")}
                                                    className="rounded border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25"
                                                >
                                                    Entregar
                                                </button>
                                            ) : null}
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="rounded border border-stone-600/50 px-4 py-2 text-sm text-stone-200 transition hover:border-stone-400 hover:text-white"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex h-full min-h-[320px] items-center justify-center text-center text-sm text-stone-400">
                                        Selecciona una mision para ver progreso y recompensas.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {tab === "montura" ? (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => onSendCommand?.("/montura")}
                                className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                            >
                                Ver mis mascotas
                            </button>
                            {mounts.map((mount) => (
                                <div key={mount.id} className="rounded-[12px] border border-amber-200/10 bg-black/20 p-3">
                                    <p className="font-semibold">{mount.name}</p>
                                    <p className="mt-1 text-xs text-stone-300">
                                        Tope {mount.topeLevel} · Cuerpo +{mount.aumentoCuerpo} · Flecha +{mount.aumentoFlecha} · Magia +{mount.aumentoMagia}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {tab === "premios" ? (
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={() => onSendCommand?.("/premios")}
                                className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                            >
                                Ver puntos
                            </button>
                            {premios.map((premio) => (
                                <div key={premio.id} className="flex items-start justify-between gap-3 rounded-[12px] border border-amber-200/10 bg-black/20 p-3">
                                    <div>
                                        <p className="font-semibold">
                                            [{premio.id}] {premio.name}
                                        </p>
                                        <p className="mt-1 text-xs text-stone-300">{premio.desc}</p>
                                        <p className="mt-1 text-[11px] text-amber-200/70">{premio.cost} pts</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onSendCommand?.(`/canjear ${premio.id}`)}
                                        className="rounded-[10px] border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-[11px] font-semibold"
                                    >
                                        Canjear
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {tab === "ranked" ? (
                        <div className="space-y-3">
                            <p className="text-sm text-stone-300">
                                Cola 1v1 Bo2 en mapas 211-215. El ELO arranca en 300 (Bronce).
                            </p>
                            <button
                                type="button"
                                onClick={() => onSendCommand?.("/ranked")}
                                className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                            >
                                Entrar / salir de cola
                            </button>
                        </div>
                    ) : null}

                    {tab === "viajes" ? (
                        <div className="space-y-3">
                            {availableRoutes.length ? (
                                availableRoutes.map((route) => (
                                    <button
                                        key={`${route.fromMap}-${route.key}`}
                                        type="button"
                                        onClick={() => onSendCommand?.(`/viaje ${route.key}`)}
                                        className="flex w-full items-center justify-between rounded-[12px] border border-amber-200/10 bg-black/20 p-3 text-left"
                                    >
                                        <span className="font-semibold">{route.key}</span>
                                        <span className="text-xs text-stone-300">
                                            mapa {route.map}
                                            {route.cost ? ` · ${route.cost} oro` : ""}
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-stone-300">
                                    Desde este mapa no hay viajes rapidos. Ve a un viajero en una ciudad.
                                </p>
                            )}
                        </div>
                    ) : null}

                    {tab === "guerra" ? (
                        <div className="space-y-3">
                            <p className="text-sm text-stone-300">
                                Guerras Alianza vs Horda en mapas 203/204. El ganador controla el templo (mapa 210).
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/guerra")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Entrar a guerra
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/templo")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Templo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/ciudades")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Ciudades
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/dia")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Evento del dia
                                </button>
                            </div>
                        </div>
                    ) : null}

                    {tab === "eventos" ? (
                        <div className="space-y-3">
                            <p className="text-sm text-stone-300">
                                Blood Castle (mapa 205), Juegos del Hambre (268/269) y torneo automatico (208).
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/bloodcastle")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Blood Castle
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/hunger")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Juegos del Hambre
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/participar")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Torneo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/dia")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Bicho del dia
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
