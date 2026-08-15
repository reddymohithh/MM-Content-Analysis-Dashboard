/**
 * Beehiiv segments -> Neon cache, synced by the same "Refresh" button as
 * Meta Ads data (src/app/api/ads/refresh/route.ts). Kept separate from
 * sync.ts (editions/publication snapshots) since it's a different table
 * with a different trigger surface (ads dashboard, not the content one).
 */
import { db } from "@/lib/db";
import { beehiivSegmentsCache } from "@/lib/db/schema";
import { listSegments } from "./client";

export async function syncBeehiivSegments(): Promise<{ segments: number }> {
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!publicationId) {
    throw new Error("BEEHIIV_PUBLICATION_ID is not set.");
  }

  const page = await listSegments(publicationId);

  for (const seg of page.data) {
    await db
      .insert(beehiivSegmentsCache)
      .values({
        id: seg.id,
        name: seg.name,
        active: seg.active,
        totalResults: seg.total_results,
        openRate: seg.stats?.open_rate ?? null,
        clickThroughRate: seg.stats?.clickthrough_rate ?? null,
        lastCalculated: seg.last_calculated ? new Date(seg.last_calculated * 1000) : null,
      })
      .onConflictDoUpdate({
        target: beehiivSegmentsCache.id,
        set: {
          name: seg.name,
          active: seg.active,
          totalResults: seg.total_results,
          openRate: seg.stats?.open_rate ?? null,
          clickThroughRate: seg.stats?.clickthrough_rate ?? null,
          lastCalculated: seg.last_calculated ? new Date(seg.last_calculated * 1000) : null,
          syncedAt: new Date(),
        },
      });
  }

  return { segments: page.data.length };
}
