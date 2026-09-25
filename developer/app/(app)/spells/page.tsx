"use client";

import { useEffect, useMemo, useState } from "react";

type Summary = {
  id: number;
  name: string;
  type: number;
  manaRequired: number;
  minSkill: number;
};

export default function SpellsPage() {
  const [items, setItems] = useState<Summary[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [baseline, setBaseline] = useState("");
  const [hints, setHints] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/spells")
      .then((r) => r.json())
      .then((d: { items: Summary[] }) => setItems(d.items ?? []));
  }, []);

  useEffect(() => {
    if (selected == null) return;
    fetch(`/api/spells?id=${selected}`)
      .then((r) => r.json())
      .then((d: { data: Record<string, unknown>; hints?: string[] }) => {
        setData(d.data);
        setBaseline(JSON.stringify(d.data));
        setHints(d.hints ?? []);
      });
  }, [selected]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (i) =>
        String(i.id).includes(query) || i.name.toLowerCase().includes(query),
    );
  }, [items, q]);

  const dirty = data != null && JSON.stringify(data) !== baseline;

  async function save() {
    if (selected == null || !data) return;
    const res = await fetch("/api/spells", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected, data }),
    });
    const body = (await res.json()) as { error?: string; hints?: string[] };
    if (!res.ok) {
      setMessage(body.error ?? "Error");
      return;
    }
    setBaseline(JSON.stringify(data));
    setHints(body.hints ?? []);
    setMessage("Guardado en api + server spells.json");
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
      <div>
        <h1 style={{ marginTop: 0 }}>Hechizos</h1>
        <input
          placeholder="Buscar…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={inputStyle}
        />
        <div
          style={{
            marginTop: 10,
            border: "1px solid var(--border)",
            borderRadius: 8,
            maxHeight: "calc(100vh - 160px)",
            overflow: "auto",
          }}
        >
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background:
                  selected === item.id ? "var(--bg-elevated)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600 }}>
                [{item.id}] {item.name}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                mana {item.manaRequired} · skill {item.minSkill}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        {!data || selected == null ? (
          <p style={{ color: "var(--text-muted)" }}>Seleccioná un hechizo</p>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <h2 style={{ margin: 0, flex: 1 }}>
                #{selected} {String(data.name ?? "")}
              </h2>
              {dirty && (
                <span style={{ color: "var(--warn)", fontSize: 13 }}>
                  Sin guardar
                </span>
              )}
              <button
                type="button"
                disabled={!dirty}
                onClick={save}
                style={btnPrimary}
              >
                Guardar
              </button>
            </div>
            {message && <p>{message}</p>}
            {hints.length > 0 && (
              <ul style={{ fontSize: 13 }}>
                {hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
                marginTop: 12,
              }}
            >
              {Object.keys(data)
                .sort()
                .map((key) => {
                  const value = data[key];
                  if (typeof value === "object") {
                    return (
                      <label key={key} style={labelStyle}>
                        <span>{key} (JSON)</span>
                        <textarea
                          style={{ ...inputStyle, minHeight: 60 }}
                          value={JSON.stringify(value)}
                          onChange={(e) => {
                            try {
                              setData({
                                ...data,
                                [key]: JSON.parse(e.target.value),
                              });
                            } catch {
                              /* ignore while typing */
                            }
                          }}
                        />
                      </label>
                    );
                  }
                  if (typeof value === "string") {
                    return (
                      <label key={key} style={labelStyle}>
                        <span>{key}</span>
                        <input
                          style={inputStyle}
                          value={value}
                          onChange={(e) =>
                            setData({ ...data, [key]: e.target.value })
                          }
                        />
                      </label>
                    );
                  }
                  return (
                    <label key={key} style={labelStyle}>
                      <span>{key}</span>
                      <input
                        type="number"
                        style={inputStyle}
                        value={Number(value ?? 0)}
                        onChange={(e) =>
                          setData({ ...data, [key]: Number(e.target.value) })
                        }
                      />
                    </label>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "8px 10px",
  color: "var(--text)",
  width: "100%",
};
const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 12,
  color: "var(--text-muted)",
};
const btnPrimary: React.CSSProperties = {
  background: "var(--accent)",
  color: "#fff",
  border: "none",
  borderRadius: 6,
  padding: "8px 12px",
  cursor: "pointer",
  fontWeight: 600,
};
