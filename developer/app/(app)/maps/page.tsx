"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MapMeta = {
  id: number;
  name: string;
  dir: string;
  width?: number;
  height?: number;
  npcCount?: number;
  specialCount?: number;
  zona?: string;
  pk?: number;
};

export default function MapsPage() {
  const [maps, setMaps] = useState<MapMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/maps")
      .then((r) => r.json())
      .then((d: { items: MapMeta[] }) => setMaps(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return maps;
    return maps.filter(
      (m) =>
        String(m.id).includes(query) ||
        m.name.toLowerCase().includes(query) ||
        (m.zona ?? "").toLowerCase().includes(query),
    );
  }, [maps, q]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h1 style={{ margin: 0 }}>Mapas</h1>
        <p style={{ color: "var(--text-muted)", margin: "6px 0 0", fontSize: 13 }}>
          Fuente: <code>server/mapas_source</code> · Paleta stamps:{" "}
          <code>Recursos/indices.ini</code>
        </p>
      </div>
      <input
        placeholder="Buscar ID / nombre / zona…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: "8px 10px",
          color: "var(--text)",
          maxWidth: 420,
        }}
      />
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando…</p>
      ) : (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "auto",
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "var(--bg-elevated)",
              }}
            >
              <tr>
                {["ID", "Nombre", "Zona", "Tamaño", "NPCs", "Specials", "PK", ""].map(
                  (h) => (
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
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 10px" }}>{m.id}</td>
                  <td style={{ padding: "6px 10px" }}>{m.name}</td>
                  <td style={{ padding: "6px 10px" }}>{m.zona ?? "—"}</td>
                  <td style={{ padding: "6px 10px" }}>
                    {m.width && m.height ? `${m.width}×${m.height}` : "—"}
                  </td>
                  <td style={{ padding: "6px 10px" }}>{m.npcCount ?? 0}</td>
                  <td style={{ padding: "6px 10px" }}>{m.specialCount ?? 0}</td>
                  <td style={{ padding: "6px 10px" }}>{m.pk ?? "—"}</td>
                  <td style={{ padding: "6px 10px" }}>
                    <Link
                      href={`/maps/${m.id}`}
                      style={{
                        color: "#fff",
                        background: "var(--accent)",
                        padding: "5px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
