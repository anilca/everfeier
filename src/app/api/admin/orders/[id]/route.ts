import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { siteUrl } from "@/lib/env";
import { validateTransition } from "@/lib/order-status";
import { getOrderByPaymentIntent, updateOrderMetadata, type OrderMetadataPatch } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";

const MAX_NOTE = 500;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }
  const { id } = await params;
  if (!/^pi_[A-Za-z0-9]+$/.test(id)) return NextResponse.json({ error: "Unbekannte Bestellung." }, { status: 404 });

  const back = (query: string) => NextResponse.redirect(`${siteUrl()}/admin/bestellung/${id}?${query}`, 303);
  const stripe = getStripe();
  const order = await getOrderByPaymentIntent(stripe, id);
  if (!order) return NextResponse.json({ error: "Unbekannte Bestellung." }, { status: 404 });

  const form = await request.formData();
  const field = (name: string) => {
    const v = form.get(name);
    return typeof v === "string" ? v : undefined;
  };

  const transition = validateTransition(order.status, {
    status: field("status") ?? "",
    carrier: field("carrier"),
    trackingNo: field("trackingNo"),
  });
  if (!transition.ok) return back(`fehler=${encodeURIComponent(transition.message)}`);

  const note = (field("internalNote") ?? "").trim();
  if (note.length > MAX_NOTE) return back(`fehler=${encodeURIComponent(`Notiz ist zu lang (max. ${MAX_NOTE} Zeichen).`)}`);

  const patch: OrderMetadataPatch = { status: transition.status, internal_note: note };
  if (transition.carrier && transition.trackingNo) {
    patch.carrier = transition.carrier;
    patch.tracking_no = transition.trackingNo;
  }
  await updateOrderMetadata(stripe, id, patch);
  return back("gespeichert=1");
}
