import type { Metadata, Viewport } from "next";
import { Cinzel, Geist, Geist_Mono } from "next/font/google";
import AppChrome from "@/components/AppChrome";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import {
    buildPageMetadata,
    siteDescription,
    siteTitle,
    siteUrl,
} from "@/lib/seo";
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
    applicationName: "AOWeb",
    title: {
        default: siteTitle,
        template: "%s | AOWeb",
    },
    description: siteDescription,
    authors: [{ name: "Damian Catanzaro" }],
    creator: "Damian Catanzaro",
    publisher: "AOWeb",
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
    return (
        <html lang="es-AR" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} antialiased`}
                suppressHydrationWarning
            >
                <ServiceWorkerRegistration />
                <AppChrome>{children}</AppChrome>
            </body>
        </html>
    );
}
