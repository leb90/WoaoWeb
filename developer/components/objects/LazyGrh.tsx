"use client";

import { useEffect, useRef, useState } from "react";
import { GrhPreview } from "@/components/ui/GrhPreview";

/** Only mounts GrhPreview when the cell is near the viewport (list performance). */
export function LazyGrh({
  grhIndex,
  size = 40,
}: {
  grhIndex: number;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: size, height: size }}>
      {visible ? (
        <GrhPreview grhIndex={grhIndex} size={size} />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            background: "#0a0c10",
            border: "1px solid var(--border)",
            borderRadius: 4,
          }}
        />
      )}
    </div>
  );
}
