"use client";

import React from "react";
import {
    type AuctionClaimEntry,
    type AuctionHouseState,
    type AuctionListingEntry,
    type InventoryItem,
    OBJECT_TYPE,
} from "../lib/aowProtocol";
import { formatNumber } from "../lib/number-format";
import type { GraphicData } from "../types/game";
import { getTexturePath, loadGraphicsDB } from "../utils/gameLoader";

export type AuctionBrowsePayload = {
    page: number;
    pageSize: number;
    search?: string;
    category?: string;
    buyoutOnly?: boolean;
};

type AuctionHouseModalProps = {
    state: AuctionHouseState;
    inventory: InventoryItem[];
    gold: number;
    embedded?: boolean;
    onClose: () => void;
    onRefresh: (browse: AuctionBrowsePayload) => void;
    onCreate: (
        slot: number,
        quantity: number,
        startPrice: number,
        buyoutPrice: number | null,
        durationHours: number,
        browse: AuctionBrowsePayload,
    ) => void;
    onBid: (auctionId: string, amount: number, browse: AuctionBrowsePayload) => void;
    onBuyout: (auctionId: string, browse: AuctionBrowsePayload) => void;
    onClaim: (claimId: string, browse: AuctionBrowsePayload) => void;
    onReadMail: (mailId: string, browse: AuctionBrowsePayload) => void;
};

type AuctionTab = "browse" | "sell" | "mine" | "bids" | "mail";
type AuctionSortKey = "time" | "currentBid" | "buyout";
type AuctionConfirmation = {
    title: string;
    description: string;
    rows: Array<{ label: string; value: string }>;
    confirmLabel: string;
    onConfirm: () => void;
};
type AuctionNotice = {
    message: string;
    tone: "success" | "warning";
};

const CATEGORY_OPTIONS = [
    { key: "", label: "Todas las categorias" },
    { key: String(OBJECT_TYPE.armas), label: "Armas" },
    { key: String(OBJECT_TYPE.armaduras), label: "Armaduras" },
    { key: String(OBJECT_TYPE.cascos), label: "Cascos" },
    { key: String(OBJECT_TYPE.escudos), label: "Escudos" },
    { key: String(OBJECT_TYPE.anillos), label: "Accesorios" },
    { key: String(OBJECT_TYPE.pociones), label: "Consumibles" },
    { key: "materials", label: "Materiales" },
    { key: "misc", label: "Miscelaneos" },
];

const MATERIAL_TYPES = new Set([
    OBJECT_TYPE.lenia,
    OBJECT_TYPE.metales,
    OBJECT_TYPE.lingotes,
    OBJECT_TYPE.gemas,
    OBJECT_TYPE.recetas,
]);

function formatRemainingTime(isoDate: string) {
    const diffMs = new Date(isoDate).getTime() - Date.now();
    if (!Number.isFinite(diffMs) || diffMs <= 0) return "Finalizada";
    const totalMinutes = Math.max(1, Math.floor(diffMs / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
}

function getListingStatusMeta(status: AuctionListingEntry["status"]) {
    if (status === "ACTIVE") return { label: "Activa", className: "text-emerald-300" };
    if (status === "CANCELLED") return { label: "Cancelada", className: "text-rose-300" };
    if (status === "EXPIRED") return { label: "Finalizada", className: "text-zinc-400" };
    if (status === "SOLD_BY_BUYOUT") return { label: "Vendida directa", className: "text-sky-300" };
    if (status === "SOLD_BY_BID") return { label: "Vendida", className: "text-sky-300" };
    return { label: status, className: "text-white/65" };
}

function getListingTimeMeta(listing: AuctionListingEntry) {
    if (listing.status !== "ACTIVE") {
        const finishedClass = listing.status === "CANCELLED" ? "text-rose-300" : "text-zinc-400";
        return { label: "Finalizado", className: finishedClass };
    }

    const startsAt = new Date(listing.startsAt).getTime();
    const endsAt = new Date(listing.endsAt).getTime();
    const now = Date.now();
    const remainingMs = endsAt - now;

    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt) || remainingMs <= 0) {
        return { label: "Finalizado", className: "text-rose-300" };
    }

    const durationMs = Math.max(1, endsAt - startsAt);
    const remainingRatio = remainingMs / durationMs;
    const className =
        remainingRatio > 0.55
            ? "text-emerald-300"
            : remainingRatio > 0.25
                ? "text-amber-300"
                : "text-rose-300";

    return { label: formatRemainingTime(listing.endsAt), className };
}

function getListingPrice(listing: AuctionListingEntry) {
    return listing.currentBidAmount ?? listing.startPrice;
}

function getClaimItemLabel(claim: AuctionClaimEntry, listing?: AuctionListingEntry) {
    const itemName = claim.itemName ?? listing?.itemName ?? "item";
    const quantity = claim.quantity && claim.quantity > 1 ? ` x${formatNumber(claim.quantity)}` : "";
    return `${itemName}${quantity}`;
}

function getClaimLabel(claim: AuctionClaimEntry, listing?: AuctionListingEntry) {
    if (claim.claimType === "GOLD_SALE") {
        const soldItem = listing?.itemName ? ` por ${listing.itemName}` : "";
        return `Reclamar ${formatNumber(claim.goldAmount)} oro${soldItem}`;
    }
    return `Reclamar ${getClaimItemLabel(claim, listing)}`;
}

function getClaimDescription(claim: AuctionClaimEntry, listing?: AuctionListingEntry) {
    if (claim.claimType === "GOLD_SALE") {
        const soldItem = listing?.itemName ? ` de la venta de ${listing.itemName}` : "";
        return `Tenes ${formatNumber(claim.goldAmount)} oro para reclamar${soldItem}.`;
    }

    return `Tenes ${getClaimItemLabel(claim, listing)} para reclamar.`;
}

function compareListingsBySort(left: AuctionListingEntry, right: AuctionListingEntry, sortKey: AuctionSortKey) {
    if (sortKey === "currentBid") {
        return getListingPrice(left) - getListingPrice(right);
    }

    if (sortKey === "buyout") {
        const leftBuyout = left.buyoutPrice ?? Number.POSITIVE_INFINITY;
        const rightBuyout = right.buyoutPrice ?? Number.POSITIVE_INFINITY;
        return leftBuyout - rightBuyout;
    }

    return new Date(left.endsAt).getTime() - new Date(right.endsAt).getTime();
}

function ItemGraphic({
    graphicData,
    name,
    size = 36,
}: {
    graphicData?: GraphicData;
    name: string;
    size?: number;
}) {
    if (!graphicData?.numFile) {
        return <div className="rounded border border-amber-500/25 bg-black/30" style={{ width: size, height: size }} />;
    }
    const scale = Math.min(1, (size - 6) / Math.max(graphicData.width, graphicData.height, 1));
    return (
        <div className="relative overflow-hidden rounded border border-amber-500/35 bg-black/40" style={{ width: size, height: size }}>
            <div
                aria-label={name}
                className="absolute left-1/2 top-1/2 bg-no-repeat"
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

function SortableHeader({
    label,
    sortKey,
    activeSortKey,
    onSort,
}: {
    label: string;
    sortKey: AuctionSortKey;
    activeSortKey: AuctionSortKey;
    onSort: (sortKey: AuctionSortKey) => void;
}) {
    const active = activeSortKey === sortKey;
    return (
        <th>
            <button
                type="button"
                onClick={() => onSort(sortKey)}
                className={`flex items-center gap-1 text-left transition ${active ? "text-amber-200" : "text-amber-100 hover:text-white"}`}
                title={`Ordenar ${label.toLowerCase()} de menor a mayor`}
            >
                <span>{label}</span>
                <span className={`text-xs ${active ? "opacity-100" : "opacity-45"}`}>↑</span>
            </button>
        </th>
    );
}

function filterByCategory(listing: AuctionListingEntry, category: string) {
    if (!category) return true;
    if (category === "materials") return listing.itemObjType != null && MATERIAL_TYPES.has(listing.itemObjType as any);
    if (category === "misc") {
        return listing.itemObjType == null || !CATEGORY_OPTIONS.some((option) => option.key === String(listing.itemObjType));
    }
    return String(listing.itemObjType ?? "") === category;
}

export default function AuctionHouseModal({
    state,
    inventory,
    gold,
    embedded = false,
    onClose,
    onRefresh,
    onCreate,
    onBid,
    onBuyout,
    onClaim,
    onReadMail,
}: AuctionHouseModalProps) {
    const [graphicsDB, setGraphicsDB] = React.useState<Record<string, GraphicData> | null>(null);
    const [tab, setTab] = React.useState<AuctionTab>("browse");
    const [search, setSearch] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [buyoutOnly, setBuyoutOnly] = React.useState(false);
    const [sortKey, setSortKey] = React.useState<AuctionSortKey>("time");
    const [selectedAuctionId, setSelectedAuctionId] = React.useState(state.listings[0]?.id ?? "");
    const [selectedSlot, setSelectedSlot] = React.useState(inventory[0]?.slot ?? 0);
    const [quantityText, setQuantityText] = React.useState("1");
    const [startPriceText, setStartPriceText] = React.useState("100");
    const [buyoutPriceText, setBuyoutPriceText] = React.useState("");
    const [durationText, setDurationText] = React.useState("24");
    const [bidText, setBidText] = React.useState("");
    const [selectedMailId, setSelectedMailId] = React.useState(state.mails[0]?.id ?? "");
    const [confirmation, setConfirmation] = React.useState<AuctionConfirmation | null>(null);
    const [notice, setNotice] = React.useState<AuctionNotice | null>(null);
    const requestedReadMailIdsRef = React.useRef(new Set<string>());

    const showNotice = React.useCallback((message: string, tone: AuctionNotice["tone"] = "success") => {
        setNotice({ message, tone });
    }, []);

    React.useEffect(() => {
        let mounted = true;
        loadGraphicsDB().then((db) => {
            if (mounted) setGraphicsDB(db);
        });
        return () => {
            mounted = false;
        };
    }, []);

    const browse = React.useMemo<AuctionBrowsePayload>(
        () => ({ page: 1, pageSize: 20, search: search.trim() || undefined, category: category || undefined, buyoutOnly }),
        [buyoutOnly, category, search],
    );

    const filteredListings = React.useMemo(
        () =>
            state.listings.filter((listing) => {
                const normalized = search.trim().toLowerCase();
                if (normalized && !listing.itemName.toLowerCase().includes(normalized)) return false;
                if (!filterByCategory(listing, category)) return false;
                if (buyoutOnly && !listing.buyoutPrice) return false;
                return true;
            }),
        [buyoutOnly, category, search, state.listings],
    );
    const sortedListings = React.useMemo(
        () => [...filteredListings].sort((left, right) => compareListingsBySort(left, right, sortKey)),
        [filteredListings, sortKey],
    );
    const selectedListing = sortedListings.find((listing) => listing.id === selectedAuctionId) ?? sortedListings[0] ?? null;
    const selectedInventoryItem = inventory.find((item) => item.slot === selectedSlot) ?? inventory[0] ?? null;
    const selectedMail = state.mails.find((mail) => mail.id === selectedMailId) ?? state.mails[0] ?? null;
    const maxActiveAuctions = Math.max(1, Math.floor(Number(state.config.maxActiveListingsPerCharacter) || 3));
    const activeAuctionCount = state.myAuctions.filter((listing) => listing.status === "ACTIVE").length;
    const claimById = React.useMemo(() => new Map(state.claims.map((claim) => [claim.id, claim])), [state.claims]);
    const listingById = React.useMemo(() => {
        const listings = new Map<string, AuctionListingEntry>();
        for (const listing of [...state.listings, ...state.myAuctions, ...state.myBids]) {
            listings.set(listing.id, listing);
        }
        return listings;
    }, [state.listings, state.myAuctions, state.myBids]);

    React.useEffect(() => {
        if (selectedMail && !selectedMail.readAt && !requestedReadMailIdsRef.current.has(selectedMail.id)) {
            requestedReadMailIdsRef.current.add(selectedMail.id);
            onReadMail(selectedMail.id, browse);
        }
    }, [browse, onReadMail, selectedMail]);

    React.useEffect(() => {
        if (!notice) {
            return;
        }

        const timeoutId = window.setTimeout(() => setNotice(null), 2800);
        return () => window.clearTimeout(timeoutId);
    }, [notice]);

    const submitCreate = () => {
        if (!selectedInventoryItem) return;
        if (activeAuctionCount >= maxActiveAuctions) {
            showNotice(`Ya tenes ${maxActiveAuctions} subastas activas. Espera a que finalice una antes de publicar otra.`, "warning");
            return;
        }
        const quantity = Math.max(1, Math.floor(Number(quantityText) || 1));
        const startPrice = Math.max(1, Math.floor(Number(startPriceText) || 0));
        const rawBuyout = buyoutPriceText.trim();
        const buyoutPrice = rawBuyout ? Math.max(1, Math.floor(Number(rawBuyout) || 0)) : null;
        const durationHours = Math.max(state.config.minDurationHours, Math.min(state.config.maxDurationHours, Math.floor(Number(durationText) || 24)));
        if (quantity > selectedInventoryItem.amount) {
            showNotice("No tenes esa cantidad disponible para publicar.", "warning");
            return;
        }
        setConfirmation({
            title: "Confirmar publicacion",
            description: "Revisa bien los datos antes de publicar. Una vez publicada, la subasta no se podra cancelar.",
            confirmLabel: "Publicar",
            rows: [
                { label: "Item", value: `${selectedInventoryItem.name} x${formatNumber(quantity)}` },
                { label: "Precio inicial", value: `${formatNumber(startPrice)} oro` },
                { label: "Compra directa", value: buyoutPrice ? `${formatNumber(buyoutPrice)} oro` : "Sin compra directa" },
                { label: "Duracion", value: `${durationHours}h` },
            ],
            onConfirm: () => {
                setConfirmation(null);
                onCreate(selectedInventoryItem.slot, quantity, startPrice, buyoutPrice, durationHours, browse);
                showNotice("Solicitud de publicacion enviada.");
            },
        });
    };

    const submitBid = () => {
        if (!selectedListing || selectedListing.isMine) return;
        const bidAmount = Math.floor(Number(bidText) || 0);
        if (bidAmount < selectedListing.minimumBid) {
            showNotice(`La oferta minima es ${formatNumber(selectedListing.minimumBid)} oro.`, "warning");
            return;
        }
        setConfirmation({
            title: "Confirmar oferta",
            description: "El oro de tu oferta queda reservado hasta que te superen o ganes la subasta.",
            confirmLabel: "Ofertar",
            rows: [
                { label: "Item", value: `${selectedListing.itemName} x${selectedListing.quantity}` },
                { label: "Vendedor", value: selectedListing.sellerName },
                { label: "Oferta", value: `${formatNumber(bidAmount)} oro` },
                { label: "Minima requerida", value: `${formatNumber(selectedListing.minimumBid)} oro` },
            ],
            onConfirm: () => {
                setConfirmation(null);
                onBid(selectedListing.id, bidAmount, browse);
                showNotice("Solicitud de oferta enviada.");
            },
        });
    };

    const submitBuyout = () => {
        if (!selectedListing || selectedListing.isMine || !selectedListing.buyoutPrice) return;
        setConfirmation({
            title: "Confirmar compra directa",
            description: "La compra directa cierra la subasta y genera un reclamo para recibir el item.",
            confirmLabel: "Comprar",
            rows: [
                { label: "Item", value: `${selectedListing.itemName} x${selectedListing.quantity}` },
                { label: "Vendedor", value: selectedListing.sellerName },
                { label: "Precio", value: `${formatNumber(selectedListing.buyoutPrice)} oro` },
            ],
            onConfirm: () => {
                setConfirmation(null);
                onBuyout(selectedListing.id, browse);
                showNotice("Solicitud de compra directa enviada.");
            },
        });
    };

    const panel = (
            <div className={`relative flex min-h-0 flex-col overflow-hidden border border-amber-500/35 bg-[#070402]/95 text-[#f3ead7] shadow-[0_0_35px_rgba(0,0,0,0.55)] ${embedded ? "h-full w-full rounded" : "h-[86vh] w-[min(1500px,96vw)] rounded"}`}>
                {embedded ? (
                    <div className="flex min-h-[46px] items-center justify-between border-b border-amber-500/20 bg-black/25 px-4">
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-amber-300">Subastas</div>
                            <h2 className="text-lg font-bold leading-tight">Casa de Subastas</h2>
                        </div>
                        <div className="rounded border border-amber-500/25 bg-black/30 px-3 py-1 text-sm">Oro: {formatNumber(gold)}</div>
                    </div>
                ) : (
                    <header className="flex items-center justify-between border-b border-amber-500/25 bg-gradient-to-b from-[#2a1607] to-[#080503] px-8 py-4">
                        <div>
                            <div className="text-[12px] font-bold uppercase tracking-[0.45em] text-amber-300">World of AO</div>
                            <h2 className="text-2xl font-bold">Casa de Subastas</h2>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="rounded border border-amber-500/30 bg-black/30 px-5 py-2 text-lg">Oro: {formatNumber(gold)}</div>
                            <button onClick={onClose} className="h-11 w-11 rounded-full border border-white/20 text-2xl hover:border-amber-300">x</button>
                        </div>
                    </header>
                )}

                <nav className="flex gap-1 border-b border-amber-500/20 bg-black/35 px-6 py-2">
                    {[
                        ["browse", "Buscar"],
                        ["sell", "Vender"],
                        ["mine", "Mis Subastas"],
                        ["bids", "Mis Ofertas"],
                        ["mail", `Correo (${state.unreadMailCount})`],
                    ].map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as AuctionTab)}
                            className={`min-w-36 rounded border px-5 py-2 font-semibold ${tab === key ? "border-amber-300 bg-amber-600/35 text-amber-100 shadow-[0_0_16px_rgba(245,183,36,0.25)]" : "border-amber-500/20 bg-[#120b06] text-white/80"}`}
                        >
                            {label}
                        </button>
                    ))}
                </nav>

                <main className="grid min-h-0 flex-1 grid-cols-[240px_1fr] gap-3 p-4">
                    <aside className="flex min-h-0 flex-col overflow-hidden rounded border border-amber-500/20 bg-black/25">
                        <div className="shrink-0 border-b border-amber-500/15 px-4 py-3 text-[12px] font-bold uppercase tracking-[0.38em] text-amber-300">Atlas</div>
                        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
                            {CATEGORY_OPTIONS.map((option) => (
                                <button
                                    key={option.key}
                                    onClick={() => setCategory(option.key)}
                                    className={`w-full rounded border px-3 py-2 text-left ${category === option.key ? "border-amber-300 bg-amber-700/30" : "border-amber-500/15 bg-[#130c07]"}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className="flex min-w-0 flex-col gap-3 overflow-hidden">
                        <div className="flex gap-3">
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nombre del item..." className="h-10 flex-1 rounded border border-amber-500/25 bg-black/45 px-4 outline-none focus:border-amber-300" />
                            <label className="flex items-center gap-2 rounded border border-amber-500/20 px-3">
                                <input type="checkbox" checked={buyoutOnly} onChange={(event) => setBuyoutOnly(event.target.checked)} />
                                Compra directa
                            </label>
                            <button onClick={() => onRefresh(browse)} className="rounded border border-amber-300 bg-amber-600/35 px-8 font-semibold">Buscar</button>
                        </div>

                        {tab === "browse" && (
                            <div className="grid min-h-0 flex-1 grid-rows-[1fr_112px] gap-3">
                                <div className="overflow-auto rounded border border-amber-500/20">
                                    <table className="w-full border-collapse text-sm">
                                        <thead className="sticky top-0 bg-[#1a0f07] text-left text-amber-100">
                                            <tr>
                                                <th className="p-2">Item</th>
                                                <th>Vendedor</th>
                                                <SortableHeader label="Tiempo" sortKey="time" activeSortKey={sortKey} onSort={setSortKey} />
                                                <SortableHeader label="Oferta actual" sortKey="currentBid" activeSortKey={sortKey} onSort={setSortKey} />
                                                <SortableHeader label="Compra directa" sortKey="buyout" activeSortKey={sortKey} onSort={setSortKey} />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedListings.map((listing) => {
                                                const timeMeta = getListingTimeMeta(listing);
                                                return (
                                                    <tr key={listing.id} onClick={() => { setSelectedAuctionId(listing.id); setBidText(String(listing.minimumBid)); }} className={`cursor-pointer border-t border-amber-500/10 ${selectedListing?.id === listing.id ? "bg-amber-800/25" : "hover:bg-white/5"}`}>
                                                        <td className="flex items-center gap-2 p-2">
                                                            <ItemGraphic graphicData={graphicsDB?.[String(listing.itemGrhIndex)]} name={listing.itemName} />
                                                            <span>{listing.itemName} x{listing.quantity}</span>
                                                        </td>
                                                        <td>{listing.sellerName}</td>
                                                        <td><span className={timeMeta.className}>{timeMeta.label}</span></td>
                                                        <td>{formatNumber(getListingPrice(listing))}</td>
                                                        <td>{listing.buyoutPrice ? formatNumber(listing.buyoutPrice) : "-"}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="grid grid-cols-[1fr_1fr] gap-3">
                                    <div className="overflow-hidden rounded border border-amber-500/25 bg-black/25 p-2">
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.26em] text-amber-300">Realizar oferta</div>
                                        {selectedListing ? (
                                            <div className="flex items-center gap-2">
                                                <ItemGraphic graphicData={graphicsDB?.[String(selectedListing.itemGrhIndex)]} name={selectedListing.itemName} size={40} />
                                                <div className="min-w-0 flex-1">
                                                    <div className="truncate text-sm font-bold">{selectedListing.itemName}</div>
                                                    <div className="text-xs text-white/70">
                                                        {selectedListing.isMine ? "Es tu venta: no podes ofertar." : `Oferta minima: ${formatNumber(selectedListing.minimumBid)} oro`}
                                                    </div>
                                                    <div className="mt-1 flex gap-2">
                                                        <input disabled={selectedListing.isMine} value={bidText} onChange={(event) => setBidText(event.target.value)} className="h-8 w-32 rounded border border-amber-500/30 bg-black/45 px-2 disabled:opacity-40" />
                                                        <button disabled={selectedListing.isMine} onClick={submitBid} className="rounded border border-amber-300 bg-amber-700/40 px-3 text-sm disabled:opacity-40">Ofertar</button>
                                                        {selectedListing.buyoutPrice ? <button disabled={selectedListing.isMine} onClick={submitBuyout} className="rounded border border-amber-300 px-3 text-sm disabled:opacity-40">Comprar</button> : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : <p className="text-white/60">No hay subastas para mostrar.</p>}
                                    </div>
                                    <div className="overflow-hidden rounded border border-amber-500/25 bg-black/25 p-2">
                                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.26em] text-amber-300">Detalles del item</div>
                                        {selectedListing ? (
                                            <div className="text-sm text-white/80">
                                                <p className="font-bold text-white">{selectedListing.itemName} x{selectedListing.quantity}</p>
                                                <p>Vendedor: {selectedListing.sellerName}</p>
                                                {(() => {
                                                    const timeMeta = getListingTimeMeta(selectedListing);
                                                    return <p>Tiempo: <span className={timeMeta.className}>{timeMeta.label}</span></p>;
                                                })()}
                                            </div>
                                        ) : <p className="text-white/60">Selecciona una subasta.</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "sell" && (
                            <div className="grid min-h-0 flex-1 grid-cols-[360px_1fr] gap-3">
                                <div className="overflow-auto rounded border border-amber-500/20 p-3">
                                    {inventory.filter((item) => !item.equipped).map((item) => (
                                        <button key={item.slot} onClick={() => setSelectedSlot(item.slot)} className={`mb-2 flex w-full items-center gap-3 rounded border p-2 text-left ${selectedSlot === item.slot ? "border-amber-300 bg-amber-800/25" : "border-amber-500/15 bg-black/25"}`}>
                                            <ItemGraphic graphicData={graphicsDB?.[String(item.grhIndex)]} name={item.name} />
                                            <span>{item.name} x{formatNumber(item.amount)}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="rounded border border-amber-500/20 p-5">
                                    <div className="mb-4 text-[12px] font-bold uppercase tracking-[0.35em] text-amber-300">Publicar subasta</div>
                                    {selectedInventoryItem ? <div className="mb-4 flex items-center gap-3"><ItemGraphic graphicData={graphicsDB?.[String(selectedInventoryItem.grhIndex)]} name={selectedInventoryItem.name} size={56} /><strong>{selectedInventoryItem.name}</strong></div> : null}
                                    <div className="grid max-w-xl grid-cols-2 gap-3">
                                        <label>Cantidad<input value={quantityText} onChange={(event) => setQuantityText(event.target.value)} className="mt-1 h-10 w-full rounded border border-amber-500/25 bg-black/45 px-3" /></label>
                                        <label>Duracion<input value={durationText} onChange={(event) => setDurationText(event.target.value)} className="mt-1 h-10 w-full rounded border border-amber-500/25 bg-black/45 px-3" /></label>
                                        <label>Precio inicial<input value={startPriceText} onChange={(event) => setStartPriceText(event.target.value)} className="mt-1 h-10 w-full rounded border border-amber-500/25 bg-black/45 px-3" /></label>
                                        <label>Compra directa<input value={buyoutPriceText} onChange={(event) => setBuyoutPriceText(event.target.value)} placeholder="Opcional" className="mt-1 h-10 w-full rounded border border-amber-500/25 bg-black/45 px-3" /></label>
                                    </div>
                                    <button onClick={submitCreate} className="mt-5 rounded border border-amber-300 bg-amber-700/40 px-8 py-3 font-bold">Publicar subasta</button>
                                </div>
                            </div>
                        )}

                        {tab === "mine" && (
                            <ListPanel listings={state.myAuctions} claims={state.claims} listingById={listingById} graphicsDB={graphicsDB} onClaim={onClaim} browse={browse} />
                        )}

                        {tab === "bids" && (
                            <ListPanel listings={state.myBids} claims={state.claims} listingById={listingById} graphicsDB={graphicsDB} onClaim={onClaim} browse={browse} />
                        )}

                        {tab === "mail" && (
                            <div className="grid min-h-0 flex-1 grid-cols-[360px_1fr] gap-3">
                                <div className="overflow-auto rounded border border-amber-500/20">
                                    {state.mails.map((mail) => (
                                        (() => {
                                            const claim = mail.claimId ? claimById.get(mail.claimId) : null;
                                            const sourceListing = claim?.auctionId ? listingById.get(claim.auctionId) : undefined;
                                            return (
                                                <button key={mail.id} onClick={() => setSelectedMailId(mail.id)} className={`block w-full border-b border-amber-500/10 p-3 text-left ${selectedMail?.id === mail.id ? "bg-amber-800/25" : mail.readAt ? "bg-black/10" : "bg-amber-900/20"}`}>
                                                    <strong>{mail.subject}</strong>
                                                    <div className="text-sm text-white/60">{mail.category}</div>
                                                    {claim ? <div className="mt-1 text-xs text-amber-100">{getClaimLabel(claim, sourceListing)}</div> : null}
                                                </button>
                                            );
                                        })()
                                    ))}
                                </div>
                                <div className="rounded border border-amber-500/20 p-5">
                                    {selectedMail ? (
                                        <>
                                            <div className="text-[12px] font-bold uppercase tracking-[0.35em] text-amber-300">Correo</div>
                                            <h3 className="mt-2 text-xl font-bold">{selectedMail.subject}</h3>
                                            <p className="mt-4 text-white/80">{selectedMail.body}</p>
                                            {selectedMail.claimId && claimById.get(selectedMail.claimId) ? (
                                                (() => {
                                                    const claim = claimById.get(selectedMail.claimId!)!;
                                                    const sourceListing = claim.auctionId ? listingById.get(claim.auctionId) : undefined;
                                                    return (
                                                        <>
                                                            <p className="mt-3 rounded border border-amber-500/20 bg-black/25 px-3 py-2 text-sm text-amber-100">
                                                                {getClaimDescription(claim, sourceListing)}
                                                            </p>
                                                            <button onClick={() => onClaim(selectedMail.claimId!, browse)} className="mt-4 rounded border border-amber-300 bg-amber-700/40 px-6 py-2 font-bold">
                                                                {getClaimLabel(claim, sourceListing)}
                                                            </button>
                                                        </>
                                                    );
                                                })()
                                            ) : selectedMail.claimId ? <p className="mt-6 text-emerald-300">Reclamado</p> : null}
                                        </>
                                    ) : <p className="text-white/60">No hay correos.</p>}
                                </div>
                            </div>
                        )}
                    </section>
                </main>

                {notice ? (
                    <div
                        className={`pointer-events-none absolute right-5 top-5 z-20 max-w-[360px] rounded border px-4 py-3 text-sm font-semibold shadow-[0_0_24px_rgba(0,0,0,0.28)] ${
                            notice.tone === "warning"
                                ? "border-rose-300/55 bg-[#210809]/95 text-rose-100"
                                : "border-emerald-300/45 bg-[#06140c]/95 text-emerald-100"
                        }`}
                    >
                        {notice.message}
                    </div>
                ) : null}

                {confirmation ? (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/68 px-4 backdrop-blur-[2px]">
                        <div className="w-[min(520px,calc(100%-32px))] overflow-hidden rounded border border-amber-300/45 bg-[#120905]/98 text-[#f3ead7] shadow-[0_28px_90px_rgba(0,0,0,0.68)]">
                            <div className="border-b border-amber-500/20 bg-[linear-gradient(180deg,rgba(127,78,35,0.34),rgba(18,9,5,0.96))] px-5 py-4">
                                <div className="text-[11px] font-bold uppercase tracking-[0.38em] text-amber-300">Casa de Subastas</div>
                                <h3 className="mt-1 text-xl font-bold">{confirmation.title}</h3>
                            </div>
                            <div className="space-y-4 px-5 py-4">
                                <p className="text-sm leading-6 text-stone-300">{confirmation.description}</p>
                                <div className="rounded border border-amber-500/20 bg-black/26">
                                    {confirmation.rows.map((row) => (
                                        <div key={row.label} className="grid grid-cols-[150px_1fr] gap-3 border-b border-amber-500/10 px-4 py-2.5 last:border-b-0">
                                            <span className="text-sm text-stone-400">{row.label}</span>
                                            <strong className="min-w-0 break-words text-sm text-stone-50">{row.value}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 border-t border-amber-500/20 bg-black/24 px-5 py-4">
                                <button
                                    type="button"
                                    onClick={() => setConfirmation(null)}
                                    className="min-h-[40px] min-w-[120px] rounded border border-stone-600/70 px-4 text-sm font-bold text-stone-200 transition hover:border-stone-400 hover:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmation.onConfirm}
                                    className="min-h-[40px] min-w-[150px] rounded border border-amber-300/80 bg-[linear-gradient(180deg,#f4c449,#986015)] px-5 text-sm font-black text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.2)] transition hover:brightness-110"
                                >
                                    {confirmation.confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
    );

    if (embedded) {
        return panel;
    }

    return (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
            {panel}
        </div>
    );
}

function ListPanel({
    listings,
    claims,
    listingById,
    graphicsDB,
    onClaim,
    browse,
}: {
    listings: AuctionListingEntry[];
    claims: AuctionClaimEntry[];
    listingById: Map<string, AuctionListingEntry>;
    graphicsDB: Record<string, GraphicData> | null;
    onClaim: (claimId: string, browse: AuctionBrowsePayload) => void;
    browse: AuctionBrowsePayload;
}) {
    const claimByAuction = new Map(claims.map((claim) => [claim.auctionId, claim]));
    return (
        <div className="min-h-0 flex-1 overflow-auto rounded border border-amber-500/20">
            {listings.map((listing) => {
                const claim = claimByAuction.get(listing.id);
                const sourceListing = claim?.auctionId ? listingById.get(claim.auctionId) : listing;
                const statusMeta = getListingStatusMeta(listing.status);
                const timeMeta = getListingTimeMeta(listing);
                return (
                    <div key={listing.id} className="flex items-center gap-3 border-b border-amber-500/10 p-3">
                        <ItemGraphic graphicData={graphicsDB?.[String(listing.itemGrhIndex)]} name={listing.itemName} />
                        <div className="min-w-0 flex-1">
                            <strong>{listing.itemName} x{listing.quantity}</strong>
                            <div className="text-sm text-white/65">
                                <span className={statusMeta.className}>{statusMeta.label}</span>
                                <span> - Oferta {formatNumber(getListingPrice(listing))} - </span>
                                <span className={timeMeta.className}>{timeMeta.label}</span>
                            </div>
                        </div>
                        {claim ? (
                            <button onClick={() => onClaim(claim.id, browse)} className="rounded border border-amber-300 bg-amber-700/35 px-4 py-2 font-semibold">{getClaimLabel(claim, sourceListing)}</button>
                        ) : null}
                    </div>
                );
            })}
            {listings.length === 0 ? <p className="p-5 text-white/60">No hay registros.</p> : null}
        </div>
    );
}
