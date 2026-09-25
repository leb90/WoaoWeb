"use client";

import { getObjectTypeMeta } from "@/lib/game-data/objects";

export function ObjectTypeBadge({ objType }: { objType: number }) {
  const meta = getObjectTypeMeta(objType);
  return (
    <span className={`obj-badge ${meta.badgeTone}`}>
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
