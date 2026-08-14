"use client";

import { useMemo, useState } from "react";
import { Card, Eyebrow, EmptyState, StatCard, GradientStatCard } from "@/components/dashboard/ui";
import { DualSeriesTrendChart } from "./DualSeriesTrendChart";
import { BreakdownDonut } from "./BreakdownDonut";
import {
  type AdCampaignRow,
  type AdDailyPoint,
  metaCostPerLead,
  trueAcquisitionCost,
  ctr,
} from "@/lib/ads/types";

const inputCls =
  "w-full rounded-lg border border-border bg-card px-3 py-2 text-[13px] outline-none focus:border-orange";
const dateCls =
  "w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-[12.5px] text-text-faint outline-none focus:border-orange";

const money = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

type SortKey = "name" | "spend" | "metaLeads" | "metaCpl" | "beehiivSubscribers" | "trueCac";

export function AdsDashboard({
  campaigns,
  dailySeries,
}: {
  campaigns: AdCampaignRow[];
  dailySeries: AdDailyPoint[];
}) {
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [country, setCountry] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);

  const countries = useMemo(
    () => [...new Set(campaigns.map((c) => c.country))].sort(),
    [campaigns],
  );

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (country && c.country !== country) return false;
      return true;
    });
  }, [campaigns, search, country]);

  const filteredDaily = useMemo(() => {
    return dailySeries.filter((d) => {
      if (dateFrom && d.date < dateFrom) return false;
      if (dateTo && d.date > dateTo) return false;
      return true;
    });
  }, [dailySeries, dateFrom, dateTo]);

  const totals = useMemo(() => {
    const spend = filtered.reduce((s, c) => s + c.spend, 0);
    const metaLeads = filtered.reduce((s, c) => s + c.metaLeads, 0);
    const impressions = filtered.reduce((s, c) => s + c.impressions, 0);
    const linkClicks = filtered.reduce((s, c) => s + c.linkClicks, 0);
    const beehiivSubscribers = filtered.reduce(
      (s, c) => s + (c.beehiivSubscribers ?? 0),
      0,
    );
    const anyBeehiivMapped = filtered.some((c) => c.beehiivUtmMedium !== null);
    const weightedOpenRate = filtered.reduce(
      (s, c) => s + (c.beehiivOpenRate ?? 0) * (c.beehiivSubscribers ?? 0),
      0,
    );
    return {
      spend,
      metaLeads,
      impressions,
      linkClicks,
      beehiivSubscribers,
      anyBeehiivMapped,
      cpl: metaLeads > 0 ? spend / metaLeads : null,
      trueCac: beehiivSubscribers > 0 ? spend / beehiivSubscribers : null,
      openRate: beehiivSubscribers > 0 ? weightedOpenRate / beehiivSubscribers : null,
      overallCtr: ctr(impressions, linkClicks),
    };
  }, [filtered]);

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
  const comparisonPoints = filteredDaily.map((d) => ({
    label: d.date.slice(5),
    bar: d.metaLeads,
    line: d.beehiivSubscribers,
  }));
  const countrySlices = countries.map((c) => ({
    label: c,
    value: filtered.filter((r) => r.country === c).reduce((s, r) => s + r.metaLeads, 0),
  }));

  return (
    <div className="mx-auto max-w-[1120px]">
      <Card className="mb-4">
        <div className="grid grid-cols-4 gap-3.5">
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
          <div>
            <div className="mb-1 font-mono text-[10px] uppercase tracking-wide text-text-muted">
              Country
            </div>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={inputCls}
            >
              <option value="">All countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDateFrom("");
                setDateTo("");
                setCountry("");
              }}
              className="w-full rounded-lg border border-border px-3 py-2 text-[12.5px] font-medium text-text-muted transition-colors hover:border-orange hover:text-ink"
            >
              Reset filters
            </button>
          </div>
        </div>
      </Card>

      <div className="mb-4 grid grid-cols-6 gap-3">
        <StatCard label="Spend" value={money(totals.spend)} />
        <StatCard label="Meta leads" value={totals.metaLeads.toLocaleString()} />
        <StatCard label="Meta cost / lead" value={totals.cpl !== null ? money(totals.cpl) : "N/A"} />
        <StatCard
          label="Beehiiv subscribers"
          value={totals.anyBeehiivMapped ? totals.beehiivSubscribers.toLocaleString() : "N/A"}
          sub={!totals.anyBeehiivMapped ? "No campaigns mapped yet" : undefined}
        />
        <GradientStatCard
          label="True acquisition cost"
          value={totals.trueCac !== null ? money(totals.trueCac) : "N/A"}
          sub="Spend ÷ real Beehiiv subscribers"
        />
        <StatCard
          label="Beehiiv open rate"
          value={totals.openRate !== null ? pct(totals.openRate) : "N/A"}
        />
      </div>

      <div className="mb-4 grid grid-cols-[1.55fr_1fr] gap-3.5">
        <Card>
          <Eyebrow>Daily spend vs Meta leads</Eyebrow>
          <DualSeriesTrendChart
            points={trendPoints}
            barLabel="Spend"
            lineLabel="Meta leads"
            barFormat={money}
            lineFormat={(v) => v.toLocaleString()}
          />
        </Card>
        <Card>
          <Eyebrow>Meta leads by country</Eyebrow>
          <BreakdownDonut slices={countrySlices} />
        </Card>
      </div>

      <Card className="mb-4">
        <Eyebrow>Meta leads vs real Beehiiv subscribers</Eyebrow>
        <p className="mb-3 text-[11.5px] text-text-muted">
          The gap between these two lines is the whole point of this
          dashboard: not everyone Meta counts as a lead becomes a real
          Beehiiv subscriber.
        </p>
        <DualSeriesTrendChart
          points={comparisonPoints}
          barLabel="Meta leads"
          lineLabel="Beehiiv subscribers"
          barFormat={(v) => v.toLocaleString()}
          lineFormat={(v) => v.toLocaleString()}
        />
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
                      No campaign data yet. Ad ingestion isn&apos;t wired up
                      yet — this is the layout, coming next.
                    </EmptyState>
                  </td>
                </tr>
              ) : (
                sorted.map((c) => {
                  const cpl = metaCostPerLead(c);
                  const cac = trueAcquisitionCost(c);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-card-soft">
                      <td className="px-3.5 py-2.5">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-[11px] text-text-faint">{c.country}</div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right">{money(c.spend)}</td>
                      <td className="px-3.5 py-2.5 text-right">{c.metaLeads.toLocaleString()}</td>
                      <td className="px-3.5 py-2.5 text-right">{cpl !== null ? money(cpl) : "N/A"}</td>
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
