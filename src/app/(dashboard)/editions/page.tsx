import { getAllEditions, trailingAverages } from "@/lib/data/editions";
import { computeQualityScore } from "@/lib/scoring/quality-score";
import { EditionsExplorer, type EditionRow } from "@/components/dashboard/EditionsExplorer";

export const dynamic = "force-dynamic";

export default async function EditionsListPage() {
  const editions = await getAllEditions();
  const { avgCtr, avgUnsub } = trailingAverages(editions);

  const rows: EditionRow[] = editions.map((e) => {
    const quality = computeQualityScore({
      id: e.id,
      ctrOverall: e.ctrOverall,
      unsubRate: e.unsubRate,
      trailingAvgCtr: avgCtr,
      trailingAvgUnsub: avgUnsub,
      poll: e.poll,
      voice: e.voice,
    });
    return {
      id: e.id,
      subject: e.subject,
      publishedAt: e.publishedAt.toISOString(),
      openRate: e.openRate,
      ctrOverall: e.ctrOverall,
      quality: quality.total,
    };
  });

  return (
    <div>
      <EditionsExplorer editions={rows} />
    </div>
  );
}
