"use client";

import { useEffect, useState } from "react";

type Entry = { status: string; path: string };

export default function GitPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/git")
      .then((r) => r.json())
      .then((d: { entries: Entry[]; ok: boolean; error?: string }) => {
        setEntries(d.entries ?? []);
        setError(d.ok ? null : d.error ?? "Error");
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Cambios Git</h1>
      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13 }}>
        Solo lectura. No se hacen commits ni push desde esta herramienta.
      </p>
      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}
      <pre
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 14,
          margin: 0,
          fontSize: 13,
          overflow: "auto",
        }}
      >
        {entries.length === 0
          ? "Working tree limpio (o sin cambios listados)."
          : entries.map((e) => `${e.status.padEnd(3)}${e.path}`).join("\n")}
      </pre>
    </div>
  );
}
