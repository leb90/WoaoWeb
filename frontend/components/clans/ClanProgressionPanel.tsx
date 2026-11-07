"use client";
import { useRef, useState } from "react";
import ClanQuestDonationForm from "./ClanQuestDonationForm";
export type ClanProgressionState = {
    level: number;
    maxMembers: number;
    castleLimit: number;
    questPoints: number;
    vaultGold: number;
    vaultRevision: number;
    materials: Record<number, number>;
    nextLevelRequirements: {
        level: number;
        gold: number;
        questPoints: number;
        maxMembers: number;
        castleLimit: number;
        items: { idItem: number; amount: number }[];
    } | null;
};
const materials: Record<number, string> = { 1095: "Huevo Dragón", 1096: "Diamante Sangre", 1241: "Corazón Oscuro" };
const format = (value: number) => value.toLocaleString("es-AR");
export default function ClanProgressionPanel({
    state,
    memberCount,
    isLeader,
    questBalance,
    onSend,
    onRefresh,
}: {
    state: ClanProgressionState;
    memberCount: number;
    isLeader: boolean;
    questBalance: number;
    onSend: (command: string) => void;
    onRefresh: () => Promise<void>;
}) {
    const [pending, setPending] = useState(false);
    const operation = useRef<{ level: number; id: string } | null>(null);
    const next = state.nextLevelRequirements;
    const canUpgrade = Boolean(
        next &&
        state.questPoints >= next.questPoints &&
        state.vaultGold >= next.gold &&
        next.items.every((item) => (state.materials[item.idItem] ?? 0) >= item.amount),
    );
    return (
        <div data-testid="clan-progression" className="mt-4 rounded-xl border border-amber-300/20 bg-black/20 p-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <strong className="text-amber-200">Clan nivel {state.level}</strong>
                <span className="text-stone-200">
                    {memberCount}/{state.maxMembers} miembros
                </span>
                <span className="text-stone-200">{format(state.questPoints)} puntos Quest</span>
            </div>
            <p className="mt-2 text-xs text-stone-400">
                Hasta {state.castleLimit} miembros simultáneos por castillo.{" "}
                {state.level >= 2
                    ? "Nivel suficiente para atacar la Fortaleza; siguen aplicando los requisitos de conquista."
                    : "El nivel 2 habilita el ataque a la Fortaleza."}
            </p>
            {next ? (
                <>
                    <h5 className="mt-4 text-sm font-semibold text-stone-100">Próximo nivel: {next.level}</h5>
                    <p className="mt-1 text-xs text-stone-400">
                        Aumenta el cupo a {next.maxMembers} miembros y {next.castleLimit} por castillo.
                    </p>
                    <table className="mt-2 w-full text-left text-xs">
                        <thead>
                            <tr className="text-stone-500">
                                <th className="py-1 font-normal">Requisito</th>
                                <th className="text-right font-normal">Disponible / necesario</th>
                            </tr>
                        </thead>
                        <tbody className="text-stone-200">
                            <tr>
                                <td className="py-1">Oro en bóveda</td>
                                <td
                                    className={`text-right ${state.vaultGold < next.gold ? "text-amber-300" : "text-emerald-300"}`}
                                >
                                    {format(state.vaultGold)} / {format(next.gold)}
                                </td>
                            </tr>
                            <tr>
                                <td className="py-1">Puntos Quest del clan</td>
                                <td
                                    className={`text-right ${state.questPoints < next.questPoints ? "text-amber-300" : "text-emerald-300"}`}
                                >
                                    {format(state.questPoints)} / {format(next.questPoints)}
                                </td>
                            </tr>
                            {next.items.map((item) => (
                                <tr key={item.idItem}>
                                    <td className="py-1">{materials[item.idItem]}</td>
                                    <td
                                        className={`text-right ${(state.materials[item.idItem] ?? 0) < item.amount ? "text-amber-300" : "text-emerald-300"}`}
                                    >
                                        {format(state.materials[item.idItem] ?? 0)} / {item.amount}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="mt-2 text-xs text-stone-400">
                        Depositen el oro y los materiales en la bóveda del clan. Debe estar cerrada al subir.
                    </p>
                    {isLeader ? (
                        <button
                            type="button"
                            disabled={!canUpgrade || pending}
                            onClick={() => {
                                if (operation.current?.level !== state.level)
                                    operation.current = { level: state.level, id: crypto.randomUUID() };
                                setPending(true);
                                onSend(`/clansubirnivel ${state.level}|${operation.current.id}`);
                                window.setTimeout(() => {
                                    void onRefresh();
                                    setPending(false);
                                }, 1500);
                            }}
                            className="mt-3 rounded-lg border border-amber-300/40 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {pending ? "Procesando…" : "Subir de nivel"}
                        </button>
                    ) : (
                        <p className="mt-3 text-xs text-stone-500">El líder puede comprar el próximo nivel.</p>
                    )}
                </>
            ) : (
                <p className="mt-3 text-sm font-semibold text-amber-200">Nivel máximo</p>
            )}
            <ClanQuestDonationForm key={questBalance} balance={questBalance} onSend={onSend} onRefresh={onRefresh} />
        </div>
    );
}
