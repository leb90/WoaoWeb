"use client";

import React from "react";
import { DoorOpen, Mountain, ScrollText, Users, X } from "lucide-react";
import type { DungeonMinimapState, DungeonStatePayload } from "../lib/aowProtocol";

// Mazmorras (server/src/dungeons.ts): el panel de la piedra de invocación, la invocación del líder con su cuenta
// regresiva y, adentro, el cartel con la mazmorra, el botón para salir y el texto de las losas. Todo manda comandos
// /mazmorra. Abajo está la niebla del minimapa; la barra de la mazmorra y la Mochila están en DungeonBackpack.tsx.
type DungeonOverlayProps = {
    state?: DungeonStatePayload;
    onSendCommand?: (command: string) => void;
};

export default function DungeonOverlay({ state, onSendCommand }: DungeonOverlayProps) {
    const [closedPanelSeq, setClosedPanelSeq] = React.useState(0);
    const [closedLosaSeq, setClosedLosaSeq] = React.useState(0);
    const [confirmLeave, setConfirmLeave] = React.useState(false);
    const [now, setNow] = React.useState(() => Date.now());
    const [inviteReceivedAt, setInviteReceivedAt] = React.useState(0);
    const invite = state?.invitacion ?? null;

    React.useEffect(() => {
        if (invite) setInviteReceivedAt(Date.now());
    }, [invite]);

    React.useEffect(() => {
        if (!invite) return;
        const timer = window.setInterval(() => setNow(Date.now()), 250);
        return () => window.clearInterval(timer);
    }, [invite]);

    const panel = state?.panel && state.panelSeq !== closedPanelSeq ? state.panel : null;
    const losa = state?.losa && state.losa.seq !== closedLosaSeq ? state.losa : null;
    const inside = state?.enMazmorra ?? null;
    const inviteSecondsLeft = invite ? Math.max(0, Math.ceil((inviteReceivedAt + invite.expiraEnMs - now) / 1000)) : 0;
    const send = (command: string) => onSendCommand?.(command);
    const closePanel = () => setClosedPanelSeq(state?.panelSeq ?? 0);

    return (
        <>
            {panel ? (
                <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={closePanel}>
                    <div
                        className="w-full max-w-md overflow-hidden rounded-[24px] border border-[#5f4630] bg-[linear-gradient(180deg,#2b1d13_0%,#18110c_100%)] text-stone-100 shadow-[0_32px_120px_rgba(0,0,0,0.55)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-[#6a4f39] bg-[#120d09]/85 px-5 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/15 bg-black/30 text-amber-200">
                                    <Mountain className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[11px] uppercase tracking-[0.28em] text-amber-300/75">Piedra de invocación</p>
                                    <h2 className="text-xl font-semibold text-stone-50">{panel.nombre}</h2>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={closePanel}
                                className="rounded-2xl border border-stone-700 bg-stone-950/60 p-2 text-stone-300 transition hover:border-stone-500 hover:text-white"
                                aria-label="Cerrar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3 px-5 py-4 text-sm text-stone-300">
                            {panel.descripcion ? <p>{panel.descripcion}</p> : null}
                            <div className="flex flex-wrap gap-2 text-[12px]">
                                <span className="rounded-full border border-stone-100/10 bg-white/5 px-2.5 py-1">Nivel {panel.nivelMinimo}+</span>
                                <span className="rounded-full border border-stone-100/10 bg-white/5 px-2.5 py-1">Solo o en grupo de hasta {panel.maxJugadores}</span>
                                <span className="rounded-full border border-stone-100/10 bg-white/5 px-2.5 py-1">Sin PvP</span>
                            </div>
                            <p className="text-[12px] text-stone-400">
                                La dificultad se ajusta a la cantidad de jugadores. Si salís de la party, quedás fuera de la mazmorra.
                            </p>
                            {panel.motivo ? (
                                <p className="rounded-xl border border-rose-300/20 bg-rose-950/30 px-3 py-2 text-[13px] text-rose-100">{panel.motivo}</p>
                            ) : null}
                        </div>
                        <div className="flex flex-col gap-2 border-t border-[#6a4f39] bg-[#0f0b09]/92 px-5 py-4 sm:flex-row">
                            <button
                                type="button"
                                disabled={!panel.puedeSolo}
                                onClick={() => {
                                    send("/mazmorra entrar solo");
                                    closePanel();
                                }}
                                className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#8c3418_0%,#661b0d_100%)] px-4 text-sm font-semibold uppercase tracking-[0.12em] text-amber-50 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Entrar solo
                            </button>
                            <button
                                type="button"
                                disabled={!panel.puedeGrupo}
                                onClick={() => {
                                    send("/mazmorra entrar grupo");
                                    closePanel();
                                }}
                                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 text-sm font-semibold uppercase tracking-[0.12em] text-amber-100 transition hover:border-amber-200/50 hover:bg-amber-300/16 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Users className="h-4 w-4" />
                                {panel.enParty ? `Con mi grupo (${panel.miembrosParty})` : "Con mi grupo"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            {losa ? (
                <div className="fixed inset-0 z-[88] flex items-center justify-center bg-black/45 p-4" onClick={() => setClosedLosaSeq(losa.seq)}>
                    <div
                        data-testid="dungeon-slab"
                        className="w-full max-w-sm rounded-[20px] border border-stone-500/40 bg-[linear-gradient(180deg,#3a3631_0%,#211e1b_100%)] p-5 text-stone-100 shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-stone-400">
                            <ScrollText className="h-4 w-4" />
                            Losa de piedra
                        </div>
                        <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-stone-100">“{losa.texto}”</p>
                        <button
                            type="button"
                            onClick={() => setClosedLosaSeq(losa.seq)}
                            className="mt-4 w-full rounded-xl border border-stone-600 bg-stone-950/50 py-2 text-sm text-stone-300 transition hover:border-stone-400 hover:text-white"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            ) : null}

            {invite ? (
                <div className="fixed left-1/2 top-24 z-[87] w-[min(92vw,380px)] -translate-x-1/2 rounded-[20px] border border-amber-300/30 bg-[linear-gradient(180deg,#2b1d13_0%,#18110c_100%)] p-4 text-stone-100 shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-amber-300/80">Invocación</p>
                    <p className="mt-1 text-sm">
                        <span className="font-semibold text-amber-100">{invite.de}</span> te invoca a{" "}
                        <span className="font-semibold text-stone-50">{invite.nombre}</span>.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => send("/mazmorra aceptar")}
                            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#8c3418_0%,#661b0d_100%)] text-sm font-semibold uppercase tracking-[0.12em] text-amber-50 transition hover:brightness-110"
                        >
                            Aceptar ({inviteSecondsLeft})
                        </button>
                        <button
                            type="button"
                            onClick={() => send("/mazmorra rechazar")}
                            className="flex h-10 flex-1 items-center justify-center rounded-xl border border-stone-700 bg-stone-950/60 text-sm text-stone-300 transition hover:border-stone-500 hover:text-white"
                        >
                            Rechazar
                        </button>
                    </div>
                </div>
            ) : null}

            {inside ? (
                <div className="fixed left-1/2 top-3 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-300/25 bg-[#18110c]/90 py-1 pl-4 pr-1 text-sm text-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                    <Mountain className="h-4 w-4 text-amber-200" />
                    <span className="font-semibold">{inside.nombre}</span>
                    <span className="text-stone-400">
                        · {inside.jugadores} {inside.jugadores === 1 ? "jugador" : "jugadores"}
                    </span>
                    {confirmLeave ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    send("/mazmorra salir");
                                    setConfirmLeave(false);
                                }}
                                className="rounded-full bg-rose-800/80 px-3 py-1 text-[12px] font-semibold text-rose-50 transition hover:bg-rose-700"
                            >
                                Sí, salir
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmLeave(false)}
                                className="rounded-full px-2 py-1 text-[12px] text-stone-400 transition hover:text-white"
                            >
                                No
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setConfirmLeave(true)}
                            className="flex items-center gap-1 rounded-full border border-stone-700 bg-stone-950/60 px-3 py-1 text-[12px] text-stone-300 transition hover:border-stone-500 hover:text-white"
                        >
                            <DoorOpen className="h-3.5 w-3.5" />
                            Salir
                        </button>
                    )}
                </div>
            ) : null}
        </>
    );
}


// Niebla del minimapa: tapa lo que no se visitó (con el mapa, las salas no visitadas quedan a media luz) y, con la
// brújula, marca los cofres y la puerta del jefe. Va encima de la imagen del minimapa, en su mismo recuadro.
export function DungeonMinimapFog({
    minimap,
    frame,
}: {
    minimap: DungeonMinimapState;
    frame: { left: number; top: number; width: number; height: number };
}) {
    const maskId = `dungeon-fog-${minimap.mapa}`;
    return (
        <svg
            data-testid="dungeon-minimap-fog"
            className="pointer-events-none absolute"
            style={{ left: frame.left, top: frame.top, width: frame.width, height: frame.height }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <defs>
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
                    <rect x="0" y="0" width="100" height="100" fill="white" />
                    {minimap.salas.map((sala) => (
                        <rect
                            key={`${sala.x1},${sala.y1}`}
                            x={sala.x1 - 2}
                            y={sala.y1 - 2}
                            width={sala.x2 - sala.x1 + 3}
                            height={sala.y2 - sala.y1 + 3}
                            fill={sala.visitada ? "black" : "#8a8a8a"}
                        />
                    ))}
                </mask>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill="#050302" mask={`url(#${maskId})`} />
            {minimap.cofres.map((cofre) => (
                <rect
                    key={`c${cofre.x},${cofre.y}`}
                    data-testid="dungeon-minimap-chest"
                    x={cofre.x - 1.4}
                    y={cofre.y - 1.4}
                    width="1.8"
                    height="1.8"
                    fill={cofre.abierto ? "#6b5a45" : "#ffd24a"}
                    stroke="#2a1600"
                    strokeWidth="0.3"
                />
            ))}
            {minimap.jefe.map((door) => (
                <path
                    key={`j${door.x},${door.y}`}
                    data-testid="dungeon-minimap-boss"
                    d={`M ${door.x - 0.5} ${door.y - 2} L ${door.x + 1} ${door.y - 0.5} L ${door.x - 0.5} ${door.y + 1} L ${door.x - 2} ${door.y - 0.5} Z`}
                    fill="#ff3b5c"
                    stroke="#3a0010"
                    strokeWidth="0.3"
                />
            ))}
        </svg>
    );
}
