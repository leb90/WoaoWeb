"use client";

import { Menu, RotateCw } from "lucide-react";
import type { PlayerHudState, SpellEntry } from "../../../lib/aowProtocol";
import type { HotkeySettings } from "../../../lib/hotkeys";
import type { StoredMacro } from "../../../lib/character-settings";
import MacroBar from "../../MacroBar";
import { TouchJoystick, type JoystickDirection } from "./TouchJoystick";
import { MobileAttackButton } from "./MobileAttackButton";

const MOBILE_QUICK_SLOT_INDICES = [0, 1, 2, 3];

type MobileHudProps = {
    isPortrait: boolean;
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
    onOpenMenu: () => void;
};

export function MobileHud({
    isPortrait,
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
    onOpenMenu,
}: MobileHudProps) {
    if (!isPortrait) {
        return (
            <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/95 px-6 text-center text-stone-100">
                <RotateCw className="h-10 w-10 animate-pulse text-amber-200" />
                <p className="text-sm text-stone-300">
                    Girá tu dispositivo a vertical para jugar.
                </p>
            </div>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={onOpenMenu}
                className="pointer-events-auto fixed right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/25 bg-black/50 text-amber-100 backdrop-blur-sm"
                aria-label="Abrir menú"
            >
                <Menu className="h-5 w-5" />
            </button>

            <div className="pointer-events-none fixed bottom-4 left-4 z-40">
                <TouchJoystick onDirectionChange={onDirectionChange} />
            </div>

            <div className="pointer-events-none fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
                <MobileAttackButton onAttack={onAttack} />
                <div className="pointer-events-auto w-[184px]">
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
                        visibleSlotIndices={MOBILE_QUICK_SLOT_INDICES}
                    />
                </div>
            </div>
        </>
    );
}
