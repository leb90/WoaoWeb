export type WikiVisibility = "PUBLIC" | "HIDDEN" | "FUTURE";

export type WikiMapReference = {
    mapId: number;
    mapName: string;
    spawns: number;
};

export type WikiItemReference = {
    itemId: number;
    itemName: string;
    quantity: number;
    chancePercent?: number;
};

export type WikiNpcReference = {
    npcId: number;
    npcName: string;
    quantity: number;
    chancePercent?: number;
};

export type WikiRecipeReference = {
    recipeId: number;
    itemId: number;
    itemName: string;
    level: number;
};

export type WikiSpellSourceReference = {
    itemId: number;
    itemName: string;
    soldBy: WikiNpcReference[];
    droppedBy: WikiNpcReference[];
};

export type WikiNpcEntry = {
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
    maps: WikiMapReference[];
    sells: WikiItemReference[];
    drops: WikiItemReference[];
    totalSpawns: number;
    searchIndex: string;
};

export type WikiObjectEntry = {
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

export type WikiEquipmentCategory =
    | "weapon"
    | "armor"
    | "shield"
    | "helmet"
    | "magic_weapon";

export type WikiEquipmentEntry = WikiObjectEntry & {
    category: WikiEquipmentCategory;
    categoryLabel: string;
};

export type WikiSpellEntry = {
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
    sources: WikiSpellSourceReference[];
    searchIndex: string;
};

export type WikiMapMetadata = {
    id: number;
    name: string;
    terreno: string;
    zona: string;
    restringir: string;
    minLevel: number;
    maxLevel: number;
    pk: boolean;
};

export type WikiMapNpcEntry = {
    npcId: number;
    npcName: string;
    spawns: number;
    expReward: number;
    maxHp: number;
    isCombatNpc: boolean;
};

export type WikiMapEntry = WikiMapMetadata & {
    totalNpcSpawns: number;
    totalCombatSpawns: number;
    uniqueCombatNpcs: number;
    npcs: WikiMapNpcEntry[];
    topNpcs: Array<Omit<WikiMapNpcEntry, "isCombatNpc">>;
    searchIndex: string;
};

export type WikiRecipeEntry = {
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
    };
    npcs: WikiNpcEntry[];
    objects: WikiObjectEntry[];
    equipment: WikiEquipmentEntry[];
    spells: WikiSpellEntry[];
    maps: WikiMapEntry[];
    trainingMaps: WikiMapEntry[];
    recipes: WikiRecipeEntry[];
};
