import { Assets, Container, Sprite, Texture } from "pixi.js";
import { DONATION_TUNIC_BODY_ACCENTS } from "@/lib/specialItems";

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
    /** Si true, alcanza con equipar ese body (no exige casco/arma/escudo). */
    bodyOnly?: boolean;
    helmet?: number;
    weapon?: number;
    shield?: number;
    /** Ancho del aura respecto del ancho del cuerpo, en píxeles del mundo. */
    widthScale: number;
    /**
     * Desplazamiento vertical desde los pies (negativo = subir).
     * Las auras altas de donación necesitan subir para envolver el torso.
     */
    offsetY?: number;
    /** Tint Pixi (equivalente a recolorear con CSS filter). */
    tint?: number;
    layers: AuraLayers;
};

const DONATION_AURA_LAYERS: AuraLayers = {
    base: "/auras/donation/base.png",
    glow: "/auras/donation/glow.png",
    energy: "/auras/donation/energy.png",
};

/** Tints acordes al color de cada túnica de donación. */
const DONATION_AURA_TINTS: Record<string, number> = {
    suerte: 0x3dff7a,
    experiencia: 0x4eb6ff,
    dorada: 0xffd24a,
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
    ...Object.entries(DONATION_TUNIC_BODY_ACCENTS).map(([bodyId, accent]) => ({
        id: `donation-tunic-${accent}`,
        body: Number(bodyId),
        bodyOnly: true,
        widthScale: 2.15,
        // Sube el centro del aura (antes quedaba pegado al piso).
        offsetY: -28,
        tint: DONATION_AURA_TINTS[accent] ?? 0xffffff,
        layers: DONATION_AURA_LAYERS,
    })),
];

/**
 * Intensidad global de auras de equipo (0 = invisible, 1 = máxima).
 * Se define solo por código; no hay slider/localStorage de usuario.
 */
export const EQUIPMENT_AURA_OPACITY = 0.1;

/** @deprecated Usar EQUIPMENT_AURA_OPACITY. */
export const DEFAULT_AURA_OPACITY = EQUIPMENT_AURA_OPACITY;

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
    tint: number;
};

const rigs = new Set<AuraRig>();
const rigByContainer = new WeakMap<Container, AuraRig>();
const textureCache = new Map<string, Texture>();
const textureLoads = new Map<string, Promise<Texture | null>>();
let legacyOverlayRemoved = false;

export function getEquipmentAuraOpacity(): number {
    return EQUIPMENT_AURA_OPACITY;
}

export function resolveEquipmentAura(gear: EquippedPieces): AuraSet | null {
    const bodyOnly = AURA_SETS.find(
        (set) => set.bodyOnly && gear.body === set.body,
    );
    if (bodyOnly) return bodyOnly;

    return (
        AURA_SETS.find(
            (set) =>
                !set.bodyOnly &&
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

function placeRig(
    rig: AuraRig,
    body: BodyBox,
    widthScale: number,
    offsetY = 0,
): void {
    // Por defecto el centro queda cerca de los pies; offsetY negativo lo sube.
    rig.root.position.set(
        body.x + body.width / 2,
        body.y + body.height - 2 + offsetY,
    );
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
        const tint = set.tint ?? 0xffffff;
        glow.tint = tint;
        base.tint = tint;
        energy.tint = tint;
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
            tint,
        };
        rigs.add(rig);
        rigByContainer.set(container, rig);
    } else if (rig.root.parent !== container) {
        container.addChild(rig.root);
    }

    rig.hidden = !visible;
    rig.root.visible = visible;
    const tint = set.tint ?? 0xffffff;
    if (rig.tint !== tint) {
        rig.tint = tint;
        rig.glow.tint = tint;
        rig.base.tint = tint;
        rig.energy.tint = tint;
    }
    placeRig(rig, body, set.widthScale, set.offsetY ?? 0);
}

function layoutLayer(sprite: Sprite, size: number): void {
    sprite.width = size;
    sprite.height = size;
}

export function updateEquipmentAuras(host: AuraHost): void {
    removeLegacyOverlay();
    if (host.isDestroyed) return;

    const auraOpacity = EQUIPMENT_AURA_OPACITY;
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
