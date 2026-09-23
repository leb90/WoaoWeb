"use client";

import React from "react";
import {
    Coins,
    Gift,
    Minus,
    Plus,
    Search,
    ShoppingCart,
    X,
} from "lucide-react";
import type { QuestEntryState, QuestStatePayload } from "../lib/aowProtocol";
import type { GraphicData, ObjectsDB } from "../types/game";
import { getTexturePath, loadGraphicsDB, loadObjectsDB } from "../utils/gameLoader";

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
    objIndex: number;
    cost: number;
    desc: string;
    photo?: number;
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
    questPoints?: number;
    donationPoints?: number;
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

type PremioCurrency = "quest" | "donation";

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

function normalizeSearchText(value: string): string {
    return value
        .toLocaleLowerCase("es-AR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function resolvePremioGraphic(
    premio: PremioDef,
    objectsDB: ObjectsDB | null,
    graphicsDB: Record<string, GraphicData> | null,
): GraphicData | undefined {
    const objectData = objectsDB?.[String(premio.objIndex)];
    const grhIndex = Number(objectData?.grhIndex ?? 0);

    if (!Number.isFinite(grhIndex) || grhIndex <= 0) {
        return undefined;
    }

    return graphicsDB?.[String(grhIndex)];
}

function PremioGraphic({
    graphicData,
    name,
    compact = false,
}: {
    graphicData?: GraphicData;
    name: string;
    compact?: boolean;
}) {
    if (!graphicData?.numFile) {
        return (
            <div
                className={`flex h-full w-full items-center justify-center rounded border border-amber-300/15 bg-black/30 text-amber-200/60 ${
                    compact ? "min-h-0" : "min-h-[116px]"
                }`}
            >
                <Gift aria-hidden="true" className={compact ? "h-5 w-5" : "h-9 w-9"} strokeWidth={1.6} />
            </div>
        );
    }

    const targetSize = compact ? 46 : 112;
    const scale = Math.min(
        compact ? 1.35 : 2.5,
        targetSize / Math.max(graphicData.width, graphicData.height, 1),
    );

    return (
        <div
            className={`relative h-full w-full overflow-hidden rounded border border-amber-300/20 bg-[radial-gradient(circle_at_50%_42%,rgba(245,186,71,0.18),rgba(0,0,0,0.3)_58%)] ${
                compact ? "min-h-0" : "min-h-[116px]"
            }`}
        >
            <div
                aria-label={name}
                className="absolute left-1/2 top-1/2 bg-no-repeat drop-shadow-[0_12px_18px_rgba(0,0,0,0.55)]"
                style={{
                    width: graphicData.width,
                    height: graphicData.height,
                    backgroundImage: `url(${getTexturePath(graphicData)})`,
                    backgroundPosition: `-${graphicData.sX}px -${graphicData.sY}px`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: "center",
                }}
            />
        </div>
    );
}

export default function WoaoHubModal({
    tab,
    mapId,
    questState,
    questPoints = 0,
    donationPoints = 0,
    onTabChange,
    onClose,
    onSendCommand,
}: WoaoHubModalProps) {
    const [mounts, setMounts] = React.useState<MountDef[]>([]);
    const [premios, setPremios] = React.useState<PremioDef[]>([]);
    const [donacionPremios, setDonacionPremios] = React.useState<PremioDef[]>([]);
    const [routes, setRoutes] = React.useState<TravelRoute[]>([]);
    const [graphicsDB, setGraphicsDB] = React.useState<Record<string, GraphicData> | null>(null);
    const [objectsDB, setObjectsDB] = React.useState<ObjectsDB | null>(null);
    const [premioCurrency, setPremioCurrency] = React.useState<PremioCurrency>("quest");
    const [premioSearch, setPremioSearch] = React.useState("");
    const [selectedPremioId, setSelectedPremioId] = React.useState<number | null>(null);
    const [premioQuantities, setPremioQuantities] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const [mountRes, premioRes, donacionRes, travelRes] = await Promise.all([
                fetch("/init/woao/mountTypes.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/premios.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/donaciones.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/fastTravel.json").then((res) => res.json()).catch(() => []),
            ]);

            if (cancelled) {
                return;
            }

            setMounts(Object.values(mountRes ?? {}) as MountDef[]);
            setPremios(Object.values(premioRes ?? {}) as PremioDef[]);
            setDonacionPremios(Object.values(donacionRes ?? {}) as PremioDef[]);
            setRoutes(Array.isArray(travelRes) ? travelRes : []);
        };

        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    React.useEffect(() => {
        let active = true;

        Promise.all([loadGraphicsDB(), loadObjectsDB()])
            .then(([graphics, objects]) => {
                if (!active) {
                    return;
                }

                setGraphicsDB(graphics);
                setObjectsDB(objects);
            })
            .catch(() => {
                if (!active) {
                    return;
                }

                setGraphicsDB({});
                setObjectsDB({});
            });

        return () => {
            active = false;
        };
    }, []);

    const availableRoutes = routes.filter((route) => route.fromMap === Number(mapId ?? 0));
    const activePremios = premioCurrency === "quest" ? premios : donacionPremios;
    const activePoints = premioCurrency === "quest" ? questPoints : donationPoints;
    const activePointsLabel = premioCurrency === "quest" ? "Puntos Quest" : "Puntos Donaciones";
    const normalizedPremioSearch = normalizeSearchText(premioSearch.trim());
    const visiblePremios = React.useMemo(() => {
        if (!normalizedPremioSearch) {
            return activePremios;
        }

        return activePremios.filter((premio) => {
            const haystack = normalizeSearchText(
                `${premio.id} ${premio.name} ${premio.desc} ${premio.objIndex}`,
            );
            return haystack.includes(normalizedPremioSearch);
        });
    }, [activePremios, normalizedPremioSearch]);
    const selectedPremio =
        activePremios.find((premio) => premio.id === selectedPremioId) ??
        activePremios[0] ??
        null;
    const getPremioQuantity = React.useCallback(
        (currency: PremioCurrency, premioId: number) =>
            premioQuantities[`${currency}:${premioId}`] ?? 1,
        [premioQuantities],
    );
    const selectedPremioQuantity = selectedPremio
        ? getPremioQuantity(premioCurrency, selectedPremio.id)
        : 1;
    const selectedPremioTotal = selectedPremio
        ? selectedPremio.cost * selectedPremioQuantity
        : 0;
    const remainingPoints = activePoints - selectedPremioTotal;
    const canConfirmPremio = Boolean(selectedPremio) && selectedPremioTotal > 0 && remainingPoints >= 0;

    const setPremioQuantity = React.useCallback(
        (currency: PremioCurrency, premioId: number, nextQuantity: number) => {
            const safeQuantity = Math.max(1, Math.min(99, Math.floor(nextQuantity || 1)));
            setPremioQuantities((current) => ({
                ...current,
                [`${currency}:${premioId}`]: safeQuantity,
            }));
        },
        [],
    );

    const handleConfirmPremio = React.useCallback(() => {
        if (!selectedPremio || !canConfirmPremio) {
            return;
        }

        const command = premioCurrency === "quest" ? "/canjear" : "/canjeardonacion";
        onSendCommand?.(`${command} ${selectedPremio.id} ${selectedPremioQuantity}`);
    }, [
        canConfirmPremio,
        onSendCommand,
        premioCurrency,
        selectedPremio,
        selectedPremioQuantity,
    ]);

    React.useEffect(() => {
        if (selectedPremioId && activePremios.some((premio) => premio.id === selectedPremioId)) {
            return;
        }

        setSelectedPremioId(activePremios[0]?.id ?? null);
    }, [activePremios, selectedPremioId]);

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
                    tab === "premios"
                        ? "max-w-6xl"
                        : tab === "misiones"
                          ? "max-w-4xl"
                          : "max-w-xl"
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

                <div
                    className={`min-h-0 flex-1 px-4 py-3 text-sm text-[#f2e5ca] ${
                        tab === "premios" ? "overflow-hidden" : "overflow-y-auto"
                    }`}
                >
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
                        <div className="flex h-[min(66vh,690px)] min-h-[520px] flex-col gap-3">
                            <div className="flex flex-col gap-3 border-b border-amber-200/10 pb-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="grid gap-2 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setPremioCurrency("quest")}
                                        className={`flex items-center justify-center gap-3 rounded border px-5 py-3 text-sm font-semibold transition ${
                                            premioCurrency === "quest"
                                                ? "border-amber-300/80 bg-amber-400/18 text-amber-100 shadow-[0_0_22px_rgba(245,158,11,0.18)]"
                                                : "border-amber-200/12 bg-black/20 text-stone-300 hover:border-amber-300/35 hover:text-amber-100"
                                        }`}
                                    >
                                        <Gift aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                                        Canjes Quest
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPremioCurrency("donation")}
                                        className={`flex items-center justify-center gap-3 rounded border px-5 py-3 text-sm font-semibold transition ${
                                            premioCurrency === "donation"
                                                ? "border-amber-300/80 bg-amber-400/18 text-amber-100 shadow-[0_0_22px_rgba(245,158,11,0.18)]"
                                                : "border-amber-200/12 bg-black/20 text-stone-300 hover:border-amber-300/35 hover:text-amber-100"
                                        }`}
                                    >
                                        <Coins aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                                        Canjes Donaciones
                                    </button>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                    <label className="relative block min-w-[240px]">
                                        <Search
                                            aria-hidden="true"
                                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-200/55"
                                            strokeWidth={1.7}
                                        />
                                        <input
                                            value={premioSearch}
                                            onChange={(event) => setPremioSearch(event.target.value)}
                                            placeholder="Buscar item"
                                            className="h-10 w-full rounded border border-amber-200/15 bg-black/30 pl-9 pr-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/60"
                                        />
                                    </label>
                                    <div className="flex items-center gap-2 rounded border border-amber-200/15 bg-black/24 px-3 py-2">
                                        <Coins aria-hidden="true" className="h-4 w-4 text-amber-200" strokeWidth={1.7} />
                                        <span className="text-xs text-stone-300">{activePointsLabel}:</span>
                                        <span className="text-sm font-bold text-amber-100">{formatAmount(activePoints)}</span>
                                    </div>
                                    {premioCurrency === "donation" ? (
                                        <button
                                            type="button"
                                            onClick={() => undefined}
                                            className="h-10 rounded border border-amber-300/55 bg-amber-500/12 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20"
                                        >
                                            Comprar Puntos
                                        </button>
                                    ) : null}
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                {visiblePremios.length ? (
                                    <div className="grid gap-3 lg:grid-cols-2">
                                        {visiblePremios.map((premio) => {
                                            const quantity = getPremioQuantity(premioCurrency, premio.id);
                                            const isSelected = selectedPremio?.id === premio.id;
                                            const graphicData = resolvePremioGraphic(premio, objectsDB, graphicsDB);

                                            return (
                                                <div
                                                    key={`${premioCurrency}-${premio.id}`}
                                                    onClick={() => setSelectedPremioId(premio.id)}
                                                    className={`grid cursor-pointer grid-cols-[116px_minmax(0,1fr)] gap-4 rounded border bg-[linear-gradient(135deg,rgba(28,21,12,0.9),rgba(8,6,4,0.92))] p-3 transition ${
                                                        isSelected
                                                            ? "border-amber-300/80 shadow-[0_0_0_1px_rgba(245,158,11,0.24),0_0_28px_rgba(245,158,11,0.14)]"
                                                            : "border-amber-200/14 hover:border-amber-300/45"
                                                    }`}
                                                >
                                                    <PremioGraphic graphicData={graphicData} name={premio.name} />
                                                    <div className="flex min-w-0 flex-col">
                                                        <div className="min-h-[76px]">
                                                            <p className="line-clamp-2 text-base font-semibold leading-snug text-[#f7edd2]">
                                                                {premio.name}
                                                            </p>
                                                            {premio.desc ? (
                                                                <p className="mt-1 line-clamp-2 text-sm leading-snug text-stone-300">
                                                                    {premio.desc}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                        <p className="mt-1 text-lg font-bold text-amber-200">
                                                            {formatAmount(premio.cost)} pts
                                                        </p>
                                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                                                            <div className="grid h-9 grid-cols-[34px_42px_34px] overflow-hidden rounded border border-stone-500/50 bg-black/28">
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        setSelectedPremioId(premio.id);
                                                                        setPremioQuantity(premioCurrency, premio.id, quantity - 1);
                                                                    }}
                                                                    className="flex items-center justify-center text-stone-100 transition hover:bg-white/10"
                                                                    aria-label="Quitar unidad"
                                                                >
                                                                    <Minus aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                                                </button>
                                                                <span className="flex items-center justify-center border-x border-stone-500/45 text-sm font-semibold text-stone-100">
                                                                    {quantity}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        setSelectedPremioId(premio.id);
                                                                        setPremioQuantity(premioCurrency, premio.id, quantity + 1);
                                                                    }}
                                                                    className="flex items-center justify-center text-stone-100 transition hover:bg-white/10"
                                                                    aria-label="Agregar unidad"
                                                                >
                                                                    <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setSelectedPremioId(premio.id);
                                                                }}
                                                                className="flex h-9 items-center gap-2 rounded border border-amber-300/55 bg-amber-500/15 px-4 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/24"
                                                            >
                                                                <Gift aria-hidden="true" className="h-4 w-4" strokeWidth={1.7} />
                                                                Canjear
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex min-h-[280px] items-center justify-center rounded border border-amber-200/10 bg-black/20 px-4 text-center text-sm text-stone-400">
                                        No hay items para mostrar.
                                    </div>
                                )}
                            </div>

                            <div className="shrink-0 rounded border border-amber-300/20 bg-[linear-gradient(180deg,rgba(59,39,15,0.78),rgba(10,8,6,0.95))] shadow-[0_-10px_30px_rgba(0,0,0,0.24)]">
                                <div className="flex items-center justify-between gap-3 border-b border-amber-200/12 px-4 py-3">
                                    <div className="flex items-center gap-3 text-amber-100">
                                        <ShoppingCart aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                                        <span className="font-semibold">Simulacion de canje</span>
                                    </div>
                                    <span className="text-xs text-stone-400">{activePointsLabel}</span>
                                </div>
                                <div className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_1.35fr_1fr_auto] md:items-center">
                                    <div>
                                        <p className="text-xs text-stone-300">Disponibles</p>
                                        <p className="mt-1 text-2xl font-bold text-amber-100">
                                            {formatAmount(activePoints)}
                                        </p>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-3">
                                        {selectedPremio ? (
                                            <>
                                                <div className="h-14 w-14 shrink-0">
                                                    <PremioGraphic
                                                        graphicData={resolvePremioGraphic(selectedPremio, objectsDB, graphicsDB)}
                                                        name={selectedPremio.name}
                                                        compact
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="line-clamp-2 text-sm font-semibold text-stone-100">
                                                        {selectedPremio.name}
                                                    </p>
                                                    <p className="text-xs text-amber-200/80">
                                                        {formatAmount(selectedPremio.cost)} pts c/u
                                                    </p>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-sm text-stone-400">Sin item seleccionado</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-stone-300">Cantidad</span>
                                        {selectedPremio ? (
                                            <div className="grid h-9 grid-cols-[34px_42px_34px] overflow-hidden rounded border border-stone-500/50 bg-black/28">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPremioQuantity(
                                                            premioCurrency,
                                                            selectedPremio.id,
                                                            selectedPremioQuantity - 1,
                                                        )
                                                    }
                                                    className="flex items-center justify-center text-stone-100 transition hover:bg-white/10"
                                                    aria-label="Quitar unidad"
                                                >
                                                    <Minus aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                                </button>
                                                <span className="flex items-center justify-center border-x border-stone-500/45 text-sm font-semibold text-stone-100">
                                                    {selectedPremioQuantity}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPremioQuantity(
                                                            premioCurrency,
                                                            selectedPremio.id,
                                                            selectedPremioQuantity + 1,
                                                        )
                                                    }
                                                    className="flex items-center justify-center text-stone-100 transition hover:bg-white/10"
                                                    aria-label="Agregar unidad"
                                                >
                                                    <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                                </button>
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="flex flex-col gap-2 md:min-w-[260px] md:flex-row md:items-center">
                                        <div className="min-w-[128px]">
                                            <p className="text-xs text-stone-300">A descontar</p>
                                            <p className="text-xl font-bold text-amber-100">
                                                {formatAmount(selectedPremioTotal)} pts
                                            </p>
                                            <p className={remainingPoints >= 0 ? "text-sm font-semibold text-emerald-300" : "text-sm font-semibold text-red-300"}>
                                                Saldo: {formatAmount(Math.max(0, remainingPoints))} pts
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleConfirmPremio}
                                            disabled={!canConfirmPremio}
                                            className="flex h-12 items-center justify-center gap-2 rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f7c84f,#a96512)] px-5 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-stone-600/50 disabled:bg-none disabled:bg-stone-800 disabled:text-stone-500 disabled:hover:brightness-100"
                                        >
                                            <Gift aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                            Confirmar Canje
                                        </button>
                                    </div>
                                </div>
                            </div>
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
