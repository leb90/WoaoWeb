"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";

type FxFrame = {
  index: number;
  grhId: number;
  numFile: number;
  textureUrl: string;
  sX: number;
  sY: number;
  width: number;
  height: number;
};

type FxListItem = {
  id: number;
  grh: number;
  offsetX: number;
  offsetY: number;
  numFrames: number;
  speed: number;
  preview?: Pick<FxFrame, "textureUrl" | "sX" | "sY" | "width" | "height">;
};

type FxDetail = {
  fx: { id: number; grh: number; offsetX: number; offsetY: number };
  grhIndex: number;
  numFrames: number;
  speed: number;
  frameMs: number;
  frames: FxFrame[];
};

type Draft = {
  grh: number;
  offsetX: number;
  offsetY: number;
  speed: number;
  frames: FxFrame[];
};

function thumbStyle(frame?: Pick<FxFrame, "textureUrl" | "sX" | "sY" | "width" | "height">) {
  if (!frame) {
    return { backgroundImage: "none" as const };
  }
  return {
    backgroundImage: `url(${frame.textureUrl})`,
    backgroundPosition: `-${frame.sX}px -${frame.sY}px`,
    backgroundSize: "auto",
  };
}

export function FxBrowser() {
  const [items, setItems] = useState<FxListItem[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<FxDetail | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [bg, setBg] = useState<"checker" | "dark">("checker");
  const [showChar, setShowChar] = useState(true);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | ""; text: string }>({
    kind: "",
    text: "",
  });
  const [saving, setSaving] = useState(false);
  const [natural, setNatural] = useState<Record<string, { w: number; h: number }>>({});
  const dragRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    mode: "fx" | "atlas";
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const accumRef = useRef(0);
  const lastTs = useRef(0);

  const dirty = useMemo(() => {
    if (!detail || !draft) return false;
    if (
      draft.grh !== detail.fx.grh ||
      draft.offsetX !== detail.fx.offsetX ||
      draft.offsetY !== detail.fx.offsetY ||
      draft.speed !== detail.speed
    ) {
      return true;
    }
    return draft.frames.some((frame, index) => {
      const original = detail.frames[index];
      if (!original) return true;
      return (
        frame.sX !== original.sX ||
        frame.sY !== original.sY ||
        frame.width !== original.width ||
        frame.height !== original.height
      );
    });
  }, [detail, draft]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) =>
        String(item.id).includes(q) ||
        String(item.grh).includes(q) ||
        `fx ${item.id}`.includes(q),
    );
  }, [items, query]);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/fxs");
    if (!res.ok) throw new Error("No se pudo cargar la lista de FXs");
    const data = (await res.json()) as { items: FxListItem[] };
    setItems(data.items ?? []);
    if (selectedId == null && data.items?.[0]) {
      setSelectedId(data.items[0].id);
    }
  }, [selectedId]);

  const loadDetail = useCallback(async (fxId: number) => {
    setStatus({ kind: "", text: "" });
    const res = await fetch(`/api/fxs?fxId=${fxId}`);
    if (!res.ok) throw new Error("FX no encontrado");
    const data = (await res.json()) as FxDetail;
    setDetail(data);
    setDraft({
      grh: data.fx.grh,
      offsetX: data.fx.offsetX,
      offsetY: data.fx.offsetY,
      speed: data.speed,
      frames: data.frames.map((frame) => ({ ...frame })),
    });
    setFrameIndex(0);
    setPlaying(true);
  }, []);

  useEffect(() => {
    loadList().catch((error) =>
      setStatus({
        kind: "err",
        text: error instanceof Error ? error.message : "Error al listar",
      }),
    );
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) return;
    loadDetail(selectedId).catch((error) =>
      setStatus({
        kind: "err",
        text: error instanceof Error ? error.message : "Error al cargar FX",
      }),
    );
  }, [selectedId, loadDetail]);

  useEffect(() => {
    if (!draft?.frames.length) return;
    for (const frame of draft.frames) {
      if (natural[frame.textureUrl]) continue;
      const img = new Image();
      img.onload = () =>
        setNatural((prev) => ({
          ...prev,
          [frame.textureUrl]: { w: img.naturalWidth, h: img.naturalHeight },
        }));
      img.src = frame.textureUrl;
    }
  }, [draft, natural]);

  useEffect(() => {
    if (!playing || !draft?.frames.length) return;
    const frameMs = Math.max(16, draft.speed || 40);
    let raf = 0;
    lastTs.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTs.current;
      lastTs.current = now;
      accumRef.current += dt;
      while (accumRef.current >= frameMs) {
        accumRef.current -= frameMs;
        setFrameIndex((prev) => (prev + 1) % draft.frames.length);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, draft]);

  const current = draft?.frames[frameIndex];

  const updateFrame = (patch: Partial<FxFrame>) => {
    if (!draft) return;
    setDraft({
      ...draft,
      frames: draft.frames.map((frame, index) =>
        index === frameIndex ? { ...frame, ...patch } : frame,
      ),
    });
  };

  const nudge = (axis: "offsetX" | "offsetY" | "sX" | "sY", delta: number) => {
    if (!draft || !current) return;
    if (axis === "offsetX" || axis === "offsetY") {
      setDraft({ ...draft, [axis]: Number(draft[axis]) + delta });
      return;
    }
    updateFrame({ [axis]: Number(current[axis]) + delta });
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draft) return;
    const mode = event.shiftKey ? "atlas" : "fx";
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: mode === "fx" ? draft.offsetX : current?.sX ?? 0,
      originY: mode === "fx" ? draft.offsetY : current?.sY ?? 0,
      mode,
    };
    setDragging(true);
    setPlaying(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !draft) return;
    const dx = Math.round(event.clientX - drag.startX);
    const dy = Math.round(event.clientY - drag.startY);
    if (drag.mode === "fx") {
      setDraft({
        ...draft,
        offsetX: drag.originX + dx,
        offsetY: drag.originY + dy,
      });
      return;
    }
    // Mover el recorte del frame en el atlas (indexación).
    updateFrame({
      sX: Math.max(0, drag.originX - dx),
      sY: Math.max(0, drag.originY - dy),
    });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  };

  const save = async () => {
    if (!draft || !detail) return;
    setSaving(true);
    setStatus({ kind: "", text: "" });
    try {
      const res = await fetch("/api/fxs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: detail.fx.id,
          grh: draft.grh,
          offsetX: draft.offsetX,
          offsetY: draft.offsetY,
          speed: draft.speed,
          frames: draft.frames.map((frame) => ({
            grhId: frame.grhId,
            sX: frame.sX,
            sY: frame.sY,
            width: frame.width,
            height: frame.height,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar");
      setDetail(data.detail);
      setDraft({
        grh: data.detail.fx.grh,
        offsetX: data.detail.fx.offsetX,
        offsetY: data.detail.fx.offsetY,
        speed: data.detail.speed,
        frames: data.detail.frames.map((frame: FxFrame) => ({ ...frame })),
      });
      await loadList();
      setStatus({ kind: "ok", text: `FX ${detail.fx.id} guardado.` });
    } catch (error) {
      setStatus({
        kind: "err",
        text: error instanceof Error ? error.message : "Error al guardar",
      });
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    if (!detail) return;
    setDraft({
      grh: detail.fx.grh,
      offsetX: detail.fx.offsetX,
      offsetY: detail.fx.offsetY,
      speed: detail.speed,
      frames: detail.frames.map((frame) => ({ ...frame })),
    });
    setStatus({ kind: "", text: "" });
  };

  const scale = current
    ? Math.min(280 / Math.max(current.width, 1), 280 / Math.max(current.height, 1), 3)
    : 1;
  const nat = current ? natural[current.textureUrl] : null;
  const drawW = (current?.width ?? 0) * scale;
  const drawH = (current?.height ?? 0) * scale;
  const totalOffsetX = (draft?.offsetX ?? 0) * scale;
  const totalOffsetY = (draft?.offsetY ?? 0) * scale;

  return (
    <div className="fx-page">
      <div className="fx-header">
        <div>
          <h1>FXs</h1>
          <p>
            OffsetX/Y globales del FX (fxs.json). En cada frame se edita la
            indexación del gráfico (sX/sY/tamaño).
          </p>
        </div>
        <div className="fx-actions">
          <button type="button" className="fx-btn" onClick={reset} disabled={!dirty || saving}>
            Deshacer
          </button>
          <button
            type="button"
            className="fx-btn primary"
            onClick={save}
            disabled={!dirty || saving || !draft}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      <div className="fx-shell">
        <section className="fx-panel">
          <div className="fx-panel-title">Catálogo</div>
          <div style={{ padding: "8px 8px 0" }}>
            <input
              className="fx-search"
              placeholder="Buscar id o GRH…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>
          <div className="fx-list">
            {filtered.map((item) => {
              const preview =
                selectedId === item.id ? draft?.frames[0] ?? item.preview : item.preview;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`fx-list-item ${selectedId === item.id ? "active" : ""}`}
                  onClick={() => setSelectedId(item.id)}
                >
                  <div
                    className="fx-thumb"
                    style={preview ? thumbStyle(preview) : undefined}
                  />
                  <div className="fx-list-meta">
                    <strong>FX {item.id}</strong>
                    <span>
                      GRH {item.grh} · {item.numFrames || "?"}f
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {item.offsetX},{item.offsetY}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="fx-panel">
          <div className="fx-panel-title">
            Preview {detail ? `· FX ${detail.fx.id}` : ""}
          </div>
          <div className="fx-stage-wrap">
            <div
              className={`fx-stage ${bg} ${dragging ? "dragging" : ""}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="fx-crosshair" />
              {showChar && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -70%)",
                    opacity: 0.9,
                    pointerEvents: "none",
                  }}
                >
                  <NpcSpritePreview idBody={1} idHead={1} size={84} />
                </div>
              )}
              {current && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: `translate(calc(-50% + ${totalOffsetX}px), calc(-50% + ${totalOffsetY}px))`,
                    width: drawW,
                    height: drawH,
                    backgroundImage: nat ? `url(${current.textureUrl})` : undefined,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: nat
                      ? `-${current.sX * scale}px -${current.sY * scale}px`
                      : undefined,
                    backgroundSize: nat
                      ? `${nat.w * scale}px ${nat.h * scale}px`
                      : undefined,
                    imageRendering: "pixelated",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>

            <div className="fx-controls">
              <button type="button" className="fx-btn" onClick={() => setPlaying(true)}>
                ▶
              </button>
              <button type="button" className="fx-btn" onClick={() => setPlaying(false)}>
                ⏸
              </button>
              <button
                type="button"
                className="fx-btn"
                onClick={() => {
                  setPlaying(false);
                  setFrameIndex((i) => Math.max(0, i - 1));
                }}
              >
                ←
              </button>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Frame {frameIndex + 1}/{draft?.frames.length ?? 0}
              </span>
              <button
                type="button"
                className="fx-btn"
                onClick={() => {
                  setPlaying(false);
                  setFrameIndex((i) =>
                    Math.min((draft?.frames.length ?? 1) - 1, i + 1),
                  );
                }}
              >
                →
              </button>
              <label style={{ fontSize: 12, display: "inline-flex", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={showChar}
                  onChange={(e) => setShowChar(e.target.checked)}
                />
                Personaje
              </label>
              <select
                className="fx-btn"
                value={bg}
                onChange={(e) => setBg(e.target.value as "checker" | "dark")}
              >
                <option value="checker">Checker</option>
                <option value="dark">Oscuro</option>
              </select>
            </div>

            <div className="fx-frame-strip">
              {(draft?.frames ?? []).map((frame, index) => (
                <button
                  key={frame.grhId}
                  type="button"
                  className={`fx-frame-chip ${index === frameIndex ? "active" : ""}`}
                  onClick={() => {
                    setPlaying(false);
                    setFrameIndex(index);
                  }}
                >
                  <div className="thumb" style={thumbStyle(frame)} />
                  <div style={{ fontSize: 11 }}>#{index + 1}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {frame.grhId}
                  </div>
                </button>
              ))}
            </div>

            <div className={`fx-status ${status.kind}`}>
              {status.text ||
                "OffsetX/Y son globales del FX. Arrastrá para moverlos. Shift+drag mueve la indexación (sX/sY) del frame."}
            </div>
          </div>
        </section>

        <section className="fx-panel">
          <div className="fx-panel-title">Propiedades</div>
          <div className="fx-side">
            {draft && detail ? (
              <>
                <div className="fx-field">
                  <label>FX id</label>
                  <input value={detail.fx.id} disabled />
                </div>
                <div className="fx-field">
                  <label>GRH animación</label>
                  <input
                    type="number"
                    value={draft.grh}
                    onChange={(e) =>
                      setDraft({ ...draft, grh: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="fx-field">
                  <label>Speed (ms/frame)</label>
                  <input
                    type="number"
                    value={draft.speed}
                    onChange={(e) =>
                      setDraft({ ...draft, speed: Number(e.target.value) || 40 })
                    }
                  />
                </div>

                <div>
                  <div className="fx-panel-title" style={{ padding: "0 0 8px", border: 0 }}>
                    Offset global (fxs.json)
                  </div>
                  <div className="fx-row">
                    <div className="fx-field">
                      <label>OffsetX</label>
                      <input
                        type="number"
                        value={draft.offsetX}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            offsetX: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="fx-field">
                      <label>OffsetY</label>
                      <input
                        type="number"
                        value={draft.offsetY}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            offsetY: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="fx-nudge" style={{ marginTop: 8 }}>
                    <span />
                    <button type="button" onClick={() => nudge("offsetY", -1)}>
                      ↑
                    </button>
                    <span />
                    <button type="button" onClick={() => nudge("offsetX", -1)}>
                      ←
                    </button>
                    <button type="button" onClick={() => nudge("offsetY", 1)}>
                      ↓
                    </button>
                    <button type="button" onClick={() => nudge("offsetX", 1)}>
                      →
                    </button>
                  </div>
                </div>

                {current && (
                  <div>
                    <div className="fx-panel-title" style={{ padding: "0 0 8px", border: 0 }}>
                      Frame {current.index} · GRH {current.grhId}
                    </div>
                    <div className="fx-row">
                      <div className="fx-field">
                        <label>sX</label>
                        <input
                          type="number"
                          value={current.sX}
                          onChange={(e) =>
                            updateFrame({ sX: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="fx-field">
                        <label>sY</label>
                        <input
                          type="number"
                          value={current.sY}
                          onChange={(e) =>
                            updateFrame({ sY: Number(e.target.value) || 0 })
                          }
                        />
                      </div>
                    </div>
                    <div className="fx-row">
                      <div className="fx-field">
                        <label>width</label>
                        <input
                          type="number"
                          value={current.width}
                          onChange={(e) =>
                            updateFrame({ width: Number(e.target.value) || 1 })
                          }
                        />
                      </div>
                      <div className="fx-field">
                        <label>height</label>
                        <input
                          type="number"
                          value={current.height}
                          onChange={(e) =>
                            updateFrame({ height: Number(e.target.value) || 1 })
                          }
                        />
                      </div>
                    </div>
                    <div className="fx-nudge" style={{ marginTop: 8 }}>
                      <span />
                      <button type="button" onClick={() => nudge("sY", -1)}>
                        ↑
                      </button>
                      <span />
                      <button type="button" onClick={() => nudge("sX", -1)}>
                        ←
                      </button>
                      <button type="button" onClick={() => nudge("sY", 1)}>
                        ↓
                      </button>
                      <button type="button" onClick={() => nudge("sX", 1)}>
                        →
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                      Indexación del frame en {current.numFile}.png · sX/sY ({current.sX},
                      {current.sY}) · {current.width}×{current.height}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="fx-status">Seleccioná un FX de la lista.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
