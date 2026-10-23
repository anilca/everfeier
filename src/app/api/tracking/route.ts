import { NextResponse } from "next/server";
import { findOrderByNo } from "@/lib/orders";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { lookupOrder, NOT_FOUND_MESSAGE } from "@/lib/tracking";

const allow = createRateLimiter(20, 60_000);

export async function POST(request: Request) {
  if (!allow(clientIp(request.headers))) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte später erneut versuchen." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { orderNo?: unknown; email?: unknown } | null;
  const orderNo = typeof body?.orderNo === "string" ? body.orderNo : "";
  const email = typeof body?.email === "string" ? body.email : "";

  try {
    const view = await lookupOrder(orderNo, email, (no) => findOrderByNo(getStripe(), no));
    if (!view) return NextResponse.json({ error: NOT_FOUND_MESSAGE }, { status: 404 });
    return NextResponse.json({ order: view });
  } catch (error) {
    console.error("tracking lookup failed", error);
    return NextResponse.json({ error: "Die Abfrage ist gerade nicht möglich. Bitte später erneut versuchen." }, { status: 502 });
  }
}
