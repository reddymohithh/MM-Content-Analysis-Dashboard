"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavTriggerButton } from "./NavTriggerButton";
import { AuthMenu } from "./AuthMenu";

const TABS = [
  { href: "/overview", label: "Overview" },
  { href: "/editions", label: "Editions" },
  { href: "/subject-line-lab", label: "Subject Line Lab" },
  { href: "/retention", label: "Retention" },
];

export function Navbar({ authButton }: { authButton: "login" | "logout" | null }) {
  const pathname = usePathname();

  return (
    <nav className="flex-shrink-0 flex items-center justify-between bg-ink px-8 py-3.5">
      <div className="flex items-center gap-6 min-w-0">
        <Link
          href="/overview"
          className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber no-underline"
        >
          Marketing Monk
        </Link>
        <div className="flex items-center gap-1 min-w-0">
          {TABS.map((tab) => {
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
        <NavTriggerButton
          idleLabel="Fetch"
          runningLabel="Fetching…"
          endpoint="/api/beehiiv/refresh"
          title="Pull the trailing 30 days of editions from Beehiiv (requires local API key)"
          formatResult={(data) =>
            `Synced ${data.synced} edition${data.synced === 1 ? "" : "s"}${
              typeof data.removed === "number" && data.removed > 0 ? `, removed ${data.removed} stale` : ""
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
        {authButton === "logout" && <AuthMenu />}
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
