"use client";

import { useState, type FormEvent } from "react";
import { formatEUR } from "@/lib/shop";
import type { TrackingView } from "@/lib/tracking";

const dateFmt = new Intl.DateTimeFormat("de-DE", { dateStyle: "long", timeZone: "Europe/Berlin" });

export function TrackingForm({ initialOrderNo }: { initialOrderNo: string }) {
  const [order, setOrder] = useState<TrackingView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNo: form.get("orderNo"), email: form.get("email") }),
      });
      const data = (await res.json().catch(() => ({}))) as { order?: TrackingView; error?: string };
      if (!res.ok || !data.order) setError(data.error ?? "Die Abfrage ist gerade nicht möglich.");
      else setOrder(data.order);
    } catch {
      setError("Die Abfrage ist gerade nicht möglich.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="stack">
      <form className="form panel" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="orderNo">Bestellnummer</label>
          <input id="orderNo" name="orderNo" required defaultValue={initialOrderNo} autoComplete="off" placeholder="EF-XXXXXX" />
        </div>
        <div className="field">
          <label htmlFor="email">E-Mail-Adresse</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Suche …" : "Status anzeigen"}
        </button>
      </form>

      {error && <div className="notice error">{error}</div>}

      {order && (
        <div className="panel">
          <div className="row">
            <h2 style={{ margin: 0 }}>{order.orderNo}</h2>
            <span className="badge">{order.statusLabel}</span>
          </div>
          <p className="muted small">Bestellt am {dateFmt.format(new Date(order.createdAt))}</p>
          {order.shipment && (
            <div className="notice ok">
              Versendet mit {order.shipment.carrier}, Sendungsnummer{" "}
              {order.shipment.url ? (
                <a href={order.shipment.url} target="_blank" rel="noopener noreferrer">
                  {order.shipment.trackingNo}
                </a>
              ) : (
                <strong>{order.shipment.trackingNo}</strong>
              )}
            </div>
          )}
          {order.items.map((item, i) => (
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
            <span>{formatEUR(order.totalCents)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
