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

function readViewport(): { width: number; height: number } {
    if (typeof window === "undefined") {
        return { width: 0, height: 0 };
    }

    return { width: window.innerWidth, height: window.innerHeight };
}

export function useIsMobile(): { isMobile: boolean; isPortrait: boolean } {
    // Inicializadores perezosos: se resuelven en el primer render del
    // cliente, no en un efecto posterior. Si no, hay una ventana donde
    // isMobile vale "false" (el default previo) antes de que el efecto
    // corra - suficiente para que un dialogo que decide "mostrarme o no"
    // en base a isMobile tome la decision equivocada en un celular real.
    const [isTouchCapable, setIsTouchCapable] = useState(detectTouchCapable);
    const [viewport, setViewport] = useState(readViewport);

    useEffect(() => {
        setIsTouchCapable(detectTouchCapable());

        const updateViewport = () => {
            setViewport(readViewport());
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
