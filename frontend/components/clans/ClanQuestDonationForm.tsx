"use client";
import { useRef, useState } from "react";
export default function ClanQuestDonationForm({
    balance,
    onSend,
    onRefresh,
}: {
    balance: number;
    onSend: (command: string) => void;
    onRefresh: () => Promise<void>;
}) {
    const [amount, setAmount] = useState("");
    const [pending, setPending] = useState(false);
    const operation = useRef<{ amount: number; id: string } | null>(null);
    const value = Number(amount);
    const valid = Number.isSafeInteger(value) && value > 0 && value <= balance;
    return (
        <form
            className="mt-4 border-t border-white/10 pt-4"
            onSubmit={(event) => {
                event.preventDefault();
                if (!valid || pending) return;
                if (operation.current?.amount !== value) operation.current = { amount: value, id: crypto.randomUUID() };
                setPending(true);
                onSend(`/clandonarquest ${value}|${operation.current.id}`);
                window.setTimeout(() => {
                    void onRefresh();
                    setPending(false);
                }, 1500);
            }}
        >
            <label className="block text-sm text-stone-200" htmlFor="clan-quest-donation">
                Donar puntos Quest
            </label>
            <p className="mt-1 text-xs text-stone-400">
                Tu saldo: {balance.toLocaleString("es-AR")}. El aporte queda en el clan.
            </p>
            <div className="mt-2 flex gap-2">
                <input
                    id="clan-quest-donation"
                    type="number"
                    min="1"
                    max={balance}
                    step="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    disabled={pending}
                    placeholder="Cantidad"
                    className="w-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-stone-100"
                />
                <button
                    type="submit"
                    disabled={!valid || pending}
                    className="rounded-lg border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {pending ? "Procesando…" : "Donar"}
                </button>
            </div>
        </form>
    );
}
