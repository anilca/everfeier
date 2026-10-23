import { beforeAll, describe, expect, it, vi } from "vitest";
import { ADMIN_COOKIE, createSessionToken } from "@/lib/admin-auth";

const secret = "x".repeat(32);

vi.mock("@/lib/stripe", () => ({
  getStripe: () => {
    throw new Error("Stripe must not be called without a session");
  },
}));

beforeAll(() => {
  Object.assign(process.env, {
    STRIPE_SECRET_KEY: "sk_test_x",
    SITE_URL: "http://localhost:3000",
    ADMIN_PASSWORD: "pw",
    ADMIN_SESSION_SECRET: secret,
    RESEND_API_KEY: "re_x",
    MAIL_FROM: "a@b.de",
    OPERATOR_EMAIL: "c@d.de",
    SHOP_MODE: "open",
    ORDER_CUTOFF: "2026-10-28T23:59:00+01:00",
    VAT_MODE: "kleinunternehmer",
  });
});

describe("admin order API", () => {
  it("rejects requests without a session with 401", async () => {
    const { POST } = await import("@/app/api/admin/orders/[id]/route");
    const form = new FormData();
    form.set("status", "storniert");
    const res = await POST(new Request("http://localhost/api/admin/orders/pi_1", { method: "POST", body: form }), {
      params: Promise.resolve({ id: "pi_1" }),
    });
    expect(res.status).toBe(401);
  });

  it("rejects a forged cookie with 401", async () => {
    const { POST } = await import("@/app/api/admin/orders/[id]/route");
    const forged = createSessionToken("y".repeat(32));
    const res = await POST(
      new Request("http://localhost/api/admin/orders/pi_1", {
        method: "POST",
        headers: { cookie: `${ADMIN_COOKIE}=${forged}` },
        body: new FormData(),
      }),
      { params: Promise.resolve({ id: "pi_1" }) },
    );
    expect(res.status).toBe(401);
  });
});
