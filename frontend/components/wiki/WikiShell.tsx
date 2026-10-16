import Link from "next/link";
import {
    Anvil,
    BookOpen,
    Castle,
    Coins,
    Compass,
    Crown,
    Gem,
    Map,
    ScrollText,
    Shield,
    ShoppingCart,
    Sparkles,
    Swords,
    UserRound,
    Users,
} from "lucide-react";
import { WIKI_CATEGORIES } from "@/lib/wiki-sections";
import WikiSearchForm from "./WikiSearchForm";

const CATEGORY_ICONS = [
    Compass,
    UserRound,
    Sparkles,
    Swords,
    Shield,
    Map,
    ScrollText,
    Gem,
    Anvil,
    Coins,
    ShoppingCart,
    Users,
    Castle,
    Crown,
    Swords,
    Sparkles,
    BookOpen,
];

export function WikiCategoryIcon({ index }: { index: number }) {
    const Icon = CATEGORY_ICONS[index] ?? BookOpen;
    return <Icon className="h-4 w-4" aria-hidden />;
}

export default function WikiShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[#050403] text-stone-100">
            <section className="border-b border-amber-200/15 bg-[radial-gradient(circle_at_22%_0%,rgba(151,101,32,0.14),transparent_35%),#090705]">
                <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-7 lg:flex-row lg:items-end lg:justify-between lg:px-8">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.38em] text-amber-300/75">
                            World of Argentum
                        </p>
                        <Link
                            href="/wiki"
                            className="mt-1 block font-[var(--font-cinzel)] text-3xl font-semibold text-stone-50"
                        >
                            Wiki oficial
                        </Link>
                        <p className="mt-1 text-sm text-stone-400">
                            Guías y datos verificados directamente con el juego actual.
                        </p>
                    </div>
                    <WikiSearchForm compact />
                </div>
            </section>

            <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
                <aside className="lg:sticky lg:top-28 lg:h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto">
                    <details className="border border-amber-200/15 bg-[#0a0806] lg:hidden">
                        <summary className="cursor-pointer px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-amber-200">
                            Categorías de la Wiki
                        </summary>
                        <WikiCategoryNav />
                    </details>
                    <div className="hidden border border-amber-200/15 bg-[#0a0806] lg:block">
                        <div className="border-b border-amber-200/12 px-4 py-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-amber-300">
                                Categorías
                            </p>
                        </div>
                        <WikiCategoryNav />
                    </div>
                </aside>

                <main className="min-w-0">{children}</main>
            </div>

            <footer className="border-t border-amber-200/12 bg-black/35">
                <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-7 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                    <p>World of Argentum Wiki · Datos públicos del juego</p>
                    <nav className="flex flex-wrap gap-5">
                        <Link href="/wiki" className="text-stone-300 hover:text-amber-200">Wiki</Link>
                        <Link href="/wiki/objetos" className="text-stone-300 hover:text-amber-200">Objetos</Link>
                        <Link href="/wiki/npcs" className="text-stone-300 hover:text-amber-200">NPC</Link>
                        <Link href="/wiki/mapas" className="text-stone-300 hover:text-amber-200">Mapas</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

function WikiCategoryNav() {
    return (
        <nav className="space-y-0.5 p-2">
            {WIKI_CATEGORIES.map((category, index) => (
                <Link
                    key={category.slug}
                    href={`/wiki/${category.slug}`}
                    className="group flex items-center gap-3 border-l-2 border-transparent px-3 py-2 text-[13px] text-stone-400 transition hover:border-amber-400 hover:bg-amber-300/5 hover:text-stone-100"
                >
                    <span className="text-amber-300/60 group-hover:text-amber-300">
                        <WikiCategoryIcon index={index} />
                    </span>
                    {category.label}
                </Link>
            ))}
        </nav>
    );
}
