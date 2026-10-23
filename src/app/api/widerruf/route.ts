import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail";
import { findOrderByNo, updateOrderMetadata } from "@/lib/orders";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { declarationText, parseWithdrawalInput, processWithdrawal } from "@/lib/withdrawal";

const allow = createRateLimiter(10, 60_000);

export async function POST(request: Request) {
  if (!allow(clientIp(request.headers))) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte später erneut versuchen." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const parsed = parseWithdrawalInput(body ?? {});
  if (!parsed.ok) return NextResponse.json({ errors: parsed.errors }, { status: 400 });

  const stripe = getStripe();
  const result = await processWithdrawal(parsed.input, {
    findOrderByNo: async (no) => {
      try {
        return await findOrderByNo(stripe, no);
      } catch (error) {
        console.error("withdrawal order lookup failed", error);
        return null;
      }
    },
    markWithdrawal: async (order, receivedAt) => {
      try {
        await updateOrderMetadata(stripe, order.paymentIntentId, { withdrawal_at: receivedAt.toISOString() });
      } catch (error) {
        console.error("marking withdrawal failed", error);
      }
    },
    sendMail,
    operatorEmail: env("OPERATOR_EMAIL"),
  });
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

  return NextResponse.json({
    declaration: declarationText(result.input, result.receivedAt),
    receivedAt: result.receivedAt.toISOString(),
    customerMailSent: result.customerMailSent,
  });
}
