"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usDate } from "@/lib/format";
import { DataTable } from "./ui";

export interface EditionRow {
  id: string;
  subject: string;
  publishedAt: string; // ISO
  openRate: number;
  ctrOverall: number;
  quality: number;
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-orange";
const numberCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] outline-none placeholder:text-text-faint focus:border-orange";
const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";

function RangeField({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  suffix = "%",
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

export function EditionsExplorer({ editions }: { editions: EditionRow[] }) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [openMin, setOpenMin] = useState("");
  const [openMax, setOpenMax] = useState("");
  const [ctrMin, setCtrMin] = useState("");
  const [ctrMax, setCtrMax] = useState("");
  const [qualityMin, setQualityMin] = useState("");
  const [qualityMax, setQualityMax] = useState("");

  const filtered = useMemo(() => {
    return editions.filter((e) => {
      if (search && !e.subject.toLowerCase().includes(search.toLowerCase())) return false;
      const publishedDate = e.publishedAt.slice(0, 10);
      if (dateFrom && publishedDate < dateFrom) return false;
      if (dateTo && publishedDate > dateTo) return false;
      if (openMin !== "" && e.openRate < Number(openMin)) return false;
      if (openMax !== "" && e.openRate > Number(openMax)) return false;
      if (ctrMin !== "" && e.ctrOverall < Number(ctrMin)) return false;
      if (ctrMax !== "" && e.ctrOverall > Number(ctrMax)) return false;
      if (qualityMin !== "" && e.quality < Number(qualityMin)) return false;
      if (qualityMax !== "" && e.quality > Number(qualityMax)) return false;
      return true;
    });
  }, [editions, search, dateFrom, dateTo, openMin, openMax, ctrMin, ctrMax, qualityMin, qualityMax]);

  const hasActiveFilters =
    dateFrom || dateTo || openMin || openMax || ctrMin || ctrMax || qualityMin || qualityMax;

  function clearFilters() {
    setDateFrom("");
    setDateTo("");
    setOpenMin("");
    setOpenMax("");
    setCtrMin("");
    setCtrMax("");
    setQualityMin("");
    setQualityMax("");
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
        <div className="grid grid-cols-4 gap-3.5">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
              Date range
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={dateCls}
              />
              <span className="text-text-faint">–</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={dateCls}
              />
            </div>
          </div>
          <RangeField label="Open rate" min={openMin} max={openMax} onMinChange={setOpenMin} onMaxChange={setOpenMax} />
          <RangeField label="CTR" min={ctrMin} max={ctrMax} onMinChange={setCtrMin} onMaxChange={setCtrMax} />
          <RangeField
            label="Content quality"
            min={qualityMin}
            max={qualityMax}
            onMinChange={setQualityMin}
            onMaxChange={setQualityMax}
          />
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
        {filtered.length} of {editions.length} editions
      </div>

      <DataTable
        columns={[
          { label: "Date" },
          { label: "Subject" },
          { label: "Open", align: "right" },
          { label: "CTR", align: "right" },
          { label: "Quality", align: "right" },
        ]}
      >
        {filtered.map((e) => (
          <tr key={e.id} className="border-t border-hairline">
            <td className="p-0">
              <Link
                href={`/editions/${e.id}`}
                className="flex whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-text-muted no-underline"
              >
                {usDate(e.publishedAt, true)}
              </Link>
            </td>
            <td className="p-0">
              <Link
                href={`/editions/${e.id}`}
                className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
              >
                {e.subject}
              </Link>
            </td>
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[13px] text-ink no-underline">
                {e.openRate}%
              </Link>
            </td>
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[13px] text-ink no-underline">
                {e.ctrOverall}%
              </Link>
            </td>
            <td className="p-0">
              <Link
                href={`/editions/${e.id}`}
                className="block px-3.5 py-2.5 text-right text-[13px] font-bold text-orange no-underline"
              >
                {e.quality}%
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
