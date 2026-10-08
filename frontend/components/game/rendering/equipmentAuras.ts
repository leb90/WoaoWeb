import { Assets, Container, Sprite, Texture } from "pixi.js";

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

type AuraHost = {
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

/** Debajo del cuerpo (0.2), la cabeza y el equipo. */
const AURA_Z_INDEX = 0.05;

type AuraRig = {
    owner: Container;
    root: Container;
    glow: Sprite;
    base: Sprite;
    energy: Sprite;
    setId: string;
    size: number;
    hidden: boolean;
};

const rigs = new Set<AuraRig>();
const rigByContainer = new WeakMap<Container, AuraRig>();
const textureCache = new Map<string, Texture>();
const textureLoads = new Map<string, Promise<Texture | null>>();
let auraOpacity = DEFAULT_AURA_OPACITY;
let opacityLoaded = false;
let legacyOverlayRemoved = false;

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

function loadTexture(src: string, apply: (texture: Texture) => void): void {
    const cached = textureCache.get(src);
    if (cached) {
        apply(cached);
        return;
    }

    let pending = textureLoads.get(src);
    if (!pending) {
        pending = Assets.load<Texture>(src)
            .then((texture) => {
                texture.source.scaleMode = "linear";
                textureCache.set(src, texture);
                return texture;
            })
            .catch(() => null);
        textureLoads.set(src, pending);
    }

    void pending.then((texture) => {
        if (texture) apply(texture);
    });
}

function createLayer(src: string): Sprite {
    const sprite = new Sprite(Texture.EMPTY);
    sprite.anchor.set(0.5, 0.5);
    sprite.eventMode = "none";
    loadTexture(src, (texture) => {
        if (sprite.destroyed) return;
        sprite.texture = texture;
    });
    return sprite;
}

function removeLegacyOverlay(): void {
    if (legacyOverlayRemoved || typeof document === "undefined") return;
    legacyOverlayRemoved = true;
    document.querySelectorAll(".eq-aura-surface").forEach((node) => {
        node.parentElement?.remove();
    });
}

function destroyRig(rig: AuraRig): void {
    rigs.delete(rig);
    rigByContainer.delete(rig.owner);
    rig.root.parent?.removeChild(rig.root);
    rig.root.destroy({ children: true });
}

function removeRig(container: Container): void {
    const rig = rigByContainer.get(container);
    if (!rig) return;
    destroyRig(rig);
}

function placeRig(rig: AuraRig, body: BodyBox, widthScale: number): void {
    // Centro del sigilo en los pies. El cuerpo se dibuja encima.
    rig.root.position.set(body.x + body.width / 2, body.y + body.height - 2);
    rig.size = Math.max(12, body.width * widthScale);
    rig.root.zIndex = AURA_Z_INDEX;
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
    if (!rig || rig.setId !== set.id || rig.root.destroyed) {
        removeRig(container);
        const root = new Container();
        root.label = "equipmentAura";
        root.eventMode = "none";
        root.interactiveChildren = false;
        root.sortableChildren = false;
        const glow = createLayer(set.layers.glow);
        const base = createLayer(set.layers.base);
        const energy = createLayer(set.layers.energy);
        glow.zIndex = 0;
        base.zIndex = 1;
        energy.zIndex = 2;
        root.addChild(glow, base, energy);
        container.addChild(root);
        rig = {
            owner: container,
            root,
            glow,
            base,
            energy,
            setId: set.id,
            size: 0,
            hidden: !visible,
        };
        rigs.add(rig);
        rigByContainer.set(container, rig);
    } else if (rig.root.parent !== container) {
        container.addChild(rig.root);
    }

    rig.hidden = !visible;
    rig.root.visible = visible;
    placeRig(rig, body, set.widthScale);
}

function layoutLayer(sprite: Sprite, size: number): void {
    sprite.width = size;
    sprite.height = size;
}

export function updateEquipmentAuras(host: AuraHost): void {
    ensureOpacityLoaded();
    removeLegacyOverlay();
    if (host.isDestroyed) return;

    const now = performance.now();
    const baseRot = ((now % 8000) / 8000) * Math.PI * 2;
    const energyRot = -((now % 6500) / 6500) * Math.PI * 2;
    const pulse = (1 - Math.cos(((now % 2000) / 2000) * Math.PI * 2)) / 2;
    const glowScale = 0.94 + 0.12 * pulse;
    const glowAlpha = (0.42 + 0.36 * pulse) * auraOpacity;
    const baseAlpha = 0.82 * auraOpacity;
    const energyAlpha = 0.72 * auraOpacity;
    const hiddenByOpacity = auraOpacity <= 0.001;

    for (const rig of rigs) {
        if (rig.owner.destroyed || rig.root.destroyed || !rig.root.parent) {
            destroyRig(rig);
            continue;
        }

        const shown =
            !hiddenByOpacity &&
            !rig.hidden &&
            rig.owner.visible &&
            rig.owner.alpha > 0.05;
        rig.root.visible = shown;
        if (!shown) continue;

        const fade = Math.min(1, rig.owner.alpha);
        layoutLayer(rig.glow, rig.size * glowScale);
        layoutLayer(rig.base, rig.size);
        layoutLayer(rig.energy, rig.size);
        rig.glow.alpha = glowAlpha * fade;
        rig.base.alpha = baseAlpha * fade;
        rig.energy.alpha = energyAlpha * fade;
        rig.base.rotation = baseRot;
        rig.energy.rotation = energyRot;
        rig.glow.rotation = 0;
    }
}
