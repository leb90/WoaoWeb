import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import WikiNpcSprite from "@/components/wiki/WikiNpcSprite";
import { WikiDefinitionList, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatPercent, formatWikiNumber, getEntityId } from "@/lib/wiki-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const wiki = await getWikiData();
    const npc = wiki.npcs.find((entry) => entry.id === getEntityId(id));
    if (!npc) return {};
    return buildPageMetadata({ title: `${npc.name} - World of Argentum Wiki`, description: npc.description || `Ubicación, drops y estadísticas de ${npc.name}.`, path: `/wiki/npcs/${npc.id}` });
}

export default async function WikiNpcPage({ params }: PageProps) {
    const { id } = await params;
    const wiki = await getWikiData();
    const npc = wiki.npcs.find((entry) => entry.id === getEntityId(id));
    if (!npc) notFound();

    const objectById = new Map(wiki.objects.map((item) => [item.id, item]));
    const relatedQuests = wiki.quests.filter((quest) => quest.requiredNpcs.some((entry) => entry.npcId === npc.id) || quest.givers.some((giver) => giver.npcId === npc.id));
    const relatedSpells = wiki.spells.filter((spell) => spell.sources.some((source) => source.soldBy.some((seller) => seller.npcId === npc.id) || source.droppedBy.some((dropper) => dropper.npcId === npc.id)));
    const jsonLd = { "@context": "https://schema.org", "@type": "Thing", name: npc.name, description: npc.description, url: absoluteUrl(`/wiki/npcs/${npc.id}`), identifier: String(npc.id) };

    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <WikiBreadcrumbs items={[{ label: "Enciclopedia", href: "/wiki/enciclopedia" }, { label: "NPC", href: "/wiki/npcs" }, { label: npc.name }]} />
            <WikiPageHeader eyebrow={`NPC #${npc.id}`} title={npc.name} description={npc.description || "Este NPC no tiene una descripción pública."} />

            <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                <WikiSection title="Información">
                    <div className="flex flex-col items-center py-2">
                        <WikiNpcSprite bodyId={npc.bodyId} headId={npc.headId} name={npc.name} width={220} height={220} />
                        <div className="mt-3"><WikiTag>{npc.npcTypeLabel}</WikiTag></div>
                    </div>
                    <WikiDefinitionList rows={[
                        { label: "ID", value: npc.id },
                        { label: "Vida", value: formatWikiNumber(npc.maxHp) },
                        { label: "EXP", value: formatWikiNumber(npc.expReward) },
                        { label: "Oro", value: formatWikiNumber(npc.goldReward) },
                        { label: "Daño", value: npc.maxHit ? `${npc.minHit} - ${npc.maxHit}` : "-" },
                        { label: "Defensa", value: npc.defense || "-" },
                    ]} />
                </WikiSection>

                <div className="space-y-5">
                    <WikiSection title="Dónde aparece">
                        {npc.maps.length ? <div className="grid gap-2 sm:grid-cols-2">
                            {npc.maps.map((map) => (
                                <Link key={map.mapId} href={`/wiki/mapas/${map.mapId}`} className="flex items-center justify-between border border-amber-200/12 bg-black/20 px-3 py-2.5 text-sm hover:border-amber-300/40">
                                    <span className="text-stone-200">{map.mapName}</span>
                                    <span className="text-xs text-stone-500">Mapa {map.mapId} · {map.spawns} spawn</span>
                                </Link>
                            ))}
                        </div> : <p className="text-sm text-stone-500">No hay una ubicación pública confirmada para este NPC.</p>}
                    </WikiSection>

                    {npc.drops.length ? <WikiItemRelations title="Drops" items={npc.drops} objectById={objectById} showChance /> : null}
                    {npc.sells.length ? <WikiItemRelations title="Comercio" items={npc.sells} objectById={objectById} /> : null}

                    {relatedQuests.length || relatedSpells.length ? (
                        <WikiSection title="También puede interesarte">
                            <div className="flex flex-wrap gap-2">
                                {relatedQuests.map((quest) => <Link key={`quest-${quest.id}`} href={`/wiki/misiones/${quest.id}`} className="border border-amber-200/15 px-3 py-2 text-xs text-stone-300 hover:text-amber-100">Misión: {quest.name}</Link>)}
                                {relatedSpells.map((spell) => <Link key={`spell-${spell.id}`} href={`/wiki/hechizos/${spell.id}`} className="border border-amber-200/15 px-3 py-2 text-xs text-stone-300 hover:text-amber-100">Hechizo: {spell.name}</Link>)}
                            </div>
                        </WikiSection>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function WikiItemRelations({ title, items, objectById, showChance = false }: { title: string; items: Array<{ itemId: number; itemName: string; quantity: number; chancePercent?: number }>; objectById: Map<number, { grhIndex: number }>; showChance?: boolean }) {
    return (
        <WikiSection title={title}>
            <div className="grid gap-2 sm:grid-cols-2">
                {items.map((item, index) => (
                    <Link key={`${title}-${item.itemId}-${index}`} href={`/wiki/objetos/${item.itemId}`} className="flex items-center gap-3 border border-amber-200/12 bg-black/20 p-2.5 hover:border-amber-300/40">
                        <WikiItemSprite grhIndex={objectById.get(item.itemId)?.grhIndex ?? 0} name={item.itemName} size={42} />
                        <span className="min-w-0 flex-1">
                            <strong className="block truncate text-sm text-stone-200">{item.itemName}</strong>
                            <span className="text-xs text-stone-500">x{item.quantity}{showChance ? ` · ${formatPercent(item.chancePercent)}` : ""}</span>
                        </span>
                    </Link>
                ))}
            </div>
        </WikiSection>
    );
}
