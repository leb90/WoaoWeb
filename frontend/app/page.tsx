"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Play, Sparkles, Swords, Users, X as XIcon } from "lucide-react";
import { HERO_VIDEO_SOUND_EVENT } from "../components/MenuMusic";
import { useAuthRedirect } from "../hooks/useAuthRedirect";
import { warmGameCursors } from "../lib/gameCursors";

// Logo del inicio ya achicado al doble de su ancho máximo en pantalla (672 px): el PNG original pesa 2,4 MB y tardaba
// en aparecer. Se precarga desde que llega la página, mientras se chequea la sesión, y entra con un fundido.
// (`preload()` de react-dom no sale en el HTML desde un componente cliente; el <link> sí, React lo sube al <head>.)
const HERO_LOGO = "/static/imgs/woaoicon-hero.webp";
const heroLogoPreload = (
    <link rel="preload" as="image" href={HERO_LOGO} fetchPriority="high" />
);

// Fondo del inicio: video en bucle y en silencio (3,7 MB, 720p). Su primer cuadro es igual a background.jpg, que
// queda debajo: el video aparece recién cuando se reproduce. Con conexión mala o ahorro de datos no se baja, y si no
// arranca en unos segundos (navegadores sin navigator.connection, autoplay bloqueado) se corta la descarga. En todos
// esos casos queda la imagen. "Ver video" lo abre entero, con sonido y controles, en una ventana; mientras está
// abierta se pausan el fondo y la música del inicio (HERO_VIDEO_SOUND_EVENT de MenuMusic).
const HERO_BACKGROUND_IMAGE = "/static/imgs/background.jpg";
const HERO_BACKGROUND_VIDEO = "/static/video/background-loop.mp4";
const HERO_VIDEO_START_TIMEOUT_MS = 8000;
// El video espera a que los cursores estén cargados (si no, con 3,7 MB bajando, aparece la flecha del sistema), pero
// no más que esto.
const HERO_VIDEO_CURSOR_WAIT_MS = 1500;
const SLOW_CONNECTION_TYPES = new Set(["slow-2g", "2g", "3g"]);

type NetworkInformationLike = { effectiveType?: string; saveData?: boolean };

function canPlayHeroVideo() {
    if (typeof window === "undefined") {
        return false;
    }

    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    if (connection?.saveData) {
        return false;
    }

    if (connection?.effectiveType && SLOW_CONNECTION_TYPES.has(connection.effectiveType)) {
        return false;
    }

    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function announceHeroVideoSound(on: boolean) {
    window.dispatchEvent(new CustomEvent(HERO_VIDEO_SOUND_EVENT, { detail: on }));
}

// Fondo del hero; `paused` lo frena mientras está abierta la ventana del video.
function HeroBackground({ paused }: { paused: boolean }) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [enabled, setEnabled] = useState(canPlayHeroVideo);
    const [cursorsReady, setCursorsReady] = useState(false);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const ready = () => {
            if (!cancelled) {
                setCursorsReady(true);
            }
        };
        const timer = window.setTimeout(ready, HERO_VIDEO_CURSOR_WAIT_MS);
        void warmGameCursors().then(ready);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!enabled || !cursorsReady || playing) {
            return;
        }

        const timer = window.setTimeout(() => setEnabled(false), HERO_VIDEO_START_TIMEOUT_MS);
        return () => window.clearTimeout(timer);
    }, [enabled, cursorsReady, playing]);

    useEffect(() => {
        const background = videoRef.current;
        if (!paused || !background) {
            return;
        }

        background.pause();
        return () => {
            void background.play().catch(() => {});
        };
    }, [paused]);

    if (!enabled || !cursorsReady) {
        return null;
    }

    return (
        <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                playing ? "opacity-100" : "opacity-0"
            }`}
            src={HERO_BACKGROUND_VIDEO}
            poster={HERO_BACKGROUND_IMAGE}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
        />
    );
}

// El video entero, con sonido y controles, en una ventana sobre todo el sitio.
function HeroVideoModal({ onClose }: { onClose: () => void }) {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    // Mientras está abierta, la música del inicio se pausa; al cerrarla (o al irse del inicio) vuelve.
    useEffect(() => {
        announceHeroVideoSound(true);
        return () => announceHeroVideoSound(false);
    }, []);

    useEffect(() => {
        closeRef.current?.focus();
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Video de World of Argentum"
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* El cuadro mide lo mismo que el video (16:9, hasta el 80% del alto): así el logo cae sobre la imagen
                y no sobre bandas negras en pantallas bajas. */}
            <div
                className="relative aspect-video w-[min(100%,calc(80vh*16/9))] max-w-5xl"
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    ref={closeRef}
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar video"
                    className="absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-200/25 bg-black/60 text-stone-300 transition hover:border-amber-200/50 hover:text-amber-200"
                >
                    <XIcon className="h-4 w-4" />
                </button>
                <video
                    src={HERO_BACKGROUND_VIDEO}
                    poster={HERO_BACKGROUND_IMAGE}
                    autoPlay
                    controls
                    playsInline
                    className="h-full w-full rounded-[6px] border border-amber-200/15 bg-black object-contain shadow-2xl"
                />
                {/* Logo entero y chico arriba a la izquierda, como el de un canal de TV: 11% del alto del video
                    (64 px de alto con el video a 1024 de ancho). */}
                <Image
                    src={HERO_LOGO}
                    alt=""
                    width={1344}
                    height={896}
                    unoptimized
                    aria-hidden="true"
                    data-tv-logo
                    className="pointer-events-none absolute left-[2%] top-[3%] h-[11.2%] w-auto opacity-85 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                />
            </div>
        </div>,
        document.body,
    );
}

export default function HomePage() {
    const [logoLoaded, setLogoLoaded] = useState(false);
    // Distancia del hero al borde de arriba de la página: en tablets la barra de navegación va antes.
    const [heroTop, setHeroTop] = useState(0);
    const heroRef = useCallback((hero: HTMLElement | null) => {
        if (!hero) {
            return;
        }
        const measure = () => setHeroTop(Math.round(hero.getBoundingClientRect().top + window.scrollY));
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);
    const [videoOpen, setVideoOpen] = useState(false);
    const closeVideo = useCallback(() => setVideoOpen(false), []);
    const { session, loading } = useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    if (loading || !session) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#050302] px-4 text-stone-100">
                {heroLogoPreload}
                <div className="rounded-[10px] border border-amber-200/15 bg-black/60 px-6 py-5 text-sm tracking-wide text-stone-300 shadow-2xl backdrop-blur-md">
                    Cargando inicio...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] text-stone-100">
            {heroLogoPreload}
            {/* ---------- HERO ---------- */}
            <section
                ref={heroRef}
                className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-36 pt-24 md:pb-24"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${HERO_BACKGROUND_IMAGE})` }}
                />
                <HeroBackground paused={videoOpen} />
                <div className="absolute inset-0 bg-black/55" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,2,1,0.35)_0%,rgba(3,2,1,0.15)_35%,rgba(3,2,1,0.75)_78%,#050302_100%)]" />
                <div className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-amber-400/10 blur-[140px]" />

                <div className="relative flex w-full max-w-4xl flex-col items-center text-center">
                    <p
                        className={`text-[11px] font-semibold uppercase tracking-[0.55em] text-amber-200/80`}
                        style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                        MMORPG 2D &middot; Gratis &middot; En tu navegador
                    </p>

                    <div className="relative mt-8 w-full max-w-2xl">
                        <Image
                            src={HERO_LOGO}
                            alt="World of Argentum Online"
                            width={1344}
                            height={896}
                            unoptimized
                            loading="eager"
                            fetchPriority="high"
                            onLoad={() => setLogoLoaded(true)}
                            className={`w-full drop-shadow-[0_0_45px_rgba(0,0,0,0.65)] transition-opacity duration-500 ${
                                logoLoaded ? "opacity-100" : "opacity-0"
                            }`}
                        />
                    </div>

                    <p
                        className="mt-6 max-w-xl text-base leading-8 text-stone-200/90 md:text-lg"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                        Un mundo de fantasía clásico, reconstruido desde cero para correr
                        fluido en tu navegador. Sin descargas, sin excusas.
                    </p>

                    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                        <Link
                            href="/characters"
                            prefetch={false}
                            className="group relative inline-flex items-center gap-2 rounded-[4px] border border-amber-300/70 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-9 py-3.5 text-sm font-bold uppercase tracking-[0.2em] text-[#2a1704] shadow-[0_10px_30px_rgba(201,146,47,0.35)] transition hover:brightness-110"
                        >
                            Jugar gratis
                        </Link>

                        <Link
                            href="/arenas"
                            prefetch={false}
                            className="group inline-flex items-center gap-2 rounded-[4px] border border-white/25 bg-white/5 px-9 py-3.5 text-sm font-semibold uppercase tracking-[0.2em] text-stone-100 backdrop-blur-sm transition hover:border-amber-200/50 hover:bg-white/10"
                        >
                            <Swords className="h-4 w-4 text-amber-200" />
                            Entrar a la arena
                        </Link>
                    </div>
                </div>

                {/* Como al principio: la píldora chica abajo a la derecha. En notebooks y tablets va en la esquina de la
                    primera pantalla (el hero es más alto y la dejaba fuera de la vista); en celulares, al pie del hero,
                    arriba de "Descubrí más". */}
                <button
                    type="button"
                    onClick={() => setVideoOpen(true)}
                    style={{ "--hero-top": `${heroTop}px` } as React.CSSProperties}
                    className="absolute bottom-24 right-6 z-10 inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-black/45 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300 backdrop-blur-sm transition hover:border-amber-200/50 hover:text-amber-200 md:bottom-auto md:top-[calc(100svh-5rem-var(--hero-top))]"
                >
                    <Play className="h-3.5 w-3.5" />
                    Ver video
                </button>

                <div className="absolute bottom-8 flex flex-col items-center gap-2 text-amber-100/50">
                    <span className="text-[10px] uppercase tracking-[0.4em]">Descubrí más</span>
                    <span className="h-8 w-px animate-pulse bg-gradient-to-b from-amber-200/70 to-transparent" />
                </div>
            </section>

            {videoOpen ? <HeroVideoModal onClose={closeVideo} /> : null}

            {/* ---------- ELEGÍ TU CAMINO ---------- */}
            <section className="relative mx-auto max-w-6xl px-4 py-20">
                <SectionHeading eyebrow="Elegí tu camino" title="Dos formas de empezar" />

                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                    <Link
                        href="/characters"
                        prefetch={false}
                        className="group relative overflow-hidden rounded-[6px] border border-amber-200/15 bg-[linear-gradient(160deg,rgba(40,28,10,0.55),rgba(5,3,2,0.9))] p-8 shadow-2xl transition hover:border-amber-200/40"
                    >
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl transition group-hover:bg-amber-400/20" />
                        <Users className="h-8 w-8 text-amber-200/80" />
                        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-200/70">
                            Mundo abierto
                        </p>
                        <h3
                            className="mt-2 text-2xl text-stone-50"
                            style={{ fontFamily: "var(--font-cinzel)" }}
                        >
                            Creá tu personaje
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-stone-300/80">
                            Explorá, subí de nivel y hacete un lugar en el mundo de Argentum.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200 transition group-hover:gap-3">
                            Ir a personajes <span aria-hidden>&rarr;</span>
                        </div>
                    </Link>

                    <Link
                        href="/arenas"
                        prefetch={false}
                        className="group relative overflow-hidden rounded-[6px] border border-amber-200/15 bg-[linear-gradient(160deg,rgba(40,28,10,0.55),rgba(5,3,2,0.9))] p-8 shadow-2xl transition hover:border-amber-200/40"
                    >
                        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl transition group-hover:bg-amber-400/20" />
                        <Swords className="h-8 w-8 text-amber-200/80" />
                        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.34em] text-amber-200/70">
                            Combate
                        </p>
                        <h3
                            className="mt-2 text-2xl text-stone-50"
                            style={{ fontFamily: "var(--font-cinzel)" }}
                        >
                            Entrá a la arena
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-stone-300/80">
                            Todos contra todos en nivel 50 y con el mejor equipo de tu clase. Matá, subí en el ranking y llegá al Top 3.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200 transition group-hover:gap-3">
                            Ir a la Arena <span aria-hidden>&rarr;</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ---------- DE QUE SE TRATA ---------- */}
            <section className="relative mx-auto max-w-4xl px-4 py-20">
                <SectionHeading eyebrow="De qué se trata" title="World of Argentum" />

                <div className="relative mt-12 space-y-6 rounded-[6px] border border-amber-200/12 bg-black/40 p-6 text-[15px] leading-8 text-stone-300 shadow-2xl backdrop-blur-sm md:p-10">
                    <p>
                        World of Argentum es un MMORPG 2D de fantasía clásica
                        que se juega gratis desde el navegador, en la compu o
                        en el celular, sin descargar nada.
                    </p>

                    <p>
                        Hay mundo abierto con clanes, guerras de facciones y
                        eventos, mazmorras con acertijos y jefes, y una Arena
                        todos contra todos para pelear al toque.
                    </p>

                    <p>
                        Las{" "}
                        <Link href="/updates" prefetch={false} className="font-medium text-amber-300 underline decoration-amber-300/50 underline-offset-4 transition hover:text-amber-200 hover:decoration-amber-200">
                            novedades
                        </Link>{" "}
                        salen seguido. Para reportar errores o sugerir cambios,
                        sumate a nuestro{" "}
                        <a
                            href="https://discord.gg/YpJ9XrMdg"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-amber-300 underline decoration-amber-300/50 underline-offset-4 transition hover:text-amber-200 hover:decoration-amber-200"
                        >
                            Discord
                        </a>
                        .
                    </p>
                </div>
            </section>

            {/* ---------- COMUNIDAD / FOOTER ---------- */}
            <section className="relative border-t border-amber-100/10 px-4 py-16">
                <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                    <Sparkles className="h-5 w-5 text-amber-200/60" />
                    <p
                        className="mt-4 text-sm font-semibold uppercase tracking-[0.4em] text-stone-300/70"
                        style={{ fontFamily: "var(--font-cinzel)" }}
                    >
                        Seguir al proyecto
                    </p>

                    <div className="mt-6 flex items-center gap-4">
                        <SocialIconLink
                            href="https://discord.gg/YpJ9XrMdg"
                            label="Discord"
                            icon={<MessageCircle className="h-5 w-5" />}
                        />
                    </div>

                    <div className="mt-6 flex items-center gap-6 text-xs font-semibold uppercase tracking-[0.18em]">
                        <Link
                            href="/updates"
                            prefetch={false}
                            className="text-amber-200/75 transition hover:text-amber-100"
                        >
                            Novedades
                        </Link>
                        <Link
                            href="/wiki"
                            className="text-amber-200/75 transition hover:text-amber-100"
                        >
                            Wiki oficial
                        </Link>
                    </div>

                    <p className="mt-10 text-xs tracking-wide text-stone-500">
                        World of Argentum &middot; Proyecto de fans, sin fines de lucro
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs tracking-wide text-stone-500">
                        Créditos al proyecto original de
                        <a
                            href="https://x.com/DamianCatanzaro"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-stone-300 transition hover:text-amber-100"
                        >
                            <XIcon className="h-3 w-3" />
                            @DamianCatanzaro
                        </a>
                    </p>
                </div>
            </section>
        </main>
    );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
    return (
        <div className="flex flex-col items-center text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-amber-200/70">
                {eyebrow}
            </p>
            <h2
                className="mt-3 text-3xl text-stone-50 md:text-4xl"
                style={{ fontFamily: "var(--font-cinzel)" }}
            >
                {title}
            </h2>
            <Image
                src="/static/imgs/deco.png"
                alt=""
                width={24}
                height={24}
                className="mt-5 opacity-60"
            />
        </div>
    );
}

function SocialIconLink({
    href,
    label,
    icon,
}: {
    href: string;
    label: string;
    icon: React.ReactNode;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={label}
            title={label}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/20 bg-white/5 text-amber-100/80 transition hover:border-amber-200/60 hover:bg-amber-200/10 hover:text-amber-100"
        >
            {icon}
        </a>
    );
}
