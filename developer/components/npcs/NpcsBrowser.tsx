"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Summary = {
  id: number;
  name: string;
  npcType: number;
  idBody: number;
  idHead: number;
  hostile: number;
  hp: number;
  exp: number;
};

type CatalogItem = { id: number; name: string };

const SECTIONS: { title: string; keys: string[] }[] = [
  {
    title: "Identidad",
    keys: ["name", "npcType", "desc", "hostile", "attackable", "comercia"],
  },
  {
    title: "Gráfico",
    keys: ["idBody", "idHead"],
  },
  {
    title: "Stats",
    keys: ["hp", "maxHp", "exp", "gold", "def", "magicResistance", "magicDef", "defM"],
  },
  {
    title: "Combate",
    keys: ["minHit", "maxHit", "poderAtaque", "poderEvasion"],
  },
  {
    title: "Movimiento",
    keys: ["movement", "aguaValida", "tierraInvalida"],
  },
  {
    title: "Audio",
    keys: ["snd1", "snd2", "soundClose"],
  },
];

export function NpcsBrowser() {
  const [items, setItems] = useState<Summary[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/npcs")
      .then((r) => r.json())
      .then((d: { items: Summary[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (i) =>
        String(i.id).includes(query) ||
        i.name.toLowerCase().includes(query) ||
        String(i.npcType).includes(query),
    );
  }, [items, q]);

  async function createNew() {
    const res = await fetch("/api/npcs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          name: "Nuevo NPC",
          npcType: 0,
          idBody: 1,
          idHead: 0,
          movement: 2,
          hp: 1,
          maxHp: 1,
          drop: [],
          objs: [],
          spells: [],
        },
      }),
    });
    const data = (await res.json()) as { id?: number; error?: string };
    if (!res.ok) {
      alert(data.error ?? "Error");
      return;
    }
    router.push(`/npcs/${data.id}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <h1 style={{ margin: 0, flex: 1 }}>NPCs</h1>
        <button type="button" onClick={createNew} style={btnPrimary}>
          Nuevo NPC
        </button>
      </div>
      <input
        placeholder="Buscar ID / nombre / tipo"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={inputStyle}
      />
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
              }}
            >
              <tr>
                {["ID", "Nombre", "Tipo", "Body", "Head", "Hostile", "HP", "EXP"].map(
                  (h) => (
                    <th key={h} style={th}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={td}>
                    <Link href={`/npcs/${item.id}`} style={{ color: "var(--accent)" }}>
                      {item.id}
                    </Link>
                  </td>
                  <td style={td}>{item.name}</td>
                  <td style={td}>{item.npcType}</td>
                  <td style={td}>{item.idBody}</td>
                  <td style={td}>{item.idHead}</td>
                  <td style={td}>{item.hostile}</td>
                  <td style={td}>{item.hp}</td>
                  <td style={td}>{item.exp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function NpcEditor({ id }: { id: number }) {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [baseline, setBaseline] = useState("");
  const [objects, setObjects] = useState<CatalogItem[]>([]);
  const [spells, setSpells] = useState<CatalogItem[]>([]);
  const [hints, setHints] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/npcs/${id}`)
      .then((r) => r.json())
      .then(
        (d: {
          data: Record<string, unknown>;
          catalogs?: { objects: CatalogItem[]; spells: CatalogItem[] };
          hints?: string[];
        }) => {
          setData(d.data);
          setBaseline(JSON.stringify(d.data));
          setObjects(d.catalogs?.objects ?? []);
          setSpells(d.catalogs?.spells ?? []);
          setHints(d.hints ?? []);
        },
      );
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
      const res = await fetch(`/api/npcs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });
      const body = (await res.json()) as { error?: string; hints?: string[] };
      if (!res.ok) throw new Error(body.error ?? "Error");
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
    if (baseline) setData(JSON.parse(baseline) as Record<string, unknown>);
  }

  async function duplicate() {
    const res = await fetch(`/api/npcs/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    const body = (await res.json()) as { id?: number; error?: string };
    if (!res.ok) {
      alert(body.error ?? "Error");
      return;
    }
    router.push(`/npcs/${body.id}`);
  }

  async function remove() {
    if (!confirm(`¿Eliminar NPC ${id}?`)) return;
    const res = await fetch(`/api/npcs/${id}`, { method: "DELETE" });
    if (!res.ok) return;
    router.push("/npcs");
  }

  if (!data) {
    return <p style={{ color: "var(--text-muted)" }}>Cargando NPC {id}…</p>;
  }

  const known = new Set([
    ...SECTIONS.flatMap((s) => s.keys),
    "objs",
    "drop",
    "spells",
  ]);
  const extra = Object.keys(data).filter((k) => !known.has(k)).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/npcs" style={{ color: "var(--text-muted)" }}>
          ← NPCs
        </Link>
        <h1 style={{ margin: 0, flex: 1 }}>
          NPC #{id} — {String(data.name ?? "")}
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

      {message && <p>{message}</p>}
      {hints.length > 0 && (
        <div style={hintBox}>
          <strong>Tras guardar en el juego:</strong>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
            {hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {SECTIONS.map((section) => (
        <section key={section.title} style={sectionStyle}>
          <h2 style={sectionTitle}>{section.title}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {section.keys.map((key) => (
              <SimpleField
                key={key}
                fieldKey={key}
                value={data[key]}
                onChange={(v) => setField(key, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <ItemListEditor
        title="Comercio (objs)"
        entries={(data.objs as Array<{ item: number; cant: number }>) ?? []}
        catalog={objects}
        onChange={(entries) => setField("objs", entries)}
        showChance={false}
      />

      <ItemListEditor
        title="Drops"
        entries={
          (data.drop as Array<{
            item: number;
            cant: number;
            chancePercent?: number;
          }>) ?? []
        }
        catalog={objects}
        onChange={(entries) => setField("drop", entries)}
        showChance
      />

      <SpellListEditor
        entries={(data.spells as Array<{ idSpell: number }>) ?? []}
        catalog={spells}
        onChange={(entries) => setField("spells", entries)}
      />

      {extra.length > 0 && (
        <section style={sectionStyle}>
          <h2 style={sectionTitle}>Otras propiedades</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {extra.map((key) => (
              <SimpleField
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

function SimpleField({
  fieldKey,
  value,
  onChange,
}: {
  fieldKey: string;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (typeof value === "string" || fieldKey === "desc") {
    return (
      <label style={labelStyle}>
        <span>{fieldKey}</span>
        <textarea
          style={{ ...inputStyle, minHeight: fieldKey === "desc" ? 70 : 36 }}
          value={String(value ?? "")}
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

function ItemListEditor({
  title,
  entries,
  catalog,
  onChange,
  showChance,
}: {
  title: string;
  entries: Array<{ item: number; cant: number; chancePercent?: number }>;
  catalog: CatalogItem[];
  onChange: (
    entries: Array<{ item: number; cant: number; chancePercent?: number }>,
  ) => void;
  showChance: boolean;
}) {
  const [filter, setFilter] = useState("");
  const suggestions = useMemo(() => {
    const q = filter.toLowerCase();
    if (!q) return catalog.slice(0, 20);
    return catalog
      .filter(
        (c) =>
          String(c.id).includes(q) || c.name.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [catalog, filter]);

  function nameOf(itemId: number) {
    return catalog.find((c) => c.id === itemId)?.name ?? "?";
  }

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitle}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((entry, index) => (
          <div
            key={`${entry.item}-${index}`}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <code style={{ minWidth: 160 }}>
              [{entry.item}] {nameOf(entry.item)}
            </code>
            <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
              cant
              <input
                type="number"
                value={entry.cant}
                style={{ ...inputStyle, width: 80, marginLeft: 6 }}
                onChange={(e) => {
                  const next = [...entries];
                  next[index] = { ...entry, cant: Number(e.target.value) };
                  onChange(next);
                }}
              />
            </label>
            {showChance && (
              <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
                %
                <input
                  type="number"
                  value={entry.chancePercent ?? 100}
                  style={{ ...inputStyle, width: 80, marginLeft: 6 }}
                  onChange={(e) => {
                    const next = [...entries];
                    next[index] = {
                      ...entry,
                      chancePercent: Number(e.target.value),
                    };
                    onChange(next);
                  }}
                />
              </label>
            )}
            <button
              type="button"
              style={btnGhost}
              onClick={() => onChange(entries.filter((_, i) => i !== index))}
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <input
          placeholder="Buscar objeto para agregar…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 260 }}>
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              style={{ ...btnGhost, textAlign: "left" }}
              onClick={() => {
                onChange([
                  ...entries,
                  showChance
                    ? { item: s.id, cant: 1, chancePercent: 100 }
                    : { item: s.id, cant: 1 },
                ]);
                setFilter("");
              }}
            >
              [{s.id}] {s.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpellListEditor({
  entries,
  catalog,
  onChange,
}: {
  entries: Array<{ idSpell: number }>;
  catalog: CatalogItem[];
  onChange: (entries: Array<{ idSpell: number }>) => void;
}) {
  const [filter, setFilter] = useState("");
  const suggestions = useMemo(() => {
    const q = filter.toLowerCase();
    return catalog
      .filter(
        (c) => !q || String(c.id).includes(q) || c.name.toLowerCase().includes(q),
      )
      .slice(0, 20);
  }, [catalog, filter]);

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitle}>Hechizos</h2>
      {entries.map((entry, index) => (
        <div
          key={`${entry.idSpell}-${index}`}
          style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}
        >
          <code>
            [{entry.idSpell}]{" "}
            {catalog.find((c) => c.id === entry.idSpell)?.name ?? "?"}
          </code>
          <button
            type="button"
            style={btnGhost}
            onClick={() => onChange(entries.filter((_, i) => i !== index))}
          >
            Quitar
          </button>
        </div>
      ))}
      <input
        placeholder="Buscar hechizo…"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ ...inputStyle, marginTop: 8 }}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {suggestions.map((s) => (
          <button
            key={s.id}
            type="button"
            style={btnGhost}
            onClick={() => {
              onChange([...entries, { idSpell: s.id }]);
              setFilter("");
            }}
          >
            [{s.id}] {s.name}
          </button>
        ))}
      </div>
    </section>
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
const td: React.CSSProperties = { padding: "6px 10px" };
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
const hintBox: React.CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: 12,
  fontSize: 13,
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
