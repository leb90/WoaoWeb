"use client";

import { useEffect, useMemo, useState } from "react";
import type { GraphicData } from "@/types/game";
import { getTexturePath, loadGraphicsDB } from "@/utils/gameLoader";

let graphicsPromise: Promise<Record<string, GraphicData>> | null = null;

function getGraphics() {
    graphicsPromise ??= loadGraphicsDB();
    return graphicsPromise;
}

export default function WikiItemSprite({
    grhIndex,
    name,
    size = 48,
}: {
    grhIndex: number;
    name: string;
    size?: number;
}) {
    const [graphic, setGraphic] = useState<GraphicData | null>(null);

    useEffect(() => {
        let active = true;
        getGraphics()
            .then((graphics) => {
                if (active) setGraphic(graphics[String(grhIndex)] ?? null);
            })
            .catch(() => {
                if (active) setGraphic(null);
            });
        return () => {
            active = false;
        };
    }, [grhIndex]);

    const scale = useMemo(() => {
        if (!graphic) return 1;
        return Math.min(3, (size - 8) / Math.max(graphic.width, graphic.height, 1));
    }, [graphic, size]);

    return (
        <div
            className="relative shrink-0 overflow-hidden border border-amber-200/15 bg-[linear-gradient(135deg,#18130d,#080604)]"
            style={{ width: size, height: size }}
            aria-label={name}
        >
            {graphic?.numFile ? (
                <div
                    className="absolute left-1/2 top-1/2 bg-no-repeat [image-rendering:pixelated]"
                    style={{
                        width: graphic.width,
                        height: graphic.height,
                        backgroundImage: `url(${getTexturePath(graphic)})`,
                        backgroundPosition: `-${graphic.sX}px -${graphic.sY}px`,
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        transformOrigin: "center",
                    }}
                />
            ) : (
                <span className="absolute inset-0 grid place-items-center text-xs font-bold text-amber-200/35">?</span>
            )}
        </div>
    );
}
