"use client";

import Link from "next/link";
import { useState } from "react";
import { computeTotals } from "@/lib/cart";
import { DELIVERY_TIME, formatEUR, MAX_QTY, MIN_QTY, SHIPPING_LABEL, type PublicProduct } from "@/lib/shop";
import { useCart } from "./cart-context";

export function CartView({ products, open, vatNote }: { products: PublicProduct[]; open: boolean; vatNote: string }) {
  const { lines, loaded, update, remove } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loaded) return <p className="muted">Warenkorb wird geladen …</p>;

  const totals = computeTotals(lines, products);

  if (lines.length === 0) {
    return (
      <div className="stack">
        <p>Dein Warenkorb ist leer.</p>
        <Link href="/" className="btn">
          Zum Sortiment
        </Link>
      </div>
    );
  }

  async function checkout() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: totals.orderable }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Die Kasse ist gerade nicht erreichbar.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
      setPending(false);
    }
  }

  return (
    <div className="cart-layout">
      <div>
        {totals.lines.map((line) => (
          <div key={line.id} className={`cart-line${line.available ? "" : " unavailable"}`}>
            {line.product ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={line.product.image} alt="" width={72} height={72} />
            ) : (
              <div />
            )}
            <div>
              <div>
                <strong>{line.product?.name ?? "Artikel"}</strong>
              </div>
              {line.available ? (
                <div className="qty" aria-label="Menge">
                  <button type="button" aria-label="Weniger" disabled={line.qty <= MIN_QTY} onClick={() => update(line.id, line.qty - 1)}>
                    −
                  </button>
                  <span aria-live="polite">{line.qty}</span>
                  <button type="button" aria-label="Mehr" disabled={line.qty >= MAX_QTY} onClick={() => update(line.id, line.qty + 1)}>
                    +
                  </button>
                </div>
              ) : (
                <div className="field-error">nicht mehr verfügbar</div>
              )}
              <button type="button" className="link-button" onClick={() => remove(line.id)}>
                Entfernen
              </button>
            </div>
            <div className="price">{line.available ? formatEUR(line.lineTotalCents) : "–"}</div>
          </div>
        ))}
      </div>

      <aside className="panel">
        <div className="summary-row">
          <span>Zwischensumme</span>
          <span>{formatEUR(totals.subtotalCents)}</span>
        </div>
        <div className="summary-row">
          <span>{SHIPPING_LABEL}</span>
          <span>{formatEUR(totals.shippingCents)}</span>
        </div>
        <div className="summary-row total">
          <span>Gesamt</span>
          <span>{formatEUR(totals.totalCents)}</span>
        </div>
        <p className="price-note">
          {vatNote} Lieferung nur innerhalb Deutschlands, {DELIVERY_TIME}.
        </p>
        {error && <div className="notice error">{error}</div>}
        {open ? (
          <button type="button" className="btn block" disabled={pending || totals.orderable.length === 0} onClick={checkout}>
            {pending ? "Weiterleitung …" : "Weiter zur Kasse"}
          </button>
        ) : (
          <div className="notice">Die Saison ist beendet – Bestellungen sind nicht mehr möglich.</div>
        )}
        <p className="muted small">
          Die Bezahlung erfolgt sicher über Stripe. Auf der nächsten Seite prüfst du deine Bestellung und schließt sie mit
          „Zahlen“ zahlungspflichtig ab.
        </p>
      </aside>
    </div>
  );
}
