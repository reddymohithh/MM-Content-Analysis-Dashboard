"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DataTable } from "./ui";

export interface SubjectLineRow {
  id: string;
  subject: string;
  hookType: string;
  hookLabel: string;
  charLength: number;
  hasNumber: boolean;
  openRate: number;
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-orange";
const numberCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] outline-none focus:border-orange";

function RangeField({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  suffix,
}: {
  label: string;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="decimal"
          placeholder="Min"
          value={min}
          onChange={(e) => onMinChange(e.target.value)}
          className={numberCls}
        />
        <span className="text-text-faint">–</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="Max"
          value={max}
          onChange={(e) => onMaxChange(e.target.value)}
          className={numberCls}
        />
        {suffix && <span className="flex-shrink-0 text-[11.5px] text-text-faint">{suffix}</span>}
      </div>
    </div>
  );
}

export function SubjectLineLabExplorer({
  rows,
  hookTypes,
}: {
  rows: SubjectLineRow[];
  hookTypes: { value: string; label: string }[];
}) {
  const [search, setSearch] = useState("");
  const [selectedHooks, setSelectedHooks] = useState<Set<string>>(new Set());
  const [lengthMin, setLengthMin] = useState("");
  const [lengthMax, setLengthMax] = useState("");
  const [openMin, setOpenMin] = useState("");
  const [openMax, setOpenMax] = useState("");

  function toggleHook(value: string) {
    setSelectedHooks((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search && !r.subject.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedHooks.size > 0 && !selectedHooks.has(r.hookType)) return false;
      if (lengthMin !== "" && r.charLength < Number(lengthMin)) return false;
      if (lengthMax !== "" && r.charLength > Number(lengthMax)) return false;
      if (openMin !== "" && r.openRate < Number(openMin)) return false;
      if (openMax !== "" && r.openRate > Number(openMax)) return false;
      return true;
    });
  }, [rows, search, selectedHooks, lengthMin, lengthMax, openMin, openMax]);

  const hasActiveFilters =
    selectedHooks.size > 0 || lengthMin || lengthMax || openMin || openMax;

  function clearFilters() {
    setSelectedHooks(new Set());
    setLengthMin("");
    setLengthMax("");
    setOpenMin("");
    setOpenMax("");
  }

  return (
    <div>
      <div className="mb-4 rounded-xl border border-border bg-card p-4">
        <input
          type="text"
          placeholder="Search by subject line..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${inputCls} mb-3.5`}
        />

        <div className="mb-3.5">
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-text-muted">
            Hook type
          </div>
          <div className="flex flex-wrap gap-1.5">
            {hookTypes.map((h) => {
              const active = selectedHooks.has(h.value);
              return (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => toggleHook(h.value)}
                  className={`rounded-full border px-2.5 py-1 text-[12px] transition-colors ${
                    active
                      ? "border-orange bg-orange text-ink"
                      : "border-border bg-card text-text-muted"
                  }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <RangeField
            label="Length"
            min={lengthMin}
            max={lengthMax}
            onMinChange={setLengthMin}
            onMaxChange={setLengthMax}
            suffix="char"
          />
          <RangeField label="Open rate" min={openMin} max={openMax} onMinChange={setOpenMin} onMaxChange={setOpenMax} suffix="%" />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="mt-3 text-[12px] text-text-muted underline decoration-text-faint"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mb-2 text-[12px] text-text-muted">
        {filtered.length} of {rows.length} subject lines
      </div>

      <DataTable
        columns={[
          { label: "Subject line" },
          { label: "Hook type" },
          { label: "Length", align: "right" },
          { label: "Number", align: "right" },
          { label: "Open", align: "right" },
        ]}
      >
        {filtered.map((r) => (
          <tr key={r.id} className="border-t border-hairline">
            <td className="p-0">
              <Link
                href={`/editions/${r.id}`}
                className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
              >
                {r.subject}
              </Link>
            </td>
            <td className="px-3.5 py-2.5 text-[12.5px] text-text-muted">{r.hookLabel}</td>
            <td className="px-3.5 py-2.5 text-right font-mono text-[12px] text-text-muted">
              {r.charLength} char
            </td>
            <td className="px-3.5 py-2.5 text-right text-[12.5px] text-text-muted">
              {r.hasNumber ? "Yes" : "No"}
            </td>
            <td className="px-3.5 py-2.5 text-right text-[13px] text-ink">{r.openRate}%</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
