import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE } from "@/lib/site-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  response.cookies.delete(SITE_AUTH_COOKIE);
  return response;
}
