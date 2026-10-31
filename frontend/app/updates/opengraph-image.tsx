import { ImageResponse } from "next/og";
import changelogEntries from "@/data/changelog.json";
import {
    SocialCard,
    getSocialLogoSrc,
    socialImageContentType,
    socialImageSize,
} from "@/lib/social-card";

export const alt = "Novedades de World of Argentum";
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default async function UpdatesOpenGraphImage() {
    // El changelog va de la más vieja a la más nueva.
    const latest = changelogEntries[changelogEntries.length - 1];
    const logoSrc = await getSocialLogoSrc();

    return new ImageResponse(
        <SocialCard
            eyebrow="Novedades"
            title="Changelog de World of Argentum"
            description={`Última actualización: ${latest?.titulo ?? "nuevas mejoras en camino"}.`}
            bullets={latest?.features.slice(0, 3) ?? []}
            accent="#fbbf24"
            logoSrc={logoSrc}
        />,
        size,
    );
}
