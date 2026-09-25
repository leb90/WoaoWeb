import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { jsonError, requireSession } from "@/lib/security/api";
import { PATHS } from "@/lib/security/paths";
import {
  listNpcSummaries,
  listObjectSummaries,
  listSpellSummaries,
} from "@/lib/game-data/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireSession();
    const mapsRoot = PATHS.serverMaps();
    let mapCount = 0;
    if (fs.existsSync(mapsRoot)) {
      mapCount = fs
        .readdirSync(mapsRoot, { withFileTypes: true })
        .filter((d) => d.isDirectory() && d.name.startsWith("mapa_")).length;
    }
    return NextResponse.json({
      counts: {
        objects: listObjectSummaries().length,
        npcs: listNpcSummaries().length,
        spells: listSpellSummaries().length,
        maps: mapCount,
      },
      sources: {
        objs: path.join("api", "src", "jsons", "objs.json"),
        npcs: path.join("api", "src", "jsons", "npcs.json"),
        spells: "api + server jsons/spells.json",
        maps: path.join("server", "mapas_source"),
        indices: path.join("Recursos", "indices.ini"),
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
