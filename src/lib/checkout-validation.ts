import { MAX_QTY, MIN_QTY } from "./shop";

export type ValidLine = { id: string; qty: number; name: string; priceCents: number };

export type ValidationResult =
  | { ok: true; lines: ValidLine[] }
  | { ok: false; error: "empty" | "invalid" | "unavailable"; message: string };

type CatalogLookup = (id: string) => { id: string; name: string; priceCents: number } | undefined;

/**
 * Validates an untrusted checkout request body. Only ids and quantities are taken
 * from the client; names and prices always come from the catalog.
 */
export function validateCheckoutRequest(body: unknown, getActive: CatalogLookup): ValidationResult {
  const items = (body as { items?: unknown } | null)?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, error: "empty", message: "Der Warenkorb ist leer." };
  }
  if (items.length > 50) {
    return { ok: false, error: "invalid", message: "Ungültiger Warenkorb." };
  }

  const merged = new Map<string, number>();
  for (const item of items) {
    const id = (item as { id?: unknown })?.id;
    const qty = (item as { qty?: unknown })?.qty;
    if (typeof id !== "string" || typeof qty !== "number" || !Number.isInteger(qty)) {
      return { ok: false, error: "invalid", message: "Ungültiger Warenkorb." };
    }
    merged.set(id, (merged.get(id) ?? 0) + qty);
  }

  const lines: ValidLine[] = [];
  for (const [id, qty] of merged) {
    if (qty < MIN_QTY || qty > MAX_QTY) {
      return { ok: false, error: "invalid", message: `Menge muss zwischen ${MIN_QTY} und ${MAX_QTY} liegen.` };
    }
    const product = getActive(id);
    if (!product) {
      return { ok: false, error: "unavailable", message: "Ein Artikel ist nicht mehr verfügbar." };
    }
    lines.push({ id: product.id, qty, name: product.name, priceCents: product.priceCents });
  }
  return { ok: true, lines };
}
