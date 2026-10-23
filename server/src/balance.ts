export {};

const vars = require("./vars");

const MAX_LEVEL = 50;
const MAX_EXP_LEVEL = 50;
const LAST_LEGACY_EXP_LEVEL = 46;
const MAX_GOLD = 2147483647;

const DEFAULT_CLASS_PROGRESS: Record<
    number,
    {
        vida: number;
        vidaMin: number;
        vidaMax: number;
        manaInicial: number;
        multMana: number;
        hitPre36: number;
        hitPost36: number;
    }
> = {
    1: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 8.33, multMana: 2.65, hitPre36: 1, hitPost36: 1 },
    2: { vida: 8.5, vidaMin: 7, vidaMax: 10, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    3: { vida: 11, vidaMin: 9, vidaMax: 13, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    4: { vida: 9, vidaMin: 7, vidaMax: 11, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    5: { vida: 10, vidaMin: 8, vidaMax: 12, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    6: { vida: 9, vidaMin: 7, vidaMax: 11, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    7: { vida: 8.5, vidaMin: 7, vidaMax: 10, manaInicial: 2.5, multMana: 2, hitPre36: 2, hitPost36: 2 },
    8: { vida: 10, vidaMin: 8, vidaMax: 12, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    9: { vida: 10, vidaMin: 8, vidaMax: 12, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    10: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    11: { vida: 10, vidaMin: 8, vidaMax: 12, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    12: { vida: 9, vidaMin: 7, vidaMax: 11, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    13: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    14: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    15: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    16: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    17: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
    18: { vida: 10, vidaMin: 8, vidaMax: 12, manaInicial: 2.5, multMana: 1, hitPre36: 3, hitPost36: 2 },
    19: { vida: 8.5, vidaMin: 7, vidaMax: 10, manaInicial: 2.5, multMana: 1, hitPre36: 2, hitPost36: 2 },
    20: { vida: 8, vidaMin: 6, vidaMax: 10, manaInicial: 0, multMana: 0, hitPre36: 3, hitPost36: 2 },
    21: { vida: 9, vidaMin: 7, vidaMax: 11, manaInicial: 0, multMana: 0, hitPre36: 2, hitPost36: 2 },
};

const clampLevel = (level: number): number => Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)));
const clampGold = (gold: number): number => Math.max(0, Math.min(MAX_GOLD, Math.floor(Number(gold) || 0)));

const getClassProgress = () =>
    vars.classProgress && Object.keys(vars.classProgress).length > 0 ? vars.classProgress : DEFAULT_CLASS_PROGRESS;

type HpGainRange = { min: number; max: number; average: number };

const getHpGainRange = (classId: number, constitucion: number): HpGainRange => {
    const classProgress = getClassProgress()[classId] ?? DEFAULT_CLASS_PROGRESS[1];
    const baseAverage = Number(classProgress.vida) || 1;
    const baseMin = Number(classProgress.vidaMin ?? Math.floor(baseAverage - 2));
    const baseMax = Number(classProgress.vidaMax ?? Math.ceil(baseAverage + 2));
    const average = (baseMin + baseMax) / 2 + (Number(constitucion) - 21) * 0.5;
    const halfWidth = Math.max(0, (baseMax - baseMin) / 2);
    const min = Math.max(1, Math.floor(average - halfWidth));
    const max = Math.max(min, Math.ceil(average + halfWidth));

    return { min, max, average: (min + max) / 2 };
};

const getHpAveragePerLevel = (classId: number, constitucion: number): number =>
    getHpGainRange(classId, constitucion).average;

const rollHpGain = (classId: number, constitucion: number, random = Math.random): number => {
    const range = getHpGainRange(classId, constitucion);
    return Math.floor(random() * (range.max - range.min + 1)) + range.min;
};

const getMaxHpForLevel = (classId: number, constitucion: number, level: number): number => {
    const safeLevel = clampLevel(level);
    const total = constitucion + getHpAveragePerLevel(classId, constitucion) * (safeLevel - 1);
    return Math.round(total);
};

const getMinHpForLevel = (classId: number, constitucion: number, level: number): number => {
    const safeLevel = clampLevel(level);
    return Math.round(constitucion + getHpGainRange(classId, constitucion).min * (safeLevel - 1));
};

const getMaxRolledHpForLevel = (classId: number, constitucion: number, level: number): number => {
    const safeLevel = clampLevel(level);
    return Math.round(constitucion + getHpGainRange(classId, constitucion).max * (safeLevel - 1));
};

const getHpAverageDelta = (classId: number, constitucion: number): number => {
    const classProgress = getClassProgress()[classId] ?? DEFAULT_CLASS_PROGRESS[1];
    const classAverage = (Number(classProgress.vidaMin) + Number(classProgress.vidaMax)) / 2;
    return getHpAveragePerLevel(classId, constitucion) - classAverage;
};

const getMaxManaForLevel = (classId: number, inteligencia: number, level: number): number => {
    const safeLevel = clampLevel(level);
    const classProgress = getClassProgress()[classId] ?? DEFAULT_CLASS_PROGRESS[1];
    const total = inteligencia * classProgress.manaInicial + classProgress.multMana * inteligencia * (safeLevel - 1);
    return Math.max(0, Math.round(total));
};

const MAX_HAMBRE = 100;
const MAX_SED = 100;

const getMaxStaForLevel = (constitucion: number, level: number): number => {
    const safeLevel = clampLevel(level);
    return Math.max(20, Math.round(20 + Number(constitucion || 0) + (safeLevel - 1) * 5));
};

const getHitModifierForLevel = (classId: number, level: number): number => {
    const safeLevel = clampLevel(level);
    const classProgress = getClassProgress()[classId] ?? DEFAULT_CLASS_PROGRESS[1];

    if (safeLevel <= 1) {
        return 0;
    }

    if (safeLevel <= 36) {
        return (safeLevel - 1) * classProgress.hitPre36;
    }

    return 35 * classProgress.hitPre36 + (safeLevel - 36) * classProgress.hitPost36;
};

const getMinHitForLevel = (classId: number, level: number): number => 1 + getHitModifierForLevel(classId, level);
const getMaxHitForLevel = (classId: number, level: number): number => 2 + getHitModifierForLevel(classId, level);

const getLegacyExpNextLevelForLevel = (level: number): number => {
    const safeLevel = Math.max(1, Math.min(MAX_EXP_LEVEL, Math.floor(level)));
    const expCurveLevel = Math.min(safeLevel, LAST_LEGACY_EXP_LEVEL);
    let expNextLevel = 300;

    for (let currentLevel = 2; currentLevel <= expCurveLevel; currentLevel += 1) {
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
};

module.exports = {
    MAX_LEVEL,
    MAX_EXP_LEVEL,
    clampLevel,
    clampGold,
    getHpGainRange,
    getHpAveragePerLevel,
    rollHpGain,
    getMaxHpForLevel,
    getMinHpForLevel,
    getMaxRolledHpForLevel,
    getHpAverageDelta,
    getMaxManaForLevel,
    getMaxStaForLevel,
    MAX_HAMBRE,
    MAX_SED,
    getMinHitForLevel,
    getMaxHitForLevel,
    getLegacyExpNextLevelForLevel,
};
