"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavTriggerButton } from "./NavTriggerButton";

const TABS = [
  { href: "/overview", label: "Overview" },
  { href: "/editions", label: "Editions" },
  { href: "/subject-line-lab", label: "Subject Line Lab" },
  { href: "/retention", label: "Retention" },
];

const inertTriggerButtonClasses =
  "flex flex-shrink-0 cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint/40";

/**
 * `disabled` renders the same navbar on /login — so the app doesn't look
 * broken behind the login card — but every control in it is inert: no
 * navigation, no data fetching, no log in/out button (there's no session
 * to manage yet). Tabs/logo become plain `<span>`s and the trigger buttons
 * render as static disabled buttons instead of live `NavTriggerButton`s.
 */
export function Navbar({
  authButton,
  disabled = false,
}: {
  authButton?: "login" | "logout" | null;
  disabled?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-shrink-0 flex items-center justify-between bg-ink px-8 py-3.5">
      <div className="flex items-center gap-6 min-w-0">
        {disabled ? (
          <span className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber/40">
            Marketing Monk
          </span>
        ) : (
          <Link
            href="/overview"
            className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber no-underline"
          >
            Marketing Monk
          </Link>
        )}
        <div className="flex items-center gap-1 min-w-0">
          {TABS.map((tab) => {
            if (disabled) {
              return (
                <span
                  key={tab.href}
                  className="whitespace-nowrap flex-shrink-0 cursor-not-allowed rounded-lg px-3 py-1.5 text-[13px] font-bold text-text-muted/40"
                >
                  {tab.label}
                </span>
              );
            }
            const active =
              pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap flex-shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-bold no-underline transition-colors ${
                  active
                    ? "bg-orange text-ink"
                    : "text-text-muted hover:text-cream"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {disabled ? (
          <>
            <span className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium text-text-faint/40">
              Ads →
            </span>
            <button type="button" disabled className={inertTriggerButtonClasses}>
              <span className="inline-block">↻</span>
              Fetch
            </button>
            <button type="button" disabled className={inertTriggerButtonClasses}>
              <span className="inline-block">↻</span>
              Analyze content
            </button>
          </>
        ) : (
          <>
            <Link
              href="/ads"
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-medium text-text-faint no-underline transition-colors hover:text-cream"
            >
              Ads →
            </Link>
            <NavTriggerButton
              idleLabel="Fetch"
              runningLabel="Fetching…"
              endpoint="/api/beehiiv/refresh"
              title="Pull the trailing 30 days of editions from Beehiiv (requires local API key)"
              formatResult={(data) =>
                `Synced ${data.synced} edition${data.synced === 1 ? "" : "s"}${
                  typeof data.removed === "number" && data.removed > 0
                    ? `, removed ${data.removed} stale`
                    : ""
                }.`
              }
            />
            <NavTriggerButton
              idleLabel="Analyze content"
              runningLabel="Analyzing…"
              endpoint="/api/content-quality/refresh"
              title="Score new editions for editorial content quality (requires local API keys)"
              formatResult={(data) =>
                typeof data.scored === "number" && data.scored > 0
                  ? `Scored ${data.scored} edition${data.scored === 1 ? "" : "s"}${
                      Array.isArray(data.errors) && data.errors.length
                        ? `, ${data.errors.length} failed`
                        : ""
                    }.`
                  : "All editions already scored."
              }
            />
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
          </>
        )}
      </div>
    </nav>
  );
}
