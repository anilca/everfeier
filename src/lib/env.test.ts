import { describe, expect, it } from "vitest";
import { assertEnv, findEnvProblems, REQUIRED_ENV } from "./env";

const valid = {
  STRIPE_SECRET_KEY: "sk_test_x",
  SITE_URL: "http://localhost:3000",
  ADMIN_PASSWORD: "pw",
  ADMIN_SESSION_SECRET: "x".repeat(32),
  RESEND_API_KEY: "re_x",
  MAIL_FROM: "a@b.de",
  OPERATOR_EMAIL: "c@d.de",
  SHOP_MODE: "open",
  ORDER_CUTOFF: "2026-10-28T23:59:00+01:00",
  VAT_MODE: "kleinunternehmer",
};

describe("findEnvProblems", () => {
  it("accepts a complete configuration", () => {
    expect(findEnvProblems(valid)).toEqual([]);
  });

  it("reports every missing variable", () => {
    expect(findEnvProblems({})).toHaveLength(REQUIRED_ENV.length);
  });

  it("rejects invalid enum, date and URL values", () => {
    const problems = findEnvProblems({ ...valid, SHOP_MODE: "x", VAT_MODE: "y", ORDER_CUTOFF: "morgen", SITE_URL: "everfeier.com" });
    expect(problems).toHaveLength(4);
  });

  it("no longer requires the old NEXT_PUBLIC_SITE_URL", () => {
    expect(REQUIRED_ENV).not.toContain("NEXT_PUBLIC_SITE_URL" as never);
  });
});

describe("assertEnv", () => {
  it("throws one error listing all problems", () => {
    expect(() => assertEnv({ ...valid, STRIPE_SECRET_KEY: "", VAT_MODE: "falsch" })).toThrowError(
      /STRIPE_SECRET_KEY fehlt\n- VAT_MODE muss/,
    );
  });

  it("passes for a valid configuration", () => {
    expect(() => assertEnv(valid)).not.toThrow();
  });
});
