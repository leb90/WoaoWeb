"use client";

import { useCallback, useState } from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import CharacterSpritePreview from "../CharacterSpritePreview";
import RacePortrait from "./RacePortrait";
import { cinzel, focusRing, panelClass } from "./styles";
import { DISPLAY_NAME_MAX_LENGTH } from "../../lib/name-validation";
import {
    ATTRIBUTE_GUIDE,
    BASE_ATTRIBUTE,
    STARTING_ZONE_NAME,
    type CharacterClassKey,
    type CharacterClassOption,
    type CombatPreview,
    type GenderKey,
    type PreviewHeading,
    type RaceBonus,
    type RaceKey,
    type RaceOption,
} from "../../lib/characterCreation";

// Creación de personaje en el celular (y en tablets): en vez de las tres columnas de escritorio, el personaje grande
// arriba y abajo un panel con pestañas (raza, rostro, clase y datos), con Atrás y Crear siempre a la vista. Entra en
// una pantalla sin scrollear. La lógica y el estado son los de CreateCharacterView.

type Tab = "raza" | "rostro" | "clase" | "datos";

const TABS: { key: Tab; label: string }[] = [
    { key: "raza", label: "Raza" },
    { key: "rostro", label: "Rostro" },
    { key: "clase", label: "Clase" },
    { key: "datos", label: "Datos" },
];

const ATTRIBUTE_ORDER: (keyof RaceBonus)[] = ["fuerza", "agilidad", "inteligencia", "carisma", "constitucion"];

const COMBAT_ROWS: { label: string; value: keyof CombatPreview }[] = [
    { label: "Acierto armas", value: "aciertoArmas" },
    { label: "Daño armas", value: "danoArmas" },
    { label: "Acierto proyectiles", value: "aciertoProyectiles" },
    { label: "Daño proyectiles", value: "danoProyectiles" },
    { label: "Evasión", value: "evasion" },
    { label: "Defensa", value: "defensaFisica" },
];

// El lienzo del personaje mide 112 × 138 por la escala, pero el personaje (con casco y arma) ocupa más o menos la mitad
// del alto: la escala sale del alto libre del escenario contando eso, y los bordes vacíos del lienzo se recortan.
const SPRITE_HEIGHT = 138;
const CHARACTER_SHARE = 0.62;
const MIN_SCALE = 1.4;
const MAX_SCALE = 3.2;

function formatBonus(value: number) {
    return value > 0 ? `+${value}` : String(value);
}

function bonusClass(value: number) {
    return value > 0 ? "text-[#7dce82]" : value < 0 ? "text-[#e23b3b]" : "text-[#9f9587]";
}

const chipBase = `flex shrink-0 items-center justify-center border transition duration-150 ${focusRing}`;
const chipOn = "border-[#d6a62d] bg-[#1c170d] text-[#f3e6b8] shadow-[0_0_10px_rgba(214,166,45,0.4)]";
const chipOff = "border-[#2a2418] bg-[#0b0b0b] text-[#cbb892]";

export default function MobileCharacterCreator({
    name,
    nameError,
    onNameChange,
    alianza,
    horda,
    race,
    onSelectRace,
    gender,
    onSelectGender,
    headIds,
    headIndex,
    onSelectHead,
    heading,
    onRotate,
    preview,
    classes,
    selectedClass,
    onSelectClass,
    combat,
    creating,
    error,
    onBack,
    onCreate,
}: {
    name: string;
    nameError: string | null;
    onNameChange: (value: string) => void;
    alianza: RaceOption[];
    horda: RaceOption[];
    race: RaceOption;
    onSelectRace: (race: RaceKey) => void;
    gender: GenderKey;
    onSelectGender: (gender: GenderKey) => void;
    headIds: number[];
    headIndex: number;
    onSelectHead: (index: number) => void;
    heading: PreviewHeading;
    onRotate: (direction: "prev" | "next") => void;
    preview: { bodyId: number; headId: number; weaponId: number; shieldId: number; helmetId: number; canRender: boolean };
    classes: CharacterClassOption[];
    selectedClass: CharacterClassKey | null;
    onSelectClass: (key: CharacterClassKey) => void;
    combat: CombatPreview | null;
    creating: boolean;
    error: string | null;
    onBack: () => void;
    onCreate: () => void;
}) {
    const [tab, setTab] = useState<Tab>("raza");
    const [faction, setFaction] = useState(race.faction);
    const [scale, setScale] = useState(1.5);
    const selectedClassOption = classes.find((option) => option.key === selectedClass) ?? null;
    const factionRaces = faction === "horda" ? horda : alianza;

    // El personaje usa el alto libre del escenario (cambia con la pantalla y con las barras del navegador).
    const stageRef = useCallback((stage: HTMLDivElement | null) => {
        if (!stage) {
            return;
        }
        const measure = () => {
            const fit = (stage.clientHeight - 16) / (SPRITE_HEIGHT * CHARACTER_SHARE);
            const next = Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, fit)) * 20) / 20;
            setScale((current) => (current === next ? current : next));
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(stage);
        return () => observer.disconnect();
    }, []);

    const create = () => {
        // Sin clase, el aviso se ve en la pestaña donde se elige.
        if (!selectedClass && name.trim() && !nameError) {
            setTab("clase");
        }
        onCreate();
    };

    return (
        <div className="mx-auto flex min-h-[calc(100dvh-7.5rem)] w-full max-w-[640px] flex-col gap-2">
            <div>
                <input
                    value={name}
                    onChange={(event) => onNameChange(event.target.value)}
                    maxLength={DISPLAY_NAME_MAX_LENGTH}
                    placeholder="Nombre del personaje..."
                    aria-label="Nombre del personaje"
                    aria-invalid={Boolean(nameError)}
                    className={`w-full border bg-black/70 px-3 py-2 text-center text-[15px] text-[#eee5d3] outline-none transition duration-150 placeholder:text-[#6f675c] ${focusRing} ${
                        nameError ? "border-[#e23b3b]" : "border-[#41351f] focus:border-[#d6a62d]"
                    }`}
                />
                {nameError ? (
                    <p className="mt-1 text-center text-[12px] text-[#e23b3b]" role="alert">
                        {nameError}
                    </p>
                ) : null}
            </div>

            {/* Escenario: el personaje grande, con los botones de girar a los costados. */}
            <section
                aria-label="Vista del personaje"
                className={`${panelClass} relative flex min-h-[170px] flex-1 flex-col bg-[radial-gradient(ellipse_at_center,rgba(48,36,18,0.5),rgba(5,5,5,0.2)_62%),linear-gradient(180deg,#100e0c,#070707)]`}
            >
                <p className="pt-2 text-center text-[12px] tracking-[0.2em] text-[#cbb892]" style={cinzel}>
                    {race.label.toUpperCase()} · {gender === "male" ? "HOMBRE" : "MUJER"}
                    {selectedClassOption ? ` · ${selectedClassOption.label.toUpperCase()}` : ""}
                </p>
                {/* El lienzo va suelto adentro del escenario: así el alto lo pone la pantalla y no el dibujo. */}
                <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                    {preview.canRender && preview.headId ? (
                        <CharacterSpritePreview
                            bodyId={preview.bodyId}
                            headId={preview.headId}
                            weaponId={preview.weaponId}
                            shieldId={preview.shieldId}
                            helmetId={preview.helmetId}
                            direction={heading}
                            scale={scale}
                            framed={false}
                            className="bg-transparent"
                        />
                    ) : (
                        <span className="text-xs text-[#9f9587]">Sin gráfico</span>
                    )}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Girar a la izquierda"
                    onClick={() => onRotate("prev")}
                    className={`absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#41351f] bg-black/60 text-[#d6a62d] ${focusRing}`}
                >
                    <RotateCcw size={20} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    aria-label="Girar a la derecha"
                    onClick={() => onRotate("next")}
                    className={`absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#41351f] bg-black/60 text-[#d6a62d] ${focusRing}`}
                >
                    <RotateCw size={20} aria-hidden="true" />
                </button>
            </section>

            {/* Panel de opciones con pestañas. */}
            <section className={`${panelClass} flex flex-col`} aria-label="Opciones del personaje">
                <div role="tablist" aria-label="Qué elegir" className="grid grid-cols-4 border-b border-[#41351f]">
                    {TABS.map(({ key, label }) => {
                        const active = tab === key;
                        const pending = key === "clase" && !selectedClass;
                        return (
                            <button
                                key={key}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(key)}
                                className={`relative py-2.5 text-[12px] tracking-[0.18em] transition duration-150 ${focusRing} ${
                                    active ? "bg-[#1c170d] text-[#f3e6b8]" : "text-[#9f9587]"
                                }`}
                                style={cinzel}
                            >
                                {label.toUpperCase()}
                                {pending ? (
                                    <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d6a62d]" aria-hidden="true" />
                                ) : null}
                                {active ? <span className="absolute inset-x-3 bottom-0 h-0.5 bg-[#d6a62d]" aria-hidden="true" /> : null}
                            </button>
                        );
                    })}
                </div>

                <div role="tabpanel" aria-label={TABS.find((item) => item.key === tab)?.label} className="h-[196px] overflow-y-auto p-2.5">
                    {tab === "raza" ? (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Facción">
                                {(["alianza", "horda"] as const).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-pressed={faction === key}
                                        onClick={() => setFaction(key)}
                                        className={`border py-1.5 text-[11px] tracking-[0.22em] ${focusRing} ${
                                            faction === key
                                                ? key === "alianza"
                                                    ? "border-[#4a6db0] bg-[#10203f] text-[#c3d4f2]"
                                                    : "border-[#a0443a] bg-[#3a1210] text-[#f2c1b9]"
                                                : "border-[#2a2418] text-[#9f9587]"
                                        }`}
                                    >
                                        {key === "alianza" ? "ALIANZA" : "HORDA"}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-6 gap-1.5" role="group" aria-label="Razas">
                                {factionRaces.map((option) => (
                                    <button
                                        key={option.key}
                                        type="button"
                                        aria-label={option.label}
                                        aria-pressed={option.key === race.key}
                                        onClick={() => onSelectRace(option.key)}
                                        className={`${chipBase} aspect-square w-full ${option.key === race.key ? chipOn : chipOff}`}
                                    >
                                        <RacePortrait headId={option.genders.male.startHeadId} label={option.label} size={40} />
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Sexo">
                                {(
                                    [
                                        ["male", "♂ Hombre"],
                                        ["female", "♀ Mujer"],
                                    ] as const
                                ).map(([key, label]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        aria-pressed={gender === key}
                                        onClick={() => onSelectGender(key)}
                                        className={`border py-1.5 text-[12px] tracking-[0.12em] ${focusRing} ${gender === key ? chipOn : chipOff}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[12px] leading-snug text-[#d7ccb4]">
                                <span className="text-[#f3e6b8]">{race.label}:</span> {race.summary}
                            </p>
                        </div>
                    ) : null}

                    {tab === "rostro" ? (
                        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Rostro">
                            {headIds.map((headId, index) => (
                                <button
                                    key={headId}
                                    type="button"
                                    aria-label={`Rostro ${index + 1}`}
                                    aria-pressed={index === headIndex}
                                    onClick={() => onSelectHead(index)}
                                    className={`${chipBase} h-12 w-12 ${index === headIndex ? chipOn : chipOff}`}
                                >
                                    <RacePortrait headId={headId} label={String(index + 1)} size={40} />
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {tab === "clase" ? (
                        <div className="flex flex-col gap-2">
                            <p className="min-h-[2.5em] text-[12px] leading-snug text-[#d7ccb4]">
                                {selectedClassOption ? (
                                    <>
                                        <span className="text-[#f3e6b8]">{selectedClassOption.label}:</span>{" "}
                                        {selectedClassOption.summary}
                                    </>
                                ) : (
                                    "Elegí una clase: el personaje se viste con su equipo."
                                )}
                            </p>
                            <div className="grid grid-cols-4 gap-1.5 min-[420px]:grid-cols-5" role="group" aria-label="Clases">
                                {classes.map((option) => {
                                    const active = option.key === selectedClass;
                                    return (
                                        <button
                                            key={option.key}
                                            type="button"
                                            aria-label={option.label}
                                            aria-pressed={active}
                                            onClick={() => onSelectClass(option.key)}
                                            className={`${chipBase} h-14 flex-col gap-0.5 px-0.5 ${active ? chipOn : chipOff}`}
                                        >
                                            <span aria-hidden="true" className="text-[17px] leading-none">
                                                {option.icon}
                                            </span>
                                            <span className="max-w-full truncate text-[10px] tracking-[0.04em]">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {tab === "datos" ? (
                        <div className="flex flex-col gap-2 text-[12px]">
                            <dl className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-0.5">
                                {ATTRIBUTE_ORDER.map((key) => (
                                    <div key={key} className="contents">
                                        <dt className="tracking-[0.1em] text-[#eee5d3]">{ATTRIBUTE_GUIDE[key].label}</dt>
                                        <dd className="text-right text-[#eee5d3]">{BASE_ATTRIBUTE}</dd>
                                        <dd className={`w-7 text-right ${bonusClass(race.bonus[key])}`}>{formatBonus(race.bonus[key])}</dd>
                                    </div>
                                ))}
                            </dl>
                            {combat ? (
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 border-t border-[#41351f]/70 pt-2">
                                    {COMBAT_ROWS.map(({ label, value }) => (
                                        <div key={value} className="flex justify-between gap-2">
                                            <dt className="text-[#9f9587]">{label}</dt>
                                            <dd className="text-[#eee5d3]">{combat[value]}</dd>
                                        </div>
                                    ))}
                                </dl>
                            ) : (
                                <p className="border-t border-[#41351f]/70 pt-2 text-[#9f9587]">
                                    Elegí una clase para ver el combate.
                                </p>
                            )}
                            <p className="text-[#9f9587]">
                                Zona inicial: <span className="text-[#eee5d3]">{STARTING_ZONE_NAME}</span>
                            </p>
                        </div>
                    ) : null}
                </div>
            </section>

            {error ? (
                <p className="text-center text-[12px] text-[#e23b3b]" role="alert">
                    {error}
                </p>
            ) : null}
            <div className="grid grid-cols-[auto_1fr] gap-2 pb-2">
                <button
                    type="button"
                    onClick={onBack}
                    className={`border border-[#3a3428] bg-[#141414] px-5 py-3 text-[12px] tracking-[0.22em] text-[#cbb892] ${focusRing}`}
                >
                    ATRÁS
                </button>
                <button
                    type="button"
                    onClick={create}
                    disabled={creating}
                    className={`border border-[#d6a62d] bg-[linear-gradient(180deg,#3a2e12,#1c160b)] py-3 text-[13px] tracking-[0.26em] text-[#f6e7c1] disabled:opacity-60 ${focusRing}`}
                >
                    {creating ? "CREANDO..." : "CREAR"}
                </button>
            </div>
        </div>
    );
}
