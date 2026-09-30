"use client";

import React from "react";
import { Plus } from "lucide-react";
import CharacterSpritePreview from "../../CharacterSpritePreview";
import { VitalBars } from "../../InventoryFloatingPanel";
import type { PlayerHudState } from "../../../lib/aowProtocol";
import { TapButton } from "./TapButton";

// La cabeza queda en el tercio superior del lienzo de CharacterSpritePreview
// (72px * escala): se agranda y se sube el lienzo para centrarla en el círculo.
const PORTRAIT_SCALE = 2.2;
const PORTRAIT_TOP_OFFSET = -22;
// Distancia al fondo dentro de la cual el log sigue "pegado" a lo último.
const LOG_STICK_THRESHOLD_PX = 24;

type MobileStatusPanelProps = {
    hud: PlayerHudState | null;
    consoleLog: React.ReactNode;
    skillPoints: number;
    // Mientras se apunta un hechizo: el log se oculta y las barras quedan
    // semitransparentes y sin capturar toques, para poder apuntar debajo.
    isTargeting: boolean;
    onOpenSkills: () => void;
};

export function MobileStatusPanel({
    hud,
    consoleLog,
    skillPoints,
    isTargeting,
    onOpenSkills,
}: MobileStatusPanelProps) {
    const logRef = React.useRef<HTMLDivElement | null>(null);
    const stickToBottomRef = React.useRef(true);

    // Cada vez que llega contenido nuevo se baja al final, salvo que el
    // jugador haya subido a leer mensajes anteriores.
    React.useLayoutEffect(() => {
        const log = logRef.current;
        if (log && stickToBottomRef.current) {
            log.scrollTop = log.scrollHeight;
        }
    });

    const handleLogScroll = () => {
        const log = logRef.current;
        if (!log) {
            return;
        }

        stickToBottomRef.current =
            log.scrollHeight - log.scrollTop - log.clientHeight <=
            LOG_STICK_THRESHOLD_PX;
    };

    const level = hud?.level ?? 0;

    return (
        <div
            className="pointer-events-none fixed top-2 z-30 flex w-[220px] flex-col gap-1.5"
            style={{ left: "calc(env(safe-area-inset-left, 0px) + 8px)" }}
        >
            <div
                className={`flex items-center gap-2 rounded-xl border p-1.5 transition-opacity ${
                    isTargeting
                        ? "border-transparent bg-black/20 opacity-50"
                        : "border-amber-200/15 bg-black/55"
                }`}
            >
                <TapButton
                    onTap={onOpenSkills}
                    className={`relative h-11 w-11 shrink-0 select-none ${
                        isTargeting
                            ? "pointer-events-none"
                            : "pointer-events-auto"
                    }`}
                    aria-label="Ver habilidades"
                >
                    <span className="absolute inset-0 overflow-hidden rounded-full border border-amber-200/25 bg-black/40">
                        {hud?.idBody || hud?.idHead ? (
                            <span
                                className="absolute left-1/2 -translate-x-1/2"
                                style={{ top: PORTRAIT_TOP_OFFSET }}
                            >
                                <CharacterSpritePreview
                                    bodyId={hud?.idBody ?? 0}
                                    headId={hud?.idHead ?? 0}
                                    mode="head"
                                    scale={PORTRAIT_SCALE}
                                />
                            </span>
                        ) : null}
                    </span>
                    {level > 0 ? (
                        <span className="absolute -bottom-1 -left-1 rounded-full border border-amber-200/40 bg-stone-950 px-1 text-[9px] font-bold leading-4 text-amber-100">
                            {level}
                        </span>
                    ) : null}
                    {skillPoints > 0 ? (
                        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                            <Plus className="h-3 w-3" strokeWidth={3} />
                        </span>
                    ) : null}
                </TapButton>
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

            <div
                ref={logRef}
                onScroll={handleLogScroll}
                className={`pointer-events-auto max-h-[88px] overflow-y-auto overscroll-contain rounded-xl border border-amber-200/10 bg-black/45 px-2 py-1.5 text-[10px] leading-[13px] text-stone-200/90 [scrollbar-width:thin] ${
                    isTargeting ? "hidden" : ""
                }`}
                style={{ touchAction: "pan-y" }}
            >
                {consoleLog}
            </div>
        </div>
    );
}
