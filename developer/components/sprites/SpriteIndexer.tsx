"use client";

import { useEffect, useMemo, useState } from "react";
import { MannequinPreview } from "./MannequinPreview";

type Kind = "body" | "helmet" | "shield" | "weapon";
type Direction = "1" | "2" | "3" | "4" | "icon" | "ignore";

type Reference = {
  itemId: number;
  name: string;
  objType: number;
  subtipo: number;
  anim: number;
  cellWidth: number;
  cellHeight: number;
  frameCount: number;
  headOffsetX: number;
  headOffsetY: number;
  offsetX: number;
  offsetY: number;
  stats: Record<string, number>;
};

type Frame = { index: number; x: number; y: number; width: number; height: number };
type Row = { index: number; role: "animation" | "icon"; frames: Frame[] };

type Analysis = {
  jobId: string;
  width: number;
  height: number;
  rows: Row[];
  previews: Record<string, string[]>;
  suggestion: {
    iconRow: number | null;
    splitFrames: boolean;
    rows: Array<{ rowIndex: number; frameIndex?: number; direction: "1" | "2" | "3" | "4" }>;
  };
  reference: Reference;
  cellWidth: number;
  cellHeight: number;
  align: "bottom" | "center";
  contentScale: number;
};

const KINDS: Array<{ id: Kind; label: string; short: string }> = [
  { id: "body", label: "Armaduras / tunicas", short: "A" },
  { id: "helmet", label: "Cascos", short: "C" },
  { id: "shield", label: "Escudos", short: "E" },
  { id: "weapon", label: "Espadas / baculos", short: "W" },
];

const DIRECTIONS: Array<{ id: Direction; label: string }> = [
  { id: "2", label: "Sur (frente)" },
  { id: "1", label: "Norte (espalda)" },
  { id: "3", label: "Este" },
  { id: "4", label: "Oeste" },
  { id: "icon", label: "Solo icono 32x32" },
  { id: "ignore", label: "Ignorar" },
];

const STATS = [
  ["minHit", "Golpe min"],
  ["maxHit", "Golpe max"],
  ["minDef", "Def min"],
  ["maxDef", "Def max"],
  ["minDefMag", "Def mag min"],
  ["maxDefMag", "Def mag max"],
  ["resistenciaMagica", "Res. magica"],
  ["magicDamageBonus", "Dano magico"],
  ["valor", "Valor"],
] as const;

function kindLabel(kind: Kind) {
  return KINDS.find((item) => item.id === kind)?.label ?? kind;
}

function kindMark(kind: Kind) {
  return KINDS.find((item) => item.id === kind)?.short ?? "?";
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .toLowerCase();
}

function distance(a: string, b: string, maxDistance: number) {
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1;
  const previous = new Array<number>(b.length + 1);
  const current = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) previous[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;
    let rowMin = current[0];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > maxDistance) return maxDistance + 1;
    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }
  return previous[b.length];
}

function maxTypoDistance(token: string) {
  if (token.length <= 3) return 0;
  if (token.length <= 5) return 1;
  return 2;
}

function fuzzyTokenMatch(token: string, candidates: string[]) {
  const typoLimit = maxTypoDistance(token);
  for (const candidate of candidates) {
    if (candidate.includes(token) || token.includes(candidate)) return 0;
    if (typoLimit > 0 && distance(token, candidate, typoLimit) <= typoLimit) return 1;
  }
  return null;
}

function searchScore(query: string, item: Reference, kind: Kind) {
  const text = normalize(
    `${item.itemId} ${item.name} ${item.anim} ${item.objType} ${item.subtipo} ${kindLabel(kind)} ${item.cellWidth}x${item.cellHeight}`,
  ).trim();
  if (!query) return 0;
  if (text.includes(query)) return 0;

  const queryTokens = query.split(/\s+/).filter(Boolean);
  const candidates = text.split(/\s+/).filter(Boolean);
  let score = 0;
  for (const token of queryTokens) {
    const match = fuzzyTokenMatch(token, candidates);
    if (match === null) return null;
    score += match;
  }
  return score + Math.abs(candidates.length - queryTokens.length) * 0.01;
}

function statValue(stats: Record<string, number>, key: string) {
  return Number(stats[key] ?? 0);
}

export function SpriteIndexer() {
  const [kind, setKind] = useState<Kind>("body");
  const [references, setReferences] = useState<Reference[]>([]);
  const [referenceId, setReferenceId] = useState(369);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cellWidth, setCellWidth] = useState(26);
  const [cellHeight, setCellHeight] = useState(46);
  const [contentScale, setContentScale] = useState(1);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [rowRole, setRowRole] = useState<Record<number, Direction>>({});
  const [frameRole, setFrameRole] = useState<Record<string, Direction>>({});
  const [splitFrames, setSplitFrames] = useState(false);
  const [nudge, setNudge] = useState<Record<string, { dx: number; dy: number }>>({});
  const [name, setName] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});
  const [headOffsetX, setHeadOffsetX] = useState(0);
  const [headOffsetY, setHeadOffsetY] = useState(0);
  const [mode, setMode] = useState<"adjust" | "import">("adjust");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pendingReference, setPendingReference] = useState<Reference | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setError("");
    fetch(`/api/sprites/meta?kind=${kind}`)
      .then((response) => response.json())
      .then((data: { references?: Reference[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        if (!cancelled) setReferences(data.references ?? []);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se cargaron las referencias.");
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const visibleReferences = useMemo(() => {
    const text = normalize(debouncedQuery.trim());
    const list = text
      ? references
          .map((item) => ({ item, score: searchScore(text, item, kind) }))
          .filter((entry): entry is { item: Reference; score: number } => entry.score !== null)
          .sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name, "es"))
          .map((entry) => entry.item)
      : references;
    return list.slice(0, 220);
  }, [references, debouncedQuery, kind]);

  const selected = references.find((item) => item.itemId === referenceId) ?? references[0] ?? null;

  useEffect(() => {
    if (!references.length) return;
    const current = references.find((item) => item.itemId === referenceId);
    if (current) return;
    applyReference(references[0], { force: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [references, referenceId]);

  function applyReference(item: Reference, options?: { force?: boolean }) {
    if (dirty && !options?.force) {
      setPendingReference(item);
      return;
    }
    setReferenceId(item.itemId);
    setCellWidth(item.cellWidth);
    setCellHeight(item.cellHeight);
    setHeadOffsetX(item.headOffsetX);
    setHeadOffsetY(item.headOffsetY);
    setStats(item.stats);
    setName(item.name);
    setDirty(false);
    setMessage("");
  }

  function changeKind(next: Kind) {
    if (kind === next) return;
    setKind(next);
    setQuery("");
    setAnalysis(null);
    setDirty(false);
  }

  function markDirty() {
    if (mode === "import") setDirty(true);
  }

  async function analyze() {
    if (!file) {
      setError("Elegi una hoja de sprites.");
      return;
    }
    setBusy("Detectando frames...");
    setError("");
    setResult("");
    const form = new FormData();
    form.set("file", file);
    form.set("kind", kind);
    form.set("referenceItemId", String(referenceId));
    form.set("cellWidth", String(cellWidth));
    form.set("cellHeight", String(cellHeight));
    form.set("contentScale", String(contentScale));
    form.set("align", kind === "body" ? "bottom" : "center");
    const response = await fetch("/api/sprites/analyze", { method: "POST", body: form });
    const data = (await response.json()) as Analysis & { error?: string };
    setBusy("");
    if (!response.ok || data.error) {
      setError(data.error ?? "No se pudo analizar la hoja.");
      return;
    }
    setAnalysis(data);
    setCellWidth(data.cellWidth);
    setCellHeight(data.cellHeight);
    setContentScale(data.contentScale);
    setSplitFrames(data.suggestion.splitFrames);
    const roles: Record<number, Direction> = {};
    for (const row of data.rows) roles[row.index] = row.role === "icon" ? "icon" : "ignore";
    const frames: Record<string, Direction> = {};
    if (data.suggestion.splitFrames) {
      for (const assignment of data.suggestion.rows) {
        frames[`${assignment.rowIndex}-${assignment.frameIndex ?? 0}`] = assignment.direction;
      }
    } else {
      for (const assignment of data.suggestion.rows) roles[assignment.rowIndex] = assignment.direction;
    }
    setRowRole(roles);
    setFrameRole(frames);
    setNudge({});
    applyReference(data.reference, { force: true });
    setDirty(true);
  }

  async function commit() {
    if (!analysis) return;
    setBusy("Indexando...");
    setError("");
    const directions = splitFrames ? framesAsDirections() : rowsAsDirections();
    const iconRow = analysis.rows.find((row) => rowRole[row.index] === "icon");
    const response = await fetch("/api/sprites/commit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jobId: analysis.jobId,
        plan: {
          kind,
          cellWidth,
          cellHeight,
          align: kind === "body" ? "bottom" : "center",
          contentScale,
          directions,
          iconBox: iconRow?.frames[0],
          headOffsetX,
          headOffsetY,
          offsetX: analysis.reference.offsetX,
          offsetY: analysis.reference.offsetY,
          itemName: name,
          referenceItemId: referenceId,
          statOverrides: stats,
        },
      }),
    });
    const data = (await response.json()) as {
      error?: string;
      result?: { graphicFile: number; iconFile: number; iconGrh: number; animationId: number; itemId: number; frameCount: number };
    };
    setBusy("");
    if (!response.ok || data.error || !data.result) {
      setError(data.error ?? "No se pudo indexar.");
      return;
    }
    const created = data.result;
    setDirty(false);
    setResult(
      `Listo. PNG ${created.graphicFile}.png, icono ${created.iconFile}.png, GRH ${created.iconGrh}, animacion ${created.animationId}, item ${created.itemId} (${created.frameCount} frames).`,
    );
  }

  function rowsAsDirections() {
    return analysis!.rows
      .filter((row) => ["1", "2", "3", "4"].includes(rowRole[row.index] ?? ""))
      .map((row) => ({
        direction: rowRole[row.index],
        frames: row.frames.map((frame) => ({
          box: frame,
          ...(nudge[`${row.index}-${frame.index}`] ?? { dx: 0, dy: 0 }),
        })),
      }));
  }

  function framesAsDirections() {
    const grouped = new Map<Direction, Frame[]>();
    for (const row of analysis!.rows) {
      for (const frame of row.frames) {
        const role = frameRole[`${row.index}-${frame.index}`] ?? "ignore";
        if (role === "1" || role === "2" || role === "3" || role === "4") {
          grouped.set(role, [...(grouped.get(role) ?? []), frame]);
        }
      }
    }
    return [...grouped.entries()].map(([direction, frames]) => ({
      direction,
      frames: frames.map((frame) => {
        const row = analysis!.rows.find((entry) => entry.frames.includes(frame));
        return {
          box: frame,
          ...(nudge[`${row?.index ?? 0}-${frame.index}`] ?? { dx: 0, dy: 0 }),
        };
      }),
    }));
  }

  function draftFrames() {
    const frames: Record<"1" | "2" | "3" | "4", Array<{ src: string; nudgeKey: string }>> = {
      "1": [],
      "2": [],
      "3": [],
      "4": [],
    };
    if (!analysis) return frames;
    for (const row of analysis.rows) {
      row.frames.forEach((frame, index) => {
        const role = splitFrames ? frameRole[`${row.index}-${frame.index}`] : rowRole[row.index];
        if (role === "1" || role === "2" || role === "3" || role === "4") {
          const src = analysis.previews[String(row.index)]?.[index];
          if (src) frames[role].push({ src, nudgeKey: `${row.index}-${frame.index}` });
        }
      });
    }
    return frames;
  }

  function shift(key: string, dx: number, dy: number) {
    setNudge((current) => {
      const previous = current[key] ?? { dx: 0, dy: 0 };
      return { ...current, [key]: { dx: previous.dx + dx, dy: previous.dy + dy } };
    });
    setDirty(true);
  }

  async function copyConfiguration() {
    if (!selected) return;
    const payload = {
      kind,
      cellWidth,
      cellHeight,
      contentScale,
      headOffsetX,
      headOffsetY,
      offsetX: selected.offsetX,
      offsetY: selected.offsetY,
      stats,
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setMessage("Configuracion copiada al portapapeles.");
  }

  async function pasteConfiguration() {
    try {
      const text = await navigator.clipboard.readText();
      const payload = JSON.parse(text) as Partial<{
        cellWidth: number;
        cellHeight: number;
        contentScale: number;
        headOffsetX: number;
        headOffsetY: number;
        stats: Record<string, number>;
      }>;
      if (typeof payload.cellWidth === "number") setCellWidth(payload.cellWidth);
      if (typeof payload.cellHeight === "number") setCellHeight(payload.cellHeight);
      if (typeof payload.contentScale === "number") setContentScale(payload.contentScale);
      if (typeof payload.headOffsetX === "number") setHeadOffsetX(payload.headOffsetX);
      if (typeof payload.headOffsetY === "number") setHeadOffsetY(payload.headOffsetY);
      if (payload.stats) setStats(payload.stats);
      setDirty(true);
      setMessage("Configuracion pegada. Revisala antes de guardar.");
    } catch {
      setMessage("No pude pegar una configuracion valida.");
    }
  }

  function discardPending() {
    if (!pendingReference) return;
    const next = pendingReference;
    setPendingReference(null);
    applyReference(next, { force: true });
  }

  const selectedStats = selected?.stats ?? {};

  return (
    <div className="sprite-indexer">
      <header className="sprite-topbar">
        <div className="sprite-brand">
          <div className="sprite-brand-mark" aria-hidden="true">
            #
          </div>
          <div>
            <h1 className="sprite-title">Indexador de Sprites</h1>
            <p className="sprite-subtitle">Ajusta graficos existentes o importa una hoja nueva sin salir del flujo.</p>
          </div>
        </div>
        <div className="sprite-toolbar">
          <button type="button" className={`sprite-btn ${mode === "adjust" ? "is-active" : ""}`} onClick={() => setMode("adjust")}>
            Ajustar existente
          </button>
          <button type="button" className={`sprite-btn ${mode === "import" ? "is-active" : ""}`} onClick={() => setMode("import")}>
            Importar hoja
          </button>
          <button type="button" className="sprite-btn ghost" disabled>
            Guia
          </button>
        </div>
      </header>

      <div className="sprite-shell">
        <aside className="sprite-panel sprite-sidebar">
          <div className="sprite-panel-head">
            <span className="sprite-kicker">Buscar item</span>
            <span className="sprite-count">{visibleReferences.length} / {references.length}</span>
          </div>
          <div className="sprite-search">
            <input
              className="sprite-input"
              placeholder="Buscar por ID, nombre, anim, GRH o tipo..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="sprite-chip-row">
              {KINDS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`sprite-chip ${kind === item.id ? "is-active" : ""}`}
                  onClick={() => changeKind(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="sprite-list">
            {visibleReferences.map((item) => (
              <button
                key={item.itemId}
                type="button"
                className={`sprite-row ${selected?.itemId === item.itemId ? "is-selected" : ""}`}
                onClick={() => applyReference(item)}
              >
                <span className="sprite-thumb">{kindMark(kind)}</span>
                <span className="sprite-row-copy">
                  <span className="sprite-row-title">{item.itemId} - {item.name}</span>
                  <span className="sprite-row-meta">
                    {kindLabel(kind)} - anim {item.anim} - {item.frameCount} frames
                  </span>
                </span>
                <span className="sprite-row-id">{item.cellWidth}x{item.cellHeight}</span>
              </button>
            ))}
          </div>
          <div className="sprite-panel-head">
            <span className="sprite-meta">Busqueda con debounce 180 ms</span>
          </div>
        </aside>

        <main className="sprite-main">
          <section className="sprite-item-header">
            <div className="sprite-selected-preview">{kindMark(kind)}</div>
            <div style={{ minWidth: 0 }}>
              <div className="sprite-item-title">
                <h2>{selected ? `${selected.itemId} - ${selected.name}` : "Sin item seleccionado"}</h2>
                {selected ? <span className="sprite-badge">anim {selected.anim}</span> : null}
                <span className="sprite-badge">{kindLabel(kind)}</span>
                {dirty ? <span className="sprite-badge">Cambios sin guardar</span> : null}
              </div>
              <p className="sprite-subtitle">
                {mode === "adjust"
                  ? "Compara las cuatro vistas, corrige offsets y rota/intercambia sentidos desde el preview."
                  : "Usa esta referencia para detectar, asignar direcciones y crear el nuevo item."}
              </p>
            </div>
            <button type="button" className="sprite-btn primary" onClick={() => setMessage("En ajustes existentes, cada movimiento se guarda al ejecutarse.")}>
              Guardar cambios
            </button>
          </section>

          <section className="sprite-panel sprite-workspace">
            {mode === "adjust" ? (
              <div className="sprite-import">
                {selected && selected.anim > 0 ? (
                  <MannequinPreview key={`${kind}-${selected.anim}`} kind={kind} anim={selected.anim} gallery />
                ) : (
                  <p className="sprite-message">Ese item no tiene animacion para previsualizar.</p>
                )}
              </div>
            ) : (
              <div className="sprite-import">
                <div className="sprite-import-grid">
                  <input
                    className="sprite-input"
                    type="file"
                    accept="image/png,image/webp"
                    onChange={(event) => {
                      setFile(event.target.files?.[0] ?? null);
                      setDirty(true);
                    }}
                  />
                  <input className="sprite-input" type="number" value={cellWidth} onChange={(event) => { setCellWidth(Number(event.target.value)); markDirty(); }} title="Ancho de celda" />
                  <input className="sprite-input" type="number" value={cellHeight} onChange={(event) => { setCellHeight(Number(event.target.value)); markDirty(); }} title="Alto de celda" />
                  <input className="sprite-input" type="number" min={0.2} max={1} step={0.05} value={contentScale} onChange={(event) => { setContentScale(Number(event.target.value)); markDirty(); }} title="Escala dentro de la celda" />
                </div>
                <div className="sprite-toolbar">
                  <button type="button" className="sprite-btn primary" onClick={() => void analyze()} disabled={busy !== ""}>
                    Detectar hoja
                  </button>
                  {busy ? <span className="sprite-meta">{busy}</span> : null}
                </div>

                {analysis ? (
                  <>
                    <label className="sprite-message" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="checkbox" checked={splitFrames} onChange={(event) => { setSplitFrames(event.target.checked); markDirty(); }} />
                      Cada frame de la fila es una direccion.
                    </label>
                    <p className="sprite-message">
                      Hoja {analysis.width}x{analysis.height}. Celda {cellWidth}x{cellHeight}. Escala {contentScale}.
                    </p>
                    <MannequinPreview
                      kind={kind}
                      draft={{
                        cellWidth,
                        cellHeight,
                        offsetX: analysis.reference.offsetX,
                        offsetY: analysis.reference.offsetY,
                        headOffsetX,
                        headOffsetY,
                        nudge,
                        onNudge: (key, dx, dy) => shift(key, dx, dy),
                        frames: draftFrames(),
                      }}
                    />

                    {analysis.rows.map((row) => (
                      <div key={row.index} className="sprite-row-card">
                        <div className="sprite-toolbar" style={{ marginBottom: 8 }}>
                          <strong>Fila {row.index + 1}</strong>
                          {splitFrames ? null : (
                            <select className="npc-input" value={rowRole[row.index] ?? "ignore"} onChange={(event) => { setRowRole({ ...rowRole, [row.index]: event.target.value as Direction }); markDirty(); }}>
                              {DIRECTIONS.map((direction) => (
                                <option key={direction.id} value={direction.id}>{direction.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="sprite-frame-strip">
                          {row.frames.map((frame) => {
                            const key = `${row.index}-${frame.index}`;
                            const offset = nudge[key] ?? { dx: 0, dy: 0 };
                            return (
                              <div key={key} className="sprite-frame-cell">
                                <div style={{ width: cellWidth * 3, height: cellHeight * 3, background: "#0a0f17", imageRendering: "pixelated", overflow: "hidden", border: "1px solid var(--sprite-border)" }}>
                                  <img
                                    alt=""
                                    src={analysis.previews[String(row.index)]?.[frame.index]}
                                    style={{ width: cellWidth * 3, height: cellHeight * 3, transform: `translate(${offset.dx * 3}px, ${offset.dy * 3}px)` }}
                                  />
                                </div>
                                {splitFrames ? (
                                  <select className="npc-input" value={frameRole[key] ?? "ignore"} onChange={(event) => { setFrameRole({ ...frameRole, [key]: event.target.value as Direction }); markDirty(); }}>
                                    {DIRECTIONS.filter((direction) => direction.id !== "icon").map((direction) => (
                                      <option key={direction.id} value={direction.id}>{direction.label}</option>
                                    ))}
                                  </select>
                                ) : null}
                                <div className="sprite-shift-row">
                                  <button type="button" className="sprite-btn sprite-mini-btn" title="Mover izquierda" aria-label="Mover izquierda" onClick={() => shift(key, -1, 0)}>←</button>
                                  <button type="button" className="sprite-btn sprite-mini-btn" title="Mover derecha" aria-label="Mover derecha" onClick={() => shift(key, 1, 0)}>→</button>
                                  <button type="button" className="sprite-btn sprite-mini-btn" title="Mover arriba" aria-label="Mover arriba" onClick={() => shift(key, 0, -1)}>↑</button>
                                  <button type="button" className="sprite-btn sprite-mini-btn" title="Mover abajo" aria-label="Mover abajo" onClick={() => shift(key, 0, 1)}>↓</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="sprite-import-grid">
                      <input className="sprite-input" placeholder="Nombre del item" value={name} onChange={(event) => { setName(event.target.value); markDirty(); }} />
                      <input className="sprite-input" type="number" value={headOffsetX} onChange={(event) => { setHeadOffsetX(Number(event.target.value)); markDirty(); }} title="Offset X de cabeza" />
                      <input className="sprite-input" type="number" value={headOffsetY} onChange={(event) => { setHeadOffsetY(Number(event.target.value)); markDirty(); }} title="Offset Y de cabeza" />
                      <button type="button" className="sprite-btn primary" onClick={() => void commit()} disabled={busy !== ""}>
                        Indexar item
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </section>
        </main>

        <aside className="sprite-right">
          <section className="sprite-panel">
            <div className="sprite-panel-head">
              <span className="sprite-kicker">Informacion</span>
            </div>
            <div className="sprite-info-list">
              <InfoRow label="ID" value={selected?.itemId ?? "-"} />
              <InfoRow label="Nombre" value={selected?.name ?? "-"} />
              <InfoRow label="Animacion" value={selected?.anim ?? "-"} />
              <InfoRow label="Tipo" value={kindLabel(kind)} />
              <InfoRow label="Celda" value={selected ? `${selected.cellWidth}x${selected.cellHeight}` : "-"} />
              <InfoRow label="Frames" value={selected?.frameCount ?? "-"} />
              <InfoRow label="Offsets" value={selected ? `item ${selected.offsetX}, ${selected.offsetY} / cabeza ${selected.headOffsetX}, ${selected.headOffsetY}` : "-"} />
            </div>
          </section>

          <section className="sprite-panel">
            <div className="sprite-panel-head">
              <span className="sprite-kicker">Acciones rapidas</span>
            </div>
            <div className="sprite-action-stack">
              <button type="button" className="sprite-btn" onClick={() => void copyConfiguration()} disabled={!selected}>
                Copiar configuracion
              </button>
              <button type="button" className="sprite-btn" onClick={() => void pasteConfiguration()}>
                Pegar configuracion
              </button>
              <button type="button" className="sprite-btn" onClick={() => selected && applyReference(selected, { force: true })} disabled={!selected}>
                Restablecer valores
              </button>
              <button type="button" className="sprite-btn" onClick={() => setMessage("Usa los botones de reproducir, girar e intercambiar dentro de cada vista.")}>
                Vista previa animacion
              </button>
            </div>
          </section>

          <section className="sprite-panel">
            <div className="sprite-panel-head">
              <span className="sprite-kicker">Estadisticas</span>
            </div>
            <div className="sprite-info-list">
              <InfoRow label="Golpe" value={`${statValue(selectedStats, "minHit")} - ${statValue(selectedStats, "maxHit")}`} />
              <InfoRow label="Defensa" value={`${statValue(selectedStats, "minDef")} - ${statValue(selectedStats, "maxDef")}`} />
              <InfoRow label="Def. magica" value={`${statValue(selectedStats, "minDefMag")} - ${statValue(selectedStats, "maxDefMag")}`} />
              <InfoRow label="Valor" value={statValue(selectedStats, "valor")} />
            </div>
          </section>

          {mode === "import" ? (
            <section className="sprite-panel">
              <div className="sprite-panel-head">
                <span className="sprite-kicker">Stats del item nuevo</span>
              </div>
              <div className="sprite-action-stack">
                {STATS.map(([key, label]) => (
                  <label key={key} className="sprite-meta" style={{ display: "grid", gap: 5 }}>
                    {label}
                    <input className="sprite-input" type="number" value={stats[key] ?? 0} onChange={(event) => { setStats({ ...stats, [key]: Number(event.target.value) }); markDirty(); }} />
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          {error ? <p className="sprite-message error">{error}</p> : null}
          {result ? <p className="sprite-message">{result}</p> : null}
          {message ? <p className="sprite-message">{message}</p> : null}
        </aside>
      </div>

      {pendingReference ? (
        <div className="sprite-modal-backdrop" role="dialog" aria-modal="true">
          <div className="sprite-modal">
            <div>
              <span className="sprite-kicker">Cambios sin guardar</span>
              <h3>Queres cambiar de item?</h3>
            </div>
            <p className="sprite-subtitle">
              Hay una hoja importada o ajustes pendientes. Podes cancelar, descartar los cambios o guardar primero desde el panel.
            </p>
            <div className="sprite-modal-actions">
              <button type="button" className="sprite-btn ghost" onClick={() => setPendingReference(null)}>
                Cancelar
              </button>
              <button type="button" className="sprite-btn" onClick={discardPending}>
                Descartar
              </button>
              <button type="button" className="sprite-btn primary" onClick={() => void commit()} disabled={!analysis || busy !== ""}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="sprite-info-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
