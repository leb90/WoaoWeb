import type { Metadata, Viewport } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { preload } from "react-dom";
import AppChrome from "@/components/AppChrome";
import CursorWarmup from "@/components/CursorWarmup";
import DrawnCursor from "@/components/DrawnCursor";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import {
    buildPageMetadata,
    siteDescription,
    siteTitle,
    siteUrl,
} from "@/lib/seo";
import { CURSOR_URLS } from "@/lib/gameCursors";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const cinzel = Cinzel({
    variable: "--font-cinzel",
    subsets: ["latin"],
    weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
    ...buildPageMetadata({
        title: siteTitle,
        description: siteDescription,
        path: "/",
        imagePath: "/opengraph-image",
        twitterImagePath: "/twitter-image",
    }),
    metadataBase: new URL(siteUrl),
    applicationName: "World of Argentum",
    title: {
        default: siteTitle,
        template: "%s | World of Argentum",
    },
    description: siteDescription,
    authors: [{ name: "World of Argentum" }],
    creator: "World of Argentum",
    publisher: "World of Argentum",
    category: "games",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/static/imgs/woaoicon-192.png", sizes: "192x192", type: "image/png" },
            { url: "/static/imgs/woaoicon-512.png", sizes: "512x512", type: "image/png" },
        ],
        shortcut: "/favicon.ico",
        apple: "/static/imgs/woaoicon-apple.png",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        title: "World of AO",
        statusBarStyle: "black-translucent",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        },
    },
};

export const viewport: Viewport = {
    themeColor: "#050302",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Los cursores van en el <head> desde el principio, con prioridad alta: si no, el primero de cada tipo aparece con
    // la flecha del sistema. CursorWarmup los deja decodificados en memoria toda la visita.
    for (const href of CURSOR_URLS) {
        preload(href, { as: "image", fetchPriority: "high" });
    }

    return (
        <html lang="es-AR" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
                suppressHydrationWarning
            >
                {/*
                  Capturamos beforeinstallprompt lo antes posible: si el SW ya
                  estaba activo de una visita anterior, Chrome puede disparar
                  el evento antes de que React termine de montar el botón, y
                  se pierde para siempre si nadie lo está escuchando todavía.
                */}
                <Script id="capture-install-prompt" strategy="beforeInteractive">
                    {`
                        window.__woaoDeferredPrompt = null;
                        window.addEventListener("beforeinstallprompt", function (event) {
                            event.preventDefault();
                            window.__woaoDeferredPrompt = event;
                            window.dispatchEvent(new CustomEvent("woao:beforeinstallprompt"));
                        });
                    `}
                </Script>
                <ServiceWorkerRegistration />
                <CursorWarmup />
                <DrawnCursor />
                <AppChrome>{children}</AppChrome>
            </body>
        </html>
    );
}
