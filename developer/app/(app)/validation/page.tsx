"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Issue = {
  severity: "ERROR" | "WARNING" | "INFO";
  code: string;
  message: string;
  resourceType: string;
  resourceId: string | number | null;
  href?: string;
};

export default function ValidationPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [counts, setCounts] = useState({ error: 0, warning: 0, info: 0 });
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/validation");
      const data = (await res.json()) as {
        issues: Issue[];
        counts: typeof counts;
      };
      setIssues(data.issues ?? []);
      setCounts(data.counts ?? { error: 0, warning: 0, info: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void run();
  }, []);

  const color = (s: Issue["severity"]) =>
    s === "ERROR"
      ? "var(--danger)"
      : s === "WARNING"
        ? "var(--warn)"
        : "var(--ok)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, flex: 1 }}>Validar datos del juego</h1>
        <button
          type="button"
          onClick={run}
          disabled={loading}
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
          {loading ? "Analizando…" : "Volver a validar"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
        <span style={{ color: "var(--danger)" }}>ERROR {counts.error}</span>
        <span style={{ color: "var(--warn)" }}>WARNING {counts.warning}</span>
        <span style={{ color: "var(--ok)" }}>INFO {counts.info}</span>
      </div>
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 8,
          overflow: "auto",
          maxHeight: "calc(100vh - 180px)",
        }}
      >
        {issues.map((issue, i) => (
          <div
            key={`${issue.code}-${i}`}
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid var(--border)",
              fontSize: 13,
            }}
          >
            <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
              <strong style={{ color: color(issue.severity), minWidth: 72 }}>
                {issue.severity}
              </strong>
              <code style={{ color: "var(--text-muted)" }}>{issue.code}</code>
              {issue.href ? (
                <Link href={issue.href} style={{ color: "var(--accent)" }}>
                  {issue.message}
                </Link>
              ) : (
                <span>{issue.message}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
