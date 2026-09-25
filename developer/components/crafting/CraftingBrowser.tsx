"use client";

import "@/app/objects.css";
import "@/app/npcs.css";
import "@/app/crafting.css";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LazyGrh } from "@/components/objects/LazyGrh";
import { ObjectPicker, type PickerObject } from "@/components/pickers/ObjectPicker";
import {
  CRAFTING_CATEGORIES,
  PROFESSION_METAS,
  RECIPE_LEVELS,
  RECIPE_LEVEL_DEFS,
  buildRecipeItemName,
  createCraftingDraft,
  createRecipeObjectData,
  getCraftingPresentation,
  getProfessionLabel,
  getRecipeLevelDefinition,
  hasCriticalErrors,
  isRecipeLevel,
  normalizeMaterials,
  validateCraftingRecipe,
  type CraftingRecipe,
  type RecipeLevel,
  type SmeltingRecipe,
  type ValidationIssue,
} from "@/lib/game-data/crafting";

type ObjSum = PickerObject & {
  objType?: number;
  recipeId?: number;
  recipeForItemId?: number;
  recipeLevel?: number;
  subtipo?: number;
};

type Bundle = {
  crafting: CraftingRecipe[];
  smelting: SmeltingRecipe[];
  objects: ObjSum[];
  nextCraftingId: number;
  nextRecipeItemId: number;
  inconsistencies: Array<{ craftingId: number; kind: string; message: string }>;
  hints: { crafting: string[]; smelting: string[] };
};

type TabId = "general" | "materials" | "result" | "recipe" | "advanced";

export function CraftingBrowser() {
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<"crafting" | "smelting">("crafting");
  const [q, setQ] = useState("");
  const [qDebounced, setQDebounced] = useState("");
  const [prof, setProf] = useState<string>("all");
  const [cat, setCat] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CraftingRecipe | null>(null);
  const [baseline, setBaseline] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [tab, setTab] = useState<TabId>("general");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [smeltingDraft, setSmeltingDraft] = useState<SmeltingRecipe[]>([]);
  const [smeltBaseline, setSmeltBaseline] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setQDebounced(q.trim().toLowerCase()), 180);
    return () => window.clearTimeout(t);
  }, [q]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/crafting");
      const data = (await res.json()) as Bundle;
      setBundle(data);
      setSmeltingDraft(structuredClone(data.smelting ?? []));
      setSmeltBaseline(JSON.stringify(data.smelting ?? []));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const objById = useMemo(() => {
    const m = new Map<number, ObjSum>();
    for (const o of bundle?.objects ?? []) m.set(o.id, o);
    return m;
  }, [bundle]);

  const nameMap = useMemo(() => {
    const m = new Map<number, string>();
    for (const o of bundle?.objects ?? []) m.set(o.id, o.name);
    return m;
  }, [bundle]);

  const activeCrafting = useMemo(
    () => (bundle?.crafting ?? []).filter((r) => !r.deleted),
    [bundle],
  );

  const profCounts = useMemo(() => {
    const c: Record<string, number> = { all: activeCrafting.length };
    for (const p of PROFESSION_METAS) c[p.id] = 0;
    for (const r of activeCrafting) {
      c[r.profession] = (c[r.profession] ?? 0) + 1;
    }
    return c;
  }, [activeCrafting]);

  const filtered = useMemo(() => {
    let list = activeCrafting;
    if (prof !== "all") list = list.filter((r) => r.profession === prof);
    if (cat) list = list.filter((r) => r.category === cat);
    if (levelFilter !== "all") {
      list = list.filter((r) => String(r.level) === levelFilter);
    }
    if (qDebounced) {
      list = list.filter((r) => {
        const result = nameMap.get(r.itemId) ?? "";
        const mats = (r.materials ?? [])
          .map((m) => nameMap.get(m.itemId) ?? "")
          .join(" ");
        return (
          String(r.id).includes(qDebounced) ||
          result.toLowerCase().includes(qDebounced) ||
          mats.toLowerCase().includes(qDebounced) ||
          r.category.toLowerCase().includes(qDebounced) ||
          getProfessionLabel(r.profession).toLowerCase().includes(qDebounced) ||
          String(r.itemId).includes(qDebounced)
        );
      });
    }
    return [...list].sort((a, b) => a.id - b.id);
  }, [activeCrafting, prof, cat, levelFilter, qDebounced, nameMap]);

  const dirty = draft != null && JSON.stringify(draft) !== baseline;
  const smeltDirty = JSON.stringify(smeltingDraft) !== smeltBaseline;

  function selectRecipe(r: CraftingRecipe) {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Descartar?")) return;
    setIsNew(false);
    setDraft(structuredClone(r));
    setBaseline(JSON.stringify(r));
    setSelectedId(r.id);
    setTab("general");
  }

  function startNew() {
    if (dirty && !confirm("Hay cambios sin guardar. ¿Descartar?")) return;
    const id = bundle?.nextCraftingId ?? 1;
    const d = createCraftingDraft({ id, level: 10 });
    d.sortOrder = id;
    setIsNew(true);
    setDraft(d);
    setBaseline(JSON.stringify(d));
    setSelectedId(id);
    setTab("general");
  }

  function duplicateSelected() {
    if (!draft || !bundle) return;
    if (dirty && !confirm("Hay cambios sin guardar. ¿Descartar y duplicar?")) {
      return;
    }
    const id = bundle.nextCraftingId;
    const d: CraftingRecipe = {
      ...structuredClone(draft),
      id,
      sortOrder: id,
      recipeItemId: 0,
      deleted: false,
    };
    setIsNew(true);
    setDraft(d);
    setBaseline(JSON.stringify(d));
    setSelectedId(id);
    setMessage("Borrador duplicado — se creará nueva receta al guardar");
  }

  const setField = useCallback((key: keyof CraftingRecipe, value: unknown) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  const issues: ValidationIssue[] = useMemo(() => {
    if (!draft || !bundle) return [];
    const recipeObj =
      draft.recipeItemId && objById.get(draft.recipeItemId)
        ? (bundle.objects.find((o) => o.id === draft.recipeItemId) as unknown as
            | Record<string, unknown>
            | undefined)
        : null;
    return validateCraftingRecipe(draft, {
      isNew,
      existingCraftIds: new Set(bundle.crafting.map((c) => c.id)),
      objectIds: new Set(bundle.objects.map((o) => o.id)),
      expectCreateRecipe: isNew || !draft.recipeItemId,
      recipeObj:
        !isNew && draft.recipeItemId
          ? {
              recipeId: recipeObj?.recipeId,
              recipeForItemId: recipeObj?.recipeForItemId,
              recipeLevel: recipeObj?.recipeLevel,
            }
          : null,
    });
  }, [draft, bundle, isNew, objById]);

  const previewRecipeObj = useMemo(() => {
    if (!draft || !isRecipeLevel(Number(draft.level))) return null;
    const level = Number(draft.level) as RecipeLevel;
    const name = buildRecipeItemName(
      nameMap.get(draft.itemId) ?? `Objeto ${draft.itemId}`,
    );
    if (isNew || !draft.recipeItemId) {
      return createRecipeObjectData({
        resultName: nameMap.get(draft.itemId) ?? "",
        recipeId: draft.id,
        recipeForItemId: draft.itemId,
        recipeLevel: level,
      });
    }
    return {
      name,
      grhIndex: RECIPE_LEVEL_DEFS[level].grhIndex,
      recipeLevel: level,
      recipeId: draft.id,
      recipeForItemId: draft.itemId,
      id: draft.recipeItemId,
    };
  }, [draft, isNew, nameMap]);

  async function save() {
    if (!draft) return;
    if (hasCriticalErrors(issues)) {
      setMessage("Hay errores críticos.");
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const payload: CraftingRecipe = {
        ...draft,
        materials: normalizeMaterials(draft.materials ?? []),
        skill: 0,
        recipeItemId: isNew ? 0 : draft.recipeItemId,
      };
      const res = await fetch("/api/crafting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-crafting",
          recipe: payload,
        }),
      });
      const body = (await res.json()) as {
        error?: string;
        craftingId?: number;
        recipeItemId?: number;
        hints?: string[];
      };
      if (!res.ok) throw new Error(body.error ?? "Error");
      setMessage(
        `Guardado crafting #${body.craftingId} + receta #${body.recipeItemId}`,
      );
      await reload();
      setIsNew(false);
      setSelectedId(body.craftingId ?? draft.id);
      // reload will refresh list; re-select after
      const refreshed = await fetch("/api/crafting").then((r) => r.json()) as Bundle;
      const found = refreshed.crafting.find((c) => c.id === body.craftingId);
      if (found) {
        setDraft(structuredClone(found));
        setBaseline(JSON.stringify(found));
      }
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  async function softDelete() {
    if (!draft || isNew) return;
    if (!confirm(
      `¿Marcar crafting #${draft.id} como eliminado?\n\nEl ítem receta en objs.json se conserva (puede estar en inventarios). Tras /recargarcrafting ya no se podrá aprender ni fabricar.`,
    )) return;
    const res = await fetch("/api/crafting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "soft-delete", craftingId: draft.id }),
    });
    if (!res.ok) {
      const b = (await res.json()) as { error?: string };
      setMessage(b.error ?? "Error");
      return;
    }
    setDraft(null);
    setSelectedId(null);
    setBaseline("");
    await reload();
  }

  async function repairRecipe() {
    if (!draft) return;
    const res = await fetch("/api/crafting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "repair-recipe", recipe: draft }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(body.error ?? "Error");
      return;
    }
    setMessage("Receta reparada");
    await reload();
  }

  async function saveSmelting() {
    setSaving(true);
    try {
      const res = await fetch("/api/crafting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-smelting",
          smelting: smeltingDraft,
        }),
      });
      if (!res.ok) {
        const b = (await res.json()) as { error?: string };
        throw new Error(b.error ?? "Error");
      }
      setSmeltBaseline(JSON.stringify(smeltingDraft));
      setMessage("Smelting guardado");
      await reload();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  function addMaterial(obj: PickerObject) {
    if (!draft) return;
    const mats = [...(draft.materials ?? [])];
    const existing = mats.find((m) => m.itemId === obj.id);
    if (existing) {
      if (confirm("Material ya existe. ¿Sumar +1 a la cantidad?")) {
        existing.amount += 1;
        setField("materials", mats);
      }
      return;
    }
    mats.push({ itemId: obj.id, amount: 1 });
    setField("materials", mats);
  }

  if (loading || !bundle) {
    return <p style={{ color: "var(--text-muted)" }}>Cargando crafting…</p>;
  }

  const resultObj = draft ? objById.get(draft.itemId) : null;
  const levelDef = draft
    ? getRecipeLevelDefinition(Number(draft.level ?? 0))
    : null;

  return (
    <div className="obj-page">
      <div className="obj-header">
        <div className="obj-header-title">
          <div className="obj-header-icon" aria-hidden>
            ⚒
          </div>
          <div>
            <h1>Crafting / Smelting</h1>
            <p>
              Gestiona todas las recetas del juego. Crea, edita y configura sus
              requerimientos y niveles.
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className={`obj-btn ${section === "crafting" ? "primary" : ""}`}
            onClick={() => setSection("crafting")}
          >
            Crafting
          </button>
          <button
            type="button"
            className={`obj-btn ${section === "smelting" ? "primary" : ""}`}
            onClick={() => setSection("smelting")}
          >
            Smelting
          </button>
          {section === "crafting" && (
            <button type="button" className="obj-btn primary" onClick={startNew}>
              + Nueva receta
            </button>
          )}
        </div>
      </div>

      {message && (
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>{message}</div>
      )}

      {bundle.inconsistencies.length > 0 && (
        <div
          style={{
            padding: 10,
            borderRadius: 8,
            background: "rgba(240,199,94,0.12)",
            border: "1px solid #f0c75e",
            fontSize: 12,
          }}
        >
          <strong>{bundle.inconsistencies.length} inconsistencia(s)</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {bundle.inconsistencies.slice(0, 8).map((i, idx) => (
              <li key={idx}>
                Crafting #{i.craftingId}: {i.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {section === "smelting" ? (
        <SmeltingPanel
          drafts={smeltingDraft}
          setDrafts={setSmeltingDraft}
          objs={bundle.objects}
          dirty={smeltDirty}
          saving={saving}
          onSave={() => void saveSmelting()}
          hints={bundle.hints.smelting}
        />
      ) : (
        <div className="craft-layout">
          <div>
            <div className="obj-search-row">
              <div className="obj-search">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Buscar por nombre, resultado, ingrediente o categoría..."
                />
              </div>
              <select
                className="obj-select"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {CRAFTING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className="obj-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="all">Nivel: Todos</option>
                {RECIPE_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="obj-chips">
              <button
                type="button"
                className={`obj-chip ${prof === "all" ? "active" : ""}`}
                onClick={() => setProf("all")}
              >
                Todas ({profCounts.all})
              </button>
              {PROFESSION_METAS.filter((p) => (profCounts[p.id] ?? 0) > 0 || p.id !== "tailoring").map(
                (p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`obj-chip ${prof === p.id ? "active" : ""}`}
                    onClick={() => setProf(p.id)}
                  >
                    {p.label} ({profCounts[p.id] ?? 0})
                  </button>
                ),
              )}
            </div>

            <div className="obj-table-wrap">
              <table className="obj-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Resultado</th>
                    <th>Ingredientes</th>
                    <th>Nivel</th>
                    <th>Categoría</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const p = getCraftingPresentation(r, nameMap);
                    const res = objById.get(r.itemId);
                    return (
                      <tr
                        key={r.id}
                        style={{
                          background:
                            selectedId === r.id
                              ? "rgba(61,139,253,0.08)"
                              : undefined,
                          cursor: "pointer",
                        }}
                        onClick={() => selectRecipe(r)}
                      >
                        <td>{r.id}</td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                            }}
                          >
                            <LazyGrh grhIndex={res?.grhIndex ?? 0} size={32} />
                            <span>
                              [{r.itemId}] {p.resultName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="craft-mat-icons">
                            {(r.materials ?? []).slice(0, 4).map((m) => {
                              const o = objById.get(m.itemId);
                              return (
                                <span key={m.itemId} className="craft-mat-chip">
                                  <LazyGrh
                                    grhIndex={o?.grhIndex ?? 0}
                                    size={22}
                                  />
                                  ×{m.amount}
                                </span>
                              );
                            })}
                            {(r.materials?.length ?? 0) > 4 && (
                              <span className="craft-mat-chip">
                                +{(r.materials?.length ?? 0) - 4}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`craft-badge-level ${p.levelTone}`}
                          >
                            {p.levelLabel}
                          </span>
                        </td>
                        <td>{r.category}</td>
                        <td>
                          <div className="obj-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="obj-btn icon"
                              title="Editar"
                              onClick={() => selectRecipe(r)}
                            >
                              ✎
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
              Mostrando {filtered.length} de {activeCrafting.length} recetas
            </div>
          </div>

          <div>
            {!draft ? (
              <div className="npc-panel" style={{ color: "var(--text-muted)" }}>
                Seleccioná una receta o creá una nueva.
              </div>
            ) : (
              <div className="npc-panel">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      ← Crafting #{draft.id}
                      {resultObj ? ` — ${resultObj.name}` : ""}
                    </div>
                    {dirty && (
                      <div style={{ color: "#f0c75e", fontSize: 12 }}>
                        ● Hay cambios sin guardar
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="obj-btn"
                      onClick={duplicateSelected}
                    >
                      Duplicar
                    </button>
                    {!isNew && (
                      <button
                        type="button"
                        className="obj-btn danger"
                        onClick={() => void softDelete()}
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
                      {saving ? "…" : "Guardar"}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 12,
                    alignItems: "center",
                  }}
                >
                  <LazyGrh grhIndex={resultObj?.grhIndex ?? 0} size={64} />
                  <div>
                    <strong>{resultObj?.name ?? "Sin resultado"}</strong>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {getProfessionLabel(draft.profession)} · Nivel{" "}
                      {draft.level}
                    </div>
                  </div>
                </div>

                <div className="npc-tabs">
                  {(
                    [
                      ["general", "General"],
                      ["materials", "Ingredientes"],
                      ["result", "Resultado"],
                      ["recipe", "Receta"],
                      ["advanced", "Avanzado"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      className={`npc-tab ${tab === id ? "active" : ""}`}
                      onClick={() => setTab(id)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tab === "general" && (
                  <div className="npc-grid">
                    <label className="npc-field">
                      Profesión
                      <select
                        value={draft.profession}
                        onChange={(e) => setField("profession", e.target.value)}
                      >
                        {PROFESSION_METAS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="npc-field">
                      Categoría
                      <select
                        value={draft.category}
                        onChange={(e) => setField("category", e.target.value)}
                      >
                        {CRAFTING_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        Nivel requerido
                      </div>
                      <div className="craft-level-picker">
                        {RECIPE_LEVELS.map((l) => (
                          <button
                            key={l}
                            type="button"
                            className={`craft-level-btn ${
                              Number(draft.level) === l
                                ? `active ${RECIPE_LEVEL_DEFS[l].badgeTone}`
                                : ""
                            }`}
                            onClick={() => setField("level", l)}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 8,
                        }}
                      >
                        Nivel necesario para crear este objeto y nivel de los
                        NPCs que pueden dropear esta receta.
                      </p>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginBottom: 6,
                        }}
                      >
                        Objeto resultado
                      </div>
                      {resultObj && (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <LazyGrh grhIndex={resultObj.grhIndex ?? 0} size={40} />
                          <span>
                            [{resultObj.id}] {resultObj.name}
                          </span>
                        </div>
                      )}
                      <ObjectPicker
                        objects={bundle.objects}
                        onPick={(o) => setField("itemId", o.id)}
                        placeholder="Cambiar resultado..."
                      />
                    </div>
                  </div>
                )}

                {tab === "materials" && (
                  <div>
                    <ObjectPicker
                      objects={bundle.objects}
                      onPick={addMaterial}
                      placeholder="Buscar material por nombre, ID o GRH..."
                    />
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {(draft.materials ?? []).map((m, i) => {
                        const o = objById.get(m.itemId);
                        return (
                          <div
                            key={`${m.itemId}-${i}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: 8,
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                            }}
                          >
                            <LazyGrh grhIndex={o?.grhIndex ?? 0} size={36} />
                            <div style={{ flex: 1 }}>
                              [{m.itemId}] {o?.name ?? "¿?"}
                            </div>
                            <label className="npc-field" style={{ width: 90 }}>
                              Cant.
                              <input
                                type="number"
                                min={1}
                                value={m.amount}
                                onChange={(e) => {
                                  const mats = [...(draft.materials ?? [])];
                                  mats[i] = {
                                    ...m,
                                    amount: Math.max(
                                      1,
                                      Math.floor(Number(e.target.value) || 1),
                                    ),
                                  };
                                  setField("materials", mats);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              className="obj-btn icon"
                              onClick={() =>
                                setField(
                                  "materials",
                                  (draft.materials ?? []).filter(
                                    (_, j) => j !== i,
                                  ),
                                )
                              }
                            >
                              🗑
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {tab === "result" && resultObj && (
                  <div>
                    <LazyGrh grhIndex={resultObj.grhIndex ?? 0} size={96} />
                    <dl
                      style={{
                        marginTop: 10,
                        fontSize: 12,
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: "4px 10px",
                      }}
                    >
                      <dt className="muted">ID</dt>
                      <dd style={{ margin: 0 }}>{resultObj.id}</dd>
                      <dt className="muted">Nombre</dt>
                      <dd style={{ margin: 0 }}>{resultObj.name}</dd>
                      <dt className="muted">GRH</dt>
                      <dd style={{ margin: 0 }}>{resultObj.grhIndex}</dd>
                      <dt className="muted">Valor</dt>
                      <dd style={{ margin: 0 }}>{resultObj.valor}</dd>
                    </dl>
                    <Link
                      className="obj-btn"
                      href={`/objects/${resultObj.id}`}
                      style={{ marginTop: 10, display: "inline-flex" }}
                    >
                      Ver en Objetos
                    </Link>
                  </div>
                )}

                {tab === "recipe" && (
                  <div>
                    <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {isNew || !draft.recipeItemId
                        ? "Se creará automáticamente al guardar."
                        : "Item receta vinculado al crafting."}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <LazyGrh
                        grhIndex={Number(previewRecipeObj?.grhIndex ?? levelDef?.grhIndex ?? 0)}
                        size={64}
                      />
                      <div>
                        <strong>
                          {String(
                            previewRecipeObj?.name ??
                              buildRecipeItemName(resultObj?.name ?? ""),
                          )}
                        </strong>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          ID:{" "}
                          {isNew || !draft.recipeItemId
                            ? `(nuevo ~${bundle.nextRecipeItemId})`
                            : draft.recipeItemId}{" "}
                          · Nivel {draft.level} · GRH{" "}
                          {levelDef?.grhIndex ?? "?"}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 14,
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: "var(--text-muted)",
                      }}
                    >
                      <div>CRAFTING #{draft.id}</div>
                      <div>↕</div>
                      <div>
                        RECETA #
                        {draft.recipeItemId || bundle.nextRecipeItemId}
                      </div>
                      <div>↓</div>
                      <div>ITEM RESULTADO #{draft.itemId}</div>
                    </div>
                    {!isNew &&
                      bundle.inconsistencies.some(
                        (i) => i.craftingId === draft.id,
                      ) && (
                        <button
                          type="button"
                          className="obj-btn"
                          style={{ marginTop: 10 }}
                          onClick={() => void repairRecipe()}
                        >
                          Reparar receta
                        </button>
                      )}
                  </div>
                )}

                {tab === "advanced" && (
                  <div className="npc-grid">
                    <label className="npc-field">
                      sortOrder
                      <input
                        type="number"
                        value={Number(draft.sortOrder ?? draft.id)}
                        onChange={(e) =>
                          setField("sortOrder", Number(e.target.value) || 0)
                        }
                      />
                    </label>
                    <label className="npc-field">
                      skill (legacy, siempre 0 en datos)
                      <input type="number" value={0} disabled />
                    </label>
                    <label className="npc-field">
                      recipeItemId
                      <input
                        type="number"
                        value={Number(draft.recipeItemId ?? 0)}
                        onChange={(e) =>
                          setField(
                            "recipeItemId",
                            Number(e.target.value) || 0,
                          )
                        }
                      />
                    </label>
                    <pre
                      style={{
                        gridColumn: "1 / -1",
                        fontSize: 11,
                        background: "#0f141c",
                        padding: 10,
                        borderRadius: 8,
                        overflow: "auto",
                        maxHeight: 240,
                      }}
                    >
                      {JSON.stringify(draft, null, 2)}
                    </pre>
                  </div>
                )}

                <div
                  style={{
                    marginTop: 14,
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    fontSize: 12,
                  }}
                >
                  <strong>ESTADO</strong>
                  <div style={{ marginTop: 6 }}>
                    {hasCriticalErrors(issues) ? (
                      <span style={{ color: "#ff8a95" }}>
                        ● {issues.filter((i) => i.level === "error").length}{" "}
                        error(es)
                      </span>
                    ) : (
                      <span style={{ color: "#6ee7a0" }}>
                        ● Receta válida
                      </span>
                    )}
                  </div>
                  {issues.length > 0 && (
                    <ul style={{ margin: "6px 0 0", paddingLeft: 16 }}>
                      {issues.map((i, idx) => (
                        <li
                          key={idx}
                          style={{
                            color:
                              i.level === "error" ? "#ff8a95" : "#f0c75e",
                          }}
                        >
                          {i.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {(bundle.hints.crafting ?? []).length > 0 && (
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}
                  >
                    {bundle.hints.crafting.map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SmeltingPanel({
  drafts,
  setDrafts,
  objs,
  dirty,
  saving,
  onSave,
  hints,
}: {
  drafts: SmeltingRecipe[];
  setDrafts: (d: SmeltingRecipe[]) => void;
  objs: ObjSum[];
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  hints: string[];
}) {
  const byId = useMemo(() => {
    const m = new Map<number, ObjSum>();
    for (const o of objs) m.set(o.id, o);
    return m;
  }, [objs]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        {dirty && (
          <span style={{ color: "#f0c75e", alignSelf: "center", fontSize: 12 }}>
            ● Sin guardar
          </span>
        )}
        <button
          type="button"
          className="obj-btn primary"
          disabled={!dirty || saving}
          onClick={onSave}
        >
          Guardar smelting
        </button>
      </div>
      <div className="obj-table-wrap" style={{ marginTop: 12 }}>
        <table className="obj-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Mineral</th>
              <th>Cantidad</th>
              <th>Lingote</th>
              <th>Skill fundición</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((r, i) => {
              const mineral = byId.get(r.mineralItemId);
              const ingot = byId.get(r.ingotItemId);
              return (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <LazyGrh grhIndex={mineral?.grhIndex ?? 0} size={28} />
                      [{r.mineralItemId}] {mineral?.name}
                    </div>
                  </td>
                  <td>
                    <input
                      className="npc-input"
                      style={{ width: 70 }}
                      type="number"
                      value={r.mineralsPerIngot}
                      onChange={(e) => {
                        const next = [...drafts];
                        next[i] = {
                          ...r,
                          mineralsPerIngot: Math.max(
                            1,
                            Number(e.target.value) || 1,
                          ),
                        };
                        setDrafts(next);
                      }}
                    />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <LazyGrh grhIndex={ingot?.grhIndex ?? 0} size={28} />
                      [{r.ingotItemId}] {ingot?.name}
                    </div>
                  </td>
                  <td>
                    <input
                      className="npc-input"
                      style={{ width: 80 }}
                      type="number"
                      value={r.requiredSkill}
                      onChange={(e) => {
                        const next = [...drafts];
                        next[i] = {
                          ...r,
                          requiredSkill: Math.max(
                            0,
                            Number(e.target.value) || 0,
                          ),
                        };
                        setDrafts(next);
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
        Smelting usa skill de minería (25/50/100), no los niveles 10–50 del
        crafting.
      </p>
      {hints?.map((h, i) => (
        <div key={i} style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {h}
        </div>
      ))}
    </div>
  );
}
