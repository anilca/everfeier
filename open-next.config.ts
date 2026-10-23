import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every page is rendered per request (season cutoff, live Stripe data), so no
// incremental cache (R2/KV) is configured.
export default defineCloudflareConfig();
