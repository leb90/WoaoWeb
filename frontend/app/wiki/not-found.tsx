import Link from "next/link";
import { SearchX } from "lucide-react";

export default function WikiNotFound() {
    return (
        <div className="grid min-h-[420px] place-items-center border border-amber-200/15 bg-[#0a0806] p-8 text-center">
            <div>
                <SearchX className="mx-auto h-10 w-10 text-amber-300/45" />
                <h1 className="mt-4 font-[var(--font-cinzel)] text-2xl font-semibold text-stone-100">Contenido no encontrado</h1>
                <p className="mt-2 text-sm text-stone-500">La entrada no existe o no forma parte de la Wiki pública.</p>
                <Link href="/wiki" className="mt-6 inline-flex border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-amber-100 hover:bg-amber-300/20">
                    Volver a la Wiki
                </Link>
            </div>
        </div>
    );
}
