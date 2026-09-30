"use client";

import {
    Backpack,
    Check,
    Lock,
    LockOpen,
    MessageCircle,
    Pencil,
    Settings,
} from "lucide-react";
import type { PlayerHudState, SpellEntry } from "../../../lib/aowProtocol";
import type { HotkeySettings } from "../../../lib/hotkeys";
import type { StoredMacro } from "../../../lib/character-settings";
import MacroBar from "../../MacroBar";
import { TouchJoystick, type JoystickDirection } from "./TouchJoystick";
import { MobileAttackButton } from "./MobileAttackButton";

const SPELL_QUICK_SLOT_INDICES = [0, 1, 2, 3];
const ITEM_QUICK_SLOT_INDICES = [4, 5];

// Arco de 4 hechizos alrededor del botón de ataque (esquina inferior
// derecha del cluster): centro del ataque en (170,170), radio 106, ángulos
// 180°/150°/120°/90°. Los valores son la esquina superior izquierda de cada
// botón de SPELL_SLOT_SIZE.
const ACTION_CLUSTER_SIZE = 210;
const ATTACK_BUTTON_SIZE = 72;
const SPELL_SLOT_SIZE = 50;
const SPELL_SLOT_POSITIONS = [
    { left: 39, top: 145 },
    { left: 53, top: 92 },
    { left: 92, top: 53 },
    { left: 145, top: 39 },
];

const ITEM_SLOT_SIZE = 46;
const ITEM_SLOT_POSITIONS = [
    { left: 0, top: 0 },
    { left: 58, top: 0 },
];

const SAFE_RIGHT = "env(safe-area-inset-right, 0px)";
const SAFE_LEFT = "env(safe-area-inset-left, 0px)";

const TOP_RIGHT_BUTTON_CLASS =
    "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/25 bg-black/55 text-amber-100";

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
    onToggleChat: () => void;
    onOpenSettings: () => void;
    isQuickSlotEditMode: boolean;
    onToggleQuickSlotEditMode: () => void;
    isOrientationLocked: boolean;
    onToggleOrientationLock: () => void;
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
    onToggleChat,
    onOpenSettings,
    isQuickSlotEditMode,
    onToggleQuickSlotEditMode,
    isOrientationLocked,
    onToggleOrientationLock,
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
    };

    return (
        <>
            <div
                className="pointer-events-none fixed top-3 z-40 flex gap-2"
                style={{ right: `calc(${SAFE_RIGHT} + 12px)` }}
            >
                <button
                    type="button"
                    onClick={onToggleChat}
                    className={TOP_RIGHT_BUTTON_CLASS}
                    aria-label="Chat"
                >
                    <MessageCircle className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onOpenInventory}
                    className={TOP_RIGHT_BUTTON_CLASS}
                    aria-label="Inventario"
                >
                    <Backpack className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onOpenSettings}
                    className={TOP_RIGHT_BUTTON_CLASS}
                    aria-label="Configuracion"
                >
                    <Settings className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={onToggleOrientationLock}
                    className={`${TOP_RIGHT_BUTTON_CLASS} ${
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
                </button>
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
                <button
                    type="button"
                    onClick={onToggleQuickSlotEditMode}
                    className={`pointer-events-auto absolute left-0 top-0 flex h-9 items-center gap-1 rounded-full border px-2.5 text-[11px] font-semibold ${
                        isQuickSlotEditMode
                            ? "border-amber-300 bg-amber-300 text-stone-950"
                            : "border-amber-200/25 bg-black/55 text-amber-100"
                    }`}
                    aria-pressed={isQuickSlotEditMode}
                    aria-label={
                        isQuickSlotEditMode
                            ? "Terminar de editar accesos rapidos"
                            : "Editar accesos rapidos"
                    }
                >
                    {isQuickSlotEditMode ? (
                        <>
                            <Check className="h-3.5 w-3.5" />
                            Listo
                        </>
                    ) : (
                        <>
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                        </>
                    )}
                </button>
                <div className="absolute bottom-1 right-1">
                    <MobileAttackButton
                        onAttack={onAttack}
                        size={ATTACK_BUTTON_SIZE}
                    />
                </div>
            </div>
        </>
    );
}
