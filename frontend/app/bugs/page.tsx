"use client";

import { Bug, MapPin, Monitor, RefreshCw, Smartphone, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

// Reportes que mandan los jugadores con el botón "Reportar BUG" del juego (components/BugReportModal.tsx).
// Solo cuentas con un personaje GM: la API responde 403 a las demás.

type BugStatus = "pending" | "in_progress" | "resolved";
type Filter = BugStatus | "all";

type BugReport = {
    id: string;
    characterId: string | null;
    reporterName: string;
    message: string;
    map: number | null;
    x: number | null;
    y: number | null;
    client: { userAgent?: string; viewport?: string; mobile?: boolean };
    status: BugStatus;
    handledBy: string | null;
    createdAt: string;
    updatedAt: string;
};

type Counts = Record<Filter, number>;

const STATUSES: BugStatus[] = ["pending", "in_progress", "resolved"];
const FILTERS: Filter[] = ["pending", "in_progress", "resolved", "all"];

const FILTER_LABELS: Record<Filter, string> = {
    pending: "Pendientes",
    in_progress: "En proceso",
    resolved: "Solucionados",
    all: "Todos",
};

const STATUS_LABELS: Record<BugStatus, string> = {
    pending: "Pendiente",
    in_progress: "En proceso",
    resolved: "Solucionado",
};

// Franja y botón activo de cada estado.
const STATUS_STYLES: Record<BugStatus, { stripe: string; active: string; dot: string }> = {
    pending: {
        stripe: "bg-amber-400/80",
        active: "border-amber-300/60 bg-amber-400/15 text-amber-100",
        dot: "bg-amber-400",
    },
    in_progress: {
        stripe: "bg-sky-400/80",
        active: "border-sky-300/60 bg-sky-400/15 text-sky-100",
        dot: "bg-sky-400",
    },
    resolved: {
        stripe: "bg-emerald-400/80",
        active: "border-emerald-300/60 bg-emerald-400/15 text-emerald-100",
        dot: "bg-emerald-400",
    },
};

const EMPTY_COUNTS: Counts = { pending: 0, in_progress: 0, resolved: 0, all: 0 };
const AUTO_REFRESH_MS = 60_000;

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
});

function formatDate(value: string) {
    return dateFormatter.format(new Date(value));
}

function formatRelative(value: string, now: number) {
    const minutes = Math.floor((now - new Date(value).getTime()) / 60_000);

    if (minutes < 1) {
        return "recién";
    }
    if (minutes < 60) {
        return `hace ${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `hace ${hours} h`;
    }

    const days = Math.floor(hours / 24);
    return days === 1 ? "hace 1 día" : `hace ${days} días`;
}

function describeBrowser(userAgent: string | undefined) {
    if (!userAgent) {
        return null;
    }
    if (/Edg\//.test(userAgent)) {
        return "Edge";
    }
    if (/OPR\/|Opera/.test(userAgent)) {
        return "Opera";
    }
    if (/Firefox\//.test(userAgent)) {
        return "Firefox";
    }
    if (/Chrome\/|CriOS\//.test(userAgent)) {
        return "Chrome";
    }
    if (/Safari\//.test(userAgent)) {
        return "Safari";
    }
    return null;
}

async function readError(response: Response, fallback: string) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    return result?.error ?? fallback;
}

export default function BugReportsPage() {
    useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    const [filter, setFilter] = useState<Filter>("pending");
    const [reports, setReports] = useState<BugReport[]>([]);
    const [counts, setCounts] = useState<Counts>(EMPTY_COUNTS);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [forbidden, setForbidden] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const requestSeq = useRef(0);

    const load = useCallback(async (nextFilter: Filter, silent = false) => {
        const seq = ++requestSeq.current;
        if (silent) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch(`/api/gm/bug-reports?status=${nextFilter}`, {
                cache: "no-store",
            });

            if (seq !== requestSeq.current) {
                return;
            }

            if (response.status === 401 || response.status === 403) {
                setForbidden(true);
                return;
            }

            if (!response.ok) {
                setError(await readError(response, "No se pudieron cargar los reportes."));
                return;
            }

            const result = (await response.json()) as { reports: BugReport[]; counts: Counts };
            setForbidden(false);
            setError(null);
            setReports(result.reports);
            setCounts(result.counts);
            setNow(Date.now());
        } catch {
            if (seq === requestSeq.current) {
                setError("No se pudo conectar con el servidor.");
            }
        } finally {
            if (seq === requestSeq.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        setConfirmDeleteId(null);
        void load(filter);
    }, [filter, load]);

    // Mientras la pestaña está a la vista se actualiza sola cada minuto, y también al volver a ella.
    useEffect(() => {
        const refresh = () => {
            if (document.visibilityState === "visible" && !busyId) {
                void load(filter, true);
            }
        };
        const interval = window.setInterval(refresh, AUTO_REFRESH_MS);
        document.addEventListener("visibilitychange", refresh);

        return () => {
            window.clearInterval(interval);
            document.removeEventListener("visibilitychange", refresh);
        };
    }, [busyId, filter, load]);

    function applyCountChange(from: BugStatus, to: BugStatus | null) {
        setCounts((current) => {
            const next = { ...current, [from]: Math.max(0, current[from] - 1) };
            if (to) {
                next[to] = next[to] + 1;
            } else {
                next.all = Math.max(0, next.all - 1);
            }
            return next;
        });
    }

    async function changeStatus(report: BugReport, status: BugStatus) {
        if (report.status === status || busyId) {
            return;
        }

        setBusyId(report.id);
        setError(null);

        try {
            const response = await fetch(`/api/gm/bug-reports/${report.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            if (!response.ok) {
                setError(await readError(response, "No se pudo cambiar el estado."));
                if (response.status === 404) {
                    void load(filter, true);
                }
                return;
            }

            const updated = (await response.json()) as BugReport;
            applyCountChange(report.status, updated.status);
            setReports((current) =>
                filter === "all" || filter === updated.status
                    ? current.map((item) => (item.id === updated.id ? updated : item))
                    : current.filter((item) => item.id !== updated.id),
            );
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setBusyId(null);
        }
    }

    async function deleteReport(report: BugReport) {
        if (busyId) {
            return;
        }

        setBusyId(report.id);
        setError(null);

        try {
            const response = await fetch(`/api/gm/bug-reports/${report.id}`, { method: "DELETE" });

            if (!response.ok && response.status !== 404) {
                setError(await readError(response, "No se pudo eliminar el reporte."));
                return;
            }

            if (response.ok) {
                applyCountChange(report.status, null);
            }
            setReports((current) => current.filter((item) => item.id !== report.id));
            setConfirmDeleteId(null);
        } catch {
            setError("No se pudo conectar con el servidor.");
        } finally {
            setBusyId(null);
        }
    }

    if (forbidden) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#050302] px-4 text-stone-100">
                <div className="max-w-sm text-center">
                    <Bug aria-hidden="true" className="mx-auto h-8 w-8 text-stone-600" strokeWidth={1.6} />
                    <h1 className="mt-4 text-lg text-amber-200" style={{ fontFamily: "var(--font-cinzel)" }}>
                        Solo para GM
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-stone-400">
                        Los reportes de bugs los ven las cuentas que tienen un personaje GM. Entrá con esa cuenta para
                        revisarlos.
                    </p>
                    <Link href="/" className="mt-5 inline-block text-sm text-amber-200 underline-offset-4 hover:underline">
                        Volver al inicio
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] px-4 py-10 text-stone-100 sm:py-12">
            <div className="mx-auto max-w-4xl">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1
                            className="text-2xl tracking-[0.06em] text-amber-200 sm:text-3xl"
                            style={{ fontFamily: "var(--font-cinzel)" }}
                        >
                            Reportes de bugs
                        </h1>
                        <p className="mt-1.5 text-sm text-stone-400">
                            Lo que mandan los jugadores con el botón Reportar BUG del juego.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void load(filter, true)}
                        disabled={refreshing || loading}
                        className="inline-flex items-center gap-2 rounded-[4px] border border-white/10 px-3 py-1.5 text-sm text-stone-300 transition hover:border-amber-300/40 hover:text-amber-100 focus-visible:outline-2 focus-visible:outline-amber-300/70 disabled:opacity-50"
                    >
                        <RefreshCw
                            aria-hidden="true"
                            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                            strokeWidth={2}
                        />
                        Actualizar
                    </button>
                </header>

                <nav aria-label="Filtrar por estado" className="mt-7 flex flex-wrap gap-2">
                    {FILTERS.map((option) => {
                        const isActive = filter === option;
                        return (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={isActive}
                                onClick={() => setFilter(option)}
                                className={`inline-flex items-center gap-2 rounded-[4px] border px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-amber-300/70 ${
                                    isActive
                                        ? "border-amber-300/60 bg-amber-200/10 text-amber-100"
                                        : "border-white/10 text-stone-400 hover:border-white/20 hover:text-stone-200"
                                }`}
                            >
                                {option !== "all" ? (
                                    <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[option].dot}`} />
                                ) : null}
                                {FILTER_LABELS[option]}
                                <span className={`tabular-nums ${isActive ? "text-amber-200/80" : "text-stone-500"}`}>
                                    {counts[option]}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {error ? (
                    <div role="alert" className="mt-5 rounded border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {error}
                    </div>
                ) : null}

                <section aria-live="polite" className="mt-6">
                    {loading ? (
                        <p className="py-16 text-center text-sm text-stone-500">Cargando reportes...</p>
                    ) : reports.length === 0 ? (
                        <div className="rounded border border-dashed border-white/10 py-16 text-center">
                            <p className="text-sm text-stone-300">
                                {filter === "all"
                                    ? "Todavía nadie reportó un bug."
                                    : `No hay reportes ${FILTER_LABELS[filter].toLowerCase()}.`}
                            </p>
                            {filter === "pending" ? (
                                <p className="mt-1 text-xs text-stone-500">Los nuevos aparecen acá solos.</p>
                            ) : null}
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {reports.map((report) => {
                                const isBusy = busyId === report.id;
                                const browser = describeBrowser(report.client.userAgent);
                                const device = [
                                    report.client.mobile ? "Celular" : "PC",
                                    browser,
                                    report.client.viewport,
                                ]
                                    .filter(Boolean)
                                    .join(", ");

                                return (
                                    <li
                                        key={report.id}
                                        className={`relative overflow-hidden rounded border border-amber-200/12 bg-[#0d0806] pl-4 transition ${
                                            isBusy ? "opacity-70" : ""
                                        }`}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`absolute inset-y-0 left-0 w-1 ${STATUS_STYLES[report.status].stripe}`}
                                        />
                                        <div className="px-4 py-4 sm:px-5">
                                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                                <p className="font-semibold text-[#f2e5ca]">{report.reporterName}</p>
                                                <time
                                                    dateTime={report.createdAt}
                                                    title={formatDate(report.createdAt)}
                                                    className="text-xs text-stone-500"
                                                >
                                                    {formatRelative(report.createdAt, now)}, {formatDate(report.createdAt)}
                                                </time>
                                            </div>

                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
                                                {report.map !== null ? (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-stone-500" />
                                                        Mapa {report.map}
                                                        {report.x !== null && report.y !== null
                                                            ? `, X ${report.x}, Y ${report.y}`
                                                            : ""}
                                                    </span>
                                                ) : null}
                                                <span
                                                    className="inline-flex items-center gap-1.5"
                                                    title={report.client.userAgent}
                                                >
                                                    {report.client.mobile ? (
                                                        <Smartphone aria-hidden="true" className="h-3.5 w-3.5 text-stone-500" />
                                                    ) : (
                                                        <Monitor aria-hidden="true" className="h-3.5 w-3.5 text-stone-500" />
                                                    )}
                                                    {device}
                                                </span>
                                            </div>

                                            <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-7 text-stone-200">
                                                {report.message}
                                            </p>

                                            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
                                                <div
                                                    role="group"
                                                    aria-label={`Estado del reporte de ${report.reporterName}`}
                                                    className="flex flex-wrap gap-1.5"
                                                >
                                                    {STATUSES.map((status) => {
                                                        const isCurrent = report.status === status;
                                                        return (
                                                            <button
                                                                key={status}
                                                                type="button"
                                                                aria-pressed={isCurrent}
                                                                disabled={isBusy}
                                                                onClick={() => void changeStatus(report, status)}
                                                                className={`rounded-[4px] border px-2.5 py-1 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-amber-300/70 disabled:cursor-wait ${
                                                                    isCurrent
                                                                        ? STATUS_STYLES[status].active
                                                                        : "border-white/10 text-stone-400 hover:border-white/25 hover:text-stone-100"
                                                                }`}
                                                            >
                                                                {STATUS_LABELS[status]}
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {confirmDeleteId === report.id ? (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <span className="text-stone-300">¿Eliminar este reporte?</span>
                                                        <button
                                                            type="button"
                                                            disabled={isBusy}
                                                            onClick={() => void deleteReport(report)}
                                                            className="rounded-[4px] border border-rose-400/50 bg-rose-500/15 px-2.5 py-1 font-semibold text-rose-100 transition hover:bg-rose-500/25 focus-visible:outline-2 focus-visible:outline-rose-300/70"
                                                        >
                                                            Eliminar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setConfirmDeleteId(null)}
                                                            className="rounded-[4px] border border-white/10 px-2.5 py-1 text-stone-300 transition hover:text-white focus-visible:outline-2 focus-visible:outline-amber-300/70"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isBusy}
                                                        onClick={() => setConfirmDeleteId(report.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-1 text-xs text-stone-500 transition hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline-2 focus-visible:outline-rose-300/70"
                                                    >
                                                        <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                                                        Eliminar
                                                    </button>
                                                )}
                                            </div>

                                            {report.handledBy ? (
                                                <p className="mt-2 text-xs text-stone-500">
                                                    Último cambio: {report.handledBy}, {formatDate(report.updatedAt)}
                                                </p>
                                            ) : null}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}
