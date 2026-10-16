import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function WikiBreadcrumbs({
    items,
}: {
    items: Array<{ label: string; href?: string }>;
}) {
    return (
        <nav aria-label="Ruta" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
            <Link href="/wiki" className="transition hover:text-amber-200">Wiki</Link>
            {items.map((item) => (
                <span key={`${item.href ?? "current"}-${item.label}`} className="flex items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 text-amber-500/50" />
                    {item.href ? (
                        <Link href={item.href} className="transition hover:text-amber-200">{item.label}</Link>
                    ) : (
                        <span className="text-stone-300">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
