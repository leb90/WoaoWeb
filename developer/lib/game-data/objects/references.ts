import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../../security/paths";
import {
  loadCraftingRecipes,
  loadNpcs,
  loadObjects,
  loadSmeltingRecipes,
} from "../catalog";

export type ObjectReference = {
  kind: "npc-drop" | "npc-shop" | "crafting" | "smelting" | "map" | "object-link";
  label: string;
  detail?: string;
};

function scanMapObjects(objId: number): ObjectReference[] {
  const roots = [PATHS.serverMaps(), PATHS.apiMaps()].filter((r) =>
    fs.existsSync(r),
  );
  const seen = new Set<string>();
  const out: ObjectReference[] = [];

  for (const root of roots) {
    let dirs: string[] = [];
    try {
      dirs = fs
        .readdirSync(root, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith("mapa_"))
        .map((d) => d.name);
    } catch {
      continue;
    }
    for (const dir of dirs) {
      const specialsPath = path.join(root, dir, "specials.json");
      if (!fs.existsSync(specialsPath)) continue;
      try {
        const specials = JSON.parse(
          fs.readFileSync(specialsPath, "utf8"),
        ) as { objects?: Record<string, { objIndex?: number }> };
        const objects = specials.objects ?? {};
        let count = 0;
        for (const entry of Object.values(objects)) {
          if (Number(entry?.objIndex) === objId) count++;
        }
        if (count > 0) {
          const mapId = dir.replace("mapa_", "");
          const key = `map:${mapId}`;
          if (!seen.has(key)) {
            seen.add(key);
            out.push({
              kind: "map",
              label: `Mapa ${mapId}`,
              detail: `${count} tile(s)`,
            });
          }
        }
      } catch {
        /* ignore broken specials */
      }
    }
  }
  return out;
}

export function findObjectReferences(objId: number): ObjectReference[] {
  const refs: ObjectReference[] = [];

  const npcs = loadNpcs();
  for (const [id, npc] of Object.entries(npcs)) {
    const name = String(npc.name ?? `NPC ${id}`);
    if (Array.isArray(npc.drop)) {
      for (const d of npc.drop) {
        if (Number((d as { item?: number }).item) === objId) {
          refs.push({
            kind: "npc-drop",
            label: `NPC ${id} — ${name}`,
            detail: "Drop",
          });
          break;
        }
      }
    }
    if (Array.isArray(npc.objs)) {
      for (const o of npc.objs) {
        if (Number((o as { item?: number }).item) === objId) {
          refs.push({
            kind: "npc-shop",
            label: `NPC ${id} — ${name}`,
            detail: "Comercio",
          });
          break;
        }
      }
    }
  }

  const recipes = loadCraftingRecipes() as Array<{
    id?: number;
    itemId?: number;
    recipeItemId?: number;
    materials?: Array<{ itemId?: number }>;
  }>;
  for (const r of recipes) {
      const rid = Number(r.id);
      const hits: string[] = [];
      if (Number(r.itemId) === objId) hits.push("resultado");
      if (Number(r.recipeItemId) === objId) hits.push("ítem receta");
      if (Array.isArray(r.materials)) {
        for (const m of r.materials) {
          if (Number(m.itemId) === objId) hits.push("material");
        }
      }
      if (hits.length) {
        refs.push({
          kind: "crafting",
          label: `Receta crafting #${rid}`,
          detail: hits.join(", "),
        });
      }
    }

  const smelting = loadSmeltingRecipes() as Array<{
    id?: number;
    mineralItemId?: number;
    ingotItemId?: number;
  }>;
  for (const r of smelting) {
      if (
        Number(r.mineralItemId) === objId ||
        Number(r.ingotItemId) === objId
      ) {
        refs.push({
          kind: "smelting",
          label: `Fundición #${r.id}`,
          detail:
            Number(r.mineralItemId) === objId ? "mineral" : "lingote",
        });
      }
    }

  const objs = loadObjects();
  for (const [id, data] of Object.entries(objs)) {
    if (Number(id) === objId) continue;
    const links: string[] = [];
    if (Number(data.indexAbierta) === objId) links.push("indexAbierta");
    if (Number(data.indexCerrada) === objId) links.push("indexCerrada");
    if (links.length) {
      refs.push({
        kind: "object-link",
        label: `Objeto ${id} — ${String(data.name ?? "")}`,
        detail: links.join(", "),
      });
    }
  }

  refs.push(...scanMapObjects(objId));
  return refs;
}
