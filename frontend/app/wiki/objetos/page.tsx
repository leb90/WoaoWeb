import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiItemSprite from "@/components/wiki/WikiItemSprite";
import {
    WikiCatalogToolbar,
    WikiEmpty,
    WikiPageHeader,
    WikiPagination,
    WikiSelect,
    WikiTag,
} from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import {
    CLASS_ID_MAP,
    characterClassOptions,
} from "@/lib/characterCreation";
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
    title: "Objetos - World of Argentum Wiki",
    description: "Catálogo público de armas, armaduras, consumibles, materiales y objetos de World of Argentum.",
    path: "/wiki/objetos",
});

export default async function WikiObjectsPage({ searchParams }: { searchParams: Promise<WikiSearchParams> }) {
    const params = await searchParams;
    const wiki = await getWikiData();
    const query = getSearchParam(params, "q");
    const category = getSearchParam(params, "tipo");
    const classParam = getSearchParam(params, "clase");
    const selectedClassOption = characterClassOptions.find((option) => option.key === classParam);
    const selectedClass = selectedClassOption?.key ?? "";
    const order = getSearchParam(params, "orden") || "nombre";
    const selectedClassId = selectedClassOption ? CLASS_ID_MAP[selectedClassOption.key] : undefined;
    const categories = Array.from(new Set(wiki.objects.map((item) => item.objTypeLabel))).sort((a, b) => a.localeCompare(b, "es"));
    const filtered = wiki.objects
        .filter((item) => !category || item.objTypeLabel === category)
        .filter((item) => !selectedClassId || !item.blockedClasses.includes(selectedClassId))
        .filter((item) => matchesWikiQuery(item.searchIndex, query))
        .sort((left, right) => {
            if (order === "valor") return right.value - left.value || left.name.localeCompare(right.name, "es");
            if (order === "id") return left.id - right.id;
            return left.name.localeCompare(right.name, "es");
        });
    const result = paginate(filtered, getPositiveInteger(getSearchParam(params, "page")), 30);

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: "Enciclopedia", href: "/wiki/enciclopedia" }, { label: "Objetos" }]} />
            <WikiPageHeader eyebrow="Enciclopedia" title="Objetos" description="Información generada desde los objetos cargados actualmente por el juego." count={`${formatWikiNumber(result.total)} resultados`} />
            <WikiCatalogToolbar action="/wiki/objetos" query={query} placeholder="Buscar objeto por nombre o ID...">
                <WikiSelect name="tipo" value={category} label="Tipo" options={[{ value: "", label: "Todos los tipos" }, ...categories.map((value) => ({ value, label: value }))]} />
                <WikiSelect
                    name="clase"
                    value={selectedClass}
                    label="Clase"
                    options={[
                        { value: "", label: "Todas las clases" },
                        ...characterClassOptions.map((option) => ({ value: option.key, label: option.label })),
                    ]}
                />
                <WikiSelect name="orden" value={order} label="Orden" options={[{ value: "nombre", label: "Nombre" }, { value: "id", label: "ID" }, { value: "valor", label: "Mayor valor" }]} />
                <Link
                    href="/wiki/objetos"
                    className="inline-flex h-12 items-center justify-center gap-2 border border-stone-700 px-4 text-xs font-bold uppercase tracking-[0.1em] text-stone-300 transition hover:border-amber-200/35 hover:bg-amber-300/5 hover:text-amber-100 max-sm:w-full"
                >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Limpiar filtros
                </Link>
            </WikiCatalogToolbar>

            {result.items.length ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {result.items.map((item) => (
                        <Link key={item.id} href={`/wiki/objetos/${item.id}`} className="group flex min-h-[76px] items-center gap-3 border border-amber-200/12 bg-[#0a0806] p-3 hover:border-amber-300/45 hover:bg-amber-300/[0.035]">
                            <WikiItemSprite grhIndex={item.grhIndex} name={item.name} size={50} />
                            <span className="min-w-0 flex-1">
                                <strong className="block truncate text-sm text-stone-100 group-hover:text-amber-100">{item.name}</strong>
                                <span className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-500">
                                    <WikiTag>{item.objTypeLabel}</WikiTag>
                                    <span>#{item.id}</span>
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>
            ) : <div className="mt-4"><WikiEmpty>No encontramos objetos con esos filtros.</WikiEmpty></div>}

            <WikiPagination pathname="/wiki/objetos" page={result.page} pageCount={result.pageCount} searchParams={params} />
        </div>
    );
}
