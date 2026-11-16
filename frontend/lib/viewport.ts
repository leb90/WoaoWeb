export const TILE_SIZE = 32;
export const VIEWPORT_TILE_WIDTH = 25;
export const VIEWPORT_TILE_HEIGHT = 16;
export const VIEWPORT_TILE_RADIUS_X = Math.floor(VIEWPORT_TILE_WIDTH / 2);
export const VIEWPORT_TILE_RADIUS_Y = Math.floor(VIEWPORT_TILE_HEIGHT / 2);
export const VIEWPORT_TILE_RADIUS = VIEWPORT_TILE_RADIUS_X;
export const VIEWPORT_PIXEL_WIDTH = VIEWPORT_TILE_WIDTH * TILE_SIZE;
export const VIEWPORT_PIXEL_HEIGHT = VIEWPORT_TILE_HEIGHT * TILE_SIZE;

// Tope de la resolución del canvas del juego: más nitidez cuesta más GPU (el área a pintar crece al cuadrado).
export const MAX_CANVAS_RENDER_RESOLUTION = 2;

/**
 * Resolución a la que conviene dibujar el canvas del juego: cuántos píxeles reales de pantalla le tocan a cada
 * píxel lógico del mundo, entre 1 y el tope. Así los textos no se ven borrosos al estirar el juego a pantalla grande.
 */
export function getCanvasRenderResolution(displayWidth: number, logicalWidth: number): number {
    if (typeof window === "undefined" || !(displayWidth > 0) || !(logicalWidth > 0)) {
        return 1;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const ratio = (displayWidth * devicePixelRatio) / logicalWidth;

    // Redondeo a cuartos para no rehacer todos los textos por un cambio de unos píxeles al redimensionar.
    return Math.min(MAX_CANVAS_RENDER_RESOLUTION, Math.max(1, Math.round(ratio * 4) / 4));
}
