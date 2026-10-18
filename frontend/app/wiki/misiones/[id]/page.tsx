import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import { WikiDefinitionList, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatWikiNumber, getEntityId } from "@/lib/wiki-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const wiki = await getWikiData();
    const quest = wiki.quests.find((entry) => entry.id === getEntityId(id));
    return quest ? buildPageMetadata({ title: `${quest.name} - World of Argentum Wiki`, description: quest.description || `Objetivos y recompensas de la misión ${quest.name}.`, path: `/wiki/misiones/${quest.id}` }) : {};
}

export default async function WikiMissionPage({ params }: PageProps) {
    const { id } = await params;
    const wiki = await getWikiData();
    const quest = wiki.quests.find((entry) => entry.id === getEntityId(id));
    if (!quest) notFound();

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Misiones", href: "/wiki/misiones" }, { label: quest.name }]} />
            <WikiPageHeader eyebrow={`Misión #${quest.id}`} title={quest.name} description={quest.description || "Esta misión no tiene una descripción pública."} />
            <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="space-y-5">
                    <WikiSection title="Información">
                        <WikiDefinitionList rows={[
                            { label: "Nivel requerido", value: quest.requiredLevel },
                            { label: "Oro", value: formatWikiNumber(quest.rewardGold) },
                            { label: "Experiencia", value: formatWikiNumber(quest.rewardExp) },
                            { label: "Puntos de canje", value: formatWikiNumber(quest.rewardPoints) },
                        ]} />
                    </WikiSection>
                    {quest.givers.length ? (
                        <WikiSection title="NPC que la ofrece">
                            <div className="space-y-2">{quest.givers.map((giver) => <div key={giver.npcId} className="border border-amber-200/12 p-3"><Link href={`/wiki/npcs/${giver.npcId}`} className="font-semibold text-amber-200 hover:text-amber-100">{giver.npcName}</Link><div className="mt-2 flex flex-wrap gap-1.5">{giver.maps.map((map) => <Link key={map.mapId} href={`/wiki/mapas/${map.mapId}`}><WikiTag>{map.mapName} #{map.mapId}</WikiTag></Link>)}</div></div>)}</div>
                        </WikiSection>
                    ) : null}
                </div>

                <div className="space-y-5">
                    <WikiSection title="Objetivos">
                        <div className="grid gap-2 sm:grid-cols-2">
                            {quest.requiredNpcs.map((npc) => <Link key={`npc-${npc.npcId}`} href={`/wiki/npcs/${npc.npcId}`} className="flex items-center justify-between border border-amber-200/12 bg-black/20 px-3 py-3 text-sm hover:border-amber-300/40"><span>{npc.npcName}</span><WikiTag>x{npc.amount}</WikiTag></Link>)}
                            {quest.requiredObjects.map((item) => <Link key={`item-${item.itemId}`} href={`/wiki/objetos/${item.itemId}`} className="flex items-center justify-between border border-amber-200/12 bg-black/20 px-3 py-3 text-sm hover:border-amber-300/40"><span>{item.itemName}</span><WikiTag>x{item.amount}</WikiTag></Link>)}
                        </div>
                    </WikiSection>
                    <WikiSection title="Recompensas">
                        <div className="flex flex-wrap gap-2 text-sm">
                            {quest.rewardGold > 0 ? <WikiTag>{formatWikiNumber(quest.rewardGold)} oro</WikiTag> : null}
                            {quest.rewardExp > 0 ? <WikiTag>{formatWikiNumber(quest.rewardExp)} EXP</WikiTag> : null}
                            {quest.rewardPoints > 0 ? <WikiTag>{formatWikiNumber(quest.rewardPoints)} puntos de canje</WikiTag> : null}
                        </div>
                        {quest.rewardObjects.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{quest.rewardObjects.map((item) => <Link key={item.itemId} href={`/wiki/objetos/${item.itemId}`} className="flex items-center gap-3 border border-amber-200/12 bg-black/20 p-2.5 hover:border-amber-300/40"><WikiItemSprite grhIndex={item.grhIndex} name={item.itemName} size={44} /><span><strong className="block text-sm text-stone-200">{item.itemName}</strong><span className="text-xs text-stone-500">Cantidad: {formatWikiNumber(item.amount)}</span></span></Link>)}</div> : null}
                    </WikiSection>
                </div>
            </div>
        </div>
    );
}
