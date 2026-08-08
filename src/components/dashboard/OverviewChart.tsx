"use client";

import { useState } from "react";
import { usDate } from "@/lib/format";

interface ChartEdition {
  id: string;
  subject: string;
  publishedAt: string; // ISO
  openRate: number;
  ctrOverall: number;
}

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
    max: Math.ceil((max + pad) / step) * step,
  };
}

export function OverviewChart({ editions }: { editions: ChartEdition[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const chronological = [...editions].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  const n = chronological.length;
  const plotW = CHART_W - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_H - PAD_TOP - PAD_BOTTOM;

  const openRange = niceRange(chronological.map((e) => e.openRate), 3, 5);
  const ctrRange = niceRange(chronological.map((e) => e.ctrOverall), 0.15, 0.2);

  const sliceW = n > 0 ? plotW / n : plotW;
  const barW = Math.min(28, sliceW * 0.5);
  const xCenter = (i: number) => PAD_LEFT + i * sliceW + sliceW / 2;
  const yOpen = (v: number) =>
    PAD_TOP + (1 - (v - openRange.min) / (openRange.max - openRange.min || 1)) * plotH;
  const yCtr = (v: number) =>
    PAD_TOP + (1 - (v - ctrRange.min) / (ctrRange.max - ctrRange.min || 1)) * plotH;
  const floorY = PAD_TOP + plotH;

  const ctrPoints = chronological.map((e, i) => `${xCenter(i)},${yCtr(e.ctrOverall)}`).join(" ");

  const hover = hoverIdx !== null ? chronological[hoverIdx] : null;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="whitespace-nowrap font-serif text-[16px] font-semibold">
          Open rate vs CTR, day by day
        </div>
        <div className="font-mono text-[10px] text-text-muted">{n} EDITIONS</div>
      </div>

      <div className="relative">
        <svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="openRateBarFill" x1="0" y1="0" x2="0" y2="1">
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

          {chronological.map((e, i) => {
            const isHover = hoverIdx === i;
            return (
              <rect
                key={e.id}
                x={xCenter(i) - barW / 2}
                y={yOpen(e.openRate)}
                width={barW}
                height={Math.max(1, floorY - yOpen(e.openRate))}
                rx={3}
                fill="url(#openRateBarFill)"
                opacity={isHover ? 1 : 0.75}
              />
            );
          })}

          <polyline
            points={ctrPoints}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {chronological.map((e, i) => (
            <circle
              key={e.id}
              cx={xCenter(i)}
              cy={yCtr(e.ctrOverall)}
              r={hoverIdx === i ? 4 : 2.5}
              fill="var(--color-ink)"
            />
          ))}

          {chronological.map((e, i) => (
            <rect
              key={e.id}
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
            {chronological[0] ? usDate(chronological[0].publishedAt) : ""}
          </text>
          <text
            x={CHART_W - PAD_RIGHT}
            y={CHART_H - 4}
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fontSize={10}
            fill="var(--color-text-faint)"
          >
            {chronological[n - 1] ? usDate(chronological[n - 1].publishedAt) : ""}
          </text>
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute top-0 z-10 w-[220px] -translate-x-1/2 rounded-lg border border-border bg-card p-3 shadow-lg"
            style={{
              left: `${Math.min(85, Math.max(15, (xCenter(hoverIdx!) / CHART_W) * 100))}%`,
            }}
          >
            <div className="mb-2 font-mono text-[11px] text-text-muted">
              {usDate(hover.publishedAt, true)}
            </div>
            <div className="space-y-1.5 text-[12.5px]">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-orange" />
                  Open rate
                </span>
                <span className="font-semibold">{hover.openRate}%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-2.5 bg-ink" />
                  CTR
                </span>
                <span className="font-semibold">{hover.ctrOverall}%</span>
              </div>
            </div>
            <div className="mt-2 border-t border-hairline pt-2 text-[12px] leading-snug">
              {hover.subject}
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex gap-5 text-[11.5px]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange" />
          Open rate
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-2.5 bg-ink" />
          CTR (overall)
        </span>
      </div>
    </div>
  );
}
