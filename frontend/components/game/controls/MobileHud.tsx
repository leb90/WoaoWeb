"use client";

import {
    Backpack,
    BookOpen,
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
import { TapButton } from "./TapButton";

const SPELL_QUICK_SLOT_INDICES = [0, 1, 2, 3];
const ITEM_QUICK_SLOT_INDICES = [4, 5];

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

// Columna de accesos (inventario, lista de hechizos, editar) encima del
// último hechizo del arco (el de arriba, centrado en x=170).
const SIDE_BUTTON_SIZE = 38;
const SIDE_BUTTON_GAP = 6;
const SIDE_COLUMN_LEFT = 170 - SIDE_BUTTON_SIZE / 2;
const SIDE_COLUMN_BOTTOM_GAP = 8;

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

    const sideButtonStyle = {
        width: SIDE_BUTTON_SIZE,
        height: SIDE_BUTTON_SIZE,
    };
    const sideButtonClass = isTargeting
        ? ROUND_BUTTON_CLASS.replace("pointer-events-auto", "pointer-events-none")
        : ROUND_BUTTON_CLASS;

    return (
        <>
            <div
                className="pointer-events-none fixed top-3 z-40 flex gap-2"
                style={{ right: `calc(${SAFE_RIGHT} + 12px)` }}
            >
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
                    className={`pointer-events-none absolute flex flex-col transition-opacity ${
                        isTargeting ? "opacity-25" : ""
                    }`}
                    style={{
                        left: SIDE_COLUMN_LEFT,
                        bottom:
                            ACTION_CLUSTER_SIZE -
                            SPELL_SLOT_POSITIONS[3].top +
                            SIDE_COLUMN_BOTTOM_GAP,
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
            </div>
        </>
    );
}
