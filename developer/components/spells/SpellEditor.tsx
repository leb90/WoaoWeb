"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import "@/app/spells.css";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FxPicker, type FxItem } from "@/components/pickers/FxPicker";
import { FxAnimatedPreview } from "./FxAnimatedPreview";
import { SpellTypeBadge } from "./SpellTypeBadge";
import {
  FLAG_EFFECTS,
  INTENSITY_EFFECTS,
  SPELL_TARGET_METAS,
  SPELL_TYPE_METAS,
  boolToFlag,
  createSpellDraft,
  flagToBool,
  getResourceModLabel,
  getSpellPresentation,
  getSpellTabs,
  getSubeHpLabel,
  hasCriticalErrors,
  isSummonSpell,
  validateSpell,
  type SpellData,
  type SpellTabId,
  type ValidationIssue,
} from "@/lib/game-data/spells";

type MetaPayload = {
  nextId: number;
  types: typeof SPELL_TYPE_METAS;
  targets: typeof SPELL_TARGET_METAS;
  fxs: FxItem[];
  npcs: Array<{ id: number; name: string }>;
  existingIds: number[];
  hints: string[];
};

type Props = { mode: "edit"; id: number } | { mode: "create" };

const TAB_LABELS: Record<SpellTabId, string> = {
  general: "General",
  effects: "Efectos",
  animation: "Efectos / Animación",
  conditions: "Condiciones",
  target: "Objetivo",
  advanced: "Avanzado",
};

function num(d: SpellData, k: string): number {
  const v = d[k];
  return typeof v === "number" && Number.isFinite(v) ? v : Number(v) || 0;
}

export function SpellEditor(props: Props) {
  const router = useRouter();
  const isNew = props.mode === "create";
  const editId = props.mode === "edit" ? props.id : null;

  const [data, setData] = useState<SpellData | null>(null);
  const [baseline, setBaseline] = useState("");
  const [assignedId, setAssignedId] = useState<number | null>(editId);
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [hints, setHints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<SpellTabId>("general");
  const [showJson, setShowJson] = useState(false);
  const [npcQ, setNpcQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      try {
        const metaRes = await fetch("/api/spells/meta");
        const metaBody = (await metaRes.json()) as MetaPayload;
        if (cancelled) return;
        setMeta(metaBody);
        setHints(metaBody.hints ?? []);

        if (isNew) {
          const raw = sessionStorage.getItem("woao.dev.spellDraft");
          let draft = createSpellDraft();
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as { data?: SpellData };
              if (parsed.data) draft = parsed.data;
            } catch {
              /* ignore */
            }
          }
          setData(draft);
          setBaseline(JSON.stringify(draft));
          setAssignedId(metaBody.nextId);
        } else if (editId != null) {
          const res = await fetch(`/api/spells?id=${editId}`);
          const body = (await res.json()) as {
            data?: SpellData;
            hints?: string[];
            error?: string;
          };
          if (!res.ok || !body.data) throw new Error(body.error ?? "Error");
          setData(body.data);
          setBaseline(JSON.stringify(body.data));
          setAssignedId(editId);
          setHints(body.hints ?? metaBody.hints ?? []);
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

  const presentation = useMemo(
    () => (data ? getSpellPresentation(data) : null),
    [data],
  );
  const tabs = useMemo(() => (data ? getSpellTabs(data) : []), [data]);

  const issues = useMemo(() => {
    if (!data || !meta) return [] as ValidationIssue[];
    return validateSpell(data, {
      isNew,
      currentId: assignedId ?? undefined,
      existingIds: new Set(meta.existingIds),
      fxIds: new Set(meta.fxs.map((f) => f.id)),
      npcIds: new Set(meta.npcs.map((n) => n.id)),
    });
  }, [data, meta, isNew, assignedId]);

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
        const res = await fetch("/api/spells", {
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
        sessionStorage.removeItem("woao.dev.spellDraft");
        setBaseline(JSON.stringify(data));
        setHints(body.hints ?? []);
        setMessage("Creado y guardado (api + server spells.json)");
        router.replace(`/spells/${body.id ?? assignedId}`);
      } else {
        const res = await fetch("/api/spells", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: assignedId, data }),
        });
        const body = (await res.json()) as { error?: string; hints?: string[] };
        if (!res.ok) throw new Error(body.error ?? "Error");
        setBaseline(JSON.stringify(data));
        setHints(body.hints ?? []);
        setMessage("Guardado (backup + api/server)");
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
      router.push("/spells");
      return;
    }
    setData(JSON.parse(baseline) as SpellData);
  }

  function leaveGuard(href: string) {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Salir de todos modos?")) {
      return;
    }
    router.push(href);
  }

  function duplicateDraft() {
    if (!data) return;
    sessionStorage.setItem(
      "woao.dev.spellDraft",
      JSON.stringify({
        mode: "create",
        data: {
          ...structuredClone(data),
          name: `${String(data.name ?? "Hechizo")} - copia`,
        },
      }),
    );
    leaveGuard("/spells/new");
  }

  if (loading || !data) {
    return (
      <div className="obj-page">
        <p style={{ color: "var(--text-muted)" }}>Cargando hechizo…</p>
      </div>
    );
  }

  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const npcFiltered = (meta?.npcs ?? [])
    .filter(
      (n) =>
        !npcQ.trim() ||
        String(n.id).includes(npcQ) ||
        n.name.toLowerCase().includes(npcQ.toLowerCase()),
    )
    .slice(0, 30);

  return (
    <div className="obj-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            type="button"
            className="obj-btn"
            onClick={() => leaveGuard("/spells")}
          >
            ← Hechizos
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>
              #{assignedId} — {String(data.name ?? "")}
            </h1>
            {dirty && (
              <div style={{ color: "#f0c75e", fontSize: 12 }}>
                ● Hay cambios sin guardar
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="obj-btn" onClick={duplicateDraft}>
            Duplicar
          </button>
          <button
            type="button"
            className="obj-btn"
            style={{ borderColor: "var(--obj-danger)", color: "#ff8a95" }}
            disabled={!dirty}
            onClick={discard}
          >
            Descartar
          </button>
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

      <div className="spell-editor">
        <div>
          <div className="npc-panel" style={{ marginBottom: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr",
                gap: 14,
              }}
            >
              <FxAnimatedPreview
                fxId={num(data, "fxGrh")}
                loops={num(data, "loops")}
                showCharacter={false}
                size={100}
              />
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <strong style={{ fontSize: 18 }}>{String(data.name)}</strong>
                  <SpellTypeBadge data={data} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  ID: {assignedId} · Mana: {num(data, "manaRequired")} · Skill:{" "}
                  {num(data, "minSkill")}
                </div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  {String(data.desc ?? "")}
                </div>
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
            {tab === "general" && (
              <div className="npc-grid">
                <label className="npc-field" style={{ gridColumn: "1 / -1" }}>
                  Nombre
                  <input
                    value={String(data.name ?? "")}
                    onChange={(e) => setField("name", e.target.value)}
                  />
                </label>
                <label className="npc-field" style={{ gridColumn: "1 / -1" }}>
                  Descripción
                  <textarea
                    rows={3}
                    value={String(data.desc ?? "")}
                    onChange={(e) => setField("desc", e.target.value)}
                  />
                  <span style={{ fontSize: 11 }}>
                    {String(data.desc ?? "").length} caracteres
                  </span>
                </label>
                <label className="npc-field">
                  Tipo de hechizo
                  <select
                    value={num(data, "type")}
                    onChange={(e) => setField("type", Number(e.target.value))}
                  >
                    {SPELL_TYPE_METAS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.id})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="npc-field">
                  Objetivo
                  <select
                    value={num(data, "target")}
                    onChange={(e) => setField("target", Number(e.target.value))}
                  >
                    {SPELL_TARGET_METAS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.id})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="npc-field">
                  Mana
                  <input
                    type="number"
                    value={num(data, "manaRequired")}
                    onChange={(e) =>
                      setField("manaRequired", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field">
                  Skill
                  <input
                    type="number"
                    value={num(data, "minSkill")}
                    onChange={(e) =>
                      setField("minSkill", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field">
                  Stamina
                  <input
                    type="number"
                    value={num(data, "staRequired")}
                    onChange={(e) =>
                      setField("staRequired", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field">
                  Nivel mínimo
                  <input
                    type="number"
                    value={num(data, "minNivel")}
                    onChange={(e) =>
                      setField("minNivel", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field" style={{ gridColumn: "1 / -1" }}>
                  Palabras mágicas
                  <input
                    value={String(data.palabrasMagicas ?? "")}
                    onChange={(e) => setField("palabrasMagicas", e.target.value)}
                  />
                </label>
                <label className="npc-field">
                  Loops
                  <input
                    type="number"
                    value={num(data, "loops")}
                    onChange={(e) =>
                      setField("loops", Number(e.target.value) || 0)
                    }
                  />
                </label>
              </div>
            )}

            {tab === "effects" && (
              <EffectsTab data={data} setField={setField} />
            )}

            {tab === "animation" && (
              <div>
                <label className="npc-field" style={{ marginBottom: 10 }}>
                  FX (catálogo fxs.json)
                </label>
                <FxPicker
                  fxs={meta?.fxs ?? []}
                  value={num(data, "fxGrh")}
                  onPick={(f) => setField("fxGrh", f.id)}
                />
                <div className="npc-grid" style={{ marginTop: 12 }}>
                  <label className="npc-field">
                    Loops (JSON — no afecta FX del cliente)
                    <input
                      type="number"
                      value={num(data, "loops")}
                      onChange={(e) =>
                        setField("loops", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                  <label className="npc-field">
                    WAV
                    <input
                      type="number"
                      value={num(data, "wav")}
                      onChange={(e) =>
                        setField("wav", Number(e.target.value) || 0)
                      }
                    />
                  </label>
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-muted)",
                    marginTop: 8,
                  }}
                >
                  Preview: mismo catálogo FX → GRH + frames + speed + offsets
                  que el cliente. `loops`/`staffAffected`/`noesquivar`/
                  `staRequired` se preservan en JSON pero el runtime actual no
                  los consume para FX/cast. WAV: ID (archivos en
                  frontend/public/sounds si existen).
                </p>
              </div>
            )}

            {tab === "conditions" && (
              <div className="npc-grid">
                <label className="npc-field">
                  Skill mínimo
                  <input
                    type="number"
                    value={num(data, "minSkill")}
                    onChange={(e) =>
                      setField("minSkill", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field">
                  Nivel mínimo
                  <input
                    type="number"
                    value={num(data, "minNivel")}
                    onChange={(e) =>
                      setField("minNivel", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field">
                  Mana requerido
                  <input
                    type="number"
                    value={num(data, "manaRequired")}
                    onChange={(e) =>
                      setField("manaRequired", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <label className="npc-field">
                  Stamina requerida
                  <input
                    type="number"
                    value={num(data, "staRequired")}
                    onChange={(e) =>
                      setField("staRequired", Number(e.target.value) || 0)
                    }
                  />
                </label>
                <div
                  className="npc-switch-row"
                  style={{ gridColumn: "1 / -1", marginTop: 8 }}
                >
                  <FlagSwitch
                    label="Afectado por bonus de staff"
                    checked={flagToBool(data.staffAffected)}
                    onChange={(v) => setField("staffAffected", boolToFlag(v))}
                  />
                  <FlagSwitch
                    label="No puede esquivarse"
                    checked={flagToBool(data.noesquivar)}
                    onChange={(v) => setField("noesquivar", boolToFlag(v))}
                  />
                </div>
              </div>
            )}

            {tab === "target" && (
              <div>
                <label className="npc-field">
                  Puede lanzarse sobre
                  <select
                    value={num(data, "target")}
                    onChange={(e) => setField("target", Number(e.target.value))}
                  >
                    {SPELL_TARGET_METAS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label} ({t.id}) — {t.description}
                      </option>
                    ))}
                  </select>
                </label>
                {isSummonSpell(data) && (
                  <div style={{ marginTop: 16 }}>
                    <strong>Invocación</strong>
                    <input
                      className="npc-input"
                      style={{ marginTop: 8 }}
                      placeholder="Buscar NPC..."
                      value={npcQ}
                      onChange={(e) => setNpcQ(e.target.value)}
                    />
                    <div style={{ marginTop: 8, maxHeight: 200, overflow: "auto" }}>
                      {npcFiltered.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="npc-picker-row"
                          onClick={() => setField("numNpc", n.id)}
                        >
                          [{n.id}] {n.name}
                          {num(data, "numNpc") === n.id ? " ✓" : ""}
                        </button>
                      ))}
                    </div>
                    <div className="npc-grid" style={{ marginTop: 10 }}>
                      <label className="npc-field">
                        numNpc
                        <input
                          type="number"
                          value={num(data, "numNpc")}
                          onChange={(e) =>
                            setField("numNpc", Number(e.target.value) || 0)
                          }
                        />
                      </label>
                      <label className="npc-field">
                        Cantidad
                        <input
                          type="number"
                          value={num(data, "cant")}
                          onChange={(e) =>
                            setField("cant", Number(e.target.value) || 0)
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === "advanced" && (
              <div>
                <button
                  type="button"
                  className="obj-btn"
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
                      maxHeight: 420,
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
              VISTA PREVIA DEL FX
            </strong>
            <div style={{ marginTop: 8 }}>
              <FxAnimatedPreview
                fxId={num(data, "fxGrh")}
                loops={num(data, "loops")}
                showCharacter
                size={240}
              />
            </div>
          </div>

          <div className="npc-panel">
            <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
              ESTADO
            </strong>
            <div style={{ marginTop: 8, fontSize: 13 }}>
              {errors.length === 0 ? (
                <span style={{ color: "#6ee7a0" }}>
                  ● Hechizo válido
                  {warnings.length
                    ? `. ${warnings.length} warning(s).`
                    : " — No se encontraron errores."}
                </span>
              ) : (
                <span style={{ color: "#ff8a95" }}>
                  ● {errors.length} error(es)
                  {warnings.length ? `, ${warnings.length} warning(s)` : ""}
                </span>
              )}
            </div>
            {issues.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12 }}>
                {issues.map((i, idx) => (
                  <li
                    key={idx}
                    style={{
                      color: i.level === "error" ? "#ff8a95" : "#f0c75e",
                    }}
                  >
                    {i.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="npc-panel">
            <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
              RESUMEN
            </strong>
            <div style={{ marginTop: 8, fontSize: 12 }}>
              {presentation?.summary}
            </div>
            <dl
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "4px 10px",
              }}
            >
              <dt className="muted">Categoría</dt>
              <dd style={{ margin: 0 }}>{presentation?.label}</dd>
              <dt className="muted">Objetivo</dt>
              <dd style={{ margin: 0 }}>{presentation?.targetLabel}</dd>
              <dt className="muted">FX</dt>
              <dd style={{ margin: 0 }}>{num(data, "fxGrh") || "—"}</dd>
              <dt className="muted">WAV</dt>
              <dd style={{ margin: 0 }}>{num(data, "wav")}</dd>
              <dt className="muted">Loops</dt>
              <dd style={{ margin: 0 }}>{num(data, "loops")}</dd>
            </dl>
          </div>

          <div className="npc-panel">
            <strong style={{ fontSize: 12, color: "var(--text-muted)" }}>
              INFORMACIÓN TÉCNICA
            </strong>
            <dl
              style={{
                margin: "8px 0 0",
                fontSize: 11,
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "3px 8px",
                color: "var(--text-muted)",
              }}
            >
              <dt>ID</dt>
              <dd style={{ margin: 0 }}>{assignedId}</dd>
              <dt>type</dt>
              <dd style={{ margin: 0 }}>{num(data, "type")}</dd>
              <dt>target</dt>
              <dd style={{ margin: 0 }}>{num(data, "target")}</dd>
              <dt>fxGrh</dt>
              <dd style={{ margin: 0 }}>{num(data, "fxGrh")}</dd>
              <dt>subeHp</dt>
              <dd style={{ margin: 0 }}>
                {num(data, "subeHp")} ({getSubeHpLabel(num(data, "subeHp"))})
              </dd>
            </dl>
          </div>

          {hints.length > 0 && (
            <div
              className="npc-panel"
              style={{ fontSize: 11, color: "var(--text-muted)" }}
            >
              {hints.map((h, i) => (
                <div key={i}>{h}</div>
              ))}
            </div>
          )}
        </aside>
      </div>
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

function ResourceBlock({
  title,
  subeKey,
  minKey,
  maxKey,
  data,
  setField,
  allowArea,
}: {
  title: string;
  subeKey: string;
  minKey: string;
  maxKey: string;
  data: SpellData;
  setField: (k: string, v: unknown) => void;
  allowArea?: boolean;
}) {
  const mod = num(data, subeKey);
  const active = mod !== 0;
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <strong>{title}</strong>
        <FlagSwitch
          label="Activo"
          checked={active}
          onChange={(on) => setField(subeKey, on ? (mod > 0 ? mod : 1) : 0)}
        />
      </div>
      {active && (
        <div className="npc-grid" style={{ marginTop: 10 }}>
          <label className="npc-field">
            Tipo
            <select
              value={mod}
              onChange={(e) => setField(subeKey, Number(e.target.value))}
            >
              <option value={1}>{getResourceModLabel(1)}</option>
              <option value={2}>{getResourceModLabel(2)}</option>
              {allowArea && (
                <>
                  <option value={3}>{getSubeHpLabel(3)}</option>
                  <option value={4}>{getSubeHpLabel(4)}</option>
                </>
              )}
            </select>
          </label>
          <label className="npc-field">
            Mínimo
            <input
              type="number"
              value={num(data, minKey)}
              onChange={(e) => setField(minKey, Number(e.target.value) || 0)}
            />
          </label>
          <label className="npc-field">
            Máximo
            <input
              type="number"
              value={num(data, maxKey)}
              onChange={(e) => setField(maxKey, Number(e.target.value) || 0)}
            />
          </label>
        </div>
      )}
    </div>
  );
}

function EffectsTab({
  data,
  setField,
}: {
  data: SpellData;
  setField: (k: string, v: unknown) => void;
}) {
  return (
    <div>
      <ResourceBlock
        title="Salud (HP)"
        subeKey="subeHp"
        minKey="minHp"
        maxKey="maxHp"
        data={data}
        setField={setField}
        allowArea
      />
      <ResourceBlock
        title="Mana"
        subeKey="subeMana"
        minKey="minMana"
        maxKey="maxMana"
        data={data}
        setField={setField}
      />
      <ResourceBlock
        title="Agilidad"
        subeKey="subeAg"
        minKey="minAg"
        maxKey="maxAg"
        data={data}
        setField={setField}
      />
      <ResourceBlock
        title="Fuerza"
        subeKey="subeFz"
        minKey="minFz"
        maxKey="maxFz"
        data={data}
        setField={setField}
      />
      <ResourceBlock
        title="Hambre"
        subeKey="subeHam"
        minKey="minHam"
        maxKey="maxHam"
        data={data}
        setField={setField}
      />
      <ResourceBlock
        title="Sed"
        subeKey="subeSed"
        minKey="minSed"
        maxKey="maxSed"
        data={data}
        setField={setField}
      />

      <strong style={{ fontSize: 13 }}>Efectos / flags</strong>
      <div className="npc-switch-row" style={{ marginTop: 8 }}>
        {FLAG_EFFECTS.map((f) => (
          <FlagSwitch
            key={f.key}
            label={f.label}
            checked={flagToBool(data[f.key])}
            onChange={(on) => setField(f.key, boolToFlag(on))}
          />
        ))}
      </div>

      <strong style={{ fontSize: 13, display: "block", marginTop: 14 }}>
        Intensidad (valores numéricos reales)
      </strong>
      {INTENSITY_EFFECTS.map((f) => {
        const v = num(data, f.key);
        const on = v > 0;
        return (
          <div
            key={f.key}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: 12,
              marginTop: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FlagSwitch
                label={f.label}
                checked={on}
                onChange={(checked) =>
                  setField(f.key, checked ? (v > 0 ? v : f.defaultOn) : 0)
                }
              />
              {on && (
                <label className="npc-field" style={{ maxWidth: 120 }}>
                  Valor
                  <input
                    type="number"
                    min={1}
                    value={v}
                    onChange={(e) =>
                      setField(f.key, Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                </label>
              )}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
              {f.hint}
            </div>
          </div>
        );
      })}
    </div>
  );
}
