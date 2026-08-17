"use client";

import { useMemo, useState } from "react";
import { PageTitle, Card, EmptyState } from "@/components/dashboard/ui";
import { AdCreativeModal } from "./AdCreativeModal";
import { CampaignDetailModal } from "./CampaignDetailModal";
import { AdSetDetailModal } from "./AdSetDetailModal";
import type { CampaignWithChildren } from "@/lib/ads/data";

function StatusBadge({ status }: { status: string }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-block flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wide ${
        active ? "bg-orange/15 text-orange" : "bg-card-soft text-text-muted"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function BrowseRow({
  title,
  sub,
  badge,
  onOpen,
  onDetail,
  navigable,
}: {
  title: string;
  sub?: string;
  badge?: React.ReactNode;
  onOpen: () => void;
  onDetail?: () => void;
  navigable: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-card-soft">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="truncate text-[13px] font-medium">{title}</span>
          {badge}
        </div>
        {sub && <div className="mt-0.5 truncate text-[11.5px] text-text-muted">{sub}</div>}
      </button>
      <div className="flex flex-shrink-0 items-center gap-2">
        {onDetail && (
          <button
            type="button"
            onClick={onDetail}
            className="rounded-lg border border-border px-2.5 py-1 text-[11.5px] text-text-muted transition-colors hover:border-orange hover:text-ink"
          >
            Details
          </button>
        )}
        {navigable && <span className="text-text-faint">&rsaquo;</span>}
      </div>
    </div>
  );
}

function Breadcrumb({
  campaignName,
  adSetName,
  onRoot,
  onCampaign,
}: {
  campaignName: string | null;
  adSetName: string | null;
  onRoot: () => void;
  onCampaign: () => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[12.5px]">
      <button
        type="button"
        onClick={onRoot}
        className={`rounded px-1.5 py-0.5 ${
          campaignName ? "text-text-muted hover:text-orange" : "font-semibold text-ink"
        }`}
      >
        All campaigns
      </button>
      {campaignName && (
        <>
          <span className="text-text-faint">/</span>
          <button
            type="button"
            onClick={onCampaign}
            className={`rounded px-1.5 py-0.5 ${
              adSetName ? "text-text-muted hover:text-orange" : "font-semibold text-ink"
            }`}
          >
            {campaignName}
          </button>
        </>
      )}
      {adSetName && (
        <>
          <span className="text-text-faint">/</span>
          <span className="rounded px-1.5 py-0.5 font-semibold text-ink">{adSetName}</span>
        </>
      )}
    </div>
  );
}

export function CampaignsBrowser({ campaigns }: { campaigns: CampaignWithChildren[] }) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | null>(null);
  const [modalCampaignId, setModalCampaignId] = useState<string | null>(null);
  const [modalAdSetId, setModalAdSetId] = useState<string | null>(null);
  const [modalAdId, setModalAdId] = useState<string | null>(null);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedCampaignId) ?? null,
    [campaigns, selectedCampaignId],
  );
  const selectedAdSet = useMemo(
    () => selectedCampaign?.adSets.find((s) => s.id === selectedAdSetId) ?? null,
    [selectedCampaign, selectedAdSetId],
  );
  const adsInSelectedAdSet = useMemo(
    () => (selectedCampaign && selectedAdSetId ? selectedCampaign.ads.filter((a) => a.adSetId === selectedAdSetId) : []),
    [selectedCampaign, selectedAdSetId],
  );

  const modalCampaign = modalCampaignId ? campaigns.find((c) => c.id === modalCampaignId) : null;
  const modalAdSet = modalAdSetId ? selectedCampaign?.adSets.find((s) => s.id === modalAdSetId) : null;
  const modalAd = modalAdId ? selectedCampaign?.ads.find((a) => a.id === modalAdId) : null;

  function goToRoot() {
    setSelectedCampaignId(null);
    setSelectedAdSetId(null);
  }
  function goToCampaign() {
    setSelectedAdSetId(null);
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <PageTitle
        title="Campaigns"
        caption="Browse campaigns, drill into their ad sets, then into individual ads. Click a row to open the details modal without leaving this list."
      />

      <Breadcrumb
        campaignName={selectedCampaign?.name ?? null}
        adSetName={selectedAdSet?.name ?? null}
        onRoot={goToRoot}
        onCampaign={goToCampaign}
      />

      <Card className="!p-0">
        {!selectedCampaign ? (
          campaigns.length === 0 ? (
            <div className="p-6">
              <EmptyState>No campaigns synced yet.</EmptyState>
            </div>
          ) : (
            campaigns.map((c) => (
              <BrowseRow
                key={c.id}
                title={c.name}
                sub={`${c.adSets.length} ad set${c.adSets.length === 1 ? "" : "s"}`}
                badge={<StatusBadge status={c.status} />}
                navigable
                onOpen={() => setSelectedCampaignId(c.id)}
                onDetail={() => setModalCampaignId(c.id)}
              />
            ))
          )
        ) : !selectedAdSet ? (
          selectedCampaign.adSets.length === 0 ? (
            <div className="p-6">
              <EmptyState>No ad sets synced yet for this campaign.</EmptyState>
            </div>
          ) : (
            selectedCampaign.adSets.map((s) => {
              const adCount = selectedCampaign.ads.filter((a) => a.adSetId === s.id).length;
              return (
                <BrowseRow
                  key={s.id}
                  title={s.name}
                  sub={`${adCount} ad${adCount === 1 ? "" : "s"}`}
                  badge={<StatusBadge status={s.status} />}
                  navigable
                  onOpen={() => setSelectedAdSetId(s.id)}
                  onDetail={() => setModalAdSetId(s.id)}
                />
              );
            })
          )
        ) : adsInSelectedAdSet.length === 0 ? (
          <div className="p-6">
            <EmptyState>No ads synced yet for this ad set.</EmptyState>
          </div>
        ) : (
          adsInSelectedAdSet.map((a) => (
            <BrowseRow
              key={a.id}
              title={a.name}
              sub={a.creative.title ?? undefined}
              badge={<StatusBadge status={a.status} />}
              navigable={false}
              onOpen={() => setModalAdId(a.id)}
            />
          ))
        )}
      </Card>

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
      {modalAd && (
        <AdCreativeModal
          adName={modalAd.name}
          adStatus={modalAd.status}
          creative={modalAd.creative}
          onClose={() => setModalAdId(null)}
        />
      )}
    </div>
  );
}
