import { Swords } from "lucide-react";
import Link from "next/link";

/**
 * El mundo está cerrado para esta cuenta: no se puede cerrar el aviso, porque
 * la API igual rechaza elegir o crear personajes.
 */
export default function WorldClosedModal() {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="world-closed-title"
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-stone-950/80 px-4 py-6 backdrop-blur-sm"
        >
            <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(28,25,23,0.98),rgba(12,10,9,0.98))] p-6 text-center shadow-2xl">
                <div className="mx-auto w-fit rounded-2xl border border-amber-300/25 bg-amber-300/10 p-3 text-amber-200">
                    <Swords className="h-6 w-6" />
                </div>
                <h2
                    id="world-closed-title"
                    className="mt-4 text-xl font-semibold text-white"
                >
                    Estamos preparando la beta
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-300">
                    Estamos trabajando para largar una beta en condiciones.
                    Mientras tanto, podés jugar en las arenas.
                </p>
                <Link
                    href="/arenas"
                    prefetch={false}
                    className="mt-6 block w-full rounded-2xl bg-amber-300 px-4 py-3 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
                >
                    Ir a las arenas
                </Link>
            </div>
        </div>
    );
}
