import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import { WikiDefinitionList, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatWikiNumber, getEntityId } from "@/lib/wiki-query";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const wiki = await getWikiData();
    const map = wiki.maps.find((entry) => entry.id === getEntityId(id));
    if (!map) return {};
    return buildPageMetadata({ title: `${map.name} (Mapa ${map.id}) - World of Argentum Wiki`, description: map.info || `Criaturas y datos públicos del mapa ${map.id}: ${map.name}.`, path: `/wiki/mapas/${map.id}`, imagePath: map.hasPreview ? `/imgs_maps/${map.id}.png` : undefined });
}

export default async function WikiMapPage({ params }: PageProps) {
    const { id } = await params;
    const wiki = await getWikiData();
    const map = wiki.maps.find((entry) => entry.id === getEntityId(id));
    if (!map) notFound();
    const relatedQuests = wiki.quests.filter((quest) => quest.givers.some((giver) => giver.maps.some((entry) => entry.mapId === map.id)));
    const jsonLd = { "@context": "https://schema.org", "@type": "Place", name: map.name, description: map.info, url: absoluteUrl(`/wiki/mapas/${map.id}`), identifier: String(map.id) };

    return (
        <div>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <WikiBreadcrumbs items={[{ label: "Mundo", href: "/wiki/mundo" }, { label: "Mapas", href: "/wiki/mapas" }, { label: map.name }]} />
            <WikiPageHeader eyebrow={`Mapa ${map.id}`} title={map.name} description={map.info || "Este mapa no tiene una descripción pública."} />

            <div className="mt-6 grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
                <div className="space-y-5">
                    <WikiSection title="Vista previa">
                        <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden border border-amber-200/15 bg-black">
                            {map.hasPreview ? <Image src={`/imgs_maps/${map.id}.png`} alt={`Vista previa del mapa ${map.id}`} fill priority sizes="300px" className="object-cover [image-rendering:pixelated]" /> : <span className="absolute inset-0 grid place-items-center text-sm text-stone-600">Vista previa no disponible</span>}
                        </div>
                    </WikiSection>
                    <WikiSection title="Datos del mapa">
                        <WikiDefinitionList rows={[
                            { label: "ID", value: map.id },
                            { label: "Terreno", value: map.terreno || "-" },
                            { label: "Zona", value: map.zona || "-" },
                            { label: "Seguridad", value: map.restringir === "Sin datos actuales" ? "No informada" : map.pk ? "Zona segura" : "Zona peligrosa" },
                            { label: "Nivel", value: map.minLevel || map.maxLevel ? `${map.minLevel || 1} - ${map.maxLevel || "sin máximo"}` : "Sin requisito" },
                        ]} />
                    </WikiSection>
                </div>

                <div className="space-y-5">
                    <WikiSection title="Criaturas y NPC">
                        {map.npcs.length ? (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {map.npcs.map((npc) => (
                                    <Link key={npc.npcId} href={`/wiki/npcs/${npc.npcId}`} className="flex items-center justify-between gap-3 border border-amber-200/12 bg-black/20 px-3 py-2.5 hover:border-amber-300/40">
                                        <span className="min-w-0">
                                            <strong className="block truncate text-sm text-stone-200">{npc.npcName}</strong>
                                            <span className="text-[11px] text-stone-500">{npc.isCombatNpc ? `${formatWikiNumber(npc.maxHp)} vida · ${formatWikiNumber(npc.expReward)} EXP` : "NPC de servicio"}</span>
                                        </span>
                                        <WikiTag>{npc.spawns} spawn</WikiTag>
                                    </Link>
                                ))}
                            </div>
                        ) : <p className="text-sm text-stone-500">No hay NPC públicos registrados en este mapa.</p>}
                    </WikiSection>

                    {map.creatures ? <WikiSection title="Descripción de criaturas"><p className="text-sm leading-6 text-stone-300">{map.creatures}</p></WikiSection> : null}

                    {relatedQuests.length ? (
                        <WikiSection title="Misiones relacionadas">
                            <div className="flex flex-wrap gap-2">
                                {relatedQuests.map((quest) => <Link key={quest.id} href={`/wiki/misiones/${quest.id}`} className="border border-amber-200/15 px-3 py-2 text-xs text-stone-300 hover:text-amber-100">{quest.name}</Link>)}
                            </div>
                        </WikiSection>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
