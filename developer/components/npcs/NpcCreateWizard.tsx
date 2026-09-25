"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CREATEABLE_NPC_TYPES,
  CREATE_PRESETS,
  createNpcDraft,
  getNpcTypeMeta,
  type NpcTypeMeta,
} from "@/lib/game-data/npcs";

type Card = {
  key: string;
  label: string;
  icon: string;
  description: string;
  pick: () => void;
};

export function NpcCreateWizard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [types, setTypes] = useState<NpcTypeMeta[]>(
    CREATEABLE_NPC_TYPES.map((id) => getNpcTypeMeta(id)),
  );

  useEffect(() => {
    fetch("/api/npcs/meta")
      .then((r) => r.json())
      .then((d: { createableTypes?: NpcTypeMeta[] }) => {
        if (d.createableTypes?.length) setTypes(d.createableTypes);
      })
      .catch(() => {
        /* keep local */
      });
  }, []);

  function openDraft(data: ReturnType<typeof createNpcDraft>) {
    sessionStorage.setItem(
      "woao.dev.npcDraft",
      JSON.stringify({ mode: "create", data }),
    );
    onClose();
    router.push("/npcs/new");
  }

  const cards: Card[] = [
    ...CREATE_PRESETS.map((p) => ({
      key: p.id,
      label: p.label,
      icon: p.icon,
      description: p.description,
      pick: () => {
        let draft = createNpcDraft(p.npcType, p.label === "Monstruo" ? "Nuevo monstruo" : undefined);
        if (p.applyDefaults) draft = p.applyDefaults(draft);
        openDraft(draft);
      },
    })),
    ...types.map((t) => ({
      key: `type-${t.id}`,
      label: t.label,
      icon: t.icon,
      description: t.description,
      pick: () => openDraft(createNpcDraft(t.id)),
    })),
  ];

  return (
    <div className="obj-modal-backdrop" onClick={onClose}>
      <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
        <h2>¿Qué tipo de NPC querés crear?</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
          Elegí un tipo. Se abrirá el editor con defaults y tabs relevantes. No se
          escribe en npcs.json hasta que guardes.
        </p>
        <div className="obj-type-grid">
          {cards.map((t) => (
            <button
              key={t.key}
              type="button"
              className="obj-type-card"
              onClick={() => t.pick()}
            >
              <div className="ico">{t.icon}</div>
              <strong>{t.label}</strong>
              <span>{t.description}</span>
            </button>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <button type="button" className="obj-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
