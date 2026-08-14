"use client";

import { EmptyState } from "@/components/dashboard/ui";

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;
const PALETTE = ["var(--color-orange)", "var(--color-amber)", "var(--color-ink)", "#8a8578", "#c9c4b6"];

/** Multi-slice donut for "share of X by Y" breakdowns (e.g. leads by country) —
 * distinct from QualityDonuts.tsx, which draws one ring per single value. */
export function BreakdownDonut({
  slices,
}: {
  slices: { label: string; value: number }[];
}) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return <EmptyState>No data yet.</EmptyState>;
  }

  const segments = slices
    .filter((s) => s.value > 0)
    .reduce<{ label: string; value: number; fraction: number; dash: string; dashOffset: number; color: string }[]>(
      (acc, s, i) => {
        const priorOffset = acc.reduce((sum, seg) => sum + seg.fraction, 0);
        const fraction = s.value / total;
        acc.push({
          ...s,
          fraction,
          dash: `${fraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`,
          dashOffset: -priorOffset * CIRCUMFERENCE,
          color: PALETTE[i % PALETTE.length],
        });
        return acc;
      },
      [],
    );

  return (
    <div className="flex items-center gap-5">
      <svg width={124} height={124} viewBox="0 0 100 100" className="flex-shrink-0">
        <circle cx={50} cy={50} r={R} fill="none" stroke="var(--color-border)" strokeWidth={12} />
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx={50}
            cy={50}
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth={12}
            strokeDasharray={seg.dash}
            strokeDashoffset={seg.dashOffset}
            transform="rotate(-90 50 50)"
          />
        ))}
      </svg>
      <div className="min-w-0 flex-1 space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-3 text-[12px]">
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="truncate">{seg.label}</span>
            </span>
            <span className="flex-shrink-0 font-semibold">
              {seg.value.toLocaleString()} ({(seg.fraction * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
