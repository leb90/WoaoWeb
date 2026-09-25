"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import "@/app/spells.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getSpellCategory,
  getSpellPresentation,
  type SpellCategory,
  type SpellData,
} from "@/lib/game-data/spells";
import { FxThumb } from "./FxAnimatedPreview";
import { SpellCreateWizard } from "./SpellCreateWizard";
import { SpellTypeBadge } from "./SpellTypeBadge";

type Summary = SpellData & {
  id: number;
  name: string;
  type: number;
  target: number;
  manaRequired: number;
  minSkill: number;
  fxGrh: number;
};

const CHIPS: Array<{ id: SpellCategory; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "damage", label: "Daño" },
  { id: "heal", label: "Curación" },
  { id: "support", label: "Soporte" },
  { id: "control", label: "Control" },
  { id: "summon", label: "Invocación" },
  { id: "other", label: "Otros" },
];

export function SpellList() {
  const router = useRouter();
  const [items, setItems] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [chip, setChip] = useState<SpellCategory>("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(q.trim().toLowerCase()), 180);
    return () => window.clearTimeout(t);
  }, [q]);

  const reload = useCallback(() => {
    setLoading(true);
    fetch("/api/spells")
      .then((r) => r.json())
      .then((d: { items: Summary[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const counts = useMemo(() => {
    const c: Record<SpellCategory, number> = {
      all: items.length,
      damage: 0,
      heal: 0,
      support: 0,
      control: 0,
      summon: 0,
      other: 0,
    };
    for (const i of items) {
      c[getSpellCategory(i)] += 1;
    }
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (chip !== "all") {
      list = list.filter((i) => getSpellCategory(i) === chip);
    }
    if (qDebounced) {
      list = list.filter(
        (i) =>
          String(i.id).includes(qDebounced) ||
          i.name.toLowerCase().includes(qDebounced) ||
          String(i.desc ?? "")
            .toLowerCase()
            .includes(qDebounced) ||
          String(i.fxGrh).includes(qDebounced),
      );
    }
    return [...list].sort((a, b) => a.id - b.id);
  }, [items, chip, qDebounced]);

  async function duplicate(item: Summary) {
    const res = await fetch(`/api/spells?id=${item.id}`);
    const body = (await res.json()) as { data?: SpellData };
    if (!body.data) return;
    const draft = {
      ...structuredClone(body.data),
      name: `${item.name} - copia`,
    };
    sessionStorage.setItem(
      "woao.dev.spellDraft",
      JSON.stringify({ mode: "create", data: draft }),
    );
    router.push("/spells/new");
  }

  async function remove(item: Summary) {
    if (!confirm(`¿Eliminar hechizo #${item.id} — ${item.name}?`)) return;
    const res = await fetch(`/api/spells?id=${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      const b = (await res.json()) as { error?: string };
      setMessage(b.error ?? "Error");
      return;
    }
    setMessage(`Hechizo ${item.id} eliminado`);
    reload();
  }

  return (
    <div className="obj-page">
      <div className="obj-header">
        <div className="obj-header-title">
          <div className="obj-header-icon" aria-hidden>
            ✦
          </div>
          <div>
            <h1>Hechizos</h1>
            <p>
              Gestiona todos los hechizos del juego. Crea, edita y configura sus
              propiedades.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="obj-btn primary"
          onClick={() => setWizardOpen(true)}
        >
          + Nuevo hechizo
        </button>
      </div>

      <div className="obj-search-row">
        <div className="obj-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ID, nombre o efecto..."
          />
        </div>
      </div>

      <div className="obj-chips">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`obj-chip ${chip === c.id ? "active" : ""}`}
            onClick={() => setChip(c.id)}
          >
            {c.label} ({counts[c.id]})
          </button>
        ))}
        <span className="obj-count">{filtered.length} hechizos</span>
      </div>

      {message && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{message}</div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando…</p>
      ) : (
        <div className="obj-table-wrap">
          <table className="obj-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Preview</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Mana</th>
                <th>Skill</th>
                <th>Objetivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const p = getSpellPresentation(item);
                return (
                  <tr key={item.id}>
                    <td>
                      <Link className="obj-id" href={`/spells/${item.id}`}>
                        {item.id}
                      </Link>
                    </td>
                    <td>
                      <FxThumb fxId={item.fxGrh} size={40} />
                    </td>
                    <td>
                      <div>{item.name}</div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 2,
                        }}
                      >
                        {p.summary}
                      </div>
                    </td>
                    <td>
                      <SpellTypeBadge data={item} />
                    </td>
                    <td>{item.manaRequired}</td>
                    <td>{item.minSkill}</td>
                    <td>{p.targetLabel}</td>
                    <td>
                      <div className="obj-actions">
                        <Link
                          href={`/spells/${item.id}`}
                          className="obj-btn icon"
                          title="Editar"
                        >
                          ✎
                        </Link>
                        <button
                          type="button"
                          className="obj-btn icon"
                          title="Duplicar"
                          onClick={() => void duplicate(item)}
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          className="obj-btn icon"
                          title="Eliminar"
                          onClick={() => void remove(item)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {wizardOpen && (
        <SpellCreateWizard onClose={() => setWizardOpen(false)} />
      )}
    </div>
  );
}
