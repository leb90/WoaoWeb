"use client";

import { useEffect, useState } from "react";

type Backup = {
  id: string;
  createdAt: string;
  resource: string;
  resourceId: string | number | null;
  files: string[];
  note?: string;
};

export default function BackupsPage() {
  const [items, setItems] = useState<Backup[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/backups");
    const data = (await res.json()) as { items: Backup[] };
    setItems(data.items ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function restore(item: Backup) {
    if (
      !confirm(
        `¿Restaurar backup ${item.id} sobre ${item.resource}? Se creará un backup previo.`,
      )
    ) {
      return;
    }
    const res = await fetch("/api/backups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, resource: item.resource }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(body.error ?? "Error");
      return;
    }
    setMessage(`Restaurado ${item.id}`);
    await load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Backups</h1>
      <p style={{ color: "var(--text-muted)", margin: 0, fontSize: 13 }}>
        Copias automáticas en <code>developer/.backups/</code> (gitignored).
      </p>
      {message && <p>{message}</p>}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "auto",
        }}
      >
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
        >
          <thead style={{ background: "var(--bg-elevated)" }}>
            <tr>
              {["Fecha", "Recurso", "ID", "Archivos", ""].map((h) => (
                <th
                  key={h || "a"}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    color: "var(--text-muted)",
                    fontSize: 12,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "8px 10px" }}>{item.createdAt}</td>
                <td style={{ padding: "8px 10px" }}>{item.resource}</td>
                <td style={{ padding: "8px 10px" }}>
                  {item.resourceId ?? "—"}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  {item.files.join(", ")}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <button
                    type="button"
                    onClick={() => restore(item)}
                    style={{
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: 6,
                      color: "var(--text)",
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Restaurar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div style={{ padding: 16, color: "var(--text-muted)" }}>
            Todavía no hay backups. Se crean al guardar un recurso.
          </div>
        )}
      </div>
    </div>
  );
}
