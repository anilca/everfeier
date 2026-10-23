import "server-only";

export const REQUIRED_ENV = [
  "STRIPE_SECRET_KEY",
  "NEXT_PUBLIC_SITE_URL",
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
  return problems;
}

export function env(name: EnvName): string {
  const value = process.env[name];
  if (!value) throw new Error(`Umgebungsvariable ${name} fehlt`);
  return value;
}

export function siteUrl(): string {
  return env("NEXT_PUBLIC_SITE_URL").replace(/\/+$/, "");
}
