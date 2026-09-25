"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import "@/app/quests.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { QuestListItem } from "@/lib/game-data/quests";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";

type FilterRep = "all" | "repeatable" | "once";
type FilterGiver = "all" | "with" | "without";

export function QuestList() {
  const router = useRouter();
  const [items, setItems] = useState<QuestListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [rep, setRep] = useState<FilterRep>("all");
  const [giver, setGiver] = useState<FilterGiver>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestListItem | null>(null);
  const [dupTarget, setDupTarget] = useState<QuestListItem | null>(null);
  const [dupMode, setDupMode] = useState<"none" | "existing" | "create">("none");
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  async function reload() {
    setLoading(true);
    try {
      const res = await fetch("/api/quests");
      const data = (await res.json()) as { items: QuestListItem[] };
      setItems(data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, []);

  const counts = useMemo(
    () => ({
      all: items.length,
      repeatable: items.filter((i) => i.repeatable).length,
      once: items.filter((i) => !i.repeatable).length,
      withGiver: items.filter((i) => i.giver).length,
      withoutGiver: items.filter((i) => !i.giver).length,
    }),
    [items],
  );

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((item) => {
      if (rep === "repeatable" && !item.repeatable) return false;
      if (rep === "once" && item.repeatable) return false;
      if (giver === "with" && !item.giver) return false;
      if (giver === "without" && item.giver) return false;
      if (!qq) return true;
      const hay = [
        String(item.id),
        item.name,
        item.desc,
        item.objectivesLabel,
        item.rewardsLabel,
        item.giver?.name ?? "",
        ...item.givers.map((g) => g.name),
        ...item.requiredNpcs.map((r) => String(r.index)),
        ...item.requiredObjs.map((r) => String(r.index)),
        ...item.rewardObjs.map((r) => String(r.index)),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(qq);
    });
  }, [items, q, rep, giver]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [q, rep, giver, pageSize]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/quests/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Error al eliminar");
        return;
      }
      setMessage(
        data.unlinkedNpcIds?.length
          ? `Quest eliminada. NPCs desvinculados: ${data.unlinkedNpcIds.join(", ")}`
          : "Quest eliminada.",
      );
      setDeleteTarget(null);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function confirmDuplicate() {
    if (!dupTarget) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/quests/${dupTarget.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "duplicate",
          assignMode: dupMode,
          giverNpcId:
            dupMode === "existing" ? (dupTarget.giver?.npcId ?? null) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? data.message ?? "Error al duplicar");
        return;
      }
      setDupTarget(null);
      router.push(`/quests/${data.id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="obj-page quest-page">
      <div className="obj-header">
        <div className="obj-header-title">
          <div className="obj-header-icon" aria-hidden>
            ⌬
          </div>
          <div>
            <h1>Quests</h1>
            <p>
              Gestiona todas las misiones del juego. Crea, edita y configura sus
              objetivos y recompensas.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="obj-btn primary"
          onClick={() => router.push("/quests/new")}
        >
          + Nueva quest
        </button>
      </div>

      <div className="obj-chips">
        {(
          [
            ["all", `Todas (${counts.all})`],
            ["repeatable", `Repetibles (${counts.repeatable})`],
            ["once", `No repetibles (${counts.once})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`obj-chip ${rep === id ? "active" : ""}`}
            onClick={() => setRep(id)}
          >
            {label}
          </button>
        ))}
        <span className="obj-count">
          {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="obj-search-row">
        <div className="obj-search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por ID, nombre, NPC u objeto..."
          />
        </div>
        <select
          className="obj-select"
          value={giver}
          onChange={(e) => setGiver(e.target.value as FilterGiver)}
          aria-label="NPC entregador"
        >
          <option value="all">NPC entregador: Todos</option>
          <option value="with">Con NPC asignado ({counts.withGiver})</option>
          <option value="without">
            Sin NPC asignado ({counts.withoutGiver})
          </option>
        </select>
      </div>

      {message && (
        <div className="quest-banner" role="status">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)}>
            ×
          </button>
        </div>
      )}

      {loading ? (
        <p className="muted">Cargando quests…</p>
      ) : (
        <>
          <div className="obj-table-wrap">
            <table className="obj-table quest-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Objetivos</th>
                  <th>Repetible</th>
                  <th>NPC que entrega</th>
                  <th>Recompensas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link className="obj-id" href={`/quests/${item.id}`}>
                        {item.id}
                      </Link>
                    </td>
                    <td>
                      <Link className="quest-name-link" href={`/quests/${item.id}`}>
                        <span className="quest-scroll-ico" aria-hidden>
                          ⌬
                        </span>
                        {item.name}
                      </Link>
                    </td>
                    <td>
                      <span className="quest-obj-cell" title={item.objectivesLabel}>
                        {item.objectivesLabel}
                      </span>
                    </td>
                    <td>
                      {item.repeatable ? (
                        <span className="quest-yes">✓ Sí</span>
                      ) : (
                        <span className="quest-no">✕ No</span>
                      )}
                    </td>
                    <td>
                      {item.giver ? (
                        <div className="quest-giver-cell">
                          <NpcSpritePreview
                            idBody={item.giver.idBody}
                            idHead={item.giver.idHead}
                            size={28}
                          />
                          <div>
                            <div>{item.giver.name}</div>
                            {item.givers.length > 1 && (
                              <div className="muted">
                                +{item.givers.length - 1} más
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="muted">Sin asignar</span>
                      )}
                    </td>
                    <td>
                      <span className="quest-reward-cell" title={item.rewardsLabel}>
                        {item.rewardsLabel}
                      </span>
                    </td>
                    <td>
                      <div className="quest-row-actions">
                        <Link
                          className="obj-icon-btn"
                          href={`/quests/${item.id}`}
                          title="Editar"
                        >
                          ✎
                        </Link>
                        <button
                          type="button"
                          className="obj-icon-btn"
                          title="Duplicar"
                          onClick={() => {
                            setDupTarget(item);
                            setDupMode("none");
                          }}
                        >
                          ⧉
                        </button>
                        <button
                          type="button"
                          className="obj-icon-btn danger"
                          title="Eliminar"
                          onClick={() => setDeleteTarget(item)}
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!pageItems.length && (
                  <tr>
                    <td colSpan={7} className="muted">
                      Sin resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="quest-pager">
            <span>
              Mostrando{" "}
              {filtered.length
                ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`
                : "0"}{" "}
              de {filtered.length} quests
            </span>
            <div className="quest-pager-controls">
              <button
                type="button"
                className="obj-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              <span>
                {page} / {pageCount}
              </span>
              <button
                type="button"
                className="obj-btn"
                disabled={page >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                ›
              </button>
              <select
                className="obj-select"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label="Por página"
              >
                {[14, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / pág
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      {deleteTarget && (
        <div className="obj-modal-backdrop">
          <div className="obj-modal">
            <h3>Eliminar quest #{deleteTarget.id}</h3>
            <p>
              <strong>{deleteTarget.name}</strong>
            </p>
            {deleteTarget.givers.length > 0 ? (
              <p>
                Esta quest es entregada por:{" "}
                {deleteTarget.givers
                  .map((g) => `NPC #${g.npcId} — ${g.name}`)
                  .join(", ")}
                . Se desvincularán (no se borran los NPCs).
              </p>
            ) : (
              <p>No hay NPCs asociados.</p>
            )}
            <div className="obj-modal-actions">
              <button type="button" className="obj-btn" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="obj-btn danger"
                disabled={busy}
                onClick={() => void confirmDelete()}
              >
                Eliminar quest y desvincular NPC
              </button>
            </div>
          </div>
        </div>
      )}

      {dupTarget && (
        <div className="obj-modal-backdrop">
          <div className="obj-modal">
            <h3>Duplicar quest #{dupTarget.id}</h3>
            <p>NPC que entrega en la copia:</p>
            <label className="quest-radio">
              <input
                type="radio"
                checked={dupMode === "none"}
                onChange={() => setDupMode("none")}
              />
              Sin asignar
            </label>
            <label className="quest-radio">
              <input
                type="radio"
                checked={dupMode === "existing"}
                disabled={!dupTarget.giver}
                onChange={() => setDupMode("existing")}
              />
              Usar mismo NPC
              {dupTarget.giver
                ? ` (#${dupTarget.giver.npcId})`
                : " (no hay giver)"}
            </label>
            <p className="muted">
              Para crear un NPC nuevo, duplicá sin asignar y usá el editor.
            </p>
            <div className="obj-modal-actions">
              <button type="button" className="obj-btn" onClick={() => setDupTarget(null)}>
                Cancelar
              </button>
              <button
                type="button"
                className="obj-btn primary"
                disabled={busy}
                onClick={() => void confirmDuplicate()}
              >
                Duplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
