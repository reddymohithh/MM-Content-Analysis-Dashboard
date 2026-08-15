"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Eyebrow, EmptyState } from "@/components/dashboard/ui";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { SingleSelectDropdown } from "./SingleSelectDropdown";
import type { CampaignWithChildren, SegmentOption, MappingWithNames, AdDailyMetricRow } from "@/lib/ads/data";

const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const percent = (n: number) => `${n.toFixed(2)}%`;

function statusLabel(status: string) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function toggle(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Same default window the Overview page opens on. */
function last28Days(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 27);
  return { from: toISODate(from), to: toISODate(to) };
}

export function MappingBuilder({
  campaigns,
  segments,
  mappings,
  dailyMetrics,
}: {
  campaigns: CampaignWithChildren[];
  segments: SegmentOption[];
  mappings: MappingWithNames[];
  dailyMetrics: AdDailyMetricRow[];
}) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState<string>("");
  const [adSetIds, setAdSetIds] = useState<Set<string>>(new Set());
  const [adIds, setAdIds] = useState<Set<string>>(new Set());
  const [segmentIds, setSegmentIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metricsFrom, setMetricsFrom] = useState(() => last28Days().from);
  const [metricsTo, setMetricsTo] = useState(() => last28Days().to);

  const selectedCampaign = campaigns.find((c) => c.id === campaignId) ?? null;

  const availableAds = useMemo(() => {
    if (!selectedCampaign) return [];
    return selectedCampaign.ads.filter((a) => adSetIds.has(a.adSetId));
  }, [selectedCampaign, adSetIds]);

  function selectCampaign(id: string) {
    setCampaignId(id);
    setAdSetIds(new Set());
    setAdIds(new Set());
    setError(null);
  }

  function toggleAdSet(id: string) {
    setAdSetIds((prev) => toggle(prev, id));
    // Dropping an ad set should drop the ads that only belonged to it.
    setAdIds((prev) => {
      const stillAvailable = new Set(
        selectedCampaign?.ads
          .filter((a) => (a.adSetId === id ? adSetIds.has(id) : adSetIds.has(a.adSetId)))
          .map((a) => a.id),
      );
      return new Set([...prev].filter((adId) => stillAvailable.has(adId)));
    });
  }

  const canSubmit =
    campaignId !== "" && adSetIds.size > 0 && adIds.size > 0 && segmentIds.size > 0 && !submitting;

  async function createMapping() {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/ads/mappings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          adSetIds: [...adSetIds],
          adIds: [...adIds],
          segmentIds: [...segmentIds],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the mapping.");
        return;
      }
      setCampaignId("");
      setAdSetIds(new Set());
      setAdIds(new Set());
      setSegmentIds(new Set());
      router.refresh();
    } catch {
      setError("Could not create the mapping. Check the server logs.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteMapping(id: string) {
    await fetch(`/api/ads/mappings/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const segmentById = useMemo(() => new Map(segments.map((s) => [s.id, s])), [segments]);

  const mappingMetrics = useMemo(() => {
    const result = new Map<
      string,
      {
        spend: number;
        metaLeads: number;
        metaCpa: number | null;
        beehiivLeads: number | null;
        beehiivCpa: number | null;
        openRate: number | null;
        clickThroughRate: number | null;
      }
    >();
    for (const m of mappings) {
      const adSetSet = new Set(m.adSetIds);
      const adSet = new Set(m.adIds);
      let spend = 0;
      let metaLeads = 0;
      for (const d of dailyMetrics) {
        if (d.campaignId !== m.campaignId) continue;
        if (!adSetSet.has(d.adSetId)) continue;
        if (!adSet.has(d.adId)) continue;
        if (metricsFrom && d.date < metricsFrom) continue;
        if (metricsTo && d.date > metricsTo) continue;
        spend += d.spend;
        metaLeads += d.leads;
      }
      const metaCpa = metaLeads > 0 ? spend / metaLeads : null;

      const matchingSegments = m.segmentIds.map((id) => segmentById.get(id)).filter((s) => s !== undefined);
      let beehiivLeads: number | null = null;
      let openRate: number | null = null;
      let clickThroughRate: number | null = null;
      if (matchingSegments.length > 0) {
        beehiivLeads = matchingSegments.reduce((sum, s) => sum + s.totalResults, 0);
        const withOpenRate = matchingSegments.filter((s) => s.openRate !== null);
        if (withOpenRate.length > 0) {
          const weight = withOpenRate.reduce((sum, s) => sum + s.totalResults, 0);
          openRate =
            weight > 0
              ? withOpenRate.reduce((sum, s) => sum + s.openRate! * s.totalResults, 0) / weight
              : withOpenRate.reduce((sum, s) => sum + s.openRate!, 0) / withOpenRate.length;
        }
        const withCtr = matchingSegments.filter((s) => s.clickThroughRate !== null);
        if (withCtr.length > 0) {
          const weight = withCtr.reduce((sum, s) => sum + s.totalResults, 0);
          clickThroughRate =
            weight > 0
              ? withCtr.reduce((sum, s) => sum + s.clickThroughRate! * s.totalResults, 0) / weight
              : withCtr.reduce((sum, s) => sum + s.clickThroughRate!, 0) / withCtr.length;
        }
      }
      const beehiivCpa = beehiivLeads && beehiivLeads > 0 ? spend / beehiivLeads : null;

      result.set(m.id, { spend, metaLeads, metaCpa, beehiivLeads, beehiivCpa, openRate, clickThroughRate });
    }
    return result;
  }, [mappings, dailyMetrics, segmentById, metricsFrom, metricsTo]);

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <Card>
        <Eyebrow>Build a mapping</Eyebrow>
        <div className="grid grid-cols-4 gap-3.5">
          <SingleSelectDropdown
            label="1. Campaign"
            options={campaigns.map((c) => ({ id: c.id, label: c.name, sub: statusLabel(c.status) }))}
            selected={campaignId}
            onSelect={selectCampaign}
            placeholder="Select a campaign..."
            disabled={campaigns.length === 0}
            disabledReason="No campaigns yet"
          />

          <MultiSelectDropdown
            label="2. Ad sets"
            options={(selectedCampaign?.adSets ?? []).map((s) => ({
              id: s.id,
              label: s.name,
              sub: statusLabel(s.status),
            }))}
            selected={adSetIds}
            onToggle={toggleAdSet}
            disabled={!selectedCampaign}
            disabledReason="Pick a campaign first"
          />

          <MultiSelectDropdown
            label="3. Ads"
            options={availableAds.map((a) => ({ id: a.id, label: a.name, sub: statusLabel(a.status) }))}
            selected={adIds}
            onToggle={(id) => setAdIds((prev) => toggle(prev, id))}
            disabled={adSetIds.size === 0}
            disabledReason="Pick an ad set first"
          />

          <MultiSelectDropdown
            label="4. Beehiiv segments"
            options={segments.map((s) => ({
              id: s.id,
              label: s.name,
              sub: `${s.totalResults.toLocaleString()} members${s.active ? "" : ". Inactive segment"}`,
            }))}
            selected={segmentIds}
            onToggle={(id) => setSegmentIds((prev) => toggle(prev, id))}
            disabled={segments.length === 0}
            disabledReason="No segments cached yet"
          />
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          {error && <span className="text-[12px] text-negative">{error}</span>}
          <button
            type="button"
            onClick={createMapping}
            disabled={!canSubmit}
            className="rounded-lg bg-orange px-4 py-2 text-[13px] font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Creating…" : "Create mapping"}
          </button>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-end justify-between">
          <Eyebrow>Mappings</Eyebrow>
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
              Date range
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={metricsFrom}
                onChange={(e) => setMetricsFrom(e.target.value)}
                className={dateCls}
              />
              <span className="text-text-faint">to</span>
              <input
                type="date"
                value={metricsTo}
                onChange={(e) => setMetricsTo(e.target.value)}
                className={dateCls}
              />
            </div>
          </div>
        </div>
        {mappings.length === 0 ? (
          <EmptyState>No mappings created yet.</EmptyState>
        ) : (
          <div className="space-y-3">
            {mappings.map((m) => {
              const metrics = mappingMetrics.get(m.id);
              return (
                <div key={m.id} className="rounded-lg border border-border p-3">
                  <div className="mb-1.5 flex items-start justify-between gap-3">
                    <div className="font-semibold text-[13px]">{m.campaignName}</div>
                    <div className="flex flex-shrink-0 items-center gap-3">
                      <span className="text-[11px] text-text-faint">
                        {m.createdAt.toISOString().slice(0, 10)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteMapping(m.id)}
                        className="text-[11px] text-negative hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-[11.5px] text-text-muted">
                    <div>
                      <span className="font-medium text-text-faint">Ad sets: </span>
                      {m.adSetNames.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium text-text-faint">Ads: </span>
                      {m.adNames.join(", ")}
                    </div>
                    <div>
                      <span className="font-medium text-text-faint">Segments: </span>
                      {m.segmentNames.join(", ")}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border bg-card-soft p-3">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-text-muted">
                        Ads Manager
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-[10.5px] text-text-faint">Spend</div>
                          <div className="font-serif text-[16px] font-bold">
                            {metrics ? money(metrics.spend) : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10.5px] text-text-faint">Leads</div>
                          <div className="font-serif text-[16px] font-bold">
                            {metrics ? metrics.metaLeads.toLocaleString() : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10.5px] text-text-faint">Cost / acquisition</div>
                          <div className="font-serif text-[16px] font-bold">
                            {metrics?.metaCpa !== null && metrics?.metaCpa !== undefined
                              ? money(metrics.metaCpa)
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-card-soft p-3">
                      <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-text-muted">
                        Beehiiv
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-[10.5px] text-text-faint">Leads</div>
                          <div className="font-serif text-[16px] font-bold text-orange">
                            {metrics?.beehiivLeads !== null && metrics?.beehiivLeads !== undefined
                              ? metrics.beehiivLeads.toLocaleString()
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10.5px] text-text-faint">Cost / acquisition</div>
                          <div className="font-serif text-[16px] font-bold text-orange">
                            {metrics?.beehiivCpa !== null && metrics?.beehiivCpa !== undefined
                              ? money(metrics.beehiivCpa)
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10.5px] text-text-faint">Open rate</div>
                          <div className="font-serif text-[16px] font-bold text-orange">
                            {metrics?.openRate !== null && metrics?.openRate !== undefined
                              ? percent(metrics.openRate)
                              : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10.5px] text-text-faint">CTR</div>
                          <div className="font-serif text-[16px] font-bold text-orange">
                            {metrics?.clickThroughRate !== null && metrics?.clickThroughRate !== undefined
                              ? percent(metrics.clickThroughRate)
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
