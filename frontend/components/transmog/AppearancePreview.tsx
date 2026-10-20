"use client";

import React from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import CharacterSpritePreview from "../CharacterSpritePreview";
import type { AppearanceIds } from "../../lib/aowProtocol";
import {
    DIRECTION_LABEL,
    rotateDirection,
    type PreviewDirection,
} from "./appearance";

type AppearancePreviewProps = {
    appearance: AppearanceIds | null | undefined;
    scale?: number;
    caption?: React.ReactNode;
    className?: string;
};

/**
 * Vista previa del personaje (pixi, fuera del mundo) con giro. La usan
 * Transfigurar y la Tienda para "probarse" una pieza antes de ponerla.
 */
export default function AppearancePreview({
    appearance,
    scale = 2.2,
    caption,
    className,
}: AppearancePreviewProps) {
    const [direction, setDirection] = React.useState<PreviewDirection>("2");
    const canRender = Boolean(appearance && appearance.body > 0);

    return (
        <div
            className={`relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded border border-amber-200/10 bg-[radial-gradient(circle_at_50%_42%,rgba(245,186,71,0.16),rgba(0,0,0,0.38)_62%)] ${className ?? ""}`}
        >
            <div className="pointer-events-none absolute inset-x-8 bottom-10 h-6 rounded-[50%] bg-black/45 blur-md" />
            <div className="relative flex min-h-[250px] items-center justify-center [image-rendering:pixelated] short:min-h-[150px] short:scale-[0.72]">
                {canRender && appearance ? (
                    <CharacterSpritePreview
                        bodyId={appearance.body}
                        headId={appearance.head}
                        helmetId={appearance.helmet}
                        weaponId={appearance.weapon}
                        shieldId={appearance.shield}
                        direction={direction}
                        scale={scale}
                        framed={false}
                        className="bg-transparent"
                    />
                ) : (
                    <p className="text-xs text-stone-400">
                        Cargando personaje...
                    </p>
                )}
            </div>
            <div className="relative mb-2 flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Girar a la izquierda"
                    onClick={() =>
                        setDirection((current) => rotateDirection(current, -1))
                    }
                    className="rounded-full border border-amber-300/30 bg-black/40 p-1.5 text-amber-200 transition hover:border-amber-200/70 hover:text-amber-50"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[64px] text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-400">
                    {DIRECTION_LABEL[direction]}
                </span>
                <button
                    type="button"
                    aria-label="Girar a la derecha"
                    onClick={() =>
                        setDirection((current) => rotateDirection(current, 1))
                    }
                    className="rounded-full border border-amber-300/30 bg-black/40 p-1.5 text-amber-200 transition hover:border-amber-200/70 hover:text-amber-50"
                >
                    <RotateCw className="h-3.5 w-3.5" />
                </button>
            </div>
            {caption ? (
                <div className="relative mb-2 px-3 text-center text-[11px] text-stone-300">
                    {caption}
                </div>
            ) : null}
        </div>
    );
}
