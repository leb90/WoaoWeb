"use client";

import React from "react";
import { createPortal } from "react-dom";
import {
    Anchor,
    Backpack,
    BicepsFlexed,
    Bird,
    Bomb,
    BowArrow,
    Compass,
    Dumbbell,
    Feather,
    Flame,
    Footprints,
    Key,
    KeyRound,
    Map as MapIcon,
    Shell,
    Shield,
    Sparkles,
    Trophy,
    Wind,
    X,
    type LucideIcon,
} from "lucide-react";
import type { DungeonStatePayload } from "../lib/aowProtocol";
import { DungeonMusic } from "../lib/dungeonMusic";
import { DungeonMinimapFog } from "./DungeonOverlay";

// Mazmorras: la barra de arriba del inventario (las dos teclas de objeto, las llaves, el mapa y la brújula), la Mochila
// al estilo de Link's Awakening y el mapa grande. Los ítems de mazmorra quedan para siempre en el personaje, pero solo
// se usan adentro de una mazmorra (el server lo valida); por eso todo esto aparece solo adentro.

type InsideState = NonNullable<DungeonStatePayload["enMazmorra"]>;
type Slot = "uno" | "dos";

// Los ítems de la serie (docs/mazmorras/00-PATRON_LINKS_AWAKENING.md), uno por mazmorra, en orden de juego. Los que
// todavía no existen se ven como un hueco con la mazmorra que lo va a dar.
const SERIES_ITEMS: Array<{ id: string; nombre: string; icon: LucideIcon; tone: string; uso: string; mazmorra: string }> = [
    { id: "patas_de_rana", nombre: "Patas de rana", icon: Footprints, tone: "text-sky-300", uso: "Nadar por el agua profunda (siempre activas)", mazmorra: "Gruta del Abisal" },
    { id: "pluma", nombre: "Pluma de Roc", icon: Feather, tone: "text-teal-200", uso: "Saltar pozos y obstáculos chicos", mazmorra: "Cueva de la Cola" },
    { id: "pulsera", nombre: "Brazalete de Fuerza", icon: Dumbbell, tone: "text-amber-200", uso: "Levantar, llevar y tirar vasijas y piedras", mazmorra: "Gruta de la Botella" },
    { id: "botas_de_pegaso", nombre: "Botas de Pegaso", icon: Wind, tone: "text-orange-200", uso: "La Carrera; con la Pluma, el salto largo", mazmorra: "Caverna de las Llaves" },
    { id: "gancho", nombre: "Gancho", icon: Anchor, tone: "text-stone-200", uso: "Engancharse a cofres, bloques y estatuas para cruzar; arma puentes sobre las anclas y aturde criaturas", mazmorra: "Fauces del Bagre" },
    { id: "pulsera_poderosa", nombre: "Brazalete de Fuerza nivel 2", icon: BicepsFlexed, tone: "text-rose-200", uso: "Como el nivel 1, y además levanta las piedras pesadas", mazmorra: "Santuario del Rostro" },
    { id: "escudo_espejo", nombre: "Escudo Espejo", icon: Shield, tone: "text-cyan-200", uso: "Levantarlo 3 s: frena lo que llega de frente (golpes, rayos y bolas de fuego)", mazmorra: "Mazmorra a definir" },
    { id: "polvo_de_fuego", nombre: "Polvo de Fuego", icon: Flame, tone: "text-orange-300", uso: "Tirar fuego: enciende antorchas, derrite hielo y quema criaturas", mazmorra: "Roca de la Tortuga" },
];

// Los trofeos de los jefes (los instrumentos de Zelda), en orden de juego.
const SERIES_TROPHIES: Array<{ id: string | null; nombre: string }> = [
    { id: "escama_del_abisal", nombre: "Escama del Abisal" },
    { id: "aguijon_del_ciempies", nombre: "Aguijón del Ciempiés" },
    { id: "lampara_del_genio", nombre: "Lámpara del Genio" },
    { id: "iris_del_ojo", nombre: "Iris del Ojo" },
    { id: "colmillo_de_la_anguila", nombre: "Colmillo de la Anguila" },
    { id: "mascara_de_piedra", nombre: "Máscara de Piedra" },
    { id: null, nombre: "Séptima mazmorra" },
    { id: null, nombre: "Octava mazmorra" },
];

// Los básicos: los tiene todo el mundo desde la primera mazmorra, antes del primer ítem (en Zelda se compran).
const BASIC_ITEMS: typeof SERIES_ITEMS = [
    { id: "bombas", nombre: "Bombas", icon: Bomb, tone: "text-stone-200", uso: "Poner una bomba: explota a los 2 s, lastima a las criaturas y abre las paredes rajadas", mazmorra: "Desde la primera mazmorra" },
    { id: "arco", nombre: "Arco", icon: BowArrow, tone: "text-amber-100", uso: "Tirar una flecha en línea recta, sin gastar flechas", mazmorra: "Desde la primera mazmorra" },
    { id: "polvo_magico", nombre: "Polvo mágico", icon: Sparkles, tone: "text-yellow-200", uso: "Espolvorear adelante: enciende antorchas y le saca un poco a una criatura", mazmorra: "Desde la primera mazmorra" },
];

const itemInfo = (id: string | null | undefined) => [...BASIC_ITEMS, ...SERIES_ITEMS].find((item) => item.id === id) ?? null;

// Como en Zelda, el Brazalete de Fuerza nivel 2 reemplaza al 1: ocupa su lugar en la Mochila (no tiene uno propio).
const ITEM_UPGRADES: Record<string, string> = { pulsera: "pulsera_poderosa" };
const UPGRADE_IDS = new Set(Object.values(ITEM_UPGRADES));
const seriesSlots = (isOwned: (id: string) => boolean) =>
    SERIES_ITEMS.filter((item) => !UPGRADE_IDS.has(item.id)).map((item) => {
        const upgrade = ITEM_UPGRADES[item.id];
        return upgrade && isOwned(upgrade) ? (itemInfo(upgrade) ?? item) : item;
    });

// Una casilla de la Mochila: el ítem (o un hueco si todavía no se tiene) y la letra de su tecla.
function ItemSlot({
    item,
    has,
    selected,
    keyLabel,
    onSelect,
}: {
    item: (typeof SERIES_ITEMS)[number];
    has: boolean;
    selected: boolean;
    keyLabel: string | null;
    onSelect: (id: string) => void;
}) {
    const Icon = item.icon;
    return (
        <button
            type="button"
            data-testid={`dungeon-backpack-item-${item.id}`}
            data-owned={has ? "1" : "0"}
            disabled={!has}
            title={has ? `${item.nombre}: ${item.uso}` : `Todavía no: lo da ${item.mazmorra}`}
            onClick={() => onSelect(item.id)}
            className={`relative flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-[9px] ${
                selected
                    ? "border-amber-200 bg-[#3a2516]"
                    : has
                      ? "cursor-pointer border-amber-300/35 bg-[#2a1b12] hover:border-amber-200/70"
                      : "border-[#2c2018] bg-[#0d0907] opacity-40"
            }`}
        >
            <Icon className={`h-6 w-6 ${has ? item.tone : "text-stone-600"}`} />
            <span className={has ? "text-stone-200" : "text-stone-600"}>{has ? item.nombre : "?"}</span>
            {keyLabel ? <KeyBadge label={keyLabel} /> : null}
        </button>
    );
}

function KeyBadge({ label }: { label: string }) {
    return (
        <span className="absolute -right-1 -top-1 min-w-[16px] rounded border border-amber-200/60 bg-[#2a1608] px-1 text-center text-[9px] font-bold leading-[14px] text-amber-100 shadow">
            {label}
        </span>
    );
}

type BarProps = {
    inside: InsideState;
    // Las letras de las dos teclas de objeto (configurables en las teclas del juego).
    keyLabels: [string, string];
    playerPos?: { map: number; x: number; y: number };
    onSendCommand?: (command: string) => void;
};

// La barra de la mazmorra, arriba del inventario clásico (que no cambia).
export function DungeonBar({ inside, keyLabels, playerPos, onSendCommand }: BarProps) {
    const [open, setOpen] = React.useState<"mochila" | "mapa" | null>(null);
    const owned = new Map((inside.items ?? []).map((item) => [item.id, item]));
    const buttons = inside.botones ?? { uno: null, dos: null };
    const othersKeys = inside.llavesDeOtros ?? [];
    const use = (slot: Slot) => {
        const item = owned.get(buttons[slot] ?? "");
        if (item?.accion) onSendCommand?.(`/mazmorra ${item.accion}`);
    };
    const keysHeldBy = othersKeys.length
        ? `La tiene ${othersKeys.map((entry) => (entry.cantidad > 1 ? `${entry.nombre} (${entry.cantidad})` : entry.nombre)).join(" y ")}`
        : null;
    const indicators = [
        {
            id: "llaves",
            label: inside.llaves ? `Llaves chicas: ${inside.llaves}. Se gastan al abrir una puerta.` : (keysHeldBy ?? "Llaves chicas: ninguna"),
            icon: Key,
            owned: inside.llaves > 0,
            heldBy: !inside.llaves ? keysHeldBy : null,
            tone: "text-amber-200",
            count: inside.llaves,
        },
        {
            id: "jefe",
            label: inside.llaveJefe ? "Llave del jefe" : inside.llaveJefeDe ? `La llave del jefe la tiene ${inside.llaveJefeDe}` : "Llave del jefe: todavía no",
            icon: KeyRound,
            owned: inside.llaveJefe,
            heldBy: inside.llaveJefeDe ? `La tiene ${inside.llaveJefeDe}` : null,
            tone: "text-rose-300",
            count: 0,
        },
        { id: "brujula", label: inside.brujula ? "Brújula: marca los cofres y la puerta del jefe" : "Brújula: todavía no", icon: Compass, owned: inside.brujula, heldBy: null, tone: "text-violet-200", count: 0 },
        { id: "pico", label: inside.pico ? "Pico de piedra: los búhos hablan" : "Pico de piedra: todavía no", icon: Bird, owned: Boolean(inside.pico), heldBy: null, tone: "text-teal-200", count: 0 },
    ];
    return (
        <div data-testid="dungeon-strip" className="border border-[#4a3424] bg-[#120c09] px-1.5 py-1">
            {/* Lo que tiene, para las pruebas y los lectores de pantalla. */}
            <ul className="sr-only">
                {[
                    { id: "patas", owned: inside.patas },
                    { id: "pluma", owned: owned.has("pluma") },
                    { id: "botas", owned: owned.has("botas_de_pegaso") },
                ].map(({ id, owned: has }) => (
                    <li key={id} data-testid={`dungeon-strip-${id}`} data-owned={has ? "1" : "0"}>
                        {id}: {has ? "sí" : "no"}
                    </li>
                ))}
            </ul>
            <div className="flex items-center gap-1">
                {(["uno", "dos"] as Slot[]).map((slot, index) => {
                    const info = itemInfo(buttons[slot]);
                    const Icon = info?.icon;
                    return (
                        <button
                            key={slot}
                            type="button"
                            data-testid={`dungeon-slot-${index + 1}`}
                            data-item={buttons[slot] ?? ""}
                            title={info ? `${info.nombre} (tecla ${keyLabels[index]}): ${info.uso}` : `Tecla ${keyLabels[index]}: elegí un ítem en la Mochila`}
                            disabled={!info}
                            onClick={() => use(slot)}
                            className={`relative flex h-10 w-9 shrink-0 items-center justify-center border ${
                                info ? "cursor-pointer border-amber-300/45 bg-[#2a1b12] hover:border-amber-200/80 hover:bg-[#3a2516]" : "border-dashed border-[#3a2a1e] bg-[#0d0907]"
                            }`}
                        >
                            {Icon ? <Icon className={`h-5 w-5 ${info?.tone}`} /> : null}
                            <KeyBadge label={keyLabels[index]} />
                        </button>
                    );
                })}
                <div className="mx-0.5 h-8 w-px bg-[#3a2a1e]" />
                {indicators.map(({ id, label, icon: Icon, owned: has, heldBy, tone, count }) => (
                    <div
                        key={id}
                        data-testid={`dungeon-strip-${id}`}
                        data-owned={has ? "1" : "0"}
                        data-held-by={!has && heldBy ? heldBy : undefined}
                        title={label}
                        className={`relative flex h-10 w-7 shrink-0 items-center justify-center border ${
                            has ? "border-amber-300/35 bg-[#2a1b12]" : heldBy ? "border-dashed border-amber-300/30 bg-[#170f0a] opacity-75" : "border-[#2c2018] bg-[#0d0907] opacity-45"
                        }`}
                    >
                        <Icon className={`h-4 w-4 ${has ? tone : heldBy ? `${tone} opacity-60` : "text-stone-500"}`} />
                        {count > 1 ? <span className="absolute bottom-0 right-0.5 text-[9px] font-bold text-amber-100">{count}</span> : null}
                    </div>
                ))}
                <button
                    type="button"
                    data-testid="dungeon-strip-mapa"
                    data-owned={inside.mapa ? "1" : "0"}
                    title={inside.mapa ? "Mapa de la mazmorra" : "Mapa: todavía no (se ve lo que recorriste)"}
                    onClick={() => setOpen("mapa")}
                    className={`relative flex h-10 w-7 shrink-0 cursor-pointer items-center justify-center border ${
                        inside.mapa ? "border-amber-300/35 bg-[#2a1b12] hover:border-amber-200/80" : "border-[#2c2018] bg-[#0d0907] opacity-60 hover:opacity-90"
                    }`}
                >
                    <MapIcon className={`h-4 w-4 ${inside.mapa ? "text-emerald-200" : "text-stone-500"}`} />
                </button>
                <button
                    type="button"
                    data-testid="dungeon-backpack-open"
                    title="Mochila: los ítems de mazmorra, las teclas, las llaves y la colección"
                    aria-label="Mochila"
                    onClick={() => setOpen("mochila")}
                    className="ml-auto flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-amber-300/45 bg-[linear-gradient(180deg,#5a2a12,#3a1608)] text-amber-100 hover:brightness-110"
                >
                    <Backpack className="h-5 w-5" />
                </button>
            </div>
            {open === "mochila"
                ? createPortal(<BackpackModal inside={inside} keyLabels={keyLabels} onClose={() => setOpen(null)} onSendCommand={onSendCommand} />, document.body)
                : null}
            {open === "mapa" ? createPortal(<MapModal inside={inside} playerPos={playerPos} onClose={() => setOpen(null)} />, document.body) : null}
        </div>
    );
}

function ModalFrame({ title, testId, onClose, children }: { title: string; testId: string; onClose: () => void; children: React.ReactNode }) {
    React.useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return (
        <div className="fixed inset-0 z-[89] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm" onClick={onClose}>
            <div
                data-testid={testId}
                className="max-h-[92vh] w-full max-w-[720px] overflow-y-auto rounded-[20px] border border-[#5f4630] bg-[linear-gradient(180deg,#22180f_0%,#140e09_100%)] text-stone-100 shadow-[0_32px_120px_rgba(0,0,0,0.6)]"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[#6a4f39] bg-[#100b08]/85 px-4 py-3">
                    <h2 className="text-lg font-semibold text-amber-50">{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-xl border border-stone-700 bg-stone-950/60 p-1.5 text-stone-300 hover:text-white">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// La Mochila: arriba las dos teclas; a la izquierda los ítems de la serie (se elige cuál va en cada tecla); a la
// derecha lo de esta mazmorra (llaves, mapa, brújula) y la colección (caracolas y trofeos).
function BackpackModal({
    inside,
    keyLabels,
    onClose,
    onSendCommand,
}: {
    inside: InsideState;
    keyLabels: [string, string];
    onClose: () => void;
    onSendCommand?: (command: string) => void;
}) {
    const owned = new Map((inside.items ?? []).map((item) => [item.id, item]));
    const buttons = inside.botones ?? { uno: null, dos: null };
    const [selected, setSelected] = React.useState<string | null>(null);
    const selectedInfo = itemInfo(selected);
    const selectedItem = selected ? owned.get(selected) : undefined;
    const isOwned = (id: string) => owned.has(id) || (id === "patas_de_rana" && inside.patas);
    const keyOf = (id: string) => (buttons.uno === id ? keyLabels[0] : buttons.dos === id ? keyLabels[1] : null);
    const assign = (slot: "1" | "2", id: string | null) => onSendCommand?.(`/mazmorra boton ${slot} ${id ?? "ninguno"}`);
    const caracolas = inside.coleccion?.caracolas ?? [];
    const trofeos = new Set(inside.coleccion?.trofeos ?? []);
    return (
        <ModalFrame title="Mochila" testId="dungeon-backpack" onClose={onClose}>
            <div className="flex flex-wrap gap-2 border-b border-[#3a2a1e] px-4 py-3">
                {(["uno", "dos"] as Slot[]).map((slot, index) => {
                    const info = itemInfo(buttons[slot]);
                    const Icon = info?.icon;
                    return (
                        <div key={slot} className="flex items-center gap-2 rounded-xl border border-[#4a3424] bg-black/30 px-3 py-1.5" data-testid={`dungeon-backpack-slot-${index + 1}`}>
                            <span className="rounded border border-amber-200/60 bg-[#2a1608] px-1.5 text-xs font-bold text-amber-100">{keyLabels[index]}</span>
                            {Icon ? <Icon className={`h-4 w-4 ${info?.tone}`} /> : null}
                            <span className="text-sm text-stone-200">{info?.nombre ?? "Nada"}</span>
                        </div>
                    );
                })}
                <p className="w-full text-[11px] text-stone-400">
                    Los ítems de mazmorra quedan para siempre en tu personaje, pero solo se usan adentro de las mazmorras. Las teclas se cambian en
                    la configuración de teclas.
                </p>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1fr]">
                <section>
                    <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">Objetos</h3>
                    <p className="mb-1 text-[10px] uppercase tracking-[0.18em] text-stone-500">Básicos</p>
                    <div className="mb-3 grid grid-cols-4 gap-2">
                        {BASIC_ITEMS.map((item) => (
                            <ItemSlot key={item.id} item={item} has={isOwned(item.id)} selected={selected === item.id} keyLabel={keyOf(item.id)} onSelect={setSelected} />
                        ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {seriesSlots(isOwned).map((item) => (
                            <ItemSlot key={item.id} item={item} has={isOwned(item.id)} selected={selected === item.id} keyLabel={keyOf(item.id)} onSelect={setSelected} />
                        ))}
                    </div>
                    <div className="mt-3 min-h-[64px] rounded-xl border border-[#3a2a1e] bg-black/25 p-3 text-sm">
                        {selectedInfo ? (
                            <>
                                <p className="font-semibold text-amber-100">{selectedInfo.nombre}</p>
                                <p className="text-[12px] text-stone-300">{selectedInfo.uso}</p>
                                {selectedItem?.accion ? (
                                    <div className="mt-2 flex gap-2">
                                        {(["1", "2"] as const).map((slot, index) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                data-testid={`dungeon-backpack-assign-${slot}`}
                                                onClick={() => assign(slot, selectedInfo.id)}
                                                className="rounded-lg border border-amber-300/45 bg-[#3a1d0c] px-3 py-1 text-[12px] font-semibold text-amber-100 hover:brightness-110"
                                            >
                                                Poner en {keyLabels[index]}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1 text-[11px] text-stone-400">Funciona sola: no hace falta ponerla en una tecla.</p>
                                )}
                            </>
                        ) : (
                            <p className="text-[12px] text-stone-400">Elegí un ítem para ver qué hace y en qué tecla va.</p>
                        )}
                    </div>
                </section>
                <section className="space-y-4">
                    <div>
                        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">{inside.nombre}</h3>
                        <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                            <div className={`rounded-lg border p-2 ${inside.llaves ? "border-amber-300/35 bg-[#2a1b12]" : "border-[#2c2018] opacity-50"}`}>
                                <div className="flex flex-wrap justify-center gap-0.5">
                                    {Array.from({ length: Math.max(1, inside.llaves) }).map((_, i) => (
                                        <Key key={i} className={`h-4 w-4 ${inside.llaves ? "text-amber-200" : "text-stone-600"}`} />
                                    ))}
                                </div>
                                <p className="mt-1 text-stone-300">Llaves {inside.llaves}</p>
                            </div>
                            <div className={`rounded-lg border p-2 ${inside.llaveJefe ? "border-amber-300/35 bg-[#2a1b12]" : "border-[#2c2018] opacity-50"}`}>
                                <KeyRound className={`mx-auto h-5 w-5 ${inside.llaveJefe ? "text-rose-300" : "text-stone-600"}`} />
                                <p className="mt-1 text-stone-300">Del jefe</p>
                            </div>
                            <div className={`rounded-lg border p-2 ${inside.mapa ? "border-amber-300/35 bg-[#2a1b12]" : "border-[#2c2018] opacity-50"}`}>
                                <MapIcon className={`mx-auto h-5 w-5 ${inside.mapa ? "text-emerald-200" : "text-stone-600"}`} />
                                <p className="mt-1 text-stone-300">Mapa</p>
                            </div>
                            <div className={`rounded-lg border p-2 ${inside.brujula ? "border-amber-300/35 bg-[#2a1b12]" : "border-[#2c2018] opacity-50"}`}>
                                <Compass className={`mx-auto h-5 w-5 ${inside.brujula ? "text-violet-200" : "text-stone-600"}`} />
                                <p className="mt-1 text-stone-300">Brújula</p>
                            </div>
                            <div className={`rounded-lg border p-2 ${inside.pico ? "border-amber-300/35 bg-[#2a1b12]" : "border-[#2c2018] opacity-50"}`}>
                                <Bird className={`mx-auto h-5 w-5 ${inside.pico ? "text-teal-200" : "text-stone-600"}`} />
                                <p className="mt-1 text-stone-300">Pico</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300/80">Colección</h3>
                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-[#3a2a1e] bg-black/25 px-3 py-2 text-sm" data-testid="dungeon-backpack-shells">
                            <Shell className={`h-5 w-5 ${caracolas.length ? "text-pink-200" : "text-stone-600"}`} />
                            <span className="text-stone-200">Caracolas secretas: {caracolas.length}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {SERIES_TROPHIES.map((trophy, index) => {
                                const has = Boolean(trophy.id && trofeos.has(trophy.id));
                                return (
                                    <div
                                        key={index}
                                        data-testid={trophy.id ? `dungeon-backpack-trophy-${trophy.id}` : undefined}
                                        data-owned={has ? "1" : "0"}
                                        title={has ? trophy.nombre : `${index + 1}: todavía no`}
                                        className={`flex aspect-square flex-col items-center justify-center rounded-lg border text-[9px] ${
                                            has ? "border-amber-300/45 bg-[#2a1b12]" : "border-[#2c2018] bg-[#0d0907] opacity-40"
                                        }`}
                                    >
                                        <Trophy className={`h-5 w-5 ${has ? "text-yellow-300" : "text-stone-600"}`} />
                                        <span className="mt-0.5 px-0.5 text-center leading-tight text-stone-300">{has ? trophy.nombre : index + 1}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </div>
        </ModalFrame>
    );
}

// El mapa grande: un piso por pestaña, con lo recorrido (con el mapa, todo a media luz), los cofres y la puerta del
// jefe (con la brújula) y dónde está el jugador, como el mapa de Link's Awakening.
function MapModal({ inside, playerPos, onClose }: { inside: InsideState; playerPos?: { map: number; x: number; y: number }; onClose: () => void }) {
    const floors = (inside.plano ?? []).filter((floor) => floor.mapa);
    const current = floors.find((floor) => floor.actual) ?? floors[0];
    const [shown, setShown] = React.useState<number | null>(current?.mapa ?? null);
    const floor = floors.find((entry) => entry.mapa === shown) ?? current;
    const here = floor?.actual && playerPos ? playerPos : null;
    // El piso entero, con dos baldosas de margen, ocupa el recuadro (en el minimapa, la baldosa x es el píxel x - 1).
    const bounds = floor?.limites ?? { x1: 1, y1: 1, x2: 100, y2: 100 };
    const tilesWide = bounds.x2 - bounds.x1 + 5;
    const tilesHigh = bounds.y2 - bounds.y1 + 5;
    const scale = Math.min(640 / tilesWide, 480 / tilesHigh);
    const box = { width: tilesWide * scale, height: tilesHigh * scale };
    const frame = { left: -(bounds.x1 - 3) * scale, top: -(bounds.y1 - 3) * scale, width: 100 * scale, height: 100 * scale };
    return (
        <ModalFrame title={`Mapa · ${inside.nombre}`} testId="dungeon-map" onClose={onClose}>
            <div className="flex flex-wrap gap-2 px-4 pt-3">
                {floors.map((entry) => (
                    <button
                        key={entry.mapa}
                        type="button"
                        onClick={() => setShown(entry.mapa)}
                        className={`rounded-lg border px-3 py-1 text-[12px] ${
                            entry.mapa === floor?.mapa ? "border-amber-200 bg-[#3a2516] text-amber-50" : "border-[#4a3424] bg-black/25 text-stone-300 hover:text-white"
                        }`}
                    >
                        {entry.nombre}
                        {entry.actual ? " · acá" : ""}
                    </button>
                ))}
            </div>
            {floor ? (
                <div className="flex flex-col items-center gap-2 p-4">
                    <div className="relative overflow-hidden rounded-lg border border-[#4a3424] bg-[#050302]" style={{ ...box, maxWidth: "100%" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={`/imgs_maps/${floor.mapa}.png`}
                            alt=""
                            className="absolute max-w-none"
                            style={{ imageRendering: "pixelated", ...frame }}
                        />
                        <DungeonMinimapFog minimap={floor} frame={frame} />
                        {here ? (
                            <svg
                                className="pointer-events-none absolute"
                                style={frame}
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                                data-testid="dungeon-map-player"
                            >
                                <circle cx={here.x - 0.5} cy={here.y - 0.5} r="1.6" fill="#7cf8ff" stroke="#003b44" strokeWidth="0.4">
                                    <animate attributeName="opacity" values="1;0.25;1" dur="0.9s" repeatCount="indefinite" />
                                </circle>
                            </svg>
                        ) : null}
                    </div>
                    <p className="text-center text-[11px] text-stone-400">
                        {inside.mapa ? "Con el mapa se ven todas las salas; las que no recorriste, a media luz." : "Sin el mapa solo se ven las salas que recorriste."}{" "}
                        {inside.brujula ? "La brújula marca los cofres y la puerta del jefe." : "Con la brújula se verían los cofres y la puerta del jefe."}
                    </p>
                </div>
            ) : null}
        </ModalFrame>
    );
}

// La música de la mazmorra: suena mientras se está adentro, con el volumen general del juego.
export function DungeonMusicPlayer({ inside, volume }: { inside: InsideState | null | undefined; volume: number }) {
    const playerRef = React.useRef<DungeonMusic | null>(null);
    const musica = inside?.musica ?? null;
    const combate = Boolean(inside?.combate);
    const key = musica ? `${musica.pistas.join("|")}#${musica.combate ?? ""}` : "";
    React.useEffect(() => {
        playerRef.current ??= new DungeonMusic();
        playerRef.current.update(musica, combate);
        // musica cambia de objeto con cada estado: alcanza con su clave.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, combate]);
    React.useEffect(() => {
        playerRef.current?.setMasterVolume(volume);
    }, [volume]);
    React.useEffect(() => () => playerRef.current?.stop(), []);
    return null;
}
