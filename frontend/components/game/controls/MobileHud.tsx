"use client";

import { Menu } from "lucide-react";
import type { PlayerHudState, SpellEntry } from "../../../lib/aowProtocol";
import type { HotkeySettings } from "../../../lib/hotkeys";
import type { StoredMacro } from "../../../lib/character-settings";
import MacroBar from "../../MacroBar";
import { TouchJoystick, type JoystickDirection } from "./TouchJoystick";
import { MobileAttackButton } from "./MobileAttackButton";

const MOBILE_QUICK_SLOT_INDICES = [0, 1, 2, 3];

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
    onOpenMenu: () => void;
};

// El landscape ya lo resuelve el game-shell rotándose por CSS cuando el
// dispositivo está en vertical (ver frontend/app/play/page.tsx) - este HUD
// no necesita saber la orientación, sus controles quedan bien posicionados
// en cualquier caso gracias a eso.
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
    onOpenMenu,
}: MobileHudProps) {
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
