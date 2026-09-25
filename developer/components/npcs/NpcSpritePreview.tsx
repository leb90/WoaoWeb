"use client";

import { useEffect, useState } from "react";
import { GrhPreview } from "@/components/ui/GrhPreview";

/** Composite NPC preview: body + head (heading Down / sur, Engine.DIRECTIONS.DOWN = 2). */
export function NpcSpritePreview({
  idBody,
  idHead,
  size = 96,
}: {
  idBody: number;
  idHead: number;
  size?: number;
}) {
  const [bodyGrh, setBodyGrh] = useState(0);
  const [headGrh, setHeadGrh] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: -4 });

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/npcs/sprite?body=${idBody}&head=${idHead}`,
    )
      .then((r) => r.json())
      .then(
        (d: {
          bodyGrh?: number;
          headGrh?: number;
          headOffset?: { x: number; y: number };
        }) => {
          if (cancelled) return;
          setBodyGrh(Number(d.bodyGrh ?? 0));
          setHeadGrh(Number(d.headGrh ?? 0));
          if (d.headOffset) setOffset(d.headOffset);
        },
      )
      .catch(() => {
        if (!cancelled) {
          setBodyGrh(0);
          setHeadGrh(0);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [idBody, idHead]);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        background:
          "linear-gradient(45deg,#1a2030 25%,transparent 25%),linear-gradient(-45deg,#1a2030 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a2030 75%),linear-gradient(-45deg,transparent 75%,#1a2030 75%)",
        backgroundSize: "12px 12px",
        backgroundPosition: "0 0,0 6px,6px -6px,-6px 0",
        borderRadius: 8,
        border: "1px solid var(--border)",
        overflow: "hidden",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ position: "relative", width: size * 0.7, height: size * 0.85 }}>
        <div style={{ position: "absolute", inset: 0, placeItems: "center", display: "grid" }}>
          <GrhPreview grhIndex={bodyGrh} size={Math.floor(size * 0.65)} />
        </div>
        {headGrh > 0 && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: Math.max(0, 8 + offset.y),
              transform: `translateX(calc(-50% + ${offset.x}px))`,
            }}
          >
            <GrhPreview grhIndex={headGrh} size={Math.floor(size * 0.35)} />
          </div>
        )}
      </div>
    </div>
  );
}
