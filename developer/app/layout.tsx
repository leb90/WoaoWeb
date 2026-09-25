import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WoAO Developer Tools",
  description: "Herramientas internas de desarrollo — World of Argentum",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
