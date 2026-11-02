"use client";

// Panel /online de los GM: cuántos hay conectados y quiénes, con un buscador; al elegir a alguien, su ficha completa,
// una vista en vivo de lo que está haciendo (GmLiveView) y su consola. Los datos llegan del server
// (server/src/gmOnline.ts) por lib/gmOnline.ts; las acciones vuelven al server como comandos del chat.

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ArrowLeft, Radio, Search, Skull, Users, X } from "lucide-react";
import {
    closeGmOnline,
    getGmOnlineServerState,
    getGmOnlineState,
    selectGmOnlineUser,
    subscribeGmOnline,
    type GmOnlineDetail,
    type GmOnlineUser,
} from "@/lib/gmOnline";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import GmLiveView from "./GmLiveView";

const SEARCH_DEBOUNCE_MS = 250;

function normalize(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
}

function formatNumber(value: number): string {
    return Math.round(value).toLocaleString("es-AR");
}

function formatMinutes(minutes: number): string {
    if (minutes < 1) {
        return "recién";
    }
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

function activityTone(activity: string): string {
    if (activity === "Muerto") return "bg-stone-500";
    if (activity.startsWith("Peleando") || activity === "En combate") return "bg-red-500";
    if (activity === "Meditando") return "bg-violet-400";
    if (activity === "Caminando" || activity === "Navegando") return "bg-emerald-400";
    if (activity.startsWith("Inactivo")) return "bg-stone-600";
    return "bg-amber-300";
}

/** Algunos clanes ya vienen con los corchetes puestos ("<Woao Staff>"). */
function clanName(clan: string): string {
    return clan.trim().replace(/^<+|>+$/g, "");
}

function factionLabel(faction: string, criminal: boolean): string {
    if (faction === "armada") return "Armada Real";
    if (faction === "caos") return "Legión del Caos";
    return criminal ? "Criminal" : "Ciudadano";
}

function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "gm" | "bot" | "alert" }) {
    const tones = {
        default: "border-white/10 bg-white/5 text-stone-300",
        gm: "border-amber-300/40 bg-amber-300/15 text-amber-200",
        bot: "border-sky-300/30 bg-sky-300/10 text-sky-200",
        alert: "border-red-300/30 bg-red-400/10 text-red-200",
    };
    return (
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}>
            {children}
        </span>
    );
}

function tagTone(tag: string): "default" | "gm" | "bot" | "alert" {
    if (tag === "GM") return "gm";
    if (tag === "Bot") return "bot";
    if (tag === "En pelea PvP" || tag === "Invisible" || tag === "Oculto") return "alert";
    return "default";
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    return (
        <div>
            <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>{label}</span>
                <span className="font-medium text-stone-200">
                    {formatNumber(value)} / {formatNumber(max)}
                </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/50">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${ratio * 100}%` }} />
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-white/8 bg-black/25 p-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300/80">{title}</h4>
            <div className="mt-2">{children}</div>
        </section>
    );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 py-0.5 text-xs">
            <span className="text-stone-400">{label}</span>
            <span className="text-right font-medium text-stone-100">{value}</span>
        </div>
    );
}

function UserRow({ user, selected, onSelect }: { user: GmOnlineUser; selected: boolean; onSelect: () => void }) {
    return (
        <li>
            <button
                type="button"
                onClick={onSelect}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    selected
                        ? "border-amber-300/50 bg-amber-300/12"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                }`}
            >
                <div className="flex items-center gap-2">
                    {user.dead ? <Skull className="h-3.5 w-3.5 shrink-0 text-stone-500" /> : null}
                    <span className={`truncate text-sm font-semibold ${user.gm ? "text-amber-200" : user.criminal ? "text-red-300" : "text-stone-100"}`}>
                        {user.name}
                    </span>
                    <span className="ml-auto shrink-0 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold text-stone-300">
                        Nv {user.level}
                    </span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-stone-400">
                    {[user.clase, user.raza].filter(Boolean).join(" · ")}
                    {clanName(user.clan) ? ` · <${clanName(user.clan)}>` : ""}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-300">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${activityTone(user.activity)}`} />
                    <span className="truncate">{user.activity}</span>
                    <span className="ml-auto shrink-0 truncate text-stone-500">{user.mapName}</span>
                </div>
                {user.tags.length ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                        {user.tags.map((tag) => (
                            <Tag key={tag} tone={tagTone(tag)}>
                                {tag}
                            </Tag>
                        ))}
                    </div>
                ) : null}
            </button>
        </li>
    );
}

function LiveFeed({ lines }: { lines: Array<{ key: number; text: string; color: string }> }) {
    const listRef = useRef<HTMLDivElement | null>(null);
    const stickRef = useRef(true);

    useEffect(() => {
        const list = listRef.current;
        if (list && stickRef.current) {
            list.scrollTop = list.scrollHeight;
        }
    }, [lines]);

    return (
        <div
            ref={listRef}
            onScroll={(event) => {
                const list = event.currentTarget;
                stickRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 24;
            }}
            className="h-32 overflow-y-auto rounded-xl border border-white/8 bg-black/45 px-3 py-2 font-mono text-[11px] leading-5"
            data-testid="gm-live-feed"
        >
            {lines.length === 0 ? (
                <p className="text-stone-500">Acá aparece en vivo lo que le llega a su consola y lo que se habla cerca.</p>
            ) : (
                lines.map((line) => (
                    <p key={line.key} style={{ color: line.color }} className="break-words">
                        {line.text}
                    </p>
                ))
            )}
        </div>
    );
}

function DetailSummary({ detail }: { detail: GmOnlineDetail }) {
    const expRatio = detail.expNextLevel > 0 ? Math.min(100, (detail.exp / detail.expNextLevel) * 100) : 100;

    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Section title="Vitales">
                <div className="space-y-2">
                    <Bar label="Vida" value={detail.vitals.hp} max={detail.vitals.maxHp} color="bg-red-500" />
                    <Bar label="Maná" value={detail.vitals.mana} max={detail.vitals.maxMana} color="bg-sky-500" />
                    <Bar label="Energía" value={detail.vitals.sta} max={detail.vitals.maxSta} color="bg-amber-400" />
                    <Bar label="Hambre" value={detail.vitals.hambre} max={detail.vitals.maxHambre} color="bg-orange-500" />
                    <Bar label="Sed" value={detail.vitals.sed} max={detail.vitals.maxSed} color="bg-cyan-400" />
                </div>
            </Section>

            <Section title="Progreso">
                <Row
                    label="Experiencia"
                    value={detail.expNextLevel > 0 ? `${formatNumber(detail.exp)} / ${formatNumber(detail.expNextLevel)} (${expRatio.toFixed(1)}%)` : "Nivel máximo"}
                />
                <Row label="Oro" value={formatNumber(detail.gold)} />
                <Row label="ELO" value={formatNumber(detail.elo)} />
                <Row label="Criaturas matadas" value={formatNumber(detail.kills.npcs)} />
                <Row label="Ciudadanos matados" value={formatNumber(detail.kills.ciudadanos)} />
                <Row label="Criminales matados" value={formatNumber(detail.kills.criminales)} />
            </Section>

            <Section title="Bando y clan">
                <Row label="Bando" value={factionLabel(detail.faction, detail.criminal)} />
                <Row label="Puntos Armada" value={formatNumber(detail.factionScore.armada)} />
                <Row label="Puntos Caos" value={formatNumber(detail.factionScore.caos)} />
                <Row label="Clan" value={clanName(detail.clan) ? `${clanName(detail.clan)}${detail.clanRole ? ` (${detail.clanRole === "leader" ? "líder" : detail.clanRole === "co_leader" ? "colíder" : "miembro"})` : ""}` : "—"} />
                <Row label="Género" value={detail.genero} />
                <Row label="Posición" value={`${detail.mapName} (${detail.map}) · ${detail.x}, ${detail.y}`} />
            </Section>
        </div>
    );
}

function DetailExtra({ detail }: { detail: GmOnlineDetail }) {
    const status = detail.status;
    // Lo que lo afecta va en rojo; dónde o cómo anda, neutro.
    const states: Array<[string, "default" | "alert"]> = [
        [status.paralizado, "Paralizado", "alert"] as const,
        [status.envenenado, "Envenenado", "alert"] as const,
        [status.ciego, "Ciego", "alert"] as const,
        [status.estupido, "Estúpido", "alert"] as const,
        [detail.jailMinutes > 0, `Cárcel (${detail.jailMinutes} min)`, "alert"] as const,
        [status.navegando, "Navegando", "default"] as const,
        [status.montado, "Montado", "default"] as const,
        [status.zonaSegura, "Zona segura", "default"] as const,
    ]
        .filter(([active]) => active)
        .map(([, label, tone]) => [label, tone]);
    const equipment: Array<[string, string | null]> = [
        ["Arma", detail.equipment.arma],
        ["Armadura", detail.equipment.armadura],
        ["Escudo", detail.equipment.escudo],
        ["Casco", detail.equipment.casco],
        ["Anillo", detail.equipment.anillo],
        ["Munición", detail.equipment.municion],
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Section title="Atributos y habilidades">
                <Row label="Fuerza" value={detail.attributes.fuerza} />
                <Row label="Agilidad" value={detail.attributes.agilidad} />
                <Row label="Inteligencia" value={detail.attributes.inteligencia} />
                <Row label="Constitución" value={detail.attributes.constitucion} />
                <div className="my-1.5 border-t border-white/6" />
                <Row label="Tácticas de combate" value={detail.skills.tacticasCombate} />
                <Row label="Defensa con escudos" value={detail.skills.defensa} />
                <Row label="Combate con armas" value={detail.skills.armas} />
                <Row label="Proyectiles" value={detail.skills.proyectiles} />
                <Row label="Combate sin armas" value={detail.skills.wrestling} />
                <Row label="Ocultarse" value={detail.skills.ocultarse} />
                <Row label="Apuñalar" value={detail.skills.apunalar} />
            </Section>

            <Section title="Equipo">
                {equipment.map(([label, name]) => (
                    <Row key={label} label={label} value={name ?? "—"} />
                ))}
                {states.length ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {states.map(([state, tone]) => (
                            <Tag key={state} tone={tone}>
                                {state}
                            </Tag>
                        ))}
                    </div>
                ) : null}
            </Section>

            <Section title={`Hechizos (${detail.spells.length})`}>
                {detail.spells.length ? (
                    <div className="flex flex-wrap gap-1">
                        {detail.spells.map((spell, index) => (
                            <span key={`${spell}-${index}`} className="rounded-md border border-violet-300/20 bg-violet-400/10 px-1.5 py-0.5 text-[11px] text-violet-100">
                                {spell}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-stone-500">No tiene hechizos.</p>
                )}
            </Section>

            <div className="sm:col-span-2 xl:col-span-3">
                <Section title={`Inventario (${detail.inventory.length})`}>
                    {detail.inventory.length ? (
                        <ul className="grid gap-x-4 sm:grid-cols-2 xl:grid-cols-3">
                            {detail.inventory.map((item) => (
                                <li key={item.slot} className="flex items-center justify-between gap-2 border-b border-white/5 py-1 text-xs last:border-b-0">
                                    <span className={`truncate ${item.equipped ? "text-amber-200" : "text-stone-200"}`}>
                                        {item.name}
                                        {item.equipped ? <span className="ml-1 text-[10px] text-amber-300/70">(equipado)</span> : null}
                                    </span>
                                    <span className="shrink-0 text-stone-400">×{formatNumber(item.amount)}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-stone-500">Inventario vacío.</p>
                    )}
                </Section>
            </div>
        </div>
    );
}

type GmOnlineModalProps = {
    onSendCommand: (message: string) => unknown;
};

export default function GmOnlineModal({ onSendCommand }: GmOnlineModalProps) {
    const state = useSyncExternalStore(subscribeGmOnline, getGmOnlineState, getGmOnlineServerState);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const { open, users, selectedId, detail, frame, previousFrame, feed, offline } = state;

    const players = users.filter((user) => !user.bot);
    const bots = users.length - players.length;

    const filtered = useMemo(() => {
        const needle = normalize(debouncedQuery.trim());
        if (!needle) {
            return users;
        }
        return users.filter((user) =>
            [user.name, user.clase, user.raza, user.mapName, user.clan].some((field) => normalize(field).includes(needle)),
        );
    }, [debouncedQuery, users]);

    const selectedUser = users.find((user) => user.id === selectedId) ?? null;

    useEffect(() => {
        if (!open) {
            return;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.stopPropagation();
                onSendCommand("/onlinecerrar");
                closeGmOnline();
                setQuery("");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onSendCommand, open]);

    useEffect(() => {
        if (open) {
            searchRef.current?.focus({ preventScroll: true });
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const close = () => {
        onSendCommand("/onlinecerrar");
        closeGmOnline();
        setQuery("");
    };
    const select = (id: string) => {
        if (id === selectedId) {
            return;
        }
        selectGmOnlineUser(id);
        onSendCommand(`/onlinever ${id}`);
    };
    const back = () => {
        selectGmOnlineUser(null);
        onSendCommand("/onlinedejar");
    };

    const name = detail?.name ?? selectedUser?.name ?? "";
    const liveActivity = frame?.activity ?? detail?.activity ?? selectedUser?.activity ?? "";
    const tags = detail?.tags ?? selectedUser?.tags ?? [];

    return (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/70 p-0 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label="Usuarios conectados">
            <div className="flex h-full w-full max-w-6xl flex-col overflow-hidden border-[#8d7044] bg-[radial-gradient(circle_at_top,#3b2917_0%,#1b130d_42%,#0b0907_100%)] text-stone-100 shadow-[0_35px_140px_rgba(0,0,0,0.62)] sm:h-[90vh] sm:rounded-[26px] sm:border">
                <header className="flex items-center justify-between gap-3 border-b border-amber-200/12 bg-black/20 px-4 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <Users className="h-5 w-5 shrink-0 text-amber-300" />
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/75">Panel de GM</p>
                            <h2 className="truncate text-lg font-semibold text-[#f5ead2]">
                                {players.length} {players.length === 1 ? "usuario conectado" : "usuarios conectados"}
                                {bots > 0 ? <span className="ml-2 text-sm font-normal text-stone-400">+{bots} {bots === 1 ? "bot" : "bots"}</span> : null}
                            </h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-stone-400 sm:inline">
                            PvE {state.pve} · PvP {state.pvp}
                        </span>
                        <button
                            type="button"
                            onClick={close}
                            className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-200 transition hover:border-white/20 hover:bg-white/10"
                            aria-label="Cerrar"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </header>

                <div className="flex min-h-0 flex-1">
                    <aside className={`min-h-0 w-full flex-col border-white/8 md:flex md:w-80 md:shrink-0 md:border-r ${selectedId ? "hidden" : "flex"}`}>
                        <div className="border-b border-white/8 p-3">
                            <label className="relative block">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                                <input
                                    ref={searchRef}
                                    type="search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Buscar por nombre, clase, mapa o clan"
                                    aria-label="Buscar usuarios"
                                    className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-500 focus:border-amber-300/40 focus:outline-none"
                                />
                            </label>
                            <p className="mt-2 text-[11px] text-stone-500" aria-live="polite">
                                {debouncedQuery.trim()
                                    ? `${filtered.length} de ${users.length} ${users.length === 1 ? "resultado" : "resultados"}`
                                    : "Se actualiza sola cada 3 segundos."}
                            </p>
                        </div>
                        <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2" data-testid="gm-online-list">
                            {filtered.map((user) => (
                                <UserRow key={user.id} user={user} selected={user.id === selectedId} onSelect={() => select(user.id)} />
                            ))}
                            {filtered.length === 0 ? (
                                <li className="px-3 py-6 text-center text-sm text-stone-500">Nadie coincide con “{debouncedQuery.trim()}”.</li>
                            ) : null}
                        </ul>
                    </aside>

                    <main className={`min-h-0 flex-1 overflow-y-auto ${selectedId ? "block" : "hidden md:block"}`}>
                        {!selectedId ? (
                            <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-stone-400">
                                <Radio className="h-8 w-8 text-amber-300/60" />
                                <p className="text-sm">Elegí a alguien de la lista para ver su ficha y lo que está haciendo en vivo.</p>
                            </div>
                        ) : (
                            <div className="space-y-3 p-3 sm:p-4">
                                <div className="flex flex-wrap items-start gap-3">
                                    <button
                                        type="button"
                                        onClick={back}
                                        className="rounded-full border border-white/10 bg-white/5 p-2 text-stone-200 transition hover:bg-white/10 md:hidden"
                                        aria-label="Volver a la lista"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-xl font-semibold text-[#f5ead2]">
                                            {name || "Cargando…"}
                                            {detail ? <span className="ml-2 text-sm font-normal text-stone-400">Nivel {detail.level}</span> : null}
                                        </h3>
                                        <p className="text-xs text-stone-400">
                                            {[detail?.clase ?? selectedUser?.clase, detail?.raza ?? selectedUser?.raza].filter(Boolean).join(" · ")}
                                            {detail ? ` · conectado hace ${formatMinutes(detail.minutes)}` : ""}
                                        </p>
                                        {tags.length ? (
                                            <div className="mt-1.5 flex flex-wrap gap-1">
                                                {tags.map((tag) => (
                                                    <Tag key={tag} tone={tagTone(tag)}>
                                                        {tag}
                                                    </Tag>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={back}
                                        className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-300 transition hover:bg-white/10 md:inline-flex"
                                    >
                                        Dejar de mirar
                                    </button>
                                </div>

                                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <GmLiveView frame={frame} previousFrame={previousFrame} offline={offline} />
                                            <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-red-200">
                                                <span className={`h-1.5 w-1.5 rounded-full ${offline ? "bg-stone-500" : "animate-pulse bg-red-500"}`} />
                                                {offline ? "Desconectado" : "En vivo"}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                                            <span className="inline-flex items-center gap-1.5 text-stone-200">
                                                <span className={`h-2 w-2 rounded-full ${activityTone(liveActivity)}`} />
                                                <span data-testid="gm-live-activity">{liveActivity}</span>
                                            </span>
                                            {frame ? (
                                                <span className="text-stone-400">
                                                    {frame.mapName} ({frame.map}) · {frame.x}, {frame.y}
                                                </span>
                                            ) : null}
                                        </div>
                                        {frame ? (
                                            <div className="grid grid-cols-2 gap-3">
                                                <Bar label="Vida" value={frame.hp} max={frame.maxHp} color="bg-red-500" />
                                                <Bar label="Maná" value={frame.mana} max={frame.maxMana} color="bg-sky-500" />
                                            </div>
                                        ) : null}
                                        <LiveFeed lines={feed} />
                                    </div>

                                    <div>{detail ? <DetailSummary detail={detail} /> : <p className="p-4 text-sm text-stone-400">Cargando la ficha…</p>}</div>
                                </div>

                                {detail ? <DetailExtra detail={detail} /> : null}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
