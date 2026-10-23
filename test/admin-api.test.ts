import { beforeAll, describe, expect, it, vi } from "vitest";
import { ADMIN_COOKIE, createSessionToken } from "@/lib/admin-auth";

const secret = "x".repeat(32);

vi.mock("@/lib/stripe", () => ({
  getStripe: () => {
    throw new Error("Stripe must not be called without a session");
  },
}));

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = secret;
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
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
