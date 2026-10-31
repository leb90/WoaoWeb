import type { Metadata } from "next";

const rawSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    "https://worldofargentum.io";

const normalizedSiteUrl = rawSiteUrl.startsWith("http")
    ? rawSiteUrl
    : `https://${rawSiteUrl}`;

export const siteUrl = normalizedSiteUrl.replace(/\/+$/, "");
export const siteName = "World of Argentum";
export const siteTitle = "World of Argentum";
export const siteDescription =
    "World of AO: un MMORPG 2D de fantasía clásico, jugable gratis desde el navegador, sin descargas.";
export const siteKeywords = [
    "World of Argentum",
    "World of Argentum Wiki",
    "Argentum Online",
    "MMORPG web",
    "MMORPG 2D gratis",
    "changelog World of Argentum",
];

export function absoluteUrl(path = "/"): string {
    return new URL(path, `${siteUrl}/`).toString();
}

type PageMetadataInput = {
    title: string;
    description: string;
    path: string;
    keywords?: string[];
    imagePath?: string;
    twitterImagePath?: string;
};

export function buildPageMetadata({
    title,
    description,
    path,
    keywords = [],
    imagePath = "/opengraph-image",
    twitterImagePath = imagePath,
}: PageMetadataInput): Metadata {
    return {
        title,
        description,
        keywords: [...siteKeywords, ...keywords],
        alternates: {
            canonical: path,
        },
        openGraph: {
            type: "website",
            locale: "es_AR",
            url: absoluteUrl(path),
            siteName,
            title,
            description,
            images: [
                {
                    url: absoluteUrl(imagePath),
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [absoluteUrl(twitterImagePath)],
        },
    };
}
