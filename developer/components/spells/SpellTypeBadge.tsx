"use client";

import { getSpellPresentation, type SpellData } from "@/lib/game-data/spells";

export function SpellTypeBadge({ data }: { data: SpellData }) {
  const p = getSpellPresentation(data);
  return (
    <span className={`spell-badge ${p.badgeTone}`}>
      <span aria-hidden>{p.icon}</span>
      {p.label}
    </span>
  );
}
