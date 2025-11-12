import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for Bun runtime
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
}

export default nextConfig
