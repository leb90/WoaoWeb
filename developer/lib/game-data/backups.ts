import fs from "node:fs";
import path from "node:path";
import { ensureDir, PATHS } from "../security/paths";

export type BackupMeta = {
  id: string;
  createdAt: string;
  resource: string;
  resourceId: string | number | null;
  files: string[];
  note?: string;
};

function backupRoot(): string {
  const dir = PATHS.backups();
  ensureDir(dir);
  return dir;
}

export function createBackup(opts: {
  resource: string;
  resourceId?: string | number | null;
  absoluteFiles: string[];
  note?: string;
}): BackupMeta {
  const id = `${Date.now()}_${opts.resource}${
    opts.resourceId != null ? `_${opts.resourceId}` : ""
  }`;
  const dir = path.join(backupRoot(), id);
  ensureDir(dir);

  const copied: string[] = [];
  for (const file of opts.absoluteFiles) {
    if (!fs.existsSync(file)) continue;
    const base = path.basename(file);
    // Disambiguate same basename from different dirs
    const destName =
      opts.absoluteFiles.filter((f) => path.basename(f) === base).length > 1
        ? `${path.basename(path.dirname(file))}_${base}`
        : base;
    fs.copyFileSync(file, path.join(dir, destName));
    copied.push(destName);
  }

  const meta: BackupMeta = {
    id,
    createdAt: new Date().toISOString(),
    resource: opts.resource,
    resourceId: opts.resourceId ?? null,
    files: copied,
    note: opts.note,
  };
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
  return meta;
}

export function listBackups(limit = 50): BackupMeta[] {
  const root = backupRoot();
  if (!fs.existsSync(root)) return [];
  const dirs = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .reverse()
    .slice(0, limit);

  const out: BackupMeta[] = [];
  for (const name of dirs) {
    const metaPath = path.join(root, name, "meta.json");
    if (!fs.existsSync(metaPath)) continue;
    out.push(JSON.parse(fs.readFileSync(metaPath, "utf8")) as BackupMeta);
  }
  return out;
}

export function restoreBackup(
  id: string,
  targetFiles: string[],
): void {
  const dir = path.join(backupRoot(), id);
  const metaPath = path.join(dir, "meta.json");
  if (!fs.existsSync(metaPath)) {
    throw new Error("Backup no encontrado");
  }
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8")) as BackupMeta;

  for (const target of targetFiles) {
    const base = path.basename(target);
    const candidates = [
      path.join(dir, `${path.basename(path.dirname(target))}_${base}`),
      path.join(dir, base),
    ];
    const src = candidates.find((c) => fs.existsSync(c));
    if (!src) {
      throw new Error(`Archivo de backup faltante para ${base}`);
    }
    // Backup current before restore
    createBackup({
      resource: meta.resource,
      resourceId: meta.resourceId,
      absoluteFiles: [target],
      note: `pre-restore-of-${id}`,
    });
    atomicWriteJsonFile(target, JSON.parse(fs.readFileSync(src, "utf8")));
  }
}

/** Write JSON atomically: temp → validate parse → rename */
export function atomicWriteJsonFile(absolutePath: string, data: unknown): void {
  const dir = path.dirname(absolutePath);
  ensureDir(dir);
  const tmp = path.join(
    dir,
    `.${path.basename(absolutePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  const serialized = JSON.stringify(data);
  // Validate round-trip
  JSON.parse(serialized);
  fs.writeFileSync(tmp, serialized, "utf8");
  fs.renameSync(tmp, absolutePath);
}

/** Pretty-print for human-edited catalogs (objs/npcs can be huge — keep compact) */
export function atomicWriteJsonFilePretty(
  absolutePath: string,
  data: unknown,
  pretty = false,
): void {
  const dir = path.dirname(absolutePath);
  ensureDir(dir);
  const tmp = path.join(
    dir,
    `.${path.basename(absolutePath)}.${process.pid}.${Date.now()}.tmp`,
  );
  const serialized = pretty
    ? `${JSON.stringify(data, null, 2)}\n`
    : JSON.stringify(data);
  JSON.parse(serialized);
  fs.writeFileSync(tmp, serialized, "utf8");
  fs.renameSync(tmp, absolutePath);
}
