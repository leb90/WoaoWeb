"use client";

import React from "react";
import {
    Activity,
    Crown,
    Gem,
    Shield,
    Shirt,
    Sword,
} from "lucide-react";
import { ItemGraphic } from "./MacroBar";
import type { InventoryItem } from "../lib/aowProtocol";
import { formatItemNameWithRarity, getRaritySlotClasses } from "../lib/itemRarity";
import { formatStackAmount } from "../lib/itemAmount";
import type { GraphicData, ObjectsDB } from "../types/game";

import {
    getEquippedItemAction,
    getInventoryItemEquipmentKind,
    type EquipmentKind,
} from "../lib/equipmentKinds";
import {
    getSpecialItemAccent,
    getSpecialItemSlotClasses,
} from "../lib/specialItems";

export { getInventoryItemEquipmentKind, type EquipmentKind };

const SLOT_META: Record<
    EquipmentKind,
    {
        label: string;
        hint: string;
        Icon: React.ComponentType<{ className?: string }>;
    }
> = {
    casco: { label: "Casco", hint: "Cascos y coronas", Icon: Crown },
    armadura: {
        label: "Armadura",
        hint: "Armaduras, túnicas y botas",
        Icon: Shirt,
    },
    accesorio: {
        label: "Accesorio",
        hint: "Anillos y herramientas",
        Icon: Gem,
    },
    arma: { label: "Arma", hint: "Armas, báculos y arcos", Icon: Sword },
    escudo: { label: "Escudo", hint: "Escudos", Icon: Shield },
    flechas: { label: "Flechas", hint: "Munición para arcos", Icon: ArrowIcon },
};

export function ArrowIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className={className}
            aria-hidden="true"
        >
            <path d="M4 20 18 6" strokeLinecap="round" />
            <path d="M13 5h6v6" strokeLinecap="round" strokeLinejoin="round" />
            <path
                d="M4 20l1.5-4M4 20l4-1.5M7 17l1.5-4M7 17l4-1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

const SLOT_ORDER: EquipmentKind[] = [
    "casco",
    "arma",
    "escudo",
    "armadura",
    "accesorio",
    "flechas",
];

type EquipmentPanelProps = {
    items: InventoryItem[];
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
    selectedSlot: number | null;
    // Item que se está arrastrando desde el inventario (para resaltar su lugar).
    draggingKind: EquipmentKind | null;
    draggingFromEquipment: boolean;
    isBlocked: (item: InventoryItem) => boolean;
    onSlotMouseDown?: (
        item: InventoryItem,
        event: React.MouseEvent<HTMLButtonElement>,
    ) => void;
    // Mobile: arrastre con eventos de puntero (como el inventario táctil).
    getSlotPointerHandlers?: (
        item: InventoryItem,
    ) => Pick<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel"
    >;
    onSlotClick: (item: InventoryItem) => void;
    onHover: (item: InventoryItem) => void;
    onLeave: () => void;
    onViewStats?: () => void;
    // Arena: las flechas no se gastan y la cantidad se muestra como ∞.
    infiniteItems?: boolean;
};

/**
 * Los ítems equipados viven en seis posiciones persistentes separadas de los
 * 21 espacios de la mochila.
 */
export default function EquipmentPanel({
    items,
    objectsDB,
    graphicsDB,
    selectedSlot,
    draggingKind,
    draggingFromEquipment,
    isBlocked,
    onSlotMouseDown,
    getSlotPointerHandlers,
    onSlotClick,
    onHover,
    onLeave,
    onViewStats,
    infiniteItems = false,
}: EquipmentPanelProps) {
    const equippedByKind = React.useMemo(() => {
        const result: Partial<Record<EquipmentKind, InventoryItem>> = {};

        for (const item of items) {
            if (!item.equipped) {
                continue;
            }

            const kind = getInventoryItemEquipmentKind(item, objectsDB);
            if (kind && !result[kind]) {
                result[kind] = item;
            }
        }

        return result;
    }, [items, objectsDB]);

    const renderSlot = (kind: EquipmentKind) => {
        const meta = SLOT_META[kind];
        const item = equippedByKind[kind];
        const graphicData = item
            ? graphicsDB?.[item.grhIndex.toString()]
            : undefined;
        const isTarget = draggingKind === kind && !draggingFromEquipment;
        const blocked = item ? isBlocked(item) : false;
        const selected = Boolean(item && item.slot === selectedSlot);
        const action = item ? getEquippedItemAction(item, objectsDB) : null;
        const specialAccent = item
            ? getSpecialItemAccent(
                  item.idItem,
                  objectsDB?.[String(item.idItem)],
              )
            : null;
        // Túnicas especiales primero; si no, el color de la rareza.
        const specialSlotClasses =
            !blocked && !isTarget
                ? getSpecialItemSlotClasses(specialAccent, { selected }) ||
                  getRaritySlotClasses(item?.rarity, { selected })
                : "";

        return (
            <button
                key={kind}
                type="button"
                data-equipment-slot={kind}
                title={
                    item
                        ? action === "disparar"
                            ? `${formatItemNameWithRarity(item.name, item.rarity)} (doble click o U para disparar; arrastralo al inventario para sacártelo)`
                            : action === "usar"
                              ? `${formatItemNameWithRarity(item.name, item.rarity)} (doble click o U para usarlo; arrastralo al inventario para sacártelo)`
                              : `${formatItemNameWithRarity(item.name, item.rarity)} (doble click o arrastrar al inventario para sacártelo)`
                        : `${meta.label}: ${meta.hint}`
                }
                onMouseDown={(event) => {
                    if (item && onSlotMouseDown) {
                        onSlotMouseDown(item, event);
                    } else if (!getSlotPointerHandlers) {
                        event.preventDefault();
                    }
                }}
                {...(item && getSlotPointerHandlers
                    ? getSlotPointerHandlers(item)
                    : {})}
                onContextMenu={(event) => event.preventDefault()}
                onClick={() =>
                    item && !getSlotPointerHandlers && onSlotClick(item)
                }
                onMouseEnter={() => item && onHover(item)}
                onMouseLeave={onLeave}
                className={`group relative flex h-[42px] w-full min-w-0 touch-none select-none items-center justify-center border transition focus:outline-none ${
                    isTarget
                        ? "border-amber-300 bg-amber-400/20 shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                        : item
                          ? blocked
                              ? selected
                                  ? "border-rose-300/85 bg-[#3b2026]"
                                  : "border-rose-400/40 bg-[#24151a]"
                              : specialSlotClasses ||
                                (selected
                                    ? "border-cyan-300/85 bg-[#3a2817]"
                                    : "border-amber-500/35 bg-[#2b2016] hover:border-amber-300/70")
                          : "border-[#433126] bg-[#140f0a]"
                }`}
            >
                {item ? (
                    <>
                        <ItemGraphic
                            graphicData={graphicData}
                            name={item.name}
                            size={32}
                        />
                        {item.amount > 1 ? (
                            <span className="pointer-events-none absolute left-0.5 top-0 text-[9px] font-bold text-stone-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                                {formatStackAmount(item.amount, infiniteItems)}
                            </span>
                        ) : null}
                    </>
                ) : (
                    <meta.Icon className="h-5 w-5 text-[#6d5638]" />
                )}
                <span className="pointer-events-none absolute -bottom-[12px] left-1/2 max-w-[48px] -translate-x-1/2 whitespace-nowrap text-[7px] font-semibold uppercase text-[#8b7454]">
                    {meta.label}
                </span>
            </button>
        );
    };

    return (
        <section
            data-equipment-panel="true"
            className={`shrink-0 border bg-[#120c09] px-2 pb-2 pt-1 transition ${
                draggingKind && !draggingFromEquipment
                    ? "border-amber-400/40"
                    : "border-transparent"
            }`}
        >
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Equipo
                </span>
                {onViewStats ? (
                    <button
                        type="button"
                        onClick={onViewStats}
                        className="inline-flex h-6 items-center gap-1 border border-amber-300/35 bg-[#24180f] px-2 text-[9px] font-semibold uppercase text-amber-100 transition hover:border-amber-200/70 hover:bg-[#302015]"
                    >
                        <Activity className="h-3 w-3" aria-hidden="true" />
                        Ver estadísticas
                    </button>
                ) : (
                    <span className="text-[9px] text-stone-500">
                        Arrastrá para equipar o sacar
                    </span>
                )}
            </div>
            <div className="grid grid-cols-6 gap-1 pb-3">
                {SLOT_ORDER.map(renderSlot)}
            </div>
        </section>
    );
}
