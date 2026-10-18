import type { Metadata } from "next";
import WikiShell from "@/components/wiki/WikiShell";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
    title: "Wiki oficial de World of Argentum",
    description:
        "Guías, objetos, NPC, mapas, hechizos, recetas y misiones de World of Argentum, disponibles sin iniciar sesión.",
    path: "/wiki",
    keywords: ["World of Argentum Wiki", "guía World of Argentum", "objetos AO", "mapas AO"],
});

export default function WikiLayout({ children }: { children: React.ReactNode }) {
    return <WikiShell>{children}</WikiShell>;
}
