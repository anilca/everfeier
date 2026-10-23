// Pure cart logic shared by the client cart and its tests.
import { MAX_QTY, MIN_QTY, SHIPPING_CENTS, type PublicProduct } from "./shop";

export type CartLine = { id: string; qty: number };

export function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return MIN_QTY;
  return Math.min(MAX_QTY, Math.max(MIN_QTY, Math.trunc(qty)));
}

export function addItem(lines: CartLine[], id: string, qty = 1): CartLine[] {
  const existing = lines.find((l) => l.id === id);
  if (existing) return setQty(lines, id, existing.qty + qty);
  return [...lines, { id, qty: clampQty(qty) }];
}

export function setQty(lines: CartLine[], id: string, qty: number): CartLine[] {
  return lines.map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l));
}

export function removeItem(lines: CartLine[], id: string): CartLine[] {
  return lines.filter((l) => l.id !== id);
}

export type PricedLine = CartLine & {
  product?: PublicProduct;
  available: boolean;
  lineTotalCents: number;
};

export type CartTotals = {
  lines: PricedLine[];
  /** Lines that can be checked out. */
  orderable: CartLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
};

/** Prices the cart against the currently active products; unknown ids count as unavailable. */
export function computeTotals(lines: CartLine[], activeProducts: PublicProduct[]): CartTotals {
  const byId = new Map(activeProducts.map((p) => [p.id, p]));
  const priced = lines.map((l): PricedLine => {
    const product = byId.get(l.id);
    return {
      ...l,
      product,
      available: Boolean(product),
      lineTotalCents: product ? product.priceCents * l.qty : 0,
    };
  });
  const orderable = priced.filter((l) => l.available).map(({ id, qty }) => ({ id, qty }));
  const subtotalCents = priced.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const shippingCents = orderable.length > 0 ? SHIPPING_CENTS : 0;
  return { lines: priced, orderable, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

/** Parses untrusted stored data into cart lines, dropping anything malformed. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((l): l is CartLine => typeof l?.id === "string" && typeof l?.qty === "number")
      .map((l) => ({ id: l.id, qty: clampQty(l.qty) }));
  } catch {
    return [];
  }
}
