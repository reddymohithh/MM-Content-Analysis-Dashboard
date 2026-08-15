/**
 * Meta Ads -> Neon sync, triggered by the ads dashboard navbar's "Refresh"
 * button (src/app/api/ads/refresh/route.ts) — same one-implementation
 * pattern as src/lib/beehiiv/sync.ts.
 */
import { db } from "@/lib/db";
import { adCampaigns, adSets, metaAds, adMetaTotals } from "@/lib/db/schema";
import { listCampaigns, listAdSets, listAds, getAccountTotals } from "./client";

export interface MetaAdsSyncResult {
  campaigns: number;
  adSets: number;
  ads: number;
}

export async function syncMetaAdsData(): Promise<MetaAdsSyncResult> {
  const [campaigns, sets, ads, totals] = await Promise.all([
    listCampaigns(),
    listAdSets(),
    listAds(),
    getAccountTotals(),
  ]);

  await db
    .insert(adMetaTotals)
    .values({ id: "current", ...totals })
    .onConflictDoUpdate({
      target: adMetaTotals.id,
      set: { ...totals, capturedAt: new Date() },
    });

  for (const c of campaigns) {
    await db
      .insert(adCampaigns)
      .values({
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective ?? null,
        createdTime: new Date(c.created_time),
      })
      .onConflictDoUpdate({
        target: adCampaigns.id,
        set: {
          name: c.name,
          status: c.status,
          objective: c.objective ?? null,
          syncedAt: new Date(),
        },
      });
  }

  for (const s of sets) {
    await db
      .insert(adSets)
      .values({
        id: s.id,
        campaignId: s.campaign_id,
        name: s.name,
        status: s.status,
        createdTime: new Date(s.created_time),
      })
      .onConflictDoUpdate({
        target: adSets.id,
        set: { name: s.name, status: s.status, syncedAt: new Date() },
      });
  }

  for (const a of ads) {
    await db
      .insert(metaAds)
      .values({
        id: a.id,
        adSetId: a.adset_id,
        campaignId: a.campaign_id,
        name: a.name,
        status: a.status,
        createdTime: new Date(a.created_time),
      })
      .onConflictDoUpdate({
        target: metaAds.id,
        set: { name: a.name, status: a.status, syncedAt: new Date() },
      });
  }

  return { campaigns: campaigns.length, adSets: sets.length, ads: ads.length };
}
