import Link from "next/link";
import { ArrowRight, Droplets, EyeOff, Gem, Shield, Sparkles, Swords, Target } from "lucide-react";
import { WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import { RARITY_COLORS, RARITY_NAMES } from "@/lib/itemRarity";
import balance from "@/lib/wiki-pvp-balance.json";

// Nivelación PvP: los números salen del simulador del server (server/src/scripts/balanceSim, motor real de
// combate) y se regeneran con wiki.ts. Ver docs/balance/BALANCE_PVP.md.

const CLASS_NAMES: Record<number, string> = { 1: "Mago", 2: "Clérigo", 3: "Guerrero", 4: "Asesino", 6: "Bardo", 7: "Druida", 8: "Paladín", 9: "Cazador", 18: "Pirata", 20: "Arquero", 22: "Chamán" };
const MODE_LABELS: Record<string, string> = { magia: "magia", melee: "golpe", rango: "flecha" };

const CLASS_IDENTITY: Array<{ id: number; text: string }> = [
    { id: 1, text: "El que más daño hace con magia. Nada de daño físico." },
    { id: 7, text: "Menos magia que el mago y un arma que sirve." },
    { id: 2, text: "Como el druida, pero con más armas: pega más cuerpo a cuerpo que con magia. Con set, a un mago con set lo mata con un golpe y una magia la mayoría de las veces." },
    { id: 6, text: "Mixto: un poco de magia y un poco de arma." },
    { id: 8, text: "Mucho cuerpo a cuerpo y poca magia." },
    { id: 4, text: "Golpe común por debajo del guerrero; su fuerte es la apuñalada por la espalda, que deja al otro desangrándose." },
    { id: 3, text: "El que más pega físico. Nada de magia." },
    { id: 9, text: "Arco; el cuerpo a cuerpo queda en segundo plano." },
    { id: 18, text: "Golpe y aguante cercanos al guerrero, con un poco de magia." },
    { id: 20, text: "Flechas muy fuertes y rápidas: con set mata a un mago en 2. Poca vida y poca resistencia a la magia; con el set Silvano completo, 3 de cada 10 parálisis le fallan." },
    { id: 22, text: "Solo magia elemental: pega parecido a la Llama del mago, pero la resistencia mágica no la frena, así que rinde más contra los que aguantan magia. Vive de sus escudos y casi no pega con el bastón." },
];

// Mismos valores que server/src/itemRarity.ts.
const RARITY_DETAILS = [
    { chance: "66,9 %", bonus: "Stats del objeto, sin extra." },
    { chance: "30 %", bonus: "+1 al golpe o a la defensa, +2 al daño mágico." },
    { chance: "3 %", bonus: "+2 al golpe o a la defensa, +4 al daño mágico." },
    { chance: "0,1 %", bonus: "+3 al golpe o a la defensa, +6 al daño mágico. No se cae al morir." },
];

const formatHits = (value: number | null | undefined) =>
    typeof value === "number" ? value.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—";

function attackerLabel(classId: number, mode: string, modes: string[]) {
    const name = CLASS_NAMES[classId] ?? `Clase ${classId}`;
    return modes.length > 1 ? `${name} (${MODE_LABELS[mode] ?? mode})` : name;
}

// Más aciertos = pelea más larga. El color ayuda a leer la tabla de un vistazo.
function hitsTone(value: number | null | undefined) {
    if (typeof value !== "number") return "text-stone-600";
    if (value < 2.5) return "text-rose-200";
    if (value < 3.5) return "text-amber-100";
    if (value < 4.5) return "text-stone-200";
    return "text-sky-200";
}

function describeBonus(bonus: { hpPct?: number; manaPct?: number; dmgPct?: number }) {
    return [
        bonus.hpPct ? `+${bonus.hpPct} % de vida máxima` : "",
        bonus.manaPct ? `+${bonus.manaPct} % de maná` : "",
        bonus.dmgPct ? `+${bonus.dmgPct} % de daño contra jugadores` : "",
    ]
        .filter(Boolean)
        .join(" y ");
}

const modesOf = (classId: number) => balance.classes.find((cls) => cls.id === classId)?.modes ?? [];
const hasSet = (classId: number) => balance.sets.some((set) => set.classes.includes(classId));
const defenders = balance.classes.map((cls) => cls.id);
type HitsByDefender = Record<string, number | null>;
const vsOf = (row: (typeof balance.attackers)[number], level: number) => (row.vs as Record<string, HitsByDefender>)[String(level)] ?? {};
const mageVsMage = (level: number) => {
    const row = balance.attackers.find((entry) => entry.classId === 1 && entry.mode === "magia");
    return row ? vsOf(row, level)["1"] : null;
};
type VitalsByClass = Record<string, Record<string, { comun: number | null; set: number | null }>>;

export default function WikiPvpBalance() {
    const hp50 = (balance.hp as VitalsByClass)["50"] ?? {};
    const setSteps = balance.sets[0]?.bonuses ?? [];

    return (
        <div className="mt-6 space-y-5">
            <WikiSection title="Cómo se lee esta guía">
                <div className="space-y-4">
                    <div className="max-w-4xl space-y-3 text-sm leading-6 text-stone-400">
                        <p>
                            La medida es <strong className="text-stone-200">cuántos aciertos hacen falta para matar a alguien de tu nivel</strong>: golpes, flechas o hechizos que entran, sin que el otro se cure. Los fallos no cuentan. Un 2,5 quiere decir que la mitad de las veces son 2 y la otra mitad 3.
                        </p>
                        <p>
                            Los números salen del simulador del servidor, que usa el mismo cálculo de daño del juego, con {balance.trials.toLocaleString("es-AR")} peleas por cruce: personajes humanos, buffeados (fuerza y agilidad al doble) y con los skills al tope del nivel.
                        </p>
                    </div>
                    <div className="grid gap-px border border-amber-200/12 bg-amber-200/12 grid-cols-2 sm:grid-cols-4">
                        {balance.levels.map((level) => (
                            <article key={level} className="bg-[#0a0806] p-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Mago contra mago, nivel {level}</span>
                                <strong className="mt-2 block font-[var(--font-cinzel)] text-3xl text-amber-100">{formatHits(mageVsMage(level))}</strong>
                                <span className="mt-1 block text-xs text-stone-500">aciertos para matar</span>
                            </article>
                        ))}
                        <article className="bg-[#0a0806] p-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Vida a nivel 50</span>
                            <span className="mt-2 block text-sm text-stone-300">
                                Mago <strong className="text-amber-100">{hp50["1"]?.comun ?? "—"}</strong>
                            </span>
                            <span className="block text-sm text-stone-300">
                                Guerrero <strong className="text-amber-100">{hp50["3"]?.comun ?? "—"}</strong>
                            </span>
                            <span className="mt-1 block text-xs text-stone-500">+20 % con el set completo</span>
                        </article>
                    </div>
                </div>
            </WikiSection>

            <WikiSection title="Aciertos para matar por nivel">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-stone-400">
                    Promedio contra las 10 clases, los dos con el mejor equipo común (sin premios). Más alto es una pelea más larga.
                </p>
                <div className="overflow-x-auto border border-amber-200/12">
                    <table className="w-full min-w-[320px] text-left text-sm">
                        <thead className="bg-amber-200/[0.035] text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                            <tr>
                                <th className="px-4 py-2">Clase atacante</th>
                                {balance.levels.map((level) => (
                                    <th key={level} className="px-4 py-2 text-right">Nivel {level}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-200/10">
                            {balance.attackers.map((row) => (
                                <tr key={`${row.classId}-${row.mode}`} className="bg-black/20">
                                    <td className="px-4 py-2 text-stone-200">{attackerLabel(row.classId, row.mode, modesOf(row.classId))}</td>
                                    {balance.levels.map((level) => {
                                        const value = (row.average as Record<string, number | null>)[String(level)];
                                        return (
                                            <td key={level} className={`px-4 py-2 text-right font-semibold tabular-nums ${hitsTone(value)}`}>
                                                {formatHits(value)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </WikiSection>

            <WikiSection title="Nivel 50, uno contra uno">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-stone-400">
                    Fila: quién ataca y con qué. Columna: a quién. Equipo común contra común.
                </p>
                <div className="overflow-x-auto border border-amber-200/12">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-amber-200/[0.035] text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">
                            <tr>
                                <th className="px-3 py-2">Ataca \ Defiende</th>
                                {defenders.map((id) => (
                                    <th key={id} className="px-3 py-2 text-right">{CLASS_NAMES[id]}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-amber-200/10">
                            {balance.attackers.map((row) => (
                                <tr key={`${row.classId}-${row.mode}`} className="bg-black/20">
                                    <td className="whitespace-nowrap px-3 py-2 text-stone-200">{attackerLabel(row.classId, row.mode, modesOf(row.classId))}</td>
                                    {defenders.map((id) => {
                                        const value = vsOf(row, 50)[String(id)];
                                        return (
                                            <td key={id} className={`px-3 py-2 text-right font-semibold tabular-nums ${hitsTone(value)}`}>
                                                {formatHits(value)}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </WikiSection>

            <WikiSection title="Identidad de cada clase">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {CLASS_IDENTITY.map((entry) => (
                        <article key={entry.id} className="border border-stone-800 bg-black/30 p-4">
                            <strong className="font-[var(--font-cinzel)] text-base text-stone-100">{CLASS_NAMES[entry.id]}</strong>
                            <p className="mt-2 text-sm leading-6 text-stone-500">{entry.text}</p>
                        </article>
                    ))}
                </div>
                <div className="mt-4 border-l-2 border-amber-300/50 bg-amber-300/[0.035] px-4 py-3 text-sm leading-6 text-stone-400">
                    <Swords className="mr-1.5 inline h-4 w-4 text-amber-300/75" aria-hidden />
                    En peleas contra jugadores, la fuerza y la agilidad que cuentan para el daño tienen un tope de <strong className="text-stone-200">40</strong> (buff y objetos incluidos). Contra criaturas no hay tope.
                </div>
            </WikiSection>

            <WikiSection title="Sets de tier">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="min-w-0 space-y-3 text-sm leading-6 text-stone-400">
                        <p>
                            Cada clase tiene su set de cuatro piezas (el cazador y el pirata todavía no). El bono depende de cuántas piezas distintas tengas puestas y se aplica el escalón más alto, sin sumarse:
                        </p>
                        <ul className="space-y-2">
                            {setSteps.map((step) => (
                                <li key={step.pieces} className="flex gap-3 border border-amber-200/12 bg-black/25 px-3 py-2">
                                    <Shield className="mt-1 h-4 w-4 shrink-0 text-amber-300/75" aria-hidden />
                                    <span>
                                        <strong className="text-stone-100">{step.pieces} piezas:</strong> {describeBonus(step)}.
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p>
                            Las piezas de set son <strong style={{ color: RARITY_COLORS[3] }}>siempre Legendarias</strong>: suman el extra de esa rareza y no se caen al morir.
                        </p>
                        <p>La idea es que el set valga más o menos un acierto a nivel 50:</p>
                        <div className="overflow-x-auto border border-amber-200/12">
                            <table className="w-full min-w-[460px] text-left text-xs">
                                <thead className="bg-amber-200/[0.035] text-[9px] font-bold uppercase tracking-[0.14em] text-stone-500">
                                    <tr>
                                        <th className="px-3 py-2">Clase</th>
                                        <th className="px-3 py-2 text-right">Sin set los dos</th>
                                        <th className="px-3 py-2 text-right">Vos con set</th>
                                        <th className="px-3 py-2 text-right">El otro con set</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-amber-200/10">
                                    {balance.attackers
                                        .filter((row) => modesOf(row.classId)[0] === row.mode && hasSet(row.classId))
                                        .map((row) => (
                                            <tr key={row.classId} className="bg-black/20">
                                                <td className="px-3 py-2 text-stone-200">{attackerLabel(row.classId, row.mode, modesOf(row.classId))}</td>
                                                <td className="px-3 py-2 text-right tabular-nums text-stone-300">{formatHits(row.set50.comun)}</td>
                                                <td className="px-3 py-2 text-right font-semibold tabular-nums text-emerald-200">{formatHits(row.set50.conSet)}</td>
                                                <td className="px-3 py-2 text-right font-semibold tabular-nums text-orange-200">{formatHits(row.set50.contraSet)}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs text-stone-500">Aciertos para matar a nivel 50, promedio contra las 10 clases.</p>
                    </div>
                    <div className="grid content-start gap-3 sm:grid-cols-2">
                        {balance.sets.map((set) => (
                            <article key={set.id} className="border border-stone-800 bg-black/30 p-4">
                                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">
                                    Temporada {set.season} · {set.classes.map((id) => CLASS_NAMES[id] ?? `Clase ${id}`).join(" y ")}
                                </span>
                                <strong className="mt-1 block font-[var(--font-cinzel)] text-sm" style={{ color: RARITY_COLORS[3] }}>
                                    {set.name}
                                </strong>
                                <ul className="mt-2 space-y-1 text-xs leading-5 text-stone-400">
                                    {set.pieces.map((piece) => (
                                        <li key={piece.slot}>
                                            <span className="text-stone-500">{piece.slot}:</span>{" "}
                                            <Link href={`/wiki/objetos/${piece.id}`} className="text-stone-300 hover:text-amber-100">
                                                {piece.name}
                                            </Link>
                                            {piece.variants > 1 ? <span className="text-stone-600"> (+{piece.variants - 1} variantes)</span> : null}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </div>
            </WikiSection>

            <WikiSection title="Rarezas de los objetos">
                <p className="mb-4 max-w-3xl text-sm leading-6 text-stone-400">
                    Las armas, armaduras, cascos, escudos y anillos pueden salir con rareza cuando caen de una criatura, cuando los crafteás o como recompensa de una misión. Cada objeto tiene la suya: dos espadas iguales pueden ser de rarezas distintas, y los objetos con rareza no se apilan.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {RARITY_NAMES.map((name, index) => (
                        <article key={name} className="border bg-black/30 p-4" style={{ borderColor: `${RARITY_COLORS[index]}66` }}>
                            <span className="flex items-center gap-2">
                                <Gem className="h-4 w-4" style={{ color: RARITY_COLORS[index] }} aria-hidden />
                                <strong className="font-[var(--font-cinzel)] text-base" style={{ color: RARITY_COLORS[index] }}>
                                    {name}
                                </strong>
                                <span className="ml-auto text-xs font-semibold text-stone-400">{RARITY_DETAILS[index].chance}</span>
                            </span>
                            <p className="mt-2 text-sm leading-6 text-stone-500">{RARITY_DETAILS[index].bonus}</p>
                        </article>
                    ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                    <WikiTag>El nombre muestra el nivel: &quot;+1&quot;, &quot;+2&quot; o &quot;+3&quot;</WikiTag>
                    <WikiTag>El borde del inventario toma el color de la rareza</WikiTag>
                    <WikiTag>Mercado y subastas no aceptan objetos con rareza</WikiTag>
                </div>
            </WikiSection>

            <WikiSection title="Apuñalada y desangrado">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <div className="space-y-3 text-sm leading-6 text-stone-400">
                        <p>
                            Cuando un <strong className="text-stone-200">asesino</strong> con un arma de apuñalar acierta una apuñalada <strong className="text-stone-200">por la espalda</strong> a otro jugador, el golpe suma apenas un 10 % de daño, pero abre una herida:
                        </p>
                        <ul className="space-y-2">
                            {[
                                "Durante 10 segundos, cada segundo la herida saca lo mismo que el golpe que la abrió.",
                                "Curarse no la cierra: hay que curarse muy rápido, con magias de otros jugadores o tomando pociones seguidas, o se muere.",
                                "Una apuñalada nueva reinicia el desangrado. Entrar a zona segura lo corta.",
                                "Si te mata, cuenta como que te mató el asesino.",
                            ].map((text) => (
                                <li key={text} className="flex gap-3 border border-red-900/40 bg-red-950/10 px-3 py-2">
                                    <Droplets className="mt-1 h-4 w-4 shrink-0 text-red-400/80" aria-hidden />
                                    <span>{text}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-xs text-stone-500">
                            Mientras sangrás, arriba de la pantalla aparece &quot;Te estás desangrando&quot; con la cuenta de 10 a 0. Las demás clases que apuñalan hacen el daño doble de siempre, sin desangrado.
                        </p>
                    </div>
                    <div className="border border-stone-800 bg-black/30 p-4 text-sm leading-6 text-stone-400">
                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-500">Ejemplo, nivel 50</span>
                        <p className="mt-2">
                            Si el golpe pega 200, la apuñalada hace 220 y después viene un golpe de 200 por segundo durante 10 segundos: en total 2220. Un mago tiene unos 390 de vida (466 con su set): sin curarse muere en 2 segundos.
                        </p>
                    </div>
                </div>
            </WikiSection>

            <WikiSection title="Invisibilidad en combate">
                <div className="grid gap-px border border-amber-200/12 bg-amber-200/12 md:grid-cols-3">
                    {[
                        {
                            icon: EyeOff,
                            title: "Sirve para escapar",
                            text: "Mientras no pelees contra jugadores, para los demás sos invisible del todo.",
                        },
                        {
                            icon: Sparkles,
                            title: "Pelear te delata",
                            text: "Si atacás a un jugador o te atacan estando invisible, durante 5 segundos aparecés y desaparecés (fade in y fade out) para los demás. Pegar o tirar un hechizo de daño te saca la invisibilidad.",
                        },
                        {
                            icon: Target,
                            title: "Contador en pantalla",
                            text: "En una esquina de la pantalla ves cuánto tiempo de invisibilidad u ocultamiento te queda.",
                        },
                    ].map((item) => {
                        const Icon = item.icon;
                        return (
                            <article key={item.title} className="bg-[#0a0806] p-5">
                                <Icon className="h-5 w-5 text-violet-300/80" aria-hidden />
                                <h3 className="mt-4 font-[var(--font-cinzel)] font-semibold text-stone-100">{item.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-stone-500">{item.text}</p>
                            </article>
                        );
                    })}
                </div>
            </WikiSection>

            <div className="flex flex-col gap-4 border border-amber-300/20 bg-amber-300/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-[var(--font-cinzel)] font-semibold text-stone-100">Armá tu personaje</h3>
                    <p className="mt-1 text-sm leading-6 text-stone-500">Vida y maná por clase y raza en la calculadora; stats de cada objeto en el catálogo.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link href="/wiki/personajes" className="inline-flex h-11 items-center gap-2 border border-amber-300/45 px-4 text-xs font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-300/10">
                        Calculadora <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link href="/wiki/objetos" className="inline-flex h-11 items-center gap-2 border border-amber-300/45 px-4 text-xs font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-300/10">
                        Objetos <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                </div>
            </div>
        </div>
    );
}
