import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE, computeSiteAuthToken } from "@/lib/site-auth";

export async function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;

  // No password configured (e.g. local dev without .env.local set up yet) —
  // gate is a no-op rather than locking the developer out.
  if (!password) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/site-auth")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(SITE_AUTH_COOKIE)?.value;
  const expected = await computeSiteAuthToken(password);

  if (cookie === expected) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
