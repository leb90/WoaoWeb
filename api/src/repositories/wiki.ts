import { existsSync } from "fs";
import fs from "fs/promises";
import path from "path";
import { getCurrentGameNpcVersion, listGameNpcChangesSince } from "./gameNpcs";
import {
    getCurrentGameObjectVersion,
    listGameObjectChangesSince,
} from "./gameObjects";
import {
    getCurrentGameCraftingRecipeVersion,
    listGameCraftingRecipeChangesSince,
} from "./gameCraftingRecipes";
import {
    getCurrentGameSmeltingRecipeVersion,
} from "./gameSmeltingRecipes";
import {
    loadAllMapNpcPlacements,
    type MapNpcPlacement,
} from "../lib/mapNpcStorage";
import { isWikiMapPublic, isWikiObjectPublic } from "./wiki/wikiVisibility";
import type {
    PublicWikiResponse,
    WikiEquipmentCategory,
    WikiEquipmentEntry,
    WikiMapEntry,
    WikiMapMetadata,
    WikiNpcEntry,
    WikiNpcReference,
    WikiObjectEntry,
    WikiRecipeEntry,
    WikiRecipeReference,
    WikiSpellEntry,
    WikiSpellSourceReference,
} from "./wiki/wikiTypes";

export type { PublicWikiResponse } from "./wiki/wikiTypes";

const CURRENT_EXP_MULTIPLIER = 5;
const CURRENT_GOLD_MULTIPLIER = 3;
function resolveApiDataPath(): string {
    const candidates = [
        path.resolve(__dirname, ".."),
        path.resolve(__dirname, "..", "..", "src"),
    ];

    for (const candidate of candidates) {
        if (
            existsSync(path.join(candidate, "jsons", "spells.json")) &&
            existsSync(path.join(candidate, "mapas_source"))
        ) {
            return candidate;
        }
    }

    return candidates[0];
}

const API_DATA_PATH = resolveApiDataPath();
const MAPS_SOURCE_PATH = path.join(API_DATA_PATH, "mapas_source");
const SPELLS_PATH = path.join(API_DATA_PATH, "jsons", "spells.json");

const NPC_TYPE_LABELS: Record<number, string> = {
    0: "Comun",
    1: "Sacerdote",
    2: "Guardia",
    3: "Entrenador",
    4: "Banquero",
    5: "Noble",
    6: "Dragon",
    7: "Timbero",
    8: "Guardia del Caos",
    9: "Sacerdote Newbie",
    10: "Comerciante",
};

const OBJECT_TYPE_LABELS: Record<number, string> = {
    0: "Otros",
    1: "Comida",
    2: "Armas",
    3: "Armaduras",
    4: "Arboles",
    5: "Dinero",
    6: "Puerta",
    7: "Contenedor",
    8: "Carteles",
    9: "Llaves",
    10: "Foros",
    11: "Pociones",
    12: "Libros",
    13: "Bebidas",
    14: "Lenia",
    15: "Fogata",
    16: "Escudos",
    17: "Cascos",
    18: "Herramientas",
    19: "Teletransportes",
    20: "Muebles",
    21: "Joyas",
    22: "Yacimientos",
    23: "Metales",
    24: "Pergaminos",
    25: "Aura",
    26: "Instrumentos",
    27: "Yunque",
    28: "Fraguas",
    29: "Gemas",
    30: "Flores",
    31: "Barcos",
    32: "Flechas",
    33: "Botellas vacias",
    34: "Botellas llenas",
    35: "Manchas",
    36: "Amuletos",
    37: "Amuletos",
    38: "Amuletos",
    39: "Amuletos",
    40: "Cofres y regalos",
    41: "Anillos",
    42: "Monturas",
    43: "Huevos de montura",
    46: "Recetas",
    50: "Capas",
    60: "Monturas",
    62: "Bolsas",
    63: "Bolsas",
    64: "Trofeos",
    65: "Trofeos",
    66: "Trofeos",
    67: "Bolsas de oro",
    68: "Pociones especiales",
    71: "Materiales especiales",
    72: "Objetos de clan",
    77: "Juegos",
};

function getNpcTypeLabel(npcType: number): string {
    return NPC_TYPE_LABELS[npcType] ?? `Tipo ${npcType}`;
}

function getObjectTypeLabel(objType: number): string {
    return OBJECT_TYPE_LABELS[objType] ?? `Tipo ${objType}`;
}

function getEquipmentCategory(
    data: Record<string, unknown>,
    objType: number,
): {
    key: WikiEquipmentCategory;
    label: string;
} | null {
    const normalizedName = normalizeSearchText(String(data.name ?? ""));

    if (objType === 3) {
        if (/(?:escudo|broquel)/.test(normalizedName)) {
            return { key: "shield", label: "Escudos" };
        }

        if (/(?:casco|yelmo|capucha|sombrero|corona|mascara)/.test(normalizedName)) {
            return { key: "helmet", label: "Cascos" };
        }
    }

    switch (objType) {
        case 2:
            return { key: "weapon", label: "Armas" };
        case 3:
            return { key: "armor", label: "Armaduras" };
        case 16:
            return { key: "shield", label: "Escudos" };
        case 17:
            return { key: "helmet", label: "Cascos" };
        default:
            return null;
    }
}

function isMagicWeapon(
    data: Record<string, unknown>,
    objType: number,
): boolean {
    const normalizedName = normalizeSearchText(String(data.name ?? ""));

    return (
        objType === 26 ||
        normalizedName.includes("baston") ||
        normalizedName.includes("laud") ||
        normalizedName.includes("flauta")
    );
}

function getSpellTypeLabel(type: number): string {
    switch (type) {
        case 1:
            return "Activo";
        case 2:
            return "Utilidad";
        default:
            return `Tipo ${type}`;
    }
}

function toNumber(value: unknown): number {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toOptionalChancePercent(value: unknown): number | undefined {
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : undefined;
}

function getDropChancePercent(entry: Record<string, unknown>): number | undefined {
    for (const key of ["chancePercent", "chance", "probabilityPercent", "probabilidad"]) {
        const chancePercent = toOptionalChancePercent(entry[key]);
        if (typeof chancePercent === "number") {
            return chancePercent;
        }
    }

    return undefined;
}

function normalizeSearchText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function isCombatNpc(data: Record<string, unknown>): boolean {
    const maxHp = toNumber(data.maxHp) || toNumber(data.hp);
    return (
        maxHp > 0 &&
        (toNumber(data.exp) > 0 ||
            toNumber(data.gold) > 0 ||
            toNumber(data.minHit) > 0 ||
            toNumber(data.maxHit) > 0 ||
            toNumber(data.poderAtaque) > 0)
    );
}

function isTrainingMapCandidate(map: WikiMapMetadata): boolean {
    const normalizedName = normalizeSearchText(map.name);
    return (
        map.zona !== "CIUDAD" &&
        map.restringir !== "GM" &&
        !normalizedName.includes("local") &&
        !normalizedName.includes("gms")
    );
}

function getRecipeDropChancePercent(level: number): number {
    if (level >= 50) return 0.1;
    if (level >= 40) return 0.5;
    if (level >= 30) return 1;
    if (level >= 20) return 2;
    return 5;
}

async function readMapNpcSpawns(): Promise<MapNpcPlacement[]> {
    return loadAllMapNpcPlacements(MAPS_SOURCE_PATH);
}

async function readMapMetadata(): Promise<Map<number, WikiMapMetadata>> {
    const metadata = new Map<number, WikiMapMetadata>();
    if (!existsSync(MAPS_SOURCE_PATH)) {
        return metadata;
    }

    const entries = await fs.readdir(MAPS_SOURCE_PATH, { withFileTypes: true });

    await Promise.all(
        entries
            .filter(
                (entry) => entry.isDirectory() && /^mapa_\d+$/.test(entry.name),
            )
            .map(async (entry) => {
                const match = entry.name.match(/^mapa_(\d+)$/);
                if (!match) {
                    return;
                }

                const mapId = Number(match[1]);
                const metaFilePath = path.join(
                    MAPS_SOURCE_PATH,
                    entry.name,
                    "meta.json",
                );
                if (!existsSync(metaFilePath)) {
                    return;
                }

                const rawFile = await fs.readFile(metaFilePath, "utf8");
                const parsed = JSON.parse(rawFile) as Record<string, unknown>;

                metadata.set(mapId, {
                    id: mapId,
                    name: String(parsed.name ?? `Mapa ${mapId}`),
                    terreno: String(parsed.terreno ?? "-"),
                    zona: String(parsed.zona ?? "-"),
                    restringir: String(parsed.restringir ?? "No"),
                    minLevel: Number(parsed.minLevel ?? 0),
                    maxLevel: Number(parsed.maxLevel ?? 0),
                    pk: Number(parsed.pk ?? 0) === 1,
                });
            }),
    );

    return metadata;
}

async function readSpells(): Promise<
    Array<{
        id: number;
        data: Record<string, unknown>;
    }>
> {
    const rawFile = await fs.readFile(SPELLS_PATH, "utf8");
    const parsed = JSON.parse(rawFile) as Record<
        string,
        Record<string, unknown>
    >;

    return Object.entries(parsed)
        .map(([id, data]) => ({ id: Number(id), data }))
        .filter((entry) => Number.isInteger(entry.id) && entry.id > 0);
}

function buildSearchIndex(parts: Array<string | number>): string {
    return normalizeSearchText(parts.join(" "));
}

type WikiCacheEntry = {
    signature: string;
    payload: PublicWikiResponse;
};

let wikiCache: WikiCacheEntry | null = null;

async function getWikiVersionSignature(): Promise<string> {
    const [npcVersion, objectVersion, craftingVersion, smeltingVersion] =
        await Promise.all([
            getCurrentGameNpcVersion(),
            getCurrentGameObjectVersion(),
            getCurrentGameCraftingRecipeVersion(),
            getCurrentGameSmeltingRecipeVersion(),
        ]);

    return [npcVersion, objectVersion, craftingVersion, smeltingVersion].join(
        ":",
    );
}

export async function getPublicWiki(): Promise<PublicWikiResponse> {
    const signature = await getWikiVersionSignature();

    if (wikiCache?.signature === signature) {
        return wikiCache.payload;
    }

    const [
        npcChanges,
        objectChanges,
        craftingChanges,
        mapMetadataById,
        spellsData,
    ] = await Promise.all([
        listGameNpcChangesSince(0),
        listGameObjectChangesSince(0),
        listGameCraftingRecipeChangesSince(0),
        readMapMetadata(),
        readSpells(),
    ]);

    const objectsById = new Map(
        objectChanges.changes.map((entry) => [entry.id, entry.data]),
    );
    const spawns = await readMapNpcSpawns();
    const npcMapCounts = new Map<number, Map<number, number>>();
    const mapNpcCounts = new Map<number, Map<number, number>>();
    const npcIdsInMaps = new Set<number>();

    for (const spawn of spawns) {
        const npcId = Number(spawn.npcIndex ?? 0);
        const mapId = Number(spawn.mapNum ?? 0);
        if (!npcId || !mapId) {
            continue;
        }

        const metadata = mapMetadataById.get(mapId);
        if (!metadata || !isWikiMapPublic(metadata)) {
            continue;
        }

        npcIdsInMaps.add(npcId);

        const npcMaps = npcMapCounts.get(npcId) ?? new Map<number, number>();
        npcMaps.set(mapId, (npcMaps.get(mapId) ?? 0) + 1);
        npcMapCounts.set(npcId, npcMaps);

        const mapNpcs = mapNpcCounts.get(mapId) ?? new Map<number, number>();
        mapNpcs.set(npcId, (mapNpcs.get(npcId) ?? 0) + 1);
        mapNpcCounts.set(mapId, mapNpcs);
    }

    const soldByObject = new Map<number, WikiNpcReference[]>();
    const droppedByObject = new Map<number, WikiNpcReference[]>();
    const npcs: WikiNpcEntry[] = npcChanges.changes
        .filter((entry) => npcIdsInMaps.has(entry.id))
        .map((entry) => {
            const data = entry.data as Record<string, unknown>;
            const maxHp = toNumber(data.maxHp) || toNumber(data.hp);
            const expReward = Math.floor(
                toNumber(data.exp) * CURRENT_EXP_MULTIPLIER,
            );
            const goldReward = Math.floor(
                toNumber(data.gold) * CURRENT_GOLD_MULTIPLIER,
            );
            const npcMaps =
                npcMapCounts.get(entry.id) ?? new Map<number, number>();
            const maps = Array.from(npcMaps.entries())
                .map(([mapId, spawnsInMap]) => ({
                    mapId,
                    mapName:
                        mapMetadataById.get(mapId)?.name ?? `Mapa ${mapId}`,
                    spawns: spawnsInMap,
                }))
                .sort(
                    (left, right) =>
                        right.spawns - left.spawns || left.mapId - right.mapId,
                );

            const sells = Array.isArray(data.objs)
                ? data.objs
                      .map((item) => {
                          const trade = item as Record<string, unknown>;
                          const itemId = toNumber(trade.item);
                           return {
                               itemId,
                               itemName: String(
                                   objectsById.get(itemId)?.name ??
                                       `Objeto ${itemId}`,
                               ),
                               quantity: toNumber(trade.cant),
                           };
                       })
                      .filter((item) => item.itemId > 0)
                : [];

            const drops = Array.isArray(data.drop)
                ? data.drop
                      .map((item) => {
                          const trade = item as Record<string, unknown>;
                          const itemId = toNumber(trade.item);
                          return {
                              itemId,
                              itemName: String(
                                  objectsById.get(itemId)?.name ??
                                      `Objeto ${itemId}`,
                              ),
                              quantity: toNumber(trade.cant),
                              chancePercent: getDropChancePercent(trade),
                          };
                      })
                      .filter((item) => item.itemId > 0)
                : [];

            for (const item of sells) {
                const references = soldByObject.get(item.itemId) ?? [];
                references.push({
                    npcId: entry.id,
                    npcName: String(data.name ?? `NPC ${entry.id}`),
                    quantity: item.quantity,
                });
                soldByObject.set(item.itemId, references);
            }

            for (const item of drops) {
                const references = droppedByObject.get(item.itemId) ?? [];
                references.push({
                    npcId: entry.id,
                    npcName: String(data.name ?? `NPC ${entry.id}`),
                    quantity: item.quantity,
                    chancePercent: item.chancePercent,
                });
                droppedByObject.set(item.itemId, references);
            }

            const combatNpc = isCombatNpc(data);
            const totalSpawns = maps.reduce(
                (total, mapEntry) => total + mapEntry.spawns,
                0,
            );
            const npcType = toNumber(data.npcType);

            return {
                id: entry.id,
                name: String(data.name ?? `NPC ${entry.id}`),
                npcType,
                npcTypeLabel: getNpcTypeLabel(npcType),
                description: String(data.desc ?? ""),
                headId: toNumber(data.idHead),
                bodyId: toNumber(data.idBody),
                maxHp,
                expReward,
                goldReward,
                minHit: toNumber(data.minHit),
                maxHit: toNumber(data.maxHit),
                defense: toNumber(data.def),
                expPerHp:
                    maxHp > 0 && expReward > 0
                        ? Number((expReward / maxHp).toFixed(4))
                        : null,
                isCombatNpc: combatNpc,
                maps,
                sells,
                drops,
                totalSpawns,
                searchIndex: buildSearchIndex([
                    entry.id,
                    String(data.name ?? ""),
                    getNpcTypeLabel(npcType),
                    maps.map((mapEntry) => mapEntry.mapName).join(" "),
                    sells.map((item) => item.itemName).join(" "),
                    drops.map((item) => item.itemName).join(" "),
                ]),
            };
        })
        .sort((left, right) => left.id - right.id);

    const craftedByObject = new Map<number, WikiRecipeReference[]>();
    const usedInRecipesByObject = new Map<number, WikiRecipeReference[]>();
    const recipes: WikiRecipeEntry[] = craftingChanges.changes
        .filter((entry) => !entry.data.deleted)
        .map((entry) => {
            const recipe = entry.data;
            const itemId = toNumber(recipe.itemId);
            const item = objectsById.get(itemId) as Record<string, unknown> | undefined;
            const recipeItemId = toNumber(recipe.recipeItemId);
            const recipeItem = objectsById.get(recipeItemId) as Record<string, unknown> | undefined;
            const level = Math.max(1, toNumber(recipe.level) || toNumber(recipe.skill));
            const reference: WikiRecipeReference = {
                recipeId: entry.id,
                itemId,
                itemName: String(item?.name ?? `Objeto ${itemId}`),
                level,
            };

            const craftedReferences = craftedByObject.get(itemId) ?? [];
            craftedReferences.push(reference);
            craftedByObject.set(itemId, craftedReferences);

            const materials = (recipe.materials ?? []).map((material) => {
                const materialItem = objectsById.get(material.itemId) as Record<string, unknown> | undefined;
                const references = usedInRecipesByObject.get(material.itemId) ?? [];
                references.push(reference);
                usedInRecipesByObject.set(material.itemId, references);

                return {
                    itemId: material.itemId,
                    itemName: String(materialItem?.name ?? `Objeto ${material.itemId}`),
                    grhIndex: toNumber(materialItem?.grhIndex),
                    amount: material.amount,
                };
            });

            return {
                id: entry.id,
                category: String(recipe.category ?? "Otros"),
                itemId,
                itemName: String(item?.name ?? `Objeto ${itemId}`),
                itemGrhIndex: toNumber(item?.grhIndex),
                level,
                recipeItemId,
                recipeItemName: String(recipeItem?.name ?? `Receta ${entry.id}`),
                goldCost: Math.max(1, toNumber(item?.valor)),
                dropChancePercent: getRecipeDropChancePercent(level),
                materials,
                searchIndex: buildSearchIndex([
                    entry.id,
                    recipe.category,
                    itemId,
                    String(item?.name ?? ""),
                    recipeItemId,
                    String(recipeItem?.name ?? ""),
                    materials.map((material) => material.itemName).join(" "),
                ]),
            };
        })
        .sort((left, right) => left.level - right.level || left.id - right.id);

    const objects: WikiObjectEntry[] = objectChanges.changes
        .filter((entry) => isWikiObjectPublic(entry.data as Record<string, unknown>))
        .map((entry) => {
            const data = entry.data as Record<string, unknown>;
            const objType = toNumber(data.objType);
            const soldBy = (soldByObject.get(entry.id) ?? []).sort(
                (left, right) =>
                    right.quantity - left.quantity || left.npcId - right.npcId,
            );
            const droppedBy = (droppedByObject.get(entry.id) ?? []).sort(
                (left, right) =>
                    right.quantity - left.quantity || left.npcId - right.npcId,
            );

            return {
                id: entry.id,
                name: String(data.name ?? `Objeto ${entry.id}`),
                description: String(data.desc ?? ""),
                grhIndex: toNumber(data.grhIndex),
                objType,
                objTypeLabel: getObjectTypeLabel(objType),
                category: getObjectTypeLabel(objType),
                value: toNumber(data.valor),
                minHit: toNumber(data.minHit),
                maxHit: toNumber(data.maxHit),
                minDef: toNumber(data.minDef),
                maxDef: toNumber(data.maxDef),
                minDefMag: toNumber(data.minDefMag),
                maxDefMag: toNumber(data.maxDefMag),
                magicResistance: toNumber(data.resistenciaMagica),
                minSkill: toNumber(data.minSkill),
                tier: toNumber(data.tier),
                newbie: toNumber(data.newbie) === 1,
                blockedClasses: Array.isArray(data.clasesNoPermitidas)
                    ? data.clasesNoPermitidas.filter(
                          (value): value is number => typeof value === "number",
                      )
                    : [],
                spellId: toNumber(data.spellIndex),
                soldBy,
                droppedBy,
                craftedBy: craftedByObject.get(entry.id) ?? [],
                usedInRecipes: usedInRecipesByObject.get(entry.id) ?? [],
                searchIndex: buildSearchIndex([
                    entry.id,
                    String(data.name ?? ""),
                    getObjectTypeLabel(objType),
                    soldBy.map((npc) => npc.npcName).join(" "),
                    droppedBy.map((npc) => npc.npcName).join(" "),
                    (craftedByObject.get(entry.id) ?? [])
                        .map((recipe) => recipe.itemName)
                        .join(" "),
                ]),
            };
        })
        .sort((left, right) => left.id - right.id);

    const equipment: WikiEquipmentEntry[] = objects
        .map((entry) => {
            const data = objectsById.get(entry.id) as Record<string, unknown> | undefined;
            if (!data) return null;

            const defaultCategory = getEquipmentCategory(data, entry.objType);
            const category = isMagicWeapon(data, entry.objType)
                ? { key: "magic_weapon" as const, label: "Armas mágicas" }
                : defaultCategory;

            return category
                ? { ...entry, category: category.key, categoryLabel: category.label }
                : null;
        })
        .filter((entry): entry is WikiEquipmentEntry => Boolean(entry));

    const spellSourcesBySpellId = new Map<number, WikiSpellSourceReference[]>();

    for (const entry of objectChanges.changes) {
        const data = entry.data as Record<string, unknown>;
        const spellId = toNumber(data.spellIndex);

        if (spellId <= 0) {
            continue;
        }

        const soldBy = (soldByObject.get(entry.id) ?? []).sort(
            (left, right) =>
                right.quantity - left.quantity || left.npcId - right.npcId,
        );
        const droppedBy = (droppedByObject.get(entry.id) ?? []).sort(
            (left, right) =>
                right.quantity - left.quantity || left.npcId - right.npcId,
        );

        if (soldBy.length === 0 && droppedBy.length === 0) {
            continue;
        }

        const currentSources = spellSourcesBySpellId.get(spellId) ?? [];
        currentSources.push({
            itemId: entry.id,
            itemName: String(data.name ?? `Objeto ${entry.id}`),
            soldBy,
            droppedBy,
        });
        spellSourcesBySpellId.set(spellId, currentSources);
    }

    const spells: WikiSpellEntry[] = spellsData
        .map((entry) => {
            const data = entry.data;
            const sources = (spellSourcesBySpellId.get(entry.id) ?? []).sort(
                (left, right) => left.itemId - right.itemId,
            );

            const type = toNumber(data.type);

            return {
                id: entry.id,
                name: String(data.name ?? `Hechizo ${entry.id}`),
                description: String(data.desc ?? ""),
                type,
                typeLabel: getSpellTypeLabel(type),
                minSkill: toNumber(data.minSkill),
                manaRequired: toNumber(data.manaRequired),
                target: toNumber(data.target),
                words: String(data.palabrasMagicas ?? ""),
                minPower: toNumber(data.minHp),
                maxPower: toNumber(data.maxHp),
                sources,
                searchIndex: buildSearchIndex([
                    entry.id,
                    String(data.name ?? ""),
                    String(data.desc ?? ""),
                    getSpellTypeLabel(type),
                    sources.map((source) => source.itemName).join(" "),
                    sources
                        .flatMap((source) => [
                            source.soldBy.map((npc) => npc.npcName).join(" "),
                            source.droppedBy
                                .map((npc) => npc.npcName)
                                .join(" "),
                        ])
                        .join(" "),
                ]),
            };
        })
        .sort((left, right) => left.id - right.id);

    const npcById = new Map(npcs.map((npc) => [npc.id, npc]));

    const maps: WikiMapEntry[] = Array.from(mapMetadataById.values())
        .filter(isWikiMapPublic)
        .map((metadata) => {
            const npcCounts =
                mapNpcCounts.get(metadata.id) ?? new Map<number, number>();

            const topNpcs = Array.from(npcCounts.entries())
                .map(([npcId, spawnsInMap]) => {
                    const npc = npcById.get(npcId);
                    return npc
                        ? {
                              npcId,
                              npcName: npc.name,
                              spawns: spawnsInMap,
                              expReward: npc.expReward,
                              maxHp: npc.maxHp,
                              isCombatNpc: npc.isCombatNpc,
                          }
                        : null;
                })
                .filter((entry): entry is NonNullable<typeof entry> =>
                    Boolean(entry),
                )
                .sort(
                    (left, right) =>
                        right.spawns - left.spawns ||
                        right.expReward - left.expReward,
                );

            const combatNpcs = topNpcs.filter((npc) => npc.isCombatNpc);

            return {
                ...metadata,
                totalNpcSpawns: topNpcs.reduce(
                    (total, npc) => total + npc.spawns,
                    0,
                ),
                totalCombatSpawns: combatNpcs.reduce(
                    (total, npc) => total + npc.spawns,
                    0,
                ),
                uniqueCombatNpcs: combatNpcs.length,
                npcs: topNpcs,
                topNpcs: combatNpcs
                    .slice(0, 8)
                    .map(({ isCombatNpc: _isCombatNpc, ...npc }) => npc),
                searchIndex: buildSearchIndex([
                    metadata.id,
                    metadata.name,
                    metadata.terreno,
                    metadata.zona,
                    combatNpcs.map((npc) => npc.npcName).join(" "),
                ]),
            };
        })
        .sort((left, right) => left.id - right.id);

    const trainingMaps = maps
        .filter(
            (map) =>
                isTrainingMapCandidate(map) &&
                map.uniqueCombatNpcs > 0 &&
                map.totalCombatSpawns > 0,
        )
        .sort(
            (left, right) =>
                right.uniqueCombatNpcs - left.uniqueCombatNpcs ||
                right.totalCombatSpawns - left.totalCombatSpawns ||
                left.id - right.id,
        );

    const payload = {
        generatedAt: new Date().toISOString(),
        stats: {
            npcCount: npcs.length,
            combatNpcCount: npcs.filter((npc) => npc.isCombatNpc).length,
            objectCount: objects.length,
            equipmentCount: equipment.length,
            spellCount: spells.length,
            mapCount: maps.length,
            trainingMapCount: trainingMaps.length,
            recipeCount: recipes.length,
        },
        npcs,
        objects,
        equipment,
        spells,
        maps,
        trainingMaps,
        recipes,
    };

    wikiCache = {
        signature,
        payload,
    };

    return payload;
}
