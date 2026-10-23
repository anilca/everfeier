import { describe, expect, it } from "vitest";
import { findEnvProblems, REQUIRED_ENV } from "./env";

const valid = {
  STRIPE_SECRET_KEY: "sk_test_x",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
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

  it("rejects invalid enum and date values", () => {
    const problems = findEnvProblems({ ...valid, SHOP_MODE: "x", VAT_MODE: "y", ORDER_CUTOFF: "morgen" });
    expect(problems).toHaveLength(3);
  });
});
