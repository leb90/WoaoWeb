// Rotación (en grados, sentido horario) que se le aplica por CSS a la vista
// del juego cuando el jugador bloqueó la orientación y el teléfono quedó en
// vertical. Los handlers de input (Pixi, joystick) la leen para convertir
// coordenadas de pantalla a coordenadas locales del contenido rotado.
export type ViewportRotation = 0 | 90 | -90;

let currentRotation: ViewportRotation = 0;

export function getViewportRotation(): ViewportRotation {
    return currentRotation;
}

export function setViewportRotation(rotation: ViewportRotation) {
    currentRotation = rotation;
}

// Convierte un desplazamiento medido en pantalla al sistema de coordenadas
// del contenido rotado `rotation` grados.
export function screenDeltaToLocal(
    dx: number,
    dy: number,
    rotation: ViewportRotation = currentRotation,
): { x: number; y: number } {
    if (rotation === 90) {
        return { x: dy, y: -dx };
    }

    if (rotation === -90) {
        return { x: -dy, y: dx };
    }

    return { x: dx, y: dy };
}
