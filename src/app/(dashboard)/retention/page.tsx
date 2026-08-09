import { getAllEditions, getPublicationSnapshot, trailingAverages } from "@/lib/data/editions";
import { round2 } from "@/lib/format";
import { StatCard, Card } from "@/components/dashboard/ui";
import { RetentionExplorer, type RetentionRow } from "@/components/dashboard/RetentionExplorer";

export const dynamic = "force-dynamic";

export default async function RetentionPage() {
  const [editions, publication] = await Promise.all([getAllEditions(), getPublicationSnapshot()]);
  const { avgUnsub, avgSpam } = trailingAverages(editions);

  const spikeCount = editions.filter((e) => e.unsubRate > avgUnsub).length;

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3.5">
        <StatCard
          label="Unsub rate, avg"
          value={<span className="text-positive">{round2(avgUnsub)}%</span>}
        />
        <StatCard
          label="Net subscribers"
          value={
            <span className={publication.netSubscribers < 0 ? "text-negative" : "text-positive"}>
              {publication.netSubscribers > 0 ? "+" : ""}
              {publication.netSubscribers.toLocaleString()}
            </span>
          }
        />
        <StatCard label="Spam complaints, avg" value={`${round2(avgSpam)}%`} />
      </div>

      <Card soft className="mb-4">
        <p className="text-[13px] leading-relaxed">
          {publication.netSubscribers < 0
            ? `The list is currently shrinking (${publication.newSubscribers.toLocaleString()} new vs. ${publication.churnedSubscribers.toLocaleString()} churned this window). `
            : `The list is currently growing (${publication.newSubscribers.toLocaleString()} new vs. ${publication.churnedSubscribers.toLocaleString()} churned this window). `}
          {spikeCount > 0
            ? `${spikeCount} of ${editions.length} editions ran an above-average unsubscribe rate this window, flagged in the table below.`
            : "No editions ran an above-average unsubscribe rate this window."}
        </p>
      </Card>

      <RetentionExplorer
        rows={editions.map(
          (e): RetentionRow => ({
            id: e.id,
            subject: e.subject,
            publishedAt: e.publishedAt.toISOString(),
            unsubRate: e.unsubRate,
            aboveAverage: e.unsubRate > avgUnsub,
          }),
        )}
      />
    </div>
  );
}
