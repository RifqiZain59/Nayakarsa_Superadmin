import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - This is a development-only option for Turbopack network access
  allowedDevOrigins: ['192.168.1.71'],
};

export default nextConfig;
