"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import "@/app/quests.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ObjectPicker, type PickerObject } from "@/components/pickers/ObjectPicker";
import { NpcPicker, type PickerNpc } from "@/components/pickers/NpcPicker";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";
import { LazyGrh } from "@/components/objects/LazyGrh";
import {
  emptyQuest,
  formatCompactNumber,
  type QuestData,
  type QuestGiverInfo,
  type QuestMapLocation,
} from "@/lib/game-data/quests";

type TabId =
  | "general"
  | "npcs"
  | "objs"
  | "rewards"
  | "giver"
  | "advanced";

type Meta = {
  nextId: number;
  npcTypes: Array<{ id: number; label: string }>;
  npcs: PickerNpc[];
  objects: PickerObject[];
};

type NpcCreateForm = {
  name: string;
  npcType: number;
  idBody: number;
  idHead: number;
  desc: string;
};

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "general", label: "General" },
  { id: "npcs", label: "Requisitos NPCs" },
  { id: "objs", label: "Requisitos Objetos" },
  { id: "rewards", label: "Recompensas" },
  { id: "giver", label: "NPC que entrega" },
  { id: "advanced", label: "Avanzado" },
];

function cloneQuest(q: QuestData): QuestData {
  return structuredClone(q);
}

export function QuestEditor({
  mode,
  questId,
}: {
  mode: "create" | "edit";
  questId?: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnHint = searchParams.get("from");

  const [meta, setMeta] = useState<Meta | null>(null);
  const [quest, setQuest] = useState<QuestData | null>(null);
  const [baseline, setBaseline] = useState<string>("");
  const [givers, setGivers] = useState<QuestGiverInfo[]>([]);
  const [locations, setLocations] = useState<QuestMapLocation[]>([]);
  const [tab, setTab] = useState<TabId>("general");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingGiverId, setPendingGiverId] = useState<number | null | undefined>(
    undefined,
  );
  const [createNpc, setCreateNpc] = useState<NpcCreateForm | null>(null);
  const [giverMode, setGiverMode] = useState<"keep" | "existing" | "create" | "none">(
    "keep",
  );
  const [conflict, setConflict] = useState<{
    questId: number;
    message: string;
  } | null>(null);
  const [showNpcPicker, setShowNpcPicker] = useState(false);
  const [showObjPicker, setShowObjPicker] = useState<"req" | "reward" | null>(
    null,
  );

  const dirty = useMemo(() => {
    if (!quest) return false;
    return (
      JSON.stringify(quest) !== baseline ||
      giverMode !== "keep" ||
      createNpc != null
    );
  }, [quest, baseline, giverMode, createNpc]);

  const typeLabel = useCallback(
    (t: number) => meta?.npcTypes.find((x) => x.id === t)?.label ?? `tipo ${t}`,
    [meta],
  );

  const npcName = useCallback(
    (id: number) => meta?.npcs.find((n) => n.id === id)?.name ?? `NPC ${id}`,
    [meta],
  );

  const objMeta = useCallback(
    (id: number) => meta?.objects.find((o) => o.id === id),
    [meta],
  );

  useEffect(() => {
    void (async () => {
      const metaRes = await fetch("/api/quests/meta");
      const metaData = (await metaRes.json()) as Meta;
      setMeta(metaData);

      if (mode === "create") {
        const id = metaData.nextId;
        const q = emptyQuest(id);
        setQuest(q);
        setBaseline(JSON.stringify(q));
        setGiverMode("none");
        return;
      }

      if (!questId) return;
      const res = await fetch(`/api/quests/${questId}`);
      if (!res.ok) {
        setMessage("Quest no encontrada");
        return;
      }
      const data = (await res.json()) as {
        quest: QuestData;
        givers: QuestGiverInfo[];
        locations: QuestMapLocation[];
      };
      setQuest(data.quest);
      setBaseline(JSON.stringify(data.quest));
      setGivers(data.givers ?? []);
      setLocations(data.locations ?? []);
      setGiverMode("keep");
    })();
  }, [mode, questId]);

  function patch(partial: Partial<QuestData>) {
    setQuest((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  function addNpcReq(npc: PickerNpc) {
    if (!quest) return;
    const existing = quest.requiredNpcs.find((r) => r.index === npc.id);
    if (existing) {
      const amount = window.prompt(
        `Este NPC ya está. Nueva cantidad (actual ${existing.amount}):`,
        String(existing.amount),
      );
      if (!amount) return;
      const n = Number(amount);
      if (!Number.isInteger(n) || n <= 0) {
        setMessage("Cantidad inválida");
        return;
      }
      patch({
        requiredNpcs: quest.requiredNpcs.map((r) =>
          r.index === npc.id ? { ...r, amount: n } : r,
        ),
      });
      return;
    }
    patch({
      requiredNpcs: [...quest.requiredNpcs, { index: npc.id, amount: 1 }],
    });
  }

  function addObjReq(obj: PickerObject) {
    if (!quest) return;
    const existing = quest.requiredObjs.find((r) => r.index === obj.id);
    if (existing) {
      const amount = window.prompt(
        `Objeto ya requerido. Nueva cantidad (actual ${existing.amount}):`,
        String(existing.amount),
      );
      if (!amount) return;
      const n = Number(amount);
      if (!Number.isInteger(n) || n <= 0) return;
      patch({
        requiredObjs: quest.requiredObjs.map((r) =>
          r.index === obj.id ? { ...r, amount: n } : r,
        ),
      });
      return;
    }
    patch({
      requiredObjs: [...quest.requiredObjs, { index: obj.id, amount: 1 }],
    });
  }

  function addRewardObj(obj: PickerObject) {
    if (!quest) return;
    const existing = quest.rewardObjs.find((r) => r.index === obj.id);
    if (existing) {
      const amount = window.prompt(
        `Ya está en recompensas. Nueva cantidad (actual ${existing.amount}):`,
        String(existing.amount),
      );
      if (!amount) return;
      const n = Number(amount);
      if (!Number.isInteger(n) || n <= 0) return;
      patch({
        rewardObjs: quest.rewardObjs.map((r) =>
          r.index === obj.id ? { ...r, amount: n } : r,
        ),
      });
      return;
    }
    patch({
      rewardObjs: [...quest.rewardObjs, { index: obj.id, amount: 1 }],
    });
  }

  async function save(replaceNpcQuest = false) {
    if (!quest) return;
    setBusy(true);
    setMessage(null);
    setConflict(null);
    try {
      const payload: Record<string, unknown> = {
        quest: cloneQuest(quest),
        replaceNpcQuest,
      };

      if (giverMode === "create" && createNpc) {
        payload.createNpc = createNpc;
      } else if (giverMode === "existing" && pendingGiverId) {
        payload.giverNpcId = pendingGiverId;
      } else if (giverMode === "none" && mode === "edit") {
        payload.unlinkGivers = true;
        payload.giverNpcId = null;
      } else if (
        giverMode === "existing" &&
        mode === "create" &&
        pendingGiverId
      ) {
        payload.giverNpcId = pendingGiverId;
      }

      const url = mode === "create" ? "/api/quests" : `/api/quests/${quest.id}`;
      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.status === 409 && data.error === "npc_has_quest") {
        setConflict({
          questId: data.questId,
          message: data.message,
        });
        return;
      }
      if (!res.ok) {
        setMessage(data.error ?? data.message ?? "Error al guardar");
        return;
      }

      const hints = (data.hints as string[] | undefined)?.join(" · ");
      if (mode === "create") {
        router.replace(`/quests/${data.id}`);
        setMessage(hints ? `Guardado. ${hints}` : "Guardado.");
        return;
      }

      const refreshed = await fetch(`/api/quests/${quest.id}`).then((r) =>
        r.json(),
      );
      setQuest(refreshed.quest);
      setBaseline(JSON.stringify(refreshed.quest));
      setGivers(refreshed.givers ?? []);
      setLocations(refreshed.locations ?? []);
      setGiverMode("keep");
      setCreateNpc(null);
      setPendingGiverId(undefined);
      setMessage(hints ? `Guardado. ${hints}` : "Guardado.");
    } finally {
      setBusy(false);
    }
  }

  async function duplicate() {
    if (!quest || mode !== "edit") return;
    const res = await fetch(`/api/quests/${quest.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate", assignMode: "none" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Error al duplicar");
      return;
    }
    router.push(`/quests/${data.id}`);
  }

  async function remove() {
    if (!quest || mode !== "edit") return;
    const giversLabel = givers.length
      ? `\n\nEntregada por: ${givers.map((g) => `#${g.npcId} ${g.name}`).join(", ")}\nSe desvincularán los NPCs (no se borran).`
      : "";
    if (!window.confirm(`¿Eliminar quest #${quest.id}?${giversLabel}`)) return;
    const res = await fetch(`/api/quests/${quest.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Error al eliminar");
      return;
    }
    router.push("/quests");
  }

  function discard() {
    if (!quest) return;
    if (mode === "create") {
      router.push("/quests");
      return;
    }
    setQuest(JSON.parse(baseline) as QuestData);
    setGiverMode("keep");
    setCreateNpc(null);
    setPendingGiverId(undefined);
  }

  if (!quest || !meta) {
    return <p className="muted">Cargando…</p>;
  }

  const primaryGiver = givers[0] ?? null;
  const jsonPreview = {
    id: quest.id,
    name: quest.name,
    desc: quest.desc,
    requiredLevel: quest.requiredLevel,
    repeatable: Boolean(quest.repeatable),
    requiredNpcs: quest.requiredNpcs,
    requiredObjs: quest.requiredObjs,
    rewardGold: quest.rewardGold,
    rewardExp: quest.rewardExp,
    rewardPoints: quest.rewardPoints,
    rewardObjs: quest.rewardObjs,
  };

  const giverPanel = (
    <>
      {primaryGiver && giverMode === "keep" && (
        <div className="quest-giver-card">
          <NpcSpritePreview
            idBody={primaryGiver.idBody}
            idHead={primaryGiver.idHead}
            size={80}
          />
          <div>
            <strong>{primaryGiver.name}</strong>
            <div className="muted">ID: {primaryGiver.npcId}</div>
            {givers.length > 1 && (
              <div className="muted">
                Otros givers:{" "}
                {givers
                  .slice(1)
                  .map((g) => `#${g.npcId} ${g.name}`)
                  .join(", ")}
              </div>
            )}
            <div className="quest-aside-actions" style={{ marginTop: 10 }}>
              <Link
                className="obj-btn"
                href={`/npcs/${primaryGiver.npcId}?fromQuest=${quest.id}`}
              >
                Editar NPC
              </Link>
              <button
                type="button"
                className="obj-btn"
                onClick={() => {
                  setGiverMode("existing");
                  setPendingGiverId(null);
                }}
              >
                Cambiar NPC
              </button>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setGiverMode("none")}
              >
                Quitar asignación
              </button>
            </div>
          </div>
        </div>
      )}

      {(mode === "create" || giverMode !== "keep") && (
        <div className="quest-giver-modes">
          <label className="quest-radio">
            <input
              type="radio"
              checked={giverMode === "none"}
              onChange={() => {
                setGiverMode("none");
                setCreateNpc(null);
              }}
            />
            Sin asignar / desvincular
          </label>
          <label className="quest-radio">
            <input
              type="radio"
              checked={giverMode === "existing"}
              onChange={() => {
                setGiverMode("existing");
                setCreateNpc(null);
              }}
            />
            Usar NPC existente
          </label>
          <label className="quest-radio">
            <input
              type="radio"
              checked={giverMode === "create"}
              onChange={() => {
                setGiverMode("create");
                setCreateNpc({
                  name: `Quest ${quest.id}`,
                  npcType: 0,
                  idBody: 519,
                  idHead: 28,
                  desc: `"${quest.name || "Nueva quest"}" /QUEST`,
                });
              }}
            />
            + Crear NPC para esta quest
          </label>
        </div>
      )}

      {giverMode === "existing" && (
        <div className="quest-picker-wrap">
          <NpcPicker
            npcs={meta.npcs}
            typeLabel={typeLabel}
            onPick={(n) => setPendingGiverId(n.id)}
          />
          {pendingGiverId != null && pendingGiverId > 0 && (
            <p>
              Seleccionado: NPC #{pendingGiverId} — {npcName(pendingGiverId)}
            </p>
          )}
        </div>
      )}

      {giverMode === "create" && createNpc && (
        <div className="quest-create-npc">
          <p className="muted">
            Quest asociada: #{quest.id} {quest.name}
          </p>
          <label className="npc-label">Nombre NPC</label>
          <input
            className="npc-input"
            value={createNpc.name}
            onChange={(e) =>
              setCreateNpc({ ...createNpc, name: e.target.value })
            }
          />
          <label className="npc-label">Tipo</label>
          <select
            className="npc-input"
            value={createNpc.npcType}
            onChange={(e) =>
              setCreateNpc({
                ...createNpc,
                npcType: Number(e.target.value),
              })
            }
          >
            {meta.npcTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.id})
              </option>
            ))}
          </select>
          <div className="quest-reward-grid">
            <label>
              Body
              <input
                className="npc-input"
                type="number"
                value={createNpc.idBody}
                onChange={(e) =>
                  setCreateNpc({
                    ...createNpc,
                    idBody: Number(e.target.value),
                  })
                }
              />
            </label>
            <label>
              Head
              <input
                className="npc-input"
                type="number"
                value={createNpc.idHead}
                onChange={(e) =>
                  setCreateNpc({
                    ...createNpc,
                    idHead: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>
          <NpcSpritePreview
            idBody={createNpc.idBody}
            idHead={createNpc.idHead}
            size={64}
          />
          <label className="npc-label">Descripción / diálogo</label>
          <textarea
            className="npc-input"
            rows={3}
            value={createNpc.desc}
            onChange={(e) =>
              setCreateNpc({ ...createNpc, desc: e.target.value })
            }
          />
        </div>
      )}

      {locations.length > 0 && giverMode === "keep" && (
        <div style={{ marginTop: 16 }}>
          <h4>Ubicación en el juego</h4>
          {locations.map((loc) => (
            <div key={`${loc.mapId}-${loc.x}-${loc.y}`} className="quest-loc">
              <div>
                Mapa {loc.mapId} — X {loc.x} / Y {loc.y}
              </div>
              <Link className="obj-btn" href={loc.href}>
                Ir al mapa
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div className="obj-page quest-page quest-editor">
      <div className="quest-editor-top">
        <div>
          <div className="quest-back-row">
            <Link href="/quests" className="quest-back">
              ← Quests
            </Link>
            {returnHint === "npc" && primaryGiver && (
              <Link href={`/npcs/${primaryGiver.npcId}`} className="quest-back">
                ← Volver a NPC
              </Link>
            )}
          </div>
          <h1 className="quest-editor-title">
            #{quest.id} — {quest.name || "Sin nombre"}
          </h1>
          {dirty && <p className="quest-dirty">● Hay cambios sin guardar</p>}
        </div>
        <div className="quest-top-actions">
          {mode === "edit" && (
            <>
              <button
                type="button"
                className="obj-btn"
                onClick={() => void duplicate()}
              >
                Duplicar
              </button>
              <button
                type="button"
                className="obj-btn danger"
                onClick={() => void remove()}
              >
                Eliminar
              </button>
            </>
          )}
          <button
            type="button"
            className="obj-btn"
            disabled={!dirty}
            onClick={discard}
          >
            Descartar
          </button>
          <button
            type="button"
            className="obj-btn primary"
            disabled={busy || !dirty}
            onClick={() => void save(false)}
          >
            Guardar
          </button>
        </div>
      </div>

      {message && (
        <div className="quest-banner" role="status">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)}>
            ×
          </button>
        </div>
      )}

      {conflict && (
        <div className="quest-banner warn">
          <div>
            <strong>{conflict.message}</strong>
            <div className="quest-conflict-actions">
              <button
                type="button"
                className="obj-btn primary"
                onClick={() => {
                  setConflict(null);
                  void save(true);
                }}
              >
                Reemplazar
              </button>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setConflict(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="quest-layout">
        <div className="quest-main">
          <div className="quest-hero">
            <div className="quest-hero-icon" aria-hidden>
              ⌬
            </div>
            <div className="quest-hero-body">
              <div className="quest-hero-name-row">
                <input
                  className="quest-hero-name"
                  value={quest.name}
                  placeholder="Nombre de la quest"
                  onChange={(e) => patch({ name: e.target.value })}
                />
                <span
                  className={`quest-pill ${quest.repeatable ? "rep" : "once"}`}
                >
                  {quest.repeatable ? "Repetible" : "No repetible"}
                </span>
              </div>
              <div className="quest-hero-meta">
                <span>
                  ID: <strong>{quest.id}</strong>
                </span>
                <span className="dot">·</span>
                <label className="quest-toggle inline">
                  Repetible
                  <button
                    type="button"
                    className={`quest-switch ${quest.repeatable ? "on" : ""}`}
                    onClick={() => patch({ repeatable: !quest.repeatable })}
                  >
                    {quest.repeatable ? "ON" : "OFF"}
                  </button>
                </label>
              </div>
              <textarea
                className="npc-input quest-hero-desc"
                rows={3}
                placeholder="Descripción de la misión..."
                value={quest.desc}
                onChange={(e) => patch({ desc: e.target.value })}
              />
            </div>
          </div>

          <div className="quest-tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`quest-tab ${tab === t.id ? "active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "general" && (
            <section className="quest-section">
              <div className="quest-section-grid">
                <div>
                  <h3>Información básica</h3>
                  <label className="npc-label">Nombre</label>
                  <input
                    className="npc-input"
                    value={quest.name}
                    onChange={(e) => patch({ name: e.target.value })}
                  />
                  <label className="npc-label">Descripción</label>
                  <textarea
                    className="npc-input"
                    rows={5}
                    value={quest.desc}
                    onChange={(e) => patch({ desc: e.target.value })}
                  />
                </div>
                <div>
                  <h3>Configuración</h3>
                  <p className="npc-label">¿Quest repetible?</p>
                  <div className="quest-yesno">
                    <button
                      type="button"
                      className={quest.repeatable ? "active" : ""}
                      onClick={() => patch({ repeatable: true })}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      className={!quest.repeatable ? "active" : ""}
                      onClick={() => patch({ repeatable: false })}
                    >
                      No
                    </button>
                  </div>
                  <p className="muted quest-help">
                    Si está activado, el jugador podrá volver a realizar esta
                    misión después de completarla.
                  </p>
                </div>
              </div>

              <h3>Resumen rápido</h3>
              <div className="quest-quick-grid">
                <div className="quest-quick-card">
                  <h4>Requisitos (NPCs)</h4>
                  {quest.requiredNpcs.length ? (
                    <ul className="quest-quick-list">
                      {quest.requiredNpcs.map((r) => {
                        const n = meta.npcs.find((x) => x.id === r.index);
                        return (
                          <li key={r.index}>
                            <NpcSpritePreview
                              idBody={n?.idBody ?? 1}
                              idHead={n?.idHead ?? 0}
                              size={32}
                            />
                            <span>
                              {npcName(r.index)} [{r.index}]{" "}
                              <strong>x{r.amount}</strong>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="muted">Sin requisitos de NPCs</p>
                  )}
                </div>
                <div className="quest-quick-card">
                  <h4>Requisitos (Objetos)</h4>
                  {quest.requiredObjs.length ? (
                    <ul className="quest-quick-list">
                      {quest.requiredObjs.map((r) => {
                        const o = objMeta(r.index);
                        return (
                          <li key={r.index}>
                            <LazyGrh grhIndex={o?.grhIndex ?? 0} size={28} />
                            <span>
                              [{r.index}] {o?.name ?? "Obj"}{" "}
                              <strong>x{r.amount}</strong>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="muted">Sin requisitos de objetos</p>
                  )}
                </div>
                <div className="quest-quick-card">
                  <h4>Recompensas</h4>
                  <ul className="quest-reward-bullets">
                    {quest.rewardGold > 0 && (
                      <li>
                        <span className="coin">��</span>{" "}
                        {quest.rewardGold.toLocaleString("es-AR")} Oro
                      </li>
                    )}
                    {quest.rewardExp > 0 && (
                      <li>
                        <span className="xp">��&</span>{" "}
                        {quest.rewardExp.toLocaleString("es-AR")} Experiencia
                      </li>
                    )}
                    {quest.rewardPoints > 0 && (
                      <li>
                        <span className="pts">� </span> {quest.rewardPoints}{" "}
                        Puntos de canje
                      </li>
                    )}
                    {quest.rewardObjs.map((r) => {
                      const o = objMeta(r.index);
                      return (
                        <li key={r.index}>
                          [{r.index}] {o?.name ?? "Obj"} x{r.amount}
                        </li>
                      );
                    })}
                    {!quest.rewardGold &&
                      !quest.rewardExp &&
                      !quest.rewardPoints &&
                      !quest.rewardObjs.length && (
                        <li className="muted">Sin recompensas</li>
                      )}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {tab === "npcs" && (
            <section className="quest-section">
              <h3>NPCs que debe eliminar el jugador</h3>
              <div className="quest-req-list">
                {quest.requiredNpcs.map((r) => {
                  const n = meta.npcs.find((x) => x.id === r.index);
                  return (
                    <div key={r.index} className="quest-req-row">
                      <NpcSpritePreview
                        idBody={n?.idBody ?? 1}
                        idHead={n?.idHead ?? 0}
                        size={48}
                      />
                      <div style={{ flex: 1 }}>
                        <strong>{npcName(r.index)}</strong>
                        <div className="muted">ID {r.index}</div>
                      </div>
                      <label className="quest-amount">
                        Cantidad
                        <input
                          className="npc-input"
                          type="number"
                          min={1}
                          value={r.amount}
                          onChange={(e) => {
                            const amount = Number(e.target.value);
                            patch({
                              requiredNpcs: quest.requiredNpcs.map((x) =>
                                x.index === r.index ? { ...x, amount } : x,
                              ),
                            });
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="obj-icon-btn danger"
                        onClick={() =>
                          patch({
                            requiredNpcs: quest.requiredNpcs.filter(
                              (x) => x.index !== r.index,
                            ),
                          })
                        }
                      >
                        �x
                      </button>
                    </div>
                  );
                })}
                {!quest.requiredNpcs.length && (
                  <p className="muted">Sin requisitos de NPCs</p>
                )}
              </div>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setShowNpcPicker((v) => !v)}
              >
                + Agregar NPC
              </button>
              {showNpcPicker && (
                <div className="quest-picker-wrap">
                  <NpcPicker
                    npcs={meta.npcs}
                    typeLabel={typeLabel}
                    onPick={(n) => {
                      addNpcReq(n);
                      setShowNpcPicker(false);
                    }}
                  />
                </div>
              )}
            </section>
          )}

          {tab === "objs" && (
            <section className="quest-section">
              <h3>Objetos que debe conseguir/entregar</h3>
              <div className="quest-req-list">
                {quest.requiredObjs.map((r) => {
                  const o = objMeta(r.index);
                  return (
                    <div key={r.index} className="quest-req-row">
                      <LazyGrh grhIndex={o?.grhIndex ?? 0} size={40} />
                      <div style={{ flex: 1 }}>
                        <strong>
                          [{r.index}] {o?.name ?? "Objeto"}
                        </strong>
                      </div>
                      <label className="quest-amount">
                        Cantidad
                        <input
                          className="npc-input"
                          type="number"
                          min={1}
                          value={r.amount}
                          onChange={(e) => {
                            const amount = Number(e.target.value);
                            patch({
                              requiredObjs: quest.requiredObjs.map((x) =>
                                x.index === r.index ? { ...x, amount } : x,
                              ),
                            });
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="obj-icon-btn danger"
                        onClick={() =>
                          patch({
                            requiredObjs: quest.requiredObjs.filter(
                              (x) => x.index !== r.index,
                            ),
                          })
                        }
                      >
                        �x
                      </button>
                    </div>
                  );
                })}
                {!quest.requiredObjs.length && (
                  <p className="muted">Sin requisitos de objetos</p>
                )}
              </div>
              <button
                type="button"
                className="obj-btn"
                onClick={() =>
                  setShowObjPicker((v) => (v === "req" ? null : "req"))
                }
              >
                + Agregar objeto
              </button>
              {showObjPicker === "req" && (
                <div className="quest-picker-wrap">
                  <ObjectPicker
                    objects={meta.objects}
                    onPick={(o) => {
                      addObjReq(o);
                      setShowObjPicker(null);
                    }}
                  />
                </div>
              )}
            </section>
          )}

          {tab === "rewards" && (
            <section className="quest-section">
              <h3>Recompensas</h3>
              <div className="quest-reward-grid">
                <label>
                  Oro
                  <input
                    className="npc-input"
                    type="number"
                    min={0}
                    value={quest.rewardGold}
                    onChange={(e) =>
                      patch({ rewardGold: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Experiencia
                  <input
                    className="npc-input"
                    type="number"
                    min={0}
                    value={quest.rewardExp}
                    onChange={(e) =>
                      patch({ rewardExp: Number(e.target.value) })
                    }
                  />
                </label>
                <label>
                  Puntos
                  <input
                    className="npc-input"
                    type="number"
                    min={0}
                    value={quest.rewardPoints}
                    onChange={(e) =>
                      patch({ rewardPoints: Number(e.target.value) })
                    }
                  />
                </label>
              </div>
              <h4>Objetos</h4>
              <div className="quest-req-list">
                {quest.rewardObjs.map((r) => {
                  const o = objMeta(r.index);
                  return (
                    <div key={r.index} className="quest-req-row">
                      <LazyGrh grhIndex={o?.grhIndex ?? 0} size={40} />
                      <div style={{ flex: 1 }}>
                        <strong>
                          [{r.index}] {o?.name ?? "Objeto"}
                        </strong>
                      </div>
                      <label className="quest-amount">
                        Cantidad
                        <input
                          className="npc-input"
                          type="number"
                          min={1}
                          value={r.amount}
                          onChange={(e) => {
                            const amount = Number(e.target.value);
                            patch({
                              rewardObjs: quest.rewardObjs.map((x) =>
                                x.index === r.index ? { ...x, amount } : x,
                              ),
                            });
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        className="obj-icon-btn danger"
                        onClick={() =>
                          patch({
                            rewardObjs: quest.rewardObjs.filter(
                              (x) => x.index !== r.index,
                            ),
                          })
                        }
                      >
                        �x
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                className="obj-btn"
                onClick={() =>
                  setShowObjPicker((v) => (v === "reward" ? null : "reward"))
                }
              >
                + Agregar recompensa
              </button>
              {showObjPicker === "reward" && (
                <div className="quest-picker-wrap">
                  <ObjectPicker
                    objects={meta.objects}
                    onPick={(o) => {
                      addRewardObj(o);
                      setShowObjPicker(null);
                    }}
                  />
                </div>
              )}
            </section>
          )}

          {tab === "giver" && (
            <section className="quest-section">
              <h3>NPC que entrega la quest</h3>
              {giverPanel}
            </section>
          )}

          {tab === "advanced" && (
            <section className="quest-section">
              <h3>JSON Quest (solo lectura)</h3>
              <pre className="quest-json">
                {JSON.stringify(jsonPreview, null, 2)}
              </pre>
              <p className="muted">
                requiredLevel se conserva por compatibilidad; no se edita desde
                la UI. Valor actual: {quest.requiredLevel}.
              </p>
            </section>
          )}
        </div>

        <aside className="quest-aside">
          <div className="quest-aside-card">
            <h3>NPC que entrega</h3>
            {primaryGiver && giverMode === "keep" ? (
              <>
                <div className="quest-aside-giver">
                  <NpcSpritePreview
                    idBody={primaryGiver.idBody}
                    idHead={primaryGiver.idHead}
                    size={72}
                  />
                  <div>
                    <strong>{primaryGiver.name}</strong>
                    <div className="muted">[{primaryGiver.npcId}]</div>
                  </div>
                </div>
                <div className="quest-aside-actions">
                  <Link
                    className="obj-btn"
                    href={`/npcs/${primaryGiver.npcId}?fromQuest=${quest.id}`}
                  >
                    Editar NPC
                  </Link>
                  <button
                    type="button"
                    className="obj-btn"
                    onClick={() => {
                      setTab("giver");
                      setGiverMode("existing");
                      setPendingGiverId(null);
                    }}
                  >
                    Cambiar NPC
                  </button>
                  <button
                    type="button"
                    className="obj-btn"
                    onClick={() => {
                      setTab("giver");
                      setGiverMode("create");
                      setCreateNpc({
                        name: `Quest ${quest.id}`,
                        npcType: 0,
                        idBody: 519,
                        idHead: 28,
                        desc: `"${quest.name || "Nueva quest"}" /QUEST`,
                      });
                    }}
                  >
                    + Crear nuevo NPC
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p className="muted">Sin NPC asignado</p>
                <button
                  type="button"
                  className="obj-btn primary"
                  onClick={() => setTab("giver")}
                >
                  Asignar / crear NPC
                </button>
              </div>
            )}
          </div>

          {locations.length > 0 && (
            <div className="quest-aside-card">
              <h3>Ubicación en el juego</h3>
              {locations.map((loc) => (
                <div key={`${loc.mapId}-${loc.x}-${loc.y}`} className="quest-loc">
                  <div>
                    Mapa {loc.mapId}
                    <div className="muted">
                      X {loc.x} / Y {loc.y}
                    </div>
                  </div>
                  <Link className="obj-btn" href={loc.href}>
                    Ir al mapa
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="quest-aside-card">
            <h3>Resumen</h3>
            <h4>Objetivos</h4>
            {quest.requiredNpcs.length ? (
              <ul>
                {quest.requiredNpcs.map((r) => (
                  <li key={r.index}>
                    {npcName(r.index)} x{r.amount}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Ninguno</p>
            )}
            <h4>Objetos requeridos</h4>
            {quest.requiredObjs.length ? (
              <ul>
                {quest.requiredObjs.map((r) => (
                  <li key={r.index}>
                    [{r.index}] {objMeta(r.index)?.name ?? "Obj"} x{r.amount}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Ninguno</p>
            )}
            <h4>Recompensas</h4>
            <ul>
              {quest.rewardGold > 0 && (
                <li>{formatCompactNumber(quest.rewardGold)} Oro</li>
              )}
              {quest.rewardExp > 0 && (
                <li>{formatCompactNumber(quest.rewardExp)} EXP</li>
              )}
              {quest.rewardPoints > 0 && <li>{quest.rewardPoints} Puntos</li>}
              {!quest.rewardGold &&
                !quest.rewardExp &&
                !quest.rewardPoints && (
                  <li className="muted">Sin oro/exp/puntos</li>
                )}
            </ul>
            <h4>Repetible</h4>
            <p>{quest.repeatable ? "Sí" : "No"}</p>
          </div>

          <div className="quest-aside-card">
            <h3>JSON (vista previa)</h3>
            <pre className="quest-json compact">
              {JSON.stringify(jsonPreview, null, 2)}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
