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

type PackagesResponse = {
    packages?: DonationPackage[];
    methods?: { card?: boolean; crypto?: boolean };
    cardMinUsd?: number | null;
};

type PaymentMethod = "card" | "crypto";

function DonacionesPageContent() {
    const searchParams = useSearchParams();
    const status = searchParams.get("status");
    useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    const [packages, setPackages] = useState<DonationPackage[]>([]);
    const [cardEnabled, setCardEnabled] = useState(false);
    const [cryptoEnabled, setCryptoEnabled] = useState(false);
    const [cardMinUsd, setCardMinUsd] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingPackageId, setPendingPackageId] = useState<string | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [method, setMethod] = useState<PaymentMethod>("card");
    const [coin, setCoin] = useState<"usdt" | "usdc">("usdt");

    useEffect(() => {
        let cancelled = false;

        fetch("/api/donations/packages", { cache: "no-store" })
            .then((response) => response.json())
            .then((result: PackagesResponse) => {
                if (cancelled) {
                    return;
                }

                const card = Boolean(result.methods?.card);
                const crypto = Boolean(result.methods?.crypto);
                setPackages(result.packages ?? []);
                setCardEnabled(card);
                setCryptoEnabled(crypto);
                setCardMinUsd(result.cardMinUsd ?? null);
                setMethod(card ? "card" : "crypto");
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
            const response = await fetch(
                method === "card"
                    ? "/api/donations/create-card-checkout"
                    : "/api/donations/create-invoice",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ packageId, coin }),
                },
            );
            const result = (await response.json()) as {
                invoiceUrl?: string;
                checkoutUrl?: string;
                error?: string;
            };
            const destination = result.checkoutUrl ?? result.invoiceUrl;

            if (!response.ok || !destination) {
                setError(result.error ?? "No se pudo iniciar el pago.");
                setPendingPackageId(null);
                return;
            }

            window.location.assign(destination);
        } catch {
            setError("No se pudo iniciar el pago.");
            setPendingPackageId(null);
        }
    }

    const noMethodAvailable = !loading && !cardEnabled && !cryptoEnabled;

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
                        dentro del juego.
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
                {noMethodAvailable && (
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-stone-300">
                        Las donaciones no están disponibles en este momento.
                    </div>
                )}

                {!loading && cardEnabled && cryptoEnabled && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {(
                            [
                                ["card", "Tarjeta"],
                                ["crypto", "Cripto (USDT / USDC)"],
                            ] as const
                        ).map(([option, label]) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setMethod(option)}
                                className={`rounded-[4px] border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                                    method === option
                                        ? "border-amber-300/60 bg-amber-200/10 text-amber-200"
                                        : "border-white/10 text-stone-400 hover:text-stone-200"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {!loading && method === "crypto" && cryptoEnabled && (
                    <div className="flex items-center justify-center gap-2">
                        {(["usdt", "usdc"] as const).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setCoin(option)}
                                className={`rounded-[4px] border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
                                    coin === option
                                        ? "border-amber-300/60 bg-amber-200/10 text-amber-200"
                                        : "border-white/10 text-stone-400 hover:text-stone-200"
                                }`}
                            >
                                Pagar con {option.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-sm text-stone-500">
                        Cargando paquetes...
                    </p>
                ) : (
                    !noMethodAvailable && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {packages.map((pkg) => {
                                const belowCardMinimum =
                                    method === "card" &&
                                    cardMinUsd !== null &&
                                    pkg.usd < cardMinUsd;

                                return (
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
                                                {pkg.points.toLocaleString(
                                                    "es-AR",
                                                )}{" "}
                                                puntos de donación
                                            </div>
                                            {belowCardMinimum && (
                                                <p className="text-xs text-stone-500">
                                                    Con tarjeta el mínimo es $
                                                    {Math.ceil(cardMinUsd ?? 0)}.
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            disabled={
                                                pendingPackageId !== null ||
                                                belowCardMinimum
                                            }
                                            onClick={() => handleBuy(pkg.id)}
                                            className="inline-flex items-center justify-center rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2a1704] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {pendingPackageId === pkg.id
                                                ? "Redirigiendo..."
                                                : method === "card"
                                                  ? "Pagar con tarjeta"
                                                  : "Donar"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {!loading && !noMethodAvailable && (
                    <p className="text-center text-xs text-stone-600">
                        {method === "card"
                            ? "El pago con tarjeta lo procesa MoonPay. La primera vez te va a pedir verificar tu identidad."
                            : "Los pagos en cripto se procesan a través de NOWPayments (USDT, USDC)."}
                    </p>
                )}
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
