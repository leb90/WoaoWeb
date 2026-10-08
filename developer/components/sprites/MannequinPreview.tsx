"use client";

import { useEffect, useMemo, useState } from "react";

type Direction = "1" | "2" | "3" | "4";
type Kind = "body" | "helmet" | "shield" | "weapon";

type Frame = { grh: number; src: string; width: number; height: number };

type Payload = {
  body: {
    id: number;
    headOffsetX: number;
    headOffsetY: number;
    frames: Record<Direction, Frame[]>;
  };
  head: { id: number; frames: Record<Direction, Frame[]> };
  item: {
    kind: Kind;
    anim: number;
    offsetX: number;
    offsetY: number;
    frames: Record<Direction, Frame[]>;
  } | null;
};

type Draft = {
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  headOffsetX: number;
  headOffsetY: number;
  frames: Record<Direction, Array<{ src: string; nudgeKey: string }>>;
  nudge: Record<string, { dx: number; dy: number }>;
  onNudge: (key: string, dx: number, dy: number) => void;
};

type Board = {
  layers: Array<{ name: string; frame: Frame & { nudgeKey: string }; x: number; y: number; z: number }>;
  minX: number;
  minY: number;
  width: number;
  height: number;
  adjustable: Array<Frame & { nudgeKey: string }>;
};

const DIRECTIONS: Array<{ id: Direction; label: string; hint: string }> = [
  { id: "1", label: "Norte", hint: "Arriba" },
  { id: "2", label: "Sur", hint: "Abajo" },
  { id: "4", label: "Oeste", hint: "Izquierda" },
  { id: "3", label: "Este", hint: "Derecha" },
];

const SCALE = 3;

function frameAt<T>(frames: T[] | undefined, index: number): T | undefined {
  if (!frames || frames.length === 0) return undefined;
  return frames[index % frames.length];
}

function Stage({ board, draft }: { board: Board | null; draft?: Draft }) {
  return (
    <div className="sprite-stage-board" style={{ width: (board?.width ?? 48) * SCALE, height: (board?.height ?? 64) * SCALE }}>
      {board?.layers.map((layer) => {
        const nudge = layer.frame.nudgeKey ? draft?.nudge[layer.frame.nudgeKey] : undefined;
        return (
          <img
            key={layer.name}
            alt={layer.name}
            src={layer.frame.src}
            style={{
              position: "absolute",
              left: (layer.x - board.minX) * SCALE,
              top: (layer.y - board.minY) * SCALE,
              width: layer.frame.width * SCALE,
              height: layer.frame.height * SCALE,
              zIndex: layer.z,
              transform: nudge ? `translate(${nudge.dx * SCALE}px, ${nudge.dy * SCALE}px)` : undefined,
              imageRendering: "pixelated",
            }}
          />
        );
      })}
    </div>
  );
}

function ShiftRow({ label, onMove }: { label: string; onMove: (dx: number, dy: number) => void }) {
  return (
    <div className="sprite-shift-row">
      <span className="sprite-shift-label">{label}</span>
      <button type="button" className="obj-btn sprite-mini-btn" title="Mover izquierda" aria-label="Mover izquierda" onClick={() => onMove(-1, 0)}>←</button>
      <button type="button" className="obj-btn sprite-mini-btn" title="Mover derecha" aria-label="Mover derecha" onClick={() => onMove(1, 0)}>→</button>
      <button type="button" className="obj-btn sprite-mini-btn" title="Mover arriba" aria-label="Mover arriba" onClick={() => onMove(0, -1)}>↑</button>
      <button type="button" className="obj-btn sprite-mini-btn" title="Mover abajo" aria-label="Mover abajo" onClick={() => onMove(0, 1)}>↓</button>
    </div>
  );
}

export function MannequinPreview({
  kind,
  anim = 0,
  draft,
  gallery = false,
}: {
  kind: Kind;
  anim?: number;
  draft?: Draft;
  gallery?: boolean;
}) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState("");
  const [direction, setDirection] = useState<Direction>("2");
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ body: "1", head: "1", t: String(tick) });
    if (!draft && anim > 0) {
      params.set("kind", kind);
      params.set("anim", String(anim));
    }
    fetch(`/api/sprites/mannequin?${params}`)
      .then(async (response) => {
        const data = (await response.json()) as Payload & { error?: string };
        if (!response.ok || data.error) throw new Error(data.error ?? "No se pudo armar la vista.");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setPayload(data);
        setError("");
        if (data.item) {
          setOffsetX(data.item.offsetX);
          setOffsetY(data.item.offsetY);
        } else if (kind === "body") {
          setOffsetX(data.body.headOffsetX);
          setOffsetY(data.body.headOffsetY);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "No se pudo armar la vista.");
      });
    return () => {
      cancelled = true;
    };
  }, [kind, anim, tick, Boolean(draft)]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setFrameIndex((current) => current + 1), 120);
    return () => window.clearInterval(timer);
  }, [playing]);

  const boards = useMemo(() => {
    if (!payload) return null;
    const result = {} as Record<Direction, Board | null>;
    for (const facing of DIRECTIONS.map((item) => item.id)) {
      const bodyFrames = kind === "body" && draft
        ? draft.frames[facing].map((frame) => ({
            grh: 0,
            src: frame.src,
            width: draft.cellWidth,
            height: draft.cellHeight,
            nudgeKey: frame.nudgeKey,
          }))
        : payload.body.frames[facing].map((frame) => ({ ...frame, nudgeKey: "" }));
      const bodyFrame = frameAt(bodyFrames, frameIndex);
      if (!bodyFrame) {
        result[facing] = null;
        continue;
      }

      const headFrame = frameAt(payload.head.frames[facing], 0);
      const itemFrames = draft && kind !== "body"
        ? draft.frames[facing].map((frame) => ({
            grh: 0,
            src: frame.src,
            width: draft.cellWidth,
            height: draft.cellHeight,
            nudgeKey: frame.nudgeKey,
          }))
        : (payload.item?.frames[facing] ?? []).map((frame) => ({ ...frame, nudgeKey: "" }));
      const itemFrame = frameAt(itemFrames, frameIndex);
      const headOffsetX = kind === "body" && draft ? draft.headOffsetX : payload.body.headOffsetX;
      const headOffsetY = kind === "body" && draft ? draft.headOffsetY : payload.body.headOffsetY;
      const bodyX = 16 - Math.floor((bodyFrame.width * 16) / 32);
      const bodyY = 32 - bodyFrame.height;
      const headX = headFrame ? bodyX + bodyFrame.width / 2 - headFrame.width / 2 + headOffsetX : 0;
      const headY = headFrame ? bodyY + bodyFrame.height - headFrame.height + headOffsetY : 0;
      const itemOffsetX = draft ? draft.offsetX : offsetX;
      const itemOffsetY = draft ? draft.offsetY : offsetY;
      let itemX = 0;
      let itemY = 0;
      if (itemFrame && kind === "helmet") {
        itemX = bodyX + bodyFrame.width / 2 - itemFrame.width / 2 + headOffsetX + itemOffsetX;
        itemY = bodyY + bodyFrame.height - itemFrame.height + headOffsetY - 34 + itemOffsetY;
      } else if (itemFrame && (kind === "weapon" || kind === "shield")) {
        itemX = 16 - Math.floor((itemFrame.width * 16) / 32) + itemOffsetX;
        itemY = (kind === "weapon" ? 28 : 32) - itemFrame.height + itemOffsetY;
      }

      const layers = [
        { name: "cuerpo", frame: bodyFrame, x: bodyX, y: bodyY, z: facing === "1" ? 3 : 2 },
        headFrame ? { name: "cabeza", frame: { ...headFrame, nudgeKey: "" }, x: headX, y: headY, z: facing === "1" ? 4 : 3 } : null,
        itemFrame
          ? {
              name: kind,
              frame: itemFrame,
              x: itemX,
              y: itemY,
              z: kind === "weapon" || kind === "shield" ? (facing === "1" ? 1 : 5) : 5,
            }
          : null,
      ].filter((layer): layer is NonNullable<typeof layer> => layer !== null);
      const minX = Math.min(...layers.map((layer) => layer.x)) - 6;
      const minY = Math.min(...layers.map((layer) => layer.y)) - 6;
      const maxX = Math.max(...layers.map((layer) => layer.x + layer.frame.width)) + 6;
      const maxY = Math.max(...layers.map((layer) => layer.y + layer.frame.height)) + 8;
      const adjustable = kind === "body" ? bodyFrames : itemFrames;
      result[facing] = { layers, minX, minY, width: maxX - minX, height: maxY - minY, adjustable };
    }
    return result;
  }, [payload, frameIndex, kind, draft, offsetX, offsetY]);

  const placed = boards?.[direction] ?? null;
  const selected = placed ? frameAt(placed.adjustable, frameIndex) : undefined;
  const selectedGrh = selected?.grh ?? 0;

  async function shift(grh: number, dx: number, dy: number) {
    setBusy("Guardando frame...");
    setError("");
    const response = await fetch("/api/sprites/adjust", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "shift", grh, dx, dy }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy("");
    if (!response.ok || data.error) {
      setError(data.error ?? "No se pudo mover el frame.");
      return;
    }
    setTick((current) => current + 1);
  }

  async function shiftGroup(scope: "direction" | "all", dx: number, dy: number, facing: Direction = direction) {
    const targetAnim = kind === "body" ? payload?.body.id : anim;
    if (!targetAnim) return;
    setBusy(scope === "all" ? "Moviendo todas las direcciones..." : "Moviendo la direccion...");
    setError("");
    const response = await fetch("/api/sprites/adjust", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "shiftGroup",
        kind,
        anim: targetAnim,
        scope,
        direction: facing,
        dx,
        dy,
      }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy("");
    if (!response.ok || data.error) {
      setError(data.error ?? "No se pudo mover la animacion.");
      return;
    }
    setTick((current) => current + 1);
  }

  async function saveOffset() {
    setBusy("Guardando offset...");
    setError("");
    const response = await fetch("/api/sprites/adjust", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "offset",
        kind,
        anim: kind === "body" ? payload?.body.id : anim,
        offsetX,
        offsetY,
      }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy("");
    if (!response.ok || data.error) {
      setError(data.error ?? "No se pudo guardar el offset.");
      return;
    }
    setTick((current) => current + 1);
  }

  async function swapDirections(from: Direction, to: Direction) {
    const targetAnim = kind === "body" ? payload?.body.id : anim;
    if (!targetAnim || from === to) return;
    setBusy("Corrigiendo sentido...");
    setError("");
    const response = await fetch("/api/sprites/adjust", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "swapDirections", kind, anim: targetAnim, from, to }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy("");
    if (!response.ok || data.error) {
      setError(data.error ?? "No se pudo cambiar el sentido.");
      return;
    }
    setTick((current) => current + 1);
  }

  async function rotateDirections(clockwise: boolean) {
    const targetAnim = kind === "body" ? payload?.body.id : anim;
    if (!targetAnim) return;
    setBusy("Girando las direcciones...");
    setError("");
    const response = await fetch("/api/sprites/adjust", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "rotateDirections", kind, anim: targetAnim, clockwise }),
    });
    const data = (await response.json()) as { error?: string };
    setBusy("");
    if (!response.ok || data.error) {
      setError(data.error ?? "No se pudo girar el sentido.");
      return;
    }
    setTick((current) => current + 1);
  }

  useEffect(() => {
    function isTyping(target: EventTarget | null) {
      const element = target as HTMLElement | null;
      if (!element) return false;
      return ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) || element.isContentEditable;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTyping(event.target)) return;
      const step = event.shiftKey ? 5 : 1;
      const move =
        event.key === "ArrowLeft"
          ? { dx: -step, dy: 0 }
          : event.key === "ArrowRight"
            ? { dx: step, dy: 0 }
            : event.key === "ArrowUp"
              ? { dx: 0, dy: -step }
              : event.key === "ArrowDown"
                ? { dx: 0, dy: step }
                : null;
      if (move) {
        event.preventDefault();
        if (draft && selected?.nudgeKey) draft.onNudge(selected.nudgeKey, move.dx, move.dy);
        else if (selectedGrh > 0) void shiftGroup("direction", move.dx, move.dy);
        return;
      }
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        setPlaying((current) => !current);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!draft && (kind === "body" || anim > 0)) void saveOffset();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [draft, selected, selectedGrh, kind, anim, direction, offsetX, offsetY, payload]);

  if (gallery) {
    const byId = Object.fromEntries(DIRECTIONS.map((item) => [item.id, item])) as Record<Direction, (typeof DIRECTIONS)[number]>;
    const selectedInfo = byId[direction];
    return (
      <div className="sprite-preview">
        <div className="sprite-preview-toolbar">
          <button type="button" className="obj-btn" onClick={() => setPlaying((current) => !current)}>
            {playing ? "Pausa" : "Caminar"}
          </button>
          <button type="button" className="obj-btn" onClick={() => { setPlaying(false); setFrameIndex((current) => current + 1); }}>
            Frame
          </button>
          {!draft ? (
            <>
              <button type="button" className="obj-btn" onClick={() => void rotateDirections(false)}>Girar L</button>
              <button type="button" className="obj-btn" onClick={() => void rotateDirections(true)}>Girar R</button>
            </>
          ) : null}
          {busy ? <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{busy}</span> : null}
        </div>

        <div className="sprite-direction-grid">
          {DIRECTIONS.map((slotInfo) => {
            const slot = slotInfo.id;
            const board = boards?.[slot] ?? null;
            const frame = board ? frameAt(board.adjustable, frameIndex) : undefined;
            return (
              <div key={slot} className={`sprite-direction-card ${direction === slot ? "is-selected" : ""}`}>
                <div className="sprite-direction-head">
                  <button
                    type="button"
                    onClick={() => setDirection(slot)}
                    className="sprite-direction-title"
                    style={{ background: "transparent", border: 0, color: "inherit", textAlign: "left", cursor: "pointer", padding: 0 }}
                  >
                    {slotInfo.label}
                    <span className="sprite-direction-hint">{slotInfo.hint}</span>
                  </button>
                  <span className="sprite-row-id">{frame && frame.grh > 0 ? `GRH ${frame.grh}` : "Sin GRH"}</span>
                </div>
                <div className="sprite-stage">
                  <Stage board={board} draft={draft} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {board ? `${board.adjustable.length} frames` : "Sin grafico"}
                </div>
                {!draft && frame && frame.grh > 0 ? (
                  <ShiftRow label="Mover vista" onMove={(dx, dy) => void shiftGroup("direction", dx, dy, slot)} />
                ) : null}
                {draft && frame?.nudgeKey ? (
                  <ShiftRow label="Mover frame" onMove={(dx, dy) => draft.onNudge(frame.nudgeKey, dx, dy)} />
                ) : null}
                {!draft ? (
                  <select
                    className="npc-input"
                    value=""
                    onChange={(event) => {
                      const next = event.target.value;
                      if (next === "1" || next === "2" || next === "3" || next === "4") void swapDirections(slot, next);
                    }}
                  >
                    <option value="">Intercambiar con...</option>
                    {DIRECTIONS.filter((item) => item.id !== slot).map((item) => (
                      <option key={item.id} value={item.id}>{item.label} ({item.hint})</option>
                    ))}
                  </select>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="sprite-preview-footer">
          {!draft && selectedGrh > 0 ? (
            <ShiftRow label={`Frame ${selectedInfo.label}`} onMove={(dx, dy) => void shift(selectedGrh, dx, dy)} />
          ) : null}
          {!draft ? <ShiftRow label="Todas" onMove={(dx, dy) => void shiftGroup("all", dx, dy)} /> : null}
          {!draft && (kind === "body" || anim > 0) ? (
            <>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{kind === "body" ? "Cabeza" : "Paquete"}</span>
              <input className="npc-input" type="number" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} title="Offset X" style={{ width: 74 }} />
              <input className="npc-input" type="number" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} title="Offset Y" style={{ width: 74 }} />
              <button type="button" className="obj-btn" onClick={() => void saveOffset()}>Guardar offset</button>
            </>
          ) : null}
          {error ? <p style={{ color: "#e06a6a", margin: 0 }}>{error}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        {DIRECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="obj-btn"
            onClick={() => {
              setDirection(item.id);
              setFrameIndex(0);
            }}
            style={{ fontWeight: direction === item.id ? 700 : 400 }}
          >
            {item.label}
          </button>
        ))}
        <button type="button" className="obj-btn" onClick={() => setPlaying((current) => !current)}>
          {playing ? "Pausa" : "Caminar"}
        </button>
        <button type="button" className="obj-btn" onClick={() => { setPlaying(false); setFrameIndex((current) => current + 1); }}>
          Frame
        </button>
      </div>
      <div className="sprite-stage">
        <Stage board={placed} draft={draft} />
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
        {direction === "1" ? "Norte: cuerpo delante de arma/escudo." : "Cuerpo de ejemplo con cabeza."}
        {selectedGrh > 0 ? ` GRH ${selectedGrh}.` : ""}
        {busy ? ` ${busy}` : ""}
      </div>
      {!draft && selectedGrh > 0 ? (
        <div style={{ display: "grid", gap: 6 }}>
          <ShiftRow label={`Frame ${selectedGrh}`} onMove={(dx, dy) => void shift(selectedGrh, dx, dy)} />
          <ShiftRow label="Direccion" onMove={(dx, dy) => void shiftGroup("direction", dx, dy)} />
          <ShiftRow label="Todas" onMove={(dx, dy) => void shiftGroup("all", dx, dy)} />
        </div>
      ) : null}
      {draft && selected?.nudgeKey ? (
        <ShiftRow label="Mover frame" onMove={(dx, dy) => draft.onNudge(selected.nudgeKey, dx, dy)} />
      ) : null}
      {!draft && (kind === "body" || anim > 0) ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {kind === "body" ? "Offset de cabeza" : "Offset del paquete"}
          </span>
          <input className="npc-input" type="number" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} title="Offset X" style={{ width: 72 }} />
          <input className="npc-input" type="number" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} title="Offset Y" style={{ width: 72 }} />
          <button type="button" className="obj-btn" onClick={() => void saveOffset()}>
            Guardar offset
          </button>
        </div>
      ) : null}
      {error ? <p style={{ color: "#e06a6a", margin: 0 }}>{error}</p> : null}
    </div>
  );
}
