import type { Metadata } from "next";
import UpdatesPanel from "@/components/UpdatesPanel";
import changelogEntries from "@/data/changelog.json";
import { buildPageMetadata } from "@/lib/seo";

// El changelog va de la más vieja a la más nueva.
const latest = changelogEntries[changelogEntries.length - 1];

const updatesDescription = `Seguí las novedades de World of Argentum. Última actualización: ${latest?.titulo ?? "nuevas mejoras en camino"}.`;

export const metadata: Metadata = buildPageMetadata({
    title: "Novedades y changelog",
    description: updatesDescription,
    path: "/updates",
    keywords: ["novedades World of Argentum", "changelog World of Argentum", "changelog MMORPG"],
    imagePath: "/updates/opengraph-image",
    twitterImagePath: "/updates/twitter-image",
});

export default function UpdatesPage() {
    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] px-4 py-12 text-stone-100">
            <div className="mx-auto max-w-4xl">
                <div className="mb-8">
                    <p className="text-[11px] uppercase tracking-[0.34em] text-amber-200/75">
                        World of Argentum
                    </p>
                    <h1 className="mt-3 text-3xl font-semibold text-white md:text-4xl">
                        Novedades
                    </h1>
                </div>

                <UpdatesPanel mode="full" backHref="/characters" />
            </div>
        </main>
    );
}
