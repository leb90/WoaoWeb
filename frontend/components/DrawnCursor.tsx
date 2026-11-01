"use client";

import { useEffect } from "react";
import { GAME_CURSOR_EVENT } from "@/lib/gameCursors";

// El cursor del sitio dibujado por la página: una imagen que sigue al mouse, con el cursor del sistema oculto
// (cursor: none, clase cursor-dibujado en globals.css). Con los cursores de imagen de CSS, Chrome en la Mac alternaba
// el guantelete con la flecha del sistema (PR #108 a #125); así no hay cursor de imagen que pueda cambiar. Elige el
// mismo que antes ponía el CSS: dorado sobre lo clickeable, oscuro mientras se aprieta, prohibido en lo deshabilitado,
// el del lienzo del juego (data-cursor, lib/gameCursors.ts) y la cruceta al apuntar. En los campos de texto se ve la
// barra de texto del sistema. Solo con mouse: en pantallas táctiles no hay cursor.

type Kind = "normal" | "clic" | "presionado" | "enemigo" | "amigo" | "apuntar" | "prohibido";

const CURSORS: Record<Kind, { src: string; hotspot: [number, number] }> = {
    normal: { src: "/cursors/guantelete.png?v=2", hotspot: [2, 2] },
    clic: { src: "/cursors/guantelete-oro.png?v=2", hotspot: [2, 2] },
    presionado: { src: "/cursors/guantelete-presionado.png?v=2", hotspot: [2, 2] },
    enemigo: { src: "/cursors/guantelete-rojo.png?v=2", hotspot: [2, 2] },
    amigo: { src: "/cursors/guantelete-azul.png?v=2", hotspot: [2, 2] },
    apuntar: { src: "/cursors/cruceta.png?v=2", hotspot: [16, 16] },
    prohibido: { src: "/cursors/prohibido.png?v=2", hotspot: [16, 16] },
};

const CLICKABLE =
    'a[href], button:not(:disabled), [role="button"]:not([aria-disabled="true"]), summary, select, label[for], .cursor-pointer';
const DISABLED = 'button:disabled, [aria-disabled="true"], .cursor-not-allowed';
const TEXT_FIELD =
    'input:not([type="checkbox"], [type="radio"], [type="range"], [type="button"], [type="submit"], [type="color"]), textarea, [contenteditable="true"]';
const GAME_KINDS = new Set<Kind>(["clic", "enemigo", "amigo", "apuntar"]);

export default function DrawnCursor() {
    useEffect(() => {
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
            return;
        }

        const html = document.documentElement;
        const root = document.createElement("div");
        root.className = "drawn-cursor";
        root.setAttribute("aria-hidden", "true");
        const images = {} as Record<Kind, HTMLImageElement>;
        for (const [kind, { src, hotspot }] of Object.entries(CURSORS) as Array<[Kind, (typeof CURSORS)[Kind]]>) {
            const image = document.createElement("img");
            image.src = src;
            image.alt = "";
            image.draggable = false;
            image.style.left = `${-hotspot[0]}px`;
            image.style.top = `${-hotspot[1]}px`;
            image.hidden = kind !== "normal";
            images[kind] = image;
            root.appendChild(image);
        }
        // En pantalla completa solo se ve lo que está adentro del elemento que la ocupa (el juego).
        const mount = () => (document.fullscreenElement ?? document.body).appendChild(root);
        mount();
        html.classList.add("cursor-dibujado");

        let shown: Kind = "normal";
        let target: Element | null = null;
        let pressed = false;
        let inside = false;
        // Mientras se arrastra un ítem el navegador no avisa del movimiento y muestra su propio cursor: el dibujado se
        // esconde hasta que se suelta.
        let dragging = false;

        const kindFor = (element: Element | null): Kind | null => {
            if (html.classList.contains("game-targeting")) return "apuntar";
            if (!element) return "normal";
            if (element.closest(TEXT_FIELD)) return null;
            if (element.closest(DISABLED)) return "prohibido";
            if (element.closest(CLICKABLE)) return pressed ? "presionado" : "clic";
            const game = element.closest<HTMLElement>("[data-cursor]")?.dataset.cursor as Kind | undefined;
            return game && GAME_KINDS.has(game) ? game : "normal";
        };

        const refresh = () => {
            const kind = inside && !dragging ? kindFor(target) : null;
            root.style.visibility = kind ? "visible" : "hidden";
            if (kind && kind !== shown) {
                images[shown].hidden = true;
                images[kind].hidden = false;
                shown = kind;
            }
        };

        const onMove = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            inside = true;
            target = event.target instanceof Element ? event.target : null;
            root.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
            refresh();
        };
        const onDown = (event: PointerEvent) => {
            if (event.pointerType === "touch") return;
            pressed = true;
            refresh();
        };
        const onUp = () => {
            pressed = false;
            refresh();
        };
        const onLeave = (event: MouseEvent) => {
            if (!event.relatedTarget) {
                inside = false;
                refresh();
            }
        };
        const onBlur = () => {
            inside = false;
            pressed = false;
            refresh();
        };
        const onDragStart = () => {
            dragging = true;
            refresh();
        };
        const onDragEnd = () => {
            dragging = false;
            pressed = false;
            refresh();
        };
        const onFullscreen = () => mount();
        // La clase game-targeting (apuntar) cambia sin mover el mouse.
        const classes = new MutationObserver(refresh);
        classes.observe(html, { attributes: true, attributeFilter: ["class"] });

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("pointerdown", onDown, { passive: true });
        window.addEventListener("pointerup", onUp, { passive: true });
        window.addEventListener("pointercancel", onUp, { passive: true });
        document.addEventListener("mouseout", onLeave);
        window.addEventListener("blur", onBlur);
        window.addEventListener(GAME_CURSOR_EVENT, refresh);
        document.addEventListener("fullscreenchange", onFullscreen);
        document.addEventListener("dragstart", onDragStart, true);
        document.addEventListener("dragend", onDragEnd, true);
        document.addEventListener("drop", onDragEnd, true);

        return () => {
            document.removeEventListener("dragstart", onDragStart, true);
            document.removeEventListener("dragend", onDragEnd, true);
            document.removeEventListener("drop", onDragEnd, true);
            classes.disconnect();
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerdown", onDown);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);
            document.removeEventListener("mouseout", onLeave);
            window.removeEventListener("blur", onBlur);
            window.removeEventListener(GAME_CURSOR_EVENT, refresh);
            document.removeEventListener("fullscreenchange", onFullscreen);
            html.classList.remove("cursor-dibujado");
            root.remove();
        };
    }, []);

    return null;
}
