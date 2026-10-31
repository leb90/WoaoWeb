import type { HoverRelation } from "@/components/game/rendering/hoverHighlight";

// Cursores del juego, en public/cursors (créditos en docs/CREDITOS_GRAFICOS.md). Los valores son variables de
// app/cursors.css (--cursor-juego-*, con las imágenes embebidas), así la interfaz y el lienzo del mapa usan los mismos.
// - normal: el guantelete;
// - clic: borde dorado, sobre botones, enlaces y NPC con los que se habla o comercia;
// - enemigo: borde rojo, sobre criaturas hostiles y otros jugadores;
// - amigo: borde azul, sobre uno mismo, el grupo y el clan;
// - apuntar: la cruceta, mientras se elige el objetivo de un hechizo o un ataque a distancia.
// En el resto del sitio rige el CSS: el dorado sobre lo clickeable, el guantelete oscuro mientras se aprieta
// (--cursor-juego-presionado) y el prohibido en los botones deshabilitados.
export type GameCursor = "normal" | "clic" | "enemigo" | "amigo" | "apuntar";

export const GAME_CURSOR_CSS: Record<GameCursor, string> = {
    normal: "var(--cursor-juego)",
    clic: "var(--cursor-juego-clic)",
    enemigo: "var(--cursor-juego-enemigo)",
    amigo: "var(--cursor-juego-amigo)",
    apuntar: "var(--cursor-juego-apuntar)",
};

export function cursorForHoverRelation(relation: HoverRelation | null): GameCursor {
    switch (relation) {
        case "npc-hostile":
        case "other":
            return "enemigo";
        case "self":
        case "party":
        case "clan":
            return "amigo";
        case "npc":
            return "clic";
        default:
            return "normal";
    }
}

// Se llama en cada cuadro: solo toca el DOM cuando el cursor cambia.
export function setElementCursor(element: HTMLElement | null | undefined, cursor: GameCursor) {
    if (!element) return;
    const value = GAME_CURSOR_CSS[cursor];
    if (element.style.cursor !== value) element.style.cursor = value;
}
