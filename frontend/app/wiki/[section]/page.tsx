import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import WikiBreadcrumbs from "@/components/wiki/WikiBreadcrumbs";
import WikiCraftingGuide from "@/components/wiki/WikiCraftingGuide";
import WikiCreditos from "@/components/wiki/WikiCreditos";
import WikiPersonajesProgresion from "@/components/wiki/WikiPersonajesProgresion";
import WikiPrimerosPasos from "@/components/wiki/WikiPrimerosPasos";
import WikiPvpBalance from "@/components/wiki/WikiPvpBalance";
import { WikiPageHeader, WikiSection } from "@/components/wiki/WikiUi";
import { buildPageMetadata } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { getWikiCategory } from "@/lib/wiki-sections";

const LEGACY_ROUTES: Record<string, string> = {
    factions: "/wiki/facciones",
    maps: "/wiki/mapas",
    npcs: "/wiki/npcs",
    equipment: "/wiki/objetos",
    spells: "/wiki/hechizos",
};

const CATALOGS: Partial<Record<string, Array<{ href: string; label: string; description: string }>>> = {
    mundo: [{ href: "/wiki/mapas", label: "Atlas de mapas", description: "Mapas públicos, zonas, requisitos y criaturas." }],
    misiones: [{ href: "/wiki/misiones", label: "Catálogo de misiones", description: "Objetivos, NPC relacionados y recompensas actuales." }],
    objetos: [
        { href: "/wiki/objetos", label: "Objetos", description: "Equipamiento, consumibles, materiales y otros objetos públicos." },
        { href: "/wiki/hechizos", label: "Hechizos", description: "Requisitos, mana, poder y formas de obtenerlos." },
    ],
    enciclopedia: [
        { href: "/wiki/objetos", label: "Objetos", description: "Catálogo completo de objetos públicos." },
        { href: "/wiki/npcs", label: "NPC", description: "Criaturas y comerciantes presentes en mapas públicos." },
        { href: "/wiki/mapas", label: "Mapas", description: "Atlas público del mundo." },
        { href: "/wiki/hechizos", label: "Hechizos", description: "Catálogo actual de magia." },
        { href: "/wiki/recetas", label: "Recetas", description: "Sistema actual de crafting." },
        { href: "/wiki/misiones", label: "Misiones", description: "Misiones y recompensas." },
    ],
};

type PageProps = { params: Promise<{ section: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { section } = await params;
    const category = getWikiCategory(section);
    if (!category) return {};
    return buildPageMetadata({
        title: `${category.label} - World of Argentum Wiki`,
        description: category.description,
        path: `/wiki/${category.slug}`,
    });
}

export default async function WikiSectionPage({ params }: PageProps) {
    const { section } = await params;
    if (LEGACY_ROUTES[section]) redirect(LEGACY_ROUTES[section]);

    const category = getWikiCategory(section);
    if (!category) notFound();
    const catalogs = CATALOGS[category.slug] ?? [];
    const trainingMaps =
        category.slug === "personajes"
            ? (await getWikiData()).trainingMaps.map((map) => ({
                  id: map.id,
                  name: map.name,
                  minLevel: map.minLevel,
                  maxLevel: map.maxLevel,
                  topNpcs: map.topNpcs.map((npc) => ({
                      npcId: npc.npcId,
                      npcName: npc.npcName,
                      maxHp: npc.maxHp,
                      expReward: npc.expReward,
                  })),
              }))
            : [];

    return (
        <div>
            <WikiBreadcrumbs items={[{ label: category.label }]} />
            <WikiPageHeader eyebrow="Guía" title={category.label} description={category.description} />

            {category.slug === "primeros-pasos" ? <WikiPrimerosPasos /> : null}
            {category.slug === "personajes" ? (
                <WikiPersonajesProgresion trainingMaps={trainingMaps} />
            ) : null}
            {category.slug === "crafting" ? <WikiCraftingGuide /> : null}
            {category.slug === "pvp" ? <WikiPvpBalance /> : null}
            {category.slug === "creditos" ? <WikiCreditos /> : null}

            {catalogs.length ? (
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {catalogs.map((catalog) => (
                        <Link key={catalog.href} href={catalog.href} className="group flex items-center justify-between gap-4 border border-amber-200/15 bg-[#0a0806] p-5 hover:border-amber-300/45">
                            <span>
                                <strong className="font-[var(--font-cinzel)] text-lg text-stone-100 group-hover:text-amber-100">{catalog.label}</strong>
                                <span className="mt-1 block text-sm leading-5 text-stone-500">{catalog.description}</span>
                            </span>
                            <ArrowRight className="h-5 w-5 shrink-0 text-amber-300/60" />
                        </Link>
                    ))}
                </div>
            ) : null}

            {category.slug === "primeros-pasos" ||
            category.slug === "personajes" ||
            category.slug === "crafting" ||
            category.slug === "pvp" ||
            category.slug === "creditos" ? null : (
            <WikiSection title="Contenido manual" className="mt-6">
                <div className="flex min-h-44 flex-col items-center justify-center text-center">
                    <BookOpen className="h-8 w-8 text-amber-300/35" />
                    <p className="mt-4 font-medium text-stone-300">Esta guía se encuentra en preparación.</p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                        No vamos a publicar reglas hasta verificarlas contra el servidor actual.
                    </p>
                </div>
            </WikiSection>
            )}
        </div>
    );
}
