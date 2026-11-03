import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  // Keep type checking in-process for portable, restricted build environments.
  experimental: { useTypeScriptCli: false, cpus: 2 },
};

export default nextConfig;
