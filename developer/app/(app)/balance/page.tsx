"use client";

import { useEffect, useState } from "react";

export default function BalancePage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [baseline, setBaseline] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/balance")
      .then((r) => r.json())
      .then((d: { data: Record<string, unknown>; hints?: string[] }) => {
        setData(d.data);
        const pretty = JSON.stringify(d.data, null, 2);
        setText(pretty);
        setBaseline(pretty);
        setHints(d.hints ?? []);
      });
  }, []);

  const dirty = text !== baseline;

  async function save() {
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const res = await fetch("/api/balance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: parsed }),
      });
      const body = (await res.json()) as { error?: string; hints?: string[] };
      if (!res.ok) throw new Error(body.error ?? "Error");
      setData(parsed);
      setBaseline(text);
      setHints(body.hints ?? []);
      setMessage("Balance guardado");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "JSON inválido");
    }
  }

  if (!data) {
    return <p style={{ color: "var(--text-muted)" }}>Cargando balance…</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, flex: 1 }}>Balance</h1>
        {dirty && <span style={{ color: "var(--warn)" }}>Sin guardar</span>}
        <button
          type="button"
          disabled={!dirty}
          onClick={save}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Guardar
        </button>
      </div>
      {message && <p>{message}</p>}
      <ul style={{ fontSize: 13 }}>
        {hints.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
        Editor JSON tipado amigable / gráficos de comparación: siguiente
        iteración. Por ahora edición completa del archivo real.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%",
          minHeight: "calc(100vh - 220px)",
          background: "var(--bg)",
          color: "var(--text)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      />
    </div>
  );
}
