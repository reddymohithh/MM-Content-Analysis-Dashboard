"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Eyebrow, EmptyState } from "@/components/dashboard/ui";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import type { CampaignWithChildren, SegmentOption, MappingWithNames } from "@/lib/ads/data";

const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";
const selectCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] outline-none focus:border-orange disabled:cursor-not-allowed disabled:opacity-50";

function statusLabel(status: string) {
  return status === "ACTIVE" ? "Active" : "Inactive";
}

function toggle(set: Set<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function MappingBuilder({
  campaigns,
  segments,
  mappings,
}: {
  campaigns: CampaignWithChildren[];
  segments: SegmentOption[];
  mappings: MappingWithNames[];
}) {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [campaignId, setCampaignId] = useState<string>("");
  const [adSetIds, setAdSetIds] = useState<Set<string>>(new Set());
  const [adIds, setAdIds] = useState<Set<string>>(new Set());
  const [segmentIds, setSegmentIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const created = c.createdTime.toISOString().slice(0, 10);
      if (dateFrom && created < dateFrom) return false;
      if (dateTo && created > dateTo) return false;
      return true;
    });
  }, [campaigns, dateFrom, dateTo]);

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

  return (
    <div className="mx-auto max-w-[1120px] space-y-4">
      <Card>
        <Eyebrow>Campaign date range</Eyebrow>
        <p className="mb-3 text-[11.5px] text-text-muted">
          Filters which campaigns appear in the Campaign dropdown below by
          when they were created. Active or inactive campaigns created in
          this window both appear.
        </p>
        <div className="flex items-center gap-1.5">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={dateCls} />
          <span className="text-text-faint">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={dateCls} />
        </div>
      </Card>

      <Card>
        <Eyebrow>Build a mapping</Eyebrow>
        <div className="grid grid-cols-4 gap-3.5">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
              1. Campaign
            </div>
            <select
              value={campaignId}
              onChange={(e) => selectCampaign(e.target.value)}
              disabled={filteredCampaigns.length === 0}
              className={selectCls}
            >
              <option value="">
                {filteredCampaigns.length === 0 ? "No campaigns yet" : "Select a campaign..."}
              </option>
              {filteredCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({statusLabel(c.status)})
                </option>
              ))}
            </select>
          </div>

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
        <Eyebrow>Mappings</Eyebrow>
        {mappings.length === 0 ? (
          <EmptyState>No mappings created yet.</EmptyState>
        ) : (
          <div className="space-y-2">
            {mappings.map((m) => (
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
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
