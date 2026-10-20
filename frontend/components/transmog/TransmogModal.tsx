"use client";

import React from "react";
import {
    Crown,
    Eye,
    EyeOff,
    Ghost,
    Lock,
    Shield,
    ShoppingBag,
    Sparkles,
    Sword,
    X,
} from "lucide-react";
import { ItemGraphic } from "../MacroBar";
import type { GraphicData } from "../../types/game";
import type {
    TransmogCandidatePayload,
    TransmogSlotKey,
    TransmogStatePayload,
} from "../../lib/aowProtocol";
import AppearancePreview from "./AppearancePreview";
import {
    applyAppearancePiece,
    TRANSMOG_SLOT_META,
    TRANSMOG_SLOT_ORDER,
} from "./appearance";

type TransmogModalProps = {
    state?: TransmogStatePayload;
    graphicsDB: Record<string, GraphicData> | null;
    onSendCommand?: (command: string) => void;
    onClose: () => void;
    onOpenShop: () => void;
};

type SlotFilter = TransmogSlotKey | "todos";

const SLOT_ICON: Record<
    TransmogSlotKey,
    React.ComponentType<{ className?: string }>
> = {
    casco: Crown,
    escudo: Shield,
    arma: Sword,
    cuerpo: Ghost,
};

export default function TransmogModal({
    state,
    graphicsDB,
    onSendCommand,
    onClose,
    onOpenShop,
}: TransmogModalProps) {
    const [filter, setFilter] = React.useState<SlotFilter>("todos");
    const [hovered, setHovered] =
        React.useState<TransmogCandidatePayload | null>(null);
    const [showOriginal, setShowOriginal] = React.useState(false);
    const [pendingUntil, setPendingUntil] = React.useState(0);
    const lastStateRef = React.useRef(state);

    // Mientras el server responde se bloquean los botones (se libera al llegar
    // un estado nuevo o a los 2 segundos).
    React.useEffect(() => {
        if (state !== lastStateRef.current) {
            lastStateRef.current = state;
            setPendingUntil(0);
            setHovered(null);
        }
    }, [state]);

    React.useEffect(() => {
        if (!pendingUntil) {
            return;
        }
        const timeout = window.setTimeout(
            () => setPendingUntil(0),
            Math.max(0, pendingUntil - Date.now()),
        );
        return () => window.clearTimeout(timeout);
    }, [pendingUntil]);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    const isBusy = pendingUntil > 0;
    const bodyLocked = Boolean(state?.bodyLocked);

    const send = (command: string) => {
        if (isBusy) {
            return;
        }
        setPendingUntil(Date.now() + 2000);
        onSendCommand?.(command);
    };

    const candidates = React.useMemo(
        () =>
            (state?.candidates ?? []).filter(
                (candidate) => filter === "todos" || candidate.slot === filter,
            ),
        [filter, state?.candidates],
    );

    const previewAppearance = React.useMemo(() => {
        if (!state) {
            return null;
        }

        if (showOriginal) {
            return state.appearance.base;
        }

        if (hovered && !hovered.blockedReason) {
            return applyAppearancePiece(
                state.appearance.preview,
                hovered.slot,
                hovered.graphic,
                bodyLocked,
            );
        }

        return state.appearance.preview;
    }, [bodyLocked, hovered, showOriginal, state]);

    const renderSlot = (slot: TransmogSlotKey, wide = false) => {
        const meta = TRANSMOG_SLOT_META[slot];
        const Icon = SLOT_ICON[slot];
        const entry = state?.slots?.[slot] ?? null;
        const disabled = slot !== "cuerpo" && bodyLocked;
        const selected = filter === slot;
        const graphicData = entry
            ? graphicsDB?.[String(entry.grhIndex)]
            : undefined;

        return (
            <div
                key={slot}
                className={`flex flex-col items-center gap-1 ${wide ? "w-full" : ""}`}
            >
                <div
                    className={`relative ${wide ? "flex w-full justify-center" : ""}`}
                >
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => setFilter(slot)}
                        title={
                            disabled
                                ? "Desactivado: tenés un disfraz de cuerpo completo puesto"
                                : entry
                                  ? entry.name
                                  : `Elegí un objeto para ${meta.label.toLowerCase()}`
                        }
                        className={`group relative flex items-center justify-center rounded border transition ${
                            wide
                                ? "h-[66px] w-full max-w-[220px] gap-3 px-3"
                                : "h-[66px] w-[66px]"
                        } ${
                            disabled
                                ? "cursor-not-allowed border-stone-700/60 bg-black/50 opacity-55"
                                : selected
                                  ? "border-amber-300/90 bg-[linear-gradient(180deg,rgba(245,158,11,0.22),rgba(0,0,0,0.35))] shadow-[0_0_18px_rgba(245,158,11,0.25)]"
                                  : slot === "cuerpo"
                                    ? "border-fuchsia-300/45 bg-[linear-gradient(180deg,rgba(168,85,247,0.18),rgba(0,0,0,0.45))] hover:border-fuchsia-200/80"
                                    : "border-amber-200/25 bg-black/40 hover:border-amber-200/70"
                        }`}
                    >
                        {entry && graphicData ? (
                            <ItemGraphic
                                graphicData={graphicData}
                                name={entry.name}
                                size={44}
                            />
                        ) : (
                            <Icon
                                className={`h-7 w-7 ${slot === "cuerpo" ? "text-fuchsia-200/45" : "text-amber-100/30"}`}
                            />
                        )}
                        {wide ? (
                            <span className="min-w-0 text-left">
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/90">
                                    Cuerpo completo
                                </span>
                                <span className="block truncate text-xs text-stone-200">
                                    {entry
                                        ? entry.name.replace(/^Disfraz: /, "")
                                        : meta.empty}
                                </span>
                            </span>
                        ) : null}
                        {disabled ? (
                            <span className="absolute inset-0 flex items-center justify-center rounded bg-black/55">
                                <Lock className="h-5 w-5 text-stone-300" />
                            </span>
                        ) : null}
                    </button>
                    {entry && !disabled ? (
                        <button
                            type="button"
                            aria-label={`Quitar ${meta.label.toLowerCase()}`}
                            title={`Quitar ${meta.label.toLowerCase()}`}
                            disabled={isBusy}
                            onClick={() => send(`/transmogquitar ${slot}`)}
                            className={`absolute -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-rose-300/60 bg-[#3a1512] text-rose-100 opacity-90 transition hover:scale-110 hover:opacity-100 disabled:opacity-40 ${
                                wide ? "right-[calc(50%-118px)]" : "-right-1.5"
                            }`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    ) : null}
                </div>
                {!wide ? (
                    <span
                        className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${disabled ? "text-stone-500" : "text-stone-300"}`}
                    >
                        {meta.short}
                    </span>
                ) : null}
            </div>
        );
    };

    const activeEntries = TRANSMOG_SLOT_ORDER.filter(
        (slot) => state?.slots?.[slot],
    ).length;

    return (
        <div
            className="fixed inset-0 z-[84] flex items-center justify-center bg-black/55 px-2 py-2 backdrop-blur-[3px] sm:px-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Transfigurar"
                className="flex max-h-[calc(100dvh-16px)] w-[min(940px,calc(100vw-16px))] flex-col overflow-hidden rounded border border-amber-200/20 bg-[#120c08]/97 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.6)]"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex items-start justify-between gap-3 border-b border-amber-200/10 bg-[linear-gradient(180deg,rgba(127,78,35,0.28),rgba(18,12,8,0))] px-4 py-3">
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/72">
                            Transfiguración
                        </p>
                        <h2 className="text-lg font-semibold text-[#f2e5ca]">
                            Cambiá el dibujo de tu personaje
                        </h2>
                        <p className="mt-0.5 text-xs text-stone-400 short:hidden">
                            Solo cambia cómo te ven: tus stats y tu equipo
                            siguen siendo los mismos.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="rounded-full border border-stone-700 bg-black/20 p-1.5 text-stone-300 transition hover:border-amber-300/60 hover:text-amber-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>

                <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 md:grid-cols-[minmax(330px,1fr)_minmax(300px,1fr)]">
                    <section className="flex flex-col gap-3 rounded border border-amber-200/10 bg-black/30 p-3">
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                            <div className="flex flex-col gap-4">
                                {renderSlot("casco")}
                                {renderSlot("arma")}
                            </div>
                            <AppearancePreview
                                appearance={previewAppearance}
                                caption={
                                    showOriginal
                                        ? "Así te ves sin transfiguración"
                                        : hovered && !hovered.blockedReason
                                          ? `Probando: ${hovered.name}`
                                          : activeEntries > 0
                                            ? "Así te ven los demás"
                                            : "Elegí un espacio y un objeto"
                                }
                            />
                            <div className="flex flex-col gap-4">
                                {renderSlot("escudo")}
                                <div className="flex flex-col items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowOriginal((value) => !value)
                                        }
                                        className="flex h-[66px] w-[66px] flex-col items-center justify-center gap-1 rounded border border-stone-600/60 bg-black/30 text-stone-300 transition hover:border-amber-200/60 hover:text-amber-100"
                                        title="Comparar con tu aspecto sin transfiguración"
                                    >
                                        {showOriginal ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">
                                        {showOriginal ? "Original" : "Comparar"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            {renderSlot("cuerpo", true)}
                        </div>
                        {bodyLocked ? (
                            <p className="rounded border border-fuchsia-300/25 bg-fuchsia-500/10 px-3 py-2 text-[11px] text-fuchsia-100">
                                Con un disfraz de cuerpo completo puesto, el
                                casco, el escudo y el arma quedan desactivados.
                                Quitá el disfraz para usarlos.
                            </p>
                        ) : null}
                        {state?.suppressedReason && activeEntries > 0 ? (
                            <p className="rounded border border-amber-300/25 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100">
                                {state.suppressedReason}: por ahora te ven con
                                tu aspecto normal. La transfiguración vuelve
                                sola.
                            </p>
                        ) : null}
                    </section>

                    <section className="flex min-h-[320px] flex-col rounded border border-amber-200/10 bg-black/30">
                        <div className="border-b border-white/10 px-3 py-2">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                Tus objetos
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {(
                                    [
                                        "todos",
                                        ...TRANSMOG_SLOT_ORDER,
                                    ] as SlotFilter[]
                                ).map((key) => {
                                    const isActive = filter === key;
                                    const label =
                                        key === "todos"
                                            ? "Todos"
                                            : TRANSMOG_SLOT_META[key].plural;
                                    const disabled =
                                        key !== "todos" &&
                                        key !== "cuerpo" &&
                                        bodyLocked;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFilter(key)}
                                            className={`rounded-[10px] border px-2.5 py-1 text-[11px] font-semibold transition ${
                                                isActive
                                                    ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
                                                    : disabled
                                                      ? "border-transparent text-stone-500"
                                                      : "border-transparent text-stone-300 hover:border-stone-600"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div
                            className="min-h-0 flex-1 overflow-y-auto p-2"
                            onMouseLeave={() => setHovered(null)}
                        >
                            {candidates.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                                    <Sparkles className="h-8 w-8 text-amber-200/50" />
                                    <p className="text-sm text-stone-300">
                                        {filter === "todos"
                                            ? "No tenés objetos para transfigurar en el inventario."
                                            : `No tenés ${TRANSMOG_SLOT_META[filter].plural.toLowerCase()} en el inventario.`}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        Sirve cualquier casco, escudo o arma que
                                        no tengas equipado, y las apariencias y
                                        disfraces de la tienda.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={onOpenShop}
                                        className="inline-flex items-center gap-2 rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f7c84f,#a96512)] px-4 py-2 text-xs font-bold text-stone-950 transition hover:brightness-110"
                                    >
                                        <ShoppingBag className="h-4 w-4" />
                                        Ver apariencias en la Tienda
                                    </button>
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1">
                                    {candidates.map((candidate) => {
                                        const graphicData =
                                            graphicsDB?.[
                                                String(candidate.grhIndex)
                                            ];
                                        const blocked = Boolean(
                                            candidate.blockedReason,
                                        );
                                        return (
                                            <li
                                                key={`${candidate.invSlot}-${candidate.idItem}`}
                                            >
                                                <button
                                                    type="button"
                                                    disabled={blocked || isBusy}
                                                    onMouseEnter={() =>
                                                        setHovered(candidate)
                                                    }
                                                    onFocus={() =>
                                                        setHovered(candidate)
                                                    }
                                                    onClick={() =>
                                                        send(
                                                            `/transmogponer ${candidate.invSlot} ${candidate.slot}`,
                                                        )
                                                    }
                                                    className={`grid w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-2 rounded border px-2 py-1.5 text-left transition ${
                                                        blocked
                                                            ? "cursor-not-allowed border-white/5 bg-black/20 opacity-60"
                                                            : "border-amber-200/10 bg-[linear-gradient(135deg,rgba(28,21,12,0.9),rgba(8,6,4,0.92))] hover:border-amber-300/70"
                                                    }`}
                                                >
                                                    <span className="flex h-11 w-11 items-center justify-center rounded border border-amber-500/25 bg-[#2b2016]">
                                                        <ItemGraphic
                                                            graphicData={
                                                                graphicData
                                                            }
                                                            name={
                                                                candidate.name
                                                            }
                                                            size={36}
                                                        />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block truncate text-sm text-[#f2e5ca]">
                                                            {candidate.name}
                                                        </span>
                                                        <span className="block text-[11px] text-stone-400">
                                                            {
                                                                TRANSMOG_SLOT_META[
                                                                    candidate
                                                                        .slot
                                                                ].label
                                                            }
                                                            {candidate.cosmetic
                                                                ? " · Apariencia"
                                                                : ""}
                                                            {blocked
                                                                ? ` · ${candidate.blockedReason}`
                                                                : ""}
                                                        </span>
                                                    </span>
                                                    <span
                                                        className={`rounded border px-2 py-1 text-[11px] font-semibold ${
                                                            blocked
                                                                ? "border-stone-700 text-stone-500"
                                                                : "border-amber-300/40 bg-amber-300/15 text-amber-100"
                                                        }`}
                                                    >
                                                        {blocked
                                                            ? "No disponible"
                                                            : "Poner"}
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </section>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/10 px-4 py-2.5 text-[11px] text-stone-400 short:py-1.5">
                    <span className="short:hidden">
                        Tip: con doble click en una apariencia del inventario se
                        pone sola. Los objetos que pongas acá salen del
                        inventario y quedan guardados hasta que los quites.
                    </span>
                    <button
                        type="button"
                        onClick={onOpenShop}
                        className="inline-flex items-center gap-1.5 rounded border border-amber-300/40 bg-amber-300/15 px-3 py-1.5 font-semibold text-amber-100 transition hover:border-amber-200/80"
                    >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        Tienda
                    </button>
                </footer>
            </div>
        </div>
    );
}
