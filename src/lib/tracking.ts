import { normalizeOrderNo } from "./order-no";
import { STATUS_LABELS, CARRIERS, trackingLink, type OrderStatus } from "./order-status";
import { emailMatches, type Order } from "./orders";

/** What a customer may see about an order. No address, notes or internal ids. */
export type TrackingView = {
  orderNo: string;
  createdAt: string;
  status: OrderStatus;
  statusLabel: string;
  items: { name: string; qty: number; totalCents: number }[];
  shippingCents: number;
  totalCents: number;
  shipment?: { carrier: string; trackingNo: string; url: string | null };
};

export const NOT_FOUND_MESSAGE = "Keine Bestellung zu diesen Angaben gefunden.";

export function toTrackingView(order: Order): TrackingView {
  const shipped = order.status === "versendet" || order.status === "zugestellt";
  return {
    orderNo: order.orderNo,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    statusLabel: STATUS_LABELS[order.status],
    items: (order.items ?? []).map(({ name, qty, totalCents }) => ({ name, qty, totalCents })),
    shippingCents: order.shippingCents,
    totalCents: order.amountTotalCents,
    ...(shipped && order.trackingNo && order.carrier
      ? {
          shipment: {
            carrier: CARRIERS[order.carrier].label,
            trackingNo: order.trackingNo,
            url: trackingLink(order.carrier, order.trackingNo),
          },
        }
      : {}),
  };
}

/**
 * Looks up an order for a customer. Returns null both when the order does not exist
 * and when the e-mail does not match, so callers cannot tell the cases apart.
 */
export async function lookupOrder(
  orderNoInput: string,
  emailInput: string,
  findOrderByNo: (orderNo: string) => Promise<Order | null>,
): Promise<TrackingView | null> {
  const orderNo = normalizeOrderNo(orderNoInput);
  if (!orderNo || !emailInput.trim()) return null;
  const order = await findOrderByNo(orderNo);
  if (!order || !emailMatches(order, emailInput)) return null;
  return toTrackingView(order);
}
