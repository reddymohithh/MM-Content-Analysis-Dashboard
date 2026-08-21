"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Replaces the old standalone "Log out" button and the "Ads"/"Content"
 * section-toggle link with one dropdown: cross-section navigation plus log
 * out, all in one place. SparkLoop has no real dashboard yet (BUILD_LOG.md
 * Round 33/34 -- deferred pending SparkLoop granting v3 API access), so it
 * renders disabled with an honest "Coming soon" label rather than linking
 * to a page that doesn't exist.
 */
export function AdminMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex flex-shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-cream"
      >
        Admin
        <span className={`text-[10px] transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-border bg-card p-1 shadow-lg">
          <Link
            href="/overview"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-[12.5px] text-ink no-underline transition-colors hover:bg-card-soft"
          >
            Content
          </Link>
          <Link
            href="/ads"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-[12.5px] text-ink no-underline transition-colors hover:bg-card-soft"
          >
            Meta Ads
          </Link>
          <div className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2 text-[12.5px] text-text-faint">
            <span>SparkLoop</span>
            <span className="font-mono text-[9px] uppercase tracking-wide">Coming soon</span>
          </div>
          <div className="my-1 border-t border-border" />
          <form action="/api/site-auth/logout" method="POST">
            <button
              type="submit"
              className="block w-full rounded-lg px-3 py-2 text-left text-[12.5px] text-negative transition-colors hover:bg-card-soft"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
