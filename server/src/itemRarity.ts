// Rarezas por instancia de ítem: Normal, Mejorado, Épico y Legendario (mismos nombres, colores y
// probabilidades que leb90/_Argentum). Cada rareza suma un poco a los stats del ítem (+1/+2/+3 al golpe o
// a la defensa, +2/+4/+6 al daño mágico) y el Legendario no se cae al morir.
// Las piezas de los sets de tier son siempre legendarias.
export {};

const vars = require("./vars");
const tierSets = require("./tierSets") as typeof import("./tierSets");

export const RARITY = { normal: 0, mejorado: 1, epico: 2, legendario: 3 } as const;
export const RARITY_NAMES = ["Normal", "Mejorado", "Épico", "Legendario"] as const;
export const RARITY_COLORS = ["#9da3ae", "#35c76d", "#8a56e2", "#d8a729"] as const;
export const MAX_RARITY = 3;

// Armas (2), armaduras con cascos y escudos por subtipo (3), escudos (16), cascos (17) y anillos (41).
// Las herramientas (18) y las flechas (32) no llevan rareza.
const ELIGIBLE_OBJ_TYPES = new Set([2, 3, 16, 17, 41]);

type ObjectData = Record<string, any>;

export function isRarityEligible(idItem: number): boolean {
    const obj = vars.datObj?.[Number(idItem)] as ObjectData | undefined;
    if (!obj || !ELIGIBLE_OBJ_TYPES.has(Number(obj.objType))) return false;
    return !obj.cosmetico && !obj.disfraz && !obj.newbie && !obj.eventOnly;
}

// Rareza real de una instancia: los sets de tier siempre son legendarios; lo que no es elegible es Normal.
export function getItemRarity(idItem: number, storedRarity?: unknown): number {
    if (!isRarityEligible(idItem)) return 0;
    if (tierSets.isTierSetItem(Number(idItem))) return RARITY.legendario;
    const value = Math.floor(Number(storedRarity) || 0);
    return Math.max(0, Math.min(MAX_RARITY, value));
}

// Sorteo de 1 a 10000, como en el repo original: Legendario 0,1 %, Épico 3 %, Mejorado 30 %, Normal 66,9 %.
export function rollRarity(random: () => number = Math.random): number {
    const roll = Math.floor(random() * 10000) + 1;
    if (roll <= 10) return RARITY.legendario;
    if (roll <= 310) return RARITY.epico;
    if (roll <= 3310) return RARITY.mejorado;
    return RARITY.normal;
}

export function rollRarityForItem(idItem: number, random: () => number = Math.random): number {
    if (!isRarityEligible(idItem)) return 0;
    if (tierSets.isTierSetItem(Number(idItem))) return RARITY.legendario;
    return rollRarity(random);
}

// Un ítem con rareza nunca se apila: va de a uno por lugar. Los normales se apilan como siempre.
export function canStackWith(slotItem: { idItem?: number; rarity?: number } | null | undefined, idItem: number, rarity: number): boolean {
    if (!slotItem || Number(slotItem.idItem) !== Number(idItem)) return false;
    return getItemRarity(idItem, slotItem.rarity) === 0 && getItemRarity(idItem, rarity) === 0;
}

export function isRarityNoDrop(idItem: number, rarity?: unknown): boolean {
    return getItemRarity(idItem, rarity) === RARITY.legendario;
}

export function getRarityName(rarity: number): string {
    return RARITY_NAMES[Math.max(0, Math.min(MAX_RARITY, Math.floor(rarity)))] ?? RARITY_NAMES[0];
}

// Stats con la rareza aplicada. Se cachea por objeto y se invalida si se recarga vars.datObj.
const cache = new Map<string, ObjectData>();
let cacheSource: unknown = null;

export function getEffectiveItemData(idItem: number, storedRarity?: unknown): ObjectData | null {
    const base = vars.datObj?.[Number(idItem)] as ObjectData | undefined;
    if (!base) return null;
    const rarity = getItemRarity(idItem, storedRarity);
    if (rarity === 0) return base;
    if (cacheSource !== vars.datObj) {
        cache.clear();
        cacheSource = vars.datObj;
    }
    const key = `${idItem}:${rarity}`;
    const cached = cache.get(key);
    if (cached && cached.__base === base) return cached;
    const effective: ObjectData = { ...base, __base: base, rarity };
    const add = (field: string, amount: number) => {
        if (Number(base[field] ?? 0) > 0) effective[field] = Number(base[field]) + amount;
    };
    add("minHit", rarity);
    add("maxHit", rarity);
    add("minDef", rarity);
    add("maxDef", rarity);
    add("minDefMag", rarity);
    add("maxDefMag", rarity);
    // resistenciaMagica no: es un porcentaje de reducción y +3 por pieza pesa mucho más que el resto.
    add("magicDamageBonus", rarity * 2);
    cache.set(key, effective);
    return effective;
}

module.exports = {
    RARITY,
    RARITY_NAMES,
    RARITY_COLORS,
    MAX_RARITY,
    isRarityEligible,
    getItemRarity,
    rollRarity,
    rollRarityForItem,
    canStackWith,
    isRarityNoDrop,
    getRarityName,
    getEffectiveItemData,
};
