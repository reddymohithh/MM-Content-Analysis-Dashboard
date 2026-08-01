import Link from "next/link";
import { getAllEditions } from "@/lib/data/editions";
import { computeHookTypeAverages, type InsightEdition } from "@/lib/scoring/insights";
import { HOOK_TYPE_LABELS } from "@/lib/scoring/subject-line";
import { PageTitle, Card, Eyebrow, DataTable } from "@/components/dashboard/ui";

export default async function SubjectLineLabPage() {
  const editions = await getAllEditions();

  const insightEditions: InsightEdition[] = editions.map((e) => ({
    id: e.id,
    subject: e.subject,
    openRate: e.openRate,
    ctrOverall: e.ctrOverall,
    unsubRate: e.unsubRate,
    publishedAt: e.publishedAt,
    hookType: e.hookType,
    qualityTotal: 0,
    qualityWeakestName: "",
  }));

  const hookAverages = computeHookTypeAverages(insightEditions);
  const maxOpen = Math.max(...hookAverages.map((h) => h.avgOpenRate), 1);

  return (
    <div>
      <PageTitle
        title="Subject Line Lab"
        caption="Every real subject line in the trailing window, tagged by hook type, length, and number presence."
      />

      <Card className="mb-4">
        <Eyebrow>Average open rate by hook type</Eyebrow>
        <div className="space-y-2">
          {hookAverages.map((h) => (
            <div key={h.hookType} className="flex items-center gap-3">
              <div className="w-[150px] flex-shrink-0 truncate text-[12.5px]">
                {h.label} <span className="text-text-faint">({h.count})</span>
              </div>
              <div className="h-2 flex-1 rounded-full bg-border">
                <div
                  className="h-2 rounded-full bg-amber"
                  style={{ width: `${(h.avgOpenRate / maxOpen) * 100}%` }}
                />
              </div>
              <div className="w-12 flex-shrink-0 text-right font-mono text-[12px]">
                {h.avgOpenRate}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      <DataTable
        columns={[
          { label: "Subject line" },
          { label: "Hook type" },
          { label: "Length", align: "right" },
          { label: "Number", align: "right" },
          { label: "Open", align: "right" },
        ]}
      >
        {editions.map((e) => (
          <tr key={e.id} className="border-t border-hairline">
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline">
                {e.subject}
              </Link>
            </td>
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-[12.5px] text-text-muted no-underline">
                {HOOK_TYPE_LABELS[e.hookType]}
              </Link>
            </td>
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right font-mono text-[12px] text-text-muted no-underline">
                {e.charLength} char
              </Link>
            </td>
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[12.5px] text-text-muted no-underline">
                {e.hasNumber ? "Yes" : "No"}
              </Link>
            </td>
            <td className="p-0">
              <Link href={`/editions/${e.id}`} className="block px-3.5 py-2.5 text-right text-[13px] text-ink no-underline">
                {e.openRate}%
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
