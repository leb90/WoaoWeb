"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CharacterPreviewPanel from "./character-creation/CharacterPreviewPanel";
import ClassSelector from "./character-creation/ClassSelector";
import CreationActions from "./character-creation/CreationActions";
import DerivedStats from "./character-creation/DerivedStats";
import FactionRaceSelector from "./character-creation/FactionRaceSelector";
import { ClassInfoPanel, RaceInfoPanel } from "./character-creation/InfoPanels";
import { cinzel, focusRing } from "./character-creation/styles";
import type { AuthErrorResponse, AuthSession } from "../lib/auth";
import {
    DISPLAY_NAME_MAX_LENGTH,
    getDisplayNameError,
} from "../lib/name-validation";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import type { BodiesDB, GraphicsDB, HeadsDB } from "../types/game";
import { loadBodiesDB, loadGraphicsDB, loadHeadsDB } from "../utils/gameLoader";
import {
    PREVIEW_HEADING_CYCLE,
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
    type PreviewHeading,
    type RaceKey,
} from "../lib/characterCreation";

const initialClass = characterClassOptions[0].key;
const initialRace = getAlianzaRaces()[0].key;

function resolveGraphicFrame(graphicsDB: GraphicsDB, graphicId: number) {
    const graphic = graphicsDB[graphicId.toString()];
    if (!graphic) {
        return null;
    }
    if (graphic.numFile) {
        return graphic;
    }
    const frameId =
        graphic.frames?.["2"] ??
        graphic.frames?.["1"] ??
        Object.values(graphic.frames ?? {})[0];
    if (!frameId) {
        return null;
    }
    return graphicsDB[frameId.toString()] ?? null;
}

function isRenderableHead(headId: number, headsDB: HeadsDB, graphicsDB: GraphicsDB) {
    const headData = headsDB[headId.toString()];
    if (!headData) {
        return false;
    }
    return Boolean(resolveGraphicFrame(graphicsDB, headData["2"]));
}

function isRenderableBody(bodyId: number, bodiesDB: BodiesDB, graphicsDB: GraphicsDB) {
    const bodyData = bodiesDB[bodyId.toString()];
    if (!bodyData) {
        return false;
    }
    return Boolean(resolveGraphicFrame(graphicsDB, bodyData["2"]));
}

function usePreviewScale() {
    const [scale, setScale] = useState(2.15);

    useEffect(() => {
        const update = () => {
            const height = window.innerHeight;
            const width = window.innerWidth;
            if (height < 820 || width < 1280) {
                setScale(1.4);
            } else if (height < 980 || width < 1500) {
                setScale(1.75);
            } else {
                setScale(2.15);
            }
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return scale;
}

export default function CreateCharacterView() {
    const router = useRouter();
    const { session } = useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });
    const previewScale = usePreviewScale();
    const [creatingCharacter, setCreatingCharacter] = useState(false);
    const [newCharacterName, setNewCharacterName] = useState("");
    const [nameAttempted, setNameAttempted] = useState(false);
    const [selectedClass, setSelectedClass] = useState<CharacterClassKey>(initialClass);
    const [selectedRace, setSelectedRace] = useState<RaceKey>(initialRace);
    const [selectedGender, setSelectedGender] = useState<GenderKey>("male");
    const [selectedHeadIndex, setSelectedHeadIndex] = useState(0);
    const [heading, setHeading] = useState<PreviewHeading>("2");
    const [graphicsDB, setGraphicsDB] = useState<GraphicsDB | null>(null);
    const [bodiesDB, setBodiesDB] = useState<BodiesDB | null>(null);
    const [headsDB, setHeadsDB] = useState<HeadsDB | null>(null);
    const [error, setError] = useState<string | null>(null);

    const selectedClassOption = useMemo(() => getClassOption(selectedClass), [selectedClass]);
    const selectedRaceOption = useMemo(() => getRaceOption(selectedRace), [selectedRace]);
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
        return headIds.filter((headId) => isRenderableHead(headId, headsDB, graphicsDB));
    }, [graphicsDB, headIds, headsDB]);
    const selectedHeadId =
        availableHeadIds[selectedHeadIndex] ?? availableHeadIds[0] ?? headIds[0];
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
        [selectedAppearance.bodyId, selectedClass, selectedGender, selectedRace],
    );
    const hasRenderableBody = useMemo(() => {
        if (!graphicsDB || !bodiesDB) {
            return true;
        }
        return isRenderableBody(classPreview.bodyId, bodiesDB, graphicsDB);
    }, [bodiesDB, classPreview.bodyId, graphicsDB]);
    const nameError = !newCharacterName.trim()
        ? nameAttempted
            ? "Necesitas escribir un nombre para tu personaje."
            : null
        : getDisplayNameError(newCharacterName);

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
                console.error("Error loading character creation assets:", loadError);
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

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement
            ) {
                return;
            }
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
            }
            event.preventDefault();
            setHeading((current) => {
                const index = PREVIEW_HEADING_CYCLE.indexOf(current);
                const step = event.key === "ArrowRight" ? 1 : -1;
                return PREVIEW_HEADING_CYCLE[
                    (index + step + PREVIEW_HEADING_CYCLE.length) % PREVIEW_HEADING_CYCLE.length
                ];
            });
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const cycleHead = (direction: "prev" | "next") => {
        const total = availableHeadIds.length;
        if (total === 0) {
            return;
        }
        setSelectedHeadIndex((current) =>
            direction === "prev" ? (current - 1 + total) % total : (current + 1) % total,
        );
    };

    const rotateHeading = (direction: "prev" | "next") => {
        setHeading((current) => {
            const index = PREVIEW_HEADING_CYCLE.indexOf(current);
            const step = direction === "next" ? 1 : -1;
            return PREVIEW_HEADING_CYCLE[
                (index + step + PREVIEW_HEADING_CYCLE.length) % PREVIEW_HEADING_CYCLE.length
            ];
        });
    };

    const createCharacter = async () => {
        setNameAttempted(true);
        const trimmedName = newCharacterName.trim();
        const validationError = !trimmedName
            ? "Necesitas escribir un nombre para tu personaje."
            : getDisplayNameError(trimmedName);
        if (validationError) {
            setError(null);
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
            const result = (await response.json()) as AuthSession | AuthErrorResponse;
            if (!response.ok || "error" in result) {
                throw new Error(
                    "error" in result ? result.error : "No se pudo crear el personaje",
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

    return (
        <main className="min-h-[calc(100dvh-7.5rem)] bg-black px-3 py-3 text-[#eee5d3] min-[1400px]:px-6">
            <div className="mx-auto flex max-w-[1680px] flex-col gap-2">
                <header className="shrink-0 text-center">
                    <p
                        className="text-[12px] tracking-[0.42em] text-[#cbb892]"
                        style={cinzel}
                    >
                        WORLD OF ARGENTUM
                    </p>
                    <h1
                        className="text-[28px] font-semibold leading-none tracking-[0.34em] text-[#f3e6c8] min-[1400px]:text-[34px]"
                        style={cinzel}
                    >
                        ONLINE
                    </h1>
                </header>

                <div className="mx-auto w-full max-w-[460px] shrink-0">
                    <input
                        value={newCharacterName}
                        onChange={(event) => setNewCharacterName(event.target.value)}
                        maxLength={DISPLAY_NAME_MAX_LENGTH}
                        placeholder="Nombre del personaje..."
                        aria-label="Nombre del personaje"
                        aria-invalid={Boolean(nameError)}
                        className={`w-full border bg-black/70 px-3 py-1.5 text-center text-sm text-[#eee5d3] outline-none transition duration-150 placeholder:text-[#6f675c] ${focusRing} ${
                            nameError
                                ? "border-[#e23b3b]"
                                : "border-[#41351f] focus:border-[#d6a62d]"
                        }`}
                    />
                    <p
                        className="mt-1 min-h-[1.125rem] text-center text-[12px] leading-[1.125rem] text-[#e23b3b]"
                        role={nameError ? "alert" : undefined}
                    >
                        {nameError || "\u00a0"}
                    </p>
                </div>

                {session ? (
                    <div className="grid grid-cols-[minmax(250px,320px)_minmax(0,1fr)_minmax(240px,300px)] grid-rows-[auto_auto] items-stretch gap-2.5">
                        <div>
                            <FactionRaceSelector
                                alianza={getAlianzaRaces()}
                                horda={getHordaRaces()}
                                selectedRace={selectedRace}
                                selectedGender={selectedGender}
                                onSelectRace={setSelectedRace}
                                onSelectGender={setSelectedGender}
                            />
                        </div>
                        <CharacterPreviewPanel
                            bodyId={classPreview.bodyId}
                            headId={selectedHeadId}
                            weaponId={classPreview.weaponId}
                            shieldId={classPreview.shieldId}
                            helmetId={classPreview.helmetId}
                            scale={previewScale}
                            heading={heading}
                            headIndex={selectedHeadIndex}
                            headCount={availableHeadIds.length}
                            bonus={selectedRaceOption.bonus}
                            canRender={hasRenderableBody}
                            onRotate={rotateHeading}
                            onCycleHead={cycleHead}
                        />
                        <div className="flex min-h-0 flex-col gap-2">
                            <RaceInfoPanel race={selectedRaceOption} gender={selectedGender} />
                            <ClassInfoPanel option={selectedClassOption} />
                        </div>
                        <ClassSelector
                            options={characterClassOptions}
                            selectedClass={selectedClass}
                            onSelect={setSelectedClass}
                        />
                        <DerivedStats preview={combatPreview} />
                        <CreationActions
                            creating={creatingCharacter}
                            error={error}
                            onBack={() => router.push("/characters")}
                            onCreate={() => void createCharacter()}
                        />
                    </div>
                ) : (
                    <p className="py-16 text-center text-[#9f9587]">Cargando creador...</p>
                )}
            </div>
        </main>
    );
}
