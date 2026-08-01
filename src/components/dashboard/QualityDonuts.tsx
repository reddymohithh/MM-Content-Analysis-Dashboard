import type { QualityScoreResult } from "@/lib/scoring/quality-score";

const R = 42;
const CIRCUMFERENCE = 2 * Math.PI * R;

export function QualityDonuts({ result }: { result: QualityScoreResult }) {
  return (
    <div>
      <p className="mb-5 text-[13px] leading-relaxed">{result.narrative}</p>

      <div className="mb-5 flex flex-wrap justify-around gap-4">
        {result.components.map((c) => (
          <div key={c.key} className="flex flex-col items-center" style={{ width: 108 }}>
            <svg width={100} height={100} viewBox="0 0 100 100">
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
            <div className="mt-1 text-center text-[11.5px] font-medium leading-tight">
              {c.name}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t border-hairline pt-4">
        {result.components.map((c) => (
          <div key={c.key} className="text-[12.5px] leading-relaxed">
            <span className="font-semibold">{c.name}: </span>
            <span className="text-text-muted">{c.raw}. </span>
            <span className="text-text-muted">{c.benchmark} </span>
            <span>{c.why}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
