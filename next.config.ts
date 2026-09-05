import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Prevent double-mounting with Deck.gl/MapLibre
  typescript: {
    ignoreBuildErrors: true,
  },
  // Allow external map tile resources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'server.arcgisonline.com',
      },
    ],
  },
  // Transpile deck.gl packages
  transpilePackages: ['deck.gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/geo-layers', '@deck.gl/extensions', '@deck.gl/aggregation-layers'],
};

export default nextConfig;