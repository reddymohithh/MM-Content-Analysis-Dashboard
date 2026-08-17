"use client";

import { useMemo, useState } from "react";
import { Card, Eyebrow, EmptyState, StatCard, GradientStatCard } from "@/components/dashboard/ui";
import { DualSeriesTrendChart } from "./DualSeriesTrendChart";
import { ImpressionsClicksChart } from "./ImpressionsClicksChart";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { AdCreativeModal } from "./AdCreativeModal";
import { CampaignDetailModal } from "./CampaignDetailModal";
import { AdSetDetailModal } from "./AdSetDetailModal";
import { costPerLead, acquisitionCost } from "@/lib/ads/types";
import type {
  CampaignWithChildren,
  AdDailyMetricRow,
  AdDailyPlatformMetricRow,
  MappingForLookup,
  SegmentOption,
  AdCreative,
} from "@/lib/ads/data";

const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const money2 = (n: number) => `₹${n.toFixed(2)}`;

/** CPM/CPC are cleanly derivable from spend/impressions/linkClicks, same
 * as CTR already was — no need to store them separately. */
function cpmOf(spend: number, impressions: number): number | null {
  return impressions > 0 ? (spend / impressions) * 1000 : null;
}
function cpcOf(spend: number, linkClicks: number): number | null {
  return linkClicks > 0 ? spend / linkClicks : null;
}
/** Impressions-weighted average of Meta's own daily frequency values —
 * an honest approximation, not a true deduplicated reach for the window
 * (see schema.ts comment on adDailyMetrics.frequency). */
function avgFrequency(frequencyImpressionSum: number, impressions: number): number | null {
  return impressions > 0 ? frequencyImpressionSum / impressions : null;
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  audience_network: "Audience Network",
  messenger: "Messenger",
  threads: "Threads",
  whatsapp: "WhatsApp",
};
function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform;
}

type SortKey =
  | "name"
  | "spend"
  | "metaLeads"
  | "metaCpl"
  | "beehiivSubscribers"
  | "trueCac"
  | "frequency"
  | "cpm"
  | "cpc";
type BreakdownLevel = "campaign" | "adSet" | "ad";

interface BreakdownRow {
  id: string;
  name: string;
  status?: string;
  spend: number;
  metaLeads: number;
  impressions: number;
  linkClicks: number;
  frequencyImpressionSum: number;
  beehiivSubscribers: number | null;
  creative?: AdCreative;
  placementStrategy?: string | null;
}

function sortRows(rows: BreakdownRow[], sortKey: SortKey, sortDir: 1 | -1): BreakdownRow[] {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    let x: number | string, y: number | string;
    switch (sortKey) {
      case "name":
        return a.name.localeCompare(b.name) * sortDir;
      case "metaCpl":
        x = costPerLead(a.spend, a.metaLeads) ?? Infinity;
        y = costPerLead(b.spend, b.metaLeads) ?? Infinity;
        break;
      case "trueCac":
        x = acquisitionCost(a.spend, a.beehiivSubscribers) ?? Infinity;
        y = acquisitionCost(b.spend, b.beehiivSubscribers) ?? Infinity;
        break;
      case "beehiivSubscribers":
        x = a.beehiivSubscribers ?? -1;
        y = b.beehiivSubscribers ?? -1;
        break;
      case "spend":
        x = a.spend;
        y = b.spend;
        break;
      case "frequency":
        x = avgFrequency(a.frequencyImpressionSum, a.impressions) ?? -1;
        y = avgFrequency(b.frequencyImpressionSum, b.impressions) ?? -1;
        break;
      case "cpm":
        x = cpmOf(a.spend, a.impressions) ?? Infinity;
        y = cpmOf(b.spend, b.impressions) ?? Infinity;
        break;
      case "cpc":
        x = cpcOf(a.spend, a.linkClicks) ?? Infinity;
        y = cpcOf(b.spend, b.linkClicks) ?? Infinity;
        break;
      default:
        x = a.metaLeads;
        y = b.metaLeads;
    }
    return ((x as number) - (y as number)) * sortDir;
  });
  return sorted;
}

function toggleId(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function segmentSum(matchingSegmentIds: Set<string>, segmentTotalsById: Map<string, number>): number | null {
  if (matchingSegmentIds.size === 0) return null;
  let sum = 0;
  matchingSegmentIds.forEach((id) => {
    sum += segmentTotalsById.get(id) ?? 0;
  });
  return sum;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Same default window Ads Manager itself opens on, so "Meta cost / lead"
 * reads as the account's current average rather than an all-time figure. */
function last28Days(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 27);
  return { from: toISODate(from), to: toISODate(to) };
}

export function AdsDashboard({
  campaigns,
  dailyMetrics,
  dailyPlatformMetrics,
  mappings,
  segments,
}: {
  campaigns: CampaignWithChildren[];
  dailyMetrics: AdDailyMetricRow[];
  dailyPlatformMetrics: AdDailyPlatformMetricRow[];
  mappings: MappingForLookup[];
  segments: SegmentOption[];
}) {
  const [dateFrom, setDateFrom] = useState(() => last28Days().from);
  const [dateTo, setDateTo] = useState(() => last28Days().to);
  const [campaignIds, setCampaignIds] = useState<Set<string>>(new Set());
  const [adSetIds, setAdSetIds] = useState<Set<string>>(new Set());
  const [adIds, setAdIds] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [breakdownLevel, setBreakdownLevel] = useState<BreakdownLevel>("campaign");
  const [modalAdId, setModalAdId] = useState<string | null>(null);
  const [modalCampaignId, setModalCampaignId] = useState<string | null>(null);
  const [modalAdSetId, setModalAdSetId] = useState<string | null>(null);

  const allAdSets = useMemo(
    () => campaigns.flatMap((c) => c.adSets.map((s) => ({ ...s, campaignId: c.id }))),
    [campaigns],
  );
  const allAds = useMemo(
    () => campaigns.flatMap((c) => c.ads.map((a) => ({ ...a, campaignId: c.id }))),
    [campaigns],
  );

  const availableAdSets = useMemo(
    () => (campaignIds.size === 0 ? allAdSets : allAdSets.filter((s) => campaignIds.has(s.campaignId))),
    [allAdSets, campaignIds],
  );
  const availableAds = useMemo(() => {
    let pool = allAds;
    if (campaignIds.size > 0) pool = pool.filter((a) => campaignIds.has(a.campaignId));
    if (adSetIds.size > 0) pool = pool.filter((a) => adSetIds.has(a.adSetId));
    return pool;
  }, [allAds, campaignIds, adSetIds]);

  function toggleCampaign(id: string) {
    const nextCampaignIds = toggleId(campaignIds, id);
    setCampaignIds(nextCampaignIds);
    const stillAvailableAdSets = new Set(
      allAdSets.filter((s) => nextCampaignIds.size === 0 || nextCampaignIds.has(s.campaignId)).map((s) => s.id),
    );
    setAdSetIds((prev) => new Set([...prev].filter((sid) => stillAvailableAdSets.has(sid))));
    const stillAvailableAds = new Set(
      allAds.filter((a) => nextCampaignIds.size === 0 || nextCampaignIds.has(a.campaignId)).map((a) => a.id),
    );
    setAdIds((prev) => new Set([...prev].filter((aid) => stillAvailableAds.has(aid))));
  }

  function toggleAdSet(id: string) {
    const nextAdSetIds = toggleId(adSetIds, id);
    setAdSetIds(nextAdSetIds);
    const stillAvailableAds = new Set(
      allAds
        .filter((a) => (campaignIds.size === 0 || campaignIds.has(a.campaignId)) && (nextAdSetIds.size === 0 || nextAdSetIds.has(a.adSetId)))
        .map((a) => a.id),
    );
    setAdIds((prev) => new Set([...prev].filter((aid) => stillAvailableAds.has(aid))));
  }

  function resetFilters() {
    const defaults = last28Days();
    setDateFrom(defaults.from);
    setDateTo(defaults.to);
    setCampaignIds(new Set());
    setAdSetIds(new Set());
    setAdIds(new Set());
  }

  const filteredMetrics = useMemo(() => {
    return dailyMetrics.filter((d) => {
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      if (campaignIds.size > 0 && !campaignIds.has(d.campaignId)) return false;
      if (adSetIds.size > 0 && !adSetIds.has(d.adSetId)) return false;
      if (adIds.size > 0 && !adIds.has(d.adId)) return false;
      return true;
    });
  }, [dailyMetrics, dateFrom, dateTo, campaignIds, adSetIds, adIds]);

  const filteredPlatformMetrics = useMemo(() => {
    return dailyPlatformMetrics.filter((d) => {
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      if (campaignIds.size > 0 && !campaignIds.has(d.campaignId)) return false;
      if (adSetIds.size > 0 && !adSetIds.has(d.adSetId)) return false;
      if (adIds.size > 0 && !adIds.has(d.adId)) return false;
      return true;
    });
  }, [dailyPlatformMetrics, dateFrom, dateTo, campaignIds, adSetIds, adIds]);

  const totals = useMemo(() => {
    return filteredMetrics.reduce(
      (acc, d) => ({
        spend: acc.spend + d.spend,
        leads: acc.leads + d.leads,
        impressions: acc.impressions + d.impressions,
        linkClicks: acc.linkClicks + d.linkClicks,
        frequencyImpressionSum: acc.frequencyImpressionSum + d.frequency * d.impressions,
      }),
      { spend: 0, leads: 0, impressions: 0, linkClicks: 0, frequencyImpressionSum: 0 },
    );
  }, [filteredMetrics]);

  const cpmAvg = cpmOf(totals.spend, totals.impressions);
  const cpcAvg = cpcOf(totals.spend, totals.linkClicks);
  const frequencyAvg = avgFrequency(totals.frequencyImpressionSum, totals.impressions);

  const segmentTotalsById = useMemo(() => new Map(segments.map((s) => [s.id, s.totalResults])), [segments]);

  /**
   * KPI row (Beehiiv subscribers / True acquisition cost) is strictly
   * mapping-driven -- no fallback to the account-wide "Meta Source
   * (Overall)" aggregate. Stays N/A until a real mapping covers the
   * current selection, even with no Campaign/Ad set/Ad filter applied.
   */
  const beehiivSubscribersMapped = useMemo(() => {
    const matchingSegmentIds = new Set<string>();
    for (const m of mappings) {
      if (campaignIds.size > 0 && !campaignIds.has(m.campaignId)) continue;
      if (adSetIds.size > 0 && !m.adSetIds.some((id) => adSetIds.has(id))) continue;
      if (adIds.size > 0 && !m.adIds.some((id) => adIds.has(id))) continue;
      m.segmentIds.forEach((id) => matchingSegmentIds.add(id));
    }
    return segmentSum(matchingSegmentIds, segmentTotalsById);
  }, [mappings, campaignIds, adSetIds, adIds, segmentTotalsById]);

  const cpl = costPerLead(totals.spend, totals.leads);
  const trueCac = acquisitionCost(totals.spend, beehiivSubscribersMapped);

  const trendPoints = useMemo(() => {
    const byDate = new Map<string, { spend: number; leads: number }>();
    for (const d of filteredMetrics) {
      const cur = byDate.get(d.date) ?? { spend: 0, leads: 0 };
      cur.spend += d.spend;
      cur.leads += d.leads;
      byDate.set(d.date, cur);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ label: date.slice(5), bar: v.spend, line: v.leads }));
  }, [filteredMetrics]);

  const impressionsClicksPoints = useMemo(() => {
    const byDate = new Map<string, { impressions: number; clicks: number }>();
    for (const d of filteredMetrics) {
      const cur = byDate.get(d.date) ?? { impressions: 0, clicks: 0 };
      cur.impressions += d.impressions;
      cur.clicks += d.linkClicks;
      byDate.set(d.date, cur);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        label: date.slice(5),
        impressions: v.impressions,
        clicks: v.clicks,
        ctr: v.impressions > 0 ? (v.clicks / v.impressions) * 100 : 0,
      }));
  }, [filteredMetrics]);

  const campaignNameById = useMemo(() => new Map(campaigns.map((c) => [c.id, c.name])), [campaigns]);
  const campaignInfoById = useMemo(() => new Map(campaigns.map((c) => [c.id, c])), [campaigns]);
  const adSetInfoById = useMemo(() => new Map(allAdSets.map((s) => [s.id, s])), [allAdSets]);
  const adInfoById = useMemo(() => new Map(allAds.map((a) => [a.id, a])), [allAds]);

  const perCampaignRows = useMemo((): BreakdownRow[] => {
    const byCampaign = new Map<
      string,
      { spend: number; metaLeads: number; impressions: number; linkClicks: number; frequencyImpressionSum: number }
    >();
    for (const d of filteredMetrics) {
      const cur =
        byCampaign.get(d.campaignId) ??
        { spend: 0, metaLeads: 0, impressions: 0, linkClicks: 0, frequencyImpressionSum: 0 };
      cur.spend += d.spend;
      cur.metaLeads += d.leads;
      cur.impressions += d.impressions;
      cur.linkClicks += d.linkClicks;
      cur.frequencyImpressionSum += d.frequency * d.impressions;
      byCampaign.set(d.campaignId, cur);
    }
    return [...byCampaign.entries()].map(([campaignId, agg]) => {
      const matchingSegmentIds = new Set<string>();
      for (const m of mappings) {
        if (m.campaignId !== campaignId) continue;
        if (adSetIds.size > 0 && !m.adSetIds.some((id) => adSetIds.has(id))) continue;
        if (adIds.size > 0 && !m.adIds.some((id) => adIds.has(id))) continue;
        m.segmentIds.forEach((id) => matchingSegmentIds.add(id));
      }
      return {
        id: campaignId,
        name: campaignNameById.get(campaignId) ?? "(unknown campaign)",
        spend: agg.spend,
        metaLeads: agg.metaLeads,
        impressions: agg.impressions,
        linkClicks: agg.linkClicks,
        frequencyImpressionSum: agg.frequencyImpressionSum,
        beehiivSubscribers: segmentSum(matchingSegmentIds, segmentTotalsById),
      };
    });
  }, [filteredMetrics, mappings, adSetIds, adIds, segmentTotalsById, campaignNameById]);

  const perAdSetRows = useMemo((): BreakdownRow[] => {
    const byAdSet = new Map<
      string,
      { spend: number; metaLeads: number; impressions: number; linkClicks: number; frequencyImpressionSum: number }
    >();
    for (const d of filteredMetrics) {
      const cur =
        byAdSet.get(d.adSetId) ??
        { spend: 0, metaLeads: 0, impressions: 0, linkClicks: 0, frequencyImpressionSum: 0 };
      cur.spend += d.spend;
      cur.metaLeads += d.leads;
      cur.impressions += d.impressions;
      cur.linkClicks += d.linkClicks;
      cur.frequencyImpressionSum += d.frequency * d.impressions;
      byAdSet.set(d.adSetId, cur);
    }
    return [...byAdSet.entries()].map(([adSetId, agg]) => {
      const info = adSetInfoById.get(adSetId);
      const matchingSegmentIds = new Set<string>();
      for (const m of mappings) {
        if (m.campaignId !== info?.campaignId) continue;
        if (!m.adSetIds.includes(adSetId)) continue;
        if (adIds.size > 0 && !m.adIds.some((id) => adIds.has(id))) continue;
        m.segmentIds.forEach((id) => matchingSegmentIds.add(id));
      }
      return {
        id: adSetId,
        name: info?.name ?? "(unknown ad set)",
        status: info?.status,
        spend: agg.spend,
        metaLeads: agg.metaLeads,
        impressions: agg.impressions,
        linkClicks: agg.linkClicks,
        frequencyImpressionSum: agg.frequencyImpressionSum,
        beehiivSubscribers: segmentSum(matchingSegmentIds, segmentTotalsById),
        placementStrategy: info?.placementStrategy,
      };
    });
  }, [filteredMetrics, mappings, adIds, segmentTotalsById, adSetInfoById]);

  const perAdRows = useMemo((): BreakdownRow[] => {
    const byAd = new Map<
      string,
      { spend: number; metaLeads: number; impressions: number; linkClicks: number; frequencyImpressionSum: number }
    >();
    for (const d of filteredMetrics) {
      const cur =
        byAd.get(d.adId) ?? { spend: 0, metaLeads: 0, impressions: 0, linkClicks: 0, frequencyImpressionSum: 0 };
      cur.spend += d.spend;
      cur.metaLeads += d.leads;
      cur.impressions += d.impressions;
      cur.linkClicks += d.linkClicks;
      cur.frequencyImpressionSum += d.frequency * d.impressions;
      byAd.set(d.adId, cur);
    }
    return [...byAd.entries()].map(([adId, agg]) => {
      const info = adInfoById.get(adId);
      const matchingSegmentIds = new Set<string>();
      for (const m of mappings) {
        if (m.campaignId !== info?.campaignId) continue;
        if (!info || !m.adSetIds.includes(info.adSetId)) continue;
        if (!m.adIds.includes(adId)) continue;
        m.segmentIds.forEach((id) => matchingSegmentIds.add(id));
      }
      return {
        id: adId,
        name: info?.name ?? "(unknown ad)",
        status: info?.status,
        spend: agg.spend,
        metaLeads: agg.metaLeads,
        impressions: agg.impressions,
        linkClicks: agg.linkClicks,
        frequencyImpressionSum: agg.frequencyImpressionSum,
        beehiivSubscribers: segmentSum(matchingSegmentIds, segmentTotalsById),
        creative: info?.creative,
      };
    });
  }, [filteredMetrics, mappings, segmentTotalsById, adInfoById]);

  const platformRows = useMemo(() => {
    const byPlatform = new Map<
      string,
      { spend: number; leads: number; impressions: number; linkClicks: number }
    >();
    for (const d of filteredPlatformMetrics) {
      const cur = byPlatform.get(d.platform) ?? { spend: 0, leads: 0, impressions: 0, linkClicks: 0 };
      cur.spend += d.spend;
      cur.leads += d.leads;
      cur.impressions += d.impressions;
      cur.linkClicks += d.linkClicks;
      byPlatform.set(d.platform, cur);
    }
    return [...byPlatform.entries()]
      .map(([platform, agg]) => ({ platform, ...agg }))
      .sort((a, b) => b.spend - a.spend);
  }, [filteredPlatformMetrics]);

  const breakdownRowsByLevel: Record<BreakdownLevel, BreakdownRow[]> = {
    campaign: perCampaignRows,
    adSet: perAdSetRows,
    ad: perAdRows,
  };
  const breakdownRows = sortRows(breakdownRowsByLevel[breakdownLevel], sortKey, sortDir);
  const breakdownColumnLabel = breakdownLevel === "campaign" ? "Campaign" : breakdownLevel === "adSet" ? "Ad set" : "Ad";
  const modalAd = modalAdId !== null ? adInfoById.get(modalAdId) : undefined;
  const modalCampaign = modalCampaignId !== null ? campaignInfoById.get(modalCampaignId) : undefined;
  const modalAdSet = modalAdSetId !== null ? adSetInfoById.get(modalAdSetId) : undefined;

  function onRowClick(id: string) {
    if (breakdownLevel === "ad") setModalAdId(id);
    else if (breakdownLevel === "adSet") setModalAdSetId(id);
    else if (breakdownLevel === "campaign") setModalCampaignId(id);
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <Card className="mb-4">
        <div className="grid grid-cols-3 gap-3.5">
          <MultiSelectDropdown
            label="Campaign"
            options={campaigns.map((c) => ({ id: c.id, label: c.name, sub: c.status === "ACTIVE" ? "Active" : "Inactive" }))}
            selected={campaignIds}
            onToggle={toggleCampaign}
            placeholder="All campaigns"
            disabled={campaigns.length === 0}
            disabledReason="No campaigns synced yet"
          />
          <MultiSelectDropdown
            label="Ad set"
            options={availableAdSets.map((s) => ({ id: s.id, label: s.name, sub: s.status === "ACTIVE" ? "Active" : "Inactive" }))}
            selected={adSetIds}
            onToggle={toggleAdSet}
            placeholder="All ad sets"
            disabled={availableAdSets.length === 0}
            disabledReason="No ad sets available"
          />
          <MultiSelectDropdown
            label="Ad"
            options={availableAds.map((a) => ({ id: a.id, label: a.name, sub: a.status === "ACTIVE" ? "Active" : "Inactive" }))}
            selected={adIds}
            onToggle={(id) => setAdIds((prev) => toggleId(prev, id))}
            placeholder="All ads"
            disabled={availableAds.length === 0}
            disabledReason="No ads available"
          />
        </div>
        <div className="mt-3.5 flex items-end justify-between border-t border-hairline pt-3.5">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
              Date range
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={dateCls}
              />
              <span className="text-text-faint">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={dateCls}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="rounded-lg border border-border px-3 py-1.5 text-[12.5px] font-medium text-text-muted transition-colors hover:border-orange hover:text-ink"
          >
            Reset filters
          </button>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-5 gap-3">
        <StatCard label="Spend" value={money(totals.spend)} />
        <StatCard label="Meta leads" value={totals.leads.toLocaleString()} />
        <StatCard label="Meta cost / lead (AVG)" value={cpl !== null ? money(cpl) : "N/A"} />
        <StatCard
          label="Beehiiv subscribers"
          value={beehiivSubscribersMapped !== null ? beehiivSubscribersMapped.toLocaleString() : "N/A"}
        />
        <GradientStatCard label="True acquisition cost" value={trueCac !== null ? money(trueCac) : "N/A"} />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard
          label="Frequency (AVG)"
          value={frequencyAvg !== null ? frequencyAvg.toFixed(2) : "N/A"}
          sub="Impressions ÷ reach, weighted by day"
        />
        <StatCard label="CPM (AVG)" value={cpmAvg !== null ? money2(cpmAvg) : "N/A"} />
        <StatCard label="CPC (AVG)" value={cpcAvg !== null ? money2(cpcAvg) : "N/A"} />
      </div>

      <Card className="mb-4">
        <Eyebrow>Daily spend vs Meta leads</Eyebrow>
        <DualSeriesTrendChart
          points={trendPoints}
          barLabel="Spend"
          lineLabel="Meta leads"
          barFormat={money}
          lineFormat={(v) => v.toLocaleString()}
        />
      </Card>

      <Card className="mb-4">
        <Eyebrow>Impressions vs clicks</Eyebrow>
        <ImpressionsClicksChart points={impressionsClicksPoints} />
      </Card>

      <Card className="mb-4">
        <Eyebrow>Platform breakdown</Eyebrow>
        <p className="mb-3 text-[11.5px] text-text-muted">
          Facebook vs Instagram vs Threads vs Audience Network, same
          filters and date range as the rest of the page. Meta only
          reports a platform once it has actually delivered impressions
          there.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-card-soft">
                {["Platform", "Spend", "Leads", "CPM", "CPC", "CTR", "Cost / lead"].map((label) => (
                  <th
                    key={label}
                    className={`px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-wide text-text-muted ${
                      label === "Platform" ? "text-left" : "text-right"
                    }`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {platformRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3.5 py-8">
                    <EmptyState>No spend in this window. Try a wider date range or fewer filters.</EmptyState>
                  </td>
                </tr>
              ) : (
                platformRows.map((row) => {
                  const rowCpm = cpmOf(row.spend, row.impressions);
                  const rowCpc = cpcOf(row.spend, row.linkClicks);
                  const rowCtr = row.impressions > 0 ? (row.linkClicks / row.impressions) * 100 : null;
                  const rowCpl = costPerLead(row.spend, row.leads);
                  return (
                    <tr key={row.platform} className="border-b border-border last:border-0 hover:bg-card-soft">
                      <td className="px-3.5 py-2.5 font-medium">{platformLabel(row.platform)}</td>
                      <td className="px-3.5 py-2.5 text-right">{money(row.spend)}</td>
                      <td className="px-3.5 py-2.5 text-right">{row.leads.toLocaleString()}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpm !== null ? money2(rowCpm) : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpc !== null ? money2(rowCpc) : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCtr !== null ? `${rowCtr.toFixed(2)}%` : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpl !== null ? money(rowCpl) : "N/A"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <Eyebrow>{breakdownColumnLabel}s</Eyebrow>
          <div className="flex gap-1 rounded-lg bg-card-soft p-1">
            {(
              [
                ["campaign", "Campaign"],
                ["adSet", "Ad set"],
                ["ad", "Ads"],
              ] as [BreakdownLevel, string][]
            ).map(([level, label]) => (
              <button
                key={level}
                type="button"
                onClick={() => setBreakdownLevel(level)}
                className={`rounded-md px-3 py-1.5 text-[12px] font-medium transition-colors ${
                  breakdownLevel === level
                    ? "bg-card text-ink shadow-sm"
                    : "text-text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-card-soft">
                {(
                  [
                    ["name", breakdownColumnLabel],
                    ["spend", "Spend"],
                    ["metaLeads", "Meta leads"],
                    ["metaCpl", "Meta CPL"],
                    ["frequency", "Frequency"],
                    ["cpm", "CPM"],
                    ["cpc", "CPC"],
                    ["beehiivSubscribers", "Beehiiv subs"],
                    ["trueCac", "True CAC"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className={`cursor-pointer select-none px-3.5 py-2.5 font-mono text-[10.5px] uppercase tracking-wide text-text-muted transition-colors hover:text-orange ${
                      key === "name" ? "text-left" : "text-right"
                    }`}
                  >
                    {label}
                    {sortKey === key ? (sortDir === -1 ? " ↓" : " ↑") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakdownRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3.5 py-8">
                    <EmptyState>No spend in this window. Try a wider date range or fewer filters.</EmptyState>
                  </td>
                </tr>
              ) : (
                breakdownRows.map((row) => {
                  const rowCpl = costPerLead(row.spend, row.metaLeads);
                  const cac = acquisitionCost(row.spend, row.beehiivSubscribers);
                  const rowFrequency = avgFrequency(row.frequencyImpressionSum, row.impressions);
                  const rowCpm = cpmOf(row.spend, row.impressions);
                  const rowCpc = cpcOf(row.spend, row.linkClicks);
                  return (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick(row.id)}
                      className="cursor-pointer border-b border-border last:border-0 hover:bg-card-soft"
                    >
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium">{row.name}</div>
                        {breakdownLevel === "adSet" && row.placementStrategy && (
                          <div
                            className={`mt-0.5 inline-block rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide ${
                              row.placementStrategy === "advantage"
                                ? "bg-orange/15 text-orange"
                                : "bg-card-soft text-text-muted"
                            }`}
                          >
                            {row.placementStrategy === "advantage" ? "Advantage+" : "Manual placements"}
                          </div>
                        )}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">{money(row.spend)}</td>
                      <td className="px-3.5 py-2.5 text-right">{row.metaLeads.toLocaleString()}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpl !== null ? money(rowCpl) : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        {rowFrequency !== null ? rowFrequency.toFixed(2) : "N/A"}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpm !== null ? money2(rowCpm) : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpc !== null ? money2(rowCpc) : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        {row.beehiivSubscribers !== null ? row.beehiivSubscribers.toLocaleString() : "N/A"}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        {cac !== null ? (
                          <span className="font-semibold text-orange">{money(cac)}</span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modalAd && (
        <AdCreativeModal
          adName={modalAd.name}
          adStatus={modalAd.status}
          creative={modalAd.creative}
          onClose={() => setModalAdId(null)}
        />
      )}
      {modalCampaign && (
        <CampaignDetailModal
          campaignName={modalCampaign.name}
          campaignStatus={modalCampaign.status}
          objective={modalCampaign.objective}
          detail={modalCampaign.detail}
          onClose={() => setModalCampaignId(null)}
        />
      )}
      {modalAdSet && (
        <AdSetDetailModal
          adSetName={modalAdSet.name}
          adSetStatus={modalAdSet.status}
          placementStrategy={modalAdSet.placementStrategy}
          detail={modalAdSet.detail}
          onClose={() => setModalAdSetId(null)}
        />
      )}
    </div>
  );
}
