"use client";

import "@/app/objects.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GrhPreview } from "@/components/ui/GrhPreview";
import { ObjectTypeBadge } from "./ObjectTypeBadge";
import {
  ALL_CLASS_IDS,
  FLAG_LABELS,
  GAME_CLASSES,
  OBJECT_TYPE_METAS,
  OBJ_TYPE,
  POTION_TYPES,
  allowedClassesToBlocked,
  boolToFlag,
  createObjectDraft,
  flagToBool,
  getAllowedClassIds,
  getClassCategoryLabel,
  getEditorSchema,
  getObjectPresentation,
  getObjectTypeMeta,
  hasCriticalErrors,
  listUnknownKeys,
  validateObject,
  type ObjData,
  type ValidationIssue,
} from "@/lib/game-data/objects";

type MetaPayload = {
  nextId: number;
  spells: Array<{ id: number; name: string }>;
  objectLabels: Array<{ id: number; name: string }>;
  classes: typeof GAME_CLASSES;
};

type Props =
  | { mode: "edit"; id: number }
  | { mode: "create" };

export function ObjectEditor(props: Props) {
  const router = useRouter();
  const isNew = props.mode === "create";
  const editId = props.mode === "edit" ? props.id : null;

  const [data, setData] = useState<ObjData | null>(null);
  const [baseline, setBaseline] = useState("");
  const [assignedId, setAssignedId] = useState<number | null>(editId);
  const [hints, setHints] = useState<string[]>([]);
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [typeChangePending, setTypeChangePending] = useState<number | null>(
    null,
  );
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    advanced: true,
  });

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      setLoading(true);
      try {
        const metaRes = await fetch("/api/objects/meta");
        const metaBody = (await metaRes.json()) as MetaPayload;
        if (cancelled) return;
        setMeta(metaBody);

        if (isNew) {
          const raw = sessionStorage.getItem("woao.dev.objectDraft");
          let draft: ObjData = createObjectDraft(OBJ_TYPE.armas);
          if (raw) {
            try {
              const parsed = JSON.parse(raw) as { data?: ObjData };
              if (parsed.data) draft = parsed.data;
            } catch {
              /* ignore */
            }
          }
          setData(draft);
          setBaseline(JSON.stringify(draft));
          setAssignedId(metaBody.nextId);
          setHints([
            "Borrador: no se escribió objs.json todavía.",
            "Al guardar: backup + import-game-data / recargarobjs.",
          ]);
        } else if (editId != null) {
          const res = await fetch(`/api/objects/${editId}`);
          const body = (await res.json()) as {
            data?: ObjData;
            hints?: string[];
            error?: string;
          };
          if (!res.ok || !body.data) throw new Error(body.error ?? "Error");
          setData(body.data);
          setBaseline(JSON.stringify(body.data));
          setAssignedId(editId);
          setHints(body.hints ?? []);
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

  const schema = useMemo(
    () => getEditorSchema(Number(data?.objType ?? 0)),
    [data?.objType],
  );

  const presentation = useMemo(
    () => (data ? getObjectPresentation(data) : null),
    [data],
  );

  const issues = useMemo(() => {
    if (!data || !meta) return [] as ValidationIssue[];
    return validateObject(data, {
      isNew,
      currentId: assignedId ?? undefined,
      spellIds: new Set(meta.spells.map((s) => s.id)),
      objectIds: new Set(meta.objectLabels.map((o) => o.id)),
    });
  }, [data, meta, isNew, assignedId]);

  const unknownKeys = useMemo(
    () => (data ? listUnknownKeys(data) : []),
    [data],
  );

  const allowedClasses = useMemo(
    () => (data ? getAllowedClassIds(data) : ALL_CLASS_IDS),
    [data],
  );

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
        const res = await fetch("/api/objects", {
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
        sessionStorage.removeItem("woao.dev.objectDraft");
        setBaseline(JSON.stringify(data));
        setHints(body.hints ?? []);
        setMessage("Creado y guardado");
        router.replace(`/objects/${body.id ?? assignedId}`);
      } else {
        const res = await fetch(`/api/objects/${assignedId}`, {
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
      router.push("/objects");
      return;
    }
    setData(JSON.parse(baseline) as ObjData);
  }

  function requestTypeChange(nextType: number) {
    if (!data) return;
    if (Number(data.objType) === nextType) return;
    setTypeChangePending(nextType);
  }

  function confirmTypeChange() {
    if (typeChangePending == null) return;
    setField("objType", typeChangePending);
    setTypeChangePending(null);
  }

  function setAllowedClasses(ids: number[]) {
    setField("clasesNoPermitidas", allowedClassesToBlocked(ids));
  }

  function toggleClass(id: number) {
    const set = new Set(allowedClasses);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setAllowedClasses([...set]);
  }

  function leaveGuard(href: string) {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Salir de todos modos?")) {
      return;
    }
    router.push(href);
  }

  if (loading || !data || assignedId == null) {
    return <p style={{ color: "var(--text-muted)" }}>Cargando objeto…</p>;
  }

  const name = String(data.name ?? "");
  const objType = Number(data.objType ?? 0);
  const fieldError = (field: string) =>
    issues.find((i) => i.field === field && i.level === "error")?.message;

  return (
    <div className="obj-page obj-editor">
      <div className="obj-editor-top">
        <div className="obj-breadcrumb">
          <a
            href="/objects"
            onClick={(e) => {
              e.preventDefault();
              leaveGuard("/objects");
            }}
          >
            ← Objetos
          </a>
          {" / "}
          <strong style={{ color: "var(--text)" }}>{name || "Sin nombre"}</strong>
        </div>
        {dirty && (
          <span className="obj-dirty">
            <span>●</span> Hay cambios sin guardar
          </span>
        )}
        <div className="obj-editor-actions">
          <button
            type="button"
            className="obj-btn"
            onClick={() => {
              const draft = {
                ...structuredClone(data),
                name: `${name || "Objeto"} - copia`,
              };
              sessionStorage.setItem(
                "woao.dev.objectDraft",
                JSON.stringify({ mode: "create", data: draft }),
              );
              router.push("/objects/new");
            }}
          >
            Duplicar
          </button>
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
            disabled={saving || hasCriticalErrors(issues)}
            onClick={() => void save()}
            title="Ctrl+S"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      <div className="obj-form-col">
        <div className="obj-quick">
          <GrhPreview grhIndex={Number(data.grhIndex ?? 0)} size={72} />
          <div className="obj-quick-meta">
            <h2>{name || "Sin nombre"}</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                ID: {assignedId}
                {isNew ? " (borrador)" : ""}
              </span>
              <ObjectTypeBadge objType={objType} />
              {presentation && presentation.summary !== "—" && (
                <span className="obj-badge neutral">
                  {presentation.typeIcon} {presentation.summary}
                </span>
              )}
            </div>
            <div className="obj-quick-fields">
              <label className={`obj-field ${fieldError("grhIndex") ? "error" : ""}`}>
                GRH
                <input
                  type="number"
                  value={Number(data.grhIndex ?? 0)}
                  onChange={(e) => setField("grhIndex", Number(e.target.value))}
                />
                {fieldError("grhIndex") && (
                  <span className="obj-field-error">{fieldError("grhIndex")}</span>
                )}
              </label>
              <label className="obj-field">
                Valor
                <input
                  type="number"
                  value={Number(data.valor ?? 0)}
                  onChange={(e) => setField("valor", Number(e.target.value))}
                />
              </label>
              <label className="obj-field">
                Animación
                <input
                  type="number"
                  value={Number(data.anim ?? 0)}
                  onChange={(e) => setField("anim", Number(e.target.value))}
                />
              </label>
            </div>
          </div>
        </div>

        {unknownKeys.length > 0 && (
          <div className="obj-info-box">
            Este objeto contiene propiedades avanzadas ({unknownKeys.length})
            que se conservan al guardar aunque no aparezcan en el formulario.
          </div>
        )}

        {/* GENERAL */}
        <Section
          title="General"
          open={!collapsed.general}
          onToggle={() =>
            setCollapsed((c) => ({ ...c, general: !c.general }))
          }
        >
          <label className={`obj-field ${fieldError("name") ? "error" : ""}`}>
            Nombre
            <input
              value={name}
              onChange={(e) => setField("name", e.target.value)}
            />
            {fieldError("name") && (
              <span className="obj-field-error">{fieldError("name")}</span>
            )}
          </label>
          <label className="obj-field">
            Tipo
            <select
              value={objType}
              onChange={(e) => requestTypeChange(Number(e.target.value))}
            >
              {OBJECT_TYPE_METAS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.label}
                </option>
              ))}
              {!OBJECT_TYPE_METAS.some((t) => t.id === objType) && (
                <option value={objType}>Tipo {objType}</option>
              )}
            </select>
          </label>
          <label className="obj-field">
            GRH
            <input
              type="number"
              value={Number(data.grhIndex ?? 0)}
              onChange={(e) => setField("grhIndex", Number(e.target.value))}
            />
          </label>
          <label className="obj-field">
            Valor
            <input
              type="number"
              value={Number(data.valor ?? 0)}
              onChange={(e) => setField("valor", Number(e.target.value))}
            />
          </label>
          <label className="obj-field">
            Animación
            <input
              type="number"
              value={Number(data.anim ?? 0)}
              onChange={(e) => setField("anim", Number(e.target.value))}
            />
          </label>
          {schema.showSubtype && (
            <label className="obj-field">
              Subtipo
              <input
                type="number"
                value={Number(data.subtipo ?? 0)}
                onChange={(e) => setField("subtipo", Number(e.target.value))}
              />
              <span style={{ fontSize: 10 }}>
                Armadura: 1=casco, 2=escudo · Anillo: 4=resist. mágica
              </span>
            </label>
          )}
        </Section>

        {schema.sections.includes("combat") && (
          <Section
            title="Combate"
            open={!collapsed.combat}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, combat: !c.combat }))
            }
          >
            {schema.showHit && (
              <>
                <NumField
                  label="Daño mínimo"
                  value={Number(data.minHit ?? 0)}
                  onChange={(v) => setField("minHit", v)}
                  error={fieldError("minHit")}
                />
                <NumField
                  label="Daño máximo"
                  value={Number(data.maxHit ?? 0)}
                  onChange={(v) => setField("maxHit", v)}
                />
              </>
            )}
            {schema.showProjectile && (
              <FlagSwitch
                checked={flagToBool(data.proyectil)}
                label={FLAG_LABELS.proyectil.label}
                onChange={(on) => setField("proyectil", boolToFlag(on))}
              />
            )}
            {schema.showApu && (
              <FlagSwitch
                checked={flagToBool(data.apu)}
                label={FLAG_LABELS.apu.label}
                onChange={(on) => setField("apu", boolToFlag(on))}
              />
            )}
          </Section>
        )}

        {schema.sections.includes("defense") && (
          <Section
            title="Defensa"
            open={!collapsed.defense}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, defense: !c.defense }))
            }
          >
            {schema.showDef && (
              <>
                <NumField
                  label="Defensa mínima"
                  value={Number(data.minDef ?? 0)}
                  onChange={(v) => setField("minDef", v)}
                  error={fieldError("minDef")}
                />
                <NumField
                  label="Defensa máxima"
                  value={Number(data.maxDef ?? 0)}
                  onChange={(v) => setField("maxDef", v)}
                />
              </>
            )}
            {schema.showDefMag && (
              <>
                <NumField
                  label="Def. mágica mín."
                  value={Number(data.minDefMag ?? 0)}
                  onChange={(v) => setField("minDefMag", v)}
                  error={fieldError("minDefMag")}
                />
                <NumField
                  label="Def. mágica máx."
                  value={Number(data.maxDefMag ?? 0)}
                  onChange={(v) => setField("maxDefMag", v)}
                />
              </>
            )}
            {schema.showMagicRes && (
              <NumField
                label="Resistencia mágica"
                value={Number(data.resistenciaMagica ?? 0)}
                onChange={(v) => setField("resistenciaMagica", v)}
              />
            )}
            {objType === OBJ_TYPE.escudos && (
              <NumField
                label="Porcentaje (evasión)"
                value={Number(data.porcentaje ?? 0)}
                onChange={(v) => setField("porcentaje", v)}
              />
            )}
          </Section>
        )}

        {schema.sections.includes("potion") && (
          <Section
            title="Efecto de poción"
            open={!collapsed.potion}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, potion: !c.potion }))
            }
          >
            <label className="obj-field">
              Tipo de poción
              <select
                value={Number(data.tipoPocion ?? 0)}
                onChange={(e) =>
                  setField("tipoPocion", Number(e.target.value))
                }
              >
                {POTION_TYPES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <NumField
              label="Modificador mínimo"
              value={Number(data.minModificador ?? 0)}
              onChange={(v) => setField("minModificador", v)}
              error={fieldError("minModificador")}
            />
            <NumField
              label="Modificador máximo"
              value={Number(data.maxModificador ?? 0)}
              onChange={(v) => setField("maxModificador", v)}
            />
            <NumField
              label="Porcentaje"
              value={Number(data.porcentaje ?? 0)}
              onChange={(v) => setField("porcentaje", v)}
            />
          </Section>
        )}

        {schema.sections.includes("consumable") && (
          <Section
            title="Consumo"
            open={!collapsed.consumable}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, consumable: !c.consumable }))
            }
          >
            {objType === OBJ_TYPE.comida ? (
              <>
                <NumField
                  label="Hambre mín."
                  value={Number(data.minHam ?? 0)}
                  onChange={(v) => setField("minHam", v)}
                />
                <NumField
                  label="Hambre máx."
                  value={Number(data.maxHam ?? 0)}
                  onChange={(v) => setField("maxHam", v)}
                />
              </>
            ) : (
              <>
                <NumField
                  label="Sed mín."
                  value={Number(data.minSed ?? data.minAgu ?? 0)}
                  onChange={(v) => setField("minSed", v)}
                />
                <NumField
                  label="Sed máx."
                  value={Number(data.maxSed ?? 0)}
                  onChange={(v) => setField("maxSed", v)}
                />
              </>
            )}
          </Section>
        )}

        {schema.sections.includes("door") && (
          <Section
            title={objType === OBJ_TYPE.puerta ? "Puerta" : "Contenedor"}
            open={!collapsed.door}
            onToggle={() => setCollapsed((c) => ({ ...c, door: !c.door }))}
          >
            <ObjRefField
              label="Gráfico / objeto abierta"
              value={Number(data.indexAbierta ?? 0)}
              labels={meta?.objectLabels ?? []}
              onChange={(v) => setField("indexAbierta", v)}
            />
            <ObjRefField
              label="Gráfico / objeto cerrada"
              value={Number(data.indexCerrada ?? 0)}
              labels={meta?.objectLabels ?? []}
              onChange={(v) => setField("indexCerrada", v)}
            />
            {objType === OBJ_TYPE.puerta && (
              <FlagSwitch
                checked={flagToBool(data.llave)}
                label="Requiere llave (casas)"
                hint="Flag truthy: openDoor exige llaves de casa."
                onChange={(on) => setField("llave", boolToFlag(on))}
              />
            )}
          </Section>
        )}

        {schema.sections.includes("spell") && (
          <Section
            title="Hechizo"
            open={!collapsed.spell}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, spell: !c.spell }))
            }
          >
            <SpellField
              value={Number(data.spellIndex ?? 0)}
              spells={meta?.spells ?? []}
              onChange={(v) => setField("spellIndex", v)}
              error={fieldError("spellIndex")}
            />
          </Section>
        )}

        {schema.sections.includes("classes") && (
          <Section
            title="Restricciones de clase"
            open={!collapsed.classes}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, classes: !c.classes }))
            }
            full
          >
            <div style={{ marginBottom: 8, fontSize: 12, color: "var(--text-muted)" }}>
              Clases permitidas (se guarda como complemento en{" "}
              <code>clasesNoPermitidas</code>)
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setAllowedClasses(ALL_CLASS_IDS)}
              >
                Seleccionar todas
              </button>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setAllowedClasses([])}
              >
                Quitar todas
              </button>
              {(["combat", "magic", "worker"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className="obj-btn"
                  onClick={() => {
                    const ids = GAME_CLASSES.filter((c) => c.category === cat).map(
                      (c) => c.id,
                    );
                    setAllowedClasses([
                      ...new Set([...allowedClasses, ...ids]),
                    ]);
                  }}
                >
                  + {getClassCategoryLabel(cat)}
                </button>
              ))}
            </div>
            <div className="obj-class-grid">
              {GAME_CLASSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`obj-class ${allowedClasses.includes(c.id) ? "on" : ""}`}
                  onClick={() => toggleClass(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </Section>
        )}

        {schema.sections.includes("properties") && (
          <Section
            title="Propiedades"
            open={!collapsed.properties}
            onToggle={() =>
              setCollapsed((c) => ({ ...c, properties: !c.properties }))
            }
            full
          >
            <div className="obj-switch-grid">
              {schema.propertyFlags.map((key) => {
                const metaF = FLAG_LABELS[key] ?? { label: key };
                const rawOn = flagToBool(data[key]);
                const checked = metaF.inverted ? !rawOn : rawOn;
                return (
                  <FlagSwitch
                    key={key}
                    checked={checked}
                    label={metaF.label}
                    hint={metaF.hint}
                    onChange={(on) => {
                      const storeOn = metaF.inverted ? !on : on;
                      setField(key, boolToFlag(storeOn));
                    }}
                  />
                );
              })}
            </div>
          </Section>
        )}

        <Section
          title="Avanzado"
          open={advancedOpen}
          onToggle={() => setAdvancedOpen((v) => !v)}
          full
        >
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)" }}>
            Campos legacy / poco usados. Preferí no tocarlos salvo necesidad.
          </p>
          {(
            [
              "staffDamageBonus",
              "magicDamageBonus",
              "magicDamagePercent",
              "magicPenetration",
              "resistenciaMagica",
              "objetoEspecial",
              "mataHobbits",
              "cerrada",
              "minSkill",
            ] as const
          ).map((key) => (
            <NumField
              key={key}
              label={key}
              value={Number(data[key] ?? 0)}
              onChange={(v) => setField(key, v)}
            />
          ))}
          <button
            type="button"
            className="obj-btn"
            onClick={() => setShowJson(true)}
          >
            Ver JSON
          </button>
        </Section>

        {message && (
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{message}</div>
        )}
      </div>

      <aside className="obj-side">
        <div className="obj-side-card">
          <h3>Información</h3>
          <div className="obj-info-box">
            {hints.length
              ? hints.map((h) => <div key={h}>{h}</div>)
              : "Los cambios requieren import / recargar objs en el game server."}
          </div>
        </div>
        <div className="obj-side-card">
          <h3>Vista previa gráfica</h3>
          <div className="obj-preview-box">
            <GrhPreview grhIndex={Number(data.grhIndex ?? 0)} size={96} />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
            GRH: {Number(data.grhIndex ?? 0)} | Anim: {Number(data.anim ?? 0)}
          </div>
        </div>
        <div className="obj-side-card">
          <h3>Resumen del objeto</h3>
          <div className="obj-summary-list">
            <div>
              <span>Nombre</span>
              <span>{name || "—"}</span>
            </div>
            <div>
              <span>ID</span>
              <span>{assignedId}</span>
            </div>
            <div>
              <span>Tipo</span>
              <ObjectTypeBadge objType={objType} />
            </div>
            <div>
              <span>Subtipo</span>
              <span>{Number(data.subtipo ?? 0)}</span>
            </div>
            <div>
              <span>Valor</span>
              <span>{Number(data.valor ?? 0)}</span>
            </div>
            <div>
              <span>GRH</span>
              <span>{Number(data.grhIndex ?? 0)}</span>
            </div>
            {presentation && presentation.summary !== "—" && (
              <div>
                <span>Detalle</span>
                <span>{presentation.summary}</span>
              </div>
            )}
          </div>
        </div>
        <div className="obj-side-card">
          <h3>Estado de validación</h3>
          {hasCriticalErrors(issues) ? (
            <div className="obj-valid bad">
              {issues.filter((i) => i.level === "error").length} error(es)
              {issues.filter((i) => i.level === "warning").length
                ? `, ${issues.filter((i) => i.level === "warning").length} advertencia(s)`
                : ""}
              <ul style={{ margin: "8px 0 0", paddingLeft: 16, fontSize: 12 }}>
                {issues.map((i, idx) => (
                  <li key={idx}>
                    [{i.level}] {i.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="obj-valid ok">
              ✓ Objeto válido
              {issues.length > 0 && (
                <span style={{ color: "var(--obj-warn)", fontSize: 12 }}>
                  ({issues.length} advertencia
                  {issues.length === 1 ? "" : "s"})
                </span>
              )}
            </div>
          )}
        </div>
        <div className="obj-side-card">
          <h3>Acciones rápidas</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              type="button"
              className="obj-btn"
              onClick={() => {
                const draft = {
                  ...structuredClone(data),
                  name: `${name || "Objeto"} - copia`,
                };
                sessionStorage.setItem(
                  "woao.dev.objectDraft",
                  JSON.stringify({ mode: "create", data: draft }),
                );
                router.push("/objects/new");
              }}
            >
              Duplicar
            </button>
            {!isNew && (
              <Link href="/objects" className="obj-btn danger" style={{ justifyContent: "center" }}>
                Volver al listado
              </Link>
            )}
            <button
              type="button"
              className="obj-btn"
              onClick={() => setShowJson(true)}
            >
              {"</>"} Ver JSON
            </button>
          </div>
        </div>
      </aside>

      {typeChangePending != null && (
        <div className="obj-modal-backdrop" onClick={() => setTypeChangePending(null)}>
          <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Cambiar tipo de objeto</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              Pasar a <strong>{getObjectTypeMeta(typeChangePending).label}</strong>.
              Algunos campos dejarán de mostrarse en la interfaz, pero se
              conservan en los datos avanzados.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setTypeChangePending(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="obj-btn primary"
                onClick={confirmTypeChange}
              >
                Cambiar tipo conservando datos
              </button>
            </div>
          </div>
        </div>
      )}

      {showJson && (
        <div className="obj-modal-backdrop" onClick={() => setShowJson(false)}>
          <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
            <h2>JSON raw</h2>
            <pre
              style={{
                background: "#0a0e14",
                padding: 12,
                borderRadius: 8,
                overflow: "auto",
                maxHeight: "60vh",
                fontSize: 12,
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="obj-btn"
                onClick={() => setShowJson(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
  full,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className="obj-section">
      <div className="obj-section-h" onClick={onToggle}>
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <div className={`obj-section-b ${full ? "full" : ""}`}>{children}</div>
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  error?: string;
}) {
  return (
    <label className={`obj-field ${error ? "error" : ""}`}>
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {error && <span className="obj-field-error">{error}</span>}
    </label>
  );
}

function FlagSwitch({
  checked,
  label,
  hint,
  onChange,
}: {
  checked: boolean;
  label: string;
  hint?: string;
  onChange: (on: boolean) => void;
}) {
  return (
    <label className={`obj-switch ${checked ? "on" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <strong>{label}</strong>
        {hint && <span>{hint}</span>}
      </div>
    </label>
  );
}

function SpellField({
  value,
  spells,
  onChange,
  error,
}: {
  value: number;
  spells: Array<{ id: number; name: string }>;
  onChange: (v: number) => void;
  error?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return spells.slice(0, 40);
    return spells
      .filter(
        (s) =>
          String(s.id).includes(qq) || s.name.toLowerCase().includes(qq),
      )
      .slice(0, 40);
  }, [spells, q]);
  const selected = spells.find((s) => s.id === value);

  return (
    <div className={`obj-field ${error ? "error" : ""}`} style={{ gridColumn: "1 / -1" }}>
      <span>Spell asociado</span>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        Actual:{" "}
        <strong>
          {value
            ? `[${value}] ${selected?.name ?? "(desconocido)"}`
            : "Ninguno"}
        </strong>
      </div>
      <input
        placeholder="Buscar hechizo…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ marginTop: 6 }}
      >
        <option value="">Sin hechizo</option>
        {filtered.map((s) => (
          <option key={s.id} value={s.id}>
            [{s.id}] {s.name}
          </option>
        ))}
      </select>
      {error && <span className="obj-field-error">{error}</span>}
    </div>
  );
}

function ObjRefField({
  label,
  value,
  labels,
  onChange,
}: {
  label: string;
  value: number;
  labels: Array<{ id: number; name: string }>;
  onChange: (v: number) => void;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return labels.slice(0, 50);
    return labels
      .filter(
        (o) =>
          String(o.id).includes(qq) || o.name.toLowerCase().includes(qq),
      )
      .slice(0, 50);
  }, [labels, q]);
  const selected = labels.find((o) => o.id === value);

  return (
    <div className="obj-field" style={{ gridColumn: "1 / -1" }}>
      <span>{label}</span>
      <div style={{ fontSize: 12, marginBottom: 4 }}>
        {value
          ? `[${value}] ${selected?.name ?? "(desconocido)"}`
          : "Ninguno"}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          style={{ width: 100 }}
        />
        <input
          placeholder="Buscar objeto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        style={{ marginTop: 6 }}
      >
        <option value="">Ninguno</option>
        {filtered.map((o) => (
          <option key={o.id} value={o.id}>
            [{o.id}] {o.name}
          </option>
        ))}
      </select>
      {value > 0 && (
        <Link
          href={`/objects/${value}`}
          style={{ fontSize: 12, color: "var(--obj-accent)", marginTop: 6 }}
        >
          Abrir objeto {value}
        </Link>
      )}
    </div>
  );
}
