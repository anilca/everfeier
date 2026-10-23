import Link from "next/link";
import { requireAdmin } from "@/lib/admin-session";
import { isOrderStatus, ORDER_STATUSES, STATUS_LABELS } from "@/lib/order-status";
import { listOrders } from "@/lib/orders";
import { formatEUR } from "@/lib/shop";
import { getStripe } from "@/lib/stripe";

type Props = { searchParams: Promise<{ status?: string }> };

const dateFmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Berlin" });

export default async function AdminOrdersPage({ searchParams }: Props) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = isOrderStatus(status) ? status : null;

  const all = await listOrders(getStripe());
  const orders = filter ? all.filter((o) => o.status === filter) : all;

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Bestellungen</h1>
        <form method="post" action="/api/admin/logout">
          <button className="btn secondary" type="submit">
            Abmelden
          </button>
        </form>
      </div>
      <p className="muted small">Zeigt die letzten 100 bezahlten Bestellungen. Neue Bestellungen erscheinen nach dem Bezahlen.</p>

      <nav className="row small" aria-label="Statusfilter" style={{ margin: "12px 0" }}>
        <Link href="/admin" aria-current={filter ? undefined : "page"}>
          Alle ({all.length})
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin?status=${s}`} aria-current={filter === s ? "page" : undefined}>
            {STATUS_LABELS[s]} ({all.filter((o) => o.status === s).length})
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p>Keine Bestellungen.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nr.</th>
                <th>Datum</th>
                <th>Kunde</th>
                <th>Summe</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.paymentIntentId}>
                  <td>
                    <Link href={`/admin/bestellung/${o.paymentIntentId}`}>{o.orderNo}</Link>
                  </td>
                  <td>{dateFmt.format(o.createdAt)}</td>
                  <td>{o.customerName}</td>
                  <td>{formatEUR(o.amountTotalCents)}</td>
                  <td>
                    <span className="badge">{STATUS_LABELS[o.status]}</span>{" "}
                    {o.withdrawalAt && <span className="badge warn">Widerruf</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
