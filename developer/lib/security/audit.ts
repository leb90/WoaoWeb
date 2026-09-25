import fs from "node:fs";
import path from "node:path";
import { ensureDir, PATHS } from "./paths";
import type { SessionPayload } from "./auth";

export type AuditEntry = {
  at: string;
  username: string;
  action: string;
  resourceType: string;
  resourceId: string | number | null;
  file: string;
};

export function appendAudit(
  session: SessionPayload,
  entry: Omit<AuditEntry, "at" | "username">,
): void {
  ensureDir(PATHS.data());
  const line = JSON.stringify({
    at: new Date().toISOString(),
    username: session.username,
    ...entry,
  } satisfies AuditEntry);
  fs.appendFileSync(path.join(PATHS.data(), "audit-log.jsonl"), `${line}\n`, "utf8");
}

export function readRecentAudit(limit = 100): AuditEntry[] {
  const file = path.join(PATHS.data(), "audit-log.jsonl");
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").trim().split("\n").filter(Boolean);
  return lines
    .slice(-limit)
    .reverse()
    .map((line) => JSON.parse(line) as AuditEntry);
}
