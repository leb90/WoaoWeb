"use client";

import { useEffect, useState } from "react";

type Audit = {
  at: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string | number | null;
  file: string;
};

export default function LogsPage() {
  const [items, setItems] = useState<Audit[]>([]);

  useEffect(() => {
    fetch("/api/git?kind=audit")
      .then((r) => r.json())
      .then((d: { items: Audit[] }) => setItems(d.items ?? []));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 style={{ margin: 0 }}>Logs de auditoría</h1>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "auto",
          maxHeight: "calc(100vh - 120px)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {items.map((item, i) => (
          <div
            key={`${item.at}-${i}`}
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--text-muted)" }}>{item.at}</span>{" "}
            <strong>{item.username}</strong> {item.action}{" "}
            <code>
              {item.resourceType}
              {item.resourceId != null ? `#${item.resourceId}` : ""}
            </code>{" "}
            → {item.file}
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ padding: 16, color: "var(--text-muted)" }}>
            Sin eventos todavía.
          </div>
        )}
      </div>
    </div>
  );
}
