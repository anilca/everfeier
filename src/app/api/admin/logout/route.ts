import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { siteUrl } from "@/lib/env";

export async function POST() {
  const response = NextResponse.redirect(`${siteUrl()}/admin/login`, 303);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
