"use client";

import { Bug, CheckCircle2, X } from "lucide-react";
import React from "react";

// Ventana del botón "Reportar BUG" del juego. El reporte va a /api/bug-reports con el personaje (lo pone la API
// desde la sesión) y la posición actual; los GM lo ven en /bugs.

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

type BugReportModalProps = {
    onClose: () => void;
    map: number | null;
    x: number | null;
    y: number | null;
    isMobile: boolean;
};

type SendState = "idle" | "sending" | "sent";

function toCoordinate(value: number | null): number | null {
    return typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : null;
}

export default function BugReportModal({ onClose, map, x, y, isMobile }: BugReportModalProps) {
    const dialogRef = React.useRef<HTMLDivElement | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const closeButtonRef = React.useRef<HTMLButtonElement | null>(null);
    const [message, setMessage] = React.useState("");
    const [sendState, setSendState] = React.useState<SendState>("idle");
    const [error, setError] = React.useState<string | null>(null);
    // La posición se toma al abrir: es donde estaba el personaje cuando vio el bug.
    const [location] = React.useState(() => ({
        map: toCoordinate(map),
        x: toCoordinate(x),
        y: toCoordinate(y),
    }));

    const trimmedLength = message.trim().length;
    const canSend = sendState === "idle" && trimmedLength >= MESSAGE_MIN;

    const submit = React.useCallback(async () => {
        if (sendState !== "idle") {
            return;
        }

        if (message.trim().length < MESSAGE_MIN) {
            setError(`Contá un poco más: el reporte necesita al menos ${MESSAGE_MIN} caracteres.`);
            textareaRef.current?.focus();
            return;
        }

        setSendState("sending");
        setError(null);

        try {
            const response = await fetch("/api/bug-reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message.trim(),
                    map: location.map,
                    x: location.x,
                    y: location.y,
                    client: {
                        userAgent: navigator.userAgent.slice(0, 400),
                        viewport: `${window.innerWidth}x${window.innerHeight}`,
                        mobile: isMobile,
                    },
                }),
            });

            if (!response.ok) {
                const result = (await response.json().catch(() => null)) as { error?: string } | null;
                setError(result?.error ?? "No se pudo enviar el reporte. Probá de nuevo en un momento.");
                setSendState("idle");
                return;
            }

            setSendState("sent");
        } catch {
            setError("No se pudo conectar con el servidor. Probá de nuevo en un momento.");
            setSendState("idle");
        }
    }, [isMobile, location, message, sendState]);

    // La escucha de teclado se registra una sola vez y lee la versión vigente de estas funciones.
    const submitRef = React.useRef(submit);
    const onCloseRef = React.useRef(onClose);
    React.useEffect(() => {
        submitRef.current = submit;
        onCloseRef.current = onClose;
    }, [onClose, submit]);

    // En PC se escribe apenas abre. En celular no: el teclado tapa la ventana en horizontal y el toque que la abrió
    // le quitaría el foco igual; el jugador toca el campo cuando quiere escribir.
    React.useEffect(() => {
        if (!isMobile) {
            textareaRef.current?.focus();
        }
    }, [isMobile]);

    React.useEffect(() => {
        if (sendState === "sent") {
            closeButtonRef.current?.focus();
        }
    }, [sendState]);

    // Mientras se envía, el campo queda deshabilitado y pierde el foco: si falla, vuelve a él para corregir o reintentar.
    React.useEffect(() => {
        if (error && sendState === "idle") {
            textareaRef.current?.focus();
        }
    }, [error, sendState]);

    // El juego escucha el teclado en document (fase de captura): las flechas mueven al personaje aunque el foco esté
    // en un campo de texto. Esta escucha va antes, en window, y corta ahí todo lo que pasa dentro de la ventana: se
    // escribe normal y el personaje no se mueve ni dispara atajos. Por eso Esc, Ctrl+Enter y Tab se resuelven acá.
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const dialog = dialogRef.current;

            if (!dialog) {
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                onCloseRef.current();
                return;
            }

            const isInside = event.target instanceof Node && dialog.contains(event.target);

            if (!isInside) {
                // Con la ventana abierta, el foco no se va al juego.
                event.stopPropagation();
                if (event.key === "Tab") {
                    event.preventDefault();
                    textareaRef.current?.focus();
                }
                return;
            }

            event.stopPropagation();

            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                void submitRef.current();
                return;
            }

            if (event.key === "Tab") {
                const focusable = Array.from(
                    dialog.querySelectorAll<HTMLElement>("button:not(:disabled), textarea:not(:disabled)"),
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (!first || !last) {
                    return;
                }

                if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                    event.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown, true);
        return () => window.removeEventListener("keydown", handleKeyDown, true);
    }, []);

    const hasLocation = location.map !== null;
    const hasPosition = location.x !== null && location.y !== null;
    const locationText = hasLocation
        ? hasPosition
            ? `Mapa ${location.map}, X ${location.x}, Y ${location.y}`
            : `Mapa ${location.map}`
        : null;

    return (
        <div
            className="pointer-events-auto fixed inset-0 z-[86] flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-6 backdrop-blur-[3px] sm:items-center"
            onClick={() => {
                // Un clic afuera no tira lo que ya se escribió: con texto se cierra con Cancelar, la X o Esc.
                if (sendState === "sent" || !message.trim()) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bug-report-title"
                className="woao-hub-open w-full max-w-[520px] select-text overflow-hidden rounded border border-amber-200/20 bg-[#120c08]/97 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.6)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-4 border-b border-amber-200/10 bg-[linear-gradient(180deg,rgba(127,78,35,0.28),rgba(18,12,8,0))] px-4 py-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-300/35 bg-amber-500/10 text-amber-200">
                            <Bug aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
                        </span>
                        <div>
                            <h3 id="bug-report-title" className="text-lg font-semibold leading-6 text-[#f2e5ca]">
                                Reportar un bug
                            </h3>
                            <p className="text-xs leading-5 text-stone-400">
                                Lo lee el staff. Cuanto más detalle, más rápido se arregla.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-black/20 text-stone-300 transition hover:border-stone-500 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300/70"
                        aria-label="Cerrar"
                    >
                        <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                    </button>
                </div>

                {sendState === "sent" ? (
                    <div className="flex flex-col items-center gap-3 px-6 py-8 text-center" role="status">
                        <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-emerald-300" strokeWidth={1.6} />
                        <div>
                            <p className="text-base font-semibold text-[#f2e5ca]">Reporte enviado</p>
                            <p className="mt-1 text-sm leading-6 text-stone-400">
                                Gracias. Un GM lo va a revisar.
                            </p>
                        </div>
                        <button
                            ref={closeButtonRef}
                            type="button"
                            onClick={onClose}
                            className="mt-2 rounded-[4px] border border-stone-600 bg-black/25 px-5 py-2 text-sm font-semibold text-stone-200 transition hover:border-stone-400 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300/70"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <form
                        className="space-y-3 px-4 py-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void submit();
                        }}
                    >
                        <label htmlFor="bug-report-message" className="block text-sm font-medium text-stone-200">
                            ¿Qué pasó?
                        </label>
                        <textarea
                            id="bug-report-message"
                            ref={textareaRef}
                            value={message}
                            onChange={(event) => {
                                setMessage(event.target.value);
                                if (error) {
                                    setError(null);
                                }
                            }}
                            maxLength={MESSAGE_MAX}
                            rows={isMobile ? 4 : 6}
                            disabled={sendState === "sending"}
                            placeholder="Por ejemplo: al cruzar el puente de Nix hacia el norte el personaje se traba y no puede seguir."
                            aria-describedby="bug-report-hint"
                            aria-invalid={error ? true : undefined}
                            // En celular, 16px: con menos, Safari de iOS hace zoom al enfocar el campo.
                            className={`block w-full resize-none rounded border border-stone-700 bg-black/40 px-3 py-2.5 leading-6 ${
                                isMobile ? "text-base" : "text-sm"
                            } text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/55 focus:bg-black/55 disabled:opacity-60`}
                        />
                        <div
                            id="bug-report-hint"
                            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs leading-5 text-stone-500"
                        >
                            <span>
                                {locationText
                                    ? `Se envía con tu personaje y tu posición: ${locationText}.`
                                    : "Se envía con tu personaje."}
                            </span>
                            <span
                                className={`tabular-nums ${
                                    message.length >= MESSAGE_MAX ? "text-amber-300" : ""
                                }`}
                            >
                                {message.length} / {MESSAGE_MAX}
                            </span>
                        </div>

                        {error ? (
                            <p role="alert" className="rounded border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm leading-5 text-rose-200">
                                {error}
                            </p>
                        ) : null}

                        <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-[4px] border border-stone-700 bg-black/20 px-4 py-2 text-sm font-semibold text-stone-300 transition hover:border-stone-500 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300/70"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={!canSend}
                                title={
                                    trimmedLength < MESSAGE_MIN
                                        ? `Escribí al menos ${MESSAGE_MIN} caracteres`
                                        : "Ctrl + Enter también lo envía"
                                }
                                className="inline-flex min-w-[112px] items-center justify-center rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-5 py-2 text-sm font-bold text-[#2a1704] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 disabled:opacity-45 disabled:hover:brightness-100"
                            >
                                {sendState === "sending" ? "Enviando..." : "Reportar"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
