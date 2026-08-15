import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { adCampaigns, beehiivSegmentsCache, adMappings } from "@/lib/db/schema";

export interface AdCreative {
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  videoId: string | null;
  callToAction: string | null;
}

export interface CampaignWithChildren {
  id: string;
  name: string;
  status: string;
  objective: string | null;
  createdTime: Date;
  adSets: { id: string; name: string; status: string }[];
  ads: { id: string; adSetId: string; name: string; status: string; creative: AdCreative }[];
}

export async function getCampaignsWithChildren(): Promise<CampaignWithChildren[]> {
  const campaigns = await db.query.adCampaigns.findMany({
    orderBy: [desc(adCampaigns.createdTime)],
    with: { adSets: true, ads: true },
  });
  return campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    objective: c.objective,
    createdTime: c.createdTime,
    adSets: c.adSets.map((s) => ({ id: s.id, name: s.name, status: s.status })),
    ads: c.ads.map((a) => ({
      id: a.id,
      adSetId: a.adSetId,
      name: a.name,
      status: a.status,
      creative: {
        title: a.creativeTitle,
        body: a.creativeBody,
        imageUrl: a.creativeImageUrl,
        thumbnailUrl: a.creativeThumbnailUrl,
        videoId: a.creativeVideoId,
        callToAction: a.creativeCallToAction,
      },
    })),
  }));
}

export interface SegmentOption {
  id: string;
  name: string;
  active: boolean;
  totalResults: number;
  openRate: number | null;
  clickThroughRate: number | null;
}

export async function getBeehiivSegmentOptions(): Promise<SegmentOption[]> {
  const rows = await db.query.beehiivSegmentsCache.findMany({
    orderBy: [desc(beehiivSegmentsCache.totalResults)],
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    active: r.active,
    totalResults: r.totalResults,
    openRate: r.openRate,
    clickThroughRate: r.clickThroughRate,
  }));
}

export interface MappingWithNames {
  id: string;
  campaignId: string;
  campaignName: string;
  adSetIds: string[];
  adSetNames: string[];
  adIds: string[];
  adNames: string[];
  segmentIds: string[];
  segmentNames: string[];
  createdAt: Date;
}

export async function getMappingsWithNames(): Promise<MappingWithNames[]> {
  const [mappings, campaigns, sets, ads, segments] = await Promise.all([
    db.query.adMappings.findMany({ orderBy: [desc(adMappings.createdAt)] }),
    db.query.adCampaigns.findMany(),
    db.query.adSets.findMany(),
    db.query.metaAds.findMany(),
    db.query.beehiivSegmentsCache.findMany(),
  ]);

  const campaignName = new Map(campaigns.map((c) => [c.id, c.name]));
  const adSetName = new Map(sets.map((s) => [s.id, s.name]));
  const adName = new Map(ads.map((a) => [a.id, a.name]));
  const segmentName = new Map(segments.map((s) => [s.id, s.name]));

  return mappings.map((m) => ({
    id: m.id,
    campaignId: m.campaignId,
    campaignName: campaignName.get(m.campaignId) ?? "(deleted campaign)",
    adSetIds: m.adSetIds,
    adSetNames: m.adSetIds.map((id) => adSetName.get(id) ?? "(deleted ad set)"),
    adIds: m.adIds,
    adNames: m.adIds.map((id) => adName.get(id) ?? "(deleted ad)"),
    segmentIds: m.segmentIds,
    segmentNames: m.segmentIds.map((id) => segmentName.get(id) ?? "(deleted segment)"),
    createdAt: m.createdAt,
  }));
}

export interface AdDailyMetricRow {
  date: string; // YYYY-MM-DD
  campaignId: string;
  adSetId: string;
  adId: string;
  spend: number;
  leads: number;
  impressions: number;
  linkClicks: number;
}

/**
 * Every per-ad-per-day row, joined up to its ad set/campaign so the
 * Overview dashboard can filter and aggregate client-side (same pattern
 * as EditionsExplorer.tsx) as the date range and Campaign/Ad set/Ad
 * dropdowns change, rather than a fixed lifetime total.
 */
export async function getAdDailyMetricRows(): Promise<AdDailyMetricRow[]> {
  const rows = await db.query.adDailyMetrics.findMany({ with: { ad: true } });
  return rows.map((r) => ({
    date: r.date,
    campaignId: r.ad.campaignId,
    adSetId: r.ad.adSetId,
    adId: r.adId,
    spend: r.spend,
    leads: r.leads,
    impressions: r.impressions,
    linkClicks: r.linkClicks,
  }));
}

export interface MappingForLookup {
  campaignId: string;
  adSetIds: string[];
  adIds: string[];
  segmentIds: string[];
}

/**
 * Slimmed-down mapping rows for the Overview dashboard's Beehiiv lookup —
 * given whichever campaign/ad set/ad the user has selected, find the
 * mappings that cover that selection and sum their segments' member
 * counts. Zero mappings exist yet (BUILD_LOG.md), so this honestly
 * resolves to nothing until the user builds some on the Mapping page.
 */
export async function getMappingsForLookup(): Promise<MappingForLookup[]> {
  const rows = await db.query.adMappings.findMany();
  return rows.map((m) => ({
    campaignId: m.campaignId,
    adSetIds: m.adSetIds,
    adIds: m.adIds,
    segmentIds: m.segmentIds,
  }));
}

/**
 * Beehiiv doesn't expose a segment's filter definition via the public
 * API (confirmed live, BUILD_LOG.md Round 40) — so "the segment that
 * tracks all Meta-sourced subscribers" can only be identified by the
 * naming convention already in use for it ("Meta Source ... (Overall)"),
 * not by inspecting its actual utm_source filter. Picks the largest such
 * segment (the broadest/most inclusive date window) rather than summing
 * every match, since narrower "Meta Source - <month>" segments are
 * subsets of the combined one, not additional subscribers.
 */
export async function getBeehiivMetaSourceTotal(): Promise<number | null> {
  const rows = await db.query.beehiivSegmentsCache.findMany();
  const candidates = rows.filter((r) => /^Meta Source.*\(Overall\)$/i.test(r.name));
  if (candidates.length === 0) return null;
  return Math.max(...candidates.map((r) => r.totalResults));
}
