import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_MS, createSessionToken, passwordMatches } from "@/lib/admin-auth";
import { env, siteUrl } from "@/lib/env";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const allow = createRateLimiter(10, 60_000);

export async function POST(request: Request) {
  const base = siteUrl();
  if (!allow(clientIp(request.headers))) {
    return NextResponse.redirect(`${base}/admin/login?fehler=zu-viele`, 303);
  }
  const form = await request.formData().catch(() => null);
  const password = form?.get("password");
  if (typeof password !== "string" || !passwordMatches(password, env("ADMIN_PASSWORD"))) {
    return NextResponse.redirect(`${base}/admin/login?fehler=1`, 303);
  }

  const response = NextResponse.redirect(`${base}/admin`, 303);
  response.cookies.set(ADMIN_COOKIE, createSessionToken(env("ADMIN_SESSION_SECRET")), {
    httpOnly: true,
    secure: base.startsWith("https://"),
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MS / 1000,
  });
  return response;
}
