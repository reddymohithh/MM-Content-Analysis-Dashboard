/**
 * Meta Ads -> Neon sync, triggered by the ads dashboard navbar's "Refresh"
 * button (src/app/api/ads/refresh/route.ts) — same one-implementation
 * pattern as src/lib/beehiiv/sync.ts.
 */
import { db } from "@/lib/db";
import { adCampaigns, adSets, metaAds, adDailyMetrics, adDailyPlatformMetrics } from "@/lib/db/schema";
import {
  listCampaigns,
  listAdSets,
  listAds,
  getAdDailyMetrics,
  getAdDailyPlatformMetrics,
  placementStrategyOf,
  bidStrategyLabel,
  budgetRupeesOf,
  genderLabelOf,
  locationsOf,
  interestsOf,
} from "./client";

export interface MetaAdsSyncResult {
  campaigns: number;
  adSets: number;
  ads: number;
  dailyMetrics: number;
  dailyPlatformMetrics: number;
}

export async function syncMetaAdsData(): Promise<MetaAdsSyncResult> {
  const [campaigns, sets, ads, daily, dailyPlatform] = await Promise.all([
    listCampaigns(),
    listAdSets(),
    listAds(),
    getAdDailyMetrics(),
    getAdDailyPlatformMetrics(),
  ]);

  for (const c of campaigns) {
    const detail = {
      bidStrategy: bidStrategyLabel(c.bid_strategy),
      dailyBudget: budgetRupeesOf(c.daily_budget),
      lifetimeBudget: budgetRupeesOf(c.lifetime_budget),
    };
    await db
      .insert(adCampaigns)
      .values({
        id: c.id,
        name: c.name,
        status: c.status,
        objective: c.objective ?? null,
        createdTime: new Date(c.created_time),
        ...detail,
      })
      .onConflictDoUpdate({
        target: adCampaigns.id,
        set: {
          name: c.name,
          status: c.status,
          objective: c.objective ?? null,
          syncedAt: new Date(),
          ...detail,
        },
      });
  }

  for (const s of sets) {
    const placementStrategy = placementStrategyOf(s);
    const detail = {
      bidStrategy: bidStrategyLabel(s.bid_strategy),
      dailyBudget: budgetRupeesOf(s.daily_budget),
      lifetimeBudget: budgetRupeesOf(s.lifetime_budget),
      optimizationGoal: s.optimization_goal ?? null,
      ageMin: s.targeting?.age_min ?? null,
      ageMax: s.targeting?.age_max ?? null,
      genderLabel: genderLabelOf(s.targeting?.genders),
      locations: locationsOf(s.targeting?.geo_locations),
      interests: interestsOf(s.targeting?.flexible_spec),
      platforms: s.targeting?.publisher_platforms ?? null,
    };
    await db
      .insert(adSets)
      .values({
        id: s.id,
        campaignId: s.campaign_id,
        name: s.name,
        status: s.status,
        createdTime: new Date(s.created_time),
        placementStrategy,
        ...detail,
      })
      .onConflictDoUpdate({
        target: adSets.id,
        set: { name: s.name, status: s.status, placementStrategy, syncedAt: new Date(), ...detail },
      });
  }

  for (const a of ads) {
    const creative = {
      creativeTitle: a.creative?.title ?? null,
      creativeBody: a.creative?.body ?? null,
      creativeImageUrl: a.creative?.image_url ?? null,
      creativeThumbnailUrl: a.creative?.thumbnail_url ?? null,
      creativeVideoId: a.creative?.video_id ?? null,
      creativeCallToAction: a.creative?.call_to_action_type ?? null,
    };
    await db
      .insert(metaAds)
      .values({
        id: a.id,
        adSetId: a.adset_id,
        campaignId: a.campaign_id,
        name: a.name,
        status: a.status,
        createdTime: new Date(a.created_time),
        ...creative,
      })
      .onConflictDoUpdate({
        target: metaAds.id,
        set: { name: a.name, status: a.status, syncedAt: new Date(), ...creative },
      });
  }

  const validAdIds = new Set(ads.map((a) => a.id));
  for (const d of daily) {
    if (!validAdIds.has(d.adId)) continue; // insights can lag entity list by a beat
    await db
      .insert(adDailyMetrics)
      .values({
        id: `${d.adId}:${d.date}`,
        adId: d.adId,
        date: d.date,
        spend: d.spend,
        leads: d.leads,
        impressions: d.impressions,
        linkClicks: d.linkClicks,
        frequency: d.frequency,
      })
      .onConflictDoUpdate({
        target: adDailyMetrics.id,
        set: {
          spend: d.spend,
          leads: d.leads,
          impressions: d.impressions,
          linkClicks: d.linkClicks,
          frequency: d.frequency,
          syncedAt: new Date(),
        },
      });
  }

  for (const d of dailyPlatform) {
    if (!validAdIds.has(d.adId)) continue;
    await db
      .insert(adDailyPlatformMetrics)
      .values({
        id: `${d.adId}:${d.date}:${d.platform}`,
        adId: d.adId,
        date: d.date,
        platform: d.platform,
        spend: d.spend,
        leads: d.leads,
        impressions: d.impressions,
        linkClicks: d.linkClicks,
      })
      .onConflictDoUpdate({
        target: adDailyPlatformMetrics.id,
        set: {
          spend: d.spend,
          leads: d.leads,
          impressions: d.impressions,
          linkClicks: d.linkClicks,
          syncedAt: new Date(),
        },
      });
  }

  return {
    campaigns: campaigns.length,
    adSets: sets.length,
    ads: ads.length,
    dailyMetrics: daily.length,
    dailyPlatformMetrics: dailyPlatform.length,
  };
}
