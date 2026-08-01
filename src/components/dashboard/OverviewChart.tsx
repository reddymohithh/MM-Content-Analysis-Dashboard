"use client";

import { useState } from "react";
import Link from "next/link";
import { usDate } from "@/lib/format";

interface ChartEdition {
  id: string;
  subject: string;
  publishedAt: string; // ISO
  openRate: number;
  ctrOverall: number;
}

const CHART_W = 1120;
const CHART_H = 220;
const PAD_LEFT = 40;
const PAD_RIGHT = 20;
const PAD_TOP = 14;
const PAD_BOTTOM = 26;

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

  const x = (i: number) => PAD_LEFT + (n > 1 ? (i / (n - 1)) * plotW : plotW / 2);
  const yOpen = (v: number) =>
    PAD_TOP + (1 - (v - openRange.min) / (openRange.max - openRange.min || 1)) * plotH;
  const yCtr = (v: number) =>
    PAD_TOP + (1 - (v - ctrRange.min) / (ctrRange.max - ctrRange.min || 1)) * plotH;

  const openPoints = chronological.map((e, i) => `${x(i)},${yOpen(e.openRate)}`).join(" ");
  const ctrPoints = chronological.map((e, i) => `${x(i)},${yCtr(e.ctrOverall)}`).join(" ");

  const labelStep = Math.max(1, Math.ceil(n / 10));
  const hover = hoverIdx !== null ? chronological[hoverIdx] : null;
  const sliceW = n > 0 ? plotW / n : plotW;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-0.5 flex items-baseline justify-between">
        <div className="whitespace-nowrap font-serif text-[16px] font-semibold">
          Open rate vs CTR, day by day
        </div>
        <div className="font-mono text-[10px] text-text-muted">{n} EDITIONS</div>
      </div>
      <div className="mb-1.5 text-[12px] text-text-muted">
        Hover a date to compare that edition&apos;s open rate and CTR. Click the subject
        line to open it.
      </div>

      <div className="relative">
        <svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ overflow: "visible" }}>
          {[0, 0.5, 1].map((f) => {
            const y = PAD_TOP + f * plotH;
            return (
              <line
                key={f}
                x1={PAD_LEFT}
                x2={CHART_W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth={1}
              />
            );
          })}

          <polyline
            points={openPoints}
            fill="none"
            stroke="var(--color-orange)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={ctrPoints}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth={2}
            strokeDasharray="4 3"
          />

          {hover && (
            <g>
              <line
                x1={x(hoverIdx!)}
                x2={x(hoverIdx!)}
                y1={yOpen(hover.openRate)}
                y2={yCtr(hover.ctrOverall)}
                stroke="var(--color-ink)"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <circle cx={x(hoverIdx!)} cy={yOpen(hover.openRate)} r={5} fill="var(--color-orange)" stroke="#fff" strokeWidth={2} />
              <circle cx={x(hoverIdx!)} cy={yCtr(hover.ctrOverall)} r={5} fill="var(--color-ink)" stroke="#fff" strokeWidth={2} />
            </g>
          )}

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

          {chronological.map((e, i) =>
            i % labelStep === 0 ? (
              <text
                key={e.id}
                x={x(i)}
                y={CHART_H - 6}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={9.5}
                fill="var(--color-text-faint)"
              >
                {usDate(e.publishedAt)}
              </text>
            ) : null,
          )}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute top-2 z-10 -translate-x-1/2 rounded-lg bg-ink px-3 py-2 text-cream shadow-none"
            style={{ left: `${(x(hoverIdx!) / CHART_W) * 100}%` }}
          >
            <Link
              href={`/editions/${hover.id}`}
              className="pointer-events-auto block whitespace-nowrap text-[12px] font-semibold text-cream underline decoration-text-faint"
            >
              {hover.subject}
            </Link>
            <div className="mt-1 font-mono text-[10.5px] text-text-faint">
              {usDate(hover.publishedAt, true)}
            </div>
            <div className="mt-1 flex gap-3 font-mono text-[11px]">
              <span style={{ color: "var(--color-orange-light)" }}>
                Open {hover.openRate}%
              </span>
              <span className="text-cream">CTR {hover.ctrOverall}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-1.5 flex gap-5 text-[11.5px]">
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
