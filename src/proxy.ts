import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE, getCurrentAuthToken } from "@/lib/site-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/login") || pathname.startsWith("/api/site-auth")) {
    return NextResponse.next();
  }

  // No password configured anywhere (env var or DB) — gate is a no-op
  // rather than locking the developer out.
  const expected = await getCurrentAuthToken();
  if (expected === null) return NextResponse.next();

  const cookie = request.cookies.get(SITE_AUTH_COOKIE)?.value;
  if (cookie === expected) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
