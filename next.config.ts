import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages depend on request time (season cutoff) and live Stripe data, so the
  // previous (non-Cache-Components) rendering model with force-dynamic is used.
  poweredByHeader: false,
};

export default nextConfig;

// Makes Cloudflare bindings available during `next dev`.
initOpenNextCloudflareForDev();
