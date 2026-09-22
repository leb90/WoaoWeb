"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, Sparkles, Swords, Users, X as XIcon } from "lucide-react";
import { useAuthRedirect } from "../hooks/useAuthRedirect";

export default function HomePage() {
    const { session, loading } = useAuthRedirect({
        redirectTo: "/login",
        when: "unauthenticated",
        preserveRedirect: true,
    });

    if (loading || !session) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#050302] px-4 text-stone-100">
                <div className="rounded-[10px] border border-amber-200/15 bg-black/60 px-6 py-5 text-sm tracking-wide text-stone-300 shadow-2xl backdrop-blur-md">
                    Cargando inicio...
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen overflow-y-auto bg-[#050302] text-stone-100">
            {/* ---------- HERO ---------- */}
            <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url(/static/imgs/background.jpg)" }}
                />
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
                            src="/static/imgs/woaoicon.png"
                            alt="World of Argentum Online"
                            width={1536}
                            height={1024}
                            priority
                            className="w-full drop-shadow-[0_0_45px_rgba(0,0,0,0.65)]"
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
                            Ver arenas
                        </Link>
                    </div>
                </div>

                <div className="absolute bottom-8 flex flex-col items-center gap-2 text-amber-100/50">
                    <span className="text-[10px] uppercase tracking-[0.4em]">Descubrí más</span>
                    <span className="h-8 w-px animate-pulse bg-gradient-to-b from-amber-200/70 to-transparent" />
                </div>
            </section>

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
                            Entrá a las arenas
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-stone-300/80">
                            Medí tu fuerza contra otros jugadores en combates 1v1 y por equipos.
                        </p>
                        <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-200 transition group-hover:gap-3">
                            Ir a Arenas <span aria-hidden>&rarr;</span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* ---------- DE QUE SE TRATA ---------- */}
            <section className="relative mx-auto max-w-4xl px-4 py-20">
                <SectionHeading eyebrow="De qué se trata" title="AOWeb Beta" />

                <div className="relative mt-12 space-y-6 rounded-[6px] border border-amber-200/12 bg-black/40 p-6 text-[15px] leading-8 text-stone-300 shadow-2xl backdrop-blur-sm md:p-10">
                    <p>
                        AOWeb es un proyecto que aun está en Beta, es
                        probable que tenga varios errores y salió de
                        varios años como ex jugador de querer armar un
                        AO pero que funcione 100% en web y fluido, este
                        proyecto lo hice hace unos 12 años pero hoy las
                        tecnologías son otras y se puede tener un AO que
                        ande fluido en web y ese es mi objetivo.
                    </p>

                    <p>
                        Actualmente faltan muchas funciones que las voy
                        a ir agregando día a día hasta que podamos tener
                        un juego solido, vamos a tener sonidos,
                        carpinteria, poder ordenar hechizos/items, todo
                        lo necesario para una mejor jugabilidad.
                    </p>

                    <p>
                        Cualquier tipo de feedback o reporte de bug es
                        bienvenido, me lo pueden mandar a mi Twitter:{" "}
                        <a
                            href="https://x.com/DamianCatanzaro"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-amber-300 underline decoration-amber-300/50 underline-offset-4 transition hover:text-amber-200 hover:decoration-amber-200"
                        >
                            @DamianCatanzaro
                        </a>
                    </p>

                    <p>
                        Tambien pueden ingresar al Discord para recibir
                        novedades:{" "}
                        <a
                            href="https://discord.gg/YpJ9XrMdg"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-amber-300 underline decoration-amber-300/50 underline-offset-4 transition hover:text-amber-200 hover:decoration-amber-200"
                        >
                            unirse al Discord
                        </a>
                    </p>

                    <p>
                        O pueden enviar con mas detalle a este Form de
                        Google:{" "}
                        <a
                            href="https://forms.gle/Df2cmGExTBjjJhAR8"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-amber-300 underline decoration-amber-300/50 underline-offset-4 transition hover:text-amber-200 hover:decoration-amber-200"
                        >
                            abrir formulario
                        </a>
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
                        <SocialIconLink
                            href="https://x.com/DamianCatanzaro"
                            label="X / Twitter"
                            icon={<XIcon className="h-5 w-5" />}
                        />
                        <SocialIconLink
                            href="https://forms.gle/Df2cmGExTBjjJhAR8"
                            label="Formulario de feedback"
                            icon={<Sparkles className="h-5 w-5" />}
                        />
                    </div>

                    <p className="mt-10 text-xs tracking-wide text-stone-500">
                        World of Argentum Online &middot; Proyecto de fans, sin fines de lucro
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
