// Client-safe shop types and constants. Never import supplier data here.

export const SHIPPING_CENTS = 490;
export const SHIPPING_LABEL = "Standardversand (DHL/Hermes)";
export const DELIVERY_TIME = "1–5 Werktage";
export const MIN_QTY = 1;
export const MAX_QTY = 10;

export type PublicProduct = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  image: string;
  /** Names of the products contained in a bundle. */
  contents?: string[];
};

const eur = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

/** Formats cents as a German price, e.g. 2990 -> "29,90 €" (with a regular space). */
export function formatEUR(cents: number): string {
  return eur.format(cents / 100).replace(/ /g, " ");
}
