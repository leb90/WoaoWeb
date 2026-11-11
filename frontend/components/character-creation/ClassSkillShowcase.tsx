"use client";

// Las habilidades más importantes de la clase elegida, con un video corto de cada una grabado del juego
// (lib/classSkills.ts). Pasan solas una tras otra y vuelven a empezar, como un gif; las barras de arriba dicen cuál se
// ve y cuánto le falta, y sirven para ir a otra. Con "reducir movimiento" no se reproduce sola: se ve la imagen fija
// y el video arranca al tocarlo.
import { useState, useSyncExternalStore } from "react";

import { CLASS_SKILLS, classSkillMedia } from "../../lib/classSkills";
import type { CharacterClassKey } from "../../lib/characterCreation";
import { cinzel, focusRing } from "./styles";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const DEFAULT_CLIP_SECONDS = 4;

function subscribeReducedMotion(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
    return useSyncExternalStore(
        subscribeReducedMotion,
        () => window.matchMedia(REDUCED_MOTION).matches,
        () => false,
    );
}

export default function ClassSkillShowcase({
    clase,
    compacto = false,
}: {
    clase: CharacterClassKey;
    /** Para el celular: el video a la izquierda y el texto al lado. */
    compacto?: boolean;
}) {
    const skills = CLASS_SKILLS[clase] ?? [];
    // La habilidad que se ve, atada a la clase: al cambiar de clase arranca de la primera.
    const [shown, setShown] = useState({ clase, index: 0, vuelta: 0 });
    const [clipSeconds, setClipSeconds] = useState(DEFAULT_CLIP_SECONDS);
    const [failed, setFailed] = useState<string | null>(null);
    const reducedMotion = usePrefersReducedMotion();

    if (skills.length === 0) {
        return null;
    }

    const index = shown.clase === clase ? Math.min(shown.index, skills.length - 1) : 0;
    const vuelta = shown.clase === clase ? shown.vuelta : 0;
    const skill = skills[index]!;
    const media = classSkillMedia(clase, skill);
    const show = (next: number) => setShown({ clase, index: next, vuelta: vuelta + 1 });

    const bars = (
        <div className="absolute inset-x-1.5 top-1 flex gap-1" role="group" aria-label="Habilidades">
            {skills.map((item, itemIndex) => (
                <button
                    key={item.id}
                    type="button"
                    aria-label={item.nombre}
                    aria-pressed={itemIndex === index}
                    onClick={() => show(itemIndex)}
                    className={`flex-1 py-1.5 ${focusRing}`}
                >
                    <span className="block h-[3px] overflow-hidden bg-white/25">
                        {itemIndex < index || (itemIndex === index && reducedMotion) ? (
                            <span className="block h-full bg-[#d6a62d]" />
                        ) : itemIndex === index ? (
                            <span
                                key={`${clase}-${index}-${vuelta}`}
                                className="block h-full origin-left bg-[#d6a62d]"
                                style={{ animation: `class-skill-progress ${clipSeconds}s linear forwards` }}
                            />
                        ) : null}
                    </span>
                </button>
            ))}
        </div>
    );

    const video =
        failed === media.video ? (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-[#6f675c]">Sin video</div>
        ) : (
            <video
                key={`${media.video}-${vuelta}`}
                src={media.video}
                poster={media.poster}
                muted
                playsInline
                autoPlay={!reducedMotion}
                preload="auto"
                aria-label={`${skill.nombre}: ${skill.descripcion}`}
                onLoadedMetadata={(event) => {
                    const seconds = event.currentTarget.duration;
                    if (Number.isFinite(seconds) && seconds > 0) setClipSeconds(seconds);
                }}
                onEnded={() => {
                    if (!reducedMotion) show((index + 1) % skills.length);
                }}
                onClick={(event) => {
                    if (reducedMotion) void event.currentTarget.play();
                }}
                onError={() => setFailed(media.video)}
                className="h-full w-full object-cover"
            />
        );

    const text = (
        <div className="min-w-0">
            <p className={`${compacto ? "text-[13px]" : "text-[15px]"} leading-tight text-[#e3c16f]`} style={cinzel}>
                {skill.nombre}
            </p>
            <p className={`mt-1 ${compacto ? "text-[11.5px]" : "text-[12.5px]"} leading-snug text-[#d7ccb4]`}>
                {skill.descripcion}
            </p>
        </div>
    );

    if (compacto) {
        return (
            <figure className="grid grid-cols-[minmax(0,46%)_minmax(0,1fr)] items-start gap-2.5" aria-label="Habilidades de la clase">
                <div className="relative aspect-[8/5] overflow-hidden border border-[#41351f] bg-black">
                    {video}
                    {bars}
                </div>
                <figcaption>{text}</figcaption>
            </figure>
        );
    }

    // En el panel de escritorio el video toma el lugar que queda: nunca más grande que su tamaño (8:5) y, si falta
    // lugar, se achica recortando arriba y abajo hasta un mínimo.
    return (
        <figure className="flex min-h-0 flex-1 flex-col gap-2" aria-label="Habilidades de la clase">
            <div className="relative aspect-[8/5] min-h-[96px] w-full shrink overflow-hidden border border-[#41351f] bg-black">
                {video}
                {bars}
            </div>
            <figcaption className="shrink-0">{text}</figcaption>
        </figure>
    );
}
