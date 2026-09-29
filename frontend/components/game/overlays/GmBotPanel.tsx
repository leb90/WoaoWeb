import { useState } from "react";
import { Sparkles } from "lucide-react";

// Presencia visual del bot: puramente client-side, no es una entidad del
// juego (no consume slot de NPC ni red). Se ancla cerca del centro de la
// pantalla porque el personaje del jugador siempre se dibuja ahí — así "está
// al lado tuyo" sin tocar el motor Pixi ni sincronizar posiciones.
export function GmBotCompanionBadge({ visible }: { visible: boolean }) {
    if (!visible) {
        return null;
    }

    return (
        <div
            className="pointer-events-none fixed left-[calc(50%+34px)] top-[calc(50%-34px)] z-30 flex h-9 w-9 animate-bounce items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-400/20 shadow-[0_0_18px_rgba(103,232,249,0.55)] backdrop-blur-sm"
            title="GM-Aris"
        >
            <Sparkles className="h-4 w-4 text-cyan-100" />
        </div>
    );
}

type GmBotMessage = {
    id: number;
    text: string;
    color?: string;
};

type GmBotPanelProps = {
    open: boolean;
    messages: GmBotMessage[];
    onSendCommand: (message: string) => void;
    onClose: () => void;
};

const QUICK_REPLIES = [
    { value: "1", label: "1. Atascado" },
    { value: "2", label: "2. Reportar jugador" },
    { value: "3", label: "3. Reportar bug" },
    { value: "4", label: "4. Preguntas" },
    { value: "5", label: "5. Salir" },
];

export function GmBotPanel({
    open,
    messages,
    onSendCommand,
    onClose,
}: GmBotPanelProps) {
    const [draft, setDraft] = useState("");

    if (!open) {
        return null;
    }

    function submitDraft() {
        const trimmed = draft.trim();
        if (!trimmed) {
            return;
        }
        onSendCommand(`/gm ${trimmed}`);
        setDraft("");
    }

    function handleClose() {
        onSendCommand("/gm salir");
        onClose();
    }

    return (
        <div className="pointer-events-auto fixed bottom-24 left-4 z-40 w-72 overflow-hidden rounded-xl border border-cyan-200/20 bg-black/80 shadow-[0_10px_35px_rgba(0,0,0,0.5)] backdrop-blur-md sm:bottom-6">
            <div className="flex items-center justify-between border-b border-cyan-200/10 bg-cyan-400/5 px-3 py-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                    GM-Aris
                </span>
                <button
                    type="button"
                    onClick={handleClose}
                    className="text-stone-400 transition hover:text-stone-100"
                    aria-label="Cerrar"
                >
                    ✕
                </button>
            </div>

            <div className="max-h-52 space-y-2 overflow-y-auto px-3 py-2">
                {messages.map((message) => (
                    <p
                        key={message.id}
                        className="whitespace-pre-line text-xs leading-relaxed text-stone-200"
                        style={{ color: message.color }}
                    >
                        {message.text}
                    </p>
                ))}
            </div>

            <div className="flex flex-wrap gap-1 border-t border-cyan-200/10 px-3 py-2">
                {QUICK_REPLIES.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onSendCommand(`/gm ${option.value}`)}
                        className="rounded-full border border-cyan-200/20 px-2 py-1 text-[10px] text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-400/10"
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2 border-t border-cyan-200/10 px-3 py-2">
                <input
                    type="text"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            submitDraft();
                        }
                    }}
                    placeholder="Escribí tu respuesta..."
                    className="w-full rounded-md border border-cyan-200/15 bg-black/40 px-2 py-1 text-xs text-stone-100 outline-none placeholder:text-stone-500 focus:border-cyan-200/40"
                />
                <button
                    type="button"
                    onClick={submitDraft}
                    className="shrink-0 rounded-md border border-cyan-200/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-100 transition hover:bg-cyan-400/20"
                >
                    Enviar
                </button>
            </div>
        </div>
    );
}
