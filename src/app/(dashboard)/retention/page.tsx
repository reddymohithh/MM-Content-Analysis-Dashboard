import Link from "next/link";
import { getAllEditions, getPublicationSnapshot, trailingAverages } from "@/lib/data/editions";
import { usDate, round2 } from "@/lib/format";
import { PageTitle, StatCard, Card, DataTable } from "@/components/dashboard/ui";

export default async function RetentionPage() {
  const [editions, publication] = await Promise.all([getAllEditions(), getPublicationSnapshot()]);
  const { avgUnsub, avgSpam } = trailingAverages(editions);

  const spikeCount = editions.filter((e) => e.unsubRate > avgUnsub).length;

  return (
    <div>
      <PageTitle
        title="Retention"
        caption="Unsubscribe and spam trend across the trailing window, flagged against the current net-subscriber movement."
      />

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

      <DataTable
        columns={[
          { label: "Date" },
          { label: "Subject" },
          { label: "Unsub", align: "right" },
          { label: "Flag", align: "right" },
        ]}
      >
        {editions.map((e) => {
          const above = e.unsubRate > avgUnsub;
          return (
            <tr key={e.id} className="border-t border-hairline">
              <td className="p-0">
                <Link href={`/editions/${e.id}`} className="block whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-text-muted no-underline">
                  {usDate(e.publishedAt, true)}
                </Link>
              </td>
              <td className="p-0">
                <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline">
                  {e.subject}
                </Link>
              </td>
              <td className="p-0">
                <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[13px] text-ink no-underline">
                  {e.unsubRate}%
                </Link>
              </td>
              <td className="p-0">
                <Link
                  href={`/editions/${e.id}`}
                  className={`block px-3.5 py-2.5 text-right text-[12.5px] font-medium no-underline ${
                    above ? "text-negative" : "text-positive"
                  }`}
                >
                  {above ? "Above average" : "Normal"}
                </Link>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
