import Link from "next/link";
import { ArrowRight, Dices, HeartPulse, Layers3, ScrollText } from "lucide-react";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import { WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { getCraftingRecipeDropRule } from "@/lib/crafting-rules";
import { getWikiData } from "@/lib/wiki-data";
import { formatPercent, formatWikiNumber } from "@/lib/wiki-query";
import type { WikiRecipe } from "@/lib/wiki";

type RecipeTier = {
    level: number;
    chance: number;
    minNpcMaxHpExclusive: number;
    recipes: WikiRecipe[];
    categories: string[];
};

function buildRecipeTiers(recipes: WikiRecipe[]): RecipeTier[] {
    const levels = Array.from(new Set(recipes.map((recipe) => recipe.level))).sort(
        (left, right) => left - right,
    );

    return levels.map((level) => {
        const tierRecipes = recipes.filter((recipe) => recipe.level === level);
        const dropRule = getCraftingRecipeDropRule(level);
        return {
            level,
            chance: dropRule?.chancePercent ?? tierRecipes[0]?.dropChancePercent ?? 0,
            minNpcMaxHpExclusive: dropRule?.minNpcMaxHpExclusive ?? 0,
            recipes: tierRecipes,
            categories: Array.from(
                new Set(tierRecipes.map((recipe) => recipe.category)),
            ).sort((left, right) => left.localeCompare(right, "es")),
        };
    });
}

function getCategoryHighlights(recipes: WikiRecipe[]) {
    const categories = new Map<string, WikiRecipe[]>();
    for (const recipe of recipes) {
        const entries = categories.get(recipe.category) ?? [];
        entries.push(recipe);
        categories.set(recipe.category, entries);
    }

    return Array.from(categories.entries())
        .map(([category, entries]) => ({
            category,
            count: entries.length,
            example: entries[0],
        }))
        .sort((left, right) => right.count - left.count);
}

export default async function WikiCraftingGuide() {
    const wiki = await getWikiData();
    const tiers = buildRecipeTiers(wiki.recipes);
    const categoryHighlights = getCategoryHighlights(wiki.recipes);

    return (
        <div className="mt-6 space-y-5">
            <WikiSection title="Niveles y probabilidad de drop">
                <div className="flex gap-3 border-b border-amber-200/12 pb-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center border border-amber-300/25 bg-amber-300/8 text-amber-200">
                        <Dices className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h2 className="font-[var(--font-cinzel)] text-base font-semibold text-stone-100">
                            Cada nivel tiene su propio sorteo
                        </h2>
                        <p className="mt-1 max-w-4xl text-sm leading-6 text-stone-400">
                            Al derrotar un NPC hostil elegible, el servidor comprueba por separado cada nivel cuyo requisito de vida máxima supera. Si el sorteo acierta, entrega una receta al azar de ese grupo.
                        </p>
                    </div>
                </div>

                <div className="mt-4 overflow-hidden border border-amber-200/12">
                    <div className="hidden grid-cols-[84px_156px_minmax(0,1fr)_150px_32px] items-center gap-4 border-b border-amber-200/12 bg-amber-200/[0.035] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-stone-500 md:grid">
                        <span>Nivel</span>
                        <span>Ejemplos</span>
                        <span>Contenido del grupo</span>
                        <span>Drop del nivel</span>
                        <span />
                    </div>
                    <div className="divide-y divide-amber-200/10">
                        {tiers.map((tier) => {
                            const averageAttempts = tier.chance > 0
                                ? Math.round(100 / tier.chance)
                                : 0;

                            return (
                                <Link
                                    key={tier.level}
                                    href={`/wiki/recetas?nivel=${tier.level}`}
                                    className="group grid min-h-[108px] grid-cols-[72px_minmax(0,1fr)] gap-3 bg-black/20 px-3 py-3 transition hover:bg-amber-300/[0.045] md:grid-cols-[84px_156px_minmax(0,1fr)_150px_32px] md:items-center md:gap-4 md:px-4"
                                >
                                    <div className="self-stretch border-r border-amber-200/10 pr-3 md:self-center">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-stone-600">
                                            Recetas
                                        </span>
                                        <strong className="mt-1 block font-[var(--font-cinzel)] text-2xl text-amber-100">
                                            {tier.level}
                                        </strong>
                                    </div>

                                    <div className="hidden items-center gap-2 md:flex">
                                        {tier.recipes.slice(0, 3).map((recipe) => (
                                            <WikiItemSprite
                                                key={recipe.id}
                                                grhIndex={recipe.itemGrhIndex}
                                                name={recipe.itemName}
                                                size={44}
                                            />
                                        ))}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <strong className="text-sm text-stone-100">
                                                {tier.recipes.length} recetas activas
                                            </strong>
                                            <span className="text-xs font-semibold text-amber-200 md:hidden">
                                                {formatPercent(tier.chance)} de drop
                                            </span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {tier.categories.map((category) => (
                                                <WikiTag key={category}>{category}</WikiTag>
                                            ))}
                                        </div>
                                        <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-300/80">
                                            <HeartPulse className="h-3.5 w-3.5" aria-hidden />
                                            NPC con más de {formatWikiNumber(tier.minNpcMaxHpExclusive)} de vida máxima
                                        </span>
                                    </div>

                                    <div className="col-start-2 border-t border-amber-200/10 pt-2 md:col-start-auto md:border-0 md:pt-0">
                                        <strong className="hidden text-lg text-amber-200 md:block">
                                            {formatPercent(tier.chance)}
                                        </strong>
                                        <span className="text-[11px] leading-4 text-stone-500">
                                            Promedio teórico: 1 acierto cada {averageAttempts} intentos elegibles.
                                        </span>
                                    </div>

                                    <ArrowRight className="hidden h-4 w-4 text-stone-600 transition group-hover:translate-x-0.5 group-hover:text-amber-200 md:block" aria-hidden />
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <p className="mt-3 text-xs leading-5 text-stone-500">
                    El requisito de vida es estricto: un NPC con exactamente el valor indicado todavía no habilita ese nivel. El porcentaje pertenece al grupo completo, no a cada receta individual, y cada intento es independiente.
                </p>
            </WikiSection>

            <WikiSection title="Catálogo de recetas">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center border border-amber-300/25 bg-amber-300/8 text-amber-200">
                                <ScrollText className="h-5 w-5" aria-hidden />
                            </span>
                            <div className="min-w-0">
                                <h2 className="font-[var(--font-cinzel)] text-lg font-semibold text-stone-100">
                                    Todas las recetas fabricables
                                </h2>
                                <p className="mt-1 text-sm text-stone-400">
                                    Consultá el resultado, los materiales, el oro y la receta aprendible de cada objeto.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {categoryHighlights.map(({ category, count }) => (
                                <Link
                                    key={category}
                                    href={`/wiki/recetas?categoria=${encodeURIComponent(category)}`}
                                    className="border border-amber-200/15 bg-black/20 px-3 py-2 text-xs text-stone-300 transition hover:border-amber-300/45 hover:text-amber-100"
                                >
                                    {category} <span className="ml-1 text-stone-600">{count}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex gap-2" aria-hidden>
                            {categoryHighlights.slice(0, 5).map(({ category, example }) => (
                                <WikiItemSprite
                                    key={category}
                                    grhIndex={example.itemGrhIndex}
                                    name={example.itemName}
                                    size={48}
                                />
                            ))}
                        </div>
                        <Link
                            href="/wiki/recetas"
                            className="inline-flex h-12 items-center justify-center gap-2 border border-amber-300/50 bg-amber-300/12 px-5 text-sm font-semibold text-amber-100 transition hover:bg-amber-300/20"
                        >
                            <Layers3 className="h-4 w-4" aria-hidden />
                            Ver {wiki.recipes.length} recetas
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                </div>
            </WikiSection>
        </div>
    );
}
