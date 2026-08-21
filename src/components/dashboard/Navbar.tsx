"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavTriggerButton } from "./NavTriggerButton";
import { AdminMenu } from "./AdminMenu";

const TABS = [
  { href: "/overview", label: "Overview" },
  { href: "/editions", label: "Editions" },
  { href: "/subject-line-lab", label: "Subject Line Lab" },
  { href: "/retention", label: "Retention" },
];

const ADS_TABS = [
  { href: "/ads", label: "Overview" },
  { href: "/ads/campaigns", label: "Campaigns" },
  { href: "/ads/mapping", label: "Mapping" },
];

const inertTriggerButtonClasses =
  "flex flex-shrink-0 cursor-not-allowed items-center gap-1.5 whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint/40";

/**
 * One shared navbar for both the content and ads dashboards — same brand,
 * same shell, same auth control. `section` only changes which content-
 * dashboard-specific tabs/buttons show; it isn't a different component per
 * section. Cross-section navigation (Content / Meta Ads / SparkLoop) lives
 * in the Admin dropdown (AdminMenu.tsx), not a standalone toggle link.
 *
 * `disabled` renders this navbar on /login — so the app doesn't look
 * broken behind the login card — but every control in it is inert: no
 * navigation, no data fetching, no log in/out button (there's no session
 * to manage yet). Tabs/logo become plain `<span>`s and the trigger buttons
 * render as static disabled buttons instead of live `NavTriggerButton`s.
 */
export function Navbar({
  authButton,
  disabled = false,
  section = "content",
}: {
  authButton?: "login" | "logout" | null;
  disabled?: boolean;
  section?: "content" | "ads";
}) {
  const pathname = usePathname();
  const homeHref = section === "ads" ? "/ads" : "/overview";

  return (
    <nav className="flex-shrink-0 flex items-center justify-between bg-ink px-8 py-3.5">
      <div className="flex items-center gap-6 min-w-0">
        {disabled ? (
          <span className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber/40">
            Marketing Monk
          </span>
        ) : (
          <Link
            href={homeHref}
            className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber no-underline"
          >
            Marketing Monk
          </Link>
        )}
        <div className="flex items-center gap-1 min-w-0">
          {(section === "ads" ? ADS_TABS : TABS).map((tab) => {
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
              tab.href === "/ads"
                ? pathname === "/ads"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
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
              Admin
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
            {section === "content" && (
              <>
                <NavTriggerButton
                  idleLabel="Fetch"
                  runningLabel="Fetching…"
                  endpoint="/api/beehiiv/refresh"
                  title="Pull every confirmed edition from Beehiiv since July 1, 2026, including web URLs"
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
                  title="Score every unanalyzed edition for editorial content quality"
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
              </>
            )}
            {section === "ads" && (
              <NavTriggerButton
                idleLabel="Refresh"
                runningLabel="Refreshing…"
                endpoint="/api/ads/refresh"
                title="Pull campaigns/ad sets/ads from Meta and segments from Beehiiv (requires local API keys)"
                formatResult={(data) => {
                  const parts: string[] = [];
                  if (typeof data.campaigns === "number") {
                    parts.push(`${data.campaigns} campaigns, ${data.adSets} ad sets, ${data.ads} ads`);
                  }
                  if (typeof data.segments === "number") {
                    parts.push(`${data.segments} segments`);
                  }
                  const errors = Array.isArray(data.errors) ? data.errors : [];
                  return [parts.join(". ") + (parts.length ? "." : ""), ...errors]
                    .filter(Boolean)
                    .join(" ");
                }}
              />
            )}
            {authButton === "logout" && <AdminMenu />}
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
