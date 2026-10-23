import { NextResponse } from "next/server";
import { getActiveProduct } from "@/lib/catalog";
import { validateCheckoutRequest } from "@/lib/checkout-validation";
import { siteUrl } from "@/lib/env";
import { generateOrderNo } from "@/lib/order-no";
import { SHOP_TAG } from "@/lib/orders";
import { seasonFromEnv } from "@/lib/season";
import { SHIPPING_CENTS, SHIPPING_LABEL } from "@/lib/shop";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!seasonFromEnv().open) {
    return NextResponse.json({ error: "Saison beendet – Bestellungen sind nicht mehr möglich." }, { status: 409 });
  }

  const body: unknown = await request.json().catch(() => null);
  const result = validateCheckoutRequest(body, getActiveProduct);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.error === "unavailable" ? 409 : 400 });
  }

  const base = siteUrl();
  const orderNo = generateOrderNo();

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      locale: "de",
      submit_type: "pay",
      line_items: result.lines.map((l) => ({
        quantity: l.qty,
        price_data: {
          currency: "eur",
          unit_amount: l.priceCents,
          product_data: { name: l.name, metadata: { product_id: l.id } },
        },
      })),
      shipping_address_collection: { allowed_countries: ["DE"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: SHIPPING_LABEL,
            fixed_amount: { amount: SHIPPING_CENTS, currency: "eur" },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 1 },
              maximum: { unit: "business_day", value: 5 },
            },
          },
        },
      ],
      consent_collection: { terms_of_service: "required" },
      custom_text: {
        terms_of_service_acceptance: {
          message: `Ich akzeptiere die [AGB](${base}/agb) und habe die [Widerrufsbelehrung](${base}/widerrufsbelehrung) zur Kenntnis genommen.`,
        },
        submit: { message: `Bestellnummer ${orderNo}. Mit Klick auf „Zahlen“ bestellst du zahlungspflichtig.` },
      },
      metadata: { shop: SHOP_TAG, order_no: orderNo },
      payment_intent_data: {
        description: `Bestellung ${orderNo}`,
        metadata: { shop: SHOP_TAG, order_no: orderNo, status: "eingegangen" },
      },
      success_url: `${base}/bestellung/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/warenkorb`,
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("checkout failed", error);
    return NextResponse.json({ error: "Die Kasse ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal." }, { status: 502 });
  }
}
