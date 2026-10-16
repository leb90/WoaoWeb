import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
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
    getPositiveInteger,
    getSearchParam,
    matchesWikiQuery,
    paginate,
    type WikiSearchParams,
} from "@/lib/wiki-query";

export const metadata: Metadata = buildPageMetadata({
    title: "Mapas - World of Argentum Wiki",
    description: "Atlas público de World of Argentum con ciudades, bosques, dungeons y criaturas presentes.",
    path: "/wiki/mapas",
});

export default async function WikiMapsPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const wiki = await getWikiData();
    const query = getSearchParam(params, "q");
    const zone = getSearchParam(params, "zona");
    const order = getSearchParam(params, "orden") || "id";
    const zones = Array.from(new Set(wiki.maps.map((map) => map.zona).filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));
    const filtered = wiki.maps
        .filter((map) => !zone || map.zona === zone)
        .filter((map) => matchesWikiQuery(`${map.searchIndex} ${map.info} ${map.creatures}`, query))
        .sort((left, right) => order === "nombre" ? left.name.localeCompare(right.name, "es") : order === "criaturas" ? right.uniqueCombatNpcs - left.uniqueCombatNpcs || left.id - right.id : left.id - right.id);
    const result = paginate(filtered, getPositiveInteger(getSearchParam(params, "page")), 24);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Mundo", href: "/wiki/mundo" }, { label: "Mapas" }]} />
            <WikiPageHeader eyebrow="Atlas" title="Mapas" description="El atlas respeta la selección pública del juego. Los mapas internos, temporales y secretos no aparecen." count={`${result.total} mapas`} />
            <WikiCatalogToolbar action="/wiki/mapas" query={query} placeholder="Buscar mapa, zona o criatura...">
                <WikiSelect name="zona" value={zone} label="Zona" options={[{ value: "", label: "Todas las zonas" }, ...zones.map((value) => ({ value, label: value }))]} />
                <WikiSelect name="orden" value={order} label="Orden" options={[{ value: "id", label: "Número" }, { value: "nombre", label: "Nombre" }, { value: "criaturas", label: "Más criaturas" }]} />
            </WikiCatalogToolbar>

            {result.items.length ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((map) => (
                        <Link key={map.id} href={`/wiki/mapas/${map.id}`} className="group grid grid-cols-[82px_minmax(0,1fr)] gap-3 border border-amber-200/12 bg-[#0a0806] p-3 hover:border-amber-300/45">
                            <div className="relative aspect-square overflow-hidden border border-amber-200/15 bg-black">
                                {map.hasPreview ? <Image src={`/imgs_maps/${map.id}.png`} alt={`Vista previa de ${map.name}`} fill sizes="82px" className="object-cover [image-rendering:pixelated]" /> : <span className="absolute inset-0 grid place-items-center text-xs text-stone-700">#{map.id}</span>}
                            </div>
                            <span className="min-w-0 py-1">
                                <span className="flex items-start justify-between gap-2">
                                    <strong className="truncate text-sm text-stone-100 group-hover:text-amber-100">{map.name}</strong>
                                    <span className="text-[11px] text-amber-200/70">#{map.id}</span>
                                </span>
                                <span className="mt-2 flex flex-wrap gap-1.5"><WikiTag>{map.zona || map.terreno}</WikiTag><WikiTag>{map.restringir === "Sin datos actuales" ? "Seguridad no informada" : map.pk ? "Zona segura" : "Zona peligrosa"}</WikiTag></span>
                                <span className="mt-2 block text-[11px] text-stone-500">{map.uniqueCombatNpcs} criaturas · {map.totalNpcSpawns} NPC</span>
                            </span>
                        </Link>
                    ))}
                </div>
            ) : <div className="mt-4"><WikiEmpty>No hay información pública para ese mapa o filtro.</WikiEmpty></div>}

            <WikiPagination pathname="/wiki/mapas" page={result.page} pageCount={result.pageCount} searchParams={params} />
        </div>
    );
}
