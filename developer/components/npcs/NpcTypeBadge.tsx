"use client";

import { getNpcTypeMeta } from "@/lib/game-data/npcs";

export function NpcTypeBadge({ npcType }: { npcType: number }) {
  const meta = getNpcTypeMeta(npcType);
  return (
    <span className={`npc-badge ${meta.badgeTone}`}>
      <span aria-hidden>{meta.icon}</span>
      {meta.label}
    </span>
  );
}
