"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GrhPreview } from "@/components/ui/GrhPreview";

type Summary = {
  id: number;
  name: string;
  objType: number;
  grhIndex: number;
  valor: number;
};

const FIELD_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "General",
    keys: ["name", "objType", "valor", "grhIndex", "anim", "subtipo"],
  },
  {
    title: "Combate",
    keys: [
      "minHit",
      "maxHit",
      "minDef",
      "maxDef",
      "minDefMag",
      "maxDefMag",
      "resistenciaMagica",
      "apu",
      "proyectil",
      "staffDamageBonus",
      "magicDamageBonus",
      "magicDamagePercent",
      "magicPenetration",
    ],
  },
  {
    title: "Poción / uso",
    keys: ["tipoPocion", "minModificador", "maxModificador", "spellIndex", "porcentaje"],
  },
  {
    title: "Propiedades",
    keys: [
      "newbie",
      "agarrable",
      "noSeCae",
      "razaEnana",
      "abriga",
      "objetoEspecial",
      "mataHobbits",
    ],
  },
  {
    title: "Puertas / cofres",
    keys: ["indexAbierta", "indexCerrada", "llave", "cerrada", "minSkill"],
  },
  {
    title: "Restricciones",
    keys: ["clasesNoPermitidas"],
  },
];

export function ObjectsBrowser() {
  const [items, setItems] = useState<Summary[]>([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/objects")
      .then((r) => r.json())
      .then((d: { items: Summary[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const types = useMemo(() => {
    const set = new Set(items.map((i) => i.objType));
    return [...set].sort((a, b) => a - b);
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((item) => {
      if (typeFilter !== "" && String(item.objType) !== typeFilter) return false;
      if (!query) return true;
      return (
        String(item.id).includes(query) ||
        item.name.toLowerCase().includes(query) ||
        String(item.grhIndex).includes(query) ||
        String(item.objType).includes(query)
      );
    });
  }, [items, q, typeFilter]);

  async function createNew() {
    const res = await fetch("/api/objects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: "Nuevo objeto",
          objType: 1,
          grhIndex: 0,
          valor: 0,
        },
      }),
    });
    const data = (await res.json()) as { id?: number; error?: string };
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    router.push(`/objects/${data.id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0, flex: 1 }}>Objetos</h1>
        <button type="button" onClick={createNew} style={btnPrimary}>
          Nuevo objeto
        </button>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          placeholder="Buscar ID / nombre / objType / grhIndex"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={inputStyle}
        >
          <option value="">Todos los tipos</option>
          {types.map((t) => (
            <option key={t} value={t}>
              Tipo {t}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando…</p>
      ) : (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "auto",
            maxHeight: "calc(100vh - 180px)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "var(--bg-elevated)",
                zIndex: 1,
              }}
            >
              <tr>
                <th style={th}>Preview</th>
                <th style={th}>ID</th>
                <th style={th}>Nombre</th>
                <th style={th}>Tipo</th>
                <th style={th}>GRH</th>
                <th style={th}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={td}>
                    <GrhPreview grhIndex={item.grhIndex} size={40} />
                  </td>
                  <td style={td}>
                    <Link href={`/objects/${item.id}`} style={{ color: "var(--accent)" }}>
                      {item.id}
                    </Link>
                  </td>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.objType}</td>
                  <td style={td}>{item.grhIndex}</td>
                  <td style={td}>{item.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 500 && (
            <div style={{ padding: 10, color: "var(--text-muted)", fontSize: 12 }}>
              Mostrando 500 de {filtered.length}. Refiná la búsqueda.
            </div>
          )}
          {filtered.length === 0 && (
            <div style={{ padding: 20, color: "var(--text-muted)" }}>Sin resultados</div>
          )}
        </div>
      )}
    </div>
  );
}

export function ObjectEditor({ id }: { id: number }) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [baseline, setBaseline] = useState<string>("");
  const [hints, setHints] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/objects/${id}`)
      .then((r) => r.json())
      .then((d: { data: Record<string, unknown>; hints?: string[] }) => {
        setData(d.data);
        setBaseline(JSON.stringify(d.data));
        setHints(d.hints ?? []);
      });
  }, [id]);

  const dirty = data != null && JSON.stringify(data) !== baseline;

  function setField(key: string, value: unknown) {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/objects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const body = (await res.json()) as { error?: string; hints?: string[] };
      if (!res.ok) throw new Error(body.error ?? "Error al guardar");
      setBaseline(JSON.stringify(data));
      setHints(body.hints ?? []);
      setMessage("Guardado (backup creado)");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!baseline) return;
    setData(JSON.parse(baseline) as Record<string, unknown>);
  }

  async function duplicate() {
    const res = await fetch(`/api/objects/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    const body = (await res.json()) as { id?: number; error?: string };
    if (!res.ok) {
      alert(body.error ?? "Error");
      return;
    }
    router.push(`/objects/${body.id}`);
  }

  async function remove() {
    if (!confirm(`¿Eliminar objeto ${id}?`)) return;
    const res = await fetch(`/api/objects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      alert(body.error ?? "Error");
      return;
    }
    router.push("/objects");
  }

  if (!data) {
    return <p style={{ color: "var(--text-muted)" }}>Cargando objeto {id}…</p>;
  }

  const known = new Set(FIELD_GROUPS.flatMap((g) => g.keys));
  const extraKeys = Object.keys(data).filter((k) => !known.has(k)).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link href="/objects" style={{ color: "var(--text-muted)" }}>
          ← Objetos
        </Link>
        <h1 style={{ margin: 0, flex: 1 }}>
          Objeto #{id} — {String(data.name ?? "")}
        </h1>
        {dirty && (
          <span style={{ color: "var(--warn)", fontSize: 13 }}>
            Hay cambios sin guardar
          </span>
        )}
        <button type="button" onClick={discard} disabled={!dirty} style={btnGhost}>
          Descartar
        </button>
        <button type="button" onClick={duplicate} style={btnGhost}>
          Duplicar
        </button>
        <button type="button" onClick={remove} style={btnDanger}>
          Eliminar
        </button>
        <button type="button" onClick={save} disabled={!dirty || saving} style={btnPrimary}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 20 }}>
        <GrhPreview grhIndex={Number(data.grhIndex ?? 0)} size={96} />
        <div style={{ flex: 1 }}>
          {message && <p style={{ marginTop: 0 }}>{message}</p>}
          {hints.length > 0 && (
            <div
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: 12,
                fontSize: 13,
              }}
            >
              <strong>Tras guardar en el juego:</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                {hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {FIELD_GROUPS.map((group) => (
        <section key={group.title} style={sectionStyle}>
          <h2 style={sectionTitle}>{group.title}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {group.keys.map((key) => (
              <FieldEditor
                key={key}
                fieldKey={key}
                value={data[key]}
                onChange={(v) => setField(key, v)}
              />
            ))}
          </div>
        </section>
      ))}

      {extraKeys.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={sectionTitle}>Otras propiedades</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {extraKeys.map((key) => (
              <FieldEditor
                key={key}
                fieldKey={key}
                value={data[key]}
                onChange={(v) => setField(key, v)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FieldEditor({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (fieldKey === "clasesNoPermitidas" || Array.isArray(value)) {
    const text = Array.isArray(value) ? value.join(",") : "";
    return (
      <label style={labelStyle}>
        <span>{fieldKey}</span>
        <input
          style={inputStyle}
          value={text}
          onChange={(e) => {
            const parts = e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map(Number)
              .filter((n) => Number.isFinite(n));
            onChange(parts);
          }}
          placeholder="1,2,3"
        />
      </label>
    );
  }

  if (typeof value === "string") {
    return (
      <label style={labelStyle}>
        <span>{fieldKey}</span>
        <input
          style={inputStyle}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    );
  }

  const num = typeof value === "number" ? value : Number(value ?? 0);
  return (
    <label style={labelStyle}>
      <span>{fieldKey}</span>
      <input
        type="number"
        style={inputStyle}
        value={Number.isFinite(num) ? num : 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
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

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontWeight: 600,
  fontSize: 12,
  color: "var(--text-muted)",
};

const td: React.CSSProperties = { padding: "6px 10px", verticalAlign: "middle" };

const sectionStyle: React.CSSProperties = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 14,
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 14,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.8,
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

const btnGhost: React.CSSProperties = {
  background: "transparent",
  color: "var(--text)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  padding: "8px 12px",
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  ...btnGhost,
  color: "var(--danger)",
  borderColor: "var(--danger)",
};
