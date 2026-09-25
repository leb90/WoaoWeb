"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NpcSpritePreview } from "@/components/npcs/NpcSpritePreview";

type Frame = {
  textureUrl: string;
  sX: number;
  sY: number;
  width: number;
  height: number;
};

type AnimPayload = {
  fx: { id: number; grh: number; offsetX: number; offsetY: number };
  grhIndex: number;
  numFrames: number;
  frameMs: number;
  frames: Frame[];
};

export function FxAnimatedPreview({
  fxId,
  loops = 1,
  showCharacter = true,
  size = 220,
}: {
  fxId: number;
  /** JSON loops — how many full cycles in a non-infinite play */
  loops?: number;
  showCharacter?: boolean;
  size?: number;
}) {
  const [anim, setAnim] = useState<AnimPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [frame, setFrame] = useState(0);
  const [speedMul, setSpeedMul] = useState(1);
  const [infinite, setInfinite] = useState(true);
  const [fit, setFit] = useState(true);
  const [bg, setBg] = useState<"checker" | "dark">("checker");
  const [natural, setNatural] = useState<Record<string, { w: number; h: number }>>(
    {},
  );
  const accumRef = useRef(0);
  const cycleRef = useRef(0);
  const lastTs = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setAnim(null);
    setError(null);
    setFrame(0);
    cycleRef.current = 0;
    accumRef.current = 0;
    if (!fxId) return;
    fetch(`/api/fxs?fxId=${fxId}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("FX no encontrado");
        return r.json() as Promise<AnimPayload>;
      })
      .then((d) => {
        if (!cancelled) {
          setAnim(d);
          setPlaying(true);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      });
    return () => {
      cancelled = true;
    };
  }, [fxId]);

  useEffect(() => {
    if (!anim?.frames.length) return;
    for (const f of anim.frames) {
      if (natural[f.textureUrl]) continue;
      const img = new Image();
      img.onload = () =>
        setNatural((prev) => ({
          ...prev,
          [f.textureUrl]: { w: img.naturalWidth, h: img.naturalHeight },
        }));
      img.src = f.textureUrl;
    }
  }, [anim, natural]);

  useEffect(() => {
    if (!playing || !anim?.frames.length) return;
    const frameCount = anim.frames.length;
    const frameMs = Math.max(16, anim.frameMs / speedMul);
    const maxCycles = infinite ? Infinity : Math.max(1, loops || 1);

    let raf = 0;
    lastTs.current = performance.now();

    const tick = (now: number) => {
      const dt = now - lastTs.current;
      lastTs.current = now;
      accumRef.current += dt;
      while (accumRef.current >= frameMs) {
        accumRef.current -= frameMs;
        setFrame((prev) => {
          const next = prev + 1;
          if (next >= frameCount) {
            cycleRef.current += 1;
            if (cycleRef.current >= maxCycles) {
              setPlaying(false);
              return frameCount - 1;
            }
            return 0;
          }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, anim, speedMul, infinite, loops]);

  const current = anim?.frames[frame];
  const nat = current ? natural[current.textureUrl] : null;

  const display = useMemo(() => {
    if (!current) return null;
    const maxSide = fit ? size * 0.85 : Math.max(current.width, current.height);
    const scale = fit
      ? Math.min(
          (size * 0.85) / Math.max(current.width, 1),
          (size * 0.85) / Math.max(current.height, 1),
          4,
        )
      : 1;
    return {
      w: current.width * scale,
      h: current.height * scale,
      scale,
      maxSide,
    };
  }, [current, fit, size]);

  if (!fxId) {
    return (
      <div className={`spell-fx-stage ${bg}`} style={{ height: size }}>
        <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Sin FX</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`spell-fx-stage ${bg}`} style={{ height: size }}>
        <span style={{ color: "#ff8a95", fontSize: 12 }}>{error}</span>
      </div>
    );
  }

  if (!anim || !current || !display) {
    return (
      <div className={`spell-fx-stage ${bg}`} style={{ height: size }}>
        <span style={{ color: "var(--text-muted)" }}>Cargando FX…</span>
      </div>
    );
  }

  const offsetX = (anim.fx.offsetX || 0) * (fit ? display.scale : 1);
  const offsetY = (anim.fx.offsetY || 0) * (fit ? display.scale : 1);

  return (
    <div>
      <div className={`spell-fx-stage ${bg}`} style={{ height: size }}>
        {showCharacter && (
          <div style={{ position: "absolute", bottom: 24, opacity: 0.85 }}>
            <NpcSpritePreview idBody={1} idHead={1} size={72} />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
            width: display.w,
            height: display.h,
            backgroundImage: nat ? `url(${current.textureUrl})` : undefined,
            backgroundRepeat: "no-repeat",
            backgroundPosition: nat
              ? `-${current.sX * display.scale}px -${current.sY * display.scale}px`
              : undefined,
            backgroundSize: nat
              ? `${nat.w * display.scale}px ${nat.h * display.scale}px`
              : undefined,
            imageRendering: "pixelated",
            pointerEvents: "none",
          }}
        />
      </div>

      <div className="spell-fx-controls">
        <button
          type="button"
          className="obj-btn"
          onClick={() => {
            cycleRef.current = 0;
            setPlaying(true);
          }}
        >
          ▶
        </button>
        <button
          type="button"
          className="obj-btn"
          onClick={() => setPlaying(false)}
        >
          ⏸
        </button>
        <button
          type="button"
          className="obj-btn"
          onClick={() => {
            setPlaying(false);
            cycleRef.current = 0;
            setFrame(0);
            accumRef.current = 0;
          }}
        >
          ⏮
        </button>
        <button
          type="button"
          className="obj-btn"
          onClick={() => {
            setPlaying(false);
            setFrame((f) => Math.max(0, f - 1));
          }}
        >
          ←
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Frame {frame + 1} / {anim.frames.length}
        </span>
        <button
          type="button"
          className="obj-btn"
          onClick={() => {
            setPlaying(false);
            setFrame((f) => Math.min(anim.frames.length - 1, f + 1));
          }}
        >
          →
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, anim.frames.length - 1)}
        value={frame}
        onChange={(e) => {
          setPlaying(false);
          setFrame(Number(e.target.value));
        }}
        style={{ width: "100%", marginTop: 6 }}
      />

      <div className="spell-fx-controls">
        <label style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Velocidad
          <select
            className="obj-select"
            value={speedMul}
            onChange={(e) => setSpeedMul(Number(e.target.value))}
            style={{ marginLeft: 6 }}
          >
            {[0.25, 0.5, 1, 1.5, 2].map((v) => (
              <option key={v} value={v}>
                {v}x
              </option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 12, display: "inline-flex", gap: 4 }}>
          <input
            type="checkbox"
            checked={infinite}
            onChange={(e) => setInfinite(e.target.checked)}
          />
          Loop preview
        </label>
        <label style={{ fontSize: 12, display: "inline-flex", gap: 4 }}>
          <input
            type="checkbox"
            checked={fit}
            onChange={(e) => setFit(e.target.checked)}
          />
          Fit
        </label>
        <select
          className="obj-select"
          value={bg}
          onChange={(e) => setBg(e.target.value as "checker" | "dark")}
        >
          <option value="checker">Checker</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>

      <div style={{ marginTop: 6, fontSize: 11, color: "var(--text-muted)" }}>
        FX {anim.fx.id} → GRH {anim.grhIndex} · {anim.frameMs.toFixed(0)}ms/frame
        · offset ({anim.fx.offsetX}, {anim.fx.offsetY})
        {!infinite && ` · loops JSON: ${loops}`}
      </div>
    </div>
  );
}

/** Static first-frame thumbnail for lists (no animation). */
export function FxThumb({ fxId, size = 40 }: { fxId: number; size?: number }) {
  const [frame, setFrame] = useState<Frame | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFrame(null);
    if (!fxId) return;
    fetch(`/api/fxs?fxId=${fxId}`)
      .then((r) => r.json())
      .then((d: AnimPayload) => {
        if (!cancelled && d.frames?.[0]) setFrame(d.frames[0]);
      })
      .catch(() => {
        if (!cancelled) setFrame(null);
      });
    return () => {
      cancelled = true;
    };
  }, [fxId]);

  useEffect(() => {
    if (!frame) return;
    const img = new Image();
    img.onload = () => setNat({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = frame.textureUrl;
  }, [frame]);

  if (!fxId) {
    return (
      <div
        style={{
          width: size,
          height: size,
          border: "1px solid var(--border)",
          borderRadius: 4,
          display: "grid",
          placeItems: "center",
          fontSize: 9,
          color: "var(--text-muted)",
        }}
      >
        Sin FX
      </div>
    );
  }
  if (!frame || !nat) {
    return (
      <div
        style={{
          width: size,
          height: size,
          border: "1px solid var(--border)",
          borderRadius: 4,
          background: "#0a0c10",
        }}
      />
    );
  }
  const scale = Math.min(size / frame.width, size / frame.height, 3);
  return (
    <div
      style={{
        width: size,
        height: size,
        border: "1px solid var(--border)",
        borderRadius: 4,
        background: "#0a0c10",
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        imageRendering: "pixelated",
      }}
      title={`FX ${fxId}`}
    >
      <div
        style={{
          width: frame.width * scale,
          height: frame.height * scale,
          backgroundImage: `url(${frame.textureUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `-${frame.sX * scale}px -${frame.sY * scale}px`,
          backgroundSize: `${nat.w * scale}px ${nat.h * scale}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}
