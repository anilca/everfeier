// Fetches the public pages of a running shop plus every script they load and fails
// if supplier data (supplier links, purchase prices) shows up anywhere.
//
// Usage: node scripts/check-supplier-leak.mjs [baseUrl]
import { readFileSync } from "node:fs";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/+$/, "");

const catalogSource = readFileSync(new URL("../src/lib/catalog.ts", import.meta.url), "utf8");
const productIds = [...catalogSource.matchAll(/^\s{4}id: "([^"]+)"/gm)].map((m) => m[1]);
const costCents = [...catalogSource.matchAll(/costCents: (\d+)/g)].map((m) => m[1]);

const pages = ["/", "/warenkorb", "/bestellung/verfolgen", "/vertrag-widerrufen", ...productIds.map((id) => `/produkt/${id}`)];
const patterns = [
  // Word match: framework code contains identifiers like "createMutableActionQueue".
  { name: "temu", test: (s) => /temu\.com|\btemu\b/i.test(s) },
  { name: "costCents", test: (s) => s.includes("costCents") },
  { name: "supplier", test: (s) => /["']?supplier["']?\s*:/.test(s) },
  // Purchase prices formatted like "14,47" or "14.47"
  ...costCents.map((c) => {
    const euros = `${Math.floor(c / 100)}`;
    const cents = c.slice(-2).padStart(2, "0");
    const re = new RegExp(`(?<![\\d])${euros}[,.]${cents}(?![\\d])`);
    return { name: `cost ${euros},${cents}`, test: (s) => re.test(s) };
  }),
];

const seenScripts = new Set();
const failures = [];

async function scan(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const body = await res.text();
  for (const p of patterns) if (p.test(body)) failures.push(`${url}: ${p.name}`);
  return body;
}

for (const page of pages) {
  const html = await scan(base + page);
  for (const m of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
    const src = new URL(m[1], base).toString();
    if (!seenScripts.has(src)) {
      seenScripts.add(src);
      await scan(src);
    }
  }
}

console.log(`Checked ${pages.length} pages and ${seenScripts.size} scripts.`);
if (failures.length > 0) {
  console.error("Supplier data leaked:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log("No supplier data found.");
