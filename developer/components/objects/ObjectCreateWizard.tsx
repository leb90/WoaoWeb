"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CREATEABLE_OBJECT_TYPES,
  createObjectDraft,
  getObjectTypeMeta,
} from "@/lib/game-data/objects";

export function ObjectCreateWizard({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [types, setTypes] = useState(
    CREATEABLE_OBJECT_TYPES.map((id) => getObjectTypeMeta(id)),
  );

  useEffect(() => {
    fetch("/api/objects/meta")
      .then((r) => r.json())
      .then((d: { createableTypes?: typeof types }) => {
        if (d.createableTypes?.length) setTypes(d.createableTypes);
      })
      .catch(() => {
        /* keep local */
      });
  }, []);

  function pick(objType: number) {
    const draft = createObjectDraft(objType);
    sessionStorage.setItem(
      "woao.dev.objectDraft",
      JSON.stringify({ mode: "create", data: draft }),
    );
    onClose();
    router.push("/objects/new");
  }

  return (
    <div className="obj-modal-backdrop" onClick={onClose}>
      <div className="obj-modal" onClick={(e) => e.stopPropagation()}>
        <h2>¿Qué tipo de objeto querés crear?</h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13 }}>
          Elegí un tipo. Se abrirá el editor con campos relevantes. Todavía no
          se escribe en objs.json hasta que guardes.
        </p>
        <div className="obj-type-grid">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              className="obj-type-card"
              onClick={() => pick(t.id)}
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
