"use client";

import { useEffect } from "react";
import type { AdSetDetail } from "@/lib/ads/data";

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

const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-muted">{label}</div>
      <div className="max-w-[65%] text-right text-[13px] font-medium">{value}</div>
    </div>
  );
}

export function AdSetDetailModal({
  adSetName,
  adSetStatus,
  placementStrategy,
  detail,
  onClose,
}: {
  adSetName: string;
  adSetStatus: string;
  placementStrategy: string | null;
  detail: AdSetDetail;
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
  const ageRange =
    detail.ageMin !== null || detail.ageMax !== null
      ? `${detail.ageMin ?? "18"} to ${detail.ageMax ?? "65+"}`
      : null;
  const interestNames = [...new Set(detail.interests?.map((i) => i.name) ?? [])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
              {adSetStatus === "ACTIVE" ? "Active" : "Inactive"} ad set
            </div>
            <div className="mt-0.5 font-semibold text-[13.5px]">{adSetName}</div>
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
          <DetailRow label="Conversion location" value="N/A" />
          <DetailRow
            label={detail.dailyBudget !== null ? "Daily budget" : "Lifetime budget"}
            value={hasBudget ? money((detail.dailyBudget ?? detail.lifetimeBudget) as number) : "Set at campaign level"}
          />
          <DetailRow label="Location" value={detail.locations && detail.locations.length > 0 ? detail.locations.join(", ") : "N/A"} />
          <DetailRow label="Age range" value={ageRange ?? "N/A"} />
          <DetailRow label="Gender" value={detail.genderLabel ?? "All"} />
          <DetailRow
            label="Placement"
            value={
              placementStrategy === "advantage"
                ? "Advantage+ (automatic)"
                : placementStrategy === "manual" && detail.platforms
                  ? detail.platforms.map(platformLabel).join(", ")
                  : "N/A"
            }
          />
        </div>

        {interestNames.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-wide text-text-muted">
              Target audience: interests
            </div>
            <div className="flex flex-wrap gap-1.5">
              {interestNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-card-soft px-2.5 py-1 text-[11.5px] text-text-muted"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-border p-4">
          <p className="text-[11px] text-text-muted">
            Conversion location isn&apos;t available yet: Meta&apos;s
            research tooling used to pull this data doesn&apos;t expose that
            field, and no live API connection is configured to fetch it
            directly.
          </p>
        </div>
      </div>
    </div>
  );
}
