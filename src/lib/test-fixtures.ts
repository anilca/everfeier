import type { Order } from "./orders";

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    paymentIntentId: "pi_123",
    sessionId: "cs_test_123",
    orderNo: "EF-7K3QXM",
    createdAt: new Date("2026-10-26T10:00:00Z"),
    status: "eingegangen",
    email: "kunde@example.de",
    customerName: "Erika Musterfrau",
    shippingAddress: { name: "Erika Musterfrau", line1: "Musterstr. 1", postalCode: "10115", city: "Berlin", country: "DE" },
    amountTotalCents: 1980,
    shippingCents: 490,
    items: [{ productId: "hexenhut", name: "Hexenhut", qty: 1, totalCents: 1490 }],
    ...overrides,
  };
}
