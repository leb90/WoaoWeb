"use client";

import React from "react";
import { Crown, Gem, Shield, Shirt, Sword } from "lucide-react";
import CharacterSpritePreview from "./CharacterSpritePreview";
import { ItemGraphic } from "./MacroBar";
import type { InventoryItem } from "../lib/aowProtocol";
import type { GraphicData, ObjectsDB } from "../types/game";

import {
    getInventoryItemEquipmentKind,
    type EquipmentKind,
} from "../lib/equipmentKinds";

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

function ArrowIcon({ className }: { className?: string }) {
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

// Primera fila: lo que se ve sobre el personaje; segunda: el resto.
const SLOT_ORDER: EquipmentKind[] = [
    "casco",
    "arma",
    "escudo",
    "armadura",
    "accesorio",
    "flechas",
];

export type EquipmentAppearance = {
    head: number;
    body: number;
    helmet: number;
    weapon: number;
    shield: number;
};

type EquipmentPanelProps = {
    items: InventoryItem[];
    objectsDB: ObjectsDB | null;
    graphicsDB: Record<string, GraphicData> | null;
    appearance: EquipmentAppearance | null;
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
};

/**
 * Equipo del personaje (estilo "paperdoll"): seis lugares alrededor del dibujo
 * del personaje. Los ítems equipados siguen ocupando su lugar en el inventario
 * (así lo maneja el server) y acá se ven agrupados por tipo.
 */
export default function EquipmentPanel({
    items,
    objectsDB,
    graphicsDB,
    appearance,
    draggingKind,
    draggingFromEquipment,
    isBlocked,
    onSlotMouseDown,
    getSlotPointerHandlers,
    onSlotClick,
    onHover,
    onLeave,
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

        return (
            <button
                key={kind}
                type="button"
                data-equipment-slot={kind}
                title={
                    item
                        ? `${item.name} (doble click o arrastrar al inventario para sacártelo)`
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
                className={`group relative flex h-[42px] w-[42px] shrink-0 touch-none select-none items-center justify-center border transition focus:outline-none ${
                    isTarget
                        ? "border-amber-300 bg-amber-400/20 shadow-[0_0_14px_rgba(245,158,11,0.45)]"
                        : item
                          ? blocked
                              ? "border-rose-400/40 bg-[#24151a]"
                              : "border-amber-500/35 bg-[#2b2016] hover:border-amber-300/70"
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
                                {item.amount}
                            </span>
                        ) : null}
                    </>
                ) : (
                    <meta.Icon className="h-5 w-5 text-[#6d5638]" />
                )}
                <span className="pointer-events-none absolute -bottom-[12px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.08em] text-[#8b7454]">
                    {meta.label}
                </span>
            </button>
        );
    };

    const canPreview = Boolean(appearance && appearance.body > 0);

    return (
        <section
            data-equipment-panel="true"
            className={`shrink-0 border bg-[#120c09] px-2 pb-3 pt-1 transition ${
                draggingKind && !draggingFromEquipment
                    ? "border-amber-400/40"
                    : "border-transparent"
            }`}
        >
            <div className="mb-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-200/80">
                    Equipo
                </span>
                <span className="text-[9px] text-stone-500">
                    Arrastrá para equipar o sacar
                </span>
            </div>
            <div className="flex items-stretch gap-2">
                <div
                    data-equipment-appearance={
                        appearance
                            ? `${appearance.body},${appearance.head},${appearance.helmet},${appearance.weapon},${appearance.shield}`
                            : ""
                    }
                    className="relative flex h-[120px] w-[84px] shrink-0 items-center justify-center overflow-hidden border border-amber-200/10 bg-[radial-gradient(circle_at_50%_45%,rgba(245,186,71,0.14),rgba(0,0,0,0.25)_70%)] [image-rendering:pixelated]"
                >
                    <div className="pointer-events-none absolute bottom-4 left-1/2 h-2.5 w-12 -translate-x-1/2 rounded-[50%] bg-black/55 blur-[3px]" />
                    {canPreview && appearance ? (
                        <CharacterSpritePreview
                            bodyId={appearance.body}
                            headId={appearance.head}
                            helmetId={appearance.helmet}
                            weaponId={appearance.weapon}
                            shieldId={appearance.shield}
                            scale={0.9}
                            framed={false}
                            className="bg-transparent"
                        />
                    ) : null}
                </div>
                <div className="grid min-w-0 flex-1 grid-cols-3 justify-items-center gap-x-1 gap-y-[15px]">
                    {SLOT_ORDER.map(renderSlot)}
                </div>
            </div>
        </section>
    );
}
