/**
 * Single shared-password gate for the public Vercel deployment (see
 * BUILD_LOG.md, "access control" decision). Not meant to be a real
 * multi-user auth system — there's one password, shared with portfolio
 * viewers, gating the whole app so it isn't casually indexed or scraped.
 * The login form also asks for a username, but it's cosmetic: any value is
 * accepted and nothing checks or stores it. Deliberately no in-app "change
 * password" — SITE_PASSWORD is a constant only the person with repo/env
 * access can change, not something anyone with the current password could
 * rotate for everyone else.
 *
 * The cookie stores a SHA-256 token derived from the password, not the
 * password itself, computed with the Web Crypto API so this works in both
 * the Edge middleware runtime and normal Node route handlers.
 */

export const SITE_AUTH_COOKIE = "mm_site_auth";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function computeSiteAuthToken(password: string): Promise<string> {
  return sha256Hex(`mm-dashboard-auth-v1:${password}`);
}

export function isSiteAuthConfigured(): boolean {
  return !!process.env.SITE_PASSWORD;
}

export async function verifySitePassword(candidate: string): Promise<boolean> {
  const expected = process.env.SITE_PASSWORD;
  if (!expected) return true; // gate is off if no password is configured
  return candidate === expected;
}

/**
 * Which auth button a navbar should show, shared by every top-level
 * dashboard layout (content, ads, ...). If no SITE_PASSWORD is
 * configured, the gate is off (see proxy.ts) and "logged in/out" isn't a
 * meaningful concept — callers should show neither button.
 */
export async function getAuthButtonState(): Promise<"login" | "logout" | null> {
  const password = process.env.SITE_PASSWORD;
  if (!password) return null;
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SITE_AUTH_COOKIE)?.value;
  const expected = await computeSiteAuthToken(password);
  return cookie === expected ? "logout" : "login";
}
