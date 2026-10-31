import { ImageResponse } from "next/og";
import {
    SocialCard,
    getSocialLogoSrc,
    socialImageContentType,
    socialImageSize,
} from "@/lib/social-card";

export const alt = "World of Argentum";
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default async function OpenGraphImage() {
    const logoSrc = await getSocialLogoSrc();

    return new ImageResponse(
        <SocialCard
            eyebrow="MMORPG 2D"
            title="World of Argentum"
            description="Fantasía clásica gratis en el navegador y en el celular, sin descargas."
            bullets={[
                "Mundo abierto, clanes y guerras",
                "Mazmorras con acertijos y jefes",
                "Arena todos contra todos",
            ]}
            accent="#67e8f9"
            logoSrc={logoSrc}
        />,
        size,
    );
}
