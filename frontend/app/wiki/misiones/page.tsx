import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText } from "lucide-react";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import { WikiCatalogToolbar, WikiEmpty, WikiPageHeader, WikiPagination, WikiSelect, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { formatWikiNumber, getPositiveInteger, getSearchParam, matchesWikiQuery, paginate, type WikiSearchParams } from "@/lib/wiki-query";

export const metadata: Metadata = buildPageMetadata({ title: "Misiones - World of Argentum Wiki", description: "Misiones de World of Argentum con objetivos, NPC, mapas y recompensas.", path: "/wiki/misiones" });

export default async function WikiMissionsPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const wiki = await getWikiData();
    const query = getSearchParam(params, "q");
    const order = getSearchParam(params, "orden") || "nivel";
    const filtered = wiki.quests.filter((quest) => matchesWikiQuery(quest.searchIndex, query)).sort((left, right) => order === "nombre" ? left.name.localeCompare(right.name, "es") : order === "exp" ? right.rewardExp - left.rewardExp : left.requiredLevel - right.requiredLevel || left.id - right.id);
    const result = paginate(filtered, getPositiveInteger(getSearchParam(params, "page")), 24);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Misiones", href: "/wiki/misiones" }, { label: "Catálogo" }]} />
            <WikiPageHeader eyebrow="Aventuras" title="Misiones" description="Objetivos y recompensas tomados del catálogo activo del cliente y vinculados con el mundo actual." count={`${result.total} misiones`} />
            <WikiCatalogToolbar action="/wiki/misiones" query={query} placeholder="Buscar misión, objetivo, NPC o recompensa...">
                <WikiSelect name="orden" value={order} label="Orden" options={[{ value: "nivel", label: "Nivel requerido" }, { value: "nombre", label: "Nombre" }, { value: "exp", label: "Mayor EXP" }]} />
            </WikiCatalogToolbar>
            {result.items.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((quest) => (
                        <Link key={quest.id} href={`/wiki/misiones/${quest.id}`} className="group flex min-h-[102px] gap-3 border border-amber-200/12 bg-[#0a0806] p-3 hover:border-amber-300/45">
                            <span className="grid h-11 w-11 shrink-0 place-items-center border border-amber-300/20 bg-amber-300/[0.07] text-amber-300"><ScrollText className="h-5 w-5" /></span>
                            <span className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-stone-100 group-hover:text-amber-100">{quest.name}</strong>
                                <span className="mt-1.5 flex flex-wrap gap-1.5"><WikiTag>Nivel {quest.requiredLevel}</WikiTag><WikiTag>#{quest.id}</WikiTag></span>
                                <span className="mt-2 block text-[11px] text-stone-500">{formatWikiNumber(quest.rewardExp)} EXP · {formatWikiNumber(quest.rewardGold)} oro</span>
                            </span>
                        </Link>
                    ))}
                </div>
            ) : <div className="mt-4"><WikiEmpty>No encontramos misiones con esos filtros.</WikiEmpty></div>}
            <WikiPagination pathname="/wiki/misiones" page={result.page} pageCount={result.pageCount} searchParams={params} />
        </div>
    );
}
