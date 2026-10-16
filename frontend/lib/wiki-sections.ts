export const WIKI_SECTIONS = ["factions", "maps", "npcs", "equipment", "spells"] as const;

export type WikiSection = (typeof WIKI_SECTIONS)[number];

export const WIKI_SECTION_LABELS: Record<WikiSection, string> = {
    factions: "Facciones",
    npcs: "NPCs",
    maps: "Mapas de entrenamiento",
    equipment: "Equipamiento",
    spells: "Hechizos",
};

export function getWikiSectionHref(section: WikiSection): string {
    return `/wiki/${section}`;
}

export const WIKI_CATEGORIES = [
    {
        slug: "primeros-pasos",
        label: "Primeros pasos",
        description: "Cuenta, personaje, controles, interfaz y primeros niveles.",
        links: ["Crear tu personaje", "Controles", "Inventario", "Protección newbie"],
    },
    {
        slug: "personajes",
        label: "Personajes y progresión",
        description: "Clases, razas, atributos, experiencia y equipamiento.",
        links: ["Clases", "Razas", "Atributos", "Progresión"],
    },
    {
        slug: "habilidades",
        label: "Habilidades",
        description: "Skills, puntos disponibles, entrenamiento y límites.",
        links: ["Combate", "Magia", "Supervivencia", "Navegación"],
    },
    {
        slug: "combate",
        label: "Combate y supervivencia",
        description: "PvE, daño, defensas, estados, hambre, sed y muerte.",
        links: ["Cuerpo a cuerpo", "Proyectiles", "Magia", "Estados"],
    },
    {
        slug: "pvp",
        label: "PvP y criminalidad",
        description: "Seguro, ciudadanos, criminales y consecuencias del PvP.",
        links: ["Seguro general", "Seguro de clan", "Criminalidad", "Resurrección"],
    },
    {
        slug: "mundo",
        label: "Mundo y viajes",
        description: "Atlas, ciudades, dungeons, barcos, clima y viajes.",
        links: ["Atlas", "Ciudades", "Dungeons", "Viajes rápidos"],
    },
    {
        slug: "misiones",
        label: "Misiones",
        description: "Objetivos, NPC, mapas y recompensas de cada misión.",
        links: ["Catálogo", "Objetivos", "Recompensas", "Puntos de canje"],
    },
    {
        slug: "objetos",
        label: "Objetos y magia",
        description: "Equipamiento, consumibles, materiales y hechizos.",
        links: ["Objetos", "Hechizos", "Drops", "Comerciantes"],
    },
    {
        slug: "crafting",
        label: "Crafting y recetas",
        description: "Recetas aprendidas, niveles, materiales y fabricación.",
        links: ["Recetas", "Materiales", "Artesano", "Probabilidad de drop"],
    },
    {
        slug: "economia",
        label: "Economía y servicios",
        description: "Comerciantes, bancos, bóvedas, casas y recompensas.",
        links: ["Comercio", "Banco", "Bóvedas", "Premios"],
    },
    {
        slug: "subastas",
        label: "Subastas y mercados",
        description: "Publicaciones, ofertas, compra directa, correo y claims.",
        links: ["Publicar", "Ofertar", "Compra directa", "Reclamos"],
    },
    {
        slug: "comunidad",
        label: "Parties y clanes",
        description: "Chat, grupos, clanes, rangos, alianzas y bóveda.",
        links: ["Party", "Clanes", "Roles", "Guerras"],
    },
    {
        slug: "facciones",
        label: "Facciones y territorio",
        description: "Alianza, Horda, rangos, ciudades, castillos y fortaleza.",
        links: ["Alianza", "Horda", "Conquista", "Castillos"],
    },
    {
        slug: "monturas",
        label: "Monturas",
        description: "Huevos, especies, niveles, estadísticas y talentos.",
        links: ["Especies", "Huevos", "Estadísticas", "Talentos"],
    },
    {
        slug: "competitivo",
        label: "Competitivo",
        description: "Ranked, ELO, arenas, retos y combates por equipos.",
        links: ["Ranked 1v1", "Ranked 2v2", "Arenas", "Retos"],
    },
    {
        slug: "eventos",
        label: "Eventos",
        description: "Hunters Game, Blood Castle, guerras, bosses y torneos.",
        links: ["Hunters Game", "Blood Castle", "Guerra de facciones", "Bosses"],
    },
    {
        slug: "enciclopedia",
        label: "Enciclopedia",
        description: "Catálogos enlazados de todo el contenido público.",
        links: ["Objetos", "NPC", "Mapas", "Recetas"],
    },
] as const;

export type WikiCategorySlug = (typeof WIKI_CATEGORIES)[number]["slug"];

export type WikiArticleStatus = "VERIFIED" | "NEEDS_REVIEW" | "FUTURE";

export type WikiArticleMaintenance = {
    status: WikiArticleStatus;
    lastVerifiedAt?: string;
    source: string;
};

export const DEFAULT_WIKI_ARTICLE_MAINTENANCE: WikiArticleMaintenance = {
    status: "NEEDS_REVIEW",
    source: "current-game-code-and-data",
};

export function getWikiCategory(slug: string) {
    return WIKI_CATEGORIES.find((category) => category.slug === slug);
}
