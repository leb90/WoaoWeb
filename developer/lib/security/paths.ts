import fs from "node:fs";
import path from "node:path";

/** Repo root (parent of developer/) */
export function getRepoRoot(): string {
  return path.resolve(process.cwd(), "..");
}

export const PATHS = {
  apiJsons: () => path.join(getRepoRoot(), "api", "src", "jsons"),
  serverJsons: () => path.join(getRepoRoot(), "server", "jsons"),
  serverMaps: () => path.join(getRepoRoot(), "server", "mapas_source"),
  apiMaps: () => path.join(getRepoRoot(), "api", "src", "mapas_source"),
  frontendInit: () => path.join(getRepoRoot(), "frontend", "public", "init"),
  frontendMaps: () => path.join(getRepoRoot(), "frontend", "public", "maps"),
  frontendMapsOptimized: () =>
    path.join(getRepoRoot(), "frontend", "public", "maps_optimized"),
  frontendLocalMaps: () =>
    path.join(getRepoRoot(), "frontend", "public", "static", "maps_local"),
  frontendGraphics: () =>
    path.join(getRepoRoot(), "frontend", "public", "graphics"),
  indicesIni: () => path.join(getRepoRoot(), "Recursos", "indices.ini"),
  backups: () => path.join(process.cwd(), ".backups"),
  data: () => path.join(process.cwd(), ".data"),
} as const;

export type AllowedResource =
  | "objs"
  | "npcs"
  | "spells"
  | "craftingRecipes"
  | "smeltingRecipes"
  | "balance"
  | "quests"
  | "questGivers";

const RESOURCE_FILES: Record<AllowedResource, () => string[]> = {
  objs: () => [
    path.join(PATHS.serverJsons(), "objs.json"),
    path.join(PATHS.apiJsons(), "objs.json"),
    path.join(PATHS.frontendInit(), "objs.json"),
  ],
  npcs: () => [
    path.join(PATHS.serverJsons(), "npcs.json"),
    path.join(PATHS.apiJsons(), "npcs.json"),
    path.join(PATHS.frontendInit(), "npcs.json"),
    path.join(PATHS.frontendInit(), "npcs_optimized.json"),
  ],
  spells: () => [
    path.join(PATHS.serverJsons(), "spells.json"),
    path.join(PATHS.apiJsons(), "spells.json"),
    path.join(PATHS.frontendInit(), "spells.json"),
  ],
  craftingRecipes: () => [
    path.join(PATHS.serverJsons(), "craftingRecipes.json"),
    path.join(PATHS.apiJsons(), "craftingRecipes.json"),
  ],
  smeltingRecipes: () => [
    path.join(PATHS.serverJsons(), "smeltingRecipes.json"),
    path.join(PATHS.apiJsons(), "smeltingRecipes.json"),
  ],
  balance: () => [path.join(PATHS.apiJsons(), "balance.json")],
  quests: () => [
    path.join(PATHS.serverJsons(), "quests.json"),
    path.join(PATHS.frontendInit(), "woao", "quests.json"),
    path.join(PATHS.frontendInit(), "quests.json"),
  ],
  questGivers: () => [path.join(PATHS.serverJsons(), "questGivers.json")],
};

/** Resolve a resource to absolute path(s). Throws if unknown. */
export function resolveResourcePaths(resource: AllowedResource): string[] {
  const resolver = RESOURCE_FILES[resource];
  if (!resolver) {
    throw new Error(`Recurso no permitido: ${resource}`);
  }
  return resolver();
}

export function resolvePrimaryResourcePath(resource: AllowedResource): string {
  return resolveResourcePaths(resource)[0]!;
}

/**
 * Ensure a candidate absolute path is under an allowed root (no traversal).
 */
export function assertPathUnder(candidate: string, allowedRoot: string): string {
  const resolved = path.resolve(candidate);
  const root = path.resolve(allowedRoot);
  const rel = path.relative(root, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error("Ruta fuera del área permitida");
  }
  return resolved;
}

export function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}
