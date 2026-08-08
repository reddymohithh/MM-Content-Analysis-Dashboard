import Link from "next/link";
import { getAllEditions } from "@/lib/data/editions";
import { computeHookTypeAverages, type InsightEdition } from "@/lib/scoring/insights";
import { HOOK_TYPE_LABELS } from "@/lib/scoring/subject-line";
import { Card, DataTable } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

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
      <Card className="mb-4">
        <h2 className="mb-4 font-serif text-[18px] font-semibold">
          Average open rate by hook type
        </h2>
        <div className="space-y-4">
          {hookAverages.map((h) => (
            <div key={h.hookType}>
              <div className="mb-1.5 flex items-baseline justify-between text-[13.5px]">
                <span>
                  {h.label} <span className="text-text-faint">({h.count})</span>
                </span>
                <span className="font-semibold">{h.avgOpenRate}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-border">
                <div
                  className="h-2 rounded-full bg-amber"
                  style={{ width: `${(h.avgOpenRate / maxOpen) * 100}%` }}
                />
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
              <Link
                href={`/editions/${e.id}`}
                className="block px-3.5 py-2.5 text-[13px] font-semibold text-ink no-underline"
              >
                {e.subject}
              </Link>
            </td>
            <td className="px-3.5 py-2.5 text-[12.5px] text-text-muted">
              {HOOK_TYPE_LABELS[e.hookType]}
            </td>
            <td className="px-3.5 py-2.5 text-right font-mono text-[12px] text-text-muted">
              {e.charLength} char
            </td>
            <td className="px-3.5 py-2.5 text-right text-[12.5px] text-text-muted">
              {e.hasNumber ? "Yes" : "No"}
            </td>
            <td className="px-3.5 py-2.5 text-right text-[13px] text-ink">{e.openRate}%</td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
