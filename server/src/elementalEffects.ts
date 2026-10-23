// Efectos del Chamán elemental (docs/CHAMAN_ELEMENTAL.md): escudos propios y para aliados, Evasión de viento,
// silencios, lentitud y quemadura. Acá solo viven las reglas y el estado (`user.elemental`); los paquetes,
// el daño por tiempo y las piedras del escudo de energía los maneja game.ts, igual que el desangrado.
export {};

export const SELF_SHIELD_MS = 30_000;
export const SELF_SHIELD_REDUCTION = 0.5;
export const ALLY_SHIELD_MS = 60_000;
export const ALLY_SHIELD_REDUCTION = 0.05;
export const WIND_EVASION_MS = 10_000;
export const WIND_EVASION_COOLDOWN_MS = 30_000;
export const WIND_EVASION_DODGE_CHANCE = 0.9;
export const SLOW_WALK_MULTIPLIER = 2;
export const BURN_TICK_MS = 3_000;
export const ENERGY_STONE_INTERVAL_MS = 2_000;
export const ENERGY_STONE_RANGE_TILES = 4;
// Daño base de cada piedra: un tercio de Llama de Dragón (60-65). Después suman nivel y equipo, como un hechizo.
export const ENERGY_STONE_MIN_DAMAGE = 20;
export const ENERGY_STONE_MAX_DAMAGE = 22;
// Las piedras solo van contra quien el chamán atacó hace poco.
export const ENERGY_STONE_TARGET_MEMORY_MS = 15_000;

export type SelfShieldKind = "magico" | "fisico" | "energia";
export type AllyShieldKind = "magico" | "fisico";
export type IncomingDamageKind = "melee" | "ranged" | "magic" | "elemental";
export type BlockedAction = "melee" | "ranged" | "spell" | "support";
export type SilenceKind = "agua" | "rayo";

export type ElementalTarget = { id: string | number; isNpc: boolean; at: number };

export type ElementalState = {
    slowUntil?: number;
    magicSilenceUntil?: number;
    fullSilenceUntil?: number;
    fullSilenceImmuneUntil?: number;
    fullSilenceKind?: SilenceKind;
    evasionUntil?: number;
    evasionCooldownUntil?: number;
    selfShield?: { kind: SelfShieldKind; until: number; nextStoneAt: number } | null;
    allyMagicUntil?: number;
    allyPhysicalUntil?: number;
    burn?: { damage: number; attackerId: string | number; nextTickAt: number } | null;
    lastTarget?: ElementalTarget | null;
};

type Holder = { elemental?: ElementalState | null };

export type ElementalPayload = {
    slowMs: number;
    magicSilenceMs: number;
    fullSilenceMs: number;
    silenceKind: SilenceKind | null;
    evasionMs: number;
    evasionCooldownMs: number;
    shield: SelfShieldKind | null;
    shieldMs: number;
    allyMagicMs: number;
    allyPhysicalMs: number;
    burning: boolean;
};

// Campos nuevos de spells.json (ver docs/CHAMAN_ELEMENTAL.md):
//   elemental 1          daño elemental y hechizo exclusivo del chamán
//   ralentiza ms         lentitud (Descarga eléctrica)
//   silencioMagia ms     sin hechizos (Ráfaga de viento)
//   silencioTotal ms     sin atacar ni lanzar (Prisión de agua, Rayo Eléctrico)
//   silencioRespiro ms   el silencio total no se acumula y deja ese respiro al terminar (Rayo Eléctrico)
//   silencioTipo tipo    "agua" | "rayo": qué aura ve el resto mientras dura (esfera de agua o chispas)
//   quema n              quemadura de n por golpe (Rayo de Fuego)
//   curaEfectos 1        cura veneno y quemadura (Curar efectos)
//   escudoPropio tipo    "magico" | "fisico" | "energia", solo sobre uno mismo
//   escudoAliado tipo    "magico" | "fisico", sobre cualquier jugador
//   evasionViento 1      Evasión de viento, solo sobre uno mismo
type SpellFlags = Record<string, unknown> | undefined;

export function isElementalSpell(spell: SpellFlags) {
    return Number(spell?.elemental ?? 0) === 1;
}

export function isSelfOnlySpell(spell: SpellFlags) {
    return Boolean(spell?.escudoPropio) || Number(spell?.evasionViento ?? 0) === 1;
}

export function hasHostileElementalEffect(spell: SpellFlags) {
    return ["ralentiza", "silencioMagia", "silencioTotal", "quema"].some((key) => Number(spell?.[key] ?? 0) > 0);
}

export function hasSupportElementalEffect(spell: SpellFlags) {
    return isSelfOnlySpell(spell) || Boolean(spell?.escudoAliado) || Number(spell?.curaEfectos ?? 0) === 1;
}

const remaining = (until: number | undefined, now: number) => Math.max(0, Math.round(Number(until ?? 0) - now));
const active = (until: number | undefined, now: number) => Number(until ?? 0) > now;

function state(user: Holder): ElementalState {
    if (!user.elemental) user.elemental = {};
    return user.elemental;
}

export function isSlowed(user: Holder | undefined, now = Date.now()) {
    return active(user?.elemental?.slowUntil, now);
}

export function isWindEvading(user: Holder | undefined, now = Date.now()) {
    return active(user?.elemental?.evasionUntil, now);
}

export function getSelfShield(user: Holder | undefined, now = Date.now()): SelfShieldKind | null {
    const shield = user?.elemental?.selfShield;
    return shield && shield.until > now ? shield.kind : null;
}

/** Multiplica el tiempo de cada paso: 2 = camina a la mitad de velocidad. */
export function getWalkStepMultiplier(user: Holder | undefined, now = Date.now()) {
    return isSlowed(user, now) ? SLOW_WALK_MULTIPLIER : 1;
}

/** Escudos que frenan el daño que entra. El físico frena golpes y flechas; el mágico, magia y daño elemental. */
export function applyShieldReduction(user: Holder | undefined, damage: number, kind: IncomingDamageKind, now = Date.now()) {
    const effects = user?.elemental;
    if (!effects || damage <= 0) return damage;

    const physical = kind === "melee" || kind === "ranged";
    let factor = 1;
    const shield = getSelfShield(user, now);
    if ((physical && shield === "fisico") || (!physical && shield === "magico")) factor -= SELF_SHIELD_REDUCTION;
    if (physical && active(effects.allyPhysicalUntil, now)) factor -= ALLY_SHIELD_REDUCTION;
    if (!physical && active(effects.allyMagicUntil, now)) factor -= ALLY_SHIELD_REDUCTION;
    if (factor >= 1) return damage;
    return Math.max(1, Math.floor(damage * factor));
}

/** Evasión de viento: esquiva el 90 % de todo lo que le pegan (golpes, flechas y hechizos de daño). */
export function rollWindEvasion(user: Holder | undefined, now = Date.now(), random = Math.random) {
    return isWindEvading(user, now) && random() < WIND_EVASION_DODGE_CHANCE;
}

/** Mensaje si el personaje no puede hacer esa acción por un efecto del chamán; null si puede. */
export function getActionBlockReason(user: Holder | undefined, action: BlockedAction, now = Date.now()): string | null {
    const effects = user?.elemental;
    if (!effects) return null;
    if (active(effects.fullSilenceUntil, now)) {
        return `Estás silenciado: no puedes atacar ni lanzar hechizos por ${Math.ceil(remaining(effects.fullSilenceUntil, now) / 1000)} s.`;
    }
    // La evasión no deja atacar de ninguna forma, pero sí curarse o ponerse un escudo.
    if (action !== "support" && active(effects.evasionUntil, now)) {
        return "Durante la Evasión de viento no puedes atacar.";
    }
    if ((action === "spell" || action === "support") && active(effects.magicSilenceUntil, now)) {
        return `El viento te quitó la voz: no puedes lanzar hechizos por ${Math.ceil(remaining(effects.magicSilenceUntil, now) / 1000)} s.`;
    }
    return null;
}

/** La Evasión de viento no deja hacerse invisible ni ocultarse. */
export function canBecomeInvisible(user: Holder | undefined, now = Date.now()) {
    return !isWindEvading(user, now);
}

export function applySlow(user: Holder, ms: number, now = Date.now()) {
    const effects = state(user);
    effects.slowUntil = Math.max(Number(effects.slowUntil ?? 0), now + ms);
}

export function applyMagicSilence(user: Holder, ms: number, now = Date.now()) {
    const effects = state(user);
    effects.magicSilenceUntil = Math.max(Number(effects.magicSilenceUntil ?? 0), now + ms);
}

/**
 * Silencio total (no ataca ni lanza). Con `immunityMs` no se acumula: mientras dura no se renueva y, cuando
 * termina, durante ese tiempo no vuelve a entrar (Rayo Eléctrico: 3 s y 1 s de respiro).
 */
export function applyFullSilence(
    user: Holder,
    ms: number,
    now = Date.now(),
    immunityMs = 0,
    kind: SilenceKind = "agua",
): "applied" | "active" | "immune" {
    const effects = state(user);
    if (immunityMs > 0) {
        if (active(effects.fullSilenceUntil, now)) return "active";
        if (active(effects.fullSilenceImmuneUntil, now)) return "immune";
        effects.fullSilenceUntil = now + ms;
        effects.fullSilenceImmuneUntil = now + ms + immunityMs;
        effects.fullSilenceKind = kind;
        return "applied";
    }
    effects.fullSilenceUntil = Math.max(Number(effects.fullSilenceUntil ?? 0), now + ms);
    effects.fullSilenceKind = kind;
    return "applied";
}

/** Quemadura del Rayo de Fuego: como el veneno, pega cada 3 s hasta que se cura o muere. */
export function startBurn(user: Holder, damage: number, attackerId: string | number, now = Date.now()) {
    state(user).burn = { damage: Math.max(1, Math.floor(damage)), attackerId, nextTickAt: now + BURN_TICK_MS };
}

export function stopBurn(user: Holder | undefined) {
    if (!user?.elemental?.burn) return false;
    user.elemental.burn = null;
    return true;
}

export function setSelfShield(user: Holder, kind: SelfShieldKind, now = Date.now()) {
    // Uno a la vez: el nuevo reemplaza al anterior.
    state(user).selfShield = { kind, until: now + SELF_SHIELD_MS, nextStoneAt: now + ENERGY_STONE_INTERVAL_MS };
}

export function setAllyShield(user: Holder, kind: AllyShieldKind, now = Date.now()) {
    const effects = state(user);
    if (kind === "magico") effects.allyMagicUntil = now + ALLY_SHIELD_MS;
    else effects.allyPhysicalUntil = now + ALLY_SHIELD_MS;
}

/** Devuelve 0 si arrancó; si no, los ms que faltan para poder usarla de nuevo. */
export function startWindEvasion(user: Holder, now = Date.now()) {
    const effects = state(user);
    if (active(effects.evasionCooldownUntil, now)) return remaining(effects.evasionCooldownUntil, now);
    effects.evasionUntil = now + WIND_EVASION_MS;
    effects.evasionCooldownUntil = now + WIND_EVASION_COOLDOWN_MS;
    return 0;
}

export function rememberTarget(user: Holder | undefined, id: string | number, isNpc: boolean, now = Date.now()) {
    if (!user || !getSelfShield(user, now)) return;
    state(user).lastTarget = { id, isNpc, at: now };
}

export function getStoneTarget(user: Holder | undefined, now = Date.now()) {
    const target = user?.elemental?.lastTarget;
    if (!target || now - target.at > ENERGY_STONE_TARGET_MEMORY_MS) return null;
    return target;
}

/** Al morir se pierde todo menos el enfriamiento de la evasión. */
export function clearOnDeath(user: Holder | undefined) {
    if (!user?.elemental) return;
    const cooldown = user.elemental.evasionCooldownUntil;
    user.elemental = cooldown ? { evasionCooldownUntil: cooldown } : null;
}

/** Borra lo vencido. Devuelve true si cambió algo que el cliente muestra. */
export function expire(user: Holder | undefined, now = Date.now()) {
    const effects = user?.elemental;
    if (!effects) return false;
    let changed = false;
    for (const key of ["slowUntil", "magicSilenceUntil", "fullSilenceUntil", "evasionUntil", "allyMagicUntil", "allyPhysicalUntil"] as const) {
        if (effects[key] && !active(effects[key], now)) {
            effects[key] = undefined;
            changed = true;
        }
    }
    if (effects.selfShield && effects.selfShield.until <= now) {
        effects.selfShield = null;
        effects.lastTarget = null;
        changed = true;
    }
    return changed;
}

export function hasVisibleEffects(user: Holder | undefined, now = Date.now()) {
    const payload = buildPayload(user, now);
    return Boolean(
        payload.slowMs || payload.magicSilenceMs || payload.fullSilenceMs || payload.evasionMs || payload.shield ||
            payload.allyMagicMs || payload.allyPhysicalMs || payload.burning,
    );
}

export function buildPayload(user: Holder | undefined, now = Date.now()): ElementalPayload {
    const effects = user?.elemental ?? {};
    const shield = getSelfShield(user, now);
    return {
        slowMs: remaining(effects.slowUntil, now),
        magicSilenceMs: remaining(effects.magicSilenceUntil, now),
        fullSilenceMs: remaining(effects.fullSilenceUntil, now),
        silenceKind: active(effects.fullSilenceUntil, now) ? (effects.fullSilenceKind ?? "agua") : null,
        evasionMs: remaining(effects.evasionUntil, now),
        evasionCooldownMs: remaining(effects.evasionCooldownUntil, now),
        shield,
        shieldMs: shield ? remaining(effects.selfShield?.until, now) : 0,
        allyMagicMs: remaining(effects.allyMagicUntil, now),
        allyPhysicalMs: remaining(effects.allyPhysicalUntil, now),
        burning: Boolean(effects.burn),
    };
}

module.exports = {
    SELF_SHIELD_MS,
    SELF_SHIELD_REDUCTION,
    ALLY_SHIELD_MS,
    ALLY_SHIELD_REDUCTION,
    WIND_EVASION_MS,
    WIND_EVASION_COOLDOWN_MS,
    WIND_EVASION_DODGE_CHANCE,
    SLOW_WALK_MULTIPLIER,
    BURN_TICK_MS,
    ENERGY_STONE_INTERVAL_MS,
    ENERGY_STONE_RANGE_TILES,
    ENERGY_STONE_MIN_DAMAGE,
    ENERGY_STONE_MAX_DAMAGE,
    ENERGY_STONE_TARGET_MEMORY_MS,
    isElementalSpell,
    isSelfOnlySpell,
    hasHostileElementalEffect,
    hasSupportElementalEffect,
    isSlowed,
    isWindEvading,
    getSelfShield,
    getWalkStepMultiplier,
    applyShieldReduction,
    rollWindEvasion,
    getActionBlockReason,
    canBecomeInvisible,
    applySlow,
    applyMagicSilence,
    applyFullSilence,
    startBurn,
    stopBurn,
    setSelfShield,
    setAllyShield,
    startWindEvasion,
    rememberTarget,
    getStoneTarget,
    clearOnDeath,
    expire,
    hasVisibleEffects,
    buildPayload,
};
