import type { QualityScoreResult } from "@/lib/scoring/quality-score";

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

/** Same 80/60 thresholds as ContentQualityPanel's category bars (4/5 and
 * 3/5 on that 0-5 scale), applied here to this component's 0-100 scores. */
function donutColor(score: number): string {
  if (score >= 80) return "var(--color-positive)";
  if (score >= 60) return "var(--color-amber)";
  return "var(--color-negative)";
}

export function QualityDonuts({ result }: { result: QualityScoreResult }) {
  return (
    <div>
      <p className="mb-4 text-[13px] leading-relaxed">{result.narrative}</p>

      <div className="grid grid-cols-4 gap-3">
        {result.components.map((c) => (
          <div
            key={c.key}
            className="flex flex-col items-center gap-3 rounded-[10px] border border-border bg-card-soft p-3.5"
          >
            <svg width={108} height={108} viewBox="0 0 100 100" className="flex-shrink-0">
              <circle cx={50} cy={50} r={R} fill="none" stroke="var(--color-border)" strokeWidth={9} />
              <circle
                cx={50}
                cy={50}
                r={R}
                fill="none"
                stroke={donutColor(c.score)}
                strokeWidth={9}
                strokeLinecap="round"
                strokeDasharray={`${c.dashArrayFraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                transform="rotate(-90 50 50)"
              />
              <text
                x={50}
                y={47}
                textAnchor="middle"
                fontFamily="var(--font-serif)"
                fontWeight={700}
                fontSize={19}
                fill="var(--color-ink)"
              >
                {c.score}%
              </text>
              <text
                x={50}
                y={62}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={9}
                fill="var(--color-text-muted)"
              >
                {c.weightLabel}
              </text>
            </svg>
            <div className="w-full min-w-0">
              <div className="mb-1 text-[12.5px] font-semibold leading-tight">{c.name}</div>
              <div className="text-[11.5px] leading-relaxed text-text-muted">
                {c.raw}. {c.benchmark}
              </div>
              <div className="mt-1 text-[11.5px] leading-relaxed">{c.why}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
