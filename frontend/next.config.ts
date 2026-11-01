import { execSync } from "node:child_process";
import type { NextConfig } from "next";

function resolveBuildId(): string {
    if (process.env.NEXT_BUILD_ID?.trim()) {
        return process.env.NEXT_BUILD_ID.trim();
    }

    try {
        return execSync("git rev-parse --short=12 HEAD", {
            encoding: "utf8",
        }).trim();
    } catch {
        return "development";
    }
}

const buildId = resolveBuildId();

const nextConfig: NextConfig = {
    allowedDevOrigins: ["127.0.0.1", "localhost"],
    env: {
        NEXT_PUBLIC_NEXT_BUILD_ID: buildId,
    },
    generateBuildId: async () => buildId,
    // Los cursores llevan versión en la URL (?v= en globals.css y lib/gameCursors.ts): se pueden guardar para siempre.
    // Con la caché por defecto (max-age=0) el navegador los vuelve a pedir en cada carga y mientras tanto muestra la
    // flecha del sistema.
    async headers() {
        return [
            {
                source: "/cursors/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
