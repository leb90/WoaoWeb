export const WOAO_RACE = {
    humano: 1,
    elfo: 2,
    elfoDrow: 3,
    enano: 4,
    gnomo: 5,
    orco: 6,
    vampiro: 7,
    abisario: 8,
    goblin: 9,
    tauros: 10,
    licantropo: 11,
    nomuerto: 12,
} as const;

type Combatant = {
    idRaza?: number;
    hp?: number;
    maxHp?: number;
    mana?: number;
    maxMana?: number;
    lastAttackerId?: string | number;
    lastAttackedAt?: number;
};

type SpellLike = {
    name?: string;
    removerParalisis?: boolean | number;
    paraliza?: boolean | number;
    inmoviliza?: boolean | number;
    subeHp?: number;
};

function raceId(user: Combatant | null | undefined): number {
    return Number(user?.idRaza ?? 0);
}

function chance(percent: number): boolean {
    return Math.random() * 100 < percent;
}

export function getRacialMagicResistPercent(user: Combatant | null | undefined): number {
    const id = raceId(user);
    if (id === WOAO_RACE.humano || id === WOAO_RACE.tauros) {
        return 5;
    }
    return 0;
}

export function getRacialEvasionMultiplier(user: Combatant | null | undefined): number {
    const id = raceId(user);
    let multiplier = 1;
    if (id === WOAO_RACE.elfoDrow) {
        multiplier += 0.03;
    }
    if (id === WOAO_RACE.gnomo) {
        multiplier += 0.1;
    }
    return multiplier;
}

// Balance actual: 10-15% de probabilidad de critico segun Suerte.
function getLicantropoSkillSuerte(user: Combatant | null | undefined): number {
    try {
        const skills = require("./skills");
        return Number(skills.getSkill(user, skills.SKILLS.suerte) ?? 0);
    } catch {
        return 0;
    }
}

export function modifyOutgoingPhysicalDamage(
    user: Combatant | null | undefined,
    damage: number,
    kind: "melee" | "ranged",
): number {
    if (!user || damage <= 0) {
        return damage;
    }

    let next = damage;
    const id = raceId(user);
    const hp = Number(user.hp ?? 0);
    const maxHp = Number(user.maxHp ?? 0);

    if (id === WOAO_RACE.enano && maxHp > 0 && hp / maxHp < 0.33) {
        next = Math.floor(next * 1.5);
    }

    if (id === WOAO_RACE.elfoDrow && kind === "ranged") {
        next = Math.floor(next * 1.02);
    }

    if (id === WOAO_RACE.licantropo) {
        const suerte = getLicantropoSkillSuerte(user);
        const criticalChance = Math.min(15, 10 + Math.floor(suerte / 40) * 2);

        if (chance(criticalChance)) {
            next = next + Math.round(next * 0.2);
        }
    }

    return next;
}

// Balance actual: 20% de probabilidad, recupera 5% de la vida maxima.
export function applyVampireLifestealOnNpcHit(attacker: Combatant | null | undefined): number {
    if (!attacker || raceId(attacker) !== WOAO_RACE.vampiro) {
        return 0;
    }

    if (!chance(20)) {
        return 0;
    }

    const maxHp = Number(attacker.maxHp ?? 0);
    const heal = Math.floor(maxHp * 0.05);
    if (heal <= 0) {
        return 0;
    }

    attacker.hp = Math.min(maxHp, Number(attacker.hp ?? 0) + heal);
    return heal;
}

export function modifyIncomingPhysicalDamage(
    user: Combatant | null | undefined,
    damage: number,
    kind: "melee" | "ranged",
): number {
    if (!user || damage <= 0) {
        return damage;
    }

    let next = damage;
    const id = raceId(user);

    if (id === WOAO_RACE.tauros) {
        next = Math.floor(next * 0.95);
    }

    if (id === WOAO_RACE.nomuerto && kind === "ranged") {
        next = Math.floor(next * 0.9);
    }

    return Math.max(1, next);
}

export function applyLethalSave(user: Combatant | null | undefined, damage: number): number {
    if (!user || damage <= 0) {
        return damage;
    }

    const hp = Number(user.hp ?? 0);
    if (hp > 0 && damage >= hp && raceId(user) === WOAO_RACE.abisario && chance(10)) {
        return Math.max(0, hp - 1);
    }

    return damage;
}

export function applyVampireOnHit(user: Combatant | null | undefined): number {
    if (!user || raceId(user) !== WOAO_RACE.vampiro) {
        return 0;
    }

    if (!chance(8)) {
        return 0;
    }

    const maxHp = Number(user.maxHp ?? 0);
    const heal = Math.floor(maxHp * 0.05);
    if (heal <= 0) {
        return 0;
    }

    user.hp = Math.min(maxHp, Number(user.hp ?? 0) + heal);
    return heal;
}

export function shouldIgnoreHarmfulSpell(user: Combatant | null | undefined): boolean {
    // Evasión de viento del chamán: esquiva el 90 % de los hechizos de daño.
    if ((require("./elementalEffects") as typeof import("./elementalEffects")).rollWindEvasion(user as any)) {
        return true;
    }
    return raceId(user) === WOAO_RACE.orco && chance(10);
}

export function shouldAvoidParalysis(user: Combatant | null | undefined): boolean {
    return raceId(user) === WOAO_RACE.goblin && chance(15);
}

export function getSpellManaCost(user: Combatant | null | undefined, spell: SpellLike | null | undefined, baseMana: number): number {
    if (!user || !spell) {
        return baseMana;
    }

    const id = raceId(user);
    const name = String(spell.name ?? "").toLowerCase();
    const isRemoveParalysis = Boolean(spell.removerParalisis) || name.includes("remover par");
    const isParalyze = Boolean(spell.paraliza) || name.includes("paraliz");

    if (id === WOAO_RACE.humano && isRemoveParalysis) {
        return Math.floor(baseMana * 0.5);
    }

    if (id === WOAO_RACE.nomuerto && isParalyze) {
        return Math.floor(baseMana * 0.5);
    }

    return baseMana;
}

export function applyElfManaRestore(user: Combatant | null | undefined): number {
    if (!user || raceId(user) !== WOAO_RACE.elfo) {
        return 0;
    }

    if (!chance(10)) {
        return 0;
    }

    const maxMana = Number(user.maxMana ?? 0);
    const restore = Math.floor(maxMana * 0.15);
    if (restore <= 0) {
        return 0;
    }

    user.mana = Math.min(maxMana, Number(user.mana ?? 0) + restore);
    return restore;
}

export function applyIncomingHit(
    user: Combatant | null | undefined,
    damage: number,
    kind: "melee" | "ranged" | "magic" | "elemental",
    fromNpc = false,
    attackerId?: string | number,
): number {
    const spellLike = kind === "magic" || kind === "elemental";
    let next = spellLike ? damage : modifyIncomingPhysicalDamage(user, damage, kind);
    try {
        const mounts = require("./mounts") as typeof import("./mounts");
        next = mounts.applyIncomingMountDamage(user as any, next, kind === "elemental" ? "magic" : kind, fromNpc);
    } catch {
        /* mounts optional during early boot */
    }
    // Escudos del chamán (propios y de aliados).
    next = (require("./elementalEffects") as typeof import("./elementalEffects")).applyShieldReduction(user as any, next, kind);
    next = applyLethalSave(user, next);
    if (user) {
        user.hp = Number(user.hp ?? 0) - next;
        applyVampireOnHit(user);
        if (typeof attackerId !== "undefined") {
            user.lastAttackerId = attackerId;
            user.lastAttackedAt = Date.now();
        }
    }
    return next;
}
