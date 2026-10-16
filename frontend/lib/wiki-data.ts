import { unstable_cache } from "next/cache";
import { getApiBaseUrlCandidates } from "@/lib/api-base-url";
import type {
    PublicWikiResponse,
    WikiMap,
    WikiNpc,
    WikiObject,
    WikiQuest,
} from "@/lib/wiki";
import atlasJson from "@/public/init/world-map-atlas.json";
import questsJson from "@/public/init/quests.json";
import npcsJson from "@/public/init/npcs.json";

export const WIKI_REVALIDATE_SECONDS = 60;

const QUEST_GIVERS: Record<number, number> = {
    24: 3,
    36: 3,
    154: 2,
    325: 1,
    326: 2,
    327: 3,
    328: 4,
    329: 5,
    330: 6,
    331: 7,
    332: 8,
    333: 9,
    334: 10,
    335: 11,
    336: 12,
    337: 13,
    338: 14,
    339: 15,
    340: 16,
    341: 17,
    342: 18,
    343: 19,
    344: 20,
    345: 21,
    363: 22,
    364: 23,
    367: 24,
    368: 25,
    369: 26,
    370: 27,
    371: 28,
    373: 29,
    374: 30,
    375: 31,
};

type RawQuest = {
    id?: number;
    name?: string;
    desc?: string;
    requiredLevel?: number;
    requiredNpcs?: Array<{ index?: number; amount?: number }>;
    requiredObjs?: Array<{ index?: number; amount?: number }>;
    rewardGold?: number;
    rewardExp?: number;
    rewardPoints?: number;
    rewardObjs?: Array<{ index?: number; amount?: number }>;
};

type RawNpc = {
    name?: string;
    desc?: string;
    idHead?: number;
    idBody?: number;
    npcType?: number;
    hp?: number;
    maxHp?: number;
    exp?: number;
    gold?: number;
    minHit?: number;
    maxHit?: number;
    def?: number;
    objs?: Array<{ item?: number; cant?: number }>;
    drop?: Array<{ item?: number; cant?: number; chancePercent?: number }>;
};

function normalizeSearchText(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function createEmptyWikiResponse(): PublicWikiResponse {
    return {
        generatedAt: new Date().toISOString(),
        stats: {
            npcCount: 0,
            combatNpcCount: 0,
            objectCount: 0,
            equipmentCount: 0,
            spellCount: 0,
            mapCount: 0,
            trainingMapCount: 0,
            recipeCount: 0,
            questCount: 0,
        },
        npcs: [],
        objects: [],
        equipment: [],
        spells: [],
        maps: [],
        trainingMaps: [],
        recipes: [],
        quests: [],
    };
}

function addQuestNpcs(npcs: WikiNpc[], objects: WikiObject[]): WikiNpc[] {
    const requiredIds = new Set<number>(Object.keys(QUEST_GIVERS).map(Number));
    for (const quest of Object.values(questsJson as Record<string, RawQuest>)) {
        for (const target of quest.requiredNpcs ?? []) {
            if (target.index) requiredIds.add(Number(target.index));
        }
    }

    const byId = new Map(npcs.map((npc) => [npc.id, npc]));
    const objectById = new Map(objects.map((object) => [object.id, object]));

    for (const id of requiredIds) {
        if (byId.has(id)) continue;
        const data = (npcsJson as Record<string, RawNpc>)[String(id)];
        if (!data?.name || /(?:e2e|dummy|debug|test)/i.test(data.name)) continue;

        const maxHp = Number(data.maxHp ?? data.hp ?? 0);
        const expReward = Number(data.exp ?? 0) * 5;
        const drops = (data.drop ?? []).map((entry) => ({
            itemId: Number(entry.item ?? 0),
            itemName: objectById.get(Number(entry.item ?? 0))?.name ?? `Objeto ${entry.item ?? 0}`,
            quantity: Number(entry.cant ?? 0),
            chancePercent: typeof entry.chancePercent === "number" ? entry.chancePercent : undefined,
        })).filter((entry) => entry.itemId > 0);
        const sells = (data.objs ?? []).map((entry) => ({
            itemId: Number(entry.item ?? 0),
            itemName: objectById.get(Number(entry.item ?? 0))?.name ?? `Objeto ${entry.item ?? 0}`,
            quantity: Number(entry.cant ?? 0),
        })).filter((entry) => entry.itemId > 0);
        const combat = maxHp > 0 && (expReward > 0 || Number(data.maxHit ?? 0) > 0);

        byId.set(id, {
            id,
            name: data.name,
            npcType: Number(data.npcType ?? 0),
            npcTypeLabel: combat ? "Criatura de misión" : "NPC de misión",
            description: String(data.desc ?? ""),
            headId: Number(data.idHead ?? 0),
            bodyId: Number(data.idBody ?? 0),
            maxHp,
            expReward,
            goldReward: Number(data.gold ?? 0) * 3,
            minHit: Number(data.minHit ?? 0),
            maxHit: Number(data.maxHit ?? 0),
            defense: Number(data.def ?? 0),
            expPerHp: maxHp > 0 && expReward > 0 ? expReward / maxHp : null,
            isCombatNpc: combat,
            maps: [],
            sells,
            drops,
            totalSpawns: 0,
            searchIndex: normalizeSearchText(`${id} ${data.name} ${data.desc ?? ""} ${drops.map((entry) => entry.itemName).join(" ")}`),
        });
    }

    return Array.from(byId.values()).sort((left, right) => left.id - right.id);
}

function buildQuests(
    npcs: PublicWikiResponse["npcs"],
    objects: WikiObject[],
): WikiQuest[] {
    const npcById = new Map(npcs.map((npc) => [npc.id, npc]));
    const objectById = new Map(objects.map((object) => [object.id, object]));
    const giverIdsByQuest = new Map<number, number[]>();

    for (const [npcId, questId] of Object.entries(QUEST_GIVERS)) {
        const current = giverIdsByQuest.get(questId) ?? [];
        current.push(Number(npcId));
        giverIdsByQuest.set(questId, current);
    }

    return Object.entries(questsJson as Record<string, RawQuest>)
        .map(([rawId, quest]) => {
            const id = Number(quest.id ?? rawId);
            const requiredNpcs = (quest.requiredNpcs ?? []).map((entry) => ({
                npcId: Number(entry.index ?? 0),
                npcName:
                    npcById.get(Number(entry.index ?? 0))?.name ??
                    `NPC ${entry.index ?? 0}`,
                amount: Number(entry.amount ?? 0),
            }));
            const requiredObjects = (quest.requiredObjs ?? []).map((entry) => ({
                itemId: Number(entry.index ?? 0),
                itemName:
                    objectById.get(Number(entry.index ?? 0))?.name ??
                    `Objeto ${entry.index ?? 0}`,
                amount: Number(entry.amount ?? 0),
            }));
            const rewardObjects = (quest.rewardObjs ?? []).map((entry) => {
                const item = objectById.get(Number(entry.index ?? 0));
                return {
                    itemId: Number(entry.index ?? 0),
                    itemName: item?.name ?? `Objeto ${entry.index ?? 0}`,
                    amount: Number(entry.amount ?? 0),
                    grhIndex: item?.grhIndex ?? 0,
                };
            });
            const givers = (giverIdsByQuest.get(id) ?? [])
                .map((npcId) => npcById.get(npcId))
                .filter((npc): npc is NonNullable<typeof npc> => Boolean(npc))
                .map((npc) => ({
                    npcId: npc.id,
                    npcName: npc.name,
                    maps: npc.maps.map((map) => ({
                        mapId: map.mapId,
                        mapName: map.mapName,
                    })),
                }));
            const name = String(quest.name ?? `Misión ${id}`);
            const description = String(quest.desc ?? "");

            return {
                id,
                name,
                description,
                requiredLevel: Number(quest.requiredLevel ?? 1),
                requiredNpcs,
                requiredObjects,
                rewardGold: Number(quest.rewardGold ?? 0),
                rewardExp: Number(quest.rewardExp ?? 0),
                rewardPoints: Number(quest.rewardPoints ?? 0),
                rewardObjects,
                givers,
                searchIndex: normalizeSearchText(
                    [
                        id,
                        name,
                        description,
                        ...requiredNpcs.map((entry) => entry.npcName),
                        ...requiredObjects.map((entry) => entry.itemName),
                        ...rewardObjects.map((entry) => entry.itemName),
                        ...givers.map((entry) => entry.npcName),
                    ].join(" "),
                ),
            };
        })
        .sort((left, right) => left.id - right.id);
}

function normalizeWikiResponse(payload: unknown): PublicWikiResponse {
    const raw = (payload ?? {}) as Partial<PublicWikiResponse>;
    const objects = Array.isArray(raw.objects) ? raw.objects : [];
    const rawMaps: WikiMap[] = (Array.isArray(raw.maps)
        ? raw.maps
        : Array.isArray(raw.trainingMaps)
          ? raw.trainingMaps
          : []
    );
    const rawMapById = new Map(rawMaps.map((map) => [map.id, map]));
    const atlasMapById = new Map(
        atlasJson.maps.map((map) => [map.id, map]),
    );
    const mapIds = Array.from(
        new Set([...atlasMapById.keys(), ...rawMapById.keys()]),
    ).sort((left, right) => left - right);
    const maps: WikiMap[] = mapIds.map((mapId) => {
        const atlas = atlasMapById.get(mapId);
        const map = rawMapById.get(mapId);
        return {
            id: mapId,
            name: atlas?.name || map?.name || `Mapa ${mapId}`,
            terreno: map?.terreno || atlas?.type || "-",
            zona: map?.zona || atlas?.type || "-",
            restringir: map?.restringir ?? "Sin datos actuales",
            minLevel: Number(map?.minLevel ?? 0),
            maxLevel: Number(map?.maxLevel ?? 0),
            pk: Boolean(map?.pk),
            info: atlas?.info ?? "",
            creatures: atlas?.creatures ?? "",
            hasPreview: Boolean(atlas?.hasPreview),
            totalNpcSpawns: Number(map?.totalNpcSpawns ?? 0),
            totalCombatSpawns: Number(map?.totalCombatSpawns ?? 0),
            uniqueCombatNpcs: Number(map?.uniqueCombatNpcs ?? 0),
            npcs: Array.isArray(map?.npcs) ? map.npcs : [],
            topNpcs: Array.isArray(map?.topNpcs) ? map.topNpcs : [],
            searchIndex: normalizeSearchText(
                `${map?.searchIndex ?? ""} ${mapId} ${atlas?.name ?? ""} ${atlas?.type ?? ""} ${atlas?.info ?? ""} ${atlas?.creatures ?? ""}`,
            ),
        };
    });
    const mapNames = new Map(maps.map((map) => [map.id, map.name]));
    const normalizedNpcs = (raw.npcs ?? []).map((npc) => ({
        ...npc,
        maps: npc.maps.map((map) => ({
            ...map,
            mapName: mapNames.get(map.mapId) ?? map.mapName,
        })),
    }));
    const npcs = addQuestNpcs(normalizedNpcs, objects);
    const quests = buildQuests(npcs, objects);

    return {
        generatedAt: String(raw.generatedAt ?? new Date().toISOString()),
        stats: {
            npcCount: npcs.length,
            combatNpcCount: npcs.filter((npc) => npc.isCombatNpc).length,
            objectCount: Number(raw.stats?.objectCount ?? objects.length),
            equipmentCount: Number(
                raw.stats?.equipmentCount ?? raw.equipment?.length ?? 0,
            ),
            spellCount: Number(raw.stats?.spellCount ?? raw.spells?.length ?? 0),
            mapCount: maps.length,
            trainingMapCount: Number(raw.stats?.trainingMapCount ?? 0),
            recipeCount: Number(raw.stats?.recipeCount ?? raw.recipes?.length ?? 0),
            questCount: quests.length,
        },
        npcs,
        objects,
        equipment: raw.equipment ?? [],
        spells: raw.spells ?? [],
        maps,
        trainingMaps: maps.filter(
            (map) => map.uniqueCombatNpcs > 0 && map.totalCombatSpawns > 0,
        ),
        recipes: raw.recipes ?? [],
        quests,
    };
}

export const getWikiData = unstable_cache(
    async (): Promise<PublicWikiResponse> => {
        for (const apiBaseUrl of getApiBaseUrlCandidates()) {
            try {
                const response = await fetch(`${apiBaseUrl}/wiki`, {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                return normalizeWikiResponse(await response.json());
            } catch (error) {
                console.error(
                    `No se pudo cargar la wiki desde ${apiBaseUrl}:`,
                    error,
                );
            }
        }

        console.error("No se pudo cargar la wiki desde ningun origen.");
        return createEmptyWikiResponse();
    },
    ["public-wiki-v5"],
    { revalidate: WIKI_REVALIDATE_SECONDS },
);

export function normalizeWikiQuery(value: string): string {
    return normalizeSearchText(value.trim());
}
