"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export function AuthMenu() {
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
        className="flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-text-faint/40 px-3 py-1.5 text-[12px] font-medium text-text-faint transition-colors hover:text-cream"
      >
        Account
        <span
          className={`inline-block text-[9px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
          <Link
            href="/change-password"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-[12.5px] text-ink no-underline transition-colors hover:bg-card-soft"
          >
            Change password
          </Link>
          <form action="/api/site-auth/logout" method="POST">
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-[12.5px] text-negative transition-colors hover:bg-card-soft"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
