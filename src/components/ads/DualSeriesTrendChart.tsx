"use client";

import { useState } from "react";
import { EmptyState } from "@/components/dashboard/ui";

const CHART_W = 1120;
const CHART_H = 240;
const PAD_LEFT = 16;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

function niceRange(values: number[], pad: number, step: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return {
    min: Math.max(0, Math.floor((min - pad) / step) * step),
    max: Math.ceil((max + pad) / step) * step || step,
  };
}

interface Point {
  label: string;
  bar: number;
  line: number | null;
}

/**
 * Bar (left axis) + line (right axis) combo, same visual language as
 * OverviewChart.tsx — extracted here (rather than duplicated) since the
 * ads dashboard needs it twice: spend-vs-leads and leads-vs-subscribers.
 */
export function DualSeriesTrendChart({
  points,
  barLabel,
  lineLabel,
  barFormat,
  lineFormat,
}: {
  points: Point[];
  barLabel: string;
  lineLabel: string;
  barFormat: (v: number) => string;
  lineFormat: (v: number) => string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (points.length === 0) {
    return <EmptyState>No data yet.</EmptyState>;
  }

  const n = points.length;
  const plotW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const barRange = niceRange(points.map((p) => p.bar), 1, 1);
  const lineValues = points.map((p) => p.line ?? 0);
  const lineRange = niceRange(lineValues, 1, 1);

  const sliceW = plotW / n;
  const barW = Math.min(28, sliceW * 0.5);
  const xCenter = (i: number) => PAD_LEFT + i * sliceW + sliceW / 2;
  const yBar = (v: number) =>
    PAD_TOP + (1 - (v - barRange.min) / (barRange.max - barRange.min || 1)) * plotH;
  const yLine = (v: number) =>
    PAD_TOP + (1 - (v - lineRange.min) / (lineRange.max - lineRange.min || 1)) * plotH;
  const floorY = PAD_TOP + plotH;

  const linePoints = points
    .filter((p) => p.line !== null)
    .map((p) => `${xCenter(points.indexOf(p))},${yLine(p.line as number)}`)
    .join(" ");

  const hover = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative">
      <svg
        width="100%"
        height={CHART_H}
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="adsBarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-orange)" stopOpacity={0.85} />
            <stop offset="100%" stopColor="var(--color-orange)" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <line
          x1={PAD_LEFT}
          x2={CHART_W - PAD_RIGHT}
          y1={floorY}
          y2={floorY}
          stroke="var(--color-hairline)"
          strokeWidth={1}
        />

        {points.map((p, i) => {
          const isHover = hoverIdx === i;
          return (
            <rect
              key={p.label + i}
              x={xCenter(i) - barW / 2}
              y={yBar(p.bar)}
              width={barW}
              height={Math.max(1, floorY - yBar(p.bar))}
              rx={3}
              fill="url(#adsBarFill)"
              opacity={isHover ? 1 : 0.75}
            />
          );
        })}

        <polyline
          points={linePoints}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        {points.map(
          (p, i) =>
            p.line !== null && (
              <circle
                key={p.label + i}
                cx={xCenter(i)}
                cy={yLine(p.line)}
                r={hoverIdx === i ? 4 : 2.5}
                fill="var(--color-ink)"
              />
            ),
        )}

        {points.map((p, i) => (
          <rect
            key={p.label + i}
            x={PAD_LEFT + i * sliceW}
            y={0}
            width={sliceW}
            height={CHART_H}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer" }}
          />
        ))}

        <text
          x={PAD_LEFT}
          y={CHART_H - 4}
          textAnchor="start"
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill="var(--color-text-faint)"
        >
          {points[0]?.label ?? ""}
        </text>
        <text
          x={CHART_W - PAD_RIGHT}
          y={CHART_H - 4}
          textAnchor="end"
          fontFamily="var(--font-mono)"
          fontSize={10}
          fill="var(--color-text-faint)"
        >
          {points[n - 1]?.label ?? ""}
        </text>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute top-0 z-10 w-[172px] -translate-x-1/2 rounded-lg border border-border bg-card p-2.5 shadow-lg"
          style={{
            left: `${Math.min(85, Math.max(15, (xCenter(hoverIdx!) / CHART_W) * 100))}%`,
          }}
        >
          <div className="mb-1.5 font-mono text-[10.5px] text-text-muted">{hover.label}</div>
          <div className="space-y-1 text-[12px]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-orange" />
                {barLabel}
              </span>
              <span className="font-semibold">{barFormat(hover.bar)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-2.5 bg-ink" />
                {lineLabel}
              </span>
              <span className="font-semibold">
                {hover.line !== null ? lineFormat(hover.line) : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-5 text-[11.5px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange" />
          {barLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-2.5 bg-ink" />
          {lineLabel}
        </span>
      </div>
    </div>
  );
}
