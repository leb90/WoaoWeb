import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { ensureDir, PATHS } from "./paths";
import {
  SESSION_COOKIE,
  signSession,
  type SessionPayload,
} from "./session";

const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

export type AdminRecord = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
};

type AdminsFile = { admins: AdminRecord[] };

function adminsFilePath(): string {
  return path.join(PATHS.data(), "admins.json");
}

function readAdmins(): AdminsFile {
  ensureDir(PATHS.data());
  const file = adminsFilePath();
  if (!fs.existsSync(file)) {
    return { admins: [] };
  }
  return JSON.parse(fs.readFileSync(file, "utf8")) as AdminsFile;
}

function writeAdmins(data: AdminsFile): void {
  ensureDir(PATHS.data());
  fs.writeFileSync(adminsFilePath(), JSON.stringify(data, null, 2), "utf8");
}

export async function ensureBootstrapAdmin(): Promise<void> {
  const data = readAdmins();
  if (data.admins.length > 0) return;

  const username = process.env.DEVELOPER_ADMIN_USER?.trim();
  const password = process.env.DEVELOPER_ADMIN_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "Configurá DEVELOPER_ADMIN_USER y DEVELOPER_ADMIN_PASSWORD en developer/.env",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  data.admins.push({
    id: randomBytes(8).toString("hex"),
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  writeAdmins(data);
}

export async function verifyLogin(
  username: string,
  password: string,
): Promise<AdminRecord | null> {
  await ensureBootstrapAdmin();
  const data = readAdmins();
  const admin = data.admins.find(
    (a) => a.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? admin : null;
}

export async function createSessionToken(admin: AdminRecord): Promise<string> {
  return signSession({
    adminId: admin.id,
    username: admin.username,
    exp: Date.now() + SESSION_TTL_MS,
  });
}

export function sessionCookieHeader(token: string): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ].join("; ");
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export type { SessionPayload };
export { SESSION_COOKIE };
