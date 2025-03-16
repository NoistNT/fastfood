import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  experimental: { reactCompiler: true },
  logging: { fetches: { fullUrl: true } },
};

export default nextConfig;
