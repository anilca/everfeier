import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import { getProduct } from "@/lib/catalog";
import { CARRIERS, ORDER_STATUSES, STATUS_LABELS } from "@/lib/order-status";
import { getOrderByPaymentIntent } from "@/lib/orders";
import { formatEUR } from "@/lib/shop";
import { getStripe } from "@/lib/stripe";
import { formatBerlin } from "@/lib/withdrawal";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gespeichert?: string; fehler?: string }>;
};

export default async function AdminOrderPage({ params, searchParams }: Props) {
  await requireAdmin();
  const { id } = await params;
  const { gespeichert, fehler } = await searchParams;
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) notFound();
  const order = await getOrderByPaymentIntent(getStripe(), id);
  if (!order) notFound();

  const a = order.shippingAddress;
  const addressText = a ? [a.name, a.line1, a.line2, `${a.postalCode} ${a.city}`, a.country].filter(Boolean).join("\n") : "";
  const final = order.status === "storniert";

  return (
    <div className="stack">
      <p className="small">
        <Link href="/admin">← Alle Bestellungen</Link>
      </p>
      <div className="row">
        <h1 style={{ margin: 0 }}>{order.orderNo}</h1>
        <span className="badge">{STATUS_LABELS[order.status]}</span>
      </div>
      <p className="muted small">
        Bestellt am {formatBerlin(order.createdAt)} · Stripe: {order.paymentIntentId}
      </p>

      {gespeichert && <div className="notice ok">Gespeichert.</div>}
      {fehler && <div className="notice error">{fehler}</div>}
      {order.withdrawalAt && (
        <div className="notice error">
          Widerruf erklärt am {formatBerlin(new Date(order.withdrawalAt))}. Rücksendung klären und Erstattung im
          Stripe-Dashboard auslösen.
        </div>
      )}

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Artikel</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Menge</th>
                <th>Artikel</th>
                <th>Summe</th>
                <th>Lieferant</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, i) => {
                const product = item.productId ? getProduct(item.productId) : undefined;
                return (
                  <tr key={i}>
                    <td>{item.qty}×</td>
                    <td>{item.name}</td>
                    <td>{formatEUR(item.totalCents)}</td>
                    <td>
                      {product?.supplier.links.map((link) => (
                        <div key={link.url}>
                          <a href={link.url} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        </div>
                      )) ?? <span className="muted">unbekannt</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="summary-row">
          <span>Versand</span>
          <span>{formatEUR(order.shippingCents)}</span>
        </div>
        <div className="summary-row total">
          <span>Gesamt</span>
          <span>{formatEUR(order.amountTotalCents)}</span>
        </div>
      </div>

      <div className="panel">
        <h2 style={{ marginTop: 0 }}>Kunde &amp; Lieferadresse</h2>
        <p>
          <a href={`mailto:${order.email}`}>{order.email}</a>
        </p>
        <label htmlFor="address">Adresse (zum Kopieren)</label>
        <textarea id="address" readOnly value={addressText} rows={5} />
      </div>

      <form className="panel form" method="post" action={`/api/admin/orders/${order.paymentIntentId}`}>
        <h2 style={{ marginTop: 0 }}>Status &amp; Versand</h2>
        {final && <div className="notice">Stornierte Bestellungen können nicht mehr geändert werden (nur die Notiz).</div>}
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={order.status}>
            {ORDER_STATUSES.filter((s) => !final || s === "storniert").map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="carrier">Versanddienstleister (für „Versendet“)</label>
          <select id="carrier" name="carrier" defaultValue={order.carrier ?? ""}>
            <option value="">– bitte wählen –</option>
            {Object.entries(CARRIERS).map(([key, c]) => (
              <option key={key} value={key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="trackingNo">Sendungsnummer (für „Versendet“)</label>
          <input id="trackingNo" name="trackingNo" defaultValue={order.trackingNo ?? ""} maxLength={100} />
        </div>
        <div className="field">
          <label htmlFor="internalNote">Interne Notiz (z. B. Temu-Bestellnummer, nur für dich sichtbar)</label>
          <textarea id="internalNote" name="internalNote" defaultValue={order.internalNote ?? ""} maxLength={500} />
        </div>
        <button className="btn" type="submit">
          Speichern
        </button>
      </form>
    </div>
  );
}
