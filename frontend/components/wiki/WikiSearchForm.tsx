import { Search } from "lucide-react";

export default function WikiSearchForm({
    defaultValue = "",
    compact = false,
}: {
    defaultValue?: string;
    compact?: boolean;
}) {
    return (
        <form
            action="/wiki/buscar"
            className={`flex w-full items-center border border-amber-200/20 bg-black/45 shadow-[0_12px_35px_rgba(0,0,0,0.25)] focus-within:border-amber-300/55 ${
                compact ? "h-11 max-w-xl" : "h-14 max-w-3xl"
            }`}
        >
            <Search className="ml-4 h-4 w-4 shrink-0 text-amber-300/70" />
            <input
                type="search"
                name="q"
                defaultValue={defaultValue}
                placeholder="Buscar objetos, NPC, mapas, hechizos, recetas o misiones..."
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-stone-100 outline-none placeholder:text-stone-500"
                aria-label="Buscar en la Wiki"
            />
            <button
                type="submit"
                className="mr-1.5 h-8 border border-amber-300/30 bg-amber-300/10 px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100 transition hover:bg-amber-300/20"
            >
                Buscar
            </button>
        </form>
    );
}
