export type ShopMode = "open" | "closed";
export type VatMode = "kleinunternehmer" | "regular";

export function isShopOpen(now: Date, mode: string | undefined, cutoffIso: string | undefined): boolean {
  if (mode !== "open") return false;
  const cutoff = cutoffIso ? Date.parse(cutoffIso) : NaN;
  if (Number.isNaN(cutoff)) return false;
  return now.getTime() <= cutoff;
}

/** "28.10." in Berlin time. */
export function formatCutoffDay(cutoffIso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Berlin",
  }).format(new Date(cutoffIso));
}

export function vatNote(mode: string | undefined): string {
  return mode === "regular"
    ? "inkl. 19 % MwSt."
    : "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.";
}

/** Reads season settings from the environment (server side). */
export function seasonFromEnv(now = new Date()) {
  const cutoff = process.env.ORDER_CUTOFF;
  return {
    open: isShopOpen(now, process.env.SHOP_MODE, cutoff),
    cutoffDay: cutoff && !Number.isNaN(Date.parse(cutoff)) ? formatCutoffDay(cutoff) : null,
    vatNote: vatNote(process.env.VAT_MODE),
  };
}
