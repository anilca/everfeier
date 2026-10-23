import { describe, expect, it } from "vitest";
import { ADMIN_SESSION_MS, createSessionToken, passwordMatches, verifySessionToken } from "./admin-auth";

const secret = "s".repeat(32);

describe("admin session token", () => {
  it("accepts a fresh token", () => {
    const now = 1_000_000;
    expect(verifySessionToken(createSessionToken(secret, now), secret, now + 1000)).toBe(true);
  });

  it("expires after 12 hours", () => {
    const now = 1_000_000;
    const token = createSessionToken(secret, now);
    expect(verifySessionToken(token, secret, now + ADMIN_SESSION_MS - 1)).toBe(true);
    expect(verifySessionToken(token, secret, now + ADMIN_SESSION_MS)).toBe(false);
  });

  it("rejects tampered tokens and other secrets", () => {
    const now = 1_000_000;
    const token = createSessionToken(secret, now);
    const [, sig] = token.split(".");
    expect(verifySessionToken(`${now + 10 * ADMIN_SESSION_MS}.${sig}`, secret, now)).toBe(false);
    expect(verifySessionToken(token, "t".repeat(32), now)).toBe(false);
    expect(verifySessionToken(undefined, secret, now)).toBe(false);
    expect(verifySessionToken("garbage", secret, now)).toBe(false);
  });
});

describe("passwordMatches", () => {
  it("compares exactly", () => {
    expect(passwordMatches("geheim", "geheim")).toBe(true);
    expect(passwordMatches("Geheim", "geheim")).toBe(false);
    expect(passwordMatches("", "")).toBe(false);
  });
});
