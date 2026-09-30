"use client";

import { useCallback, useRef } from "react";

const TAP_SLOP_PX = 12;
const GHOST_CLICK_WINDOW_MS = 600;

// El click que el navegador sintetiza después del pointerup cae sobre lo que
// haya quedado debajo del dedo: si el tap abrió un modal, ese click le pega
// al fondo y lo cierra al instante. Se descarta ese único click.
function swallowNextClick() {
    const handler = (event: MouseEvent) => {
        window.removeEventListener("click", handler, true);
        event.stopPropagation();
        event.preventDefault();
    };

    window.addEventListener("click", handler, true);
    window.setTimeout(() => {
        window.removeEventListener("click", handler, true);
    }, GHOST_CLICK_WINDOW_MS);
}

// Safari de iOS no genera `click` para un toque hecho mientras otro dedo
// sigue apoyado (ej. manteniendo el joystick), así que un botón con onClick
// "deja de funcionar" mientras el jugador camina. Los eventos de puntero sí
// llegan por cada dedo: la acción se dispara en pointerup y el click que
// eventualmente siga se ignora (salvo el de teclado, que tiene detail 0).
export function useTapHandlers(onTap: () => void) {
    const activePointerRef = useRef<number | null>(null);

    const onPointerDown = useCallback((event: React.PointerEvent) => {
        activePointerRef.current = event.pointerId;
    }, []);

    const onPointerUp = useCallback(
        (event: React.PointerEvent<HTMLElement>) => {
            if (activePointerRef.current !== event.pointerId) {
                return;
            }

            activePointerRef.current = null;

            // Los toques tienen captura implícita: pointerup llega aunque el
            // dedo se haya ido lejos del botón. Solo cuenta si terminó encima.
            const rect = event.currentTarget.getBoundingClientRect();
            const isInside =
                event.clientX >= rect.left - TAP_SLOP_PX &&
                event.clientX <= rect.right + TAP_SLOP_PX &&
                event.clientY >= rect.top - TAP_SLOP_PX &&
                event.clientY <= rect.bottom + TAP_SLOP_PX;

            if (isInside) {
                if (event.pointerType !== "mouse") {
                    swallowNextClick();
                }
                onTap();
            }
        },
        [onTap],
    );

    const onPointerCancel = useCallback(() => {
        activePointerRef.current = null;
    }, []);

    const onClick = useCallback(
        (event: React.MouseEvent) => {
            if (event.detail === 0) {
                onTap();
            }
        },
        [onTap],
    );

    return { onPointerDown, onPointerUp, onPointerCancel, onClick };
}
