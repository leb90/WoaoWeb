export const MAGIC_EQUIPMENT_FLAT_CAP = 90;
export const MAGIC_EQUIPMENT_FLAT_EFFECTIVENESS = 0.5;
export const MAGIC_EQUIPMENT_PERCENT_CAP = 15;
export const MAGIC_PENETRATION_CAP = 20;
export const MAGIC_RESISTANCE_CAP = 60;
export const PLAYER_HEAL_CAP = 120;
export const NORMAL_HEALTH_POTION_RECOVERY = 30;
export const NORMAL_MANA_POTION_MAX_ROLL = 20;

type MagicEquipmentItem = {
    magicDamageBonus?: number;
    magicDamagePercent?: number;
    magicPenetration?: number;
} | null;

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, Number(value) || 0));
}

export function getMagicEquipmentTotals(items: MagicEquipmentItem[]) {
    let flatDamage = 0;
    let percentDamage = 0;
    let penetration = 0;

    for (const item of items) {
        if (!item) {
            continue;
        }

        flatDamage += Number(item.magicDamageBonus ?? 0);
        percentDamage += Number(item.magicDamagePercent ?? 0);
        penetration += Number(item.magicPenetration ?? 0);
    }

    return {
        flatDamage: clamp(flatDamage, 0, MAGIC_EQUIPMENT_FLAT_CAP),
        percentDamage: clamp(percentDamage, 0, MAGIC_EQUIPMENT_PERCENT_CAP),
        penetration: clamp(penetration, 0, MAGIC_PENETRATION_CAP),
    };
}

export function calculateMagicDamage(
    baseDamage: number,
    level: number,
    classModifier: number,
    equipment: ReturnType<typeof getMagicEquipmentTotals>,
): number {
    const levelScaled = baseDamage + Math.round((baseDamage * (2 * Math.max(1, level))) / 100);
    const effectiveFlatDamage = Math.round(equipment.flatDamage * MAGIC_EQUIPMENT_FLAT_EFFECTIVENESS);
    const withEquipment = levelScaled + effectiveFlatDamage;
    const withPercent = withEquipment + Math.round((withEquipment * equipment.percentDamage) / 100);
    return Math.max(0, Math.floor(withPercent * Math.max(0, classModifier)));
}

export function clampMagicResistance(percent: number): number {
    return clamp(percent, 0, MAGIC_RESISTANCE_CAP);
}

export function getPlayerHealingAmount(baseHealing: number): number {
    return Math.max(1, Math.min(PLAYER_HEAL_CAP, Math.floor(Number(baseHealing) || 0)));
}

export function getHealthPotionRecovery(
    maxHealth: number,
    rolledItemRecovery: number,
    percentage = 0,
): number {
    const declaredRecovery = percentage > 0
        ? Math.floor((Math.max(0, maxHealth) * percentage) / 100)
        : Math.floor(Number(rolledItemRecovery) || 0);

    return Math.max(1, Math.min(NORMAL_HEALTH_POTION_RECOVERY, declaredRecovery));
}

export function getManaPotionRecovery(
    maxMana: number,
    level: number,
    rolledItemRecovery: number,
    percentage = 0,
): number {
    const safeLevel = Math.max(1, Math.floor(level));
    const standardRecovery = Math.floor(Math.max(0, maxMana) * 0.04 + safeLevel / 2 + 40 / safeLevel);
    const declaredRecovery = percentage > 0
        ? Math.floor((Math.max(0, maxMana) * percentage) / 100)
        : Math.floor(Number(rolledItemRecovery) || 0);
    const normalPotionRoll = Math.min(NORMAL_MANA_POTION_MAX_ROLL, declaredRecovery);

    return Math.max(1, standardRecovery, normalPotionRoll);
}
