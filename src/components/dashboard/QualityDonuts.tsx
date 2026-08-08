import type { QualityScoreResult } from "@/lib/scoring/quality-score";

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function QualityDonuts({ result }: { result: QualityScoreResult }) {
  return (
    <div>
      <p className="mb-4 text-[13px] leading-relaxed">{result.narrative}</p>

      <div className="grid grid-cols-2 gap-3">
        {result.components.map((c) => (
          <div
            key={c.key}
            className="flex gap-3 rounded-[10px] border border-border bg-card-soft p-3.5"
          >
            <svg width={84} height={84} viewBox="0 0 100 100" className="flex-shrink-0">
              <circle cx={50} cy={50} r={R} fill="none" stroke="var(--color-border)" strokeWidth={9} />
              <circle
                cx={50}
                cy={50}
                r={R}
                fill="none"
                stroke="var(--color-orange)"
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
            <div className="min-w-0">
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
