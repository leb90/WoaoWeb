export const CHARACTER_CLASSES = [
    "mago",
    "clerigo",
    "guerrero",
    "asesino",
    "ladron",
    "bardo",
    "druida",
    "bandido",
    "paladin",
    "cazador",
    "pescador",
    "herrero",
    "lenador",
    "minero",
    "carpintero",
    "pirata",
    "ermitano",
    "arquero",
    "domador",
] as const;
export const CHARACTER_RACES = [
    "humano",
    "elfo",
    "elfoDrow",
    "enano",
    "gnomo",
    "orco",
    "vampiro",
    "abisario",
    "goblin",
    "tauros",
    "licantropo",
    "nomuerto",
] as const;
export const CHARACTER_GENDERS = ["male", "female"] as const;

export type CharacterClassKey = (typeof CHARACTER_CLASSES)[number];
export type RaceKey = (typeof CHARACTER_RACES)[number];
export type GenderKey = (typeof CHARACTER_GENDERS)[number];

type RaceGenderConfig = {
    bodyId: number;
    startHeadId: number;
    endHeadId: number;
};

type RaceBonus = {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
    carisma: number;
    constitucion: number;
};

type RaceOption = {
    key: RaceKey;
    baseStats: RaceBonus;
    genders: Record<GenderKey, RaceGenderConfig>;
};

const BASE_STAT = 18;

function statsFromBonus(bonus: RaceBonus): RaceBonus {
    return {
        fuerza: BASE_STAT + bonus.fuerza,
        agilidad: BASE_STAT + bonus.agilidad,
        inteligencia: BASE_STAT + bonus.inteligencia,
        carisma: BASE_STAT + bonus.carisma,
        constitucion: BASE_STAT + bonus.constitucion,
    };
}

type DerivedCreationStats = {
    fuerza: number;
    agilidad: number;
    inteligencia: number;
    carisma: number;
    constitucion: number;
    hp: number;
    mana: number;
    minHit: number;
    maxHit: number;
    expNextLevel: number;
};

type ClassProgress = {
    vida: number;
    manaInicial: number;
    multMana: number;
    hitPre36: number;
    hitPost36: number;
};

export const CLASS_ID_MAP: Record<CharacterClassKey, number> = {
    mago: 1,
    clerigo: 2,
    guerrero: 3,
    asesino: 4,
    ladron: 5,
    bardo: 6,
    druida: 7,
    paladin: 8,
    cazador: 9,
    bandido: 12,
    pescador: 13,
    herrero: 14,
    lenador: 15,
    minero: 16,
    carpintero: 17,
    pirata: 18,
    ermitano: 19,
    arquero: 20,
    domador: 21,
};

export const RACE_ID_MAP: Record<RaceKey, number> = {
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
};

const ALIANZA_RACES = new Set<RaceKey>([
    "humano",
    "elfo",
    "enano",
    "gnomo",
    "tauros",
    "abisario",
]);

export function getFactionForRace(raceKey: RaceKey): "armada" | "caos" {
    return ALIANZA_RACES.has(raceKey) ? "armada" : "caos";
}

export const GENDER_ID_MAP: Record<GenderKey, number> = {
    male: 1,
    female: 2,
};

const classProgressById: Record<number, ClassProgress> = {
    1: {
        vida: 7.5,
        manaInicial: 8.33,
        multMana: 2.65,
        hitPre36: 1,
        hitPost36: 1,
    },
    2: { vida: 8.5, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    3: { vida: 10.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    4: { vida: 9, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    5: { vida: 8, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    6: { vida: 8.5, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    7: { vida: 8.5, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    8: { vida: 10, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    9: { vida: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    10: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    11: { vida: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    12: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    13: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    14: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    15: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    16: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    17: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    18: { vida: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    19: { vida: 8.5, manaInicial: 2.5, multMana: 1, hitPre36: 2, hitPost36: 2 },
    20: { vida: 8.5, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    21: { vida: 9, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
};

export const MAX_LEVEL = 50;
export const MAX_EXP_LEVEL = 50;
const LAST_LEGACY_EXP_LEVEL = 46;

export function clampLevel(level: number): number {
    return Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
}

export function getLegacyExpNextLevelForLevel(level: number): number {
    const safeLevel = Math.max(1, Math.min(MAX_EXP_LEVEL, Math.floor(level)));
    const expCurveLevel = Math.min(safeLevel, LAST_LEGACY_EXP_LEVEL);
    let expNextLevel = 300;

    for (
        let currentLevel = 2;
        currentLevel <= expCurveLevel;
        currentLevel += 1
    ) {
        if (currentLevel < 15) {
            expNextLevel = Math.floor(expNextLevel * 1.4);
        } else if (currentLevel < 21) {
            expNextLevel = Math.floor(expNextLevel * 1.35);
        } else if (currentLevel < 33) {
            expNextLevel = Math.floor(expNextLevel * 1.3);
        } else if (currentLevel < 41) {
            expNextLevel = Math.floor(expNextLevel * 1.225);
        } else {
            expNextLevel = Math.floor(expNextLevel * 1.25);
        }
    }

    return expNextLevel;
}

export function getHitModifierForLevel(classId: number, level: number): number {
    const safeLevel = clampLevel(level);
    const classProgress = classProgressById[classId] ?? classProgressById[3];

    if (safeLevel <= 1) {
        return 0;
    }

    if (safeLevel <= 36) {
        return (safeLevel - 1) * classProgress.hitPre36;
    }

    return (
        35 * classProgress.hitPre36 + (safeLevel - 36) * classProgress.hitPost36
    );
}

export function getMinHitForLevel(classId: number, level: number): number {
    return 1 + getHitModifierForLevel(classId, level);
}

export function getMaxHitForLevel(classId: number, level: number): number {
    return 2 + getHitModifierForLevel(classId, level);
}

export function getMaxHpForLevel(
    classId: number,
    constitucion: number,
    level: number,
): number {
    const safeLevel = clampLevel(level);
    const classProgress = classProgressById[classId] ?? classProgressById[3];
    const total =
        constitucion +
        (classProgress.vida - (21 - constitucion) * 0.5) * (safeLevel - 1);
    return Math.round(total);
}

export function getMaxManaForLevel(
    classId: number,
    inteligencia: number,
    level: number,
): number {
    const safeLevel = clampLevel(level);
    const classProgress = classProgressById[classId] ?? classProgressById[3];
    const total =
        inteligencia * classProgress.manaInicial +
        classProgress.multMana * inteligencia * (safeLevel - 1);
    return Math.max(0, Math.round(total));
}

const raceOptions: Record<RaceKey, RaceOption> = {
    humano: {
        key: "humano",
        baseStats: statsFromBonus({ fuerza: 2, agilidad: 1, inteligencia: 1, carisma: 0, constitucion: 2 }),
        genders: {
            male: { bodyId: 21, startHeadId: 3, endHeadId: 53 },
            female: { bodyId: 39, startHeadId: 70, endHeadId: 82 },
        },
    },
    elfo: {
        key: "elfo",
        baseStats: statsFromBonus({ fuerza: -1, agilidad: 3, inteligencia: 2, carisma: 2, constitucion: 1 }),
        genders: {
            male: { bodyId: 21, startHeadId: 101, endHeadId: 119 },
            female: { bodyId: 39, startHeadId: 170, endHeadId: 180 },
        },
    },
    elfoDrow: {
        key: "elfoDrow",
        baseStats: statsFromBonus({ fuerza: 2, agilidad: 3, inteligencia: -1, carisma: 0, constitucion: 2 }),
        genders: {
            male: { bodyId: 32, startHeadId: 201, endHeadId: 216 },
            female: { bodyId: 40, startHeadId: 270, endHeadId: 277 },
        },
    },
    enano: {
        key: "enano",
        baseStats: statsFromBonus({ fuerza: 3, agilidad: 0, inteligencia: -2, carisma: 0, constitucion: 3 }),
        genders: {
            male: { bodyId: 53, startHeadId: 401, endHeadId: 411 },
            female: { bodyId: 60, startHeadId: 470, endHeadId: 476 },
        },
    },
    gnomo: {
        key: "gnomo",
        baseStats: statsFromBonus({ fuerza: -2, agilidad: 3, inteligencia: 4, carisma: 0, constitucion: 0 }),
        genders: {
            male: { bodyId: 53, startHeadId: 301, endHeadId: 315 },
            female: { bodyId: 60, startHeadId: 370, endHeadId: 373 },
        },
    },
    orco: {
        key: "orco",
        baseStats: statsFromBonus({ fuerza: 3, agilidad: 0, inteligencia: -2, carisma: 0, constitucion: 3 }),
        genders: {
            male: { bodyId: 215, startHeadId: 601, endHeadId: 606 },
            female: { bodyId: 217, startHeadId: 607, endHeadId: 609 },
        },
    },
    vampiro: {
        key: "vampiro",
        baseStats: statsFromBonus({ fuerza: -1, agilidad: 3, inteligencia: 2, carisma: 2, constitucion: 1 }),
        genders: {
            male: { bodyId: 32, startHeadId: 505, endHeadId: 512 },
            female: { bodyId: 40, startHeadId: 501, endHeadId: 503 },
        },
    },
    abisario: {
        key: "abisario",
        baseStats: statsFromBonus({ fuerza: 3, agilidad: 1, inteligencia: 0, carisma: 0, constitucion: 1 }),
        genders: {
            male: { bodyId: 488, startHeadId: 801, endHeadId: 804 },
            female: { bodyId: 486, startHeadId: 851, endHeadId: 853 },
        },
    },
    goblin: {
        key: "goblin",
        baseStats: statsFromBonus({ fuerza: -2, agilidad: 3, inteligencia: 4, carisma: 0, constitucion: 0 }),
        genders: {
            male: { bodyId: 178, startHeadId: 705, endHeadId: 712 },
            female: { bodyId: 212, startHeadId: 701, endHeadId: 704 },
        },
    },
    tauros: {
        key: "tauros",
        baseStats: statsFromBonus({ fuerza: 2, agilidad: 3, inteligencia: -1, carisma: 0, constitucion: 2 }),
        genders: {
            male: { bodyId: 529, startHeadId: 920, endHeadId: 923 },
            female: { bodyId: 528, startHeadId: 910, endHeadId: 913 },
        },
    },
    licantropo: {
        key: "licantropo",
        baseStats: statsFromBonus({ fuerza: 3, agilidad: 1, inteligencia: 0, carisma: 0, constitucion: 1 }),
        genders: {
            male: { bodyId: 531, startHeadId: 900, endHeadId: 903 },
            female: { bodyId: 530, startHeadId: 890, endHeadId: 893 },
        },
    },
    nomuerto: {
        key: "nomuerto",
        baseStats: statsFromBonus({ fuerza: 2, agilidad: 1, inteligencia: 1, carisma: 0, constitucion: 2 }),
        genders: {
            male: { bodyId: 527, startHeadId: 860, endHeadId: 863 },
            female: { bodyId: 526, startHeadId: 880, endHeadId: 883 },
        },
    },
};

export function getBaseStats(
    characterClassKey: CharacterClassKey,
    raceKey: RaceKey,
): DerivedCreationStats {
    const classId = CLASS_ID_MAP[characterClassKey];
    const raceOption = raceOptions[raceKey];
    const { fuerza, agilidad, inteligencia, carisma, constitucion } =
        raceOption.baseStats;

    return {
        fuerza,
        agilidad,
        inteligencia,
        carisma,
        constitucion,
        hp: getMaxHpForLevel(classId, constitucion, 1),
        mana: getMaxManaForLevel(classId, inteligencia, 1),
        minHit: getMinHitForLevel(classId, 1),
        maxHit: getMaxHitForLevel(classId, 1),
        expNextLevel: getLegacyExpNextLevelForLevel(1),
    };
}

export function getAllowedAppearance(
    raceKey: RaceKey,
    genderKey: GenderKey,
): RaceGenderConfig {
    return raceOptions[raceKey].genders[genderKey];
}

export function isValidHeadId(
    raceKey: RaceKey,
    genderKey: GenderKey,
    headId: number,
): boolean {
    const appearance = getAllowedAppearance(raceKey, genderKey);
    return headId >= appearance.startHeadId && headId <= appearance.endHeadId;
}
