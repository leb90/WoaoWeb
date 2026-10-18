import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getWikiData } from "@/lib/wiki-data";
import { WIKI_CATEGORIES } from "@/lib/wiki-sections";

function entry(path: string, lastModified: Date, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly"): MetadataRoute.Sitemap[number] {
    return { url: absoluteUrl(path), lastModified, changeFrequency, priority };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const wiki = await getWikiData();
    const wikiUpdatedAt = Number.isNaN(Date.parse(wiki.generatedAt)) ? now : new Date(wiki.generatedAt);

    return [
        entry("/", now, 1),
        entry("/updates", now, 0.8, "daily"),
        entry("/wiki", wikiUpdatedAt, 0.95, "daily"),
        ...WIKI_CATEGORIES.map((category) => entry(`/wiki/${category.slug}`, wikiUpdatedAt, 0.75)),
        entry("/wiki/objetos", wikiUpdatedAt, 0.9, "daily"),
        ...wiki.objects.map((item) => entry(`/wiki/objetos/${item.id}`, wikiUpdatedAt, 0.65)),
        entry("/wiki/npcs", wikiUpdatedAt, 0.9, "daily"),
        ...wiki.npcs.map((npc) => entry(`/wiki/npcs/${npc.id}`, wikiUpdatedAt, 0.65)),
        entry("/wiki/mapas", wikiUpdatedAt, 0.9, "daily"),
        ...wiki.maps.map((map) => entry(`/wiki/mapas/${map.id}`, wikiUpdatedAt, 0.7)),
        entry("/wiki/hechizos", wikiUpdatedAt, 0.8),
        ...wiki.spells.map((spell) => entry(`/wiki/hechizos/${spell.id}`, wikiUpdatedAt, 0.6)),
        entry("/wiki/recetas", wikiUpdatedAt, 0.8),
        ...wiki.recipes.map((recipe) => entry(`/wiki/recetas/${recipe.id}`, wikiUpdatedAt, 0.6)),
        entry("/wiki/misiones", wikiUpdatedAt, 0.8),
        ...wiki.quests.map((quest) => entry(`/wiki/misiones/${quest.id}`, wikiUpdatedAt, 0.6)),
        entry("/login", now, 0.5, "monthly"),
        entry("/register", now, 0.6, "monthly"),
    ];
}
