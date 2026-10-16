export const CRAFTING_RECIPE_DROP_RULES = [
    { level: 10, minNpcMaxHpExclusive: 300, chancePercent: 5 },
    { level: 20, minNpcMaxHpExclusive: 1_500, chancePercent: 2 },
    { level: 30, minNpcMaxHpExclusive: 4_000, chancePercent: 1 },
    { level: 40, minNpcMaxHpExclusive: 10_000, chancePercent: 0.5 },
    { level: 50, minNpcMaxHpExclusive: 25_000, chancePercent: 0.1 },
] as const;

export function getCraftingRecipeDropRule(level: number) {
    return CRAFTING_RECIPE_DROP_RULES.find((rule) => rule.level === level);
}
