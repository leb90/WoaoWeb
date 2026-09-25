import fs from "node:fs";
import path from "node:path";
import { PATHS } from "../security/paths";

type DirMap = Record<string, number> & {
  headOffsetX?: number;
  headOffsetY?: number;
};

let bodiesCache: Record<string, DirMap> | null = null;
let headsCache: Record<string, DirMap> | null = null;

function loadJson(file: string): Record<string, DirMap> {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, DirMap>;
}

export function loadBodiesDb(): Record<string, DirMap> {
  if (!bodiesCache) {
    bodiesCache = loadJson(path.join(PATHS.frontendInit(), "bodies.json"));
  }
  return bodiesCache;
}

export function loadHeadsDb(): Record<string, DirMap> {
  if (!headsCache) {
    headsCache = loadJson(path.join(PATHS.frontendInit(), "heads.json"));
  }
  return headsCache;
}

/** Direction "4" = south (facing camera), same convention as the game. */
export function resolveBodyGrh(idBody: number, direction = "4"): number {
  if (!idBody) return 0;
  const body = loadBodiesDb()[String(idBody)];
  return Number(body?.[direction] ?? 0);
}

export function resolveHeadGrh(idHead: number, direction = "4"): number {
  if (!idHead) return 0;
  const head = loadHeadsDb()[String(idHead)];
  return Number(head?.[direction] ?? 0);
}

export function resolveHeadOffset(idBody: number): { x: number; y: number } {
  const body = loadBodiesDb()[String(idBody)];
  return {
    x: Number(body?.headOffsetX ?? 0),
    y: Number(body?.headOffsetY ?? 0),
  };
}
