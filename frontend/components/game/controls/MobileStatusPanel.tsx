"use client";

import CharacterSpritePreview from "../../CharacterSpritePreview";
import { VitalBars } from "../../InventoryFloatingPanel";
import type { PlayerHudState } from "../../../lib/aowProtocol";

type MobileStatusPanelProps = {
    hud: PlayerHudState | null;
    consoleLog: React.ReactNode;
};

export function MobileStatusPanel({ hud, consoleLog }: MobileStatusPanelProps) {
    return (
        <div className="pointer-events-none fixed left-2 top-2 z-30 flex w-[220px] flex-col gap-1.5">
            <div className="flex items-center gap-2 rounded-xl border border-amber-200/15 bg-black/55 p-1.5 backdrop-blur-sm">
                {hud?.idBody || hud?.idHead ? (
                    <div className="shrink-0 overflow-hidden rounded-lg bg-black/40">
                        <CharacterSpritePreview
                            bodyId={hud?.idBody ?? 0}
                            headId={hud?.idHead ?? 0}
                            mode="head"
                            scale={0.5}
                        />
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
