"use client";

import { useEffect, useMemo, useState } from "react";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";

export type PickerNpc = {
  id: number;
  name: string;
  npcType: number;
  idBody: number;
  idHead: number;
};

export function NpcPicker({
  npcs,
  onPick,
  placeholder = "Buscar NPC por ID, nombre o tipo...",
  typeLabel,
}: {
  npcs: PickerNpc[];
  onPick: (npc: PickerNpc) => void;
  placeholder?: string;
  typeLabel?: (type: number) => string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return npcs.slice(0, 30);
    return npcs
      .filter((n) => {
        const typeStr = typeLabel?.(n.npcType) ?? String(n.npcType);
        return (
          String(n.id).includes(qq) ||
          n.name.toLowerCase().includes(qq) ||
          typeStr.toLowerCase().includes(qq) ||
          String(n.npcType).includes(qq)
        );
      })
      .slice(0, 40);
  }, [npcs, q, typeLabel]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-npc-picker]")) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div data-npc-picker style={{ position: "relative", flex: 1 }}>
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
          {filtered.map((n) => (
            <button
              key={n.id}
              type="button"
              className="npc-picker-row"
              onClick={() => {
                onPick(n);
                setQ("");
                setOpen(false);
              }}
            >
              <NpcSpritePreview idBody={n.idBody} idHead={n.idHead} size={28} />
              <span>
                <strong>
                  [{n.id}] {n.name}
                </strong>
                <span className="muted">
                  {" "}
                  · {typeLabel?.(n.npcType) ?? `tipo ${n.npcType}`}
                </span>
              </span>
            </button>
          ))}
          {!filtered.length && (
            <div className="npc-picker-empty">Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}
