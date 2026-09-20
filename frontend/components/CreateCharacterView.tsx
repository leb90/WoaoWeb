"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import CharacterSpritePreview from "../components/CharacterSpritePreview";
import type { AuthErrorResponse, AuthSession } from "../lib/auth";
import {
    DISPLAY_NAME_MAX_LENGTH,
    getDisplayNameError,
} from "../lib/name-validation";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import type { BodiesDB, GraphicsDB, HeadsDB } from "../types/game";
import { loadBodiesDB, loadGraphicsDB, loadHeadsDB } from "../utils/gameLoader";
import {
    characterClassOptions,
    getAlianzaRaces,
    getClassCreationPreview,
    getClassOption,
    getCombatPreview,
    getHeadIds,
    getHordaRaces,
    getRaceAppearance,
    getRaceOption,
    type CharacterClassKey,
    type GenderKey,
    type RaceKey,
} from "../lib/characterCreation";

const initialClass = characterClassOptions[0].key;
const initialRace = getAlianzaRaces()[0].key;
const FRONT_DIRECTION = "2";

function resolveGraphicFrame(graphicsDB: GraphicsDB, graphicId: number) {
    const graphic = graphicsDB[graphicId.toString()];

    if (!graphic) {
        return null;
    }

    if (graphic.numFile) {
        return graphic;
    }

    const frameId =
        graphic.frames?.[FRONT_DIRECTION] ??
        graphic.frames?.["1"] ??
        Object.values(graphic.frames ?? {})[0];

    if (!frameId) {
        return null;
    }

    return graphicsDB[frameId.toString()] ?? null;
}

function isRenderableHead(
    headId: number,
    headsDB: HeadsDB,
    graphicsDB: GraphicsDB,
) {
    const headData = headsDB[headId.toString()];
    if (!headData) {
        return false;
    }
    return Boolean(resolveGraphicFrame(graphicsDB, headData[FRONT_DIRECTION]));
}

function isRenderableBody(
    bodyId: number,
    bodiesDB: BodiesDB,
    graphicsDB: GraphicsDB,
) {
    const bodyData = bodiesDB[bodyId.toString()];
    if (!bodyData) {
        return false;
    }
    return Boolean(resolveGraphicFrame(graphicsDB, bodyData[FRONT_DIRECTION]));
}

function formatBonus(value: number) {
    if (value > 0) {
        return `+${value}`;
    }
    return String(value);
}

type HeadWithFile = [file: string, sX: number, sY: number, width: number, height: number];
const PORTRAIT_SIZE = 48;
const PORTRAIT_SCALE = 2;
let headsWithFilePromise: Promise<Record<string, HeadWithFile>> | null = null;
const portraitImageCache = new Map<string, Promise<HTMLImageElement>>();

function loadHeadsWithFile() {
    headsWithFilePromise ??= fetch("/init/headswithfile.json?v=3.0").then(
        (response) => response.json() as Promise<Record<string, HeadWithFile>>,
    );
    return headsWithFilePromise;
}

function loadPortraitImage(file: string) {
    const cached = portraitImageCache.get(file);
    if (cached) {
        return cached;
    }

    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`No se pudo cargar ${file}`));
        image.src = `/graphics/${file}.png`;
    });
    portraitImageCache.set(file, loaded);
    return loaded;
}

function trimOpaquePixels(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
) {
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
            if (pixels[(y * width + x) * 4 + 3] < 24) {
                continue;
            }

            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }
    }

    if (maxX < minX || maxY < minY) {
        return null;
    }

    return {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
    };
}

function RacePortrait({
    headId,
    label,
}: {
    headId: number;
    label: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setFailed(false);

        loadHeadsWithFile()
            .then(async (data) => {
                const frame = data[String(headId)];
                const canvas = canvasRef.current;
                if (!frame || !canvas) {
                    throw new Error("Sin retrato");
                }

                const [file, sX, sY, width, height] = frame;
                const image = await loadPortraitImage(file);
                if (cancelled) {
                    return;
                }

                const source = document.createElement("canvas");
                source.width = width;
                source.height = height;
                const sourceContext = source.getContext("2d");
                const destContext = canvas.getContext("2d");
                if (!sourceContext || !destContext) {
                    throw new Error("Sin canvas");
                }

                sourceContext.clearRect(0, 0, width, height);
                sourceContext.drawImage(image, sX, sY, width, height, 0, 0, width, height);
                const bounds = trimOpaquePixels(
                    sourceContext.getImageData(0, 0, width, height).data,
                    width,
                    height,
                ) ?? { x: 0, y: 0, width, height };

                const drawWidth = bounds.width * PORTRAIT_SCALE;
                const drawHeight = bounds.height * PORTRAIT_SCALE;

                destContext.imageSmoothingEnabled = false;
                destContext.clearRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
                destContext.drawImage(
                    source,
                    bounds.x,
                    bounds.y,
                    bounds.width,
                    bounds.height,
                    Math.floor((PORTRAIT_SIZE - drawWidth) / 2),
                    Math.floor((PORTRAIT_SIZE - drawHeight) / 2),
                    drawWidth,
                    drawHeight,
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setFailed(true);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [headId]);

    if (failed) {
        return <span className="px-1 text-center text-[9px] leading-tight">{label}</span>;
    }

    return (
        <canvas
            ref={canvasRef}
            width={PORTRAIT_SIZE}
            height={PORTRAIT_SIZE}
            aria-label={label}
            className="block"
            style={{
                width: PORTRAIT_SIZE,
                height: PORTRAIT_SIZE,
                imageRendering: "pixelated",
            }}
        />
    );
}

export default function CreateCharacterView() {
    const router = useRouter();
    const { session } = useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });
    const [creatingCharacter, setCreatingCharacter] = useState(false);
    const [newCharacterName, setNewCharacterName] = useState("");
    const [selectedClass, setSelectedClass] =
        useState<CharacterClassKey>(initialClass);
    const [selectedRace, setSelectedRace] = useState<RaceKey>(initialRace);
    const [selectedGender, setSelectedGender] = useState<GenderKey>("male");
    const [selectedHeadIndex, setSelectedHeadIndex] = useState(0);
    const [graphicsDB, setGraphicsDB] = useState<GraphicsDB | null>(null);
    const [bodiesDB, setBodiesDB] = useState<BodiesDB | null>(null);
    const [headsDB, setHeadsDB] = useState<HeadsDB | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedClassOption = useMemo(
        () => getClassOption(selectedClass),
        [selectedClass],
    );
    const selectedRaceOption = useMemo(
        () => getRaceOption(selectedRace),
        [selectedRace],
    );
    const headIds = useMemo(
        () => getHeadIds(selectedRace, selectedGender),
        [selectedRace, selectedGender],
    );
    const selectedAppearance = useMemo(
        () => getRaceAppearance(selectedRace, selectedGender),
        [selectedRace, selectedGender],
    );
    const availableHeadIds = useMemo(() => {
        if (!graphicsDB || !headsDB) {
            return headIds;
        }
        return headIds.filter((headId) =>
            isRenderableHead(headId, headsDB, graphicsDB),
        );
    }, [graphicsDB, headIds, headsDB]);
    const selectedHeadId =
        availableHeadIds[selectedHeadIndex] ??
        availableHeadIds[0] ??
        headIds[0];
    const combatPreview = useMemo(
        () => getCombatPreview(selectedClass, selectedRace),
        [selectedClass, selectedRace],
    );
    const classPreview = useMemo(
        () =>
            getClassCreationPreview(
                selectedClass,
                selectedRace,
                selectedGender,
                selectedAppearance.bodyId,
            ),
        [
            selectedAppearance.bodyId,
            selectedClass,
            selectedGender,
            selectedRace,
        ],
    );
    const hasRenderableBody = useMemo(() => {
        if (!graphicsDB || !bodiesDB) {
            return true;
        }
        return isRenderableBody(
            classPreview.bodyId,
            bodiesDB,
            graphicsDB,
        );
    }, [bodiesDB, classPreview.bodyId, graphicsDB]);

    useEffect(() => {
        setSelectedHeadIndex(0);
    }, [selectedRace, selectedGender]);

    useEffect(() => {
        let cancelled = false;
        Promise.all([loadGraphicsDB(), loadBodiesDB(), loadHeadsDB()])
            .then(([graphics, bodies, heads]) => {
                if (!cancelled) {
                    setGraphicsDB(graphics);
                    setBodiesDB(bodies);
                    setHeadsDB(heads);
                }
            })
            .catch((loadError) => {
                console.error(
                    "Error loading character creation assets:",
                    loadError,
                );
            });
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (selectedHeadIndex >= availableHeadIds.length) {
            setSelectedHeadIndex(0);
        }
    }, [availableHeadIds.length, selectedHeadIndex]);

    const cycleHead = (direction: "prev" | "next") => {
        const total = availableHeadIds.length;
        if (total === 0) {
            return;
        }
        setSelectedHeadIndex((current) => {
            if (direction === "prev") {
                return (current - 1 + total) % total;
            }
            return (current + 1) % total;
        });
    };

    const createCharacter = async () => {
        const trimmedName = newCharacterName.trim();
        if (!trimmedName) {
            setError("Necesitas escribir un nombre para tu personaje.");
            return;
        }
        const nameError = getDisplayNameError(trimmedName);
        if (nameError) {
            setError(nameError);
            return;
        }
        setCreatingCharacter(true);
        setError(null);
        try {
            const response = await fetch("/api/auth/create-character", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: trimmedName,
                    class: selectedClass,
                    race: selectedRace,
                    gender: selectedGender,
                    headId: selectedHeadId,
                }),
            });
            const result = (await response.json()) as
                | AuthSession
                | AuthErrorResponse;
            if (!response.ok || "error" in result) {
                throw new Error(
                    "error" in result
                        ? result.error
                        : "No se pudo crear el personaje",
                );
            }
            router.push("/characters");
            router.refresh();
        } catch (creationError) {
            setError(
                creationError instanceof Error
                    ? creationError.message
                    : "Error inesperado al crear el personaje",
            );
        } finally {
            setCreatingCharacter(false);
        }
    };

    const statRows = [
        { label: "FUERZA", value: 18, bonus: selectedRaceOption.bonus.fuerza },
        { label: "AGILIDAD", value: 18, bonus: selectedRaceOption.bonus.agilidad },
        {
            label: "INTELIGENCIA",
            value: 18,
            bonus: selectedRaceOption.bonus.inteligencia,
        },
        { label: "CARISMA", value: 18, bonus: selectedRaceOption.bonus.carisma },
        {
            label: "CONSTITUCION",
            value: 18,
            bonus: selectedRaceOption.bonus.constitucion,
        },
    ];

    return (
        <main className="min-h-screen overflow-x-auto overflow-y-auto bg-black px-3 py-6 text-[#d6c48a] md:px-6">
            <div className="mx-auto min-w-[980px] max-w-[1100px] rounded-sm border border-[#2a2a2a] bg-[#070707] px-4 py-5 md:px-6">
                <header className="mb-4 text-center">
                    <p className="text-[11px] uppercase tracking-[0.55em] text-[#bfa15a]">
                        Word of Argentum
                    </p>
                    <h1 className="mt-1 text-2xl font-light tracking-[0.28em] text-[#f3e6b8] md:text-3xl">
                        ONLINE
                    </h1>
                    <input
                        value={newCharacterName}
                        onChange={(event) =>
                            setNewCharacterName(event.target.value)
                        }
                        maxLength={DISPLAY_NAME_MAX_LENGTH}
                        placeholder="Nombre del personaje"
                        className="mx-auto mt-3 block w-56 border border-[#3a3a3a] bg-black/60 px-3 py-1 text-center text-sm text-[#f3e6b8] outline-none"
                    />
                </header>

                {session ? (
                    <section className="grid grid-cols-[92px_minmax(280px,1fr)_92px_240px] items-start gap-4">
                        <RaceColumn
                            title="ALIANZA"
                            tone="alianza"
                            races={getAlianzaRaces()}
                            selectedRace={selectedRace}
                            onSelect={setSelectedRace}
                        />

                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => cycleHead("prev")}
                                    className="text-2xl text-[#bfa15a]"
                                >
                                    ‹
                                </button>
                                {hasRenderableBody && selectedHeadId ? (
                                    <CharacterSpritePreview
                                        bodyId={classPreview.bodyId}
                                        headId={selectedHeadId}
                                        weaponId={classPreview.weaponId}
                                        shieldId={classPreview.shieldId}
                                        helmetId={classPreview.helmetId}
                                        scale={1.55}
                                        className="rounded-none border border-[#333] bg-black"
                                    />
                                ) : (
                                    <div className="flex h-[214px] w-[174px] items-center justify-center border border-[#333] bg-black text-xs">
                                        Sin grafico
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => cycleHead("next")}
                                    className="text-2xl text-[#bfa15a]"
                                >
                                    ›
                                </button>
                            </div>

                            <dl className="mt-5 w-full max-w-sm space-y-1 text-sm">
                                {statRows.map((stat) => (
                                    <div
                                        key={stat.label}
                                        className="grid grid-cols-[1fr_auto] gap-3"
                                    >
                                        <dt>{stat.label}</dt>
                                        <dd className="text-[#e23b3b]">
                                            {stat.value} + {formatBonus(stat.bonus)}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        <RaceColumn
                            title="HORDA"
                            tone="horda"
                            races={getHordaRaces()}
                            selectedRace={selectedRace}
                            onSelect={setSelectedRace}
                        />

                        <aside className="space-y-4 text-sm">
                            <div>
                                <p className="mb-2 flex items-baseline gap-2 tracking-[0.2em] text-[#f3e6b8]">
                                    <span>RAZA:</span>
                                    <span className="min-w-0 flex-1 border-b border-[#6a6a6a] pb-0.5 font-medium tracking-[0.12em] text-[#f3e6b8]">
                                        {selectedRaceOption.label}
                                    </span>
                                </p>
                                <p className="min-h-[92px] border border-[#2c2c2c] bg-black/50 p-3 text-[#e7d59a]">
                                    {selectedRaceOption.summary}
                                </p>
                            </div>
                            <div>
                                <p className="mb-2 flex items-baseline gap-2 tracking-[0.2em] text-[#f3e6b8]">
                                    <span>CLASE:</span>
                                    <span className="min-w-0 flex-1 border-b border-[#6a6a6a] pb-0.5 font-medium tracking-[0.12em] text-[#f3e6b8]">
                                        {selectedClassOption.label}
                                    </span>
                                </p>
                                <p className="min-h-[92px] border border-[#2c2c2c] bg-black/50 p-3 text-[#e7d59a]">
                                    {selectedClassOption.summary}
                                </p>
                            </div>
                        </aside>
                    </section>
                ) : (
                    <p className="py-16 text-center">Cargando creador...</p>
                )}

                {session ? (
                    <>
                        <div className="mt-6 grid grid-cols-[auto_1fr_auto] items-end gap-6">
                            <div>
                                <div className="mb-2 flex gap-4 text-xl">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedGender("male")}
                                        className={
                                            selectedGender === "male"
                                                ? "text-[#f3e6b8]"
                                                : "text-[#666]"
                                        }
                                    >
                                        ♂
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSelectedGender("female")
                                        }
                                        className={
                                            selectedGender === "female"
                                                ? "text-[#f3e6b8]"
                                                : "text-[#666]"
                                        }
                                    >
                                        ♀
                                    </button>
                                </div>
                                <p className="mb-2 text-[11px] tracking-[0.28em]">
                                    CLASES
                                </p>
                                <div className="grid grid-cols-6 gap-1.5">
                                    {characterClassOptions.map((option) => {
                                        const active =
                                            option.key === selectedClass;
                                        return (
                                            <button
                                                key={option.key}
                                                type="button"
                                                title={option.label}
                                                onClick={() =>
                                                    setSelectedClass(option.key)
                                                }
                                                className={`flex h-9 w-9 items-center justify-center border text-sm ${
                                                    active
                                                        ? "border-[#d6c48a] bg-[#2a2414] text-[#f3e6b8]"
                                                        : "border-[#333] bg-[#111] text-[#888] hover:border-[#666]"
                                                }`}
                                            >
                                                {option.icon}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                <p>
                                    Acierto {combatPreview.aciertoArmas}
                                </p>
                                <p>
                                    Acierto {combatPreview.aciertoProyectiles}
                                </p>
                                <p>Daño {combatPreview.danoArmas}</p>
                                <p>Daño {combatPreview.danoProyectiles}</p>
                                <p>Evasion {combatPreview.evasion}</p>
                                <p>Evasion {combatPreview.evasion}</p>
                                <p>Defensa {combatPreview.defensaFisica}</p>
                                <p>Defensa {combatPreview.defensaEscudos}</p>
                                <p>Resist.Magia {combatPreview.resistMagia}</p>
                                <p>Daño cañon {combatPreview.danoMagia}</p>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => router.push("/characters")}
                                        className="border border-[#444] bg-[#161616] px-6 py-1.5 text-sm tracking-[0.2em] text-[#d6c48a]"
                                    >
                                        ATRAS
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void createCharacter()}
                                        disabled={creatingCharacter}
                                        className="border border-[#bfa15a] bg-[#1c180c] px-6 py-1.5 text-sm tracking-[0.2em] text-[#f3e6b8] disabled:opacity-50"
                                    >
                                        {creatingCharacter ? "..." : "CREAR"}
                                    </button>
                                </div>
                                <p className="text-sm text-[#f3e6b8]">
                                    Dungeon Newbie
                                </p>
                            </div>
                        </div>

                        {error ? (
                            <p className="mt-4 text-center text-sm text-[#e23b3b]">
                                {error}
                            </p>
                        ) : null}
                    </>
                ) : null}
            </div>
        </main>
    );
}

function RaceColumn({
    title,
    tone,
    races,
    selectedRace,
    onSelect,
}: {
    title: string;
    tone: "alianza" | "horda";
    races: ReturnType<typeof getAlianzaRaces>;
    selectedRace: RaceKey;
    onSelect: (race: RaceKey) => void;
}) {
    const ribbon = tone === "alianza" ? "bg-[#2a3f8f]" : "bg-[#8f2a2a]";
    const portraits = (
        <div className="flex flex-col gap-2 pt-6">
            {races.map((race) => {
                const active = race.key === selectedRace;
                return (
                    <button
                        key={race.key}
                        type="button"
                        title={race.label}
                        onClick={() => onSelect(race.key)}
                        className={`flex h-12 w-12 items-center justify-center overflow-hidden border bg-[#111] ${
                            active
                                ? "border-[#f3e6b8]"
                                : "border-[#3a3a3a]"
                        }`}
                    >
                        <RacePortrait
                            headId={race.genders.male.startHeadId}
                            label={race.label}
                        />
                    </button>
                );
            })}
        </div>
    );
    const legend = (
        <div className="flex flex-col items-center gap-2 self-stretch">
            <div className={`h-10 w-3 ${ribbon}`} />
            <p className="text-[10px] tracking-[0.25em] [writing-mode:vertical-rl]">
                {title}
            </p>
            <div className={`w-3 flex-1 ${ribbon}`} />
        </div>
    );

    return (
        <div
            className={`flex items-start gap-2 ${
                tone === "horda" ? "flex-row-reverse" : ""
            }`}
        >
            {legend}
            {portraits}
        </div>
    );
}
