import type { Metadata } from "next";
import Link from "next/link";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import { WikiCatalogToolbar, WikiEmpty, WikiPageHeader, WikiPagination, WikiSelect, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatPercent, formatWikiNumber, getPositiveInteger, getSearchParam, matchesWikiQuery, paginate, type WikiSearchParams } from "@/lib/wiki-query";

export const metadata: Metadata = buildPageMetadata({ title: "Recetas - World of Argentum Wiki", description: "Recetas de crafting con nivel, materiales, oro y probabilidad de obtención.", path: "/wiki/recetas" });

export default async function WikiRecipesPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const wiki = await getWikiData();
    const query = getSearchParam(params, "q");
    const level = getSearchParam(params, "nivel");
    const order = getSearchParam(params, "orden") || "nivel";
    const filtered = wiki.recipes.filter((recipe) => !level || recipe.level === Number(level)).filter((recipe) => matchesWikiQuery(recipe.searchIndex, query)).sort((left, right) => order === "nombre" ? left.itemName.localeCompare(right.itemName, "es") : order === "oro" ? right.goldCost - left.goldCost : left.level - right.level || left.itemName.localeCompare(right.itemName, "es"));
    const result = paginate(filtered, getPositiveInteger(getSearchParam(params, "page")), 24);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Crafting", href: "/wiki/crafting" }, { label: "Recetas" }]} />
            <WikiPageHeader eyebrow="Crafting" title="Recetas" description="Sólo aparecen objetos que tienen una receta activa en el sistema actual." count={`${result.total} recetas`} />
            <WikiCatalogToolbar action="/wiki/recetas" query={query} placeholder="Buscar receta, objeto o material...">
                <WikiSelect name="nivel" value={level} label="Nivel" options={[{ value: "", label: "Todos los niveles" }, ...[10, 20, 30, 40, 50].map((value) => ({ value: String(value), label: `Nivel ${value}` }))]} />
                <WikiSelect name="orden" value={order} label="Orden" options={[{ value: "nivel", label: "Nivel" }, { value: "nombre", label: "Nombre" }, { value: "oro", label: "Mayor costo" }]} />
            </WikiCatalogToolbar>
            {result.items.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((recipe) => (
                        <Link key={recipe.id} href={`/wiki/recetas/${recipe.id}`} className="group flex min-h-[92px] items-center gap-3 border border-amber-200/12 bg-[#0a0806] p-3 hover:border-amber-300/45">
                            <WikiItemSprite grhIndex={recipe.itemGrhIndex} name={recipe.itemName} size={56} />
                            <span className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-stone-100 group-hover:text-amber-100">{recipe.itemName}</strong>
                                <span className="mt-1 flex flex-wrap gap-1.5"><WikiTag>Nivel {recipe.level}</WikiTag><WikiTag>{recipe.category}</WikiTag></span>
                                <span className="mt-1.5 block text-[11px] text-stone-500">{formatWikiNumber(recipe.goldCost)} oro · drop {formatPercent(recipe.dropChancePercent)}</span>
                            </span>
                        </Link>
                    ))}
                </div>
            ) : <div className="mt-4"><WikiEmpty>No encontramos recetas con esos filtros.</WikiEmpty></div>}
            <WikiPagination pathname="/wiki/recetas" page={result.page} pageCount={result.pageCount} searchParams={params} />
        </div>
    );
}
