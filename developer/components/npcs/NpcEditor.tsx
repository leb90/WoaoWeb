"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LazyGrh } from "@/components/objects/LazyGrh";
import { ObjectPicker, type PickerObject } from "@/components/pickers/ObjectPicker";
import { SpellPicker, type PickerSpell } from "@/components/pickers/SpellPicker";
import { BodyHeadPicker } from "@/components/pickers/BodyHeadPicker";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";
import { NpcTypeBadge } from "@/components/npcs/NpcTypeBadge";
import {
  MOVEMENT_OPTIONS,
  NPC_TYPE_METAS,
  boolToFlag,
  createNpcDraft,
  flagToBool,
  getMovementLabel,
  getNpcPresentation,
  getNpcTabs,
  getRelevantAttributeKeys,
  hasCriticalErrors,
  isEffectiveMerchant,
  normalizeDrops,
  normalizeShop,
  normalizeSpells,
  validateNpc,
  type DropEntry,
  type NpcData,
  type NpcTabId,
  type ShopEntry,
  type SpellEntry,
  type ValidationIssue,
} from "@/lib/game-data/npcs";

type MetaPayload = {
  nextId: number;
  types: typeof NPC_TYPE_METAS;
  movements: typeof MOVEMENT_OPTIONS;
  spells: PickerSpell[];
  objects: PickerObject[];
  bodyIds: number[];
  headIds: number[];
  existingIds: number[];
};

type RefItem = {
  kind: string;
  label: string;
  detail?: string;
  href?: string;
};

type Props = { mode: "edit"; id: number } | { mode: "create" };

const TAB_LABELS: Record<NpcTabId, string> = {
  commerce: "Inventario / Comercio",
  drops: "Drops",
  dialogue: "Diálogo",
  attributes: "Atributos",
  spells: "Hechizos",
  appearance: "Apariencia",
  advanced: "Avanzado",
};

const ATTR_LABELS: Record<string, string> = {
  hp: "Vida",
  maxHp: "Vida máxima",
  exp: "Experiencia",
  gold: "Oro",
  minHit: "Daño mínimo",
  maxHit: "Daño máximo",
  def: "Defensa",
  poderAtaque: "Ataque",
  poderEvasion: "Evasión",
  magicResistance: "Resistencia mágica",
  magicDef: "Defensa mágica",
  defM: "Defensa mágica (defM)",
};

function num(d: NpcData, k: string): number {
  const v = d[k];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

export function NpcEditor(props: Props) {
  const router = useRouter();
  const isNew = props.mode === "create";
  const editId = props.mode === "edit" ? props.id : null;

  const [data, setData] = useState<NpcData | null>(null);
  const [baseline, setBaseline] = useState("");
  const [assignedId, setAssignedId] = useState<number | null>(editId);
  const [hints, setHints] = useState<string[]>([]);
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [tab, setTab] = useState<NpcTabId>("appearance");
  const [refs, setRefs] = useState<RefItem[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      try {
        const metaRes = await fetch("/api/npcs/meta");
        const metaBody = (await metaRes.json()) as MetaPayload;
        if (cancelled) return;
        setMeta(metaBody);

        if (isNew) {
          const raw = sessionStorage.getItem("woao.dev.npcDraft");
          let draft: NpcData = createNpcDraft(0);
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as { data?: NpcData };
              if (parsed.data) draft = parsed.data;
            } catch {
              /* ignore */
            }
          }
          setData(draft);
          setBaseline(JSON.stringify(draft));
          setAssignedId(metaBody.nextId);
          setHints([
            "Borrador: no se escribió npcs.json todavía.",
            "Al guardar: backup + reinicio sugerido.",
          ]);
        } else if (editId != null) {
          const res = await fetch(`/api/npcs/${editId}`);
          const body = (await res.json()) as {
            data?: NpcData;
            hints?: string[];
            error?: string;
          };
          if (!res.ok || !body.data) throw new Error(body.error ?? "Error");
          setData(body.data);
          setBaseline(JSON.stringify(body.data));
          setAssignedId(editId);
          setHints(body.hints ?? []);
          void fetch(`/api/npcs/${editId}/references`)
            .then((r) => r.json())
            .then((d: { references?: RefItem[] }) => {
              if (!cancelled) setRefs(d.references ?? []);
            });
        }
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [isNew, editId]);

  const dirty = data != null && JSON.stringify(data) !== baseline;

  const setField = useCallback((key: string, value: unknown) => {
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const tabs = useMemo(() => (data ? getNpcTabs(data) : []), [data]);

  useEffect(() => {
    if (tabs.length && !tabs.includes(tab)) {
      setTab(tabs[0]!);
    }
  }, [tabs, tab]);

  const presentation = useMemo(
    () => (data ? getNpcPresentation(data) : null),
    [data],
  );

  const attrKeys = useMemo(
    () => (data ? getRelevantAttributeKeys(data) : []),
    [data],
  );

  const issues = useMemo(() => {
    if (!data || !meta) return [] as ValidationIssue[];
    return validateNpc(data, {
      isNew,
      currentId: assignedId ?? undefined,
      existingIds: new Set(meta.existingIds),
      objectIds: new Set(meta.objects.map((o) => o.id)),
      spellIds: new Set(meta.spells.map((s) => s.id)),
      bodyIds: new Set(meta.bodyIds),
      headIds: new Set(meta.headIds),
    });
  }, [data, meta, isNew, assignedId]);

  const objectById = useMemo(() => {
    const m = new Map<number, PickerObject>();
    for (const o of meta?.objects ?? []) m.set(o.id, o);
    return m;
  }, [meta]);

  const spellById = useMemo(() => {
    const m = new Map<number, PickerSpell>();
    for (const s of meta?.spells ?? []) m.set(s.id, s);
    return m;
  }, [meta]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, assignedId, issues]);

  async function save() {
    if (!data || assignedId == null) return;
    if (hasCriticalErrors(issues)) {
      setMessage("Hay errores críticos. Corregilos antes de guardar.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (isNew) {
        const res = await fetch("/api/npcs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: assignedId, data }),
        });
        const body = (await res.json()) as {
          id?: number;
          error?: string;
          hints?: string[];
        };
        if (!res.ok) throw new Error(body.error ?? "Error");
        sessionStorage.removeItem("woao.dev.npcDraft");
        setBaseline(JSON.stringify(data));
        setHints(body.hints ?? []);
        setMessage("Creado y guardado");
        router.replace(`/npcs/${body.id ?? assignedId}`);
      } else {
        const res = await fetch(`/api/npcs/${assignedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        });
        const body = (await res.json()) as { error?: string; hints?: string[] };
        if (!res.ok) throw new Error(body.error ?? "Error");
        setBaseline(JSON.stringify(data));
        setHints(body.hints ?? []);
        setMessage("Guardado (backup creado)");
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!dirty) return;
    if (!confirm("¿Descartar cambios sin guardar?")) return;
    if (isNew) {
      router.push("/npcs");
      return;
    }
    setData(JSON.parse(baseline) as NpcData);
  }

  function leaveGuard(href: string) {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Salir de todos modos?")) {
      return;
    }
    router.push(href);
  }

  async function duplicateDraft() {
    if (!data) return;
    const draft = {
      ...structuredClone(data),
      name: `${String(data.name ?? "NPC")} - copia`,
    };
    sessionStorage.setItem(
      "woao.dev.npcDraft",
      JSON.stringify({ mode: "create", data: draft }),
    );
    leaveGuard("/npcs/new");
  }

  async function confirmDelete(force: boolean) {
    if (assignedId == null || isNew) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(
        `/api/npcs/${assignedId}${force ? "?force=1" : ""}`,
        { method: "DELETE" },
      );
      const body = (await res.json()) as {
        error?: string;
        references?: RefItem[];
      };
      if (res.status === 409) {
        setRefs(body.references ?? []);
        return;
      }
      if (!res.ok) throw new Error(body.error ?? "Error");
      router.push("/npcs");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setDeleteBusy(false);
    }
  }

  function setFlag(key: string, on: boolean) {
    setField(key, boolToFlag(on));
  }

  function patchShop(
    mutator: (entries: Array<Record<string, unknown>>) => Array<Record<string, unknown>>,
  ) {
    const raw = Array.isArray(data?.objs)
      ? (data!.objs as Array<Record<string, unknown>>).map((e) => ({ ...e }))
      : [];
    setField("objs", mutator(raw));
  }

  function patchDrops(
    mutator: (entries: Array<Record<string, unknown>>) => Array<Record<string, unknown>>,
  ) {
    const raw = Array.isArray(data?.drop)
      ? (data!.drop as Array<Record<string, unknown>>).map((e) => ({ ...e }))
      : [];
    setField("drop", mutator(raw));
  }

  function patchSpells(
    mutator: (entries: Array<Record<string, unknown>>) => Array<Record<string, unknown>>,
  ) {
    const raw = Array.isArray(data?.spells)
      ? (data!.spells as Array<Record<string, unknown>>).map((e) => ({ ...e }))
      : [];
    setField("spells", mutator(raw));
  }

  if (loading || !data) {
    return (
      <div className="obj-page">
        <p style={{ color: "var(--text-muted)" }}>Cargando NPC…</p>
      </div>
    );
  }

  const shop = normalizeShop(data);
  const drops = normalizeDrops(data);
  const spells = normalizeSpells(data);
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const desc = String(data.desc ?? "");

  return (
    <div className="obj-page npc-page">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            className="obj-btn"
            onClick={() => leaveGuard("/npcs")}
          >
            ← NPCs
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>
              NPC #{assignedId} — {String(data.name ?? "")}
            </h1>
            {dirty && (
              <div style={{ color: "#f0c75e", fontSize: 12, marginTop: 2 }}>
                ● Hay cambios sin guardar
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="obj-btn" onClick={() => void duplicateDraft()}>
            Duplicar
          </button>
          <button
            type="button"
            className="obj-btn"
            style={{ borderColor: "var(--obj-danger)", color: "#ff8a95" }}
            onClick={discard}
            disabled={!dirty}
          >
            Descartar
          </button>
          {!isNew && (
            <button
              type="button"
              className="obj-btn danger"
              onClick={() => setDeleteOpen(true)}
            >
              Eliminar
            </button>
          )}
          <button
            type="button"
            className="obj-btn primary"
            disabled={saving || hasCriticalErrors(issues)}
            onClick={() => void save()}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{message}</div>
      )}

      <div className="npc-editor">
        <div>
          <div className="npc-panel" style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 16,
              }}
            >
              <NpcSpritePreview
                idBody={num(data, "idBody")}
                idHead={num(data, "idHead")}
                size={128}
              />
              <div className="npc-grid">
                <label className="npc-field" style={{ gridColumn: "1 / -1" }}>
                  Nombre
                  <input
                    value={String(data.name ?? "")}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </label>
                <label className="npc-field">
                  Tipo
                  <select
                    value={num(data, "npcType")}
                    onChange={(e) => setField("npcType", Number(e.target.value))}
                  >
                    {NPC_TYPE_METAS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.id})
                      </option>
                    ))}
                    {!NPC_TYPE_METAS.some((t) => t.id === num(data, "npcType")) && (
                      <option value={num(data, "npcType")}>
                        Tipo {num(data, "npcType")}
                      </option>
                    )}
                  </select>
                </label>
                <div className="npc-field">
                  Badge
                  <div style={{ paddingTop: 6 }}>
                    <NpcTypeBadge npcType={num(data, "npcType")} />
                  </div>
                </div>
                <label className="npc-field">
                  Body
                  <input
                    type="number"
                    value={num(data, "idBody")}
                    onChange={(e) => setField("idBody", Number(e.target.value) || 0)}
                  />
                </label>
                <label className="npc-field">
                  Head
                  <input
                    type="number"
                    value={num(data, "idHead")}
                    onChange={(e) => setField("idHead", Number(e.target.value) || 0)}
                  />
                </label>
                <label className="npc-field">
                  HP
                  <input
                    type="number"
                    value={num(data, "hp")}
                    onChange={(e) => setField("hp", Number(e.target.value) || 0)}
                  />
                </label>
                <label className="npc-field">
                  EXP
                  <input
                    type="number"
                    value={num(data, "exp")}
                    onChange={(e) => setField("exp", Number(e.target.value) || 0)}
                  />
                </label>
                <div className="npc-switch-row" style={{ gridColumn: "1 / -1" }}>
                  <FlagSwitch
                    label="Hostil"
                    checked={flagToBool(data.hostile)}
                    onChange={(v) => setFlag("hostile", v)}
                  />
                  <FlagSwitch
                    label="Atacable"
                    checked={flagToBool(data.attackable)}
                    onChange={(v) => setFlag("attackable", v)}
                  />
                  <FlagSwitch
                    label="Comercia"
                    checked={flagToBool(data.comercia)}
                    onChange={(v) => setFlag("comercia", v)}
                  />
                </div>
                <label className="npc-field" style={{ gridColumn: "1 / -1" }}>
                  Descripción
                  <textarea
                    rows={2}
                    value={desc}
                    onChange={(e) => setField("desc", e.target.value)}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="npc-tabs">
            {tabs.map((id) => (
              <button
                key={id}
                type="button"
                className={`npc-tab ${tab === id ? "active" : ""}`}
                onClick={() => setTab(id)}
              >
                {TAB_LABELS[id]}
              </button>
            ))}
          </div>

          <div className="npc-panel">
            {tab === "commerce" && (
              <CommerceTab
                shop={shop}
                objectById={objectById}
                objects={meta?.objects ?? []}
                onAdd={(obj) =>
                  patchShop((entries) => {
                    if (entries.some((e) => Number(e.item) === obj.id)) return entries;
                    return [...entries, { item: obj.id, cant: 1 }];
                  })
                }
                onCant={(index, cant) =>
                  patchShop((entries) => {
                    const next = [...entries];
                    const cur = next[index];
                    if (cur) next[index] = { ...cur, cant };
                    return next;
                  })
                }
                onRemove={(index) =>
                  patchShop((entries) => entries.filter((_, j) => j !== index))
                }
              />
            )}
            {tab === "drops" && (
              <DropsTab
                drops={drops}
                objectById={objectById}
                objects={meta?.objects ?? []}
                onAdd={(obj) =>
                  patchDrops((entries) => [
                    ...entries,
                    { item: obj.id, cant: 1, chancePercent: 30 },
                  ])
                }
                onCant={(index, cant) =>
                  patchDrops((entries) => {
                    const next = [...entries];
                    const cur = next[index];
                    if (cur) next[index] = { ...cur, cant };
                    return next;
                  })
                }
                onChance={(index, chancePercent) =>
                  patchDrops((entries) => {
                    const next = [...entries];
                    const cur = next[index];
                    if (!cur) return next;
                    const updated: Record<string, unknown> = { ...cur };
                    if ("chance" in cur && !("chancePercent" in cur)) {
                      updated.chance = chancePercent;
                    } else if (
                      "probabilidad" in cur &&
                      !("chancePercent" in cur)
                    ) {
                      updated.probabilidad = chancePercent;
                    } else {
                      updated.chancePercent = chancePercent;
                    }
                    next[index] = updated;
                    return next;
                  })
                }
                onRemove={(index) =>
                  patchDrops((entries) => entries.filter((_, j) => j !== index))
                }
              />
            )}
            {tab === "dialogue" && (
              <div>
                <label className="npc-field">
                  Diálogo / descripción
                  <textarea
                    rows={10}
                    value={desc}
                    onChange={(e) => setField("desc", e.target.value)}
                  />
                </label>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  {desc.length} caracteres
                </div>
              </div>
            )}
            {tab === "attributes" && (
              <div className="npc-grid">
                {attrKeys.map((key) => (
                  <label key={key} className="npc-field">
                    {ATTR_LABELS[key] ?? key}
                    <input
                      type="number"
                      value={num(data, key)}
                      onChange={(e) =>
                        setField(key, Number(e.target.value) || 0)
                      }
                    />
                  </label>
                ))}
                <label className="npc-field">
                  Movimiento
                  <select
                    value={num(data, "movement")}
                    onChange={(e) =>
                      setField("movement", Number(e.target.value))
                    }
                  >
                    {MOVEMENT_OPTIONS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                    {!MOVEMENT_OPTIONS.some(
                      (m) => m.id === num(data, "movement"),
                    ) && (
                      <option value={num(data, "movement")}>
                        {getMovementLabel(num(data, "movement"))}
                      </option>
                    )}
                  </select>
                </label>
                <div
                  className="npc-switch-row"
                  style={{ gridColumn: "1 / -1", marginTop: 8 }}
                >
                  <FlagSwitch
                    label="Agua válida"
                    checked={flagToBool(data.aguaValida)}
                    onChange={(v) => setFlag("aguaValida", v)}
                  />
                  <FlagSwitch
                    label="Tierra inválida"
                    checked={flagToBool(data.tierraInvalida)}
                    onChange={(v) => setFlag("tierraInvalida", v)}
                  />
                </div>
              </div>
            )}
            {tab === "spells" && (
              <SpellsTab
                spells={spells}
                spellById={spellById}
                catalog={meta?.spells ?? []}
                onAdd={(s) =>
                  patchSpells((entries) => {
                    if (entries.some((e) => Number(e.idSpell) === s.id)) {
                      return entries;
                    }
                    return [...entries, { idSpell: s.id }];
                  })
                }
                onRemove={(index) =>
                  patchSpells((entries) => entries.filter((_, j) => j !== index))
                }
              />
            )}
            {tab === "appearance" && (
              <div>
                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                  <NpcSpritePreview
                    idBody={num(data, "idBody")}
                    idHead={num(data, "idHead")}
                    size={160}
                  />
                  <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                    Preview compuesto body + head (dirección sur).
                  </div>
                </div>
                <BodyHeadPicker
                  kind="body"
                  value={num(data, "idBody")}
                  ids={meta?.bodyIds ?? []}
                  onChange={(id) => setField("idBody", id)}
                />
                <BodyHeadPicker
                  kind="head"
                  value={num(data, "idHead")}
                  ids={meta?.headIds ?? []}
                  onChange={(id) => setField("idHead", id)}
                />
              </div>
            )}
            {tab === "advanced" && (
              <div>
                <div className="npc-grid">
                  <label className="npc-field">
                    npcType (numérico)
                    <input
                      type="number"
                      value={num(data, "npcType")}
                      onChange={(e) =>
                        setField("npcType", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="npc-field">
                    snd1
                    <input
                      type="number"
                      value={num(data, "snd1")}
                      onChange={(e) =>
                        setField("snd1", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="npc-field">
                    snd2
                    <input
                      type="number"
                      value={num(data, "snd2")}
                      onChange={(e) =>
                        setField("snd2", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="npc-field">
                    soundClose
                    <input
                      type="number"
                      value={num(data, "soundClose")}
                      onChange={(e) =>
                        setField("soundClose", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="npc-field">
                    questNumber
                    <input
                      type="number"
                      value={num(data, "questNumber")}
                      onChange={(e) =>
                        setField("questNumber", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className="obj-btn"
                  style={{ marginTop: 12 }}
                  onClick={() => setShowJson((v) => !v)}
                >
                  {showJson ? "Ocultar JSON" : "Ver JSON"}
                </button>
                {showJson && (
                  <pre
                    style={{
                      marginTop: 10,
                      padding: 12,
                      background: "#0f141c",
                      borderRadius: 8,
                      overflow: "auto",
                      fontSize: 11,
                      maxHeight: 360,
                    }}
                  >
                    {JSON.stringify(data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="npc-panel">
            <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
              VISTA PREVIA EN EL JUEGO
            </strong>
            <div style={{ marginTop: 10 }}>
              <NpcSpritePreview
                idBody={num(data, "idBody")}
                idHead={num(data, "idHead")}
                size={180}
              />
            </div>
            <button
              type="button"
              className="obj-btn"
              style={{ marginTop: 10, width: "100%" }}
              onClick={() => {
                if (refs[0]?.href) leaveGuard(refs[0].href);
                else leaveGuard("/maps");
              }}
            >
              Probar en mapa
            </button>
          </div>

          <div className="npc-panel">
            <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
              ESTADO
            </strong>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {errors.length === 0 ? (
                <span style={{ color: "#6ee7a0" }}>
                  ● NPC válido
                  {warnings.length
                    ? `. ${warnings.length} warning(s).`
                    : ". No se encontraron errores."}
                </span>
              ) : (
                <span style={{ color: "#ff8a95" }}>
                  ● {errors.length} error(es)
                  {warnings.length ? `, ${warnings.length} warning(s)` : ""}
                </span>
              )}
            </div>
            {issues.length > 0 && (
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: 16,
                  fontSize: 12,
                  color: "var(--text-muted)",
                }}
              >
                {issues.slice(0, 12).map((i, idx) => (
                  <li key={idx} style={{ color: i.level === "error" ? "#ff8a95" : "#f0c75e" }}>
                    {i.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="npc-panel">
            <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
              INFORMACIÓN TÉCNICA
            </strong>
            <dl
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "4px 10px",
              }}
            >
              <dt className="muted">ID</dt>
              <dd style={{ margin: 0 }}>{assignedId}</dd>
              <dt className="muted">Tipo</dt>
              <dd style={{ margin: 0 }}>
                {presentation?.typeLabel} ({num(data, "npcType")})
              </dd>
              <dt className="muted">Body</dt>
              <dd style={{ margin: 0 }}>{num(data, "idBody")}</dd>
              <dt className="muted">Head</dt>
              <dd style={{ margin: 0 }}>{num(data, "idHead")}</dd>
              <dt className="muted">Hostil</dt>
              <dd style={{ margin: 0 }}>
                {flagToBool(data.hostile) ? "Sí" : "No"}
              </dd>
              <dt className="muted">Comercia</dt>
              <dd style={{ margin: 0 }}>
                {flagToBool(data.comercia) ? "Sí" : "No"}
                {isEffectiveMerchant(data) ? " (efectivo)" : ""}
              </dd>
              <dt className="muted">HP</dt>
              <dd style={{ margin: 0 }}>{num(data, "hp")}</dd>
              <dt className="muted">EXP</dt>
              <dd style={{ margin: 0 }}>{num(data, "exp")}</dd>
              {(num(data, "minHit") > 0 || num(data, "maxHit") > 0) && (
                <>
                  <dt className="muted">Daño</dt>
                  <dd style={{ margin: 0 }}>
                    {num(data, "minHit")}–{num(data, "maxHit")}
                  </dd>
                </>
              )}
              {shop.length > 0 && (
                <>
                  <dt className="muted">Shop</dt>
                  <dd style={{ margin: 0 }}>{shop.length} objetos</dd>
                </>
              )}
              {spells.length > 0 && (
                <>
                  <dt className="muted">Spells</dt>
                  <dd style={{ margin: 0 }}>{spells.length}</dd>
                </>
              )}
            </dl>
          </div>

          {refs.length > 0 && (
            <div className="npc-panel">
              <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
                REFERENCIAS
              </strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12 }}>
                {refs.slice(0, 20).map((r, i) => (
                  <li key={i}>
                    {r.href ? (
                      <button
                        type="button"
                        className="obj-btn"
                        style={{ padding: "2px 8px", fontSize: 12 }}
                        onClick={() => leaveGuard(r.href!)}
                      >
                        {r.label}
                      </button>
                    ) : (
                      r.label
                    )}
                    {r.detail ? ` — ${r.detail}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hints.length > 0 && (
            <div className="npc-panel" style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {hints.map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {deleteOpen && (
        <div className="obj-modal-backdrop" onClick={() => setDeleteOpen(false)}>
          <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Eliminar NPC</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              ¿Eliminar NPC #{assignedId} — {String(data.name)}?
            </p>
            {refs.length > 0 && (
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
                <strong>Referencias ({refs.length}):</strong>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  {refs.map((r, i) => (
                    <li key={i}>
                      {r.label}
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
                onClick={() => setDeleteOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="obj-btn danger"
                disabled={deleteBusy}
                onClick={() => void confirmDelete(refs.length > 0)}
              >
                {refs.length > 0 ? "Eliminar de todos modos" : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlagSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 13,
        cursor: "pointer",
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: checked ? "rgba(61,139,253,0.12)" : "transparent",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

function CommerceTab({
  shop,
  objectById,
  objects,
  onAdd,
  onCant,
  onRemove,
}: {
  shop: ShopEntry[];
  objectById: Map<number, PickerObject>;
  objects: PickerObject[];
  onAdd: (obj: PickerObject) => void;
  onCant: (index: number, cant: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--text-muted)" }}>
        Inventario comercial (`objs`: item + cant). El precio de venta lo define
        el valor del objeto en el catálogo (solo lectura).
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <ObjectPicker objects={objects} onPick={onAdd} />
      </div>
      <table className="npc-item-table">
        <thead>
          <tr>
            <th>Objeto</th>
            <th>Cantidad</th>
            <th>Valor catálogo</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {shop.map((e, i) => {
            const o = objectById.get(e.item);
            return (
              <tr key={`${e.item}-${i}`}>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LazyGrh grhIndex={o?.grhIndex ?? 0} size={28} />
                    <span>
                      [{e.item}] {o?.name ?? "¿?"}
                    </span>
                  </div>
                </td>
                <td>
                  <input
                    className="npc-input"
                    style={{ width: 80 }}
                    type="number"
                    min={1}
                    value={e.cant}
                    onChange={(ev) =>
                      onCant(i, Math.max(1, Number(ev.target.value) || 1))
                    }
                  />
                </td>
                <td style={{ color: "var(--text-muted)" }}>
                  {o?.valor != null ? o.valor : "—"}
                </td>
                <td>
                  <button
                    type="button"
                    className="obj-btn icon"
                    onClick={() => onRemove(i)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            );
          })}
          {shop.length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: "var(--text-muted)" }}>
                Sin objetos. Buscá y agregá.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function DropsTab({
  drops,
  objectById,
  objects,
  onAdd,
  onCant,
  onChance,
  onRemove,
}: {
  drops: DropEntry[];
  objectById: Map<number, PickerObject>;
  objects: PickerObject[];
  onAdd: (obj: PickerObject) => void;
  onCant: (index: number, cant: number) => void;
  onChance: (index: number, chancePercent: number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <ObjectPicker objects={objects} onPick={onAdd} />
      </div>
      <table className="npc-item-table">
        <thead>
          <tr>
            <th>Objeto</th>
            <th>Cantidad</th>
            <th>Probabilidad %</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {drops.map((e, i) => {
            const o = objectById.get(e.item);
            const chance = e.chancePercent ?? 0;
            return (
              <tr key={`${e.item}-${i}`}>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <LazyGrh grhIndex={o?.grhIndex ?? 0} size={28} />
                    <span>
                      [{e.item}] {o?.name ?? "¿?"}
                    </span>
                  </div>
                </td>
                <td>
                  <input
                    className="npc-input"
                    style={{ width: 80 }}
                    type="number"
                    min={1}
                    value={e.cant}
                    onChange={(ev) =>
                      onCant(i, Math.max(1, Number(ev.target.value) || 1))
                    }
                  />
                </td>
                <td>
                  <input
                    className="npc-input"
                    style={{ width: 90 }}
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={chance}
                    onChange={(ev) => onChance(i, Number(ev.target.value) || 0)}
                  />
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 11,
                      color:
                        chance >= 20
                          ? "#6ee7a0"
                          : chance >= 5
                            ? "#f0c75e"
                            : "#ff8a95",
                    }}
                  >
                    {chance}%
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="obj-btn icon"
                    onClick={() => onRemove(i)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            );
          })}
          {drops.length === 0 && (
            <tr>
              <td colSpan={4} style={{ color: "var(--text-muted)" }}>
                Sin drops.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SpellsTab({
  spells,
  spellById,
  catalog,
  onAdd,
  onRemove,
}: {
  spells: SpellEntry[];
  spellById: Map<number, PickerSpell>;
  catalog: PickerSpell[];
  onAdd: (spell: PickerSpell) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <SpellPicker spells={catalog} onPick={onAdd} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {spells.map((e, i) => {
          const s = spellById.get(e.idSpell);
          return (
            <div
              key={`${e.idSpell}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                border: "1px solid var(--border)",
                borderRadius: 8,
              }}
            >
              <span>
                [{e.idSpell}] {s?.name ?? "¿?"}
              </span>
              <button
                type="button"
                className="obj-btn"
                onClick={() => onRemove(i)}
              >
                Quitar
              </button>
            </div>
          );
        })}
        {spells.length === 0 && (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Sin hechizos. Buscá y agregá.
          </div>
        )}
      </div>
    </div>
  );
}
