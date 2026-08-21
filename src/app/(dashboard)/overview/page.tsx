import {
  getAllEditions,
  getPublicationSnapshot,
  getContentQualityTotals,
  trailingAverages,
} from "@/lib/data/editions";
import { computeQualityScore } from "@/lib/scoring/quality-score";
import {
  generateOpenRateTips,
  generateCtrTips,
  generateAudienceFeedback,
  type InsightEdition,
} from "@/lib/scoring/insights";
import { StatCard, GradientStatCard, Card, Eyebrow } from "@/components/dashboard/ui";
import { OverviewChart } from "@/components/dashboard/OverviewChart";

// Reads live from the database on every request rather than being
// statically prerendered at build time — Vercel's build step shouldn't
// depend on database reachability, and edition data changes independently
// of deploys anyway.
export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const [editions, publication, contentQualityTotals] = await Promise.all([
    getAllEditions(),
    getPublicationSnapshot(),
    getContentQualityTotals(),
  ]);
  const { avgCtr, avgUnsub } = trailingAverages(editions);

  const scoredTotals = editions
    .map((e) => contentQualityTotals.get(e.id))
    .filter((t): t is number => t !== undefined);
  const avgContentQuality = scoredTotals.length
    ? Math.round(scoredTotals.reduce((s, t) => s + t, 0) / scoredTotals.length)
    : null;

  const scored = editions.map((e) => ({
    edition: e,
    quality: computeQualityScore({
      id: e.id,
      ctrOverall: e.ctrOverall,
      unsubRate: e.unsubRate,
      trailingAvgCtr: avgCtr,
      trailingAvgUnsub: avgUnsub,
      poll: e.poll,
      voice: e.voice,
    }),
  }));

  const avgOpenRate = editions.length
    ? Math.round((editions.reduce((s, e) => s + e.openRate, 0) / editions.length) * 100) / 100
    : 0;

  const insightEditions: InsightEdition[] = scored.map(({ edition, quality }) => {
    const weakest = quality.components.reduce((a, b) =>
      b.score * b.weight < a.score * a.weight ? b : a,
    );
    return {
      id: edition.id,
      subject: edition.subject,
      openRate: edition.openRate,
      ctrOverall: edition.ctrOverall,
      unsubRate: edition.unsubRate,
      publishedAt: edition.publishedAt,
      hookType: edition.hookType,
      qualityTotal: quality.total,
      qualityWeakestName: weakest.name,
    };
  });

  const openRateTips = generateOpenRateTips(insightEditions);
  const ctrTips = generateCtrTips(insightEditions);
  const batch1 = generateAudienceFeedback(insightEditions, "batch1");
  const batch2 = generateAudienceFeedback(insightEditions, "batch2");

  return (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-3.5">
        <StatCard label="Subscribers" value={publication.activeSubscribers.toLocaleString()} />
        <StatCard label="Open rate" value={`${avgOpenRate}%`} />
        <StatCard label="CTR, overall" value={`${Math.round(avgCtr * 100) / 100}%`} />
        <GradientStatCard
          label="Content quality"
          value={avgContentQuality !== null ? `${avgContentQuality}%` : "N/A"}
          sub={
            scoredTotals.length > 0 && scoredTotals.length < editions.length
              ? `${scoredTotals.length} of ${editions.length} scored`
              : scoredTotals.length === 0
                ? "No editions scored yet"
                : undefined
          }
        />
      </div>

      <div className="mb-4">
        <OverviewChart
          editions={scored.map(({ edition }) => ({
            id: edition.id,
            subject: edition.subject,
            publishedAt: edition.publishedAt.toISOString(),
            openRate: edition.openRate,
            ctrOverall: edition.ctrOverall,
          }))}
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3.5">
        <Card soft>
          <Eyebrow>Tips for improving open rate</Eyebrow>
          <ul className="list-disc space-y-1.5 pl-4 text-[12.5px] leading-relaxed">
            {openRateTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Card>
        <Card soft>
          <Eyebrow>Tips for improving CTR</Eyebrow>
          <ul className="list-disc space-y-1.5 pl-4 text-[12.5px] leading-relaxed">
            {ctrTips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        <Card>
          <Eyebrow>Batch 1: practitioners</Eyebrow>
          <p className="mb-2 text-[13px] leading-relaxed">{batch1.narrative}</p>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
            Action steps
          </div>
          <ul className="list-disc space-y-1 pl-4 text-[12px] leading-relaxed">
            {batch1.actionSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </Card>
        <Card>
          <Eyebrow>Batch 2: leadership</Eyebrow>
          <p className="mb-2 text-[13px] leading-relaxed">{batch2.narrative}</p>
          <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
            Action steps
          </div>
          <ul className="list-disc space-y-1 pl-4 text-[12px] leading-relaxed">
            {batch2.actionSteps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
