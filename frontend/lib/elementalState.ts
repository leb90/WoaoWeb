// Estado de los efectos del Chamán elemental de un personaje (server/src/elementalEffects.ts), tal como llega en el
// paquete elementalState (ms que faltan) y pasado a tiempos absolutos del cliente.

export type ElementalStatePayload = {
    id: number;
    slowMs?: number;
    magicSilenceMs?: number;
    fullSilenceMs?: number;
    silenceKind?: "agua" | "rayo" | null;
    evasionMs?: number;
    evasionCooldownMs?: number;
    shield?: "magico" | "fisico" | "energia" | null;
    shieldMs?: number;
    allyMagicMs?: number;
    allyPhysicalMs?: number;
    burning?: boolean;
};

/** Mismo estado con tiempos absolutos del cliente (Date.now()). */
export type ElementalEntityState = {
    slowUntil: number;
    magicSilenceUntil: number;
    fullSilenceUntil: number;
    // Prisión de agua o Rayo Eléctrico: cambia el aura que ven los demás.
    silenceKind: "agua" | "rayo" | null;
    evasionUntil: number;
    evasionCooldownUntil: number;
    shield: "magico" | "fisico" | "energia" | null;
    shieldUntil: number;
    allyMagicUntil: number;
    allyPhysicalUntil: number;
    burning: boolean;
};

export function toElementalEntityState(payload: ElementalStatePayload, now = Date.now()): ElementalEntityState {
    const until = (ms?: number) => (Number(ms ?? 0) > 0 ? now + Number(ms) : 0);
    return {
        slowUntil: until(payload.slowMs),
        magicSilenceUntil: until(payload.magicSilenceMs),
        fullSilenceUntil: until(payload.fullSilenceMs),
        silenceKind: payload.silenceKind ?? null,
        evasionUntil: until(payload.evasionMs),
        evasionCooldownUntil: until(payload.evasionCooldownMs),
        shield: payload.shield ?? null,
        shieldUntil: payload.shield ? until(payload.shieldMs) : 0,
        allyMagicUntil: until(payload.allyMagicMs),
        allyPhysicalUntil: until(payload.allyPhysicalMs),
        burning: Boolean(payload.burning),
    };
}

export function isElementallySlowed(state: ElementalEntityState | undefined, now = Date.now()) {
    return Number(state?.slowUntil ?? 0) > now;
}

/** Multiplicador del tiempo de cada paso (2 = camina a la mitad de velocidad), igual que el server. */
export const ELEMENTAL_SLOW_WALK_MULTIPLIER = 2;
