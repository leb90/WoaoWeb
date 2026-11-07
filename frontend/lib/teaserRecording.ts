// Modo grabación del teaser (teaser/README.md): /play muestra solo el mundo, sin HUD, tapando toda la ventana, y
// anota cada sonido que suena para mezclarlo después en el video. Lo prende la grabación (teaser/grabar.ts) con
// sessionStorage, así sigue prendido al recargar. Solo existe en desarrollo.
import { createAttackSpellPacket, createDialogPacket } from "./aowProtocol";
import { VIEWPORT_PIXEL_HEIGHT, VIEWPORT_PIXEL_WIDTH } from "./viewport";

const STORAGE_KEY = "woao.grabacion";

export type TeaserHeardSound = { soundId: number; at: number; volume: number; category: string };

type TeaserWindow = Window & {
    __woaoAudioLog?: TeaserHeardSound[];
    __woaoTeaser?: {
        castSpell: (slot: number, x: number, y: number, map: number, targetId?: number) => void;
        say: (text: string) => void;
    };
};

export function isTeaserRecording(): boolean {
    if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
        return false;
    }
    try {
        return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

export function logTeaserSound(sound: Omit<TeaserHeardSound, "at">): void {
    if (!isTeaserRecording()) {
        return;
    }
    const target = window as TeaserWindow;
    (target.__woaoAudioLog ??= []).push({ ...sound, at: Date.now() });
}

// Lo que hace el personaje que graba sin tocar la interfaz (que está escondida): tirar un hechizo a una baldosa y
// hablar. Manda los mismos paquetes que el juego.
export function exposeTeaserControls(send: (packet: ArrayBuffer) => void): void {
    if (process.env.NODE_ENV === "production") {
        return;
    }
    (window as TeaserWindow).__woaoTeaser = {
        castSpell: (slot, x, y, map, targetId) => send(createAttackSpellPacket(slot, x, y, false, map, targetId ?? null)),
        say: (text) => send(createDialogPacket(text)),
    };
}

// El render cubre la ventana entera (como object-fit: cover) con una escala entera: los píxeles quedan parejos.
export function teaserCanvasSize(viewport: { width: number; height: number }): { width: number; height: number } {
    const scale = Math.max(
        1,
        Math.ceil(Math.max(viewport.width / VIEWPORT_PIXEL_WIDTH, viewport.height / VIEWPORT_PIXEL_HEIGHT) - 0.001),
    );
    return { width: VIEWPORT_PIXEL_WIDTH * scale, height: VIEWPORT_PIXEL_HEIGHT * scale };
}

// Se ve el render y nada más: el HUD, los paneles que van aparte (como el cartel de la mazmorra) y los avisos que van
// arriba del render quedan escondidos.
export const TEASER_RECORDING_CSS = `
body * { visibility: hidden !important; }
[data-teaser-canvas], [data-teaser-canvas] * { visibility: visible !important; }
[data-teaser-canvas] {
    position: fixed !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%);
    z-index: 2147483000;
}
[data-teaser-canvas] > :not(:has(canvas)) { display: none !important; }
`;
