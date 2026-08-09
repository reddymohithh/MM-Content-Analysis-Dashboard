import { NextResponse, type NextRequest } from "next/server";
import { SITE_AUTH_COOKIE, changeSitePassword, verifySitePassword } from "@/lib/site-auth";

const MIN_LENGTH = 4;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");

  const errorUrl = new URL("/change-password", request.url);

  if (newPassword.length < MIN_LENGTH) {
    errorUrl.searchParams.set("error", "too-short");
    return NextResponse.redirect(errorUrl, { status: 303 });
  }

  const ok = await verifySitePassword(currentPassword);
  if (!ok) {
    errorUrl.searchParams.set("error", "wrong-current");
    return NextResponse.redirect(errorUrl, { status: 303 });
  }

  const newToken = await changeSitePassword(newPassword);
  const response = NextResponse.redirect(new URL("/overview?passwordChanged=1", request.url), {
    status: 303,
  });
  response.cookies.set(SITE_AUTH_COOKIE, newToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
