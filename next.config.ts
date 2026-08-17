import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fys.tff.org',
      },
      {
        protocol: 'http',
        hostname: 'fys.tff.org',
      }
    ],
  },
};

export default nextConfig;
