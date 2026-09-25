import fs from "node:fs";
import { PATHS } from "../security/paths";
import type { IndexReferencia } from "./types";

/**
 * Parse Recursos/indices.ini (WorldEditor-style presets).
 * Stamp expansion: GrhIndice + dy*Ancho + dx
 */
export function parseIndicesIni(content: string): IndexReferencia[] {
  const refs: IndexReferencia[] = [];
  const sections = content.split(/^\[/m);
  for (const section of sections) {
    const match = /^REFERENCIA(\d+)\]([\s\S]*)$/i.exec(section);
    if (!match) continue;
    const id = Number(match[1]);
    const body = match[2] ?? "";
    const get = (key: string, fallback = "") => {
      const re = new RegExp(`^${key}=(.*)$`, "im");
      const m = re.exec(body);
      return m?.[1]?.trim() ?? fallback;
    };
    refs.push({
      id,
      nombre: get("Nombre", `Ref ${id}`),
      grhIndice: Number(get("GrhIndice", "0")) || 0,
      ancho: Math.max(1, Number(get("Ancho", "1")) || 1),
      alto: Math.max(1, Number(get("Alto", "1")) || 1),
      capa: Number(get("Capa", "0")) || 0,
      bloquear: /^(1|true|si|yes)$/i.test(get("Bloquear", "0")),
    });
  }
  return refs.sort((a, b) => a.id - b.id);
}

export function loadIndices(): IndexReferencia[] {
  const file = PATHS.indicesIni();
  if (!fs.existsSync(file)) {
    return [];
  }
  // Always re-read so updates to Recursos/indices.ini show up without restart
  return parseIndicesIni(fs.readFileSync(file, "utf8"));
}
