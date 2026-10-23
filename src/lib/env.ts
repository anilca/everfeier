import "server-only";

export const REQUIRED_ENV = [
  "STRIPE_SECRET_KEY",
  "SITE_URL",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
  "RESEND_API_KEY",
  "MAIL_FROM",
  "OPERATOR_EMAIL",
  "SHOP_MODE",
  "ORDER_CUTOFF",
  "VAT_MODE",
] as const;

export type EnvName = (typeof REQUIRED_ENV)[number];

/** Returns the names of required variables that are missing or invalid. */
export function findEnvProblems(env: Record<string, string | undefined>): string[] {
  const problems: string[] = [];
  for (const name of REQUIRED_ENV) {
    if (!env[name] || env[name]!.trim() === "") problems.push(`${name} fehlt`);
  }
  if (env.SHOP_MODE && !["open", "closed"].includes(env.SHOP_MODE)) {
    problems.push("SHOP_MODE muss 'open' oder 'closed' sein");
  }
  if (env.VAT_MODE && !["kleinunternehmer", "regular"].includes(env.VAT_MODE)) {
    problems.push("VAT_MODE muss 'kleinunternehmer' oder 'regular' sein");
  }
  if (env.ORDER_CUTOFF && Number.isNaN(Date.parse(env.ORDER_CUTOFF))) {
    problems.push("ORDER_CUTOFF ist kein gültiges ISO-Datum");
  }
  if (env.ADMIN_SESSION_SECRET && env.ADMIN_SESSION_SECRET.length < 32) {
    problems.push("ADMIN_SESSION_SECRET muss mindestens 32 Zeichen lang sein");
  }
  if (env.SITE_URL && !/^https?:\/\//.test(env.SITE_URL)) {
    problems.push("SITE_URL muss mit http:// oder https:// beginnen");
  }
  return problems;
}

let validated = false;

/**
 * Validates the whole configuration once, on first use. Runs lazily because
 * instrumentation hooks are not guaranteed on every host (e.g. Cloudflare Workers).
 */
export function assertEnv(source: Record<string, string | undefined> = process.env): void {
  if (validated) return;
  const problems = findEnvProblems(source);
  if (problems.length > 0) {
    throw new Error(`Konfiguration unvollständig (siehe .env.example):\n- ${problems.join("\n- ")}`);
  }
  validated = true;
}

export function env(name: EnvName): string {
  assertEnv();
  return process.env[name]!;
}

export function siteUrl(): string {
  return env("SITE_URL").replace(/\/+$/, "");
}
