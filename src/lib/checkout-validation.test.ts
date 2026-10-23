import { describe, expect, it } from "vitest";
import { validateCheckoutRequest } from "./checkout-validation";

const catalog: Record<string, { id: string; name: string; priceCents: number }> = {
  hexenhut: { id: "hexenhut", name: "Hexenhut", priceCents: 1490 },
};
const getActive = (id: string) => catalog[id];

describe("validateCheckoutRequest", () => {
  it("uses catalog prices and ignores client prices", () => {
    const result = validateCheckoutRequest({ items: [{ id: "hexenhut", qty: 2, priceCents: 1 }] }, getActive);
    expect(result).toEqual({ ok: true, lines: [{ id: "hexenhut", qty: 2, name: "Hexenhut", priceCents: 1490 }] });
  });

  it("rejects an empty cart", () => {
    expect(validateCheckoutRequest({ items: [] }, getActive)).toMatchObject({ ok: false, error: "empty" });
    expect(validateCheckoutRequest(null, getActive)).toMatchObject({ ok: false, error: "empty" });
  });

  it("rejects quantities outside 1..10", () => {
    expect(validateCheckoutRequest({ items: [{ id: "hexenhut", qty: 0 }] }, getActive)).toMatchObject({ ok: false, error: "invalid" });
    expect(validateCheckoutRequest({ items: [{ id: "hexenhut", qty: 11 }] }, getActive)).toMatchObject({ ok: false, error: "invalid" });
  });

  it("rejects quantities that exceed 10 when duplicate lines are merged", () => {
    const body = { items: [{ id: "hexenhut", qty: 6 }, { id: "hexenhut", qty: 6 }] };
    expect(validateCheckoutRequest(body, getActive)).toMatchObject({ ok: false, error: "invalid" });
  });

  it("rejects unknown or inactive products", () => {
    expect(validateCheckoutRequest({ items: [{ id: "weg", qty: 1 }] }, getActive)).toMatchObject({ ok: false, error: "unavailable" });
  });

  it("rejects malformed items", () => {
    expect(validateCheckoutRequest({ items: [{ id: 5, qty: "2" }] }, getActive)).toMatchObject({ ok: false, error: "invalid" });
    expect(validateCheckoutRequest({ items: [{ id: "hexenhut", qty: 1.5 }] }, getActive)).toMatchObject({ ok: false, error: "invalid" });
  });
});
