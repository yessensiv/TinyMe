import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { cpus: 1 },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
  webpack(config) {
    // The existing Tailwind loader also implements the webpack loader API.
    config.module.rules.push({
      test: /[\\/]app[\\/]globals\.css$/,
      enforce: "pre",
      use: ["@tailwindcss/turbopack"],
    });
    return config;
  },
};

export default nextConfig;
