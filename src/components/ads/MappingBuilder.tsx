"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Eyebrow, EmptyState } from "@/components/dashboard/ui";
import type { CampaignWithChildren, SegmentOption, MappingWithNames } from "@/lib/ads/data";

const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";

function StatusPill({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
        active ? "bg-positive/10 text-positive" : "bg-card-soft text-text-muted"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CheckboxRow({
  checked,
  onChange,
  label,
  sub,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-card-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 flex-shrink-0 accent-orange"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px]">{label}</div>
        {sub && <div className="text-[11px] text-text-faint">{sub}</div>}
      </div>
    </label>
  );
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
  const [campaignId, setCampaignId] = useState<string | null>(null);
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
    campaignId !== null && adSetIds.size > 0 && adIds.size > 0 && segmentIds.size > 0 && !submitting;

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
      setCampaignId(null);
      setAdSetIds(new Set());
      setAdIds(new Set());
      setSegmentIds(new Set());
      router.refresh();
    } catch {
      setError("Could not create the mapping — check the server logs.");
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
          Filters which campaigns show up below by when they were created —
          active or inactive campaigns created in this window both appear.
        </p>
        <div className="flex items-center gap-1.5">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={dateCls} />
          <span className="text-text-faint">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={dateCls} />
        </div>
      </Card>

      <Card>
        <Eyebrow>1. Campaign</Eyebrow>
        {filteredCampaigns.length === 0 ? (
          <EmptyState>
            No campaigns yet. Click &quot;Refresh&quot; in the navbar to pull
            campaigns from Meta.
          </EmptyState>
        ) : (
          <div className="max-h-64 space-y-0.5 overflow-y-auto">
            {filteredCampaigns.map((c) => (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors ${
                  campaignId === c.id ? "bg-card-soft" : "hover:bg-card-soft"
                }`}
              >
                <input
                  type="radio"
                  name="campaign"
                  checked={campaignId === c.id}
                  onChange={() => selectCampaign(c.id)}
                  className="h-4 w-4 flex-shrink-0 accent-orange"
                />
                <div className="min-w-0 flex-1 truncate text-[12.5px]">{c.name}</div>
                <StatusPill status={c.status} />
                <div className="flex-shrink-0 text-[11px] text-text-faint">
                  {c.createdTime.toISOString().slice(0, 10)}
                </div>
              </label>
            ))}
          </div>
        )}
      </Card>

      {selectedCampaign && (
        <div className="grid grid-cols-2 gap-3.5">
          <Card>
            <Eyebrow>2. Ad sets</Eyebrow>
            {selectedCampaign.adSets.length === 0 ? (
              <EmptyState>No ad sets on this campaign.</EmptyState>
            ) : (
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {selectedCampaign.adSets.map((s) => (
                  <CheckboxRow
                    key={s.id}
                    checked={adSetIds.has(s.id)}
                    onChange={() => toggleAdSet(s.id)}
                    label={s.name}
                    sub={s.status === "ACTIVE" ? "Active" : "Inactive"}
                  />
                ))}
              </div>
            )}
          </Card>
          <Card>
            <Eyebrow>3. Ads</Eyebrow>
            {adSetIds.size === 0 ? (
              <EmptyState>Select at least one ad set first.</EmptyState>
            ) : availableAds.length === 0 ? (
              <EmptyState>No ads on the selected ad sets.</EmptyState>
            ) : (
              <div className="max-h-56 space-y-0.5 overflow-y-auto">
                {availableAds.map((a) => (
                  <CheckboxRow
                    key={a.id}
                    checked={adIds.has(a.id)}
                    onChange={() => setAdIds((prev) => toggle(prev, a.id))}
                    label={a.name}
                    sub={a.status === "ACTIVE" ? "Active" : "Inactive"}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Card>
        <Eyebrow>4. Beehiiv segments</Eyebrow>
        {segments.length === 0 ? (
          <EmptyState>
            No segments cached yet. Click &quot;Refresh&quot; in the navbar to
            pull segments from Beehiiv.
          </EmptyState>
        ) : (
          <div className="grid max-h-64 grid-cols-2 gap-x-4 overflow-y-auto">
            {segments.map((s) => (
              <CheckboxRow
                key={s.id}
                checked={segmentIds.has(s.id)}
                onChange={() => setSegmentIds((prev) => toggle(prev, s.id))}
                label={s.name}
                sub={`${s.totalResults.toLocaleString()} members${s.active ? "" : " · inactive segment"}`}
              />
            ))}
          </div>
        )}
      </Card>

      <div className="flex items-center justify-end gap-3">
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
