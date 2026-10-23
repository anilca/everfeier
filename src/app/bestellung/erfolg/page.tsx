import type { Metadata } from "next";
import Link from "next/link";
import { ClearCart } from "@/components/clear-cart";
import { getOrderBySession } from "@/lib/orders";
import { formatEUR } from "@/lib/shop";
import { getStripe } from "@/lib/stripe";

export const metadata: Metadata = { title: "Bestellung erhalten", robots: { index: false } };

type Props = { searchParams: Promise<{ session_id?: string | string[] }> };

async function loadOrder(sessionId: unknown) {
  if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  try {
    return await getOrderBySession(getStripe(), sessionId);
  } catch {
    return null;
  }
}

export default async function SuccessPage({ searchParams }: Props) {
  const order = await loadOrder((await searchParams).session_id);

  if (!order) {
    return (
      <>
        <h1>Bestellung nicht gefunden</h1>
        <p>
          Zu diesem Link liegt keine abgeschlossene Bestellung vor. Falls du bezahlt hast, findest du deine Bestellnummer
          in der Zahlungsbestätigung per E-Mail.
        </p>
        <Link href="/bestellung/verfolgen" className="btn">
          Bestellung verfolgen
        </Link>
      </>
    );
  }

  const a = order.shippingAddress;
  return (
    <div className="stack">
      <ClearCart />
      <h1>Danke für deine Bestellung!</h1>
      <div className="notice ok">
        Deine Bestellnummer: <strong>{order.orderNo}</strong>
      </div>
      <p>
        Eine Zahlungsbestätigung wurde an <strong>{order.email}</strong> gesendet. Mit Bestellnummer und E-Mail-Adresse
        kannst du den Status jederzeit verfolgen.
      </p>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Bestellübersicht</h2>
        {order.items?.map((item, i) => (
          <div key={i} className="summary-row">
            <span>
              {item.qty} × {item.name}
            </span>
            <span>{formatEUR(item.totalCents)}</span>
          </div>
        ))}
        <div className="summary-row">
          <span>Versand</span>
          <span>{formatEUR(order.shippingCents)}</span>
        </div>
        <div className="summary-row total">
          <span>Gesamt</span>
          <span>{formatEUR(order.amountTotalCents)}</span>
        </div>
        {a && (
          <>
            <h2>Lieferadresse</h2>
            <address style={{ fontStyle: "normal" }}>
              {a.name}
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.postalCode} {a.city}
            </address>
          </>
        )}
      </div>
      <Link href={`/bestellung/verfolgen?bestellung=${encodeURIComponent(order.orderNo)}`} className="btn">
        Bestellung verfolgen
      </Link>
    </div>
  );
}
