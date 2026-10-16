import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Map, ScrollText, Sparkles } from "lucide-react";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import WikiNpcSprite from "@/components/wiki/WikiNpcSprite";
import WikiSearchForm from "@/components/wiki/WikiSearchForm";
import { WikiEmpty, WikiPageHeader, WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { WIKI_CATEGORIES } from "@/lib/wiki-sections";
import { getSearchParam, matchesWikiQuery, type WikiSearchParams } from "@/lib/wiki-query";

export const metadata: Metadata = buildPageMetadata({ title: "Buscar - World of Argentum Wiki", description: "Buscador global de la Wiki oficial de World of Argentum.", path: "/wiki/buscar" });

export default async function WikiSearchPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const query = getSearchParam(params, "q").trim();
    const wiki = await getWikiData();
    const articles = query ? WIKI_CATEGORIES.filter((category) => matchesWikiQuery(`${category.label} ${category.description} ${category.links.join(" ")}`, query)).slice(0, 8) : [];
    const objects = query ? wiki.objects.filter((item) => matchesWikiQuery(item.searchIndex, query)).slice(0, 8) : [];
    const npcs = query ? wiki.npcs.filter((npc) => matchesWikiQuery(npc.searchIndex, query)).slice(0, 8) : [];
    const maps = query ? wiki.maps.filter((map) => matchesWikiQuery(`${map.searchIndex} ${map.info} ${map.creatures}`, query)).slice(0, 8) : [];
    const spells = query ? wiki.spells.filter((spell) => matchesWikiQuery(spell.searchIndex, query)).slice(0, 8) : [];
    const recipes = query ? wiki.recipes.filter((recipe) => matchesWikiQuery(recipe.searchIndex, query)).slice(0, 8) : [];
    const quests = query ? wiki.quests.filter((quest) => matchesWikiQuery(quest.searchIndex, query)).slice(0, 8) : [];
    const total = articles.length + objects.length + npcs.length + maps.length + spells.length + recipes.length + quests.length;

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Buscar" }]} />
            <WikiPageHeader eyebrow="Buscador global" title={query ? `Resultados para “${query}”` : "Buscar en la Wiki"} description="Buscá artículos, objetos, NPC, mapas, hechizos, recetas y misiones. El buscador ignora acentos y tolera errores leves de escritura." />
            <div className="mt-5"><WikiSearchForm defaultValue={query} /></div>

            {!query ? <div className="mt-6"><WikiEmpty>Escribí un nombre, número de mapa, criatura o material para comenzar.</WikiEmpty></div> : total === 0 ? <div className="mt-6"><WikiEmpty>No encontramos resultados públicos para “{query}”.</WikiEmpty></div> : (
                <div className="mt-6 space-y-5">
                    {articles.length ? <SearchGroup title="Guías" moreHref="/wiki">{articles.map((category) => <SimpleResult key={category.slug} href={`/wiki/${category.slug}`} title={category.label} description={category.description} icon={<BookOpen className="h-5 w-5" />} label="Guía" />)}</SearchGroup> : null}
                    {objects.length ? <SearchGroup title="Objetos" moreHref={`/wiki/objetos?q=${encodeURIComponent(query)}`}>{objects.map((item) => <Link key={item.id} href={`/wiki/objetos/${item.id}`} className="flex items-center gap-3 border border-amber-200/10 bg-black/20 p-3 hover:border-amber-300/40"><WikiItemSprite grhIndex={item.grhIndex} name={item.name} size={44} /><span className="min-w-0"><strong className="block truncate text-sm text-stone-200">{item.name}</strong><span className="text-xs text-stone-500">{item.objTypeLabel} · #{item.id}</span></span></Link>)}</SearchGroup> : null}
                    {npcs.length ? <SearchGroup title="NPC" moreHref={`/wiki/npcs?q=${encodeURIComponent(query)}`}>{npcs.map((npc) => <Link key={npc.id} href={`/wiki/npcs/${npc.id}`} className="flex items-center gap-3 border border-amber-200/10 bg-black/20 p-3 hover:border-amber-300/40"><WikiNpcSprite bodyId={npc.bodyId} headId={npc.headId} name={npc.name} width={48} height={48} /><span className="min-w-0"><strong className="block truncate text-sm text-stone-200">{npc.name}</strong><span className="text-xs text-stone-500">{npc.npcTypeLabel} · #{npc.id}</span></span></Link>)}</SearchGroup> : null}
                    {maps.length ? <SearchGroup title="Mapas" moreHref={`/wiki/mapas?q=${encodeURIComponent(query)}`}>{maps.map((map) => <Link key={map.id} href={`/wiki/mapas/${map.id}`} className="flex items-center gap-3 border border-amber-200/10 bg-black/20 p-3 hover:border-amber-300/40"><span className="relative h-11 w-11 shrink-0 overflow-hidden border border-amber-200/15 bg-black">{map.hasPreview ? <Image src={`/imgs_maps/${map.id}.png`} alt="" fill sizes="44px" className="object-cover [image-rendering:pixelated]" /> : <Map className="absolute inset-0 m-auto h-5 w-5 text-amber-300/50" />}</span><span className="min-w-0"><strong className="block truncate text-sm text-stone-200">{map.name}</strong><span className="text-xs text-stone-500">Mapa #{map.id} · {map.zona}</span></span></Link>)}</SearchGroup> : null}
                    {spells.length ? <SearchGroup title="Hechizos" moreHref={`/wiki/hechizos?q=${encodeURIComponent(query)}`}>{spells.map((spell) => <SimpleResult key={spell.id} href={`/wiki/hechizos/${spell.id}`} title={spell.name} description={`${spell.manaRequired} mana · Skill ${spell.minSkill}`} icon={<Sparkles className="h-5 w-5" />} label="Hechizo" />)}</SearchGroup> : null}
                    {recipes.length ? <SearchGroup title="Recetas" moreHref={`/wiki/recetas?q=${encodeURIComponent(query)}`}>{recipes.map((recipe) => <Link key={recipe.id} href={`/wiki/recetas/${recipe.id}`} className="flex items-center gap-3 border border-amber-200/10 bg-black/20 p-3 hover:border-amber-300/40"><WikiItemSprite grhIndex={recipe.itemGrhIndex} name={recipe.itemName} size={44} /><span className="min-w-0"><strong className="block truncate text-sm text-stone-200">{recipe.itemName}</strong><span className="text-xs text-stone-500">Receta nivel {recipe.level}</span></span></Link>)}</SearchGroup> : null}
                    {quests.length ? <SearchGroup title="Misiones" moreHref={`/wiki/misiones?q=${encodeURIComponent(query)}`}>{quests.map((quest) => <SimpleResult key={quest.id} href={`/wiki/misiones/${quest.id}`} title={quest.name} description={`Nivel ${quest.requiredLevel}`} icon={<ScrollText className="h-5 w-5" />} label="Misión" />)}</SearchGroup> : null}
                </div>
            )}
        </div>
    );
}

function SearchGroup({ title, moreHref, children }: { title: string; moreHref: string; children: React.ReactNode }) {
    return <WikiSection title={title}><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{children}</div><Link href={moreHref} className="mt-4 inline-flex text-xs font-semibold text-amber-200 hover:text-amber-100">Ver todos los resultados</Link></WikiSection>;
}

function SimpleResult({ href, title, description, icon, label }: { href: string; title: string; description: string; icon: React.ReactNode; label: string }) {
    return <Link href={href} className="flex items-center gap-3 border border-amber-200/10 bg-black/20 p-3 hover:border-amber-300/40"><span className="grid h-11 w-11 shrink-0 place-items-center border border-amber-200/15 text-amber-300">{icon}</span><span className="min-w-0"><strong className="block truncate text-sm text-stone-200">{title}</strong><span className="mt-1 flex items-center gap-2"><WikiTag>{label}</WikiTag><span className="truncate text-[11px] text-stone-500">{description}</span></span></span></Link>;
}
