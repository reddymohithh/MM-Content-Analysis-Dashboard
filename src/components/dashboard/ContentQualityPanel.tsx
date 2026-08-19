import type { StoredContentQualityScore } from "@/lib/data/editions";
import type { ImprovementPriority } from "@/lib/scoring/content-quality";
import { EmptyState } from "./ui";

function scoreColor(score: number | null, max = 5): string {
  if (score === null) return "var(--color-border)";
  const ratio = score / max;
  if (ratio >= 0.8) return "var(--color-positive)";
  if (ratio >= 0.6) return "var(--color-amber)";
  return "var(--color-negative)";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-6 font-mono text-[10.5px] uppercase tracking-wide text-text-muted first:mt-0">
      {children}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

/** Compact label:value line for Section 22's short summary answers --
 * deliberately terser than Bullets, since these are meant to compress
 * Sections 17/18's detail, not restate it. */
function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-[11.5px] leading-relaxed">
      <span className="font-semibold text-text-muted">{label}: </span>
      {value}
    </p>
  );
}

function ScoreAssessmentRow({ label, score, assessment, max = 5 }: { label: string; score: number; assessment: string; max?: number }) {
  return (
    <div className="border-b border-border py-2 last:border-0">
      <div className="mb-0.5 flex items-baseline justify-between text-[12.5px]">
        <span className="font-medium">{label}</span>
        <span className="font-mono font-semibold" style={{ color: scoreColor(score, max) }}>
          {score}/{max}
        </span>
      </div>
      <p className="text-[11.5px] leading-relaxed text-text-muted">{assessment}</p>
    </div>
  );
}

const PRIORITY_STYLES: Record<ImprovementPriority, string> = {
  P0: "bg-negative/15 text-negative",
  P1: "bg-orange/15 text-orange",
  P2: "bg-amber/15 text-amber",
  P3: "bg-card-soft text-text-muted",
};

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
  const audienceFitRow =
    audience === "batch1" ? result.audienceFit.practitioners : result.audienceFit.leadership;
  const audienceLabel = audience === "batch1" ? "Practitioners" : "Leadership";

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="max-w-[70%]">
          <p className="text-[13px] leading-relaxed">{result.verdict}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="font-serif text-[28px] font-bold leading-none">{result.total}%</div>
          <div className="mt-0.5 text-[11px] font-semibold text-text-muted">{result.classification}</div>
          <div className="mt-1 font-mono text-[9.5px] uppercase tracking-wide text-text-faint">
            {result.model}
          </div>
        </div>
      </div>

      {result.criticalFailures.length > 0 ? (
        <div className="mb-4 rounded-lg border border-negative bg-negative/10 p-3">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-negative">
            Critical failures flagged
          </div>
          <Bullets items={result.criticalFailures} />
        </div>
      ) : (
        <div className="mb-4 rounded-lg bg-card-soft px-3 py-2 text-[11.5px] text-text-muted">
          No P0 issues identified.
        </div>
      )}

      <SectionLabel>Category scores</SectionLabel>
      <div className="space-y-3">
        {result.categories.map((c) => {
          const hasAudienceSplit = c.practitionersScore !== null && c.leadershipScore !== null;
          return (
            <div key={c.key}>
              <div className="mb-1 flex items-baseline justify-between text-[13px]">
                <span>
                  {c.label}{" "}
                  <span className="font-mono text-[10px] text-text-faint">
                    {Math.round(c.weight * 100)}% wt
                  </span>
                </span>
                <span className="font-semibold">
                  {c.score === null ? "N/A" : `${c.score}/5`}
                  {hasAudienceSplit && (
                    <span className="ml-1 font-normal text-text-faint">(Combined)</span>
                  )}
                </span>
              </div>
              {hasAudienceSplit && (
                <div className="mb-1 text-[11px] text-text-muted">
                  Practitioners {c.practitionersScore}/5 &middot; Leadership {c.leadershipScore}/5 (Section 7.1)
                </div>
              )}
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
              <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">{c.justification}</p>
            </div>
          );
        })}
      </div>

      <SectionLabel>Audience fit</SectionLabel>
      <ScoreAssessmentRow
        label="Practitioners"
        score={result.audienceFit.practitioners.score}
        assessment={result.audienceFit.practitioners.assessment}
      />
      <ScoreAssessmentRow
        label="Leadership"
        score={result.audienceFit.leadership.score}
        assessment={result.audienceFit.leadership.assessment}
      />
      <ScoreAssessmentRow
        label={`Combined · ${result.audienceFit.combined.classification}`}
        score={result.audienceFit.combined.score}
        assessment={result.audienceFit.combined.assessment}
      />

      <SectionLabel>Reader outcome</SectionLabel>
      <ScoreAssessmentRow
        label="Industry awareness"
        score={result.readerOutcome.industryAwareness.score}
        assessment={result.readerOutcome.industryAwareness.assessment}
      />
      <ScoreAssessmentRow
        label="Upskilling"
        score={result.readerOutcome.upskilling.score}
        assessment={result.readerOutcome.upskilling.assessment}
      />
      <ScoreAssessmentRow
        label="Practical experimentation"
        score={result.readerOutcome.practicalExperimentation.score}
        assessment={result.readerOutcome.practicalExperimentation.assessment}
      />

      <SectionLabel>Story-by-story analysis</SectionLabel>
      <div className="space-y-3">
        {result.storyByStory.map((s, i) => (
          <div key={i} className="rounded-lg border border-border bg-card-soft p-3">
            <div className="mb-1 flex items-start justify-between gap-3">
              <div className="text-[13px] font-semibold">{s.title}</div>
              <div
                className="flex-shrink-0 font-mono text-[12px] font-semibold"
                style={{ color: scoreColor(s.storyQualityScore, 100) }}
              >
                {s.storyQualityScore}/100
              </div>
            </div>
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              <span className="rounded bg-card px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-text-muted">
                {s.contentType}
              </span>
              <span className="rounded bg-card px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-text-muted">
                {s.primaryAudience}
              </span>
              <span className="rounded bg-card px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-text-muted">
                Curation necessity {s.curationNecessity}/10
              </span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-text-muted">
              <span className="font-semibold text-ink">Why selected: </span>
              {s.whySelected}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
              <span className="font-semibold text-ink">What was added: </span>
              {s.whatMarketingMonkAdded}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
              <span className="font-semibold text-ink">Reader learns: </span>
              {s.whatReaderLearns}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-text-muted">
              <span className="font-semibold text-ink">Practical opportunity: </span>
              {s.practicalOpportunity}
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-negative">
              <span className="font-semibold">Main weakness: </span>
              {s.mainWeakness}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <SectionLabel>What worked</SectionLabel>
          <Bullets items={result.whatWorked} />
        </div>
        <div>
          <SectionLabel>What didn&apos;t work</SectionLabel>
          <Bullets items={result.whatDidntWork} />
        </div>
      </div>

      <SectionLabel>Biggest missed opportunity</SectionLabel>
      <p className="text-[12.5px] leading-relaxed text-text-muted">{result.biggestMissedOpportunity}</p>

      <SectionLabel>{audienceLabel} feedback</SectionLabel>
      <ScoreAssessmentRow label={`${audienceLabel} audience fit`} score={audienceFitRow.score} assessment={audienceFitRow.assessment} />
      <p className="mt-2 text-[12.5px] leading-relaxed">{feedback.overallFeedback}</p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-positive">
            What we&apos;re doing right
          </div>
          <Bullets items={feedback.whatWereDoingRight} />
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-negative">
            What we need to work on
          </div>
          <Bullets items={feedback.whatWeNeedToWorkOn} />
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
          What should be added
        </div>
        <Bullets items={feedback.whatShouldBeAdded} />
      </div>
      <div className="mt-3 rounded-lg bg-card-soft p-3 text-[12.5px] leading-relaxed">
        <span className="font-semibold">{audienceLabel} takeaway: </span>
        {feedback.takeaway}
      </div>

      <SectionLabel>Cross-batch feedback</SectionLabel>
      <div className="mb-2 inline-block rounded bg-orange/15 px-2 py-1 font-mono text-[9.5px] uppercase tracking-wide text-orange">
        {result.crossBatch.audienceBalance}
      </div>
      <p className="text-[12.5px] leading-relaxed text-text-muted">{result.crossBatch.audienceBalanceExplanation}</p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">Shared strengths</div>
          <Bullets items={result.crossBatch.sharedStrengths} />
        </div>
        <div>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">Shared weaknesses</div>
          <Bullets items={result.crossBatch.sharedWeaknesses} />
        </div>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed">
        <span className="font-semibold">Audience conflict: </span>
        {result.crossBatch.audienceConflict}
      </p>
      <p className="mt-2 text-[12.5px] leading-relaxed">
        <span className="font-semibold">Recommended balance: </span>
        {result.crossBatch.recommendedBalance}
      </p>

      <SectionLabel>Recommended improvements</SectionLabel>
      <Bullets items={result.recommendedImprovements} />

      <SectionLabel>Next-edition improvement plan</SectionLabel>
      <div className="space-y-2">
        {result.nextEditionPlan.map((item, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wide ${PRIORITY_STYLES[item.priority]}`}
              >
                {item.priority}
              </span>
              <span className="text-[12.5px] font-semibold">{item.improvement}</span>
              <span className="ml-auto font-mono text-[9.5px] uppercase tracking-wide text-text-faint">
                {item.audience}
              </span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-text-muted">
              <span className="font-semibold text-ink">Why it matters: </span>
              {item.whyItMatters}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-text-muted">
              <span className="font-semibold text-ink">Expected impact: </span>
              {item.expectedImpact}
            </p>
          </div>
        ))}
      </div>

      <SectionLabel>Content opportunities for future editions</SectionLabel>
      <div className="space-y-2">
        {result.contentOpportunities.map((o, i) => (
          <div key={i} className="rounded-lg bg-card-soft p-3">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="text-[12.5px] font-semibold">{o.opportunity}</span>
              <span className="flex-shrink-0 font-mono text-[9.5px] uppercase tracking-wide text-text-faint">
                {o.suggestedTreatment} &middot; {o.bestAudience}
              </span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-text-muted">{o.whyItMatters}</p>
          </div>
        ))}
      </div>

      <SectionLabel>Editorial strengths to preserve</SectionLabel>
      <Bullets items={result.strengthsToPreserve} />

      <SectionLabel>Final feedback summary</SectionLabel>
      <p className="text-[12.5px] leading-relaxed">
        <span className="font-semibold">Biggest strength: </span>
        {result.finalSummary.biggestStrength}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed">
        <span className="font-semibold">Biggest weakness: </span>
        {result.finalSummary.biggestWeakness}
      </p>
      <p className="mt-1.5 text-[12.5px] leading-relaxed">
        <span className="font-semibold">Single most valuable change: </span>
        {result.finalSummary.singleMostValuableChange}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-card-soft p-3">
          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-wide text-text-muted">
            Practitioners summary
          </div>
          <SummaryLine label="Doing right" value={result.finalSummary.practitioners.doingRight} />
          <SummaryLine label="Improve" value={result.finalSummary.practitioners.shouldImprove} />
          <SummaryLine label="Add" value={result.finalSummary.practitioners.shouldAdd} />
          <SummaryLine label="Preserve" value={result.finalSummary.practitioners.shouldPreserve} />
          <SummaryLine label="Highest impact" value={result.finalSummary.practitioners.highestImpactImprovement} />
        </div>
        <div className="rounded-lg bg-card-soft p-3">
          <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-wide text-text-muted">
            Leadership summary
          </div>
          <SummaryLine label="Doing right" value={result.finalSummary.leadership.doingRight} />
          <SummaryLine label="Improve" value={result.finalSummary.leadership.shouldImprove} />
          <SummaryLine label="Add" value={result.finalSummary.leadership.shouldAdd} />
          <SummaryLine label="Preserve" value={result.finalSummary.leadership.shouldPreserve} />
          <SummaryLine label="Highest impact" value={result.finalSummary.leadership.highestImpactImprovement} />
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-card-soft p-3">
        <div className="mb-1.5 font-mono text-[9.5px] uppercase tracking-wide text-text-muted">
          Cross-batch summary
        </div>
        <SummaryLine label="Balanced?" value={result.finalSummary.crossBatch.balanced} />
        <SummaryLine label="Next edition" value={result.finalSummary.crossBatch.nextEditionDifference} />
      </div>
    </div>
  );
}
