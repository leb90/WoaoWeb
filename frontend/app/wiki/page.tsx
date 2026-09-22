import Link from "next/link";

export default function WikiPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#050302] px-4 text-stone-100">
            <div className="w-full max-w-md rounded-[6px] border border-amber-200/15 bg-[linear-gradient(160deg,rgba(40,28,10,0.55),rgba(5,3,2,0.9))] p-8 text-center shadow-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-200/70">
                    Wiki
                </p>
                <h1
                    className="mt-3 text-2xl text-stone-50"
                    style={{ fontFamily: "var(--font-cinzel)" }}
                >
                    Disponible próximamente
                </h1>
                <p className="mt-4 text-sm leading-6 text-stone-300/80">
                    Estamos reordenando la wiki. Volvé a pasar más adelante.
                </p>
                <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-2 rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#2a1704] transition hover:brightness-110"
                >
                    Volver al inicio
                </Link>
            </div>
        </main>
    );
}
