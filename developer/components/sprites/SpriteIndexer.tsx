"use client";

import { useEffect, useMemo, useState } from "react";

type Kind = "body" | "helmet" | "shield" | "weapon";
type Direction = "1" | "2" | "3" | "4" | "icon" | "ignore";

type Reference = {
  itemId: number;
  name: string;
  anim: number;
  cellWidth: number;
  cellHeight: number;
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

const KINDS: Array<{ id: Kind; label: string }> = [
  { id: "body", label: "Armadura / túnica" },
  { id: "helmet", label: "Casco" },
  { id: "shield", label: "Escudo" },
  { id: "weapon", label: "Espada / báculo" },
];

const DIRECTIONS: Array<{ id: Direction; label: string }> = [
  { id: "2", label: "Sur (frente)" },
  { id: "1", label: "Norte (espalda)" },
  { id: "3", label: "Este" },
  { id: "4", label: "Oeste" },
  { id: "icon", label: "Solo ícono 32×32" },
  { id: "ignore", label: "Ignorar" },
];

const STATS = [
  ["minHit", "Golpe mín"],
  ["maxHit", "Golpe máx"],
  ["minDef", "Def mín"],
  ["maxDef", "Def máx"],
  ["minDefMag", "Def mág mín"],
  ["maxDefMag", "Def mág máx"],
  ["resistenciaMagica", "Res. mágica"],
  ["magicDamageBonus", "Daño mágico"],
  ["valor", "Valor"],
] as const;

export function SpriteIndexer() {
  const [kind, setKind] = useState<Kind>("body");
  const [references, setReferences] = useState<Reference[]>([]);
  const [referenceId, setReferenceId] = useState(369);
  const [query, setQuery] = useState("");
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
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    fetch(`/api/sprites/meta?kind=${kind}`)
      .then((response) => response.json())
      .then((data: { references?: Reference[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setReferences(data.references ?? []);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se cargaron las referencias."));
  }, [kind]);

  const visibleReferences = useMemo(() => {
    const text = query.trim().toLowerCase();
    const list = text
      ? references.filter((item) => item.name.toLowerCase().includes(text) || String(item.itemId).includes(text))
      : references;
    return list.slice(0, 80);
  }, [references, query]);

  const selected = references.find((item) => item.itemId === referenceId) ?? references[0];

  function applyReference(item: Reference) {
    setReferenceId(item.itemId);
    setCellWidth(item.cellWidth);
    setCellHeight(item.cellHeight);
    setHeadOffsetX(item.headOffsetX);
    setHeadOffsetY(item.headOffsetY);
    setStats(item.stats);
    if (!name) setName(item.name);
  }

  async function analyze() {
    if (!file) {
      setError("Elegí una hoja de sprites.");
      return;
    }
    setBusy("Detectando frames…");
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
    applyReference(data.reference);
  }

  async function commit() {
    if (!analysis) return;
    setBusy("Indexando…");
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
    setResult(
      `Listo. PNG ${created.graphicFile}.png, ícono ${created.iconFile}.png, GRH ${created.iconGrh}, animación ${created.animationId}, item ${created.itemId} (${created.frameCount} frames).`,
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

  function shift(key: string, dx: number, dy: number) {
    setNudge((current) => {
      const previous = current[key] ?? { dx: 0, dy: 0 };
      return { ...current, [key]: { dx: previous.dx + dx, dy: previous.dy + dy } };
    });
  }

  return (
    <div style={{ display: "grid", gap: 16, maxWidth: 1180 }}>
      <div>
        <h1 style={{ margin: "0 0 6px" }}>Indexador de sprites</h1>
        <p style={{ margin: 0, color: "var(--text-muted)" }}>
          Subí una hoja, comparala con un item existente y ajustá cada frame antes de crear el gráfico, la animación y el item.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {KINDS.map((item) => (
          <button key={item.id} type="button" className="obj-btn" onClick={() => setKind(item.id)} style={{ fontWeight: kind === item.id ? 700 : 400 }}>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 120px 120px 120px", gap: 8 }}>
        <input className="npc-input" placeholder="Buscar referencia" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="npc-input" value={selected?.itemId ?? ""} onChange={(event) => {
          const item = references.find((entry) => entry.itemId === Number(event.target.value));
          if (item) applyReference(item);
        }}>
          {visibleReferences.map((item) => (
            <option key={item.itemId} value={item.itemId}>
              {item.itemId} · {item.name} · {item.cellWidth}×{item.cellHeight}
            </option>
          ))}
        </select>
        <input className="npc-input" type="number" value={cellWidth} onChange={(event) => setCellWidth(Number(event.target.value))} title="Ancho de celda" />
        <input className="npc-input" type="number" value={cellHeight} onChange={(event) => setCellHeight(Number(event.target.value))} title="Alto de celda" />
        <input className="npc-input" type="number" min={0.2} max={1} step={0.05} value={contentScale} onChange={(event) => setContentScale(Number(event.target.value))} title="Escala dentro de la celda" />
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="file" accept="image/png,image/webp" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <button type="button" className="obj-btn" onClick={() => void analyze()} disabled={busy !== ""}>
          Detectar
        </button>
        {busy ? <span>{busy}</span> : null}
      </div>

      {analysis ? (
        <div style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" checked={splitFrames} onChange={(event) => setSplitFrames(event.target.checked)} />
            Cada frame de la fila es una dirección (cascos con varias vistas)
          </label>
          <div style={{ color: "var(--text-muted)" }}>
            Hoja {analysis.width}×{analysis.height}. La vista de cada frame ya está al tamaño de celda {cellWidth}×{cellHeight}.
          </div>
          {analysis.rows.map((row) => (
            <div key={row.index} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: 10 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <strong>Fila {row.index + 1}</strong>
                {splitFrames ? null : (
                  <select className="npc-input" value={rowRole[row.index] ?? "ignore"} onChange={(event) => setRowRole({ ...rowRole, [row.index]: event.target.value as Direction })}>
                    {DIRECTIONS.map((direction) => (
                      <option key={direction.id} value={direction.id}>{direction.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {row.frames.map((frame) => {
                  const key = `${row.index}-${frame.index}`;
                  const offset = nudge[key] ?? { dx: 0, dy: 0 };
                  return (
                    <div key={key} style={{ width: 120 }}>
                      <div style={{ width: cellWidth * 3, height: cellHeight * 3, background: "#111", imageRendering: "pixelated", overflow: "hidden" }}>
                        <img
                          alt=""
                          src={analysis.previews[String(row.index)]?.[frame.index]}
                          style={{ width: cellWidth * 3, height: cellHeight * 3, transform: `translate(${offset.dx * 3}px, ${offset.dy * 3}px)` }}
                        />
                      </div>
                      {splitFrames ? (
                        <select className="npc-input" value={frameRole[key] ?? "ignore"} onChange={(event) => setFrameRole({ ...frameRole, [key]: event.target.value as Direction })}>
                          {DIRECTIONS.filter((direction) => direction.id !== "icon").map((direction) => (
                            <option key={direction.id} value={direction.id}>{direction.label}</option>
                          ))}
                        </select>
                      ) : null}
                      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                        <button type="button" className="obj-btn" onClick={() => shift(key, -1, 0)}>←</button>
                        <button type="button" className="obj-btn" onClick={() => shift(key, 1, 0)}>→</button>
                        <button type="button" className="obj-btn" onClick={() => shift(key, 0, -1)}>↑</button>
                        <button type="button" className="obj-btn" onClick={() => shift(key, 0, 1)}>↓</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 8 }}>
            <input className="npc-input" placeholder="Nombre del item" value={name} onChange={(event) => setName(event.target.value)} />
            <input className="npc-input" type="number" value={headOffsetX} onChange={(event) => setHeadOffsetX(Number(event.target.value))} title="Offset X de cabeza" />
            <input className="npc-input" type="number" value={headOffsetY} onChange={(event) => setHeadOffsetY(Number(event.target.value))} title="Offset Y de cabeza" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
            {STATS.map(([key, label]) => (
              <label key={key} style={{ display: "grid", gap: 4, fontSize: 12 }}>
                {label}
                <input className="npc-input" type="number" value={stats[key] ?? 0} onChange={(event) => setStats({ ...stats, [key]: Number(event.target.value) })} />
              </label>
            ))}
          </div>
          <button type="button" className="obj-btn" onClick={() => void commit()} disabled={busy !== ""}>
            Indexar y crear item
          </button>
        </div>
      ) : null}

      {error ? <p style={{ color: "#e06a6a" }}>{error}</p> : null}
      {result ? <p>{result}</p> : null}
    </div>
  );
}
