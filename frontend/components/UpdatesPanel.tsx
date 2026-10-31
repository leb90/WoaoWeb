"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import changelogEntries from "@/data/changelog.json";

type ChangelogEntry = {
    fecha: string;
    titulo: string;
    features: string[];
};

type UpdatesPanelProps = {
    mode?: "preview" | "full";
    backHref?: string;
};

// data/changelog.json va de la más vieja a la más nueva; acá se muestra la última primero.
const reversedChangelogEntries = [
    ...(changelogEntries as ChangelogEntry[]),
].reverse();

const MONTHS = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
];

// "2026-10-31" → "31 oct 2026", sin depender del idioma del navegador.
function formatUpdateDate(fecha: string) {
    const [year, month, day] = fecha.split("-").map(Number);
    return `${day} ${MONTHS[month - 1] ?? ""} ${year}`;
}

function UpdateHeader({
    entry,
    number,
}: {
    entry: ChangelogEntry;
    number: number;
}) {
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-amber-300/12 px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-amber-100">
                    Update {String(number).padStart(2, "0")}
                </span>
                <span className="text-[11px] text-stone-400">
                    {formatUpdateDate(entry.fecha)}
                </span>
            </div>
            <p className="mt-3 text-base font-semibold text-white">
                {entry.titulo}
            </p>
        </>
    );
}

export default function UpdatesPanel({
    mode = "preview",
    backHref,
}: UpdatesPanelProps) {
    const isPreview = mode === "preview";
    const [isChangelogExpanded, setIsChangelogExpanded] = useState(false);
    const changelogPreview = reversedChangelogEntries[0];
    const visibleChangelogEntries =
        isPreview || !isChangelogExpanded
            ? reversedChangelogEntries.slice(0, 1)
            : reversedChangelogEntries;

    useEffect(() => {
        if (isPreview) {
            return;
        }

        const syncExpandedSections = () => {
            const rawHash = window.location.hash;
            const normalizedHash = rawHash.includes("#")
                ? `#${rawHash.split("#").filter(Boolean)[0] ?? ""}`
                : rawHash;

            if (normalizedHash && normalizedHash !== rawHash) {
                window.history.replaceState(
                    null,
                    "",
                    `${window.location.pathname}${window.location.search}${normalizedHash}`,
                );
            }

            setIsChangelogExpanded(normalizedHash === "#changelog");
        };

        syncExpandedSections();
        window.addEventListener("hashchange", syncExpandedSections);

        return () => {
            window.removeEventListener("hashchange", syncExpandedSections);
        };
    }, [isPreview]);

    const navigateToChangelog = () => {
        if (typeof window !== "undefined") {
            window.location.assign("/updates#changelog");
        }
    };

    return (
        <div className="space-y-6">
            {backHref ? (
                <div className="flex justify-end">
                    <Link
                        href={backHref}
                        prefetch={false}
                        className="text-sm text-stone-300 transition hover:text-stone-100"
                    >
                        Volver
                    </Link>
                </div>
            ) : null}

            <section
                id="changelog"
                className="rounded-[28px] border border-white/8 bg-stone-950/75 p-5 shadow-2xl backdrop-blur-md"
            >
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-amber-200/75">
                        Changelog
                    </p>
                    {isPreview ? (
                        <button
                            type="button"
                            onClick={navigateToChangelog}
                            className="text-xs font-medium uppercase tracking-[0.22em] text-amber-100 transition hover:text-white"
                        >
                            Mostrar más
                        </button>
                    ) : null}
                </div>

                <div className="mt-5 space-y-4">
                    {isPreview ? (
                        changelogPreview ? (
                            <article className="relative overflow-hidden rounded-2xl border border-white/7 bg-white/4 p-4">
                                <UpdateHeader
                                    entry={changelogPreview}
                                    number={reversedChangelogEntries.length}
                                />

                                <ul className="mt-3 space-y-2 text-sm text-stone-300">
                                    {changelogPreview.features
                                        .slice(0, 3)
                                        .map((feature) => (
                                            <li
                                                key={feature}
                                                className="flex gap-2 leading-6"
                                            >
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                </ul>

                                {changelogPreview.features.length > 3 ? (
                                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-stone-950 via-stone-950/85 to-transparent" />
                                ) : null}
                            </article>
                        ) : null
                    ) : (
                        visibleChangelogEntries.map((entry, index) => (
                            <article
                                key={entry.fecha}
                                className="relative rounded-2xl border border-white/7 bg-white/4 p-4"
                            >
                                <UpdateHeader
                                    entry={entry}
                                    number={
                                        reversedChangelogEntries.length - index
                                    }
                                />

                                <ul className="mt-3 space-y-2 text-sm text-stone-300">
                                    {entry.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex gap-2 leading-6"
                                        >
                                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))
                    )}

                    {!isPreview && reversedChangelogEntries.length > 1 ? (
                        <button
                            type="button"
                            onClick={() =>
                                setIsChangelogExpanded((current) => !current)
                            }
                            className="w-full rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-medium text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-300/15"
                        >
                            {isChangelogExpanded
                                ? "Mostrar menos"
                                : "Mostrar más"}
                        </button>
                    ) : null}
                </div>
            </section>
        </div>
    );
}
