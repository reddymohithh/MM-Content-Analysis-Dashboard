import type { StoredContentQualityScore } from "@/lib/data/editions";
import { EmptyState } from "./ui";

function scoreColor(score: number | null): string {
  if (score === null) return "var(--color-border)";
  if (score >= 4) return "var(--color-positive)";
  if (score >= 3) return "var(--color-amber)";
  return "var(--color-negative)";
}

export function ContentQualityPanel({
  result,
  audience,
}: {
  result: StoredContentQualityScore | null;
  audience: "batch1" | "batch2";
}) {
  if (!result) {
    return (
      <EmptyState>
        Not analyzed yet. Click &quot;Analyze content&quot; in the navbar to run the
        editorial content-quality checklist against this edition (requires local API
        keys).
      </EmptyState>
    );
  }

  const feedback = result[audience];

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <p className="max-w-[70%] text-[13px] leading-relaxed">{feedback.narrative}</p>
        <div className="text-right">
          <div className="font-serif text-[28px] font-bold leading-none">{result.total}%</div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wide text-text-faint">
            {result.model}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {result.categories.map((c) => (
          <div key={c.key}>
            <div className="mb-1 flex items-baseline justify-between text-[13px]">
              <span>
                {c.label}{" "}
                <span className="font-mono text-[10px] text-text-faint">
                  {Math.round(c.weight * 100)}% wt
                </span>
              </span>
              <span className="font-semibold">{c.score === null ? "N/A" : `${c.score}/5`}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-border">
              <div
                className="h-2 rounded-full"
                style={{
                  width: c.score === null ? "100%" : `${(c.score / 5) * 100}%`,
                  background: scoreColor(c.score),
                  opacity: c.score === null ? 0.3 : 1,
                }}
              />
            </div>
            <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
              {c.justification}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
