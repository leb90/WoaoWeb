import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  agentRules: false,
  serverExternalPackages: ["sharp"],
};

export default nextConfig;
