/** @type {import('next').NextConfig} */
const { withSentryConfig } = require("@sentry/nextjs");

const nextConfig = {
  reactStrictMode: false,

  swcMinify: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error"],
          }
        : false,
  },

  images: {
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: [
      "@solana/web3.js",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-react-ui",
      "@solana/wallet-adapter-base",
      "@tanstack/react-query",
      "lucide-react",
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.externals = config.externals || [];
    config.externals.push({
      "pino-pretty": "commonjs pino-pretty",
    });

    return config;
  },
};

module.exports = withSentryConfig(nextConfig, {
  org: "the-solutions",
  project: "javascript-nextjs",

  silent: !process.env.CI,

  widenClientFileUpload: true,

  tunnelRoute: "/monitoring",

  automaticVercelMonitors: true,

  treeshake: {
    removeDebugLogging: true,
  },
});