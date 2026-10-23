import type Stripe from "stripe";
import { describe, expect, it, vi } from "vitest";
import { findOrderByNo, listOrders, orderFromSession, updateOrderMetadata } from "./orders";

function session(overrides: Record<string, unknown> = {}, piOverrides: Record<string, unknown> = {}) {
  return {
    id: "cs_1",
    created: 1793000000,
    metadata: { shop: "everfeier", order_no: "EF-7K3QXM" },
    payment_status: "paid",
    amount_total: 1980,
    shipping_cost: { amount_total: 490 },
    customer_details: { email: "kunde@example.de", name: "Erika" },
    collected_information: {
      shipping_details: {
        name: "Erika Musterfrau",
        address: { line1: "Musterstr. 1", line2: null, postal_code: "10115", city: "Berlin", country: "DE" },
      },
    },
    payment_intent: {
      id: "pi_1",
      status: "succeeded",
      amount: 1980,
      metadata: { shop: "everfeier", order_no: "EF-7K3QXM", status: "versendet", carrier: "dhl", tracking_no: "123", internal_note: "PO-1" },
      ...piOverrides,
    },
    ...overrides,
  } as unknown as Stripe.Checkout.Session;
}

const lineItems = [
  { description: "Hexenhut", quantity: 1, amount_total: 1490, price: { product: { metadata: { product_id: "hexenhut" } } } },
] as unknown as Stripe.LineItem[];

function fakeStripe(sessions: Stripe.Checkout.Session[]) {
  return {
    checkout: {
      sessions: {
        list: vi.fn(async (params: { payment_intent?: string }) => ({
          data: params.payment_intent
            ? sessions.filter((s) => (s.payment_intent as Stripe.PaymentIntent).id === params.payment_intent)
            : sessions,
        })),
        listLineItems: vi.fn(async () => ({ data: lineItems })),
        retrieve: vi.fn(),
      },
    },
    paymentIntents: {
      search: vi.fn(async () => ({ data: sessions.map((s) => s.payment_intent) })),
      update: vi.fn(async () => ({})),
    },
  } as unknown as Stripe;
}

describe("orderFromSession", () => {
  it("maps a paid session to an order", () => {
    const order = orderFromSession(session(), lineItems)!;
    expect(order).toMatchObject({
      orderNo: "EF-7K3QXM",
      paymentIntentId: "pi_1",
      status: "versendet",
      carrier: "dhl",
      trackingNo: "123",
      internalNote: "PO-1",
      email: "kunde@example.de",
      customerName: "Erika Musterfrau",
      amountTotalCents: 1980,
      shippingCents: 490,
      shippingAddress: { line1: "Musterstr. 1", postalCode: "10115", city: "Berlin" },
      items: [{ productId: "hexenhut", name: "Hexenhut", qty: 1, totalCents: 1490 }],
    });
  });

  it("ignores unpaid sessions and sessions of other shops", () => {
    expect(orderFromSession(session({ payment_status: "unpaid" }))).toBeNull();
    expect(orderFromSession(session({ metadata: { shop: "other" } }))).toBeNull();
    expect(orderFromSession(session({}, { status: "processing" }))).toBeNull();
  });

  it("defaults an unknown status to eingegangen", () => {
    expect(orderFromSession(session({}, { metadata: { order_no: "EF-7K3QXM" } }))!.status).toBe("eingegangen");
  });
});

describe("listOrders", () => {
  it("returns only paid orders, newest first", async () => {
    const older = session({ id: "cs_old", created: 1792000000 }, { id: "pi_old" });
    const unpaid = session({ id: "cs_unpaid", payment_status: "unpaid" }, { id: "pi_unpaid" });
    const orders = await listOrders(fakeStripe([older, session(), unpaid]));
    expect(orders.map((o) => o.sessionId)).toEqual(["cs_1", "cs_old"]);
  });
});

describe("findOrderByNo", () => {
  it("searches by order number and loads line items", async () => {
    const stripe = fakeStripe([session()]);
    const order = await findOrderByNo(stripe, "EF-7K3QXM");
    expect(order?.items).toHaveLength(1);
    expect(stripe.paymentIntents.search).toHaveBeenCalledWith(
      expect.objectContaining({ query: expect.stringContaining("metadata['order_no']:'EF-7K3QXM'") }),
    );
  });

  it("refuses non-normalized input without querying", async () => {
    const stripe = fakeStripe([session()]);
    expect(await findOrderByNo(stripe, "x' OR status:'succeeded")).toBeNull();
    expect(stripe.paymentIntents.search).not.toHaveBeenCalled();
  });
});

describe("updateOrderMetadata", () => {
  it("writes the patch to the PaymentIntent metadata", async () => {
    const stripe = fakeStripe([]);
    await updateOrderMetadata(stripe, "pi_1", { status: "storniert" });
    expect(stripe.paymentIntents.update).toHaveBeenCalledWith("pi_1", { metadata: { status: "storniert" } });
  });
});
