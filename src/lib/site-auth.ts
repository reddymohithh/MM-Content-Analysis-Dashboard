/**
 * Single shared-password gate for the public Vercel deployment (see
 * BUILD_LOG.md, "access control" decision). Not meant to be a real
 * multi-user auth system — there's one password, shared with portfolio
 * viewers, gating the whole app so it isn't casually indexed or scraped.
 *
 * The password lives in Neon (`site_auth_settings`, a singleton row), not
 * just in SITE_PASSWORD, because a running Vercel deployment can't rewrite
 * its own env vars at runtime — "change password" needs somewhere mutable
 * to write to. SITE_PASSWORD is only the *initial* password: authoritative
 * until the first password change ever creates the DB row, after which the
 * DB row wins.
 *
 * proxy.ts runs this check on every request, so the current token is
 * cached in memory for CACHE_TTL_MS rather than hitting Neon on every page
 * load — a password change takes up to that long to apply to requests
 * already past login.
 *
 * The cookie stores a SHA-256 token derived from the password, not the
 * password itself, computed with the Web Crypto API so this works in both
 * the Edge middleware runtime and normal Node route handlers.
 */

export const SITE_AUTH_COOKIE = "mm_site_auth";
export const SITE_AUTH_SETTINGS_ID = "default";

const CACHE_TTL_MS = 60_000;

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deterministic and one-way: this same value is both the valid
 * session-cookie value and what a login/change-password attempt's
 * candidate password is compared against, so the password itself is never
 * stored anywhere.
 */
export async function computeAuthToken(password: string): Promise<string> {
  return sha256Hex(`mm-dashboard-auth-v1:${password}`);
}

let cache: { token: string | null; expiresAt: number } | null = null;

/**
 * The current valid session-cookie value, or null if the gate is fully
 * off (no password has ever been set via change-password, and
 * SITE_PASSWORD isn't configured either).
 */
export async function getCurrentAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.token;

  let token: string | null = null;
  if (process.env.DATABASE_URL) {
    try {
      const { db } = await import("@/lib/db");
      const { siteAuthSettings } = await import("@/lib/db/schema");
      const { eq } = await import("drizzle-orm");
      const row = await db.query.siteAuthSettings.findFirst({
        where: eq(siteAuthSettings.id, SITE_AUTH_SETTINGS_ID),
      });
      if (row) token = row.authToken;
    } catch {
      // DB unreachable — fall through to the env var rather than locking
      // everyone out (or crashing every page) over a transient blip.
    }
  }
  if (token === null && process.env.SITE_PASSWORD) {
    token = await computeAuthToken(process.env.SITE_PASSWORD);
  }

  cache = { token, expiresAt: now + CACHE_TTL_MS };
  return token;
}

export function isSiteAuthConfigured(): boolean {
  return !!process.env.SITE_PASSWORD || !!process.env.DATABASE_URL;
}

export async function verifySitePassword(candidate: string): Promise<boolean> {
  const expected = await getCurrentAuthToken();
  if (expected === null) return true; // gate is off
  return (await computeAuthToken(candidate)) === expected;
}

/**
 * Persists a new password to Neon (creating the settings row on first
 * use) and returns the new session-cookie value, so the caller can
 * reissue the current session's cookie in the same response — otherwise
 * changing your own password would immediately log you out.
 */
export async function changeSitePassword(newPassword: string): Promise<string> {
  const { db } = await import("@/lib/db");
  const { siteAuthSettings } = await import("@/lib/db/schema");
  const newToken = await computeAuthToken(newPassword);

  await db
    .insert(siteAuthSettings)
    .values({ id: SITE_AUTH_SETTINGS_ID, authToken: newToken })
    .onConflictDoUpdate({
      target: siteAuthSettings.id,
      set: { authToken: newToken, updatedAt: new Date() },
    });

  cache = { token: newToken, expiresAt: Date.now() + CACHE_TTL_MS };
  return newToken;
}
