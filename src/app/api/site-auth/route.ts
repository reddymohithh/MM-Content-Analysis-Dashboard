import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE, computeSiteAuthToken, verifySitePassword } from "@/lib/site-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/overview");

  const ok = await verifySitePassword(password);
  if (!ok) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", next);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const token = await computeSiteAuthToken(password);
  const response = NextResponse.redirect(new URL(next, request.url), { status: 303 });
  response.cookies.set(SITE_AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
