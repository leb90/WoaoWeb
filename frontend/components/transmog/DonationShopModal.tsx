"use client";

import React from "react";
import {
    Check,
    ChevronsUp,
    Coins,
    Crown,
    Ghost,
    Gift,
    ImagePlus,
    Info,
    LoaderCircle,
    Palette,
    Shield,
    ShoppingBag,
    Sparkles,
    Star,
    Sword,
    X,
} from "lucide-react";
import { ItemGraphic } from "../MacroBar";
import type { GraphicData } from "../../types/game";
import type {
    ShopProductPayload,
    ShopStatePayload,
    TransmogSlotKey,
} from "../../lib/aowProtocol";
import AppearancePreview from "./AppearancePreview";
import {
    applyAppearancePiece,
    formatPoints,
    TRANSMOG_SLOT_META,
} from "./appearance";

type DonationShopModalProps = {
    state?: ShopStatePayload;
    graphicsDB: Record<string, GraphicData> | null;
    onSendCommand?: (command: string) => void;
    onClose: () => void;
    onOpenTransmog: () => void;
};

type DesignRequest = {
    id: string;
    productId: string;
    slot: TransmogSlotKey;
    title: string;
    description: string;
    hasImage: boolean;
    points: number;
    status:
        | "pending"
        | "in_progress"
        | "delivered"
        | "rejected"
        | "awaiting_payment";
    staffNote: string | null;
    createdAt: string;
};

const CATEGORY_ICON: Record<
    string,
    React.ComponentType<{ className?: string }>
> = {
    destacados: Star,
    transfiguracion: Sparkles,
    personaje: ChevronsUp,
    objetos: Gift,
    disenos: Palette,
};

const SUBCATEGORY_ICON: Record<
    TransmogSlotKey,
    React.ComponentType<{ className?: string }>
> = {
    casco: Crown,
    escudo: Shield,
    arma: Sword,
    cuerpo: Ghost,
};

const STATUS_LABEL: Record<
    DesignRequest["status"],
    { label: string; className: string }
> = {
    awaiting_payment: {
        label: "Procesando pago",
        className: "border-stone-500/50 text-stone-300",
    },
    pending: {
        label: "Pendiente",
        className: "border-amber-300/50 bg-amber-400/10 text-amber-100",
    },
    in_progress: {
        label: "En producción",
        className: "border-sky-300/50 bg-sky-400/10 text-sky-100",
    },
    delivered: {
        label: "Entregado",
        className: "border-emerald-300/50 bg-emerald-400/10 text-emerald-100",
    },
    rejected: {
        label: "Rechazado (reembolsado)",
        className: "border-rose-300/50 bg-rose-400/10 text-rose-100",
    },
};

const MAX_IMAGE_BYTES = 1024 * 1024;

function PointsBadge({
    value,
    size = "md",
}: {
    value: number;
    size?: "sm" | "md";
}) {
    return (
        <span
            className={`inline-flex items-center gap-1 font-bold text-amber-200 ${size === "sm" ? "text-xs" : "text-base"}`}
        >
            <Coins className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
            {formatPoints(value)}
        </span>
    );
}

function ProductIcon({
    product,
    graphicsDB,
    size = 52,
}: {
    product: ShopProductPayload;
    graphicsDB: Record<string, GraphicData> | null;
    size?: number;
}) {
    if (product.grhIndex > 0) {
        return (
            <ItemGraphic
                graphicData={graphicsDB?.[String(product.grhIndex)]}
                name={product.name}
                size={size}
            />
        );
    }

    const Icon =
        product.kind === "levelUp"
            ? ChevronsUp
            : product.kind === "customDesign" && product.slot
              ? SUBCATEGORY_ICON[product.slot]
              : Gift;
    return (
        <span
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <Icon className="h-8 w-8 text-amber-200/80" />
        </span>
    );
}

export default function DonationShopModal({
    state,
    graphicsDB,
    onSendCommand,
    onClose,
    onOpenTransmog,
}: DonationShopModalProps) {
    const [category, setCategory] = React.useState("destacados");
    const [subcategory, setSubcategory] = React.useState<
        TransmogSlotKey | "todo"
    >("todo");
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [quantity, setQuantity] = React.useState(1);
    const [confirming, setConfirming] = React.useState(false);
    const [pendingPurchase, setPendingPurchase] = React.useState<string | null>(
        null,
    );
    const [toast, setToast] = React.useState<{
        ok: boolean;
        message: string;
    } | null>(null);
    const lastResultAtRef = React.useRef<number | null>(
        state?.lastResult?.at ?? null,
    );

    // Formulario de diseño personalizado.
    const [designTitle, setDesignTitle] = React.useState("");
    const [designDescription, setDesignDescription] = React.useState("");
    const [designImage, setDesignImage] = React.useState<string | null>(null);
    const [designError, setDesignError] = React.useState<string | null>(null);
    const [designSending, setDesignSending] = React.useState(false);
    const [requests, setRequests] = React.useState<DesignRequest[] | null>(
        null,
    );

    const products = React.useMemo(
        () => state?.products ?? [],
        [state?.products],
    );
    const points = state?.points ?? 0;

    React.useEffect(() => {
        const result = state?.lastResult;
        if (!result || result.at === lastResultAtRef.current) {
            return;
        }
        lastResultAtRef.current = result.at;
        setPendingPurchase(null);
        setConfirming(false);
        setToast({ ok: result.ok, message: result.message });
    }, [state?.lastResult]);

    React.useEffect(() => {
        if (!toast) {
            return;
        }
        const timeout = window.setTimeout(() => setToast(null), 6000);
        return () => window.clearTimeout(timeout);
    }, [toast]);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                if (confirming) {
                    setConfirming(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [confirming, onClose]);

    const loadRequests = React.useCallback(async () => {
        try {
            const response = await fetch("/api/custom-designs", {
                cache: "no-store",
            });
            if (!response.ok) {
                setRequests([]);
                return;
            }
            const data = (await response.json()) as DesignRequest[];
            setRequests(Array.isArray(data) ? data : []);
        } catch {
            setRequests([]);
        }
    }, []);

    React.useEffect(() => {
        if (category === "disenos" && requests === null) {
            void loadRequests();
        }
    }, [category, loadRequests, requests]);

    const visibleProducts = React.useMemo(() => {
        const inCategory =
            category === "destacados"
                ? products.filter((product) => product.featured)
                : products.filter((product) => product.category === category);

        if (category === "transfiguracion" && subcategory !== "todo") {
            return inCategory.filter(
                (product) => product.subcategory === subcategory,
            );
        }

        return inCategory;
    }, [category, products, subcategory]);

    const selected =
        products.find((product) => product.id === selectedId) ??
        (category === "disenos" ? null : visibleProducts[0]) ??
        null;

    React.useEffect(() => {
        setQuantity(1);
        setConfirming(false);
    }, [selected?.id]);

    const isStackable = Boolean(
        selected && selected.kind === "item" && !selected.transmogSlot,
    );
    const totalPrice = selected
        ? selected.price * (isStackable ? quantity : 1)
        : 0;
    const canAfford = points >= totalPrice;
    const previewAppearance = !state?.appearance
        ? null
        : selected?.transmogSlot
          ? applyAppearancePiece(
                state.appearance.preview,
                selected.transmogSlot,
                selected.graphic,
            )
          : state.appearance.preview;

    const buy = () => {
        if (!selected || !canAfford || pendingPurchase) {
            return;
        }
        setPendingPurchase(selected.id);
        onSendCommand?.(
            `/tiendacomprar ${selected.id}${isStackable && quantity > 1 ? ` ${quantity}` : ""}`,
        );
        window.setTimeout(() => setPendingPurchase(null), 5000);
    };

    const openBuyPoints = () => {
        window.open("/donaciones", "_blank", "noopener,noreferrer");
    };

    const onPickImage = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        setDesignError(null);

        if (!file) {
            return;
        }

        if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
            setDesignError("La imagen tiene que ser PNG, JPG o WEBP.");
            return;
        }

        if (file.size > MAX_IMAGE_BYTES) {
            setDesignError("La imagen no puede pesar más de 1 MB.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () =>
            setDesignImage(
                typeof reader.result === "string" ? reader.result : null,
            );
        reader.onerror = () => setDesignError("No se pudo leer la imagen.");
        reader.readAsDataURL(file);
    };

    const submitDesign = async () => {
        if (!selected || selected.kind !== "customDesign" || designSending) {
            return;
        }

        const title = designTitle.trim();
        const description = designDescription.trim();

        if (title.length < 3 || title.length > 60) {
            setDesignError(
                "El nombre tiene que tener entre 3 y 60 caracteres.",
            );
            return;
        }

        if (description.length < 10) {
            setDesignError(
                "Contanos un poco más de tu idea (mínimo 10 caracteres).",
            );
            return;
        }

        if (!canAfford) {
            setDesignError(
                `Necesitás ${formatPoints(selected.price)} puntos de donación.`,
            );
            return;
        }

        if (
            !window.confirm(
                `¿Pedir "${title}" por ${formatPoints(selected.price)} puntos de donación?`,
            )
        ) {
            return;
        }

        setDesignSending(true);
        setDesignError(null);

        try {
            const response = await fetch("/api/custom-designs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: selected.id,
                    title,
                    description,
                    image: designImage ?? undefined,
                }),
            });
            const data = (await response.json().catch(() => ({}))) as {
                error?: string;
            };

            if (!response.ok) {
                setDesignError(data.error ?? "No se pudo enviar el pedido.");
                return;
            }

            setDesignTitle("");
            setDesignDescription("");
            setDesignImage(null);
            setToast({
                ok: true,
                message: `¡Pedido enviado! El equipo de arte va a dibujar "${title}" y te avisamos cuando esté listo.`,
            });
            void loadRequests();
        } catch {
            setDesignError(
                "No se pudo conectar con la tienda. Probá de nuevo en un rato.",
            );
        } finally {
            setDesignSending(false);
        }
    };

    const categories = state?.categories ?? [];

    return (
        <div
            className="fixed inset-0 z-[84] flex items-center justify-center bg-black/60 px-2 py-2 backdrop-blur-[3px] sm:px-4"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Tienda"
                className="relative flex h-[min(760px,calc(100dvh-16px))] w-[min(1240px,calc(100vw-16px))] flex-col overflow-hidden rounded border border-amber-200/25 bg-[#110b07]/98 text-stone-100 shadow-[0_28px_90px_rgba(0,0,0,0.7)]"
                onClick={(event) => event.stopPropagation()}
            >
                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/15 bg-[linear-gradient(180deg,rgba(150,98,40,0.35),rgba(18,12,8,0))] px-4 py-3 short:py-1.5">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/60 bg-[radial-gradient(circle_at_40%_35%,#f7d488,#8a5513)] text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/80">
                                World of AO
                            </p>
                            <h2
                                className="text-xl font-semibold text-[#f2e5ca]"
                                style={{ fontFamily: "var(--font-cinzel)" }}
                            >
                                Tienda
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 rounded border border-amber-300/30 bg-black/40 px-3 py-1.5">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400">
                                Tus puntos
                            </span>
                            <PointsBadge value={points} />
                        </div>
                        <button
                            type="button"
                            onClick={openBuyPoints}
                            className="rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f7c84f,#a96512)] px-3 py-2 text-xs font-bold text-stone-950 transition hover:brightness-110"
                        >
                            Comprar puntos
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="rounded-full border border-stone-700 bg-black/20 p-1.5 text-stone-300 transition hover:border-amber-300/60 hover:text-amber-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                {state?.pendingDeliveries ? (
                    <p className="border-b border-sky-300/20 bg-sky-500/10 px-4 py-1.5 text-xs text-sky-100">
                        Tenés {state.pendingDeliveries} objeto(s) esperando a
                        que hagas lugar en el inventario. Liberá un espacio y
                        volvé a abrir la tienda.
                    </p>
                ) : null}

                <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[210px_minmax(0,1fr)] md:grid-rows-1 short:grid-cols-1 short:grid-rows-[auto_minmax(0,1fr)]">
                    <nav className="flex gap-1 overflow-x-auto border-b border-amber-200/10 bg-black/25 p-2 md:flex-col md:overflow-visible md:border-b-0 md:border-r short:flex-row short:overflow-x-auto short:border-b short:border-r-0 short:p-1.5">
                        {categories.map((entry) => {
                            const Icon = CATEGORY_ICON[entry.key] ?? Gift;
                            const isActive = category === entry.key;
                            return (
                                <button
                                    key={entry.key}
                                    type="button"
                                    onClick={() => {
                                        setCategory(entry.key);
                                        setSubcategory("todo");
                                        setSelectedId(null);
                                    }}
                                    className={`flex shrink-0 items-center gap-2 rounded border px-3 py-2 text-left text-sm transition ${
                                        isActive
                                            ? "border-amber-300/70 bg-[linear-gradient(90deg,rgba(245,158,11,0.22),rgba(0,0,0,0.1))] text-amber-50"
                                            : "border-transparent text-stone-300 hover:border-stone-600 hover:text-stone-100"
                                    }`}
                                >
                                    <Icon className="h-4 w-4 shrink-0 text-amber-300" />
                                    {entry.name}
                                </button>
                            );
                        })}
                        <div className="mt-auto hidden rounded border border-fuchsia-300/25 bg-fuchsia-500/10 p-3 text-xs text-fuchsia-100 md:block short:hidden">
                            <p className="font-semibold">
                                ¿Ya compraste una apariencia?
                            </p>
                            <p className="mt-1 text-fuchsia-100/80">
                                Ponela en Transfigurar para cambiar tu dibujo.
                            </p>
                            <button
                                type="button"
                                onClick={onOpenTransmog}
                                className="mt-2 w-full rounded border border-fuchsia-200/50 bg-fuchsia-400/15 px-2 py-1.5 font-semibold transition hover:border-fuchsia-100"
                            >
                                Abrir Transfigurar
                            </button>
                        </div>
                    </nav>

                    <div className="grid min-h-0 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:overflow-hidden short:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] short:overflow-hidden">
                        <section className="flex min-h-0 flex-col short:overflow-hidden">
                            <div className="border-b border-white/5 px-4 py-3 short:py-1.5">
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                    {categories.find(
                                        (entry) => entry.key === category,
                                    )?.name ?? "Tienda"}
                                </h3>
                                <p className="mt-0.5 text-xs text-stone-400">
                                    {
                                        categories.find(
                                            (entry) => entry.key === category,
                                        )?.desc
                                    }
                                </p>
                                {category === "transfiguracion" ? (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {(
                                            [
                                                "todo",
                                                "casco",
                                                "escudo",
                                                "arma",
                                                "cuerpo",
                                            ] as const
                                        ).map((key) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => {
                                                    setSubcategory(key);
                                                    setSelectedId(null);
                                                }}
                                                className={`rounded-[10px] border px-2.5 py-1 text-[11px] font-semibold transition ${
                                                    subcategory === key
                                                        ? "border-amber-400/50 bg-amber-500/15 text-amber-100"
                                                        : "border-transparent text-stone-300 hover:border-stone-600"
                                                }`}
                                            >
                                                {key === "todo"
                                                    ? "Todo"
                                                    : TRANSMOG_SLOT_META[key]
                                                          .plural}
                                            </button>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                                {visibleProducts.length === 0 ? (
                                    <p className="py-10 text-center text-sm text-stone-400">
                                        {state
                                            ? "No hay productos en esta sección."
                                            : "Cargando la tienda..."}
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2">
                                        {visibleProducts.map((product) => {
                                            const isSelected =
                                                selected?.id === product.id;
                                            const isDesign =
                                                product.kind === "customDesign";
                                            return (
                                                <button
                                                    key={product.id}
                                                    type="button"
                                                    onClick={() =>
                                                        setSelectedId(
                                                            product.id,
                                                        )
                                                    }
                                                    className={`relative flex flex-col items-center gap-1.5 rounded border px-2 pb-2.5 pt-3 text-center transition ${
                                                        isSelected
                                                            ? "border-amber-300/90 bg-[linear-gradient(180deg,rgba(245,158,11,0.2),rgba(8,6,4,0.95))] shadow-[0_0_22px_rgba(245,158,11,0.2)]"
                                                            : isDesign
                                                              ? "border-fuchsia-300/30 bg-[linear-gradient(180deg,rgba(168,85,247,0.14),rgba(8,6,4,0.95))] hover:border-fuchsia-200/70"
                                                              : "border-amber-200/10 bg-[linear-gradient(135deg,rgba(28,21,12,0.9),rgba(8,6,4,0.92))] hover:border-amber-300/50"
                                                    } ${product.unavailableReason ? "opacity-60" : ""}`}
                                                >
                                                    {product.badge ? (
                                                        <span className="absolute left-1.5 top-1.5 rounded-sm bg-amber-400 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-stone-950">
                                                            {product.badge}
                                                        </span>
                                                    ) : null}
                                                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/25 bg-[radial-gradient(circle,rgba(245,186,71,0.14),rgba(0,0,0,0.5)_70%)]">
                                                        <ProductIcon
                                                            product={product}
                                                            graphicsDB={
                                                                graphicsDB
                                                            }
                                                        />
                                                    </span>
                                                    <span className="line-clamp-2 min-h-[2.5em] text-sm leading-tight text-[#f2e5ca]">
                                                        {product.name.replace(
                                                            /^(Apariencia|Disfraz): /,
                                                            "",
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-[0.18em] text-stone-400">
                                                        {product.transmogSlot
                                                            ? product.transmogSlot ===
                                                              "cuerpo"
                                                                ? "Disfraz completo"
                                                                : `Apariencia · ${TRANSMOG_SLOT_META[product.transmogSlot].label}`
                                                            : product.kind ===
                                                                "levelUp"
                                                              ? "Personaje"
                                                              : isDesign
                                                                ? "Hecho a medida"
                                                                : "Objeto"}
                                                    </span>
                                                    <PointsBadge
                                                        value={product.price}
                                                        size="sm"
                                                    />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {category === "disenos" ? (
                                    <div className="mt-4 rounded border border-amber-200/10 bg-black/30 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200">
                                                Mis pedidos
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void loadRequests()
                                                }
                                                className="text-[11px] text-stone-400 hover:text-amber-100"
                                            >
                                                Actualizar
                                            </button>
                                        </div>
                                        {requests === null ? (
                                            <p className="mt-2 text-xs text-stone-400">
                                                Cargando...
                                            </p>
                                        ) : requests.length === 0 ? (
                                            <p className="mt-2 text-xs text-stone-400">
                                                Todavía no pediste ningún
                                                diseño.
                                            </p>
                                        ) : (
                                            <ul className="mt-2 flex flex-col gap-1.5">
                                                {requests.map((request) => (
                                                    <li
                                                        key={request.id}
                                                        className="rounded border border-white/10 bg-black/25 px-3 py-2 text-xs"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="truncate font-semibold text-[#f2e5ca]">
                                                                {request.title}
                                                                <span className="ml-1 font-normal text-stone-400">
                                                                    ·{" "}
                                                                    {TRANSMOG_SLOT_META[
                                                                        request
                                                                            .slot
                                                                    ]?.label ??
                                                                        request.slot}
                                                                </span>
                                                            </span>
                                                            <span
                                                                className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_LABEL[request.status]?.className ?? ""}`}
                                                            >
                                                                {STATUS_LABEL[
                                                                    request
                                                                        .status
                                                                ]?.label ??
                                                                    request.status}
                                                            </span>
                                                        </div>
                                                        {request.staffNote ? (
                                                            <p className="mt-1 text-stone-300">
                                                                Equipo de arte:{" "}
                                                                {
                                                                    request.staffNote
                                                                }
                                                            </p>
                                                        ) : null}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </section>

                        <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto border-t border-amber-200/10 bg-black/20 p-3 lg:border-l lg:border-t-0 short:border-l short:border-t-0 short:p-2">
                            {selected ? (
                                <>
                                    {selected.kind === "item" && selected.transmogSlot ? (
                                        <AppearancePreview
                                            appearance={previewAppearance}
                                            scale={2}
                                            caption="Probándolo en tu personaje"
                                        />
                                    ) : (
                                        <div className="flex h-[150px] items-center justify-center rounded border border-amber-200/10 bg-[radial-gradient(circle_at_50%_42%,rgba(245,186,71,0.16),rgba(0,0,0,0.38)_62%)]">
                                            <ProductIcon
                                                product={selected}
                                                graphicsDB={graphicsDB}
                                                size={72}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#f2e5ca]">
                                            {selected.name}
                                        </h3>
                                        {selected.desc ? (
                                            <p className="mt-1 text-sm text-stone-300">
                                                {selected.desc}
                                            </p>
                                        ) : null}
                                        {selected.kind === "item" && selected.transmogSlot ? (
                                            <p className="mt-2 flex items-start gap-1.5 text-xs text-stone-400">
                                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                                {selected.transmogSlot ===
                                                "cuerpo"
                                                    ? "Disfraz de cuerpo completo: reemplaza todo tu dibujo mientras lo tengas puesto en Transfigurar."
                                                    : "Solo cambia el dibujo: no se equipa ni da stats. Ponelo en Transfigurar."}
                                            </p>
                                        ) : null}
                                        {selected.kind === "levelUp" ? (
                                            <p className="mt-2 text-xs text-stone-400">
                                                Tu nivel actual:{" "}
                                                {state?.level ?? "-"}.
                                                Disponible hasta nivel{" "}
                                                {(selected.maxLevel ?? 51) - 1}.
                                            </p>
                                        ) : null}
                                    </div>

                                    {selected.kind === "customDesign" ? (
                                        <div className="flex flex-col gap-2 rounded border border-fuchsia-300/25 bg-fuchsia-500/5 p-3">
                                            <p className="text-xs text-fuchsia-100/90">
                                                El equipo de arte lo dibuja a
                                                mano a partir de tu idea: puede
                                                tardar algunos días. El objeto
                                                queda solo para vos. Si no se
                                                puede hacer, te devolvemos los
                                                puntos.
                                            </p>
                                            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-300">
                                                Nombre del diseño
                                                <input
                                                    value={designTitle}
                                                    onChange={(event) =>
                                                        setDesignTitle(
                                                            event.target.value,
                                                        )
                                                    }
                                                    maxLength={60}
                                                    placeholder="Ej: Yelmo del Dragón Rojo"
                                                    className="mt-1 w-full rounded border border-stone-600 bg-black/40 px-2 py-1.5 text-sm normal-case tracking-normal text-stone-100 outline-none focus:border-amber-300/70"
                                                />
                                            </label>
                                            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-300">
                                                Describí tu idea
                                                <textarea
                                                    value={designDescription}
                                                    onChange={(event) =>
                                                        setDesignDescription(
                                                            event.target.value,
                                                        )
                                                    }
                                                    maxLength={1000}
                                                    rows={4}
                                                    placeholder="Colores, forma, detalles, inspiración..."
                                                    className="mt-1 w-full resize-none rounded border border-stone-600 bg-black/40 px-2 py-1.5 text-sm normal-case tracking-normal text-stone-100 outline-none focus:border-amber-300/70"
                                                />
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-stone-600 bg-black/30 px-2.5 py-1.5 text-xs text-stone-200 transition hover:border-amber-300/60">
                                                    <ImagePlus className="h-4 w-4" />
                                                    {designImage
                                                        ? "Cambiar imagen"
                                                        : "Imagen de referencia"}
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={onPickImage}
                                                        className="hidden"
                                                    />
                                                </label>
                                                {designImage ? (
                                                    <>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={designImage}
                                                            alt="Referencia"
                                                            className="h-10 w-10 rounded border border-white/10 object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setDesignImage(
                                                                    null,
                                                                )
                                                            }
                                                            className="text-[11px] text-stone-400 hover:text-rose-200"
                                                        >
                                                            Quitar
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[11px] text-stone-500">
                                                        Opcional, hasta 1 MB
                                                    </span>
                                                )}
                                            </div>
                                            {designError ? (
                                                <p className="text-xs text-rose-200">
                                                    {designError}
                                                </p>
                                            ) : null}
                                        </div>
                                    ) : null}

                                    <div className="mt-auto rounded border border-amber-200/15 bg-black/35 p-3">
                                        {isStackable ? (
                                            <div className="mb-2 flex items-center justify-between text-xs text-stone-300">
                                                <span>Cantidad</span>
                                                <span className="grid h-8 grid-cols-[30px_36px_30px] items-center overflow-hidden rounded border border-stone-500/50 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuantity(
                                                                (value) =>
                                                                    Math.max(
                                                                        1,
                                                                        value -
                                                                            1,
                                                                    ),
                                                            )
                                                        }
                                                        className="h-full hover:bg-white/5"
                                                    >
                                                        -
                                                    </button>
                                                    <span>{quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setQuantity(
                                                                (value) =>
                                                                    Math.min(
                                                                        99,
                                                                        value +
                                                                            1,
                                                                    ),
                                                            )
                                                        }
                                                        className="h-full hover:bg-white/5"
                                                    >
                                                        +
                                                    </button>
                                                </span>
                                            </div>
                                        ) : null}
                                        <div className="flex items-center justify-between text-xs text-stone-400">
                                            <span>Precio</span>
                                            <PointsBadge value={totalPrice} />
                                        </div>
                                        <div className="mt-1 flex items-center justify-between text-xs text-stone-400">
                                            <span>Te quedan</span>
                                            <span
                                                className={
                                                    canAfford
                                                        ? "font-semibold text-emerald-200"
                                                        : "font-semibold text-rose-200"
                                                }
                                            >
                                                {canAfford
                                                    ? formatPoints(
                                                          points - totalPrice,
                                                      )
                                                    : `Te faltan ${formatPoints(totalPrice - points)}`}
                                            </span>
                                        </div>
                                        {selected.unavailableReason ? (
                                            <p className="mt-2 text-xs text-rose-200">
                                                {selected.unavailableReason}
                                            </p>
                                        ) : null}
                                        {selected.kind === "customDesign" ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    void submitDesign()
                                                }
                                                disabled={
                                                    designSending || !canAfford
                                                }
                                                className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-fuchsia-200/70 bg-[linear-gradient(180deg,#c084fc,#7e22ce)] px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {designSending ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Palette className="h-4 w-4" />
                                                )}
                                                Pedir diseño
                                            </button>
                                        ) : !canAfford ? (
                                            <button
                                                type="button"
                                                onClick={openBuyPoints}
                                                className="mt-3 w-full rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f7c84f,#a96512)] px-4 py-2.5 text-sm font-bold text-stone-950 transition hover:brightness-110"
                                            >
                                                Comprar puntos
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setConfirming(true)
                                                }
                                                disabled={
                                                    Boolean(
                                                        selected.unavailableReason,
                                                    ) ||
                                                    Boolean(pendingPurchase)
                                                }
                                                className="mt-3 flex w-full items-center justify-center gap-2 rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f7c84f,#a96512)] px-4 py-2.5 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {pendingPurchase ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <ShoppingBag className="h-4 w-4" />
                                                )}
                                                Comprar
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-stone-400">
                                    <Palette className="h-8 w-8 text-fuchsia-200/50" />
                                    {category === "disenos"
                                        ? "Elegí qué querés que te diseñemos: casco, escudo, arma o un disfraz completo."
                                        : "Elegí un producto para ver el detalle."}
                                </div>
                            )}
                        </aside>
                    </div>
                </div>

                {confirming && selected ? (
                    <div
                        className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 px-4"
                        onClick={() => setConfirming(false)}
                    >
                        <div
                            className="w-[min(420px,100%)] rounded border border-amber-300/40 bg-[#160e08] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/80">
                                Confirmar compra
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                <span className="flex h-14 w-14 items-center justify-center rounded border border-amber-500/30 bg-black/40">
                                    <ProductIcon
                                        product={selected}
                                        graphicsDB={graphicsDB}
                                        size={44}
                                    />
                                </span>
                                <div>
                                    <p className="font-semibold text-[#f2e5ca]">
                                        {selected.name}
                                        {isStackable && quantity > 1
                                            ? ` x${quantity}`
                                            : ""}
                                    </p>
                                    <PointsBadge value={totalPrice} size="sm" />
                                </div>
                            </div>
                            <div className="mt-3 rounded border border-white/10 bg-black/30 px-3 py-2 text-xs text-stone-300">
                                <div className="flex justify-between">
                                    <span>Saldo actual</span>
                                    <span>{formatPoints(points)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Después de comprar</span>
                                    <span className="font-semibold text-emerald-200">
                                        {formatPoints(points - totalPrice)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setConfirming(false)}
                                    className="rounded border border-stone-600/70 px-4 py-2 text-sm text-stone-200 hover:border-stone-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={buy}
                                    disabled={Boolean(pendingPurchase)}
                                    className="flex items-center gap-2 rounded border border-amber-300/70 bg-[linear-gradient(180deg,#f7c84f,#a96512)] px-4 py-2 text-sm font-bold text-stone-950 hover:brightness-110 disabled:opacity-60"
                                >
                                    {pendingPurchase ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {toast ? (
                    <div
                        className={`pointer-events-none absolute bottom-4 left-1/2 z-20 w-[min(520px,calc(100%-32px))] -translate-x-1/2 rounded border px-4 py-2.5 text-sm shadow-[0_10px_40px_rgba(0,0,0,0.6)] ${
                            toast.ok
                                ? "border-emerald-300/50 bg-[#0d1f14]/95 text-emerald-100"
                                : "border-rose-300/50 bg-[#24100f]/95 text-rose-100"
                        }`}
                    >
                        {toast.message}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
