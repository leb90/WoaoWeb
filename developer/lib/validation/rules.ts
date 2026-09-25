import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../security/paths";
import {
  loadObjects,
  loadNpcs,
  loadSpells,
  loadCraftingRecipes,
  loadSmeltingRecipes,
} from "../game-data/catalog";
import { resolveGrh } from "../graphics/grh";

export type ValidationSeverity = "ERROR" | "WARNING" | "INFO";

export type ValidationIssue = {
  severity: ValidationSeverity;
  code: string;
  message: string;
  resourceType: string;
  resourceId: string | number | null;
  href?: string;
};

function listMapNpcIds(): Set<number> {
  const root = PATHS.serverMaps();
  const ids = new Set<number>();
  if (!fs.existsSync(root)) return ids;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("mapa_")) continue;
    const n = Number(entry.name.slice(5));
    if (Number.isInteger(n) && n > 0) ids.add(n);
  }
  return ids;
}

export function runBasicValidation(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const objs = loadObjects();
  const npcs = loadNpcs();
  const spells = loadSpells();
  const objIds = new Set(Object.keys(objs).map(Number));
  const npcIds = new Set(Object.keys(npcs).map(Number));
  const spellIds = new Set(Object.keys(spells).map(Number));
  const mapIds = listMapNpcIds();

  // Objects: grh / spell refs
  for (const [idStr, obj] of Object.entries(objs)) {
    const id = Number(idStr);
    const grh = Number(obj.grhIndex ?? 0);
    if (grh > 0 && !resolveGrh(grh)) {
      issues.push({
        severity: "WARNING",
        code: "OBJ_MISSING_GRH",
        message: `Objeto ${id} referencia grhIndex ${grh} inexistente en graficos`,
        resourceType: "objs",
        resourceId: id,
        href: `/objects/${id}`,
      });
    }
    const spellIndex = Number(obj.spellIndex ?? 0);
    if (spellIndex > 0 && !spellIds.has(spellIndex)) {
      issues.push({
        severity: "ERROR",
        code: "OBJ_MISSING_SPELL",
        message: `Objeto ${id} referencia spellIndex ${spellIndex} inexistente`,
        resourceType: "objs",
        resourceId: id,
        href: `/objects/${id}`,
      });
    }
    for (const key of ["indexAbierta", "indexCerrada"] as const) {
      const ref = Number(obj[key] ?? 0);
      if (ref > 0 && !objIds.has(ref)) {
        issues.push({
          severity: "ERROR",
          code: "OBJ_MISSING_LINK",
          message: `Objeto ${id}.${key}=${ref} no existe`,
          resourceType: "objs",
          resourceId: id,
          href: `/objects/${id}`,
        });
      }
    }
  }

  // NPCs: drops, shop, spells
  for (const [idStr, npc] of Object.entries(npcs)) {
    const id = Number(idStr);
    const drops = Array.isArray(npc.drop) ? npc.drop : [];
    for (const entry of drops) {
      const item = Number((entry as { item?: number }).item ?? 0);
      if (item > 0 && !objIds.has(item)) {
        issues.push({
          severity: "ERROR",
          code: "NPC_DROP_MISSING_OBJ",
          message: `NPC ${id} drop item ${item} no existe en objs.json`,
          resourceType: "npcs",
          resourceId: id,
          href: `/npcs/${id}`,
        });
      }
    }
    const objsShop = Array.isArray(npc.objs) ? npc.objs : [];
    for (const entry of objsShop) {
      const item = Number((entry as { item?: number }).item ?? 0);
      if (item > 0 && !objIds.has(item)) {
        issues.push({
          severity: "ERROR",
          code: "NPC_SHOP_MISSING_OBJ",
          message: `NPC ${id} objs item ${item} no existe en objs.json`,
          resourceType: "npcs",
          resourceId: id,
          href: `/npcs/${id}`,
        });
      }
    }
    const npcSpells = Array.isArray(npc.spells) ? npc.spells : [];
    for (const entry of npcSpells) {
      const sid = Number(
        (entry as { idSpell?: number; spell?: number }).idSpell ??
          (entry as { spell?: number }).spell ??
          0,
      );
      if (sid > 0 && !spellIds.has(sid)) {
        issues.push({
          severity: "ERROR",
          code: "NPC_MISSING_SPELL",
          message: `NPC ${id} referencia spell ${sid} inexistente`,
          resourceType: "npcs",
          resourceId: id,
          href: `/npcs/${id}`,
        });
      }
    }
  }

  // Crafting / smelting
  const crafting = loadCraftingRecipes() as Array<Record<string, unknown>>;
  for (const recipe of crafting) {
    const rid = Number(recipe.id ?? 0);
    for (const key of ["itemId", "recipeItemId"] as const) {
      const item = Number(recipe[key] ?? 0);
      if (item > 0 && !objIds.has(item)) {
        issues.push({
          severity: "ERROR",
          code: "CRAFT_MISSING_OBJ",
          message: `Receta crafting ${rid}.${key}=${item} no existe`,
          resourceType: "craftingRecipes",
          resourceId: rid,
          href: "/crafting",
        });
      }
    }
    const materials = Array.isArray(recipe.materials) ? recipe.materials : [];
    for (const mat of materials) {
      const item = Number((mat as { itemId?: number }).itemId ?? 0);
      if (item > 0 && !objIds.has(item)) {
        issues.push({
          severity: "ERROR",
          code: "CRAFT_MATERIAL_MISSING",
          message: `Receta crafting ${rid} material ${item} no existe`,
          resourceType: "craftingRecipes",
          resourceId: rid,
          href: "/crafting",
        });
      }
    }
  }

  const smelting = loadSmeltingRecipes() as Array<Record<string, unknown>>;
  for (const recipe of smelting) {
    const rid = Number(recipe.id ?? 0);
    for (const key of ["mineralItemId", "ingotItemId"] as const) {
      const item = Number(recipe[key] ?? 0);
      if (item > 0 && !objIds.has(item)) {
        issues.push({
          severity: "ERROR",
          code: "SMELT_MISSING_OBJ",
          message: `Receta smelting ${rid}.${key}=${item} no existe`,
          resourceType: "smeltingRecipes",
          resourceId: rid,
          href: "/crafting",
        });
      }
    }
  }

  // Maps: npc placements + exits
  const mapsRoot = PATHS.serverMaps();
  if (fs.existsSync(mapsRoot)) {
    for (const entry of fs.readdirSync(mapsRoot, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith("mapa_")) continue;
      const mapNum = Number(entry.name.slice(5));
      const mapDir = path.join(mapsRoot, entry.name);

      const npcsPath = path.join(mapDir, "npcs.json");
      if (fs.existsSync(npcsPath)) {
        try {
          const placements = JSON.parse(
            fs.readFileSync(npcsPath, "utf8"),
          ) as Array<{ npcIndex?: number }>;
          for (const p of placements) {
            const nid = Number(p.npcIndex ?? 0);
            if (nid > 0 && !npcIds.has(nid)) {
              issues.push({
                severity: "ERROR",
                code: "MAP_NPC_MISSING",
                message: `Mapa ${mapNum}: NPC ID ${nid} no existe en npcs.json`,
                resourceType: "maps",
                resourceId: mapNum,
                href: `/maps`,
              });
            }
          }
        } catch {
          issues.push({
            severity: "ERROR",
            code: "MAP_NPCS_INVALID_JSON",
            message: `Mapa ${mapNum}: npcs.json inválido`,
            resourceType: "maps",
            resourceId: mapNum,
            href: `/maps`,
          });
        }
      }

      const specialsPath = path.join(mapDir, "specials.json");
      if (fs.existsSync(specialsPath)) {
        try {
          const specials = JSON.parse(
            fs.readFileSync(specialsPath, "utf8"),
          ) as {
            exits?: Record<
              string,
              { map?: number; destinations?: Array<{ map?: number }> }
            >;
            objects?: Record<string, { objIndex?: number }>;
          };
          for (const [tile, exit] of Object.entries(specials.exits ?? {})) {
            const targets = exit.destinations?.length
              ? exit.destinations.map((d) => Number(d.map ?? 0))
              : [Number(exit.map ?? 0)];
            for (const dest of targets) {
              if (dest > 0 && !mapIds.has(dest)) {
                issues.push({
                  severity: "ERROR",
                  code: "MAP_EXIT_MISSING",
                  message: `Mapa ${mapNum} salida ${tile} → mapa ${dest} inexistente`,
                  resourceType: "maps",
                  resourceId: mapNum,
                  href: `/maps`,
                });
              }
            }
          }
          for (const [tile, obj] of Object.entries(specials.objects ?? {})) {
            const oid = Number(obj.objIndex ?? 0);
            if (oid > 0 && !objIds.has(oid)) {
              issues.push({
                severity: "ERROR",
                code: "MAP_OBJ_MISSING",
                message: `Mapa ${mapNum} objeto en ${tile}: objIndex ${oid} no existe`,
                resourceType: "maps",
                resourceId: mapNum,
                href: `/maps`,
              });
            }
          }
        } catch {
          issues.push({
            severity: "ERROR",
            code: "MAP_SPECIALS_INVALID_JSON",
            message: `Mapa ${mapNum}: specials.json inválido`,
            resourceType: "maps",
            resourceId: mapNum,
            href: `/maps`,
          });
        }
      }
    }
  }

  issues.push({
    severity: "INFO",
    code: "COUNTS",
    message: `Catálogo: ${objIds.size} objs, ${npcIds.size} npcs, ${spellIds.size} spells, ${mapIds.size} mapas`,
    resourceType: "system",
    resourceId: null,
  });

  return issues;
}
