import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  // Optimize for Bun runtime
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // No ESLint as per requirements
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
