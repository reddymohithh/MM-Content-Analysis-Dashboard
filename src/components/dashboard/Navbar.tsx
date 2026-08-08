"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { href: "/overview", label: "Overview" },
  { href: "/editions", label: "Editions" },
  { href: "/subject-line-lab", label: "Subject Line Lab" },
  { href: "/retention", label: "Retention" },
];

const LENSES = [
  { value: "blended", label: "Blended" },
  { value: "batch1", label: "Batch 1" },
  { value: "batch2", label: "Batch 2" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isEditionDetail = /^\/editions\/[^/]+$/.test(pathname);
  const audience = searchParams.get("audience") ?? "blended";

  function setAudience(value: string) {
    if (!isEditionDetail) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("audience", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav className="flex-shrink-0 flex items-center justify-between bg-ink px-8 py-3.5">
      <div className="flex items-center gap-6 min-w-0">
        <Link
          href="/overview"
          className="flex-shrink-0 whitespace-nowrap font-serif text-[19px] font-semibold text-amber no-underline"
        >
          Marketing Monk<span className="text-orange">.</span>
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

      <div
        className="flex items-center gap-1 rounded-[9px] bg-lens-bg p-1 flex-shrink-0 transition-opacity"
        style={{
          opacity: isEditionDetail ? 1 : 0.45,
          pointerEvents: isEditionDetail ? "auto" : "none",
        }}
      >
        {LENSES.map((lens) => (
          <button
            key={lens.value}
            type="button"
            onClick={() => setAudience(lens.value)}
            className={`whitespace-nowrap flex-shrink-0 rounded-lg px-3 py-1 text-[12.5px] font-medium transition-colors ${
              audience === lens.value
                ? "bg-cream text-ink"
                : "text-text-faint"
            }`}
          >
            {lens.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
