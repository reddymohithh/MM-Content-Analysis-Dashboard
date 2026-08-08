import Link from "next/link";
import { getAllEditions, trailingAverages } from "@/lib/data/editions";
import { computeQualityScore } from "@/lib/scoring/quality-score";
import { usDate } from "@/lib/format";
import { DataTable } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function EditionsListPage() {
  const editions = await getAllEditions();
  const { avgCtr, avgUnsub } = trailingAverages(editions);

  return (
    <div>
      <DataTable
        columns={[
          { label: "Date" },
          { label: "Subject" },
          { label: "Open", align: "right" },
          { label: "CTR", align: "right" },
          { label: "Quality", align: "right" },
        ]}
      >
        {editions.map((e) => {
          const quality = computeQualityScore({
            id: e.id,
            ctrOverall: e.ctrOverall,
            unsubRate: e.unsubRate,
            trailingAvgCtr: avgCtr,
            trailingAvgUnsub: avgUnsub,
            poll: e.poll,
            voice: e.voice,
          });
          return (
            <tr key={e.id} className="border-t border-hairline">
              <td className="p-0">
                <Link
                  href={`/editions/${e.id}`}
                  className="flex whitespace-nowrap px-3.5 py-2.5 font-mono text-[12px] text-text-muted no-underline"
                >
                  {usDate(e.publishedAt, true)}
                </Link>
              </td>
              <td className="p-0">
                <Link
                  href={`/editions/${e.id}`}
                  className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
                >
                  {e.subject}
                </Link>
              </td>
              <td className="p-0">
                <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[13px] text-ink no-underline">
                  {e.openRate}%
                </Link>
              </td>
              <td className="p-0">
                <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[13px] text-ink no-underline">
                  {e.ctrOverall}%
                </Link>
              </td>
              <td className="p-0">
                <Link
                  href={`/editions/${e.id}`}
                  className="block px-3.5 py-2.5 text-right text-[13px] font-bold text-orange no-underline"
                >
                  {quality.total}%
                </Link>
              </td>
            </tr>
          );
        })}
      </DataTable>
    </div>
  );
}
