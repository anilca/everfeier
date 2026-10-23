import type { Metadata } from "next";
import { seasonFromEnv } from "@/lib/season";
import { DELIVERY_TIME, formatEUR, SHIPPING_CENTS, SHIPPING_LABEL } from "@/lib/shop";

export const metadata: Metadata = { title: "Versand & Zahlung" };

export default function VersandZahlungPage() {
  const season = seasonFromEnv();
  return (
    <article className="legal">
      <h1>Versand &amp; Zahlung</h1>
      <h2>Versand</h2>
      <ul>
        <li>Lieferung nur innerhalb Deutschlands.</li>
        <li>
          {SHIPPING_LABEL}: {formatEUR(SHIPPING_CENTS)} pro Bestellung.
        </li>
        <li>Lieferzeit: {DELIVERY_TIME} nach Zahlungseingang.</li>
        {season.cutoffDay && <li>Für Lieferung bis Halloween bitte bis zum {season.cutoffDay} bestellen.</li>}
        <li>Der Versand erfolgt direkt aus dem Lager unseres Lieferpartners in Deutschland.</li>
      </ul>
      <h2>Preise</h2>
      <p>Alle Preise sind Endpreise. {season.vatNote}</p>
      <h2>Zahlung</h2>
      <p>
        Die Zahlung erfolgt sicher über Stripe. Verfügbar sind je nach Gerät Kreditkarte, Apple Pay, Google Pay, PayPal und
        Klarna. Die Zahlung wird sofort bei der Bestellung bestätigt.
      </p>
    </article>
  );
}
