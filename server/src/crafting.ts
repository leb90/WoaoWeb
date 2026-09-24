import type { DataObject, EntityId, Position, RuntimeCharacter, RuntimeClient, RuntimeNpc } from "./types/runtime";
import type { GameApi } from "./game";
import type { HandleProtocolApi } from "./handleProtocol";
import { getCharacterById } from "./runtimeRegistry";
import { getCraftingRecipes, type CraftingProfession, type CraftingRecipe } from "./craftingRecipes";

export {};

const vars = require("./vars");
const handleProtocol = require("./handleProtocol") as HandleProtocolApi;
const funct = require("./functions");
const workProfessions = require("./workProfessions");

function getGameApi() {
    return require("./game") as GameApi;
}

type CraftingUser = RuntimeCharacter & {
    id: EntityId;
    dead?: number | boolean;
    level?: number;
    idClase?: number;
    inv: Record<string, { idItem: number; cant: number }>;
    map: number;
    pos: Position;
    idItemWeapon?: number | string;
    targetNpcId?: EntityId;
    learnedCraftingRecipes?: number[];
    craftingTarget?: {
        pendingTarget?: boolean;
        source?: "tool" | "npc";
        profession?: "blacksmith";
        slot?: number;
        itemId?: number;
        npcId?: EntityId;
    };
};

type CraftingApi = {
    isCarpentryTool: (idItem: number) => boolean;
    isTailoringTool: (idItem: number) => boolean;
    isBlacksmithTool: (idItem: number) => boolean;
    usesCraftingTool: (idItem: number) => boolean;
    handleToolUse: (ws: RuntimeClient, idPos: number | string) => boolean;
    handleMapClick: (ws: RuntimeClient, x: number, y: number) => boolean;
    isCraftingNpc: (npc: RuntimeNpc | undefined) => boolean;
    handleNpcInteraction: (ws: RuntimeClient, npcId: EntityId) => boolean;
    openNearestCraftingNpc: (ws: RuntimeClient) => boolean;
    handleRecipeItemUse: (ws: RuntimeClient, idPos: number | string, idItem: number) => Promise<boolean>;
    handleCraftRequest: (
        ws: RuntimeClient,
        profession: CraftingProfession,
        itemId: number,
        amount: number,
    ) => Promise<void>;
    cancelPendingTarget: (idUser: EntityId) => void;
};

const CRAFTING_NPC_RANGE = 5;
const LEGACY_CRAFTER_NPC_TYPE = 45;
const CRAFTING_RECIPE_OBJECT_TYPE = 46;

function getUser(idUser: EntityId) {
    return getCharacterById<CraftingUser>(idUser);
}

function getProfessionSkillId(_profession: CraftingProfession) {
    return 0;
}

function getCraftingSkill(_user: CraftingUser, _profession: CraftingProfession) {
    return 0;
}

function getProfessionForTool(idItem: number): CraftingProfession | null {
    if (crafting.isCarpentryTool(idItem)) {
        return "carpentry";
    }

    if (crafting.isTailoringTool(idItem)) {
        return "tailoring";
    }

    if (crafting.isBlacksmithTool(idItem)) {
        return "blacksmith";
    }

    return null;
}

function getProfessionLabel(profession: CraftingProfession) {
    if (profession === "carpentry") {
        return "Carpintería";
    }

    if (profession === "tailoring") {
        return "Sastrería";
    }

    return "Herrería";
}

function getProfessionClassRestriction(user: CraftingUser, profession: CraftingProfession) {
    if (profession === "blacksmith" && !workProfessions.isHerrero(user)) {
        return "Sólo los Herreros pueden usar estos objetos.";
    }

    if (profession === "carpentry" && !workProfessions.isCarpintero(user)) {
        return "Sólo los Carpinteros pueden usar estos objetos.";
    }

    return null;
}

function getProfessionRecipes(profession: CraftingProfession, skill: number) {
    return getCraftingRecipes()
        .filter((recipe) => !recipe.deleted && recipe.profession === profession && recipe.skill <= skill)
        .sort(
            (left, right) =>
                Number(left.sortOrder ?? left.id) - Number(right.sortOrder ?? right.id) || left.id - right.id,
        );
}

function getNpcCraftingRecipes() {
    return getCraftingRecipes()
        .filter((recipe) => !recipe.deleted)
        .sort(
            (left, right) =>
                getRecipeLevel(left) - getRecipeLevel(right) ||
                Number(left.sortOrder ?? left.id) - Number(right.sortOrder ?? right.id) ||
                left.id - right.id,
        );
}

function isWithinRange(origin: Position, target: Position, maxDistance: number) {
    return Math.abs(origin.x - target.x) <= maxDistance && Math.abs(origin.y - target.y) <= maxDistance;
}

function getRecipeGoldCost(recipe: CraftingRecipe) {
    const obj = vars.datObj[recipe.itemId] as DataObject | undefined;
    const rawValue = Math.floor(Number(obj?.valor ?? 0));

    return Math.max(1, Number.isFinite(rawValue) ? rawValue : 0);
}

function getRecipeLevel(recipe: CraftingRecipe) {
    const level = Math.floor(Number(recipe.level ?? recipe.skill ?? 0));
    return Math.max(1, Number.isFinite(level) ? level : 1);
}

function normalizeLearnedRecipeIds(user: CraftingUser) {
    user.learnedCraftingRecipes = Array.from(
        new Set(
            (Array.isArray(user.learnedCraftingRecipes) ? user.learnedCraftingRecipes : [])
                .map((recipeId) => Math.floor(Number(recipeId) || 0))
                .filter((recipeId) => recipeId > 0),
        ),
    ).sort((left, right) => left - right);

    return user.learnedCraftingRecipes;
}

function hasLearnedRecipe(user: CraftingUser, recipe: CraftingRecipe) {
    return normalizeLearnedRecipeIds(user).includes(Number(recipe.id));
}

function getRecipeByItemId(idItem: number) {
    return getCraftingRecipes().find((recipe) => !recipe.deleted && recipe.itemId === idItem) ?? null;
}

function getRecipeByRecipeItemId(idItem: number) {
    return getCraftingRecipes().find((recipe) => !recipe.deleted && Number(recipe.recipeItemId ?? 0) === idItem) ?? null;
}

async function persistLearnedCraftingRecipes(user: CraftingUser) {
    if (!user._id || user.pvpChar) {
        return;
    }

    await funct.fetchUrl(`/character_save/${user._id}/crafting-recipes`, {
        method: "PUT",
        body: JSON.stringify({
            learnedCraftingRecipes: normalizeLearnedRecipeIds(user),
        }),
        headers: {
            "Content-Type": "application/json",
            Authorization: vars.tokenAuth,
        },
    });
}

function getNpcCraftingFailure(user: CraftingUser) {
    const npcId = user.craftingTarget?.npcId;
    const npc = npcId ? (vars.npcs[npcId] as RuntimeNpc | undefined) : undefined;

    if (!npc || !crafting.isCraftingNpc(npc)) {
        return "Vuelve a hablar con el crafteador para fabricar.";
    }

    if (npc.map !== user.map || !isWithinRange(user.pos, npc.pos, CRAFTING_NPC_RANGE)) {
        return "Te encuentras muy lejos de la mesa de crafteo.";
    }

    return null;
}

function isValidAnvilTarget(user: CraftingUser, target: Position) {
    const objInfo = vars.mapa[user.map]?.[target.y]?.[target.x]?.objInfo;

    if (!objInfo?.objIndex) {
        return false;
    }

    const obj = vars.datObj[objInfo.objIndex] as DataObject | undefined;

    return Boolean(obj && obj.objType === vars.objType.yunque && isWithinRange(user.pos, target, 2));
}

function countInventoryItem(user: CraftingUser, itemId: number) {
    let total = 0;

    for (const item of Object.values(user.inv)) {
        if (item.idItem === itemId) {
            total += item.cant;
        }
    }

    return total;
}

function canReceiveCraftedItem(user: CraftingUser, itemId: number, amount: number) {
    for (const item of Object.values(user.inv)) {
        if (item.idItem === itemId && item.cant + amount <= 10000) {
            return true;
        }
    }

    return Object.keys(user.inv).length < 21;
}

function removeMaterial(user: CraftingUser, itemId: number, amount: number) {
    let remaining = amount;

    for (const [slot, item] of Object.entries(user.inv)) {
        if (remaining <= 0) {
            break;
        }

        if (item.idItem !== itemId) {
            continue;
        }

        const toRemove = Math.min(remaining, item.cant);
        getGameApi().quitarUserInvItem(user.id, slot, toRemove);
        remaining -= toRemove;
    }

    return remaining <= 0;
}

function getRecipe(idItem: number, profession: CraftingProfession) {
    return (
        getCraftingRecipes().find(
            (recipe) => !recipe.deleted && recipe.profession === profession && recipe.itemId === idItem,
        ) ?? null
    );
}

function getCraftedItemStats(obj: DataObject) {
    switch (obj.objType) {
        case vars.objType.armas: {
            const parts = [`Daño: ${obj.minHit ?? 0}/${obj.maxHit ?? 0}`];

            if (obj.apu) {
                parts.push("Apuñala");
            }

            if (obj.magicDamageBonus) {
                parts.push(`Ataque mágico: +${obj.magicDamageBonus}`);
            }

            if (obj.magicDamagePercent) {
                parts.push(`Bonus daño mágico: ${obj.magicDamagePercent}%`);
            }

            return parts.join(" | ");
        }

        case vars.objType.flechas:
            return `Daño: ${obj.minHit ?? 0}/${obj.maxHit ?? 0}`;

        case vars.objType.armaduras:
        case vars.objType.escudos:
        case vars.objType.cascos: {
            const parts = [`Defensa: ${obj.minDef ?? 0}/${obj.maxDef ?? 0}`];

            if (obj.minDefMag && obj.maxDefMag) {
                parts.push(`Defensa Mágica: ${obj.minDefMag}/${obj.maxDefMag}`);
            }

            if (obj.resistenciaMagica) {
                parts.push(`Resistencia mágica: ${obj.resistenciaMagica}%`);
            }

            if (obj.magicDamageBonus) {
                parts.push(`Ataque mágico: +${obj.magicDamageBonus}`);
            }

            if (obj.magicDamagePercent) {
                parts.push(`Bonus daño mágico: ${obj.magicDamagePercent}%`);
            }

            return parts.join(" | ");
        }

        case vars.objType.anillos: {
            const parts: string[] = [];

            if (obj.minDefMag && obj.maxDefMag) {
                parts.push(`Defensa Mágica: ${obj.minDefMag}/${obj.maxDefMag}`);
            }

            if (obj.resistenciaMagica) {
                parts.push(`Resistencia mágica: ${obj.resistenciaMagica}%`);
            }

            if (obj.magicDamageBonus) {
                parts.push(`Ataque mágico: +${obj.magicDamageBonus}`);
            }

            if (obj.magicDamagePercent) {
                parts.push(`Bonus daño mágico: ${obj.magicDamagePercent}%`);
            }

            return parts.join(" | ");
        }

        default:
            return "";
    }
}

function serializeRecipe(user: CraftingUser, recipe: CraftingRecipe, options?: { includeGoldCost?: boolean }) {
    const obj = vars.datObj[recipe.itemId] as DataObject | undefined;

    if (!obj) {
        return null;
    }

    return {
        id: recipe.id,
        profession: recipe.profession,
        itemId: recipe.itemId,
        name: obj.name,
        grhIndex: Number(obj.grhIndex ?? 0),
        objType: Number(obj.objType ?? 0),
        subtype: Number(obj.subtipo ?? 0),
        goldCost: options?.includeGoldCost ? getRecipeGoldCost(recipe) : 0,
        details: recipe.category,
        stats: getCraftedItemStats(obj),
        skill: getRecipeLevel(recipe),
        level: getRecipeLevel(recipe),
        recipeItemId: Number(recipe.recipeItemId ?? 0),
        learned: hasLearnedRecipe(user, recipe),
        category: recipe.category,
        materials: recipe.materials
            .map((material) => {
                const materialObj = vars.datObj[material.itemId] as DataObject | undefined;

                if (!materialObj) {
                    return null;
                }

                return {
                    itemId: material.itemId,
                    name: materialObj.name,
                    grhIndex: Number(materialObj.grhIndex ?? 0),
                    amount: material.amount,
                    owned: countInventoryItem(user, material.itemId),
                };
            })
            .filter(
                (
                    material,
                ): material is { itemId: number; name: string; grhIndex: number; amount: number; owned: number } =>
                    material !== null,
            ),
    };
}

const crafting: CraftingApi = {
    isCarpentryTool(idItem) {
        const name = String(vars.datObj?.[idItem]?.name ?? "");
        return /serrucho/i.test(name);
    },

    isTailoringTool(idItem) {
        const name = String(vars.datObj?.[idItem]?.name ?? "");
        return /costurero/i.test(name);
    },

    isBlacksmithTool(idItem) {
        const name = String(vars.datObj?.[idItem]?.name ?? "");
        return /martillo de herrero/i.test(name);
    },

    usesCraftingTool(idItem) {
        return this.isCarpentryTool(idItem) || this.isTailoringTool(idItem) || this.isBlacksmithTool(idItem);
    },

    isCraftingNpc(npc) {
        if (!npc) {
            return false;
        }

        const npcType = Number(npc.npcType ?? 0);
        const nameAndDescription = `${String(npc.nameCharacter ?? "")} ${String(npc.desc ?? "")}`;

        return (
            npcType === Number(vars.npcType.crafter ?? LEGACY_CRAFTER_NPC_TYPE) ||
            npcType === LEGACY_CRAFTER_NPC_TYPE ||
            /crafteo|craftear/i.test(nameAndDescription)
        );
    },

    handleNpcInteraction(ws, npcId) {
        const user = getUser(ws.id!);
        const npc = vars.npcs[npcId] as RuntimeNpc | undefined;

        if (!user || !npc || !this.isCraftingNpc(npc)) {
            return false;
        }

        if (user.dead) {
            handleProtocol.console("Los muertos no pueden fabricar.", "white", 0, 0, ws);
            return true;
        }

        if (npc.map !== user.map || !isWithinRange(user.pos, npc.pos, CRAFTING_NPC_RANGE)) {
            handleProtocol.console("Te encuentras muy lejos para fabricar.", "white", 1, 0, ws);
            return true;
        }

        getGameApi().closeTradeSession(user.id);
        user.craftingTarget = {
            source: "npc",
            npcId,
        };

        const recipes = getNpcCraftingRecipes()
            .map((recipe) => serializeRecipe(user, recipe, { includeGoldCost: true }))
            .filter((recipe) => recipe !== null);

        handleProtocol.openCrafting(
            {
                profession: "global",
                mode: "npc",
                title: "Mesa de Crafteo",
                goldAvailable: Math.max(0, Math.floor(Number(user.gold ?? 0))),
                recipes,
            },
            ws,
        );

        return true;
    },

    openNearestCraftingNpc(ws) {
        const user = getUser(ws.id!);

        if (!user) {
            return false;
        }

        if (user.dead) {
            handleProtocol.console("Los muertos no pueden fabricar.", "white", 0, 0, ws);
            return true;
        }

        const targetedId = user.targetNpcId;
        if (targetedId && this.handleNpcInteraction(ws, targetedId)) {
            return true;
        }

        let nearestId: EntityId | null = null;
        let nearestDistance = Number.POSITIVE_INFINITY;

        for (const npc of Object.values(vars.npcs) as RuntimeNpc[]) {
            if (!npc || !this.isCraftingNpc(npc) || Number(npc.map) !== Number(user.map)) {
                continue;
            }

            if (!isWithinRange(user.pos, npc.pos, CRAFTING_NPC_RANGE)) {
                continue;
            }

            const distance = Math.max(Math.abs(user.pos.x - npc.pos.x), Math.abs(user.pos.y - npc.pos.y));

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestId = npc.id;
            }
        }

        if (!nearestId) {
            handleProtocol.console("No hay una mesa de crafteo cerca. Acercate y usa /craftear.", "white", 1, 0, ws);
            return true;
        }

        return this.handleNpcInteraction(ws, nearestId);
    },

    handleToolUse(ws, idPos) {
        const user = getUser(ws.id!);

        if (!user) {
            return false;
        }

        const inventoryItem = user.inv[String(idPos)];
        const profession = inventoryItem ? getProfessionForTool(inventoryItem.idItem) : null;

        if (!inventoryItem || !profession) {
            return false;
        }

        user.craftingTarget = undefined;
        handleProtocol.console("La fabricacion ahora se realiza con el Artesano y recetas aprendidas.", "#fcd34d", 0, 0, ws);
        return true;

        if (user.dead) {
            handleProtocol.console("Los muertos no pueden trabajar.", "white", 0, 0, ws);
            return true;
        }

        const classRestriction = getProfessionClassRestriction(user, profession);

        if (classRestriction) {
            handleProtocol.console(classRestriction, "white", 0, 0, ws);
            return true;
        }

        if (profession === "blacksmith") {
            user.craftingTarget = {
                source: "tool",
                pendingTarget: true,
                profession,
                slot: Number(idPos),
                itemId: inventoryItem.idItem,
            };
            handleProtocol.console("Haz click sobre un yunque cercano para trabajar herrería.", "#fcd34d", 0, 0, ws);
            return true;
        }

        user.craftingTarget = undefined;

        const recipes = getProfessionRecipes(profession, getCraftingSkill(user, profession))
            .map((recipe) => serializeRecipe(user, recipe))
            .filter((recipe) => recipe !== null);

        handleProtocol.openCrafting(
            {
                profession,
                mode: "tool",
                title: getProfessionLabel(profession),
                goldAvailable: Math.max(0, Math.floor(Number(user.gold ?? 0))),
                recipes,
            },
            ws,
        );

        return true;
    },

    handleMapClick(ws, x, y) {
        const user = getUser(ws.id!);
        const targetState = user?.craftingTarget;

        if (!user || !targetState?.pendingTarget || targetState.profession !== "blacksmith") {
            return false;
        }

        user.craftingTarget = undefined;
        handleProtocol.console("La herreria por yunque fue reemplazada por el Artesano.", "#fcd34d", 0, 0, ws);
        return true;

        const weaponSlot = Number(user.idItemWeapon ?? 0);

        if (!weaponSlot || weaponSlot !== Number(targetState.slot ?? 0)) {
            handleProtocol.console(
                "Debes tener equipado un martillo de herrero para trabajar con el yunque.",
                "white",
                0,
                0,
                ws,
            );
            user.craftingTarget = undefined;
            return true;
        }

        if (!isValidAnvilTarget(user, { x, y })) {
            handleProtocol.console("Debes hacer click sobre un yunque cercano.", "white", 0, 0, ws);
            return true;
        }

        user.craftingTarget = undefined;

        const recipes = getProfessionRecipes("blacksmith", getCraftingSkill(user, "blacksmith"))
            .map((recipe) => serializeRecipe(user, recipe))
            .filter((recipe) => recipe !== null);

        handleProtocol.openCrafting(
            {
                profession: "blacksmith",
                mode: "tool",
                title: getProfessionLabel("blacksmith"),
                goldAvailable: Math.max(0, Math.floor(Number(user.gold ?? 0))),
                recipes,
            },
            ws,
        );

        return true;
    },

    async handleRecipeItemUse(ws, idPos, idItem) {
        const user = getUser(ws.id!);
        const obj = vars.datObj[idItem] as DataObject | undefined;

        if (!user || Number(obj?.objType ?? 0) !== CRAFTING_RECIPE_OBJECT_TYPE) {
            return false;
        }

        if (user.dead) {
            handleProtocol.console("Los muertos no pueden aprender recetas.", "white", 0, 0, ws);
            return true;
        }

        const recipe = getRecipeByRecipeItemId(idItem);

        if (!recipe) {
            handleProtocol.console("Esta receta no tiene un item asociado para fabricar.", "white", 0, 0, ws);
            return true;
        }

        if (hasLearnedRecipe(user, recipe)) {
            handleProtocol.console("Ya conoces esa receta.", "white", 0, 0, ws);
            return true;
        }

        const recipeLevel = getRecipeLevel(recipe);
        if (Math.floor(Number(user.level ?? 0)) < recipeLevel) {
            handleProtocol.console(`Necesitas nivel ${recipeLevel} para aprender esta receta.`, "white", 0, 0, ws);
            return true;
        }

        const learnedRecipes = normalizeLearnedRecipeIds(user);
        learnedRecipes.push(recipe.id);
        normalizeLearnedRecipeIds(user);

        getGameApi().quitarUserInvItem(user.id, idPos, 1);
        await persistLearnedCraftingRecipes(user);
        await getGameApi().persistCharacterItemsById(user.id);

        const craftedObj = vars.datObj[recipe.itemId] as DataObject | undefined;
        handleProtocol.console(`Has aprendido la receta de ${craftedObj?.name ?? "ese objeto"}.`, "#86efac", 0, 0, ws);
        return true;
    },

    async handleCraftRequest(ws, profession, itemId, amount) {
        const user = getUser(ws.id!);

        if (!user) {
            return;
        }

        if (user.dead) {
            handleProtocol.console("Los muertos no pueden trabajar.", "white", 0, 0, ws);
            return;
        }

        const npcCrafting = user.craftingTarget?.source === "npc";

        if (!npcCrafting) {
            handleProtocol.console("Ahora solo puedes fabricar hablando con el Artesano.", "white", 0, 0, ws);
            return;
        }

        const npcCraftingFailure = getNpcCraftingFailure(user);

        if (npcCraftingFailure) {
            handleProtocol.console(npcCraftingFailure, "white", 0, 0, ws);
            user.craftingTarget = undefined;
            return;
        }

        const classRestriction = null;

        if (classRestriction) {
            handleProtocol.console(classRestriction, "white", 0, 0, ws);
            return;
        }

        const safeAmount = Math.max(1, Math.min(9999, Math.floor(Number(amount) || 0)));
        const recipe = getRecipeByItemId(itemId);

        if (!recipe) {
            return;
        }

        if (!hasLearnedRecipe(user, recipe)) {
            handleProtocol.console("No has aprendido la receta de ese objeto.", "white", 0, 0, ws);
            return;
        }

        const recipeLevel = getRecipeLevel(recipe);
        if (Math.floor(Number(user.level ?? 0)) < recipeLevel) {
            handleProtocol.console(`Necesitas nivel ${recipeLevel} para fabricar ese objeto.`, "white", 0, 0, ws);
            return;
        }

        if (!npcCrafting) {
            const hasTool = Object.values(user.inv).some((item) => {
                if (profession === "carpentry") {
                    return this.isCarpentryTool(item.idItem);
                }

                if (profession === "tailoring") {
                    return this.isTailoringTool(item.idItem);
                }

                return this.isBlacksmithTool(item.idItem);
            });

            if (!hasTool) {
                handleProtocol.console(
                    profession === "carpentry"
                        ? "Necesitas un serrucho para trabajar carpintería."
                        : profession === "tailoring"
                          ? "Necesitas un costurero para trabajar sastrería."
                          : "Necesitas un martillo de herrero para trabajar herrería.",
                    "white",
                    0,
                    0,
                    ws,
                );
                return;
            }

        }

        const scaledMaterials = recipe.materials.map((material) => ({
            itemId: material.itemId,
            amount: material.amount * safeAmount,
        }));
        const totalGoldCost = npcCrafting ? getRecipeGoldCost(recipe) * safeAmount : 0;

        for (const material of scaledMaterials) {
            if (countInventoryItem(user, material.itemId) < material.amount) {
                const materialObj = vars.datObj[material.itemId] as DataObject | undefined;
                handleProtocol.console(`No tienes suficiente ${materialObj?.name ?? "material"}.`, "white", 0, 0, ws);
                return;
            }
        }

        if (!canReceiveCraftedItem(user, recipe.itemId, safeAmount)) {
            handleProtocol.console("Tienes el inventario lleno.", "white", 0, 0, ws);
            return;
        }

        if (totalGoldCost > 0 && Math.floor(Number(user.gold ?? 0)) < totalGoldCost) {
            handleProtocol.console(`Necesitas ${totalGoldCost} monedas de oro para fabricar.`, "white", 0, 0, ws);
            return;
        }

        for (const material of scaledMaterials) {
            removeMaterial(user, material.itemId, material.amount);
        }

        const game = getGameApi();

        if (totalGoldCost > 0) {
            user.gold = Math.max(0, Math.floor(Number(user.gold ?? 0)) - totalGoldCost);
            handleProtocol.actGold(user.gold, ws);
        }

        game.putItemToInv(user.id, recipe.itemId, safeAmount);
        if (npcCrafting) {
            await game.persistCharacterSnapshot(user);
        } else {
            await game.persistCharacterItemsById(user.id);
            require("./skills").applyTraining(user, getProfessionSkillId(profession));
        }

        const craftedObj = vars.datObj[recipe.itemId] as DataObject | undefined;
        handleProtocol.console(`Has fabricado ${safeAmount} ${craftedObj?.name ?? "objeto"}.`, "#86efac", 0, 0, ws);
    },

    cancelPendingTarget(idUser) {
        const user = getUser(idUser);

        if (!user?.craftingTarget) {
            return;
        }

        user.craftingTarget = undefined;
    },
};

module.exports = crafting;
