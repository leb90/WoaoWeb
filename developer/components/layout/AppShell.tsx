"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/maps", label: "Mapas" },
  { href: "/objects", label: "Objetos" },
  { href: "/npcs", label: "NPCs" },
  { href: "/spells", label: "Hechizos" },
  { href: "/crafting", label: "Crafting" },
  { href: "/balance", label: "Balance" },
  { href: "/validation", label: "Validación" },
  { href: "/backups", label: "Backups" },
  { href: "/logs", label: "Logs" },
  { href: "/git", label: "Git" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
      <div
      style={{
        display: "grid",
        gridTemplateRows: "48px minmax(0, 1fr)",
        minHeight: "100vh",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-panel)",
        }}
      >
        <strong style={{ letterSpacing: 0.3 }}>
          World of Argentum Developer Tools
        </strong>
        <button
          type="button"
          onClick={logout}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Salir
        </button>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0, 1fr)", minHeight: 0, overflow: "hidden" }}>
        <nav
          style={{
            borderRight: "1px solid var(--border)",
            background: "var(--bg-panel)",
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflowY: "auto",
            minHeight: 0,
          }}
        >
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: active ? "var(--bg-elevated)" : "transparent",
                  color: active ? "var(--text)" : "var(--text-muted)",
                  fontWeight: active ? 600 : 400,
                  borderLeft: active
                    ? "3px solid var(--accent)"
                    : "3px solid transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <main
          style={{
            padding: pathname.startsWith("/maps/") ? 8 : 20,
            overflow: pathname.startsWith("/maps/") ? "hidden" : "auto",
            minHeight: 0,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
