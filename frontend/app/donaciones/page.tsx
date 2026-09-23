"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Coins, Gem } from "lucide-react";
import { useAuthRedirect } from "../../hooks/useAuthRedirect";

type DonationPackage = {
    id: string;
    usd: number;
    points: number;
    label: string;
};

function DonacionesPageContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    const [packages, setPackages] = useState<DonationPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [pendingPackageId, setPendingPackageId] = useState<string | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/donations/packages", { cache: "no-store" })
            .then((response) => response.json())
            .then((result: { packages?: DonationPackage[] }) => {
                if (!cancelled) {
                    setPackages(result.packages ?? []);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("No se pudo cargar los paquetes de donación.");
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleBuy(packageId: string) {
        setError(null);
        setPendingPackageId(packageId);

        try {
            const response = await fetch("/api/donations/create-invoice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ packageId }),
            });
            const result = (await response.json()) as {
                invoiceUrl?: string;
                error?: string;
            };

            if (!response.ok || !result.invoiceUrl) {
                setError(result.error ?? "No se pudo iniciar el pago.");
                setPendingPackageId(null);
                return;
            }

            window.location.assign(result.invoiceUrl);
        } catch {
            setError("No se pudo iniciar el pago.");
            setPendingPackageId(null);
        }
    }

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] px-4 py-10 text-stone-100">
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="space-y-2 text-center">
                    <h1
                        className="text-3xl tracking-[0.08em] text-amber-200"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                        Donaciones
                    </h1>
                    <p className="mx-auto max-w-xl text-sm text-stone-400">
                        Apoyá el desarrollo de World of AO y recibí puntos de
                        donación para canjear por objetos exclusivos con{" "}
                        <span className="text-amber-200">/canjeardonacion</span>{" "}
                        dentro del juego. Podés pagar con tarjeta de crédito o
                        débito.
                    </p>
                </div>

                {status === "success" && (
                    <div className="rounded-2xl bg-emerald-500/12 px-4 py-3 text-center text-sm text-emerald-200">
                        ¡Gracias por tu donación! Los puntos se acreditan
                        apenas se confirme el pago (puede tardar unos
                        minutos).
                    </div>
                )}
                {status === "cancel" && (
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-stone-300">
                        El pago fue cancelado. Podés volver a intentarlo
                        cuando quieras.
                    </div>
                )}
                {error && (
                    <div className="rounded-2xl bg-rose-500/12 px-4 py-3 text-center text-sm text-rose-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-sm text-stone-500">
                        Cargando paquetes...
                    </p>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200/15 bg-white/[0.03] p-6"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-amber-200">
                                        <Gem className="h-5 w-5" />
                                        <span
                                            className="text-2xl"
                                            style={{
                                                fontFamily:
                                                    "var(--font-cinzel)",
                                            }}
                                        >
                                            ${pkg.usd}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-sm text-stone-400">
                                        <Coins className="h-4 w-4" />
                                        {pkg.points.toLocaleString("es-AR")}{" "}
                                        puntos de donación
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={pendingPackageId !== null}
                                    onClick={() => handleBuy(pkg.id)}
                                    className="inline-flex items-center justify-center rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2a1704] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {pendingPackageId === pkg.id
                                        ? "Redirigiendo..."
                                        : "Donar"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-xs text-stone-600">
                    Los pagos se procesan a través de NOWPayments. Aceptamos
                    tarjeta de crédito/débito y criptomonedas (USDT, USDC y
                    otras).
                </p>
            </div>
        </main>
    );
}

export default function DonacionesPage() {
    return (
        <Suspense fallback={null}>
            <DonacionesPageContent />
        </Suspense>
    );
}
