import type { Metadata } from "next";
import Link from "next/link";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiNpcSprite from "@/components/wiki/WikiNpcSprite";
import {
    WikiCatalogToolbar,
    WikiEmpty,
    WikiPageHeader,
    WikiPagination,
    WikiSelect,
    WikiTag,
} from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import {
    formatWikiNumber,
    getPositiveInteger,
    getSearchParam,
    matchesWikiQuery,
    paginate,
    type WikiSearchParams,
} from "@/lib/wiki-query";

export const metadata: Metadata = buildPageMetadata({
    title: "NPC - World of Argentum Wiki",
    description: "Criaturas y comerciantes de los mapas públicos de World of Argentum, con drops, recompensas y ubicaciones.",
    path: "/wiki/npcs",
});

export default async function WikiNpcsPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const wiki = await getWikiData();
    const query = getSearchParam(params, "q");
    const type = getSearchParam(params, "tipo");
    const order = getSearchParam(params, "orden") || "nombre";
    const types = Array.from(new Set(wiki.npcs.map((npc) => npc.npcTypeLabel))).sort((a, b) => a.localeCompare(b, "es"));
    const filtered = wiki.npcs
        .filter((npc) => !type || npc.npcTypeLabel === type)
        .filter((npc) => matchesWikiQuery(npc.searchIndex, query))
        .sort((left, right) => {
            if (order === "exp") return right.expReward - left.expReward || left.name.localeCompare(right.name, "es");
            if (order === "vida") return right.maxHp - left.maxHp || left.name.localeCompare(right.name, "es");
            if (order === "id") return left.id - right.id;
            return left.name.localeCompare(right.name, "es");
        });
    const result = paginate(filtered, getPositiveInteger(getSearchParam(params, "page")), 18);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Enciclopedia", href: "/wiki/enciclopedia" }, { label: "NPC" }]} />
            <WikiPageHeader eyebrow="Enciclopedia" title="NPC" description="Sólo se muestran NPC presentes en los mapas habilitados para la Wiki pública." count={`${formatWikiNumber(result.total)} resultados`} />
            <WikiCatalogToolbar action="/wiki/npcs" query={query} placeholder="Buscar NPC, drop o mapa...">
                <WikiSelect name="tipo" value={type} label="Tipo" options={[{ value: "", label: "Todos los tipos" }, ...types.map((value) => ({ value, label: value }))]} />
                <WikiSelect name="orden" value={order} label="Orden" options={[{ value: "nombre", label: "Nombre" }, { value: "id", label: "ID" }, { value: "exp", label: "Mayor EXP" }, { value: "vida", label: "Mayor vida" }]} />
            </WikiCatalogToolbar>

            {result.items.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((npc) => (
                        <Link key={npc.id} href={`/wiki/npcs/${npc.id}`} className="group flex min-h-[86px] items-center gap-3 border border-amber-200/12 bg-[#0a0806] p-3 hover:border-amber-300/45 hover:bg-amber-300/[0.035]">
                            <WikiNpcSprite bodyId={npc.bodyId} headId={npc.headId} name={npc.name} />
                            <span className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-stone-100 group-hover:text-amber-100">{npc.name}</strong>
                                <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                                    <WikiTag>{npc.npcTypeLabel}</WikiTag>
                                    <span>#{npc.id}</span>
                                </span>
                                {npc.isCombatNpc ? <span className="mt-1 block text-[11px] text-stone-600">{formatWikiNumber(npc.maxHp)} vida · {formatWikiNumber(npc.expReward)} EXP</span> : null}
                            </span>
                        </Link>
                    ))}
                </div>
            ) : <div className="mt-4"><WikiEmpty>No encontramos NPC con esos filtros.</WikiEmpty></div>}

            <WikiPagination pathname="/wiki/npcs" page={result.page} pageCount={result.pageCount} searchParams={params} />
        </div>
    );
}
