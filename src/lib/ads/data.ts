import "server-only";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { adCampaigns, beehiivSegmentsCache, adMappings } from "@/lib/db/schema";

export interface CampaignWithChildren {
  id: string;
  name: string;
  status: string;
  objective: string | null;
  createdTime: Date;
  adSets: { id: string; name: string; status: string }[];
  ads: { id: string; adSetId: string; name: string; status: string }[];
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
    ads: c.ads.map((a) => ({ id: a.id, adSetId: a.adSetId, name: a.name, status: a.status })),
  }));
}

export interface SegmentOption {
  id: string;
  name: string;
  active: boolean;
  totalResults: number;
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
  }));
}

export interface MappingWithNames {
  id: string;
  campaignName: string;
  adSetNames: string[];
  adNames: string[];
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
    campaignName: campaignName.get(m.campaignId) ?? "(deleted campaign)",
    adSetNames: m.adSetIds.map((id) => adSetName.get(id) ?? "(deleted ad set)"),
    adNames: m.adIds.map((id) => adName.get(id) ?? "(deleted ad)"),
    segmentNames: m.segmentIds.map((id) => segmentName.get(id) ?? "(deleted segment)"),
    createdAt: m.createdAt,
  }));
}
