import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ESLint and TypeScript errors are NOT suppressed. They previously were
  // ("for Docker"), which let an entire class of error ship unnoticed.

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
