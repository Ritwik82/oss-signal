import type { NextConfig } from "next";

// Security headers (CSP + friends) are set per-request in proxy.ts, which
// generates a fresh nonce for Next's inline scripts. Nothing else needed here.
const nextConfig: NextConfig = {};

export default nextConfig;
