export const ORDER_STATUSES = ["eingegangen", "in_bearbeitung", "versendet", "zugestellt", "storniert"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  eingegangen: "Eingegangen",
  in_bearbeitung: "In Bearbeitung",
  versendet: "Versendet",
  zugestellt: "Zugestellt",
  storniert: "Storniert",
};

export const CARRIERS = {
  dhl: { label: "DHL", trackingUrl: (no: string) => `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${encodeURIComponent(no)}` },
  hermes: { label: "Hermes", trackingUrl: (no: string) => `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#${encodeURIComponent(no)}` },
  dpd: { label: "DPD", trackingUrl: (no: string) => `https://tracking.dpd.de/status/de_DE/parcel/${encodeURIComponent(no)}` },
  gls: { label: "GLS", trackingUrl: (no: string) => `https://gls-group.com/DE/de/paketverfolgung?match=${encodeURIComponent(no)}` },
  other: { label: "Sonstige", trackingUrl: null },
} as const;
export type Carrier = keyof typeof CARRIERS;

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && (ORDER_STATUSES as readonly string[]).includes(value);
}

export function isCarrier(value: unknown): value is Carrier {
  return typeof value === "string" && Object.hasOwn(CARRIERS, value);
}

export function trackingLink(carrier: string | undefined, trackingNo: string | undefined): string | null {
  if (!trackingNo || !isCarrier(carrier)) return null;
  const build = CARRIERS[carrier].trackingUrl;
  return build ? build(trackingNo) : null;
}

export type StatusUpdate = { status: string; carrier?: string; trackingNo?: string };

export type TransitionResult =
  | { ok: true; status: OrderStatus; carrier?: Carrier; trackingNo?: string }
  | { ok: false; message: string };

/**
 * Validates a status change. Corrections in any direction are allowed (misclicks happen),
 * except that a cancelled order is final and shipping requires carrier + tracking number.
 */
export function validateTransition(current: OrderStatus, update: StatusUpdate): TransitionResult {
  if (!isOrderStatus(update.status)) return { ok: false, message: "Unbekannter Status." };
  const next = update.status;
  if (current === "storniert" && next !== "storniert") {
    return { ok: false, message: "Stornierte Bestellungen können nicht mehr geändert werden." };
  }
  const trackingNo = update.trackingNo?.trim() || undefined;
  const carrier = update.carrier?.trim() || undefined;
  if (next === "versendet" || next === "zugestellt") {
    if (!carrier || !isCarrier(carrier)) return { ok: false, message: "Versanddienstleister fehlt." };
    if (!trackingNo) return { ok: false, message: "Sendungsnummer fehlt." };
    if (trackingNo.length > 100) return { ok: false, message: "Sendungsnummer ist zu lang." };
    return { ok: true, status: next, carrier, trackingNo };
  }
  return { ok: true, status: next };
}
