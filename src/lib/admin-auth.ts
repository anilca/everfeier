import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "ef_admin";
export const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

function hmac(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordMatches(input: string, expected: string): boolean {
  return expected.length > 0 && safeEqual(input, expected);
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const expiresAt = String(now + ADMIN_SESSION_MS);
  return `${expiresAt}.${hmac(secret, expiresAt)}`;
}

export function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): boolean {
  if (!token) return false;
  const [expiresAt, signature, ...rest] = token.split(".");
  if (!expiresAt || !signature || rest.length > 0) return false;
  if (!safeEqual(signature, hmac(secret, expiresAt))) return false;
  const expiry = Number(expiresAt);
  return Number.isFinite(expiry) && expiry > now;
}
