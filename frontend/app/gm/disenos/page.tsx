"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthRedirect } from "../../../hooks/useAuthRedirect";

type CustomDesignStatus =
    | "awaiting_payment"
    | "pending"
    | "in_progress"
    | "delivered"
    | "rejected";

type CustomDesignRequest = {
    id: string;
    characterId: string;
    accountId: string;
    characterName: string;
    productId: string;
    slot: string;
    title: string;
    description: string;
    hasImage: boolean;
    points: number;
    status: CustomDesignStatus;
    staffNote: string | null;
    deliveredObjIndex: number | null;
    handledBy: string | null;
    createdAt: string;
    updatedAt: string;
};

type PatchAction = "in_progress" | "deliver" | "reject";

// "open" = pendientes + en producción (es el default de la api).
const STATUS_FILTERS = ["open", "delivered", "rejected", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const FILTER_LABELS: Record<StatusFilter, string> = {
    open: "Abiertos",
    delivered: "Entregados",
    rejected: "Rechazados",
    all: "Todos",
};

const STATUS_LABELS: Record<CustomDesignStatus, string> = {
    awaiting_payment: "Cobro sin confirmar",
    pending: "Pendiente",
    in_progress: "En producción",
    delivered: "Entregado",
    rejected: "Rechazado",
};

const STATUS_CLASSES: Record<CustomDesignStatus, string> = {
    awaiting_payment: "text-stone-400",
    pending: "text-amber-300",
    in_progress: "text-sky-300",
    delivered: "text-emerald-300",
    rejected: "text-rose-300",
};

const SLOT_LABELS: Record<string, string> = {
    casco: "Casco",
    escudo: "Escudo",
    arma: "Arma",
    cuerpo: "Cuerpo",
};

const STAFF_HELP_TEXT =
    "Creá el item con el gráfico en la herramienta developer (importar sprites), desplegalo y después entregalo con su número de objeto. Recomendado: nonTradeable y noAuction en 1.";

const INPUT_CLASS =
    "w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-200/40";
const PRIMARY_BUTTON_CLASS =
    "inline-flex items-center justify-center rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2a1704] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";
const SECONDARY_BUTTON_CLASS =
    "inline-flex items-center justify-center rounded-[4px] border border-amber-300/40 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-amber-200 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60";
const DANGER_BUTTON_CLASS =
    "inline-flex items-center justify-center rounded-[4px] border border-rose-400/50 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60";

function formatDate(value: string) {
    return new Date(value).toLocaleString("es-AR");
}

function isProcessable(status: CustomDesignStatus) {
    return status === "pending" || status === "in_progress";
}

async function readApiError(response: Response, fallback: string) {
    try {
        const result = (await response.json()) as { error?: string };
        return result.error || fallback;
    } catch {
        return fallback;
    }
}

export default function GmCustomDesignsPage() {
    useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    const [requests, setRequests] = useState<CustomDesignRequest[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [busyAction, setBusyAction] = useState<PatchAction | null>(null);
    const [objIndexInput, setObjIndexInput] = useState("");
    const [deliverNote, setDeliverNote] = useState("");
    const [rejectNote, setRejectNote] = useState("");

    const load = useCallback(async (status: StatusFilter) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/gm/custom-designs?status=${status}`, {
                cache: "no-store",
            });

            if (response.status === 401 || response.status === 403) {
                setForbidden(true);
                return;
            }

            if (!response.ok) {
                setError(
                    await readApiError(response, "No se pudieron cargar los pedidos."),
                );
                return;
            }

            const result = (await response.json()) as unknown;

            if (!Array.isArray(result)) {
                setError("No se pudieron cargar los pedidos.");
                return;
            }

            setForbidden(false);
            setRequests(result as CustomDesignRequest[]);
        } catch {
            setError("No se pudieron cargar los pedidos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(statusFilter);
    }, [load, statusFilter]);

    function openRequest(id: string) {
        setSelectedId(id);
        setActionError(null);
        setObjIndexInput("");
        setDeliverNote("");
        setRejectNote("");
    }

    function closeRequest() {
        if (busyAction) {
            return;
        }

        setSelectedId(null);
        setActionError(null);
    }

    async function runAction(
        request: CustomDesignRequest,
        action: PatchAction,
        payload: { objIndex?: number; note?: string },
    ) {
        setBusyAction(action);
        setActionError(null);

        try {
            const response = await fetch(`/api/gm/custom-designs/${request.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, ...payload }),
            });

            if (!response.ok) {
                setActionError(
                    await readApiError(response, "No se pudo actualizar el pedido."),
                );
                return;
            }

            const updated = (await response.json()) as CustomDesignRequest;
            setRequests((current) =>
                current.map((item) => (item.id === updated.id ? updated : item)),
            );

            if (action === "in_progress") {
                setNotice(`"${updated.title}" pasó a producción.`);
                return;
            }

            setNotice(
                action === "deliver"
                    ? `"${updated.title}" entregado a ${updated.characterName} (objeto #${updated.deliveredObjIndex}).`
                    : `"${updated.title}" rechazado: se devolvieron ${updated.points} puntos a ${updated.characterName}.`,
            );
            setSelectedId(null);
            await load(statusFilter);
        } catch {
            setActionError("No se pudo conectar con el servidor.");
        } finally {
            setBusyAction(null);
        }
    }

    function handleStart(request: CustomDesignRequest) {
        void runAction(request, "in_progress", {});
    }

    function handleDeliver(request: CustomDesignRequest) {
        const objIndex = Number(objIndexInput);

        if (!Number.isInteger(objIndex) || objIndex <= 0) {
            setActionError("Indicá el número de objeto (entero mayor a 0).");
            return;
        }

        void runAction(request, "deliver", {
            objIndex,
            note: deliverNote.trim() || undefined,
        });
    }

    function handleReject(request: CustomDesignRequest) {
        const note = rejectNote.trim();

        if (!note) {
            setActionError("Escribí el motivo del rechazo (lo ve el jugador).");
            return;
        }

        const confirmed = window.confirm(
            `¿Rechazar "${request.title}" y devolverle ${request.points} puntos de donación a ${request.characterName}?`,
        );

        if (!confirmed) {
            return;
        }

        void runAction(request, "reject", { note });
    }

    if (forbidden) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#050302] px-4 text-stone-100">
                <p className="text-sm text-stone-400">
                    No autorizado. Esta página es solo para GM/staff.
                </p>
            </main>
        );
    }

    const selected = requests.find((request) => request.id === selectedId) ?? null;

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] px-4 py-10 text-stone-100">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1
                        className="text-2xl tracking-[0.08em] text-amber-200"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                        Diseños personalizados
                    </h1>
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setStatusFilter(filter)}
                                className={`rounded-[4px] border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                                    statusFilter === filter
                                        ? "border-amber-300/60 bg-amber-200/10 text-amber-200"
                                        : "border-white/10 text-stone-400 hover:text-stone-200"
                                }`}
                            >
                                {FILTER_LABELS[filter]}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="rounded-2xl border border-amber-200/15 bg-white/[0.03] px-4 py-3 text-sm text-stone-300">
                    {STAFF_HELP_TEXT}
                </p>

                {error && (
                    <div className="rounded-2xl bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                )}

                {notice && (
                    <div className="flex items-start justify-between gap-3 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        <span>{notice}</span>
                        <button
                            type="button"
                            onClick={() => setNotice(null)}
                            className="text-emerald-300/70 hover:text-emerald-100"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-stone-500">Cargando...</p>
                ) : requests.length === 0 ? (
                    <p className="text-sm text-stone-500">No hay pedidos.</p>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-amber-200/15">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-stone-400">
                                <tr>
                                    <th className="px-3 py-2">Personaje</th>
                                    <th className="px-3 py-2">Producto</th>
                                    <th className="px-3 py-2">Título</th>
                                    <th className="px-3 py-2">Puntos</th>
                                    <th className="px-3 py-2">Fecha</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr
                                        key={request.id}
                                        className="border-t border-white/5 align-top hover:bg-white/[0.02]"
                                    >
                                        <td className="px-3 py-2">{request.characterName}</td>
                                        <td className="px-3 py-2 text-stone-300">
                                            <span className="block">
                                                {SLOT_LABELS[request.slot] ?? request.slot}
                                            </span>
                                            <span className="block text-xs text-stone-500">
                                                {request.productId}
                                            </span>
                                        </td>
                                        <td className="max-w-xs truncate px-3 py-2 text-stone-300">
                                            {request.title}
                                        </td>
                                        <td className="px-3 py-2 text-stone-300">
                                            {request.points}
                                        </td>
                                        <td className="px-3 py-2 text-xs text-stone-500">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className={STATUS_CLASSES[request.status]}>
                                                {STATUS_LABELS[request.status] ?? request.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2">
                                            <button
                                                type="button"
                                                onClick={() => openRequest(request.id)}
                                                className="text-xs text-amber-200 hover:underline"
                                            >
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {selected && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
                    onClick={closeRequest}
                >
                    <div
                        className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-amber-200/15 bg-[#0a0605] p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg text-amber-200">{selected.title}</h2>
                                <p className="text-xs text-stone-500">
                                    {SLOT_LABELS[selected.slot] ?? selected.slot} ·{" "}
                                    {selected.productId} · {selected.points} puntos
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeRequest}
                                className="text-stone-400 hover:text-stone-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-1 text-sm text-stone-300">
                            <p>
                                <span className="text-stone-500">Personaje:</span>{" "}
                                {selected.characterName}
                            </p>
                            <p>
                                <span className="text-stone-500">Pedido:</span>{" "}
                                {formatDate(selected.createdAt)}
                            </p>
                            <p>
                                <span className="text-stone-500">Estado:</span>{" "}
                                <span className={STATUS_CLASSES[selected.status]}>
                                    {STATUS_LABELS[selected.status] ?? selected.status}
                                </span>
                                {selected.handledBy && (
                                    <span className="text-stone-500">
                                        {" "}
                                        (por {selected.handledBy})
                                    </span>
                                )}
                            </p>
                        </div>

                        <p className="whitespace-pre-line rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-stone-200">
                            {selected.description}
                        </p>

                        {selected.hasImage ? (
                            <a
                                href={`/api/custom-designs/${selected.id}/image`}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                                title="Abrir la imagen en otra pestaña"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element -- imagen privada servida por el proxy con la sesion */}
                                <img
                                    src={`/api/custom-designs/${selected.id}/image`}
                                    alt={`Referencia de ${selected.title}`}
                                    className="max-h-72 w-full rounded-xl border border-white/10 bg-black/40 object-contain"
                                />
                            </a>
                        ) : (
                            <p className="text-xs text-stone-500">
                                El jugador no adjuntó imagen de referencia.
                            </p>
                        )}

                        {selected.staffNote && (
                            <p className="text-sm text-stone-300">
                                <span className="text-stone-500">Nota del staff:</span>{" "}
                                {selected.staffNote}
                            </p>
                        )}

                        {actionError && (
                            <div className="rounded-xl bg-rose-500/12 px-3 py-2 text-sm text-rose-200">
                                {actionError}
                            </div>
                        )}

                        {isProcessable(selected.status) ? (
                            <div className="space-y-4 border-t border-white/10 pt-4">
                                {selected.status === "pending" && (
                                    <button
                                        type="button"
                                        disabled={busyAction !== null}
                                        onClick={() => handleStart(selected)}
                                        className={SECONDARY_BUTTON_CLASS}
                                    >
                                        {busyAction === "in_progress"
                                            ? "Actualizando..."
                                            : "Pasar a producción"}
                                    </button>
                                )}

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Entregar
                                    </p>
                                    <input
                                        type="number"
                                        min={1}
                                        step={1}
                                        inputMode="numeric"
                                        value={objIndexInput}
                                        onChange={(event) => setObjIndexInput(event.target.value)}
                                        placeholder="Número de objeto (objIndex)"
                                        className={INPUT_CLASS}
                                    />
                                    <input
                                        type="text"
                                        value={deliverNote}
                                        onChange={(event) => setDeliverNote(event.target.value)}
                                        placeholder="Nota (opcional)"
                                        maxLength={500}
                                        className={INPUT_CLASS}
                                    />
                                    <button
                                        type="button"
                                        disabled={busyAction !== null}
                                        onClick={() => handleDeliver(selected)}
                                        className={PRIMARY_BUTTON_CLASS}
                                    >
                                        {busyAction === "deliver" ? "Entregando..." : "Entregar"}
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">
                                        Rechazar
                                    </p>
                                    <textarea
                                        value={rejectNote}
                                        onChange={(event) => setRejectNote(event.target.value)}
                                        placeholder="Motivo del rechazo (obligatorio, lo ve el jugador)"
                                        maxLength={500}
                                        rows={2}
                                        className={INPUT_CLASS}
                                    />
                                    <button
                                        type="button"
                                        disabled={busyAction !== null}
                                        onClick={() => handleReject(selected)}
                                        className={DANGER_BUTTON_CLASS}
                                    >
                                        {busyAction === "reject"
                                            ? "Rechazando..."
                                            : "Rechazar y reembolsar"}
                                    </button>
                                </div>
                            </div>
                        ) : selected.status === "delivered" ? (
                            <p className="text-xs text-stone-500">
                                Entregado
                                {selected.deliveredObjIndex
                                    ? ` como objeto #${selected.deliveredObjIndex}`
                                    : ""}{" "}
                                el {formatDate(selected.updatedAt)}.
                            </p>
                        ) : selected.status === "rejected" ? (
                            <p className="text-xs text-stone-500">
                                Rechazado y reembolsado el {formatDate(selected.updatedAt)}.
                            </p>
                        ) : (
                            <p className="text-xs text-stone-500">
                                El cobro de este pedido no se confirmó. Revisá los logs de
                                la api y los puntos del personaje antes de hacer nada.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
