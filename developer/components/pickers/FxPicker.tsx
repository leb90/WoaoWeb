"use client";

import { useEffect, useMemo, useState } from "react";
import { FxThumb } from "@/components/spells/FxAnimatedPreview";

export type FxItem = {
  id: number;
  grh: number;
  offsetX?: number;
  offsetY?: number;
};

export function FxPicker({
  fxs,
  value,
  onPick,
}: {
  fxs: FxItem[];
  value: number;
  onPick: (fx: FxItem) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return fxs.slice(0, 40);
    return fxs
      .filter(
        (f) =>
          String(f.id).includes(qq) || String(f.grh).includes(qq),
      )
      .slice(0, 48);
  }, [fxs, q]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-fx-picker]")) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div data-fx-picker style={{ position: "relative" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <FxThumb fxId={value} size={48} />
        <input
          className="npc-input"
          value={q}
          placeholder="Buscar efecto / FX ID / GRH..."
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        <input
          className="npc-input"
          style={{ width: 90 }}
          type="number"
          value={value}
          onChange={(e) => {
            const id = Number(e.target.value) || 0;
            const found = fxs.find((f) => f.id === id);
            onPick(found ?? { id, grh: 0 });
          }}
        />
      </div>
      {open && (
        <div className="npc-picker-dropdown" style={{ maxHeight: 320 }}>
          <button
            type="button"
            className="npc-picker-row"
            onClick={() => {
              onPick({ id: 0, grh: 0 });
              setOpen(false);
              setQ("");
            }}
          >
            Sin FX (0)
          </button>
          {filtered.map((f) => (
            <button
              key={f.id}
              type="button"
              className="npc-picker-row"
              onClick={() => {
                onPick(f);
                setOpen(false);
                setQ("");
              }}
            >
              <FxThumb fxId={f.id} size={32} />
              <span>
                <strong>FX {f.id}</strong>
                <span className="muted"> · GRH {f.grh}</span>
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="npc-picker-empty">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}
