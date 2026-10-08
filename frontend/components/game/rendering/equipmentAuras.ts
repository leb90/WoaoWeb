import { Container, Point, type ICanvas } from "pixi.js";

export type EquippedPieces = {
    body: number;
    helmet: number;
    weapon: number;
    shield: number;
};

type AuraLayers = {
    base: string;
    glow: string;
    energy: string;
};

type AuraSet = {
    id: string;
    body: number;
    helmet: number;
    weapon: number;
    shield: number;
    /** Ancho del aura respecto del ancho del cuerpo, en píxeles del mundo. */
    widthScale: number;
    layers: AuraLayers;
};

type BodyBox = { x: number; y: number; width: number; height: number };

type AuraRenderer = {
    resolution: number;
    extract: {
        canvas: (options: {
            target: Container;
            clearColor: number[];
            antialias: boolean;
        }) => ICanvas;
    };
};

type AuraHost = {
    app?: {
        canvas?: HTMLCanvasElement;
        screen?: { width: number; height: number };
        renderer?: AuraRenderer;
    } | null;
    isDestroyed?: boolean;
};

/**
 * Un set completo activa su aura. Para otro tier, sumá una entrada y tres PNG
 * transparentes: runa, brillo y partículas.
 */
const AURA_SETS: AuraSet[] = [
    {
        id: "arcane-mage",
        body: 556,
        helmet: 44,
        weapon: 77,
        shield: 40,
        widthScale: 1.85,
        layers: {
            base: "/auras/arcane/base.png",
            glow: "/auras/arcane/glow.png",
            energy: "/auras/arcane/energy.png",
        },
    },
];

export const AURA_OPACITY_STORAGE_KEY = "ao-play-aura-opacity";
/** 0 invisible, 1 la intensidad de las capas. Por defecto queda suave. */
export const DEFAULT_AURA_OPACITY = 0.4;

const STYLE_ID = "equipment-aura-style";
const AURA_STYLE = `
.eq-aura-surface {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
`;

type AuraImages = {
    base: HTMLImageElement;
    glow: HTMLImageElement;
    energy: HTMLImageElement;
};

type AuraRig = {
    container: Container;
    setId: string;
    localX: number;
    localY: number;
    worldSpan: number;
    images: AuraImages;
    hidden: boolean;
};

const rigs = new Set<AuraRig>();
const rigByContainer = new WeakMap<Container, AuraRig>();
const imageCache = new Map<string, HTMLImageElement>();
const scratchIn = new Point();
const scratchOut = new Point();
let overlay: HTMLDivElement | null = null;
let surface: HTMLCanvasElement | null = null;
let auraOpacity = DEFAULT_AURA_OPACITY;
let opacityLoaded = false;

function clampOpacity(value: number): number {
    if (!Number.isFinite(value)) return DEFAULT_AURA_OPACITY;
    return Math.min(1, Math.max(0, value));
}

function ensureOpacityLoaded(): void {
    if (opacityLoaded || typeof window === "undefined") return;
    opacityLoaded = true;
    try {
        const raw = window.localStorage.getItem(AURA_OPACITY_STORAGE_KEY);
        if (raw == null) return;
        auraOpacity = clampOpacity(Number.parseFloat(raw));
    } catch {
        auraOpacity = DEFAULT_AURA_OPACITY;
    }
}

export function getEquipmentAuraOpacity(): number {
    ensureOpacityLoaded();
    return auraOpacity;
}

export function setEquipmentAuraOpacity(value: number): void {
    auraOpacity = clampOpacity(value);
    opacityLoaded = true;
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(AURA_OPACITY_STORAGE_KEY, String(auraOpacity));
    } catch {
        // El navegador puede bloquear storage; la opacidad igual vale en esta sesión.
    }
}

export function resolveEquipmentAura(gear: EquippedPieces): AuraSet | null {
    return (
        AURA_SETS.find(
            (set) =>
                gear.body === set.body &&
                gear.helmet === set.helmet &&
                gear.weapon === set.weapon &&
                gear.shield === set.shield,
        ) ?? null
    );
}

function ensureStyle(): void {
    if (typeof document === "undefined" || document.getElementById(STYLE_ID)) {
        return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = AURA_STYLE;
    document.head.appendChild(style);
}

function getImage(src: string): HTMLImageElement {
    const cached = imageCache.get(src);
    if (cached) return cached;
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    imageCache.set(src, image);
    return image;
}

function ensureOverlay(canvas: HTMLCanvasElement): HTMLCanvasElement | null {
    const host = canvas.parentElement;
    if (!host) return null;
    if (getComputedStyle(host).position === "static") {
        host.style.position = "relative";
    }
    if (!overlay || overlay.parentElement !== host) {
        overlay?.remove();
        overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.inset = "0";
        overlay.style.overflow = "hidden";
        overlay.style.pointerEvents = "none";
        overlay.style.zIndex = "3";
        surface = document.createElement("canvas");
        surface.className = "eq-aura-surface";
        overlay.appendChild(surface);
        host.appendChild(overlay);
    }
    return surface;
}

function removeRig(container: Container): void {
    const rig = rigByContainer.get(container);
    if (!rig) return;
    rigs.delete(rig);
    rigByContainer.delete(container);
}

function placeRig(rig: AuraRig, body: BodyBox, widthScale: number): void {
    rig.localX = body.x + body.width / 2;
    rig.localY = body.y + body.height - 2;
    rig.worldSpan = Math.max(12, body.width * widthScale);
}

export function syncEquipmentAura(
    container: Container,
    gear: EquippedPieces,
    body: BodyBox,
    visible: boolean,
): void {
    const set = resolveEquipmentAura(gear);
    if (!set || body.width <= 0) {
        removeRig(container);
        return;
    }

    let rig = rigByContainer.get(container);
    if (!rig || rig.setId !== set.id) {
        removeRig(container);
        rig = {
            container,
            setId: set.id,
            localX: 0,
            localY: 0,
            worldSpan: 0,
            images: {
                glow: getImage(set.layers.glow),
                base: getImage(set.layers.base),
                energy: getImage(set.layers.energy),
            },
            hidden: !visible,
        };
        rigs.add(rig);
        rigByContainer.set(container, rig);
    }

    rig.hidden = !visible;
    placeRig(rig, body, set.widthScale);
}

function drawLayer(
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    cx: number,
    cy: number,
    size: number,
    rotation: number,
    alpha: number,
    scale: number,
): void {
    if (!image.complete || image.naturalWidth <= 0 || alpha <= 0.01) return;
    const draw = size * scale;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, -draw / 2, -draw / 2, draw, draw);
    ctx.restore();
}

function punchCharacter(
    ctx: CanvasRenderingContext2D,
    renderer: AuraRenderer,
    container: Container,
    originX: number,
    originY: number,
    scaleX: number,
    scaleY: number,
): void {
    const bounds = container.getLocalBounds();
    const minX = bounds.minX;
    const minY = bounds.minY;
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;
    if (!(width > 1) || !(height > 1)) return;

    let extracted: ICanvas;
    try {
        extracted = renderer.extract.canvas({
            target: container,
            clearColor: [0, 0, 0, 0],
            antialias: false,
        });
    } catch {
        return;
    }

    scratchIn.set(minX, minY);
    container.toGlobal(scratchIn, scratchOut);
    const charX = scratchOut.x;
    const charY = scratchOut.y;
    scratchIn.set(minX + width, minY + height);
    container.toGlobal(scratchIn, scratchOut);
    const left = originX + charX * scaleX;
    const top = originY + charY * scaleY;
    const drawW = (scratchOut.x - charX) * scaleX;
    const drawH = (scratchOut.y - charY) * scaleY;
    if (!(drawW > 1) || !(drawH > 1)) return;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.imageSmoothingEnabled = false;
    const source = extracted as CanvasImageSource;
    // Un píxel de más para que el borde pixelado no deje el aura encima del sprite.
    for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [0, 0],
    ] as const) {
        ctx.drawImage(source, left + dx, top + dy, drawW, drawH);
    }
    ctx.restore();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
}

export function updateEquipmentAuras(host: AuraHost): void {
    ensureOpacityLoaded();
    const canvas = host.app?.canvas;
    const renderer = host.app?.renderer;
    const screen = host.app?.screen;
    if (!canvas || !renderer || !screen || host.isDestroyed) return;

    const layer = ensureOverlay(canvas);
    if (!layer) return;
    const ctx = layer.getContext("2d");
    if (!ctx || !overlay) return;

    const cssW = Math.max(1, overlay.clientWidth);
    const cssH = Math.max(1, overlay.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bufferW = Math.max(1, Math.round(cssW * dpr));
    const bufferH = Math.max(1, Math.round(cssH * dpr));
    if (layer.width !== bufferW || layer.height !== bufferH) {
        layer.width = bufferW;
        layer.height = bufferH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    if (rigs.size === 0 || auraOpacity <= 0.001) return;

    const rect = canvas.getBoundingClientRect();
    const hostRect = overlay.getBoundingClientRect();
    const scaleX = rect.width / Math.max(1, screen.width);
    const scaleY = rect.height / Math.max(1, screen.height);
    const originX = rect.left - hostRect.left;
    const originY = rect.top - hostRect.top;
    const now = performance.now();
    const baseRot = ((now % 8000) / 8000) * Math.PI * 2;
    const energyRot = -((now % 6500) / 6500) * Math.PI * 2;
    const pulse = (1 - Math.cos(((now % 2000) / 2000) * Math.PI * 2)) / 2;
    const glowScale = 0.94 + 0.12 * pulse;
    const glowAlpha = (0.42 + 0.36 * pulse) * auraOpacity;
    const baseAlpha = 0.82 * auraOpacity;
    const energyAlpha = 0.72 * auraOpacity;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const visible: AuraRig[] = [];
    for (const rig of rigs) {
        if (rig.container.destroyed || !rig.container.parent) {
            removeRig(rig.container);
            continue;
        }
        const shown =
            !rig.hidden && rig.container.visible && rig.container.alpha > 0.05;
        if (!shown) continue;
        visible.push(rig);

        scratchIn.set(rig.localX, rig.localY);
        rig.container.toGlobal(scratchIn, scratchOut);
        const size = Math.max(24, rig.worldSpan * scaleX);
        const cx = originX + scratchOut.x * scaleX;
        const cy = originY + scratchOut.y * scaleY;
        const fade = Math.min(1, rig.container.alpha);
        drawLayer(
            ctx,
            rig.images.glow,
            cx,
            cy,
            size,
            0,
            glowAlpha * fade,
            glowScale,
        );
        drawLayer(ctx, rig.images.base, cx, cy, size, baseRot, baseAlpha * fade, 1);
        drawLayer(
            ctx,
            rig.images.energy,
            cx,
            cy,
            size,
            energyRot,
            energyAlpha * fade,
            1,
        );
    }

    for (const rig of visible) {
        punchCharacter(ctx, renderer, rig.container, originX, originY, scaleX, scaleY);
    }
}
