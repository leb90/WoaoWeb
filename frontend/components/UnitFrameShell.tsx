"use client";

import React from "react";
import { Shield } from "lucide-react";
import CharacterSpritePreview from "./CharacterSpritePreview";

// La carcasa de los marcos del HUD al estilo de WoW (el del personaje y el del objetivo): el retrato redondo a la
// izquierda montado sobre la caja, la banda del nombre y la zona de las barras, siempre del mismo tamaño.

// La cabeza queda en el tercio superior del lienzo de CharacterSpritePreview (72px * escala): se agranda y se sube el
// lienzo para centrarla en el círculo.
const PORTRAIT_SCALE = 2.4;
const PORTRAIT_TOP_OFFSET = -21;

// El color del nombre que manda el server (game.ts, getDefaultCharacterColor) dice el bando.
export const STANDING_BY_COLOR: Record<string, { name: string; tone: string }> = {
    "#3b5bdb": { name: "Alianza", tone: "text-blue-400" },
    "#9b0000": { name: "Horda", tone: "text-red-600" },
    "#3333ff": { name: "Ciudadano", tone: "text-blue-500" },
    red: { name: "Criminal", tone: "text-red-500" },
    "#419900": { name: "Staff", tone: "text-lime-500" },
};

export function getStanding(color: string | undefined | null) {
    return STANDING_BY_COLOR[String(color ?? "").toLowerCase()];
}

export function Bar({
    value,
    max,
    fromColor,
    toColor,
    heightClass,
    showText,
    textClass = "text-[11px]",
    gloss = "from-white/25 via-white/5 to-black/20",
    title,
    testId,
}: {
    value: number;
    max: number;
    fromColor: string;
    toColor: string;
    heightClass: string;
    showText: boolean;
    textClass?: string;
    // El brillo de arriba; en la barra fina de energía lo blanqueaba entera.
    gloss?: string;
    title?: string;
    testId: string;
}) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;

    return (
        <div
            data-testid={testId}
            title={title}
            data-value={value}
            data-max={max}
            className={`relative ${heightClass} overflow-hidden rounded-[2px] border border-black/70 bg-black/70 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]`}
        >
            <div
                className="absolute inset-y-0 left-0 transition-[width] duration-200"
                style={{
                    width: `${ratio * 100}%`,
                    background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                }}
            />
            <div className={`pointer-events-none absolute inset-0 bg-linear-to-b ${gloss}`} />
            {showText ? (
                <span
                    className={`absolute inset-0 flex items-center justify-center font-bold leading-none tabular-nums text-[#fbf5e8] [text-shadow:0_1px_2px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,0.9)] ${textClass}`}
                >
                    {value} / {max}
                </span>
            ) : null}
        </div>
    );
}

/** La cabeza de un personaje (cuerpo y cabeza del juego) centrada en el círculo del retrato. */
export function HeadPortrait({ bodyId, headId }: { bodyId: number; headId: number }) {
    if (!bodyId && !headId) {
        return null;
    }

    return (
        <span className="absolute left-1/2 -translate-x-1/2" style={{ top: PORTRAIT_TOP_OFFSET }}>
            <CharacterSpritePreview bodyId={bodyId} headId={headId} mode="head" scale={PORTRAIT_SCALE} framed={false} />
        </span>
    );
}

/** El escudito redondo abajo a la izquierda del retrato. */
export function PortraitBadge({
    title,
    testId,
    children,
}: {
    title: string;
    testId: string;
    children: React.ReactNode;
}) {
    return (
        <span
            data-testid={testId}
            title={title}
            className="absolute -bottom-0.5 -left-1 flex h-[19px] w-[19px] items-center justify-center rounded-full border border-[#c9a45c] bg-[#1a110b] shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
        >
            {children}
        </span>
    );
}

/** El escudo del color del bando. */
export function StandingBadge({ color, testId }: { color: string | undefined | null; testId: string }) {
    const standing = getStanding(color);

    if (!standing) {
        return null;
    }

    return (
        <PortraitBadge title={standing.name} testId={testId}>
            <Shield className={`h-[12px] w-[12px] fill-current ${standing.tone}`} strokeWidth={1.6} />
        </PortraitBadge>
    );
}

export default function UnitFrameShell({
    testId,
    portrait,
    badge,
    dead = false,
    band,
    bodyClassName = "space-y-[2px] py-[3px]",
    children,
}: {
    testId: string;
    portrait: React.ReactNode;
    badge?: React.ReactNode;
    dead?: boolean;
    // Lo que va en la banda del nombre (a la derecha del retrato).
    band: React.ReactNode;
    // El espaciado de la zona de las barras (el alto no cambia).
    bodyClassName?: string;
    // La zona de las barras: tiene alto fijo, así los dos marcos miden lo mismo.
    children: React.ReactNode;
}) {
    return (
        <div data-testid={testId} className="relative flex items-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            {/* Como el de WoW: el retrato a la izquierda, montado sobre las barras, con el escudito abajo. */}
            <div className="relative z-10 h-[54px] w-[54px] shrink-0">
                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,#f5d58a,#9a6a24,#f0c766,#7a4f16,#f5d58a)] p-[2px] shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    <div
                        className={`relative h-full w-full overflow-hidden rounded-full bg-[radial-gradient(circle_at_50%_35%,#3a2a1c_0%,#120c08_75%)] ${
                            dead ? "grayscale" : ""
                        }`}
                    >
                        {portrait}
                    </div>
                </div>
                {badge}
            </div>
            <div className="-ml-8 min-w-0 flex-1 overflow-hidden rounded-[4px] border border-[#8b6b3e] bg-[linear-gradient(180deg,#23160e_0%,#110b08_100%)] shadow-[inset_0_1px_0_rgba(255,230,180,0.12)]">
                <div className="flex h-[16px] items-center gap-1 border-b border-[#8b6b3e]/70 bg-[linear-gradient(180deg,#4d3419_0%,#2a1b10_100%)] pl-9 pr-1.5">
                    {band}
                </div>
                <div className={`h-[38px] pl-9 pr-1.5 ${bodyClassName}`}>{children}</div>
            </div>
        </div>
    );
}
