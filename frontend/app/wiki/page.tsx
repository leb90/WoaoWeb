import Image from "next/image";
import Link from "next/link";
import {
    Anvil,
    BookOpen,
    Calculator,
    Map,
    ScrollText,
    Sparkles,
    Swords,
} from "lucide-react";
import WikiSearchForm from "@/components/wiki/WikiSearchForm";
import { WikiCategoryIcon } from "@/components/wiki/WikiShell";
import { getWikiData } from "@/lib/wiki-data";
import { WIKI_CATEGORIES } from "@/lib/wiki-sections";
import { formatWikiNumber } from "@/lib/wiki-query";
import { absoluteUrl } from "@/lib/seo";

const shortcuts = [
    { href: "/wiki/personajes#simulador", label: "Calculadora", icon: Calculator, description: "Vida min/promedio/máx, maná y mapas por nivel" },
    { href: "/wiki/objetos", label: "Objetos", icon: Swords, description: "Equipamiento, consumibles y materiales" },
    { href: "/wiki/npcs", label: "NPC", icon: Sparkles, description: "Criaturas, comerciantes y sus drops" },
    { href: "/wiki/mapas", label: "Mapas", icon: Map, description: "Atlas, zonas y criaturas presentes" },
    { href: "/wiki/hechizos", label: "Hechizos", icon: BookOpen, description: "Mana, poder y requisitos" },
    { href: "/wiki/recetas", label: "Recetas", icon: Anvil, description: "Materiales, oro y nivel requerido" },
    { href: "/wiki/misiones", label: "Misiones", icon: ScrollText, description: "Objetivos y recompensas" },
] as const;

export default async function WikiPage() {
    const wiki = await getWikiData();
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "Wiki oficial de World of Argentum",
        url: absoluteUrl("/wiki"),
        description: "Enciclopedia pública del mundo, objetos y sistemas de World of Argentum.",
        inLanguage: "es-AR",
    };

    return (
        <div className="space-y-7">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <section className="relative min-h-[310px] overflow-hidden border border-amber-200/20 bg-[#0a0806]">
                <Image
                    src="/imgs/world-map-old.jpg"
                    alt="Atlas del mundo de World of Argentum"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1100px"
                    className="object-cover object-center opacity-35 [filter:saturate(.75)_contrast(1.1)]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,4,3,.96)_0%,rgba(5,4,3,.78)_48%,rgba(5,4,3,.25)_100%)]" />
                <div className="relative flex min-h-[310px] max-w-3xl flex-col justify-center p-6 sm:p-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-amber-300">
                        World of Argentum
                    </p>
                    <h1 className="mt-2 font-[var(--font-cinzel)] text-4xl font-semibold text-stone-50 sm:text-5xl">
                        Wiki
                    </h1>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-stone-200/85">
                        Todo lo que necesitás saber para comenzar y dominar World of Argentum.
                    </p>
                    <div className="mt-7">
                        <WikiSearchForm />
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 border border-amber-200/15 bg-[#0a0806] sm:grid-cols-3 lg:grid-cols-6">
                {[
                    ["Objetos", wiki.stats.objectCount],
                    ["NPC", wiki.stats.npcCount],
                    ["Mapas", wiki.stats.mapCount],
                    ["Hechizos", wiki.stats.spellCount],
                    ["Recetas", wiki.stats.recipeCount],
                    ["Misiones", wiki.stats.questCount],
                ].map(([label, value], index) => (
                    <div key={String(label)} className={`px-4 py-4 ${index ? "border-l border-amber-200/10" : ""}`}>
                        <p className="font-[var(--font-cinzel)] text-xl font-semibold text-amber-100">
                            {formatWikiNumber(Number(value))}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-stone-500">{label}</p>
                    </div>
                ))}
            </section>

            <section>
                <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Enciclopedia</p>
                    <h2 className="mt-1 font-[var(--font-cinzel)] text-2xl font-semibold text-stone-100">Consultá los datos del juego</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {shortcuts.map((shortcut) => {
                        const Icon = shortcut.icon;
                        return (
                            <Link key={shortcut.href} href={shortcut.href} className="group flex min-h-24 items-center gap-4 border border-amber-200/15 bg-[#0a0806] p-4 transition hover:border-amber-300/45 hover:bg-amber-300/[0.04]">
                                <span className="grid h-11 w-11 shrink-0 place-items-center border border-amber-300/25 bg-amber-300/10 text-amber-300">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span>
                                    <strong className="font-[var(--font-cinzel)] text-base text-stone-100 group-hover:text-amber-100">{shortcut.label}</strong>
                                    <span className="mt-1 block text-xs leading-5 text-stone-500">{shortcut.description}</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-300">Explorar</p>
                    <h2 className="mt-1 font-[var(--font-cinzel)] text-2xl font-semibold text-stone-100">Todas las categorías</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {WIKI_CATEGORIES.map((category, index) => (
                        <Link key={category.slug} href={`/wiki/${category.slug}`} className="group border border-amber-200/12 bg-[#090705] p-4 transition hover:border-amber-300/40">
                            <div className="flex items-center gap-3">
                                <span className="text-amber-300/75"><WikiCategoryIcon index={index} /></span>
                                <h3 className="font-semibold text-stone-200 group-hover:text-amber-100">{category.label}</h3>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-stone-500">{category.description}</p>
                            <p className="mt-3 text-[11px] text-stone-600">{category.links.join(" · ")}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
