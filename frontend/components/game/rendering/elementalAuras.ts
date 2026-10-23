import { AnimatedSprite, Container, Sprite } from "pixi.js";
import type { Engine } from "../engine/Engine";
import { getFxSpritePosition } from "./characterLayout";
import {
    toElementalEntityState,
    type ElementalEntityState,
    type ElementalStatePayload,
} from "../../../lib/elementalState";

// Efectos del Chamán elemental (server/src/elementalEffects.ts) de cada personaje: el estado que llega en el
// paquete elementalState y las auras que quedan sobre el personaje mientras duran (escudos y Evasión de viento).
// Las auras viven dentro del contenedor del personaje, así se mueven con él y respetan su transparencia.

// Efecto en bucle de cada aura (fxs.json) y si va detrás del cuerpo.
type AuraKind = "shield" | "evasion" | "ally" | "silence";
type AuraSpec = { fxId: number; behind: boolean; alpha: number };

export const ELEMENTAL_AURA_FX: Record<
    "magico" | "fisico" | "energia" | "evasion" | "ally" | "agua" | "rayo",
    AuraSpec
> = {
    magico: { fxId: 147, behind: false, alpha: 0.7 },
    fisico: { fxId: 148, behind: false, alpha: 0.7 },
    // El anillo de piedras queda detrás del personaje: por delante lo tapaba.
    energia: { fxId: 151, behind: true, alpha: 0.95 },
    evasion: { fxId: 150, behind: false, alpha: 0.75 },
    ally: { fxId: 152, behind: true, alpha: 0.8 },
    // Silenciado: encerrado en la esfera de agua (Prisión de agua) o con chispas en la cabeza (Rayo Eléctrico).
    agua: { fxId: 149, behind: false, alpha: 0.8 },
    rayo: { fxId: 154, behind: false, alpha: 0.95 },
};

function desiredAuras(state: ElementalEntityState | undefined, now: number): Partial<Record<AuraKind, AuraSpec>> {
    if (!state) return {};
    const auras: Partial<Record<AuraKind, AuraSpec>> = {};
    if (state.shield && state.shieldUntil > now) auras.shield = ELEMENTAL_AURA_FX[state.shield];
    if (state.evasionUntil > now) auras.evasion = ELEMENTAL_AURA_FX.evasion;
    if (state.allyMagicUntil > now || state.allyPhysicalUntil > now) auras.ally = ELEMENTAL_AURA_FX.ally;
    if (state.fullSilenceUntil > now) auras.silence = ELEMENTAL_AURA_FX[state.silenceKind === "rayo" ? "rayo" : "agua"];
    return auras;
}

type AuraSprite = (Sprite | AnimatedSprite) & { elementalAura?: AuraKind; elementalAuraFx?: number };

type CreateElementalAurasOptions = {
    getEntityContainer: (engine: Engine, entityId: number) => Container | null;
    canUseEngineContainer: (engine: Engine, container: Container | null | undefined) => boolean;
    loadTextures: (engine: Engine, graphicIds: string[]) => Promise<void>;
    destroyDisplayObjectSafely: (displayObject: any, options?: { children?: boolean }) => void;
};

export function createElementalAuras(options: CreateElementalAurasOptions) {
    const states = new Map<number, ElementalEntityState>();
    const loading = new Set<string>();

    const removeAura = (engine: Engine, sprite: AuraSprite) => {
        if (sprite instanceof AnimatedSprite) engine.animatedSpriteFrameCounters.delete(sprite);
        sprite.parent?.removeChild(sprite);
        options.destroyDisplayObjectSafely(sprite);
    };

    const createAuraSprite = (engine: Engine, kind: AuraKind, spec: AuraSpec): AuraSprite | null => {
        const fxData = engine.fxsDB?.[String(spec.fxId)];
        if (!fxData || !engine.graphicsDB) return null;
        const graphicKey = String(fxData.grh);
        const graphicData = engine.graphicsDB[graphicKey];
        if (!graphicData) return null;

        if (!engine.textureCache.has(graphicKey) && !engine.animatedTextureCache.has(graphicKey)) {
            if (!loading.has(graphicKey)) {
                loading.add(graphicKey);
                void options.loadTextures(engine, [graphicKey]).finally(() => loading.delete(graphicKey));
            }
            return null;
        }

        let sprite: AuraSprite;
        if (graphicData.numFrames > 1) {
            const frames = engine.animatedTextureCache.get(graphicKey);
            if (!frames?.length) return null;
            const animated = new AnimatedSprite(frames);
            animated.stop();
            (animated as any).frameCounter = 0.1;
            engine.animatedSpriteFrameCounters.set(animated, { graphicId: graphicKey, graphicData, loop: true });
            sprite = animated as AuraSprite;
        } else {
            const texture = engine.textureCache.get(graphicKey);
            if (!texture) return null;
            sprite = new Sprite(texture) as AuraSprite;
        }

        const position = getFxSpritePosition(sprite.texture, Number(fxData.offsetX ?? 0), Number(fxData.offsetY ?? 0));
        sprite.x = position.x;
        sprite.y = position.y;
        sprite.alpha = spec.alpha;
        // Detrás: debajo del cuerpo (0.2) y del arma de espaldas (0.12). Delante: arriba del escudo (0.5) y
        // debajo de las barras de vida y el nombre (0.53 en adelante).
        sprite.zIndex = spec.behind ? 0.05 : 0.52;
        sprite.elementalAura = kind;
        sprite.elementalAuraFx = spec.fxId;
        return sprite;
    };

    const syncEntity = (engine: Engine, entityId: number, now = Date.now()) => {
        const container = options.getEntityContainer(engine, entityId);
        if (!container || !options.canUseEngineContainer(engine, container)) return;

        const wanted = desiredAuras(states.get(entityId), now);
        const existing = container.children.filter((child) => (child as AuraSprite).elementalAura) as AuraSprite[];

        for (const sprite of existing) {
            const spec = wanted[sprite.elementalAura!];
            if (!spec || spec.fxId !== sprite.elementalAuraFx) removeAura(engine, sprite);
        }

        for (const [kind, spec] of Object.entries(wanted) as Array<[AuraKind, AuraSpec]>) {
            const present = container.children.some(
                (child) => (child as AuraSprite).elementalAura === kind && (child as AuraSprite).elementalAuraFx === spec.fxId,
            );
            if (present) continue;
            const sprite = createAuraSprite(engine, kind, spec);
            if (sprite) container.addChild(sprite);
        }
    };

    return {
        getState: (entityId: number) => states.get(entityId),

        setState(engine: Engine | null, payload: ElementalStatePayload) {
            const entityId = Number(payload.id);
            if (!Number.isFinite(entityId) || entityId <= 0) return undefined;
            const state = toElementalEntityState(payload);
            states.set(entityId, state);
            if (engine) syncEntity(engine, entityId);
            return state;
        },

        /** Pone o saca auras según el tiempo y vuelve a ponerlas si el personaje se redibujó. */
        syncAll(engine: Engine | null, now = Date.now()) {
            for (const [entityId, state] of states) {
                const anyActive =
                    state.shieldUntil > now ||
                    state.evasionUntil > now ||
                    state.allyMagicUntil > now ||
                    state.allyPhysicalUntil > now ||
                    state.slowUntil > now ||
                    state.magicSilenceUntil > now ||
                    state.fullSilenceUntil > now ||
                    state.evasionCooldownUntil > now ||
                    state.burning;
                if (engine) syncEntity(engine, entityId, now);
                if (!anyActive) states.delete(entityId);
            }
        },

        clear(engine: Engine | null) {
            states.clear();
            if (!engine) return;
            for (const container of [engine.playerContainer, ...engine.remoteEntities.values()]) {
                if (!container) continue;
                for (const child of [...container.children]) {
                    if ((child as AuraSprite).elementalAura) removeAura(engine, child as AuraSprite);
                }
            }
        },
    };
}

export type ElementalAuras = ReturnType<typeof createElementalAuras>;
