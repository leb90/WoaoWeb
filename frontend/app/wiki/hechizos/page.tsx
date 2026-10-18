import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import { WikiCatalogToolbar, WikiEmpty, WikiPageHeader, WikiPagination, WikiSelect, WikiTag } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { getPositiveInteger, getSearchParam, matchesWikiQuery, paginate, type WikiSearchParams } from "@/lib/wiki-query";

export const metadata: Metadata = buildPageMetadata({ title: "Hechizos - World of Argentum Wiki", description: "Catálogo de hechizos con mana, habilidad requerida, poder y fuentes de obtención.", path: "/wiki/hechizos" });

export default async function WikiSpellsPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const wiki = await getWikiData();
    const query = getSearchParam(params, "q");
    const type = getSearchParam(params, "tipo");
    const order = getSearchParam(params, "orden") || "nombre";
    const types = Array.from(new Set(wiki.spells.map((spell) => spell.typeLabel))).sort((a, b) => a.localeCompare(b, "es"));
    const filtered = wiki.spells.filter((spell) => !type || spell.typeLabel === type).filter((spell) => matchesWikiQuery(spell.searchIndex, query)).sort((left, right) => order === "mana" ? right.manaRequired - left.manaRequired : order === "skill" ? right.minSkill - left.minSkill : order === "id" ? left.id - right.id : left.name.localeCompare(right.name, "es"));
    const result = paginate(filtered, getPositiveInteger(getSearchParam(params, "page")), 30);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Objetos y magia", href: "/wiki/objetos" }, { label: "Hechizos" }]} />
            <WikiPageHeader eyebrow="Magia" title="Hechizos" description="Valores tomados del catálogo de hechizos que carga el servidor actual." count={`${result.total} hechizos`} />
            <WikiCatalogToolbar action="/wiki/hechizos" query={query} placeholder="Buscar hechizo...">
                <WikiSelect name="tipo" value={type} label="Tipo" options={[{ value: "", label: "Todos los tipos" }, ...types.map((value) => ({ value, label: value }))]} />
                <WikiSelect name="orden" value={order} label="Orden" options={[{ value: "nombre", label: "Nombre" }, { value: "id", label: "ID" }, { value: "mana", label: "Mayor mana" }, { value: "skill", label: "Mayor skill" }]} />
            </WikiCatalogToolbar>
            {result.items.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((spell) => (
                        <Link key={spell.id} href={`/wiki/hechizos/${spell.id}`} className="group flex min-h-[78px] items-center gap-3 border border-amber-200/12 bg-[#0a0806] p-3 hover:border-amber-300/45">
                            <span className="grid h-11 w-11 shrink-0 place-items-center border border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200"><Sparkles className="h-5 w-5" /></span>
                            <span className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-stone-100 group-hover:text-amber-100">{spell.name}</strong>
                                <span className="mt-1 flex flex-wrap gap-2 text-[11px] text-stone-500"><WikiTag>{spell.typeLabel}</WikiTag><span>{spell.manaRequired} mana</span><span>#{spell.id}</span></span>
                            </span>
                        </Link>
                    ))}
                </div>
            ) : <div className="mt-4"><WikiEmpty>No encontramos hechizos con esos filtros.</WikiEmpty></div>}
            <WikiPagination pathname="/wiki/hechizos" page={result.page} pageCount={result.pageCount} searchParams={params} />
        </div>
    );
}
