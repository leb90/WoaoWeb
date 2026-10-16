export type WikiNpcReference = {
    npcId: number;
    npcName: string;
    quantity: number;
    chancePercent?: number;
};

export type WikiItemReference = {
    itemId: number;
    itemName: string;
    quantity: number;
    chancePercent?: number;
};

export type WikiRecipeReference = {
    recipeId: number;
    itemId: number;
    itemName: string;
    level: number;
};

export type WikiObject = {
    id: number;
    name: string;
    description: string;
    grhIndex: number;
    objType: number;
    objTypeLabel: string;
    category: string;
    value: number;
    minHit: number;
    maxHit: number;
    minDef: number;
    maxDef: number;
    minDefMag: number;
    maxDefMag: number;
    magicResistance: number;
    minSkill: number;
    tier: number;
    newbie: boolean;
    blockedClasses: number[];
    spellId: number;
    soldBy: WikiNpcReference[];
    droppedBy: WikiNpcReference[];
    craftedBy: WikiRecipeReference[];
    usedInRecipes: WikiRecipeReference[];
    searchIndex: string;
};

export type WikiNpc = {
    id: number;
    name: string;
    npcType: number;
    npcTypeLabel: string;
    description: string;
    headId: number;
    bodyId: number;
    maxHp: number;
    expReward: number;
    goldReward: number;
    minHit: number;
    maxHit: number;
    defense: number;
    expPerHp: number | null;
    isCombatNpc: boolean;
    maps: Array<{ mapId: number; mapName: string; spawns: number }>;
    sells: WikiItemReference[];
    drops: WikiItemReference[];
    totalSpawns: number;
    searchIndex: string;
};

export type WikiSpell = {
    id: number;
    name: string;
    description: string;
    type: number;
    typeLabel: string;
    minSkill: number;
    manaRequired: number;
    target: number;
    words: string;
    minPower: number;
    maxPower: number;
    sources: Array<{
        itemId: number;
        itemName: string;
        soldBy: WikiNpcReference[];
        droppedBy: WikiNpcReference[];
    }>;
    searchIndex: string;
};

export type WikiMap = {
    id: number;
    name: string;
    terreno: string;
    zona: string;
    restringir: string;
    minLevel: number;
    maxLevel: number;
    pk: boolean;
    info: string;
    creatures: string;
    hasPreview: boolean;
    totalNpcSpawns: number;
    totalCombatSpawns: number;
    uniqueCombatNpcs: number;
    npcs: Array<{
        npcId: number;
        npcName: string;
        spawns: number;
        expReward: number;
        maxHp: number;
        isCombatNpc: boolean;
    }>;
    topNpcs: Array<{
        npcId: number;
        npcName: string;
        spawns: number;
        expReward: number;
        maxHp: number;
    }>;
    searchIndex: string;
};

export type WikiRecipe = {
    id: number;
    category: string;
    itemId: number;
    itemName: string;
    itemGrhIndex: number;
    level: number;
    recipeItemId: number;
    recipeItemName: string;
    goldCost: number;
    dropChancePercent: number;
    materials: Array<{
        itemId: number;
        itemName: string;
        grhIndex: number;
        amount: number;
    }>;
    searchIndex: string;
};

export type WikiQuest = {
    id: number;
    name: string;
    description: string;
    requiredLevel: number;
    requiredNpcs: Array<{ npcId: number; npcName: string; amount: number }>;
    requiredObjects: Array<{ itemId: number; itemName: string; amount: number }>;
    rewardGold: number;
    rewardExp: number;
    rewardPoints: number;
    rewardObjects: Array<{ itemId: number; itemName: string; amount: number; grhIndex: number }>;
    givers: Array<{ npcId: number; npcName: string; maps: Array<{ mapId: number; mapName: string }> }>;
    searchIndex: string;
};

export type PublicWikiResponse = {
    generatedAt: string;
    stats: {
        npcCount: number;
        combatNpcCount: number;
        objectCount: number;
        equipmentCount: number;
        spellCount: number;
        mapCount: number;
        trainingMapCount: number;
        recipeCount: number;
        questCount: number;
    };
    npcs: WikiNpc[];
    objects: WikiObject[];
    equipment: Array<WikiObject & { categoryLabel: string }>;
    spells: WikiSpell[];
    maps: WikiMap[];
    trainingMaps: WikiMap[];
    recipes: WikiRecipe[];
    quests: WikiQuest[];
};
