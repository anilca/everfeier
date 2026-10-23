// OpenNext bundles the values of local .env files into the worker. Refuse to
// build for deployment while such files exist, so local or test secrets never
// end up in a deployed bundle. Production values belong in Cloudflare
// (dashboard variables/secrets or `wrangler secret put`).
import { readdirSync } from "node:fs";

const root = new URL("..", import.meta.url);
const offenders = readdirSync(root).filter((f) => /^\.env(\..+)?$/.test(f) && f !== ".env.example");

if (offenders.length > 0) {
  console.error(
    `Deploy abgebrochen: ${offenders.join(", ")} würde in den Worker gebündelt.\n` +
      "Deploye über Cloudflare Workers Builds (GitHub) oder verschiebe die Datei(en) vorübergehend.",
  );
  process.exit(1);
}
