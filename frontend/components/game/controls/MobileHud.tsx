"use client";

import { Backpack, Lock, LockOpen, MessageCircle, Settings } from "lucide-react";
import type { PlayerHudState, SpellEntry } from "../../../lib/aowProtocol";
import type { HotkeySettings } from "../../../lib/hotkeys";
import type { StoredMacro } from "../../../lib/character-settings";
import MacroBar from "../../MacroBar";
import { TouchJoystick, type JoystickDirection } from "./TouchJoystick";
import { MobileAttackButton } from "./MobileAttackButton";

const SPELL_QUICK_SLOT_INDICES = [0, 1, 2, 3];
const ITEM_QUICK_SLOT_INDICES = [4, 5];

const TOP_RIGHT_BUTTON_CLASS =
    "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/25 bg-black/55 text-amber-100 backdrop-blur-sm";

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
    isOrientationLocked,
    onToggleOrientationLock,
}: MobileHudProps) {
    return (
        <>
            <div className="pointer-events-none fixed right-3 top-3 z-40 flex flex-col gap-2">
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
                            ? "border-amber-300/60 text-amber-200"
                            : ""
                    }`}
                    aria-label={
                        isOrientationLocked
                            ? "Desbloquear orientacion"
                            : "Bloquear orientacion"
                    }
                    title={
                        isOrientationLocked
                            ? "Orientacion bloqueada"
                            : "Bloquear orientacion"
                    }
                >
                    {isOrientationLocked ? (
                        <Lock className="h-4 w-4" />
                    ) : (
                        <LockOpen className="h-4 w-4" />
                    )}
                </button>
            </div>

            <div className="pointer-events-none fixed bottom-4 left-4 z-40">
                <TouchJoystick onDirectionChange={onDirectionChange} />
            </div>

            <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex items-end gap-3">
                <div className="pointer-events-auto flex flex-col gap-2">
                    <div className="w-[96px]">
                        <MacroBar
                            hud={hud}
                            connected={connected}
                            hotkeySettings={hotkeySettings}
                            macros={macros}
                            useItemRepeatMs={useItemRepeatMs}
                            onMacrosChange={onMacrosChange}
                            onUseItem={onUseItem}
                            onRangeAttackRequest={onRangeAttackRequest}
                            onCastSpell={onCastSpell}
                            onSendCommand={onSendCommand}
                            touchMode
                            columns={2}
                            requireHotkey={false}
                            visibleSlotIndices={SPELL_QUICK_SLOT_INDICES}
                        />
                    </div>
                    <div className="w-[96px]">
                        <MacroBar
                            hud={hud}
                            connected={connected}
                            hotkeySettings={hotkeySettings}
                            macros={macros}
                            useItemRepeatMs={useItemRepeatMs}
                            onMacrosChange={onMacrosChange}
                            onUseItem={onUseItem}
                            onRangeAttackRequest={onRangeAttackRequest}
                            onCastSpell={onCastSpell}
                            onSendCommand={onSendCommand}
                            touchMode
                            columns={2}
                            requireHotkey={false}
                            visibleSlotIndices={ITEM_QUICK_SLOT_INDICES}
                        />
                    </div>
                </div>

                <MobileAttackButton onAttack={onAttack} />
            </div>
        </>
    );
}
