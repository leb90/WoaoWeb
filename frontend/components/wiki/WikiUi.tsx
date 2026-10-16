import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { WikiSearchParams } from "@/lib/wiki-query";
import { withQuery } from "@/lib/wiki-query";

export function WikiPageHeader({
    eyebrow,
    title,
    description,
    count,
}: {
    eyebrow: string;
    title: string;
    description: string;
    count?: string;
}) {
    return (
        <header className="border-b border-amber-200/15 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-300/80">
                        {eyebrow}
                    </p>
                    <h1 className="mt-2 font-[var(--font-cinzel)] text-3xl font-semibold text-stone-50 sm:text-4xl">
                        {title}
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">
                        {description}
                    </p>
                </div>
                {count ? (
                    <span className="shrink-0 border border-amber-200/15 bg-black/30 px-3 py-2 text-xs text-stone-400">
                        {count}
                    </span>
                ) : null}
            </div>
        </header>
    );
}

export function WikiSection({
    title,
    children,
    className = "",
}: {
    title: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`border border-amber-200/15 bg-[#0a0806] ${className}`}>
            <h2 className="border-b border-amber-200/12 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                {title}
            </h2>
            <div className="p-4">{children}</div>
        </section>
    );
}

export function WikiEmpty({ children }: { children: React.ReactNode }) {
    return (
        <div className="border border-dashed border-amber-200/15 px-5 py-12 text-center text-sm text-stone-500">
            {children}
        </div>
    );
}

export function WikiCatalogToolbar({
    action,
    query,
    children,
    placeholder,
}: {
    action: string;
    query: string;
    children?: React.ReactNode;
    placeholder: string;
}) {
    return (
        <form action={action} className="mt-5 grid gap-3 border border-amber-200/15 bg-[#0a0806] p-3 lg:grid-cols-[minmax(240px,1fr)_auto]">
            <label className="flex h-11 items-center border border-stone-700 bg-black/45 focus-within:border-amber-300/60">
                <Search className="ml-3 h-4 w-4 shrink-0 text-amber-300/65" />
                <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder={placeholder}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-stone-100 outline-none placeholder:text-stone-600"
                />
            </label>
            <div className="flex flex-wrap items-center gap-2">
                {children}
                <button className="h-11 border border-amber-300/50 bg-amber-300/12 px-5 text-xs font-bold uppercase tracking-[0.12em] text-amber-100 hover:bg-amber-300/20">
                    Filtrar
                </button>
            </div>
        </form>
    );
}

export function WikiSelect({
    name,
    value,
    label,
    options,
}: {
    name: string;
    value: string;
    label: string;
    options: Array<{ value: string; label: string }>;
}) {
    return (
        <label className="flex h-11 items-center gap-2 border border-stone-700 bg-black/45 px-3 text-xs text-stone-400">
            <span className="hidden sm:inline">{label}</span>
            <select name={name} defaultValue={value} className="bg-transparent text-stone-100 outline-none">
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#0a0806]">
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

export function WikiPagination({
    pathname,
    page,
    pageCount,
    searchParams,
}: {
    pathname: string;
    page: number;
    pageCount: number;
    searchParams: WikiSearchParams;
}) {
    if (pageCount <= 1) return null;

    const preserved = Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [
            key,
            Array.isArray(value) ? value[0] : value,
        ]),
    );

    return (
        <nav className="mt-5 flex items-center justify-between border-t border-amber-200/12 pt-4 text-xs text-stone-400" aria-label="Paginación">
            <Link
                href={withQuery(pathname, { ...preserved, page: page > 1 ? page - 1 : 1 })}
                aria-disabled={page <= 1}
                className={`inline-flex h-9 items-center gap-2 border px-3 ${page <= 1 ? "pointer-events-none border-stone-800 text-stone-700" : "border-amber-200/20 text-stone-300 hover:border-amber-300/50 hover:text-amber-100"}`}
            >
                <ChevronLeft className="h-4 w-4" /> Anterior
            </Link>
            <span>Página {page} de {pageCount}</span>
            <Link
                href={withQuery(pathname, { ...preserved, page: page < pageCount ? page + 1 : pageCount })}
                aria-disabled={page >= pageCount}
                className={`inline-flex h-9 items-center gap-2 border px-3 ${page >= pageCount ? "pointer-events-none border-stone-800 text-stone-700" : "border-amber-200/20 text-stone-300 hover:border-amber-300/50 hover:text-amber-100"}`}
            >
                Siguiente <ChevronRight className="h-4 w-4" />
            </Link>
        </nav>
    );
}

export function WikiDefinitionList({
    rows,
}: {
    rows: Array<{ label: string; value: React.ReactNode }>;
}) {
    return (
        <dl className="divide-y divide-amber-200/10">
            {rows.map((row) => (
                <div key={row.label} className="grid grid-cols-[minmax(100px,0.8fr)_minmax(0,1.2fr)] gap-4 py-2.5 text-sm">
                    <dt className="text-stone-500">{row.label}</dt>
                    <dd className="text-right font-medium text-stone-200">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function WikiTag({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex border border-amber-200/15 bg-amber-200/5 px-2 py-1 text-[11px] text-amber-100/85">
            {children}
        </span>
    );
}
