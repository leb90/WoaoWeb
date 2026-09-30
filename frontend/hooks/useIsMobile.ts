"use client";

import { useEffect, useState } from "react";

const MOBILE_WIDTH_BREAKPOINT = 820;

function detectTouchCapable(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    return (
        "ontouchstart" in window ||
        (navigator.maxTouchPoints ?? 0) > 0 ||
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    );
}

export function useIsMobile(): { isMobile: boolean; isPortrait: boolean } {
    const [isTouchCapable, setIsTouchCapable] = useState(false);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setIsTouchCapable(detectTouchCapable());

        const updateViewport = () => {
            setViewport({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        updateViewport();
        window.addEventListener("resize", updateViewport);
        window.addEventListener("orientationchange", updateViewport);

        return () => {
            window.removeEventListener("resize", updateViewport);
            window.removeEventListener("orientationchange", updateViewport);
        };
    }, []);

    // Se usa el lado mas grande (no solo el ancho) para que un telefono en
    // horizontal no deje de contarse como mobile - la orientacion se maneja
    // aparte con isPortrait.
    const isPhoneSized =
        viewport.width > 0 &&
        Math.max(viewport.width, viewport.height) <= MOBILE_WIDTH_BREAKPOINT;
    const isMobile = isTouchCapable && isPhoneSized;
    const isPortrait = viewport.height >= viewport.width;

    return { isMobile, isPortrait };
}
