"use client";

import { useRouter } from "next/navigation";
import {
  CREATE_SPELL_PRESETS,
  createSpellDraft,
} from "@/lib/game-data/spells";

export function SpellCreateWizard({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  function pick(presetId: string) {
    const draft = createSpellDraft(presetId);
    sessionStorage.setItem(
      "woao.dev.spellDraft",
      JSON.stringify({ mode: "create", data: draft }),
    );
    onClose();
    router.push("/spells/new");
  }

  return (
    <div className="obj-modal-backdrop" onClick={onClose}>
      <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
        <h2>¿Qué tipo de hechizo querés crear?</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
          Templates con defaults reales (subeHp, type, target). No se escribe
          spells.json hasta Guardar.
        </p>
        <div className="obj-type-grid">
          {CREATE_SPELL_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="obj-type-card"
              onClick={() => pick(p.id)}
            >
              <div className="ico">{p.icon}</div>
              <strong>{p.label}</strong>
              <span>{p.description}</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <button type="button" className="obj-btn" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
