import fs from "node:fs";
import { createBackup } from "../game-data/backups";
import { PATHS } from "../security/paths";
import type { IndexReferencia } from "./types";

export type IndexationRecord = IndexReferencia & {
  ordinal: number;
  duplicateCount: number;
};

type ParsedSection = {
  record: Omit<IndexationRecord, "duplicateCount">;
  start: number;
  end: number;
  body: string;
};

export type IndexationInput = {
  nombre: string;
  grhIndice: number;
  ancho: number;
  alto: number;
  capa: number;
  bloquear: boolean;
};

function field(body: string, key: string, fallback = ""): string {
  const match = new RegExp(`^${key}=(.*)$`, "im").exec(body);
  return match?.[1]?.trim() ?? fallback;
}

function parseSections(content: string): ParsedSection[] {
  const matches = [...content.matchAll(/^\[REFERENCIA(\d+)\][^\S\r\n]*(?:\r?\n|$)/gim)];
  return matches.map((match, ordinal) => {
    const start = match.index ?? 0;
    const end = matches[ordinal + 1]?.index ?? content.length;
    const body = content.slice(start, end);
    const id = Number(match[1]);
    return {
      start,
      end,
      body,
      record: {
        ordinal,
        id,
        nombre: field(body, "Nombre", `Ref ${id}`),
        grhIndice: Number(field(body, "GrhIndice", "0")) || 0,
        ancho: Math.max(1, Number(field(body, "Ancho", "1")) || 1),
        alto: Math.max(1, Number(field(body, "Alto", "1")) || 1),
        capa: Math.min(4, Math.max(0, Number(field(body, "Capa", "0")) || 0)),
        bloquear: /^(1|true|si|yes)$/i.test(field(body, "Bloquear", "0")),
      },
    };
  });
}

export function loadIndexationRecords(): {
  items: IndexationRecord[];
  revision: number;
} {
  const filePath = PATHS.indicesIni();
  if (!fs.existsSync(filePath)) return { items: [], revision: 0 };
  const content = fs.readFileSync(filePath, "utf8");
  const sections = parseSections(content);
  const counts = new Map<number, number>();
  for (const section of sections) {
    counts.set(section.record.id, (counts.get(section.record.id) ?? 0) + 1);
  }
  return {
    items: sections.map((section) => ({
      ...section.record,
      duplicateCount: counts.get(section.record.id) ?? 1,
    })),
    revision: Math.trunc(fs.statSync(filePath).mtimeMs),
  };
}

function validated(input: IndexationInput): IndexationInput {
  const nombre = input.nombre.trim();
  const grhIndice = Math.trunc(Number(input.grhIndice));
  const ancho = Math.trunc(Number(input.ancho));
  const alto = Math.trunc(Number(input.alto));
  const capa = Math.trunc(Number(input.capa));
  if (!nombre || nombre.length > 100) throw new Error("El nombre debe tener entre 1 y 100 caracteres.");
  if (!Number.isInteger(grhIndice) || grhIndice < 1) throw new Error("El GRH inicial no es valido.");
  if (!Number.isInteger(ancho) || ancho < 1 || ancho > 64) throw new Error("El ancho debe estar entre 1 y 64 tiles.");
  if (!Number.isInteger(alto) || alto < 1 || alto > 64) throw new Error("El alto debe estar entre 1 y 64 tiles.");
  if (ancho * alto > 4096) throw new Error("La indexacion no puede superar 4096 tiles.");
  if (!Number.isInteger(capa) || capa < 1 || capa > 4) throw new Error("La capa debe estar entre 1 y 4.");
  return { nombre, grhIndice, ancho, alto, capa, bloquear: Boolean(input.bloquear) };
}

function replaceField(body: string, key: string, value: string, newline: string): string {
  const expression = new RegExp(`^${key}=.*$`, "im");
  if (expression.test(body)) return body.replace(expression, `${key}=${value}`);
  const suffix = body.endsWith("\n") || body.endsWith("\r") ? "" : newline;
  return `${body}${suffix}${key}=${value}${newline}`;
}

export function updateIndexationRecord(opts: {
  ordinal: number;
  revision: number;
  value: IndexationInput;
}): { item: IndexationRecord; revision: number } {
  const filePath = PATHS.indicesIni();
  const stat = fs.statSync(filePath);
  const revision = Math.trunc(stat.mtimeMs);
  if (opts.revision !== revision) {
    throw new Error("indices.ini cambio desde que abriste la ficha. Recarga antes de guardar.");
  }
  const content = fs.readFileSync(filePath, "utf8");
  const sections = parseSections(content);
  const selected = sections[opts.ordinal];
  if (!selected) throw new Error("La indexacion ya no existe.");
  const value = validated(opts.value);
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  let replacement = selected.body;
  replacement = replaceField(replacement, "Nombre", value.nombre, newline);
  replacement = replaceField(replacement, "GrhIndice", String(value.grhIndice), newline);
  replacement = replaceField(replacement, "Ancho", String(value.ancho), newline);
  replacement = replaceField(replacement, "Alto", String(value.alto), newline);
  replacement = replaceField(replacement, "Capa", String(value.capa), newline);
  replacement = replaceField(replacement, "Bloquear", value.bloquear ? "1" : "0", newline);

  const next = `${content.slice(0, selected.start)}${replacement}${content.slice(selected.end)}`;
  createBackup({
    resource: "map-indexation",
    resourceId: selected.record.id,
    absoluteFiles: [filePath],
    note: `Edicion de la referencia ${selected.record.id}`,
  });
  const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, next, "utf8");
  fs.renameSync(tempPath, filePath);

  const loaded = loadIndexationRecords();
  const item = loaded.items[opts.ordinal];
  if (!item) throw new Error("No se pudo volver a leer la indexacion guardada.");
  return { item, revision: loaded.revision };
}

export function appendIndexationSections(
  content: string,
  values: Array<IndexationInput & { id: number }>,
): string {
  if (values.length === 0) return content;
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const maxId = Math.max(...values.map((value) => value.id));
  let next = content.replace(/^Referencias=.*$/im, `Referencias=${maxId}`);
  next = next.trimEnd();
  for (const raw of values) {
    const value = validated(raw);
    next += [
      "",
      "",
      `[REFERENCIA${raw.id}]`,
      `Nombre=${value.nombre}`,
      `GrhIndice=${value.grhIndice}`,
      `Ancho=${value.ancho}`,
      `Alto=${value.alto}`,
      `Capa=${value.capa}`,
      `Bloquear=${value.bloquear ? 1 : 0}`,
    ].join(newline);
  }
  return `${next}${newline}`;
}

export function maxIndexationId(content: string): number {
  let max = 0;
  for (const match of content.matchAll(/^\[REFERENCIA(\d+)\]/gim)) {
    max = Math.max(max, Number(match[1]));
  }
  return max;
}
