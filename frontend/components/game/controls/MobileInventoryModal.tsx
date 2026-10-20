"use client";

import React from "react";
import { X } from "lucide-react";
import {
    OBJECT_TYPE,
    type InventoryItem,
    type PlayerHudState,
} from "../../../lib/aowProtocol";
import { formatNumber } from "../../../lib/number-format";
import { screenDeltaToLocal } from "../../../lib/viewportRotation";
import { loadGraphicsDB, loadObjectsDB } from "../../../utils/gameLoader";
import type { GraphicData, ObjectsDB } from "../../../types/game";
import { ItemGraphic } from "../../MacroBar";
import EquipmentPanel from "../../EquipmentPanel";
import { getInventoryItemEquipmentKind } from "../../../lib/equipmentKinds";

const MIN_SLOTS = 21;
const DOUBLE_TAP_MS = 300;
const DRAG_THRESHOLD_PX = 8;

const EQUIPPABLE_TYPES = new Set<number>([
    OBJECT_TYPE.armaduras,
    OBJECT_TYPE.armas,
    OBJECT_TYPE.anillos,
    OBJECT_TYPE.escudos,
    OBJECT_TYPE.cascos,
    OBJECT_TYPE.flechas,
]);

// Las bases de gráficos/objetos se descomprimen en cada llamada al loader;
// se cachean acá para no repetir ese trabajo cada vez que se abre el modal.
let graphicsPromise: Promise<Record<string, GraphicData>> | null = null;
let objectsPromise: Promise<ObjectsDB> | null = null;

type DragState = {
    pointerId: number;
    slot: number;
    startX: number;
    startY: number;
    dragging: boolean;
    // Inventorio o panel de equipo.
    source: "inventory" | "equipment";
};

type MobileInventoryModalProps = {
    hud: PlayerHudState | null;
    onClose: () => void;
    onUse: (slot: number) => void;
    onEquip: (slot: number) => void;
    onRangeAttack: () => void;
    onMove: (sourceSlot: number, targetSlot: number) => void;
};

export function MobileInventoryModal({
    hud,
    onClose,
    onUse,
    onEquip,
    onRangeAttack,
    onMove,
}: MobileInventoryModalProps) {
    const [graphicsDB, setGraphicsDB] = React.useState<Record<
        string,
        GraphicData
    > | null>(null);
    const [objectsDB, setObjectsDB] = React.useState<ObjectsDB | null>(null);
    const [selectedSlot, setSelectedSlot] = React.useState<number | null>(null);
    const [ghost, setGhost] = React.useState<{
        item: InventoryItem;
        x: number;
        y: number;
        source: "inventory" | "equipment";
    } | null>(null);
    const cardRef = React.useRef<HTMLDivElement | null>(null);
    const dragRef = React.useRef<DragState | null>(null);
    const lastTapRef = React.useRef<{ slot: number; at: number } | null>(null);

    React.useEffect(() => {
        let active = true;
        graphicsPromise ??= loadGraphicsDB();
        objectsPromise ??= loadObjectsDB();

        graphicsPromise
            .then((data) => active && setGraphicsDB(data))
            .catch(() => {
                graphicsPromise = null;
            });
        objectsPromise
            .then((data) => active && setObjectsDB(data))
            .catch(() => {
                objectsPromise = null;
            });

        return () => {
            active = false;
        };
    }, []);

    const items = React.useMemo(() => hud?.inventory ?? [], [hud?.inventory]);

    const startSlot = React.useMemo(() => {
        if (items.length === 0) {
            return 0;
        }
        const lowest = Math.min(...items.map((item) => item.slot));
        return lowest === 0 ? 0 : 1;
    }, [items]);

    const slots = React.useMemo(() => {
        const bySlot = new Map(items.map((item) => [item.slot, item]));
        const highest = items.length
            ? Math.max(...items.map((item) => item.slot))
            : 0;
        const total = Math.max(MIN_SLOTS, highest - startSlot + 1);

        // Lo equipado se ve solo en el panel de equipo (en el server sigue
        // ocupando su lugar del inventario).
        return Array.from({ length: total }, (_, index) => ({
            slot: index + startSlot,
            item: bySlot.get(index + startSlot),
        })).filter(
            ({ item }) =>
                !item?.equipped ||
                !getInventoryItemEquipmentKind(item, objectsDB),
        );
    }, [items, objectsDB, startSlot]);

    const selectedItem =
        selectedSlot !== null
            ? (items.find((item) => item.slot === selectedSlot) ?? null)
            : null;

    const isRangedWeapon = React.useCallback(
        (item: InventoryItem) =>
            Boolean(objectsDB?.[item.idItem.toString()]?.proyectil),
        [objectsDB],
    );

    const activateItem = React.useCallback(
        (item: InventoryItem) => {
            if (item.equipped && isRangedWeapon(item)) {
                onRangeAttack();
                return;
            }

            if (EQUIPPABLE_TYPES.has(item.objType)) {
                onEquip(item.slot);
                return;
            }

            onUse(item.slot);
        },
        [isRangedWeapon, onEquip, onRangeAttack, onUse],
    );

    const toCardLocal = React.useCallback(
        (clientX: number, clientY: number) => {
            const card = cardRef.current;
            if (!card) {
                return { x: clientX, y: clientY };
            }

            const rect = card.getBoundingClientRect();
            const local = screenDeltaToLocal(
                clientX - (rect.left + rect.width / 2),
                clientY - (rect.top + rect.height / 2),
            );

            return {
                x: local.x + card.offsetWidth / 2,
                y: local.y + card.offsetHeight / 2,
            };
        },
        [],
    );

    const handleTap = React.useCallback(
        (slot: number, item: InventoryItem | undefined) => {
            setSelectedSlot(item ? slot : null);

            if (!item) {
                lastTapRef.current = null;
                return;
            }

            const now = Date.now();
            const lastTap = lastTapRef.current;
            if (lastTap?.slot === slot && now - lastTap.at <= DOUBLE_TAP_MS) {
                lastTapRef.current = null;
                activateItem(item);
                return;
            }

            lastTapRef.current = { slot, at: now };
        },
        [activateItem],
    );

    const handlePointerDown = (
        event: React.PointerEvent<HTMLButtonElement>,
        slot: number,
        item: InventoryItem | undefined,
        source: "inventory" | "equipment" = "inventory",
    ) => {
        if (!item) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current = {
            pointerId: event.pointerId,
            slot,
            startX: event.clientX,
            startY: event.clientY,
            dragging: false,
            source,
        };
    };

    // En el panel de equipo el doble toque saca el ítem (en el inventario,
    // sobre un arco equipado, dispara).
    const lastEquipmentTapRef = React.useRef<{
        slot: number;
        at: number;
    } | null>(null);
    const handleEquipmentTap = React.useCallback(
        (item: InventoryItem) => {
            setSelectedSlot(item.slot);
            const now = Date.now();
            const lastTap = lastEquipmentTapRef.current;

            if (
                lastTap?.slot === item.slot &&
                now - lastTap.at <= DOUBLE_TAP_MS
            ) {
                lastEquipmentTapRef.current = null;
                if (item.equipped) {
                    onEquip(item.slot);
                }
                return;
            }

            lastEquipmentTapRef.current = { slot: item.slot, at: now };
        },
        [onEquip],
    );

    const handlePointerMove = (
        event: React.PointerEvent<HTMLButtonElement>,
        item: InventoryItem | undefined,
    ) => {
        const drag = dragRef.current;
        if (!drag || drag.pointerId !== event.pointerId || !item) {
            return;
        }

        if (
            !drag.dragging &&
            Math.hypot(
                event.clientX - drag.startX,
                event.clientY - drag.startY,
            ) < DRAG_THRESHOLD_PX
        ) {
            return;
        }

        drag.dragging = true;
        setSelectedSlot(drag.slot);
        setGhost({
            item,
            source: drag.source,
            ...toCardLocal(event.clientX, event.clientY),
        });
    };

    const handlePointerUp = (
        event: React.PointerEvent<HTMLButtonElement>,
        slot: number,
        item: InventoryItem | undefined,
    ) => {
        const drag = dragRef.current;
        dragRef.current = null;
        setGhost(null);
        const tap = () =>
            drag?.source === "equipment" && item
                ? handleEquipmentTap(item)
                : handleTap(slot, item);

        if (!drag || drag.pointerId !== event.pointerId) {
            tap();
            return;
        }

        if (!drag.dragging) {
            tap();
            return;
        }

        const underPointer = document.elementFromPoint(
            event.clientX,
            event.clientY,
        );
        const target = underPointer?.closest<HTMLElement>(
            "[data-mobile-inventory-slot]",
        );
        const targetSlot = Number(target?.dataset.mobileInventorySlot);
        const equipmentTarget = underPointer?.closest("[data-equipment-panel]");
        const dragged = items.find((entry) => entry.slot === drag.slot);

        if (drag.source === "equipment") {
            // Del equipo al inventario: se lo saca (y se mueve si el lugar
            // donde lo soltaste está vacío).
            if (Number.isFinite(targetSlot) && dragged?.equipped) {
                onEquip(drag.slot);
                const occupied = items.some(
                    (entry) => entry.slot === targetSlot,
                );
                if (targetSlot !== drag.slot && !occupied) {
                    onMove(drag.slot, targetSlot);
                    setSelectedSlot(targetSlot);
                }
            }
            return;
        }

        if (equipmentTarget) {
            if (
                dragged &&
                !dragged.equipped &&
                getInventoryItemEquipmentKind(dragged, objectsDB)
            ) {
                onEquip(drag.slot);
            }
            return;
        }

        if (Number.isFinite(targetSlot) && targetSlot !== drag.slot) {
            onMove(drag.slot, targetSlot);
            setSelectedSlot(targetSlot);
        }
    };

    const handlePointerCancel = () => {
        dragRef.current = null;
        setGhost(null);
    };

    const primaryActionLabel = selectedItem
        ? selectedItem.equipped && isRangedWeapon(selectedItem)
            ? "Disparar"
            : EQUIPPABLE_TYPES.has(selectedItem.objType)
              ? selectedItem.equipped
                  ? "Desequipar"
                  : "Equipar"
              : "Usar"
        : null;

    return (
        <div
            className="pointer-events-auto fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                ref={cardRef}
                className="relative flex max-h-full w-[min(480px,100%)] flex-col landscape:w-[min(820px,100%)] overflow-hidden rounded-2xl border border-amber-200/20 bg-[linear-gradient(180deg,rgba(28,18,12,0.98),rgba(14,10,8,0.98))] text-stone-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            >
                <div className="flex items-center justify-between border-b border-amber-200/10 px-4 py-2">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
                        Inventario
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-700 bg-black/30 text-stone-300"
                        aria-label="Cerrar inventario"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex min-h-0 flex-col gap-3 overflow-y-auto p-3 landscape:flex-row landscape:items-start">
                    <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5">
                        {slots.map(({ slot, item }) => (
                            <button
                                key={slot}
                                type="button"
                                data-mobile-inventory-slot={slot}
                                onPointerDown={(event) =>
                                    handlePointerDown(event, slot, item)
                                }
                                onPointerMove={(event) =>
                                    handlePointerMove(event, item)
                                }
                                onPointerUp={(event) =>
                                    handlePointerUp(event, slot, item)
                                }
                                onPointerCancel={handlePointerCancel}
                                onContextMenu={(event) =>
                                    event.preventDefault()
                                }
                                className={`relative flex aspect-square touch-none select-none items-center justify-center rounded-lg border [-webkit-touch-callout:none] ${
                                    item
                                        ? selectedSlot === slot
                                            ? "border-cyan-300/85 bg-[#3a2817]"
                                            : "border-amber-500/25 bg-[#2b2016]"
                                        : "border-[#433126] bg-[#140f0a]"
                                } ${ghost && selectedSlot === slot ? "opacity-40" : ""}`}
                            >
                                {item ? (
                                    <>
                                        <ItemGraphic
                                            graphicData={
                                                graphicsDB?.[
                                                    item.grhIndex.toString()
                                                ]
                                            }
                                            name={item.name}
                                            size={34}
                                        />
                                        {item.amount > 1 ? (
                                            <span className="pointer-events-none absolute left-1 top-0.5 text-[9px] font-bold text-stone-100 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                                                {item.amount}
                                            </span>
                                        ) : null}
                                        {item.equipped ? (
                                            <span className="pointer-events-none absolute bottom-0.5 right-0.5 rounded bg-amber-300 px-1 text-[8px] font-black leading-3 text-stone-950">
                                                E
                                            </span>
                                        ) : null}
                                    </>
                                ) : null}
                            </button>
                        ))}
                    </div>
                    <div className="shrink-0 landscape:w-[300px]">
                        <EquipmentPanel
                            items={items}
                            objectsDB={objectsDB}
                            graphicsDB={graphicsDB}
                            appearance={
                                hud?.idBody
                                    ? {
                                          head: hud.idHead ?? 0,
                                          body: hud.idBody,
                                          helmet: hud.idHelmet ?? 0,
                                          weapon: hud.idWeapon ?? 0,
                                          shield: hud.idShield ?? 0,
                                      }
                                    : null
                            }
                            draggingKind={
                                ghost && ghost.source !== "equipment"
                                    ? getInventoryItemEquipmentKind(
                                          ghost.item,
                                          objectsDB,
                                      )
                                    : null
                            }
                            draggingFromEquipment={
                                ghost?.source === "equipment"
                            }
                            isBlocked={(entry) => !entry.validForUser}
                            getSlotPointerHandlers={(entry) => ({
                                onPointerDown: (event) =>
                                    handlePointerDown(
                                        event,
                                        entry.slot,
                                        entry,
                                        "equipment",
                                    ),
                                onPointerMove: (event) =>
                                    handlePointerMove(event, entry),
                                onPointerUp: (event) =>
                                    handlePointerUp(event, entry.slot, entry),
                                onPointerCancel: handlePointerCancel,
                            })}
                            onSlotClick={() => undefined}
                            onHover={() => undefined}
                            onLeave={() => undefined}
                        />
                    </div>
                </div>

                <div className="flex min-h-[52px] items-center gap-3 border-t border-amber-200/10 px-4 py-2">
                    {selectedItem ? (
                        <>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-amber-100">
                                    {selectedItem.name}
                                </p>
                                <p className="text-[11px] text-stone-400">
                                    {selectedItem.amount > 1
                                        ? `x${formatNumber(selectedItem.amount)}`
                                        : "Arrastralo para moverlo de lugar"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => activateItem(selectedItem)}
                                className="shrink-0 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950"
                            >
                                {primaryActionLabel}
                            </button>
                        </>
                    ) : (
                        <p className="text-xs text-stone-400">
                            Tocá un item para seleccionarlo, dos veces para
                            usarlo, o arrastralo para cambiarlo de lugar.
                        </p>
                    )}
                </div>

                {ghost ? (
                    <div
                        className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-cyan-300/70 bg-black/70 p-1"
                        style={{ left: ghost.x, top: ghost.y }}
                    >
                        <ItemGraphic
                            graphicData={
                                graphicsDB?.[ghost.item.grhIndex.toString()]
                            }
                            name={ghost.item.name}
                            size={38}
                        />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
