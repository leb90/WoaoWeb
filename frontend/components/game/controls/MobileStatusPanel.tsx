"use client";

import CharacterSpritePreview from "../../CharacterSpritePreview";
import { VitalBars } from "../../InventoryFloatingPanel";
import type { PlayerHudState } from "../../../lib/aowProtocol";

// La cabeza queda en el tercio superior del lienzo de CharacterSpritePreview
// (72px * escala): se agranda y se sube el lienzo para centrarla en el círculo.
const PORTRAIT_SCALE = 2.2;
const PORTRAIT_TOP_OFFSET = -22;

type MobileStatusPanelProps = {
    hud: PlayerHudState | null;
    consoleLog: React.ReactNode;
};

export function MobileStatusPanel({ hud, consoleLog }: MobileStatusPanelProps) {
    return (
        <div
            className="pointer-events-none fixed top-2 z-30 flex w-[220px] flex-col gap-1.5"
            style={{ left: "calc(env(safe-area-inset-left, 0px) + 8px)" }}
        >
            <div className="flex items-center gap-2 rounded-xl border border-amber-200/15 bg-black/55 p-1.5 backdrop-blur-sm">
                {hud?.idBody || hud?.idHead ? (
                    // El sprite de cabeza ocupa una parte chica de su lienzo;
                    // se renderiza grande y se recorta centrado en el círculo.
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-amber-200/25 bg-black/40">
                        <div
                            className="absolute left-1/2 -translate-x-1/2"
                            style={{ top: PORTRAIT_TOP_OFFSET }}
                        >
                            <CharacterSpritePreview
                                bodyId={hud?.idBody ?? 0}
                                headId={hud?.idHead ?? 0}
                                mode="head"
                                scale={PORTRAIT_SCALE}
                            />
                        </div>
                    </div>
                ) : null}
                <div className="min-w-0 flex-1">
                    <VitalBars
                        hp={hud?.hp || 0}
                        maxHp={hud?.maxHp || 0}
                        mana={hud?.mana || 0}
                        maxMana={hud?.maxMana || 0}
                        sta={hud?.sta ?? 0}
                        maxSta={hud?.maxSta ?? 0}
                        hambre={hud?.hambre ?? 100}
                        maxHambre={hud?.maxHambre ?? 100}
                        sed={hud?.sed ?? 100}
                        maxSed={hud?.maxSed ?? 100}
                    />
                </div>
            </div>

            <div className="max-h-[88px] overflow-hidden rounded-xl border border-amber-200/10 bg-black/45 px-2 py-1.5 text-[10px] leading-[13px] text-stone-200/90 backdrop-blur-sm [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
                {consoleLog}
            </div>
        </div>
    );
}
