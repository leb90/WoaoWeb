"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getNpcFilterGroup,
  getNpcPresentation,
  getNpcTypeMeta,
  type FilterGroup,
  type NpcData,
} from "@/lib/game-data/npcs";
import { NpcCreateWizard } from "./NpcCreateWizard";
import { NpcSpritePreview } from "./NpcSpritePreview";
import { NpcTypeBadge } from "./NpcTypeBadge";

type Summary = {
  id: number;
  name: string;
  npcType: number;
  idBody: number;
  idHead: number;
  hostile: number;
  attackable: number;
  comercia: number;
  hp: number;
  maxHp: number;
  exp: number;
  gold: number;
  movement: number;
  minHit: number;
  maxHit: number;
  def: number;
  objsCount: number;
  dropCount: number;
  spellsCount: number;
};

type SortKey = "id" | "name" | "npcType" | "hp" | "exp" | "gold";

type RefItem = {
  kind: string;
  label: string;
  detail?: string;
  href?: string;
};

const CHIPS: Array<{ id: FilterGroup; label: string; icon: string }> = [
  { id: "all", label: "Todos", icon: "☰" },
  { id: "comunes", label: "Personajes", icon: "👤" },
  { id: "comerciantes", label: "Comerciantes", icon: "⚖" },
  { id: "monstruos", label: "Monstruos", icon: "☠" },
  { id: "ciudadanos", label: "Ciudadanos", icon: "🏛" },
  { id: "guardias", label: "Guardias", icon: "🛡" },
  { id: "monturas", label: "Monturas", icon: "🦄" },
  { id: "especiales", label: "Especiales", icon: "★" },
];

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function NpcList() {
  const router = useRouter();
  const [items, setItems] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [typeSelect, setTypeSelect] = useState("");
  const [chip, setChip] = useState<FilterGroup>("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Summary | null>(null);
  const [deleteRefs, setDeleteRefs] = useState<RefItem[]>([]);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(q.trim().toLowerCase()), 180);
    return () => window.clearTimeout(t);
  }, [q]);

  const reload = useCallback(() => {
    setLoading(true);
    fetch("/api/npcs")
      .then((r) => r.json())
      .then((d: { items: Summary[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const typeOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.npcType));
    return [...set]
      .sort((a, b) => a - b)
      .map((id) => ({ id, label: getNpcTypeMeta(id).label }));
  }, [items]);

  const chipCounts = useMemo(() => {
    const counts: Record<FilterGroup, number> = {
      all: items.length,
      comunes: 0,
      comerciantes: 0,
      monstruos: 0,
      ciudadanos: 0,
      guardias: 0,
      monturas: 0,
      especiales: 0,
    };
    for (const item of items) {
      const g = getNpcFilterGroup(item as unknown as NpcData);
      counts[g] += 1;
    }
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (typeSelect !== "") {
      list = list.filter((i) => String(i.npcType) === typeSelect);
    }
    if (chip !== "all") {
      list = list.filter(
        (i) => getNpcFilterGroup(i as unknown as NpcData) === chip,
      );
    }
    if (qDebounced) {
      list = list.filter((i) => {
        const typeLabel = getNpcTypeMeta(i.npcType).label.toLowerCase();
        return (
          String(i.id).includes(qDebounced) ||
          i.name.toLowerCase().includes(qDebounced) ||
          typeLabel.includes(qDebounced) ||
          String(i.idBody).includes(qDebounced) ||
          String(i.idHead).includes(qDebounced)
        );
      });
    }
    const dir = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * dir;
      }
      return (Number(av) - Number(bv)) * dir;
    });
  }, [items, typeSelect, chip, qDebounced, sortKey, sortDir]);

  useEffect(() => {
    setPage(1);
  }, [qDebounced, chip, typeSelect, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  async function openDelete(item: Summary) {
    setDeleteTarget(item);
    setDeleteRefs([]);
    const res = await fetch(`/api/npcs/${item.id}/references`);
    const body = (await res.json()) as { references?: RefItem[] };
    setDeleteRefs(body.references ?? []);
  }

  async function confirmDelete(force: boolean) {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/npcs/${deleteTarget.id}${force ? "?force=1" : ""}`,
        { method: "DELETE" },
      );
      const body = (await res.json()) as {
        error?: string;
        references?: RefItem[];
      };
      if (res.status === 409) {
        setDeleteRefs(body.references ?? []);
        return;
      }
      if (!res.ok) throw new Error(body.error ?? "Error");
      setDeleteTarget(null);
      setMessage(`NPC ${deleteTarget.id} eliminado`);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function duplicate(item: Summary) {
    const res = await fetch(`/api/npcs/${item.id}`);
    const body = (await res.json()) as { data?: NpcData };
    if (!body.data) return;
    const draft = {
      ...structuredClone(body.data),
      name: `${item.name} - copia`,
    };
    sessionStorage.setItem(
      "woao.dev.npcDraft",
      JSON.stringify({ mode: "create", data: draft }),
    );
    router.push("/npcs/new");
  }

  return (
    <div className="obj-page npc-page">
      <div className="obj-header">
        <div className="obj-header-title">
          <div className="obj-header-icon" aria-hidden>
            👤
          </div>
          <div>
            <h1>NPCs</h1>
            <p>
              Gestiona todos los NPCs del juego. Crea, edita y configura su
              comportamiento.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="obj-btn primary"
          onClick={() => setWizardOpen(true)}
        >
          + Nuevo NPC
        </button>
      </div>

      <div className="obj-search-row">
        <div className="obj-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ID, nombre o tipo..."
          />
        </div>
        <select
          className="obj-select"
          value={typeSelect}
          onChange={(e) => setTypeSelect(e.target.value)}
          aria-label="Tipo"
        >
          <option value="">Todos los tipos</option>
          {typeOptions.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} ({t.id})
            </option>
          ))}
        </select>
      </div>

      <div className="obj-chips">
        {CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`obj-chip ${chip === c.id ? "active" : ""}`}
            onClick={() => setChip(c.id)}
          >
            <span aria-hidden>{c.icon}</span>
            {c.label} ({chipCounts[c.id]})
          </button>
        ))}
        <span className="obj-count">
          {filtered.length} NPC{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {message && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{message}</div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Cargando…</p>
      ) : (
        <>
          <div className="obj-table-wrap">
            <table className="obj-table">
              <thead>
                <tr>
                  <th style={{ cursor: "default" }}>ID</th>
                  <th style={{ cursor: "default" }}>Preview</th>
                  <th onClick={() => toggleSort("name")}>Nombre</th>
                  <th onClick={() => toggleSort("npcType")}>Tipo</th>
                  <th style={{ cursor: "default" }}>Body</th>
                  <th style={{ cursor: "default" }}>Head</th>
                  <th onClick={() => toggleSort("hp")}>HP</th>
                  <th onClick={() => toggleSort("exp")}>EXP</th>
                  <th onClick={() => toggleSort("gold")}>Gold</th>
                  <th style={{ cursor: "default" }}>Hostil</th>
                  <th style={{ cursor: "default" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const summary = getNpcPresentation(
                    item as unknown as NpcData,
                  ).summary;
                  return (
                    <tr key={item.id}>
                      <td>
                        <Link className="obj-id" href={`/npcs/${item.id}`}>
                          {item.id}
                        </Link>
                      </td>
                      <td>
                        <NpcSpritePreview
                          idBody={item.idBody}
                          idHead={item.idHead}
                          size={48}
                        />
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
                          {summary}
                        </div>
                      </td>
                      <td>
                        <NpcTypeBadge npcType={item.npcType} />
                      </td>
                      <td>{item.idBody}</td>
                      <td>{item.idHead || "—"}</td>
                      <td>{item.hp}</td>
                      <td>{item.exp}</td>
                      <td>{item.gold}</td>
                      <td>
                        {item.hostile === 1 ? (
                          <span className="npc-hostil-yes" title="Hostil">
                            ✓
                          </span>
                        ) : (
                          <span className="npc-hostil-no" title="Pacífico">
                            ✕
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="obj-actions">
                          <Link
                            href={`/npcs/${item.id}`}
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
                            onClick={() => void openDelete(item)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {pageItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      style={{ padding: 24, color: "var(--text-muted)" }}
                    >
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button
                type="button"
                className="obj-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ←
              </button>
              {Array.from({ length: Math.min(pageCount, 7) }, (_, i) => {
                let n = i + 1;
                if (pageCount > 7) {
                  const start = Math.min(
                    Math.max(1, page - 3),
                    pageCount - 6,
                  );
                  n = start + i;
                }
                return (
                  <button
                    key={n}
                    type="button"
                    className={`obj-btn ${page === n ? "primary" : ""}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                );
              })}
              <button
                type="button"
                className="obj-btn"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                →
              </button>
              <span style={{ alignSelf: "center", marginLeft: 4 }}>
                Página {page} / {pageCount}
              </span>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              Por página
              <select
                className="obj-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      )}

      {wizardOpen && (
        <NpcCreateWizard onClose={() => setWizardOpen(false)} />
      )}

      {deleteTarget && (
        <div
          className="obj-modal-backdrop"
          onClick={() => setDeleteTarget(null)}
        >
          <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar NPC</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              ¿Eliminar <strong>{deleteTarget.name}</strong> (ID{" "}
              {deleteTarget.id})?
            </p>
            {deleteRefs.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  background: "rgba(227,93,106,0.12)",
                  border: "1px solid var(--obj-danger)",
                  fontSize: 13,
                }}
              >
                <strong>
                  Este NPC se utiliza en {deleteRefs.length} lugar(es):
                </strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {deleteRefs.slice(0, 40).map((r, i) => (
                    <li key={i}>
                      {r.href ? (
                        <Link href={r.href}>{r.label}</Link>
                      ) : (
                        r.label
                      )}
                      {r.detail ? ` — ${r.detail}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="obj-btn"
                onClick={() => setDeleteTarget(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="obj-btn danger"
                disabled={deleteBusy}
                onClick={() => void confirmDelete(deleteRefs.length > 0)}
              >
                {deleteRefs.length > 0
                  ? "Eliminar de todos modos"
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
