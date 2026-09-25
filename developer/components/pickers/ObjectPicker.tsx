"use client";

import { useEffect, useMemo, useState } from "react";
import { LazyGrh } from "@/components/objects/LazyGrh";

export type PickerObject = {
  id: number;
  name: string;
  grhIndex?: number;
  objType?: number;
  valor?: number;
};

export function ObjectPicker({
  objects,
  onPick,
  placeholder = "Buscar objeto por nombre, ID o GRH...",
}: {
  objects: PickerObject[];
  onPick: (obj: PickerObject) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return objects.slice(0, 30);
    return objects
      .filter(
        (o) =>
          String(o.id).includes(qq) ||
          o.name.toLowerCase().includes(qq) ||
          String(o.grhIndex ?? "").includes(qq),
      )
      .slice(0, 40);
  }, [objects, q]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (!t.closest?.("[data-object-picker]")) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div data-object-picker style={{ position: "relative", flex: 1 }}>
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
          {filtered.map((o) => (
            <button
              key={o.id}
              type="button"
              className="npc-picker-row"
              onClick={() => {
                onPick(o);
                setQ("");
                setOpen(false);
              }}
            >
              <LazyGrh grhIndex={o.grhIndex ?? 0} size={28} />
              <span>
                <strong>
                  [{o.id}] {o.name}
                </strong>
                {o.grhIndex != null && (
                  <span className="muted"> · GRH {o.grhIndex}</span>
                )}
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
