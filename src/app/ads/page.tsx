import { PageTitle } from "@/components/dashboard/ui";
import { AdsDashboard } from "@/components/ads/AdsDashboard";
import type { AdCampaignRow, AdDailyPoint } from "@/lib/ads/types";

export const dynamic = "force-dynamic";

// Empty until the Meta Ads client + Beehiiv cross-reference are wired up
// (BUILD_LOG.md, next round). This page is layout only for now — every
// component here is built to render correctly with zero rows rather than
// faked data.
const campaigns: AdCampaignRow[] = [];
const dailySeries: AdDailyPoint[] = [];

export default function AdsOverviewPage() {
  return (
    <div>
      <div className="mx-auto max-w-[1120px]">
        <PageTitle
          title="Ads"
          caption="Meta Ads spend, cross-referenced against real Beehiiv subscriber outcomes. SparkLoop joins once v3 API access is granted."
        />
      </div>
      <AdsDashboard campaigns={campaigns} dailySeries={dailySeries} />
    </div>
  );
}
