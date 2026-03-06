import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use webpack for native module support
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark native modules as external
      config.externals = [
        ...(config.externals || []),
        'better-sqlite3',
        'drizzle-orm',
        'drizzle-orm/better-sqlite3',
        'drizzle-orm/sqlite-core',
      ];
    }
    return config;
  },
};

export default nextConfig;
