"use client";

import { useEffect, useState } from "react";
import { GrhPreview } from "@/components/ui/GrhPreview";

type Material = { itemId: number; amount: number };
type CraftRecipe = {
  id: number;
  profession: string;
  category: string;
  itemId: number;
  skill: number;
  level?: number;
  recipeItemId?: number;
  materials: Material[];
  deleted?: boolean;
};
type SmeltRecipe = {
  id: number;
  mineralItemId: number;
  ingotItemId: number;
  requiredSkill: number;
  mineralsPerIngot: number;
};
type ObjSum = { id: number; name: string; grhIndex: number };

export default function CraftingPage() {
  const [crafting, setCrafting] = useState<CraftRecipe[]>([]);
  const [smelting, setSmelting] = useState<SmeltRecipe[]>([]);
  const [objs, setObjs] = useState<ObjSum[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/crafting").then((r) => r.json()),
      fetch("/api/objects").then((r) => r.json()),
    ]).then(([craft, objects]) => {
      setCrafting(craft.crafting ?? []);
      setSmelting(craft.smelting ?? []);
      setObjs(objects.items ?? []);
    });
  }, []);

  function objName(id: number) {
    return objs.find((o) => o.id === id);
  }

  async function save() {
    const res = await fetch("/api/crafting", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crafting, smelting }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) {
      setMessage(body.error ?? "Error");
      return;
    }
    setDirty(false);
    setMessage("Recetas guardadas");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h1 style={{ margin: 0, flex: 1 }}>Crafting / Smelting</h1>
        {dirty && <span style={{ color: "var(--warn)" }}>Sin guardar</span>}
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Guardar
        </button>
      </div>
      {message && <p>{message}</p>}

      <h2 style={{ marginBottom: 0 }}>Crafting ({crafting.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {crafting
          .filter((r) => !r.deleted)
          .slice(0, 80)
          .map((recipe) => {
            const result = objName(recipe.itemId);
            return (
              <div
                key={recipe.id}
                style={{
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <code>#{recipe.id}</code>
                <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
                  {recipe.profession} · {recipe.category} · skill {recipe.skill}
                </span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {recipe.materials.map((m) => {
                    const mat = objName(m.itemId);
                    return (
                      <div
                        key={`${recipe.id}-${m.itemId}`}
                        style={{ textAlign: "center", fontSize: 11 }}
                      >
                        <GrhPreview grhIndex={mat?.grhIndex ?? 0} size={36} />
                        <div>
                          [{m.itemId}] ×{m.amount}
                        </div>
                        <div style={{ color: "var(--text-muted)" }}>
                          {mat?.name ?? "?"}
                        </div>
                      </div>
                    );
                  })}
                  <span style={{ fontSize: 18 }}>→</span>
                  <div style={{ textAlign: "center", fontSize: 11 }}>
                    <GrhPreview grhIndex={result?.grhIndex ?? 0} size={36} />
                    <div>[{recipe.itemId}]</div>
                    <div style={{ color: "var(--text-muted)" }}>
                      {result?.name ?? "?"}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  style={{
                    marginLeft: "auto",
                    background: "transparent",
                    border: "1px solid var(--border)",
                    color: "var(--danger)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setCrafting((prev) =>
                      prev.map((r) =>
                        r.id === recipe.id ? { ...r, deleted: true } : r,
                      ),
                    );
                    setDirty(true);
                  }}
                >
                  Marcar deleted
                </button>
              </div>
            );
          })}
      </div>

      <h2>Smelting ({smelting.length})</h2>
      {smelting.map((recipe) => {
        const mineral = objName(recipe.mineralItemId);
        const ingot = objName(recipe.ingotItemId);
        return (
          <div
            key={recipe.id}
            style={{
              background: "var(--bg-panel)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <code>#{recipe.id}</code>
            <GrhPreview grhIndex={mineral?.grhIndex ?? 0} size={36} />
            <span>
              [{recipe.mineralItemId}] {mineral?.name} ×{recipe.mineralsPerIngot}
            </span>
            <span>→</span>
            <GrhPreview grhIndex={ingot?.grhIndex ?? 0} size={36} />
            <span>
              [{recipe.ingotItemId}] {ingot?.name}
            </span>
            <span style={{ color: "var(--text-muted)" }}>
              skill {recipe.requiredSkill}
            </span>
          </div>
        );
      })}
    </div>
  );
}
