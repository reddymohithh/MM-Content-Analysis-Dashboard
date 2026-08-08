"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usDate } from "@/lib/format";
import { DataTable } from "./ui";

export interface RetentionRow {
  id: string;
  subject: string;
  publishedAt: string; // ISO
  unsubRate: number;
  aboveAverage: boolean;
}

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-orange";

export function RetentionExplorer({ rows }: { rows: RetentionRow[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.subject.toLowerCase().includes(q));
  }, [rows, search]);

  return (
    <div>
      <input
        type="text"
        placeholder="Search by subject line..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${inputCls} mb-4`}
      />

      <div className="mb-2 text-[12px] text-text-muted">
        {filtered.length} of {rows.length} editions
      </div>

      <DataTable
        columns={[
          { label: "Date" },
          { label: "Subject" },
          { label: "Unsub", align: "right" },
          { label: "Flag", align: "right" },
        ]}
      >
        {filtered.map((r) => (
          <tr key={r.id} className="border-t border-hairline">
            <td className="whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-text-muted">
              {usDate(r.publishedAt, true)}
            </td>
            <td className="p-0">
              <Link
                href={`/editions/${r.id}`}
                className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
              >
                {r.subject}
              </Link>
            </td>
            <td className="px-3.5 py-2.5 text-right text-[13px] text-ink">{r.unsubRate}%</td>
            <td
              className={`px-3.5 py-2.5 text-right text-[12.5px] font-medium ${
                r.aboveAverage ? "text-negative" : "text-positive"
              }`}
            >
              {r.aboveAverage ? "Above average" : "Normal"}
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
