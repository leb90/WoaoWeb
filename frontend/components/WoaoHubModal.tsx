"use client";

import React from "react";
import { X } from "lucide-react";

export type WoaoHubTab = "misiones" | "montura" | "premios" | "ranked" | "viajes" | "guerra" | "eventos";

type QuestDef = {
    id: number;
    name: string;
    desc: string;
    requiredLevel: number;
};

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

export default function WoaoHubModal({
    tab,
    mapId,
    onTabChange,
    onClose,
    onSendCommand,
}: WoaoHubModalProps) {
    const [quests, setQuests] = React.useState<QuestDef[]>([]);
    const [mounts, setMounts] = React.useState<MountDef[]>([]);
    const [premios, setPremios] = React.useState<PremioDef[]>([]);
    const [routes, setRoutes] = React.useState<TravelRoute[]>([]);

    React.useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const [questRes, mountRes, premioRes, travelRes] = await Promise.all([
                fetch("/init/woao/quests.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/mountTypes.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/premios.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/fastTravel.json").then((res) => res.json()).catch(() => []),
            ]);

            if (cancelled) {
                return;
            }

            setQuests(Object.values(questRes ?? {}) as QuestDef[]);
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

    return (
        <div
            className="fixed inset-0 z-[84] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]"
            onClick={onClose}
        >
            <div
                className="flex max-h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-[24px] border border-amber-200/20 bg-[#120c08]/96 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.6)]"
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
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/quests")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Mis misiones
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSendCommand?.("/questaceptar")}
                                    className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                                >
                                    Aceptar cercana
                                </button>
                            </div>
                            {quests.map((quest) => (
                                <div key={quest.id} className="rounded-[12px] border border-amber-200/10 bg-black/20 p-3">
                                    <p className="font-semibold">
                                        [{quest.id}] {quest.name}
                                    </p>
                                    <p className="mt-1 text-xs text-stone-300">{quest.desc}</p>
                                    <p className="mt-1 text-[11px] text-amber-200/70">Nivel {quest.requiredLevel}</p>
                                </div>
                            ))}
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
