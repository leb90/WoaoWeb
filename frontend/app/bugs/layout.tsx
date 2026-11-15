import type { Metadata } from "next";

// Página de staff: no se indexa.
export const metadata: Metadata = {
    title: "Reportes de bugs",
    robots: { index: false, follow: false },
};

export default function BugsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
