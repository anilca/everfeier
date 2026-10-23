import type Stripe from "stripe";
import { isCarrier, isOrderStatus, type Carrier, type OrderStatus } from "./order-status";

/** Marks our sessions/payments in a Stripe account that may be shared with other uses. */
export const SHOP_TAG = "everfeier";

export type OrderItem = { productId?: string; name: string; qty: number; totalCents: number };

export type Address = {
  name: string;
  line1: string;
  line2?: string;
  postalCode: string;
  city: string;
  country: string;
};

export type Order = {
  paymentIntentId: string;
  sessionId: string;
  orderNo: string;
  createdAt: Date;
  status: OrderStatus;
  carrier?: Carrier;
  trackingNo?: string;
  internalNote?: string;
  withdrawalAt?: string;
  email: string;
  customerName: string;
  shippingAddress?: Address;
  amountTotalCents: number;
  shippingCents: number;
  /** Only present when line items were loaded. */
  items?: OrderItem[];
};

/** Metadata keys stored on the PaymentIntent. An empty string deletes a key in Stripe. */
export type OrderMetadataPatch = Partial<{
  status: OrderStatus;
  carrier: Carrier | "";
  tracking_no: string;
  internal_note: string;
  withdrawal_at: string;
}>;

type StripeLike = Pick<Stripe, "checkout" | "paymentIntents">;

/** Builds an order from a completed, paid session whose payment_intent is expanded. */
export function orderFromSession(session: Stripe.Checkout.Session, lineItems?: Stripe.LineItem[]): Order | null {
  const pi = session.payment_intent;
  if (session.metadata?.shop !== SHOP_TAG || session.payment_status !== "paid") return null;
  if (!pi || typeof pi === "string" || pi.status !== "succeeded") return null;

  const md = pi.metadata ?? {};
  const shipping = session.collected_information?.shipping_details;
  const addr = shipping?.address;

  return {
    paymentIntentId: pi.id,
    sessionId: session.id,
    orderNo: md.order_no ?? session.metadata?.order_no ?? "?",
    createdAt: new Date(session.created * 1000),
    status: isOrderStatus(md.status) ? md.status : "eingegangen",
    carrier: isCarrier(md.carrier) ? md.carrier : undefined,
    trackingNo: md.tracking_no || undefined,
    internalNote: md.internal_note || undefined,
    withdrawalAt: md.withdrawal_at || undefined,
    email: session.customer_details?.email ?? "",
    customerName: shipping?.name ?? session.customer_details?.name ?? "",
    shippingAddress: addr
      ? {
          name: shipping?.name ?? "",
          line1: addr.line1 ?? "",
          line2: addr.line2 || undefined,
          postalCode: addr.postal_code ?? "",
          city: addr.city ?? "",
          country: addr.country ?? "",
        }
      : undefined,
    amountTotalCents: session.amount_total ?? pi.amount,
    shippingCents: session.shipping_cost?.amount_total ?? 0,
    items: lineItems?.map(toOrderItem),
  };
}

function toOrderItem(li: Stripe.LineItem): OrderItem {
  const product = li.price?.product;
  const productId = product && typeof product !== "string" && !("deleted" in product && product.deleted)
    ? (product as Stripe.Product).metadata?.product_id
    : undefined;
  return { productId, name: li.description ?? "", qty: li.quantity ?? 0, totalCents: li.amount_total };
}

async function loadLineItems(stripe: StripeLike, sessionId: string): Promise<Stripe.LineItem[]> {
  const res = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100, expand: ["data.price.product"] });
  return res.data;
}

/** The latest 100 completed sessions, newest first (no line items). */
export async function listOrders(stripe: StripeLike): Promise<Order[]> {
  const res = await stripe.checkout.sessions.list({ status: "complete", limit: 100, expand: ["data.payment_intent"] });
  return res.data
    .map((s) => orderFromSession(s))
    .filter((o): o is Order => o !== null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getOrderByPaymentIntent(stripe: StripeLike, paymentIntentId: string): Promise<Order | null> {
  const res = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1, expand: ["data.payment_intent"] });
  const session = res.data[0];
  if (!session) return null;
  return orderFromSession(session, await loadLineItems(stripe, session.id));
}

export async function getOrderBySession(stripe: StripeLike, sessionId: string): Promise<Order | null> {
  const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["payment_intent"] });
  if (!orderFromSession(session)) return null;
  return orderFromSession(session, await loadLineItems(stripe, session.id));
}

/**
 * Finds a paid order by its number via the Search API (eventually consistent, ~1 min).
 * `orderNo` must already be normalized, which also makes it safe to embed in the query.
 */
export async function findOrderByNo(stripe: StripeLike, orderNo: string): Promise<Order | null> {
  if (!/^EF-[2-9A-HJ-NP-Z]{6}$/.test(orderNo)) return null;
  const res = await stripe.paymentIntents.search({
    query: `metadata['order_no']:'${orderNo}' AND metadata['shop']:'${SHOP_TAG}' AND status:'succeeded'`,
    limit: 5,
  });
  for (const pi of res.data) {
    const order = await getOrderByPaymentIntent(stripe, pi.id);
    if (order) return order;
  }
  return null;
}

export async function updateOrderMetadata(stripe: StripeLike, paymentIntentId: string, patch: OrderMetadataPatch) {
  await stripe.paymentIntents.update(paymentIntentId, { metadata: patch });
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailMatches(order: Order, email: string): boolean {
  return order.email !== "" && normalizeEmail(order.email) === normalizeEmail(email);
}
