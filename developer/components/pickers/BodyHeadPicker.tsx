"use client";

import { useMemo, useState } from "react";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";

export function BodyHeadPicker({
  kind,
  value,
  ids,
  onChange,
}: {
  kind: "body" | "head";
  value: number;
  ids: number[];
  onChange: (id: number) => void;
}) {
  const [q, setQ] = useState("");
  const sorted = useMemo(() => [...ids].sort((a, b) => a - b), [ids]);

  const filtered = useMemo(() => {
    const qq = q.trim();
    if (!qq) return sorted.slice(0, 48);
    return sorted.filter((id) => String(id).includes(qq)).slice(0, 48);
  }, [sorted, q]);

  const idx = sorted.indexOf(value);

  function step(delta: number) {
    if (sorted.length === 0) return;
    if (idx < 0) {
      onChange(sorted[0]!);
      return;
    }
    const next = Math.max(0, Math.min(sorted.length - 1, idx + delta));
    onChange(sorted[next]!);
  }

  return (
    <div className="npc-panel" style={{ marginTop: 10 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <strong style={{ textTransform: "capitalize" }}>{kind}</strong>
        <input
          className="npc-input"
          style={{ maxWidth: 140 }}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <button type="button" className="obj-btn" onClick={() => step(-1)}>
          ← Anterior
        </button>
        <button type="button" className="obj-btn" onClick={() => step(1)}>
          Siguiente →
        </button>
        <input
          className="npc-input"
          style={{ maxWidth: 160 }}
          placeholder={`${kind} ID...`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
          gap: 8,
          maxHeight: 280,
          overflow: "auto",
        }}
      >
        {kind === "head" && (
          <button
            type="button"
            className="obj-btn"
            style={{
              flexDirection: "column",
              height: 88,
              borderColor: value === 0 ? "var(--accent)" : undefined,
            }}
            onClick={() => onChange(0)}
          >
            <span style={{ fontSize: 11 }}>Sin head</span>
            <strong>0</strong>
          </button>
        )}
        {filtered.map((id) => (
          <button
            key={id}
            type="button"
            className="obj-btn"
            style={{
              flexDirection: "column",
              height: 88,
              padding: 4,
              borderColor: value === id ? "var(--accent)" : undefined,
            }}
            onClick={() => onChange(id)}
          >
            <NpcSpritePreview
              idBody={kind === "body" ? id : 1}
              idHead={kind === "head" ? id : 0}
              size={52}
            />
            <span style={{ fontSize: 11 }}>{id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
