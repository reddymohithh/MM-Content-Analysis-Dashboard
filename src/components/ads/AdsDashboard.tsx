"use client";

import { useMemo, useState } from "react";
import { Card, Eyebrow, EmptyState, StatCard, GradientStatCard } from "@/components/dashboard/ui";
import { DualSeriesTrendChart } from "./DualSeriesTrendChart";
import {
  type AdCampaignRow,
  type AdDailyPoint,
  metaCostPerLead,
  trueAcquisitionCost,
} from "@/lib/ads/types";
import type { MetaTotals } from "@/lib/ads/data";

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-orange";
const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

type SortKey = "name" | "spend" | "metaLeads" | "metaCpl" | "beehiivSubscribers" | "trueCac";

// No per-day granularity fetched yet (BUILD_LOG.md) — this chart renders
// its own honest empty state against a local empty array rather than
// pretending to have daily data.
const dailySeries: AdDailyPoint[] = [];

export function AdsDashboard({
  campaigns,
  metaTotals,
  beehiivMetaSubscribers,
}: {
  campaigns: AdCampaignRow[];
  metaTotals: MetaTotals | null;
  beehiivMetaSubscribers: number | null;
}) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, search]);

  const filteredDaily = useMemo(() => {
    return dailySeries.filter((d) => {
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      return true;
    });
  }, [dateFrom, dateTo]);

  const cpl = metaTotals && metaTotals.leads > 0 ? metaTotals.spend / metaTotals.leads : null;
  const trueCac =
    metaTotals && beehiivMetaSubscribers && beehiivMetaSubscribers > 0
      ? metaTotals.spend / beehiivMetaSubscribers
      : null;

  const sorted = useMemo(() => {
    const rows = [...filtered];
    rows.sort((a, b) => {
      let x: number | string, y: number | string;
      switch (sortKey) {
        case "name":
          x = a.name;
          y = b.name;
          return x.localeCompare(y) * sortDir;
        case "metaCpl":
          x = metaCostPerLead(a) ?? Infinity;
          y = metaCostPerLead(b) ?? Infinity;
          break;
        case "trueCac":
          x = trueAcquisitionCost(a) ?? Infinity;
          y = trueAcquisitionCost(b) ?? Infinity;
          break;
        case "beehiivSubscribers":
          x = a.beehiivSubscribers ?? -1;
          y = b.beehiivSubscribers ?? -1;
          break;
        default:
          x = a[sortKey];
          y = b[sortKey];
      }
      return ((x as number) - (y as number)) * sortDir;
    });
    return rows;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 1 ? -1 : 1) as 1 | -1);
    } else {
      setSortKey(key);
      setSortDir(-1);
    }
  }

  const trendPoints = filteredDaily.map((d) => ({
    label: d.date.slice(5),
    bar: d.spend,
    line: d.metaLeads,
  }));

  return (
    <div className="mx-auto max-w-[1120px]">
      <Card className="mb-4">
        <div className="grid grid-cols-3 gap-3.5">
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
              Search campaign
            </div>
            <input
              type="text"
              placeholder="Search by campaign name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputCls}
            />
          </div>
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
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
              }}
              className="w-full rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text-muted transition-colors hover:border-orange hover:text-ink"
            >
              Reset filters
            </button>
          </div>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-5 gap-3">
        <StatCard label="Spend" value={metaTotals ? money(metaTotals.spend) : "N/A"} />
        <StatCard label="Meta leads" value={metaTotals ? metaTotals.leads.toLocaleString() : "N/A"} />
        <StatCard label="Meta cost / lead" value={cpl !== null ? money(cpl) : "N/A"} />
        <StatCard
          label="Beehiiv subscribers"
          value={beehiivMetaSubscribers !== null ? beehiivMetaSubscribers.toLocaleString() : "N/A"}
          sub={beehiivMetaSubscribers === null ? "No Meta-source segment cached yet" : undefined}
        />
        <GradientStatCard
          label="True acquisition cost"
          value={trueCac !== null ? money(trueCac) : "N/A"}
          sub="Spend ÷ real Beehiiv subscribers"
        />
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
        <Eyebrow>Meta leads vs real Beehiiv subscribers</Eyebrow>
        <p className="mb-3 text-[11.5px] text-text-muted">
          Not everyone Meta counts as a lead becomes a real Beehiiv
          subscriber. Meta&apos;s number is a lifetime account total from
          Ads Manager; Beehiiv&apos;s is the &quot;Meta Source (Overall)&quot;
          segment, which covers the window that segment was built for, not
          necessarily the same span, so treat these as two real numbers
          worth comparing, not a strict before/after of the same cohort.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card-soft p-5 text-center">
            <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
              Meta leads (Ads Manager, lifetime)
            </div>
            <div className="mt-2 font-serif text-[34px] font-bold">
              {metaTotals ? metaTotals.leads.toLocaleString() : "N/A"}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card-soft p-5 text-center">
            <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
              Beehiiv subscribers (source: Meta)
            </div>
            <div className="mt-2 font-serif text-[34px] font-bold text-orange">
              {beehiivMetaSubscribers !== null ? beehiivMetaSubscribers.toLocaleString() : "N/A"}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Eyebrow>Campaigns</Eyebrow>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="bg-card-soft">
                {(
                  [
                    ["name", "Campaign"],
                    ["spend", "Spend"],
                    ["metaLeads", "Meta leads"],
                    ["metaCpl", "Meta CPL"],
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
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3.5 py-8">
                    <EmptyState>
                      No per-campaign data yet. Campaign-level spend/leads
                      and mapping-based Beehiiv subscriber counts are the
                      next piece to wire up.
                    </EmptyState>
                  </td>
                </tr>
              ) : (
                sorted.map((c) => {
                  const rowCpl = metaCostPerLead(c);
                  const cac = trueAcquisitionCost(c);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-card-soft">
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium">{c.name}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">{money(c.spend)}</td>
                      <td className="px-3.5 py-2.5 text-right">{c.metaLeads.toLocaleString()}</td>
                      <td className="px-3.5 py-2.5 text-right">{rowCpl !== null ? money(rowCpl) : "N/A"}</td>
                      <td className="px-3.5 py-2.5 text-right">
                        {c.beehiivSubscribers !== null ? c.beehiivSubscribers.toLocaleString() : "N/A"}
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
    </div>
  );
}
