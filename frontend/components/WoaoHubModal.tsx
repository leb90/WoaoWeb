"use client";

import Image from "next/image";
import React from "react";
import {
    Activity,
    BookOpen,
    CalendarDays,
    Check,
    Clock3,
    Coins,
    ExternalLink,
    Gift,
    Info,
    MapPin,
    Minus,
    Package,
    PawPrint,
    Plus,
    ScrollText,
    Search,
    Shield,
    ShoppingCart,
    Skull,
    Sparkles,
    Swords,
    Target,
    X,
} from "lucide-react";
import type {
    MountStateEntry,
    MountStatePayload,
    QuestEntryState,
    RankedLeaderboardEntryPayload,
    QuestStatePayload,
    RankedMode,
    RankedStatePayload,
} from "../lib/aowProtocol";
import {
    getRankFromElo,
    getRankTierVisual,
    RANKED_TIER_VISUALS,
} from "../lib/rankedVisuals";
import type { GraphicData, ObjectsDB } from "../types/game";
import { getTexturePath, loadGraphicsDB, loadObjectsDB } from "../utils/gameLoader";

export type WoaoHubTab = "misiones" | "montura" | "premios" | "ranked" | "subastas" | "viajes" | "eventos";

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
    boat?: boolean;
};

type DungeonTravelRoute = {
    key: string;
    name: string;
    map: number;
    cost: number;
};

function formatCityName(key: string) {
    const lower = key.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

type WoaoHubModalProps = {
    tab: WoaoHubTab;
    mapId?: number;
    questState?: QuestStatePayload | null;
    mountState?: MountStatePayload | null;
    rankedState?: RankedStatePayload | null;
    questDialog?: QuestEntryState[] | null;
    questPoints?: number;
    donationPoints?: number;
    auctionPanel?: React.ReactNode;
    onTabChange: (tab: WoaoHubTab) => void;
    onClose: () => void;
    onOpenAuctionHouse?: () => void;
    onSendCommand?: (message: string) => void;
};

const TABS: Array<{ id: WoaoHubTab; label: string }> = [
    { id: "misiones", label: "Misiones" },
    { id: "montura", label: "Montura" },
    { id: "premios", label: "Premios" },
    { id: "ranked", label: "Ranked" },
    { id: "subastas", label: "Subastas" },
    { id: "viajes", label: "Viajes" },
    { id: "eventos", label: "Eventos" },
];

type PremioCurrency = "quest" | "donation";
type EventCategory = "pvp" | "pve" | "boss" | "special";
type EventCategoryFilter = "all" | EventCategory;
type EventStatus = "available" | "upcoming" | "closed" | "running";
type EventActionType = "join" | "details" | "teleport" | "open_panel" | "track";

type AutomaticEventActionData = {
    command?: string;
    details?: string[];
    targetTab?: WoaoHubTab;
};

type EventSchedule = {
    timezone: string;
    slots: Array<{ hour: number; minute: number }>;
    registrationMinutes: number;
    durationMinutes: number;
};

type AutomaticEvent = {
    id: string;
    name: string;
    description: string;
    category: EventCategory;
    startsAt: number;
    locationLabel?: string;
    mapId?: number;
    status: EventStatus;
    actionLabel: string;
    actionType: EventActionType;
    actionData?: AutomaticEventActionData;
    disabledReason?: string;
    allowJoinWhileRunning?: boolean;
};

type AutomaticEventDefinition = Omit<AutomaticEvent, "startsAt"> & {
    startsInMinutes?: number;
    schedule?: EventSchedule;
};

const EVENT_CATEGORY_META: Record<EventCategory, { label: string; dotClass: string; badgeClass: string }> = {
    pvp: {
        label: "PvP",
        dotClass: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]",
        badgeClass: "border-red-400/70 bg-red-950/35 text-red-200",
    },
    pve: {
        label: "PvE",
        dotClass: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.45)]",
        badgeClass: "border-emerald-400/70 bg-emerald-950/35 text-emerald-200",
    },
    boss: {
        label: "Boss",
        dotClass: "bg-fuchsia-500 shadow-[0_0_12px_rgba(217,70,239,0.45)]",
        badgeClass: "border-fuchsia-400/70 bg-fuchsia-950/35 text-fuchsia-200",
    },
    special: {
        label: "Especial",
        dotClass: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]",
        badgeClass: "border-amber-300/70 bg-amber-950/35 text-amber-200",
    },
};

const EVENT_STATUS_META: Record<EventStatus, { label: string; dotClass: string; textClass: string }> = {
    available: {
        label: "Disponible",
        dotClass: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.5)]",
        textClass: "text-emerald-300",
    },
    upcoming: {
        label: "Próximo",
        dotClass: "bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]",
        textClass: "text-amber-300",
    },
    closed: {
        label: "Cerrado",
        dotClass: "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.45)]",
        textClass: "text-red-300",
    },
    running: {
        label: "En curso",
        dotClass: "bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.5)]",
        textClass: "text-cyan-200",
    },
};

const EVENT_FILTERS: Array<{ id: EventCategoryFilter; label: string; category?: EventCategory }> = [
    { id: "all", label: "Todos" },
    { id: "pvp", label: EVENT_CATEGORY_META.pvp.label, category: "pvp" },
    { id: "pve", label: EVENT_CATEGORY_META.pve.label, category: "pve" },
    { id: "boss", label: EVENT_CATEGORY_META.boss.label, category: "boss" },
    { id: "special", label: EVENT_CATEGORY_META.special.label, category: "special" },
];

const AUTOMATIC_EVENT_DEFINITIONS: AutomaticEventDefinition[] = [
    {
        id: "hunters_game",
        name: "Hunters Game",
        description: "Todos contra todos sin respawn. La inscripción abre 10 minutos antes. Inicia a las 10:00 y a las 22:00.",
        category: "pvp",
        locationLabel: "Mapas 260-263",
        status: "upcoming",
        actionLabel: "Participar",
        actionType: "join",
        actionData: { command: "/hunters" },
        allowJoinWhileRunning: false,
        schedule: {
            timezone: "America/Argentina/Buenos_Aires",
            slots: [
                { hour: 10, minute: 0 },
                { hour: 22, minute: 0 },
            ],
            registrationMinutes: 10,
            durationMinutes: 30,
        },
    },
    {
        id: "faction_war",
        name: "Guerra de facciones",
        description: "Horda contra Alianza. Gana la facción con más kills.",
        category: "pvp",
        startsInMinutes: 90,
        locationLabel: "Mapas 203/204",
        status: "upcoming",
        actionLabel: "Participar",
        actionType: "join",
        actionData: { command: "/guerra" },
    },
    {
        id: "mummy_pharaoh",
        name: "Momia Faraón",
        description: "Boss automático de las pirámides.",
        category: "boss",
        startsInMinutes: 240,
        locationLabel: "Mapa 182",
        mapId: 182,
        status: "upcoming",
        actionLabel: "Detalles",
        actionType: "details",
        actionData: {
            details: [
                "Aparece automáticamente en la zona de pirámides cuando llega su contador.",
                "Al activarse, el server anuncia la invasión por consola global.",
            ],
        },
    },
    {
        id: "ice_knight",
        name: "Caballero Helado",
        description: "Boss automático de zona helada.",
        category: "boss",
        startsInMinutes: 300,
        locationLabel: "Zona helada",
        status: "upcoming",
        actionLabel: "Detalles",
        actionType: "details",
        actionData: {
            details: [
                "Evento preparado para sumarse al calendario automático.",
                "Cuando el sistema esté conectado al server, esta fila podrá mostrar su estado real.",
            ],
        },
    },
];

function formatAmount(value: number): string {
    return new Intl.NumberFormat("es-AR").format(value);
}

function zonedParts(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(date);
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
    const hour = get("hour");

    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: hour === 24 ? 0 : hour,
        minute: get("minute"),
        second: get("second"),
    };
}

function zonedLocalToUtc(
    timeZone: string,
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
): number {
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
    const parts = zonedParts(new Date(utcGuess), timeZone);
    const asZoned = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    const target = Date.UTC(year, month - 1, day, hour, minute, 0);

    return utcGuess + (target - asZoned);
}

function addCalendarDays(year: number, month: number, day: number, days: number) {
    const date = new Date(Date.UTC(year, month - 1, day + days));

    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
    };
}

function resolveScheduledWindow(schedule: EventSchedule, now: number): { startsAt: number; status: EventStatus } {
    const parts = zonedParts(new Date(now), schedule.timezone);
    let activeStart: number | null = null;
    let nextStart = Number.POSITIVE_INFINITY;

    for (let dayOffset = -1; dayOffset <= 1; dayOffset += 1) {
        const day = addCalendarDays(parts.year, parts.month, parts.day, dayOffset);

        for (const slot of schedule.slots) {
            const startsAt = zonedLocalToUtc(schedule.timezone, day.year, day.month, day.day, slot.hour, slot.minute);
            const registrationStartsAt = startsAt - schedule.registrationMinutes * 60_000;
            const endsAt = startsAt + schedule.durationMinutes * 60_000;

            if (now >= registrationStartsAt && now < endsAt) {
                activeStart = startsAt;
            }

            if (startsAt > now && startsAt < nextStart) {
                nextStart = startsAt;
            }
        }
    }

    if (activeStart !== null) {
        return {
            startsAt: activeStart,
            status: now < activeStart ? "available" : "upcoming",
        };
    }

    return {
        startsAt: Number.isFinite(nextStart) ? nextStart : now,
        status: "upcoming",
    };
}

function formatEventCountdown(startsAt: number, now: number): string {
    const remainingMs = startsAt - now;

    if (remainingMs <= 0) {
        return "EN CURSO";
    }

    const totalMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, "0")}hs ${String(minutes).padStart(2, "0")}min`;
}

function buildAutomaticEvents(anchorTime: number, now: number): AutomaticEvent[] {
    return AUTOMATIC_EVENT_DEFINITIONS.map(({ startsInMinutes, schedule, ...event }) => {
        if (schedule) {
            const window = resolveScheduledWindow(schedule, now);

            return {
                ...event,
                startsAt: window.startsAt,
                status: window.status,
            };
        }

        return {
            ...event,
            startsAt: anchorTime + (startsInMinutes ?? 0) * 60_000,
        };
    });
}

function resolveEventStatus(event: AutomaticEvent, now: number): EventStatus {
    if (event.status === "closed") {
        return "closed";
    }

    if (event.startsAt <= now) {
        return "running";
    }

    return event.status;
}

function formatServerClock(now: number): string {
    return new Intl.DateTimeFormat("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(now));
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
    if (status === "locked") {
        return "Nivel insuficiente";
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
                            <span className={`flex min-w-0 items-center gap-2 ${complete ? "text-emerald-200" : "text-stone-200"}`}>
                                {objective.type === "npc" ? (
                                    <Skull aria-hidden="true" className="h-4 w-4 shrink-0 text-stone-300" strokeWidth={1.8} />
                                ) : (
                                    <Package aria-hidden="true" className="h-4 w-4 shrink-0 text-stone-300" strokeWidth={1.8} />
                                )}
                                <span className="truncate">{objective.name}</span>
                            </span>
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

function resolveObjectGraphic(
    itemId: number | undefined,
    objectsDB: ObjectsDB | null,
    graphicsDB: Record<string, GraphicData> | null,
): GraphicData | undefined {
    if (!itemId) {
        return undefined;
    }

    const objectData = objectsDB?.[String(itemId)];
    const grhIndex = Number(objectData?.grhIndex ?? 0);
    if (!Number.isFinite(grhIndex) || grhIndex <= 0) {
        return undefined;
    }

    return graphicsDB?.[String(grhIndex)];
}

const MOUNT_ICON_OFFSETS: Record<number, { x: number; y: number }> = {
    888: { x: 5, y: 0 },
    889: { x: 3, y: 0 },
    890: { x: 4, y: 0 },
    891: { x: 3, y: 0 },
    892: { x: 2, y: 1 },
    893: { x: 3, y: 0 },
    894: { x: 4, y: 0 },
    895: { x: 4, y: 0 },
    896: { x: 3, y: 0 },
    897: { x: 3, y: 0 },
    898: { x: 3, y: 0 },
    899: { x: 4, y: 0 },
};

const GOLD_ITEM_ID = 12;

function ObjectGraphicIcon({
    graphicData,
    name,
    size = 42,
}: {
    graphicData?: GraphicData;
    name: string;
    size?: number;
}) {
    if (!graphicData?.numFile) {
        return null;
    }

    const scale = Math.min(2.4, (size - 4) / Math.max(graphicData.width, graphicData.height, 1));
    return (
        <span
            aria-label={name}
            className="relative shrink-0 overflow-hidden"
            style={{ width: size, height: size }}
        >
            <span
                className="absolute left-1/2 top-1/2 bg-no-repeat [image-rendering:pixelated] drop-shadow-[0_6px_10px_rgba(0,0,0,0.65)]"
                style={{
                    width: graphicData.width,
                    height: graphicData.height,
                    backgroundImage: `url(${getTexturePath(graphicData)})`,
                    backgroundPosition: `-${graphicData.sX}px -${graphicData.sY}px`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: "center",
                }}
            />
        </span>
    );
}

function QuestExpBadge({ size = 42 }: { size?: number }) {
    const letterSize = Math.max(8, Math.round(size * 0.2));
    return (
        <span
            aria-label="Experiencia"
            className="relative grid shrink-0 place-items-center"
            style={{ width: size, height: size }}
        >
            <span className="absolute inset-[5px] rounded-full bg-[radial-gradient(circle_at_32%_28%,#9cdcff_0%,#3b8dff_42%,#1554c8_78%,#0b2f7a_100%)] shadow-[0_0_12px_rgba(70,150,255,0.55),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-4px_6px_rgba(8,30,90,0.45)]" />
            <span className="absolute inset-[9px] rounded-full border border-white/25" />
            <span
                className="relative z-[1] font-black tracking-[0.12em] text-white [text-shadow:0_1px_2px_rgba(8,30,90,0.8)]"
                style={{ fontSize: letterSize }}
            >
                XP
            </span>
        </span>
    );
}

function QuestPointsBadge({ size = 42 }: { size?: number }) {
    const letterSize = Math.max(13, Math.round(size * 0.36));
    return (
        <span
            aria-label="Puntos de canje"
            className="relative grid shrink-0 place-items-center"
            style={{ width: size, height: size }}
        >
            <span className="absolute inset-[4px] rounded-full bg-[radial-gradient(circle_at_32%_26%,#ffe9a8_0%,#e2b34a_46%,#b07818_100%)] shadow-[0_6px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-3px_5px_rgba(90,50,0,0.35)]" />
            <span className="absolute inset-[7px] rounded-full border border-[#8a5a12]/50" />
            <span
                className="relative z-[1] font-serif font-black text-[#5d3a0c] [text-shadow:0_1px_0_rgba(255,255,255,0.45)]"
                style={{ fontSize: letterSize }}
            >
                P
            </span>
        </span>
    );
}

function QuestRewardIcon({
    reward,
    objectsDB,
    graphicsDB,
    size = 32,
}: {
    reward: QuestEntryState["rewards"][number];
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
    size?: number;
}) {
    if (reward.type === "exp") {
        return <QuestExpBadge size={size} />;
    }

    if (reward.type === "points") {
        return <QuestPointsBadge size={size} />;
    }

    const itemId = reward.type === "gold" ? GOLD_ITEM_ID : reward.index;
    const graphicData = resolveObjectGraphic(itemId, objectsDB, graphicsDB);
    const graphic = <ObjectGraphicIcon graphicData={graphicData} name={reward.label} size={size} />;
    if (graphic) {
        return graphic;
    }

    if (reward.type === "gold") {
        return <Coins aria-hidden="true" className="h-6 w-6 shrink-0 text-amber-200" strokeWidth={1.8} />;
    }

    return <Gift aria-hidden="true" className="h-6 w-6 shrink-0 text-amber-200" strokeWidth={1.8} />;
}

function QuestRewardPills({
    quest,
    objectsDB,
    graphicsDB,
}: {
    quest: QuestEntryState;
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
}) {
    if (!quest.rewards.length) {
        return null;
    }

    return (
        <div className="mt-5 flex flex-wrap gap-2">
            {quest.rewards.map((reward, index) => (
                <div
                    key={`${reward.type}-${reward.index ?? index}`}
                    className="flex min-h-[46px] items-center gap-2 rounded border border-amber-300/35 bg-[linear-gradient(180deg,rgba(245,158,11,0.12),rgba(0,0,0,0.22))] px-3 py-1.5 text-xs font-semibold text-amber-100"
                >
                    <QuestRewardIcon reward={reward} objectsDB={objectsDB} graphicsDB={graphicsDB} />
                    <span>
                        {formatAmount(reward.amount)} {reward.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function questListIcon(quest: QuestEntryState) {
    if (quest.objectives.some((objective) => objective.type === "item")) {
        return Package;
    }
    if (quest.objectives.length > 1) {
        return Swords;
    }
    if (quest.objectives.some((objective) => objective.type === "npc")) {
        return Skull;
    }
    return ScrollText;
}

function openQuestNpcsWiki(quest: QuestEntryState) {
    const npcs = quest.objectives.filter((objective) => objective.type === "npc");
    const path = npcs.length === 1 ? `/wiki/npcs/${npcs[0].index}` : "/wiki/npcs";
    window.open(path, "_blank", "noopener,noreferrer");
}

function QuestNpcDialog({
    quests,
    objectsDB,
    graphicsDB,
    onClose,
    onSendCommand,
}: {
    quests: QuestEntryState[];
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
    onClose: () => void;
    onSendCommand?: (message: string) => void;
}) {
    const [query, setQuery] = React.useState("");
    const [selectedQuestId, setSelectedQuestId] = React.useState<number | null>(null);
    const activeCount = quests.filter((quest) => quest.status === "active" || quest.status === "ready").length;
    const normalizedQuery = normalizeSearchText(query);
    const visibleQuests = quests.filter((quest) => {
        if (!normalizedQuery) {
            return true;
        }

        const haystack = normalizeSearchText(
            [quest.name, quest.desc, quest.npcName ?? "", ...quest.objectives.map((objective) => objective.name)].join(" "),
        );
        return haystack.includes(normalizedQuery);
    });
    const selectedQuest =
        visibleQuests.find((quest) => quest.id === selectedQuestId) ??
        visibleQuests.find((quest) => quest.status !== "locked") ??
        visibleQuests[0] ??
        null;
    const locked = selectedQuest?.status === "locked";
    const ready = selectedQuest?.status === "ready";
    const available = selectedQuest?.status === "available";
    const atCap = activeCount >= 3 && available;
    const canAccept = Boolean(selectedQuest && available && !atCap);
    const canTurnIn = Boolean(selectedQuest && ready);
    const npcObjectives = selectedQuest?.objectives.filter((objective) => objective.type === "npc") ?? [];
    const primaryLabel = canTurnIn
        ? "Entregar misión"
        : atCap
          ? "Máximo 3 misiones"
          : locked
            ? "Nivel insuficiente"
            : available
              ? "Aceptar misión"
              : selectedQuest?.status === "active"
                ? "En curso"
                : "";

    const handlePrimary = () => {
        if (!selectedQuest) {
            return;
        }

        if (canTurnIn) {
            onSendCommand?.(`/questentregar ${selectedQuest.id}`);
            return;
        }

        if (canAccept) {
            onSendCommand?.(`/questaceptar ${selectedQuest.id}`);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[84] flex items-center justify-center bg-black/75 px-3 py-4"
            onClick={onClose}
        >
            <div
                className="relative flex h-[min(780px,calc(100vh-20px))] w-[min(1180px,calc(100vw-20px))] flex-col overflow-hidden rounded-[22px] border-[3px] border-[#d7b56a] bg-[#120c08] text-[#f4e7c8] shadow-[0_30px_90px_rgba(0,0,0,0.78),inset_0_0_0_8px_#5a3a1d,inset_0_0_0_10px_#24150c]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="pointer-events-none absolute inset-x-8 top-0 h-[3px] bg-[linear-gradient(90deg,transparent,#f0d48a,transparent)]" />
                <div className="relative flex items-center justify-between gap-4 border-b border-[#8a6234]/40 bg-[linear-gradient(180deg,#5a3918,#2a170c)] px-6 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-11 w-11 place-items-center rounded-full border border-[#f0d48a]/50 bg-[radial-gradient(circle_at_50%_30%,#7a4e22,#3a2412)] text-[#f0d48a] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                            <ScrollText aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                        </span>
                        <div className="min-w-0">
                            <h2 className="font-serif text-[28px] font-bold leading-none tracking-wide text-[#f0d48a] [text-shadow:0_2px_0_#3a2412]">
                                Misiones
                            </h2>
                            <p className="mt-1 truncate text-xs text-[#d7c4a2]/80">
                                Acepta misiones, completa los objetivos y reclama tus recompensas.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-[#f0c27a] bg-[linear-gradient(180deg,#b33a32,#6e1d1a)] text-[#f8e7c4] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                        aria-label="Cerrar misiones"
                    >
                        <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.6} />
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="flex min-h-0 flex-col border-r border-[#5c3d22] bg-[#0d0907] p-3">
                        <label className="flex items-center gap-2 rounded-md border border-[#5c4630] bg-[#16100c] px-3 py-2 text-sm text-[#b7a48a] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                            <Search aria-hidden="true" className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                            <input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar misión, monstruo o NPC..."
                                className="w-full bg-transparent text-[#f4e7c8] outline-none placeholder:text-[#8d7b66]"
                            />
                            {query ? (
                                <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
                                    <X aria-hidden="true" className="h-3.5 w-3.5 text-[#8d7b66]" strokeWidth={2.2} />
                                </button>
                            ) : null}
                        </label>
                        <div className="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
                            {visibleQuests.length ? (
                                visibleQuests.map((quest) => {
                                    const isLocked = quest.status === "locked";
                                    const isSelected = selectedQuest?.id === quest.id;
                                    const Icon = questListIcon(quest);
                                    return (
                                        <button
                                            key={quest.id}
                                            type="button"
                                            onClick={() => setSelectedQuestId(quest.id)}
                                            className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left ${
                                                isSelected
                                                    ? "bg-[linear-gradient(180deg,#2a5f9a,#1a3f6e)] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                                                    : "hover:bg-white/[0.04]"
                                            }`}
                                        >
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#6b4a28]/70 bg-black/35 text-[#f0d48a]">
                                                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className={`block truncate text-sm font-semibold ${isLocked ? "text-[#ff8b8b]" : "text-[#f4e7c8]"}`}>
                                                    {quest.name}
                                                </span>
                                                <span className={`mt-0.5 block text-[11px] ${isLocked ? "text-[#ff8b8b]/80" : "text-[#cbb896]/80"}`}>
                                                    Nivel {quest.requiredLevel}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="px-2 py-6 text-center text-sm text-[#b7a48a]">No hay misiones para mostrar.</p>
                            )}
                        </div>
                    </aside>

                    <section className="flex min-h-0 flex-col bg-[radial-gradient(1200px_420px_at_80%_0%,rgba(184,138,64,0.12),transparent_58%),linear-gradient(180deg,#1b130e,#100c09)]">
                        {selectedQuest ? (
                            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className={`min-w-0 font-serif text-[34px] font-bold leading-tight ${locked ? "text-[#ff8b8b]" : "text-[#f0d48a]"} [text-shadow:0_2px_0_#2a1a10]`}>
                                        {selectedQuest.name}
                                    </h3>
                                    <span className="shrink-0 rounded-sm bg-[linear-gradient(180deg,#b4332c,#7a1c18)] px-3 py-1 text-xs font-bold tracking-wide text-[#f8e7c4] shadow-[0_8px_16px_rgba(0,0,0,0.35)] [clip-path:polygon(8px_0,100%_0,100%_100%,8px_100%,0_50%)]">
                                        Nivel mínimo: {selectedQuest.requiredLevel}
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <p className="flex items-center gap-2 text-sm font-bold text-[#f0d48a]">
                                        <BookOpen aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                        Descripción
                                    </p>
                                    <p className="mt-2 max-w-[58ch] text-sm leading-7 text-[#d7c4a2]">{selectedQuest.desc}</p>
                                </div>

                                <div className="mt-6">
                                    <p className="flex items-center gap-2 text-sm font-bold text-[#f0d48a]">
                                        <Target aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                        Requisitos
                                    </p>
                                    <div className="mt-3 max-w-[420px] space-y-2">
                                        {selectedQuest.objectives.length ? (
                                            selectedQuest.objectives.map((objective) => {
                                                const complete = objective.current >= objective.amount;
                                                return (
                                                    <div key={`${objective.type}-${objective.index}`} className="flex items-center justify-between gap-3 text-sm">
                                                        <span className="flex min-w-0 items-center gap-2 text-[#e8d7b5]">
                                                            {objective.type === "npc" ? (
                                                                <Skull aria-hidden="true" className="h-4 w-4 shrink-0 text-[#cbb896]" strokeWidth={1.8} />
                                                            ) : (
                                                                <Package aria-hidden="true" className="h-4 w-4 shrink-0 text-[#cbb896]" strokeWidth={1.8} />
                                                            )}
                                                            <span className="truncate">{objective.name}</span>
                                                        </span>
                                                        <span className={`font-semibold tabular-nums ${complete ? "text-emerald-300" : "text-[#f0d48a]"}`}>
                                                            {formatAmount(objective.current)} / {formatAmount(objective.amount)}
                                                        </span>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm text-[#b7a48a]">No hay requisitos listados para esta misión.</p>
                                        )}
                                    </div>
                                    {npcObjectives.length ? (
                                        <button
                                            type="button"
                                            onClick={() => openQuestNpcsWiki(selectedQuest)}
                                            className="mt-3 inline-flex items-center gap-2 rounded-md border border-[#8a6234]/80 bg-black/25 px-3 py-1.5 text-xs font-semibold text-[#f0d48a] transition hover:border-[#f0d48a] hover:bg-black/40"
                                        >
                                            <MapPin aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                                            Dónde encontrar estos NPCs
                                            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
                                        </button>
                                    ) : null}
                                </div>

                                <div className="mt-6">
                                    <p className="flex items-center gap-2 text-sm font-bold text-[#f0d48a]">
                                        <Gift aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                        Recompensa
                                    </p>
                                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                                        {selectedQuest.rewards.map((reward, index) => (
                                            <div
                                                key={`${reward.type}-${reward.index ?? index}`}
                                                className="flex min-h-[118px] flex-col items-center justify-center rounded-md border border-[#8a6234]/70 bg-[linear-gradient(180deg,rgba(48,32,18,0.92),rgba(16,10,7,0.96))] px-2 py-3 text-center shadow-[inset_0_1px_0_rgba(240,212,138,0.12)]"
                                            >
                                                <QuestRewardIcon
                                                    reward={reward}
                                                    objectsDB={objectsDB}
                                                    graphicsDB={graphicsDB}
                                                    size={46}
                                                />
                                                <p className="mt-2 text-sm font-bold text-[#f8e7c4]">{formatAmount(reward.amount)}</p>
                                                <p className="text-[11px] text-[#cbb896]">{reward.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#b7a48a]">
                                No quedan misiones pendientes.
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-3 border-t border-[#5c3d22] bg-[#140e0a] px-5 py-3">
                            <p className="text-xs font-semibold text-[#cbb896]">Misiones activas: {activeCount}/3</p>
                            <div className="flex gap-2">
                                {primaryLabel ? (
                                    <button
                                        type="button"
                                        disabled={!canAccept && !canTurnIn}
                                        onClick={handlePrimary}
                                        className="flex min-h-[42px] min-w-[176px] items-center justify-center gap-2 rounded-md border border-[#b6f0c4] bg-[linear-gradient(180deg,#3ec45c,#1f8a3a)] px-4 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] disabled:cursor-not-allowed disabled:border-[#6d6d6d] disabled:bg-[#4a4a4a] disabled:bg-none disabled:text-[#cfcfcf]"
                                    >
                                        <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
                                        {primaryLabel}
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex min-h-[42px] min-w-[118px] items-center justify-center gap-2 rounded-md border border-[#f0c2c2] bg-[linear-gradient(180deg,#c4473e,#7a1f1c)] px-4 text-sm font-bold text-white"
                                >
                                    <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.4} />
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
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
                    compact ? "min-h-0" : "min-h-[68px]"
                }`}
            >
                <Gift aria-hidden="true" className={compact ? "h-4 w-4" : "h-6 w-6"} strokeWidth={1.6} />
            </div>
        );
    }

    const targetSize = compact ? 30 : 46;
    const scale = Math.min(
        compact ? 1.1 : 1.55,
        targetSize / Math.max(graphicData.width, graphicData.height, 1),
    );

    return (
        <div
            className={`relative h-full w-full overflow-hidden rounded border border-amber-300/20 bg-[radial-gradient(circle_at_50%_42%,rgba(245,186,71,0.18),rgba(0,0,0,0.3)_58%)] ${
                compact ? "min-h-0" : "min-h-[68px]"
            }`}
        >
            <div
                aria-label={name}
                className="absolute left-1/2 top-1/2 bg-no-repeat drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)]"
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

function RankedHelpButton({ label }: { label: string }) {
    return (
        <button
            type="button"
            title={label}
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-300/45 bg-black/35 text-[12px] font-black leading-none text-amber-200 transition hover:border-amber-200 hover:bg-amber-300/12"
            aria-label={label}
        >
            ?
        </button>
    );
}

function RankedRankBadge({
    rank,
    compact = false,
}: {
    rank: RankedLeaderboardEntryPayload["rank"];
    compact?: boolean;
}) {
    const visual = getRankTierVisual(rank.tier);

    return (
        <span className="inline-flex min-w-0 items-center gap-2">
            <Image
                src={visual.asset}
                alt=""
                width={compact ? 24 : 32}
                height={compact ? 24 : 32}
                className={compact ? "h-6 w-6 object-contain" : "h-8 w-8 object-contain"}
                draggable={false}
                unoptimized
            />
            <span
                className={compact ? "truncate text-xs font-semibold" : "truncate text-sm font-semibold"}
                style={{ color: visual.textColor }}
            >
                {rank.label}
            </span>
        </span>
    );
}

function MountGraphic({
    mount,
    objectsDB,
    graphicsDB,
    compact = false,
}: {
    mount: Pick<MountStateEntry, "name" | "itemId">;
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
    compact?: boolean;
}) {
    const graphicData = resolveObjectGraphic(mount.itemId, objectsDB, graphicsDB);
    const targetSize = compact ? 30 : 96;
    const iconOffset = compact ? { x: 0, y: 0 } : (MOUNT_ICON_OFFSETS[Number(mount.itemId)] ?? { x: 0, y: 0 });
    const frameClass = compact ? "h-full w-full" : "h-full min-h-[72px] w-full";

    if (!graphicData?.numFile) {
        return (
            <div className={`flex items-center justify-center rounded border border-amber-300/15 bg-black/30 text-amber-200/60 ${frameClass}`}>
                <PawPrint aria-hidden="true" className={compact ? "h-5 w-5" : "h-12 w-12"} strokeWidth={1.6} />
            </div>
        );
    }

    const scale = Math.min(compact ? 1 : 2.45, targetSize / Math.max(graphicData.width, graphicData.height, 1));
    return (
        <div className={`relative overflow-hidden rounded border border-amber-300/18 bg-[radial-gradient(circle_at_50%_45%,rgba(245,186,71,0.16),rgba(0,0,0,0.32)_60%)] ${frameClass}`}>
            <div
                aria-label={mount.name}
                className={`absolute left-1/2 top-1/2 bg-no-repeat [image-rendering:pixelated] ${compact ? "" : "drop-shadow-[0_12px_18px_rgba(0,0,0,0.58)]"}`}
                style={{
                    width: graphicData.width,
                    height: graphicData.height,
                    backgroundImage: `url(${getTexturePath(graphicData)})`,
                    backgroundPosition: `-${graphicData.sX}px -${graphicData.sY}px`,
                    transform: `translate(calc(-50% + ${iconOffset.x}px), calc(-50% + ${iconOffset.y}px)) scale(${scale})`,
                    transformOrigin: "center",
                }}
            />
        </div>
    );
}

function MountStat({
    icon,
    label,
    value,
    canAssign = false,
    onAssign,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    canAssign?: boolean;
    onAssign?: () => void;
}) {
    return (
        <div className="flex items-center justify-between gap-2 border-b border-white/8 px-1 py-1 text-[11px]">
            <span className="flex min-w-0 items-center gap-2 text-stone-300">
                <span className="text-amber-200">{icon}</span>
                <span className="truncate">{label}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1">
                <span className="font-semibold text-stone-100">{formatAmount(value)}</span>
                {canAssign ? (
                    <button
                        type="button"
                        onClick={onAssign}
                        className="grid h-5 w-5 place-items-center rounded border border-amber-300/50 bg-amber-300/12 text-amber-100 transition hover:bg-amber-300/24"
                        title={`Asignar punto a ${label}`}
                    >
                        <Plus aria-hidden="true" className="h-3 w-3" strokeWidth={2} />
                    </button>
                ) : null}
            </span>
        </div>
    );
}

function MountExperienceBar({ mount }: { mount: MountStateEntry }) {
    const progress =
        mount.expRequired > 0 ? Math.max(0, Math.min(1, mount.exp / Math.max(1, mount.expRequired))) : 1;

    return (
        <div className="mt-3">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                <span className="text-stone-100">Nivel {mount.level}</span>
                <span className="text-stone-300">
                    {mount.expRequired > 0
                        ? `${formatAmount(mount.exp)} / ${formatAmount(mount.expRequired)} EXP`
                        : "Nivel maximo"}
                </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#322a25]">
                <div className="h-full bg-[linear-gradient(90deg,#f7c84f,#ffe084)]" style={{ width: `${progress * 100}%` }} />
            </div>
        </div>
    );
}

function MountHubTab({
    ownedMounts,
    selectedMount,
    setSelectedMountId,
    objectsDB,
    graphicsDB,
    onSendCommand,
}: {
    ownedMounts: MountStateEntry[];
    selectedMount: MountStateEntry | null;
    setSelectedMountId: React.Dispatch<React.SetStateAction<string | null>>;
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
    onSendCommand?: (message: string) => void;
}) {
    const selectedRef = selectedMount?.shortId || selectedMount?.id || "";
    const activeOwner = selectedMount?.mounted || selectedMount?.active ? "Mi Personaje" : "-";
    const canAssignStats = Number(selectedMount?.freeStatPoints ?? 0) > 0;
    const assignMountStat = React.useCallback(
        (stat: string) => {
            if (!selectedRef) {
                return;
            }

            onSendCommand?.(`/monturastat ${selectedRef} ${stat}`);
        },
        [onSendCommand, selectedRef],
    );

    return (
        <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(270px,0.9fr)_minmax(390px,1.25fr)_minmax(260px,0.85fr)]">
            <section className="flex min-h-0 flex-col rounded border border-amber-200/10 bg-black/30">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                        Mis monturas
                    </p>
                    <span className="text-xs font-semibold text-stone-100">{ownedMounts.length}/12</span>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    {ownedMounts.length ? (
                        <div className="space-y-1.5">
                            {ownedMounts.map((mount) => {
                                const selected = selectedMount?.id === mount.id;
                                const progress =
                                    mount.expRequired > 0
                                        ? Math.max(0, Math.min(1, mount.exp / Math.max(1, mount.expRequired)))
                                        : 1;
                                return (
                                    <button
                                        key={mount.id}
                                        type="button"
                                        onClick={() => setSelectedMountId(mount.id)}
                                        className={`grid w-full grid-cols-[42px_minmax(0,1fr)_100px] gap-2 rounded border p-1.5 text-left transition ${
                                            selected
                                                ? "border-amber-300/80 bg-[linear-gradient(90deg,rgba(245,158,11,0.18),rgba(0,0,0,0.08))]"
                                                : "border-transparent bg-white/[0.03] hover:border-stone-600/70 hover:bg-white/[0.06]"
                                        }`}
                                    >
                                        <div className="h-[38px] w-[38px] overflow-hidden">
                                            <MountGraphic mount={mount} objectsDB={objectsDB} graphicsDB={graphicsDB} compact />
                                        </div>
                                        <div className="min-w-0 self-center">
                                            <p className="truncate text-sm font-semibold leading-5 text-stone-50">{mount.name}</p>
                                            <p className="text-xs leading-4 text-stone-300">Nivel {mount.level}</p>
                                        </div>
                                        <div className="self-center">
                                            <div className="flex justify-end text-[11px] leading-4 text-stone-200">
                                                <span>
                                                    {formatAmount(mount.exp)} / {formatAmount(mount.expRequired || 0)} EXP
                                                </span>
                                            </div>
                                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#332c27]">
                                                <div
                                                    className="h-full bg-[linear-gradient(90deg,#8df26a,#f8d65b)]"
                                                    style={{ width: `${progress * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex h-full min-h-[250px] items-center justify-center px-4 text-center text-sm text-stone-400">
                            No tenes monturas todavia.
                        </div>
                    )}
                </div>
            </section>

            <section className="flex min-h-0 flex-col rounded border border-amber-200/10 bg-black/24">
                {selectedMount ? (
                    <>
                        <div className="flex items-start justify-between gap-4 px-4 pt-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                    Montura
                                </p>
                                <h3 className="mt-1 truncate text-xl font-semibold leading-tight text-stone-50">
                                    {selectedMount.name}
                                </h3>
                            </div>
                            {selectedMount.active ? (
                                <span className="shrink-0 text-sm font-semibold text-emerald-300">
                                    <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
                                    Activa
                                </span>
                            ) : null}
                        </div>

                        <div className="min-h-0 flex-1 p-4 pt-2">
                            <div className="grid gap-3 md:grid-cols-[minmax(210px,1fr)_134px]">
                                <div className="min-w-0">
                                    <div className="h-[92px]">
                                        <MountGraphic mount={selectedMount} objectsDB={objectsDB} graphicsDB={graphicsDB} />
                                    </div>
                                    <MountExperienceBar mount={selectedMount} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onSendCommand?.(`/activarmontura ${selectedRef}`)}
                                        className="min-h-[38px] rounded border border-amber-300/60 bg-amber-400/24 px-4 text-sm font-semibold text-amber-50 transition hover:bg-amber-400/32"
                                    >
                                        Montar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const nextName = window.prompt("Nuevo nombre", selectedMount.name)?.trim();
                                            if (nextName) {
                                                onSendCommand?.(`/renombrarmontura ${selectedRef} ${nextName}`);
                                            }
                                        }}
                                        className="min-h-[38px] rounded border border-stone-600/70 px-4 text-sm font-semibold text-stone-100 transition hover:border-stone-400"
                                    >
                                        Renombrar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm(`Liberar a ${selectedMount.name}?`)) {
                                                onSendCommand?.(`/liberarmontura ${selectedRef}`);
                                            }
                                        }}
                                        className="min-h-[38px] rounded border border-stone-600/70 px-4 text-sm font-semibold text-stone-100 transition hover:border-stone-400"
                                    >
                                        Liberar
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 rounded border border-amber-200/10 bg-black/24 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                        Estadisticas
                                    </p>
                                    <span className="text-xs font-semibold text-amber-100">
                                        Puntos libres: {formatAmount(selectedMount.freeStatPoints)}
                                    </span>
                                </div>
                                <div className="mt-2 grid gap-x-6 sm:grid-cols-2">
                                    <MountStat icon={<Target className="h-4 w-4" />} label="Daño a NPCs" value={selectedMount.npcDamage} />
                                    <MountStat icon={<Swords className="h-4 w-4" />} label="Atk. cuerpo" value={selectedMount.meleeAttack} canAssign={canAssignStats} onAssign={() => assignMountStat("cuerpo")} />
                                    <MountStat icon={<Shield className="h-4 w-4" />} label="Def. cuerpo" value={selectedMount.meleeDefense} canAssign={canAssignStats} onAssign={() => assignMountStat("defcuerpo")} />
                                    <MountStat icon={<Swords className="h-4 w-4" />} label="Atk. proyectiles" value={selectedMount.rangedAttack} canAssign={canAssignStats} onAssign={() => assignMountStat("proyectiles")} />
                                    <MountStat icon={<Shield className="h-4 w-4" />} label="Def. proyectiles" value={selectedMount.rangedDefense} canAssign={canAssignStats} onAssign={() => assignMountStat("defproyectiles")} />
                                    <MountStat icon={<Sparkles className="h-4 w-4" />} label="Atk. magico" value={selectedMount.magicAttack} canAssign={canAssignStats} onAssign={() => assignMountStat("magia")} />
                                    <MountStat icon={<Shield className="h-4 w-4" />} label="Def. magica" value={selectedMount.magicDefense} canAssign={canAssignStats} onAssign={() => assignMountStat("defmagia")} />
                                    <MountStat icon={<Activity className="h-4 w-4" />} label="Evasion" value={selectedMount.evasion} canAssign={canAssignStats} onAssign={() => assignMountStat("evasion")} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full min-h-[360px] items-center justify-center text-center text-sm text-stone-400">
                        Selecciona una montura para ver sus estadisticas.
                    </div>
                )}
            </section>

            <aside className="grid min-h-0 grid-rows-[auto_1fr] gap-3">
                <div className="rounded border border-amber-200/10 bg-black/26">
                    <div className="border-b border-white/10 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                            Información
                        </p>
                    </div>
                    <div className="p-3">
                        {selectedMount ? (
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                                    <span className="text-stone-400">Nombre</span>
                                    <span className="text-right text-stone-100">{selectedMount.name}</span>
                                </div>
                                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                                    <span className="text-stone-400">Nivel</span>
                                    <span className="text-stone-100">{selectedMount.level} / {selectedMount.maxLevel}</span>
                                </div>
                                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                                    <span className="text-stone-400">Experiencia</span>
                                    <span className="text-right text-stone-100">
                                        {formatAmount(selectedMount.exp)}
                                        {selectedMount.expRequired ? ` / ${formatAmount(selectedMount.expRequired)}` : ""}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                                    <span className="text-stone-400">Daño a NPCs</span>
                                    <span className="text-stone-100">{formatAmount(selectedMount.npcDamage)}</span>
                                </div>
                                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                                    <span className="text-stone-400">Puntos libres</span>
                                    <span className="text-stone-100">{formatAmount(selectedMount.freeStatPoints)}</span>
                                </div>
                                <div className="flex justify-between gap-3 border-b border-white/10 pb-1.5">
                                    <span className="text-stone-400">Dueño</span>
                                    <span className="text-stone-100">{activeOwner}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span className="text-stone-400">ID</span>
                                    <span className="text-stone-100">#{selectedMount.shortId}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-stone-400">Sin montura seleccionada.</p>
                        )}
                    </div>
                </div>

                <div className="rounded border border-amber-200/10 bg-black/26">
                    <div className="border-b border-white/10 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                            Talentos obtenidos
                        </p>
                    </div>
                    <div className="p-3">
                        {selectedMount ? (
                            <div className="grid gap-2">
                                {[10, 20, 30].map((milestone) => {
                                    const perk = selectedMount.perks.find((entry) => entry.milestone === milestone);
                                    const unlocked = selectedMount.level >= milestone;
                                    return (
                                        <div
                                            key={milestone}
                                            className="grid grid-cols-[62px_minmax(0,1fr)] gap-2 rounded border border-white/10 bg-white/[0.025] px-3 py-2 text-xs"
                                        >
                                            <span className="text-stone-300">Nivel {milestone}</span>
                                            <div className="min-w-0">
                                                <p className={perk ? "font-semibold text-amber-100" : "text-stone-400"}>
                                                    {perk?.label ?? (unlocked ? "Sin talento" : "Sin descubrir")}
                                                </p>
                                                {!unlocked ? (
                                                    <p className="mt-0.5 text-[11px] text-stone-500">
                                                        Se obtiene al llegar al nivel {milestone}.
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : null}
                    </div>
                </div>
            </aside>
        </div>
    );
}

export default function WoaoHubModal({
    tab,
    mapId,
    questState,
    mountState,
    rankedState,
    questDialog,
    questPoints = 0,
    donationPoints = 0,
    auctionPanel,
    onTabChange,
    onClose,
    onOpenAuctionHouse,
    onSendCommand,
}: WoaoHubModalProps) {
    const [premios, setPremios] = React.useState<PremioDef[]>([]);
    const [donacionPremios, setDonacionPremios] = React.useState<PremioDef[]>([]);
    const [routes, setRoutes] = React.useState<TravelRoute[]>([]);
    const [dungeonRoutes, setDungeonRoutes] = React.useState<DungeonTravelRoute[]>([]);
    const [travelSection, setTravelSection] = React.useState<"ciudades" | "dungeons">("ciudades");
    const [graphicsDB, setGraphicsDB] = React.useState<Record<string, GraphicData> | null>(null);
    const [objectsDB, setObjectsDB] = React.useState<ObjectsDB | null>(null);
    const [premioCurrency, setPremioCurrency] = React.useState<PremioCurrency>("quest");
    const [premioSearch, setPremioSearch] = React.useState("");
    const [selectedPremioId, setSelectedPremioId] = React.useState<number | null>(null);
    const [premioQuantities, setPremioQuantities] = React.useState<Record<string, number>>({});
    const [selectedMountId, setSelectedMountId] = React.useState<string | null>(null);
    const [rankedMode, setRankedMode] = React.useState<"1v1" | "2v2">("1v1");
    const [rankedSearch, setRankedSearch] = React.useState("");
    const [eventCategoryFilter, setEventCategoryFilter] = React.useState<EventCategoryFilter>("all");
    const [selectedEventDetail, setSelectedEventDetail] = React.useState<AutomaticEvent | null>(null);
    const [eventScheduleAnchor] = React.useState(() => Date.now());
    const [eventClockNow, setEventClockNow] = React.useState(() => Date.now());
    const requestedAuctionPanelRef = React.useRef(false);

    React.useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const [premioRes, donacionRes, travelRes, dungeonRes] = await Promise.all([
                fetch("/init/woao/premios.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/donaciones.json").then((res) => res.json()).catch(() => ({})),
                fetch("/init/woao/fastTravel.json").then((res) => res.json()).catch(() => []),
                fetch("/init/woao/dungeonTravel.json").then((res) => res.json()).catch(() => []),
            ]);

            if (cancelled) {
                return;
            }

            setPremios(Object.values(premioRes ?? {}) as PremioDef[]);
            setDonacionPremios(Object.values(donacionRes ?? {}) as PremioDef[]);
            setRoutes(Array.isArray(travelRes) ? travelRes : []);
            setDungeonRoutes(Array.isArray(dungeonRes) ? dungeonRes : []);
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

    React.useEffect(() => {
        if (tab !== "eventos") {
            return;
        }

        setEventClockNow(Date.now());
        const intervalId = window.setInterval(() => {
            setEventClockNow(Date.now());
        }, 30_000);

        return () => window.clearInterval(intervalId);
    }, [tab]);

    React.useEffect(() => {
        if (tab !== "subastas") {
            requestedAuctionPanelRef.current = false;
            return;
        }

        if (requestedAuctionPanelRef.current) {
            return;
        }

        requestedAuctionPanelRef.current = true;
        if (onOpenAuctionHouse) {
            onOpenAuctionHouse();
        } else {
            onSendCommand?.("/subastas");
        }
    }, [onOpenAuctionHouse, onSendCommand, tab]);

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
    const selectedRankedModeKey: RankedMode = rankedMode === "1v1" ? "RANKED_1V1" : "RANKED_2V2";
    const selectedRankedState = rankedState?.modes[selectedRankedModeKey] ?? null;
    const selectedRankedRank = selectedRankedState?.rank ?? null;
    const selectedRankedQueue = rankedState?.queue?.mode === selectedRankedModeKey ? rankedState.queue : null;
    const selectedRankedMatch = rankedState?.match?.mode === selectedRankedModeKey ? rankedState.match : null;
    const rankedConfirmation = rankedState?.confirmation ?? null;
    const selectedRankedConfirmation =
        rankedConfirmation?.mode === selectedRankedModeKey ? rankedConfirmation : null;
    const selectedRankedProgress = selectedRankedRank?.progress ?? { current: 0, required: 100, ratio: 0 };
    const selectedRankedWinrate =
        selectedRankedState && selectedRankedState.matchesPlayed > 0
            ? Math.round((selectedRankedState.wins / selectedRankedState.matchesPlayed) * 100)
            : 0;
    const selectedRankedVisual = getRankTierVisual(selectedRankedRank?.tier);
    const selectedRankedLeaderboard = rankedState?.leaderboards?.[selectedRankedModeKey] ?? null;
    const selectedRankedEntries = React.useMemo(
        () => selectedRankedLeaderboard?.entries ?? [],
        [selectedRankedLeaderboard?.entries],
    );
    const normalizedRankedSearch = normalizeSearchText(rankedSearch.trim());
    const visibleRankedEntries = React.useMemo(() => {
        if (!normalizedRankedSearch) {
            return selectedRankedEntries;
        }

        return selectedRankedEntries.filter((entry) => {
            const haystack = normalizeSearchText(
                `${entry.position} ${entry.characterName} ${entry.clanName ?? ""} ${entry.rank.label} ${entry.elo}`,
            );
            return haystack.includes(normalizedRankedSearch);
        });
    }, [normalizedRankedSearch, selectedRankedEntries]);
    const ownRankedEntry: RankedLeaderboardEntryPayload | null =
        selectedRankedLeaderboard?.selfEntry ??
        (selectedRankedState
            ? {
                  position: 0,
                  characterId: "",
                  characterName: "Tu personaje",
                  clanName: null,
                  elo: selectedRankedState.elo,
                  wins: selectedRankedState.wins,
                  losses: selectedRankedState.losses,
                  matchesPlayed: selectedRankedState.matchesPlayed,
                  winStreak: selectedRankedState.winStreak,
                  bestWinStreak: selectedRankedState.bestWinStreak,
                  highestElo: selectedRankedState.highestElo,
                  winrate: selectedRankedWinrate,
                  rank: selectedRankedRank ?? getRankFromElo(selectedRankedState.elo),
              }
            : null);
    const automaticEvents = React.useMemo(
        () => buildAutomaticEvents(eventScheduleAnchor, eventClockNow),
        [eventClockNow, eventScheduleAnchor],
    );
    const visibleAutomaticEvents = React.useMemo(() => {
        return automaticEvents
            .filter((event) => eventCategoryFilter === "all" || event.category === eventCategoryFilter)
            .sort((a, b) => {
                const aClosed = resolveEventStatus(a, eventClockNow) === "closed" ? 1 : 0;
                const bClosed = resolveEventStatus(b, eventClockNow) === "closed" ? 1 : 0;

                if (aClosed !== bClosed) {
                    return aClosed - bClosed;
                }

                return a.startsAt - b.startsAt;
            });
    }, [automaticEvents, eventCategoryFilter, eventClockNow]);

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

    const handleEventAction = React.useCallback(
        (event: AutomaticEvent) => {
            const command = event.actionData?.command;

            switch (event.actionType) {
                case "join":
                case "teleport":
                case "track":
                    if (command) {
                        onSendCommand?.(command);
                    }
                    break;
                case "open_panel":
                    if (event.actionData?.targetTab) {
                        onTabChange(event.actionData.targetTab);
                    }
                    break;
                case "details":
                    if (command) {
                        onSendCommand?.(command);
                    }
                    setSelectedEventDetail(event);
                    break;
                default:
                    setSelectedEventDetail(event);
                    break;
            }
        },
        [onSendCommand, onTabChange],
    );

    React.useEffect(() => {
        if (selectedPremioId && activePremios.some((premio) => premio.id === selectedPremioId)) {
            return;
        }

        setSelectedPremioId(activePremios[0]?.id ?? null);
    }, [activePremios, selectedPremioId]);

    const visibleQuestEntries = React.useMemo(() => {
        return questState?.active ?? [];
    }, [questState?.active]);
    const [selectedQuestId, setSelectedQuestId] = React.useState<number | null>(null);
    const selectedQuest =
        visibleQuestEntries.find((entry) => entry.id === selectedQuestId) ?? visibleQuestEntries[0] ?? null;

    React.useEffect(() => {
        if (selectedQuestId && visibleQuestEntries.some((entry) => entry.id === selectedQuestId)) {
            return;
        }

        setSelectedQuestId(visibleQuestEntries[0]?.id ?? null);
    }, [selectedQuestId, visibleQuestEntries]);

    const ownedMounts = React.useMemo(() => mountState?.mounts ?? [], [mountState?.mounts]);
    const selectedMount =
        ownedMounts.find((mount) => mount.id === selectedMountId) ??
        ownedMounts.find((mount) => mount.active) ??
        ownedMounts[0] ??
        null;

    React.useEffect(() => {
        if (selectedMountId && ownedMounts.some((mount) => mount.id === selectedMountId)) {
            return;
        }

        setSelectedMountId(ownedMounts.find((mount) => mount.active)?.id ?? ownedMounts[0]?.id ?? null);
    }, [ownedMounts, selectedMountId]);

    const hubHeightClass =
        tab === "eventos"
            ? "h-[min(760px,calc(100vh-32px))]"
            : tab === "subastas"
              ? "h-[min(760px,calc(100vh-32px))]"
            : tab === "ranked"
              ? "h-[min(820px,calc(100vh-24px))]"
            : tab === "premios"
              ? "h-[min(820px,calc(100vh-24px))]"
            : tab === "montura"
              ? "h-[min(680px,calc(100vh-32px))]"
            : tab === "viajes"
              ? "h-[min(680px,calc(100vh-32px))]"
              : "h-[min(620px,calc(100vh-32px))]";
    const hubWidthClass =
        tab === "eventos"
            ? "md:w-[min(1140px,calc(100vw-32px))]"
            : tab === "subastas"
              ? "md:w-[min(1280px,calc(100vw-32px))]"
            : tab === "ranked"
              ? "md:w-[min(1420px,calc(100vw-28px))]"
            : tab === "premios"
              ? "md:w-[min(1320px,calc(100vw-28px))]"
              : tab === "montura"
                ? "md:w-[min(1220px,calc(100vw-32px))]"
                : tab === "misiones"
                  ? ""
                : tab === "viajes"
                  ? "md:w-[min(860px,calc(100vw-32px))]"
                  : "md:w-[min(620px,calc(100vw-32px))]";
    const contentOverflowClass =
        tab === "premios" || tab === "ranked" || tab === "montura" || tab === "eventos" || tab === "subastas" || tab === "viajes" ? "overflow-hidden" : "overflow-y-auto";

    if (tab === "misiones" && questDialog) {
        return (
            <QuestNpcDialog
                quests={questDialog}
                objectsDB={objectsDB}
                graphicsDB={graphicsDB}
                onClose={onClose}
                onSendCommand={onSendCommand}
            />
        );
    }

    return (
        <div
            className="fixed inset-0 z-[84] flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]"
            onClick={onClose}
        >
            <div
                className={`flex ${hubHeightClass} w-[min(900px,calc(100vw-32px))] flex-col overflow-hidden rounded border border-amber-200/20 bg-[#120c08]/96 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.6)] ${hubWidthClass}`}
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
                    className={`min-h-0 flex-1 px-4 py-3 text-sm text-[#f2e5ca] ${contentOverflowClass}`}
                >
                    {tab === "misiones" ? (
                        <div className="grid h-full min-h-0 gap-3 md:grid-cols-[minmax(220px,0.85fr)_minmax(280px,1.15fr)]">
                            <div className="flex min-h-0 flex-col rounded border border-amber-200/10 bg-black/32">
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

                                <div className="min-h-0 flex-1 overflow-y-auto p-2">
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

                            <div className="min-h-0 overflow-hidden rounded border border-amber-200/10 bg-black/28">
                                {selectedQuest ? (
                                    <div className="h-full overflow-y-auto p-4">
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
                                        <QuestRewardPills
                                            quest={selectedQuest}
                                            objectsDB={objectsDB}
                                            graphicsDB={graphicsDB}
                                        />

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
                                                    onClick={() => onSendCommand?.(`/questentregar ${selectedQuest.id}`)}
                                                    className="rounded border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/25"
                                                >
                                                Entregar
                                            </button>
                                        ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[320px] items-center justify-center text-center text-sm text-stone-400">
                                        Selecciona una mision para ver progreso y recompensas.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {tab === "montura" ? (
                        <>
                        <MountHubTab
                            ownedMounts={ownedMounts}
                            selectedMount={selectedMount}
                            setSelectedMountId={setSelectedMountId}
                            objectsDB={objectsDB}
                            graphicsDB={graphicsDB}
                            onSendCommand={onSendCommand}
                        />
                        <div className="hidden" data-mount-tab="legacy">
                            <button
                                type="button"
                                onClick={() => onSendCommand?.("/montura")}
                                className="rounded-[10px] border border-[#4f3f2b] bg-[#2d2218] px-3 py-1.5 text-[11px] font-semibold"
                            >
                                Ver mis mascotas
                            </button>
                            {([] as Array<{ id: number; name: string; topeLevel: number; aumentoCuerpo: number; aumentoFlecha: number; aumentoMagia: number }>).map((mount) => (
                                <div key={mount.id} className="rounded-[12px] border border-amber-200/10 bg-black/20 p-3">
                                    <p className="font-semibold">{mount.name}</p>
                                    <p className="mt-1 text-xs text-stone-300">
                                        Tope {mount.topeLevel} · Cuerpo +{mount.aumentoCuerpo} · Flecha +{mount.aumentoFlecha} · Magia +{mount.aumentoMagia}
                                    </p>
                                </div>
                            ))}
                        </div>
                        </>
                    ) : null}

                    {tab === "premios" ? (
                        <div className="flex h-full min-h-0 flex-col gap-3">
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
                                    <div className="grid gap-2 lg:grid-cols-2">
                                        {visiblePremios.map((premio) => {
                                            const quantity = getPremioQuantity(premioCurrency, premio.id);
                                            const isSelected = selectedPremio?.id === premio.id;
                                            const graphicData = resolvePremioGraphic(premio, objectsDB, graphicsDB);

                                            return (
                                                <div
                                                    key={`${premioCurrency}-${premio.id}`}
                                                    onClick={() => setSelectedPremioId(premio.id)}
                                                    className={`grid cursor-pointer grid-cols-[74px_minmax(0,1fr)] gap-3 rounded border bg-[linear-gradient(135deg,rgba(28,21,12,0.9),rgba(8,6,4,0.92))] p-2 transition ${
                                                        isSelected
                                                            ? "border-amber-300/80 shadow-[0_0_0_1px_rgba(245,158,11,0.24),0_0_28px_rgba(245,158,11,0.14)]"
                                                            : "border-amber-200/14 hover:border-amber-300/45"
                                                    }`}
                                                >
                                                    <PremioGraphic graphicData={graphicData} name={premio.name} />
                                                    <div className="flex min-w-0 flex-col">
                                                        <div className="min-h-[42px]">
                                                            <p className="line-clamp-1 text-sm font-semibold leading-snug text-[#f7edd2]">
                                                                {premio.name}
                                                            </p>
                                                            {premio.desc ? (
                                                                <p className="mt-0.5 line-clamp-1 text-xs leading-snug text-stone-300">
                                                                    {premio.desc}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                        <p className="mt-0.5 text-base font-bold text-amber-200">
                                                            {formatAmount(premio.cost)} pts
                                                        </p>
                                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                                                            <div className="grid h-8 grid-cols-[30px_36px_30px] overflow-hidden rounded border border-stone-500/50 bg-black/28">
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
                                                                    <Minus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
                                                                </button>
                                                                <span className="flex items-center justify-center border-x border-stone-500/45 text-xs font-semibold text-stone-100">
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
                                                                    <Plus aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.8} />
                                                                </button>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    setSelectedPremioId(premio.id);
                                                                }}
                                                                className="flex h-8 items-center gap-2 rounded border border-amber-300/55 bg-amber-500/15 px-3 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/24"
                                                            >
                                                                <Gift aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.7} />
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
                                                <div className="h-10 w-10 shrink-0">
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
                        <div className="flex h-full min-h-0 flex-col gap-3">
                            <div className="flex shrink-0 gap-2">
                                {(["1v1", "2v2"] as const).map((mode) => {
                                    const selected = rankedMode === mode;

                                    return (
                                        <button
                                            key={mode}
                                            type="button"
                                            onClick={() => setRankedMode(mode)}
                                            className={`h-10 min-w-[112px] rounded border px-4 text-sm font-bold transition ${
                                                selected
                                                    ? "border-amber-300 bg-[linear-gradient(180deg,#5b3d12,#21150a)] text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.22)]"
                                                    : "border-amber-200/12 bg-black/24 text-stone-300 hover:border-amber-200/35 hover:text-stone-50"
                                            }`}
                                        >
                                            {mode === "1v1" ? "1 vs 1" : "2 vs 2"}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.02fr)]">
                                <div className="flex min-h-0 flex-col gap-3">
                                    <section className="rounded border border-amber-300/30 bg-black/24 p-4 shadow-[inset_0_0_36px_rgba(245,158,11,0.06)]">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                                                Tu rango actual ({rankedMode === "1v1" ? "1 vs 1" : "2 vs 2"})
                                            </p>
                                            <RankedHelpButton label="El rango se calcula por ELO y sube por divisiones hasta King." />
                                        </div>

                                        <div className="mt-4 grid grid-cols-[164px_minmax(0,1fr)] gap-5">
                                            <div
                                                className="flex h-[154px] items-center justify-center rounded border bg-black/24"
                                                style={{
                                                    borderColor: selectedRankedVisual.textColor,
                                                    boxShadow: `0 0 28px ${selectedRankedVisual.glow}`,
                                                }}
                                            >
                                                <Image
                                                    src={selectedRankedVisual.asset}
                                                    alt=""
                                                    width={132}
                                                    height={132}
                                                    className="h-[132px] w-[132px] object-contain"
                                                    draggable={false}
                                                    unoptimized
                                                />
                                            </div>
                                            <div className="min-w-0 py-2">
                                                <h4 className="truncate text-3xl font-black text-stone-50">
                                                    {selectedRankedRank?.label ?? "Bronce V"}
                                                </h4>
                                                <p className="mt-3 text-xl font-semibold text-stone-200">
                                                    ELO: {formatAmount(selectedRankedState?.elo ?? 0)}
                                                </p>
                                                <div className="mt-3 h-2.5 overflow-hidden rounded-full border border-white/15 bg-black/45">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${Math.round(Math.max(0, Math.min(1, selectedRankedProgress.ratio)) * 100)}%`,
                                                            background: `linear-gradient(90deg, ${selectedRankedVisual.textColor}, #f8d47b)`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="mt-2 text-sm text-stone-300">
                                                    {selectedRankedRank?.tier === "KING"
                                                        ? "Rango maximo"
                                                        : `${selectedRankedProgress.current} / ${selectedRankedProgress.required} hacia la proxima division`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-5 gap-2 text-sm">
                                            {[
                                                ["Victorias", String(selectedRankedState?.wins ?? 0)],
                                                ["Derrotas", String(selectedRankedState?.losses ?? 0)],
                                                ["Winrate", `${selectedRankedWinrate}%`],
                                                ["Partidas", String(selectedRankedState?.matchesPlayed ?? 0)],
                                                ["Racha actual", String(selectedRankedState?.winStreak ?? 0)],
                                            ].map(([label, value]) => (
                                                <div key={label} className="rounded border border-amber-200/12 bg-black/22 px-3 py-2">
                                                    <p className="truncate text-xs text-stone-400">{label}</p>
                                                    <p className="mt-1 text-lg font-black text-stone-100">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="rounded border border-amber-300/20 bg-black/24 p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                                                        Estado de cola
                                                    </p>
                                                    <RankedHelpButton label="La busqueda abre desde zona segura. 2 vs 2 requiere party exacta de dos jugadores." />
                                                </div>
                                                <p className="mt-2 line-clamp-2 text-sm text-stone-300">
                                                    {selectedRankedMatch
                                                        ? `En combate contra ${selectedRankedMatch.opponentName}. Marcador ${selectedRankedMatch.scoreA}-${selectedRankedMatch.scoreB}, arena #${selectedRankedMatch.arenaMapId}.`
                                                        : selectedRankedConfirmation
                                                          ? `${selectedRankedConfirmation.title}: ${selectedRankedConfirmation.acceptedCount}/${selectedRankedConfirmation.requiredCount} aceptaron.`
                                                        : selectedRankedQueue?.status === "QUEUED"
                                                          ? selectedRankedQueue.searchRange
                                                              ? `Buscando rival. Rango actual: ${selectedRankedQueue.searchRange.minElo}-${selectedRankedQueue.searchRange.maxElo} ELO.`
                                                              : "Buscando rival Ranked."
                                                          : rankedMode === "1v1"
                                                            ? "Listo para buscar duelo individual."
                                                            : "Listo para anotar party 2 vs 2."}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    onSendCommand?.(rankedMode === "1v1" ? "/ranked" : "/ranked 2v2");
                                                }}
                                                className="flex h-14 min-w-[260px] items-center justify-center gap-3 rounded border border-amber-300/75 bg-[linear-gradient(180deg,#f7c84f,#9b5a0c)] px-5 text-lg font-black text-stone-950 shadow-[0_0_22px_rgba(245,158,11,0.24)] transition hover:brightness-110"
                                            >
                                                <Swords aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
                                                {selectedRankedQueue?.status === "QUEUED"
                                                    ? "Cancelar busqueda"
                                                    : rankedMode === "1v1"
                                                      ? "Buscar rival 1 vs 1"
                                                      : "Anotar party 2 vs 2"}
                                            </button>
                                        </div>
                                    </section>

                                    <section className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(210px,0.55fr)] gap-3">
                                        <div className="rounded border border-amber-300/20 bg-black/24 p-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                                                    Mapas de duelo
                                                </p>
                                                <RankedHelpButton label="El sistema puede reservar varias arenas para que haya duelos simultaneos." />
                                            </div>
                                            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm text-stone-200">
                                                {[
                                                    "Arena Ulla (mapa 211)",
                                                    "Coliseo (mapa 212)",
                                                    "Isla del Caos (mapa 213)",
                                                    "Templo Antiguo (mapa 214)",
                                                    "Ruinas (mapa 215)",
                                                ].map((mapName) => (
                                                    <div key={mapName} className="rounded border border-amber-200/12 bg-black/22 px-2 py-2">
                                                        {mapName}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="rounded border border-amber-300/20 bg-black/24 p-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                                                    Rangos
                                                </p>
                                                <RankedHelpButton label="Cada rango tiene cinco divisiones. King no tiene division." />
                                            </div>
                                            <div className="mt-3 grid grid-cols-4 gap-2">
                                                {RANKED_TIER_VISUALS.map((tier) => (
                                                    <div key={tier.id} title={tier.label} className="flex h-10 items-center justify-center rounded border border-amber-200/10 bg-black/22">
                                                        <Image
                                                            src={tier.asset}
                                                            alt={tier.label}
                                                            width={32}
                                                            height={32}
                                                            className="h-8 w-8 object-contain"
                                                            draggable={false}
                                                            unoptimized
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <section className="flex min-h-0 flex-col rounded border border-amber-300/25 bg-black/24 p-4">
                                    <div className="flex shrink-0 items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                                                Ranking global ({rankedMode === "1v1" ? "1 vs 1" : "2 vs 2"})
                                            </p>
                                            <RankedHelpButton label="Ranking persistente ordenado por ELO, victorias y posicion global." />
                                        </div>
                                        <label className="flex h-10 w-[260px] items-center gap-2 rounded border border-amber-200/20 bg-black/28 px-3 text-sm text-stone-300">
                                            <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-200/80" strokeWidth={1.8} />
                                            <input
                                                value={rankedSearch}
                                                onChange={(event) => setRankedSearch(event.target.value)}
                                                placeholder="Buscar jugador..."
                                                className="min-w-0 flex-1 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-500"
                                            />
                                        </label>
                                    </div>

                                    <div className="mt-3 min-h-0 flex-1 overflow-hidden rounded border border-amber-200/10">
                                        <table className="h-full w-full table-fixed border-collapse text-sm">
                                            <thead className="bg-[#20170f] text-left text-xs text-stone-300">
                                                <tr>
                                                    <th className="w-[54px] px-3 py-2">#</th>
                                                    <th className="px-3 py-2">Jugador</th>
                                                    <th className="w-[158px] px-3 py-2">Rango</th>
                                                    <th className="w-[86px] px-3 py-2">ELO</th>
                                                    <th className="w-[88px] px-3 py-2">Victorias</th>
                                                    <th className="w-[88px] px-3 py-2">Derrotas</th>
                                                    <th className="w-[82px] px-3 py-2">Winrate</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleRankedEntries.length ? (
                                                    visibleRankedEntries.slice(0, 10).map((entry) => (
                                                        <tr key={entry.characterId} className="border-t border-amber-200/8 text-stone-200">
                                                            <td className="px-3 py-2 font-black text-stone-100">{entry.position}</td>
                                                            <td className="whitespace-normal break-words px-3 py-2 font-semibold leading-4">
                                                                {entry.characterName}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                <RankedRankBadge rank={entry.rank} compact />
                                                            </td>
                                                            <td className="px-3 py-2 font-semibold">{formatAmount(entry.elo)}</td>
                                                            <td className="px-3 py-2">{formatAmount(entry.wins)}</td>
                                                            <td className="px-3 py-2">{formatAmount(entry.losses)}</td>
                                                            <td className="px-3 py-2 font-black text-emerald-400">{entry.winrate}%</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-3 py-10 text-center text-sm text-stone-400">
                                                            No hay jugadores para mostrar.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-3 flex shrink-0 items-center justify-between gap-3">
                                        <div className="text-xs text-stone-400">
                                            Top {selectedRankedLeaderboard?.entries.length ?? 0} de {formatAmount(selectedRankedLeaderboard?.total ?? 0)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-stone-300">
                                            <button type="button" className="h-8 w-8 rounded border border-amber-200/20 text-stone-300">‹</button>
                                            <span className="flex h-8 w-8 items-center justify-center rounded border border-amber-300 text-amber-100">1</span>
                                            <span>2</span>
                                            <span>3</span>
                                            <span>...</span>
                                            <button type="button" className="h-8 w-8 rounded border border-amber-200/20 text-stone-300">›</button>
                                        </div>
                                    </div>

                                    <div className="mt-3 shrink-0 rounded border border-amber-300/20 bg-black/24 p-3">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200">
                                                Tu posicion
                                            </p>
                                            <RankedHelpButton label="Tu posicion global dentro del modo seleccionado." />
                                        </div>
                                        {ownRankedEntry ? (
                                            <div className="mt-2 grid grid-cols-[70px_minmax(180px,1fr)_160px_80px_72px_72px_76px] items-center gap-2 rounded border border-amber-200/12 bg-black/28 px-3 py-2 text-sm text-stone-200">
                                                <span className="text-xl font-black text-stone-50">
                                                    {ownRankedEntry.position > 0 ? ownRankedEntry.position : "-"}
                                                </span>
                                                <span className="whitespace-normal break-words font-semibold leading-4">{ownRankedEntry.characterName}</span>
                                                <RankedRankBadge rank={ownRankedEntry.rank} compact />
                                                <span>{formatAmount(ownRankedEntry.elo)}</span>
                                                <span>{formatAmount(ownRankedEntry.wins)}</span>
                                                <span>{formatAmount(ownRankedEntry.losses)}</span>
                                                <span className="font-black text-stone-50">{ownRankedEntry.winrate}%</span>
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-sm text-stone-400">Sin posicion registrada todavia.</p>
                                        )}
                                    </div>
                                </section>
                            </div>

                        </div>
                    ) : null}

                    {tab === "subastas" ? (
                        auctionPanel ? (
                            <div className="h-full min-h-0">{auctionPanel}</div>
                        ) : (
                            <div className="flex h-full min-h-0 flex-col items-center justify-center rounded border border-amber-200/10 bg-black/28 px-6 text-center">
                                <ShoppingCart aria-hidden="true" className="h-12 w-12 text-amber-300" strokeWidth={1.7} />
                                <h4 className="mt-4 text-2xl font-bold text-[#f2e5ca]">
                                    Casa de Subastas
                                </h4>
                                <p className="mt-2 max-w-xl text-sm leading-6 text-stone-300">
                                    Cargando subastas...
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onOpenAuctionHouse) {
                                            onOpenAuctionHouse();
                                        } else {
                                            onSendCommand?.("/subastas");
                                        }
                                    }}
                                    className="mt-6 min-h-[42px] min-w-[180px] rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f4c449,#986015)] px-5 text-sm font-bold text-stone-950 shadow-[0_0_22px_rgba(245,158,11,0.18)] transition hover:brightness-110"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )
                    ) : null}

                    {tab === "viajes" ? (
                        <div className="flex h-full min-h-0 flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTravelSection("ciudades")}
                                    aria-pressed={travelSection === "ciudades"}
                                    className={`flex min-h-[42px] items-center gap-2 rounded border px-4 text-sm font-semibold transition ${
                                        travelSection === "ciudades"
                                            ? "border-amber-400/80 bg-amber-500/15 text-amber-100"
                                            : "border-amber-200/12 bg-black/28 text-stone-300 hover:border-amber-300/40 hover:text-white"
                                    }`}
                                >
                                    <MapPin aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                    Ciudades
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTravelSection("dungeons")}
                                    aria-pressed={travelSection === "dungeons"}
                                    className={`flex min-h-[42px] items-center gap-2 rounded border px-4 text-sm font-semibold transition ${
                                        travelSection === "dungeons"
                                            ? "border-amber-400/80 bg-amber-500/15 text-amber-100"
                                            : "border-amber-200/12 bg-black/28 text-stone-300 hover:border-amber-300/40 hover:text-white"
                                    }`}
                                >
                                    <Skull aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                    Dungeons
                                </button>
                                <p className="ml-auto text-sm text-stone-300">
                                    {travelSection === "ciudades"
                                        ? "100 monedas de oro por mapa de distancia"
                                        : `${formatAmount(donationPoints)} puntos de donación`}
                                </p>
                            </div>

                            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                                {travelSection === "ciudades" ? (
                                    availableRoutes.length ? (
                                        availableRoutes.map((route) => (
                                            <button
                                                key={`${route.fromMap}-${route.key}`}
                                                type="button"
                                                onClick={() => onSendCommand?.(`/viaje ${route.key}`)}
                                                className="flex w-full items-center justify-between gap-3 rounded border border-amber-200/12 bg-black/25 px-4 py-3 text-left transition hover:border-amber-300/55 hover:bg-amber-300/8"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block truncate text-base font-semibold text-stone-50">
                                                        {formatCityName(route.key)}
                                                    </span>
                                                    <span className="text-xs text-stone-400">
                                                        Mapa {route.map}
                                                        {route.boat ? " · requiere barco" : ""}
                                                    </span>
                                                </span>
                                                <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-amber-200">
                                                    <Coins aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                                                    {formatAmount(route.cost)}
                                                </span>
                                            </button>
                                        ))
                                    ) : (
                                        <p className="rounded border border-amber-200/10 bg-black/20 px-4 py-6 text-sm text-stone-300">
                                            Desde este mapa no hay viajes a ciudades. Andá a un viajero en una ciudad.
                                        </p>
                                    )
                                ) : (
                                    dungeonRoutes.map((route) => (
                                        <button
                                            key={route.key}
                                            type="button"
                                            onClick={() => onSendCommand?.(`/dungeon ${route.key}`)}
                                            className="flex w-full items-center justify-between gap-3 rounded border border-amber-200/12 bg-black/25 px-4 py-3 text-left transition hover:border-amber-300/55 hover:bg-amber-300/8"
                                        >
                                            <span className="min-w-0">
                                                <span className="block truncate text-base font-semibold text-stone-50">
                                                    {route.name}
                                                </span>
                                                <span className="text-xs text-stone-400">Entrada · mapa {route.map}</span>
                                            </span>
                                            <span className="shrink-0 text-sm font-semibold text-amber-200">
                                                {formatAmount(route.cost)} pts
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : null}

                    {tab === "eventos" ? (
                        <div className="flex h-full min-h-0 flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex min-h-[46px] items-center gap-3 rounded border border-amber-400/45 bg-[linear-gradient(180deg,rgba(245,158,11,0.16),rgba(0,0,0,0.24))] px-4 text-sm font-bold text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.08)]">
                                    <CalendarDays aria-hidden="true" className="h-5 w-5 text-amber-300" strokeWidth={1.8} />
                                    Eventos automáticos
                                </div>

                                <div className="flex flex-1 flex-wrap items-center gap-2">
                                    {EVENT_FILTERS.map((filter) => {
                                        const selected = eventCategoryFilter === filter.id;
                                        const categoryMeta = filter.category ? EVENT_CATEGORY_META[filter.category] : null;

                                        return (
                                            <button
                                                key={filter.id}
                                                type="button"
                                                onClick={() => setEventCategoryFilter(filter.id)}
                                                aria-pressed={selected}
                                                className={`flex min-h-[46px] items-center gap-2 rounded border px-4 text-sm font-semibold transition ${
                                                    selected
                                                        ? "border-amber-400/80 bg-amber-500/15 text-amber-100 shadow-[0_0_18px_rgba(245,158,11,0.16)]"
                                                        : "border-amber-200/12 bg-black/28 text-stone-300 hover:border-amber-300/40 hover:text-white"
                                                }`}
                                            >
                                                {categoryMeta ? (
                                                    <span aria-hidden="true" className={`h-3 w-3 rounded-full ${categoryMeta.dotClass}`} />
                                                ) : null}
                                                {filter.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="flex min-h-[46px] items-center gap-3 rounded border border-amber-200/16 bg-black/26 px-4 text-sm text-stone-200">
                                    <Clock3 aria-hidden="true" className="h-5 w-5 text-amber-200" strokeWidth={1.8} />
                                    <span>Horario del servidor</span>
                                    <span className="font-semibold text-amber-100">{formatServerClock(eventClockNow)}</span>
                                </div>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                                <div className="space-y-2.5">
                                    {visibleAutomaticEvents.map((event) => {
                                        const categoryMeta = EVENT_CATEGORY_META[event.category];
                                        const status = resolveEventStatus(event, eventClockNow);
                                        const statusMeta = EVENT_STATUS_META[status];
                                        const joinOpen =
                                            event.actionType !== "join" ||
                                            status === "available" ||
                                            (status === "running" && event.allowJoinWhileRunning !== false);
                                        const registrationClosed = event.actionType === "join" && !joinOpen;
                                        const disabled = Boolean(event.disabledReason) || registrationClosed;
                                        const disabledTitle =
                                            event.disabledReason ??
                                            (registrationClosed
                                                ? status === "running"
                                                    ? "La inscripción ya cerró."
                                                    : "El registro todavía no abrió."
                                                : undefined);
                                        const countdown =
                                            status === "running" ? "EN CURSO" : formatEventCountdown(event.startsAt, eventClockNow);

                                        return (
                                            <article
                                                key={event.id}
                                                className="grid min-h-[82px] grid-cols-[106px_minmax(0,1fr)_176px_142px] items-stretch overflow-hidden rounded border border-amber-500/35 bg-[linear-gradient(90deg,rgba(32,20,11,0.92),rgba(11,8,6,0.96))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)] max-[820px]:grid-cols-1"
                                            >
                                                <div className="flex flex-col items-center justify-center border-r border-amber-200/10 px-3 text-center max-[820px]:min-h-[58px] max-[820px]:border-b max-[820px]:border-r-0">
                                                    <div className="h-px w-full max-w-[70px] bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.5),transparent)]" />
                                                    <p className="mt-1.5 text-lg font-bold leading-none text-amber-100">{countdown}</p>
                                                    <p className="mt-1 text-xs text-stone-300">
                                                        {status === "running" ? "Ahora" : "Comienza en"}
                                                    </p>
                                                    <div className="mt-1.5 h-px w-full max-w-[70px] bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.28),transparent)]" />
                                                </div>

                                                <div className="flex min-w-0 flex-col justify-center px-4 py-2 max-[820px]:border-b max-[820px]:border-amber-200/10">
                                                    <div className="flex min-w-0 flex-wrap items-center gap-3">
                                                        <h4 className="min-w-0 truncate text-lg font-bold leading-tight text-stone-50">
                                                            {event.name}
                                                        </h4>
                                                        <span className={`shrink-0 rounded border px-2.5 py-0.5 text-xs font-bold ${categoryMeta.badgeClass}`}>
                                                            {categoryMeta.label}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 line-clamp-1 text-sm leading-5 text-stone-300">
                                                        {event.description}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col justify-center gap-2 border-l border-amber-200/10 bg-black/18 px-4 py-2 max-[820px]:border-b max-[820px]:border-l-0 max-[820px]:border-amber-200/10">
                                                    <div className="flex items-center gap-3 text-sm text-stone-200">
                                                        <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-200" strokeWidth={1.8} />
                                                        <span className="truncate">{event.locationLabel ?? "-"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm font-bold">
                                                        <span aria-hidden="true" className={`h-3 w-3 rounded-full ${statusMeta.dotClass}`} />
                                                        <span className={statusMeta.textClass}>{statusMeta.label}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center border-l border-amber-200/10 px-3 py-2 max-[820px]:border-l-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEventAction(event)}
                                                        disabled={disabled}
                                                        title={disabledTitle}
                                                        className={`min-h-[42px] w-full rounded border px-4 text-sm font-bold transition ${
                                                            disabled
                                                                ? "cursor-not-allowed border-stone-700 bg-stone-900/80 text-stone-500"
                                                                : "border-amber-300/70 bg-[linear-gradient(180deg,#f4c449,#986015)] text-stone-950 shadow-[0_0_22px_rgba(245,158,11,0.18)] hover:brightness-110"
                                                        }`}
                                                    >
                                                        {event.actionLabel}
                                                    </button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {tab === "eventos" ? (
                    <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_188px] items-center gap-4 border-t border-amber-200/10 bg-black/20 px-5 py-4 max-[720px]:grid-cols-1">
                        <div className="flex min-h-[68px] items-center gap-4 rounded border border-amber-200/12 bg-black/28 px-4 text-sm text-stone-300">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-amber-300/35 bg-amber-500/10">
                                <Info aria-hidden="true" className="h-5 w-5 text-amber-200" strokeWidth={1.8} />
                            </span>
                            <div className="space-y-1">
                                <p>
                                    <span className="text-amber-300">•</span> Al participar recibirás un aviso cuando comience el evento.
                                </p>
                                <p>
                                    <span className="text-amber-300">•</span> El texto y la acción del botón se definen por código.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-[68px] rounded border border-stone-600/60 px-5 text-xl font-bold text-stone-100 transition hover:border-stone-400 hover:text-white"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <div className="flex shrink-0 justify-end border-t border-amber-200/10 bg-black/20 px-4 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-[40px] min-w-[96px] rounded border border-stone-600/60 px-4 text-sm font-semibold text-stone-100 transition hover:border-stone-400 hover:text-white"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>

            {selectedEventDetail ? (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/58 px-4"
                    onClick={(event) => {
                        event.stopPropagation();
                        setSelectedEventDetail(null);
                    }}
                >
                    <div
                        className="w-[min(520px,calc(100vw-32px))] overflow-hidden rounded border border-amber-300/35 bg-[#130d08] text-stone-100 shadow-[0_24px_80px_rgba(0,0,0,0.68)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-amber-200/12 bg-[linear-gradient(180deg,rgba(127,78,35,0.32),rgba(18,12,8,0))] px-5 py-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-300/80">
                                    Evento
                                </p>
                                <h4 className="mt-1 text-2xl font-bold text-[#f2e5ca]">{selectedEventDetail.name}</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedEventDetail(null)}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-black/20 text-stone-300 transition hover:border-stone-500 hover:text-white"
                                aria-label="Cerrar detalle"
                            >
                                <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                            </button>
                        </div>
                        <div className="space-y-4 px-5 py-4">
                            <p className="text-sm leading-6 text-stone-200">{selectedEventDetail.description}</p>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded border border-amber-200/12 bg-black/26 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                                        Tipo
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-stone-100">
                                        {EVENT_CATEGORY_META[selectedEventDetail.category].label}
                                    </p>
                                </div>
                                <div className="rounded border border-amber-200/12 bg-black/26 p-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200">
                                        Ubicación
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-stone-100">
                                        {selectedEventDetail.locationLabel ?? "-"}
                                    </p>
                                </div>
                            </div>
                            {selectedEventDetail.actionData?.details?.length ? (
                                <div className="rounded border border-amber-200/12 bg-black/26 p-4 text-sm leading-6 text-stone-300">
                                    {selectedEventDetail.actionData.details.map((detail) => (
                                        <p key={detail}>
                                            <span className="text-amber-300">•</span> {detail}
                                        </p>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
