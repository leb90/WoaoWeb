"use client";

import { useEffect, useMemo, useState } from "react";

export type PickerSpell = { id: number; name: string };

export function SpellPicker({
  spells,
  onPick,
  placeholder = "Buscar hechizo...",
}: {
  spells: PickerSpell[];
  onPick: (spell: PickerSpell) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return spells.slice(0, 30);
    return spells
      .filter(
        (s) =>
          String(s.id).includes(qq) || s.name.toLowerCase().includes(qq),
      )
      .slice(0, 40);
  }, [spells, q]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-spell-picker]")) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div data-spell-picker style={{ position: "relative", flex: 1 }}>
      <input
        className="npc-input"
        value={q}
        placeholder={placeholder}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="npc-picker-dropdown">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              className="npc-picker-row"
              onClick={() => {
                onPick(s);
                setQ("");
                setOpen(false);
              }}
            >
              <span>
                <strong>
                  [{s.id}] {s.name}
                </strong>
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
