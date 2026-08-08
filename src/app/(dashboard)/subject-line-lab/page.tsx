import { getAllEditions } from "@/lib/data/editions";
import { computeHookTypeAverages, type InsightEdition } from "@/lib/scoring/insights";
import { HOOK_TYPE_LABELS } from "@/lib/scoring/subject-line";
import { Card } from "@/components/dashboard/ui";
import {
  SubjectLineLabExplorer,
  type SubjectLineRow,
} from "@/components/dashboard/SubjectLineLabExplorer";

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

  const rows: SubjectLineRow[] = editions.map((e) => ({
    id: e.id,
    subject: e.subject,
    hookType: e.hookType,
    hookLabel: HOOK_TYPE_LABELS[e.hookType],
    charLength: e.charLength,
    hasNumber: e.hasNumber,
    openRate: e.openRate,
  }));

  const hookTypeOptions = Object.entries(HOOK_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

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

      <SubjectLineLabExplorer rows={rows} hookTypes={hookTypeOptions} />
    </div>
  );
}
