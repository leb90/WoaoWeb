import type { Viewport } from "next";

// Solo para el juego: se ocupa toda la pantalla (incluida la zona del notch
// en horizontal) y se desactiva el zoom, que en iOS se dispara al enfocar
// inputs y descoloca todo el HUD.
export const viewport: Viewport = {
    themeColor: "#050302",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
};

export default function PlayLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return children;
}
