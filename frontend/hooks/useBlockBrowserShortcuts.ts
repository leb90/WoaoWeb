import { useEffect } from "react";

/**
 * Atajos del navegador que en medio del juego solo molestan: imprimir, guardar la página, buscar, abrir
 * archivos, ver el código, favoritos, historial, descargas, la barra de direcciones... Se cancela la acción
 * del navegador (preventDefault) pero el evento sigue su camino, así que las teclas del juego funcionan igual.
 *
 * No se tocan los que hacen falta para escribir (copiar, pegar, cortar, deshacer, seleccionar todo), ni F5,
 * F11 o F12. Ctrl+W, Ctrl+T y Ctrl+N los maneja el navegador y una página no los puede frenar.
 */
const BLOCKED_CTRL_KEYS = new Set(["p", "s", "o", "u", "f", "g", "h", "j", "d", "e", "k", "l", "b", "i"]);
const BLOCKED_FUNCTION_KEYS = new Set(["F1", "F3", "F6", "F7", "F10"]);

export function shouldBlockBrowserShortcut(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey">) {
    if (BLOCKED_FUNCTION_KEYS.has(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        return true;
    }

    if (!(event.ctrlKey || event.metaKey) || event.altKey) {
        return false;
    }

    // Ctrl+Shift+I / J / C abren las herramientas de desarrollo: se dejan.
    if (event.shiftKey) {
        return event.key.toLowerCase() === "p" || event.key.toLowerCase() === "s";
    }

    return BLOCKED_CTRL_KEYS.has(event.key.toLowerCase());
}

export function useBlockBrowserShortcuts(enabled = true) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (shouldBlockBrowserShortcut(event)) {
                event.preventDefault();
            }
        };

        // Fase de captura en window: corre antes que cualquier otro listener y no frena a ninguno.
        window.addEventListener("keydown", handleKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
    }, [enabled]);
}
