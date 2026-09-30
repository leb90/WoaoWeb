"use client";

import { useEffect, useState } from "react";

// Lado corto máximo de la pantalla física para considerarla un teléfono.
// Los teléfonos rondan 320-480px; las tablets arrancan en ~744px.
const PHONE_SHORT_SIDE_MAX = 600;

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

// Se usa la pantalla física (screen.*) y no el viewport: el viewport cambia
// al girar, al abrir el teclado o con viewport-fit=cover (un iPhone en
// horizontal pasa de ~750px a 844px), y antes eso hacía que el juego
// alternara entre layout mobile y desktop.
function detectPhoneScreen(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const shortSide = Math.min(
        window.screen?.width || window.innerWidth,
        window.screen?.height || window.innerHeight,
    );

    return shortSide > 0 && shortSide <= PHONE_SHORT_SIDE_MAX;
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
    // isMobile vale "false" antes de que el efecto corra - suficiente para
    // que un dialogo que decide "mostrarme o no" tome la decision equivocada.
    const [isMobile, setIsMobile] = useState(
        () => detectTouchCapable() && detectPhoneScreen(),
    );
    const [viewport, setViewport] = useState(readViewport);

    useEffect(() => {
        setIsMobile(detectTouchCapable() && detectPhoneScreen());

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

    const isPortrait = viewport.height >= viewport.width;

    return { isMobile, isPortrait };
}
