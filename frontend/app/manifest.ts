import type { MetadataRoute } from "next";
import { siteDescription, siteName } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteName,
        short_name: siteName,
        description: siteDescription,
        start_url: "/",
        display: "standalone",
        background_color: "#050302",
        theme_color: "#050302",
        lang: "es-AR",
        categories: ["games", "entertainment"],
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
            {
                src: "/static/imgs/woaoicon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "/static/imgs/woaoicon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
    };
}
