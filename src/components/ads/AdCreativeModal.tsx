"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/dashboard/ui";
import type { AdCreative } from "@/lib/ads/data";

const ctaLabels: Record<string, string> = {
  SUBSCRIBE: "Subscribe",
  DOWNLOAD: "Download",
  LEARN_MORE: "Learn more",
  SIGN_UP: "Sign up",
  SHOP_NOW: "Shop now",
};

export function AdCreativeModal({
  adName,
  adStatus,
  creative,
  onClose,
}: {
  adName: string;
  adStatus: string;
  creative: AdCreative;
  onClose: () => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasCreative = Boolean(creative.title || creative.body || creative.imageUrl || creative.videoId);
  const image = creative.imageUrl ?? creative.thumbnailUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-[480px] overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border p-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wide text-text-muted">
              {adStatus === "ACTIVE" ? "Active" : "Inactive"} ad
            </div>
            <div className="mt-0.5 font-semibold text-[13.5px]">{adName}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 rounded-lg px-2 py-1 text-[13px] text-text-muted hover:bg-card-soft hover:text-ink"
          >
            Close
          </button>
        </div>

        {hasCreative ? (
          <div>
            {image && (
              <div className="relative">
                <img src={image} alt={creative.title ?? adName} className="w-full object-cover" />
                {creative.videoId && (
                  <span className="absolute bottom-2 left-2 rounded bg-ink/75 px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-cream">
                    Video ad &middot; thumbnail shown
                  </span>
                )}
              </div>
            )}
            <div className="space-y-3 p-4">
              {creative.title && <div className="font-serif text-[17px] font-bold">{creative.title}</div>}
              {creative.body && (
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-text-muted">
                  {creative.body}
                </p>
              )}
              {creative.callToAction && (
                <div className="inline-block rounded-lg bg-orange px-3 py-1.5 text-[12.5px] font-semibold text-ink">
                  {ctaLabels[creative.callToAction] ?? creative.callToAction}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4">
            <EmptyState>
              No creative synced yet for this ad. Real ad copy and images are
              pulled from Meta Ads Manager on Refresh; this ad wasn&apos;t
              part of today&apos;s backfill.
            </EmptyState>
          </div>
        )}
      </div>
    </div>
  );
}
