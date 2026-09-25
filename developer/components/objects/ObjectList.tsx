"use client";

import "@/app/objects.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LazyGrh } from "./LazyGrh";
import { ObjectTypeBadge } from "./ObjectTypeBadge";
import { ObjectCreateWizard } from "./ObjectCreateWizard";
import {
  getObjectPresentation,
  getObjectTypeMeta,
  type ObjData,
} from "@/lib/game-data/objects";

type Summary = ObjData & {
  id: number;
  name: string;
  objType: number;
  grhIndex: number;
  valor: number;
};

type SortKey = "id" | "name" | "objType" | "grhIndex" | "valor";
type FilterGroup =
  | "all"
  | "armas"
  | "armaduras"
  | "pociones"
  | "comida"
  | "puertas"
  | "contenedores"
  | "especiales";

const CHIPS: Array<{ id: FilterGroup; label: string; icon: string }> = [
  { id: "all", label: "Todos", icon: "☰" },
  { id: "armas", label: "Armas", icon: "⚔" },
  { id: "armaduras", label: "Armaduras", icon: "🛡" },
  { id: "pociones", label: "Pociones", icon: "⚗" },
  { id: "comida", label: "Comida", icon: "🍎" },
  { id: "puertas", label: "Puertas", icon: "🚪" },
  { id: "contenedores", label: "Contenedores", icon: "▣" },
  { id: "especiales", label: "Especiales", icon: "★" },
];

type RefItem = { kind: string; label: string; detail?: string };

export function ObjectList() {
  const router = useRouter();
  const [items, setItems] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [typeSelect, setTypeSelect] = useState<string>("");
  const [chip, setChip] = useState<FilterGroup>("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
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
    fetch("/api/objects")
      .then((r) => r.json())
      .then((d: { items: Summary[] }) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const typeOptions = useMemo(() => {
    const set = new Set(items.map((i) => i.objType));
    return [...set]
      .sort((a, b) => a - b)
      .map((id) => ({ id, label: getObjectTypeMeta(id).label }));
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (typeSelect !== "") {
      list = list.filter((i) => String(i.objType) === typeSelect);
    }
    if (chip !== "all") {
      list = list.filter(
        (i) => getObjectTypeMeta(i.objType).filterGroup === chip,
      );
    }
    if (qDebounced) {
      list = list.filter(
        (i) =>
          String(i.id).includes(qDebounced) ||
          i.name.toLowerCase().includes(qDebounced) ||
          String(i.grhIndex).includes(qDebounced),
      );
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
    const res = await fetch(`/api/objects/${item.id}/references`);
    const body = (await res.json()) as { references?: RefItem[] };
    setDeleteRefs(body.references ?? []);
  }

  async function confirmDelete(force: boolean) {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/objects/${deleteTarget.id}${force ? "?force=1" : ""}`,
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
      setMessage(`Objeto ${deleteTarget.id} eliminado`);
      reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setDeleteBusy(false);
    }
  }

  async function duplicate(item: Summary) {
    const res = await fetch(`/api/objects/${item.id}`);
    const body = (await res.json()) as { data?: ObjData };
    if (!body.data) return;
    const draft = {
      ...structuredClone(body.data),
      name: `${item.name} - copia`,
    };
    sessionStorage.setItem(
      "woao.dev.objectDraft",
      JSON.stringify({ mode: "create", data: draft }),
    );
    router.push("/objects/new");
  }

  return (
    <div className="obj-page">
      <div className="obj-header">
        <div className="obj-header-title">
          <div className="obj-header-icon" aria-hidden>
            ▣
          </div>
          <div>
            <h1>Objetos</h1>
            <p>
              Gestiona todos los objetos del juego. Crea, edita y configura sus
              propiedades.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="obj-btn primary"
          onClick={() => setWizardOpen(true)}
        >
          + Nuevo objeto
        </button>
      </div>

      <div className="obj-search-row">
        <div className="obj-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, ID o GRH..."
          />
        </div>
        <select
          className="obj-select"
          value={typeSelect}
          onChange={(e) => setTypeSelect(e.target.value)}
          aria-label="Tipo"
        >
          <option value="">Tipo: Todos los tipos</option>
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
            {c.label}
          </button>
        ))}
        <span className="obj-count">
          {filtered.length} objeto{filtered.length === 1 ? "" : "s"} encontrado
          {filtered.length === 1 ? "" : "s"}
        </span>
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
                <th style={{ cursor: "default" }}>Preview</th>
                <th onClick={() => toggleSort("id")}>ID</th>
                <th onClick={() => toggleSort("name")}>Nombre</th>
                <th onClick={() => toggleSort("objType")}>Tipo</th>
                <th onClick={() => toggleSort("grhIndex")}>GRH</th>
                <th onClick={() => toggleSort("valor")}>Valor</th>
                <th style={{ cursor: "default" }}>Resumen</th>
                <th style={{ cursor: "default" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const summary = getObjectPresentation(item).summary;
                return (
                  <tr key={item.id}>
                    <td>
                      <LazyGrh grhIndex={item.grhIndex} size={40} />
                    </td>
                    <td>
                      <Link className="obj-id" href={`/objects/${item.id}`}>
                        {item.id}
                      </Link>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <ObjectTypeBadge objType={item.objType} />
                    </td>
                    <td>{item.grhIndex}</td>
                    <td>{item.valor}</td>
                    <td style={{ color: "var(--text-muted)" }}>{summary}</td>
                    <td>
                      <div className="obj-actions">
                        <Link
                          href={`/objects/${item.id}`}
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
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    style={{ padding: 24, color: "var(--text-muted)" }}
                  >
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {wizardOpen && (
        <ObjectCreateWizard onClose={() => setWizardOpen(false)} />
      )}

      {deleteTarget && (
        <div className="obj-modal-backdrop" onClick={() => setDeleteTarget(null)}>
          <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar objeto</h2>
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
                  Este objeto está siendo utilizado en {deleteRefs.length}{" "}
                  lugar(es):
                </strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {deleteRefs.slice(0, 30).map((r, i) => (
                    <li key={i}>
                      {r.label}
                      {r.detail ? ` — ${r.detail}` : ""}
                    </li>
                  ))}
                </ul>
                {deleteRefs.length > 30 && (
                  <div style={{ marginTop: 6, color: "var(--text-muted)" }}>
                    …y {deleteRefs.length - 30} más
                  </div>
                )}
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
                onClick={() =>
                  void confirmDelete(deleteRefs.length > 0)
                }
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
