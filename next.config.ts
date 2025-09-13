import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
  experimental: { reactCompiler: true },
  logging: { fetches: { fullUrl: true } },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
