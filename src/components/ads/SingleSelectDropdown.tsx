"use client";

import { useEffect, useRef, useState } from "react";
import type { DropdownOption } from "./MultiSelectDropdown";

/** Same button/panel look as MultiSelectDropdown, but radio-style: picking
 * an option replaces the selection and closes the panel, since a mapping
 * only ever has one campaign. */
export function SingleSelectDropdown({
  label,
  options,
  selected,
  onSelect,
  placeholder = "Select...",
  disabled = false,
  disabledReason,
}: {
  label: string;
  options: DropdownOption[];
  selected: string;
  onSelect: (id: string) => void;
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
  const selectedOption = options.find((o) => o.id === selected);
  const summary = selectedOption
    ? selectedOption.label
    : isDisabled && disabledReason
      ? disabledReason
      : placeholder;

  return (
    <div ref={ref} className="relative">
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">{label}</div>
      <button
        type="button"
        disabled={isDisabled}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] transition-colors focus:border-orange disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className={!selectedOption ? "truncate text-text-faint" : "truncate"}>{summary}</span>
        <span className={`flex-shrink-0 text-[10px] text-text-faint transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>
      {open && !isDisabled && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-64 w-full min-w-[260px] overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onSelect(opt.id);
                setOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-card-soft"
            >
              <span
                className={`h-3.5 w-3.5 flex-shrink-0 rounded-full border ${
                  selected === opt.id ? "border-orange bg-orange" : "border-border"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px]">{opt.label}</div>
                {opt.sub && <div className="text-[11px] text-text-faint">{opt.sub}</div>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
