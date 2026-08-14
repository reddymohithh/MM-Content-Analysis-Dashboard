"use client";

import Link from "next/link";

/**
 * Deliberately separate from src/components/dashboard/Navbar.tsx — the ads
 * dashboard is its own independent surface (own nav, own future action
 * buttons) that happens to share the same auth gate and a few generic UI
 * primitives, not a tab bolted onto the content dashboard.
 */
export function AdsNavbar({ authButton }: { authButton: "login" | "logout" | null }) {
  return (
    <nav className="flex-shrink-0 flex items-center justify-between bg-ink px-8 py-3.5">
      <div className="flex items-center gap-6 min-w-0">
        <Link
          href="/ads"
          className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber no-underline"
        >
          Marketing Monk Ads
        </Link>
        <Link
          href="/overview"
          className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium text-text-faint no-underline transition-colors hover:text-cream"
        >
          ← Content
        </Link>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {authButton === "logout" && (
          <form action="/api/site-auth/logout" method="POST">
            <button
              type="submit"
              className="flex flex-shrink-0 items-center whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-cream"
            >
              Log out
            </button>
          </form>
        )}
        {authButton === "login" && (
          <Link
            href="/login"
            className="flex flex-shrink-0 items-center whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint no-underline transition-colors hover:text-cream"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
