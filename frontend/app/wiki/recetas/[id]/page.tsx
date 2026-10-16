import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import { WikiDefinitionList, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatPercent, formatWikiNumber, getEntityId } from "@/lib/wiki-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const wiki = await getWikiData();
    const recipe = wiki.recipes.find((entry) => entry.id === getEntityId(id));
    return recipe ? buildPageMetadata({ title: `Receta de ${recipe.itemName} - World of Argentum Wiki`, description: `Materiales, oro y nivel necesarios para fabricar ${recipe.itemName}.`, path: `/wiki/recetas/${recipe.id}` }) : {};
}

export default async function WikiRecipePage({ params }: PageProps) {
    const { id } = await params;
    const wiki = await getWikiData();
    const recipe = wiki.recipes.find((entry) => entry.id === getEntityId(id));
    if (!recipe) notFound();
    const objectById = new Map(wiki.objects.map((item) => [item.id, item]));
    const recipeItem = objectById.get(recipe.recipeItemId);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Crafting", href: "/wiki/crafting" }, { label: "Recetas", href: "/wiki/recetas" }, { label: recipe.itemName }]} />
            <WikiPageHeader eyebrow={`Receta #${recipe.id}`} title={recipe.itemName} description={`Fabricación de ${recipe.itemName} mediante el sistema de recetas aprendidas.`} />
            <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                <WikiSection title="Resultado">
                    <Link href={`/wiki/objetos/${recipe.itemId}`} className="flex flex-col items-center py-3 text-center hover:text-amber-100">
                        <WikiItemSprite grhIndex={recipe.itemGrhIndex} name={recipe.itemName} size={112} />
                        <strong className="mt-3 text-stone-100">{recipe.itemName}</strong>
                    </Link>
                    <WikiDefinitionList rows={[
                        { label: "Nivel requerido", value: recipe.level },
                        { label: "Categoría", value: recipe.category },
                        { label: "Oro", value: formatWikiNumber(recipe.goldCost) },
                        { label: "Drop de receta", value: formatPercent(recipe.dropChancePercent) },
                    ]} />
                </WikiSection>
                <div className="space-y-5">
                    <WikiSection title="Materiales requeridos">
                        <div className="grid gap-2 sm:grid-cols-2">
                            {recipe.materials.map((material) => (
                                <Link key={material.itemId} href={`/wiki/objetos/${material.itemId}`} className="flex items-center gap-3 border border-amber-200/12 bg-black/20 p-3 hover:border-amber-300/40">
                                    <WikiItemSprite grhIndex={material.grhIndex} name={material.itemName} size={48} />
                                    <span className="min-w-0 flex-1"><strong className="block truncate text-sm text-stone-200">{material.itemName}</strong><span className="text-xs text-stone-500">Cantidad: {formatWikiNumber(material.amount)}</span></span>
                                </Link>
                            ))}
                        </div>
                    </WikiSection>
                    {recipeItem ? (
                        <WikiSection title="Receta aprendible">
                            <Link href={`/wiki/objetos/${recipeItem.id}`} className="flex items-center gap-3 border border-amber-200/12 bg-black/20 p-3 hover:border-amber-300/40">
                                <WikiItemSprite grhIndex={recipeItem.grhIndex} name={recipeItem.name} size={48} />
                                <span><strong className="block text-sm text-amber-200">{recipe.recipeItemName}</strong><span className="text-xs text-stone-500">Objeto necesario para aprender esta fabricación.</span></span>
                            </Link>
                        </WikiSection>
                    ) : null}
                    <WikiSection title="Regla de obtención">
                        <p className="text-sm leading-6 text-stone-400">Las recetas de nivel <WikiTag>{recipe.level}</WikiTag> tienen una probabilidad base de drop de <strong className="text-amber-200">{formatPercent(recipe.dropChancePercent)}</strong>. El NPC concreto puede variar de forma aleatoria según el sistema vigente.</p>
                    </WikiSection>
                </div>
            </div>
        </div>
    );
}
