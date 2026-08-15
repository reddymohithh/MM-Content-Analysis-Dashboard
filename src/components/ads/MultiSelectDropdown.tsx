"use client";

import { useEffect, useRef, useState } from "react";

export interface DropdownOption {
  id: string;
  label: string;
  sub?: string;
}

/** Reused for ad sets, ads, and Beehiiv segments on the mapping page —
 * same click-outside-to-close pattern as AuthMenu.tsx, but a checkbox
 * panel instead of an actions list, since these are multi-select. */
export function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  placeholder = "Select...",
  disabled = false,
  disabledReason,
}: {
  label: string;
  options: DropdownOption[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  placeholder?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
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

  const isDisabled = disabled || options.length === 0;
  const summary =
    selected.size === 0
      ? isDisabled && disabledReason
        ? disabledReason
        : placeholder
      : `${selected.size} selected`;

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">{label}</div>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] transition-colors focus:border-orange disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={selected.size === 0 ? "truncate text-text-faint" : "truncate"}>{summary}</span>
        <span className={`flex-shrink-0 text-[10px] text-text-faint transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && !isDisabled && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-full min-w-[260px] overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {options.map((opt) => (
            <label
              key={opt.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-card-soft"
            >
              <input
                type="checkbox"
                checked={selected.has(opt.id)}
                onChange={() => onToggle(opt.id)}
                className="h-4 w-4 flex-shrink-0 accent-orange"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px]">{opt.label}</div>
                {opt.sub && <div className="text-[11px] text-text-faint">{opt.sub}</div>}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
