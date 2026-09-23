"use client";

import React from "react";
import {
    Coins,
    Hammer,
    Minus,
    Package,
    Plus,
    Search,
    Shield,
    Shirt,
    Swords,
    X,
} from "lucide-react";
import {
    OBJECT_TYPE,
    type CraftingRecipe,
    type InventoryItem,
} from "../lib/aowProtocol";
import type { GraphicData } from "../types/game";
import { getTexturePath, loadGraphicsDB } from "../utils/gameLoader";

type CraftingProfession = CraftingRecipe["profession"];

type CraftingModalProps = {
    title: string;
    recipes: CraftingRecipe[];
    inventory: InventoryItem[];
    goldAvailable: number;
    onClose: () => void;
    onCraftRequest: (
        profession: CraftingProfession,
        itemId: number,
        amount: number,
    ) => void;
};

type CraftingTab = "weapons" | "shields" | "helmets" | "armor" | "other";

const CATEGORY_TABS: Array<{
    id: CraftingTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [
    { id: "weapons", label: "Armas", icon: Swords },
    { id: "shields", label: "Escudos", icon: Shield },
    { id: "helmets", label: "Cascos", icon: Package },
    { id: "armor", label: "Armaduras / Tunicas", icon: Shirt },
    { id: "other", label: "Otros", icon: Package },
];

const numberFormatter = new Intl.NumberFormat("es-AR");

function formatAmount(value: number) {
    return numberFormatter.format(Math.max(0, Math.floor(value)));
}

function getRecipeKey(recipe: Pick<CraftingRecipe, "profession" | "itemId">) {
    return `${recipe.profession}:${recipe.itemId}`;
}

function normalizeText(value: string) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function getRecipeTab(recipe: CraftingRecipe): CraftingTab {
    const category = normalizeText(`${recipe.category} ${recipe.name}`);

    if (
        recipe.objType === OBJECT_TYPE.armas ||
        recipe.objType === OBJECT_TYPE.flechas ||
        /\b(arma|armas|arco|arcos|baculo|baculos|flecha|flechas)\b/.test(
            category,
        )
    ) {
        return "weapons";
    }

    if (
        recipe.objType === OBJECT_TYPE.escudos ||
        recipe.subtype === 2 ||
        /\bescudo|escudos\b/.test(category)
    ) {
        return "shields";
    }

    if (
        recipe.objType === OBJECT_TYPE.cascos ||
        recipe.subtype === 1 ||
        /\b(casco|cascos|yelmo|yelmos|gorro|gorros|sombrero|sombreros)\b/.test(
            category,
        )
    ) {
        return "helmets";
    }

    if (
        recipe.objType === OBJECT_TYPE.armaduras ||
        /\b(armadura|armaduras|tunica|tunicas|ropa|ropas|vestimenta|vestimentas)\b/.test(
            category,
        )
    ) {
        return "armor";
    }

    return "other";
}

function ItemGraphic({
    graphicData,
    name,
    size = 42,
}: {
    graphicData?: GraphicData;
    name: string;
    size?: number;
}) {
    if (!graphicData?.numFile) {
        return (
            <div
                className="rounded-md border border-white/10 bg-black/25"
                style={{ height: size, width: size }}
            />
        );
    }

    const scale = Math.min(
        1,
        (size - 8) / Math.max(graphicData.width, graphicData.height, 1),
    );

    return (
        <div
            className="relative overflow-hidden rounded-md"
            style={{ height: size, width: size }}
        >
            <div
                aria-label={name}
                className="absolute left-1/2 top-1/2 bg-no-repeat"
                style={{
                    width: graphicData.width,
                    height: graphicData.height,
                    backgroundImage: `url(${getTexturePath(graphicData)})`,
                    backgroundPosition: `-${graphicData.sX}px -${graphicData.sY}px`,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: "center",
                }}
            />
        </div>
    );
}

export default function CraftingModal({
    title,
    recipes,
    inventory,
    goldAvailable,
    onClose,
    onCraftRequest,
}: CraftingModalProps) {
    const [graphicsDB, setGraphicsDB] = React.useState<Record<
        string,
        GraphicData
    > | null>(null);
    const [activeTab, setActiveTab] = React.useState<CraftingTab>("weapons");
    const [searchText, setSearchText] = React.useState("");
    const [selectedKey, setSelectedKey] = React.useState<string | null>(
        recipes[0] ? getRecipeKey(recipes[0]) : null,
    );
    const [amountText, setAmountText] = React.useState("1");

    React.useEffect(() => {
        let isActive = true;

        loadGraphicsDB()
            .then((data) => {
                if (isActive) {
                    setGraphicsDB(data);
                }
            })
            .catch(() => {
                if (isActive) {
                    setGraphicsDB({});
                }
            });

        return () => {
            isActive = false;
        };
    }, []);

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const recipesByTab = React.useMemo(() => {
        const next = new Map<CraftingTab, CraftingRecipe[]>();

        for (const tab of CATEGORY_TABS) {
            next.set(tab.id, []);
        }

        for (const recipe of recipes) {
            next.get(getRecipeTab(recipe))?.push(recipe);
        }

        return next;
    }, [recipes]);

    React.useEffect(() => {
        const currentRecipes = recipesByTab.get(activeTab) ?? [];
        if (currentRecipes.length > 0) {
            return;
        }

        const nextTab = CATEGORY_TABS.find(
            (tab) => (recipesByTab.get(tab.id)?.length ?? 0) > 0,
        );

        if (nextTab && nextTab.id !== activeTab) {
            setActiveTab(nextTab.id);
        }
    }, [activeTab, recipesByTab]);

    const normalizedSearch = normalizeText(searchText.trim());
    const visibleRecipes = React.useMemo(() => {
        const tabRecipes = recipesByTab.get(activeTab) ?? [];

        if (!normalizedSearch) {
            return tabRecipes;
        }

        return tabRecipes.filter((recipe) =>
            normalizeText(`${recipe.name} ${recipe.category} ${recipe.stats}`).includes(
                normalizedSearch,
            ),
        );
    }, [activeTab, normalizedSearch, recipesByTab]);

    React.useEffect(() => {
        if (
            selectedKey !== null &&
            visibleRecipes.some((recipe) => getRecipeKey(recipe) === selectedKey)
        ) {
            return;
        }

        setSelectedKey(visibleRecipes[0] ? getRecipeKey(visibleRecipes[0]) : null);
    }, [selectedKey, visibleRecipes]);

    const selectedRecipe = React.useMemo(
        () =>
            recipes.find((recipe) => getRecipeKey(recipe) === selectedKey) ??
            visibleRecipes[0] ??
            null,
        [recipes, selectedKey, visibleRecipes],
    );

    const parsedAmount = Number.parseInt(amountText, 10);
    const craftAmount = Number.isFinite(parsedAmount)
        ? Math.max(1, Math.min(parsedAmount, 9999))
        : 1;

    const inventoryCounts = React.useMemo(() => {
        const counts = new Map<number, number>();

        for (const item of inventory) {
            counts.set(
                item.idItem,
                (counts.get(item.idItem) ?? 0) + item.amount,
            );
        }

        return counts;
    }, [inventory]);

    const maxCraftable = React.useMemo(() => {
        if (!selectedRecipe) {
            return 0;
        }

        const materialLimit =
            selectedRecipe.materials.length > 0
                ? Math.min(
                      ...selectedRecipe.materials.map((material) =>
                          Math.floor(
                              (inventoryCounts.get(material.itemId) ?? 0) /
                                  Math.max(1, material.amount),
                          ),
                      ),
                  )
                : 9999;
        const goldLimit =
            selectedRecipe.goldCost > 0
                ? Math.floor(goldAvailable / selectedRecipe.goldCost)
                : 9999;

        return Math.max(0, Math.min(9999, materialLimit, goldLimit));
    }, [goldAvailable, inventoryCounts, selectedRecipe]);

    const totalGoldCost = selectedRecipe
        ? selectedRecipe.goldCost * craftAmount
        : 0;
    const hasMaterials =
        selectedRecipe !== null &&
        selectedRecipe.materials.every((material) => {
            const owned = inventoryCounts.get(material.itemId) ?? 0;
            return owned >= material.amount * craftAmount;
        });
    const hasGold = totalGoldCost <= goldAvailable;
    const canCraft = selectedRecipe !== null && hasMaterials && hasGold;

    const setAmount = React.useCallback((value: number) => {
        setAmountText(String(Math.max(1, Math.min(9999, Math.floor(value)))));
    }, []);

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-3 py-3 backdrop-blur-sm sm:px-5 sm:py-6">
            <div className="flex max-h-[94vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-lg border border-[#7a5726] bg-[#100b08] text-stone-100 shadow-[0_24px_90px_rgba(0,0,0,0.65)]">
                <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#5d421f] bg-[#1a1009] px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-amber-300/30 bg-amber-300/10">
                            <Hammer className="h-7 w-7 text-amber-200" />
                        </div>
                        <div className="min-w-0">
                            <div className="text-xs text-amber-200/80">
                                World of AO
                            </div>
                            <h2 className="truncate text-2xl font-semibold text-[#f3e7c8]">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden items-center gap-2 rounded-md border border-[#5d421f] bg-black/25 px-3 py-2 text-sm text-stone-200 sm:flex">
                            <Coins className="h-4 w-4 text-amber-300" />
                            <span>{formatAmount(goldAvailable)} oro</span>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5 text-stone-300 transition hover:border-amber-300/50 hover:text-amber-100"
                            aria-label="Cerrar"
                            title="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4 lg:overflow-hidden">
                    <div className="flex shrink-0 flex-col gap-3 lg:flex-row">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:flex lg:flex-1">
                            {CATEGORY_TABS.map((tab) => {
                                const Icon = tab.icon;
                                const count = recipesByTab.get(tab.id)?.length ?? 0;
                                const active = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex h-12 min-w-0 items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                                            active
                                                ? "border-amber-300 bg-amber-300/18 text-amber-100 shadow-[0_0_18px_rgba(245,177,44,0.28)]"
                                                : "border-[#4c3519] bg-black/20 text-stone-300 hover:border-amber-300/40 hover:text-amber-100"
                                        }`}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{tab.label}</span>
                                        <span className="shrink-0 text-xs text-stone-400">
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <label className="relative h-12 shrink-0 lg:w-[310px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500" />
                            <input
                                value={searchText}
                                onChange={(event) => setSearchText(event.target.value)}
                                placeholder="Buscar item..."
                                className="h-full w-full rounded-md border border-[#4c3519] bg-black/25 pl-10 pr-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-amber-300/70"
                            />
                        </label>
                    </div>

                    <div className="grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="max-h-[300px] min-h-[220px] overflow-y-auto rounded-lg border border-[#4c3519] bg-black/18 p-2 lg:max-h-none">
                            {visibleRecipes.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                    {visibleRecipes.map((recipe) => {
                                        const recipeKey = getRecipeKey(recipe);
                                        const active = recipeKey === selectedKey;

                                        return (
                                            <button
                                                key={recipeKey}
                                                type="button"
                                                onClick={() => setSelectedKey(recipeKey)}
                                                className={`grid h-[116px] grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-lg border p-2 text-left transition ${
                                                    active
                                                        ? "border-amber-300 bg-[#3a250f] shadow-[0_0_16px_rgba(245,177,44,0.25)]"
                                                        : "border-[#4c3519] bg-[#17100b] hover:border-amber-300/45"
                                                }`}
                                            >
                                                <div className="flex h-[58px] w-[58px] items-center justify-center rounded-md border border-white/10 bg-black/30">
                                                    <ItemGraphic
                                                        graphicData={
                                                            graphicsDB?.[
                                                                String(recipe.grhIndex)
                                                            ]
                                                        }
                                                        name={recipe.name}
                                                        size={50}
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold text-[#f5e6c8]">
                                                        {recipe.name}
                                                    </div>
                                                    <div className="mt-1 truncate text-xs text-stone-400">
                                                        {recipe.category} | Skill {recipe.skill}
                                                    </div>
                                                    <div className="mt-2 flex items-center gap-1 text-sm font-semibold text-amber-200">
                                                        <Coins className="h-4 w-4 shrink-0" />
                                                        <span>{formatAmount(recipe.goldCost)} oro</span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-stone-400">
                                    No hay recetas para mostrar.
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col rounded-lg border border-[#5d421f] bg-[#170f09] lg:min-h-0">
                            {selectedRecipe ? (
                                <>
                                    <div className="grid grid-cols-[76px_minmax(0,1fr)] gap-3 border-b border-[#4c3519] p-3">
                                        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-lg border border-amber-300/30 bg-black/30">
                                            <ItemGraphic
                                                graphicData={
                                                    graphicsDB?.[
                                                        String(
                                                            selectedRecipe.grhIndex,
                                                        )
                                                    ]
                                                }
                                                name={selectedRecipe.name}
                                                size={68}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-lg font-semibold text-[#f5e6c8]">
                                                {selectedRecipe.name}
                                            </div>
                                            <div className="mt-1 text-sm text-stone-400">
                                                {selectedRecipe.category} | Skill{" "}
                                                {selectedRecipe.skill}
                                            </div>
                                            {selectedRecipe.stats ? (
                                                <div className="mt-2 text-sm text-stone-300">
                                                    {selectedRecipe.stats}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="p-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
                                        <div className="mb-2 flex items-center justify-between text-sm">
                                            <span className="font-semibold text-amber-200">
                                                Materiales
                                            </span>
                                            <span
                                                className={
                                                    hasMaterials
                                                        ? "text-emerald-300"
                                                        : "text-rose-300"
                                                }
                                            >
                                                {hasMaterials ? "Listo" : "Faltan"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedRecipe.materials.map((material) => {
                                                const owned =
                                                    inventoryCounts.get(
                                                        material.itemId,
                                                    ) ?? 0;
                                                const required =
                                                    material.amount * craftAmount;
                                                const enough = owned >= required;

                                                return (
                                                    <div
                                                        key={`${getRecipeKey(
                                                            selectedRecipe,
                                                        )}-${material.itemId}`}
                                                        className={`rounded-lg border p-2 ${
                                                            enough
                                                                ? "border-emerald-400/30 bg-emerald-950/10"
                                                                : "border-rose-400/35 bg-rose-950/10"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-black/25">
                                                                <ItemGraphic
                                                                    graphicData={
                                                                        graphicsDB?.[
                                                                            String(
                                                                                material.grhIndex,
                                                                            )
                                                                        ]
                                                                    }
                                                                    name={
                                                                        material.name
                                                                    }
                                                                    size={32}
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="truncate text-xs font-semibold text-stone-100">
                                                                    {material.name}
                                                                </div>
                                                                <div
                                                                    className={`text-sm font-semibold ${
                                                                        enough
                                                                            ? "text-emerald-300"
                                                                            : "text-rose-300"
                                                                    }`}
                                                                >
                                                                    {formatAmount(
                                                                        owned,
                                                                    )}{" "}
                                                                    /{" "}
                                                                    {formatAmount(
                                                                        required,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="shrink-0 border-t border-[#4c3519] p-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="rounded-lg border border-[#4c3519] bg-black/20 p-2">
                                                <div className="text-stone-400">
                                                    Oro requerido
                                                </div>
                                                <div
                                                    className={`mt-1 flex items-center gap-1 font-semibold ${
                                                        hasGold
                                                            ? "text-amber-200"
                                                            : "text-rose-300"
                                                    }`}
                                                >
                                                    <Coins className="h-4 w-4" />
                                                    {formatAmount(totalGoldCost)}
                                                </div>
                                            </div>
                                            <div className="rounded-lg border border-[#4c3519] bg-black/20 p-2">
                                                <div className="text-stone-400">
                                                    Maximo posible
                                                </div>
                                                <div className="mt-1 font-semibold text-stone-100">
                                                    {formatAmount(maxCraftable)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-[40px_minmax(0,1fr)_40px] gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setAmount(craftAmount - 1)}
                                                className="flex h-10 items-center justify-center rounded-md border border-[#6b4b21] bg-black/20 text-stone-200 transition hover:border-amber-300/50"
                                                aria-label="Restar cantidad"
                                                title="Restar cantidad"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <input
                                                value={amountText}
                                                onChange={(event) =>
                                                    setAmountText(
                                                        event.target.value.replace(
                                                            /[^0-9]/g,
                                                            "",
                                                        ) || "1",
                                                    )
                                                }
                                                onBlur={() => setAmount(craftAmount)}
                                                className="h-10 rounded-md border border-[#6b4b21] bg-black/25 px-3 text-center text-lg font-semibold text-stone-100 outline-none focus:border-amber-300/70"
                                                inputMode="numeric"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setAmount(craftAmount + 1)}
                                                className="flex h-10 items-center justify-center rounded-md border border-[#6b4b21] bg-black/20 text-stone-200 transition hover:border-amber-300/50"
                                                aria-label="Sumar cantidad"
                                                title="Sumar cantidad"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onCraftRequest(
                                                    selectedRecipe.profession,
                                                    selectedRecipe.itemId,
                                                    craftAmount,
                                                )
                                            }
                                            disabled={!canCraft}
                                            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-md border border-amber-300/70 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-4 text-lg font-bold text-[#2a1704] transition hover:brightness-110 disabled:cursor-not-allowed disabled:border-stone-700 disabled:bg-none disabled:bg-stone-800 disabled:text-stone-500"
                                        >
                                            <Hammer className="h-5 w-5" />
                                            Fabricar
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex min-h-[320px] items-center justify-center text-sm text-stone-400">
                                    Selecciona una receta.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
