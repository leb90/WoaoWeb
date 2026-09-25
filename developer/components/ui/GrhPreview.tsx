"use client";

import { useEffect, useState } from "react";

type Preview = {
  textureUrl: string;
  sX: number;
  sY: number;
  width: number;
  height: number;
};

export function GrhPreview({
  grhIndex,
  size = 64,
}: {
  grhIndex: number;
  size?: number;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPreview(null);
    setNatural(null);
    setError(false);
    if (!grhIndex) return;

    fetch(`/api/graphics/resolve?grhIndex=${grhIndex}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("fail");
        return res.json() as Promise<{ preview: Preview | null }>;
      })
      .then((data) => {
        if (!cancelled) setPreview(data.preview);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [grhIndex]);

  useEffect(() => {
    if (!preview) return;
    const img = new Image();
    img.onload = () =>
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = preview.textureUrl;
  }, [preview]);

  if (!grhIndex) return <EmptyBox size={size} label="sin GRH" />;
  if (error) return <EmptyBox size={size} label="N/A" />;
  if (!preview || !natural) return <EmptyBox size={size} label="…" />;

  const scale = Math.min(
    size / Math.max(preview.width, 1),
    size / Math.max(preview.height, 1),
    3,
  );
  const displayW = preview.width * scale;
  const displayH = preview.height * scale;

  return (
    <div
      title={`GRH ${grhIndex}`}
      style={{
        width: size,
        height: size,
        background: "#0a0c10",
        border: "1px solid var(--border)",
        borderRadius: 4,
        display: "grid",
        placeItems: "center",
        overflow: "hidden",
        imageRendering: "pixelated",
      }}
    >
      <div
        style={{
          width: displayW,
          height: displayH,
          backgroundImage: `url(${preview.textureUrl})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: `-${preview.sX * scale}px -${preview.sY * scale}px`,
          backgroundSize: `${natural.w * scale}px ${natural.h * scale}px`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

function EmptyBox({ size, label }: { size: number; label: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#0a0c10",
        border: "1px solid var(--border)",
        borderRadius: 4,
        display: "grid",
        placeItems: "center",
        color: "var(--text-muted)",
        fontSize: 11,
      }}
    >
      {label}
    </div>
  );
}
