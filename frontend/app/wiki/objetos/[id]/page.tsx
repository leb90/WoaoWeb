import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import { WikiDefinitionList, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatPercent, formatWikiNumber, getEntityId } from "@/lib/wiki-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const wiki = await getWikiData();
    const item = wiki.objects.find((entry) => entry.id === getEntityId(id));
    if (!item) return {};
    return buildPageMetadata({ title: `${item.name} - World of Argentum Wiki`, description: item.description || `Cómo obtener ${item.name}, sus estadísticas y usos.`, path: `/wiki/objetos/${item.id}` });
}

export default async function WikiObjectPage({ params }: PageProps) {
    const { id } = await params;
    const wiki = await getWikiData();
    const item = wiki.objects.find((entry) => entry.id === getEntityId(id));
    if (!item) notFound();

    const relatedQuests = wiki.quests.filter((quest) => quest.requiredObjects.some((entry) => entry.itemId === item.id) || quest.rewardObjects.some((entry) => entry.itemId === item.id));
    const statRows: Array<{ label: string; value: string | number }> = [];
    if (item.value > 0) statRows.push({ label: "Valor", value: `${formatWikiNumber(item.value)} oro` });
    if (item.maxHit > 0) statRows.push({ label: "Daño", value: `${item.minHit} - ${item.maxHit}` });
    if (item.maxDef > 0) statRows.push({ label: "Defensa", value: `${item.minDef} - ${item.maxDef}` });
    if (item.maxDefMag > 0) statRows.push({ label: "Defensa mágica", value: `${item.minDefMag} - ${item.maxDefMag}` });
    if (item.magicResistance > 0) statRows.push({ label: "Resistencia mágica", value: item.magicResistance });
    if (item.minSkill > 0) statRows.push({ label: "Habilidad mínima", value: item.minSkill });
    if (item.tier > 0) statRows.push({ label: "Tier", value: item.tier });
    const jsonLd = { "@context": "https://schema.org", "@type": "Thing", name: item.name, description: item.description, url: absoluteUrl(`/wiki/objetos/${item.id}`), identifier: String(item.id) };

    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <WikiBreadcrumbs items={[{ label: "Enciclopedia", href: "/wiki/enciclopedia" }, { label: "Objetos", href: "/wiki/objetos" }, { label: item.name }]} />
            <WikiPageHeader eyebrow={`Objeto #${item.id}`} title={item.name} description={item.description || "Este objeto no tiene una descripción pública."} />

            <div className="mt-6 grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                <WikiSection title="Objeto">
                    <div className="flex flex-col items-center py-3 text-center">
                        <WikiItemSprite grhIndex={item.grhIndex} name={item.name} size={112} />
                        <div className="mt-4"><WikiTag>{item.objTypeLabel}</WikiTag></div>
                    </div>
                    <WikiDefinitionList rows={[{ label: "ID", value: item.id }, { label: "Tipo", value: item.objTypeLabel }, { label: "Newbie", value: item.newbie ? "Sí" : "No" }, ...statRows]} />
                </WikiSection>

                <div className="space-y-5">
                    <WikiSection title="Cómo conseguirlo">
                        {item.droppedBy.length || item.soldBy.length || item.craftedBy.length || relatedQuests.length ? (
                            <div className="grid gap-5 md:grid-cols-2">
                                {item.droppedBy.length ? <RelationList title="Drop de NPC" entries={item.droppedBy.map((npc) => ({ href: `/wiki/npcs/${npc.npcId}`, title: npc.npcName, detail: `x${npc.quantity} · ${formatPercent(npc.chancePercent)}` }))} /> : null}
                                {item.soldBy.length ? <RelationList title="Comerciantes" entries={item.soldBy.map((npc) => ({ href: `/wiki/npcs/${npc.npcId}`, title: npc.npcName, detail: `x${npc.quantity}` }))} /> : null}
                                {item.craftedBy.length ? <RelationList title="Crafting" entries={item.craftedBy.map((recipe) => ({ href: `/wiki/recetas/${recipe.recipeId}`, title: `Receta: ${recipe.itemName}`, detail: `Nivel ${recipe.level}` }))} /> : null}
                                {relatedQuests.length ? <RelationList title="Misiones" entries={relatedQuests.map((quest) => ({ href: `/wiki/misiones/${quest.id}`, title: quest.name, detail: quest.rewardObjects.some((reward) => reward.itemId === item.id) ? "Recompensa" : "Objetivo" }))} /> : null}
                            </div>
                        ) : <p className="text-sm text-stone-500">No hay una fuente pública registrada para este objeto.</p>}
                    </WikiSection>

                    {item.usedInRecipes.length ? (
                        <WikiSection title="Se utiliza en">
                            <RelationList title="Recetas relacionadas" entries={item.usedInRecipes.map((recipe) => ({ href: `/wiki/recetas/${recipe.recipeId}`, title: recipe.itemName, detail: `Receta nivel ${recipe.level}` }))} />
                        </WikiSection>
                    ) : null}

                    {item.spellId > 0 ? (
                        <WikiSection title="Magia relacionada">
                            <Link href={`/wiki/hechizos/${item.spellId}`} className="text-sm font-semibold text-amber-200 hover:text-amber-100">Ver hechizo asociado</Link>
                        </WikiSection>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function RelationList({ title, entries }: { title: string; entries: Array<{ href: string; title: string; detail: string }> }) {
    return (
        <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">{title}</h3>
            <ul className="mt-2 divide-y divide-amber-200/10 border-y border-amber-200/10">
                {entries.map((entry, index) => (
                    <li key={`${entry.href}-${entry.title}-${index}`}>
                        <Link href={entry.href} className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-amber-100">
                            <span className="min-w-0 truncate text-stone-200">{entry.title}</span>
                            <span className="shrink-0 text-xs text-stone-500">{entry.detail}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
