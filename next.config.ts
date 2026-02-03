import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    // Allow access from any device on local network
    "http://10.116.91.125:3000",
    // Also allow localhost variants
    "http://localhost:3000",
  ],
};

export default nextConfig;
