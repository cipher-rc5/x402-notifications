import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
  // Optimize for Bun runtime
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
};

export default nextConfig;
