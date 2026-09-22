"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Swords,
    Trophy,
    UserRound,
    LogIn,
    LogOut,
    MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { AuthErrorResponse, AuthSession } from "@/lib/auth";
import InstallAppButton from "./InstallAppButton";

type AppChromeProps = {
    children: React.ReactNode;
};

const navItems = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/characters", label: "Personajes", icon: UserRound },
    { href: "/arenas", label: "Arenas", icon: Swords },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    {
        href: "https://discord.gg/YpJ9XrMdg",
        label: "Discord",
        icon: MessageCircle,
        external: true,
    },
];

function isActivePath(pathname: string, href: string) {
    if (href === "/") {
        return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppChrome({ children }: AppChromeProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [session, setSession] = useState<AuthSession | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/api/auth/me", { cache: "no-store" })
            .then(async (response) => {
                if (!response.ok) {
                    return null;
                }

                const result = (await response.json()) as
                    | AuthSession
                    | AuthErrorResponse;
                if ("error" in result) {
                    return null;
                }

                return result;
            })
            .then((result) => {
                if (!cancelled) {
                    setSession(result);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setSession(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [pathname]);

    if (pathname === "/play") {
        return <>{children}</>;
    }

    const isHome = pathname === "/";

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-amber-200/15 bg-[#050302]/95 backdrop-blur-xl md:fixed md:inset-x-0 md:top-4 md:border-b-0 md:bg-transparent md:px-4 md:backdrop-blur-none">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:max-w-6xl md:rounded-full md:border md:border-amber-200/15 md:bg-[#050302]/55 md:px-6 md:py-2.5 md:shadow-[0_10px_35px_rgba(0,0,0,0.45)] md:backdrop-blur-xl">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image
                            src="/static/imgs/woaoicon-192.png"
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9"
                        />
                        <span
                            className="text-xl tracking-[0.08em] text-stone-100"
                            style={{ fontFamily: "var(--font-cinzel)" }}
                        >
                            World of AO
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-7 md:flex">
                        {navItems.map((item) => {
                            const active = item.external
                                ? false
                                : isActivePath(pathname, item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    target={
                                        item.external ? "_blank" : undefined
                                    }
                                    rel={
                                        item.external ? "noreferrer" : undefined
                                    }
                                    className={`relative py-1 text-[12px] font-semibold uppercase tracking-[0.18em] transition ${
                                        active
                                            ? "text-amber-200"
                                            : "text-stone-300/85 hover:text-amber-100"
                                    }`}
                                >
                                    {item.label}
                                    <span
                                        className={`absolute -bottom-[13px] left-0 h-px w-full bg-gradient-to-r from-transparent via-amber-300 to-transparent transition-opacity ${
                                            active
                                                ? "opacity-100"
                                                : "opacity-0"
                                        }`}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <InstallAppButton />
                        {session ? (
                            <>
                                <span className="hidden items-baseline gap-1.5 text-xs uppercase tracking-[0.12em] sm:inline-flex">
                                    <span className="text-stone-500">Cuenta:</span>
                                    <span className="font-semibold text-amber-200">
                                        {session.account.name}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await fetch("/api/auth/signout", {
                                            method: "POST",
                                        });
                                        setSession(null);
                                        router.push("/login");
                                        router.refresh();
                                    }}
                                    className="inline-flex items-center justify-center rounded-full p-2 text-stone-400 transition hover:bg-amber-200/10 hover:text-amber-200"
                                    aria-label="Cerrar sesion"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-[4px] border border-amber-300/60 bg-[linear-gradient(180deg,#f7d488,#c9922f)] px-4 py-2 text-[12px] font-bold uppercase tracking-[0.14em] text-[#2a1704] transition hover:brightness-110"
                            >
                                <LogIn className="h-4 w-4" />
                                Ingresar
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="md:hidden border-b border-amber-200/15 bg-[#050302]/95 px-4 py-2 backdrop-blur-xl">
                <nav className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = item.external
                            ? false
                            : isActivePath(pathname, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                target={item.external ? "_blank" : undefined}
                                rel={item.external ? "noreferrer" : undefined}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                                    active
                                        ? "bg-amber-300/12 text-amber-300"
                                        : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className={isHome ? undefined : "md:pt-24"}>{children}</div>
        </>
    );
}
