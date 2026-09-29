"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthRedirect } from "../../../hooks/useAuthRedirect";

type GmTicket = {
    id: string;
    type: string;
    reporterCharacterId: string;
    reporterName: string;
    targetCharacterId: string | null;
    targetName: string | null;
    message: string;
    context: unknown;
    status: string;
    createdAt: string;
    resolvedAt: string | null;
    resolvedBy: string | null;
};

const STATUS_FILTERS = ["open", "resolved", "all"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const TYPE_LABELS: Record<string, string> = {
    report_player: "Reporte de jugador",
    bug: "Bug / ítem",
    general: "Consulta general",
};

function formatDate(value: string) {
    return new Date(value).toLocaleString("es-AR");
}

export default function GmTicketsPage() {
    useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    const [tickets, setTickets] = useState<GmTicket[]>([]);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [resolving, setResolving] = useState(false);

    const load = useCallback(async (status: StatusFilter) => {
        setLoading(true);
        setError(null);

        try {
            const query = status === "all" ? "" : `?status=${status}`;
            const response = await fetch(`/api/gm-tickets${query}`, {
                cache: "no-store",
            });

            if (response.status === 401 || response.status === 403) {
                setForbidden(true);
                return;
            }

            const result = (await response.json()) as GmTicket[] | { error: string };

            if (!response.ok || !Array.isArray(result)) {
                setError(
                    Array.isArray(result) ? null : (result as { error: string }).error,
                );
                return;
            }

            setForbidden(false);
            setTickets(result);
        } catch {
            setError("No se pudieron cargar los tickets.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load(statusFilter);
    }, [load, statusFilter]);

    async function handleResolve(id: string) {
        setResolving(true);

        try {
            const response = await fetch(`/api/gm-tickets/${id}/resolve`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: note.trim() || undefined }),
            });

            if (!response.ok) {
                const result = (await response.json()) as { error?: string };
                setError(result.error ?? "No se pudo resolver el ticket.");
                return;
            }

            setSelectedId(null);
            setNote("");
            await load(statusFilter);
        } finally {
            setResolving(false);
        }
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

    const selected = tickets.find((ticket) => ticket.id === selectedId) ?? null;

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] px-4 py-10 text-stone-100">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1
                        className="text-2xl tracking-[0.08em] text-amber-200"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                        Tickets de soporte (GM-Aris)
                    </h1>
                    <div className="flex gap-2">
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
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-rose-500/12 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-sm text-stone-500">Cargando...</p>
                ) : tickets.length === 0 ? (
                    <p className="text-sm text-stone-500">No hay tickets.</p>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-amber-200/15">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-stone-400">
                                <tr>
                                    <th className="px-3 py-2">Tipo</th>
                                    <th className="px-3 py-2">Reportante</th>
                                    <th className="px-3 py-2">Acusado</th>
                                    <th className="px-3 py-2">Mensaje</th>
                                    <th className="px-3 py-2">Estado</th>
                                    <th className="px-3 py-2">Fecha</th>
                                    <th className="px-3 py-2" />
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.map((ticket) => (
                                    <tr
                                        key={ticket.id}
                                        className="border-t border-white/5 align-top hover:bg-white/[0.02]"
                                    >
                                        <td className="px-3 py-2 text-stone-300">
                                            {TYPE_LABELS[ticket.type] ?? ticket.type}
                                        </td>
                                        <td className="px-3 py-2">{ticket.reporterName}</td>
                                        <td className="px-3 py-2 text-stone-400">
                                            {ticket.targetName ?? "—"}
                                        </td>
                                        <td className="max-w-xs truncate px-3 py-2 text-stone-300">
                                            {ticket.message}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={
                                                    ticket.status === "resolved"
                                                        ? "text-emerald-300"
                                                        : "text-amber-300"
                                                }
                                            >
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-xs text-stone-500">
                                            {formatDate(ticket.createdAt)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedId(ticket.id)}
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
                    onClick={() => setSelectedId(null)}
                >
                    <div
                        className="w-full max-w-lg space-y-4 rounded-2xl border border-amber-200/15 bg-[#0a0605] p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg text-amber-200">
                                {TYPE_LABELS[selected.type] ?? selected.type}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedId(null)}
                                className="text-stone-400 hover:text-stone-100"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-sm text-stone-300">
                            <span className="text-stone-500">Reportante:</span>{" "}
                            {selected.reporterName}
                        </p>
                        {selected.targetName && (
                            <p className="text-sm text-stone-300">
                                <span className="text-stone-500">Acusado:</span>{" "}
                                {selected.targetName}
                            </p>
                        )}
                        <p className="whitespace-pre-line rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-stone-200">
                            {selected.message}
                        </p>
                        {selected.status !== "resolved" ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(event) => setNote(event.target.value)}
                                    placeholder="Nota de resolución (opcional)"
                                    className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-200/40"
                                />
                                <button
                                    type="button"
                                    disabled={resolving}
                                    onClick={() => handleResolve(selected.id)}
                                    className="inline-flex items-center justify-center rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2a1704] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {resolving ? "Resolviendo..." : "Marcar como resuelto"}
                                </button>
                            </div>
                        ) : (
                            <p className="text-xs text-stone-500">
                                Resuelto por {selected.resolvedBy} el{" "}
                                {selected.resolvedAt ? formatDate(selected.resolvedAt) : ""}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
