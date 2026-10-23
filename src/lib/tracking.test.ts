import { describe, expect, it, vi } from "vitest";
import { makeOrder } from "./test-fixtures";
import { lookupOrder } from "./tracking";

describe("lookupOrder", () => {
  it("matches order number and e-mail case-insensitively", async () => {
    const find = vi.fn(async () => makeOrder());
    const view = await lookupOrder("ef-7k3qxm", "  KUNDE@Example.de ", find);
    expect(find).toHaveBeenCalledWith("EF-7K3QXM");
    expect(view?.orderNo).toBe("EF-7K3QXM");
    expect(view?.statusLabel).toBe("Eingegangen");
    expect(view?.shipment).toBeUndefined();
  });

  it("returns null for a wrong e-mail and for an unknown order alike", async () => {
    expect(await lookupOrder("EF-7K3QXM", "falsch@example.de", async () => makeOrder())).toBeNull();
    expect(await lookupOrder("EF-7K3QXM", "kunde@example.de", async () => null)).toBeNull();
  });

  it("does not query for malformed order numbers", async () => {
    const find = vi.fn(async () => makeOrder());
    expect(await lookupOrder("abc", "kunde@example.de", find)).toBeNull();
    expect(find).not.toHaveBeenCalled();
  });

  it("shows carrier link once shipped", async () => {
    const order = makeOrder({ status: "versendet", carrier: "dhl", trackingNo: "00340434" });
    const view = await lookupOrder("EF-7K3QXM", "kunde@example.de", async () => order);
    expect(view?.statusLabel).toBe("Versendet");
    expect(view?.shipment).toMatchObject({ carrier: "DHL", trackingNo: "00340434" });
    expect(view?.shipment?.url).toContain("dhl.de");
  });

  it("never exposes internal notes, address or payment ids", async () => {
    const order = makeOrder({ internalNote: "Temu PO-123456", withdrawalAt: "2026-10-27T10:00:00Z" });
    const view = await lookupOrder("EF-7K3QXM", "kunde@example.de", async () => order);
    const json = JSON.stringify(view);
    expect(json).not.toContain("PO-123456");
    expect(json).not.toContain("Musterstr");
    expect(json).not.toContain("pi_123");
  });
});
