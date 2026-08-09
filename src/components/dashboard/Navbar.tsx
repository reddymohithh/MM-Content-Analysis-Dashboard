"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/overview", label: "Overview" },
  { href: "/editions", label: "Editions" },
  { href: "/subject-line-lab", label: "Subject Line Lab" },
  { href: "/retention", label: "Retention" },
];

export function Navbar() {
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
    </nav>
  );
}
