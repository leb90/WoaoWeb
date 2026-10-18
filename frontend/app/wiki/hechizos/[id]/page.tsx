import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import { WikiDefinitionList, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { getEntityId } from "@/lib/wiki-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const wiki = await getWikiData();
    const spell = wiki.spells.find((entry) => entry.id === getEntityId(id));
    return spell ? buildPageMetadata({ title: `${spell.name} - World of Argentum Wiki`, description: spell.description || `Requisitos y poder del hechizo ${spell.name}.`, path: `/wiki/hechizos/${spell.id}` }) : {};
}

export default async function WikiSpellPage({ params }: PageProps) {
    const { id } = await params;
    const wiki = await getWikiData();
    const spell = wiki.spells.find((entry) => entry.id === getEntityId(id));
    if (!spell) notFound();

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Hechizos", href: "/wiki/hechizos" }, { label: spell.name }]} />
            <WikiPageHeader eyebrow={`Hechizo #${spell.id}`} title={spell.name} description={spell.description || "Este hechizo no tiene una descripción pública."} />
            <div className="mt-6 grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
                <WikiSection title="Hechizo">
                    <div className="grid place-items-center py-5"><span className="grid h-24 w-24 place-items-center border border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-200"><Sparkles className="h-10 w-10" /></span><div className="mt-3"><WikiTag>{spell.typeLabel}</WikiTag></div></div>
                    <WikiDefinitionList rows={[
                        { label: "ID", value: spell.id },
                        { label: "Mana", value: spell.manaRequired },
                        { label: "Habilidad mínima", value: spell.minSkill || "-" },
                        { label: "Poder", value: spell.maxPower ? `${spell.minPower} - ${spell.maxPower}` : "-" },
                        { label: "Palabras mágicas", value: spell.words || "-" },
                    ]} />
                </WikiSection>
                <div className="space-y-5">
                    <WikiSection title="Cómo aprenderlo">
                        {spell.sources.length ? <div className="space-y-3">{spell.sources.map((source) => (
                            <div key={source.itemId} className="border border-amber-200/12 bg-black/20 p-3">
                                <Link href={`/wiki/objetos/${source.itemId}`} className="font-semibold text-amber-200 hover:text-amber-100">{source.itemName}</Link>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-stone-500">
                                    {source.soldBy.map((npc) => <Link key={`s-${npc.npcId}`} href={`/wiki/npcs/${npc.npcId}`} className="hover:text-stone-200">Vende: {npc.npcName}</Link>)}
                                    {source.droppedBy.map((npc) => <Link key={`d-${npc.npcId}`} href={`/wiki/npcs/${npc.npcId}`} className="hover:text-stone-200">Drop: {npc.npcName}</Link>)}
                                </div>
                            </div>
                        ))}</div> : <p className="text-sm text-stone-500">No hay una fuente pública registrada para este hechizo.</p>}
                    </WikiSection>
                </div>
            </div>
        </div>
    );
}
