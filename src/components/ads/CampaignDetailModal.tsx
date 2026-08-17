"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/dashboard/ui";
import type { CampaignDetail } from "@/lib/ads/data";

const objectiveLabels: Record<string, string> = {
  OUTCOME_LEADS: "Leads",
  OUTCOME_SALES: "Sales",
  OUTCOME_ENGAGEMENT: "Engagement",
  OUTCOME_AWARENESS: "Awareness",
  OUTCOME_TRAFFIC: "Traffic",
  OUTCOME_APP_PROMOTION: "App promotion",
  LEAD_GENERATION: "Lead generation",
  CONVERSIONS: "Conversions",
  LINK_CLICKS: "Link clicks",
  REACH: "Reach",
  BRAND_AWARENESS: "Brand awareness",
};

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">{label}</div>
      <div className="text-[13px] font-medium">{value}</div>
    </div>
  );
}

export function CampaignDetailModal({
  campaignName,
  campaignStatus,
  objective,
  detail,
  onClose,
}: {
  campaignName: string;
  campaignStatus: string;
  objective: string | null;
  detail: CampaignDetail;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasBudget = detail.dailyBudget !== null || detail.lifetimeBudget !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
              {campaignStatus === "ACTIVE" ? "Active" : "Inactive"} campaign
            </div>
            <div className="mt-0.5 font-semibold text-[13.5px]">{campaignName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-lg px-2 py-1 text-[13px] text-text-muted hover:bg-card-soft hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="p-4">
          <DetailRow label="Objective" value={objective ? (objectiveLabels[objective] ?? objective) : "N/A"} />
          <DetailRow label="Bid strategy" value={detail.bidStrategy ?? "N/A"} />
          {hasBudget ? (
            <DetailRow
              label={detail.dailyBudget !== null ? "Daily budget" : "Lifetime budget"}
              value={money((detail.dailyBudget ?? detail.lifetimeBudget) as number)}
            />
          ) : (
            <DetailRow label="Budget" value="Set per ad set" />
          )}
          <div className="mt-3">
            {hasBudget ? (
              <p className="text-[11.5px] text-text-muted">
                Campaign Budget Optimization: Meta spends this budget across
                the campaign&apos;s ad sets automatically.
              </p>
            ) : (
              <p className="text-[11.5px] text-text-muted">
                No budget is set at the campaign level, so this campaign uses
                Ad Set Budget Optimization: each ad set has its own budget.
                Open an ad set below to see it.
              </p>
            )}
          </div>
        </div>

        {!detail.bidStrategy && !hasBudget && (
          <div className="border-t border-border p-4">
            <EmptyState>
              Budget-strategy detail hasn&apos;t been synced for this
              campaign yet.
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
}
