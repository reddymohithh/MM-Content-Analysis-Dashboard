import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllEditions,
  getEditionById,
  getContentQualityScore,
  trailingAverages,
  canFlag,
} from "@/lib/data/editions";
import { computeQualityScore } from "@/lib/scoring/quality-score";
import { SAMPLE_CONTENT_QUALITY } from "@/lib/scoring/sample-content-quality";
import { usDate } from "@/lib/format";
import { StatCard, GradientStatCard, Card, Eyebrow, EmptyState } from "@/components/dashboard/ui";
import { PollChart } from "@/components/dashboard/PollChart";
import { QualityDonuts } from "@/components/dashboard/QualityDonuts";
import { AudienceLensButtons } from "@/components/dashboard/AudienceLensButtons";
import { ContentQualityPanel } from "@/components/dashboard/ContentQualityPanel";

export const dynamic = "force-dynamic";

function SampleBadge() {
  return (
    <div className="mb-3 inline-block rounded bg-orange/15 px-2 py-1 font-mono text-[9.5px] font-bold uppercase tracking-wide text-orange">
      Sample preview, not real data
    </div>
  );
}

export default async function EditionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ audience?: string }>;
}) {
  const { id } = await params;
  const { audience: audienceParam } = await searchParams;
  const audience: "batch1" | "batch2" = audienceParam === "batch2" ? "batch2" : "batch1";

  const [edition, allEditions, contentQuality] = await Promise.all([
    getEditionById(id),
    getAllEditions(),
    getContentQualityScore(id),
  ]);
  if (!edition) notFound();

  const { avgCtr, avgUnsub } = trailingAverages(allEditions);
  const quality = computeQualityScore({
    id: edition.id,
    ctrOverall: edition.ctrOverall,
    unsubRate: edition.unsubRate,
    trailingAvgCtr: avgCtr,
    trailingAvgUnsub: avgUnsub,
    poll: edition.poll,
    voice: edition.voice,
    audience,
  });
  const flaggable = canFlag(edition.publishedAt);

  const editorialLinks = edition.topLinks;

  const notices: string[] = [];
  if (!quality.voiceComputed) {
    notices.push(
      "Writing and voice compliance scoring is a placeholder. It assumes clean copy until real text analysis is wired up.",
    );
  }
  if (edition.poll && !edition.poll.exact && edition.poll.note) {
    notices.push(edition.poll.note);
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <Link href="/editions" className="mb-3 inline-block text-[12.5px] text-text-muted no-underline">
        ← Back to editions
      </Link>

      <div className="mb-3 font-mono text-[11.5px] uppercase tracking-wide text-text-muted">
        {usDate(edition.publishedAt, true)} ·{" "}
        {edition.publishedAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
          timeZoneName: "short",
        })}
      </div>

      <div className="mb-4 rounded-xl border border-border bg-card p-5">
        <h1 className="font-serif text-[22px] font-semibold leading-snug">{edition.subject}</h1>
        <p className="mt-1.5 text-[13.5px] text-text-muted">{edition.preview}</p>
      </div>

      {!flaggable && (
        <div className="mb-4 rounded-lg border border-orange bg-warning-bg px-4 py-3 text-[12.5px]">
          This edition published less than 24 hours ago. Performance flagging is suppressed
          until a full day of data has come in.
        </div>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3.5">
        <div className="grid grid-cols-2 gap-3.5">
          <StatCard label="Open rate" value={`${edition.openRate}%`} />
          <StatCard label="CTR, overall" value={`${edition.ctrOverall}%`} />
          <StatCard label="Unsub rate" value={`${edition.unsubRate}%`} />
          <GradientStatCard
            label="Content quality score"
            value={contentQuality ? `${contentQuality.total}%` : "N/A"}
          />
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <PollChart poll={edition.poll} />
        </div>
      </div>

      <Card className="mb-4">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-wide text-heading-soft">
          Why this edition scored {quality.total}% engagement
        </div>
        <QualityDonuts result={quality} />
      </Card>

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="font-mono text-[11px] uppercase tracking-wide text-heading-soft">
            Content quality (editorial)
            {contentQuality && <span className="ml-2 text-heading-soft">· {contentQuality.total}%</span>}
          </div>
          <AudienceLensButtons />
        </div>
        {contentQuality ? (
          <ContentQualityPanel result={contentQuality} audience={audience} />
        ) : (
          <div>
            <EmptyState>
              Not analyzed yet. Click &quot;Analyze content&quot; in the navbar to run the
              editorial content-quality checklist against this edition (requires local API
              keys).
            </EmptyState>
            <div className="mt-4 rounded-lg border-2 border-dashed border-orange/40 bg-card-soft p-4">
              <SampleBadge />
              <ContentQualityPanel result={SAMPLE_CONTENT_QUALITY} audience={audience} />
            </div>
          </div>
        )}
      </Card>

      <Card soft className="mb-4">
        <Eyebrow>Tips and suggestions</Eyebrow>
        {contentQuality ? (
          <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed">
            {contentQuality[audience].whatWeNeedToWorkOn.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        ) : (
          <div>
            <EmptyState>
              Not analyzed yet. Click &quot;Analyze content&quot; in the navbar to generate
              tips for this edition (requires local API keys).
            </EmptyState>
            <div className="mt-4 rounded-lg border-2 border-dashed border-orange/40 bg-card p-4">
              <SampleBadge />
              <ul className="list-disc space-y-1.5 pl-4 text-[13px] leading-relaxed">
                {SAMPLE_CONTENT_QUALITY[audience].whatWeNeedToWorkOn.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3.5">
        <div className="overflow-hidden rounded-[10px] border border-border bg-card">
          <div className="border-b border-border bg-card-soft px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
            Top links clicked
          </div>
          {editorialLinks.length === 0 ? (
            <EmptyState>No link clicks recorded.</EmptyState>
          ) : (
            editorialLinks.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border-t border-hairline px-3.5 py-2 text-[12.5px] no-underline first:border-t-0"
              >
                <span className="truncate pr-3">{l.label}</span>
                <span className="flex-shrink-0 font-mono text-text-muted">{l.clicks}</span>
              </a>
            ))
          )}
        </div>

        <div className="flex flex-col gap-3.5">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
              Comments
            </div>
            {edition.comments.length === 0 ? (
              <EmptyState>No comments.</EmptyState>
            ) : (
              <div className="max-h-[100px] space-y-1.5 overflow-y-auto">
                {edition.comments.map((c) => (
                  <div key={c.id} className="rounded-md bg-card-soft px-2.5 py-1.5 text-[12px]">
                    {c.body}
                  </div>
                ))}
              </div>
            )}
          </div>

          {notices.length > 0 && (
            <div className="rounded-xl border border-orange bg-warning-bg p-4">
              <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wide text-heading-soft">
                Notices
              </div>
              <ul className="list-disc space-y-1 pl-4 text-[12px] leading-relaxed">
                {notices.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
