"use client";

import { useState } from "react";
import type { PollTally } from "@/lib/types";
import { EmptyState } from "./ui";

const CATEGORIES = [
  { key: "lovedIt", label: "Loved it", color: "var(--color-text-muted)" },
  { key: "prettyUseful", label: "Pretty useful", color: "var(--color-text-muted)" },
  { key: "itWasOkay", label: "Okay", color: "var(--color-text-muted)" },
  { key: "notHelpful", label: "Not helpful", color: "var(--color-text-muted)" },
] as const;

const CHART_TOP = 14;
const CHART_BOTTOM = 130;
const BAR_W = 64;
const GAP = 26;
const START_X = 44;
const VIEW_W = 400;

export function PollChart({ poll }: { poll: PollTally | null }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (!poll || poll.total === 0) {
    return (
      <div className="flex h-[180px] flex-col">
        <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
          Reader feedback
        </div>
        <EmptyState>No poll responses recorded on this edition.</EmptyState>
      </div>
    );
  }

  if (!poll.exact) {
    return (
      <div className="flex h-[180px] flex-col">
        <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
          Reader feedback
        </div>
        <EmptyState>
          {poll.note ?? "Responses recorded but not yet tallied for this edition."}
        </EmptyState>
      </div>
    );
  }

  const chartH = CHART_BOTTOM - CHART_TOP;
  const max = Math.max(poll.lovedIt, poll.prettyUseful, poll.itWasOkay, poll.notHelpful, 1);

  const bars = CATEGORIES.map((c, i) => {
    const value = poll[c.key];
    const h = (value / max) * chartH;
    const x = START_X + i * (BAR_W + GAP);
    const y = CHART_BOTTOM - h;
    return { ...c, value, x, y, h };
  });

  const gridTicks = [0, 0.5, 1].map((f) => ({
    y: CHART_BOTTOM - f * chartH,
    label: Math.round(max * f),
  }));

  const hover = hoverIdx !== null ? bars[hoverIdx] : null;

  return (
    <div className="flex flex-col">
      <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
        Reader feedback — {poll.total} responses
      </div>
      <div className="relative">
        <svg width="100%" height={160} viewBox={`0 0 ${VIEW_W} 160`} style={{ overflow: "visible" }}>
          {gridTicks.map((t) => (
            <g key={t.y}>
              <line x1={START_X - 6} x2={VIEW_W - 10} y1={t.y} y2={t.y} stroke="var(--color-hairline)" strokeWidth={1} />
              <text x={START_X - 10} y={t.y + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9.5} fill="var(--color-text-faint)">
                {t.label}
              </text>
            </g>
          ))}
          {bars.map((b, i) => (
            <g key={b.key}>
              <rect
                x={b.x}
                y={b.y}
                width={BAR_W}
                height={b.h}
                rx={3}
                fill={b.color}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                style={{ cursor: "pointer" }}
              />
              <text
                x={b.x + BAR_W / 2}
                y={CHART_BOTTOM + 16}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={9.5}
                fill="var(--color-text-muted)"
              >
                {b.label}
              </text>
            </g>
          ))}
        </svg>
        {hover && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 rounded-md bg-ink px-2 py-1 font-mono text-[10.5px] text-cream"
            style={{
              left: `${((hover.x + BAR_W / 2) / VIEW_W) * 100}%`,
              top: hover.y - 28,
            }}
          >
            {hover.value} votes
          </div>
        )}
      </div>
    </div>
  );
}
