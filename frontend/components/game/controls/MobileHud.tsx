"use client";

import {
    Backpack,
    BookOpen,
    Check,
    Flower2,
    Lock,
    LockOpen,
    MessageCircle,
    Pencil,
    Settings,
} from "lucide-react";
import {
    OBJECT_TYPE,
    type PlayerHudState,
    type SpellEntry,
} from "../../../lib/aowProtocol";
import { formatStackAmount } from "../../../lib/itemAmount";
import { ArrowIcon } from "../../EquipmentPanel";
import type { HotkeySettings } from "../../../lib/hotkeys";
import type { StoredMacro } from "../../../lib/character-settings";
import MacroBar from "../../MacroBar";
import { TouchJoystick, type JoystickDirection } from "./TouchJoystick";
import { MobileAttackButton, MobilePickupButton } from "./MobileAttackButton";
import { TapButton } from "./TapButton";

export const SPELL_QUICK_SLOT_INDICES = [0, 1, 2, 3];
export const ITEM_QUICK_SLOT_INDICES = [4, 5];

// Arco de 4 hechizos alrededor del botón de ataque (esquina inferior
// derecha del cluster): centro del ataque en (170,170), radio 112, ángulos
// 180°/150°/120°/90°. Los valores son la esquina superior izquierda de cada
// botón de SPELL_SLOT_SIZE.
const ACTION_CLUSTER_SIZE = 210;
const ATTACK_BUTTON_SIZE = 72;
const SPELL_SLOT_SIZE = 56;
const SPELL_SLOT_POSITIONS = [
    { left: 30, top: 142 },
    { left: 45, top: 86 },
    { left: 86, top: 45 },
    { left: 142, top: 30 },
];

// Fila de accesos (inventario, lista de hechizos, editar) encima del arco,
// pegada al borde derecho. En columna pisaba los botones de arriba en
// pantallas de unos 340 de alto (Safari con sus barras).
const SIDE_BUTTON_SIZE = 38;
const SIDE_BUTTON_GAP = 6;
const SIDE_ROW_BOTTOM_GAP = 8;

const ITEM_SLOT_SIZE = 46;
const ITEM_SLOT_POSITIONS = [
    { left: 0, top: 0 },
    { left: 58, top: 0 },
];

const SAFE_RIGHT = "env(safe-area-inset-right, 0px)";
const SAFE_LEFT = "env(safe-area-inset-left, 0px)";

const ROUND_BUTTON_CLASS =
    "pointer-events-auto flex items-center justify-center rounded-full border border-amber-200/25 bg-black/55 text-amber-100 select-none [-webkit-touch-callout:none]";

type MobileHudProps = {
    hud: PlayerHudState | null;
    connected?: boolean;
    hotkeySettings: HotkeySettings;
    macros: Array<StoredMacro | null>;
    useItemRepeatMs: number;
    onMacrosChange: React.Dispatch<
        React.SetStateAction<Array<StoredMacro | null>>
    >;
    onUseItem: (slot: number) => void;
    onRangeAttackRequest: () => void;
    onCastSpell: (spell: SpellEntry) => void;
    onSendCommand: (command: string) => void;
    onDirectionChange: (direction: JoystickDirection | null) => void;
    onAttack: () => void;
    onOpenInventory: () => void;
    onOpenSpellList: () => void;
    onToggleChat: () => void;
    onOpenSettings: () => void;
    isQuickSlotEditMode: boolean;
    onToggleQuickSlotEditMode: () => void;
    isOrientationLocked: boolean;
    onToggleOrientationLock: () => void;
    // Mientras se apunta un hechizo, los accesos secundarios se vuelven
    // transparentes y dejan pasar el toque al mapa que está debajo.
    isTargeting: boolean;
    // Lo que hay para agarrar bajo los pies: aparece el botoncito de agarrar pegado al de atacar.
    groundItemName: string | null;
    onPickup: () => void;
    // Solo los que tienen maná meditan.
    canMeditate: boolean;
    onMeditate: () => void;
    // Arena: las pociones y las flechas no se gastan (cantidades en ∞).
    infiniteItems?: boolean;
};

export function MobileHud({
    hud,
    connected,
    hotkeySettings,
    macros,
    useItemRepeatMs,
    onMacrosChange,
    onUseItem,
    onRangeAttackRequest,
    onCastSpell,
    onSendCommand,
    onDirectionChange,
    onAttack,
    onOpenInventory,
    onOpenSpellList,
    onToggleChat,
    onOpenSettings,
    isQuickSlotEditMode,
    onToggleQuickSlotEditMode,
    isOrientationLocked,
    onToggleOrientationLock,
    isTargeting,
    groundItemName,
    onPickup,
    canMeditate,
    onMeditate,
    infiniteItems = false,
}: MobileHudProps) {
    const sharedMacroProps = {
        hud,
        connected,
        hotkeySettings,
        macros,
        useItemRepeatMs,
        onMacrosChange,
        onUseItem,
        onRangeAttackRequest,
        onCastSpell,
        onSendCommand,
        touchMode: true,
        requireHotkey: false,
        editMode: isQuickSlotEditMode,
        infiniteItems,
    };

    // Flechas equipadas (arquero, cazador): cuántas quedan, arriba de los items rápidos. En la Arena, ∞.
    const equippedArrows =
        hud?.inventory.find(
            (item) => item.equipped && item.objType === OBJECT_TYPE.flechas,
        ) ?? null;

    const sideButtonStyle = {
        width: SIDE_BUTTON_SIZE,
        height: SIDE_BUTTON_SIZE,
    };
    const sideButtonClass = isTargeting
        ? ROUND_BUTTON_CLASS.replace(
              "pointer-events-auto",
              "pointer-events-none",
          )
        : ROUND_BUTTON_CLASS;

    return (
        <>
            <div
                className="pointer-events-none fixed top-3 z-40 flex gap-2"
                style={{ right: `calc(${SAFE_RIGHT} + 12px)` }}
            >
                {canMeditate ? (
                    <TapButton
                        onTap={onMeditate}
                        className={`${ROUND_BUTTON_CLASS} h-9 w-9 border-sky-300/40 text-sky-100`}
                        aria-label="Meditar"
                        title="Meditar"
                    >
                        <Flower2 className="h-4 w-4" />
                    </TapButton>
                ) : null}
                <TapButton
                    onTap={onToggleChat}
                    className={`${ROUND_BUTTON_CLASS} h-9 w-9`}
                    aria-label="Chat"
                >
                    <MessageCircle className="h-4 w-4" />
                </TapButton>
                <TapButton
                    onTap={onOpenSettings}
                    className={`${ROUND_BUTTON_CLASS} h-9 w-9`}
                    aria-label="Configuracion"
                >
                    <Settings className="h-4 w-4" />
                </TapButton>
                <TapButton
                    onTap={onToggleOrientationLock}
                    className={`${ROUND_BUTTON_CLASS} h-9 w-9 ${
                        isOrientationLocked
                            ? "border-amber-300/70 bg-amber-900/60 text-amber-200"
                            : ""
                    }`}
                    aria-label={
                        isOrientationLocked
                            ? "Desbloquear orientacion"
                            : "Bloquear orientacion"
                    }
                    aria-pressed={isOrientationLocked}
                >
                    {isOrientationLocked ? (
                        <Lock className="h-4 w-4" />
                    ) : (
                        <LockOpen className="h-4 w-4" />
                    )}
                </TapButton>
            </div>

            <div
                className="pointer-events-none fixed bottom-4 z-40"
                style={{ left: `calc(${SAFE_LEFT} + 16px)` }}
            >
                <TouchJoystick onDirectionChange={onDirectionChange} />
            </div>

            <div
                className="pointer-events-none fixed bottom-3 z-40"
                style={{
                    right: `calc(${SAFE_RIGHT} + ${ACTION_CLUSTER_SIZE + 16}px)`,
                }}
            >
                {equippedArrows ? (
                    <div
                        className="pointer-events-none absolute -top-6 left-0 flex items-center gap-1 rounded-full border border-amber-200/25 bg-black/60 px-2 py-0.5 text-[11px] font-bold tabular-nums text-amber-50"
                        aria-label={`Flechas: ${formatStackAmount(equippedArrows.amount, infiniteItems)}`}
                    >
                        <ArrowIcon className="h-3 w-3 text-amber-200" />
                        {formatStackAmount(
                            equippedArrows.amount,
                            infiniteItems,
                        )}
                    </div>
                ) : null}
                <MacroBar
                    {...sharedMacroProps}
                    visibleSlotIndices={ITEM_QUICK_SLOT_INDICES}
                    slotPositions={ITEM_SLOT_POSITIONS}
                    slotSize={ITEM_SLOT_SIZE}
                    containerSize={{
                        width: ITEM_SLOT_POSITIONS[1].left + ITEM_SLOT_SIZE,
                        height: ITEM_SLOT_SIZE,
                    }}
                    allowedTargetTypes={["item"]}
                    editorTitle="Item rapido"
                />
            </div>

            <div
                className="pointer-events-none fixed bottom-2 z-40"
                style={{
                    right: `calc(${SAFE_RIGHT} + 8px)`,
                    width: ACTION_CLUSTER_SIZE,
                    height: ACTION_CLUSTER_SIZE,
                }}
            >
                <div
                    className={`pointer-events-none absolute right-0 flex transition-opacity ${
                        isTargeting ? "opacity-25" : ""
                    }`}
                    style={{
                        bottom:
                            ACTION_CLUSTER_SIZE -
                            SPELL_SLOT_POSITIONS[3].top +
                            SIDE_ROW_BOTTOM_GAP,
                        gap: SIDE_BUTTON_GAP,
                    }}
                >
                    <TapButton
                        onTap={onOpenInventory}
                        className={sideButtonClass}
                        style={sideButtonStyle}
                        aria-label="Inventario"
                    >
                        <Backpack className="h-4 w-4" />
                    </TapButton>
                    <TapButton
                        onTap={onOpenSpellList}
                        className={sideButtonClass}
                        style={sideButtonStyle}
                        aria-label="Lista de hechizos"
                    >
                        <BookOpen className="h-4 w-4" />
                    </TapButton>
                    <TapButton
                        onTap={onToggleQuickSlotEditMode}
                        className={`${sideButtonClass} ${
                            isQuickSlotEditMode
                                ? "border-amber-300 bg-amber-300 text-stone-950"
                                : ""
                        }`}
                        style={sideButtonStyle}
                        aria-pressed={isQuickSlotEditMode}
                        aria-label={
                            isQuickSlotEditMode
                                ? "Terminar de editar accesos rapidos"
                                : "Editar accesos rapidos"
                        }
                    >
                        {isQuickSlotEditMode ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Pencil className="h-4 w-4" />
                        )}
                    </TapButton>
                </div>

                <MacroBar
                    {...sharedMacroProps}
                    visibleSlotIndices={SPELL_QUICK_SLOT_INDICES}
                    slotPositions={SPELL_SLOT_POSITIONS}
                    slotSize={SPELL_SLOT_SIZE}
                    containerSize={{
                        width: ACTION_CLUSTER_SIZE,
                        height: ACTION_CLUSTER_SIZE,
                    }}
                    allowedTargetTypes={["spell"]}
                    editorTitle="Hechizo rapido"
                />
                <div className="absolute bottom-1 right-1">
                    <MobileAttackButton
                        onAttack={onAttack}
                        size={ATTACK_BUTTON_SIZE}
                    />
                </div>
                {groundItemName ? (
                    <MobilePickupButton
                        itemName={groundItemName}
                        onPickup={onPickup}
                    />
                ) : null}
            </div>
        </>
    );
}
