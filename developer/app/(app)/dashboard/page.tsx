"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Dash = {
  counts: { objects: number; npcs: number; spells: number; maps: number };
  sources: Record<string, string>;
};

export default function DashboardPage() {
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h1 style={{ margin: 0 }}>Dashboard</h1>
      <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: 720 }}>
        Herramienta interna para editar las fuentes reales del juego (JSON /
        mapas_source). No está expuesta públicamente — solo{" "}
        <code>127.0.0.1:3200</code>.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Objetos", value: data?.counts.objects, href: "/objects" },
          { label: "NPCs", value: data?.counts.npcs, href: "/npcs" },
          { label: "Hechizos", value: data?.counts.spells, href: "/spells" },
          { label: "Mapas", value: data?.counts.maps, href: "/maps" },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
              {card.value ?? "…"}
            </div>
          </Link>
        ))}
      </div>

      <section
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 15 }}>Fuentes de verdad</h2>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, fontSize: 13 }}>
          {data &&
            Object.entries(data.sources).map(([k, v]) => (
              <li key={k}>
                <strong>{k}</strong>: <code>{v}</code>
              </li>
            ))}
        </ul>
      </section>

      <section
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 16,
          fontSize: 13,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 15 }}>FASE 1 lista · FASE 2 pendiente</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
          El editor visual de mapas (capas, pincel, <code>Recursos/indices.ini</code>)
          se implementa en FASE 2. Ver{" "}
          <code>developer/ARCHITECTURE.md</code>.
        </p>
      </section>
    </div>
  );
}
