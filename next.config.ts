import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "."),
  },
  experimental: {
    browserDebugInfoInTerminal: true,
  }
};

export default nextConfig;
