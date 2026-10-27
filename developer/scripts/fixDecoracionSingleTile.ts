/**
 * Convierte "Casa Entrenamiento - Decoracion *" de stamps multi-tile 32x32
 * a 1 GRH con el tamaño real del grafico (Ancho=1 Alto=1), y consolida
 * las colocaciones en mapa_34.
 *
 * Uso (desde developer/):
 *   npx --yes tsx scripts/fixDecoracionSingleTile.ts
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createBackup } from "../lib/game-data/backups";
import { resolveGraphicsPngAbsolute, resolveGrh } from "../lib/graphics/grh";
import { loadMapEditorState, saveMapEditorState } from "../lib/maps/io";
import { PATHS, ensureDir } from "../lib/security/paths";

const NAME_PREFIX = "Casa Entrenamiento - Decoracion";

type Stamp = {
  id: number;
  ordinal: number;
  nombre: string;
  grhIndice: number;
  ancho: number;
  alto: number;
  capa: number;
  bloquear: boolean;
  bodyStart: number;
  bodyEnd: number;
};

function parseStamps(content: string): Stamp[] {
  const newline = content.includes("\r\n") ? "\r\n" : "\n";
  const stamps: Stamp[] = [];
  const re = /\[REFERENCIA(\d+)\]\r?\n([\s\S]*?)(?=\r?\n\[REFERENCIA|\r?\nReferencias=|$)/gi;
  let match: RegExpExecArray | null;
  let ordinal = 0;
  while ((match = re.exec(content))) {
    const id = Number(match[1]);
    const body = match[2] ?? "";
    const nombre = (/^Nombre=(.*)$/im.exec(body)?.[1] ?? "").trim();
    if (!nombre.startsWith(NAME_PREFIX)) {
      ordinal += 1;
      continue;
    }
    const grhIndice = Number(/^GrhIndice=(\d+)$/im.exec(body)?.[1] ?? 0);
    const ancho = Number(/^Ancho=(\d+)$/im.exec(body)?.[1] ?? 1);
    const alto = Number(/^Alto=(\d+)$/im.exec(body)?.[1] ?? 1);
    const capa = Number(/^Capa=(\d+)$/im.exec(body)?.[1] ?? 1);
    const bloquear = /^Bloquear=1$/im.test(body);
    const header = `[REFERENCIA${id}]${newline}`;
    const bodyStart = match.index + header.length;
    const bodyEnd = match.index + match[0].length;
    stamps.push({
      id,
      ordinal,
      nombre,
      grhIndice,
      ancho,
      alto,
      capa,
      bloquear,
      bodyStart,
      bodyEnd,
    });
    ordinal += 1;
  }
  return stamps;
}

function maxNumericKey(record: Record<string, unknown>): number {
  let max = 0;
  for (const key of Object.keys(record)) {
    const value = Number(key);
    if (Number.isInteger(value)) max = Math.max(max, value);
  }
  return max;
}

function nextGraphicFile(): number {
  let max = 0;
  for (const name of fs.readdirSync(PATHS.frontendGraphics())) {
    const match = /^(\d+)\.png$/i.exec(name);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

async function reconstructStamp(
  grhIndice: number,
  ancho: number,
  alto: number,
): Promise<{ data: Buffer; width: number; height: number }> {
  const width = ancho * 32;
  const height = alto * 32;
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  for (let tileY = 0; tileY < alto; tileY += 1) {
    for (let tileX = 0; tileX < ancho; tileX += 1) {
      const graphic = resolveGrh(grhIndice + tileY * ancho + tileX);
      if (!graphic) continue;
      const extracted = await sharp(resolveGraphicsPngAbsolute(graphic.numFile))
        .extract({
          left: graphic.sX,
          top: graphic.sY,
          width: graphic.width,
          height: graphic.height,
        })
        .png()
        .toBuffer();
      composites.push({
        input: extracted,
        left: tileX * 32,
        top: tileY * 32,
      });
    }
  }
  const canvas = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Recortar transparencia para recuperar la dimension real del grafico.
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = canvas.data[(y * width + x) * 4 + 3] ?? 0;
      if (alpha < 8) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (maxX < minX || maxY < minY) {
    return {
      data: await sharp(canvas.data, { raw: { width, height, channels: 4 } }).png().toBuffer(),
      width,
      height,
    };
  }
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;
  const data = await sharp(canvas.data, { raw: { width, height, channels: 4 } })
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .png()
    .toBuffer();
  return { data, width: cropW, height: cropH };
}

function replaceField(body: string, key: string, value: string, newline: string): string {
  const expression = new RegExp(`^${key}=.*$`, "im");
  if (expression.test(body)) return body.replace(expression, `${key}=${value}`);
  const suffix = body.endsWith("\n") || body.endsWith("\r") ? "" : newline;
  return `${body}${suffix}${key}=${value}${newline}`;
}

function consolidateMapStamps(
  tiles: Array<Array<{ layers: [number, number, number, number]; blocked: boolean }>>,
  width: number,
  height: number,
  stamps: Array<{ grhIndice: number; ancho: number; alto: number; capa: number }>,
): number {
  let changes = 0;
  for (const stamp of stamps) {
    const tileCount = stamp.ancho * stamp.alto;
    if (tileCount <= 1) continue;
    // Buscar en todas las capas: el editor pudo colocar el stamp en la capa activa
    // aunque la indexacion diga otra.
    for (let layerIndex = 0; layerIndex < 4; layerIndex += 1) {
      const origins = new Set<string>();
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const grh = tiles[y]![x]!.layers[layerIndex];
          if (grh < stamp.grhIndice || grh >= stamp.grhIndice + tileCount) continue;
          const offset = grh - stamp.grhIndice;
          const dx = offset % stamp.ancho;
          const dy = Math.floor(offset / stamp.ancho);
          origins.add(`${x - dx},${y - dy}`);
        }
      }
      if (origins.size === 0) continue;
      for (const key of origins) {
        const [ox, oy] = key.split(",").map(Number);
        for (let dy = 0; dy < stamp.alto; dy += 1) {
          for (let dx = 0; dx < stamp.ancho; dx += 1) {
            const x = ox! + dx;
            const y = oy! + dy;
            if (x < 0 || y < 0 || x >= width || y >= height) continue;
            const tile = tiles[y]![x]!;
            const expected = stamp.grhIndice + dy * stamp.ancho + dx;
            if (tile.layers[layerIndex] !== expected) continue;
            if (dx === 0 && dy === 0) continue;
            tile.layers[layerIndex] = 0;
            changes += 1;
          }
        }
        if (ox! >= 0 && oy! >= 0 && ox! < width && oy! < height) {
          const anchor = tiles[oy!]![ox!]!;
          if (anchor.layers[layerIndex] !== stamp.grhIndice) {
            anchor.layers[layerIndex] = stamp.grhIndice;
            changes += 1;
          }
        }
      }
    }
  }
  return changes;
}

async function main() {
  const indicesPath = PATHS.indicesIni();
  const verbosePath = path.join(PATHS.frontendInit(), "graficos.json");
  const optimizedPath = path.join(PATHS.frontendInit(), "graficos_optimized.json");
  let indicesContent = fs.readFileSync(indicesPath, "utf8");
  const newline = indicesContent.includes("\r\n") ? "\r\n" : "\n";
  const stamps = parseStamps(indicesContent).filter(
    (stamp) => stamp.capa !== 1 && stamp.ancho * stamp.alto > 1,
  );
  if (stamps.length === 0) {
    console.log("No hay decoraciones multi-tile para convertir.");
    return;
  }

  console.log(`Convirtiendo ${stamps.length} indexaciones...`);
  const verbose = JSON.parse(fs.readFileSync(verbosePath, "utf8")) as Record<
    string,
    {
      numFrames: number;
      numFile: number;
      sX: number;
      sY: number;
      width: number;
      height: number;
      frames: Record<string, number>;
    }
  >;
  const optimized = JSON.parse(fs.readFileSync(optimizedPath, "utf8")) as Record<
    string,
    unknown
  >;

  type Packed = Stamp & {
    atlasX: number;
    atlasY: number;
    pixelWidth: number;
    pixelHeight: number;
    png: Buffer;
  };

  const reconstructed: Packed[] = [];
  for (const stamp of stamps) {
    const piece = await reconstructStamp(stamp.grhIndice, stamp.ancho, stamp.alto);
    reconstructed.push({
      ...stamp,
      atlasX: 0,
      atlasY: 0,
      pixelWidth: piece.width,
      pixelHeight: piece.height,
      png: piece.data,
    });
    console.log(
      `  ${stamp.nombre}: ${stamp.ancho}x${stamp.alto} -> ${piece.width}x${piece.height}px (GRH ${stamp.grhIndice})`,
    );
  }

  const widest = Math.max(...reconstructed.map((item) => item.pixelWidth));
  const atlasWidth = Math.max(widest, Math.min(2048, 1024));
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  for (const item of reconstructed) {
    if (x > 0 && x + item.pixelWidth > atlasWidth) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    item.atlasX = x;
    item.atlasY = y;
    x += item.pixelWidth;
    rowHeight = Math.max(rowHeight, item.pixelHeight);
  }
  const atlasHeight = y + rowHeight;
  const graphicFile = nextGraphicFile();
  ensureDir(PATHS.frontendGraphics());
  const atlas = await sharp({
    create: {
      width: atlasWidth,
      height: Math.max(1, atlasHeight),
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(
      reconstructed.map((item) => ({
        input: item.png,
        left: item.atlasX,
        top: item.atlasY,
      })),
    )
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();

  for (const item of reconstructed) {
    const grh = item.grhIndice;
    verbose[String(grh)] = {
      numFrames: 1,
      numFile: graphicFile,
      sX: item.atlasX,
      sY: item.atlasY,
      width: item.pixelWidth,
      height: item.pixelHeight,
      frames: { "1": grh },
    };
    optimized[String(grh)] = [
      graphicFile,
      item.atlasX,
      item.atlasY,
      item.pixelWidth,
      item.pixelHeight,
    ];
  }

  // Actualizar indices de atras hacia adelante para no desplazar offsets.
  const sortedByBody = [...reconstructed].sort((a, b) => b.bodyStart - a.bodyStart);
  for (const item of sortedByBody) {
    let body = indicesContent.slice(item.bodyStart, item.bodyEnd);
    body = replaceField(body, "Ancho", "1", newline);
    body = replaceField(body, "Alto", "1", newline);
    indicesContent = `${indicesContent.slice(0, item.bodyStart)}${body}${indicesContent.slice(item.bodyEnd)}`;
  }

  createBackup({
    resource: "map-indexations",
    resourceId: reconstructed[0]!.id,
    absoluteFiles: [verbosePath, optimizedPath, indicesPath],
    note: `Conversion ${NAME_PREFIX} a 1 tile`,
  });

  const graphicPath = path.join(PATHS.frontendGraphics(), `${graphicFile}.png`);
  fs.writeFileSync(graphicPath, atlas);
  fs.writeFileSync(verbosePath, JSON.stringify(verbose));
  fs.writeFileSync(optimizedPath, JSON.stringify(optimized));
  fs.writeFileSync(indicesPath, indicesContent, "utf8");
  console.log(`Atlas ${graphicFile}.png (${atlasWidth}x${atlasHeight})`);
  console.log(`GRHs actualizados: ${reconstructed.length} (max key ${maxNumericKey(optimized)})`);

  // Consolidar colocaciones existentes en el mapa de entrenamiento.
  try {
    const state = loadMapEditorState(34);
    const before = reconstructed.map((item) => ({
      grhIndice: item.grhIndice,
      ancho: item.ancho,
      alto: item.alto,
      capa: item.capa,
    }));
    const changes = consolidateMapStamps(
      state.tiles,
      state.width,
      state.height,
      before,
    );
    if (changes > 0) {
      saveMapEditorState(state, {
        adminId: "migration",
        username: "migration",
        exp: Date.now() + 60_000,
      });
      console.log(`mapa_34 consolidado: ${changes} celdas ajustadas.`);
    } else {
      console.log("mapa_34: sin celdas multi-tile de estas decoraciones.");
    }
  } catch (error) {
    console.warn(
      "No se pudo consolidar mapa_34 automaticamente:",
      error instanceof Error ? error.message : error,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
