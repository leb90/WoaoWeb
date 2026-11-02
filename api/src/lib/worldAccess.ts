import { sanitizeName } from "./text";

export const WORLD_CLOSED_MESSAGE =
  "Estamos trabajando para largar una beta en condiciones. Mientras tanto, podés jugar en las arenas.";

/** Sin lista (local, tests) el mundo queda abierto para todas las cuentas. */
export function parseWorldAccessAllowlist(
  raw: string | undefined,
): string[] | null {
  const entries = (raw ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries.length > 0 ? entries : null;
}

/**
 * Cada entrada es un email (si tiene @) o un nombre de cuenta. Se compara el
 * nombre sanitizado porque es lo que el registro mantiene único: nadie puede
 * crear "Lébnov" para pasar por "lebnov".
 */
export function hasWorldAccess(
  account: { name: string; email: string },
  allowlist: readonly string[] | null,
): boolean {
  if (!allowlist) {
    return true;
  }

  const email = account.email.trim().toLowerCase();
  const name = sanitizeName(account.name);

  return allowlist.some((entry) =>
    entry.includes("@")
      ? entry.toLowerCase() === email
      : sanitizeName(entry) === name,
  );
}
