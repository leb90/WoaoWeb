"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Activity,
    Anchor,
    ArrowRight,
    BookOpen,
    Brain,
    Crosshair,
    Dumbbell,
    HeartPulse,
    Info,
    Leaf,
    Music2,
    Package,
    Shield,
    Sparkles,
    Swords,
    Target,
    UserRound,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import CharacterSpritePreview from "@/components/CharacterSpritePreview";
import RacePortrait from "@/components/character-creation/RacePortrait";
import { WikiSection, WikiTag } from "@/components/wiki/WikiUi";
import {
    MAX_LEVEL,
    characterClassOptions,
    getClassCreationPreview,
    getFinalStats,
    getHitModifierForLevel,
    getLegacyExpNextLevelForLevel,
    getMaxHpForLevel,
    getMaxManaForLevel,
    getRaceAppearance,
    getRaceOption,
    raceOptions,
    type CharacterClassKey,
    type FactionKey,
    type RaceKey,
} from "@/lib/characterCreation";

type ClassGuide = {
    role: string;
    resource: string;
    summary: string;
    strengths: string[];
};

const CLASS_GUIDES: Partial<Record<CharacterClassKey, ClassGuide>> = {
    mago: {
        role: "Daño mágico",
        resource: "Maná muy alto",
        summary: "Especialista en hechizos. Su reserva de maná crece más que la de cualquier otra clase, a cambio de una progresión de vida baja.",
        strengths: ["Magia ofensiva", "Gran reserva de maná", "Ataque a distancia"],
    },
    clerigo: {
        role: "Soporte híbrido",
        resource: "Maná alto",
        summary: "Combina magia, curación y combate. Curación Divina y Purificar le dan herramientas propias de soporte.",
        strengths: ["Curación", "Magia", "Versatilidad"],
    },
    guerrero: {
        role: "Combate frontal",
        resource: "Sin maná",
        summary: "La mayor progresión de vida entre las clases disponibles y un golpe base fuerte. Se concentra por completo en el combate físico.",
        strengths: ["Vida alta", "Armas", "Resistencia"],
    },
    asesino: {
        role: "Daño explosivo",
        resource: "Maná bajo",
        summary: "Clase móvil de dagas y apuñalada. Puede usar magia, pero su reserva es mucho menor que la de un lanzador dedicado.",
        strengths: ["Apuñalada", "Evasión", "Ataques oportunos"],
    },
    bardo: {
        role: "Control y evasión",
        resource: "Maná alto",
        summary: "Perfil mágico con gran evasión. Es inmune a estupidez, ceguera y paranoia.",
        strengths: ["Evasión", "Magia", "Resistencia a estados"],
    },
    druida: {
        role: "Control mágico",
        resource: "Maná alto",
        summary: "Lanzador versátil ligado a la naturaleza. Enredar no consume maná y su progresión mágica es cercana a la del Clérigo.",
        strengths: ["Control", "Invocaciones", "Magia"],
    },
    paladin: {
        role: "Guerrero de apoyo",
        resource: "Maná bajo",
        summary: "Combina una progresión de vida alta con magia limitada. Es resistente y puede sostener a su grupo.",
        strengths: ["Vida alta", "Escudo", "Soporte"],
    },
    cazador: {
        role: "Distancia resistente",
        resource: "Sin maná",
        summary: "Especialista en arco con buena progresión de vida. Hace menos daño con proyectiles que el Arquero, pero soporta mejor el combate.",
        strengths: ["Arcos", "Vida alta", "Supervivencia"],
    },
    pirata: {
        role: "Combate sostenido",
        resource: "Sin maná",
        summary: "Combatiente físico cercano al Guerrero en golpe y resistencia. No dispone de Remover Parálisis.",
        strengths: ["Armas", "Vida alta", "Presión frontal"],
    },
    arquero: {
        role: "Daño a distancia",
        resource: "Sin maná",
        summary: "La clase de mayor daño con arco y flechas. Su especialización ofensiva se compensa con una progresión de vida menor.",
        strengths: ["Proyectiles", "Alcance", "Daño alto"],
    },
};

const CLASS_ICONS: Partial<Record<CharacterClassKey, LucideIcon>> = {
    mago: Sparkles,
    clerigo: HeartPulse,
    guerrero: Swords,
    asesino: Crosshair,
    bardo: Music2,
    druida: Leaf,
    paladin: Shield,
    cazador: Target,
    pirata: Anchor,
    arquero: Crosshair,
};

const RACIAL_PASSIVES: Record<RaceKey, string> = {
    humano: "5% de resistencia mágica y 50% menos de maná al lanzar Remover Parálisis.",
    elfo: "10% de probabilidad de recuperar 15% del maná máximo al lanzar un hechizo.",
    elfoDrow: "3% de evasión adicional y 2% más de daño con proyectiles.",
    enano: "Con menos de 33% de vida, aumenta 50% su daño físico.",
    gnomo: "10% de evasión adicional.",
    orco: "10% de probabilidad de ignorar por completo un hechizo dañino.",
    vampiro: "Puede recuperar 15% de su vida al recibir daño y también al golpear criaturas.",
    abisario: "10% de probabilidad de sobrevivir con 1 punto de vida a un golpe mortal.",
    goblin: "15% de probabilidad de evitar una parálisis.",
    tauros: "5% de resistencia mágica y 5% de reducción frente a daño físico.",
    licantropo: "Puede aplicar un golpe crítico de 20% con ataques cuerpo a cuerpo y proyectiles.",
    nomuerto: "10% menos de daño de proyectiles y 50% menos de maná al lanzar Paralizar.",
};

const CLASS_ORDER = characterClassOptions.map((option) => option.key);

const ATTRIBUTES = [
    {
        key: "fuerza",
        label: "Fuerza",
        description: "Aumenta el daño base que producen las armas y los proyectiles.",
        icon: Dumbbell,
    },
    {
        key: "agilidad",
        label: "Agilidad",
        description: "Interviene en el acierto de los ataques y en la evasión.",
        icon: Zap,
    },
    {
        key: "inteligencia",
        label: "Inteligencia",
        description: "Define el maná inicial y su crecimiento según la clase.",
        icon: Brain,
    },
    {
        key: "carisma",
        label: "Carisma",
        description: "Es un modificador racial. Hoy no altera el combate ni las estadísticas derivadas.",
        icon: UserRound,
    },
    {
        key: "constitucion",
        label: "Constitución",
        description: "Define la vida inicial y modifica cuánta vida se obtiene al subir de nivel.",
        icon: HeartPulse,
    },
] as const;

const LEVEL_MILESTONES = [
    { level: "1", title: "Comienzo", text: "Nacés en Dungeon Newbie con 10 puntos de skill disponibles." },
    { level: "12", title: "Último nivel newbie", text: "Seguís usando el equipo protegido para principiantes." },
    { level: "13", title: "Fin de newbie", text: "El servidor retira todos los objetos newbie del personaje." },
    { level: "36", title: "Cambio de crecimiento", text: "Desde aquí cambia la progresión del golpe base por nivel." },
    { level: "50", title: "Nivel máximo", text: "La experiencia queda en 0/0 y ya no se obtienen más niveles." },
];

const EXP_REFERENCE_LEVELS = [1, 5, 10, 13, 20, 30, 40, 46, 49];
const NUMBER_FORMATTER = new Intl.NumberFormat("es-AR");

function formatNumber(value: number) {
    return NUMBER_FORMATTER.format(value);
}

function factionLabel(faction: FactionKey) {
    return faction === "alianza" ? "Alianza" : "Horda";
}

function StatBox({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="min-h-20 border border-amber-200/12 bg-black/35 px-3 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">{label}</p>
            <p className="mt-1 font-[var(--font-cinzel)] text-xl font-semibold text-stone-100">{value}</p>
            {hint ? <p className="mt-1 text-[11px] leading-4 text-stone-600">{hint}</p> : null}
        </div>
    );
}

function AttributeDelta({ value }: { value: number }) {
    const tone = value > 0 ? "text-emerald-400" : value < 0 ? "text-red-400" : "text-stone-600";
    return <span className={`font-mono text-[11px] ${tone}`}>{value > 0 ? `+${value}` : value}</span>;
}

export default function WikiPersonajesProgresion() {
    const [selectedClass, setSelectedClass] = useState<CharacterClassKey>("mago");
    const [selectedRace, setSelectedRace] = useState<RaceKey>("humano");
    const [selectedFaction, setSelectedFaction] = useState<FactionKey>("alianza");
    const [level, setLevel] = useState(1);

    const activeClass = characterClassOptions.find((option) => option.key === selectedClass) ?? characterClassOptions[0];
    const activeRace = getRaceOption(selectedRace);
    const activeGuide = CLASS_GUIDES[selectedClass] ?? CLASS_GUIDES.mago!;
    const finalStats = getFinalStats(selectedRace);
    const raceAppearance = getRaceAppearance(selectedRace, "male");
    const previewGear = getClassCreationPreview(selectedClass, selectedRace, "male", raceAppearance.bodyId);
    const factionRaces = useMemo(
        () => raceOptions.filter((race) => race.faction === selectedFaction),
        [selectedFaction],
    );
    const computedStats = {
        vida: getMaxHpForLevel(selectedClass, finalStats.constitucion, level),
        mana: getMaxManaForLevel(selectedClass, finalStats.inteligencia, level),
        golpeMin: 1 + getHitModifierForLevel(selectedClass, level),
        golpeMax: 2 + getHitModifierForLevel(selectedClass, level),
        exp: level >= MAX_LEVEL ? 0 : getLegacyExpNextLevelForLevel(level),
    };

    function selectRace(raceKey: RaceKey) {
        const race = getRaceOption(raceKey);
        setSelectedRace(raceKey);
        setSelectedFaction(race.faction);
    }

    function selectFaction(faction: FactionKey) {
        setSelectedFaction(faction);

        if (activeRace.faction !== faction) {
            const firstRace = raceOptions.find((race) => race.faction === faction);
            if (firstRace) setSelectedRace(firstRace.key);
        }
    }

    return (
        <div className="mt-6 space-y-5">
            <nav
                aria-label="Contenido de personajes y progresión"
                className="grid border border-amber-200/15 bg-[#0a0806] sm:grid-cols-3 lg:grid-cols-6"
            >
                {[
                    ["#simulador", "Simulador"],
                    ["#clases", "Clases"],
                    ["#razas", "Razas"],
                    ["#atributos", "Atributos"],
                    ["#progresion", "Progresión"],
                    ["#equipamiento", "Equipamiento"],
                ].map(([href, label]) => (
                    <a
                        key={href}
                        href={href}
                        className="border-b border-amber-200/10 px-3 py-3 text-center text-xs font-medium text-stone-400 transition hover:bg-amber-300/5 hover:text-amber-100 sm:border-r"
                    >
                        {label}
                    </a>
                ))}
            </nav>

            <figure className="overflow-hidden border border-amber-200/15 bg-black">
                <Image
                    src="/wiki/primeros-pasos/crear-personaje.jpg"
                    alt="Creación de personaje con facciones, razas, clases, atributos y estadísticas derivadas"
                    width={1000}
                    height={500}
                    priority
                    className="aspect-[2/1] w-full object-cover object-center"
                />
                <figcaption className="border-t border-amber-200/10 px-4 py-3 text-xs leading-5 text-stone-500">
                    La raza define facción, atributos y pasiva. La clase define el estilo de combate y el crecimiento del personaje.
                </figcaption>
            </figure>

            <div id="simulador" className="scroll-mt-28">
                <WikiSection title="Simulador de personaje">
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
                        <div className="space-y-5">
                            <div>
                                <div className="mb-3 flex items-center justify-between gap-4">
                                    <h3 className="font-[var(--font-cinzel)] text-lg font-semibold text-stone-100">Elegí una clase</h3>
                                    <span className="text-xs text-stone-600">10 disponibles</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="Clase">
                                    {characterClassOptions.map((option) => {
                                        const Icon = CLASS_ICONS[option.key] ?? Swords;
                                        const active = option.key === selectedClass;
                                        return (
                                            <button
                                                key={option.key}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => setSelectedClass(option.key)}
                                                className={`flex min-h-14 items-center gap-2 border px-3 py-2 text-left text-xs font-medium transition ${
                                                    active
                                                        ? "border-amber-300/70 bg-amber-300/10 text-amber-100"
                                                        : "border-stone-800 bg-black/30 text-stone-400 hover:border-amber-200/30 hover:text-stone-200"
                                                }`}
                                            >
                                                <Icon className="h-4 w-4 shrink-0 text-amber-300/75" aria-hidden />
                                                {option.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="font-[var(--font-cinzel)] text-lg font-semibold text-stone-100">Elegí una raza</h3>
                                    <div className="flex border border-stone-800" role="group" aria-label="Facción">
                                        {(["alianza", "horda"] as const).map((faction) => (
                                            <button
                                                key={faction}
                                                type="button"
                                                aria-pressed={selectedFaction === faction}
                                                onClick={() => selectFaction(faction)}
                                                className={`h-9 px-4 text-xs font-semibold transition ${
                                                    selectedFaction === faction
                                                        ? faction === "alianza"
                                                            ? "bg-blue-500/15 text-blue-200"
                                                            : "bg-red-500/15 text-red-200"
                                                        : "text-stone-500 hover:text-stone-200"
                                                }`}
                                            >
                                                {factionLabel(faction)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6" role="group" aria-label="Raza">
                                    {factionRaces.map((race) => {
                                        const active = race.key === selectedRace;
                                        return (
                                            <button
                                                key={race.key}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => selectRace(race.key)}
                                                className={`flex min-h-20 flex-col items-center justify-center border px-2 py-2 text-xs transition ${
                                                    active
                                                        ? "border-amber-300/70 bg-amber-300/10 text-amber-100"
                                                        : "border-stone-800 bg-black/30 text-stone-400 hover:border-amber-200/30 hover:text-stone-200"
                                                }`}
                                            >
                                                <RacePortrait headId={race.genders.male.startHeadId} label={race.label} size={42} />
                                                <span className="mt-1">{race.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-4">
                                    <label htmlFor="wiki-character-level" className="text-sm font-medium text-stone-200">
                                        Nivel de referencia
                                    </label>
                                    <output htmlFor="wiki-character-level" className="font-[var(--font-cinzel)] text-xl font-semibold text-amber-200">
                                        {level}
                                    </output>
                                </div>
                                <input
                                    id="wiki-character-level"
                                    type="range"
                                    min="1"
                                    max={MAX_LEVEL}
                                    value={level}
                                    onChange={(event) => setLevel(Number(event.target.value))}
                                    className="h-2 w-full cursor-pointer accent-amber-400"
                                />
                                <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-stone-600">
                                    <span>Nivel 1</span>
                                    <span>Nivel 50</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-amber-200/15 bg-black/35 p-4">
                            <div className="flex items-start gap-4">
                                <div className="grid min-h-[224px] w-[180px] shrink-0 place-items-center overflow-hidden border border-amber-200/12 bg-[#070605]">
                                    <CharacterSpritePreview
                                        bodyId={previewGear.bodyId}
                                        headId={raceAppearance.startHeadId}
                                        weaponId={previewGear.weaponId}
                                        shieldId={previewGear.shieldId}
                                        helmetId={previewGear.helmetId}
                                        scale={1.6}
                                        framed={false}
                                    />
                                </div>
                                <div className="min-w-0 pt-1">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-300/75">
                                        {factionLabel(activeRace.faction)}
                                    </p>
                                    <h3 className="mt-2 font-[var(--font-cinzel)] text-2xl font-semibold text-stone-50">
                                        {activeClass.label} {activeRace.label}
                                    </h3>
                                    <p className="mt-2 text-sm leading-6 text-stone-400">{activeGuide.summary}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <WikiTag>{activeGuide.role}</WikiTag>
                                        <WikiTag>{activeGuide.resource}</WikiTag>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <StatBox label="Vida" value={formatNumber(computedStats.vida)} />
                                <StatBox label="Maná" value={formatNumber(computedStats.mana)} />
                                <StatBox label="Golpe base" value={`${computedStats.golpeMin}-${computedStats.golpeMax}`} />
                                <StatBox
                                    label="Próximo nivel"
                                    value={level >= MAX_LEVEL ? "Máximo" : `${formatNumber(computedStats.exp)} EXP`}
                                />
                            </div>
                            <p className="mt-3 flex gap-2 text-[11px] leading-5 text-stone-600">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                Valores base sin equipo, skills, mejoras temporales ni montura.
                            </p>
                        </div>
                    </div>
                </WikiSection>
            </div>

            <div id="clases" className="scroll-mt-28">
                <WikiSection title="Clases disponibles">
                    <div className="mb-4 max-w-3xl text-sm leading-6 text-stone-400">
                        <p>
                            La clase define el crecimiento de vida, maná y golpe base. También condiciona qué objetos podés usar y en qué forma de combate rendís mejor.
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {CLASS_ORDER.map((classKey) => {
                            const option = characterClassOptions.find((item) => item.key === classKey)!;
                            const guide = CLASS_GUIDES[classKey]!;
                            const Icon = CLASS_ICONS[classKey] ?? Swords;
                            return (
                                <button
                                    key={classKey}
                                    type="button"
                                    onClick={() => {
                                        setSelectedClass(classKey);
                                        document.getElementById("simulador")?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                    className="group min-h-52 border border-stone-800 bg-black/30 p-4 text-left transition hover:border-amber-300/45 hover:bg-amber-300/[0.035]"
                                >
                                    <span className="flex items-start justify-between gap-3">
                                        <span className="grid h-10 w-10 place-items-center border border-amber-200/20 bg-amber-300/5 text-amber-200">
                                            <Icon className="h-5 w-5" aria-hidden />
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600 group-hover:text-amber-300/70">
                                            Ver combinación
                                        </span>
                                    </span>
                                    <strong className="mt-4 block font-[var(--font-cinzel)] text-lg text-stone-100">{option.label}</strong>
                                    <span className="mt-1 block text-xs font-medium text-amber-200/70">{guide.role} · {guide.resource}</span>
                                    <span className="mt-3 block text-sm leading-5 text-stone-500">{guide.summary}</span>
                                    <span className="mt-4 flex flex-wrap gap-1.5">
                                        {guide.strengths.map((strength) => (
                                            <span key={strength} className="border border-stone-800 px-2 py-1 text-[10px] text-stone-400">
                                                {strength}
                                            </span>
                                        ))}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-4 border-l-2 border-amber-300/50 bg-amber-300/[0.035] px-4 py-3 text-sm leading-6 text-stone-400">
                        Ladrón, Bandido, Ermitaño y Domador existen en los datos del juego, pero no están habilitados para crear personajes. Las antiguas clases trabajadoras tampoco aparecen en la creación actual.
                    </div>
                </WikiSection>
            </div>

            <div id="razas" className="scroll-mt-28">
                <WikiSection title="Razas y facciones">
                    <div className="flex flex-col gap-4 border-b border-amber-200/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl text-sm leading-6 text-stone-400">
                            <p>
                                Cada raza pertenece a una facción fija. Los cinco atributos empiezan en 18 y reciben el modificador racial que ves en cada ficha.
                            </p>
                        </div>
                        <div className="flex w-fit border border-stone-800" role="group" aria-label="Filtrar razas por facción">
                            {(["alianza", "horda"] as const).map((faction) => (
                                <button
                                    key={faction}
                                    type="button"
                                    aria-pressed={selectedFaction === faction}
                                    onClick={() => selectFaction(faction)}
                                    className={`h-10 px-5 text-xs font-semibold ${
                                        selectedFaction === faction
                                            ? faction === "alianza"
                                                ? "bg-blue-500/15 text-blue-200"
                                                : "bg-red-500/15 text-red-200"
                                            : "text-stone-500 hover:text-stone-200"
                                    }`}
                                >
                                    {factionLabel(faction)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {factionRaces.map((race) => (
                            <button
                                key={race.key}
                                type="button"
                                onClick={() => selectRace(race.key)}
                                className={`min-h-52 border p-4 text-left transition ${
                                    race.key === selectedRace
                                        ? "border-amber-300/60 bg-amber-300/[0.055]"
                                        : "border-stone-800 bg-black/30 hover:border-amber-200/35"
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="grid h-16 w-16 shrink-0 place-items-center border border-amber-200/15 bg-black">
                                        <RacePortrait headId={race.genders.male.startHeadId} label={race.label} size={58} />
                                    </span>
                                    <span>
                                        <span className="block font-[var(--font-cinzel)] text-lg font-semibold text-stone-100">{race.label}</span>
                                        <span className={`mt-1 block text-[10px] font-bold uppercase tracking-[0.2em] ${race.faction === "alianza" ? "text-blue-300/75" : "text-red-300/75"}`}>
                                            {factionLabel(race.faction)}
                                        </span>
                                    </span>
                                </span>
                                <span className="mt-4 grid grid-cols-5 gap-1 border-y border-stone-800 py-2">
                                    {(["fuerza", "agilidad", "inteligencia", "carisma", "constitucion"] as const).map((attribute) => (
                                        <span key={attribute} className="text-center">
                                            <span className="block text-[9px] uppercase text-stone-600">{attribute.slice(0, 3)}</span>
                                            <AttributeDelta value={race.bonus[attribute]} />
                                        </span>
                                    ))}
                                </span>
                                <span className="mt-3 block text-xs leading-5 text-stone-400">{RACIAL_PASSIVES[race.key]}</span>
                            </button>
                        ))}
                    </div>
                </WikiSection>
            </div>

            <div id="atributos" className="scroll-mt-28">
                <WikiSection title="Atributos">
                    <div className="grid gap-px border border-amber-200/12 bg-amber-200/12 md:grid-cols-2 xl:grid-cols-5">
                        {ATTRIBUTES.map((attribute) => {
                            const Icon = attribute.icon;
                            return (
                                <article key={attribute.key} className="min-h-44 bg-[#0a0806] p-4">
                                    <Icon className="h-5 w-5 text-amber-300/75" aria-hidden />
                                    <h3 className="mt-4 font-[var(--font-cinzel)] font-semibold text-stone-100">{attribute.label}</h3>
                                    <p className="mt-2 text-sm leading-6 text-stone-500">{attribute.description}</p>
                                </article>
                            );
                        })}
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="border border-stone-800 bg-black/25 p-4">
                            <h3 className="text-sm font-semibold text-stone-200">Atributos permanentes</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-500">
                                Los valores elegidos al crear el personaje quedan guardados. Fuerza y Agilidad pueden recibir mejoras o reducciones temporales durante el juego.
                            </p>
                        </div>
                        <div className="border border-stone-800 bg-black/25 p-4">
                            <h3 className="text-sm font-semibold text-stone-200">Bonificaciones de equipo</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-500">
                                Algunos objetos suman Fuerza, Agilidad o maná máximo mientras permanecen equipados. No modifican el atributo base guardado.
                            </p>
                        </div>
                    </div>
                </WikiSection>
            </div>

            <div id="progresion" className="scroll-mt-28">
                <WikiSection title="Experiencia y niveles">
                    <div className="max-w-3xl text-sm leading-6 text-stone-400">
                        <p>
                            La experiencia obtenida se acumula dentro del nivel actual. Si una recompensa alcanza para varios niveles, el servidor procesa cada subida en orden y conserva el excedente.
                        </p>
                    </div>

                    <ol className="mt-5 grid border border-amber-200/12 lg:grid-cols-5">
                        {LEVEL_MILESTONES.map((milestone) => (
                            <li key={milestone.level} className="relative min-h-40 border-b border-amber-200/10 p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
                                <span className="font-[var(--font-cinzel)] text-3xl font-semibold text-amber-200">{milestone.level}</span>
                                <h3 className="mt-2 text-sm font-semibold text-stone-200">{milestone.title}</h3>
                                <p className="mt-2 text-xs leading-5 text-stone-500">{milestone.text}</p>
                            </li>
                        ))}
                    </ol>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(300px,0.85fr)]">
                        <div className="border border-stone-800 bg-black/25">
                            <div className="border-b border-stone-800 px-4 py-3">
                                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-stone-300">Experiencia para el siguiente nivel</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[460px] text-left text-sm">
                                    <thead className="bg-white/[0.025] text-[10px] uppercase tracking-[0.16em] text-stone-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Nivel actual</th>
                                            <th className="px-4 py-3 font-medium">Objetivo</th>
                                            <th className="px-4 py-3 text-right font-medium">EXP requerida</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-800">
                                        {EXP_REFERENCE_LEVELS.map((currentLevel) => (
                                            <tr key={currentLevel} className="text-stone-400">
                                                <td className="px-4 py-2.5 font-medium text-stone-200">{currentLevel}</td>
                                                <td className="px-4 py-2.5">Nivel {currentLevel + 1}</td>
                                                <td className="px-4 py-2.5 text-right font-mono text-amber-100/85">
                                                    {formatNumber(getLegacyExpNextLevelForLevel(currentLevel))}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="border border-stone-800 bg-black/25 p-4">
                                <Activity className="h-5 w-5 text-amber-300/70" aria-hidden />
                                <h3 className="mt-3 text-sm font-semibold text-stone-200">Al subir de nivel</h3>
                                <p className="mt-2 text-sm leading-6 text-stone-500">
                                    Aumentan vida, maná y golpe base según la clase. La vida y el maná se restauran por completo.
                                </p>
                            </div>
                            <div className="border border-stone-800 bg-black/25 p-4">
                                <BookOpen className="h-5 w-5 text-amber-300/70" aria-hidden />
                                <h3 className="mt-3 text-sm font-semibold text-stone-200">Puntos de skill</h3>
                                <p className="mt-2 text-sm leading-6 text-stone-500">
                                    Los personajes creados reciben 10 puntos al comenzar y 5 más por cada nivel. Cada skill tiene un tope ligado al nivel, hasta un máximo de 200.
                                </p>
                            </div>
                        </div>
                    </div>
                </WikiSection>
            </div>

            <div id="equipamiento" className="scroll-mt-28">
                <WikiSection title="Equipamiento y crecimiento real">
                    <div className="grid gap-px border border-amber-200/12 bg-amber-200/12 md:grid-cols-3">
                        {[
                            {
                                title: "Restricciones de clase",
                                text: "Cada objeto puede excluir clases concretas. El servidor vuelve a validarlo cada vez que intentás usarlo o equiparlo.",
                                icon: Shield,
                            },
                            {
                                title: "Restricciones de raza",
                                text: "Las armaduras pueden estar destinadas a cuerpos bajos, elfos, vampiros, humanos u orcos.",
                                icon: UserRound,
                            },
                            {
                                title: "Estadísticas equipadas",
                                text: "Armas, armaduras, escudos, cascos y anillos pueden sumar daño, defensa, resistencia o atributos.",
                                icon: Package,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            return (
                                <article key={item.title} className="min-h-48 bg-[#0a0806] p-5">
                                    <Icon className="h-5 w-5 text-amber-300/75" aria-hidden />
                                    <h3 className="mt-4 font-[var(--font-cinzel)] font-semibold text-stone-100">{item.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-stone-500">{item.text}</p>
                                </article>
                            );
                        })}
                    </div>
                    <div className="mt-4 flex flex-col gap-4 border border-amber-300/20 bg-amber-300/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-[var(--font-cinzel)] font-semibold text-stone-100">Revisá cada objeto antes de armar tu personaje</h3>
                            <p className="mt-1 text-sm leading-6 text-stone-500">
                                El catálogo muestra sus valores y requisitos actuales directamente desde los datos públicos del juego.
                            </p>
                        </div>
                        <Link
                            href="/wiki/objetos"
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 border border-amber-300/45 px-4 text-xs font-bold uppercase tracking-[0.12em] text-amber-100 transition hover:bg-amber-300/10"
                        >
                            Ver objetos <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                </WikiSection>
            </div>
        </div>
    );
}
