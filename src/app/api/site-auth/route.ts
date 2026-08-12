import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE, computeSiteAuthToken, verifySitePassword } from "@/lib/site-auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/overview");

  const url = new URL("/login", request.url);
  url.searchParams.set("next", next);

  // Username isn't checked against anything — any value is accepted — but
  // the login screen asks for one, so require it not be left blank.
  if (!username) {
    url.searchParams.set("error", "username");
    return NextResponse.redirect(url, { status: 303 });
  }

  const ok = await verifySitePassword(password);
  if (!ok) {
    url.searchParams.set("error", "password");
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
